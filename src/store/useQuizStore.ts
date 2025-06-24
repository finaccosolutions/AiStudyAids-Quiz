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
  
  // Quiz session state for resuming
  quizSession: {
    isActive: boolean;
    startTime: number;
    pausedTime?: number;
    totalElapsed: number;
  } | null;
  
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
  pauseQuiz: () => void;
  resumeQuiz: () => void;
  saveQuizSession: () => void;
  loadQuizSession: () => void;
  
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
  quizSession: null,
  
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
      set({ 
        questions, 
        currentQuestionIndex: 0,
        answers: {},
        quizSession: {
          isActive: true,
          startTime: Date.now(),
          totalElapsed: 0
        }
      });
      
      // Save session to localStorage for resuming
      get().saveQuizSession();
    } catch (error: any) {
      set({ error: error.message || 'Failed to generate quiz' });
    } finally {
      set({ isLoading: false });
    }
  },
  
  answerQuestion: (questionId, answer) => {
    set((state) => ({
      answers: {
        ...state.answers,
        [questionId]: answer
      }
    }));
    
    // Save session after each answer
    setTimeout(() => get().saveQuizSession(), 100);
  },
  
  nextQuestion: () => {
    set((state) => {
      if (state.currentQuestionIndex < state.questions.length - 1) {
        const newState = { currentQuestionIndex: state.currentQuestionIndex + 1 };
        setTimeout(() => get().saveQuizSession(), 100);
        return newState;
      }
      return state;
    });
  },
  
  prevQuestion: () => {
    set((state) => {
      if (state.currentQuestionIndex > 0) {
        const newState = { currentQuestionIndex: state.currentQuestionIndex - 1 };
        setTimeout(() => get().saveQuizSession(), 100);
        return newState;
      }
      return state;
    });
  },
  
  finishQuiz: () => {
    const { questions, answers, preferences } = get();
    
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
        Math.abs((correctAnswers - finalScore) * (preferences.negativeMarks || 0)) : 0
    };
    
    console.log('Quiz result created:', result);
    
    // Set result and clear session
    set({ 
      result,
      currentQuestionIndex: 0,
      quizSession: null
    });
    
    // Clear saved session
    localStorage.removeItem('quizSession');
    
    // Save to database
    const { user } = useAuthStore.getState();
    if (user && preferences) {
      saveQuizResultToDatabase(user.id, result, preferences).catch(console.error);
    }
  },
  
  resetQuiz: () => {
    set({
      questions: [],
      currentQuestionIndex: 0,
      answers: {},
      result: null,
      error: null,
      quizSession: null
    });
    
    // Clear saved session
    localStorage.removeItem('quizSession');
  },
  
  pauseQuiz: () => {
    set((state) => {
      if (state.quizSession?.isActive) {
        const now = Date.now();
        const totalElapsed = state.quizSession.totalElapsed + (now - state.quizSession.startTime);
        
        return {
          quizSession: {
            ...state.quizSession,
            isActive: false,
            pausedTime: now,
            totalElapsed
          }
        };
      }
      return state;
    });
    
    get().saveQuizSession();
  },
  
  resumeQuiz: () => {
    set((state) => {
      if (state.quizSession && !state.quizSession.isActive) {
        return {
          quizSession: {
            ...state.quizSession,
            isActive: true,
            startTime: Date.now(),
            pausedTime: undefined
          }
        };
      }
      return state;
    });
    
    get().saveQuizSession();
  },
  
  saveQuizSession: () => {
    const { questions, currentQuestionIndex, answers, quizSession } = get();
    
    if (questions.length > 0 && quizSession) {
      const sessionData = {
        questions,
        currentQuestionIndex,
        answers,
        quizSession,
        timestamp: Date.now()
      };
      
      localStorage.setItem('quizSession', JSON.stringify(sessionData));
    }
  },
  
  loadQuizSession: () => {
    try {
      const savedSession = localStorage.getItem('quizSession');
      if (savedSession) {
        const sessionData = JSON.parse(savedSession);
        
        // Check if session is not too old (24 hours)
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours
        if (Date.now() - sessionData.timestamp < maxAge) {
          set({
            questions: sessionData.questions,
            currentQuestionIndex: sessionData.currentQuestionIndex,
            answers: sessionData.answers,
            quizSession: sessionData.quizSession
          });
          
          // Resume the quiz if it was active
          if (sessionData.quizSession?.isActive) {
            get().resumeQuiz();
          }
          
          return true;
        } else {
          // Clear old session
          localStorage.removeItem('quizSession');
        }
      }
    } catch (error) {
      console.error('Failed to load quiz session:', error);
      localStorage.removeItem('quizSession');
    }
    
    return false;
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