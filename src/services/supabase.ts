import { createClient } from '@supabase/supabase-js';
import { ApiKeyData, QuizPreferences, UserProfile, QuizResultData, FavoriteQuestion } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// API Key functions
export const getApiKey = async (userId: string): Promise<string | null> => {
  const { data, error } = await supabase
    .from('api_keys')
    .select('gemini_api_key')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data?.gemini_api_key || null;
};

export const saveApiKey = async (userId: string, apiKey: string) => {
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
};

  // Quiz preferences functions
export const getQuizPreferences = async (userId: string): Promise<QuizPreferences | null> => {
  const { data, error } = await supabase
    .from('quiz_preferences')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;

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
};




export const saveQuizPreferences = async (userId: string, preferences: QuizPreferences) => {
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
  // Updated time limit handling
  time_limit: preferences.timeLimitEnabled && preferences.timeLimit ? preferences.timeLimit : null,
  total_time_limit: preferences.timeLimitEnabled && preferences.totalTimeLimit ? preferences.totalTimeLimit : null,
  time_limit_enabled: preferences.timeLimitEnabled || false,
  negative_marking: preferences.negativeMarking || false,
  negative_marks: preferences.negativeMarks || 0,
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
      emailRedirectTo: `${window.location.origin}/auth?mode=signin`,
    }
  });

  if (error) {
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
    throw new Error('User registration failed - no user data returned');
  }

  return data;
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  
  if (error) throw error;

  // Check if email is confirmed
  if (!data.user.email_confirmed_at) {
    throw new Error('Please confirm your email address before signing in');
  }

  return { data, error };
};

export const signOut = async () => {
  return supabase.auth.signOut();
};

export const getCurrentUser = async () => {
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    return { data: null, error: userError };
  }

  try {
    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (profileError) throw profileError;

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
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
};

export const updatePassword = async (newPassword: string) => {
  return supabase.auth.updateUser({ password: newPassword });
};

export const updateProfile = async (userId: string, profile: Partial<UserProfile>) => {
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
};

export const getQuizResults = async (userId: string) => {
  const { data, error } = await supabase
    .from('quiz_results')
    .select('*')
    .eq('user_id', userId)
    .order('quiz_date', { ascending: false });

  if (error) throw error;

  return data.map(result => ({
    id: result.id,
    quizDate: new Date(result.quiz_date),
    topic: result.topic,
    score: result.score,
    totalQuestions: result.total_questions,
    timeTaken: result.time_taken,
  }));
};

// Favorite questions functions
export const saveFavoriteQuestion = async (userId: string, question: Omit<FavoriteQuestion, 'id' | 'createdAt'>) => {
  return supabase
    .from('favorite_questions')
    .insert({
      user_id: userId,
      question_text: question.questionText,
      answer: question.answer,
      explanation: question.explanation,
      topic: question.topic,
    });
};

export const getFavoriteQuestions = async (userId: string) => {
  const { data, error } = await supabase
    .from('favorite_questions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map(question => ({
    id: question.id,
    questionText: question.question_text,
    answer: question.answer,
    explanation: question.explanation,
    topic: question.topic,
    createdAt: new Date(question.created_at),
  }));
};

export const removeFavoriteQuestion = async (userId: string, questionId: string) => {
  return supabase
    .from('favorite_questions')
    .delete()
    .eq('user_id', userId)
    .eq('id', questionId);
};

// Enhanced quiz results functions
export const saveQuizResultToDatabase = async (
  userId: string, 
  result: QuizResult, 
  preferences: QuizPreferences,
  sessionMetadata?: any
) => {
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
    
    completed_at: new Date().toISOString()
  };

  return supabase
    .from('quiz_results')
    .insert(quizResultData);
};

export const getQuizResultsWithAnalytics = async (userId: string, limit = 50) => {
  const { data, error } = await supabase
    .from('quiz_results')
    .select('*')
    .eq('user_id', userId)
    .order('quiz_date', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
};

export const getQuizAnalytics = async (userId: string) => {
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

  if (error) throw error;
  return data;
};

export const getCompetitionResultsHistory = async (userId: string) => {
  const { data, error } = await supabase
    .from('competition_results')
    .select('*')
    .eq('user_id', userId)
    .order('competition_date', { ascending: false });

  if (error) throw error;
  return data;
};