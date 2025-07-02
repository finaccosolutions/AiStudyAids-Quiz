// src/store/useCompetitionStore.ts
import { create } from 'zustand';
import { supabase } from '../services/supabase';
import { Competition, CompetitionParticipant, UserStats, RandomQueueEntry, CompetitionChat } from '../types/competition';
import { QuizResult } from '../types'; // Import QuizResult type

interface CompetitionStoreState {
  currentCompetition: Competition | null;
  participants: CompetitionParticipant[];
  userActiveCompetitions: Competition[];
  userStats: UserStats | null;
  competitionResultsHistory: any[];
  chatMessages: CompetitionChat[];
  queueEntry: RandomQueueEntry | null;
  isCompetitionsLoading: boolean;
  isLoading: boolean;
  error: string | null;
  cleanupFlag: boolean; // Flag to indicate if subscriptions need cleanup
  overallStats: { // New: Overall statistics
    bestOverallRank: number | null;
    overallPoints: number;
    overallWinRate: number;
    totalQuizzesPlayed: number;
  } | null;
  createCompetition: (params: {
    preferences: any;
    userId: string;
    title: string;
    description: string;
    type: 'private' | 'random';
    emails?: string[];
  }) => Promise<string>;
  
  // Actions
  loadCompetition: (competitionId: string) => Promise<void>;
  joinCompetition: (competitionCode: string) => Promise<void>;
  leaveCompetition: (competitionId: string) => Promise<void>;
  cancelCompetition: (competitionId: string) => Promise<void>;
  startCompetition: (competitionId: string, apiKey: string) => Promise<void>;
  loadParticipants: (competitionId: string) => Promise<void>;
  // Modified signature to include new counts
  updateParticipantProgress: (
    userId: string, 
    competitionId: string, 
    answers: Record<number, string>, 
    score: number, 
    correctAnswers: number, 
    questionsAnswered: number, // New parameter
    timeTaken: number,   
    currentQuestionIndex: number
  ) => Promise<void>;
  completeCompetition: (competitionId: string) => Promise<void>;
  subscribeToCompetition: (competitionId: string) => () => void;
  getLiveLeaderboard: (competitionId: string) => CompetitionParticipant[];
  loadUserCompetitions: (userId: string) => Promise<void>;
  loadUserActiveCompetitions: (userId: string) => Promise<Competition[]>;
  deleteCompetition: (competitionId: string) => Promise<void>;
  clearCurrentCompetition: () => void;
  loadUserStats: (userId: string) => Promise<void>;
  loadCompetitionResultsHistory: (userId: string) => Promise<void>;
  
  // Chat actions
  loadChatMessages: (competitionId: string) => Promise<void>;
  sendChatMessage: (competitionId: string, message: string) => Promise<void>;
  subscribeToChat: (competitionId: string) => () => void;

  // Random Matchmaking
  joinRandomQueue: (preferences: { topic: string; difficulty: 'easy' | 'medium' | 'hard'; language: string }) => Promise<void>;
  leaveRandomQueue: () => Promise<void>;
  subscribeToRandomQueue: (userId: string) => () => void;

  // Cleanup
  cleanupSubscriptions: () => void;
  setCleanupFlag: (flag: boolean) => void;

  // New: Calculate overall stats
  calculateOverallStats: (soloHistory: QuizResult[], competitionHistory: any[], userStats: UserStats | null) => void;
}

