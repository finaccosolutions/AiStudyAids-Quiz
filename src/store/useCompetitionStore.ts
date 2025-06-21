// src/store/useCompetitionStore.ts
import { create } from 'zustand';
import { supabase } from '../services/supabase';
import { generateQuiz } from '../services/gemini';
import { 
  Competition, 
  CompetitionParticipant, 
  UserStats, 
  RandomQueueEntry, 
  CompetitionChat,
  CompetitionInvite,
  LiveCompetitionData
} from '../types/competition';

interface CompetitionState {
  // State
  competitions: Competition[];
  currentCompetition: Competition | null;
  participants: CompetitionParticipant[];
  userStats: UserStats | null;
  queueEntry: RandomQueueEntry | null;
  chatMessages: CompetitionChat[];
  pendingInvites: CompetitionInvite[];
  liveData: LiveCompetitionData | null;
  isLoading: boolean;
  error: string | null;
  // Add subscription tracking
  activeSubscriptions: Map<string, any>;
  // Add user's active competitions
  userActiveCompetitions: Competition[];

  // Actions
  createCompetition: (data: any) => Promise<Competition>;
  joinCompetition: (code: string) => Promise<void>;
  leaveCompetition: (competitionId: string) => Promise<void>;
  cancelCompetition: (competitionId: string) => Promise<void>;
  deleteCompetition: (competitionId: string) => Promise<void>;
  loadUserCompetitions: (userId: string) => Promise<void>;
  loadUserActiveCompetitions: (userId: string) => Promise<Competition[]>;
  inviteParticipants: (competitionId: string, emails: string[]) => Promise<void>;
  loadCompetition: (id: string) => Promise<void>;
  loadParticipants: (competitionId: string) => Promise<void>;
  updateParticipantProgress: (competitionId: string, answers: any, score: number, correctAnswers: number, timeTaken: number, currentQuestion?: number) => Promise<void>;
  markParticipantReady: (competitionId: string) => Promise<void>;
  completeCompetition: (competitionId: string) => Promise<void>;
  loadUserStats: (userId: string) => Promise<void>;
  joinRandomQueue: (data: { topic: string; difficulty: string; language: string }) => Promise<void>;
  leaveRandomQueue: () => Promise<void>;
  loadChatMessages: (competitionId: string) => Promise<void>;
  sendChatMessage: (competitionId: string, message: string) => Promise<void>;
  loadPendingInvites: (userId: string) => Promise<void>;
  respondToInvite: (competitionId: string, accept: boolean) => Promise<void>;
  startCompetition: (competitionId: string, apiKey?: string) => Promise<void>;
  
  // Real-time subscriptions
  subscribeToCompetition: (competitionId: string) => () => void;
  subscribeToChat: (competitionId: string) => () => void;
  subscribeToInvites: (userId: string) => () => void;
  
  // Helper methods
  finalizeCompetition: (competitionId: string) => Promise<void>;
  updateUserStats: (userId: string, rank: number, points: number, timeTaken: number) => Promise<void>;
  checkForMatches: (topic: string, difficulty: string, language: string) => Promise<void>;
  getLiveLeaderboard: (competitionId: string) => CompetitionParticipant[];
  clearCurrentCompetition: () => void;
  cleanupSubscriptions: () => void;
}

