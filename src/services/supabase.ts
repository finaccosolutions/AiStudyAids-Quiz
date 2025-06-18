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
    course: data.course,
    topic: data.topic,
    subtopic: data.subtopic,
    questionCount: data.question_count,
    questionTypes: data.question_types,
    language: data.language,
    difficulty: data.difficulty,
    timeLimit: data.time_limit,
    totalTimeLimit: data.total_time_limit,
    timeLimitEnabled: data.time_limit_enabled,
    negativeMarking: data.negative_marking,
    negativeMarks: data.negative_marks,
    mode: data.mode
  };
};

export const saveQuizPreferences = async (userId: string, preferences: QuizPreferences) => {
  // First try to update existing preferences
  const { data: existingPrefs } = await supabase
    .from('quiz_preferences')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  const prefsData = {
    user_id: userId,
    course: preferences.course,
    topic: preferences.topic,
    subtopic: preferences.subtopic,
    question_count: preferences.questionCount,
    question_types: preferences.questionTypes,
    language: preferences.language,
    difficulty: preferences.difficulty,
    time_limit: preferences.timeLimit,
    total_time_limit: preferences.totalTimeLimit,
    time_limit_enabled: preferences.timeLimitEnabled,
    negative_marking: preferences.negativeMarking,
    negative_marks: preferences.negativeMarks,
    mode: preferences.mode
  };

  if (existingPrefs) {
    // Update existing preferences
    return supabase
      .from('quiz_preferences')
      .update(prefsData)
      .eq('user_id', userId);
  } else {
    // Insert new preferences
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
  // First check if mobile number exists
  const { data: existingProfiles } = await supabase
    .from('profiles')
    .select('mobile_number')
    .eq('mobile_number', mobileNumber);

  if (existingProfiles && existingProfiles.length > 0) {
    throw new Error('Mobile number already registered');
  }

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

  if (error) throw error;

  if (data.user) {
    // Call the send-verification function to create profile and send verification email
    const response = await fetch(`${supabaseUrl}/functions/v1/send-verification`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({
        userId: data.user.id,
        email,
        name: fullName,
        mobileNumber,
        countryCode,
        countryName,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create profile');
    }
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

// Quiz results functions
export const saveQuizResult = async (userId: string, result: QuizResultData) => {
  return supabase
    .from('quiz_results')
    .insert({
      user_id: userId,
      quiz_date: result.quizDate,
      topic: result.topic,
      score: result.score,
      total_questions: result.totalQuestions,
      time_taken: result.timeTaken,
    });
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