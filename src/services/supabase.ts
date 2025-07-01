// src/services/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { ApiKeyData, QuizPreferences, UserProfile, QuizResultData, FavoriteQuestion, QuizResult } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Enhanced validation and error logging
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:', {
    url: supabaseUrl ? 'present' : 'missing',
    key: supabaseAnonKey ? 'present' : 'missing'
  });
  throw new Error('Missing Supabase environment variables');
}

// Validate URL format
try {
  new URL(supabaseUrl);
} catch (error) {
  console.error('Invalid Supabase URL format:', supabaseUrl);
  throw new Error('Invalid Supabase URL format');
}

console.log('Initializing Supabase client with URL:', supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'X-Client-Info': 'quiz-app'
    }
  }
});

// Test connection function
export const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    if (error) {
      console.error('Supabase connection test failed:', error);
      return false;
    }
    console.log('Supabase connection test successful');
    return true;
  } catch (error) {
    console.error('Supabase connection test error:', error);
    return false;
  }
};

// API Key functions
export const getApiKey = async (userId: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('api_keys')
      .select('gemini_api_key')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching API key:', error);
      throw error;
    }
    return data?.gemini_api_key || null;
  } catch (error) {
    console.error('getApiKey error:', error);
    throw error;
  }
};

export const saveApiKey = async (userId: string, apiKey: string) => {
  try {
    // First try to update existing key
    const { data: existingKey } = await supabase
      .from('api_keys')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (existingKey) {
      // Update existing key
      return supabase
        .from('api_keys')
        .update({ gemini_api_key: apiKey })
        .eq('user_id', userId);
    } else {
      // Insert new key
      return supabase
        .from('api_keys')
        .insert({ user_id: userId, gemini_api_key: apiKey });
    }
  } catch (error) {
    console.error('saveApiKey error:', error);
    throw error;
  }
};

// New function to get a single competition result by competition_id and user_id
export const getCompetitionResultByCompetitionAndUser = async (competitionId: string, userId: string): Promise<any | null> => {
  try {
    const { data, error } = await supabase
      .from('competition_results')
      .select(`
        *,
        profile:profiles(full_name)
      `)
      .eq('competition_id', competitionId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching competition result by competitionId and userId:', error);
      throw error;
    }

    if (!data) return null;

    // Map the database data to a more usable format (camelCase)
    return {
      id: data.id,
      competitionId: data.competition_id,
      userId: data.user_id,
      competitionTitle: data.competition_title,
      competitionType: data.competition_type,
      competitionCode: data.competition_code,
      finalRank: data.final_rank,
      totalParticipants: data.total_participants,
      score: data.score,
      correctAnswers: data.correct_answers,
      incorrectAnswers: data.incorrect_answers,
      skippedAnswers: data.skipped_answers,
      totalQuestions: data.total_questions,
      timeTaken: data.time_taken,
      averageTimePerQuestion: data.average_time_per_question,
      pointsEarned: data.points_earned,
      questionTypePerformance: data.question_type_performance,
      answers: data.answers,
      questionDetails: data.question_details,
      quizPreferences: data.quiz_preferences,
      strengths: data.strengths,
      areasForImprovement: data.areas_for_improvement,
      comparativePerformance: data.comparative_performance,
      competitionDate: data.competition_date ? new Date(data.competition_date) : null,
      joinedAt: data.joined_at ? new Date(data.joined_at) : null,
      startedAt: data.started_at ? new Date(data.started_at) : null,
      completedAt: data.completed_at ? new Date(data.completed_at) : null,
      createdAt: data.created_at ? new Date(data.created_at) : null,
      percentageScore: data.percentage_score,
      accuracyRate: data.accuracy_rate,
      rankPercentile: data.rank_percentile,
      profile: data.profile || null
    };
  } catch (error) {
    console.error('getCompetitionResultByCompetitionAndUser error:', error);
    throw error;
  }
};


