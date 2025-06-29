import React, { useState, useEffect } from 'react';
import { useQuizStore } from '../../store/useQuizStore';
import { useCompetitionStore } from '../../store/useCompetitionStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardBody, CardHeader } from '../ui/Card';
import { QuizPreferences, QuestionType } from '../../types';
import { 
  Brain, Users, Clock, Globe, Target, Zap, 
  BookOpen, GraduationCap, Settings, Play,
  ChevronRight, Star, Trophy, Timer, Award,
  Sparkles, CheckCircle, AlertCircle, Crown,
  Rocket, Shield, Activity, TrendingUp,
  ChevronDown, Search, ChevronUp, Infinity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface QuizPreferencesFormProps {
  userId: string;
  initialPreferences: QuizPreferences;
  onSave?: () => void; // For solo quiz
  onStartCompetition?: (preferences: QuizPreferences, title: string, description: string) => void; // For competition
}

const QuizPreferencesForm: React.FC<QuizPreferencesFormProps> = ({
  userId,
  initialPreferences,
  onSave,
  onStartCompetition,
}) => {
  const { savePreferences, isLoading, error } = useQuizStore();
  const { createCompetition } = useCompetitionStore();
  const [preferences, setPreferences] = useState<QuizPreferences>(initialPreferences);
  const [competitionTitle, setCompetitionTitle] = useState('');
  const [competitionDescription, setCompetitionDescription] = useState('');
  const [competitionData, setCompetitionData] = useState({
    title: '',
    description: '',
    emails: [] as string[],
    emailInput: ''
  });
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isCreatingCompetition, setIsCreatingCompetition] = useState(false);
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false);
  const [languageSearch, setLanguageSearch] = useState('');
  const [timeInputMode, setTimeInputMode] = useState<'perQuestion' | 'totalTime'>('perQuestion');

  const isCompetitionMode = !!onStartCompetition;

  useEffect(() => {
    setPreferences(initialPreferences);
  }, [initialPreferences]);

  const difficultyOptions = [
    { 
      value: 'easy', 
      label: 'Easy', 
      description: 'Perfect for beginners',
      icon: '🌱',
      color: 'from-green-400 to-emerald-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-700'
    },
    { 
      value: 'medium', 
      label: 'Medium', 
      description: 'Balanced challenge',
      icon: '🔥',
      color: 'from-yellow-400 to-orange-500',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-700'
    },
    { 
      value: 'hard', 
      label: 'Hard', 
      description: 'For experts only',
      icon: '⚡',
      color: 'from-red-400 to-pink-500',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      textColor: 'text-red-700'
    }
  ];

  const languageOptions = [
    { value: 'English', label: 'English', flag: '🇺🇸' },
    { value: 'Hindi', label: 'Hindi', flag: '🇮🇳' },
    { value: 'Spanish', label: 'Spanish', flag: '🇪🇸' },
    { value: 'French', label: 'French', flag: '🇫🇷' },
    { value: 'German', label: 'German', flag: '🇩🇪' },
    { value: 'Chinese', label: 'Chinese', flag: '🇨🇳' },
    { value: 'Japanese', label: 'Japanese', flag: '🇯🇵' },
    { value: 'Russian', label: 'Russian', flag: '🇷🇺' },
    { value: 'Portuguese', label: 'Portuguese', flag: '🇵🇹' },
    { value: 'Arabic', label: 'Arabic', flag: '🇸🇦' },
    { value: 'Malayalam', label: 'Malayalam', flag: '🇮🇳' },
    { value: 'Tamil', label: 'Tamil', flag: '🇮🇳' },
    { value: 'Telugu', label: 'Telugu', flag: '🇮🇳' },
    { value: 'Bengali', label: 'Bengali', flag: '🇮🇳' },
    { value: 'Korean', label: 'Korean', flag: '🇰🇷' },
    { value: 'Italian', label: 'Italian', flag: '🇮🇹' }
  ];

  const filteredLanguages = languageOptions.filter(lang => 
    lang.label.toLowerCase().includes(languageSearch.toLowerCase())
  );

  const questionTypeOptions = [
    { 
      value: 'multiple-choice', 
      label: 'Multiple Choice', 
      description: 'Choose from 4 options',
      icon: CheckCircle,
      color: 'from-blue-500 to-indigo-500'
    },
    { 
      value: 'true-false', 
      label: 'True/False', 
      description: 'Simple yes or no',
      icon: Target,
      color: 'from-purple-500 to-pink-500'
    },
    { 
      value: 'short-answer', 
      label: 'Short Answer', 
      description: '1-2 word responses',
      icon: Brain,
      color: 'from-green-500 to-teal-500'
    },
    { 
      value: 'fill-blank', 
      label: 'Fill Blanks', 
      description: 'Complete the sentence',
      icon: Zap,
      color: 'from-orange-500 to-red-500'
    },
    { 
      value: 'multi-select', 
      label: 'Multi-Select', 
      description: 'Choose multiple answers',
      icon: Star,
      color: 'from-cyan-500 to-blue-500'
    },
    { 
      value: 'sequence', 
      label: 'Sequence', 
      description: 'Arrange in order',
      icon: Activity,
      color: 'from-indigo-500 to-purple-500'
    },
    { 
      value: 'case-study', 
      label: 'Case Study', 
      description: 'Analyze scenarios',
      icon: BookOpen,
      color: 'from-emerald-500 to-green-500'
    },
    { 
      value: 'situation', 
      label: 'Situation', 
      description: 'Problem solving',
      icon: Shield,
      color: 'from-rose-500 to-pink-500'
    }
  ];

  const modeOptions = [
    {
      value: 'practice',
      label: 'Practice Mode',
      description: 'Learn with instant feedback',
      icon: BookOpen,
      color: 'from-blue-500 to-indigo-500',
      features: ['Instant explanations', 'No time pressure', 'Learning focused']
    },
    {
      value: 'exam',
      label: 'Exam Mode',
      description: 'Test your knowledge',
      icon: Trophy,
      color: 'from-purple-500 to-pink-500',
      features: ['Timed challenges', 'Final results', 'Performance focused']
    }
  ];

  const finalPreferences = {
  ...preferences,
  // Force exam mode for competitions
  mode: onStartCompetition ? 'exam' : preferences.mode,
  answerMode: onStartCompetition ? 'end' : preferences.answerMode
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // 1. Validate required fields
  if (isCompetitionMode && !competitionData.title?.trim()) {
    alert("Please enter a competition title");
    return;
  }

  try {
    // 2. Save quiz preferences
    await savePreferences(userId, finalPreferences);

    if (isCompetitionMode && onStartCompetition) {
      setIsCreatingCompetition(true);

      // 3. Prepare competition data with guaranteed non-null title
      const competitionPayload = {
        preferences: finalPreferences,
        userId,
        title: competitionData.title.trim() || `${preferences.course} Quiz Challenge`,
        description: competitionData.description.trim() || `Test your knowledge in ${preferences.course}`,
        type: 'private' as const,
        emails: competitionData.emails
      };

      console.log("Creating competition with:", competitionPayload);

      // 4. Create competition - ensure this matches your Supabase table structure
      await onStartCompetition(
        finalPreferences,
        competitionPayload.title,
        competitionPayload.description
      );
    } else if (onSave) {
      await onSave();
    }
  } catch (error) {
    console.error('Submission failed:', error);
  } finally {
    setIsCreatingCompetition(false);
  }
};

  const handleQuestionTypeToggle = (type: string) => {
    setPreferences(prev => ({
      ...prev,
      questionTypes: prev.questionTypes.includes(type)
        ? prev.questionTypes.filter(t => t !== type)
        : [...prev.questionTypes, type]
    }));
  };

  const addEmail = () => {
    const email = competitionData.emailInput.trim();
    if (email && !competitionData.emails.includes(email)) {
      setCompetitionData(prev => ({
        ...prev,
        emails: [...prev.emails, email],
        emailInput: ''
      }));
    }
  };

  const removeEmail = (email: string) => {
    setCompetitionData(prev => ({
      ...prev,
      emails: prev.emails.filter(e => e !== email)
    }));
  };

  const selectLanguage = (language: string) => {
    setPreferences(prev => ({ ...prev, language }));
    setLanguageDropdownOpen(false);
    setLanguageSearch('');
  };

