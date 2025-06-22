import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useCompetitionStore } from '../store/useCompetitionStore';
import { useQuizStore } from '../store/useQuizStore';
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
  Sparkles, ArrowRight, Play, Plus, BookOpen,
  FileQuestion, PenTool, NotebookText, Calendar,
  LineChart, CheckCircle, Clock, Flame
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CompetitionPage: React.FC = () => {
  const { user, isLoggedIn } = useAuthStore();
  const { userStats, loadUserStats } = useCompetitionStore();
  const { preferences } = useQuizStore();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'leaderboard' | 'stats' | 'management'>('overview');

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
      id: 'overview',
      label: 'Quiz Hub',
      icon: Rocket,
      description: 'Your complete quiz and competition dashboard',
      color: 'from-blue-500 to-indigo-500'
    },
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

  const soloQuizActions = [
    {
      title: 'AI Quiz',
      description: 'Generate personalized quizzes with intelligent questions',
      icon: Brain,
      path: '/quiz',
      color: 'from-violet-500 to-purple-500',
      stats: preferences ? `${preferences.questionCount} questions` : 'Not configured'
    },
    {
      title: 'Question Bank',
      description: 'Generate comprehensive question banks from text or PDFs',
      icon: FileQuestion,
      path: '/question-bank',
      color: 'from-blue-500 to-cyan-500',
      stats: 'Coming soon'
    },
    {
      title: 'Answer Evaluation',
      description: 'Get detailed feedback on your written answers',
      icon: PenTool,
      path: '/answer-evaluation',
      color: 'from-green-500 to-emerald-500',
      stats: 'AI-powered'
    },
    {
      title: 'Smart Notes',
      description: 'Generate summaries and interactive study materials',
      icon: NotebookText,
      path: '/notes',
      color: 'from-purple-500 to-indigo-500',
      stats: 'Multiple formats'
    },
    {
      title: 'Study Planner',
      description: 'Create personalized study schedules',
      icon: Calendar,
      path: '/study-plan',
      color: 'from-orange-500 to-amber-500',
      stats: 'Optimized'
    },
    {
      title: 'Progress Tracker',
      description: 'Monitor your learning journey with analytics',
      icon: LineChart,
      path: '/progress',
      color: 'from-rose-500 to-pink-500',
      stats: 'Detailed insights'
    }
  ];

  const competitionActions = [
    {
      title: 'Create Competition',
      description: 'Challenge friends and colleagues',
      icon: Plus,
      action: () => navigate('/quiz'),
      color: 'from-purple-500 to-pink-500',
      stats: 'Invite friends'
    },
    {
      title: 'Join Competition',
      description: 'Enter with a 6-digit code',
      icon: Users,
      action: () => navigate('/quiz'),
      color: 'from-green-500 to-emerald-500',
      stats: 'Quick join'
    },
    {
      title: 'Random Match',
      description: 'Find opponents globally',
      icon: Zap,
      action: () => navigate('/quiz'),
      color: 'from-orange-500 to-red-500',
      stats: 'Global players'
    }
  ];

  const renderOverview = () => (
    <div className="space-y-8">
      {/* Solo Quiz Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="shadow-xl border-2 border-blue-100 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-800">Solo Learning</h3>
                <p className="text-slate-600">AI-powered study tools for individual learning</p>
              </div>
            </div>
          </CardHeader>
          <CardBody className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {soloQuizActions.map((action, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card className="h-full overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
                        onClick={() => navigate(action.path)}>
                    <CardBody className="p-6 relative">
                      <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-4">
                          <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                            <action.icon className="w-6 h-6 text-white" />
                          </div>
                          <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                            {action.stats}
                          </span>
                        </div>
                        <h4 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-purple-600 transition-colors duration-300">
                          {action.title}
                        </h4>
                        <p className="text-slate-600 text-sm leading-relaxed">{action.description}</p>
                      </div>
                    </CardBody>
                  </Card>
                </motion.div>
              ))}
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Competition Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="shadow-xl border-2 border-purple-100 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-800">Competitive Learning</h3>
                <p className="text-slate-600">Challenge others and climb the leaderboards</p>
              </div>
            </div>
          </CardHeader>
          <CardBody className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {competitionActions.map((action, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card className="h-full overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
                        onClick={action.action}>
                    <CardBody className="p-6 relative">
                      <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-4">
                          <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                            <action.icon className="w-6 h-6 text-white" />
                          </div>
                          <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                            {action.stats}
                          </span>
                        </div>
                        <h4 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-purple-600 transition-colors duration-300">
                          {action.title}
                        </h4>
                        <p className="text-slate-600 text-sm leading-relaxed">{action.description}</p>
                      </div>
                    </CardBody>
                  </Card>
                </motion.div>
              ))}
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="shadow-xl border-2 border-gray-100">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50">
            <h3 className="text-2xl font-bold text-slate-800 flex items-center">
              <Activity className="w-7 h-7 mr-3 text-slate-600" />
              Recent Activity
            </h3>
          </CardHeader>
          <CardBody className="p-6">
            <div className="space-y-4">
              {[
                { icon: CheckCircle, text: 'Completed Computer Science quiz', time: '2 hours ago', color: 'text-green-600' },
                { icon: Trophy, text: 'Won Mathematics competition', time: '1 day ago', color: 'text-yellow-600' },
                { icon: Clock, text: 'Started Physics study plan', time: '3 days ago', color: 'text-blue-600' },
                { icon: Flame, text: 'Achieved 7-day streak', time: '1 week ago', color: 'text-orange-600' }
              ].map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="flex items-center space-x-4 p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all duration-300"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-gray-100`}>
                    <activity.icon className={`w-5 h-5 ${activity.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{activity.text}</p>
                    <p className="text-sm text-gray-500">{activity.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );

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
                Quiz Hub
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
          <Card className="shadow-xl border-0 overflow-hidden">
            <CardBody className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-4">
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
            {activeTab === 'overview' && renderOverview()}
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