// New function to get a single competition result by ID
export const getCompetitionResultById = async (resultId: string): Promise<any | null> => {
  try {
    const { data, error } = await supabase
      .from('competition_results')
      .select(`*`)
      .eq('id', resultId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching competition result by ID:', error);
      throw error;
    }

    if (!data) return null;

    // Map the database data to a more usable format
    return {
      id: data.id,
      competitionId: data.competition_id,
      userId: data.user_id,
      competitionTitle: data.competition_title,
      competitionType: data.competition_type,
      competitionCode: data.competition_code,
      finalRank: data.final_rank,
      totalParticipants: data.total_participants,
      score: data.score,
      correctAnswers: data.correct_answers,
      incorrectAnswers: data.incorrect_answers,
      skippedAnswers: data.skipped_answers,
      totalQuestions: data.total_questions,
      timeTaken: data.time_taken,
      averageTimePerQuestion: data.average_time_per_question,
      pointsEarned: data.points_earned,
      questionTypePerformance: data.question_type_performance,
      answers: data.answers,
      questionDetails: data.question_details,
      quizPreferences: data.quiz_preferences,
      strengths: data.strengths,
      areasForImprovement: data.areas_for_improvement,
      comparativePerformance: data.comparative_performance,
      competitionDate: data.competition_date ? new Date(data.competition_date) : null,
      joinedAt: data.joined_at ? new Date(data.joined_at) : null,
      startedAt: data.started_at ? new Date(data.started_at) : null,
      completedAt: data.completed_at ? new Date(data.completed_at) : null,
      createdAt: data.created_at ? new Date(data.created_at) : null,
      percentageScore: data.percentage_score,
      accuracyRate: data.accuracy_rate,
      rankPercentile: data.rank_percentile,
      profile: data.profile || null
    };
  } catch (error) {
    console.error('getCompetitionResultById error:', error);
    throw error;
  }
};

// Quiz preferences functions
export const getQuizPreferences = async (userId: string): Promise<QuizPreferences | null> => {
  try {
    const { data, error } = await supabase
      .from('quiz_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching quiz preferences:', error);
      throw error;
    }

    if (!data) return null;

    return {
      course: data.course || '',
      topic: data.topic || '',
      subtopic: data.subtopic || '',
      questionCount: data.question_count || 5,
      questionTypes: data.question_types || ['multiple-choice'],
      language: data.language || 'English',
      difficulty: data.difficulty || 'medium',
      // Updated time limits - keep as string or null
      timeLimit: data.time_limit || null,
      totalTimeLimit: data.total_time_limit || null, 
      timeLimitEnabled: data.time_limit_enabled || false,
      negativeMarking: data.negative_marking || false,
      negativeMarks: data.negative_marks || 0,
      mode: data.mode || 'practice',
      answerMode: data.mode === 'practice' ? 'immediate' : 'end'
    };
  } catch (error) {
    console.error('getQuizPreferences error:', error);
    throw error;
  }
};

export const saveQuizPreferences = async (userId: string, preferences: QuizPreferences) => {
  try {
    // First try to update existing preferences
    const { data: existingPrefs } = await supabase
      .from('quiz_preferences')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    // Replace this section in saveQuizPreferences function:
const prefsData = {
  user_id: userId,
  course: preferences.course || '',
  topic: preferences.topic || '',
  subtopic: preferences.subtopic || '',
  question_count: preferences.questionCount || 5,
  question_types: preferences.questionTypes || ['multiple-choice'],
  language: preferences.language || 'English',
  difficulty: preferences.difficulty || 'medium',
  // Fixed time limit handling
  time_limit: preferences.timeLimitEnabled && preferences.totalTimeLimit === null 
    ? parseInt(preferences.timeLimit) 
    : null,
  total_time_limit: preferences.timeLimitEnabled && preferences.timeLimit === null 
    ? parseInt(preferences.totalTimeLimit) 
    : null,
  time_limit_enabled: preferences.timeLimitEnabled || false,
  negative_marking: preferences.negativeMarking || false,
  negative_marks: preferences.negativeMarking ? (preferences.negativeMarks || 0) : 0,
  mode: preferences.mode || 'practice'
};

    if (existingPrefs) {
      return supabase
        .from('quiz_preferences')
        .update(prefsData)
        .eq('user_id', userId);
    } else {
      return supabase
        .from('quiz_preferences')
        .insert(prefsData);
    }
  } catch (error) {
    console.error('saveQuizPreferences error:', error);
    throw error;
  }
};

