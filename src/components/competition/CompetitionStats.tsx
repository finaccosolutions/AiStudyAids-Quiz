// src/components/competition/CompetitionStats.tsx
import React, { useState, useEffect } from 'react';
import { useCompetitionStore } from '../../store/useCompetitionStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../ui/Button';
import { 
  Trophy, TrendingUp, Target, Clock, Users, Award,
  BarChart3, PieChart, Activity, Star, Zap, Calendar,
  ChevronDown, ChevronUp, Filter, Download, Share2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line, PieChart as RechartsPieChart, Cell, Area, AreaChart, Pie,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';

interface CompetitionStatsProps {
  userId: string;
}

const CompetitionStats: React.FC<CompetitionStatsProps> = ({ userId }) => {
  const { userStats, loadUserStats, competitions, loadUserCompetitions } = useCompetitionStore();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year' | 'all'>('month');
  const [showDetailedStats, setShowDetailedStats] = useState(false);
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [competitionStatusData, setCompetitionStatusData] = useState<any[]>([]);
  const [userPerformanceRadarData, setUserPerformanceRadarData] = useState<any[]>([]);
  const [progressData, setProgressData] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, [userId, selectedPeriod]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadUserStats(userId),
        loadUserCompetitions(userId)
      ]);
      generateChartData();
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      set({ isLoading: false });
    }
  };

  const generateChartData = () => {
    // Generate mock performance data over time
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const performance = months.map((month, index) => ({
      month,
      competitions: Math.floor(Math.random() * 20) + 5,
      wins: Math.floor(Math.random() * 10) + 2,
      averageScore: Math.floor(Math.random() * 30) + 60,
      points: Math.floor(Math.random() * 500) + 200
    }));
    setPerformanceData(performance);

    // Generate category performance data
    const categories = [
      { name: 'Computer Science', value: 35, color: '#8B5CF6' },
      { name: 'Mathematics', value: 25, color: '#06B6D4' },
      { name: 'Physics', value: 20, color: '#10B981' },
      { name: 'Chemistry', value: 12, color: '#F59E0B' },
      { name: 'Biology', value: 8, color: '#EF4444' }
    ];
    setCategoryData(categories);

    // Generate progress data
    const progress = Array.from({ length: 30 }, (_, i) => ({
      day: i + 1,
      score: Math.floor(Math.random() * 40) + 60,
      rank: Math.floor(Math.random() * 50) + 1
    }));
    setProgressData(progress);

    // Competition Status Distribution
    const statusCounts = {
      waiting: competitions.filter(c => c.status === 'waiting').length,
      active: competitions.filter(c => c.status === 'active').length,
      completed: competitions.filter(c => c.status === 'completed').length,
      cancelled: competitions.filter(c => c.status === 'cancelled').length,
    };
    setCompetitionStatusData([
      { name: 'Waiting', count: statusCounts.waiting, color: '#F59E0B' },
      { name: 'Active', count: statusCounts.active, color: '#10B981' },
      { name: 'Completed', count: statusCounts.completed, color: '#6366F1' },
      { name: 'Cancelled', count: statusCounts.cancelled, color: '#EF4444' },
    ]);

    // User Performance Radar Chart Data (mock or derived from userStats)
    const avgScore = userStats?.average_score || 0;
    const winRate = userStats?.total_competitions ? (userStats.wins / userStats.total_competitions) * 100 : 0;
    const totalTime = userStats?.total_time_played || 0;
    const bestRank = userStats?.best_rank ? (100 - (userStats.best_rank / 100) * 100) : 0; // Invert rank for positive scale

    setUserPerformanceRadarData([
      { subject: 'Avg. Score', A: avgScore, fullMark: 100 },
      { subject: 'Win Rate', A: winRate, fullMark: 100 },
      { subject: 'Time Efficiency', A: totalTime > 0 ? (10000 / totalTime) : 0, fullMark: 100 }, // Example: higher is better
      { subject: 'Best Rank', A: bestRank, fullMark: 100 },
      { subject: 'Engagement', A: competitions.length * 5, fullMark: 100 }, // Example: more competitions = more engagement
    ]);
  };

  const periodOptions = [
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' },
    { value: 'all', label: 'All Time' }
  ];

  const statCards = [
    {
      title: 'Total Competitions',
      value: userStats?.total_competitions || 0,
      icon: Trophy,
      color: 'from-blue-500 to-cyan-500',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'Win Rate',
      value: userStats?.total_competitions ?
        `${((userStats.wins / userStats.total_competitions) * 100).toFixed(1)}%` : '0%',
      icon: Target,
      color: 'from-green-500 to-emerald-500',
      change: '+5.2%',
      changeType: 'positive'
    },
    {
      title: 'Total Points',
      value: userStats?.total_points?.toLocaleString() || '0',
      icon: Star,
      color: 'from-purple-500 to-pink-500',
      change: '+234',
      changeType: 'positive'
    },
    {
      title: 'Best Rank',
      value: userStats?.best_rank ? `#${userStats.best_rank}` : 'N/A',
      icon: Award,
      color: 'from-orange-500 to-red-500',
      change: 'New!',
      changeType: 'neutral'
    },
    {
      title: 'Average Score',
      value: userStats?.average_score ? `${userStats.average_score.toFixed(1)}%` : '0%',
      icon: TrendingUp,
      color: 'from-indigo-500 to-purple-500',
      change: '+3.1%',
      changeType: 'positive'
    },
    {
      title: 'Time Played',
      value: userStats?.total_time_played ?
        `${Math.floor(userStats.total_time_played / 3600)}h ${Math.floor((userStats.total_time_played % 3600) / 60)}m` : '0h 0m',
      icon: Clock,
      color: 'from-teal-500 to-cyan-500',
      change: '+2.5h',
      changeType: 'positive'
    }
  ];

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
        className="flex flex-col md:flex-row md:items-center md:justify-between mb-8"
      >
        <div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Competition Statistics</h1>
          <p className="text-gray-600 text-lg">Track your performance and progress over time</p>
        </div>

        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          {/* Period Selector */}
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
          >
            {periodOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Action Buttons */}
          <Button variant="outline" className="flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </Button>
          <Button variant="outline" className="flex items-center space-x-2">
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </Button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((stat, index) => (
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
                  <div className={`text-sm font-medium px-2 py-1 rounded-full ${
                    stat.changeType === 'positive' ? 'text-green-600 bg-green-100' :
                    stat.changeType === 'negative' ? 'text-red-600 bg-red-100' :
                    'text-blue-600 bg-blue-100'
                  }`}>
                    {stat.change}
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-800 mb-1">{stat.value}</div>
                <div className="text-gray-600">{stat.title}</div>
              </CardBody>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Performance Over Time */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="shadow-xl border-2 border-blue-100">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
              <h3 className="text-xl font-bold text-gray-800 flex items-center">
                <BarChart3 className="w-6 h-6 mr-2 text-blue-600" />
                Performance Trends
              </h3>
            </CardHeader>
            <CardBody className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="averageScore"
                    stroke="#8B5CF6"
                    fill="#8B5CF6"
                    fillOpacity={0.3}
                    name="Average Score (%)"
                  />
                  <Area
                    type="monotone"
                    dataKey="competitions"
                    stroke="#06B6D4"
                    fill="#06B6D4"
                    fillOpacity={0.3}
                    name="Competitions"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </motion.div>

        {/* Category Performance */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="shadow-xl border-2 border-purple-100">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
              <h3 className="text-xl font-bold text-gray-800 flex items-center">
                <PieChart className="w-6 h-6 mr-2 text-purple-600" />
                Subject Distribution
              </h3>
            </CardHeader>
            <CardBody className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </motion.div>
      </div>

      {/* Detailed Analytics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card className="shadow-xl border-2 border-gray-100">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-purple-50">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                <Activity className="w-7 h-7 mr-3 text-purple-600" />
                Detailed Analytics
              </h3>
              <Button
                variant="ghost"
                onClick={() => setShowDetailedStats(!showDetailedStats)}
                className="text-purple-600"
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
                    {/* Progress Chart */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                        Score Progress (Last 30 Days)
                      </h4>
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={progressData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="day" />
                          <YAxis />
                          <Tooltip />
                          <Line
                            type="monotone"
                            dataKey="score"
                            stroke="#10B981"
                            strokeWidth={3}
                            dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                            name="Score (%)"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Competition Status Bar Chart */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                        Competition Status Distribution
                      </h4>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={competitionStatusData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="count" fill="#8884d8" name="Number of Competitions" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* User Performance Radar Chart */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <Activity className="w-5 h-5 mr-2 text-purple-600" />
                        Your Performance Radar
                      </h4>
                      <ResponsiveContainer width="100%" height={250}>
                        <RadarChart outerRadius={90} width={500} height={250} data={userPerformanceRadarData}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="subject" />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} />
                          <Radar name="Your Performance" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                          <Tooltip />
                          <Legend />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Achievements */}
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <Award className="w-5 h-5 mr-2 text-yellow-600" />
                        Recent Achievements
                      </h4>
                      <div className="space-y-3">
                        {[
                          { title: 'First Place Finish', description: 'Won your first competition', date: '2 days ago', color: 'from-yellow-400 to-orange-400' },
                          { title: 'Speed Demon', description: 'Completed quiz in under 5 minutes', date: '1 week ago', color: 'from-blue-400 to-cyan-400' },
                          { title: 'Perfect Score', description: 'Achieved 100% accuracy', date: '2 weeks ago', color: 'from-green-400 to-emerald-400' },
                          { title: 'Consistent Player', description: 'Played 10 competitions this month', date: '3 weeks ago', color: 'from-purple-400 to-indigo-400' }
                        ].map((achievement, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className={`w-10 h-10 bg-gradient-to-r ${achievement.color} rounded-full flex items-center justify-center`}>
                              <Award className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-gray-800">{achievement.title}</div>
                              <div className="text-sm text-gray-600">{achievement.description}</div>
                            </div>
                            <div className="text-xs text-gray-500">{achievement.date}</div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Detailed Stats Table */}
                  <div className="mt-8">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                      <BarChart3 className="w-5 h-5 mr-2 text-indigo-600" />
                      Performance Breakdown
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full border border-gray-200 rounded-lg">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Metric</th>
                            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">This Week</th>
                            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">This Month</th>
                            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">All Time</th>
                            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-600">Trend</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {[
                            { metric: 'Competitions Played', week: '3', month: '12', allTime: userStats?.total_competitions || 0, trend: '+15%' },
                            { metric: 'Average Score', week: '78%', month: '75%', allTime: `${userStats?.average_score?.toFixed(1) || 0}%`, trend: '+3%' },
                            { metric: 'Win Rate', week: '67%', month: '58%', allTime: userStats?.total_competitions ? `${((userStats.wins / userStats.total_competitions) * 100).toFixed(1)}%` : '0%', trend: '+9%' },
                            { metric: 'Points Earned', week: '450', month: '1,850', allTime: userStats?.total_points?.toLocaleString() || '0', trend: '+22%' }
                          ].map((row, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-4 py-3 font-medium text-gray-800">{row.metric}</td>
                              <td className="px-4 py-3 text-center text-gray-600">{row.week}</td>
                              <td className="px-4 py-3 text-center text-gray-600">{row.month}</td>
                              <td className="px-4 py-3 text-center font-semibold text-gray-800">{row.allTime}</td>
                              <td className="px-4 py-3 text-center">
                                <span className="text-green-600 font-medium">{row.trend}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </CardBody>
              </motion.div>
            )}
          </AnimatePresence>
        </Card>
      </motion.div>
    </div>
  );
};

export default CompetitionStats;