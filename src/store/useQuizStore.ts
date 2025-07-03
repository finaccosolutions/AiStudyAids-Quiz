// src/store/useQuizStore.ts
import { create } from 'zustand';
import { ApiKeyData, Question, QuizPreferences, QuizResult } from '../types';
import { getApiKey, getQuizPreferences, saveApiKey, saveQuizPreferences, saveQuizResultToDatabase, getQuizResultsWithAnalytics, deleteQuizResult } from '../services/supabase';
import { generateQuiz, getAnswerExplanation, getQuizAnalysisAndRecommendations } from '../services/gemini';
import { useAuthStore } from './useAuthStore';

// Helper functions for local storage
const LOCAL_STORAGE_KEY = 'soloQuizState';

const saveQuizStateToLocal = (state: any) => {
  try {
    const serializedState = JSON.stringify({
      questions: state.questions,
      currentQuestionIndex: state.currentQuestionIndex,
      answers: state.answers,
      totalTimeElapsed: state.totalTimeElapsed, // Save totalTimeElapsed
      totalTimeRemaining: state.totalTimeRemaining, // Save totalTimeRemaining
    });
    localStorage.setItem(LOCAL_STORAGE_KEY, serializedState);
  } catch (e) {
    console.error("Could not save state to local storage", e);
  }
};

