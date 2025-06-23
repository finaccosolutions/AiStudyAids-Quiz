import React, { useState, useEffect } from 'react';
import { useCompetitionStore } from '../../store/useCompetitionStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../ui/Button';
import { Card, CardBody, CardHeader } from '../ui/Card';
import { 
  Trophy, Crown, Medal, Star, Clock, Target, 
  TrendingUp, Award, Zap, Users, Home, RefreshCw,
  ChevronDown, ChevronUp, BarChart3, Activity,
  Brain, Timer, CheckCircle, XCircle, Sparkles,
  LogOut, ArrowLeft, Eye, EyeOff
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Competition } from '../../types/competition';

interface CompetitionResultsProps {
  competition: Competition;
  onNewCompetition: () => void;
  onBackToHome: () => void;
  onLeave?: () => void;
}

const CompetitionResults: React.FC<CompetitionResultsProps> = ({
  competition,
  onNewCompetition,
  onBackToHome,
  onLeave
}) => {
  const { user } = useAuthStore();
  const { 
    participants, 
    userStats, 
    loadUserStats, 
    leaveCompetition,
    loadParticipants,
    subscribeToCompetition,
    cleanupSubscriptions
  } = useCompetitionStore();
  
  const [copied, setCopied] = useState(false);
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false);
  const [confettiVisible, setConfettiVisible] = useState(true);
  const [showLiveUpdates, setShowLiveUpdates] = useState(true);

  // Get all participants (completed and still playing)
  const allParticipants = participants.filter(p => 
    p.status === 'completed' || p.status === 'joined'
  );

  // Sort participants by completion status and then by score/time
  const sortedParticipants = [...allParticipants].sort((a, b) => {
    // Completed participants first
    if (a.status === 'completed' && b.status !== 'completed') return -1;
    if (b.status === 'completed' && a.status !== 'completed') return 1;
    
    // Among completed participants, sort by score then time
    if (a.status === 'completed' && b.status === 'completed') {
      if (b.score !== a.score) return b.score - a.score;
      return a.time_taken - b.time_taken;
    }
    
    // Among active participants, sort by current progress
    const aProgress = (a.questions_answered || 0) / (competition.questions?.length || 1);
    const bProgress = (b.questions_answered || 0) / (competition.questions?.length || 1);
    if (bProgress !== aProgress) return bProgress - aProgress;
    
    return (a.score || 0) - (b.score || 0);
  });

  const userParticipant = sortedParticipants.find(p => p.user_id === user?.id);
  const userRank = sortedParticipants.findIndex(p => p.user_id === user?.id) + 1;
  const completedCount = sortedParticipants.filter(p => p.status === 'completed').length;
  const totalParticipants = sortedParticipants.length;
  const isCompetitionFullyComplete = completedCount === totalParticipants;

  useEffect(() => {
    if (user) {
      loadUserStats(user.id);
    }
    
    // Hide confetti after 5 seconds
    const timer = setTimeout(() => setConfettiVisible(false), 5000);
    return () => clearTimeout(timer);
  }, [user, loadUserStats]);

  // Set up real-time subscriptions for live updates
  useEffect(() => {
    if (!competition.id) return;

    console.log('Setting up real-time subscriptions for results page');
    
    // Subscribe to competition and participant updates
    const unsubscribe = subscribeToCompetition(competition.id);
    
    // Refresh participants data periodically
    const refreshInterval = setInterval(() => {
      loadParticipants(competition.id);
    }, 3000);

    return () => {
      console.log('Cleaning up results page subscriptions');
      unsubscribe();
      clearInterval(refreshInterval);
    };
  }, [competition.id, subscribeToCompetition, loadParticipants]);

  // Cleanup subscriptions when component unmounts
  useEffect(() => {
    return () => {
      cleanupSubscriptions();
    };
  }, [cleanupSubscriptions]);

  const handleLeaveCompetition = async () => {
    try {
      await leaveCompetition(competition.id);
      if (onLeave) {
        onLeave();
      } else {
        onBackToHome();
      }
    } catch (error) {
      console.error('Error leaving competition:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getPerformanceMessage = () => {
    if (!userParticipant || userParticipant.status !== 'completed') {
      return { 
        message: 'Quiz completed! Waiting for final results...', 
        color: 'text-blue-600',
        emoji: '⏳'
      };
    }
    
    const percentage = userParticipant.score / (competition.questions?.length || 1) * 100;
    
    if (userRank === 1) return { 
      message: '🎉 Congratulations! You won the competition!', 
      color: 'text-yellow-600',
      emoji: '🏆'
    };
    if (userRank <= 3) return { 
      message: '🏆 Excellent! You finished in the top 3!', 
      color: 'text-blue-600',
      emoji: '🥉'
    };
    if (percentage >= 70) return { 
      message: '👏 Great performance! Well done!', 
      color: 'text-green-600',
      emoji: '👏'
    };
    if (percentage >= 50) return { 
      message: '👍 Good effort! Keep practicing!', 
      color: 'text-orange-600',
      emoji: '👍'
    };
    return { 
      message: '💪 Keep learning and improving!', 
      color: 'text-purple-600',
      emoji: '💪'
    };
  };

  const performance = getPerformanceMessage();

  const getCompetitionInsights = () => {
    if (completedCount === 0) return null;

    const completedParticipants = sortedParticipants.filter(p => p.status === 'completed');
    const totalQuestions = competition.questions?.length || 0;
    const averageScore = completedParticipants.reduce((sum, p) => sum + p.score, 0) / completedParticipants.length;
    const averageTime = completedParticipants.reduce((sum, p) => sum + p.time_taken, 0) / completedParticipants.length;
    const highestScore = Math.max(...completedParticipants.map(p => p.score));
    const fastestTime = Math.min(...completedParticipants.map(p => p.time_taken));

    return {
      averageScore: averageScore.toFixed(1),
      averageAccuracy: totalQuestions > 0 ? ((averageScore / totalQuestions) * 100).toFixed(1) : '0',
      averageTime: formatTime(Math.round(averageTime)),
      highestScore: highestScore.toFixed(1),
      fastestTime: formatTime(fastestTime),
      completedParticipants: completedCount,
      totalParticipants
    };
  };

  const insights = getCompetitionInsights();

  const getRankIcon = (rank: number, isCompleted: boolean) => {
    if (!isCompleted) return <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />;
    
    if (rank === 1) return <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />;
    return <span className="text-base sm:text-lg font-bold text-gray-600">#{rank}</span>;
  };

  const getRankColor = (rank: number, isCompleted: boolean) => {
    if (!isCompleted) return 'from-orange-400 to-yellow-400';
    if (rank === 1) return 'from-yellow-400 to-yellow-500';
    if (rank === 2) return 'from-gray-300 to-gray-400';
    if (rank === 3) return 'from-orange-400 to-orange-500';
    if (rank <= 5) return 'from-purple-400 to-purple-500';
    return 'from-blue-400 to-blue-500';
  };

  const getProgressPercentage = (participant: any) => {
    const totalQuestions = competition.questions?.length || 1;
    return ((participant.questions_answered || 0) / totalQuestions) * 100;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 py-4 sm:py-8 relative overflow-hidden">
      {/* Confetti Animation */}
      <AnimatePresence>
        {confettiVisible && userParticipant?.status === 'completed' && (
          <div className="fixed inset-0 pointer-events-none z-10">
            {Array.from({ length: 50 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"
                initial={{
                  x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 800),
                  y: -10,
                  rotate: 0,
                }}
                animate={{
                  y: (typeof window !== 'undefined' ? window.innerHeight : 600) + 10,
                  rotate: 360,
                }}
                transition={{
                  duration: Math.random() * 3 + 2,
                  ease: "easeOut",
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 relative z-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 sm:mb-8"
        >
          <div className="flex flex-col sm:flex-row items-center justify-center mb-4 sm:mb-6">
            <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center mb-4 sm:mb-0 sm:mr-6 shadow-2xl">
              <Trophy className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-3xl sm:text-5xl font-bold text-gray-800">
                {isCompetitionFullyComplete ? 'Competition Complete!' : 'Live Results'}
              </h1>
              <p className="text-lg sm:text-2xl text-gray-600">{competition.title}</p>
              {!isCompetitionFullyComplete && (
                <p className="text-base sm:text-lg text-orange-600 mt-2">
                  {completedCount}/{totalParticipants} participants finished
                </p>
              )}
            </div>
          </div>
          
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className={`text-2xl sm:text-3xl font-bold ${performance.color} mb-4`}
          >
            {performance.emoji} {performance.message}
          </motion.div>
        </motion.div>

        {/* Live Updates Toggle */}
        {!isCompetitionFullyComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-4 sm:mb-6 flex justify-center"
          >
            <button
              onClick={() => setShowLiveUpdates(!showLiveUpdates)}
              className="flex items-center space-x-2 px-4 py-2 bg-white rounded-full shadow-lg border border-blue-200 hover:bg-blue-50 transition-all duration-300"
            >
              {showLiveUpdates ? <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" /> : <EyeOff className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />}
              <span className={`text-sm sm:text-base ${showLiveUpdates ? 'text-blue-600' : 'text-gray-500'}`}>
                Live Updates {showLiveUpdates ? 'ON' : 'OFF'}
              </span>
              <div className={`w-2 h-2 rounded-full ${showLiveUpdates ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
            </button>
          </motion.div>
        )}

        {/* User Performance Summary */}
        {userParticipant && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-6 sm:mb-8"
          >
            <Card className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-0 shadow-2xl">
              <CardBody className="p-4 sm:p-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
                  <div>
                    <div className="flex items-center justify-center mb-2 sm:mb-3">
                      {getRankIcon(userRank, userParticipant.status === 'completed')}
                    </div>
                    <div className="text-2xl sm:text-4xl font-bold">{userRank}</div>
                    <div className="text-purple-100 text-sm sm:text-base">
                      {userParticipant.status === 'completed' ? 'Final Rank' : 'Current Rank'}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-center mb-2 sm:mb-3">
                      <Zap className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-300" />
                    </div>
                    <div className="text-2xl sm:text-4xl font-bold">{userParticipant.score.toFixed(1)}</div>
                    <div className="text-purple-100 text-sm sm:text-base">Score</div>
                  </div>
                  <div>
                    <div className="flex items-center justify-center mb-2 sm:mb-3">
                      <Target className="w-8 h-8 sm:w-10 sm:h-10 text-green-300" />
                    </div>
                    <div className="text-2xl sm:text-4xl font-bold">
                      {userParticipant.correct_answers}/{competition.questions?.length || 0}
                    </div>
                    <div className="text-purple-100 text-sm sm:text-base">Correct Answers</div>
                  </div>
                  <div>
                    <div className="flex items-center justify-center mb-2 sm:mb-3">
                      <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-blue-300" />
                    </div>
                    <div className="text-2xl sm:text-4xl font-bold">{formatTime(userParticipant.time_taken)}</div>
                    <div className="text-purple-100 text-sm sm:text-base">Time Taken</div>
                  </div>
                </div>

                {/* Points Earned */}
                {userParticipant.status === 'completed' && (
                  <div className="mt-4 sm:mt-6 text-center">
                    <div className="inline-flex items-center space-x-2 bg-white bg-opacity-20 px-4 sm:px-6 py-2 sm:py-3 rounded-full">
                      <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-300" />
                      <span className="text-lg sm:text-xl font-bold">+{userParticipant.points_earned || 0} Points Earned</span>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          </motion.div>
        )}

        {/* Competition Insights */}
        {insights && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-6 sm:mb-8"
          >
            <Card className="shadow-xl border-2 border-blue-100">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 sm:p-6">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center">
                  <BarChart3 className="w-6 h-6 sm:w-7 sm:h-7 mr-2 sm:mr-3 text-blue-600" />
                  Competition Insights
                  {!isCompetitionFullyComplete && (
                    <span className="ml-2 sm:ml-3 px-2 sm:px-3 py-1 bg-orange-100 text-orange-700 text-xs sm:text-sm font-medium rounded-full">
                      Live Data
                    </span>
                  )}
                </h3>
              </CardHeader>
              <CardBody className="p-4 sm:p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                  <div className="text-center p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                    <div className="text-lg sm:text-2xl font-bold text-blue-600">{insights.completedParticipants}/{insights.totalParticipants}</div>
                    <div className="text-xs sm:text-sm text-gray-600">Completed</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                    <div className="text-lg sm:text-2xl font-bold text-green-600">{insights.averageScore}</div>
                    <div className="text-xs sm:text-sm text-gray-600">Avg Score</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl">
                    <div className="text-lg sm:text-2xl font-bold text-purple-600">{insights.averageAccuracy}%</div>
                    <div className="text-xs sm:text-sm text-gray-600">Avg Accuracy</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl">
                    <div className="text-lg sm:text-2xl font-bold text-orange-600">{insights.averageTime}</div>
                    <div className="text-xs sm:text-sm text-gray-600">Avg Time</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl">
                    <div className="text-lg sm:text-2xl font-bold text-yellow-600">{insights.highestScore}</div>
                    <div className="text-xs sm:text-sm text-gray-600">Highest Score</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl">
                    <div className="text-lg sm:text-2xl font-bold text-teal-600">{insights.fastestTime}</div>
                    <div className="text-xs sm:text-sm text-gray-600">Fastest Time</div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        )}

        {/* Live Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-6 sm:mb-8"
        >
          <Card className="shadow-2xl border-2 border-purple-100">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center">
                  <Trophy className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3 text-yellow-500" />
                  {isCompetitionFullyComplete ? 'Final Rankings' : 'Live Leaderboard'}
                </h3>
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                  <div className="text-sm text-gray-600">
                    {completedCount}/{totalParticipants} finished
                  </div>
                  {!isCompetitionFullyComplete && showLiveUpdates && (
                    <div className="flex items-center space-x-2 text-green-600">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-sm font-medium">Live</span>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardBody className="p-4 sm:p-6">
              <div className="space-y-3 sm:space-y-4">
                {sortedParticipants.map((participant, index) => {
                  const rank = index + 1;
                  const isCompleted = participant.status === 'completed';
                  const isCurrentUser = participant.user_id === user?.id;
                  const progressPercentage = getProgressPercentage(participant);
                  
                  return (
                    <motion.div
                      key={participant.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.05 }}
                      className={`p-4 sm:p-6 rounded-2xl border-2 transition-all duration-300 ${
                        isCurrentUser
                          ? 'border-purple-500 bg-purple-50 shadow-lg scale-105'
                          : 'border-gray-200 bg-white hover:shadow-md'
                      } ${!isCompleted ? 'border-l-4 border-l-orange-400' : ''}`}
                    >
                      <div className="flex items-center space-x-3 sm:space-x-6">
                        {/* Rank Badge */}
                        <div className={`w-12 h-12 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-2xl shadow-lg bg-gradient-to-r ${getRankColor(rank, isCompleted)}`}>
                          {getRankIcon(rank, isCompleted)}
                        </div>

                        {/* Participant Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3 mb-2 sm:mb-3">
                            <h4 className="text-lg sm:text-2xl font-bold text-gray-800 truncate">
                              {participant.profile?.full_name || 'Anonymous'}
                            </h4>
                            <div className="flex items-center space-x-2">
                              {isCurrentUser && (
                                <span className="px-2 sm:px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                                  You
                                </span>
                              )}
                              {participant.user_id === competition.creator_id && (
                                <Crown className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-500" />
                              )}
                              <span className={`px-2 sm:px-3 py-1 text-xs font-bold rounded-full ${
                                isCompleted 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-orange-100 text-orange-700'
                              }`}>
                                {isCompleted ? 'FINISHED' : 'IN PROGRESS'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-4 text-xs sm:text-sm">
                            <div className="flex items-center space-x-1 sm:space-x-2">
                              <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
                              <span className="text-gray-600">Score:</span>
                              <span className="font-bold text-purple-600">
                                {participant.score?.toFixed(1) || '0.0'}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1 sm:space-x-2">
                              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                              <span className="text-gray-600">Correct:</span>
                              <span className="font-bold text-green-600">
                                {participant.correct_answers || 0}/{competition.questions?.length || 0}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1 sm:space-x-2">
                              <Target className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                              <span className="text-gray-600">Progress:</span>
                              <span className="font-bold text-blue-600">
                                {isCompleted ? '100%' : `${progressPercentage.toFixed(0)}%`}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1 sm:space-x-2">
                              <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600" />
                              <span className="text-gray-600">Time:</span>
                              <span className="font-bold text-orange-600">
                                {formatTime(participant.time_taken || 0)}
                              </span>
                            </div>
                            {isCompleted && (
                              <div className="flex items-center space-x-1 sm:space-x-2">
                                <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600" />
                                <span className="text-gray-600">Points:</span>
                                <span className="font-bold text-yellow-600">
                                  +{participant.points_earned || 0}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Progress Bar for Active Participants */}
                          {!isCompleted && (
                            <div className="mt-3 sm:mt-4">
                              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                <span>Quiz Progress</span>
                                <span>{participant.questions_answered || 0}/{competition.questions?.length || 0} questions</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <motion.div
                                  className="bg-gradient-to-r from-orange-400 to-yellow-400 h-2 rounded-full transition-all duration-500"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${progressPercentage}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6"
        >
          <Button
            onClick={onNewCompetition}
            className="gradient-bg hover:opacity-90 transition-all duration-300 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold shadow-xl w-full sm:w-auto"
          >
            <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
            New Competition
          </Button>
          <Button
            onClick={onBackToHome}
            variant="outline"
            className="border-2 border-purple-200 text-purple-600 hover:bg-purple-50 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold w-full sm:w-auto"
          >
            <Home className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
            Back to Home
          </Button>
          <Button
            onClick={handleLeaveCompetition}
            variant="outline"
            className="border-2 border-red-200 text-red-600 hover:bg-red-50 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold w-full sm:w-auto"
          >
            <LogOut className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
            Leave Competition
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default CompetitionResults;