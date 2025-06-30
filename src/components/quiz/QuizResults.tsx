// src/components/quiz/QuizResults.tsx
import React, { useState } from 'react';
import { QuizResult, QuizPreferences } from '../../types';
import { Button } from '../ui/Button';
import { Card, CardBody, CardFooter, CardHeader } from '../ui/Card';
import { 
  CheckCircle, HelpCircle, RefreshCw, XCircle, Trophy, Target, 
  Clock, Brain, TrendingUp, Award, Star, Zap, BookOpen,
  ChevronDown, ChevronUp, BarChart3, PieChart, Activity,
  Lightbulb, ThumbsUp, AlertTriangle, Sparkles
} from 'lucide-react';
import { useQuizStore } from '../../store/useQuizStore'; // Keep for explanation logic
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line, PieChart as RechartsPieChart, Cell, Area, AreaChart, Pie,
} from 'recharts';

interface QuizResultsProps {
  result: QuizResult;
  preferences: QuizPreferences; // Now passed as a prop
  onNewQuiz?: () => void; // Optional for solo quiz flow
  onChangePreferences?: () => void; // Optional for solo quiz flow
  onClose?: () => void; // Optional for history view
}

const QuizResults: React.FC<QuizResultsProps> = ({
  result,
  preferences,
  onNewQuiz,
  onChangePreferences,
  onClose
}) => {
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false);
  const [showQuestionTypePerformance, setShowQuestionTypePerformance] = useState(false);
  const [showAnswerDistribution, setShowAnswerDistribution] = useState(false);
  const { getExplanation, explanation, isLoading, resetExplanation } = useQuizStore(); // Use store for explanation
  
  const handleGetExplanation = async (questionId: number) => {
    if (selectedQuestionId === questionId) {
      setSelectedQuestionId(null);
      resetExplanation();
    } else {
      setSelectedQuestionId(questionId);
      await getExplanation(questionId);
    }
  };

  // Calculate comprehensive statistics
  const calculateStats = () => {
    const totalQuestions = result.totalQuestions;
    const correctAnswers = result.correctAnswers;
    const incorrectAnswers = totalQuestions - correctAnswers;
    const skippedAnswers = (result.questions || []).filter(q => !q.userAnswer || q.userAnswer.trim() === '').length;
    const answeredQuestions = totalQuestions - skippedAnswers;
    
    // Calculate final score considering negative marking
    let finalScore = correctAnswers;
    if (preferences?.negativeMarking && preferences?.negativeMarks) {
      finalScore = correctAnswers + (incorrectAnswers * preferences.negativeMarks);
    }
    
    const finalPercentage = totalQuestions > 0 ? Math.max(0, (finalScore / totalQuestions) * 100) : 0;
    
    return {
      totalQuestions,
      correctAnswers,
      incorrectAnswers,
      skippedAnswers,
      answeredQuestions,
      finalScore,
      finalPercentage,
      correctPercentage: totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0,
      incorrectPercentage: totalQuestions > 0 ? (incorrectAnswers / totalQuestions) * 100 : 0,
      skippedPercentage: totalQuestions > 0 ? (skippedAnswers / totalQuestions) * 100 : 0,
      accuracy: result.accuracyRate, // Use directly from result
      completion: result.completionRate, // Use directly from result
    };
  };

  const stats = calculateStats();

  // Get performance level and message
  const getPerformanceLevel = () => {
    const percentage = stats.finalPercentage;
    
    if (percentage >= 90) return { 
      level: 'Exceptional', 
      message: 'Outstanding performance! You have mastered this topic.', 
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      icon: Trophy,
      emoji: '🏆'
    };
    if (percentage >= 80) return { 
      level: 'Excellent', 
      message: 'Great job! You have a strong understanding of the material.', 
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      icon: Award,
      emoji: '🌟'
    };
    if (percentage >= 70) return { 
      level: 'Good', 
      message: 'Well done! You have a solid grasp of the concepts.', 
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      icon: ThumbsUp,
      emoji: '👍'
    };
    if (percentage >= 60) return { 
      level: 'Fair', 
      message: 'Not bad! With some more practice, you can improve further.', 
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      icon: Target,
      emoji: '📚'
    };
    if (percentage >= 50) return { 
      level: 'Passing', 
      message: 'You passed! Focus on reviewing the topics you missed.', 
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
      icon: BookOpen,
      emoji: '📖'
    };
    return { 
      level: 'Needs Improvement', 
      message: 'Keep studying! Review the fundamentals and practice more.', 
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      icon: AlertTriangle,
      emoji: '💪'
    };
  };

  const performance = getPerformanceLevel();

  // Data for charts
  const questionTypePerformanceData = Object.keys(result.questionTypePerformance).map(type => {
    const perf = result.questionTypePerformance[type];
    return {
      name: type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      accuracy: perf.total > 0 ? (perf.correct / perf.total) * 100 : 0,
      correct: perf.correct,
      total: perf.total,
    };
  });

  const answerDistributionData = [
    { name: 'Correct', value: stats.correctAnswers, color: '#10B981' },
    { name: 'Incorrect', value: stats.incorrectAnswers, color: '#EF4444' },
    { name: 'Skipped', value: stats.skippedAnswers, color: '#6B7280' },
  ];

  // Format explanation text
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
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4 sm:space-y-8 w-full max-w-7xl mx-auto px-4"
    >
      {/* Action Buttons at Top */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col sm:flex-row sm:justify-center gap-3 sm:gap-4 p-4 sm:p-0"
      >
        {onNewQuiz && (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
            <Button
              type="button"
              onClick={onNewQuiz}
              className="gradient-bg hover:opacity-90 transition-all duration-300 font-semibold px-6 sm:px-8 py-3 shadow-lg w-full sm:w-auto"
            >
              <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Try Again
            </Button>
          </motion.div>
        )}
        
        {onClose && (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-2 border-gray-300 text-gray-600 hover:bg-gray-100 font-semibold px-6 sm:px-8 py-3 w-full sm:w-auto"
            >
              Close
            </Button>
          </motion.div>
        )}
      </motion.div>

      {/* Main Results Card */}
      <Card className="w-full overflow-hidden bg-gradient-to-br from-white to-purple-50 border-2 border-purple-100 shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 via-indigo-500 to-purple-500" />
        
        <CardHeader className="text-center py-4 sm:py-8 bg-gradient-to-r from-purple-50 to-indigo-50">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="flex flex-col items-center"
          >
            <div className={`w-16 h-16 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mb-4 ${performance.bgColor} ${performance.borderColor} border-4 shadow-lg`}>
              <span className="text-2xl sm:text-4xl">{performance.emoji}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-2">Quiz Complete!</h2>
            <p className={`text-lg sm:text-2xl font-bold ${performance.color}`}>{performance.level}</p>
          </motion.div>
        </CardHeader>
        
        <CardBody className="py-4 sm:py-8 px-4 sm:px-6">
          {/* Score Display */}
          <div className="text-center mb-6 sm:mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 20 }}
              className="relative inline-block"
            >
              <div className="text-4xl sm:text-8xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                {stats.finalPercentage.toFixed(1)}%
              </div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center"
              >
                <Sparkles className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
              </motion.div>
            </motion.div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-200"
              >
                <div className="flex items-center justify-center mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-emerald-600">{stats.correctAnswers}</div>
                  <div className="text-xs sm:text-sm text-gray-600">Correct ({stats.correctPercentage.toFixed(1)}%)</div>
                  <div className="text-sm sm:text-lg font-semibold text-emerald-600">
                    {stats.correctAnswers} {stats.correctAnswers === 1 ? 'mark' : 'marks'}
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-200"
              >
                <div className="flex items-center justify-center mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-red-600">{stats.incorrectAnswers}</div>
                  <div className="text-xs sm:text-sm text-gray-600">Incorrect ({stats.incorrectPercentage.toFixed(1)}%)</div>
                  <div className="text-sm sm:text-lg font-semibold text-red-600">
                    {preferences?.negativeMarking ? 
                      `${(stats.incorrectAnswers * (preferences.negativeMarks || 0)).toFixed(1)} marks` :
                      '0 marks'
                    }
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-200"
              >
                <div className="flex items-center justify-center mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-gray-600">{stats.skippedAnswers}</div>
                  <div className="text-xs sm:text-sm text-gray-600">Skipped ({stats.skippedPercentage.toFixed(1)}%)</div>
                  <div className="text-sm sm:text-lg font-semibold text-gray-600">0 marks</div>
                </div>
              </motion.div>
            </div>

            {/* Final Score Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className={`mt-6 sm:mt-8 p-4 sm:p-6 rounded-2xl border-2 ${performance.bgColor} ${performance.borderColor} shadow-lg`}
            >
              <div className="text-center">
                <h3 className={`text-lg sm:text-2xl font-bold ${performance.color} mb-2`}>Final Score</h3>
                <div className="text-2xl sm:text-4xl font-bold text-gray-800 mb-2">
                  {stats.finalScore.toFixed(1)} / {stats.totalQuestions}
                </div>
                <p className={`text-sm sm:text-lg ${performance.color} font-medium`}>
                  {performance.message}
                </p>
                {preferences?.negativeMarking && (
                  <p className="text-xs sm:text-sm text-gray-600 mt-2">
                    * Negative marking applied: {preferences.negativeMarks} per wrong answer
                  </p>
                )}
              </div>
            </motion.div>
          </div>

          {/* Performance Analysis */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mb-6 sm:mb-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center">
                <BarChart3 className="w-6 h-6 sm:w-7 sm:h-7 mr-2 sm:mr-3 text-purple-600" />
                Performance Analysis
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetailedAnalysis(!showDetailedAnalysis)}
                className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 text-sm"
              >
                {showDetailedAnalysis ? (
                  <>
                    <ChevronUp className="w-4 h-4 mr-2" />
                    Hide Details
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-2" />
                    Show Details
                  </>
                )}
              </Button>
            </div>

            <AnimatePresence>
              {showDetailedAnalysis && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 sm:mt-6 overflow-hidden"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-200">
                      <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <Activity className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
                        Accuracy Rate
                      </h4>
                      <div className="relative">
                        <div className="w-full bg-gray-200 rounded-full h-3 sm:h-4 mb-2">
                          <motion.div
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 sm:h-4 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${stats.accuracy}%` }}
                            transition={{ duration: 1, delay: 0.9 }}
                          />
                        </div>
                        <div className="text-xl sm:text-2xl font-bold text-blue-600">{stats.accuracy.toFixed(1)}%</div>
                        <p className="text-xs sm:text-sm text-gray-600">
                          {stats.correctAnswers} correct out of {stats.answeredQuestions} attempted
                        </p>
                      </div>
                    </div>

                    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-200">
                      <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <PieChart className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-600" />
                        Completion Rate
                      </h4>
                      <div className="relative">
                        <div className="w-full bg-gray-200 rounded-full h-3 sm:h-4 mb-2">
                          <motion.div
                            className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 sm:h-4 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${stats.completion}%` }}
                            transition={{ duration: 1, delay: 0.9 }}
                          />
                        </div>
                        <div className="text-xl sm:text-2xl font-bold text-purple-600">{stats.completion.toFixed(1)}%</div>
                        <p className="text-xs sm:text-sm text-gray-600">
                          {stats.answeredQuestions} attempted out of {stats.totalQuestions} total
                        </p>
                      </div>
                    </div>

                    {/* Question Type Performance Chart */}
                    <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-4 gap-2">
                        <h4 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center">
                          <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-600" />
                          Performance by Question Type
                        </h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowQuestionTypePerformance(!showQuestionTypePerformance)}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50 text-sm"
                        >
                          {showQuestionTypePerformance ? (
                            <>
                              <ChevronUp className="w-4 h-4 mr-2" />
                              Hide Chart
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4 mr-2" />
                              Show Chart
                            </>
                          )}
                        </Button>
                      </div>
                      <AnimatePresence>
                        {showQuestionTypePerformance && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="mt-4 overflow-hidden"
                          >
                            <ResponsiveContainer width="100%" height={250}>
                              <BarChart data={questionTypePerformanceData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis domain={[0, 100]} />
                                <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                                <Legend />
                                <Bar dataKey="accuracy" fill="#8884d8" name="Accuracy (%)" />
                              </BarChart>
                            </ResponsiveContainer>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Answer Distribution Chart */}
                    <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-4 gap-2">
                        <h4 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center">
                          <PieChart className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-orange-600" />
                          Answer Distribution
                        </h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowAnswerDistribution(!showAnswerDistribution)}
                          className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 text-sm"
                        >
                          {showAnswerDistribution ? (
                            <>
                              <ChevronUp className="w-4 h-4 mr-2" />
                              Hide Chart
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4 mr-2" />
                              Show Chart
                            </>
                          )}
                        </Button>
                      </div>
                      <AnimatePresence>
                        {showAnswerDistribution && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="mt-4 overflow-hidden"
                          >
                            <ResponsiveContainer width="100%" height={250}>
                              <RechartsPieChart>
                                <Pie
                                  data={answerDistributionData}
                                  cx="50%"
                                  cy="50%"
                                  outerRadius={80}
                                  dataKey="value"
                                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                  {answerDistributionData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                              </RechartsPieChart>
                            </ResponsiveContainer>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Recommendations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="mb-6 sm:mb-8"
          >
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center">
              <Star className="w-6 h-6 sm:w-7 sm:h-7 mr-2 sm:mr-3 text-yellow-500" />
              Personalized Recommendations
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              {result.strengths && result.strengths.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.1 }}
                  className="p-4 sm:p-6 rounded-2xl border-2 shadow-lg bg-green-50 border-green-200"
                >
                  <h4 className="font-semibold text-green-800 mb-2 text-base sm:text-lg flex items-center">
                    <ThumbsUp className="w-5 h-5 mr-2" /> Strengths
                  </h4>
                  <ul className="list-disc list-inside text-gray-700 text-sm sm:text-base space-y-1">
                    {result.strengths.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </motion.div>
              )}
              {result.weaknesses && result.weaknesses.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 }}
                  className="p-4 sm:p-6 rounded-2xl border-2 shadow-lg bg-red-50 border-red-200"
                >
                  <h4 className="font-semibold text-red-800 mb-2 text-base sm:text-lg flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2" /> Weaknesses
                  </h4>
                  <ul className="list-disc list-inside text-gray-700 text-sm sm:text-base space-y-1">
                    {result.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                  </ul>
                </motion.div>
              )}
              {result.recommendations && result.recommendations.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.3 }}
                  className="lg:col-span-2 p-4 sm:p-6 rounded-2xl border-2 shadow-lg bg-blue-50 border-blue-200"
                >
                  <h4 className="font-semibold text-blue-800 mb-2 text-base sm:text-lg flex items-center">
                    <Lightbulb className="w-5 h-5 mr-2" /> Recommendations
                  </h4>
                  <ul className="list-disc list-inside text-gray-700 text-sm sm:text-base space-y-1">
                    {result.recommendations.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </motion.div>
              )}
            </div>
          </motion.div>
        </CardBody>
        
        <CardFooter className="flex flex-col sm:flex-row sm:justify-center gap-3 sm:gap-4 bg-gradient-to-r from-gray-50 to-purple-50 border-t border-purple-100 p-4 sm:p-6">
          {onNewQuiz && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
              <Button
                type="button"
                onClick={onNewQuiz}
                className="gradient-bg hover:opacity-90 transition-all duration-300 font-semibold px-6 sm:px-8 py-3 shadow-lg w-full sm:w-auto"
              >
                <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Try Again
              </Button>
            </motion.div>
          )}
          
          {onChangePreferences && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                onClick={onChangePreferences}
                className="border-2 border-purple-200 text-purple-600 hover:bg-purple-50 font-semibold px-6 sm:px-8 py-3 w-full sm:w-auto"
              >
                <Target className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Change Settings
              </Button>
            </motion.div>
          )}

          {onClose && (
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-2 border-gray-300 text-gray-600 hover:bg-gray-100 font-semibold px-6 sm:px-8 py-3 w-full sm:w-auto"
              >
                Close
              </Button>
            </motion.div>
          )}
        </CardFooter>
      </Card>
      
      {/* Question Review Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="space-y-4 sm:space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center">
            <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3 text-purple-600" />
            Question Review
          </h3>
          <div className="text-xs sm:text-sm text-gray-600 bg-gray-100 px-3 sm:px-4 py-2 rounded-full">
            {result.questions.length} questions
          </div>
        </div>
        
        <div className="grid gap-4 sm:gap-6">
          {result.questions.map((question, index) => {
            // Use the pre-calculated isCorrect from the question object
            const isCorrect = question.isCorrect || false;
            const isSkipped = !question.userAnswer || question.userAnswer.trim() === '';
            
            return (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3 + index * 0.1 }}
              >
                <Card className={`w-full transition-all duration-300 hover:shadow-xl border-2 ${
                  isCorrect ? 'border-emerald-200 bg-emerald-50' :
                  isSkipped ? 'border-gray-200 bg-gray-50' :
                  'border-red-200 bg-red-50'
                }`}>
                  <CardBody className="space-y-4 p-4 sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center mb-4">
                          <motion.div
                            whileHover={{ scale: 1.1 }}
                            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0 ${
                              isCorrect ? 'bg-emerald-500' :
                              isSkipped ? 'bg-gray-400' :
                              'bg-red-500'
                            }`}
                          >
                            {isCorrect ? (
                              <CheckCircle className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                            ) : isSkipped ? (
                              <Clock className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                            ) : (
                              <XCircle className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                            )}
                          </motion.div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                              <span className="text-base sm:text-lg font-bold text-gray-700">
                                Question {index + 1}
                              </span>
                              <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${
                                isCorrect ? 'bg-emerald-100 text-emerald-700' :
                                isSkipped ? 'bg-gray-100 text-gray-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {isCorrect ? 'Correct (+1 mark)' :
                                 isSkipped ? 'Skipped (0 marks)' :
                                 preferences?.negativeMarking ? 
                                   `Incorrect (${preferences.negativeMarks} marks)` :
                                   'Incorrect (0 marks)'
                                }
                              </span>
                            </div>
                            <h4 className="text-sm sm:text-lg font-medium text-gray-800 leading-relaxed break-words">
                              {question.text}
                            </h4>
                          </div>
                        </div>
                        
                        <div className="ml-0 sm:ml-16 space-y-4">
                          {question.userAnswer && (
                            <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-200 shadow-sm">
                              <div className="flex items-center mb-2">
                                <span className="text-xs sm:text-sm font-medium text-gray-600">Your answer:</span>
                              </div>
                              <span className={`text-sm sm:text-lg font-medium break-words ${
                                isCorrect ? 'text-emerald-600' : 'text-red-600'
                              }`}>
                                {question.userAnswer}
                              </span>
                            </div>
                          )}
                          
                          {isSkipped && (
                            <div className="bg-gray-100 p-3 sm:p-4 rounded-xl border border-gray-200">
                              <span className="text-gray-600 italic text-sm sm:text-base">Question was skipped</span>
                            </div>
                          )}
                          
                          <div className="bg-white p-3 sm:p-4 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center mb-2">
                              <span className="text-xs sm:text-sm font-medium text-gray-600">Correct answer:</span>
                            </div>
                            <span className="text-sm sm:text-lg font-medium text-emerald-600 break-words">
                              {question.correctAnswer || 
                               (question.correctOptions ? question.correctOptions.join(', ') : '') ||
                               (question.correctSequence ? question.correctSequence.join(' → ') : '') ||
                               'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-shrink-0">
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => handleGetExplanation(question.id)}
                          className="hover:bg-purple-100 text-purple-600 text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2"
                        >
                          <HelpCircle className="w-4 h-4 mr-1 sm:mr-2" />
                          {selectedQuestionId === question.id ? 'Hide' : 'Explain'}
                        </Button>
                      </motion.div>
                    </div>
                    
                    <AnimatePresence>
                      {selectedQuestionId === question.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="ml-0 sm:ml-16 mt-4 sm:mt-6 overflow-hidden"
                        >
                          {isLoading ? (
                            <div className="flex items-center justify-center py-6 sm:py-8">
                              <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-purple-600"></div>
                              <span className="ml-3 text-gray-600 text-sm sm:text-base">Loading explanation...</span>
                            </div>
                          ) : (
                            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 sm:p-6 rounded-2xl border border-purple-200 shadow-lg">
                              <h5 className="font-bold text-purple-800 mb-4 flex items-center text-base sm:text-lg">
                                <Lightbulb className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                                Detailed Explanation
                              </h5>
                              <div 
                                className="prose prose-purple max-w-none text-gray-700 leading-relaxed text-sm sm:text-base"
                                dangerouslySetInnerHTML={{ __html: formatExplanation(explanation || question.explanation || 'No explanation available.') }}
                              />
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardBody>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default QuizResults;