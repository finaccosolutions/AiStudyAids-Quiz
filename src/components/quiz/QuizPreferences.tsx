import React, { useState, useEffect } from 'react';
import { useQuizStore } from '../../store/useQuizStore';
import { useCompetitionStore } from '../../store/useCompetitionStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardBody, CardHeader } from '../ui/Card';
import { QuizPreferences } from '../../types';
import { 
  Brain, Users, Clock, Globe, Target, Zap, 
  BookOpen, GraduationCap, Settings, Play,
  ChevronRight, Star, Trophy, Timer, Award,
  Sparkles, CheckCircle, AlertCircle, Crown,
  Rocket, Shield, Activity, TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface QuizPreferencesFormProps {
  userId: string;
  initialPreferences: QuizPreferences;
  onSave?: () => void;
  onStartCompetition?: () => void;
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
  const [competitionData, setCompetitionData] = useState({
    title: '',
    description: '',
    emails: [] as string[],
    emailInput: ''
  });
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [isCreatingCompetition, setIsCreatingCompetition] = useState(false);

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
    { value: 'Malayalam', label: 'Malayalam', flag: '🇮🇳' },
    { value: 'Tamil', label: 'Tamil', flag: '🇮🇳' },
    { value: 'Telugu', label: 'Telugu', flag: '🇮🇳' }
  ];

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await savePreferences(userId, preferences);
      
      if (isCompetitionMode && onStartCompetition) {
        setIsCreatingCompetition(true);
        
        const competition = await createCompetition({
          title: competitionData.title || `${preferences.course} Quiz Challenge`,
          description: competitionData.description || `Test your knowledge in ${preferences.course}`,
          type: 'private',
          quizPreferences: preferences,
          emails: competitionData.emails
        });
        
        onStartCompetition();
      } else if (onSave) {
        onSave();
      }
    } catch (error) {
      console.error('Failed to save preferences:', error);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-6">
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="relative w-20 h-20 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-3xl flex items-center justify-center mr-6 shadow-2xl"
            >
              {isCompetitionMode ? <Crown className="w-10 h-10 text-white" /> : <Settings className="w-10 h-10 text-white" />}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/50 to-indigo-400/50 rounded-3xl blur-xl animate-pulse" />
            </motion.div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-800 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                {isCompetitionMode ? 'Create Competition' : 'Quiz Preferences'}
              </h1>
              <p className="text-xl text-slate-600">
                {isCompetitionMode ? 'Set up your quiz competition' : 'Customize your learning experience'}
              </p>
            </div>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Competition Details (only for competition mode) */}
          {isCompetitionMode && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card className="shadow-2xl border-2 border-purple-100 overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
                  <h3 className="text-2xl font-bold text-slate-800 flex items-center">
                    <Trophy className="w-7 h-7 mr-3 text-purple-600" />
                    Competition Details
                  </h3>
                </CardHeader>
                <CardBody className="p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-lg font-semibold text-slate-700 mb-3">
                          Competition Title
                        </label>
                        <Input
                          type="text"
                          value={competitionData.title}
                          onChange={(e) => setCompetitionData(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Enter competition title"
                          className="w-full py-4 text-lg rounded-xl border-2 border-slate-200 focus:border-purple-500 transition-all duration-300"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-lg font-semibold text-slate-700 mb-3">
                          Description
                        </label>
                        <textarea
                          value={competitionData.description}
                          onChange={(e) => setCompetitionData(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Describe your competition"
                          rows={4}
                          className="w-full py-4 px-4 text-lg rounded-xl border-2 border-slate-200 focus:border-purple-500 focus:outline-none transition-all duration-300 resize-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-lg font-semibold text-slate-700 mb-3">
                        Invite Participants (Optional)
                      </label>
                      <div className="space-y-4">
                        <div className="flex space-x-3">
                          <Input
                            type="email"
                            value={competitionData.emailInput}
                            onChange={(e) => setCompetitionData(prev => ({ ...prev, emailInput: e.target.value }))}
                            placeholder="Enter email address"
                            className="flex-1 py-4 text-lg rounded-xl border-2 border-slate-200 focus:border-purple-500"
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addEmail())}
                          />
                          <Button
                            type="button"
                            onClick={addEmail}
                            className="px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-xl"
                          >
                            Add
                          </Button>
                        </div>
                        
                        {competitionData.emails.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-slate-600">Invited participants:</p>
                            <div className="flex flex-wrap gap-2">
                              {competitionData.emails.map((email) => (
                                <motion.div
                                  key={email}
                                  initial={{ opacity: 0, scale: 0.8 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  className="flex items-center bg-purple-100 text-purple-700 px-3 py-2 rounded-full text-sm font-medium"
                                >
                                  {email}
                                  <button
                                    type="button"
                                    onClick={() => removeEmail(email)}
                                    className="ml-2 text-purple-500 hover:text-purple-700"
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
                <h3 className="text-2xl font-bold text-slate-800 flex items-center">
                  <GraduationCap className="w-7 h-7 mr-3 text-blue-600" />
                  Subject & Topic
                </h3>
              </CardHeader>
              <CardBody className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div>
                    <label className="block text-lg font-semibold text-slate-700 mb-3">
                      Course/Subject *
                    </label>
                    <Input
                      type="text"
                      value={preferences.course}
                      onChange={(e) => setPreferences(prev => ({ ...prev, course: e.target.value }))}
                      placeholder="e.g., Computer Science"
                      required
                      className="w-full py-4 text-lg rounded-xl border-2 border-slate-200 focus:border-blue-500 transition-all duration-300"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-lg font-semibold text-slate-700 mb-3">
                      Topic (Optional)
                    </label>
                    <Input
                      type="text"
                      value={preferences.topic}
                      onChange={(e) => setPreferences(prev => ({ ...prev, topic: e.target.value }))}
                      placeholder="e.g., Data Structures"
                      className="w-full py-4 text-lg rounded-xl border-2 border-slate-200 focus:border-blue-500 transition-all duration-300"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-lg font-semibold text-slate-700 mb-3">
                      Subtopic (Optional)
                    </label>
                    <Input
                      type="text"
                      value={preferences.subtopic}
                      onChange={(e) => setPreferences(prev => ({ ...prev, subtopic: e.target.value }))}
                      placeholder="e.g., Binary Trees"
                      className="w-full py-4 text-lg rounded-xl border-2 border-slate-200 focus:border-blue-500 transition-all duration-300"
                    />
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
                <h3 className="text-2xl font-bold text-slate-800 flex items-center">
                  <Target className="w-7 h-7 mr-3 text-green-600" />
                  Quiz Configuration
                </h3>
              </CardHeader>
              <CardBody className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Question Count and Difficulty */}
                  <div className="space-y-8">
                    <div>
                      <label className="block text-lg font-semibold text-slate-700 mb-4">
                        Number of Questions
                      </label>
                      <div className="relative">
                        <Input
                          type="number"
                          min="1"
                          max="50"
                          value={preferences.questionCount}
                          onChange={(e) => setPreferences(prev => ({ 
                            ...prev, 
                            questionCount: Math.max(1, Math.min(50, parseInt(e.target.value) || 1))
                          }))}
                          className="w-full py-4 text-lg rounded-xl border-2 border-slate-200 focus:border-green-500 transition-all duration-300"
                        />
                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                          <Sparkles className="w-6 h-6 text-green-500" />
                        </div>
                      </div>
                      <p className="text-sm text-slate-500 mt-2">Choose between 1-50 questions</p>
                    </div>

                    <div>
                      <label className="block text-lg font-semibold text-slate-700 mb-4">
                        Difficulty Level
                      </label>
                      <div className="grid grid-cols-1 gap-4">
                        {difficultyOptions.map((option) => (
                          <motion.button
                            key={option.value}
                            type="button"
                            onClick={() => setPreferences(prev => ({ ...prev, difficulty: option.value as any }))}
                            className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left ${
                              preferences.difficulty === option.value
                                ? `${option.borderColor} ${option.bgColor} shadow-lg scale-[1.02] ring-4 ring-opacity-20`
                                : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md hover:scale-[1.01]'
                            }`}
                            whileHover={{ scale: preferences.difficulty === option.value ? 1.02 : 1.01 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="flex items-center space-x-4">
                              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl ${
                                preferences.difficulty === option.value 
                                  ? `bg-gradient-to-r ${option.color} text-white shadow-lg`
                                  : 'bg-slate-100 text-slate-600'
                              }`}>
                                {option.icon}
                              </div>
                              <div className="flex-1">
                                <h4 className={`text-xl font-bold ${
                                  preferences.difficulty === option.value ? option.textColor : 'text-slate-800'
                                }`}>
                                  {option.label}
                                </h4>
                                <p className="text-slate-600 mt-1">{option.description}</p>
                              </div>
                              {preferences.difficulty === option.value && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                >
                                  <CheckCircle className="w-8 h-8 text-green-500" />
                                </motion.div>
                              )}
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Language Selection */}
                  <div>
                    <label className="block text-lg font-semibold text-slate-700 mb-4">
                      Language
                    </label>
                    <div className="grid grid-cols-1 gap-3">
                      {languageOptions.map((option) => (
                        <motion.button
                          key={option.value}
                          type="button"
                          onClick={() => setPreferences(prev => ({ ...prev, language: option.value as any }))}
                          className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                            preferences.language === option.value
                              ? 'border-blue-500 bg-blue-50 shadow-lg scale-[1.02] ring-4 ring-blue-200'
                              : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md hover:scale-[1.01]'
                          }`}
                          whileHover={{ scale: preferences.language === option.value ? 1.02 : 1.01 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-center space-x-4">
                            <span className="text-2xl">{option.flag}</span>
                            <span className={`text-lg font-semibold ${
                              preferences.language === option.value ? 'text-blue-700' : 'text-slate-800'
                            }`}>
                              {option.label}
                            </span>
                            {preferences.language === option.value && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                className="ml-auto"
                              >
                                <CheckCircle className="w-6 h-6 text-green-500" />
                              </motion.div>
                            )}
                          </div>
                        </motion.button>
                      ))}
                    </div>
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
                <h3 className="text-2xl font-bold text-slate-800 flex items-center">
                  <Star className="w-7 h-7 mr-3 text-purple-600" />
                  Question Types
                </h3>
                <p className="text-slate-600 mt-2">Select at least one question type</p>
              </CardHeader>
              <CardBody className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {questionTypeOptions.map((option) => {
                    const isSelected = preferences.questionTypes.includes(option.value);
                    return (
                      <motion.button
                        key={option.value}
                        type="button"
                        onClick={() => handleQuestionTypeToggle(option.value)}
                        className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left relative overflow-hidden ${
                          isSelected
                            ? 'border-purple-500 bg-purple-50 shadow-xl scale-[1.02] ring-4 ring-purple-200'
                            : 'border-slate-200 bg-white hover:border-purple-300 hover:shadow-lg hover:scale-[1.01]'
                        }`}
                        whileHover={{ scale: isSelected ? 1.02 : 1.01 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-400/5 to-indigo-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="relative z-10">
                          <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${
                            isSelected 
                              ? `bg-gradient-to-r ${option.color} text-white shadow-lg`
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            <option.icon className="w-7 h-7" />
                          </div>
                          <h4 className={`text-lg font-bold mb-2 ${
                            isSelected ? 'text-purple-700' : 'text-slate-800'
                          }`}>
                            {option.label}
                          </h4>
                          <p className="text-slate-600 text-sm">{option.description}</p>
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ type: "spring", stiffness: 500, damping: 30 }}
                              className="absolute top-4 right-4"
                            >
                              <CheckCircle className="w-6 h-6 text-green-500" />
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
                    className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-center"
                  >
                    <AlertCircle className="w-6 h-6 text-orange-500 mr-3 flex-shrink-0" />
                    <p className="text-orange-700 font-medium">Please select at least one question type</p>
                  </motion.div>
                )}
              </CardBody>
            </Card>
          </motion.div>

          {/* Quiz Mode */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="shadow-2xl border-2 border-indigo-100 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
                <h3 className="text-2xl font-bold text-slate-800 flex items-center">
                  <Rocket className="w-7 h-7 mr-3 text-indigo-600" />
                  Quiz Mode
                </h3>
              </CardHeader>
              <CardBody className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {modeOptions.map((option) => {
                    const isSelected = preferences.mode === option.value;
                    return (
                      <motion.button
                        key={option.value}
                        type="button"
                        onClick={() => setPreferences(prev => ({ ...prev, mode: option.value as any }))}
                        className={`p-8 rounded-2xl border-2 transition-all duration-300 text-left relative overflow-hidden ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-50 shadow-xl scale-[1.02] ring-4 ring-indigo-200'
                            : 'border-slate-200 bg-white hover:border-indigo-300 hover:shadow-lg hover:scale-[1.01]'
                        }`}
                        whileHover={{ scale: isSelected ? 1.02 : 1.01 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/5 to-purple-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="relative z-10">
                          <div className="flex items-center space-x-4 mb-6">
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                              isSelected 
                                ? `bg-gradient-to-r ${option.color} text-white shadow-lg`
                                : 'bg-slate-100 text-slate-600'
                            }`}>
                              <option.icon className="w-8 h-8" />
                            </div>
                            <div className="flex-1">
                              <h4 className={`text-2xl font-bold ${
                                isSelected ? 'text-indigo-700' : 'text-slate-800'
                              }`}>
                                {option.label}
                              </h4>
                              <p className="text-slate-600 text-lg mt-1">{option.description}</p>
                            </div>
                            {isSelected && (
                              <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                              >
                                <CheckCircle className="w-8 h-8 text-green-500" />
                              </motion.div>
                            )}
                          </div>
                          <div className="space-y-3">
                            {option.features.map((feature, index) => (
                              <div key={index} className="flex items-center space-x-3">
                                <div className={`w-2 h-2 rounded-full ${
                                  isSelected ? 'bg-indigo-500' : 'bg-slate-400'
                                }`} />
                                <span className="text-slate-700 font-medium">{feature}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </CardBody>
            </Card>
          </motion.div>

          {/* Time Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="shadow-2xl border-2 border-orange-100 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50">
                <h3 className="text-2xl font-bold text-slate-800 flex items-center">
                  <Timer className="w-7 h-7 mr-3 text-orange-600" />
                  Time Settings
                </h3>
              </CardHeader>
              <CardBody className="p-8">
                <div className="space-y-8">
                  <div className="flex items-center justify-between p-6 bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl border border-orange-200">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                        <Clock className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-slate-800">Enable Time Limits</h4>
                        <p className="text-slate-600">Add time pressure to your quiz</p>
                      </div>
                    </div>
                    <motion.button
                      type="button"
                      onClick={() => setPreferences(prev => ({ ...prev, timeLimitEnabled: !prev.timeLimitEnabled }))}
                      className={`relative w-16 h-8 rounded-full transition-all duration-300 ${
                        preferences.timeLimitEnabled ? 'bg-green-500' : 'bg-slate-300'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <motion.div
                        className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg"
                        animate={{ x: preferences.timeLimitEnabled ? 36 : 4 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    </motion.button>
                  </div>

                  <AnimatePresence>
                    {preferences.timeLimitEnabled && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                      >
                        <div>
                          <label className="block text-lg font-semibold text-slate-700 mb-4">
                            Time per Question (seconds)
                          </label>
                          <select
                            value={preferences.timeLimit || ''}
                            onChange={(e) => setPreferences(prev => ({ ...prev, timeLimit: e.target.value || null }))}
                            className="w-full py-4 px-4 text-lg rounded-xl border-2 border-slate-200 focus:border-orange-500 focus:outline-none transition-all duration-300"
                          >
                            <option value="">No limit per question</option>
                            <option value="15">15 seconds</option>
                            <option value="30">30 seconds</option>
                            <option value="60">1 minute</option>
                            <option value="120">2 minutes</option>
                            <option value="300">5 minutes</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-lg font-semibold text-slate-700 mb-4">
                            Total Quiz Time (seconds)
                          </label>
                          <select
                            value={preferences.totalTimeLimit || ''}
                            onChange={(e) => setPreferences(prev => ({ ...prev, totalTimeLimit: e.target.value || null }))}
                            className="w-full py-4 px-4 text-lg rounded-xl border-2 border-slate-200 focus:border-orange-500 focus:outline-none transition-all duration-300"
                          >
                            <option value="">No total time limit</option>
                            <option value="300">5 minutes</option>
                            <option value="600">10 minutes</option>
                            <option value="900">15 minutes</option>
                            <option value="1800">30 minutes</option>
                            <option value="3600">1 hour</option>
                          </select>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </CardBody>
            </Card>
          </motion.div>

          {/* Scoring Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="shadow-2xl border-2 border-red-100 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-red-50 to-pink-50">
                <h3 className="text-2xl font-bold text-slate-800 flex items-center">
                  <Award className="w-7 h-7 mr-3 text-red-600" />
                  Scoring Settings
                </h3>
              </CardHeader>
              <CardBody className="p-8">
                <div className="space-y-8">
                  <div className="flex items-center justify-between p-6 bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl border border-red-200">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold text-slate-800">Negative Marking</h4>
                        <p className="text-slate-600">Deduct points for wrong answers</p>
                      </div>
                    </div>
                    <motion.button
                      type="button"
                      onClick={() => setPreferences(prev => ({ ...prev, negativeMarking: !prev.negativeMarking }))}
                      className={`relative w-16 h-8 rounded-full transition-all duration-300 ${
                        preferences.negativeMarking ? 'bg-red-500' : 'bg-slate-300'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <motion.div
                        className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg"
                        animate={{ x: preferences.negativeMarking ? 36 : 4 }}
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
                          <label className="block text-lg font-semibold text-slate-700 mb-4">
                            Negative Marks per Wrong Answer
                          </label>
                          <select
                            value={preferences.negativeMarks || -0.25}
                            onChange={(e) => setPreferences(prev => ({ ...prev, negativeMarks: parseFloat(e.target.value) }))}
                            className="w-full py-4 px-4 text-lg rounded-xl border-2 border-slate-200 focus:border-red-500 focus:outline-none transition-all duration-300"
                          >
                            <option value={-0.25}>-0.25 marks</option>
                            <option value={-0.5}>-0.5 marks</option>
                            <option value={-1}>-1 mark</option>
                          </select>
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
                className="p-6 bg-red-50 border-2 border-red-200 rounded-2xl flex items-center shadow-lg"
              >
                <AlertCircle className="w-8 h-8 text-red-500 mr-4 flex-shrink-0" />
                <p className="text-red-700 font-medium text-lg">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="flex justify-center pt-8"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                type="submit"
                disabled={isLoading || isCreatingCompetition || preferences.questionTypes.length === 0 || !preferences.course}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-6 px-12 text-xl rounded-2xl shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                <div className="relative flex items-center">
                  {isLoading || isCreatingCompetition ? (
                    <>
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3" />
                      {isCompetitionMode ? 'Creating Competition...' : 'Saving Preferences...'}
                    </>
                  ) : (
                    <>
                      {isCompetitionMode ? <Crown className="w-6 h-6 mr-3" /> : <Play className="w-6 h-6 mr-3" />}
                      {isCompetitionMode ? 'Create Competition' : 'Start Quiz'}
                      <ChevronRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
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