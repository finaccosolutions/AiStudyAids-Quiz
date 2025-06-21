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
  BookOpen, Target, Clock, Globe, Zap, Settings, 
  Users, Trophy, Play, Sparkles, Brain, Timer,
  CheckCircle, AlertTriangle, Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';

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
  const { savePreferences, isLoading, error } = useQuizStore();
  const { createCompetition } = useCompetitionStore();
  const { user } = useAuthStore();
  const [preferences, setPreferences] = useState<QuizPreferences>(initialPreferences);
  const [emails, setEmails] = useState<string[]>(['']);
  const [competitionTitle, setCompetitionTitle] = useState('');
  const [competitionDescription, setCompetitionDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isCompetitionMode = !!onStartCompetition;

  useEffect(() => {
    setPreferences(initialPreferences);
  }, [initialPreferences]);

  const questionTypeOptions = [
    { value: 'multiple-choice', label: 'Multiple Choice' },
    { value: 'true-false', label: 'True/False' },
    { value: 'fill-blank', label: 'Fill in the Blank' },
    { value: 'short-answer', label: 'Short Answer' },
    { value: 'sequence', label: 'Sequence' },
    { value: 'case-study', label: 'Case Study' },
    { value: 'situation', label: 'Situation' },
    { value: 'multi-select', label: 'Multi-Select' }
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

  const handleQuestionTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      setPreferences(prev => ({
        ...prev,
        questionTypes: [...prev.questionTypes, type as any]
      }));
    } else {
      setPreferences(prev => ({
        ...prev,
        questionTypes: prev.questionTypes.filter(t => t !== type)
      }));
    }
  };

  const addEmailField = () => {
    setEmails([...emails, '']);
  };

  const removeEmailField = (index: number) => {
    setEmails(emails.filter((_, i) => i !== index));
  };

  const updateEmail = (index: number, value: string) => {
    const newEmails = [...emails];
    newEmails[index] = value;
    setEmails(newEmails);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Always set mode to 'exam' for competitions
      const finalPreferences = {
        ...preferences,
        mode: isCompetitionMode ? 'exam' as const : preferences.mode,
        answerMode: isCompetitionMode ? 'end' as const : preferences.answerMode
      };

      await savePreferences(userId, finalPreferences);

      if (isCompetitionMode && onStartCompetition) {
        // Create competition
        const validEmails = emails.filter(email => email.trim() && email.includes('@'));
        
        const competitionData = {
          title: competitionTitle || `${finalPreferences.course} Quiz Competition`,
          description: competitionDescription || `Test your knowledge in ${finalPreferences.course}`,
          type: 'private',
          quizPreferences: finalPreferences,
          emails: validEmails
        };

        await createCompetition(competitionData);
        onStartCompetition();
      } else if (onSave) {
        onSave();
      }
    } catch (error) {
      console.error('Failed to save preferences:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="shadow-2xl border-2 border-purple-100 overflow-hidden">
        <CardHeader className={`${isCompetitionMode ? 'bg-gradient-to-r from-purple-500 to-indigo-500' : 'bg-gradient-to-r from-blue-500 to-cyan-500'} text-white`}>
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              {isCompetitionMode ? <Trophy className="w-8 h-8" /> : <Settings className="w-8 h-8" />}
            </div>
            <div>
              <h2 className="text-3xl font-bold">
                {isCompetitionMode ? 'Create Competition' : 'Quiz Preferences'}
              </h2>
              <p className="text-lg opacity-90">
                {isCompetitionMode ? 'Set up your competition and invite participants' : 'Customize your learning experience'}
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
                <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                  <Users className="w-6 h-6 mr-3 text-purple-600" />
                  Competition Details
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Competition Title
                    </label>
                    <Input
                      type="text"
                      value={competitionTitle}
                      onChange={(e) => setCompetitionTitle(e.target.value)}
                      placeholder="Enter competition title"
                      className="w-full bg-white text-gray-900 border-gray-300"
                      isFullWidth
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description (Optional)
                    </label>
                    <Input
                      type="text"
                      value={competitionDescription}
                      onChange={(e) => setCompetitionDescription(e.target.value)}
                      placeholder="Brief description"
                      className="w-full bg-white text-gray-900 border-gray-300"
                      isFullWidth
                    />
                  </div>
                </div>

                {/* Email Invitations */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Invite Participants (Optional)
                  </label>
                  <div className="space-y-3">
                    {emails.map((email, index) => (
                      <div key={index} className="flex space-x-2">
                        <Input
                          type="email"
                          value={email}
                          onChange={(e) => updateEmail(index, e.target.value)}
                          placeholder="participant@example.com"
                          className="flex-1 bg-white text-gray-900 border-gray-300"
                        />
                        {emails.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => removeEmailField(index)}
                            className="px-3"
                          >
                            ×
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      onClick={addEmailField}
                      className="text-purple-600 border-purple-200 hover:bg-purple-50"
                    >
                      + Add Another Email
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Quiz Configuration */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-6"
            >
              <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                <Brain className="w-6 h-6 mr-3 text-blue-600" />
                Quiz Configuration
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <BookOpen className="w-4 h-4 inline mr-1" />
                    Course/Subject *
                  </label>
                  <Input
                    type="text"
                    value={preferences.course || ''}
                    onChange={(e) => setPreferences(prev => ({ ...prev, course: e.target.value }))}
                    placeholder="e.g., Computer Science, Mathematics"
                    required
                    className="w-full bg-white text-gray-900 border-gray-300 placeholder-gray-500"
                    isFullWidth
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Topic (Optional)
                  </label>
                  <Input
                    type="text"
                    value={preferences.topic || ''}
                    onChange={(e) => setPreferences(prev => ({ ...prev, topic: e.target.value }))}
                    placeholder="e.g., Data Structures, Calculus"
                    className="w-full bg-white text-gray-900 border-gray-300 placeholder-gray-500"
                    isFullWidth
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subtopic (Optional)
                  </label>
                  <Input
                    type="text"
                    value={preferences.subtopic || ''}
                    onChange={(e) => setPreferences(prev => ({ ...prev, subtopic: e.target.value }))}
                    placeholder="e.g., Binary Trees, Derivatives"
                    className="w-full bg-white text-gray-900 border-gray-300 placeholder-gray-500"
                    isFullWidth
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Target className="w-4 h-4 inline mr-1" />
                    Number of Questions *
                  </label>
                  <Input
                    type="number"
                    min="1"
                    max="50"
                    value={preferences.questionCount}
                    onChange={(e) => setPreferences(prev => ({ ...prev, questionCount: parseInt(e.target.value) || 5 }))}
                    className="w-full bg-white text-gray-900 border-gray-300"
                    isFullWidth
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Zap className="w-4 h-4 inline mr-1" />
                    Difficulty Level
                  </label>
                  <Select
                    options={difficultyOptions}
                    value={preferences.difficulty}
                    onChange={(e) => setPreferences(prev => ({ ...prev, difficulty: e.target.value as any }))}
                    className="w-full bg-white text-gray-900 border-gray-300"
                    isFullWidth
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Globe className="w-4 h-4 inline mr-1" />
                    Language
                  </label>
                  <Select
                    options={languageOptions}
                    value={preferences.language}
                    onChange={(e) => setPreferences(prev => ({ ...prev, language: e.target.value as any }))}
                    className="w-full bg-white text-gray-900 border-gray-300"
                    isFullWidth
                  />
                </div>
              </div>
            </motion.div>

            {/* Question Types */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <h4 className="text-lg font-semibold text-gray-800">Question Types *</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {questionTypeOptions.map((option) => (
                  <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.questionTypes.includes(option.value as any)}
                      onChange={(e) => handleQuestionTypeChange(option.value, e.target.checked)}
                      className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span className="text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
              {preferences.questionTypes.length === 0 && (
                <p className="text-red-500 text-sm">Please select at least one question type.</p>
              )}
            </motion.div>

            {/* Time Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-6"
            >
              <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                <Timer className="w-5 h-5 mr-2 text-orange-600" />
                Time Settings
              </h4>

              <div className="space-y-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.timeLimitEnabled}
                    onChange={(e) => setPreferences(prev => ({ ...prev, timeLimitEnabled: e.target.checked }))}
                    className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <span className="text-gray-700">Enable Time Limits</span>
                </label>

                {preferences.timeLimitEnabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Time per Question (seconds)
                      </label>
                      <Input
                        type="number"
                        min="10"
                        max="300"
                        value={preferences.timeLimit || ''}
                        onChange={(e) => setPreferences(prev => ({ ...prev, timeLimit: e.target.value }))}
                        placeholder="30"
                        className="w-full bg-white text-gray-900 border-gray-300 placeholder-gray-500"
                        isFullWidth
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
                        onChange={(e) => setPreferences(prev => ({ ...prev, totalTimeLimit: e.target.value }))}
                        placeholder="600"
                        className="w-full bg-white text-gray-900 border-gray-300 placeholder-gray-500"
                        isFullWidth
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Scoring Settings (only for solo mode) */}
            {!isCompetitionMode && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-6"
              >
                <h4 className="text-lg font-semibold text-gray-800">Scoring & Mode</h4>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quiz Mode</label>
                    <div className="grid grid-cols-2 gap-4">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="mode"
                          value="practice"
                          checked={preferences.mode === 'practice'}
                          onChange={(e) => setPreferences(prev => ({ 
                            ...prev, 
                            mode: e.target.value as any,
                            answerMode: e.target.value === 'practice' ? 'immediate' : 'end'
                          }))}
                          className="text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-gray-700">Practice Mode (Immediate feedback)</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name="mode"
                          value="exam"
                          checked={preferences.mode === 'exam'}
                          onChange={(e) => setPreferences(prev => ({ 
                            ...prev, 
                            mode: e.target.value as any,
                            answerMode: 'end'
                          }))}
                          className="text-purple-600 focus:ring-purple-500"
                        />
                        <span className="text-gray-700">Exam Mode (Feedback at end)</span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={preferences.negativeMarking}
                        onChange={(e) => setPreferences(prev => ({ ...prev, negativeMarking: e.target.checked }))}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-gray-700">Enable Negative Marking</span>
                    </label>

                    {preferences.negativeMarking && (
                      <div className="ml-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Negative Marks per Wrong Answer
                        </label>
                        <Input
                          type="number"
                          min="-5"
                          max="0"
                          step="0.25"
                          value={preferences.negativeMarks || ''}
                          onChange={(e) => setPreferences(prev => ({ ...prev, negativeMarks: parseFloat(e.target.value) || -0.25 }))}
                          placeholder="-0.25"
                          className="w-32 bg-white text-gray-900 border-gray-300 placeholder-gray-500"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Error Display */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2"
              >
                <AlertTriangle className="w-5 h-5 text-red-500" />
                <span className="text-red-700">{error}</span>
              </motion.div>
            )}

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex justify-end pt-6"
            >
              <Button
                type="submit"
                disabled={isSubmitting || preferences.questionTypes.length === 0 || !preferences.course}
                className={`${isCompetitionMode ? 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600' : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600'} text-white font-bold px-8 py-4 text-lg shadow-xl transition-all duration-300`}
              >
                {isSubmitting ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{isCompetitionMode ? 'Creating Competition...' : 'Starting Quiz...'}</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    {isCompetitionMode ? <Trophy className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    <span>{isCompetitionMode ? 'Create Competition' : 'Start Quiz'}</span>
                    <Sparkles className="w-5 h-5" />
                  </div>
                )}
              </Button>
            </motion.div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default QuizPreferencesForm;