export const useCompetitionStore = create<CompetitionState>((set, get) => ({
  // Initial state
  competitions: [],
  currentCompetition: null,
  participants: [],
  userStats: null,
  queueEntry: null,
  chatMessages: [],
  pendingInvites: [],
  liveData: null,
  isLoading: false,
  error: null,
  activeSubscriptions: new Map(),
  userActiveCompetitions: [],

  loadUserActiveCompetitions: async (userId) => {
    try {
      // Load competitions where user is participant and status is waiting or active
      const { data: participantData, error: participantError } = await supabase
        .from('competition_participants')
        .select(`
          competition_id,
          status,
          competitions!inner(*)
        `)
        .eq('user_id', userId)
        .in('status', ['joined'])
        .in('competitions.status', ['waiting', 'active']);

      if (participantError) throw participantError;

      // Load competitions where user is creator and status is waiting or active
      const { data: createdCompetitions, error: createdError } = await supabase
        .from('competitions')
        .select('*')
        .eq('creator_id', userId)
        .in('status', ['waiting', 'active']);

      if (createdError) throw createdError;

      // Extract competitions from participant data
      const participantCompetitions = (participantData || []).map(p => p.competitions);

      // Combine and deduplicate competitions
      const allActiveCompetitions = [...(createdCompetitions || []), ...participantCompetitions];
      const uniqueActiveCompetitions = allActiveCompetitions.filter((comp, index, self) => 
        index === self.findIndex(c => c.id === comp.id)
      );

      // Sort by created_at descending
      uniqueActiveCompetitions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      set({ userActiveCompetitions: uniqueActiveCompetitions });
      return uniqueActiveCompetitions;
    } catch (error: any) {
      console.error('Error loading user active competitions:', error);
      set({ error: error.message });
      return [];
    }
  },

  createCompetition: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
  
      // Generate competition code
      const competitionCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  
      const competitionData = {
        creator_id: user.id,
        title: data.title,
        description: data.description,
        competition_code: competitionCode,
        type: data.type || 'private',
        max_participants: 999,
        quiz_preferences: data.quizPreferences,
        status: 'waiting',
        participant_count: 1 // Creator is automatically a participant
      };
  
      const { data: competition, error } = await supabase
        .from('competitions')
        .insert(competitionData)
        .select()
        .single();
  
      if (error) throw error;
  
      // Add creator as participant
      const participantData: any = {
        competition_id: competition.id,
        user_id: user.id,
        status: 'joined',
        joined_at: new Date().toISOString(),
        is_online: true,
        last_activity: new Date().toISOString(),
        current_question: 0,
        questions_answered: 0,
        is_ready: false
      };

      await supabase
        .from('competition_participants')
        .insert(participantData);
  
      // Send invitations if emails provided
      if (data.emails && data.emails.length > 0) {
        const invites = data.emails.map((email: string) => ({
          competition_id: competition.id,
          email,
          status: 'invited'
        }));
  
        await supabase
          .from('competition_participants')
          .insert(invites);
  
        // Send email invitations via edge function
        try {
          const { data: { session } } = await supabase.auth.getSession();
          await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-competition-invites`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${session?.access_token}`,
            },
            body: JSON.stringify({
              competitionId: competition.id,
              competitionCode: competition.competition_code,
              title: competition.title,
              creatorName: user.user_metadata?.full_name || user.email,
              emails: data.emails
            }),
          });
        } catch (emailError) {
          console.warn('Failed to send email invitations:', emailError);
        }
      }
  
      // Set current competition in state
      set(state => ({
        competitions: [competition, ...state.competitions],
        currentCompetition: competition,
        isLoading: false
      }));
  
      return competition;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