export const useCompetitionStore = create<CompetitionStoreState>((set, get) => ({
  currentCompetition: null,
  participants: [],
  userActiveCompetitions: [],
  userStats: null,
  competitionResultsHistory: [],
  chatMessages: [],
  queueEntry: null,
  isCompetitionsLoading: false,
  isLoading: false,
  error: null,
  cleanupFlag: false,
  overallStats: null, // Initialize overallStats

  loadCompetition: async (competitionId) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('competitions')
        .select('*')
        .eq('id', competitionId)
        .single();

      if (error) throw error;
      set({ currentCompetition: data });
    } catch (error: any) {
      set({ error: error.message || 'Failed to load competition' });
    } finally {
      set({ isLoading: false });
    }
  },

  createCompetition: async ({ preferences, userId, title, description, type, emails = [] }) => {
  set({ isLoading: true, error: null });
  try {
    console.log("[DEBUG] Creating competition:", { 
      title, 
      description,
      creator_id: userId,
      type
    });
      // Generate a unique 6-character alphanumeric code
      let competitionCode = '';
      let isUnique = false;
      while (!isUnique) {
        competitionCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        const { data, error } = await supabase
          .from('competitions')
          .select('id')
          .eq('competition_code', competitionCode)
          .maybeSingle();
        if (!error && !data) {
          isUnique = true;
        }
      }

      // Get the current authenticated user's ID directly from Supabase session
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('User not authenticated. Please log in to create a competition.');
      }

      const { data, error } = await supabase
        .from('competitions')
        .insert({
          creator_id: user.id, // Use user.id from the session
          title, // Modified: Added title
          description, // Modified: Added description
          competition_code: competitionCode,
          type,
          quiz_preferences: preferences,
          status: 'waiting',
          max_participants: 100, // Default max participants
        })
        .select()
        .single();

      if (error) throw error;

      set({ currentCompetition: data });

      // Add creator as a participant
      await supabase.from('competition_participants').insert({
        competition_id: data.id,
        user_id: user.id, // Use user.id from the session
        status: 'joined',
        joined_at: new Date().toISOString(), // Set joined_at for creator
      });

      return data.id;
    } catch (error) {
    console.error("[DEBUG] Competition creation failed:", error);
    throw error;
  } finally {
    set({ isLoading: false });
  }
},

  joinCompetition: async (competitionCode) => {
    set({ isLoading: true, error: null });
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('User not authenticated. Please log in to join a competition.');
      }

      const { data: competition, error: competitionError } = await supabase
        .from('competitions')
        .select('*')
        .eq('competition_code', competitionCode)
        .single();

      if (competitionError || !competition) {
        throw new Error('Competition not found or invalid code.');
      }

      if (competition.status !== 'waiting') {
        throw new Error('This competition has already started or ended.');
      }

      // Check if user is already a participant
      const { data: existingParticipant, error: participantError } = await supabase
        .from('competition_participants')
        .select('*')
        .eq('competition_id', competition.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (participantError) throw participantError;

      if (existingParticipant) {
        set({ currentCompetition: competition });
        return; // Already joined
      }

      // Add participant
      const { error: insertError } = await supabase.from('competition_participants').insert({
        competition_id: competition.id,
        user_id: user.id,
        status: 'joined',
        joined_at: new Date().toISOString(), // Set joined_at for new participant
      });

      if (insertError) throw insertError;

      set({ currentCompetition: competition });
    } catch (error: any) {
      set({ error: error.message || 'Failed to join competition' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  leaveCompetition: async (competitionId) => {
    set({ isLoading: true, error: null });
    try {
      const { user } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('competition_participants')
        .update({ status: 'declined' }) // Or delete the row
        .eq('competition_id', competitionId)
        .eq('user_id', user.id);

      if (error) throw error;

      set({ currentCompetition: null, participants: [] });
    } catch (error: any) {
      set({ error: error.message || 'Failed to leave competition' });
      // Do not re-throw here, as the error is already handled by setting the state
    } finally {
      set({ isLoading: false });
    }
  },

  cancelCompetition: async (competitionId) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('competitions')
        .update({ status: 'cancelled' })
        .eq('id', competitionId);

      if (error) throw error;

      set({ currentCompetition: null, participants: [] });
    } catch (error: any) {
      set({ error: error.message || 'Failed to cancel competition' });
      // Do not re-throw here, as the error is already handled by setting the state
    } finally {
      set({ isLoading: false });
    }
  },

  startCompetition: async (competitionId, apiKey) => {
    set({ isLoading: true, error: null });
    try {
      const { data: competition, error: fetchError } = await supabase
        .from('competitions')
        .select('*')
        .eq('id', competitionId)
        .single();

      if (fetchError || !competition) {
        throw new Error('Competition not found.');
      }

      if (competition.status !== 'waiting') {
        throw new Error('Competition is not in waiting status.');
      }

      // Call the Supabase Edge Function to generate questions and start the competition
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/start-competition`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          competitionId,
          apiKey,
          preferences: competition.quiz_preferences,
        }),
      });

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = `Edge Function error: ${errorData.error}`;
          } else if (errorData.details) {
            errorMessage += ` - Details: ${errorData.details}`;
          } else if (errorData.message) {
            errorMessage += ` - Message: ${errorData.message}`;
          }
        } catch (parseError) {
          // If response is not JSON, try to get plain text
          try {
            const errorText = await response.text();
            if (errorText) {
              errorMessage += ` - Response: ${errorText}`;
            }
          } catch (textError) {
            // Fallback to original HTTP error message
          }
        }
        console.error('Failed to start competition:', errorMessage);
        throw new Error(`Failed to start competition: ${errorMessage}`);
      }

      const result = await response.json();
      console.log('startCompetition: Edge Function result (questions):', result.questions);
      set({ currentCompetition: { ...competition, status: 'active', questions: result.questions, start_time: result.startTime } });
    } catch (error: any) {
      console.error('Error starting competition:', error.message);
      set({ error: error.message || 'Failed to start competition' });
    } finally {
      set({ isLoading: false });
    }
  },

  loadParticipants: async (competitionId) => {
    try {
      const { data, error } = await supabase
        .from('competition_participants')
        .select(`
          *,
          profile:profiles(full_name, avatar_url)
        `)
        .eq('competition_id', competitionId)
        .in('status', ['joined', 'completed']); // Only show joined or completed participants

      if (error) throw error;
      // --- START MODIFICATION ---
      console.log('Loaded participants data:', data);
      // --- END MODIFICATION ---
      set({ participants: data || [] });
    } catch (error: any) {
      console.error('Error loading participants:', error.message);
      set({ error: error.message || 'Failed to load participants' });
    }
  },


  // Modified updateParticipantProgress to accept new counts
  updateParticipantProgress: async (
    userId,
    competitionId,
    answers,
    score,
    correctAnswers,
    questionsAnswered,
    timeTaken,
    currentQuestionIndex
  ) => {
    try {
      // --- START MODIFICATION ---
      console.log('Updating participant progress for user:', userId, 'in competition:', competitionId);
      console.log('Data being sent:', {
        answers: answers,
        score: score,
        correct_answers: correctAnswers,
        questions_answered: questionsAnswered,
        time_taken: timeTaken,
        current_question: currentQuestionIndex,
      });
      // --- END MODIFICATION ---

      const { error } = await supabase
        .from('competition_participants')
        .update({
          answers,
          score,
          correct_answers: correctAnswers,
          questions_answered: questionsAnswered,
          time_taken: timeTaken,
          current_question: currentQuestionIndex,
          last_activity: new Date().toISOString(),
        })
        .eq('competition_id', competitionId)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error updating participant progress:', error.message);
      set({ error: error.message || 'Failed to update progress' });
    }
  },

  completeCompetition: async (competitionId) => {
    set({ isLoading: true, error: null });
    try {
      const { user } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('competition_participants')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('competition_id', competitionId)
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error: any) {
      set({ error: error.message || 'Failed to complete competition' });
      // Do not re-throw here, as the error is already handled by setting the state
    } finally {
      set({ isLoading: false });
    }
  },

  subscribeToCompetition: (competitionId) => {
    const subscription = supabase
      .channel(`competition_${competitionId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'competition_participants',
          filter: `competition_id=eq.${competitionId}`,
        },
        (payload) => {
          console.log('Participant change received!', payload);
          get().loadParticipants(competitionId); // Reload participants on any change
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'competitions',
          filter: `id=eq.${competitionId}`,
        },
        (payload) => {
          console.log('Competition change received!', payload);
          get().loadCompetition(competitionId); // Reload competition on any change
        }
      )
      .subscribe();

    return () => {
      console.log(`Unsubscribing from competition_${competitionId}`);
      supabase.removeChannel(subscription);
    };
  },

  getLiveLeaderboard: (competitionId) => {
    const { participants } = get();
    // Sort participants by score (descending), then time_taken (ascending)
    return [...participants].sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.time_taken - b.time_taken;
    });
  },

  loadUserCompetitions: async (userId) => {
    set({ isCompetitionsLoading: true, error: null }); // Set specific loading state
    console.log(`[CompetitionStore] Loading user competitions for user: ${userId}`);
    try {
      const { data, error } = await supabase
        .from('competitions')
        .select('*')
        .eq('creator_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ userActiveCompetitions: data || [] });
    } catch (error: any) {
      set({ error: error.message || 'Failed to load user competitions' });
    } finally { // Ensure loading state is reset
      set({ isCompetitionsLoading: false });
    }
  },

  loadUserActiveCompetitions: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('competition_participants')
        .select(`
          competition_id,
          competitions(*)
        `)
        .eq('user_id', userId)
        .in('status', ['joined'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      const activeComps = data
        .map((p: any) => p.competitions)
        .filter((comp: any) => comp && (comp.status === 'waiting' || comp.status === 'active'));

      set({ userActiveCompetitions: activeComps || [] });
      return activeComps || [];
    } catch (error: any) {
      set({ error: error.message || 'Failed to load user active competitions' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteCompetition: async (competitionId) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('competitions')
        .delete()
        .eq('id', competitionId);

      if (error) throw error;
      set((state) => ({
        userActiveCompetitions: state.userActiveCompetitions.filter((comp) => comp.id !== competitionId),
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to delete competition' });
      // Do not re-throw here, as the error is already handled by setting the state
    } finally {
      set({ isLoading: false });
    }
  },

  clearCurrentCompetition: () => {
    set({ currentCompetition: null, participants: [], chatMessages: [], queueEntry: null });
  },

  loadUserStats: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
        throw error;
      }
      set({ userStats: data ?? null });
    } catch (error: any) {
      set({ error: error.message || 'Failed to load user stats' });
    } finally {
      set({ isLoading: false });
    }
  },

loadCompetitionResultsHistory: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      // 1. Fetch competition results without attempting to join profiles
      const { data: results, error: resultsError } = await supabase
        .from('competition_results')
        .select('*') // Select all columns from competition_results
        .eq('user_id', userId)
        .order('competition_date', { ascending: false });

      if (resultsError) {
        console.error('Error fetching competition results history:', resultsError);
        throw resultsError;
      }

      if (!results || results.length === 0) {
        set({ competitionResultsHistory: [] });
        return;
      }

      // 2. Extract unique user_ids from the results
      const uniqueUserIds = [...new Set(results.map(r => r.user_id))];

      // 3. Fetch profiles for these unique user_ids
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .in('user_id', uniqueUserIds);

      if (profilesError) {
        console.error('Error fetching profiles for competition results:', profilesError);
        // Continue without profile names if fetching profiles fails
        set({ competitionResultsHistory: [] }); // Set to empty array on profile fetch error
        return;
      }

      // Create a map for quick lookup of full_name by user_id
      const profileMap = new Map(profiles.map(p => [p.user_id, p.full_name]));

      // 4. Manually merge full_name into competition results
      const mergedResults = results.map(result => ({
        ...result,
        profile: {
          full_name: profileMap.get(result.user_id) || 'Anonymous User' // Default if profile not found
        }
      }));

      set({ competitionResultsHistory: mergedResults });
    } catch (error: any) {
      set({ error: error.message || 'Failed to load competition results history' });
    } finally {
      set({ isLoading: false });
    }
  }, 

  // Chat actions
  loadChatMessages: async (competitionId) => {
    try {
      const { data, error } = await supabase
        .from('competition_chat')
        .select(`
          *,
          profile:profiles(full_name)
        `)
        .eq('competition_id', competitionId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      set({ chatMessages: data || [] });
    } catch (error: any) {
      console.error('Error loading chat messages:', error.message);
      set({ error: error.message || 'Failed to load chat messages' });
    }
  },

  sendChatMessage: async (competitionId, message) => {
    try {
      const { user } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('competition_chat')
        .insert({
          competition_id: competitionId,
          user_id: user.id,
          message,
        });

      if (error) throw error;
    } catch (error: any) {
      console.error('Error sending chat message:', error.message);
      set({ error: error.message || 'Failed to send message' });
    }
  },

  subscribeToChat: (competitionId) => {
    const subscription = supabase
      .channel(`competition_chat_${competitionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'competition_chat',
          filter: `competition_id=eq.${competitionId}`,
        },
        (payload) => {
          console.log('New chat message received!', payload);
          get().loadChatMessages(competitionId); // Reload chat messages on new insert
        }
      )
      .subscribe();

    return () => {
      console.log(`Unsubscribing from competition_chat_${competitionId}`);
      supabase.removeChannel(subscription);
    };
  },

  // Random Matchmaking
  joinRandomQueue: async (preferences) => {
    set({ isLoading: true, error: null });
    try {
      const { user } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Check if already in queue
      const { data: existingEntry } = await supabase
        .from('random_queue')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['waiting', 'matched'])
        .maybeSingle();

      if (existingEntry) {
        set({ queueEntry: existingEntry });
        return;
      }

      const { data, error } = await supabase
        .from('random_queue')
        .insert({
          user_id: user.id,
          topic: preferences.topic,
          difficulty: preferences.difficulty,
          language: preferences.language,
          status: 'waiting',
        })
        .select()
        .single();

      if (error) throw error;
      set({ queueEntry: data });
    } catch (error: any) {
      set({ error: error.message || 'Failed to join queue' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  leaveRandomQueue: async () => {
    set({ isLoading: true, error: null });
    try {
      const { user } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('random_queue')
        .update({ status: 'cancelled' })
        .eq('user_id', user.id)
        .in('status', ['waiting', 'matched']);

      if (error) throw error;
      set({ queueEntry: null });
    } catch (error: any) {
      set({ error: error.message || 'Failed to leave queue' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  subscribeToRandomQueue: (userId) => {
    const subscription = supabase
      .channel(`random_queue_${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'random_queue',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('Random queue entry updated!', payload);
          set({ queueEntry: payload.new as RandomQueueEntry });
        }
      )
      .subscribe();

    return () => {
      console.log(`Unsubscribing from random_queue_${userId}`);
      supabase.removeChannel(subscription);
    };
  },

  cleanupSubscriptions: () => {
    // This function is a placeholder. Actual unsubscription logic is handled
    // by the return functions of `subscribeToCompetition` and `subscribeToChat`.
    // This is mainly to signal that cleanup should occur.
    console.log('Cleanup subscriptions triggered in store.');
  },

  setCleanupFlag: (flag) => {
    set({ cleanupFlag: flag });
  },

  // New: Calculate overall stats
  calculateOverallStats: (soloHistory, competitionHistory, userStats) => {
    let totalQuizzesPlayed = 0;
    let overallPoints = 0;
    let totalWins = 0;
    let totalCompetitionsParticipated = 0;
    let bestOverallRank: number | null = null;

    // From solo quiz history
    totalQuizzesPlayed += soloHistory.length;
    soloHistory.forEach(quiz => {
      overallPoints += quiz.percentage || 0; // Assuming percentage score contributes to points
    });

    // From competition results history
    totalQuizzesPlayed += competitionHistory.length;
    competitionHistory.forEach(compResult => {
      overallPoints += compResult.points_earned || 0;
      if (compResult.final_rank === 1) {
        totalWins++;
      }
      totalCompetitionsParticipated++;
      if (compResult.final_rank !== null && (bestOverallRank === null || compResult.final_rank < bestOverallRank)) {
        bestOverallRank = compResult.final_rank;
      }
    });

    // From user_stats table (for competitions created/participated)
    if (userStats) {
      overallPoints += userStats.total_points || 0;
      totalWins += userStats.wins || 0;
      totalCompetitionsParticipated += userStats.total_competitions || 0;
      if (userStats.best_rank !== null && (bestOverallRank === null || userStats.best_rank < bestOverallRank)) {
        bestOverallRank = userStats.best_rank;
      }
    }

    const overallWinRate = totalCompetitionsParticipated > 0
      ? parseFloat(((totalWins / totalCompetitionsParticipated) * 100).toFixed(1))
      : 0;

    set({
      overallStats: {
        bestOverallRank,
        overallPoints,
        overallWinRate,
        totalQuizzesPlayed,
      }
    });
  },
}));
