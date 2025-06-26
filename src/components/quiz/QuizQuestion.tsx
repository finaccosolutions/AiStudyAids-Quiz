import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Question } from '../../types';
import { Button } from '../ui/Button';
import { Card, CardBody } from '../ui/Card';
import { 
  ChevronLeft, ChevronRight, Clock, Flag, Volume2, VolumeX, 
  CheckCircle, Circle, Square, ArrowLeft, LogOut, AlertTriangle,
  Timer, Target, Brain, Zap, Star, Award, Trophy, Activity,
  Play, Pause, RotateCcw, Eye, EyeOff, Lightbulb, HelpCircle,
  Sparkles, Flame, Rocket, Crown, Shield
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { speechService } from '../../services/speech';

interface QuizQuestionProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  userAnswer?: string;
  onAnswer: (answer: string) => void;
  onPrevious: () => void;
  onNext: () => void;
  isLastQuestion: boolean;
  onFinish: () => void;
  language?: string;
  timeLimitEnabled?: boolean;
  timeLimit?: number | null;
  totalTimeLimit?: number | null;
  totalTimeRemaining?: number | null;
  mode?: 'practice' | 'exam';
  answerMode?: 'immediate' | 'end';
  onQuitQuiz?: () => void;
  showQuitButton?: boolean;
}

