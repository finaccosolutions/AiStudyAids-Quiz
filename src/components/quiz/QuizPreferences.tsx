import React, { useState, useEffect } from 'react';
import { useQuizStore } from '../../store/useQuizStore';
import { useCompetitionStore } from '../../store/useCompetitionStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Card, CardBody, CardHeader } from '../ui/Card';
import { QuizPreferences } from '../../types';
import { Brain, Settings, Clock, Target, Globe, Users, Mail, Plus, X, Crown, Zap, BookOpen, CheckCircle, AlertCircle, Timer, Award, Sparkles, Star, Play, Calculator, Info, Lightbulb, Flame, Rocket, Shield, CloudLightning as Lightning, Wand2, Trophy, Gamepad2, Palette, Layers, Grid3X3, Hash, MessageCircle, ChevronDown } from 'lucide-react';
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
  const [activeSection, setActiveSection] = useState<string>('basic');

  useEffect(() => {
    setPreferences(initialPreferences);
    // Set time mode based on existing preferences
    if (initialPreferences.timeLimitEnabled) {
      if (initialPreferences.timeLimit) {
        setTimeMode('per-question');
      } else if (initialPreferences.totalTimeLimit) {
        setTimeMode('total');
      }
    }
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
    { value: 'multiple-choice', label: 'Multiple Choice', icon: '🎯', description: 'Single correct answer from options', color: 'from-blue-500 to-cyan-500' },
    { value: 'true-false', label: 'True/False', icon: '✅', description: 'Binary choice questions', color: 'from-green-500 to-emerald-500' },
    { value: 'multi-select', label: 'Multi-Select', icon: '☑️', description: 'Multiple correct options', color: 'from-purple-500 to-indigo-500' },
    { value: 'sequence', label: 'Sequence', icon: '🔢', description: 'Arrange items in order', color: 'from-orange-500 to-red-500' },
    { value: 'case-study', label: 'Case Study', icon: '📋', description: 'Real-world scenarios', color: 'from-teal-500 to-cyan-500' },
    { value: 'situation', label: 'Situation', icon: '🎭', description: 'Decision-based questions', color: 'from-pink-500 to-rose-500' },
    { value: 'short-answer', label: 'Short Answer', icon: '✏️', description: 'Brief text responses', color: 'from-amber-500 to-yellow-500' },
    { value: 'fill-blank', label: 'Fill Blanks', icon: '📝', description: 'Complete the sentence', color: 'from-violet-500 to-purple-500' }
  ];

  const difficultyOptions = [
    { value: 'easy', label: 'Easy', gradient: 'from-green-400 to-emerald-500', description: 'Basic concepts', icon: '🌱', bgColor: 'bg-green-50', textColor: 'text-green-700', borderColor: 'border-green-200' },
    { value: 'medium', label: 'Medium', gradient: 'from-yellow-400 to-orange-500', description: 'Intermediate level', icon: '🔥', bgColor: 'bg-yellow-50', textColor: 'text-yellow-700', borderColor: 'border-yellow-200' },
    { value: 'hard', label: 'Hard', gradient: 'from-red-400 to-pink-500', description: 'Advanced topics', icon: '⚡', bgColor: 'bg-red-50', textColor: 'text-red-700', borderColor: 'border-red-200' }
  ];

  const languageOptions = [
    { value: 'English', label: 'English', flag: '🇺🇸' },
    { value: 'Hindi', label: 'Hindi', flag: '🇮🇳' },
    { value: 'Malayalam', label: 'Malayalam', flag: '🇮🇳' },
    { value: 'Tamil', label: 'Tamil', flag: '🇮🇳' },
    { value: 'Telugu', label: 'Telugu', flag: '🇮🇳' },
    { value: 'Spanish', label: 'Spanish', flag: '🇪🇸' },
    { value: 'French', label: 'French', flag: '🇫🇷' },
    { value: 'German', label: 'German', flag: '🇩🇪' },
    { value: 'Chinese', label: 'Chinese', flag: '🇨🇳' },
    { value: 'Japanese', label: 'Japanese', flag: '🇯🇵' }
  ];

  const modeOptions = [
    { value: 'practice', label: 'Practice Mode', icon: '🎯', description: 'Immediate feedback after each question', color: 'from-blue-500 to-cyan-500' },
    { value: 'exam', label: 'Exam Mode', icon: '📝', description: 'Feedback shown only at the end', color: 'from-purple-500 to-pink-500' }
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
      // Save preferences first
      await savePreferences(userId, preferences);
      
      if (isCompetitionMode && onStartCompetition) {
        // Create competition with all details
        const competition = await createCompetition({
          title: competitionData.title || `${preferences.course} Quiz Competition`,
          description: competitionData.description || `A ${preferences.difficulty} level quiz on ${preferences.course}`,
          emails: competitionData.emails,
          quizPreferences: preferences,
          type: 'private'
        });
        
        // Call the callback to navigate to lobby
        onStartCompetition();
      } else if (onSave) {
        onSave();
      }
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  };

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-4 sm:py-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-cyan-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-200/20 to-purple-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      <div className="max-w-7xl mx-auto px-2 sm:px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <Card className="relative bg-white/95 backdrop-blur-xl border-0 shadow-2xl overflow-hidden">
            {/* Animated Header */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500">
              <div className="h-full bg-gradient-to-r from-white/20 to-transparent animate-pulse" />
            </div>
            
            <CardHeader className="relative bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 border-b border-slate-200/50 p-4 sm:p-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="relative mx-auto sm:mx-0"
                  >
                    <div className={`w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br ${isCompetitionMode ? 'from-purple-500 to-pink-600' : 'from-blue-500 to-indigo-600'} rounded-3xl flex items-center justify-center shadow-2xl relative overflow-hidden`}>
                      {isCompetitionMode ? (
                        <Crown className="w-8 h-8 sm:w-12 sm:h-12 text-white relative z-10" />
                      ) : (
                        <Brain className="w-8 h-8 sm:w-12 sm:h-12 text-white relative z-10" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                      <div className="absolute -top-2 -right-2 w-4 h-4 sm:w-6 sm:h-6 bg-yellow-400 rounded-full animate-bounce" />
                    </div>
                    <div className={`absolute inset-0 bg-gradient-to-br ${isCompetitionMode ? 'from-purple-400/30 to-pink-500/30' : 'from-blue-400/30 to-indigo-500/30'} rounded-3xl blur-xl animate-pulse`} />
                  </motion.div>
                  
                  <div className="text-center sm:text-left">
                    <h2 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-slate-800 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 sm:mb-3">
                      {isCompetitionMode ? 'Create Epic Competition' : 'Craft Your Quiz'}
                    </h2>
                    <p className="text-slate-600 text-base sm:text-xl leading-relaxed">
                      {isCompetitionMode 
                        ? 'Design an engaging quiz competition and challenge your friends'
                        : 'Customize your personalized AI-powered learning experience'
                      }
                    </p>
                    <div className="flex flex-wrap justify-center sm:justify-start items-center gap-2 sm:gap-4 mt-2 sm:mt-3">
                      <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-slate-500">
                        <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>AI-Powered</span>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-slate-500">
                        <Rocket className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>Instant Generation</span>
                      </div>
                      <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-slate-500">
                        <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>Adaptive Learning</span>
                      </div>
                    </div>
                  </div>
                </div>

                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="hidden lg:block"
                >
                  <div className="relative">
                    <Gamepad2 className="w-12 h-12 sm:w-16 sm:h-16 text-purple-500" />
                    <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl animate-pulse" />
                  </div>
                </motion.div>
              </motion.div>
            </CardHeader>

            <CardBody className="p-4 sm:p-8 space-y-8 sm:space-y-12">
              <form onSubmit={handleSubmit} className="space-y-8 sm:space-y-12">
                {/* Competition Details */}
                {isCompetitionMode && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-6 sm:space-y-8"
                  >
                    <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 p-4 sm:p-8 border-2 border-amber-200/50 shadow-xl">
                      {/* Background Pattern */}
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-4 right-4 w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full blur-2xl" />
                        <div className="absolute bottom-4 left-4 w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-red-400 to-pink-400 rounded-full blur-2xl" />
                      </div>
                      
                      <div className="relative z-10">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 sm:mb-8">
                          <motion.div
                            whileHover={{ scale: 1.1, rotate: 5 }}
                            className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-xl mx-auto sm:mx-0"
                          >
                            <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                          </motion.div>
                          <div className="text-center sm:text-left">
                            <h3 className="text-2xl sm:text-3xl font-bold text-amber-800 mb-2">Competition Setup</h3>
                            <p className="text-amber-700 text-sm sm:text-base">Create an engaging competition that will challenge and excite participants</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-6 sm:gap-8">
                          <div className="space-y-4">
                            <label className="block text-sm font-bold text-amber-800 mb-2">
                              <Trophy className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2" />
                              Competition Title *
                            </label>
                            <Input
                              type="text"
                              value={competitionData.title}
                              onChange={(e) => setCompetitionData(prev => ({ ...prev, title: e.target.value }))}
                              placeholder="Enter an exciting title"
                              className="w-full bg-white/90 border-2 border-amber-300 focus:border-amber-500 focus:ring-amber-200 text-slate-800 placeholder-amber-400 py-3 sm:py-4 px-3 sm:px-4 text-base sm:text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                            />
                          </div>
                          
                          <div className="space-y-4">
                            <label className="block text-sm font-bold text-amber-800 mb-2">
                              <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2" />
                              Description (Optional)
                            </label>
                            <Input
                              type="text"
                              value={competitionData.description}
                              onChange={(e) => setCompetitionData(prev => ({ ...prev, description: e.target.value }))}
                              placeholder="Brief description"
                              className="w-full bg-white/90 border-2 border-amber-300 focus:border-amber-500 focus:ring-amber-200 text-slate-800 placeholder-amber-400 py-3 sm:py-4 px-3 sm:px-4 text-base sm:text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                            />
                          </div>
                        </div>

                        {/* Email Invitations */}
                        <div className="mt-6 sm:mt-8">
                          <label className="block text-sm font-bold text-amber-800 mb-4">
                            <Users className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2" />
                            Invite Participants (Optional)
                          </label>
                          <div className="flex flex-col sm:flex-row gap-3 mb-6">
                            <Input
                              type="email"
                              value={competitionData.emailInput}
                              onChange={(e) => setCompetitionData(prev => ({ ...prev, emailInput: e.target.value }))}
                              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addEmail())}
                              placeholder="Enter email address"
                              className="flex-1 bg-white/90 border-2 border-amber-300 focus:border-amber-500 focus:ring-amber-200 text-slate-800 placeholder-amber-400 py-3 sm:py-4 px-3 sm:px-4 text-base sm:text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                            />
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                              <Button
                                type="button"
                                onClick={addEmail}
                                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold shadow-xl hover:shadow-2xl transition-all duration-300 w-full sm:w-auto"
                              >
                                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
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
                                  className="bg-white/90 text-amber-800 px-3 sm:px-4 py-2 sm:py-3 rounded-full flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm font-semibold border-2 border-amber-300 shadow-lg hover:shadow-xl transition-all duration-300"
                                >
                                  <Mail className="w-3 h-3 sm:w-4 sm:h-4" />
                                  <span className="break-all">{email}</span>
                                  <button
                                    type="button"
                                    onClick={() => removeEmail(email)}
                                    className="hover:text-amber-900 transition-colors"
                                  >
                                    <X className="w-3 h-3 sm:w-4 sm:h-4" />
                                  </button>
                                </motion.div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Basic Quiz Settings */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="space-y-6 sm:space-y-8"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 sm:mb-8">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-xl mx-auto sm:mx-0"
                    >
                      <Settings className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </motion.div>
                    <div className="text-center sm:text-left">
                      <h3 className="text-2xl sm:text-3xl font-bold text-slate-800">Quiz Configuration</h3>
                      <p className="text-slate-600 text-base sm:text-lg">Set up the core parameters for your quiz experience</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 sm:gap-8">
                    {/* Course/Subject */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-blue-50 p-4 sm:p-6 border-2 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <div className="absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-200/30 to-indigo-200/30 rounded-full blur-xl" />
                      <label className="block text-sm font-bold text-slate-700 mb-4 flex items-center relative z-10">
                        <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-blue-600" />
                        Course/Subject *
                      </label>
                      <Input
                        type="text"
                        value={preferences.course || ''}
                        onChange={(e) => handlePreferenceChange('course', e.target.value)}
                        placeholder="e.g., Computer Science, Mathematics"
                        required
                        className="w-full bg-white/90 border-2 border-blue-300 focus:border-blue-500 focus:ring-blue-200 text-slate-800 placeholder-blue-400 py-3 sm:py-4 px-3 sm:px-4 text-base sm:text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group-hover:border-blue-400 relative z-10"
                      />
                    </motion.div>

                    {/* Topic */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-cyan-50 p-4 sm:p-6 border-2 border-cyan-200 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <div className="absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-cyan-200/30 to-teal-200/30 rounded-full blur-xl" />
                      <label className="block text-sm font-bold text-slate-700 mb-4 flex items-center relative z-10">
                        <Target className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-cyan-600" />
                        Topic (Optional)
                      </label>
                      <Input
                        type="text"
                        value={preferences.topic || ''}
                        onChange={(e) => handlePreferenceChange('topic', e.target.value)}
                        placeholder="e.g., Data Structures, Calculus"
                        className="w-full bg-white/90 border-2 border-cyan-300 focus:border-cyan-500 focus:ring-cyan-200 text-slate-800 placeholder-cyan-400 py-3 sm:py-4 px-3 sm:px-4 text-base sm:text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group-hover:border-cyan-400 relative z-10"
                      />
                    </motion.div>

                    {/* Subtopic */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-teal-50 p-4 sm:p-6 border-2 border-teal-200 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <div className="absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-teal-200/30 to-emerald-200/30 rounded-full blur-xl" />
                      <label className="block text-sm font-bold text-slate-700 mb-4 flex items-center relative z-10">
                        <Layers className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-teal-600" />
                        Subtopic (Optional)
                      </label>
                      <Input
                        type="text"
                        value={preferences.subtopic || ''}
                        onChange={(e) => handlePreferenceChange('subtopic', e.target.value)}
                        placeholder="e.g., Binary Trees, Derivatives"
                        className="w-full bg-white/90 border-2 border-teal-300 focus:border-teal-500 focus:ring-teal-200 text-slate-800 placeholder-teal-400 py-3 sm:py-4 px-3 sm:px-4 text-base sm:text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group-hover:border-teal-400 relative z-10"
                      />
                    </motion.div>

                    {/* Number of Questions */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-green-50 p-4 sm:p-6 border-2 border-green-200 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <div className="absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-green-200/30 to-emerald-200/30 rounded-full blur-xl" />
                      <label className="block text-sm font-bold text-slate-700 mb-4 flex items-center relative z-10">
                        <Calculator className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-green-600" />
                        Number of Questions
                      </label>
                      <div className="relative z-10">
                        <Input
                          type="number"
                          min="1"
                          max="50"
                          value={preferences.questionCount}
                          onChange={(e) => handlePreferenceChange('questionCount', parseInt(e.target.value))}
                          className="w-full bg-white/90 border-2 border-green-300 focus:border-green-500 focus:ring-green-200 text-slate-800 py-3 sm:py-4 px-3 sm:px-4 text-base sm:text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group-hover:border-green-400"
                        />
                        <div className="mt-2 text-xs sm:text-sm text-green-600 font-medium">
                          Recommended: 5-15 questions for optimal engagement
                        </div>
                      </div>
                    </motion.div>

                    {/* Difficulty Level */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-orange-50 p-4 sm:p-6 border-2 border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <div className="absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-orange-200/30 to-red-200/30 rounded-full blur-xl" />
                      <label className="block text-sm font-bold text-slate-700 mb-4 flex items-center relative z-10">
                        <Flame className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-orange-600" />
                        Difficulty Level
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 relative z-10">
                        {difficultyOptions.map((option) => (
                          <motion.button
                            key={option.value}
                            type="button"
                            onClick={() => handlePreferenceChange('difficulty', option.value)}
                            className={`p-3 sm:p-4 rounded-xl border-2 transition-all duration-300 text-center relative overflow-hidden ${
                              preferences.difficulty === option.value
                                ? `${option.bgColor} ${option.borderColor} ${option.textColor} shadow-lg scale-105 ring-4 ring-opacity-30`
                                : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:shadow-md hover:scale-102'
                            }`}
                            whileHover={{ scale: preferences.difficulty === option.value ? 1.05 : 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="text-2xl sm:text-3xl mb-2">{option.icon}</div>
                            <div className="font-bold text-base sm:text-lg">{option.label}</div>
                            <div className="text-xs sm:text-sm opacity-80 mt-1">{option.description}</div>
                            {preferences.difficulty === option.value && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute top-2 right-2"
                              >
                                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-current" />
                              </motion.div>
                            )}
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>

                    {/* Language */}
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-indigo-50 p-4 sm:p-6 border-2 border-indigo-200 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <div className="absolute top-0 right-0 w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-indigo-200/30 to-purple-200/30 rounded-full blur-xl" />
                      <label className="block text-sm font-bold text-slate-700 mb-4 flex items-center relative z-10">
                        <Globe className="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-indigo-600" />
                        Language
                      </label>
                      <div className="relative z-10">
                        <Select
                          value={preferences.language}
                          onChange={(e) => handlePreferenceChange('language', e.target.value)}
                          options={languageOptions.map(lang => ({ value: lang.value, label: `${lang.flag} ${lang.label}` }))}
                          className="w-full bg-white/90 border-2 border-indigo-300 focus:border-indigo-500 focus:ring-indigo-200 text-slate-800 py-3 sm:py-4 px-3 sm:px-4 text-base sm:text-lg rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group-hover:border-indigo-400"
                        />
                      </div>
                    </motion.div>
                  </div>
                </motion.div>

                {/* Quiz Mode Selection */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="space-y-6 sm:space-y-8"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 sm:mb-8">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl mx-auto sm:mx-0"
                    >
                      <Play className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </motion.div>
                    <div className="text-center sm:text-left">
                      <h4 className="text-2xl sm:text-3xl font-bold text-slate-800">Quiz Mode</h4>
                      <p className="text-slate-600 text-base sm:text-lg">Choose how you want to receive feedback during the quiz</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 sm:gap-6">
                    {modeOptions.map((mode) => (
                      <motion.button
                        key={mode.value}
                        type="button"
                        onClick={() => handlePreferenceChange('mode', mode.value)}
                        className={`p-4 sm:p-6 rounded-2xl border-2 transition-all duration-300 text-left group relative overflow-hidden ${
                          preferences.mode === mode.value
                            ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 text-purple-700 shadow-xl scale-105 ring-4 ring-purple-200 ring-opacity-30'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-purple-300 hover:bg-gradient-to-br hover:from-purple-50 hover:to-pink-50 hover:scale-102 hover:shadow-lg'
                        }`}
                        whileHover={{ scale: preferences.mode === mode.value ? 1.05 : 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className={`absolute inset-0 bg-gradient-to-br ${mode.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                        
                        <div className="relative z-10">
                          <div className="flex items-center space-x-3 mb-3">
                            <span className="text-2xl sm:text-3xl">{mode.icon}</span>
                            <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
                              preferences.mode === mode.value
                                ? 'border-purple-600 bg-purple-600'
                                : 'border-slate-400 group-hover:border-purple-400'
                            }`}>
                              {preferences.mode === mode.value && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                >
                                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                                </motion.div>
                              )}
                            </div>
                          </div>
                          <div className="font-bold text-base sm:text-lg mb-2">{mode.label}</div>
                          <div className="text-xs sm:text-sm opacity-80 leading-relaxed">{mode.description}</div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                {/* Time Settings */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="space-y-6 sm:space-y-8"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 sm:mb-8">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-xl mx-auto sm:mx-0"
                    >
                      <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </motion.div>
                    <div className="text-center sm:text-left">
                      <h4 className="text-2xl sm:text-3xl font-bold text-slate-800">Time Settings</h4>
                      <p className="text-slate-600 text-base sm:text-lg">Configure time limits for your quiz</p>
                    </div>
                  </div>

                  {/* Time Mode Selection */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                    {[
                      { value: 'none', label: 'No Time Limit', description: 'Take as much time as needed', icon: '∞' },
                      { value: 'per-question', label: 'Per Question', description: 'Set time limit for each question', icon: '⏱️' },
                      { value: 'total', label: 'Total Time', description: 'Set total time for entire quiz', icon: '⏰' }
                    ].map((option) => (
                      <motion.button
                        key={option.value}
                        type="button"
                        onClick={() => handleTimeModeChange(option.value as any)}
                        className={`p-4 sm:p-6 rounded-2xl border-2 transition-all duration-300 text-center ${
                          timeMode === option.value
                            ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-lg scale-105'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-orange-300 hover:bg-orange-50 hover:scale-102'
                        }`}
                        whileHover={{ scale: timeMode === option.value ? 1.05 : 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="text-2xl sm:text-3xl mb-2">{option.icon}</div>
                        <div className="font-bold text-base sm:text-lg mb-2">{option.label}</div>
                        <div className="text-xs sm:text-sm opacity-80">{option.description}</div>
                      </motion.button>
                    ))}
                  </div>

                  {/* Time Input Fields */}
                  {timeMode === 'per-question' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="bg-orange-50 p-4 sm:p-6 rounded-2xl border border-orange-200"
                    >
                      <label className="block text-sm font-bold text-orange-800 mb-4">
                        <Timer className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2" />
                        Time per Question (seconds)
                      </label>
                      <Input
                        type="number"
                        min="10"
                        max="300"
                        value={preferences.timeLimit || '30'}
                        onChange={(e) => handlePreferenceChange('timeLimit', e.target.value)}
                        className="w-full bg-white border-2 border-orange-300 focus:border-orange-500 py-3 px-4 text-lg rounded-xl text-gray-900 placeholder-gray-500"
                      />
                      {calculateTimeReference() && (
                        <div className="mt-2 text-sm text-orange-600 font-medium">
                          {calculateTimeReference()}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {timeMode === 'total' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="bg-orange-50 p-4 sm:p-6 rounded-2xl border border-orange-200"
                    >
                      <label className="block text-sm font-bold text-orange-800 mb-4">
                        <Timer className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2" />
                        Total Quiz Time (seconds)
                      </label>
                      <Input
                        type="number"
                        min="60"
                        max="3600"
                        value={preferences.totalTimeLimit || '600'}
                        onChange={(e) => handlePreferenceChange('totalTimeLimit', e.target.value)}
                        className="w-full bg-white border-2 border-orange-300 focus:border-orange-500 py-3 px-4 text-lg rounded-xl text-gray-900 placeholder-gray-500"
                      />
                      {calculateTimeReference() && (
                        <div className="mt-2 text-sm text-orange-600 font-medium">
                          {calculateTimeReference()}
                        </div>
                      )}
                    </motion.div>
                  )}
                </motion.div>

                {/* Negative Marking */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  className="space-y-6 sm:space-y-8"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 sm:mb-8">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl mx-auto sm:mx-0"
                    >
                      <Calculator className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </motion.div>
                    <div className="text-center sm:text-left">
                      <h4 className="text-2xl sm:text-3xl font-bold text-slate-800">Scoring System</h4>
                      <p className="text-slate-600 text-base sm:text-lg">Configure how points are awarded and deducted</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-red-50 to-pink-50 p-4 sm:p-6 rounded-2xl border border-red-200">
                    <div className="flex items-center space-x-4 mb-4">
                      <motion.button
                        type="button"
                        onClick={() => handlePreferenceChange('negativeMarking', !preferences.negativeMarking)}
                        className={`w-5 h-5 sm:w-6 sm:h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
                          preferences.negativeMarking
                            ? 'border-red-600 bg-red-600'
                            : 'border-slate-400 hover:border-red-400'
                        }`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {preferences.negativeMarking && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          >
                            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                          </motion.div>
                        )}
                      </motion.button>
                      <label className="text-base sm:text-lg font-bold text-red-800">
                        Enable Negative Marking
                      </label>
                    </div>
                    
                    {preferences.negativeMarking && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-4"
                      >
                        <label className="block text-sm font-bold text-red-800 mb-2">
                          Marks deducted per wrong answer
                        </label>
                        <Input
                          type="number"
                          min="-5"
                          max="0"
                          step="0.25"
                          value={preferences.negativeMarks || -0.25}
                          onChange={(e) => handlePreferenceChange('negativeMarks', parseFloat(e.target.value))}
                          className="w-full bg-white border-2 border-red-300 focus:border-red-500 py-3 px-4 text-lg rounded-xl text-gray-900 placeholder-gray-500"
                        />
                        <div className="mt-2 text-sm text-red-600">
                          Common values: -0.25, -0.33, -0.5, -1
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>

                {/* Question Types */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="space-y-6 sm:space-y-8"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 sm:mb-8">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-xl mx-auto sm:mx-0"
                    >
                      <Grid3X3 className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                    </motion.div>
                    <div className="text-center sm:text-left">
                      <h4 className="text-2xl sm:text-3xl font-bold text-slate-800">Question Arsenal</h4>
                      <p className="text-slate-600 text-base sm:text-lg">Choose the types of questions that will challenge and engage learners</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {questionTypeOptions.map((type, index) => (
                      <motion.button
                        key={type.value}
                        type="button"
                        onClick={() => handleQuestionTypeToggle(type.value)}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.9 + index * 0.1 }}
                        className={`p-4 sm:p-6 rounded-2xl border-2 transition-all duration-300 text-left group relative overflow-hidden ${
                          preferences.questionTypes?.includes(type.value)
                            ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 text-purple-700 shadow-xl scale-105 ring-4 ring-purple-200 ring-opacity-30'
                            : 'border-slate-200 bg-white text-slate-700 hover:border-purple-300 hover:bg-gradient-to-br hover:from-purple-50 hover:to-pink-50 hover:scale-102 hover:shadow-lg'
                        }`}
                        whileHover={{ scale: preferences.questionTypes?.includes(type.value) ? 1.05 : 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        {/* Background Gradient */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${type.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
                        
                        <div className="relative z-10">
                          <div className="flex items-center space-x-3 mb-3">
                            <span className="text-2xl sm:text-3xl">{type.icon}</span>
                            <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-300 ${
                              preferences.questionTypes?.includes(type.value)
                                ? 'border-purple-600 bg-purple-600'
                                : 'border-slate-400 group-hover:border-purple-400'
                            }`}>
                              {preferences.questionTypes?.includes(type.value) && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                >
                                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                                </motion.div>
                              )}
                            </div>
                          </div>
                          <div className="font-bold text-base sm:text-lg mb-2">{type.label}</div>
                          <div className="text-xs sm:text-sm opacity-80 leading-relaxed">{type.description}</div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                  
                  {(!preferences.questionTypes || preferences.questionTypes.length === 0) && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center space-x-3 text-red-500 bg-red-50 p-4 sm:p-6 rounded-xl border-2 border-red-200 shadow-lg"
                    >
                      <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
                      <span className="font-semibold text-base sm:text-lg">Please select at least one question type to continue</span>
                    </motion.div>
                  )}
                </motion.div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border-2 border-red-200 text-red-700 px-4 sm:px-6 py-3 sm:py-4 rounded-xl shadow-lg"
                  >
                    <div className="flex items-center">
                      <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 mr-3" />
                      <span className="font-medium">{error}</span>
                    </div>
                  </motion.div>
                )}

                {/* Submit Button */}
                <div className="flex justify-center pt-6 sm:pt-8">
                  <motion.div 
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }}
                    className="relative"
                  >
                    <Button
                      type="submit"
                      disabled={isLoading || !preferences.course || !preferences.questionTypes?.length}
                      className="relative bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 hover:from-purple-700 hover:via-blue-700 hover:to-indigo-700 text-white px-12 sm:px-20 py-4 sm:py-6 text-lg sm:text-xl font-bold rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      
                      {isLoading ? (
                        <div className="flex items-center space-x-3">
                          <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Processing...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-3">
                          {isCompetitionMode ? (
                            <>
                              <Crown className="w-5 h-5 sm:w-6 sm:h-6" />
                              <span>Create Competition</span>
                              <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />
                            </>
                          ) : (
                            <>
                              <Rocket className="w-5 h-5 sm:w-6 sm:h-6" />
                              <span>Start Quiz</span>
                              <Lightning className="w-5 h-5 sm:w-6 sm:h-6" />
                            </>
                          )}
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