const loadQuizStateFromLocal = () => {
  try {
    const serializedState = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (e) {
    console.error("Could not load state from local storage", e);
    return undefined;
  }
};

const clearQuizStateFromLocal = () => {
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  } catch (e) {
    console.error("Could not clear state from local storage", e);
  }
};


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
  soloQuizHistory: any[]; // New state for solo quiz history
  totalTimeElapsed: number; // Added
  totalTimeRemaining: number | null; // Added
  
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

  // Solo Quiz History actions
  loadSoloQuizHistory: (userId: string) => Promise<void>;
  deleteSoloQuizResult: (quizResultId: string) => Promise<void>;

  // Time actions
  setTotalTimeElapsed: (time: number) => void;
  setTotalTimeRemaining: (time: number | null) => void;
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
  soloQuizHistory: [], // Initialize solo quiz history
  totalTimeElapsed: 0, // Initialize
  totalTimeRemaining: null, // Initialize
  
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
    
      // Attempt to load quiz state from local storage
      const savedState = loadQuizStateFromLocal();
      if (savedState && savedState.questions.length > 0) {
        set({
          questions: savedState.questions,
          currentQuestionIndex: savedState.currentQuestionIndex,
          answers: savedState.answers,
          result: null, // Ensure result is null if loading an ongoing quiz
          totalTimeElapsed: savedState.totalTimeElapsed || 0, // Load totalTimeElapsed
          totalTimeRemaining: savedState.totalTimeRemaining !== undefined ? savedState.totalTimeRemaining : null, // Load totalTimeRemaining
        });
      }
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
  // Fixed time limit handling - ensure only one is set at a time
  timeLimit: preferences.timeLimitEnabled && preferences.totalTimeLimit === null 
    ? preferences.timeLimit 
    : null,
  totalTimeLimit: preferences.timeLimitEnabled && preferences.timeLimit === null 
    ? preferences.totalTimeLimit 
    : null,
  negativeMarking: preferences.negativeMarking || false,
  negativeMarks: preferences.negativeMarking ? (preferences.negativeMarks || 0) : 0,
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
    clearQuizStateFromLocal(); // Clear previous state before generating a new quiz
    set({ isLoading: true, error: null, questions: [], answers: {}, result: null, totalTimeElapsed: 0, totalTimeRemaining: null });
    
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
      // Fetch historical questions to avoid repetition
      const historicalResults = await getQuizResultsWithAnalytics(userId, 200); // Increased limit to 200
      const historicalQuestions: string[] = [];
      historicalResults.forEach((result: any) => {
        if (result.questions) {
          result.questions.forEach((q: any) => {
            historicalQuestions.push(q.text);
          });
        }
      });

      const questions = await generateQuiz(apiKey, preferences, historicalQuestions);
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
    set((state) => {
      const newState = {
        answers: {
          ...state.answers,
          [questionId]: answer
        }
      };
      saveQuizStateToLocal({ ...state, ...newState }); // Save updated state
      return newState;
    });
  },
  
  nextQuestion: () => {
    set((state) => {
      if (state.currentQuestionIndex < state.questions.length - 1) {
        const newIndex = state.currentQuestionIndex + 1;
        saveQuizStateToLocal({ ...state, currentQuestionIndex: newIndex }); // Save updated state
        return { currentQuestionIndex: newIndex };
      }
      return state;
    });
  },
  
  prevQuestion: () => {
  set((state) => {
    if (state.currentQuestionIndex > 0) {
      const newIndex = state.currentQuestionIndex - 1;
      saveQuizStateToLocal({ ...state, currentQuestionIndex: newIndex }); // Corrected typo here
      return { currentQuestionIndex: newIndex };
    }
    return state;
  });
},

  
  finishQuiz: async () => {
    const { questions, answers, preferences, totalTimeElapsed, apiKey } = get();
  
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
          try {
            const userSequence = JSON.parse(userAnswer); // Parse the JSON string
            isCorrect = userSequence.length === question.correctSequence.length &&
                        userSequence.every((step: string, index: number) => step === question.correctSequence![index]);
          } catch (e) {
            console.error("Failed to parse sequence answer in finishQuiz:", e);
            isCorrect = false;
          }
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
  
  const accuracyRate = questionsAttempted > 0 ? (correctAnswers / questionsAttempted) * 100 : 0;
  const completionRate = questions.length > 0 ? (questionsAttempted / questions.length) * 100 : 0;

  const { user } = useAuthStore.getState();
  let strengths: string[] = [];
  let weaknesses: string[] = [];
  let recommendations: string[] = [];
  let comparativePerformance: any = {};

  if (user && preferences && apiKey) {
    try {
      const historicalResults = await getQuizResultsWithAnalytics(user.id, 10); // Fetch last 10 quizzes
      const analysis = await getQuizAnalysisAndRecommendations(
        apiKey,
        { // Current quiz result structure for AI
          totalQuestions: questions.length,
          correctAnswers,
          questionsAttempted,
          questionsSkipped,
          percentage: questions.length > 0 ? Math.round((finalScore / questions.length) * 100) : 0,
          questions: questionsWithAnswers,
          questionTypePerformance,
          finalScore,
          rawScore: correctAnswers,
          negativeMarksDeducted: preferences?.negativeMarking ? Math.abs((correctAnswers - finalScore) * (preferences.negativeMarks || 0)) : 0,
          totalTimeTaken: totalTimeElapsed,
          accuracyRate,
          completionRate,
          id: '', // Not needed for analysis
          course: preferences.course,
          topic: preferences.topic,
          subtopic: preferences.subtopic,
          difficulty: preferences.difficulty,
          language: preferences.language,
          timeLimitEnabled: preferences.timeLimitEnabled,
          timeLimit: preferences.timeLimit,
          totalTimeLimit: preferences.totalTimeLimit,
          negativeMarking: preferences.negativeMarking,
          negativeMarks: preferences.negativeMarks,
          mode: preferences.mode,
        },
        historicalResults,
        preferences
      );
      strengths = analysis.strengths;
      weaknesses = analysis.weaknesses;
      recommendations = analysis.recommendations;
      comparativePerformance = analysis.comparativePerformance;
    } catch (analysisError) {
      console.error("Failed to get AI analysis and recommendations:", analysisError);
      // Fallback to simple recommendations if AI analysis fails
      if (accuracyRate >= 80) {
        strengths.push('Strong understanding of the topics.');
        recommendations.push('Continue challenging yourself with advanced questions.');
      } else if (accuracyRate >= 60) {
        strengths.push('Good foundational knowledge.');
        recommendations.push('Review incorrect answers and focus on understanding concepts.');
      } else {
        weaknesses.push('Needs improvement in core concepts.');
        recommendations.push('Revisit study materials and practice more fundamental questions.');
      }
    }
  } else {
    // Simple rule-based recommendations if no user/preferences/apiKey
    if (accuracyRate >= 80) {
      strengths.push('Strong understanding of the topics.');
      recommendations.push('Continue challenging yourself with advanced questions.');
    } else if (accuracyRate >= 60) {
      strengths.push('Good foundational knowledge.');
      recommendations.push('Review incorrect answers and focus on understanding concepts.');
    } else {
      weaknesses.push('Needs improvement in core concepts.');
      recommendations.push('Revisit study materials and practice more fundamental questions.');
    }
  }

  const result: QuizResult = {
    id: '', // Temporary ID, will be updated after saving to DB
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
    totalTimeTaken: totalTimeElapsed, // Added
    accuracyRate, // Added
    completionRate, // Added
    strengths, // Added
    weaknesses, // Added
    recommendations, // Added
    comparativePerformance, // Added

    // Add quiz preferences directly to the result
    course: preferences?.course,
    topic: preferences?.topic,
    subtopic: preferences?.subtopic,
    difficulty: preferences?.difficulty,
    language: preferences?.language,
    timeLimitEnabled: preferences?.timeLimitEnabled,
    timeLimit: preferences?.timeLimit,
    totalTimeLimit: preferences?.totalTimeLimit,
    negativeMarking: preferences?.negativeMarking,
    negativeMarks: preferences?.negativeMarks,
    mode: preferences?.mode,
  };
  
  console.log('Quiz result created:', result);
  
  // Save to database
  if (user && preferences) {
    saveQuizResultToDatabase(user.id, result, preferences)
      .then(data => {
        if (data?.id) {
          set({ result: { ...result, id: data.id } }); // Update result with ID from DB
        } else {
          set({ result }); // Set result without ID if save failed
        }
      })
      .catch(console.error);
  } else {
    set({ result }); // Set result without ID if user or preferences are missing
  }

  // Clear questions to prevent re-generation and reset state
  set({ 
    currentQuestionIndex: 0, // Reset question index
    totalTimeElapsed: 0, // Reset total time elapsed
    totalTimeRemaining: null, // Reset total time remaining
    questions: [], // Clear questions
    answers: {}, // Clear answers
  });
  clearQuizStateFromLocal();
},


  
  resetQuiz: () => {
    set({
      questions: [],
      currentQuestionIndex: 0,
      answers: {},
      result: null,
      error: null,
      totalTimeElapsed: 0, // Reset total time elapsed
      totalTimeRemaining: null, // Reset total time remaining
    });
    clearQuizStateFromLocal(); // Clear local storage state
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
  },

  // Solo Quiz History actions
  loadSoloQuizHistory: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const history = await getQuizResultsWithAnalytics(userId);
      set({ soloQuizHistory: history.map((item: any) => ({
        ...item,
       id: item.id, // Ensure ID is mapped
       totalQuestions: Number(item.total_questions || 0),
        correctAnswers: Number(item.questions_correct || 0),
        questionsAttempted: Number(item.questions_attempted || 0),
        questionsSkipped: Number(item.questions_skipped || 0),
        percentage: parseFloat(item.percentage_score || 0),
        finalScore: parseFloat(item.final_score || 0),
        rawScore: parseFloat(item.raw_score || 0),
        negativeMarksDeducted: parseFloat(item.negative_marks_deducted || 0),
        totalTimeTaken: Number(item.total_time_taken || 0),
        accuracyRate: parseFloat(item.accuracy_rate || 0), // Added
        completionRate: parseFloat(item.completion_rate || 0), // Added
        strengths: item.strengths || [], // Added
        weaknesses: item.weaknesses || [], // Added
        recommendations: item.recommendations || [], // Added
        comparativePerformance: item.comparative_performance || {}, // Added
        questionTypePerformance: item.question_type_performance || {},
        questions: item.question_details || [], // Already mapped in supabase.ts, but ensure default
        quizDate: item.quiz_date ? new Date(item.quiz_date) : null,
        // Ensure other fields from QuizResult type are mapped if needed
        // For example, if you use 'topic' directly from the result object:
        topic: item.topic,
      })) });
    } catch (error: any) {
      set({ error: error.message || 'Failed to load solo quiz result' });
    } finally {
      set({ isLoading: false });
    }
  },

  deleteSoloQuizResult: async (quizResultId) => {
    set({ isLoading: true, error: null });
    try {
      await deleteQuizResult(quizResultId);
      set((state) => ({
        soloQuizHistory: state.soloQuizHistory.filter((result) => result.id !== quizResultId),
      }));
    } catch (error: any) {
      set({ error: error.message || 'Failed to delete solo quiz result' });
    } finally {
      set({ isLoading: false });
    }
  },

  setTotalTimeElapsed: (time) => set({ totalTimeElapsed: time }),
  setTotalTimeRemaining: (time) => set({ totalTimeRemaining: time }),
}));