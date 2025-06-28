// src/components/competition/RandomMatchStats.tsx
import React, { useEffect, useState } from 'react';
import { useCompetitionStore } from '../../store/useCompetitionStore';
import { Card, CardBody, CardHeader } from '../ui/Card';
import { Trophy, Target, Clock, TrendingUp, Star, Zap, ChevronDown, ChevronUp, BarChart3, PieChart, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart as RechartsPieChart, Pie, Cell
} from 'recharts';
import { Button } from '../ui/Button'; // Import the Button component

interface RandomMatchStatsProps {
  userId: string;
}

const RandomMatchStats: React.FC<RandomMatchStatsProps> = ({ userId }) => {
  const { competitionResultsHistory, loadCompetitionResultsHistory } = useCompetitionStore();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMatches: 0,
    wins: 0,
    losses: 0,
    averageRank: 0,
    averageScore: 0,
    totalTimePlayed: 0,
  });
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [showDetailedStats, setShowDetailedStats] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      await loadCompetitionResultsHistory(userId);
      setIsLoading(false);
    };
    fetchStats();
  }, [userId, loadCompetitionResultsHistory]);

  useEffect(() => {
    // Add this check to ensure competitionResultsHistory is an array before filtering
    if (!Array.isArray(competitionResultsHistory)) {
      return;
    }

    const randomMatches = competitionResultsHistory.filter(
      (result: any) => result.competition_type === 'random'
    );

    if (randomMatches.length > 0) {
      const totalMatches = randomMatches.length;
      const wins = randomMatches.filter((match: any) => match.final_rank === 1).length;
      const losses = randomMatches.filter((match: any) => match.final_rank !== 1).length; // Simplified for now
      const totalRank = randomMatches.reduce((sum, match) => sum + (match.final_rank || 0), 0);
      const averageRank = totalRank / totalMatches;
      const totalScore = randomMatches.reduce((sum, match) => sum + (match.score || 0), 0);
      const averageScore = totalScore / totalMatches;
      const totalTimePlayed = randomMatches.reduce((sum, match) => sum + (match.time_taken || 0), 0);

      setStats({
        totalMatches,
        wins,
        losses,
        averageRank: parseFloat(averageRank.toFixed(1)),
        averageScore: parseFloat(averageScore.toFixed(1)),
        totalTimePlayed,
      });
      generateChartData(randomMatches);
    } else {
      setStats({
        totalMatches: 0,
        wins: 0,
        losses: 0,
        averageRank: 0,
        averageScore: 0,
        totalTimePlayed: 0,
      });
      setPerformanceData([]);
      setCategoryData([]);
    }
  }, [competitionResultsHistory]);

  const generateChartData = (history: any[]) => {
    // Performance Trends (Score over time)
    const sortedHistory = [...history].sort((a, b) => new Date(a.competition_date).getTime() - new Date(b.competition_date).getTime());
    const perfData = sortedHistory.map(comp => ({
      date: new Date(comp.competition_date).toLocaleDateString(),
      score: comp.score || 0,
      rank: comp.final_rank || 0,
    }));
    setPerformanceData(perfData);

    // Subject Distribution
    const categoryMap = new Map<string, number>();
    history.forEach(comp => {
      const category = comp.quiz_preferences?.topic || comp.quiz_preferences?.course || 'General';
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
    });
    const catData = Array.from(categoryMap.entries()).map(([name, value], index) => ({
      name,
      value,
      color: ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#6366F1', '#EC4899'][index % 7],
    }));
    setCategoryData(catData);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <Card className="shadow-xl border-2 border-orange-100">
      <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50">
        <h3 className="text-2xl font-bold text-slate-800 flex items-center">
          <Zap className="w-7 h-7 mr-3 text-orange-600" />
          Your Random Match Stats
        </h3>
      </CardHeader>
      <CardBody className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              label: 'Total Matches',
              value: stats.totalMatches,
              icon: Trophy,
              color: 'from-orange-500 to-red-500',
            },
            {
              label: 'Wins',
              value: stats.wins,
              icon: Star,
              color: 'from-yellow-500 to-orange-500',
            },
            {
              label: 'Losses',
              value: stats.losses,
              icon: Target,
              color: 'from-gray-500 to-slate-500',
            },
            {
              label: 'Average Rank',
              value: `#${stats.averageRank}`,
              icon: TrendingUp,
              color: 'from-blue-500 to-cyan-500',
            },
            {
              label: 'Average Score',
              value: `${stats.averageScore}%`,
              icon: Zap,
              color: 'from-green-500 to-emerald-500',
            },
            {
              label: 'Total Time Played',
              value: formatTime(stats.totalTimePlayed),
              icon: Clock,
              color: 'from-purple-500 to-pink-500',
            },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${stat.color}`} />
                <CardBody className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-800 mb-1">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Detailed Analytics */}
        {performanceData.length > 0 && ( // Check performanceData.length instead of randomMatches.length
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-8"
          >
            <Card className="shadow-xl border-2 border-gray-100">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-orange-50">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                    <Activity className="w-7 h-7 mr-3 text-orange-600" />
                    Detailed Analytics
                  </h3>
                  <Button
                    variant="ghost"
                    onClick={() => setShowDetailedStats(!showDetailedStats)}
                    className="text-orange-600"
                  >
                    {showDetailedStats ? (
                      <>
                        <ChevronUp className="w-5 h-5 mr-2" />
                        Hide Details
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-5 h-5 mr-2" />
                        Show Details
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>

              <AnimatePresence>
                {showDetailedStats && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CardBody className="p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Performance Trends Chart */}
                        <div>
                          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                            Score Performance Over Time
                          </h4>
                          <ResponsiveContainer width="100%" height={250}>
                            <AreaChart data={performanceData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" />
                              <YAxis />
                              <Tooltip />
                              <Area
                                type="monotone"
                                dataKey="score"
                                stroke="#10B981"
                                fill="#10B981"
                                fillOpacity={0.3}
                                name="Score (%)"
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>

                        {/* Subject Distribution Chart */}
                        <div>
                          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <PieChart className="w-5 h-5 mr-2 text-purple-600" />
                            Match Subject Distribution
                          </h4>
                          <ResponsiveContainer width="100%" height={250}>
                            <RechartsPieChart>
                              <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              >
                                {categoryData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </RechartsPieChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </CardBody>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        )}
      </CardBody>
    </Card>
  );
};

export default RandomMatchStats; 