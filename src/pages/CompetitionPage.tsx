// src/pages/CompetitionPage.tsx
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
  Crown, Star, TrendingUp, Zap, Globe, Activity,
  Rocket, Shield, Award, Medal, Timer, Brain,
  Sparkles, ArrowRight, Play, Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
      description: 'See how you rank against players worldwide',
      color: 'from-yellow-500 to-orange-500'
    },
    {
      id: 'stats',
      label: 'My Statistics',
      icon: BarChart3,
      description: 'Detailed analytics of your performance',
      color: 'from-blue-500 to-indigo-500'
    },
    {
      id: 'management',
      label: 'My Competitions',
      icon: Settings,
      description: 'Manage competitions you\'ve created',
      color: 'from-purple-500 to-pink-500'
    }
  ];

  const quickStats = [
    {
      label: 'Global Rank',
      value: userStats?.best_rank ? `#${userStats.best_rank}` : 'Unranked',
      icon: Crown,
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700'
    },
    {
      label: 'Total Points',
      value: userStats?.total_points?.toLocaleString() || '0',
      icon: Star,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700'
    },
    {
      label: 'Win Rate',
      value: userStats?.total_competitions ? 
        `${((userStats.wins / userStats.total_competitions) * 100).toFixed(1)}%` : '0%',
      icon: Target,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700'
    },
    {
      label: 'Competitions',
      value: userStats?.total_competitions || 0,
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700'
    }
  ];

  const quickActions = [
    {
      title: 'Start Competing',
      description: 'Join or create competitions',
      icon: Rocket,
      action: () => navigate('/quiz'),
      color: 'from-blue-500 to-indigo-500',
      hoverColor: 'hover:from-blue-600 hover:to-indigo-600'
    },
    {
      title: 'Create Competition',
      description: 'Challenge friends and colleagues',
      icon: Plus,
      action: () => navigate('/preferences'),
      color: 'from-purple-500 to-pink-500',
      hoverColor: 'hover:from-purple-600 hover:to-pink-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-8">
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="relative w-20 h-20 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-3xl flex items-center justify-center mr-6 shadow-2xl"
            >
              <Trophy className="w-10 h-10 text-white" />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/50 to-indigo-400/50 rounded-3xl blur-xl animate-pulse" />
            </motion.div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-800 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                Competition Hub
              </h1>
              <p className="text-xl text-slate-600">Your gateway to competitive learning</p>
            </div>
          </div>
        </motion.div>

        {/* Quick Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8"
        >
          {quickStats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="group"
            >
              <Card className="h-full hover:shadow-xl transition-all duration-300 overflow-hidden border-0 shadow-lg">
                <div className={`h-1 bg-gradient-to-r ${stat.color}`} />
                <CardBody className="p-4 lg:p-6 relative">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-xl" />
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex-1">
                      <div className="text-2xl lg:text-3xl font-bold text-slate-800 mb-1">{stat.value}</div>
                      <div className="text-sm lg:text-base text-slate-600">{stat.label}</div>
                    </div>
                    <div className={`w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <stat.icon className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
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
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8"
        >
          {quickActions.map((action, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card className="overflow-hidden border-0 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer group"
                    onClick={action.action}>
                <CardBody className="p-6 lg:p-8 relative">
                  <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
                  <div className="flex items-center space-x-6 relative z-10">
                    <div className={`w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-r ${action.color} rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300`}>
                      <action.icon className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl lg:text-2xl font-bold text-slate-800 mb-2 group-hover:text-purple-600 transition-colors duration-300">
                        {action.title}
                      </h3>
                      <p className="text-slate-600 text-base lg:text-lg">{action.description}</p>
                    </div>
                    <ArrowRight className="w-6 h-6 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-2 transition-all duration-300" />
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-8"
        >
          <Card className="shadow-xl border-0 overflow-hidden">
            <CardBody className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-3">
                {tabs.map((tab, index) => (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`p-6 lg:p-8 text-left transition-all duration-300 relative overflow-hidden group ${
                      activeTab === tab.id
                        ? 'bg-gradient-to-br from-purple-50 to-indigo-50'
                        : 'hover:bg-slate-50'
                    }`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {activeTab === tab.id && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-500"
                        initial={false}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      />
                    )}
                    <div className="flex items-center space-x-4 relative z-10">
                      <div className={`w-12 h-12 lg:w-14 lg:h-14 rounded-xl flex items-center justify-center transition-all duration-300 ${
                        activeTab === tab.id
                          ? `bg-gradient-to-r ${tab.color} text-white shadow-lg`
                          : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200'
                      }`}>
                        <tab.icon className="w-6 h-6 lg:w-7 lg:h-7" />
                      </div>
                      <div className="flex-1">
                        <h3 className={`text-lg lg:text-xl font-semibold mb-1 transition-colors duration-300 ${
                          activeTab === tab.id ? 'text-purple-700' : 'text-slate-800 group-hover:text-purple-600'
                        }`}>
                          {tab.label}
                        </h3>
                        <p className="text-slate-600 text-sm lg:text-base">{tab.description}</p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'leaderboard' && <GlobalLeaderboard />}
            {activeTab === 'stats' && user && <CompetitionStats userId={user.id} />}
            {activeTab === 'management' && user && <CompetitionManagement userId={user.id} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CompetitionPage;
