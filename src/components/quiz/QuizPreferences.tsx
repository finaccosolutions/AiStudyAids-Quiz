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
  Zap, Target, Crown, Sparkles, Plus, Hash, Mail,
  GraduationCap, Globe, Layers, TrendingUp, Award,
  PlayCircle, Gauge, Shield, Star
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
  const [activeSection, setActiveSection] = useState<string>('basic');
  
  // Competition form state
  const [competitionForm, setCompetitionForm] = useState({
    title: '',
    description: '',
    maxParticipants: 4,
    emails: ['']
  });

  // Determine if this is for competition based on the presence of onStartCompetition
  const isCompetitionMode = !!onStartCompetition;
  
  useEffect(() => {
    setPreferences(initialPreferences);
    setTimingMode(initialPreferences.totalTimeLimit ? 'total' : 'per-question');
  }, [initialPreferences]);
  
  const difficultyOptions = [
    { value: 'easy', label: 'Easy - Basic concepts and simple questions' },
    { value: 'medium', label: 'Medium - Intermediate level with moderate complexity' },
    { value: 'hard', label: 'Hard - Advanced topics and challenging problems' },
  ];
  
  const soloQuestionTypeOptions = [
    { 
      value: 'multiple-choice', 
      label: 'Multiple Choice',
      description: 'Select one correct answer from multiple options',
      icon: Target
    },
    { 
      value: 'multi-select', 
      label: 'Select All That Apply',
      description: 'Choose multiple correct options',
      icon: CheckCircle2
    },
    { 
      value: 'true-false', 
      label: 'True/False',
      description: 'Determine if a statement is true or false',
      icon: BarChart3
    },
    { 
      value: 'fill-blank', 
      label: 'Fill in the Blank',
      description: 'Complete sentences with missing words',
      icon: Layers
    },
    { 
      value: 'short-answer', 
      label: 'Short Answer',
      description: 'Provide brief 1-2 word answers',
      icon: BookOpen
    },
    { 
      value: 'sequence', 
      label: 'Sequence/Ordering',
      description: 'Arrange items in the correct order',
      icon: TrendingUp
    },
    { 
      value: 'case-study', 
      label: 'Case Study',
      description: 'Analyze real-world scenarios and answer questions',
      icon: Brain
    },
    { 
      value: 'situation', 
      label: 'Situation Judgment',
      description: 'Choose the best action in given scenarios',
      icon: Award
    }
  ];

  const competitionQuestionTypeOptions = [
    { 
      value: 'multiple-choice', 
      label: 'Multiple Choice',
      description: 'Fast-paced single answer questions',
      icon: Target
    },
    { 
      value: 'true-false', 
      label: 'True/False',
      description: 'Quick decision-making questions',
      icon: BarChart3
    },
    { 
      value: 'short-answer', 
      label: 'Short Answer',
      description: 'Brief knowledge-based responses',
      icon: BookOpen
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
    if (isCompetitionMode) {
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
    
    if (isCompetitionMode) {
      await handleCreateCompetition();
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
  const questionTypeOptions = isCompetitionMode 
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

  const sections = [
    { id: 'basic', label: 'Basic Settings', icon: Settings },
    { id: 'questions', label: 'Question Types', icon: ListChecks },
    ...(isCompetitionMode ? [{ id: 'competition', label: 'Competition', icon: Crown }] : []),
    ...(!isCompetitionMode ? [
      { id: 'timing', label: 'Time Settings', icon: Timer },
      { id: 'mode', label: 'Quiz Mode', icon: BarChart3 }
    ] : [])
  ];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-6">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className={`w-16 h-16 rounded-full flex items-center justify-center mr-4 shadow-2xl ${
                isCompetitionMode 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                  : 'bg-gradient-to-r from-blue-500 to-indigo-500'
              }`}
            >
              {isCompetitionMode ? (
                <Crown className="w-8 h-8 text-white" />
              ) : (
                <Brain className="w-8 h-8 text-white" />
              )}
            </motion.div>
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">
                {isCompetitionMode ? 'Create Competition' : 'Solo Quiz Setup'}
              </h1>
              <p className="text-xl text-gray-600">
                {isCompetitionMode 
                  ? 'Set up your competition and invite friends to compete'
                  : 'Customize your personalized learning experience'
                }
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Navigation Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8 shadow-xl border-2 border-purple-100">
              <CardBody className="p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                  <Layers className="w-5 h-5 mr-2 text-purple-600" />
                  Configuration
                </h3>
                <nav className="space-y-2">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 text-left ${
                        activeSection === section.id
                          ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg'
                          : 'text-gray-600 hover:bg-purple-50 hover:text-purple-600'
                      }`}
                    >
                      <section.icon className="w-5 h-5" />
                      <span className="font-medium">{section.label}</span>
                    </button>
                  ))}
                </nav>
              </CardBody>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} className="space-y-8">
              <AnimatePresence mode="wait">
                {/* Basic Settings */}
                {activeSection === 'basic' && (
                  <motion.div
                    key="basic"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="shadow-xl border-2 border-blue-100 overflow-hidden">
                      <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-500" />
                      <CardBody className="p-8">
                        <div className="flex items-center mb-8">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mr-4">
                            <GraduationCap className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold text-gray-800">Basic Settings</h2>
                            <p className="text-gray-600">Configure your quiz fundamentals</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              <BookOpen className="w-4 h-4 inline mr-2" />
                              Course / Stream *
                            </label>
                            <Input
                              type="text"
                              placeholder="e.g., Computer Science, Mathematics"
                              value={preferences.course || ''}
                              onChange={(e) => setPreferences({ ...preferences, course: e.target.value })}
                              className="w-full h-12 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-200 transition-all duration-300"
                              required
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              <Target className="w-4 h-4 inline mr-2" />
                              Topic / Subject
                            </label>
                            <Input
                              type="text"
                              placeholder="e.g., Data Structures, Calculus"
                              value={preferences.topic || ''}
                              onChange={(e) => setPreferences({ ...preferences, topic: e.target.value })}
                              className="w-full h-12 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-200 transition-all duration-300"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              <Layers className="w-4 h-4 inline mr-2" />
                              Sub-topic
                            </label>
                            <Input
                              type="text"
                              placeholder="e.g., Binary Trees, Derivatives"
                              value={preferences.subtopic || ''}
                              onChange={(e) => setPreferences({ ...preferences, subtopic: e.target.value })}
                              className="w-full h-12 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-200 transition-all duration-300"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              <Gauge className="w-4 h-4 inline mr-2" />
                              Difficulty Level
                            </label>
                            <Select
                              options={difficultyOptions}
                              value={preferences.difficulty}
                              onChange={(e) => setPreferences({ ...preferences, difficulty: e.target.value as any })}
                              className="w-full h-12 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-200 transition-all duration-300"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              <Globe className="w-4 h-4 inline mr-2" />
                              Language
                            </label>
                            <Select
                              options={languageOptions}
                              value={preferences.language}
                              onChange={(e) => setPreferences({ ...preferences, language: e.target.value as any })}
                              className="w-full h-12 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-200 transition-all duration-300"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              <Hash className="w-4 h-4 inline mr-2" />
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
                              className="w-full h-12 text-lg border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-blue-200 transition-all duration-300"
                            />
                          </div>
                        </div>

                        {!isCompetitionMode && (
                          <div className="mt-8 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border-2 border-yellow-200">
                            <div className="flex items-start space-x-4">
                              <Shield className="w-6 h-6 text-yellow-600 mt-1" />
                              <div className="flex-1">
                                <h4 className="font-semibold text-yellow-800 mb-2">Negative Marking</h4>
                                <label className="flex items-center space-x-3 mb-4">
                                  <input
                                    type="checkbox"
                                    checked={preferences.negativeMarking || false}
                                    onChange={(e) => setPreferences({ 
                                      ...preferences, 
                                      negativeMarking: e.target.checked,
                                      negativeMarks: e.target.checked ? -0.25 : 0
                                    })}
                                    className="form-checkbox h-5 w-5 text-yellow-600 rounded border-gray-300 focus:ring-yellow-500 transition-colors"
                                  />
                                  <span className="text-sm font-medium text-yellow-700">Enable negative marking for wrong answers</span>
                                </label>
                                
                                {preferences.negativeMarking && (
                                  <div className="ml-8">
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
                                      className="w-32 h-10 border-2 border-yellow-300 rounded-lg focus:border-yellow-500 focus:ring-yellow-200"
                                    />
                                    <p className="text-sm text-yellow-600 mt-1">
                                      Marks deducted per wrong answer (between -5 and 0)
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </CardBody>
                    </Card>
                  </motion.div>
                )}

                {/* Question Types */}
                {activeSection === 'questions' && (
                  <motion.div
                    key="questions"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="shadow-xl border-2 border-purple-100 overflow-hidden">
                      <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-500" />
                      <CardBody className="p-8">
                        <div className="flex items-center mb-8">
                          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-4">
                            <ListChecks className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold text-gray-800">Question Types</h2>
                            <p className="text-gray-600">
                              {isCompetitionMode 
                                ? 'Select question types optimized for competitive play'
                                : 'Choose the types of questions for your quiz'
                              }
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {questionTypeOptions.map((option) => (
                            <motion.button
                              key={option.value}
                              type="button"
                              onClick={() => handleQuestionTypeToggle(option.value)}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className={`p-6 rounded-2xl text-left transition-all duration-300 border-2 ${
                                isQuestionTypeSelected(option.value)
                                  ? 'bg-gradient-to-br from-purple-50 to-pink-50 border-purple-300 shadow-lg ring-4 ring-purple-100'
                                  : 'bg-white border-gray-200 hover:border-purple-200 hover:shadow-md'
                              }`}
                            >
                              <div className="flex items-start space-x-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                  isQuestionTypeSelected(option.value)
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                    : 'bg-gray-100 text-gray-600'
                                }`}>
                                  <option.icon className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <h4 className="font-semibold text-gray-800">{option.label}</h4>
                                    {isQuestionTypeSelected(option.value) && (
                                      <CheckCircle2 className="w-5 h-5 text-purple-600" />
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600">{option.description}</p>
                                </div>
                              </div>
                            </motion.button>
                          ))}
                        </div>

                        <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-2 border-blue-200">
                          <div className="flex items-center space-x-3 mb-3">
                            <Info className="w-5 h-5 text-blue-600" />
                            <h4 className="font-semibold text-blue-800">Selection Guide</h4>
                          </div>
                          <p className="text-blue-700 text-sm">
                            {isCompetitionMode 
                              ? 'Competition modes use faster question types for real-time gameplay. Multiple choice and true/false questions work best for competitive scenarios.'
                              : 'Mix different question types to create a comprehensive learning experience. Case studies and situation questions provide deeper understanding.'
                            }
                          </p>
                        </div>
                      </CardBody>
                    </Card>
                  </motion.div>
                )}

                {/* Competition Settings */}
                {activeSection === 'competition' && isCompetitionMode && (
                  <motion.div
                    key="competition"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="shadow-xl border-2 border-yellow-100 overflow-hidden">
                      <div className="h-2 bg-gradient-to-r from-yellow-500 to-orange-500" />
                      <CardBody className="p-8">
                        <div className="flex items-center mb-8">
                          <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mr-4">
                            <Crown className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold text-gray-800">Competition Details</h2>
                            <p className="text-gray-600">Set up your competition and invite participants</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              <Trophy className="w-4 h-4 inline mr-2" />
                              Competition Title *
                            </label>
                            <Input
                              type="text"
                              placeholder="e.g., Computer Science Challenge"
                              value={competitionForm.title}
                              onChange={(e) => setCompetitionForm({ ...competitionForm, title: e.target.value })}
                              className="w-full h-12 text-lg border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:ring-yellow-200 transition-all duration-300"
                              required
                            />
                          </div>

                          <div className="space-y-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              <Users className="w-4 h-4 inline mr-2" />
                              Max Participants
                            </label>
                            <Select
                              options={[
                                { value: '2', label: '2 Players - Head to Head' },
                                { value: '4', label: '4 Players - Small Group' },
                                { value: '6', label: '6 Players - Medium Group' },
                                { value: '8', label: '8 Players - Large Group' },
                                { value: '10', label: '10 Players - Tournament' }
                              ]}
                              value={competitionForm.maxParticipants.toString()}
                              onChange={(e) => setCompetitionForm({ ...competitionForm, maxParticipants: parseInt(e.target.value) })}
                              className="w-full h-12 text-lg border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:ring-yellow-200 transition-all duration-300"
                            />
                          </div>
                        </div>

                        <div className="space-y-2 mb-8">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            <BookOpen className="w-4 h-4 inline mr-2" />
                            Description (Optional)
                          </label>
                          <textarea
                            placeholder="Describe your competition, rules, or any special instructions..."
                            value={competitionForm.description}
                            onChange={(e) => setCompetitionForm({ ...competitionForm, description: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-colors resize-none h-24"
                            rows={3}
                          />
                        </div>

                        <div className="space-y-4">
                          <label className="block text-sm font-semibold text-gray-700">
                            <Mail className="w-4 h-4 inline mr-2" />
                            Invite Participants (Optional)
                          </label>
                          {competitionForm.emails.map((email, index) => (
                            <div key={index} className="flex items-center space-x-3">
                              <div className="flex-1 relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <Input
                                  type="email"
                                  placeholder="participant@example.com"
                                  value={email}
                                  onChange={(e) => updateEmail(index, e.target.value)}
                                  className="w-full h-12 pl-12 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:ring-yellow-200 transition-all duration-300"
                                />
                              </div>
                              {competitionForm.emails.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  onClick={() => removeEmail(index)}
                                  className="text-red-600 hover:text-red-700 hover:bg-red-50 h-12 w-12 rounded-xl"
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
                            className="w-full border-dashed border-2 border-yellow-300 text-yellow-600 hover:bg-yellow-50 h-12 rounded-xl"
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Another Email
                          </Button>
                        </div>

                        <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                          <h4 className="font-semibold text-green-800 mb-4 flex items-center">
                            <Star className="w-5 h-5 mr-2" />
                            Competition Features
                          </h4>
                          <div className="grid grid-cols-2 gap-4 text-sm text-green-700">
                            <div className="flex items-center space-x-2">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Real-time leaderboard</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Live progress tracking</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Automatic scoring</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Competition chat</span>
                            </div>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  </motion.div>
                )}

                {/* Time Settings - Solo Only */}
                {activeSection === 'timing' && !isCompetitionMode && (
                  <motion.div
                    key="timing"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="shadow-xl border-2 border-green-100 overflow-hidden">
                      <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-500" />
                      <CardBody className="p-8">
                        <div className="flex items-center mb-8">
                          <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mr-4">
                            <Timer className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold text-gray-800">Time Settings</h2>
                            <p className="text-gray-600">Configure time limits for your quiz</p>
                          </div>
                        </div>
                        
                        <div className="space-y-8">
                          <div className="flex items-center space-x-4">
                            <input
                              type="checkbox"
                              checked={preferences.timeLimitEnabled}
                              onChange={(e) => handleTimeLimitToggle(e.target.checked)}
                              className="form-checkbox h-6 w-6 text-green-600 rounded border-gray-300 focus:ring-green-500 transition-colors"
                            />
                            <span className="text-lg font-semibold text-gray-700">Enable Time Limit</span>
                          </div>

                          {preferences.timeLimitEnabled && (
                            <>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <motion.button
                                  type="button"
                                  onClick={() => setTimingMode('per-question')}
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                                    timingMode === 'per-question'
                                      ? 'border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg'
                                      : 'border-gray-200 hover:border-green-200 bg-white'
                                  }`}
                                >
                                  <Clock className="w-8 h-8 mx-auto mb-4 text-green-600" />
                                  <div className="font-semibold text-gray-800 mb-2">Time per Question</div>
                                  <div className="text-sm text-gray-600">Set individual time limit for each question</div>
                                </motion.button>
                                
                                <motion.button
                                  type="button"
                                  onClick={() => setTimingMode('total')}
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                                    timingMode === 'total'
                                      ? 'border-green-300 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg'
                                      : 'border-gray-200 hover:border-green-200 bg-white'
                                  }`}
                                >
                                  <AlarmClock className="w-8 h-8 mx-auto mb-4 text-green-600" />
                                  <div className="font-semibold text-gray-800 mb-2">Total Quiz Time</div>
                                  <div className="text-sm text-gray-600">Set overall time limit for entire quiz</div>
                                </motion.button>
                              </div>
                              
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <label className="block text-sm font-semibold text-gray-700">
                                    Time Setting (in seconds)
                                  </label>
                                  <div className="flex items-center space-x-4">
                                    <Input
                                      type="number"
                                      min={1}
                                      max={3600}
                                      value={timingMode === 'per-question' ? preferences.timeLimit || 30 : preferences.totalTimeLimit || 300}
                                      onChange={(e) => handleTimeSettingChange(e.target.value)}
                                      className="w-32 h-12 text-lg border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-green-200 transition-all duration-300"
                                    />
                                    <span className="text-gray-600 font-medium">seconds</span>
                                  </div>
                                </div>
                                
                                <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                                  <h4 className="font-semibold text-green-700 mb-2 flex items-center">
                                    <Info className="w-5 h-5 mr-2" />
                                    Current Time Setting
                                  </h4>
                                  <p className="text-green-600">{calculateTotalTime()}</p>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </CardBody>
                    </Card>
                  </motion.div>
                )}

                {/* Quiz Mode - Solo Only */}
                {activeSection === 'mode' && !isCompetitionMode && (
                  <motion.div
                    key="mode"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Card className="shadow-xl border-2 border-orange-100 overflow-hidden">
                      <div className="h-2 bg-gradient-to-r from-orange-500 to-red-500" />
                      <CardBody className="p-8">
                        <div className="flex items-center mb-8">
                          <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center mr-4">
                            <BarChart3 className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h2 className="text-2xl font-bold text-gray-800">Quiz Mode</h2>
                            <p className="text-gray-600">Choose between practice and exam modes</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <motion.button
                            type="button"
                            onClick={() => setPreferences({ ...preferences, mode: 'practice' })}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`p-8 rounded-2xl border-2 transition-all duration-300 text-left ${
                              preferences.mode === 'practice'
                                ? 'border-orange-300 bg-gradient-to-br from-orange-50 to-red-50 shadow-lg ring-4 ring-orange-100'
                                : 'border-gray-200 hover:border-orange-200 bg-white'
                            }`}
                          >
                            <div className="flex items-center mb-4">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${
                                preferences.mode === 'practice'
                                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                <BookOpen className="w-6 h-6" />
                              </div>
                              <div>
                                <span className="text-xl font-bold text-gray-800">Practice Mode</span>
                                {preferences.mode === 'practice' && (
                                  <CheckCircle2 className="w-6 h-6 text-orange-600 ml-2 inline" />
                                )}
                              </div>
                            </div>
                            <p className="text-gray-600 mb-4">
                              Get immediate feedback after each question. Perfect for learning and understanding concepts.
                            </p>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center space-x-2 text-green-600">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Instant explanations</span>
                              </div>
                              <div className="flex items-center space-x-2 text-green-600">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Learn as you go</span>
                              </div>
                              <div className="flex items-center space-x-2 text-green-600">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>No pressure environment</span>
                              </div>
                            </div>
                          </motion.button>
                          
                          <motion.button
                            type="button"
                            onClick={() => setPreferences({ ...preferences, mode: 'exam' })}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`p-8 rounded-2xl border-2 transition-all duration-300 text-left ${
                              preferences.mode === 'exam'
                                ? 'border-orange-300 bg-gradient-to-br from-orange-50 to-red-50 shadow-lg ring-4 ring-orange-100'
                                : 'border-gray-200 hover:border-orange-200 bg-white'
                            }`}
                          >
                            <div className="flex items-center mb-4">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 ${
                                preferences.mode === 'exam'
                                  ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white'
                                  : 'bg-gray-100 text-gray-600'
                              }`}>
                                <BarChart3 className="w-6 h-6" />
                              </div>
                              <div>
                                <span className="text-xl font-bold text-gray-800">Exam Mode</span>
                                {preferences.mode === 'exam' && (
                                  <CheckCircle2 className="w-6 h-6 text-orange-600 ml-2 inline" />
                                )}
                              </div>
                            </div>
                            <p className="text-gray-600 mb-4">
                              See results only at the end. Simulates real exam conditions for better preparation.
                            </p>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center space-x-2 text-blue-600">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Realistic exam simulation</span>
                              </div>
                              <div className="flex items-center space-x-2 text-blue-600">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>End-of-quiz results</span>
                              </div>
                              <div className="flex items-center space-x-2 text-blue-600">
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Test your knowledge</span>
                              </div>
                            </div>
                          </motion.button>
                        </div>
                      </CardBody>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Error Display */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg"
                >
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </motion.div>
              )}

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex justify-center"
              >
                <Button
                  type="submit"
                  disabled={isLoading || competitionLoading || !preferences.course}
                  className="gradient-bg hover:opacity-90 transition-all duration-300 transform hover:scale-105 group text-xl px-12 py-4 rounded-2xl shadow-2xl"
                >
                  {isLoading || competitionLoading ? (
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-3">
                      {isCompetitionMode ? (
                        <>
                          <Crown className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                          <span>Create Competition</span>
                        </>
                      ) : (
                        <>
                          <PlayCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
                          <span>Start Quiz</span>
                        </>
                      )}
                      <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" />
                    </div>
                  )}
                </Button>
              </motion.div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizPreferencesForm;