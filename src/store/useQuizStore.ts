import { create } from 'zustand';
import { ApiKeyData, Question, QuizPreferences, QuizResult } from '../types';
import { getApiKey, getQuizPreferences, saveApiKey, saveQuizPreferences, saveQuizResultToDatabase } from '../services/supabase';
import { generateQuiz, getAnswerExplanation } from '../services/gemini';
import { useAuthStore } from './useAuthStore';

interface QuizState {
  preferences: QuizPreferences | null;
  apiKey: string | null;
  questions: Question[];
  currentQuestionIndex: number;
  answers: Record<number, string>;
  result: QuizResult | null;
  isLoading: boolean;
  error: string | null;
  explanation: string | null;
  
  // Quiz session state for persistence
  sessionState: {
    startTime: number | null;
    totalTimeElapsed: number;
    lastQuestionIndex: number;
    sessionId: string | null;
  };
  
  // Preference actions
  loadApiKey: (userId: string) => Promise<void>;
  saveApiKey: (userId: string, apiKey: string) => Promise<void>;
  loadPreferences: (userId: string) => Promise<void>;
  savePreferences: (userId: string, preferences: QuizPreferences) => Promise<void>;
  
  // Quiz actions
  generateQuiz: (userId: string) => Promise<void>;
  answerQuestion: (questionId: number, answer: string) => void;
  nextQuestion: () => void;
  prevQuestion: () => void;
  finishQuiz: () => void;
  resetQuiz: () => void;
  
  // Session management
  saveQuizSession: () => void;
  loadQuizSession: () => boolean;
  clearQuizSession: () => void;
  
  // Explanation
  getExplanation: (questionId: number) => Promise<void>;
  resetExplanation: () => void;
}

export const defaultPreferences: QuizPreferences = {
  course: '',
  topic: '',
  subtopic: '',
  questionCount: 5,
  questionTypes: ['multiple-choice'],
  language: 'English',
  difficulty: 'medium',
  timeLimit: null,
  totalTimeLimit: null,
  timeLimitEnabled: false,
  negativeMarking: false,
  negativeMarks: 0,
  mode: 'practice',
  answerMode: 'immediate'
};

