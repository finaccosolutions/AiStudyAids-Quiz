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
  Timer, Award, Sparkles
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
    <div className="max-w-4xl mx-auto">
      <Card className="shadow-2xl border-2 border-purple-100 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-500" />
        
        <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-xl">
              {isCompetitionMode ? (
                <Crown className="w-8 h-8 text-white" />
              ) : (
                <Brain className="w-8 h-8 text-white" />
              )}
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-800">
                {isCompetitionMode ? 'Create Competition' : 'Quiz Preferences'}
              </h2>
              <p className="text-gray-600 text-lg">
                {isCompetitionMode 
                  ? 'Set up your quiz competition and invite participants'
                  : 'Customize your learning experience'
                }
              </p>
            </div>
          </div>
        </CardHeader>

        <CardBody className="p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Competition Details (only for competition mode) */}
            {isCompetitionMode && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-2xl border border-yellow-200">
                  <h3 className="text-xl font-bold text-yellow-800 mb-4 flex items-center">
                    <Crown className="w-6 h-6 mr-2" />
                    Competition Details
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Competition Title
                      </label>
                      <Input
                        type="text"
                        value={competitionData.title}
                        onChange={(e) => setCompetitionData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter competition title"
                        className="w-full bg-white border-yellow-300 focus:border-yellow-500 focus:ring-yellow-200"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description (Optional)
                      </label>
                      <Input
                        type="text"
                        value={competitionData.description}
                        onChange={(e) => setCompetitionData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Brief description"
                        className="w-full bg-white border-yellow-300 focus:border-yellow-500 focus:ring-yellow-200"
                      />
                    </div>
                  </div>

                  {/* Email Invitations */}
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Invite Participants (Optional)
                    </label>
                    <div className="flex space-x-2 mb-3">
                      <Input
                        type="email"
                        value={competitionData.emailInput}
                        onChange={(e) => setCompetitionData(prev => ({ ...prev, emailInput: e.target.value }))}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addEmail())}
                        placeholder="Enter email address"
                        className="flex-1 bg-white border-yellow-300 focus:border-yellow-500 focus:ring-yellow-200"
                      />
                      <Button
                        type="button"
                        onClick={addEmail}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-4"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    
                    {competitionData.emails.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {competitionData.emails.map((email, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full flex items-center space-x-2 text-sm"
                          >
                            <Mail className="w-3 h-3" />
                            <span>{email}</span>
                            <button
                              type="button"
                              onClick={() => removeEmail(email)}
                              className="hover:text-yellow-900"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    )}
                    
                    <p className="text-xs text-gray-500 mt-2">
                      You can also share the competition code after creation for others to join
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Basic Quiz Settings */}
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-800 flex items-center">
                <Settings className="w-6 h-6 mr-2 text-purple-600" />
                Quiz Configuration
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <BookOpen className="w-4 h-4 inline mr-2" />
                    Course/Subject *
                  </label>
                  <Input
                    type="text"
                    value={preferences.course || ''}
                    onChange={(e) => handlePreferenceChange('course', e.target.value)}
                    placeholder="e.g., Computer Science, Mathematics"
                    required
                    className="w-full bg-white border-gray-300 focus:border-purple-500 focus:ring-purple-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Target className="w-4 h-4 inline mr-2" />
                    Topic (Optional)
                  </label>
                  <Input
                    type="text"
                    value={preferences.topic || ''}
                    onChange={(e) => handlePreferenceChange('topic', e.target.value)}
                    placeholder="e.g., Data Structures, Calculus"
                    className="w-full bg-white border-gray-300 focus:border-purple-500 focus:ring-purple-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subtopic (Optional)
                  </label>
                  <Input
                    type="text"
                    value={preferences.subtopic || ''}
                    onChange={(e) => handlePreferenceChange('subtopic', e.target.value)}
                    placeholder="e.g., Binary Trees, Derivatives"
                    className="w-full bg-white border-gray-300 focus:border-purple-500 focus:ring-purple-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Questions
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="50"
                    value={preferences.questionCount}
                    onChange={(e) => handlePreferenceChange('questionCount', parseInt(e.target.value))}
                    className="w-full bg-white border-gray-300 focus:border-purple-500 focus:ring-purple-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Difficulty Level
                  </label>
                  <Select
                    options={difficultyOptions}
                    value={preferences.difficulty}
                    onChange={(e) => handlePreferenceChange('difficulty', e.target.value)}
                    className="w-full bg-white border-gray-300 focus:border-purple-500 focus:ring-purple-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Globe className="w-4 h-4 inline mr-2" />
                    Language
                  </label>
                  <Select
                    options={languageOptions}
                    value={preferences.language}
                    onChange={(e) => handlePreferenceChange('language', e.target.value)}
                    className="w-full bg-white border-gray-300 focus:border-purple-500 focus:ring-purple-200"
                  />
                </div>
              </div>
            </div>

            {/* Question Types */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-800">Question Types</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {questionTypeOptions.map((type) => (
                  <motion.button
                    key={type.value}
                    type="button"
                    onClick={() => handleQuestionTypeToggle(type.value)}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                      preferences.questionTypes?.includes(type.value)
                        ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-lg'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-purple-300 hover:bg-purple-50'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center space-x-2">
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                        preferences.questionTypes?.includes(type.value)
                          ? 'border-purple-600 bg-purple-600'
                          : 'border-gray-400'
                      }`}>
                        {preferences.questionTypes?.includes(type.value) && (
                          <CheckCircle className="w-3 h-3 text-white" />
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
            </div>

            {/* Advanced Settings */}
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 font-medium"
              >
                <Sparkles className="w-5 h-5" />
                <span>Advanced Settings</span>
                <motion.div
                  animate={{ rotate: showAdvanced ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <CheckCircle className="w-4 h-4" />
                </motion.div>
              </button>

              <AnimatePresence>
                {showAdvanced && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6 bg-gray-50 p-6 rounded-xl border border-gray-200"
                  >
                    {/* Quiz Mode */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quiz Mode
                      </label>
                      <Select
                        options={modeOptions}
                        value={preferences.mode}
                        onChange={(e) => handlePreferenceChange('mode', e.target.value)}
                        className="w-full bg-white border-gray-300 focus:border-purple-500 focus:ring-purple-200"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Practice: Immediate feedback | Exam: Feedback at the end
                      </p>
                    </div>

                    {/* Time Limits */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="timeLimitEnabled"
                          checked={preferences.timeLimitEnabled}
                          onChange={(e) => handlePreferenceChange('timeLimitEnabled', e.target.checked)}
                          className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                        />
                        <label htmlFor="timeLimitEnabled" className="text-sm font-medium text-gray-700">
                          <Clock className="w-4 h-4 inline mr-2" />
                          Enable Time Limits
                        </label>
                      </div>

                      {preferences.timeLimitEnabled && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-7">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Time per Question (seconds)
                            </label>
                            <Input
                              type="number"
                              min="10"
                              max="300"
                              value={preferences.timeLimit || ''}
                              onChange={(e) => handlePreferenceChange('timeLimit', e.target.value)}
                              placeholder="e.g., 30"
                              className="w-full bg-white border-gray-300 focus:border-purple-500 focus:ring-purple-200"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Total Quiz Time (seconds)
                            </label>
                            <Input
                              type="number"
                              min="60"
                              max="3600"
                              value={preferences.totalTimeLimit || ''}
                              onChange={(e) => handlePreferenceChange('totalTimeLimit', e.target.value)}
                              placeholder="e.g., 600"
                              className="w-full bg-white border-gray-300 focus:border-purple-500 focus:ring-purple-200"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Negative Marking */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id="negativeMarking"
                          checked={preferences.negativeMarking}
                          onChange={(e) => handlePreferenceChange('negativeMarking', e.target.checked)}
                          className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                        />
                        <label htmlFor="negativeMarking" className="text-sm font-medium text-gray-700">
                          <Target className="w-4 h-4 inline mr-2" />
                          Enable Negative Marking
                        </label>
                      </div>

                      {preferences.negativeMarking && (
                        <div className="ml-7">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
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
                            className="w-full max-w-xs bg-white border-gray-300 focus:border-purple-500 focus:ring-purple-200"
                          />
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
              >
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  {error}
                </div>
              </motion.div>
            )}

            {/* Submit Button */}
            <div className="flex justify-center pt-6">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  type="submit"
                  disabled={isLoading || !preferences.course || !preferences.questionTypes?.length}
                  className="gradient-bg hover:opacity-90 transition-all duration-300 px-12 py-4 text-lg font-bold shadow-xl"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      {isCompetitionMode ? (
                        <>
                          <Crown className="w-5 h-5" />
                          <span>Create Competition</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-5 h-5" />
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
  );
};

export default QuizPreferencesForm;