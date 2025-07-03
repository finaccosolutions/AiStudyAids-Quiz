import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getCompetitionResultById } from '../services/supabase';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import {
  Trophy, Crown, Medal, Star, Clock, Target,
  TrendingUp, Award, Zap, Users, Home, RefreshCw,
  ChevronDown, ChevronUp, BarChart3, PieChart, Activity,
  Lightbulb, ThumbsUp, AlertTriangle, Sparkles,
  LogOut, ArrowLeft, Eye, EyeOff, Loader, Share2, Copy, User,CheckCircle,XCircle, Calendar
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line, PieChart as RechartsPieChart, Cell, Area, AreaChart, Pie,
} from 'recharts';
import { Button } from '../components/ui/Button';

const SharedCompetitionResultPage: React.FC = () => {
  const { resultId } = useParams<{ resultId: string }>();
  const [result, setResult] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchResult = async () => {
      if (!resultId) {
        setError('No result ID provided.');
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const fetchedResult = await getCompetitionResultById(resultId);
        if (fetchedResult) {
          setResult(fetchedResult);
        } else {
          setError('Competition result not found.');
        }
      } catch (err: any) {
        console.error('Error fetching shared competition result:', err);
        setError('Failed to load competition result: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResult();
  }, [resultId]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />;
    return <span className="text-base sm:text-lg font-bold text-gray-600">#{rank}</span>;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-400 to-yellow-500';
    if (rank === 2) return 'from-gray-300 to-gray-400';
    if (rank === 3) return 'from-orange-400 to-orange-500';
    if (rank <= 5) return 'from-purple-400 to-purple-500';
    return 'from-blue-400 to-blue-500';
  };

  const getPerformanceMessage = (percentage: number) => {
    if (percentage >= 90) return {
      level: 'Exceptional',
      message: 'Outstanding performance!',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      emoji: '🏆'
    };
    if (percentage >= 80) return {
      level: 'Excellent',
      message: 'Great job!',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      emoji: '🌟'
    };
    if (percentage >= 70) return {
      level: 'Good',
      message: 'Well done!',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      emoji: '👍'
    };
    return {
      level: 'Needs Improvement',
      message: 'Keep practicing!',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      emoji: '💪'
    };
  };

  const handleShareResult = () => {
    const shareUrl = `https://aistudyaids.com/shared-competition-result/${resultId}`;
    setShareLink(shareUrl);
    setShowShareModal(true);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Competition Result...</h2>
          <p className="text-gray-600">Please wait while we fetch the shared competition details.</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Result</h2>
          <p className="text-gray-600">{error}</p>
          <Button onClick={() => window.location.href = '/'} className="mt-6">
            <Home className="w-5 h-5 mr-2" /> Go to Homepage
          </Button>
        </motion.div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <XCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Result Not Available</h2>
          <p className="text-gray-600">The competition result could not be found or is no longer available.</p>
          <Button onClick={() => window.location.href = '/'} className="mt-6">
            <Home className="w-5 h-5 mr-2" /> Go to Homepage
          </Button>
        </motion.div>
      </div>
    );
  }

  const performance = getPerformanceMessage(result.percentageScore);

  // Data for charts
  const questionTypePerformanceData = Object.keys(result.questionTypePerformance || {}).map(type => {
    const perf = result.questionTypePerformance[type];
    return {
      name: type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      accuracy: perf.total > 0 ? (perf.correct / perf.total) * 100 : 0,
      correct: perf.correct,
      total: perf.total,
    };
  });

  const answerDistributionData = [
    { name: 'Correct', value: result.correctAnswers, color: '#10B981' },
    { name: 'Incorrect', value: result.incorrectAnswers, color: '#EF4444' },
    { name: 'Skipped', value: result.skippedAnswers, color: '#6B7280' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4 sm:space-y-8 w-full max-w-full mx-auto px-0 sm:px-6 lg:px-8"
    >
      {/* Action Buttons at Top */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col sm:flex-row sm:justify-end gap-3 sm:gap-4 p-4 sm:p-0"
      >
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            onClick={handleShareResult}
            className="border-2 border-blue-200 text-blue-600 hover:bg-blue-50 font-semibold px-6 sm:px-8 py-3 w-full sm:w-auto"
          >
            <Share2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Share Result
          </Button>
        </motion.div>
      </motion.div>

      {/* Main Results Card */}
      <Card className="w-full mx-auto overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-100 shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500" />

        <CardHeader className="text-center py-4 sm:py-8 bg-gradient-to-r from-blue-50 to-cyan-50">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="flex flex-col items-center"
          >
            <div className={`w-16 h-16 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mb-4 ${performance.bgColor} ${performance.borderColor} border-4 shadow-lg`}>
              <span className="text-2xl sm:text-4xl">{performance.emoji}</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold text-gray-800 mb-2">Competition Complete!</h2>
            <p className={`text-lg sm:text-2xl font-bold ${performance.color}`}>{performance.level}</p>
          </motion.div>
        </CardHeader>

        <CardBody className="py-4 sm:py-8 px-4 sm:px-6">
          {/* User and Competition Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {/* Panel 1: User & Competition Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              whileHover={{ scale: 1.02, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
              className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 sm:p-6 rounded-2xl shadow-lg border border-blue-200 flex flex-col items-center text-center"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <User className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              </div>
              <h4 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">{result.profile?.full_name || 'Anonymous User'}</h4>
              <p className="text-sm sm:text-base text-gray-600">
                Competition: {result.competitionTitle}
              </p>
              <p className="text-sm sm:text-base text-gray-600 capitalize">
                Code: {result.competitionCode} | Type: {result.competitionType}
              </p>
            </motion.div>

            {/* Panel 2: Total Score */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.02, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
              className="bg-gradient-to-br from-emerald-50 to-green-50 p-4 sm:p-6 rounded-2xl shadow-lg border border-emerald-200 flex flex-col items-center text-center"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-3">
                <Zap className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600" />
              </div>
              <h4 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">Total Score</h4>
              <p className="text-2xl sm:text-3xl font-bold text-emerald-600">{result.score.toFixed(1)} / {result.totalQuestions}</p>
            </motion.div>

            {/* Panel 3: Date & Time Taken */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.02, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' }}
              className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 sm:p-6 rounded-2xl shadow-lg border border-purple-200 flex flex-col items-center text-center"
            >
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center mb-3">
                <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
              </div>
              <h4 className="text-lg sm:text-xl font-bold text-gray-800 mb-1">Date & Time</h4>
              <p className="text-sm sm:text-base text-gray-600">{result.completedAt?.toLocaleDateString('en-GB')}</p>
              <p className="text-sm sm:text-base text-gray-600">Time Taken: {formatTime(result.timeTaken)}</p>
            </motion.div>
          </div>

          {/* Score Display */}
          <div className="text-center mb-6 sm:mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 200, damping: 20 }}
              className="relative inline-block"
            >
              <div className="text-4xl sm:text-8xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                {result.percentageScore.toFixed(1)}%
              </div>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-6 sm:mt-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-200"
              >
                <div className="flex items-center justify-center mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600" />
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-emerald-600">{result.correctAnswers}</div>
                  <div className="text-xs sm:text-sm text-gray-600">Correct ({result.accuracyRate.toFixed(1)}%)</div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-200"
              >
                <div className="flex items-center justify-center mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <XCircle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-red-600">{result.incorrectAnswers}</div>
                  <div className="text-xs sm:text-sm text-gray-600">Incorrect</div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-200"
              >
                <div className="flex items-center justify-center mb-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-gray-600">{result.skippedAnswers}</div>
                  <div className="text-xs sm:text-sm text-gray-600">Skipped</div>
                </div>
              </motion.div>
            </div>

            {/* Final Score Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className={`mt-6 sm:mt-8 p-4 sm:p-6 rounded-2xl border-2 ${performance.bgColor} ${performance.borderColor} shadow-lg`}
            >
              <div className="text-center">
                <h3 className={`text-lg sm:text-2xl font-bold ${performance.color} mb-2`}>Final Rank</h3>
                <div className="text-2xl sm:text-4xl font-bold text-gray-800 mb-2">
                  {result.finalRank} / {result.totalParticipants}
                </div>
                <p className={`text-sm sm:text-lg ${performance.color} font-medium`}>
                  {performance.message}
                </p>
              </div>
            </motion.div>
          </div>

          {/* Performance Analysis */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="mb-6 sm:mb-8 px-0 sm:px-0"
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
                            animate={{ width: `${result.accuracyRate}%` }}
                            transition={{ duration: 1, delay: 0.9 }}
                          />
                        </div>
                        <div className="text-xl sm:text-2xl font-bold text-blue-600">{result.accuracyRate.toFixed(1)}%</div>
                        <p className="text-xs sm:text-sm text-gray-600">
                          {result.correctAnswers} correct out of {result.questionsAttempted} attempted
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
                            animate={{ width: `${result.completionRate}%` }}
                            transition={{ duration: 1, delay: 0.9 }}
                          />
                        </div>
                        <div className="text-xl sm:text-2xl font-bold text-purple-600">{result.completionRate.toFixed(1)}%</div>
                        <p className="text-xs sm:text-sm text-gray-600">
                          {result.questionsAttempted} attempted out of {result.totalQuestions} total
                        </p>
                      </div>
                    </div>

                    {/* Question Type Performance Chart */}
                    <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-200">
                      <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-600" />
                        Performance by Question Type
                      </h4>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={questionTypePerformanceData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                          <Legend />
                          <Bar dataKey="accuracy" fill="#8884d8" name="Accuracy (%)" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Answer Distribution Chart */}
                    <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-200">
                      <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <PieChart className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-orange-600" />
                        Answer Distribution
                      </h4>
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
            className="mb-6 sm:mb-8 px-0 sm:px-0"
          >
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center">
              <Star className="w-6 h-6 sm:w-7 sm:h-7 mr-2 sm:mr-3 text-yellow-500" />
              Personalized Recommendations
            </h3>
            {result.comparativePerformance && Object.keys(result.comparativePerformance).length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.0 }}
                className="p-4 sm:p-6 rounded-2xl border-2 shadow-lg bg-blue-50 border-blue-200 mb-4"
              >
                <h4 className="font-semibold text-blue-800 mb-2 text-base sm:text-lg flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" /> Comparative Performance
                </h4>
                <ul className="list-disc list-inside text-gray-700 text-sm sm:text-base space-y-1">
                  {result.comparativePerformance.overall && <li>{result.comparativePerformance.overall}</li>}
                  {result.comparativePerformance.topicSpecific && <li>{result.comparativePerformance.topicSpecific}</li>}
                  {result.comparativePerformance.difficultySpecific && <li>{result.comparativePerformance.difficultySpecific}</li>}
                </ul>
              </motion.div>
            )}
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
                    {result.strengths.map((s: string, i: number) => <li key={i}>{s}</li>)}
                  </ul>
                </motion.div>
              )}
              {result.areasForImprovement && result.areasForImprovement.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 }}
                  className="p-4 sm:p-6 rounded-2xl border-2 shadow-lg bg-red-50 border-red-200"
                >
                  <h4 className="font-semibold text-red-800 mb-2 text-base sm:text-lg flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2" /> Areas for Improvement
                  </h4>
                  <ul className="list-disc list-inside text-gray-700 text-sm sm:text-base space-y-1">
                    {result.areasForImprovement.map((w: string, i: number) => <li key={i}>{w}</li>)}
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
                    {result.recommendations.map((r: string, i: number) => <li key={i}>{r}</li>)}
                  </ul>
                </motion.div>
              )}
            </div>
          </motion.div>
        </CardBody>
      </Card>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
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
                <Share2 className="w-12 h-12 sm:w-16 sm:h-16 text-blue-500 mx-auto mb-4" />
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Share Your Result!</h3>
                <p className="text-gray-600 mb-6 text-base sm:text-lg leading-relaxed">
                  Copy the link below to share your competition performance with others.
                </p>
                <div className="flex items-center space-x-2 bg-gray-100 p-3 rounded-lg mb-6">
                  <input
                    type="text"
                    readOnly
                    value={shareLink}
                    className="flex-1 bg-transparent outline-none text-gray-800 text-sm sm:text-base font-mono"
                  />
                  <Button
                    onClick={copyToClipboard}
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 hover:text-blue-600"
                  >
                    {copied ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </Button>
                </div>
                <Button
                  onClick={() => setShowShareModal(false)}
                  className="w-full bg-blue-500 hover:bg-blue-600"
                >
                  Done
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default SharedCompetitionResultPage;