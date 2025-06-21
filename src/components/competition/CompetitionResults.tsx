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
  LogOut, ArrowLeft
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
  const { participants, userStats, loadUserStats, leaveCompetition } = useCompetitionStore();
  const [showDetailedStats, setShowDetailedStats] = useState(false);
  const [confettiVisible, setConfettiVisible] = useState(true);

  const completedParticipants = participants
    .filter(p => p.status === 'completed')
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.time_taken - b.time_taken;
    });

  const userParticipant = completedParticipants.find(p => p.user_id === user?.id);
  const userRank = completedParticipants.findIndex(p => p.user_id === user?.id) + 1;

  useEffect(() => {
    if (user) {
      loadUserStats(user.id);
    }
    
    // Hide confetti after 5 seconds
    const timer = setTimeout(() => setConfettiVisible(false), 5000);
    return () => clearTimeout(timer);
  }, [user, loadUserStats]);

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
    if (!userParticipant) return { message: 'Thanks for participating!', color: 'text-gray-600' };
    
    const percentage = (userParticipant.score / competition.quiz_preferences?.questionCount) * 100;
    
    if (userRank === 1) return { 
      message: '🎉 Congratulations! You won the competition!', 
      color: 'text-yellow-600' 
    };
    if (userRank <= 3) return { 
      message: '🏆 Excellent! You finished in the top 3!', 
      color: 'text-blue-600' 
    };
    if (percentage >= 70) return { 
      message: '👏 Great performance! Well done!', 
      color: 'text-green-600' 
    };
    if (percentage >= 50) return { 
      message: '👍 Good effort! Keep practicing!', 
      color: 'text-orange-600' 
    };
    return { 
      message: '💪 Keep learning and improving!', 
      color: 'text-purple-600' 
    };
  };

  const performance = getPerformanceMessage();

  const getCompetitionInsights = () => {
    if (completedParticipants.length === 0) return null;

    const totalQuestions = competition.quiz_preferences?.questionCount || 0;
    const averageScore = completedParticipants.reduce((sum, p) => sum + p.score, 0) / completedParticipants.length;
    const averageTime = completedParticipants.reduce((sum, p) => sum + p.time_taken, 0) / completedParticipants.length;
    const highestScore = Math.max(...completedParticipants.map(p => p.score));
    const fastestTime = Math.min(...completedParticipants.map(p => p.time_taken));

    return {
      averageScore: averageScore.toFixed(1),
      averageAccuracy: ((averageScore / totalQuestions) * 100).toFixed(1),
      averageTime: formatTime(Math.round(averageTime)),
      highestScore: highestScore.toFixed(1),
      fastestTime: formatTime(fastestTime),
      totalParticipants: completedParticipants.length
    };
  };

  const insights = getCompetitionInsights();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 py-8 relative overflow-hidden">
      {/* Confetti Animation */}
      <AnimatePresence>
        {confettiVisible && (
          <div className="fixed inset-0 pointer-events-none z-10">
            {Array.from({ length: 50 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"
                initial={{
                  x: Math.random() * window.innerWidth,
                  y: -10,
                  rotate: 0,
                }}
                animate={{
                  y: window.innerHeight + 10,
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
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-6">
            <div className="w-24 h-24 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center mr-6 shadow-2xl">
              <Trophy className="w-12 h-12 text-white" />
            </div>
            <div>
              <h1 className="text-5xl font-bold text-gray-800">Competition Complete!</h1>
              <p className="text-2xl text-gray-600">{competition.title}</p>
            </div>
          </div>
          
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className={`text-3xl font-bold ${performance.color} mb-4`}
          >
            {performance.message}
          </motion.div>
        </motion.div>

        {/* User Performance Summary */}
        {userParticipant && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <Card className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-0 shadow-2xl">
              <CardBody className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
                  <div>
                    <div className="flex items-center justify-center mb-3">
                      {userRank === 1 ? <Crown className="w-10 h-10 text-yellow-300" /> :
                       userRank === 2 ? <Medal className="w-10 h-10 text-gray-300" /> :
                       userRank === 3 ? <Medal className="w-10 h-10 text-orange-300" /> :
                       <Target className="w-10 h-10 text-white" />}
                    </div>
                    <div className="text-4xl font-bold">{userRank}</div>
                    <div className="text-purple-100">Final Rank</div>
                  </div>
                  <div>
                    <div className="flex items-center justify-center mb-3">
                      <Zap className="w-10 h-10 text-yellow-300" />
                    </div>
                    <div className="text-4xl font-bold">{userParticipant.score.toFixed(1)}</div>
                    <div className="text-purple-100">Total Score</div>
                  </div>
                  <div>
                    <div className="flex items-center justify-center mb-3">
                      <Target className="w-10 h-10 text-green-300" />
                    </div>
                    <div className="text-4xl font-bold">
                      {userParticipant.correct_answers}/{competition.quiz_preferences?.questionCount}
                    </div>
                    <div className="text-purple-100">Correct Answers</div>
                  </div>
                  <div>
                    <div className="flex items-center justify-center mb-3">
                      <Clock className="w-10 h-10 text-blue-300" />
                    </div>
                    <div className="text-4xl font-bold">{formatTime(userParticipant.time_taken)}</div>
                    <div className="text-purple-100">Time Taken</div>
                  </div>
                </div>

                {/* Points Earned */}
                <div className="mt-6 text-center">
                  <div className="inline-flex items-center space-x-2 bg-white bg-opacity-20 px-6 py-3 rounded-full">
                    <Sparkles className="w-6 h-6 text-yellow-300" />
                    <span className="text-xl font-bold">+{userParticipant.points_earned} Points Earned</span>
                  </div>
                </div>
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
            className="mb-8"
          >
            <Card className="shadow-xl border-2 border-blue-100">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
                <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                  <BarChart3 className="w-7 h-7 mr-3 text-blue-600" />
                  Competition Insights
                </h3>
              </CardHeader>
              <CardBody className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                    <div className="text-2xl font-bold text-blue-600">{insights.totalParticipants}</div>
                    <div className="text-sm text-gray-600">Participants</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                    <div className="text-2xl font-bold text-green-600">{insights.averageScore}</div>
                    <div className="text-sm text-gray-600">Avg Score</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl">
                    <div className="text-2xl font-bold text-purple-600">{insights.averageAccuracy}%</div>
                    <div className="text-sm text-gray-600">Avg Accuracy</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl">
                    <div className="text-2xl font-bold text-orange-600">{insights.averageTime}</div>
                    <div className="text-sm text-gray-600">Avg Time</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl">
                    <div className="text-2xl font-bold text-yellow-600">{insights.highestScore}</div>
                    <div className="text-sm text-gray-600">Highest Score</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl">
                    <div className="text-2xl font-bold text-teal-600">{insights.fastestTime}</div>
                    <div className="text-sm text-gray-600">Fastest Time</div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        )}

        {/* Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <Card className="shadow-2xl border-2 border-purple-100">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <h3 className="text-3xl font-bold text-gray-800 flex items-center">
                  <Trophy className="w-8 h-8 mr-3 text-yellow-500" />
                  Final Rankings
                </h3>
                <div className="text-sm text-gray-600">
                  {completedParticipants.length} participants
                </div>
              </div>
            </CardHeader>
            <CardBody className="p-6">
              <div className="space-y-4">
                {completedParticipants.map((participant, index) => (
                  <motion.div
                    key={participant.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.1 }}
                    className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                      participant.user_id === user?.id
                        ? 'border-purple-500 bg-purple-50 shadow-lg scale-105'
                        : 'border-gray-200 bg-white hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center space-x-6">
                      {/* Rank Badge */}
                      <div className={`w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl shadow-lg ${
                        index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
                        index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                        index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-500' :
                        'bg-gradient-to-r from-purple-400 to-purple-500'
                      }`}>
                        {index === 0 ? <Crown className="w-10 h-10" /> :
                         index === 1 ? <Medal className="w-10 h-10" /> :
                         index === 2 ? <Medal className="w-10 h-10" /> :
                         index + 1}
                      </div>

                      {/* Participant Info */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <h4 className="text-2xl font-bold text-gray-800">
                            {participant.profile?.full_name || 'Anonymous'}
                          </h4>
                          {participant.user_id === user?.id && (
                            <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full">
                              You
                            </span>
                          )}
                          {participant.user_id === competition.creator_id && (
                            <Crown className="w-6 h-6 text-yellow-500" />
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                          <div className="flex items-center space-x-2">
                            <Zap className="w-4 h-4 text-purple-600" />
                            <span className="text-gray-600">Score:</span>
                            <span className="font-bold text-purple-600">
                              {participant.score.toFixed(1)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-gray-600">Correct:</span>
                            <span className="font-bold text-green-600">
                              {participant.correct_answers}/{competition.quiz_preferences?.questionCount}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Target className="w-4 h-4 text-blue-600" />
                            <span className="text-gray-600">Accuracy:</span>
                            <span className="font-bold text-blue-600">
                              {((participant.correct_answers / (competition.quiz_preferences?.questionCount || 1)) * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-orange-600" />
                            <span className="text-gray-600">Time:</span>
                            <span className="font-bold text-orange-600">
                              {formatTime(participant.time_taken)}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Star className="w-4 h-4 text-yellow-600" />
                            <span className="text-gray-600">Points:</span>
                            <span className="font-bold text-yellow-600">
                              +{participant.points_earned}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* User Statistics */}
        {userStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mb-8"
          >
            <Card className="shadow-xl border-2 border-indigo-100">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                    <Activity className="w-7 h-7 mr-3 text-indigo-600" />
                    Your Overall Statistics
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDetailedStats(!showDetailedStats)}
                    className="text-indigo-600"
                  >
                    {showDetailedStats ? (
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
              </CardHeader>
              <CardBody className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
                  <div>
                    <div className="text-4xl font-bold text-blue-600">{userStats.total_competitions}</div>
                    <div className="text-gray-600">Total Competitions</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-green-600">{userStats.wins}</div>
                    <div className="text-gray-600">Wins</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-red-600">{userStats.losses}</div>
                    <div className="text-gray-600">Losses</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-purple-600">{userStats.total_points}</div>
                    <div className="text-gray-600">Total Points</div>
                  </div>
                  <div>
                    <div className="text-4xl font-bold text-yellow-600">
                      {userStats.best_rank || 'N/A'}
                    </div>
                    <div className="text-gray-600">Best Rank</div>
                  </div>
                </div>

                <AnimatePresence>
                  {showDetailedStats && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-8 pt-6 border-t border-gray-200"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                          <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                            <TrendingUp className="w-5 h-5 mr-2" />
                            Win Rate
                          </h4>
                          <div className="text-3xl font-bold text-green-600">
                            {userStats.total_competitions > 0 
                              ? ((userStats.wins / userStats.total_competitions) * 100).toFixed(1)
                              : 0}%
                          </div>
                        </div>
                        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-200">
                          <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                            <Target className="w-5 h-5 mr-2" />
                            Average Score
                          </h4>
                          <div className="text-3xl font-bold text-blue-600">
                            {userStats.average_score?.toFixed(1) || '0.0'}
                          </div>
                        </div>
                        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-xl border border-purple-200">
                          <h4 className="font-semibold text-purple-800 mb-3 flex items-center">
                            <Timer className="w-5 h-5 mr-2" />
                            Time Played
                          </h4>
                          <div className="text-3xl font-bold text-purple-600">
                            {formatTime(userStats.total_time_played)}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardBody>
            </Card>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="flex flex-col sm:flex-row justify-center gap-6"
        >
          <Button
            onClick={onNewCompetition}
            className="gradient-bg hover:opacity-90 transition-all duration-300 px-8 py-4 text-lg font-semibold shadow-xl"
          >
            <RefreshCw className="w-6 h-6 mr-2" />
            New Competition
          </Button>
          <Button
            onClick={onBackToHome}
            variant="outline"
            className="border-2 border-purple-200 text-purple-600 hover:bg-purple-50 px-8 py-4 text-lg font-semibold"
          >
            <Home className="w-6 h-6 mr-2" />
            Back to Home
          </Button>
          <Button
            onClick={handleLeaveCompetition}
            variant="outline"
            className="border-2 border-red-200 text-red-600 hover:bg-red-50 px-8 py-4 text-lg font-semibold"
          >
            <LogOut className="w-6 h-6 mr-2" />
            Leave Competition
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default CompetitionResults;