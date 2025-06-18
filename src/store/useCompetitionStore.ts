import { create } from 'zustand';
import { supabase } from '../services/supabase';
import { 
  Competition, 
  CompetitionParticipant, 
  UserStats, 
  RandomQueueEntry, 
  CompetitionChat,
  CompetitionInvite 
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
  isLoading: boolean;
  error: string | null;

  // Actions
  createCompetition: (data: any) => Promise<Competition>;
  joinCompetition: (code: string) => Promise<void>;
  inviteParticipants: (competitionId: string, emails: string[]) => Promise<void>;
  loadCompetition: (id: string) => Promise<void>;
  loadParticipants: (competitionId: string) => Promise<void>;
  updateParticipantProgress: (competitionId: string, answers: any, score: number, correctAnswers: number, timeTaken: number) => Promise<void>;
  completeCompetition: (competitionId: string) => Promise<void>;
  loadUserStats: (userId: string) => Promise<void>;
  joinRandomQueue: (topic: string, difficulty: string, language: string) => Promise<void>;
  leaveRandomQueue: () => Promise<void>;
  loadChatMessages: (competitionId: string) => Promise<void>;
  sendChatMessage: (competitionId: string, message: string) => Promise<void>;
  loadPendingInvites: (userId: string) => Promise<void>;
  respondToInvite: (competitionId: string, accept: boolean) => Promise<void>;
  startCompetition: (competitionId: string) => Promise<void>;
  
  // Real-time subscriptions
  subscribeToCompetition: (competitionId: string) => () => void;
  subscribeToChat: (competitionId: string) => () => void;
  subscribeToInvites: (userId: string) => () => void;
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
  isLoading: false,
  error: null,

  createCompetition: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Generate competition code
      const { data: codeResult } = await supabase.rpc('generate_competition_code');
      const competitionCode = codeResult || Math.random().toString(36).substring(2, 8).toUpperCase();

      const competitionData = {
        creator_id: user.id,
        title: data.title,
        description: data.description,
        competition_code: competitionCode,
        type: data.type || 'private',
        max_participants: data.maxParticipants || 10,
        quiz_preferences: data.quizPreferences
      };

      const { data: competition, error } = await supabase
        .from('competitions')
        .insert(competitionData)
        .select()
        .single();

      if (error) throw error;

      // Add creator as participant
      await supabase
        .from('competition_participants')
        .insert({
          competition_id: competition.id,
          user_id: user.id,
          status: 'joined',
          joined_at: new Date().toISOString()
        });

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
      const { data: competition, error: compError } = await supabase
        .from('competitions')
        .select('*')
        .eq('competition_code', code)
        .single();

      if (compError || !competition) {
        throw new Error('Competition not found');
      }

      if (competition.status !== 'waiting') {
        throw new Error('Competition is no longer accepting participants');
      }

      // Check if user is already a participant
      const { data: existingParticipant } = await supabase
        .from('competition_participants')
        .select('*')
        .eq('competition_id', competition.id)
        .eq('user_id', user.id)
        .single();

      if (existingParticipant) {
        if (existingParticipant.status === 'joined') {
          throw new Error('You are already in this competition');
        }
        // Update status if previously declined
        await supabase
          .from('competition_participants')
          .update({ 
            status: 'joined', 
            joined_at: new Date().toISOString() 
          })
          .eq('id', existingParticipant.id);
      } else {
        // Add as new participant
        await supabase
          .from('competition_participants')
          .insert({
            competition_id: competition.id,
            user_id: user.id,
            status: 'joined',
            joined_at: new Date().toISOString()
          });
      }

      set({ currentCompetition: competition, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
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

      // Send email notifications (would be implemented via edge function)
      await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-competition-invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          competitionId,
          emails
        }),
      });

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
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  loadParticipants: async (competitionId) => {
    try {
      const { data: participants, error } = await supabase
        .from('competition_participants')
        .select(`
          *,
          profile:user_id (
            full_name,
            avatar_url
          )
        `)
        .eq('competition_id', competitionId)
        .order('joined_at', { ascending: true });

      if (error) throw error;

      set({ participants: participants || [] });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  updateParticipantProgress: async (competitionId, answers, score, correctAnswers, timeTaken) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('competition_participants')
        .update({
          answers,
          score,
          correct_answers: correctAnswers,
          time_taken: timeTaken
        })
        .eq('competition_id', competitionId)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error: any) {
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
          completed_at: new Date().toISOString()
        })
        .eq('competition_id', competitionId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Check if all participants have completed
      const { data: participants } = await supabase
        .from('competition_participants')
        .select('status')
        .eq('competition_id', competitionId)
        .eq('status', 'joined');

      if (!participants || participants.length === 0) {
        // All participants completed, finalize competition
        await get().finalizeCompetition(competitionId);
      }
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  finalizeCompetition: async (competitionId) => {
    try {
      // Calculate rankings
      const { data: participants } = await supabase
        .from('competition_participants')
        .select('*')
        .eq('competition_id', competitionId)
        .order('score', { ascending: false })
        .order('time_taken', { ascending: true });

      if (participants) {
        // Update rankings and points
        for (let i = 0; i < participants.length; i++) {
          const participant = participants[i];
          const rank = i + 1;
          let points = 0;

          // Points system: 1st place = 100, 2nd = 75, 3rd = 50, participation = 25
          if (rank === 1) points = 100;
          else if (rank === 2) points = 75;
          else if (rank === 3) points = 50;
          else points = 25;

          await supabase
            .from('competition_participants')
            .update({ rank, points_earned: points })
            .eq('id', participant.id);

          // Update user stats
          if (participant.user_id) {
            await get().updateUserStats(participant.user_id, rank, points, participant.time_taken);
          }
        }

        // Mark competition as completed
        await supabase
          .from('competitions')
          .update({ 
            status: 'completed',
            end_time: new Date().toISOString()
          })
          .eq('id', competitionId);
      }
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
        .single();

      const isWin = rank === 1;
      const isLoss = rank > 1;

      if (stats) {
        // Update existing stats
        await supabase
          .from('user_stats')
          .update({
            total_competitions: stats.total_competitions + 1,
            wins: stats.wins + (isWin ? 1 : 0),
            losses: stats.losses + (isLoss ? 1 : 0),
            total_points: stats.total_points + points,
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
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      set({ userStats: stats });
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  joinRandomQueue: async (topic, difficulty, language) => {
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
          topic,
          difficulty,
          language,
          status: 'waiting'
        })
        .select()
        .single();

      if (error) throw error;

      set({ queueEntry, isLoading: false });

      // Check for matches
      setTimeout(() => get().checkForMatches(topic, difficulty, language), 1000);
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
        .limit(4); // Max 4 players for random match

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
            questionTypes: ['multiple-choice'],
            mode: 'exam'
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
            joined_at: new Date().toISOString()
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

  startCompetition: async (competitionId) => {
    try {
      await supabase
        .from('competitions')
        .update({ 
          status: 'active',
          start_time: new Date().toISOString()
        })
        .eq('id', competitionId);
    } catch (error: any) {
      set({ error: error.message });
    }
  },

  loadChatMessages: async (competitionId) => {
    try {
      const { data: messages, error } = await supabase
        .from('competition_chat')
        .select(`
          *,
          profile:user_id (
            full_name,
            avatar_url
          )
        `)
        .eq('competition_id', competitionId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      set({ chatMessages: messages || [] });
    } catch (error: any) {
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

  // Real-time subscriptions
  subscribeToCompetition: (competitionId) => {
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
        () => {
          get().loadParticipants(competitionId);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  },

  subscribeToChat: (competitionId) => {
    const subscription = supabase
      .channel(`chat:${competitionId}`)
      .on('postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'competition_chat',
          filter: `competition_id=eq.${competitionId}`
        },
        () => {
          get().loadChatMessages(competitionId);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  },

  subscribeToInvites: (userId) => {
    const subscription = supabase
      .channel(`invites:${userId}`)
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'competition_participants',
          filter: `user_id=eq.${userId}`
        },
        () => {
          get().loadPendingInvites(userId);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }
}));