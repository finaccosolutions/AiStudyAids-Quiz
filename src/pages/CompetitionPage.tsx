import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useCompetitionStore } from '../store/useCompetitionStore';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import GlobalLeaderboard from '../components/competition/GlobalLeaderboard';
import CompetitionStats from '../components/competition/CompetitionStats';
import CompetitionManagement from '../components/competition/CompetitionManagement';
import { 
  Trophy, BarChart3, Settings, Users, Target, 
  Crown, Star, TrendingUp, Zap, Globe, Activity
} from 'lucide-react';
import { motion } from 'framer-motion';

const CompetitionPage: React.FC = () => {
  const { user, isLoggedIn } = useAuthStore();
  const { userStats, loadUserStats } = useCompetitionStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'stats' | 'management'>('leaderboard');

  useEffect(() => {
    if (user) {
      loadUserStats(user.id);
    }
  }, [user]);

  if (!isLoggedIn) {
    return <Navigate to="/auth" />;
  }

  const tabs = [
    {
      id: 'leaderboard',
      label: 'Global Leaderboard',
      icon: Trophy,
      description: 'See how you rank against players worldwide'
    },
    {
      id: 'stats',
      label: 'My Statistics',
      icon: BarChart3,
      description: 'Detailed analytics of your performance'
    },
    {
      id: 'management',
      label: 'My Competitions',
      icon: Settings,
      description: 'Manage competitions you\'ve created'
    }
  ];

  const quickStats = [
    {
      label: 'Global Rank',
      value: userStats?.best_rank ? `#${userStats.best_rank}` : 'Unranked',
      icon: Crown,
      color: 'from-yellow-500 to-orange-500'
    },
    {
      label: 'Total Points',
      value: userStats?.total_points?.toLocaleString() || '0',
      icon: Star,
      color: 'from-purple-500 to-pink-500'
    },
    {
      label: 'Win Rate',
      value: userStats?.total_competitions ? 
        `${((userStats.wins / userStats.total_competitions) * 100).toFixed(1)}%` : '0%',
      icon: Target,
      color: 'from-green-500 to-emerald-500'
    },
    {
      label: 'Competitions',
      value: userStats?.total_competitions || 0,
      icon: Users,
      color: 'from-blue-500 to-cyan-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
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
              className="w-20 h-20 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mr-6 shadow-2xl relative"
            >
              <Trophy className="w-10 h-10 text-white" />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/50 to-indigo-400/50 rounded-full blur-xl animate-pulse" />
            </motion.div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                Competition Hub
              </h1>
              <p className="text-xl text-gray-600">Your gateway to competitive learning</p>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          {quickStats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              <Card className="hover:shadow-xl transition-all duration-300 overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${stat.color}`} />
                <CardBody className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-gray-800">{stat.value}</div>
                      <div className="text-gray-600">{stat.label}</div>
                    </div>
                    <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <Card className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0 shadow-2xl">
            <CardBody className="p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="mb-4 md:mb-0">
                  <h3 className="text-2xl font-bold mb-2">Ready to Compete?</h3>
                  <p className="text-indigo-100">
                    Join a competition or create your own to challenge friends and climb the leaderboard!
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => navigate('/quiz')}
                    className="bg-white text-indigo-600 hover:bg-indigo-50 font-semibold px-6 py-3"
                  >
                    <Zap className="w-5 h-5 mr-2" />
                    Start Competing
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/preferences')}
                    className="border-white text-white hover:bg-white hover:text-indigo-600 font-semibold px-6 py-3"
                  >
                    <Settings className="w-5 h-5 mr-2" />
                    Create Competition
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-8"
        >
          <Card className="shadow-lg border-2 border-gray-100">
            <CardBody className="p-0">
              <div className="flex flex-col md:flex-row">
                {tabs.map((tab) => (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 p-6 text-left transition-all duration-300 ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-r from-purple-50 to-indigo-50 border-b-4 border-purple-500'
                        : 'hover:bg-gray-50'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        activeTab === tab.id
                          ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        <tab.icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className={`text-lg font-semibold ${
                          activeTab === tab.id ? 'text-purple-700' : 'text-gray-800'
                        }`}>
                          {tab.label}
                        </h3>
                        <p className="text-gray-600 text-sm">{tab.description}</p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'leaderboard' && <GlobalLeaderboard />}
          {activeTab === 'stats' && user && <CompetitionStats userId={user.id} />}
          {activeTab === 'management' && user && <CompetitionManagement userId={user.id} />}
        </motion.div>
      </div>
    </div>
  );
};

export default CompetitionPage;