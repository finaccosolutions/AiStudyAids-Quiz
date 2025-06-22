import { useState, useEffect, useCallback } from 'react';
import { Question } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardBody, CardFooter } from '../ui/Card';
import { ArrowLeft, ArrowRight, CheckCircle, Volume2, VolumeX, BookOpen, Clock, Sparkles, Target, Zap, Star, Activity, Rocket, Shield, CloudLightning as Lightning, X, LogOut, AlertTriangle } from 'lucide-react';
import { speechService } from '../../services/speech';
import { motion, AnimatePresence } from 'framer-motion';
import { evaluateTextAnswer } from '../../services/gemini';
import { useQuizStore } from '../../store/useQuizStore';

interface QuizQuestionProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  userAnswer: string | undefined;
  onAnswer: (answer: string) => void;
  onPrevious: () => void;
  onNext: () => void;
  isLastQuestion: boolean;
  onFinish: () => void;
  language: string;
  timeLimitEnabled: boolean;
  timeLimit?: string | null;
  totalTimeLimit?: string | null;
  totalTimeRemaining?: number | null;
  mode: 'practice' | 'exam';
  answerMode: 'immediate' | 'end';
  onQuitQuiz?: () => void;
  totalTimeElapsed?: number;
  showQuitButton?: boolean;
}

