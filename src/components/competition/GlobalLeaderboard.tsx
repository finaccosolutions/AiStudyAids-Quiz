import React, { useState, useEffect } from 'react';
import { useCompetitionStore } from '../../store/useCompetitionStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Card, CardBody, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { 
  Trophy, Crown, Medal, Star, TrendingUp, Award, 
  Users, Target, Clock, Zap, Filter, Search,
  Calendar, BarChart3, Activity, Sparkles,
  ChevronDown, ChevronUp, Globe, Flame
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface GlobalLeaderboardProps {
  timeframe?: 'all' | 'month' | 'week';
  category?: 'overall' | 'wins' | 'points' | 'accuracy';
}

const GlobalLeaderboard: React.FC<GlobalLeaderboardProps> = ({
  timeframe = 'all',
  category = 'overall'
}) => {
  const { user } = useAuthStore();
  const { userStats, loadUserStats } = useCompetitionStore();
  const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState(timeframe);
  const [selectedCategory, setSelectedCategory] = useState(category);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [userRank, setUserRank] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      loadUserStats(user.id);
      loadLeaderboardData();
    }
  }, [user, selectedTimeframe, selectedCategory]);

  const loadLeaderboardData = async () => {
    setIsLoading(true);
    try {
      // Simulate leaderboard data - in production, this would come from your database
      const mockData = Array.from({ length: 50 }, (_, i) => ({
        id: `user-${i + 1}`,
        rank: i + 1,
        name: `Player ${i + 1}`,
        avatar: null,
        totalCompetitions: Math.floor(Math.random() * 100) + 10,
        wins: Math.floor(Math.random() * 50) + 5,
        totalPoints: Math.floor(Math.random() * 10000) + 1000,
        averageScore: (Math.random() * 40 + 60).toFixed(1),
        winRate: ((Math.random() * 40 + 40)).toFixed(1),
        bestRank: Math.floor(Math.random() * 5) + 1,
        totalTimePlayed: Math.floor(Math.random() * 10000) + 500,
        isCurrentUser: i === 15 // Simulate current user at rank 16
      }));

      setLeaderboardData(mockData);
      setUserRank(16); // Simulate user rank
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const timeframeOptions = [
    { value: 'all', label: 'All Time', icon: Globe },
    { value: 'month', label: 'This Month', icon: Calendar },
    { value: 'week', label: 'This Week', icon: Flame }
  ];

  const categoryOptions = [
    { value: 'overall', label: 'Overall Ranking', icon: Trophy },
    { value: 'wins', label: 'Most Wins', icon: Crown },
    { value: 'points', label: 'Total Points', icon: Star },
    { value: 'accuracy', label: 'Best Accuracy', icon: Target }
  ];

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-orange-500" />;
    return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-400 to-yellow-500';
    if (rank === 2) return 'from-gray-300 to-gray-400';
    if (rank === 3) return 'from-orange-400 to-orange-500';
    if (rank <= 10) return 'from-purple-400 to-purple-500';
    return 'from-blue-400 to-blue-500';
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const filteredData = leaderboardData.filter(player =>
    player.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="flex items-center justify-center mb-6">
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 4, repeat: Infinity }}
            className="w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center mr-6 shadow-2xl relative"
          >
            <Trophy className="w-10 h-10 text-white" />
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/50 to-orange-400/50 rounded-full blur-xl animate-pulse" />
          </motion.div>
          <div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-600 via-orange-500 to-red-500 bg-clip-text text-transparent">
              Global Leaderboard
            </h1>
            <p className="text-xl text-gray-600">Compete with the best minds worldwide</p>
          </div>
        </div>
      </motion.div>

      {/* User's Current Position */}
      {userRank && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-0 shadow-2xl">
            <CardBody className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold">#{userRank}</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">Your Current Rank</h3>
                    <p className="text-purple-100">
                      {userRank <= 10 ? 'Top 10 Player!' : 
                       userRank <= 50 ? 'Top 50 Player!' : 
                       'Keep climbing!'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{userStats?.total_points || 0}</div>
                  <div className="text-purple-100">Total Points</div>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      )}

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-8"
      >
        <Card className="shadow-lg border-2 border-gray-100">
          <CardBody className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search players..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Filter Toggle */}
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden"
              >
                <Filter className="w-5 h-5 mr-2" />
                Filters
                {showFilters ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
              </Button>

              {/* Desktop Filters */}
              <div className="hidden lg:flex items-center space-x-4">
                {/* Timeframe */}
                <div className="flex items-center space-x-2">
                  {timeframeOptions.map((option) => (
                    <motion.button
                      key={option.value}
                      onClick={() => setSelectedTimeframe(option.value as any)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                        selectedTimeframe === option.value
                          ? 'bg-purple-500 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-purple-100'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <option.icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{option.label}</span>
                    </motion.button>
                  ))}
                </div>

                {/* Category */}
                <div className="flex items-center space-x-2">
                  {categoryOptions.map((option) => (
                    <motion.button
                      key={option.value}
                      onClick={() => setSelectedCategory(option.value as any)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                        selectedCategory === option.value
                          ? 'bg-indigo-500 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-indigo-100'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <option.icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{option.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="lg:hidden mt-4 pt-4 border-t border-gray-200"
                >
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Timeframe</label>
                      <div className="grid grid-cols-3 gap-2">
                        {timeframeOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => setSelectedTimeframe(option.value as any)}
                            className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-sm transition-all duration-300 ${
                              selectedTimeframe === option.value
                                ? 'bg-purple-500 text-white'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            <option.icon className="w-4 h-4" />
                            <span>{option.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                      <div className="grid grid-cols-2 gap-2">
                        {categoryOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => setSelectedCategory(option.value as any)}
                            className={`flex items-center justify-center space-x-2 px-3 py-2 rounded-lg text-sm transition-all duration-300 ${
                              selectedCategory === option.value
                                ? 'bg-indigo-500 text-white'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            <option.icon className="w-4 h-4" />
                            <span>{option.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardBody>
        </Card>
      </motion.div>

      {/* Top 3 Podium */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredData.slice(0, 3).map((player, index) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className={`relative ${index === 0 ? 'md:order-2' : index === 1 ? 'md:order-1' : 'md:order-3'}`}
            >
              <Card className={`overflow-hidden border-2 shadow-2xl ${
                index === 0 ? 'border-yellow-300 transform scale-105' :
                index === 1 ? 'border-gray-300' :
                'border-orange-300'
              }`}>
                <div className={`h-2 bg-gradient-to-r ${getRankColor(player.rank)}`} />
                <CardBody className="p-6 text-center relative">
                  {/* Rank Badge */}
                  <div className={`absolute -top-4 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gradient-to-r ${getRankColor(player.rank)} rounded-full flex items-center justify-center shadow-lg`}>
                    {getRankIcon(player.rank)}
                  </div>
                  
                  {/* Avatar */}
                  <div className="mt-6 mb-4">
                    <div className="w-20 h-20 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full flex items-center justify-center mx-auto shadow-lg">
                      <span className="text-white font-bold text-2xl">
                        {player.name.charAt(0)}
                      </span>
                    </div>
                  </div>
                  
                  {/* Player Info */}
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{player.name}</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Points:</span>
                      <span className="font-bold text-purple-600">{player.totalPoints.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Win Rate:</span>
                      <span className="font-bold text-green-600">{player.winRate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Competitions:</span>
                      <span className="font-bold text-blue-600">{player.totalCompetitions}</span>
                    </div>
                  </div>
                  
                  {/* Special Effects for #1 */}
                  {index === 0 && (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className="absolute top-2 right-2"
                    >
                      <Sparkles className="w-6 h-6 text-yellow-500" />
                    </motion.div>
                  )}
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Full Leaderboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="shadow-2xl border-2 border-gray-100">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-purple-50">
            <h3 className="text-2xl font-bold text-gray-800 flex items-center">
              <BarChart3 className="w-7 h-7 mr-3 text-purple-600" />
              Complete Rankings
            </h3>
          </CardHeader>
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Rank</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Player</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Points</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Wins</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Win Rate</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Avg Score</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-600">Time Played</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredData.slice(3).map((player, index) => (
                    <motion.tr
                      key={player.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + index * 0.05 }}
                      className={`hover:bg-gray-50 transition-colors ${
                        player.isCurrentUser ? 'bg-purple-50 border-l-4 border-purple-500' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm bg-gradient-to-r ${getRankColor(player.rank)}`}>
                            {player.rank}
                          </div>
                          {player.isCurrentUser && (
                            <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                              You
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full flex items-center justify-center mr-3">
                            <span className="text-white font-bold">
                              {player.name.charAt(0)}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{player.name}</div>
                            <div className="text-sm text-gray-500">
                              Best Rank: #{player.bestRank}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-bold text-purple-600">
                          {player.totalPoints.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-bold text-green-600">
                          {player.wins}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-bold text-blue-600">
                          {player.winRate}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-bold text-orange-600">
                          {player.averageScore}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-bold text-gray-600">
                          {formatTime(player.totalTimePlayed)}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Load More Button */}
      {filteredData.length > 20 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          className="text-center mt-8"
        >
          <Button
            variant="outline"
            className="px-8 py-3 text-lg font-semibold"
          >
            Load More Players
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default GlobalLeaderboard;