joinCompetition: async (code) => {
  set({ isLoading: true, error: null });
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Find competition by code
    const { data: competitions, error: compError } = await supabase
      .from('competitions')
      .select('*')
      .eq('competition_code', code.toUpperCase());

    if (compError) {
      console.error('Database error:', compError);
      throw new Error('Failed to search for competition. Please try again.');
    }

    if (!competitions || competitions.length === 0) {
      throw new Error('Competition not found. Please check the code and try again.');
    }

    const competition = competitions[0];

    // Check competition status
    if (competition.status !== 'waiting') {
      throw new Error(`This competition is not currently accepting participants (Status: ${competition.status}).`);
    }

    // Check if user is already a participant
    const { data: existingParticipant, error: participantError } = await supabase
      .from('competition_participants')
      .select('*')
      .eq('competition_id', competition.id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (participantError) {
      console.error('Error checking existing participant:', participantError);
      throw new Error('Failed to check participation status. Please try again.');
    }

    const updateData: any = { 
      status: 'joined', 
      joined_at: new Date().toISOString(),
      is_online: true,
      last_activity: new Date().toISOString(),
      current_question: 0,
      questions_answered: 0,
      is_ready: false
    };

    if (existingParticipant) {
      if (existingParticipant.status === 'joined') {
        throw new Error('You are already participating in this competition');
      }
      // Update status if previously declined or invited
      const { error: updateError } = await supabase
        .from('competition_participants')
        .update(updateData)
        .eq('id', existingParticipant.id);

      if (updateError) {
        console.error('Error updating participant status:', updateError);
        throw new Error('Failed to join competition. Please try again.');
      }
    } else {
      // Add as new participant
      const insertData = {
        competition_id: competition.id,
        user_id: user.id,
        ...updateData
      };

      const { error: insertError } = await supabase
        .from('competition_participants')
        .insert(insertData);

      if (insertError) {
        console.error('Error inserting new participant:', insertError);
        throw new Error('Failed to join competition. Please try again.');
      }
    }

    // Set current competition and force load participants
    set({ currentCompetition: competition, isLoading: false });
    
    // Force load participants after joining
    setTimeout(() => {
      get().loadParticipants(competition.id);
    }, 500);
    
  } catch (error: any) {
    console.error('Join competition error:', error);
    set({ error: error.message, isLoading: false });
    throw error;
  }
},


  markParticipantReady: async (competitionId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('competition_participants')
        .update({ 
          is_ready: true,
          quiz_start_time: new Date().toISOString(),
          last_activity: new Date().toISOString()
        })
        .eq('competition_id', competitionId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state
      set(state => ({
        participants: state.participants.map(p => 
          p.user_id === user.id 
            ? { ...p, is_ready: true, quiz_start_time: new Date().toISOString() }
            : p
        )
      }));
    } catch (error: any) {
      console.error('Error marking participant ready:', error);
      set({ error: error.message });
    }
  },

  leaveCompetition: async (competitionId) => {
    set({ isLoading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Clear current competition and cleanup subscriptions FIRST
      const currentComp = get().currentCompetition;
      if (currentComp?.id === competitionId) {
        get().cleanupSubscriptions();
        set({ currentCompetition: null, participants: [], chatMessages: [] });
      }

      // Then remove participant from competition
      const { error } = await supabase
        .from('competition_participants')
        .delete()
        .eq('competition_id', competitionId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error removing participant:', error);
        // Don't throw error here as the cleanup already happened
      }

      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  cancelCompetition: async (competitionId) => {
    set({ isLoading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Clear current competition and cleanup subscriptions FIRST
      const currentComp = get().currentCompetition;
      if (currentComp?.id === competitionId) {
        get().cleanupSubscriptions();
        set({ currentCompetition: null, participants: [], chatMessages: [] });
      }

      // Update competition status to cancelled
      const { error } = await supabase
        .from('competitions')
        .update({ status: 'cancelled' })
        .eq('id', competitionId)
        .eq('creator_id', user.id); // Only creator can cancel

      if (error) {
        console.error('Error cancelling competition:', error);
      }

      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  deleteCompetition: async (competitionId) => {
    set({ isLoading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Delete competition (cascade will handle participants and chat)
      const { error } = await supabase
        .from('competitions')
        .delete()
        .eq('id', competitionId)
        .eq('creator_id', user.id); // Only creator can delete

      if (error) throw error;

      // Remove from local state
      set(state => ({
        competitions: state.competitions.filter(c => c.id !== competitionId),
        currentCompetition: state.currentCompetition?.id === competitionId ? null : state.currentCompetition,
        isLoading: false
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  loadUserCompetitions: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      // Load competitions where user is creator
      const { data: createdCompetitions, error: createdError } = await supabase
        .from('competitions')
        .select('*')
        .eq('creator_id', userId)
        .order('created_at', { ascending: false });

      if (createdError) throw createdError;

      // Load competitions where user is participant
      const { data: participantData, error: participantError } = await supabase
        .from('competition_participants')
        .select(`
          competition_id,
          competitions!inner(*)
        `)
        .eq('user_id', userId)
        .neq('status', 'declined');

      if (participantError) throw participantError;

      // Extract competitions from participant data
      const participantCompetitions = (participantData || []).map(p => p.competitions);

      // Combine and deduplicate competitions
      const allCompetitions = [...(createdCompetitions || []), ...participantCompetitions];
      const uniqueCompetitions = allCompetitions.filter((comp, index, self) => 
        index === self.findIndex(c => c.id === comp.id)
      );

      // Sort by created_at descending
      uniqueCompetitions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

      set({ competitions: uniqueCompetitions, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  inviteParticipants: async (competitionId, emails) => {
    set({ isLoading: true, error: null });
    try {
      const invites = emails.map(email => ({
        competition_id: competitionId,
        email,
        status: 'invited'
      }));

      const { error } = await supabase
        .from('competition_participants')
        .insert(invites);

      if (error) throw error;

      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  loadCompetition: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { data: competition, error } = await supabase
        .from('competitions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      set({ currentCompetition: competition, isLoading: false });
      
      // Also load participants
      get().loadParticipants(id);
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

loadParticipants: async (competitionId: string) => {
  // Check if we have a current competition and if it matches the requested one
  const { currentCompetition } = get();
  if (!currentCompetition || currentCompetition.id !== competitionId) {
    console.log('No current competition or competition ID mismatch, skipping loadParticipants');
    return;
  }

  set({ isLoading: true, error: null });
  
  try {
    console.log('Loading participants for competition:', competitionId);

    // 1. Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      throw new Error(authError?.message || 'User not authenticated');
    }

    // 2. Check competition access (parallel requests)
    const [accessCheck, competitionCheck] = await Promise.all([
      supabase
        .from('competition_participants')
        .select('status')
        .eq('competition_id', competitionId)
        .eq('user_id', user.id)
        .maybeSingle(),
      supabase
        .from('competitions')
        .select('creator_id, status')
        .eq('id', competitionId)
        .single()
    ]);

    // Handle potential errors
    if (accessCheck.error && accessCheck.error.code !== 'PGRST116') {
      throw accessCheck.error;
    }
    if (competitionCheck.error) {
      throw competitionCheck.error;
    }

    // 3. Verify access rights
    const isCreator = competitionCheck.data?.creator_id === user.id;
    const isParticipant = accessCheck.data?.status && 
                         ['joined', 'completed'].includes(accessCheck.data.status);

    if (!isCreator && !isParticipant) {
      console.log('Access denied - user is not creator or participant');
      set({ participants: [], isLoading: false });
      return;
    }

    // 4. Main query with profile join
    const { data: participantsWithProfiles, error: joinError } = await supabase
      .from('competition_participants')
      .select(`
        id,
        competition_id,
        user_id,
        email,
        status,
        score,
        correct_answers,
        time_taken,
        answers,
        rank,
        points_earned,
        joined_at,
        completed_at,
        created_at,
        is_online,
        last_activity,
        current_question,
        questions_answered,
        is_ready,
        quiz_start_time,
        quiz_end_time,
        profiles:user_id (
          full_name,
          avatar_url
        )
      `)
      .eq('competition_id', competitionId)
      .in('status', ['joined', 'completed'])
      .order('score', { ascending: false })
      .order('time_taken', { ascending: true });

    // 5. Handle successful join query
    if (!joinError && participantsWithProfiles) {
      const formattedParticipants = participantsWithProfiles.map(p => ({
        ...p,
        profile: {
          full_name: p.profiles?.full_name || p.email?.split('@')[0] || 'Anonymous',
          avatar_url: p.profiles?.avatar_url || null
        },
        is_online: p.is_online ?? true,
        last_activity: p.last_activity ?? new Date().toISOString(),
        current_question: p.current_question ?? 0,
        questions_answered: p.questions_answered ?? 0,
        is_ready: p.is_ready ?? false,
        score: p.score ?? 0,
        correct_answers: p.correct_answers ?? 0,
        time_taken: p.time_taken ?? 0
      }));

      set({ 
        participants: formattedParticipants,
        isLoading: false 
      });
      return;
    }

    console.warn('Join query failed, falling back to separate queries:', joinError);

    // 6. Fallback: Load participants without profiles
    const { data: participants, error: participantsError } = await supabase
      .from('competition_participants')
      .select(`
        id,
        competition_id,
        user_id,
        email,
        status,
        score,
        correct_answers,
        time_taken,
        answers,
        rank,
        points_earned,
        joined_at,
        completed_at,
        created_at,
        is_online,
        last_activity,
        current_question,
        questions_answered,
        is_ready,
        quiz_start_time,
        quiz_end_time
      `)
      .eq('competition_id', competitionId)
      .in('status', ['joined', 'completed'])
      .order('score', { ascending: false })
      .order('time_taken', { ascending: true });

    if (participantsError) {
      throw participantsError;
    }

    // 7. Load profiles separately if needed
    const userIds = participants?.map(p => p.user_id).filter(Boolean) as string[];
    let profilesMap = new Map<string, { full_name?: string; avatar_url?: string }>();

    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, avatar_url')
        .in('user_id', userIds);

      profiles?.forEach(profile => {
        profilesMap.set(profile.user_id, profile);
      });
    }

    // 8. Format final participants data
    const formattedParticipants = (participants || []).map(p => {
      const profile = profilesMap.get(p.user_id);
      return {
        ...p,
        profile: {
          full_name: profile?.full_name || p.email?.split('@')[0] || 'Anonymous',
          avatar_url: profile?.avatar_url || null
        },
        is_online: p.is_online ?? true,
        last_activity: p.last_activity ?? new Date().toISOString(),
        current_question: p.current_question ?? 0,
        questions_answered: p.questions_answered ?? 0,
        is_ready: p.is_ready ?? false,
        score: p.score ?? 0,
        correct_answers: p.correct_answers ?? 0,
        time_taken: p.time_taken ?? 0
      };
    });

    set({ 
      participants: formattedParticipants,
      isLoading: false 
    });

  } catch (error: any) {
    console.error('Error in loadParticipants:', error);
    set({ 
      error: error.message,
      isLoading: false,
      participants: [] 
    });
  }
},




  updateParticipantProgress: async (competitionId, answers, score, correctAnswers, timeTaken, currentQuestion) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const updateData: any = {
        answers,
        score,
        correct_answers: correctAnswers,
        time_taken: timeTaken,
        last_activity: new Date().toISOString(),
        is_online: true
      };

      // Add progress tracking
      if (currentQuestion !== undefined) {
        updateData.current_question = currentQuestion;
        updateData.questions_answered = Object.keys(answers).length;
      }

      const { error } = await supabase
        .from('competition_participants')
        .update(updateData)
        .eq('competition_id', competitionId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state for real-time updates
      set(state => ({
        participants: state.participants.map(p => 
          p.user_id === user.id 
            ? { ...p, ...updateData }
            : p
        )
      }));
    } catch (error: any) {
      console.error('Error updating participant progress:', error);
      set({ error: error.message });
    }
  },

  completeCompetition: async (competitionId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Mark participant as completed
      const { error } = await supabase
        .from('competition_participants')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          quiz_end_time: new Date().toISOString(),
          last_activity: new Date().toISOString(),
          is_online: true
        })
        .eq('competition_id', competitionId)
        .eq('user_id', user.id);

      if (error) throw error;

      // The database trigger will handle competition finalization
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  finalizeCompetition: async (competitionId) => {
    try {
      // This is now handled by database triggers
      console.log('Competition finalization handled by database triggers');
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  updateUserStats: async (userId, rank, points, timeTaken) => {
    try {
      const { data: stats } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      const isWin = rank === 1;
      const isLoss = rank > 1;

      if (stats) {
        // Calculate new average score
        const newTotalComps = stats.total_competitions + 1;
        const newAvgScore = ((stats.average_score * stats.total_competitions) + points) / newTotalComps;

        // Update existing stats
        await supabase
          .from('user_stats')
          .update({
            total_competitions: newTotalComps,
            wins: stats.wins + (isWin ? 1 : 0),
            losses: stats.losses + (isLoss ? 1 : 0),
            total_points: stats.total_points + points,
            average_score: newAvgScore,
            best_rank: stats.best_rank ? Math.min(stats.best_rank, rank) : rank,
            total_time_played: stats.total_time_played + timeTaken
          })
          .eq('user_id', userId);
      } else {
        // Create new stats
        await supabase
          .from('user_stats')
          .insert({
            user_id: userId,
            total_competitions: 1,
            wins: isWin ? 1 : 0,
            losses: isLoss ? 1 : 0,
            total_points: points,
            average_score: points,
            best_rank: rank,
            total_time_played: timeTaken
          });
      }
    } catch (error: any) {
      console.error('Error updating user stats:', error);
    }
  },

  loadUserStats: async (userId) => {
    try {
      const { data: stats, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      set({ userStats: stats });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  joinRandomQueue: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Remove any existing queue entries
      await supabase
        .from('random_queue')
        .delete()
        .eq('user_id', user.id);

      // Add to queue
      const { data: queueEntry, error } = await supabase
        .from('random_queue')
        .insert({
          user_id: user.id,
          topic: data.topic,
          difficulty: data.difficulty,
          language: data.language,
          status: 'waiting'
        })
        .select()
        .single();

      if (error) throw error;

      set({ queueEntry, isLoading: false });

      // Check for matches
      setTimeout(() => get().checkForMatches(data.topic, data.difficulty, data.language), 1000);
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  checkForMatches: async (topic, difficulty, language) => {
    try {
      const { data: waitingUsers } = await supabase
        .from('random_queue')
        .select('*')
        .eq('topic', topic)
        .eq('difficulty', difficulty)
        .eq('language', language)
        .eq('status', 'waiting')
        .limit(8); // Max 8 players for random match

      if (waitingUsers && waitingUsers.length >= 2) {
        // Create random competition
        const competitionData = {
          creator_id: waitingUsers[0].user_id,
          title: `Random ${topic} Challenge`,
          description: `${difficulty} difficulty ${topic} competition`,
          competition_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
          type: 'random',
          max_participants: waitingUsers.length,
          quiz_preferences: {
            course: topic,
            difficulty,
            language,
            questionCount: 10,
            questionTypes: ['multiple-choice', 'true-false'],
            mode: 'exam',
            timeLimitEnabled: true,
            timeLimit: '30',
            totalTimeLimit: '600'
          }
        };

        const { data: competition } = await supabase
          .from('competitions')
          .insert(competitionData)
          .select()
          .single();

        if (competition) {
          // Add all waiting users as participants
          const participants = waitingUsers.map(user => ({
            competition_id: competition.id,
            user_id: user.user_id,
            status: 'joined',
            joined_at: new Date().toISOString(),
            is_online: true,
            last_activity: new Date().toISOString(),
            current_question: 0,
            questions_answered: 0,
            is_ready: false
          }));

          await supabase
            .from('competition_participants')
            .insert(participants);

          // Update queue status
          await supabase
            .from('random_queue')
            .update({ status: 'matched' })
            .in('id', waitingUsers.map(u => u.id));

          // Start competition after 30 seconds
          setTimeout(() => {
            get().startCompetition(competition.id);
          }, 30000);
        }
      }
    } catch (error: any) {
      console.error('Error checking for matches:', error);
    }
  },

  leaveRandomQueue: async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase
        .from('random_queue')
        .delete()
        .eq('user_id', user.id);

      set({ queueEntry: null });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  startCompetition: async (competitionId, apiKey) => {
    try {
      console.log('Starting competition:', competitionId);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get current competition data
      const { data: competition, error: compError } = await supabase
        .from('competitions')
        .select('*')
        .eq('id', competitionId)
        .single();

      if (compError) throw compError;

      // Only the creator can start the competition
      if (competition.creator_id !== user.id) {
        throw new Error('Only the competition creator can start the competition');
      }

      // Generate questions if not already generated and API key is provided
      let questionsToStore = competition.questions;
      
      if (!questionsToStore && apiKey && competition.quiz_preferences) {
        console.log('Generating questions for competition...');
        try {
          const generatedQuestions = await generateQuiz(apiKey, competition.quiz_preferences);
          questionsToStore = generatedQuestions;
          console.log('Questions generated successfully:', generatedQuestions.length);
        } catch (error: any) {
          console.error('Failed to generate questions:', error);
          throw new Error('Failed to generate quiz questions. Please try again.');
        }
      }

      // Update competition with questions and active status
      const { error } = await supabase
        .from('competitions')
        .update({ 
          status: 'active',
          start_time: new Date().toISOString(),
          questions: questionsToStore
        })
        .eq('id', competitionId);

      if (error) {
        console.error('Error starting competition:', error);
        throw error;
      }

      console.log('Competition started successfully');
      
      // Update local state immediately
      set(state => ({
        currentCompetition: state.currentCompetition ? {
          ...state.currentCompetition,
          status: 'active',
          start_time: new Date().toISOString(),
          questions: questionsToStore
        } : null
      }));
    } catch (error: any) {
      console.error('Failed to start competition:', error);
      set({ error: error.message });
      throw error;
    }
  },

  loadChatMessages: async (competitionId) => {
    try {
      // Enhanced query to get chat messages with profile data
      const { data: messagesWithProfiles, error } = await supabase
        .from('competition_chat')
        .select(`
          *,
          profiles!competition_chat_user_id_profiles_fkey (
            full_name,
            avatar_url
          )
        `)
        .eq('competition_id', competitionId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading chat messages with profiles:', error);
        
        // Fallback: Load messages without profiles
        const { data: messages, error: fallbackError } = await supabase
          .from('competition_chat')
          .select('*')
          .eq('competition_id', competitionId)
          .order('created_at', { ascending: true });

        if (fallbackError) {
          console.error('Fallback chat query also failed:', fallbackError);
          throw fallbackError;
        }

        // Format messages without profile data
        const formattedMessages = (messages || []).map(m => ({
          ...m,
          profile: {
            full_name: 'Anonymous User',
            avatar_url: null
          }
        }));

        set({ chatMessages: formattedMessages });
        return;
      }

      console.log('Chat messages with profiles loaded:', messagesWithProfiles);

      // Format messages with profile data
      const formattedMessages = (messagesWithProfiles || []).map(m => ({
        ...m,
        profile: m.profiles ? {
          full_name: m.profiles.full_name || 'Anonymous User',
          avatar_url: m.profiles.avatar_url
        } : {
          full_name: 'Anonymous User',
          avatar_url: null
        }
      }));

      console.log('Formatted chat messages:', formattedMessages);
      set({ chatMessages: formattedMessages });
    } catch (error: any) {
      console.error('Error in loadChatMessages:', error);
      set({ error: error.message });
    }
  },

  sendChatMessage: async (competitionId, message) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('competition_chat')
        .insert({
          competition_id: competitionId,
          user_id: user.id,
          message
        });

      if (error) throw error;
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  loadPendingInvites: async (userId) => {
    try {
      const { data: invites, error } = await supabase
        .from('competition_participants')
        .select(`
          competition_id,
          competitions!inner (
            competition_code,
            title,
            creator_id,
            max_participants,
            profiles!competitions_creator_id_fkey (
              full_name
            )
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'invited');

      if (error) throw error;

      const formattedInvites = (invites || []).map((invite: any) => ({
        competition_id: invite.competition_id,
        competition_code: invite.competitions.competition_code,
        title: invite.competitions.title,
        creator_name: invite.competitions.profiles?.full_name || 'Unknown',
        participant_count: 0, // Would need additional query
        max_participants: invite.competitions.max_participants
      }));

      set({ pendingInvites: formattedInvites });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  respondToInvite: async (competitionId, accept) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const status = accept ? 'joined' : 'declined';
      const updateData: any = { status };
      
      if (accept) {
        updateData.joined_at = new Date().toISOString();
        updateData.is_online = true;
        updateData.last_activity = new Date().toISOString();
        updateData.current_question = 0;
        updateData.questions_answered = 0;
        updateData.is_ready = false;
      }

      const { error } = await supabase
        .from('competition_participants')
        .update(updateData)
        .eq('competition_id', competitionId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Remove from pending invites
      set(state => ({
        pendingInvites: state.pendingInvites.filter(
          invite => invite.competition_id !== competitionId
        )
      }));
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  getLiveLeaderboard: (competitionId) => {
    const { participants } = get();
    return participants
      .filter(p => p.competition_id === competitionId && p.status !== 'declined')
      .sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (b.correct_answers !== a.correct_answers) return b.correct_answers - a.correct_answers;
        return a.time_taken - b.time_taken;
      });
  },

  clearCurrentCompetition: () => {
    get().cleanupSubscriptions();
    set({ currentCompetition: null, participants: [], chatMessages: [] });
  },

  cleanupSubscriptions: () => {
    const { activeSubscriptions } = get();
    activeSubscriptions.forEach((subscription, key) => {
      console.log(`Cleaning up subscription: ${key}`);
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      }
    });
    set({ activeSubscriptions: new Map() });
  },

  // Enhanced Real-time subscriptions with better error handling
subscribeToCompetition: (competitionId) => {
  const { activeSubscriptions } = get();
  
  // Clean up existing subscription for this competition
  const existingKey = `competition:${competitionId}`;
  if (activeSubscriptions.has(existingKey)) {
    const existing = activeSubscriptions.get(existingKey);
    if (existing && typeof existing.unsubscribe === 'function') {
      existing.unsubscribe();
    }
  }

  console.log(`Setting up competition subscription for: ${competitionId}`);
  
  const subscription = supabase
    .channel(`competition:${competitionId}`)
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'competitions',
        filter: `id=eq.${competitionId}`
      }, 
      (payload) => {
        console.log('Competition change detected:', payload);
        if (payload.eventType === 'UPDATE') {
          set({ currentCompetition: payload.new as Competition });
        }
      }
    )
    .on('postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'competition_participants',
        filter: `competition_id=eq.${competitionId}`
      },
      (payload) => {
        console.log('Participant change detected:', payload);
        // Force reload participants when any change occurs
        setTimeout(() => {
          get().loadParticipants(competitionId);
        }, 500); // Increased delay to ensure database consistency
      }
    )
    .on('postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'profiles'
      },
      (payload) => {
        console.log('Profile change detected:', payload);
        // Reload participants when profile changes occur
        setTimeout(() => {
          get().loadParticipants(competitionId);
        }, 300);
      }
    )
    .subscribe((status) => {
      console.log(`Competition subscription status: ${status}`);
      if (status === 'SUBSCRIBED') {
        console.log('Successfully subscribed to competition updates');
        // Initial load after subscription is established
        setTimeout(() => {
          get().loadParticipants(competitionId);
        }, 100);
      } else if (status === 'CHANNEL_ERROR') {
        console.error('Competition subscription error');
        // Retry subscription after a delay
        setTimeout(() => {
          get().subscribeToCompetition(competitionId);
        }, 5000);
      }
    });

  // Store subscription for cleanup
  activeSubscriptions.set(existingKey, subscription);
  set({ activeSubscriptions });

  return () => {
    console.log(`Unsubscribing from competition: ${competitionId}`);
    subscription.unsubscribe();
    activeSubscriptions.delete(existingKey);
    set({ activeSubscriptions });
  };
},



  subscribeToChat: (competitionId) => {
    const { activeSubscriptions } = get();
    
    // Clean up existing subscription for this chat
    const existingKey = `chat:${competitionId}`;
    if (activeSubscriptions.has(existingKey)) {
      const existing = activeSubscriptions.get(existingKey);
      if (existing && typeof existing.unsubscribe === 'function') {
        existing.unsubscribe();
      }
    }

    console.log(`Setting up chat subscription for: ${competitionId}`);
    
    const subscription = supabase
      .channel(`chat:${competitionId}`)
      .on('postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'competition_chat',
          filter: `competition_id=eq.${competitionId}`
        },
        (payload) => {
          console.log('New chat message:', payload);
          get().loadChatMessages(competitionId);
        }
      )
      .subscribe((status) => {
        console.log(`Chat subscription status: ${status}`);
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to chat updates');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Chat subscription error');
          // Retry subscription after a delay
          setTimeout(() => {
            get().subscribeToChat(competitionId);
          }, 5000);
        }
      });

    // Store subscription for cleanup
    activeSubscriptions.set(existingKey, subscription);
    set({ activeSubscriptions });

    return () => {
      console.log(`Unsubscribing from chat: ${competitionId}`);
      subscription.unsubscribe();
      activeSubscriptions.delete(existingKey);
      set({ activeSubscriptions });
    };
  },

  subscribeToInvites: (userId) => {
    const { activeSubscriptions } = get();
    
    // Clean up existing subscription for invites
    const existingKey = `invites:${userId}`;
    if (activeSubscriptions.has(existingKey)) {
      const existing = activeSubscriptions.get(existingKey);
      if (existing && typeof existing.unsubscribe === 'function') {
        existing.unsubscribe();
      }
    }

    console.log(`Setting up invites subscription for: ${userId}`);
    
    const subscription = supabase
      .channel(`invites:${userId}`)
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'competition_participants',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('Invite change detected:', payload);
          get().loadPendingInvites(userId);
        }
      )
      .subscribe((status) => {
        console.log(`Invites subscription status: ${status}`);
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to invite updates');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Invites subscription error');
          // Retry subscription after a delay
          setTimeout(() => {
            get().subscribeToInvites(userId);
          }, 5000);
        }
      });

    // Store subscription for cleanup
    activeSubscriptions.set(existingKey, subscription);
    set({ activeSubscriptions });

    return () => {
      console.log(`Unsubscribing from invites: ${userId}`);
      subscription.unsubscribe();
      activeSubscriptions.delete(existingKey);
      set({ activeSubscriptions });
    };
  }
}));