// Auth functions
export const signUp = async (
  email: string, 
  password: string, 
  fullName: string, 
  mobileNumber: string,
  countryCode: string = 'IN',
  countryName: string = 'India'
) => {
  try {
    // Sign up user with email confirmation required
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          full_name: fullName,
          registration_status: 'pending_verification',
          registration_date: new Date().toISOString(),
        },
        emailRedirectTo: `${window.location.origin}/auth-redirect`, // Updated redirect URL
      }
    });

    if (error) {
      console.error('SignUp error:', error);
      // Check if email already exists
      if (error.message.includes('already registered') || error.message.includes('already been registered')) {
        throw new Error('This email address is already registered. Please sign in instead.');
      }
      throw error;
    }

    if (data?.user) {
      // Use the send-verification Edge Function to create profile with service role privileges
      try {
        const response = await fetch(`${supabaseUrl}/functions/v1/send-verification`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabaseAnonKey}`,
          },
          body: JSON.stringify({
            userId: data.user.id,
            email: email,
            name: fullName,
            mobileNumber: mobileNumber,
            countryCode: countryCode,
            countryName: countryName
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => null);
          const errorMessage = errorData?.error || 'Failed to create profile';
          const errorDetails = errorData?.details || '';
          console.error('Profile creation via Edge Function failed:', errorMessage, errorDetails);
          throw new Error(`${errorMessage}${errorDetails ? ': ' + errorDetails : ''}`);
        }

        const responseData = await response.json();
        console.log('Profile creation successful:', responseData);
      } catch (fetchError: any) {
        console.error('Profile creation error:', fetchError);
        // If it's a network error or other fetch error, provide a more specific message
        if (fetchError.name === 'TypeError' && fetchError.message.includes('fetch')) {
          throw new Error('Network error: Unable to complete registration');
        }
        throw new Error(fetchError.message || 'Failed to create profile');
      }
    } else {
      throw new Error('Registration failed - no user data returned');
    }

    return data;
  } catch (error) {
    console.error('signUp error:', error);
    throw error;
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      console.error('SignIn error:', error);
      throw error;
    }

    // Check if email is confirmed
    if (!data.user.email_confirmed_at) {
      throw new Error('Please confirm your email before signing in');
    }

    return { data, error };
  } catch (error) {
    console.error('signIn error:', error);
    throw error;
  }
};

export const signOut = async () => {
  try {
    return supabase.auth.signOut();
  } catch (error) {
    console.error('signOut error:', error);
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { data: null, error: userError };
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      throw profileError;
    }

    if (!profile) {
      // If no profile is found, this is an error state
      throw new Error('User profile not found');
    }

    return {
      data: {
        user: {
          id: user.id,
          email: user.email,
          emailConfirmed: !!user.email_confirmed_at,
          profile: {
            id: profile.id,
            fullName: profile.full_name,
            mobileNumber: profile.mobile_number,
            countryCode: profile.country_code,
            countryName: profile.country_name,
            avatarUrl: profile.avatar_url,
            createdAt: new Date(profile.created_at),
            updatedAt: new Date(profile.updated_at),
          },
        }
      },
      error: null,
    };
  } catch (err: any) {
    console.error('getCurrentUser error:', err);
    return {
      data: null,
      error: {
        message: err.message,
        status: err.status || 500
      },
    };
  }
};

export const resetPassword = async (email: string) => {
  try {
    return supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth-redirect`, // Updated redirect URL
    });
  } catch (error) {
    console.error('resetPassword error:', error);
    throw error;
  }
};

export const updatePassword = async (newPassword: string) => {
  try {
    return supabase.auth.updateUser({ password: newPassword });
  } catch (error) {
    console.error('updatePassword error:', error);
    throw error;
  }
};

export const resendVerificationEmail = async (email: string) => {
  try {
    return supabase.auth.resend({ type: 'signup', email });
  } catch (error) {
    console.error('resendVerificationEmail error:', error);
    throw error;
  }
};

export const updateProfile = async (userId: string, profile: Partial<UserProfile>) => {
  try {
    return supabase
      .from('profiles')
      .update({
        full_name: profile.fullName,
        mobile_number: profile.mobileNumber,
        avatar_url: profile.avatarUrl,
        country_code: profile.countryCode,
        country_name: profile.countryName,
      })
      .eq('user_id', userId);
  } catch (error) {
    console.error('updateProfile error:', error);
    throw error;
  }
};

