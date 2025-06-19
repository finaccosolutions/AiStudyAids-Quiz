import React, { useState, useEffect } from 'react';
import { useCompetitionStore } from '../../store/useCompetitionStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../ui/Button';
import { Card, CardBody, CardHeader } from '../ui/Card';
import { 
  Trophy, Crown, Medal, Star, Clock, Target, 
  TrendingUp, Award, Zap, Users, Home, RefreshCw,
  ChevronDown, ChevronUp, BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Competition } from '../../types/competition';

interface CompetitionResultsProps {
  competition: Competition;
  onNewCompetition: () => void;
  onBackToHome: () => void;
}

const CompetitionResults: React.FC<CompetitionResultsProps> = ({
  competition,
  onNewCompetition,
  onBackToHome
}) => {
  const { user } = useAuthStore();
  const { participants, userStats, loadUserStats } = useCompetitionStore();
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

      <div className="max-w-6xl mx-auto px-4 relative z-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center mr-4">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-800">Competition Complete!</h1>
              <p className="text-xl text-gray-600">{competition.title}</p>
            </div>
          </div>
          
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className={`text-2xl font-bold ${performance.color} mb-4`}
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
                    <div className="flex items-center justify-center mb-2">
                      {userRank === 1 ? <Crown className="w-8 h-8 text-yellow-300" /> :
                       userRank === 2 ? <Medal className="w-8 h-8 text-gray-300" /> :
                       userRank === 3 ? <Medal className="w-8 h-8 text-orange-300" /> :
                       <Target className="w-8 h-8 text-white" />}
                    </div>
                    <div className="text-3xl font-bold">{userRank}</div>
                    <div className="text-purple-100">Rank</div>
                  </div>
                  <div>
                    <div className="flex items-center justify-center mb-2">
                      <Zap className="w-8 h-8 text-yellow-300" />
                    </div>
                    <div className="text-3xl font-bold">{userParticipant.score.toFixed(1)}</div>
                    <div className="text-purple-100">Score</div>
                  </div>
                  <div>
                    <div className="flex items-center justify-center mb-2">
                      <Target className="w-8 h-8 text-green-300" />
                    </div>
                    <div className="text-3xl font-bold">
                      {userParticipant.correct_answers}/{competition.quiz_preferences?.questionCount}
                    </div>
                    <div className="text-purple-100">Correct</div>
                  </div>
                  <div>
                    <div className="flex items-center justify-center mb-2">
                      <Clock className="w-8 h-8 text-blue-300" />
                    </div>
                    <div className="text-3xl font-bold">{formatTime(userParticipant.time_taken)}</div>
                    <div className="text-purple-100">Time</div>
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
          transition={{ delay: 0.5 }}
          className="mb-8"
        >
          <Card className="shadow-2xl">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                  <Trophy className="w-7 h-7 mr-3 text-yellow-500" />
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
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                      participant.user_id === user?.id
                        ? 'border-purple-500 bg-purple-50 shadow-lg scale-105'
                        : 'border-gray-200 bg-white hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      {/* Rank Badge */}
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl ${
                        index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
                        index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                        index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-500' :
                        'bg-gradient-to-r from-purple-400 to-purple-500'
                      }`}>
                        {index === 0 ? <Crown className="w-8 h-8" /> :
                         index === 1 ? <Medal className="w-8 h-8" /> :
                         index === 2 ? <Medal className="w-8 h-8" /> :
                         index + 1}
                      </div>

                      {/* Participant Info */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h4 className="text-xl font-bold text-gray-800">
                            {participant.profile?.full_name || 'Anonymous'}
                          </h4>
                          {participant.user_id === user?.id && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                              You
                            </span>
                          )}
                          {participant.user_id === competition.creator_id && (
                            <Crown className="w-5 h-5 text-yellow-500" />
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Score:</span>
                            <span className="ml-2 font-bold text-purple-600">
                              {participant.score.toFixed(1)} pts
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Correct:</span>
                            <span className="ml-2 font-bold text-green-600">
                              {participant.correct_answers}/{competition.quiz_preferences?.questionCount}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Accuracy:</span>
                            <span className="ml-2 font-bold text-blue-600">
                              {((participant.correct_answers / competition.quiz_preferences?.questionCount) * 100).toFixed(1)}%
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Time:</span>
                            <span className="ml-2 font-bold text-orange-600">
                              {formatTime(participant.time_taken)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Points Earned */}
                      <div className="text-center">
                        <div className="text-2xl font-bold text-yellow-600">
                          +{participant.points_earned}
                        </div>
                        <div className="text-xs text-gray-600">points</div>
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
            <Card className="shadow-xl">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center">
                    <BarChart3 className="w-6 h-6 mr-2 text-blue-600" />
                    Your Overall Statistics
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowDetailedStats(!showDetailedStats)}
                    className="text-blue-600"
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
                    <div className="text-3xl font-bold text-blue-600">{userStats.total_competitions}</div>
                    <div className="text-gray-600">Total Competitions</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-green-600">{userStats.wins}</div>
                    <div className="text-gray-600">Wins</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-red-600">{userStats.losses}</div>
                    <div className="text-gray-600">Losses</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-purple-600">{userStats.total_points}</div>
                    <div className="text-gray-600">Total Points</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-yellow-600">
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
                      className="mt-6 pt-6 border-t border-gray-200"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-green-800 mb-2">Win Rate</h4>
                          <div className="text-2xl font-bold text-green-600">
                            {userStats.total_competitions > 0 
                              ? ((userStats.wins / userStats.total_competitions) * 100).toFixed(1)
                              : 0}%
                          </div>
                        </div>
                        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-blue-800 mb-2">Average Score</h4>
                          <div className="text-2xl font-bold text-blue-600">
                            {userStats.average_score?.toFixed(1) || '0.0'}
                          </div>
                        </div>
                        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg">
                          <h4 className="font-semibold text-purple-800 mb-2">Time Played</h4>
                          <div className="text-2xl font-bold text-purple-600">
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
          className="flex flex-col sm:flex-row justify-center gap-4"
        >
          <Button
            onClick={onNewCompetition}
            className="gradient-bg hover:opacity-90 transition-all duration-300 px-8 py-3 text-lg"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            New Competition
          </Button>
          <Button
            onClick={onBackToHome}
            variant="outline"
            className="border-2 border-purple-200 text-purple-600 hover:bg-purple-50 px-8 py-3 text-lg"
          >
            <Home className="w-5 h-5 mr-2" />
            Back to Home
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

export default CompetitionResults;