const QuizQuestion: React.FC<QuizQuestionProps> = ({
  question,
  questionNumber,
  totalQuestions,
  userAnswer = '',
  onAnswer,
  onPrevious,
  onNext,
  isLastQuestion,
  onFinish,
  language = 'en',
  timeLimitEnabled = false,
  timeLimit,
  totalTimeLimit,
  totalTimeRemaining,
  mode = 'practice',
  answerMode = 'immediate',
  onQuitQuiz,
  showQuitButton = true
}) => {
  const [questionTimeLeft, setQuestionTimeLeft] = useState<number | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(userAnswer);
  
  const questionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isComponentMountedRef = useRef(true);

  // Initialize timers based on preferences
  useEffect(() => {
    isComponentMountedRef.current = true;
    
    // Set up per-question timer if enabled and timeLimit is set (and no total time limit)
    if (timeLimitEnabled && timeLimit && !totalTimeLimit) {
      setQuestionTimeLeft(timeLimit);
    }

    return () => {
      isComponentMountedRef.current = false;
      if (questionTimerRef.current) {
        clearInterval(questionTimerRef.current);
      }
    };
  }, [question.id, timeLimitEnabled, timeLimit, totalTimeLimit]);

  // Per-question timer countdown
  useEffect(() => {
    if (questionTimerRef.current) {
      clearInterval(questionTimerRef.current);
    }

    if (questionTimeLeft !== null && questionTimeLeft > 0 && isComponentMountedRef.current) {
      questionTimerRef.current = setInterval(() => {
        setQuestionTimeLeft(prev => {
          if (prev === null || prev <= 1) {
            // Auto-advance to next question when time runs out
            if (isComponentMountedRef.current) {
              setTimeout(() => {
                if (isLastQuestion) {
                  onFinish();
                } else {
                  onNext();
                }
              }, 100);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (questionTimerRef.current) {
        clearInterval(questionTimerRef.current);
      }
    };
  }, [questionTimeLeft, isLastQuestion, onNext, onFinish, question.id]);

  // Update selected answer when userAnswer prop changes
  useEffect(() => {
    setSelectedAnswer(userAnswer);
    setIsAnswered(!!userAnswer && userAnswer.trim() !== '');
  }, [userAnswer]);

  const handleAnswerSelect = useCallback((answer: string) => {
    setSelectedAnswer(answer);
    setIsAnswered(true);
    onAnswer(answer);
  }, [onAnswer]);

  const handleNext = useCallback(() => {
    if (isLastQuestion) {
      onFinish();
    } else {
      onNext();
    }
  }, [isLastQuestion, onNext, onFinish]);

  const handleSpeech = useCallback(() => {
    if (isSpeaking) {
      speechService.stop();
      setIsSpeaking(false);
    } else {
      speechService.speak(question.text, language);
      setIsSpeaking(true);
      
      const checkSpeakingInterval = setInterval(() => {
        if (!speechService.isSpeaking()) {
          setIsSpeaking(false);
          clearInterval(checkSpeakingInterval);
        }
      }, 100);
    }
  }, [isSpeaking, question.text, language]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    return (questionNumber / totalQuestions) * 100;
  };

  const getTimeWarningLevel = (timeLeft: number, totalTime: number) => {
    const percentage = (timeLeft / totalTime) * 100;
    if (percentage <= 10) return 'critical';
    if (percentage <= 25) return 'warning';
    return 'normal';
  };

  const renderQuestionContent = () => {
    const optionVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.1 }
      }),
      hover: { scale: 1.02, y: -2 },
      tap: { scale: 0.98 }
    };

    switch (question.type) {
      case 'multiple-choice':
        return (
          <div className="space-y-3 sm:space-y-4">
            {question.options?.map((option, index) => {
              const isSelected = selectedAnswer === option;
              const optionLetter = String.fromCharCode(65 + index); // A, B, C, D
              
              return (
                <motion.button
                  key={index}
                  custom={index}
                  variants={optionVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                  whileTap="tap"
                  onClick={() => handleAnswerSelect(option)}
                  className={`w-full p-4 sm:p-6 text-left rounded-2xl border-2 transition-all duration-300 group relative overflow-hidden ${
                    isSelected
                      ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-indigo-50 shadow-xl ring-4 ring-purple-200'
                      : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50 hover:shadow-lg'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 flex items-center justify-center font-bold text-lg transition-all duration-300 flex-shrink-0 ${
                      isSelected
                        ? 'border-purple-600 bg-purple-600 text-white shadow-lg'
                        : 'border-gray-300 text-gray-500 group-hover:border-purple-400 group-hover:text-purple-600'
                    }`}>
                      {isSelected ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        >
                          <CheckCircle className="w-6 h-6" />
                        </motion.div>
                      ) : (
                        optionLetter
                      )}
                    </div>
                    <span className={`font-medium text-base sm:text-lg transition-colors duration-300 ${
                      isSelected ? 'text-purple-800' : 'text-gray-800 group-hover:text-purple-700'
                    }`}>
                      {option}
                    </span>
                  </div>
                  
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute top-2 right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center"
                    >
                      <CheckCircle className="w-4 h-4 text-white" />
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>
        );

      case 'true-false':
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {['True', 'False'].map((option, index) => {
              const isSelected = selectedAnswer === option;
              const icon = option === 'True' ? CheckCircle : Circle;
              const IconComponent = icon;
              
              return (
                <motion.button
                  key={option}
                  custom={index}
                  variants={optionVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                  whileTap="tap"
                  onClick={() => handleAnswerSelect(option)}
                  className={`p-6 sm:p-8 rounded-2xl font-bold text-lg sm:text-xl transition-all duration-300 relative overflow-hidden group ${
                    isSelected
                      ? option === 'True'
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-xl ring-4 ring-green-300'
                        : 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-xl ring-4 ring-red-300'
                      : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50 hover:shadow-lg'
                  }`}
                >
                  <div className="flex flex-col items-center space-y-3">
                    <IconComponent className={`w-8 h-8 sm:w-10 sm:h-10 ${
                      isSelected ? 'text-white' : 'text-gray-400 group-hover:text-purple-500'
                    }`} />
                    <span>{option}</span>
                  </div>
                  
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute inset-0 bg-white/20 rounded-2xl"
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        );

      case 'multi-select':
        const selectedOptions = selectedAnswer ? selectedAnswer.split(',') : [];
        
        return (
          <div className="space-y-3 sm:space-y-4">
            <div className="bg-blue-50 p-3 sm:p-4 rounded-xl border border-blue-200 mb-4 sm:mb-6">
              <p className="text-blue-800 font-medium text-sm sm:text-base">
                <Target className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2" />
                Select all correct answers ({selectedOptions.length} selected)
              </p>
            </div>
            
            {question.options?.map((option, index) => {
              const isSelected = selectedOptions.includes(option);
              
              return (
                <motion.button
                  key={index}
                  custom={index}
                  variants={optionVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                  whileTap="tap"
                  onClick={() => {
                    const newSelected = isSelected
                      ? selectedOptions.filter(opt => opt !== option)
                      : [...selectedOptions, option];
                    handleAnswerSelect(newSelected.join(','));
                  }}
                  className={`w-full p-4 sm:p-6 text-left rounded-2xl border-2 transition-all duration-300 group ${
                    isSelected
                      ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-indigo-50 shadow-xl'
                      : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50 hover:shadow-lg'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded border-2 flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
                      isSelected
                        ? 'border-purple-600 bg-purple-600 shadow-lg'
                        : 'border-gray-300 group-hover:border-purple-400'
                    }`}>
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        >
                          <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </motion.div>
                      )}
                    </div>
                    <span className={`font-medium text-base sm:text-lg transition-colors duration-300 ${
                      isSelected ? 'text-purple-800' : 'text-gray-800 group-hover:text-purple-700'
                    }`}>
                      {option}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        );

      case 'sequence':
        const sequenceOrder = selectedAnswer ? selectedAnswer.split(',') : [];
        const availableSteps = question.sequence?.filter(step => !sequenceOrder.includes(step)) || [];
        
        return (
          <div className="space-y-6">
            <div className="bg-orange-50 p-3 sm:p-4 rounded-xl border border-orange-200">
              <p className="text-orange-800 font-medium text-sm sm:text-base">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2" />
                Arrange the steps in the correct order
              </p>
            </div>
            
            {/* Selected sequence */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800 text-base sm:text-lg">Your Sequence:</h4>
              <div className="min-h-[120px] border-2 border-dashed border-gray-300 rounded-xl p-4 bg-gray-50">
                {sequenceOrder.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Drag steps here to arrange them</p>
                ) : (
                  <div className="space-y-2">
                    {sequenceOrder.map((step, index) => (
                      <motion.div
                        key={step}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center space-x-3 bg-white p-3 rounded-lg border border-gray-200 shadow-sm"
                      >
                        <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                          {index + 1}
                        </div>
                        <span className="flex-1 text-sm sm:text-base">{step}</span>
                        <button
                          onClick={() => {
                            const newOrder = sequenceOrder.filter(s => s !== step);
                            handleAnswerSelect(newOrder.join(','));
                          }}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          ×
                        </button>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Available steps */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800 text-base sm:text-lg">Available Steps:</h4>
              <div className="grid grid-cols-1 gap-2">
                {availableSteps.map((step, index) => (
                  <motion.button
                    key={step}
                    custom={index}
                    variants={optionVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                    whileTap="tap"
                    onClick={() => {
                      const newOrder = [...sequenceOrder, step];
                      handleAnswerSelect(newOrder.join(','));
                    }}
                    className="p-3 sm:p-4 text-left rounded-xl border-2 border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50 transition-all duration-300 text-sm sm:text-base"
                  >
                    {step}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        );

      case 'case-study':
      case 'situation':
        return (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 sm:p-6 rounded-2xl border border-blue-200">
              <h4 className="font-bold text-blue-800 mb-3 text-base sm:text-lg">
                {question.type === 'case-study' ? 'Case Study:' : 'Situation:'}
              </h4>
              <p className="text-blue-700 leading-relaxed text-sm sm:text-base">
                {question.caseStudy || question.situation}
              </p>
            </div>
            
            <div className="bg-purple-50 p-3 sm:p-4 rounded-xl border border-purple-200">
              <p className="text-purple-800 font-medium text-sm sm:text-base">
                <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2" />
                {question.question}
              </p>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              {question.options?.map((option, index) => {
                const isSelected = selectedAnswer === option;
                const optionLetter = String.fromCharCode(65 + index);
                
                return (
                  <motion.button
                    key={index}
                    custom={index}
                    variants={optionVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                    whileTap="tap"
                    onClick={() => handleAnswerSelect(option)}
                    className={`w-full p-4 sm:p-6 text-left rounded-2xl border-2 transition-all duration-300 group ${
                      isSelected
                        ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-indigo-50 shadow-xl ring-4 ring-purple-200'
                        : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50 hover:shadow-lg'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 flex items-center justify-center font-bold text-sm sm:text-base transition-all duration-300 flex-shrink-0 ${
                        isSelected
                          ? 'border-purple-600 bg-purple-600 text-white shadow-lg'
                          : 'border-gray-300 text-gray-500 group-hover:border-purple-400 group-hover:text-purple-600'
                      }`}>
                        {isSelected ? (
                          <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                        ) : (
                          optionLetter
                        )}
                      </div>
                      <span className={`font-medium text-sm sm:text-base leading-relaxed transition-colors duration-300 ${
                        isSelected ? 'text-purple-800' : 'text-gray-800 group-hover:text-purple-700'
                      }`}>
                        {option}
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        );

      case 'short-answer':
      case 'fill-blank':
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="bg-green-50 p-3 sm:p-4 rounded-xl border border-green-200">
              <p className="text-green-800 font-medium text-sm sm:text-base">
                <Lightbulb className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2" />
                {question.type === 'fill-blank' 
                  ? 'Fill in the blank with the most appropriate word or phrase'
                  : 'Provide a short, concise answer'
                }
              </p>
            </div>
            
            <div className="relative">
              <input
                type="text"
                placeholder={question.type === 'fill-blank' 
                  ? 'Enter the missing word or phrase...'
                  : 'Type your answer here...'
                }
                value={selectedAnswer}
                onChange={(e) => handleAnswerSelect(e.target.value)}
                className="w-full p-4 sm:p-6 text-base sm:text-xl border-2 border-gray-300 rounded-2xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200 focus:outline-none transition-all duration-300 bg-white shadow-sm hover:shadow-md"
                autoComplete="off"
              />
              {selectedAnswer && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
                >
                  <CheckCircle className="w-5 h-5 text-white" />
                </motion.div>
              )}
            </div>
            
            {question.keywords && question.keywords.length > 0 && (
              <div className="bg-yellow-50 p-3 sm:p-4 rounded-xl border border-yellow-200">
                <p className="text-yellow-800 text-xs sm:text-sm">
                  <Star className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                  Hint: Consider terms related to {question.keywords.slice(0, 2).join(', ')}
                </p>
              </div>
            )}
          </div>
        );

      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-500">Question type not supported</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-cyan-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-indigo-200/20 to-purple-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      {/* Header with Progress and Timer */}
      <div className="bg-white/90 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-40 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
            {/* Progress Info */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Brain className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <span className="font-bold text-gray-800 text-sm sm:text-base">
                    Question {questionNumber} of {totalQuestions}
                  </span>
                  <div className="text-xs text-gray-500">
                    {Math.round(getProgressPercentage())}% Complete
                  </div>
                </div>
              </div>
              <div className="hidden sm:block w-px h-8 bg-gray-300" />
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <Target className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  <span className="text-gray-600 text-sm sm:text-base capitalize font-medium">
                    {question.difficulty || 'Medium'}
                  </span>
                </div>
                <span className="text-gray-400">•</span>
                <span className="text-gray-600 text-sm sm:text-base">
                  {question.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              </div>
            </div>

            {/* Timer and Actions */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              {/* Question Timer */}
              {questionTimeLeft !== null && (
                <motion.div 
                  animate={{ scale: questionTimeLeft <= 10 ? [1, 1.05, 1] : 1 }}
                  transition={{ duration: 0.5, repeat: questionTimeLeft <= 10 ? Infinity : 0 }}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-xl transition-all duration-300 shadow-lg ${
                    questionTimeLeft <= 10 
                      ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white animate-pulse' 
                      : questionTimeLeft <= 30 
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white' 
                        : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                  }`}
                >
                  <Timer className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="font-mono font-bold text-sm sm:text-base">
                    {formatTime(questionTimeLeft)}
                  </span>
                </motion.div>
              )}

              {/* Total Timer */}
              {totalTimeRemaining !== null && (
                <motion.div 
                  animate={{ scale: totalTimeRemaining <= 60 ? [1, 1.05, 1] : 1 }}
                  transition={{ duration: 0.5, repeat: totalTimeRemaining <= 60 ? Infinity : 0 }}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-xl transition-all duration-300 shadow-lg ${
                    totalTimeRemaining <= 60 
                      ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white animate-pulse' 
                      : totalTimeRemaining <= 300 
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white' 
                        : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                  }`}
                >
                  <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="font-mono font-bold text-sm sm:text-base">
                    {formatTime(totalTimeRemaining)}
                  </span>
                </motion.div>
              )}

              {/* Speech Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSpeech}
                className={`p-2 rounded-xl transition-all duration-300 shadow-lg ${
                  isSpeaking 
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white' 
                    : 'bg-white text-gray-600 hover:bg-purple-100 hover:text-purple-600 border border-gray-200'
                }`}
              >
                {isSpeaking ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />}
              </motion.button>

              {/* Quit Button */}
              {showQuitButton && onQuitQuiz && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowLeaveConfirm(true)}
                  className="p-2 rounded-xl bg-red-100 text-red-600 hover:bg-red-200 transition-all duration-300 shadow-lg border border-red-200"
                >
                  <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.button>
              )}
            </div>
          </div>

          {/* Enhanced Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
              <motion.div
                className="bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 h-3 rounded-full shadow-lg relative overflow-hidden"
                initial={{ width: 0 }}
                animate={{ width: `${getProgressPercentage()}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 animate-pulse" />
              </motion.div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span className="flex items-center">
                <Rocket className="w-3 h-3 mr-1" />
                {Math.round(getProgressPercentage())}% Complete
              </span>
              <span className="flex items-center">
                <Flag className="w-3 h-3 mr-1" />
                {totalQuestions - questionNumber} remaining
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 relative z-10">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm overflow-hidden relative">
            {/* Card Header Decoration */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500" />
            
            <CardBody className="p-6 sm:p-8">
              {/* Question Text */}
              <div className="mb-6 sm:mb-8">
                <motion.h2 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800 leading-relaxed mb-6"
                >
                  {question.text}
                </motion.h2>
                
                {/* Question Type Badges */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="px-4 py-2 bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 text-xs sm:text-sm font-bold rounded-full border border-purple-200 shadow-sm"
                  >
                    <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />
                    {question.type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </motion.span>
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-full border shadow-sm ${
                      question.difficulty === 'basic' 
                        ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border-green-200'
                        : question.difficulty === 'advanced'
                          ? 'bg-gradient-to-r from-red-100 to-pink-100 text-red-700 border-red-200'
                          : 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-700 border-yellow-200'
                    }`}
                  >
                    {question.difficulty === 'basic' && <Shield className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />}
                    {question.difficulty === 'intermediate' && <Star className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />}
                    {question.difficulty === 'advanced' && <Crown className="w-3 h-3 sm:w-4 sm:h-4 inline mr-1" />}
                    {question.difficulty?.charAt(0).toUpperCase() + question.difficulty?.slice(1) || 'Medium'}
                  </motion.span>
                  {isAnswered && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5 }}
                      className="px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 text-xs sm:text-sm font-bold rounded-full flex items-center border border-green-200 shadow-sm"
                    >
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      Answered
                    </motion.span>
                  )}
                </div>
              </div>

              {/* Question Content */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mb-8"
              >
                {renderQuestionContent()}
              </motion.div>

              {/* Navigation */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 pt-6 border-t border-gray-200"
              >
                <div className="flex items-center space-x-3">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={onPrevious}
                      disabled={questionNumber === 1}
                      variant="outline"
                      className="flex items-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-gray-300 hover:border-purple-300 hover:bg-purple-50"
                    >
                      <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="hidden sm:inline">Previous</span>
                    </Button>
                  </motion.div>
                  
                  <div className="flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg">
                    <span className="text-sm text-gray-600 font-medium">
                      {questionNumber} / {totalQuestions}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {/* Skip Button for Practice Mode */}
                  {mode === 'practice' && (
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        onClick={handleNext}
                        variant="outline"
                        className="px-4 sm:px-6 py-2 sm:py-3 text-gray-600 hover:text-gray-800 border-2 border-gray-300 hover:border-gray-400"
                      >
                        Skip
                      </Button>
                    </motion.div>
                  )}

                  {/* Next/Finish Button */}
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      onClick={handleNext}
                      disabled={!isAnswered && mode === 'exam'}
                      className={`px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-bold shadow-xl transition-all duration-300 relative overflow-hidden group ${
                        isAnswered 
                          ? 'bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white' 
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                      <div className="relative flex items-center space-x-2">
                        <span>{isLastQuestion ? 'Finish Quiz' : 'Next Question'}</span>
                        {isLastQuestion ? (
                          <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
                        ) : (
                          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-300" />
                        )}
                      </div>
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            </CardBody>
          </Card>
        </motion.div>
      </div>

      {/* Leave Confirmation Modal */}
      <AnimatePresence>
        {showLeaveConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 sm:p-8 max-w-md mx-4 shadow-2xl w-full"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Leave Quiz?</h3>
                <p className="text-gray-600 mb-6 text-sm sm:text-base">
                  Are you sure you want to leave this quiz? Your progress will be lost and you'll need to start over.
                </p>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                  <Button
                    onClick={() => setShowLeaveConfirm(false)}
                    variant="outline"
                    className="flex-1 border-2 border-gray-300 hover:border-gray-400"
                  >
                    Continue Quiz
                  </Button>
                  <Button
                    onClick={() => {
                      setShowLeaveConfirm(false);
                      onQuitQuiz?.();
                    }}
                    className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white"
                  >
                    Leave Quiz
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuizQuestion;