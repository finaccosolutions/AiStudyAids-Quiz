// src/pages/CompetitionPage.tsx
import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useCompetitionStore } from '../store/useCompetitionStore';
import { useQuizStore } from '../store/useQuizStore';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import GlobalLeaderboard from '../components/competition/GlobalLeaderboard';
import CompetitionStats from '../components/competition/CompetitionStats';
import CompetitionManagement from '../components/competition/CompetitionManagement';
import QuizHistory from '../components/competition/QuizHistory';
import DashboardPanel from '../components/competition/DashboardPanel';
import SoloQuizPanel from '../components/competition/SoloQuizPanel';
import CompetitionPanel from '../components/competition/CompetitionPanel';
import RandomMatchPanel from '../components/competition/RandomMatchPanel';

import {
  Trophy, BarChart3, Settings, Users, Target,
  Crown, Star, TrendingUp, Zap, Globe, Activity,
  Rocket, Shield, Award, Medal, Timer, Brain,
  Sparkles, ArrowRight, Play, Plus, BookOpen,
  FileQuestion, PenTool, NotebookText, Calendar,
  LineChart, CheckCircle, Clock, Flame, Layers,
  Cpu, Database, Code, Palette, Briefcase, Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CompetitionPage: React.FC = () => {
  const { user, isLoggedIn } = useAuthStore();
  const {
    userStats,
    loadUserStats,
    loadUserActiveCompetitions,
    userActiveCompetitions,
    calculateOverallStats,
    overallStats,
    competitionResultsHistory,
    loadCompetitionResultsHistory,
    isLoading: competitionStoreLoading // Get isLoading from competition store
  } = useCompetitionStore();
  const { preferences, soloQuizHistory, loadSoloQuizHistory, isLoading: quizStoreLoading } = useQuizStore(); // Get isLoading from quiz store
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'solo-quizzes' | 'competitions' | 'random-matches' | 'global-leaderboard' | 'my-history'>('dashboard');
  const [historyFilter, setHistoryFilter] = useState<'all' | 'solo' | 'competition' | 'random'>('all');

  useEffect(() => {
    if (user) {
      console.log('CompetitionPage: Starting data load for user:', user.id);
      loadUserStats(user.id);
      loadUserActiveCompetitions(user.id);
      loadSoloQuizHistory(user.id);
      loadCompetitionResultsHistory(user.id);
      console.log('CompetitionPage: Data load initiated.');
    }
  }, [user, loadUserStats, loadUserActiveCompetitions, loadSoloQuizHistory, loadCompetitionResultsHistory]);

  useEffect(() => {
    if (userStats && soloQuizHistory && competitionResultsHistory) {
      calculateOverallStats(soloQuizHistory, competitionResultsHistory, userStats);
    }
    console.log('CompetitionPage: Current loading states:', {
      competitionStoreLoading,
      quizStoreLoading
    });
  }, [userStats, soloQuizHistory, competitionResultsHistory, calculateOverallStats, competitionStoreLoading, quizStoreLoading]);


  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
    if (location.state?.historyFilter) {
      setHistoryFilter(location.state.historyFilter);
    }
  }, [location.state]);

  if (!isLoggedIn) {
    return <Navigate to="/auth" />;
  }


  const tabs = [
    {
      id: 'dashboard',
      label: 'Quiz Hub',
      icon: Rocket,
      description: 'Your complete quiz and competition dashboard',
      mainGradient: 'from-blue-500 to-indigo-600',
      iconBgGradient: 'from-blue-400 to-indigo-500',
      activeBg: 'bg-gradient-to-br from-blue-50 to-indigo-50',
      hoverBg: 'hover:bg-blue-50',
      borderColor: 'border-blue-200',
      activeBorderColor: 'border-blue-500',
      labelColor: 'text-slate-800',
      descriptionColor: 'text-slate-600',
      activeLabelColor: 'text-blue-700',
      activeDescriptionColor: 'text-blue-600',
      iconColor: 'text-slate-800', // Changed from text-white
      iconSize: 'w-6 h-6 lg:w-7 lg:h-7', // Adjusted size
      iconContainerSize: 'w-12 h-12 lg:w-14 lg:h-14', // Adjusted size
      labelSize: 'text-lg lg:text-xl', // Adjusted size
      descriptionSize: 'text-xs lg:text-sm', // Adjusted size
      padding: 'p-4 lg:p-6',
      borderRadius: 'rounded-xl',
      hoverScale: 'scale-105',
      hoverShadow: 'shadow-xl',
      pattern: 'bg-gradient-to-br from-blue-100/50 to-indigo-100/30',
    },
    {
      id: 'solo-quizzes',
      label: 'Solo Quizzes',
      icon: Brain,
      description: 'Practice with AI-generated questions',
      mainGradient: 'from-violet-500 to-purple-500',
      iconBgGradient: 'from-violet-400 to-purple-500',
      activeBg: 'bg-gradient-to-br from-violet-50 to-purple-50',
      hoverBg: 'hover:bg-violet-50',
      borderColor: 'border-purple-200',
      activeBorderColor: 'border-purple-500',
      labelColor: 'text-slate-800',
      descriptionColor: 'text-slate-600',
      activeLabelColor: 'text-purple-700',
      activeDescriptionColor: 'text-purple-600',
      iconColor: 'text-slate-800', // Changed from text-white
      iconSize: 'w-6 h-6 lg:w-7 lg:h-7', // Adjusted size
      iconContainerSize: 'w-12 h-12 lg:w-14 lg:h-14', // Adjusted size
      labelSize: 'text-lg lg:text-xl', // Adjusted size
      descriptionSize: 'text-xs lg:text-sm', // Adjusted size
      padding: 'p-4 lg:p-6',
      borderRadius: 'rounded-xl',
      hoverScale: 'scale-105',
      hoverShadow: 'shadow-xl',
      pattern: 'bg-gradient-to-br from-violet-100/50 to-purple-100/30',
    },
    {
      id: 'competitions',
      label: 'Competitions',
      icon: Trophy,
      description: 'Manage and participate in competitions',
      mainGradient: 'from-green-500 to-emerald-500',
      iconBgGradient: 'from-green-400 to-emerald-500',
      activeBg: 'bg-gradient-to-br from-green-50 to-emerald-50',
      hoverBg: 'hover:bg-green-50',
      borderColor: 'border-green-200',
      activeBorderColor: 'border-green-500',
      labelColor: 'text-slate-800',
      descriptionColor: 'text-slate-600',
      activeLabelColor: 'text-green-700',
      activeDescriptionColor: 'text-green-600',
      iconColor: 'text-slate-800', // Changed from text-white
      iconSize: 'w-6 h-6 lg:w-7 lg:h-7', // Adjusted size
      iconContainerSize: 'w-12 h-12 lg:w-14 lg:h-14', // Adjusted size
      labelSize: 'text-lg lg:text-xl', // Adjusted size
      descriptionSize: 'text-xs lg:text-sm', // Adjusted size
      padding: 'p-4 lg:p-6',
      borderRadius: 'rounded-xl',
      hoverScale: 'scale-105',
      hoverShadow: 'shadow-xl',
      pattern: 'bg-gradient-to-br from-green-100/50 to-emerald-100/30',
    },
    {
      id: 'random-matches',
      label: 'Random Matches',
      icon: Zap,
      description: 'Find opponents globally for quick battles',
      mainGradient: 'from-orange-500 to-red-500',
      iconBgGradient: 'from-orange-400 to-red-500',
      activeBg: 'bg-gradient-to-br from-orange-50 to-red-50',
      hoverBg: 'hover:bg-orange-50',
      borderColor: 'border-orange-200',
      activeBorderColor: 'border-orange-500',
      labelColor: 'text-slate-800',
      descriptionColor: 'text-slate-600',
      activeLabelColor: 'text-orange-700',
      activeDescriptionColor: 'text-orange-600',
      iconColor: 'text-slate-800', // Changed from text-white
      iconSize: 'w-6 h-6 lg:w-7 lg:h-7', // Adjusted size
      iconContainerSize: 'w-12 h-12 lg:w-14 lg:h-14', // Adjusted size
      labelSize: 'text-lg lg:text-xl', // Adjusted size
      descriptionSize: 'text-xs lg:text-sm', // Adjusted size
      padding: 'p-4 lg:p-6',
      borderRadius: 'rounded-xl',
      hoverScale: 'scale-105',
      hoverShadow: 'shadow-xl',
      pattern: 'bg-gradient-to-br from-orange-100/50 to-red-100/30',
    },
    {
      id: 'global-leaderboard',
      label: 'Global Leaderboard',
      icon: Globe,
      description: 'See how you rank against players worldwide',
      mainGradient: 'from-yellow-500 to-orange-500',
      iconBgGradient: 'from-yellow-400 to-orange-500',
      activeBg: 'bg-gradient-to-br from-yellow-50 to-orange-50',
      hoverBg: 'hover:bg-yellow-50',
      borderColor: 'border-yellow-200',
      activeBorderColor: 'border-yellow-500',
      labelColor: 'text-slate-800',
      descriptionColor: 'text-slate-600',
      activeLabelColor: 'text-yellow-700',
      activeDescriptionColor: 'text-yellow-600',
      iconColor: 'text-slate-800', // Changed from text-white
      iconSize: 'w-6 h-6 lg:w-7 lg:h-7', // Adjusted size
      iconContainerSize: 'w-12 h-12 lg:w-14 lg:h-14', // Adjusted size
      labelSize: 'text-lg lg:text-xl', // Adjusted size
      descriptionSize: 'text-xs lg:text-sm', // Adjusted size
      padding: 'p-4 lg:p-6',
      borderRadius: 'rounded-xl',
      hoverScale: 'scale-105',
      hoverShadow: 'shadow-xl',
      pattern: 'bg-gradient-to-br from-yellow-100/50 to-orange-100/30',
    }
  ];

  const quickStats = [
    {
      label: 'Global Rank',
      value: overallStats?.bestOverallRank ? `#${overallStats.bestOverallRank}` : 'Unranked',
      icon: Crown,
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700'
    },
    {
      label: 'Total Points',
      value: overallStats?.overallPoints?.toLocaleString() || '0',
      icon: Star,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-700'
    },
    {
      label: 'Win Rate',
      value: overallStats?.overallWinRate ? `${overallStats.overallWinRate}%` : '0%',
      icon: Target,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700'
    },
    {
      label: 'Total Quizzes',
      value: overallStats?.totalQuizzesPlayed || 0,
      icon: Users,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700'
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
              <Rocket className="w-10 h-10 text-white" />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/50 to-indigo-400/50 rounded-3xl blur-xl animate-pulse" />
            </motion.div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-800 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                Quiz Dashboard
              </h1>
              <p className="text-xl text-slate-600">Your complete learning and competition center</p>
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

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mb-8"
        >
          {/* Removed Card and CardBody wrappers */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 p-4"> {/* Added gap and padding */}
            {tabs.map((tab, index) => (
              <motion.button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative flex flex-col items-center text-center ${tab.padding} ${tab.borderRadius} transition-all duration-300 group overflow-hidden
                  ${activeTab === tab.id ? `${tab.activeBg} border-2 ${tab.activeBorderColor} shadow-lg` : `bg-white border-2 ${tab.borderColor} ${tab.hoverBg} ${tab.hoverScale} ${tab.hoverShadow}`}
                `}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Background Pattern */}
                <div className={`absolute inset-0 ${tab.pattern} opacity-50 group-hover:opacity-70 transition-opacity duration-500`} />
                
                {/* Active Tab Indicator */}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className={`absolute inset-0 border-2 ${tab.activeBorderColor} ${tab.borderRadius} z-0`}
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}

                <div className={`relative z-10 ${tab.iconContainerSize} ${tab.iconBgGradient} ${tab.borderRadius} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <tab.icon className={`${tab.iconSize} ${tab.iconColor} relative z-20`} />
                </div>
                <h3 className={`relative z-10 font-semibold mb-1 ${tab.labelSize} ${activeTab === tab.id ? tab.activeLabelColor : tab.labelColor} transition-colors duration-300`}>
                  {tab.label}
                </h3>
                <p className={`relative z-10 ${tab.descriptionSize} ${activeTab === tab.id ? tab.activeDescriptionColor : tab.descriptionColor} transition-colors duration-300`}>
                  {tab.description}
                </p>
              </motion.button>
            ))}
          </div>
          {/* End Removed Card and CardBody wrappers */}
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
            {activeTab === 'dashboard' && user && (
              <DashboardPanel
                userId={user.id}
              />
            )}
            {activeTab === 'solo-quizzes' && user && (
              <SoloQuizPanel userId={user.id} />
            )}
            {activeTab === 'competitions' && user && (
              <CompetitionPanel userId={user.id} />
            )}
            {activeTab === 'random-matches' && user && (
              <RandomMatchPanel userId={user.id} />
            )}
            {activeTab === 'global-leaderboard' && <GlobalLeaderboard />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CompetitionPage;