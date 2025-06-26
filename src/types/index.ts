import { QuizLanguage } from './languages';

export type UserData = {
  id: string;
  email: string;
  emailConfirmed: boolean;
  profile?: UserProfile;
};

export type UserProfile = {
  id: string;
  fullName: string;
  mobileNumber: string;
  countryCode: string;
  countryName: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ApiKeyData = {
  userId: string;
  geminiApiKey: string;
};

// Supported languages for quiz generation
export type QuizLanguage = 'English' | 'Hindi' | 'Malayalam' | 'Tamil' | 'Telugu' | 'Spanish' | 'French' | 'German' | 'Chinese' | 'Japanese';

// Language display information
export type LanguageInfo = {
  code: QuizLanguage;
  name: string;
  nativeName: string;
};

export type QuizPreferences = {
  course?: string;
  topic?: string;
  subtopic?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questionCount: number;
  questionTypes: QuestionType[];
  language: QuizLanguage;
  timeLimitEnabled: boolean;
  timeLimit?: string | null;  // Keep as string
  totalTimeLimit?: string | null;  // Keep as string
  negativeMarking?: boolean;
  negativeMarks?: number;
  mode: 'practice' | 'exam';
  answerMode: 'immediate' | 'end';
};


export type QuestionType = 
  | 'multiple-choice'  // Single correct answer from options
  | 'true-false'      // True/False questions
  | 'fill-blank'      // Fill in the blank
  | 'short-answer'    // 1-2 word answers
  | 'sequence'        // Arrange items in correct order
  | 'case-study'      // Analyze real-world scenarios
  | 'situation'       // Choose best action in a scenario
  | 'multi-select';   // Multiple correct options

// Base question interface with common fields
interface BaseQuestion {
  id: number;
  text: string;
  type: QuestionType;
  explanation?: string;
  difficulty: 'basic' | 'intermediate' | 'advanced';
  userAnswer?: string;
  language?: QuizLanguage;
  keywords?: string[]; // For flexible answer matching
}

// Multiple choice question
interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'multiple-choice';
  options: string[];
  correctAnswer: string;
}

// True/False question
interface TrueFalseQuestion extends BaseQuestion {
  type: 'true-false';
  options: ['True', 'False'];
  correctAnswer: 'True' | 'False';
}

// Fill in the blank question
interface FillBlankQuestion extends BaseQuestion {
  type: 'fill-blank';
  correctAnswer: string;
  keywords: string[]; // Alternative acceptable answers
}

// Short answer question
interface ShortAnswerQuestion extends BaseQuestion {
  type: 'short-answer';
  correctAnswer: string;
  keywords: string[]; // Key terms that should be present
}

// Sequence question
interface SequenceQuestion extends BaseQuestion {
  type: 'sequence';
  sequence: string[];        // Steps in random order
  correctSequence: string[]; // Steps in correct order
}

// Case study question
interface CaseStudyQuestion extends BaseQuestion {
  type: 'case-study';
  caseStudy: string;     // Detailed scenario
  question: string;      // Specific question about the case
  options: string[];     // Possible solutions
  correctAnswer: string; // Best solution
}

// Situation judgment question
interface SituationQuestion extends BaseQuestion {
  type: 'situation';
  situation: string;     // Detailed scenario
  question: string;      // Specific question about the situation
  options: string[];     // Possible actions
  correctAnswer: string; // Most appropriate action
}

// Multi-select question
interface MultiSelectQuestion extends BaseQuestion {
  type: 'multi-select';
  options: string[];        // All possible options
  correctOptions: string[]; // Array of correct options (2-3)
}

// Union type of all question types
export type Question = 
  | MultipleChoiceQuestion 
  | TrueFalseQuestion 
  | FillBlankQuestion 
  | ShortAnswerQuestion
  | SequenceQuestion 
  | CaseStudyQuestion 
  | SituationQuestion
  | MultiSelectQuestion;

  export type QuizResult = {
  totalQuestions: number;
  correctAnswers: number;
  questionsAttempted: number;
  questionsSkipped: number;
  percentage: number;
  questions: Question[];
  questionTypePerformance: Record<string, { correct: number; total: number }>;
  finalScore: number;
  rawScore: number;
  negativeMarksDeducted?: number;
  timeAnalytics?: {
    totalTime: number;
    averageTimePerQuestion: number;
  };
  strengths?: string[];
  weaknesses?: string[];
  recommendations?: string[];
};


export type QuizResultData = {
  id: string;
  quizDate: Date;
  topic: string;
  score: number;
  totalQuestions: number;
  timeTaken?: number;
};

export type FavoriteQuestion = {
  id: string;
  questionText: string;
  answer: string;
  explanation?: string;
  topic: string;
  createdAt: Date;
};

export type Country = {
  code: string;
  name: string;
  flag: string;
  dialCode: string;
};