export const getQuizResults = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('quiz_results')
      .select('*, quiz_preferences(*)') // Select quiz_preferences table
      .eq('user_id', userId)
      .order('quiz_date', { ascending: false });

    if (error) {
      console.error('Error fetching quiz results:', error);
      throw error;
    }

    return data.map(result => ({
      id: result.id,
      quizDate: new Date(result.quiz_date),
      topic: result.topic,
      score: result.score,
      totalQuestions: result.total_questions,
      timeTaken: result.time_taken,
      // Map preferences if available
      preferences: result.quiz_preferences ? {
        course: result.quiz_preferences.course || '',
        topic: result.quiz_preferences.topic || '',
        subtopic: result.quiz_preferences.subtopic || '',
        questionCount: result.quiz_preferences.question_count || 5,
        questionTypes: result.quiz_preferences.question_types || ['multiple-choice'],
        language: result.quiz_preferences.language || 'English',
        difficulty: result.quiz_preferences.difficulty || 'medium',
        timeLimit: result.quiz_preferences.time_limit || null,
        totalTimeLimit: result.quiz_preferences.total_time_limit || null,
        timeLimitEnabled: result.quiz_preferences.time_limit_enabled || false,
        negativeMarking: result.quiz_preferences.negative_marking || false,
        negativeMarks: result.quiz_preferences.negative_marks || 0,
        mode: result.quiz_preferences.mode || 'practice',
        answerMode: result.quiz_preferences.mode === 'practice' ? 'immediate' : 'end'
      } : undefined
    }));
  } catch (error) {
    console.error('getQuizResults error:', error);
    throw error;
  }
};

// Favorite questions functions
export const saveFavoriteQuestion = async (userId: string, question: Omit<FavoriteQuestion, 'id' | 'createdAt'>) => {
  try {
    return supabase
      .from('favorite_questions')
      .insert({
        user_id: userId,
        question_text: question.questionText,
        answer: question.answer,
        explanation: question.explanation,
        topic: question.topic,
      });
  } catch (error) {
    console.error('saveFavoriteQuestion error:', error);
    throw error;
  }
};

export const getFavoriteQuestions = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('favorite_questions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching favorite questions:', error);
      throw error;
    }

    return data.map(question => ({
      id: question.id,
      questionText: question.question_text,
      answer: question.answer,
      explanation: question.explanation,
      topic: question.topic,
      createdAt: new Date(question.created_at),
    }));
  } catch (error) {
    console.error('getFavoriteQuestions error:', error);
    throw error;
  }
};

export const removeFavoriteQuestion = async (userId: string, questionId: string) => {
  try {
    return supabase
      .from('favorite_questions')
      .delete()
      .eq('user_id', userId)
      .eq('id', questionId);
  } catch (error) {
    console.error('removeFavoriteQuestion error:', error);
    throw error;
  }
};

