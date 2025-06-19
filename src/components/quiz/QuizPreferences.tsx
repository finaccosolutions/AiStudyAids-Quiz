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
  Timer, Award, Sparkles, Star
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

  useEffect(() => {
    setPreferences(initialPreferences);
  }, [initialPreferences]);

  const questionTypeOptions = [
    { value: 'multiple-choice', label: 'Multiple Choice' },
    { value: 'true-false', label: 'True/False' },
    { value: 'multi-select', label: 'Multi-Select' },
    { value: 'sequence', label: 'Sequence' },
    { value: 'case-study', label: 'Case Study' },
    { value: 'situation', label: 'Situation' },
    { value: 'short-answer', label: 'Short Answer' },
    { value: 'fill-blank', label: 'Fill in the Blank' }
  ];

  const difficultyOptions = [
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' }
  ];

  const languageOptions = [
    { value: 'English', label: 'English' },
    { value: 'Hindi', label: 'Hindi' },
    { value: 'Malayalam', label: 'Malayalam' },
    { value: 'Tamil', label: 'Tamil' },
    { value: 'Telugu', label: 'Telugu' }
  ];

  const modeOptions = [
    { value: 'practice', label: 'Practice Mode' },
    { value: 'exam', label: 'Exam Mode' }
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
    
    // Ensure at least one type is selected
    if (newTypes.length > 0) {
      handlePreferenceChange('questionTypes', newTypes);
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <Card className="shadow-2xl border-0 overflow-hidden bg-white/95 backdrop-blur-sm">
          {/* Gradient Header */}
          <div className="h-2 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500" />
          
          <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100 p-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-6"
            >
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-xl">
                {isCompetitionMode ? (
                  <Crown className="w-10 h-10 text-white" />
                ) : (
                  <Brain className="w-10 h-10 text-white" />
                )}
              </div>
              <div>
                <h2 className="text-4xl font-bold text-gray-800 mb-2">
                  {isCompetitionMode ? 'Create Competition' : 'Quiz Preferences'}
                </h2>
                <p className="text-gray-600 text-xl">
                  {isCompetitionMode 
                    ? 'Set up your quiz competition and invite participants'
                    : 'Customize your learning experience'
                  }
                </p>
              </div>
            </motion.div>
          </CardHeader>

          <CardBody className="p-8">
            <form onSubmit={handleSubmit} className="space-y-10">
              {/* Competition Details (only for competition mode) */}
              {isCompetitionMode && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-8 rounded-2xl border-2 border-yellow-200 shadow-lg">
                    <h3 className="text-2xl font-bold text-yellow-800 mb-6 flex items-center">
                      <Crown className="w-7 h-7 mr-3" />
                      Competition Details
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Competition Title
                        </label>
                        <Input
                          type="text"
                          value={competitionData.title}
                          onChange={(e) => setCompetitionData(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Enter competition title"
                          className="w-full bg-white border-2 border-yellow-300 focus:border-yellow-500 focus:ring-yellow-200 text-gray-800 placeholder-gray-500 py-3 px-4 text-lg rounded-xl"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          Description (Optional)
                        </label>
                        <Input
                          type="text"
                          value={competitionData.description}
                          onChange={(e) => setCompetitionData(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Brief description"
                          className="w-full bg-white border-2 border-yellow-300 focus:border-yellow-500 focus:ring-yellow-200 text-gray-800 placeholder-gray-500 py-3 px-4 text-lg rounded-xl"
                        />
                      </div>
                    </div>

                    {/* Email Invitations */}
                    <div className="mt-8">
                      <label className="block text-sm font-semibold text-gray-700 mb-3">
                        Invite Participants (Optional)
                      </label>
                      <div className="flex space-x-3 mb-4">
                        <Input
                          type="email"
                          value={competitionData.emailInput}
                          onChange={(e) => setCompetitionData(prev => ({ ...prev, emailInput: e.target.value }))}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addEmail())}
                          placeholder="Enter email address"
                          className="flex-1 bg-white border-2 border-yellow-300 focus:border-yellow-500 focus:ring-yellow-200 text-gray-800 placeholder-gray-500 py-3 px-4 text-lg rounded-xl"
                        />
                        <Button
                          type="button"
                          onClick={addEmail}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                          <Plus className="w-5 h-5" />
                        </Button>
                      </div>
                      
                      {competitionData.emails.length > 0 && (
                        <div className="flex flex-wrap gap-3">
                          {competitionData.emails.map((email, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full flex items-center space-x-2 text-sm font-medium border border-yellow-300"
                            >
                              <Mail className="w-4 h-4" />
                              <span>{email}</span>
                              <button
                                type="button"
                                onClick={() => removeEmail(email)}
                                className="hover:text-yellow-900 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </motion.div>
                          ))}
                        </div>
                      )}
                      
                      <p className="text-sm text-gray-600 mt-3">
                        You can also share the competition code after creation for others to join
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Basic Quiz Settings */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-8"
              >
                <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                  <Settings className="w-7 h-7 mr-3 text-purple-600" />
                  Quiz Configuration
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700">
                      <BookOpen className="w-5 h-5 inline mr-2" />
                      Course/Subject *
                    </label>
                    <Input
                      type="text"
                      value={preferences.course || ''}
                      onChange={(e) => handlePreferenceChange('course', e.target.value)}
                      placeholder="e.g., Computer Science, Mathematics"
                      required
                      className="w-full bg-white border-2 border-gray-300 focus:border-purple-500 focus:ring-purple-200 text-gray-800 placeholder-gray-500 py-3 px-4 text-lg rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700">
                      <Target className="w-5 h-5 inline mr-2" />
                      Topic (Optional)
                    </label>
                    <Input
                      type="text"
                      value={preferences.topic || ''}
                      onChange={(e) => handlePreferenceChange('topic', e.target.value)}
                      placeholder="e.g., Data Structures, Calculus"
                      className="w-full bg-white border-2 border-gray-300 focus:border-purple-500 focus:ring-purple-200 text-gray-800 placeholder-gray-500 py-3 px-4 text-lg rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700">
                      Subtopic (Optional)
                    </label>
                    <Input
                      type="text"
                      value={preferences.subtopic || ''}
                      onChange={(e) => handlePreferenceChange('subtopic', e.target.value)}
                      placeholder="e.g., Binary Trees, Derivatives"
                      className="w-full bg-white border-2 border-gray-300 focus:border-purple-500 focus:ring-purple-200 text-gray-800 placeholder-gray-500 py-3 px-4 text-lg rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700">
                      Number of Questions
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max="50"
                      value={preferences.questionCount}
                      onChange={(e) => handlePreferenceChange('questionCount', parseInt(e.target.value))}
                      className="w-full bg-white border-2 border-gray-300 focus:border-purple-500 focus:ring-purple-200 text-gray-800 py-3 px-4 text-lg rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700">
                      Difficulty Level
                    </label>
                    <select
                      value={preferences.difficulty}
                      onChange={(e) => handlePreferenceChange('difficulty', e.target.value)}
                      className="w-full bg-white border-2 border-gray-300 focus:border-purple-500 focus:ring-purple-200 text-gray-800 py-3 px-4 text-lg rounded-xl shadow-sm hover:shadow-md transition-all duration-300 appearance-none cursor-pointer"
                    >
                      {difficultyOptions.map((option) => (
                        <option key={option.value} value={option.value} className="text-gray-800">
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700">
                      <Globe className="w-5 h-5 inline mr-2" />
                      Language
                    </label>
                    <select
                      value={preferences.language}
                      onChange={(e) => handlePreferenceChange('language', e.target.value)}
                      className="w-full bg-white border-2 border-gray-300 focus:border-purple-500 focus:ring-purple-200 text-gray-800 py-3 px-4 text-lg rounded-xl shadow-sm hover:shadow-md transition-all duration-300 appearance-none cursor-pointer"
                    >
                      {languageOptions.map((option) => (
                        <option key={option.value} value={option.value} className="text-gray-800">
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </motion.div>

              {/* Question Types */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-6"
              >
                <h4 className="text-xl font-semibold text-gray-800 flex items-center">
                  <Star className="w-6 h-6 mr-2 text-purple-600" />
                  Question Types
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {questionTypeOptions.map((type) => (
                    <motion.button
                      key={type.value}
                      type="button"
                      onClick={() => handleQuestionTypeToggle(type.value)}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 text-left hover:scale-105 hover:shadow-lg ${
                        preferences.questionTypes?.includes(type.value)
                          ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-lg scale-105'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-purple-300 hover:bg-purple-50'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                          preferences.questionTypes?.includes(type.value)
                            ? 'border-purple-600 bg-purple-600'
                            : 'border-gray-400'
                        }`}>
                          {preferences.questionTypes?.includes(type.value) && (
                            <CheckCircle className="w-4 h-4 text-white" />
                          )}
                        </div>
                        <span className="font-medium text-sm">{type.label}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
                {(!preferences.questionTypes || preferences.questionTypes.length === 0) && (
                  <p className="text-red-500 text-sm flex items-center">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Please select at least one question type
                  </p>
                )}
              </motion.div>

              {/* Advanced Settings */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-6"
              >
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 font-semibold text-lg transition-colors"
                >
                  <Sparkles className="w-6 h-6" />
                  <span>Advanced Settings</span>
                  <motion.div
                    animate={{ rotate: showAdvanced ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CheckCircle className="w-5 h-5" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {showAdvanced && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-8 bg-gray-50 p-8 rounded-2xl border-2 border-gray-200 shadow-inner"
                    >
                      {/* Quiz Mode */}
                      <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-700">
                          Quiz Mode
                        </label>
                        <select
                          value={preferences.mode}
                          onChange={(e) => handlePreferenceChange('mode', e.target.value)}
                          className="w-full bg-white border-2 border-gray-300 focus:border-purple-500 focus:ring-purple-200 text-gray-800 py-3 px-4 text-lg rounded-xl shadow-sm hover:shadow-md transition-all duration-300 appearance-none cursor-pointer"
                        >
                          {modeOptions.map((option) => (
                            <option key={option.value} value={option.value} className="text-gray-800">
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <p className="text-sm text-gray-600">
                          Practice: Immediate feedback | Exam: Feedback at the end
                        </p>
                      </div>

                      {/* Time Limits */}
                      <div className="space-y-6">
                        <div className="flex items-center space-x-4">
                          <input
                            type="checkbox"
                            id="timeLimitEnabled"
                            checked={preferences.timeLimitEnabled}
                            onChange={(e) => handlePreferenceChange('timeLimitEnabled', e.target.checked)}
                            className="w-5 h-5 text-purple-600 border-2 border-gray-300 rounded focus:ring-purple-500"
                          />
                          <label htmlFor="timeLimitEnabled" className="text-sm font-semibold text-gray-700">
                            <Clock className="w-5 h-5 inline mr-2" />
                            Enable Time Limits
                          </label>
                        </div>

                        {preferences.timeLimitEnabled && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ml-9">
                            <div className="space-y-3">
                              <label className="block text-sm font-semibold text-gray-700">
                                Time per Question (seconds)
                              </label>
                              <Input
                                type="number"
                                min="10"
                                max="300"
                                value={preferences.timeLimit || ''}
                                onChange={(e) => handlePreferenceChange('timeLimit', e.target.value)}
                                placeholder="e.g., 30"
                                className="w-full bg-white border-2 border-gray-300 focus:border-purple-500 focus:ring-purple-200 text-gray-800 placeholder-gray-500 py-3 px-4 text-lg rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
                              />
                            </div>
                            <div className="space-y-3">
                              <label className="block text-sm font-semibold text-gray-700">
                                Total Quiz Time (seconds)
                              </label>
                              <Input
                                type="number"
                                min="60"
                                max="3600"
                                value={preferences.totalTimeLimit || ''}
                                onChange={(e) => handlePreferenceChange('totalTimeLimit', e.target.value)}
                                placeholder="e.g., 600"
                                className="w-full bg-white border-2 border-gray-300 focus:border-purple-500 focus:ring-purple-200 text-gray-800 placeholder-gray-500 py-3 px-4 text-lg rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
                              />
                            </div>
                          </div>
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
                            className="w-5 h-5 text-purple-600 border-2 border-gray-300 rounded focus:ring-purple-500"
                          />
                          <label htmlFor="negativeMarking" className="text-sm font-semibold text-gray-700">
                            <Target className="w-5 h-5 inline mr-2" />
                            Enable Negative Marking
                          </label>
                        </div>

                        {preferences.negativeMarking && (
                          <div className="ml-9 space-y-3">
                            <label className="block text-sm font-semibold text-gray-700">
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
                              className="w-full max-w-xs bg-white border-2 border-gray-300 focus:border-purple-500 focus:ring-purple-200 text-gray-800 placeholder-gray-500 py-3 px-4 text-lg rounded-xl shadow-sm hover:shadow-md transition-all duration-300"
                            />
                          </div>
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
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    type="submit"
                    disabled={isLoading || !preferences.course || !preferences.questionTypes?.length}
                    className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-16 py-4 text-xl font-bold rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
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
                            <Zap className="w-6 h-6" />
                            <span>Start Quiz</span>
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
      </div>
    </div>
  );
};

export default QuizPreferencesForm;