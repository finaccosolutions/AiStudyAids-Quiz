import { create } from 'zustand';
import { ApiKeyData, Question, QuizPreferences, QuizResult } from '../types';
import { getApiKey, getQuizPreferences, saveApiKey, saveQuizPreferences } from '../services/supabase';
import { generateQuiz, getAnswerExplanation } from '../services/gemini';

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
  
  // Explanation
  getExplanation: (questionId: number) => Promise<void>;
  resetExplanation: () => void;
}

export const defaultPreferences: QuizPreferences = {
  course: '',
  topic: '',
  subtopic: null,
  questionCount: 5,
  questionTypes: ['multiple-choice'],
  language: 'en',
  difficulty: 'medium',
  timeLimit: 'none',
  customTimeLimit: null,
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
      
      // Handle custom time limit
      if (preferences.timeLimit === 'custom' && (!preferences.customTimeLimit || preferences.customTimeLimit < 1)) {
        preferences.customTimeLimit = 30; // Default to 30 seconds if invalid
      }
      
      await saveQuizPreferences(userId, preferences);
      set({ preferences });
    } catch (error: any) {
      set({ error: error.message || 'Failed to save preferences' });
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
      });
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
  },
  
  nextQuestion: () => {
    set((state) => {
      if (state.currentQuestionIndex < state.questions.length - 1) {
        return { currentQuestionIndex: state.currentQuestionIndex + 1 };
      }
      return state;
    });
  },
  
  prevQuestion: () => {
    set((state) => {
      if (state.currentQuestionIndex > 0) {
        return { currentQuestionIndex: state.currentQuestionIndex - 1 };
      }
      return state;
    });
  },
  
  finishQuiz: () => {
    const { questions, answers } = get();
    
    let correctAnswers = 0;
    
    const questionsWithAnswers = questions.map(question => {
      const userAnswer = answers[question.id];
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
            // Check exact match or keyword match
            const userLower = userAnswer.toLowerCase().trim();
            const correctLower = question.correctAnswer.toLowerCase().trim();
            isCorrect = userLower === correctLower;
            
            // If not exact match, check keywords
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
      }
      
      return {
        ...question,
        userAnswer,
        isCorrect
      };
    });
    
    const result: QuizResult = {
      totalQuestions: questions.length,
      correctAnswers,
      percentage: questions.length > 0 ? Math.round((correctAnswers / questions.length) * 100) : 0,
      questions: questionsWithAnswers
    };
    
    set({ result });
  },
  
  resetQuiz: () => {
    set({
      questions: [],
      currentQuestionIndex: 0,
      answers: {},
      result: null,
      error: null
    });
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