export const useQuizStore = create<QuizState>((set, get) => ({
  preferences: defaultPreferences,
  apiKey: null,
  questions: [],
  currentQuestionIndex: 0,
  answers: {},
  result: null,
  isLoading: false,
  error: null,
  explanation: null,
  sessionState: {
    startTime: null,
    totalTimeElapsed: 0,
    lastQuestionIndex: 0,
    sessionId: null,
  },
  
  loadApiKey: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const apiKey = await getApiKey(userId);
      set({ apiKey });
    } catch (error: any) {
      set({ error: error.message || 'Failed to load API key' });
    } finally {
      set({ isLoading: false });
    }
  },
  
  saveApiKey: async (userId, apiKey) => {
    set({ isLoading: true, error: null });
    try {
      await saveApiKey(userId, apiKey);
      set({ apiKey });
    } catch (error: any) {
      set({ error: error.message || 'Failed to save API key' });
    } finally {
      set({ isLoading: false });
    }
  },
  
  loadPreferences: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const preferences = await getQuizPreferences(userId);
      set({ preferences: preferences || defaultPreferences });
    } catch (error: any) {
      set({ error: error.message || 'Failed to load preferences' });
    } finally {
      set({ isLoading: false });
    }
  },
  
  savePreferences: async (userId, preferences) => {
    set({ isLoading: true, error: null });
    try {
      // Ensure at least one question type is selected
      if (!preferences.questionTypes || preferences.questionTypes.length === 0) {
        preferences.questionTypes = ['multiple-choice'];
      }
      
      // Validate preferences with proper time limit handling
      const validatedPreferences = {
        ...preferences,
        course: preferences.course || '',
        topic: preferences.topic || '',
        subtopic: preferences.subtopic || '',
        questionCount: Math.max(1, Math.min(50, preferences.questionCount || 5)),
        difficulty: preferences.difficulty || 'medium',
        language: preferences.language || 'English',
        timeLimitEnabled: preferences.timeLimitEnabled || false,
        // Updated time limit handling - don't convert to string here
        timeLimit: preferences.timeLimitEnabled ? preferences.timeLimit : null,
        totalTimeLimit: preferences.timeLimitEnabled ? preferences.totalTimeLimit : null,
        negativeMarking: preferences.negativeMarking || false,
        negativeMarks: preferences.negativeMarking ? (preferences.negativeMarks || -0.25) : 0,
        mode: preferences.mode || 'practice',
        answerMode: preferences.mode === 'practice' ? 'immediate' : 'end'
      };
      
      await saveQuizPreferences(userId, validatedPreferences);
      set({ preferences: validatedPreferences });
    } catch (error: any) {
      set({ error: error.message || 'Failed to save preferences' });
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },
  
  generateQuiz: async (userId) => {
    const { preferences, apiKey } = get();
    set({ isLoading: true, error: null, questions: [], answers: {}, result: null });
    
    if (!preferences || !apiKey) {
      set({ 
        error: !preferences 
          ? 'Quiz preferences not set' 
          : 'Gemini API key not set',
        isLoading: false 
      });
      return;
    }
    
    try {
      const questions = await generateQuiz(apiKey, preferences);
      const sessionId = `quiz_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      
      set({ 
        questions, 
        currentQuestionIndex: 0,
        answers: {},
        sessionState: {
          startTime: Date.now(),
          totalTimeElapsed: 0,
          lastQuestionIndex: 0,
          sessionId,
        }
      });
      
      // Save session to localStorage for persistence
      get().saveQuizSession();
    } catch (error: any) {
      set({ error: error.message || 'Failed to generate quiz' });
    } finally {
      set({ isLoading: false });
    }
  },
  
  answerQuestion: (questionId, answer) => {
    set((state) => {
      const newAnswers = {
        ...state.answers,
        [questionId]: answer
      };
      
      // Update session state
      const newSessionState = {
        ...state.sessionState,
        totalTimeElapsed: state.sessionState.startTime 
          ? Math.floor((Date.now() - state.sessionState.startTime) / 1000)
          : 0,
        lastQuestionIndex: state.currentQuestionIndex,
      };
      
      const newState = {
        answers: newAnswers,
        sessionState: newSessionState,
      };
      
      // Save to localStorage
      setTimeout(() => get().saveQuizSession(), 100);
      
      return newState;
    });
  },
  
  nextQuestion: () => {
    set((state) => {
      if (state.currentQuestionIndex < state.questions.length - 1) {
        const newIndex = state.currentQuestionIndex + 1;
        const newSessionState = {
          ...state.sessionState,
          lastQuestionIndex: newIndex,
          totalTimeElapsed: state.sessionState.startTime 
            ? Math.floor((Date.now() - state.sessionState.startTime) / 1000)
            : 0,
        };
        
        // Save to localStorage
        setTimeout(() => get().saveQuizSession(), 100);
        
        return { 
          currentQuestionIndex: newIndex,
          sessionState: newSessionState,
        };
      }
      return state;
    });
  },
  
  prevQuestion: () => {
    set((state) => {
      if (state.currentQuestionIndex > 0) {
        const newIndex = state.currentQuestionIndex - 1;
        const newSessionState = {
          ...state.sessionState,
          lastQuestionIndex: newIndex,
          totalTimeElapsed: state.sessionState.startTime 
            ? Math.floor((Date.now() - state.sessionState.startTime) / 1000)
            : 0,
        };
        
        // Save to localStorage
        setTimeout(() => get().saveQuizSession(), 100);
        
        return { 
          currentQuestionIndex: newIndex,
          sessionState: newSessionState,
        };
      }
      return state;
    });
  },
  
  finishQuiz: () => {
    const { questions, answers, preferences, sessionState } = get();
    
    console.log('Starting finishQuiz with:', { questionsCount: questions.length, answersCount: Object.keys(answers).length });
    
    if (questions.length === 0) {
      console.warn('No questions available to finish quiz');
      return;
    }
    
    let correctAnswers = 0;
    let finalScore = 0;
    let questionsAttempted = 0;
    let questionsSkipped = 0;
    const questionTypePerformance: Record<string, { correct: number; total: number }> = {};
    
    const questionsWithAnswers = questions.map(question => {
      const userAnswer = answers[question.id];
      const isAnswered = userAnswer && userAnswer.trim() !== '';
      
      if (isAnswered) {
        questionsAttempted++;
      } else {
        questionsSkipped++;
      }
      
      // Initialize question type tracking
      if (!questionTypePerformance[question.type]) {
        questionTypePerformance[question.type] = { correct: 0, total: 0 };
      }
      questionTypePerformance[question.type].total++;
      
      let isCorrect = false;
      
      // Handle different question types correctly
      switch (question.type) {
        case 'multiple-choice':
        case 'true-false':
        case 'case-study':
        case 'situation':
          isCorrect = userAnswer && question.correctAnswer && 
                     userAnswer.toLowerCase() === question.correctAnswer.toLowerCase();
          break;
          
        case 'multi-select':
          if (userAnswer && question.correctOptions) {
            const userOptions = userAnswer.split(',').sort();
            const correctOptions = question.correctOptions.sort();
            isCorrect = userOptions.length === correctOptions.length &&
                       userOptions.every((opt, index) => opt === correctOptions[index]);
          }
          break;
          
        case 'sequence':
          if (userAnswer && question.correctSequence) {
            const userSequence = userAnswer.split(',');
            isCorrect = userSequence.length === question.correctSequence.length &&
                       userSequence.every((step, index) => step === question.correctSequence![index]);
          }
          break;
          
        case 'short-answer':
        case 'fill-blank':
          if (userAnswer && question.correctAnswer) {
            const userLower = userAnswer.toLowerCase().trim();
            const correctLower = question.correctAnswer.toLowerCase().trim();
            isCorrect = userLower === correctLower;
            
            if (!isCorrect && question.keywords) {
              isCorrect = question.keywords.some(keyword => 
                userLower.includes(keyword.toLowerCase())
              );
            }
          }
          break;
          
        default:
          isCorrect = false;
      }
      
      if (isCorrect) {
        correctAnswers++;
        finalScore += 1;
        questionTypePerformance[question.type].correct++;
      } else if (userAnswer && preferences?.negativeMarking) {
        finalScore += preferences.negativeMarks || 0;
      }
      
      return {
        ...question,
        userAnswer,
        isCorrect
      };
    });
    
    finalScore = Math.max(0, finalScore);
    
    const result: QuizResult = {
      totalQuestions: questions.length,
      correctAnswers,
      questionsAttempted,
      questionsSkipped,
      percentage: questions.length > 0 ? Math.round((finalScore / questions.length) * 100) : 0,
      questions: questionsWithAnswers,
      questionTypePerformance,
      finalScore,
      rawScore: correctAnswers,
      negativeMarksDeducted: preferences?.negativeMarking ? 
        Math.abs((correctAnswers - finalScore) * (preferences.negativeMarks || 0)) : 0,
      timeAnalytics: sessionState.startTime ? {
        totalTime: Math.floor((Date.now() - sessionState.startTime) / 1000),
        averageTimePerQuestion: Math.floor((Date.now() - sessionState.startTime) / 1000) / questions.length,
      } : undefined,
    };
    
    console.log('Quiz result created:', result);
    
    // Set result and clear session
    set({ 
      result,
      currentQuestionIndex: 0 // Reset question index
    });
    
    // Clear session from localStorage
    get().clearQuizSession();
    
    // Save to database
    const { user } = useAuthStore.getState();
    if (user && preferences) {
      saveQuizResultToDatabase(user.id, result, preferences).catch(console.error);
    }
  },
  
  resetQuiz: () => {
    get().clearQuizSession();
    set({
      questions: [],
      currentQuestionIndex: 0,
      answers: {},
      result: null,
      error: null,
      sessionState: {
        startTime: null,
        totalTimeElapsed: 0,
        lastQuestionIndex: 0,
        sessionId: null,
      }
    });
  },
  
  saveQuizSession: () => {
    const { questions, currentQuestionIndex, answers, sessionState, preferences } = get();
    
    if (questions.length > 0 && sessionState.sessionId) {
      const sessionData = {
        questions,
        currentQuestionIndex,
        answers,
        sessionState,
        preferences,
        timestamp: Date.now(),
      };
      
      try {
        localStorage.setItem('quiz_session', JSON.stringify(sessionData));
      } catch (error) {
        console.warn('Failed to save quiz session to localStorage:', error);
      }
    }
  },
  
  loadQuizSession: () => {
    try {
      const sessionData = localStorage.getItem('quiz_session');
      if (!sessionData) return false;
      
      const parsed = JSON.parse(sessionData);
      const now = Date.now();
      
      // Check if session is not too old (max 24 hours)
      if (now - parsed.timestamp > 24 * 60 * 60 * 1000) {
        localStorage.removeItem('quiz_session');
        return false;
      }
      
      // Restore session
      set({
        questions: parsed.questions || [],
        currentQuestionIndex: parsed.currentQuestionIndex || 0,
        answers: parsed.answers || {},
        sessionState: {
          ...parsed.sessionState,
          totalTimeElapsed: parsed.sessionState.startTime 
            ? Math.floor((now - parsed.sessionState.startTime) / 1000)
            : 0,
        },
        preferences: parsed.preferences || defaultPreferences,
      });
      
      return true;
    } catch (error) {
      console.warn('Failed to load quiz session from localStorage:', error);
      localStorage.removeItem('quiz_session');
      return false;
    }
  },
  
  clearQuizSession: () => {
    try {
      localStorage.removeItem('quiz_session');
    } catch (error) {
      console.warn('Failed to clear quiz session from localStorage:', error);
    }
  },
  
  getExplanation: async (questionId) => {
    const { questions, apiKey, preferences } = get();
    set({ isLoading: true, error: null, explanation: null });
    
    const question = questions.find(q => q.id === questionId);
    
    if (!question || !apiKey || !preferences) {
      set({ 
        error: !question 
          ? 'Question not found' 
          : !apiKey 
            ? 'API key not set'
            : 'Preferences not set',
        isLoading: false 
      });
      return;
    }
    
    try {
      const explanation = await getAnswerExplanation(
        apiKey,
        question.text,
        question.correctAnswer || 'N/A',
        preferences.topic || preferences.course,
        preferences.language
      );
      
      set({ explanation });
    } catch (error: any) {
      set({ error: error.message || 'Failed to get explanation' });
    } finally {
      set({ isLoading: false });
    }
  },
  
  resetExplanation: () => {
    set({ explanation: null });
  }
}));