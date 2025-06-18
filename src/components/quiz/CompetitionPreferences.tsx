import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Card, CardBody, CardHeader } from '../ui/Card';
import { 
  Trophy, Users, Clock, Target, Brain, 
  Settings, Zap, Crown, Sparkles, Info,
  CheckCircle2, Plus, Mail, X
} from 'lucide-react';
import { motion } from 'framer-motion';
import { QuizPreferences } from '../../types';

interface CompetitionPreferencesProps {
  initialPreferences: QuizPreferences;
  onStartCompetition: (preferences: QuizPreferences, competitionData: any) => void;
  onJoinCompetition: () => void;
  onCancel: () => void;
}

const CompetitionPreferences: React.FC<CompetitionPreferencesProps> = ({
  initialPreferences,
  onStartCompetition,
  onJoinCompetition,
  onCancel
}) => {
  const [preferences, setPreferences] = useState<QuizPreferences>({
    ...initialPreferences,
    mode: 'exam', // Always exam mode for competitions
    timeLimitEnabled: true, // Always enable time limits for competitions
    timeLimit: initialPreferences.timeLimit || '30', // Default 30 seconds per question
    negativeMarking: true, // Enable negative marking for competitive fairness
    negativeMarks: -0.25,
    questionTypes: ['multiple-choice', 'true-false', 'short-answer', 'fill-blank', 'multi-select'] // All question types for competition
  });

  const [competitionData, setCompetitionData] = useState({
    title: '',
    description: '',
    maxParticipants: 4,
    type: 'private' as 'private' | 'random',
    emails: ['']
  });

  const difficultyOptions = [
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' },
  ];

  const languageOptions = [
    { value: 'English', label: 'English' },
    { value: 'Hindi', label: 'Hindi' },
    { value: 'Malayalam', label: 'Malayalam' },
    { value: 'Tamil', label: 'Tamil' },
    { value: 'Telugu', label: 'Telugu' },
  ];

  const handleAddEmail = () => {
    setCompetitionData(prev => ({
      ...prev,
      emails: [...prev.emails, '']
    }));
  };

  const handleRemoveEmail = (index: number) => {
    setCompetitionData(prev => ({
      ...prev,
      emails: prev.emails.filter((_, i) => i !== index)
    }));
  };

  const handleEmailChange = (index: number, value: string) => {
    setCompetitionData(prev => ({
      ...prev,
      emails: prev.emails.map((email, i) => i === index ? value : email)
    }));
  };

  const handleStartCompetition = () => {
    // Ensure we have required data
    if (!preferences.course || !preferences.course.trim()) {
      alert('Please enter a course/subject');
      return;
    }

    if (!competitionData.title.trim()) {
      alert('Please enter a competition title');
      return;
    }

    // Filter out empty emails
    const validEmails = competitionData.emails.filter(email => email.trim());
    
    const finalCompetitionData = {
      ...competitionData,
      emails: validEmails,
      quizPreferences: preferences
    };
    
    onStartCompetition(preferences, finalCompetitionData);
  };

  const canStartCompetition = preferences.course && 
                             preferences.course.trim() !== '' && 
                             competitionData.title.trim() !== '';

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-purple-100 overflow-hidden">
        <div className="p-8 border-b border-purple-100 bg-gradient-to-r from-purple-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold gradient-text mb-2 flex items-center">
                <Trophy className="w-8 h-8 mr-3 text-purple-600" />
                Competition Setup
              </h2>
              <p className="text-gray-600">Configure your competitive quiz experience</p>
            </div>
            <div className="flex items-center space-x-2 bg-yellow-100 px-4 py-2 rounded-full">
              <Crown className="w-5 h-5 text-yellow-600" />
              <span className="text-yellow-800 font-medium">Competitive Mode</span>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-8">
          {/* Competition Type Selection */}
          <div className="space-y-6">
            <div className="flex items-center mb-6">
              <Settings className="w-6 h-6 mr-3 text-purple-600" />
              <h3 className="text-xl font-semibold text-gray-800">Competition Type</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.button
                type="button"
                onClick={() => setCompetitionData(prev => ({ ...prev, type: 'private' }))}
                className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                  competitionData.type === 'private' 
                    ? 'border-purple-500 bg-purple-50 shadow-lg scale-[1.02]' 
                    : 'border-gray-200 hover:border-purple-200 hover:bg-purple-50/50'
                }`}
                whileHover={{ scale: competitionData.type === 'private' ? 1.02 : 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="p-4 bg-purple-100 rounded-full mb-4">
                    <Users className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Private Competition</h3>
                  <p className="text-sm text-gray-600">
                    Invite specific friends or colleagues via email
                  </p>
                </div>
              </motion.button>

              <motion.button
                type="button"
                onClick={() => setCompetitionData(prev => ({ ...prev, type: 'random' }))}
                className={`p-6 rounded-xl border-2 transition-all duration-300 ${
                  competitionData.type === 'random' 
                    ? 'border-purple-500 bg-purple-50 shadow-lg scale-[1.02]' 
                    : 'border-gray-200 hover:border-purple-200 hover:bg-purple-50/50'
                }`}
                whileHover={{ scale: competitionData.type === 'random' ? 1.02 : 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex flex-col items-center text-center">
                  <div className="p-4 bg-purple-100 rounded-full mb-4">
                    <Zap className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Random Matchmaking</h3>
                  <p className="text-sm text-gray-600">
                    Get matched with players based on topic and difficulty
                  </p>
                </div>
              </motion.button>
            </div>
          </div>

          {/* Competition Details */}
          <div className="space-y-6">
            <div className="flex items-center mb-6">
              <Trophy className="w-6 h-6 mr-3 text-purple-600" />
              <h3 className="text-xl font-semibold text-gray-800">Competition Details</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Competition Title *
                </label>
                <Input
                  type="text"
                  placeholder="e.g., Computer Science Challenge"
                  value={competitionData.title}
                  onChange={(e) => setCompetitionData(prev => ({ ...prev, title: e.target.value }))}
                  required
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Participants
                </label>
                <Input
                  type="number"
                  min={2}
                  max={10}
                  value={competitionData.maxParticipants}
                  onChange={(e) => setCompetitionData(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) }))}
                  className="w-full"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  placeholder="Describe your competition..."
                  value={competitionData.description}
                  onChange={(e) => setCompetitionData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors resize-none"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Quiz Configuration */}
          <div className="space-y-6">
            <div className="flex items-center mb-6">
              <Brain className="w-6 h-6 mr-3 text-purple-600" />
              <h3 className="text-xl font-semibold text-gray-800">Quiz Configuration</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Course / Subject *
                </label>
                <Input
                  type="text"
                  placeholder="e.g., Computer Science"
                  value={preferences.course || ''}
                  onChange={(e) => setPreferences({ ...preferences, course: e.target.value })}
                  required
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Topic (Optional)
                </label>
                <Input
                  type="text"
                  placeholder="e.g., Data Structures"
                  value={preferences.topic || ''}
                  onChange={(e) => setPreferences({ ...preferences, topic: e.target.value })}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Number of Questions
                </label>
                <Select
                  options={[
                    { value: '5', label: '5 Questions (Quick)' },
                    { value: '10', label: '10 Questions (Standard)' },
                    { value: '15', label: '15 Questions (Extended)' },
                    { value: '20', label: '20 Questions (Marathon)' }
                  ]}
                  value={preferences.questionCount.toString()}
                  onChange={(e) => setPreferences({ ...preferences, questionCount: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Difficulty Level
                </label>
                <Select
                  options={difficultyOptions}
                  value={preferences.difficulty}
                  onChange={(e) => setPreferences({ ...preferences, difficulty: e.target.value })}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Language
                </label>
                <Select
                  options={languageOptions}
                  value={preferences.language}
                  onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time per Question
                </label>
                <Select
                  options={[
                    { value: '15', label: '15 seconds (Lightning)' },
                    { value: '30', label: '30 seconds (Standard)' },
                    { value: '45', label: '45 seconds (Relaxed)' },
                    { value: '60', label: '60 seconds (Extended)' }
                  ]}
                  value={preferences.timeLimit || '30'}
                  onChange={(e) => setPreferences({ ...preferences, timeLimit: e.target.value })}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Participant Invitations (for private competitions) */}
          {competitionData.type === 'private' && (
            <div className="space-y-6">
              <div className="flex items-center mb-6">
                <Mail className="w-6 h-6 mr-3 text-purple-600" />
                <h3 className="text-xl font-semibold text-gray-800">Invite Participants</h3>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-blue-800 text-sm">
                  You can invite participants now or share the competition code later. 
                  Participants will receive email invitations and can also join using the competition code.
                </p>
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  Participant Email Addresses (Optional)
                </label>
                
                {competitionData.emails.map((email, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="flex-1 relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        type="email"
                        placeholder="participant@example.com"
                        value={email}
                        onChange={(e) => handleEmailChange(index, e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    {competitionData.emails.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => handleRemoveEmail(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddEmail}
                  className="w-full border-dashed"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Another Email
                </Button>
              </div>
            </div>
          )}

          {/* Competition Settings Summary */}
          <div className="bg-gradient-to-r from-gray-50 to-purple-50 p-6 rounded-xl border border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2 text-purple-600" />
              Competition Summary
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Questions:</span>
                <span className="ml-2 font-medium">{preferences.questionCount}</span>
              </div>
              <div>
                <span className="text-gray-600">Time/Question:</span>
                <span className="ml-2 font-medium">{preferences.timeLimit}s</span>
              </div>
              <div>
                <span className="text-gray-600">Difficulty:</span>
                <span className="ml-2 font-medium capitalize">{preferences.difficulty}</span>
              </div>
              <div>
                <span className="text-gray-600">Type:</span>
                <span className="ml-2 font-medium capitalize">{competitionData.type}</span>
              </div>
            </div>
            <div className="mt-3 text-sm">
              <span className="text-gray-600">Features:</span>
              <span className="ml-2 font-medium">
                Exam Mode, Time Limits, Negative Marking (-0.25), All Question Types
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 pt-6 border-t border-gray-200">
            <div className="flex space-x-4">
              <Button
                variant="outline"
                onClick={onCancel}
                className="px-6"
              >
                Back
              </Button>
              <Button
                onClick={onJoinCompetition}
                variant="outline"
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-300"
              >
                <Users className="w-4 h-4 mr-2" />
                Join Existing Competition
              </Button>
            </div>
            
            <Button
              onClick={handleStartCompetition}
              disabled={!canStartCompetition}
              className={`gradient-bg px-8 py-3 ${
                !canStartCompetition ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Create Competition
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompetitionPreferences;