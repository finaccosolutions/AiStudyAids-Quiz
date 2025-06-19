import React, { useState, useEffect } from 'react';
import { useQuizStore } from '../../store/useQuizStore';
import { useCompetitionStore } from '../../store/useCompetitionStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Card, CardBody, CardHeader } from '../ui/Card';
import { QuizPreferences } from '../../types';
import { 
  Brain, Settings, Clock, Target, Globe, 
  Users, Mail, Plus, X, Crown, Zap,
  BookOpen, CheckCircle, AlertCircle,
  Timer, Award, Sparkles, Star, Play,
  Calculator, Info, Lightbulb, Flame
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
  onStartCompetition
}) => {
  const { user } = useAuthStore();
  const { savePreferences, isLoading, error } = useQuizStore();
  const { createCompetition } = useCompetitionStore();
  
  const [preferences, setPreferences] = useState<QuizPreferences>(initialPreferences);
  const [competitionData, setCompetitionData] = useState({
    title: '',
    description: '',
    emails: [] as string[],
    emailInput: ''
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isCompetitionMode, setIsCompetitionMode] = useState(!!onStartCompetition);
  const [timeMode, setTimeMode] = useState<'per-question' | 'total' | 'none'>('none');

  useEffect(() => {
    setPreferences(initialPreferences);
  }, [initialPreferences]);

  // Calculate time references
  const calculateTimeReference = () => {
    if (!preferences.timeLimitEnabled) return null;
    
    if (timeMode === 'per-question' && preferences.timeLimit) {
      const totalTime = parseInt(preferences.timeLimit) * preferences.questionCount;
      return `Total time: ${Math.floor(totalTime / 60)}:${(totalTime % 60).toString().padStart(2, '0')}`;
    }
    
    if (timeMode === 'total' && preferences.totalTimeLimit) {
      const timePerQuestion = Math.floor(parseInt(preferences.totalTimeLimit) / preferences.questionCount);
      return `Time per question: ~${timePerQuestion}s`;
    }
    
    return null;
  };

  const questionTypeOptions = [
    { value: 'multiple-choice', label: 'Multiple Choice', icon: '🎯', description: 'Single correct answer from options' },
    { value: 'true-false', label: 'True/False', icon: '✅', description: 'Binary choice questions' },
    { value: 'multi-select', label: 'Multi-Select', icon: '☑️', description: 'Multiple correct options' },
    { value: 'sequence', label: 'Sequence', icon: '🔢', description: 'Arrange items in order' },
    { value: 'case-study', label: 'Case Study', icon: '📋', description: 'Real-world scenarios' },
    { value: 'situation', label: 'Situation', icon: '🎭', description: 'Decision-based questions' },
    { value: 'short-answer', label: 'Short Answer', icon: '✏️', description: 'Brief text responses' },
    { value: 'fill-blank', label: 'Fill Blanks', icon: '📝', description: 'Complete the sentence' }
  ];

  const difficultyOptions = [
    { value: 'easy', label: 'Easy', color: 'from-green-400 to-emerald-500', description: 'Basic concepts' },
    { value: 'medium', label: 'Medium', color: 'from-yellow-400 to-orange-500', description: 'Intermediate level' },
    { value: 'hard', label: 'Hard', color: 'from-red-400 to-pink-500', description: 'Advanced topics' }
  ];

  const languageOptions = [
    { value: 'English', label: 'English', flag: '🇺🇸' },
    { value: 'Hindi', label: 'Hindi', flag: '🇮🇳' },
    { value: 'Malayalam', label: 'Malayalam', flag: '🇮🇳' },
    { value: 'Tamil', label: 'Tamil', flag: '🇮🇳' },
    { value: 'Telugu', label: 'Telugu', flag: '🇮🇳' }
  ];

  const modeOptions = [
    { value: 'practice', label: 'Practice Mode', icon: '🎯', description: 'Immediate feedback' },
    { value: 'exam', label: 'Exam Mode', icon: '📝', description: 'Feedback at the end' }
  ];

  const handlePreferenceChange = (field: keyof QuizPreferences, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleQuestionTypeToggle = (type: string) => {
    const currentTypes = preferences.questionTypes || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];
    
    if (newTypes.length > 0) {
      handlePreferenceChange('questionTypes', newTypes);
    }
  };

  const handleTimeModeChange = (mode: 'per-question' | 'total' | 'none') => {
    setTimeMode(mode);
    if (mode === 'none') {
      handlePreferenceChange('timeLimitEnabled', false);
      handlePreferenceChange('timeLimit', null);
      handlePreferenceChange('totalTimeLimit', null);
    } else {
      handlePreferenceChange('timeLimitEnabled', true);
      if (mode === 'per-question') {
        handlePreferenceChange('totalTimeLimit', null);
        if (!preferences.timeLimit) {
          handlePreferenceChange('timeLimit', '30');
        }
      } else {
        handlePreferenceChange('timeLimit', null);
        if (!preferences.totalTimeLimit) {
          handlePreferenceChange('totalTimeLimit', '600');
        }
      }
    }
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

  const removeEmail = (emailToRemove: string) => {
    setCompetitionData(prev => ({
      ...prev,
      emails: prev.emails.filter(email => email !== emailToRemove)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await savePreferences(userId, preferences);
      
      if (isCompetitionMode && onStartCompetition) {
        // Create competition
        const competition = await createCompetition({
          title: competitionData.title || `${preferences.course} Quiz Competition`,
          description: competitionData.description || `A ${preferences.difficulty} level quiz on ${preferences.course}`,
          emails: competitionData.emails,
          quizPreferences: preferences,
          type: 'private'
        });
        
        onStartCompetition();
      } else if (onSave) {
        onSave();
      }
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          {/* Floating Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl animate-pulse" />
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-cyan-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
          </div>

          <Card className="relative bg-white/80 backdrop-blur-xl border-0 shadow-2xl overflow-hidden">
            {/* Animated Header */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 animate-pulse" />
            
            <CardHeader className="relative bg-gradient-to-r from-slate-50 to-blue-50 border-b border-slate-200/50 p-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-6">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="relative"
                  >
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl">
                      {isCompetitionMode ? (
                        <Crown className="w-10 h-10 text-white" />
                      ) : (
                        <Brain className="w-10 h-10 text-white" />
                      )}
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-blue-500/20 rounded-2xl blur-xl animate-pulse" />
                  </motion.div>
                  
                  <div>
                    <h2 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent mb-2">
                      {isCompetitionMode ? 'Create Competition' : 'Quiz Preferences'}
                    </h2>
                    <p className="text-slate-600 text-xl">
                      {isCompetitionMode 
                        ? 'Set up your quiz competition and challenge others'
                        : 'Customize your personalized learning experience'
                      }
                    </p>
                  </div>
                </div>

                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="hidden lg:block"
                >
                  <Sparkles className="w-12 h-12 text-purple-500" />
                </motion.div>
              </motion.div>
            </CardHeader>

            <CardBody className="p-8 space-y-10">
              <form onSubmit={handleSubmit} className="space-y-10">
                {/* Competition Details */}
                {isCompetitionMode && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-6"
                  >
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-50 to-orange-100 p-8 border-2 border-amber-200/50 shadow-lg">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-200/30 to-orange-200/30 rounded-full blur-2xl" />
                      
                      <h3 className="text-2xl font-bold text-amber-800 mb-6 flex items-center">
                        <Crown className="w-7 h-7 mr-3" />
                        Competition Setup
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                        <div className="space-y-3">
                          <label className="block text-sm font-semibold text-slate-700">
                            Competition Title *
                          </label>
                          <Input
                            type="text"
                            value={competitionData.title}
                            onChange={(e) => setCompetitionData(prev => ({ ...prev, title: e.target.value }))}
                            placeholder="Enter an exciting title"
                            className="w-full bg-white/80 border-2 border-amber-200 focus:border-amber-400 focus:ring-amber-200 text-slate-800 placeholder-slate-500 py-3 px-4 text-lg rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
                          />
                        </div>
                        
                        <div className="space-y-3">
                          <label className="block text-sm font-semibold text-slate-700">
                            Description (Optional)
                          </label>
                          <Input
                            type="text"
                            value={competitionData.description}
                            onChange={(e) => setCompetitionData(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Brief description"
                            className="w-full bg-white/80 border-2 border-amber-200 focus:border-amber-400 focus:ring-amber-200 text-slate-800 placeholder-slate-500 py-3 px-4 text-lg rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
                          />
                        </div>
                      </div>

                      {/* Email Invitations */}
                      <div className="mt-8">
                        <label className="block text-sm font-semibold text-slate-700 mb-3">
                          Invite Participants (Optional)
                        </label>
                        <div className="flex space-x-3 mb-4">
                          <Input
                            type="email"
                            value={competitionData.emailInput}
                            onChange={(e) => setCompetitionData(prev => ({ ...prev, emailInput: e.target.value }))}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addEmail())}
                            placeholder="Enter email address"
                            className="flex-1 bg-white/80 border-2 border-amber-200 focus:border-amber-400 focus:ring-amber-200 text-slate-800 placeholder-slate-500 py-3 px-4 text-lg rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
                          />
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              type="button"
                              onClick={addEmail}
                              className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                              <Plus className="w-5 h-5" />
                            </Button>
                          </motion.div>
                        </div>
                        
                        {competitionData.emails.length > 0 && (
                          <div className="flex flex-wrap gap-3">
                            {competitionData.emails.map((email, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-amber-100 text-amber-800 px-4 py-2 rounded-full flex items-center space-x-2 text-sm font-medium border border-amber-300 shadow-sm"
                              >
                                <Mail className="w-4 h-4" />
                                <span>{email}</span>
                                <button
                                  type="button"
                                  onClick={() => removeEmail(email)}
                                  className="hover:text-amber-900 transition-colors"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </motion.div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Basic Quiz Settings */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-8"
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <Settings className="w-7 h-7 text-purple-600" />
                    <h3 className="text-2xl font-bold text-slate-800">Quiz Configuration</h3>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Left Column */}
                    <div className="space-y-6">
                      {/* Course/Subject */}
                      <div className="group">
                        <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center">
                          <BookOpen className="w-5 h-5 mr-2 text-purple-600" />
                          Course/Subject *
                        </label>
                        <Input
                          type="text"
                          value={preferences.course || ''}
                          onChange={(e) => handlePreferenceChange('course', e.target.value)}
                          placeholder="e.g., Computer Science, Mathematics"
                          required
                          className="w-full bg-white border-2 border-slate-200 focus:border-purple-500 focus:ring-purple-200 text-slate-800 placeholder-slate-500 py-4 px-4 text-lg rounded-xl shadow-sm hover:shadow-md transition-all duration-300 group-hover:border-purple-300"
                        />
                      </div>

                      {/* Topic */}
                      <div className="group">
                        <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center">
                          <Target className="w-5 h-5 mr-2 text-blue-600" />
                          Topic (Optional)
                        </label>
                        <Input
                          type="text"
                          value={preferences.topic || ''}
                          onChange={(e) => handlePreferenceChange('topic', e.target.value)}
                          placeholder="e.g., Data Structures, Calculus"
                          className="w-full bg-white border-2 border-slate-200 focus:border-blue-500 focus:ring-blue-200 text-slate-800 placeholder-slate-500 py-4 px-4 text-lg rounded-xl shadow-sm hover:shadow-md transition-all duration-300 group-hover:border-blue-300"
                        />
                      </div>

                      {/* Subtopic */}
                      <div className="group">
                        <label className="block text-sm font-semibold text-slate-700 mb-3">
                          Subtopic (Optional)
                        </label>
                        <Input
                          type="text"
                          value={preferences.subtopic || ''}
                          onChange={(e) => handlePreferenceChange('subtopic', e.target.value)}
                          placeholder="e.g., Binary Trees, Derivatives"
                          className="w-full bg-white border-2 border-slate-200 focus:border-cyan-500 focus:ring-cyan-200 text-slate-800 placeholder-slate-500 py-4 px-4 text-lg rounded-xl shadow-sm hover:shadow-md transition-all duration-300 group-hover:border-cyan-300"
                        />
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                      {/* Number of Questions */}
                      <div className="group">
                        <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center">
                          <Calculator className="w-5 h-5 mr-2 text-green-600" />
                          Number of Questions
                        </label>
                        <Input
                          type="number"
                          min="1"
                          max="50"
                          value={preferences.questionCount}
                          onChange={(e) => handlePreferenceChange('questionCount', parseInt(e.target.value))}
                          className="w-full bg-white border-2 border-slate-200 focus:border-green-500 focus:ring-green-200 text-slate-800 py-4 px-4 text-lg rounded-xl shadow-sm hover:shadow-md transition-all duration-300 group-hover:border-green-300"
                        />
                      </div>

                      {/* Difficulty Level */}
                      <div className="group">
                        <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center">
                          <Flame className="w-5 h-5 mr-2 text-orange-600" />
                          Difficulty Level
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          {difficultyOptions.map((option) => (
                            <motion.button
                              key={option.value}
                              type="button"
                              onClick={() => handlePreferenceChange('difficulty', option.value)}
                              className={`p-4 rounded-xl border-2 transition-all duration-300 text-center ${
                                preferences.difficulty === option.value
                                  ? `bg-gradient-to-r ${option.color} text-white border-transparent shadow-lg scale-105`
                                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:shadow-md hover:scale-102'
                              }`}
                              whileHover={{ scale: preferences.difficulty === option.value ? 1.05 : 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <div className="font-bold text-lg">{option.label}</div>
                              <div className="text-sm opacity-80">{option.description}</div>
                            </motion.button>
                          ))}
                        </div>
                      </div>

                      {/* Language */}
                      <div className="group">
                        <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center">
                          <Globe className="w-5 h-5 mr-2 text-indigo-600" />
                          Language
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          {languageOptions.map((option) => (
                            <motion.button
                              key={option.value}
                              type="button"
                              onClick={() => handlePreferenceChange('language', option.value)}
                              className={`p-3 rounded-xl border-2 transition-all duration-300 flex items-center space-x-2 ${
                                preferences.language === option.value
                                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-lg scale-105'
                                  : 'border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-indigo-50 hover:scale-102'
                              }`}
                              whileHover={{ scale: preferences.language === option.value ? 1.05 : 1.02 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <span className="text-lg">{option.flag}</span>
                              <span className="font-medium">{option.label}</span>
                            </motion.button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Question Types */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-6"
                >
                  <div className="flex items-center space-x-3 mb-6">
                    <Star className="w-7 h-7 text-yellow-500" />
                    <h4 className="text-2xl font-bold text-slate-800">Question Types</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {questionTypeOptions.map((type) => (
                      <motion.button
                        key={type.value}
                        type="button"
                        onClick={() => handleQuestionTypeToggle(type.value)}
                        className={`p-5 rounded-2xl border-2 transition-all duration-300 text-left group ${
                          preferences.questionTypes?.includes(type.value)
                            ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-lg scale-105'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-purple-300 hover:bg-purple-50 hover:scale-102'
                        }`}
                        whileHover={{ scale: preferences.questionTypes?.includes(type.value) ? 1.05 : 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="text-2xl">{type.icon}</span>
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-300 ${
                            preferences.questionTypes?.includes(type.value)
                              ? 'border-purple-600 bg-purple-600'
                              : 'border-slate-400 group-hover:border-purple-400'
                          }`}>
                            {preferences.questionTypes?.includes(type.value) && (
                              <CheckCircle className="w-4 h-4 text-white" />
                            )}
                          </div>
                        </div>
                        <div className="font-bold text-lg mb-1">{type.label}</div>
                        <div className="text-sm opacity-70">{type.description}</div>
                      </motion.button>
                    ))}
                  </div>
                  
                  {(!preferences.questionTypes || preferences.questionTypes.length === 0) && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center space-x-2 text-red-500 bg-red-50 p-4 rounded-xl border border-red-200"
                    >
                      <AlertCircle className="w-5 h-5" />
                      <span className="font-medium">Please select at least one question type</span>
                    </motion.div>
                  )}
                </motion.div>

                {/* Advanced Settings */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="space-y-6"
                >
                  <motion.button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center space-x-3 text-purple-600 hover:text-purple-700 font-semibold text-xl transition-colors group"
                    whileHover={{ scale: 1.02 }}
                  >
                    <Lightbulb className="w-6 h-6 group-hover:animate-pulse" />
                    <span>Advanced Settings</span>
                    <motion.div
                      animate={{ rotate: showAdvanced ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <CheckCircle className="w-5 h-5" />
                    </motion.div>
                  </motion.button>

                  <AnimatePresence>
                    {showAdvanced && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-8 bg-gradient-to-br from-slate-50 to-blue-50 p-8 rounded-2xl border-2 border-slate-200 shadow-inner overflow-hidden"
                      >
                        {/* Quiz Mode */}
                        <div className="space-y-4">
                          <label className="block text-lg font-bold text-slate-800 flex items-center">
                            <Award className="w-6 h-6 mr-2 text-purple-600" />
                            Quiz Mode
                          </label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {modeOptions.map((option) => (
                              <motion.button
                                key={option.value}
                                type="button"
                                onClick={() => handlePreferenceChange('mode', option.value)}
                                className={`p-5 rounded-xl border-2 transition-all duration-300 text-left ${
                                  preferences.mode === option.value
                                    ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-lg scale-105'
                                    : 'border-slate-200 bg-white text-slate-700 hover:border-purple-300 hover:bg-purple-50 hover:scale-102'
                                }`}
                                whileHover={{ scale: preferences.mode === option.value ? 1.05 : 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <div className="flex items-center space-x-3 mb-2">
                                  <span className="text-xl">{option.icon}</span>
                                  <span className="font-bold text-lg">{option.label}</span>
                                </div>
                                <div className="text-sm opacity-70">{option.description}</div>
                              </motion.button>
                            ))}
                          </div>
                        </div>

                        {/* Time Limits */}
                        <div className="space-y-6">
                          <div className="flex items-center space-x-3">
                            <Clock className="w-6 h-6 text-blue-600" />
                            <h4 className="text-lg font-bold text-slate-800">Time Management</h4>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                              { value: 'none', label: 'No Time Limit', icon: '∞', description: 'Take your time' },
                              { value: 'per-question', label: 'Per Question', icon: '⏱️', description: 'Time each question' },
                              { value: 'total', label: 'Total Quiz Time', icon: '⏰', description: 'Overall time limit' }
                            ].map((option) => (
                              <motion.button
                                key={option.value}
                                type="button"
                                onClick={() => handleTimeModeChange(option.value as any)}
                                className={`p-4 rounded-xl border-2 transition-all duration-300 text-center ${
                                  timeMode === option.value
                                    ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-lg scale-105'
                                    : 'border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50 hover:scale-102'
                                }`}
                                whileHover={{ scale: timeMode === option.value ? 1.05 : 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <div className="text-2xl mb-2">{option.icon}</div>
                                <div className="font-bold">{option.label}</div>
                                <div className="text-sm opacity-70">{option.description}</div>
                              </motion.button>
                            ))}
                          </div>

                          {timeMode !== 'none' && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="grid grid-cols-1 md:grid-cols-2 gap-6"
                            >
                              {timeMode === 'per-question' && (
                                <div className="space-y-3">
                                  <label className="block text-sm font-semibold text-slate-700">
                                    Time per Question (seconds)
                                  </label>
                                  <Input
                                    type="number"
                                    min="10"
                                    max="300"
                                    value={preferences.timeLimit || ''}
                                    onChange={(e) => handlePreferenceChange('timeLimit', e.target.value)}
                                    placeholder="e.g., 30"
                                    className="w-full bg-white border-2 border-slate-200 focus:border-blue-500 focus:ring-blue-200 text-slate-800 placeholder-slate-500 py-3 px-4 text-lg rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
                                  />
                                  {calculateTimeReference() && (
                                    <div className="flex items-center space-x-2 text-sm text-blue-600 bg-blue-50 p-2 rounded-lg">
                                      <Info className="w-4 h-4" />
                                      <span>{calculateTimeReference()}</span>
                                    </div>
                                  )}
                                </div>
                              )}

                              {timeMode === 'total' && (
                                <div className="space-y-3">
                                  <label className="block text-sm font-semibold text-slate-700">
                                    Total Quiz Time (seconds)
                                  </label>
                                  <Input
                                    type="number"
                                    min="60"
                                    max="3600"
                                    value={preferences.totalTimeLimit || ''}
                                    onChange={(e) => handlePreferenceChange('totalTimeLimit', e.target.value)}
                                    placeholder="e.g., 600"
                                    className="w-full bg-white border-2 border-slate-200 focus:border-blue-500 focus:ring-blue-200 text-slate-800 placeholder-slate-500 py-3 px-4 text-lg rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
                                  />
                                  {calculateTimeReference() && (
                                    <div className="flex items-center space-x-2 text-sm text-blue-600 bg-blue-50 p-2 rounded-lg">
                                      <Info className="w-4 h-4" />
                                      <span>{calculateTimeReference()}</span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </motion.div>
                          )}
                        </div>

                        {/* Negative Marking */}
                        <div className="space-y-6">
                          <div className="flex items-center space-x-4">
                            <input
                              type="checkbox"
                              id="negativeMarking"
                              checked={preferences.negativeMarking}
                              onChange={(e) => handlePreferenceChange('negativeMarking', e.target.checked)}
                              className="w-5 h-5 text-purple-600 border-2 border-slate-300 rounded focus:ring-purple-500"
                            />
                            <label htmlFor="negativeMarking" className="text-lg font-bold text-slate-800 flex items-center">
                              <Target className="w-6 h-6 mr-2 text-red-600" />
                              Enable Negative Marking
                            </label>
                          </div>

                          {preferences.negativeMarking && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="ml-9 space-y-3"
                            >
                              <label className="block text-sm font-semibold text-slate-700">
                                Marks Deducted per Wrong Answer
                              </label>
                              <Input
                                type="number"
                                min="-5"
                                max="0"
                                step="0.25"
                                value={preferences.negativeMarks || ''}
                                onChange={(e) => handlePreferenceChange('negativeMarks', parseFloat(e.target.value))}
                                placeholder="e.g., -0.25"
                                className="w-full max-w-xs bg-white border-2 border-slate-200 focus:border-red-500 focus:ring-red-200 text-slate-800 placeholder-slate-500 py-3 px-4 text-lg rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
                              />
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-xl shadow-lg"
                  >
                    <div className="flex items-center">
                      <AlertCircle className="w-6 h-6 mr-3" />
                      <span className="font-medium">{error}</span>
                    </div>
                  </motion.div>
                )}

                {/* Submit Button */}
                <div className="flex justify-center pt-8">
                  <motion.div 
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }}
                    className="relative"
                  >
                    <Button
                      type="submit"
                      disabled={isLoading || !preferences.course || !preferences.questionTypes?.length}
                      className="relative bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-20 py-5 text-xl font-bold rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      
                      {isLoading ? (
                        <div className="flex items-center space-x-3">
                          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Processing...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-3">
                          {isCompetitionMode ? (
                            <>
                              <Crown className="w-6 h-6" />
                              <span>Create Competition</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-6 h-6" />
                              <span>Start Quiz</span>
                            </>
                          )}
                          <Zap className="w-6 h-6" />
                        </div>
                      )}
                    </Button>
                  </motion.div>
                </div>
              </form>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default QuizPreferencesForm;