const QuizQuestion: React.FC<QuizQuestionProps> = ({
  question,
  questionNumber,
  totalQuestions,
  userAnswer,
  onAnswer,
  onPrevious,
  onNext,
  isLastQuestion,
  onFinish,
  language,
  timeLimitEnabled,
  timeLimit,
  totalTimeLimit,
  totalTimeRemaining,
  mode,
  answerMode,
  totalTimeElapsed = 0,
  showQuitButton,
  onQuitQuiz 
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState(userAnswer || '');
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [sequenceOrder, setSequenceOrder] = useState<string[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const [totalElapsed, setTotalElapsed] = useState(totalTimeElapsed);
  const [timeLeft, setTimeLeft] = useState<number | null>(() => {
    if (!timeLimitEnabled) return null;
    // Use totalTimeRemaining if available, otherwise use per-question timeLimit
    return totalTimeRemaining !== undefined && totalTimeRemaining !== null 
      ? totalTimeRemaining 
      : (timeLimit && timeLimit !== 'none' ? parseInt(timeLimit) : null);
  });
  const [hasAnswered, setHasAnswered] = useState(false);
  const [answerEvaluation, setAnswerEvaluation] = useState<{
    isCorrect: boolean;
    feedback: string;
    score: number;
  } | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const { apiKey } = useQuizStore();

  useEffect(() => {
    setSelectedAnswer(userAnswer || '');
    setHasAnswered(!!userAnswer);
    
    if (question.type === 'multi-select') {
      setSelectedOptions(userAnswer ? userAnswer.split(',') : []);
    } else if (question.type === 'sequence') {
      setSequenceOrder(userAnswer ? userAnswer.split(',') : [...(question.sequence || [])]);
    }
    
    // Reset per-question timer when question changes
    if (timeLimitEnabled && timeLimit && timeLimit !== 'none' && !totalTimeLimit) {
      setTimeLeft(parseInt(timeLimit));
    }
  }, [userAnswer, question.id, timeLimit, totalTimeLimit, timeLimitEnabled]);

  // Per-question timer effect
useEffect(() => {
  let timer: NodeJS.Timeout;
  
  if (timeLeft !== null && timeLeft > 0) {
    timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  } else if (timeLeft === 0) {
    // Auto-submit when time expires
    if (!hasAnswered) {
      handleAnswerSubmit();
    }
    setTimeout(() => {
      if (isLastQuestion) {
        handleFinish();
      } else {
        handleNext();
      }
    }, 1000);
  }
  
  return () => clearInterval(timer);
}, [timeLeft, hasAnswered]);

  // Total elapsed time tracker
  useEffect(() => {
    const timer = setInterval(() => {
      setTotalElapsed(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const handleNext = useCallback(() => {
    onAnswer(selectedAnswer);
    setShowExplanation(false);
    setHasAnswered(false);
    setAnswerEvaluation(null);
    onNext();
  }, [selectedAnswer, onAnswer, onNext]);
  
  const handlePrevious = useCallback(() => {
    onAnswer(selectedAnswer);
    setShowExplanation(false);
    setHasAnswered(false);
    setAnswerEvaluation(null);
    onPrevious();
  }, [selectedAnswer, onAnswer, onPrevious]);
  
  const handleFinish = useCallback(() => {
    onAnswer(selectedAnswer);
    onFinish();
  }, [selectedAnswer, onAnswer, onFinish]);
  
  const handleAnswerSubmit = useCallback(async () => {
    setHasAnswered(true);
    
    if ((question.type === 'short-answer' || question.type === 'fill-blank') && 
        apiKey && selectedAnswer.trim()) {
      try {
        const evaluation = await evaluateTextAnswer(
          apiKey,
          question.text,
          selectedAnswer,
          question.correctAnswer || '',
          question.keywords || [],
          language
        );
        setAnswerEvaluation(evaluation);
      } catch (error) {
        console.error('Failed to evaluate answer:', error);
      }
    }
    
    if (mode === 'practice' || answerMode === 'immediate') {
      setShowExplanation(true);
    }
  }, [question, apiKey, selectedAnswer, language, mode, answerMode]);
  
  const playQuestionAudio = () => {
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
  };
  
  const getDifficultyColor = () => {
    switch (question.difficulty) {
      case 'basic': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'intermediate': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'advanced': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };
  
  const isAnswerCorrect = () => {
    if (answerEvaluation) {
      return answerEvaluation.isCorrect;
    }
    
    if (!question.correctAnswer || typeof question.correctAnswer !== 'string') {
      return false;
    }
    return selectedAnswer.toLowerCase() === question.correctAnswer.toLowerCase();
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleMultiSelectToggle = (option: string) => {
    const newSelection = selectedOptions.includes(option)
      ? selectedOptions.filter(opt => opt !== option)
      : [...selectedOptions, option];
    
    setSelectedOptions(newSelection);
    setSelectedAnswer(newSelection.join(','));
  };

  const handleSequenceReorder = (dragIndex: number, hoverIndex: number) => {
    const newOrder = [...sequenceOrder];
    const draggedItem = newOrder[dragIndex];
    newOrder.splice(dragIndex, 1);
    newOrder.splice(hoverIndex, 0, draggedItem);
    setSequenceOrder(newOrder);
    setSelectedAnswer(newOrder.join(','));
  };

  const moveSequenceItem = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex >= 0 && newIndex < sequenceOrder.length) {
      handleSequenceReorder(index, newIndex);
    }
  };

  const formatExplanation = (text: string) => {
    if (!text) return text;
    
    return text
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code class="bg-purple-100 text-purple-800 px-1 py-0.5 rounded text-sm font-mono">$1</code>')
      .replace(/\n/g, '<br>')
      .replace(/^\d+\.\s/gm, '<span class="font-semibold text-purple-600">$&</span>')
      .replace(/^[-•]\s/gm, '<span class="text-purple-600">• </span>');
  };
  
  const renderQuestionContent = () => {
    switch (question.type) {
      case 'multiple-choice':
        return (
          <motion.div 
            className="space-y-4 mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {question.options?.map((option, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                  hasAnswered && mode === 'practice' && answerMode === 'immediate' && question.correctAnswer
                    ? option.toLowerCase() === question.correctAnswer.toLowerCase()
                      ? 'border-emerald-500 bg-gradient-to-r from-emerald-50 to-emerald-100 shadow-lg scale-[1.02]'
                      : selectedAnswer === option
                        ? 'border-red-500 bg-gradient-to-r from-red-50 to-red-100 shadow-lg'
                        : 'border-gray-200 bg-gray-50'
                    : selectedAnswer === option
                      ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-indigo-50 shadow-xl scale-[1.02] ring-4 ring-purple-200'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 hover:shadow-lg hover:scale-[1.01]'
                }`}
                onClick={() => !hasAnswered && setSelectedAnswer(option)}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-400 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                <div className="relative p-4 sm:p-6 flex items-center">
                  <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0 transition-all duration-300 ${
                    selectedAnswer === option
                      ? 'border-purple-600 bg-purple-600 shadow-lg'
                      : 'border-gray-400 group-hover:border-purple-400'
                  }`}>
                    {selectedAnswer === option && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      >
                        <CheckCircle className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
                      </motion.div>
                    )}
                  </div>
                  <span className="text-gray-800 font-medium text-sm sm:text-lg group-hover:text-purple-700 transition-colors flex-1 break-words">
                    {option}
                  </span>
                  {hasAnswered && mode === 'practice' && answerMode === 'immediate' && question.correctAnswer && (
                    <div className="ml-auto flex-shrink-0">
                      {option.toLowerCase() === question.correctAnswer.toLowerCase() ? (
                        <motion.div
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          className="w-6 h-6 sm:w-8 sm:h-8 bg-emerald-500 rounded-full flex items-center justify-center"
                        >
                          <CheckCircle className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
                        </motion.div>
                      ) : selectedAnswer === option ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          className="w-6 h-6 sm:w-8 sm:h-8 bg-red-500 rounded-full flex items-center justify-center"
                        >
                          <span className="text-white font-bold text-sm sm:text-base">✕</span>
                        </motion.div>
                      ) : null}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        );
      
      case 'true-false':
        return (
          <motion.div 
            className="flex flex-col space-y-4 sm:flex-row sm:space-x-6 sm:space-y-0 mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {['True', 'False'].map((option) => (
              <motion.button
                key={option}
                type="button"
                disabled={hasAnswered}
                className={`group relative flex-1 py-6 sm:py-8 px-6 sm:px-8 rounded-2xl font-bold text-lg sm:text-xl transition-all duration-300 overflow-hidden ${
                  hasAnswered && mode === 'practice' && answerMode === 'immediate' && question.correctAnswer
                    ? option.toLowerCase() === question.correctAnswer.toLowerCase()
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-2xl scale-105'
                      : selectedAnswer === option
                        ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-xl'
                        : 'bg-gray-100 text-gray-500'
                    : selectedAnswer === option
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-2xl scale-105 ring-4 ring-purple-300'
                      : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-purple-100 hover:to-indigo-100 hover:text-purple-700 hover:shadow-xl hover:scale-102'
                }`}
                onClick={() => setSelectedAnswer(option)}
                whileHover={{ scale: selectedAnswer === option ? 1.05 : 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                <div className="relative flex items-center justify-center">
                  {option}
                  {selectedAnswer === option && (
                    <motion.div
                      initial={{ scale: 0, x: 20 }}
                      animate={{ scale: 1, x: 10 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className="ml-3"
                    >
                      <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
                    </motion.div>
                  )}
                </div>
              </motion.button>
            ))}
          </motion.div>
        );

      case 'multi-select':
        return (
          <motion.div 
            className="space-y-4 mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 sm:p-4 rounded-xl border border-blue-200">
              <p className="text-blue-800 font-medium flex items-center text-sm sm:text-base">
                <Target className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                Select all that apply:
              </p>
            </div>
            {question.options?.map((option, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                  hasAnswered && mode === 'practice' && answerMode === 'immediate' && question.correctOptions
                    ? question.correctOptions.includes(option)
                      ? 'border-emerald-500 bg-gradient-to-r from-emerald-50 to-emerald-100 shadow-lg'
                      : selectedOptions.includes(option)
                        ? 'border-red-500 bg-gradient-to-r from-red-50 to-red-100 shadow-lg'
                        : 'border-gray-200 bg-gray-50'
                    : selectedOptions.includes(option)
                      ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-indigo-50 shadow-xl ring-2 ring-purple-200'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 hover:shadow-lg hover:scale-[1.01]'
                }`}
                onClick={() => !hasAnswered && handleMultiSelectToggle(option)}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-400 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                <div className="relative p-4 sm:p-6 flex items-center">
                  <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg border-2 flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0 transition-all duration-300 ${
                    selectedOptions.includes(option)
                      ? 'border-purple-600 bg-purple-600 shadow-lg'
                      : 'border-gray-400 group-hover:border-purple-400'
                  }`}>
                    {selectedOptions.includes(option) && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      >
                        <CheckCircle className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
                      </motion.div>
                    )}
                  </div>
                  <span className="text-gray-800 font-medium text-sm sm:text-lg group-hover:text-purple-700 transition-colors flex-1 break-words">
                    {option}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        );

      case 'sequence':
        return (
          <motion.div 
            className="mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-3 sm:p-4 rounded-xl border border-amber-200 mb-6">
              <p className="text-amber-800 font-medium flex items-center text-sm sm:text-base">
                <Zap className="w-4 h-4 sm:w-5 sm:h-5 mr-2 flex-shrink-0" />
                Arrange the following items in the correct order:
              </p>
            </div>
            <div className="space-y-3">
              {sequenceOrder.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-300 ${
                    hasAnswered && mode === 'practice' && answerMode === 'immediate' && question.correctSequence
                      ? question.correctSequence[index] === item
                        ? 'border-emerald-500 bg-gradient-to-r from-emerald-50 to-emerald-100 shadow-lg'
                        : 'border-red-500 bg-gradient-to-r from-red-50 to-red-100 shadow-lg'
                      : 'border-gray-200 bg-white hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 hover:shadow-md'
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-400 opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
                  <div className="relative p-4 sm:p-6 flex items-center justify-between">
                    <div className="flex items-center flex-1 min-w-0">
                      <motion.div 
                        className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-full flex items-center justify-center text-base sm:text-lg font-bold mr-3 sm:mr-4 shadow-lg flex-shrink-0"
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      >
                        {index + 1}
                      </motion.div>
                      <span className="text-gray-800 font-medium text-sm sm:text-lg break-words">{item}</span>
                    </div>
                    {!hasAnswered && (
                      <div className="flex space-x-2 flex-shrink-0">
                        <motion.button
                          onClick={() => moveSequenceItem(index, 'up')}
                          disabled={index === 0}
                          className="p-2 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          ↑
                        </motion.button>
                        <motion.button
                          onClick={() => moveSequenceItem(index, 'down')}
                          disabled={index === sequenceOrder.length - 1}
                          className="p-2 rounded-lg text-gray-400 hover:text-purple-600 hover:bg-purple-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          ↓
                        </motion.button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        );

      case 'case-study':
        return (
          <motion.div 
            className="mt-8 space-y-6 sm:space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 sm:p-8 rounded-2xl border border-blue-200 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
                  <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h4 className="text-lg sm:text-xl font-bold text-blue-900">Case Study</h4>
              </div>
              <div className="prose prose-blue max-w-none">
                <p className="text-blue-800 leading-relaxed text-sm sm:text-lg">{question.caseStudy}</p>
              </div>
            </div>
            
            <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 shadow-md">
              <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center">
                <Star className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500 mr-2 flex-shrink-0" />
                <span className="break-words">{question.question}</span>
              </h4>
              <div className="space-y-4">
                {question.options?.map((option, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                      hasAnswered && mode === 'practice' && answerMode === 'immediate' && question.correctAnswer
                        ? option === question.correctAnswer
                          ? 'border-emerald-500 bg-gradient-to-r from-emerald-50 to-emerald-100 shadow-lg scale-[1.02]'
                          : selectedAnswer === option
                            ? 'border-red-500 bg-gradient-to-r from-red-50 to-red-100 shadow-lg'
                            : 'border-gray-200 bg-gray-50'
                        : selectedAnswer === option
                          ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-indigo-50 shadow-xl scale-[1.02] ring-4 ring-purple-200'
                          : 'border-gray-200 hover:border-purple-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 hover:shadow-lg hover:scale-[1.01]'
                    }`}
                    onClick={() => !hasAnswered && setSelectedAnswer(option)}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-400 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                    <div className="relative p-4 sm:p-6 flex items-center">
                      <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0 transition-all duration-300 ${
                        selectedAnswer === option
                          ? 'border-purple-600 bg-purple-600 shadow-lg'
                          : 'border-gray-400 group-hover:border-purple-400'
                      }`}>
                        {selectedAnswer === option && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          >
                            <CheckCircle className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
                          </motion.div>
                        )}
                      </div>
                      <span className="text-gray-800 font-medium text-sm sm:text-lg group-hover:text-purple-700 transition-colors flex-1 break-words">
                        {option}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        );

      case 'situation':
        return (
          <motion.div 
            className="mt-8 space-y-6 sm:space-y-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 sm:p-8 rounded-2xl border border-amber-200 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
                  <Target className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <h4 className="text-lg sm:text-xl font-bold text-amber-900">Situation</h4>
              </div>
              <div className="prose prose-amber max-w-none">
                <p className="text-amber-800 leading-relaxed text-sm sm:text-lg">{question.situation}</p>
              </div>
            </div>
            
            <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 shadow-md">
              <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-purple-500 mr-2 flex-shrink-0" />
                <span className="break-words">{question.question}</span>
              </h4>
              <div className="space-y-4">
                {question.options?.map((option, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className={`group relative overflow-hidden rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                      hasAnswered && mode === 'practice' && answerMode === 'immediate' && question.correctAnswer
                        ? option === question.correctAnswer
                          ? 'border-emerald-500 bg-gradient-to-r from-emerald-50 to-emerald-100 shadow-lg scale-[1.02]'
                          : selectedAnswer === option
                            ? 'border-red-500 bg-gradient-to-r from-red-50 to-red-100 shadow-lg'
                            : 'border-gray-200 bg-gray-50'
                        : selectedAnswer === option
                          ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-indigo-50 shadow-xl scale-[1.02] ring-4 ring-purple-200'
                          : 'border-gray-200 hover:border-purple-300 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 hover:shadow-lg hover:scale-[1.01]'
                    }`}
                    onClick={() => !hasAnswered && setSelectedAnswer(option)}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-indigo-400 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
                    <div className="relative p-4 sm:p-6 flex items-center">
                      <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0 transition-all duration-300 ${
                        selectedAnswer === option
                          ? 'border-purple-600 bg-purple-600 shadow-lg'
                          : 'border-gray-400 group-hover:border-purple-400'
                      }`}>
                        {selectedAnswer === option && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          >
                            <CheckCircle className="w-3 h-3 sm:w-5 sm:h-5 text-white" />
                          </motion.div>
                        )}
                      </div>
                      <span className="text-gray-800 font-medium text-sm sm:text-lg group-hover:text-purple-700 transition-colors flex-1 break-words">
                        {option}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        );
      
      case 'fill-blank':
      case 'short-answer':
        return (
          <motion.div 
            className="mt-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="relative">
              <Input
                type="text"
                placeholder="Type your answer here..."
                value={selectedAnswer}
                onChange={(e) => setSelectedAnswer(e.target.value)}
                disabled={hasAnswered}
                isFullWidth
                className={`py-4 sm:py-6 text-base sm:text-xl rounded-2xl border-2 transition-all duration-300 shadow-lg ${
                  hasAnswered && mode === 'practice' && answerMode === 'immediate'
                    ? answerEvaluation?.isCorrect
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                      : 'border-red-500 bg-red-50 text-red-800'
                    : 'focus:ring-purple-500 focus:border-purple-500 hover:border-purple-300 bg-white'
                }`}
              />
              {!hasAnswered && (
                <motion.div
                  className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
                </motion.div>
              )}
            </div>
            {hasAnswered && answerEvaluation && mode === 'practice' && answerMode === 'immediate' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className={`mt-6 p-4 sm:p-6 rounded-2xl border-2 shadow-lg ${
                  answerEvaluation.isCorrect 
                    ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200' 
                    : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200'
                }`}
              >
                <div className="flex items-center mb-4">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center mr-3 flex-shrink-0 ${
                      answerEvaluation.isCorrect ? 'bg-emerald-500' : 'bg-red-500'
                    }`}
                  >
                    {answerEvaluation.isCorrect ? (
                      <CheckCircle className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                    ) : (
                      <span className="text-white font-bold text-sm sm:text-lg">✕</span>
                    )}
                  </motion.div>
                  <div>
                    <span className={`text-lg sm:text-xl font-bold ${
                      answerEvaluation.isCorrect ? 'text-emerald-800' : 'text-red-800'
                    }`}>
                      Score: {answerEvaluation.score}%
                    </span>
                    <p className={`text-xs sm:text-sm ${
                      answerEvaluation.isCorrect ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {answerEvaluation.isCorrect ? 'Excellent work!' : 'Keep practicing!'}
                    </p>
                  </div>
                </div>
                <div 
                  className={`text-sm sm:text-lg leading-relaxed ${
                    answerEvaluation.isCorrect ? 'text-emerald-700' : 'text-red-700'
                  }`}
                  dangerouslySetInnerHTML={{ __html: formatExplanation(answerEvaluation.feedback) }}
                />
              </motion.div>
            )}
          </motion.div>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <div className="relative">
      {/* Floating decorative elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-64 h-64 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full"
        >
          <Card className="w-full transform transition-all duration-300 hover:shadow-2xl bg-gradient-to-br from-white to-purple-50 border-2 border-purple-100 overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-200/20 to-indigo-200/20 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-blue-200/20 to-cyan-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
            
            <CardBody className="space-y-6 p-4 sm:p-8 relative z-10">
              {/* Enhanced Header with better time display and quit option */}
              <div className="flex flex-wrap gap-4 sm:flex-nowrap justify-between items-start">
                <div className="flex flex-wrap gap-x-4 gap-y-2 sm:flex-nowrap items-center space-x-0 sm:space-x-6">
                  <motion.div 
                    className="text-sm sm:text-lg font-bold text-gray-600 bg-gradient-to-r from-purple-100 to-indigo-100 px-3 sm:px-4 py-2 rounded-full"
                    whileHover={{ scale: 1.05 }}
                  >
                    Question {questionNumber} of {totalQuestions}
                  </motion.div>
                  <motion.span 
                    className={`text-xs sm:text-sm font-bold capitalize px-3 sm:px-4 py-2 rounded-full border-2 ${getDifficultyColor()}`}
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  >
                    {question.difficulty}
                  </motion.span>
                  
                  {/* Time Display Section */}
                  <div className="flex items-center space-x-3">
                    {/* Question or Total Time Limit */}
                    {timeLeft !== null && (
                      <motion.div 
                        className={`flex items-center space-x-2 text-sm sm:text-lg font-bold px-3 sm:px-4 py-2 rounded-full ${
                          timeLeft <= 10 
                            ? 'bg-red-100 text-red-600 border-2 border-red-300' 
                            : 'bg-blue-100 text-blue-600 border-2 border-blue-300'
                        }`}
                        animate={timeLeft <= 10 ? { scale: [1, 1.05, 1] } : {}}
                        transition={{ duration: 1, repeat: timeLeft <= 10 ? Infinity : 0 }}
                      >
                        <Clock className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                        <span>{formatTime(timeLeft)}</span>
                        <span className="text-xs opacity-75">
                          {totalTimeRemaining !== null ? 'total' : 'left'}
                        </span>
                      </motion.div>
                    )}
                    
                    {/* Elapsed Time */}
                    <motion.div 
                      className="flex items-center space-x-2 bg-green-100 text-green-600 border-2 border-green-300 text-sm sm:text-lg font-bold px-3 sm:px-4 py-2 rounded-full"
                      whileHover={{ scale: 1.05 }}
                    >
                      <Rocket className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                      <span>{formatTime(totalElapsed)}</span>
                      <span className="text-xs opacity-75">elapsed</span>
                    </motion.div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <motion.button
                    type="button"
                    onClick={() => setShowExplanation(!showExplanation)}
                    className={`p-2 sm:p-3 rounded-full transition-all duration-300 ${
                      showExplanation 
                        ? 'bg-purple-500 text-white shadow-lg scale-110' 
                        : 'bg-gray-100 text-gray-600 hover:bg-purple-100 hover:text-purple-600 hover:scale-105'
                    }`}
                    aria-label="Show explanation"
                    disabled={!hasAnswered || (mode === 'exam' && answerMode === 'end')}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <BookOpen className="w-4 h-4 sm:w-6 sm:h-6" />
                  </motion.button>
                  
                  <motion.button
                    type="button"
                    onClick={playQuestionAudio}
                    className={`p-2 sm:p-3 rounded-full transition-all duration-300 ${
                      isSpeaking 
                        ? 'bg-purple-500 text-white shadow-lg scale-110' 
                        : 'bg-gray-100 text-gray-600 hover:bg-purple-100 hover:text-purple-600 hover:scale-105'
                    }`}
                    aria-label={isSpeaking ? 'Stop speaking' : 'Speak question'}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isSpeaking ? (
                      <VolumeX className="w-4 h-4 sm:w-6 sm:h-6" />
                    ) : (
                      <Volume2 className="w-4 h-4 sm:w-6 sm:h-6" />
                    )}
                  </motion.button>
                  
                  {/* Quit Quiz Button */}
                  {showQuitButton && (
                    <motion.button
                      type="button"
                      onClick={() => setShowQuitConfirm(true)}
                      className="p-2 sm:p-3 rounded-full bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700 transition-all duration-300"
                      aria-label="Quit quiz"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <LogOut className="w-4 h-4 sm:w-6 sm:h-6" />
                    </motion.button>
                  )}
                </div>
              </div>

              <div className="py-4 sm:py-6">
                <motion.h3 
                  className="text-lg sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 leading-relaxed break-words"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  {question.text}
                </motion.h3>
                {renderQuestionContent()}
                
                <AnimatePresence>
                  {showExplanation && question.explanation && hasAnswered && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, y: -20 }}
                      animate={{ opacity: 1, height: 'auto', y: 0 }}
                      exit={{ opacity: 0, height: 0, y: -20 }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                      className="mt-6 sm:mt-8 overflow-hidden"
                    >
                      <div className={`p-6 sm:p-8 rounded-2xl border-2 shadow-xl ${
                        answerEvaluation ? 
                          (answerEvaluation.isCorrect ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200' : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200') :
                          (isAnswerCorrect() ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200' : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200')
                      }`}>
                        <div className="flex items-center mb-4">
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0 ${
                              answerEvaluation ? 
                                (answerEvaluation.isCorrect ? 'bg-emerald-500' : 'bg-red-500') :
                                (isAnswerCorrect() ? 'bg-emerald-500' : 'bg-red-500')
                            }`}
                          >
                            {(answerEvaluation ? answerEvaluation.isCorrect : isAnswerCorrect()) ? (
                              <CheckCircle className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                            ) : (
                              <span className="text-white font-bold text-lg sm:text-xl">✕</span>
                            )}
                          </motion.div>
                          <div>
                            <h4 className={`text-lg sm:text-2xl font-bold ${
                              answerEvaluation ? 
                                (answerEvaluation.isCorrect ? 'text-emerald-800' : 'text-red-800') :
                                (isAnswerCorrect() ? 'text-emerald-800' : 'text-red-800')
                            }`}>
                              {answerEvaluation ? 
                                (answerEvaluation.isCorrect ? 'Correct!' : 'Needs Improvement') :
                                (isAnswerCorrect() ? 'Correct!' : 'Incorrect')
                              }
                            </h4>
                            <p className={`text-sm sm:text-lg ${
                              answerEvaluation ? 
                                (answerEvaluation.isCorrect ? 'text-emerald-600' : 'text-red-600') :
                                (isAnswerCorrect() ? 'text-emerald-600' : 'text-red-600')
                            }`}>
                              {answerEvaluation ? 
                                (answerEvaluation.isCorrect ? 'Excellent work!' : 'Keep practicing!') :
                                (isAnswerCorrect() ? 'Well done!' : 'Review the explanation below')
                              }
                            </p>
                          </div>
                        </div>
                        <div 
                          className="text-gray-700 text-sm sm:text-lg leading-relaxed prose prose-lg max-w-none"
                          dangerouslySetInnerHTML={{ __html: formatExplanation(question.explanation) }}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3 shadow-inner">
                <motion.div
                  className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 sm:h-3 rounded-full shadow-lg"
                  initial={{ width: 0 }}
                  animate={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                />
              </div>
            </CardBody>
            
            <CardFooter className="flex flex-col sm:flex-row justify-between bg-gradient-to-r from-gray-50 to-purple-50 border-t border-purple-100 p-4 sm:p-6 gap-3 sm:gap-0">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={questionNumber === 1}
                  className="hover:bg-purple-50 transition-all duration-300 border-2 border-purple-200 text-purple-600 font-semibold px-4 sm:px-6 py-3 w-full sm:w-auto"
                >
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Previous
                </Button>
              </motion.div>
              
              {!hasAnswered ? (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                  <Button
                    type="button"
                    onClick={handleAnswerSubmit}
                    disabled={!selectedAnswer && question.type !== 'multi-select' && question.type !== 'sequence'}
                    className="gradient-bg hover:opacity-90 transition-all duration-300 font-bold px-6 sm:px-8 py-3 text-base sm:text-lg shadow-lg w-full sm:w-auto"
                  >
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    Submit Answer
                  </Button>
                </motion.div>
              ) : (
                isLastQuestion ? (
                  <motion.div 
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }}
                    className="relative w-full sm:w-auto"
                  >
                    <Button
                      type="button"
                      onClick={handleFinish}
                      className="gradient-bg hover:opacity-90 transition-all duration-300 transform font-bold px-6 sm:px-8 py-3 text-base sm:text-lg shadow-xl w-full sm:w-auto"
                    >
                      <motion.div
                        animate={{ rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="mr-2"
                      >
                        🎉
                      </motion.div>
                      Finish Quiz
                    </Button>
                  </motion.div>
                ) : (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                    <Button
                      type="button"
                      onClick={handleNext}
                      className="gradient-bg hover:opacity-90 transition-all duration-300 transform font-bold px-6 sm:px-8 py-3 text-base sm:text-lg shadow-lg w-full sm:w-auto"
                    >
                      Next
                      <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
                    </Button>
                  </motion.div>
                )
              )}
            </CardFooter>
          </Card>
        </motion.div>
      </div>

      {/* Quit Confirmation Modal */}
      <AnimatePresence>
        {showQuitConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-md mx-4 shadow-2xl"
            >
              <div className="flex items-center mb-4">
                <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
                <h3 className="text-lg font-bold text-gray-800">Quit Quiz?</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to quit this quiz? Your progress will be lost.
              </p>
              <div className="flex space-x-3">
                <Button
                  onClick={() => setShowQuitConfirm(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Continue Quiz
                </Button>
                <Button
                  onClick={() => {
                    setShowQuitConfirm(false);
                    onQuitQuiz?.();
                  }}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Quit
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default QuizQuestion;