const handleTimeInputChange = (value: number, type: 'perQuestion' | 'totalTime') => {
  if (type === 'perQuestion') {
    setPreferences(prev => ({
      ...prev,
      timeLimit: value.toString(),
      totalTimeLimit: (value * prev.questionCount).toString()
    }));
  } else {
    setPreferences(prev => ({
      ...prev,
      totalTimeLimit: value.toString(),
      timeLimit: (Math.round(value / prev.questionCount)).toString()
    }));
  } 
}; 
 
const calculateTimeValue = () => {
  if (preferences.timeLimit === '0') return 0;
  
  if (timeInputMode === 'perQuestion') {
    return preferences.timeLimit ? parseInt(preferences.timeLimit) : 30;
  } else {
    return preferences.totalTimeLimit ? parseInt(preferences.totalTimeLimit) : 300;
  }
};

const incrementTime = () => {
  const currentValue = calculateTimeValue();
  handleTimeInputChange(
    currentValue + (timeInputMode === 'perQuestion' ? 5 : 30), 
    timeInputMode
  );
};

const decrementTime = () => {
  const currentValue = calculateTimeValue();
  if (currentValue > (timeInputMode === 'perQuestion' ? 5 : 30)) {
    handleTimeInputChange(
      currentValue - (timeInputMode === 'perQuestion' ? 5 : 30), 
      timeInputMode
    );
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-4 sm:py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 sm:mb-12"
        >
          <div className="flex flex-col sm:flex-row items-center justify-center mb-4 sm:mb-6">
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="relative w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-3xl flex items-center justify-center sm:mr-6 shadow-2xl mb-4 sm:mb-0"
            >
              {isCompetitionMode ? <Crown className="w-8 h-8 sm:w-10 sm:h-10 text-white" /> : <Settings className="w-8 h-8 sm:w-10 sm:h-10 text-white" />}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/50 to-indigo-400/50 rounded-3xl blur-xl animate-pulse" />
            </motion.div>
            <div>
              <h1 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-slate-800 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                {isCompetitionMode ? 'Create Competition' : 'Quiz Preferences'}
              </h1>
              <p className="text-lg sm:text-xl text-slate-600">
                {isCompetitionMode ? 'Set up your quiz competition' : 'Customize your learning experience'}
              </p>
            </div>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          {/* Competition Details (only for competition mode) */}
          
          {isCompetitionMode && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="shadow-2xl border-2 border-purple-100 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center">
                    <Trophy className="w-6 h-6 sm:w-7 sm:h-7 mr-2 sm:mr-3 text-purple-600" />
                    Competition Details
                  </h3>
                </CardHeader>
                <CardBody className="p-4 sm:p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                    <div className="space-y-4 sm:space-y-6">
                      <div>
                        <label className="block text-base sm:text-lg font-semibold text-slate-700 mb-2 sm:mb-3">
                          Competition Title
                        </label>
                        <div className="relative group">
                          <Input 
                            type="text"
                            value={competitionData.title}
                            onChange={(e) => setCompetitionData(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Enter competition title"
                            className="w-full py-3 sm:py-4 text-base sm:text-lg rounded-xl border-2 border-slate-200 focus:border-purple-500 transition-all duration-300 pl-10 sm:pl-12 group-hover:shadow-lg"
                          />
                          <div className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-purple-500">
                            <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />
                          </div>
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-base sm:text-lg font-semibold text-slate-700 mb-2 sm:mb-3">
                          Description
                        </label>
                        <div className="relative group">
                          <textarea
                            value={competitionData.description}
                            onChange={(e) => setCompetitionData(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Describe your competition"
                            rows={4}
                            className="w-full py-3 sm:py-4 px-10 sm:px-12 text-base sm:text-lg rounded-xl border-2 border-slate-200 focus:border-purple-500 focus:outline-none transition-all duration-300 resize-none group-hover:shadow-lg"
                          />
                          <div className="absolute left-3 sm:left-4 top-3 sm:top-4 text-purple-500">
                            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
                          </div>
                          <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-base sm:text-lg font-semibold text-slate-700 mb-2 sm:mb-3">
                        Invite Participants (Optional)
                      </label>
                      <div className="space-y-3 sm:space-y-4">
                        <div className="flex space-x-2 sm:space-x-3">
                          <div className="relative group flex-1">
                            <Input
                              type="email"
                              value={competitionData.emailInput}
                              onChange={(e) => setCompetitionData(prev => ({ ...prev, emailInput: e.target.value }))}
                              placeholder="Enter email address"
                              className="w-full py-3 sm:py-4 text-base sm:text-lg rounded-xl border-2 border-slate-200 focus:border-purple-500 pl-10 sm:pl-12 group-hover:shadow-lg"
                              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addEmail())}
                            />
                            <div className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-purple-500">
                              <Users className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                          </div>
                          <Button
                            type="button"
                            onClick={addEmail}
                            className="px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 text-sm sm:text-base"
                          >
                            Add
                          </Button>
                        </div>
                        
                        {competitionData.emails.length > 0 && (
                          <div className="space-y-1 sm:space-y-2">
                            <p className="text-xs sm:text-sm font-medium text-slate-600">Invited participants:</p>
                            <div className="flex flex-wrap gap-1 sm:gap-2">
                              {competitionData.emails.map((email) => (
                                <motion.div
                                  key={email}
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className="flex items-center bg-purple-100 text-purple-700 px-2 sm:px-3 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-medium shadow-sm"
                                >
                                  {email}
                                  <button
                                    type="button"
                                    onClick={() => removeEmail(email)}
                                    className="ml-1 sm:ml-2 text-purple-500 hover:text-purple-700 text-xs sm:text-sm"
                                  >
                                    ×
                                  </button>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          )}

          {/* Course and Topic */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="shadow-2xl border-2 border-blue-100 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center">
                  <GraduationCap className="w-6 h-6 sm:w-7 sm:h-7 mr-2 sm:mr-3 text-blue-600" />
                  Subject & Topic
                </h3>
              </CardHeader>
              <CardBody className="p-4 sm:p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
                  <div>
                    <label className="block text-base sm:text-lg font-semibold text-slate-700 mb-2 sm:mb-3">
                      Course/Subject *
                    </label>
                    <div className="relative group">
                      <Input
                        type="text"
                        value={preferences.course}
                        onChange={(e) => setPreferences(prev => ({ ...prev, course: e.target.value }))}
                        placeholder="e.g., Computer Science"
                        required
                        className="w-full py-3 sm:py-4 text-base sm:text-lg rounded-xl border-2 border-slate-200 focus:border-blue-500 transition-all duration-300 pl-10 sm:pl-12 group-hover:shadow-lg"
                      />
                      <div className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-blue-500">
                        <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-base sm:text-lg font-semibold text-slate-700 mb-2 sm:mb-3">
                      Topic (Optional)
                    </label>
                    <div className="relative group">
                      <Input
                        type="text"
                        value={preferences.topic}
                        onChange={(e) => setPreferences(prev => ({ ...prev, topic: e.target.value }))}
                        placeholder="e.g., Data Structures"
                        className="w-full py-3 sm:py-4 text-base sm:text-lg rounded-xl border-2 border-slate-200 focus:border-blue-500 transition-all duration-300 pl-10 sm:pl-12 group-hover:shadow-lg"
                      />
                      <div className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-blue-500">
                        <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-base sm:text-lg font-semibold text-slate-700 mb-2 sm:mb-3">
                      Subtopic (Optional)
                    </label>
                    <div className="relative group">
                      <Input
                        type="text"
                        value={preferences.subtopic}
                        onChange={(e) => setPreferences(prev => ({ ...prev, subtopic: e.target.value }))}
                        placeholder="e.g., Binary Trees"
                        className="w-full py-3 sm:py-4 text-base sm:text-lg rounded-xl border-2 border-slate-200 focus:border-blue-500 transition-all duration-300 pl-10 sm:pl-12 group-hover:shadow-lg"
                      />
                      <div className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-blue-500">
                        <Brain className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>

          {/* Quiz Configuration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="shadow-2xl border-2 border-green-100 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center">
                  <Target className="w-6 h-6 sm:w-7 sm:h-7 mr-2 sm:mr-3 text-green-600" />
                  Quiz Configuration
                </h3>
              </CardHeader>
              <CardBody className="p-4 sm:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                  {/* Question Count and Difficulty */}
                  <div className="space-y-6 sm:space-y-8">
                    <div>
                      <label className="block text-base sm:text-lg font-semibold text-slate-700 mb-3 sm:mb-4">
                        Number of Questions
                      </label>
                      <div className="relative group">
                        <Input
                          type="number"
                          min="1"
                          max="50"
                          value={preferences.questionCount}
                          onChange={(e) => setPreferences(prev => ({ 
                            ...prev, 
                            questionCount: Math.max(1, Math.min(50, parseInt(e.target.value) || 1))
                          }))}
                          className="w-full py-3 sm:py-4 text-base sm:text-lg rounded-xl border-2 border-slate-200 focus:border-green-500 transition-all duration-300 pl-10 sm:pl-12 group-hover:shadow-lg"
                        />
                        <div className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-green-500">
                          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
                        </div>
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-500/5 to-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                      </div>
                      <p className="text-xs sm:text-sm text-slate-500 mt-2">Choose between 1-50 questions</p>
                    </div>

                    <div>
                      <label className="block text-base sm:text-lg font-semibold text-slate-700 mb-3 sm:mb-4">
                        Difficulty Level
                      </label>
                      <div className="grid grid-cols-3 gap-2 sm:gap-3">
                        {difficultyOptions.map((option) => (
                          <motion.button
                            key={option.value}
                            type="button"
                            onClick={() => setPreferences(prev => ({ ...prev, difficulty: option.value as any }))}
                            className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 text-left ${
                              preferences.difficulty === option.value
                                ? `${option.borderColor} ${option.bgColor} shadow-lg scale-[1.02] ring-2 sm:ring-4 ring-opacity-20`
                                : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md hover:scale-[1.01]'
                            }`}
                            whileHover={{ scale: preferences.difficulty === option.value ? 1.02 : 1.01 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="flex flex-col sm:flex-row items-center sm:items-start sm:space-x-2 space-y-1 sm:space-y-0">
                              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-xl sm:text-2xl ${
                                preferences.difficulty === option.value 
                                  ? `bg-gradient-to-r ${option.color} text-white shadow-md sm:shadow-lg`
                                  : 'bg-slate-100 text-slate-600'
                              }`}>
                                {option.icon}
                              </div>
                              <div className="flex-1 text-center sm:text-left">
                                <h4 className={`text-sm sm:text-base font-bold ${
                                  preferences.difficulty === option.value ? option.textColor : 'text-slate-800'
                                }`}>
                                  {option.label}
                                </h4>
                                <p className="text-xs sm:text-sm text-slate-600 mt-0 sm:mt-1">{option.description}</p>
                              </div>
                              {preferences.difficulty === option.value && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                  className="hidden sm:block"
                                >
                                  <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
                                </motion.div>
                              )}
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Language Selection */}
                  <div className="space-y-6 sm:space-y-8">
                    <div>
                      <label className="block text-base sm:text-lg font-semibold text-slate-700 mb-3 sm:mb-4">
                        Language
                      </label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setLanguageDropdownOpen(!languageDropdownOpen)}
                          className={`w-full p-3 sm:p-4 rounded-xl border-2 transition-all duration-300 text-left flex items-center justify-between ${
                            languageDropdownOpen
                              ? 'border-blue-500 bg-blue-50 shadow-lg'
                              : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
                          }`}
                        >
                          <div className="flex items-center">
                            {preferences.language ? (
                              <>
                                <span className="text-xl sm:text-2xl mr-2 sm:mr-3">
                                  {languageOptions.find(lang => lang.value === preferences.language)?.flag}
                                </span>
                                <span className="text-sm sm:text-base font-semibold text-slate-800">
                                  {languageOptions.find(lang => lang.value === preferences.language)?.label}
                                </span>
                              </>
                            ) : (
                              <span className="text-sm sm:text-base text-slate-500">Select a language</span>
                            )}
                          </div>
                          <ChevronDown className={`w-4 h-4 sm:w-5 sm:h-5 text-slate-500 transition-transform duration-300 ${
                            languageDropdownOpen ? 'transform rotate-180' : ''
                          }`} />
                        </button>

                        <AnimatePresence>
                          {languageDropdownOpen && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.2 }}
                              className="absolute z-10 mt-1 sm:mt-2 w-full bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden"
                            >
                              <div className="p-2 sm:p-3 border-b border-slate-200 bg-slate-50">
                                <div className="relative">
                                  <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                                  <input
                                    type="text"
                                    value={languageSearch}
                                    onChange={(e) => setLanguageSearch(e.target.value)}
                                    placeholder="Search languages..."
                                    className="w-full pl-8 sm:pl-10 pr-3 sm:pr-4 py-1 sm:py-2 text-sm sm:text-base rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                </div>
                              </div>
                              <div className="max-h-48 sm:max-h-60 overflow-y-auto">
                                {filteredLanguages.length > 0 ? (
                                  filteredLanguages.map((option) => (
                                    <button
                                      key={option.value}
                                      type="button"
                                      onClick={() => selectLanguage(option.value)}
                                      className={`w-full px-3 sm:px-4 py-2 sm:py-3 text-left flex items-center hover:bg-blue-50 transition-colors duration-200 ${
                                        preferences.language === option.value ? 'bg-blue-100' : ''
                                      }`}
                                    >
                                      <span className="text-xl sm:text-2xl mr-2 sm:mr-3">{option.flag}</span>
                                      <span className="text-sm sm:text-base text-slate-800 font-medium">{option.label}</span>
                                      {preferences.language === option.value && (
                                        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 ml-auto" />
                                      )}
                                    </button>
                                  ))
                                ) : (
                                  <div className="px-3 sm:px-4 py-2 sm:py-3 text-slate-500 text-center text-sm sm:text-base">
                                    No languages found
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>

 {/* Time Settings */}
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.6 }}
  className="space-y-4"
>
  <h3 className="text-lg font-semibold text-gray-800 flex items-center">
    <Clock className="w-5 h-5 mr-2 text-orange-600" />
    Time Settings
  </h3>
  
  <div className="space-y-4">
    {/* Time Limit Toggle */}
    <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-200">
      <div>
        <label className="text-base font-medium text-gray-800">Enable Time Limit</label>
        <p className="text-sm text-gray-600">Set time constraints for the quiz</p>
      </div>
      <motion.button
        type="button"
        onClick={() => setPreferences(prev => ({ 
          ...prev, 
          timeLimitEnabled: !prev.timeLimitEnabled,
          timeLimit: null,
          totalTimeLimit: null
        }))}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          preferences.timeLimitEnabled ? 'bg-orange-600' : 'bg-gray-300'
        }`}
        whileTap={{ scale: 0.95 }}
      >
        <motion.span
          className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
          animate={{ x: preferences.timeLimitEnabled ? 24 : 4 }}
        />
      </motion.button>
    </div>

    {/* Time Limit Options */}
    {preferences.timeLimitEnabled && (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="space-y-4"
      >
        {/* Time Limit Type Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <motion.button
            type="button"
            onClick={() => setPreferences(prev => ({ 
              ...prev, 
              timeLimit: prev.timeLimit || '30',
              totalTimeLimit: null
            }))}
            className={`p-3 rounded-lg border-2 transition-all duration-300 ${
              preferences.timeLimit && !preferences.totalTimeLimit
                ? 'border-orange-500 bg-orange-50 text-orange-700'
                : 'border-gray-200 hover:border-orange-300 text-gray-700'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Timer className="w-5 h-5 mx-auto mb-2" />
            <div className="text-sm font-medium">Per Question</div>
          </motion.button>
          
          <motion.button
            type="button"
            onClick={() => setPreferences(prev => ({ 
              ...prev, 
              timeLimit: null,
              totalTimeLimit: prev.totalTimeLimit || '300'
            }))}
            className={`p-3 rounded-lg border-2 transition-all duration-300 ${
              preferences.totalTimeLimit && !preferences.timeLimit
                ? 'border-orange-500 bg-orange-50 text-orange-700'
                : 'border-gray-200 hover:border-orange-300 text-gray-700'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Clock className="w-5 h-5 mx-auto mb-2" />
            <div className="text-sm font-medium">Total Time</div>
          </motion.button>
          
          <motion.button
            type="button"
            onClick={() => setPreferences(prev => ({ 
              ...prev, 
              timeLimit: null,
              totalTimeLimit: null
            }))}
            className={`p-3 rounded-lg border-2 transition-all duration-300 ${
              !preferences.timeLimit && !preferences.totalTimeLimit
                ? 'border-orange-500 bg-orange-50 text-orange-700'
                : 'border-gray-200 hover:border-orange-300 text-gray-700'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Infinity className="w-5 h-5 mx-auto mb-2" />
            <div className="text-sm font-medium">No Limit</div>
          </motion.button>
        </div>

        {/* Time Input Fields */}
        {preferences.timeLimit && !preferences.totalTimeLimit && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-3"
          >
            <label className="text-sm font-medium text-gray-700 min-w-0 flex-shrink-0">
              Seconds per question:
            </label>
            <input
              type="number"
              min="10"
              max="300"
              value={preferences.timeLimit || '30'}
              onChange={(e) => setPreferences(prev => ({ 
                ...prev, 
                timeLimit: e.target.value 
              }))}
              className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
            <span className="text-sm text-gray-500">seconds</span>
          </motion.div>
        )}

        {preferences.totalTimeLimit && !preferences.timeLimit && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-3"
          >
            <label className="text-sm font-medium text-gray-700 min-w-0 flex-shrink-0">
              Total quiz time:
            </label>
            <input
              type="number"
              min="60"
              max="3600"
              value={preferences.totalTimeLimit || '300'}
              onChange={(e) => setPreferences(prev => ({ 
                ...prev, 
                totalTimeLimit: e.target.value 
              }))}
              className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
            <span className="text-sm text-gray-500">seconds</span>
          </motion.div>
        )}
      </motion.div>
    )}
  </div>
</motion.div>


                  </div> 
                </div>
              </CardBody>
            </Card>
          </motion.div>

          {/* Question Types */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="shadow-2xl border-2 border-purple-100 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center">
                  <Star className="w-6 h-6 sm:w-7 sm:h-7 mr-2 sm:mr-3 text-purple-600" />
                  Question Types
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 sm:mt-2">Select at least one question type</p>
              </CardHeader>
              <CardBody className="p-4 sm:p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                  {questionTypeOptions.map((option) => {
                    const isSelected = preferences.questionTypes.includes(option.value);
                    return (
                      <motion.button
                        key={option.value}
                        type="button"
                        onClick={() => handleQuestionTypeToggle(option.value)}
                        className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 transition-all duration-300 text-left relative overflow-hidden ${
                          isSelected
                            ? 'border-purple-500 bg-purple-50 shadow-xl scale-[1.02] ring-2 sm:ring-4 ring-purple-200'
                            : 'border-slate-200 bg-white hover:border-purple-300 hover:shadow-lg hover:scale-[1.01]'
                        }`}
                        whileHover={{ scale: isSelected ? 1.02 : 1.01 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-400/5 to-indigo-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="relative z-10">
                          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center mb-3 sm:mb-4 ${
                            isSelected 
                              ? `bg-gradient-to-r ${option.color} text-white shadow-md sm:shadow-lg`
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            <option.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                          </div>
                          <h4 className={`text-sm sm:text-base font-bold mb-1 sm:mb-2 ${
                            isSelected ? 'text-purple-700' : 'text-slate-800'
                          }`}>
                            {option.label}
                          </h4>
                          <p className="text-xs sm:text-sm text-slate-600">{option.description}</p>
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                              className="absolute top-2 sm:top-4 right-2 sm:right-4"
                            >
                              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
                            </motion.div>
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
                {preferences.questionTypes.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 sm:mt-6 p-3 sm:p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-center shadow-sm"
                  >
                    <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500 mr-2 sm:mr-3 flex-shrink-0" />
                    <p className="text-xs sm:text-sm text-orange-700 font-medium">Please select at least one question type</p>
                  </motion.div>
                )}
              </CardBody>
            </Card>
          </motion.div>

          {/* Quiz Mode */}
  {!onStartCompetition && (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.7 }}
    className="space-y-4"
  >
    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
      <Target className="w-5 h-5 mr-2 text-purple-600" />
      Quiz Mode
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[
        {
          value: 'practice',
          label: 'Practice Mode',
          description: 'Get instant feedback after each question',
          icon: BookOpen,
          color: 'from-green-500 to-emerald-500'
        },
        {
          value: 'exam',
          label: 'Exam Mode',
          description: 'See results only at the end',
          icon: Award,
          color: 'from-red-500 to-pink-500'
        }
      ].map((mode) => (
        <motion.button
          key={mode.value}
          type="button"
          onClick={() => setPreferences(prev => ({ 
            ...prev, 
            mode: mode.value as 'practice' | 'exam',
            answerMode: mode.value === 'practice' ? 'immediate' : 'end'
          }))}
          className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
            preferences.mode === mode.value
              ? 'border-purple-500 bg-purple-50 shadow-lg'
              : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center space-x-3 mb-3">
            <div className={`w-10 h-10 bg-gradient-to-r ${mode.color} rounded-lg flex items-center justify-center`}>
              <mode.icon className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-gray-800">{mode.label}</span>
          </div>
          <p className="text-sm text-gray-600">{mode.description}</p>
        </motion.button>
      ))}
    </div>
  </motion.div>
)}

          {/* Scoring Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="shadow-2xl border-2 border-red-100 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-800 flex items-center">
                  <Award className="w-6 h-6 sm:w-7 sm:h-7 mr-2 sm:mr-3 text-red-600" />
                  Scoring Settings
                </h3>
              </CardHeader>
              <CardBody className="p-4 sm:p-8">
                <div className="space-y-6 sm:space-y-8">
                  <div className="flex items-center justify-between p-4 sm:p-6 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl sm:rounded-2xl border border-red-200 shadow-sm">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-lg sm:rounded-xl flex items-center justify-center shadow-md">
                        <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-base sm:text-lg font-bold text-slate-800">Negative Marking</h4>
                        <p className="text-xs sm:text-sm text-slate-600">Deduct points for wrong answers</p>
                      </div>
                    </div>
                    <motion.button
                      type="button"
                      onClick={() => setPreferences(prev => ({ ...prev, negativeMarking: !prev.negativeMarking }))}
                      className={`relative w-12 sm:w-16 h-6 sm:h-8 rounded-full transition-all duration-300 ${
                        preferences.negativeMarking ? 'bg-red-500' : 'bg-slate-300'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <motion.div
                        className="absolute top-1 sm:top-1 w-4 h-4 sm:w-6 sm:h-6 bg-white rounded-full shadow-lg"
                        animate={{ x: preferences.negativeMarking ? (window.innerWidth < 640 ? 28 : 36) : 4 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    </motion.button>
                  </div>

                  <AnimatePresence>
                    {preferences.negativeMarking && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="max-w-md">
                          <label className="block text-base sm:text-lg font-semibold text-slate-700 mb-3 sm:mb-4">
                            Negative Marks per Wrong Answer
                          </label>
                          <div className="relative group">
                            <select
                              value={preferences.negativeMarks || -0.25}
                              onChange={(e) => setPreferences(prev => ({ ...prev, negativeMarks: parseFloat(e.target.value) }))}
                              className="w-full py-3 sm:py-4 px-10 sm:px-12 text-base sm:text-lg rounded-xl border-2 border-slate-200 focus:border-red-500 focus:outline-none transition-all duration-300 group-hover:shadow-lg"
                            >
                              <option value={-0.25}>-0.25 marks</option>
                              <option value={-0.5}>-0.5 marks</option>
                              <option value={-1}>-1 mark</option>
                            </select>
                            <div className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-red-500">
                              <Award className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-red-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </CardBody>
            </Card>
          </motion.div>

          {/* Error Display */}
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="p-4 sm:p-6 bg-red-50 border-2 border-red-200 rounded-xl sm:rounded-2xl flex items-center shadow-lg"
              >
                <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-red-500 mr-3 sm:mr-4 flex-shrink-0" />
                <p className="text-sm sm:text-base text-red-700 font-medium">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex justify-center pt-6 sm:pt-8"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                type="submit"
                disabled={isLoading || isCreatingCompetition || preferences.questionTypes.length === 0 || !preferences.course}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-4 sm:py-6 px-8 sm:px-12 text-lg sm:text-xl rounded-xl sm:rounded-2xl shadow-xl sm:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <div className="relative flex items-center">
                  {isLoading || isCreatingCompetition ? (
                    <>
                      <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 sm:mr-3" />
                      <span className="text-sm sm:text-base">
                        {isCompetitionMode ? 'Creating Competition...' : 'Saving Preferences...'}
                      </span>
                    </>
                  ) : (
                    <>
                      {isCompetitionMode ? (
                        <Crown className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                      ) : (
                        <Play className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3" />
                      )}
                      <span className="text-sm sm:text-base">
                        {isCompetitionMode ? 'Create Competition' : 'Start Quiz'}
                      </span>
                      <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 ml-2 sm:ml-3 group-hover:translate-x-1 transition-transform duration-300" />
                    </>
                  )}
                </div>
              </Button>
            </motion.div>
          </motion.div>
        </form>
      </div>
    </div>
  );
};

export default QuizPreferencesForm; 