// Enhanced quiz results functions
export const saveQuizResultToDatabase = async (
  userId: string, 
  result: QuizResult, 
  preferences: QuizPreferences,
  sessionMetadata?: any
): Promise<{ id: string } | null> => { // Modified return type
  try {
    const sessionId = `quiz_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    
    const quizResultData = {
      user_id: userId,
      course: preferences.course || '',
      topic: preferences.topic,
      subtopic: preferences.subtopic,
      difficulty: preferences.difficulty,
      question_types: preferences.questionTypes,
      language: preferences.language,
      mode: preferences.mode,
      
      total_questions: result.totalQuestions,
      questions_attempted: result.questionsAttempted,
      questions_skipped: result.questionsSkipped,
      questions_correct: result.correctAnswers,
      questions_incorrect: result.questionsAttempted - result.correctAnswers,
      
      raw_score: result.rawScore,
      percentage_score: result.percentage,
      final_score: result.finalScore,
      negative_marking_applied: preferences.negativeMarking || false,
      negative_marks_deducted: result.negativeMarksDeducted || 0,
      
      time_limit_enabled: preferences.timeLimitEnabled || false,
      time_limit_per_question: preferences.timeLimit ? parseInt(preferences.timeLimit) : null,
      total_time_limit: preferences.totalTimeLimit ? parseInt(preferences.totalTimeLimit) : null,
      
      question_type_performance: result.questionTypePerformance,
      question_details: result.questions,
      
      session_id: sessionId,
      device_info: sessionMetadata || {},
      
      completed_at: new Date().toISOString(),
      total_time_taken: result.totalTimeTaken, // Added
      accuracy_rate: result.accuracyRate, // Added
      completion_rate: result.completionRate, // Added
      strengths: result.strengths, // Added
      weaknesses: result.weaknesses, // Added
      recommendations: result.recommendations, // Added
      comparative_performance: result.comparativePerformance, // Added
    };

    const { data, error } = await supabase
      .from('quiz_results')
      .insert(quizResultData)
      .select('id') // Select the ID of the newly inserted row
      .single();

    if (error) {
      console.error('saveQuizResultToDatabase error:', error);
      throw error;
    }
    return data; // Return the ID
  } catch (error) {
    console.error('saveQuizResultToDatabase error:', error);
    throw error;
  }
};

// New function to get a single quiz result by ID
export const getQuizResultById = async (resultId: string): Promise<QuizResult | null> => {
  try {
    const { data, error } = await supabase
      .from('quiz_results')
      .select(`*`) // Removed the quiz_preferences join
      .eq('id', resultId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching quiz result by ID:', error);
      throw error;
    }

    if (!data) return null;

    // Map the database data to the QuizResult type
    return {
      id: data.id,
      totalQuestions: data.total_questions,
      correctAnswers: data.questions_correct,
      questionsAttempted: data.questions_attempted,
      questionsSkipped: data.questions_skipped,
      percentage: data.percentage_score,
      questions: data.question_details || [],
      questionTypePerformance: data.question_type_performance || {},
      finalScore: data.final_score,
      rawScore: data.raw_score,
      negativeMarksDeducted: data.negative_marks_deducted,
      totalTimeTaken: data.total_time_taken,
      accuracyRate: data.accuracy_rate,
      completionRate: data.completion_rate,
      strengths: data.strengths || [],
      weaknesses: data.weaknesses || [],
      recommendations: data.recommendations || [], // Ensure this is an array
      comparativePerformance: data.comparative_performance || {},

      // Map quiz preferences directly to the result object
      course: data.course || undefined,
      topic: data.topic || undefined,
      subtopic: data.subtopic || undefined,
      difficulty: data.difficulty || undefined,
      language: data.language || undefined,
      timeLimitEnabled: data.time_limit_enabled || undefined,
      timeLimit: data.time_limit_per_question || undefined,
      totalTimeLimit: data.total_time_limit || undefined,
      negativeMarking: data.negative_marking_applied || undefined,
      negativeMarks: data.negative_marks_deducted || undefined, // Map to deducted marks if needed
      mode: data.mode || undefined,
    };
  } catch (error) {
    console.error('getQuizResultById error:', error);
    throw error;
  }
};

// Re-added function to get quiz results with analytics for history
export const getQuizResultsWithAnalytics = async (userId: string, limit = 50) => {
  try {
    const { data, error } = await supabase
      .from('quiz_results')
      .select('*')
      .eq('user_id', userId)
      .order('quiz_date', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching quiz results with analytics:', error);
      throw error;
    }
    return data.map(item => ({
      ...item,
      questions: item.question_details || [] // Map question_details to questions
    }));
  } catch (error) {
    console.error('getQuizResultsWithAnalytics error:', error);
    throw error;
  }
};


export const getQuizAnalytics = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('quiz_results')
      .select(`
        course,
        difficulty,
        percentage_score,
        accuracy_rate,
        completion_rate,
        question_type_performance,
        quiz_date
      `)
      .eq('user_id', userId)
      .order('quiz_date', { ascending: false });

    if (error) {
      console.error('Error fetching quiz analytics:', error);
      throw error;
    }
    return data;
  } catch (error) {
    console.error('getQuizAnalytics error:', error);
    throw error;
  }
};

export const getCompetitionResultsHistory = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('competition_results')
      .select('*')
      .eq('user_id', userId)
      .order('competition_date', { ascending: false });

    if (error) {
      console.error('Error fetching competition results history:', error);
      throw error;
    }
    return data;
  } catch (error) {
    console.error('getCompetitionResultsHistory error:', error);
    throw error;
  }
};

export const deleteQuizResult = async (quizResultId: string) => {
  try {
    const { error } = await supabase
      .from('quiz_results')
      .delete()
      .eq('id', quizResultId);

    if (error) {
      console.error('Error deleting quiz result:', error);
      throw error;
    }
    return true;
  } catch (error) {
    console.error('deleteQuizResult error:', error);
    throw error;
  }
};

