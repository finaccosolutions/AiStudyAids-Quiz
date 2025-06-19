import React, { useState, useEffect } from 'react';
import { useQuizStore } from '../../store/useQuizStore';
import { useCompetitionStore } from '../../store/useCompetitionStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Card, CardBody, CardFooter } from '../ui/Card';
import { 
  BookOpen, Save, Clock, Languages, ListChecks, 
  BarChart3, Timer, AlertTriangle, Settings, 
  CheckCircle2, AlarmClock, Info, Brain, Users,
  Zap, Target, Crown, Sparkles, Plus, Hash
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { QuizPreferences } from '../../types';

interface QuizPreferencesFormProps {
  userId: string;
  initialPreferences: QuizPreferences;
  onSave?: () => void;
  onStartCompetition?: () => void;
  onJoinCompetition?: () => void;
}

const QuizPreferencesForm: React.FC<QuizPreferencesFormProps> = ({ 
  userId, 
  initialPreferences,
  onSave,
  onStartCompetition,
  onJoinCompetition
}) => {
  const [preferences, setPreferences] = useState<QuizPreferences>(initialPreferences);
  const { savePreferences, generateQuiz, isLoading, error } = useQuizStore();
  const { createCompetition, joinCompetition, isLoading: competitionLoading } = useCompetitionStore();
  const [timingMode, setTimingMode] = useState<'per-question' | 'total'>(
    preferences.totalTimeLimit ? 'total' : 'per-question'
  );
  const [selectedMode, setSelectedMode] = useState<'solo' | 'competition' | 'join'>('solo');
  
  // Competition form state
  const [competitionForm, setCompetitionForm] = useState({
    title: '',
    description: '',
    maxParticipants: 4,
    emails: ['']
  });

  // Join competition form state
  const [joinForm, setJoinForm] = useState({
    competitionCode: ''
  });
  
  useEffect(() => {
    setPreferences(initialPreferences);
    setTimingMode(initialPreferences.totalTimeLimit ? 'total' : 'per-question');
  }, [initialPreferences]);
  
  const difficultyOptions = [
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' },
  ];
  
  const soloQuestionTypeOptions = [
    { 
      value: 'multiple-choice', 
      label: 'Multiple Choice',
      description: 'Select one correct answer from multiple options'
    },
    { 
      value: 'multi-select', 
      label: 'Select All That Apply',
      description: 'Choose multiple correct options'
    },
    { 
      value: 'true-false', 
      label: 'True/False',
      description: 'Determine if a statement is true or false'
    },
    { 
      value: 'fill-blank', 
      label: 'Fill in the Blank',
      description: 'Complete sentences with missing words'
    },
    { 
      value: 'short-answer', 
      label: 'Short Answer',
      description: 'Provide brief 1-2 word answers'
    },
    { 
      value: 'sequence', 
      label: 'Sequence/Ordering',
      description: 'Arrange items in the correct order'
    },
    { 
      value: 'case-study', 
      label: 'Case Study',
      description: 'Analyze real-world scenarios and answer questions'
    },
    { 
      value: 'situation', 
      label: 'Situation Judgment',
      description: 'Choose the best action in given scenarios'
    }
  ];

  const competitionQuestionTypeOptions = [
    { 
      value: 'multiple-choice', 
      label: 'Multiple Choice',
      description: 'Fast-paced single answer questions'
    },
    { 
      value: 'true-false', 
      label: 'True/False',
      description: 'Quick decision-making questions'
    },
    { 
      value: 'short-answer', 
      label: 'Short Answer',
      description: 'Brief knowledge-based responses'
    }
  ];
  
  const languageOptions = [
    { value: 'English', label: 'English' },
    { value: 'Hindi', label: 'Hindi' },
    { value: 'Malayalam', label: 'Malayalam' },
    { value: 'Tamil', label: 'Tamil' },
    { value: 'Telugu', label: 'Telugu' },
  ];
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let updatedPreferences = {
      ...preferences,
      timeLimit: timingMode === 'total' ? null : preferences.timeLimit,
      totalTimeLimit: timingMode === 'per-question' ? null : preferences.totalTimeLimit,
      timeLimitEnabled: preferences.timeLimitEnabled
    };

    // Apply competition-specific settings
    if (selectedMode === 'competition') {
      updatedPreferences = {
        ...updatedPreferences,
        mode: 'exam', // Always exam mode for competitions
        timeLimitEnabled: true, // Always enable time limits
        timeLimit: updatedPreferences.timeLimit || '30', // Default 30 seconds
        negativeMarking: true, // Enable negative marking
        negativeMarks: updatedPreferences.negativeMarks || -0.25
      };
    }
    
    await savePreferences(userId, updatedPreferences);
    
    if (selectedMode === 'competition') {
      await handleCreateCompetition();
    } else if (selectedMode === 'join') {
      await handleJoinCompetition();
    } else {
      await generateQuiz(userId);
      if (onSave) onSave();
    }
  };

  const handleCreateCompetition = async () => {
    try {
      const validEmails = competitionForm.emails.filter(email => email.trim());
      
      const competition = await createCompetition({
        title: competitionForm.title,
        description: competitionForm.description,
        type: 'private',
        maxParticipants: competitionForm.maxParticipants,
        quizPreferences: {
          course: preferences.course,
          topic: preferences.topic,
          subtopic: preferences.subtopic,
          questionCount: preferences.questionCount,
          difficulty: preferences.difficulty,
          language: preferences.language,
          timeLimit: preferences.timeLimit || '30',
          timeLimitEnabled: true,
          mode: 'exam',
          questionTypes: preferences.questionTypes.length > 0 ? preferences.questionTypes : ['multiple-choice', 'true-false', 'short-answer']
        },
        emails: validEmails
      });

      if (onStartCompetition) onStartCompetition();
    } catch (error: any) {
      console.error('Failed to create competition:', error);
    }
  };

  const handleJoinCompetition = async () => {
    try {
      await joinCompetition(joinForm.competitionCode.toUpperCase());
      if (onJoinCompetition) onJoinCompetition();
    } catch (error: any) {
      console.error('Failed to join competition:', error);
    }
  };
  
  const handleQuestionTypeToggle = (type: string) => {
    setPreferences(prev => {
      const currentTypes = prev.questionTypes;
      
      if (currentTypes.includes(type) && currentTypes.length > 1) {
        return {
          ...prev,
          questionTypes: currentTypes.filter(t => t !== type)
        };
      }
      
      if (!currentTypes.includes(type)) {
        return {
          ...prev,
          questionTypes: [...currentTypes, type]
        };
      }
      
      return prev;
    });
  };
  
  const isQuestionTypeSelected = (type: string) => {
    return preferences.questionTypes.includes(type);
  };

  const handleTimeSettingChange = (value: string) => {
    const numericValue = parseInt(value) || 30;
    if (timingMode === 'per-question') {
      setPreferences(prev => ({
        ...prev,
        timeLimit: value,
        totalTimeLimit: null
      }));
    } else {
      setPreferences(prev => ({
        ...prev,
        totalTimeLimit: value,
        timeLimit: null
      }));
    }
  };

  const handleTimeLimitToggle = (enabled: boolean) => {
    setPreferences(prev => ({
      ...prev,
      timeLimitEnabled: enabled,
      timeLimit: enabled ? prev.timeLimit || '30' : null,
      totalTimeLimit: enabled ? prev.totalTimeLimit || '300' : null
    }));
  };

  const calculateTotalTime = () => {
    if (!preferences.timeLimitEnabled) return 'No time limit';
    
    if (timingMode === 'per-question') {
      if (!preferences.timeLimit) return 'No time limit';
      const perQuestion = parseInt(preferences.timeLimit);
      const total = perQuestion * preferences.questionCount;
      const minutes = Math.floor(total / 60);
      const seconds = total % 60;
      return `${perQuestion} seconds per question (Total: ${minutes}:${seconds.toString().padStart(2, '0')})`;
    } else {
      if (!preferences.totalTimeLimit) return 'No time limit';
      const total = parseInt(preferences.totalTimeLimit);
      const perQuestion = Math.floor(total / preferences.questionCount);
      const minutes = Math.floor(total / 60);
      const seconds = total % 60;
      return `${minutes}:${seconds.toString().padStart(2, '0')} minutes total (${perQuestion} seconds per question)`;
    }
  };

  // Get the appropriate question types based on mode
  const questionTypeOptions = selectedMode === 'competition' 
    ? competitionQuestionTypeOptions 
    : soloQuestionTypeOptions;

  const addEmail = () => {
    setCompetitionForm(prev => ({
      ...prev,
      emails: [...prev.emails, '']
    }));
  };

  const removeEmail = (index: number) => {
    setCompetitionForm(prev => ({
      ...prev,
      emails: prev.emails.filter((_, i) => i !== index)
    }));
  };

  const updateEmail = (index: number, value: string) => {
    setCompetitionForm(prev => ({
      ...prev,
      emails: prev.emails.map((email, i) => i === index ? value : email)
    }));
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-xl border border-purple-100 overflow-hidden transform transition-all duration-300 hover:shadow-2xl">
        <div className="p-8 border-b border-purple-100 bg-gradient-to-r from-purple-50 to-indigo-50">
          <h2 className="text-3xl font-bold gradient-text mb-2">Quiz Preferences</h2>
          <p className="text-gray-600">Customize your learning experience</p>
        </div>
        
        {/* Mode Selection */}
        <div className="p-8 border-b border-purple-100 bg-gradient-to-r from-blue-50/30 to-purple-50/30">
          <div className="flex items-center mb-6">
            <Target className="w-6 h-6 mr-3 text-purple-600" />
            <h3 className="text-xl font-semibold text-gray-800">Choose Your Experience</h3>
            <div className="tooltip ml-2">
              <Info className="w-4 h-4 text-gray-400 hover:text-purple-600 cursor-help" />
              <span className="tooltiptext z-50">Select between solo practice or competitive multiplayer quiz</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.button
              type="button"
              onClick={() => setSelectedMode('solo')}
              className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                selectedMode === 'solo' 
                  ? 'border-purple-500 bg-purple-50 shadow-lg scale-[1.02]' 
                  : 'border-gray-200 hover:border-purple-200 hover:bg-purple-50/50'
              }`}
              whileHover={{ scale: selectedMode === 'solo' ? 1.02 : 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-indigo-400/10" />
              <div className="relative p-6">
                <div className="flex items-center justify-center mb-4">
                  <div className={`p-4 rounded-full ${
                    selectedMode === 'solo' ? 'bg-purple-100' : 'bg-gray-100'
                  }`}>
                    <BookOpen className={`w-8 h-8 ${
                      selectedMode === 'solo' ? 'text-purple-600' : 'text-gray-400'
                    }`} />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Solo Practice</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Practice at your own pace with instant feedback and detailed explanations
                </p>
                <div className="space-y-2 text-xs text-gray-500">
                  <div className="flex items-center">
                    <CheckCircle2 className="w-3 h-3 mr-2 text-green-500" />
                    <span>Immediate feedback</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle2 className="w-3 h-3 mr-2 text-green-500" />
                    <span>Detailed explanations</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle2 className="w-3 h-3 mr-2 text-green-500" />
                    <span>Self-paced learning</span>
                  </div>
                </div>
                {selectedMode === 'solo' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-3 bg-white bg-opacity-80 rounded-lg border border-purple-200"
                  >
                    <div className="flex items-center space-x-2 text-purple-700">
                      <Sparkles className="w-4 h-4" />
                      <span className="text-sm font-medium">Selected</span>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.button>

            <motion.button
              type="button"
              onClick={() => setSelectedMode('competition')}
              className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                selectedMode === 'competition' 
                  ? 'border-purple-500 bg-purple-50 shadow-lg scale-[1.02]' 
                  : 'border-gray-200 hover:border-purple-200 hover:bg-purple-50/50'
              }`}
              whileHover={{ scale: selectedMode === 'competition' ? 1.02 : 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-pink-400/10" />
              <div className="relative p-6">
                <div className="flex items-center justify-center mb-4">
                  <div className={`p-4 rounded-full ${
                    selectedMode === 'competition' ? 'bg-purple-100' : 'bg-gray-100'
                  }`}>
                    <Crown className={`w-8 h-8 ${
                      selectedMode === 'competition' ? 'text-purple-600' : 'text-gray-400'
                    }`} />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Create Competition</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Compete with friends or random players in real-time quiz battles
                </p>
                <div className="space-y-2 text-xs text-gray-500">
                  <div className="flex items-center">
                    <Crown className="w-3 h-3 mr-2 text-yellow-500" />
                    <span>Real-time competition</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-3 h-3 mr-2 text-blue-500" />
                    <span>Multiplayer battles</span>
                  </div>
                  <div className="flex items-center">
                    <Zap className="w-3 h-3 mr-2 text-purple-500" />
                    <span>Live leaderboards</span>
                  </div>
                </div>
                {selectedMode === 'competition' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-3 bg-white bg-opacity-80 rounded-lg border border-purple-200"
                  >
                    <div className="flex items-center space-x-2 text-purple-700">
                      <Sparkles className="w-4 h-4" />
                      <span className="text-sm font-medium">Selected</span>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.button>

            <motion.button
              type="button"
              onClick={() => setSelectedMode('join')}
              className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                selectedMode === 'join' 
                  ? 'border-purple-500 bg-purple-50 shadow-lg scale-[1.02]' 
                  : 'border-gray-200 hover:border-purple-200 hover:bg-purple-50/50'
              }`}
              whileHover={{ scale: selectedMode === 'join' ? 1.02 : 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/10 to-blue-400/10" />
              <div className="relative p-6">
                <div className="flex items-center justify-center mb-4">
                  <div className={`p-4 rounded-full ${
                    selectedMode === 'join' ? 'bg-purple-100' : 'bg-gray-100'
                  }`}>
                    <Hash className={`w-8 h-8 ${
                      selectedMode === 'join' ? 'text-purple-600' : 'text-gray-400'
                    }`} />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Join Competition</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Enter a competition code to join an existing quiz battle
                </p>
                <div className="space-y-2 text-xs text-gray-500">
                  <div className="flex items-center">
                    <Hash className="w-3 h-3 mr-2 text-indigo-500" />
                    <span>Enter competition code</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-3 h-3 mr-2 text-blue-500" />
                    <span>Join existing battles</span>
                  </div>
                  <div className="flex items-center">
                    <Zap className="w-3 h-3 mr-2 text-purple-500" />
                    <span>Quick participation</span>
                  </div>
                </div>
                {selectedMode === 'join' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-3 bg-white bg-opacity-80 rounded-lg border border-purple-200"
                  >
                    <div className="flex items-center space-x-2 text-purple-700">
                      <Sparkles className="w-4 h-4" />
                      <span className="text-sm font-medium">Selected</span>
                    </div>
                  </motion.div>
                )}
              </div>
            </motion.button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="divide-y divide-purple-100">
          {/* Basic Settings Panel */}
          <div className="p-8 space-y-6 relative overflow-hidden group bg-gradient-to-r from-purple-50/30 to-indigo-50/30">
            <div className="relative">
              <div className="flex items-center mb-6 relative">
                <Settings className="w-6 h-6 mr-3 text-purple-600" />
                <h3 className="text-xl font-semibold text-gray-800">Basic Settings</h3>
                <div className="tooltip ml-2">
                  <Info className="w-4 h-4 text-gray-400 hover:text-purple-600 cursor-help" />
                  <span className="tooltiptext z-50">Configure your basic quiz settings including course, topic, and difficulty level</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Course / Stream
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., Computer Science"
                    value={preferences.course || ''}
                    onChange={(e) => setPreferences({ ...preferences, course: e.target.value })}
                    className="w-full transition-all duration-300 hover:border-purple-400 focus:ring-purple-400 text-lg"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Topic / Subject (Optional)
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., Data Structures"
                    value={preferences.topic || ''}
                    onChange={(e) => setPreferences({ ...preferences, topic: e.target.value })}
                    className="w-full transition-all duration-300 hover:border-purple-400 focus:ring-purple-400 text-lg"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Sub-topic (Optional)
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., Binary Trees"
                    value={preferences.subtopic || ''}
                    onChange={(e) => setPreferences({ ...preferences, subtopic: e.target.value })}
                    className="w-full transition-all duration-300 hover:border-purple-400 focus:ring-purple-400 text-lg"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Difficulty Level
                  </label>
                  <Select
                    options={difficultyOptions}
                    value={preferences.difficulty}
                    onChange={(e) => setPreferences({ ...preferences, difficulty: e.target.value as any })}
                    className="w-full transition-all duration-300 hover:border-purple-400 focus:ring-purple-400 text-lg"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Language
                  </label>
                  <Select
                    options={languageOptions}
                    value={preferences.language}
                    onChange={(e) => setPreferences({ ...preferences, language: e.target.value as any })}
                    className="w-full transition-all duration-300 hover:border-purple-400 focus:ring-purple-400 text-lg"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Number of Questions
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={50}
                    value={preferences.questionCount}
                    onChange={(e) => {
                      const newCount = parseInt(e.target.value) || 5;
                      setPreferences({ ...preferences, questionCount: newCount });
                    }}
                    className="w-full transition-all duration-300 hover:border-purple-400 focus:ring-purple-400 text-lg"
                  />
                </div>

                {selectedMode === 'solo' && (
                  <div className="space-y-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={preferences.negativeMarking || false}
                        onChange={(e) => setPreferences({ 
                          ...preferences, 
                          negativeMarking: e.target.checked,
                          negativeMarks: e.target.checked ? -0.25 : 0
                        })}
                        className="form-checkbox h-5 w-5 text-purple-600 rounded border-gray-300 focus:ring-purple-500 transition-colors"
                      />
                      <span className="text-sm font-medium text-gray-700">Enable Negative Marking</span>
                    </label>
                    
                    {preferences.negativeMarking && (
                      <div className="pl-7">
                        <Input
                          type="number"
                          min={-5}
                          max={0}
                          step={0.25}
                          value={preferences.negativeMarks || -0.25}
                          onChange={(e) => setPreferences({ 
                            ...preferences, 
                            negativeMarks: parseFloat(e.target.value) 
                          })}
                          className="w-full transition-all duration-300 hover:border-purple-400 focus:ring-purple-400"
                        />
                        <p className="text-sm text-gray-500 mt-1">
                          Enter negative marks (between -5 and 0)
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {selectedMode === 'competition' && (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
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
                      className="w-full transition-all duration-300 hover:border-purple-400 focus:ring-purple-400 text-lg"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Question Types Panel */}
          <div className="p-8 space-y-6 relative overflow-hidden group bg-gradient-to-r from-blue-50/30 to-cyan-50/30">
            <div className="relative">
              <div className="flex items-center mb-6 relative">
                <ListChecks className="w-6 h-6 mr-3 text-blue-600" />
                <h3 className="text-xl font-semibold text-gray-800">Question Types</h3>
                <div className="tooltip ml-2">
                  <Info className="w-4 h-4 text-gray-400 hover:text-blue-600 cursor-help" />
                  <span className="tooltiptext z-50">
                    {selectedMode === 'competition' 
                      ? 'Question types optimized for competitive play'
                      : 'Choose the types of questions you want in your quiz'
                    }
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {questionTypeOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleQuestionTypeToggle(option.value)}
                    className={`p-4 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-102 ${
                      isQuestionTypeSelected(option.value)
                        ? 'bg-blue-100 text-blue-700 border-2 border-blue-300 shadow-md hover:bg-blue-200'
                        : 'bg-gray-50 text-gray-600 border-2 border-gray-100 hover:bg-gray-100 hover:border-blue-200'
                    }`}
                  >
                    {isQuestionTypeSelected(option.value) ? (
                      <CheckCircle2 className="w-5 h-5 mb-2 mx-auto text-blue-600" />
                    ) : (
                      <div className="w-5 h-5 mb-2" />
                    )}
                    <div className="text-center">
                      <div className="font-medium">{option.label}</div>
                      <div className="text-xs text-gray-500 mt-1">{option.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Time Settings Panel - Only show for solo mode */}
          {selectedMode === 'solo' && (
            <div className="p-8 space-y-6 relative overflow-hidden group bg-gradient-to-r from-emerald-50/30 to-teal-50/30">
              <div className="relative">
                <div className="flex items-center mb-6 relative">
                  <Timer className="w-6 h-6 mr-3 text-emerald-600" />
                  <h3 className="text-xl font-semibold text-gray-800">Time Settings</h3>
                  <div className="tooltip ml-2">
                    <Info className="w-4 h-4 text-gray-400 hover:text-emerald-600 cursor-help" />
                    <span className="tooltiptext z-50">Set time limits for individual questions or the entire quiz</span>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={preferences.timeLimitEnabled}
                      onChange={(e) => handleTimeLimitToggle(e.target.checked)}
                      className="form-checkbox h-5 w-5 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 transition-colors"
                    />
                    <span className="text-sm font-medium text-gray-700">Enable Time Limit</span>
                  </div>

                  {preferences.timeLimitEnabled && (
                    <>
                      <div className="flex items-center space-x-6">
                        <button
                          type="button"
                          onClick={() => setTimingMode('per-question')}
                          className={`flex-1 p-4 rounded-xl border-2 transition-all duration-300 ${
                            timingMode === 'per-question'
                              ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                              : 'border-gray-200 hover:border-emerald-200'
                          }`}
                        >
                          <Clock className="w-6 h-6 mx-auto mb-2" />
                          <div className="font-medium">Time per Question</div>
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => setTimingMode('total')}
                          className={`flex-1 p-4 rounded-xl border-2 transition-all duration-300 ${
                            timingMode === 'total'
                              ? 'border-emerald-300 bg-emerald-50 text-emerald-700'
                              : 'border-gray-200 hover:border-emerald-200'
                          }`}
                        >
                          <AlarmClock className="w-6 h-6 mx-auto mb-2" />
                          <div className="font-medium">Total Quiz Time</div>
                        </button>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Time Setting (in seconds)
                          </label>
                          <div className="flex items-center space-x-2">
                            <Input
                              type="number"
                              min={1}
                              max={3600}
                              value={timingMode === 'per-question' ? preferences.timeLimit || 30 : preferences.totalTimeLimit || 300}
                              onChange={(e) => handleTimeSettingChange(e.target.value)}
                              className="w-32 transition-all duration-300 hover:border-emerald-400 focus:ring-emerald-400 text-lg"
                            />
                            <span className="text-gray-600">seconds</span>
                          </div>
                          
                          <div className="text-sm text-gray-600 bg-emerald-50 p-4 rounded-lg mt-4">
                            <p className="font-medium text-emerald-700">Current Time Setting:</p>
                            <p>{calculateTotalTime()}</p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Quiz Mode Panel - Only show for solo mode */}
          {selectedMode === 'solo' && (
            <div className="p-8 space-y-6 relative overflow-hidden group bg-gradient-to-r from-amber-50/30 to-orange-50/30">
              <div className="relative">
                <div className="flex items-center mb-6 relative">
                  <BarChart3 className="w-6 h-6 mr-3 text-amber-600" />
                  <h3 className="text-xl font-semibold text-gray-800">Quiz Mode</h3>
                  <div className="tooltip ml-2">
                    <Info className="w-4 h-4 text-gray-400 hover:text-amber-600 cursor-help" />
                    <span className="tooltiptext z-50">Choose between practice mode for immediate feedback or exam mode for end-of-quiz results</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setPreferences({ ...preferences, mode: 'practice' })}
                    className={`p-6 rounded-xl border-2 transition-all duration-300 text-left ${
                      preferences.mode === 'practice'
                        ? 'border-amber-300 bg-amber-50 shadow-md'
                        : 'border-gray-200 hover:border-amber-200'
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <BookOpen className="w-6 h-6 mr-2 text-amber-600" />
                      <span className="font-semibold text-lg">Practice Mode</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      Get immediate feedback after each question. Perfect for learning and understanding concepts.
                    </p>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setPreferences({ ...preferences, mode: 'exam' })}
                    className={`p-6 rounded-xl border-2 transition-all duration-300 text-left ${
                      preferences.mode === 'exam'
                        ? 'border-amber-300 bg-amber-50 shadow-md'
                        : 'border-gray-200 hover:border-amber-200'
                    }`}
                  >
                    <div className="flex items-center mb-2">
                      <BarChart3 className="w-6 h-6 mr-2 text-amber-600" />
                      <span className="font-semibold text-lg">Exam Mode</span>
                    </div>
                    <p className="text-sm text-gray-600">
                      See results only at the end. Simulates real exam conditions for better preparation.
                    </p>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Competition Settings */}
          {selectedMode === 'competition' && (
            <div className="p-8 space-y-6 relative overflow-hidden group bg-gradient-to-r from-yellow-50/30 to-orange-50/30">
              <div className="relative">
                <div className="flex items-center mb-6 relative">
                  <Crown className="w-6 h-6 mr-3 text-yellow-600" />
                  <h3 className="text-xl font-semibold text-gray-800">Competition Settings</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Competition Title
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g., Computer Science Challenge"
                      value={competitionForm.title}
                      onChange={(e) => setCompetitionForm({ ...competitionForm, title: e.target.value })}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Max Participants
                    </label>
                    <Select
                      options={[
                        { value: '2', label: '2 Players' },
                        { value: '4', label: '4 Players' },
                        { value: '6', label: '6 Players' },
                        { value: '8', label: '8 Players' },
                        { value: '10', label: '10 Players' }
                      ]}
                      value={competitionForm.maxParticipants.toString()}
                      onChange={(e) => setCompetitionForm({ ...competitionForm, maxParticipants: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Description (Optional)
                  </label>
                  <textarea
                    placeholder="Describe your competition..."
                    value={competitionForm.description}
                    onChange={(e) => setCompetitionForm({ ...competitionForm, description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors resize-none"
                    rows={3}
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Invite Participants (Optional)
                  </label>
                  {competitionForm.emails.map((email, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <Input
                        type="email"
                        placeholder="participant@example.com"
                        value={email}
                        onChange={(e) => updateEmail(index, e.target.value)}
                        className="flex-1"
                      />
                      {competitionForm.emails.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => removeEmail(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          ×
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addEmail}
                    className="w-full border-dashed border-2 border-yellow-300 text-yellow-600 hover:bg-yellow-50"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Another Email
                  </Button>
                </div>

                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-xl border border-yellow-200">
                  <h4 className="font-semibold text-yellow-900 mb-4">Competition Rules Applied</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-yellow-700">Mode:</span>
                      <span className="ml-2 font-medium">Exam Only</span>
                    </div>
                    <div>
                      <span className="text-yellow-700">Time/Question:</span>
                      <span className="ml-2 font-medium">{preferences.timeLimit || '30'}s</span>
                    </div>
                    <div>
                      <span className="text-yellow-700">Negative Marking:</span>
                      <span className="ml-2 font-medium text-red-600">-0.25 per wrong</span>
                    </div>
                    <div>
                      <span className="text-yellow-700">Results:</span>
                      <span className="ml-2 font-medium">End of quiz</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Join Competition */}
          {selectedMode === 'join' && (
            <div className="p-8 space-y-6 relative overflow-hidden group bg-gradient-to-r from-indigo-50/30 to-blue-50/30">
              <div className="relative">
                <div className="flex items-center mb-6 relative">
                  <Hash className="w-6 h-6 mr-3 text-indigo-600" />
                  <h3 className="text-xl font-semibold text-gray-800">Join Competition</h3>
                </div>
                
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-gradient-to-r from-indigo-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Hash className="w-10 h-10 text-indigo-600" />
                  </div>
                  <p className="text-gray-600 text-lg">
                    Ask the competition creator for the 6-digit competition code
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                      Competition Code
                    </label>
                    <Input
                      type="text"
                      placeholder="ABC123"
                      value={joinForm.competitionCode}
                      onChange={(e) => setJoinForm({ competitionCode: e.target.value.toUpperCase() })}
                      className="w-full py-4 text-center text-2xl font-mono tracking-wider border-2 focus:border-indigo-500"
                      maxLength={6}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-500">
              <div className="flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}
          
          <div className="p-8 bg-gray-50 flex justify-end">
            <Button
              type="submit"
              disabled={isLoading || competitionLoading || !preferences.course}
              className="gradient-bg hover:opacity-90 transition-all duration-300 transform hover:scale-105 group text-lg px-8 py-3"
            >
              {isLoading || competitionLoading ? 'Processing...' : 
               selectedMode === 'competition' ? 'Create Competition' : 
               selectedMode === 'join' ? 'Join Competition' : 'Start Quiz'}
              {selectedMode === 'competition' ? (
                <Crown className="ml-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
              ) : selectedMode === 'join' ? (
                <Hash className="ml-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
              ) : (
                <Save className="ml-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuizPreferencesForm;