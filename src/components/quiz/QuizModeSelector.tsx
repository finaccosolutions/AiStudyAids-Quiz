import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Card, CardBody } from '../ui/Card';
import { BookOpen, Crown, Hash, Users, Zap, Target, Brain, Trophy, Sparkles, ArrowRight, Star, Clock, Award, TrendingUp, Play, Gamepad2, Rocket, Shield, Globe, CloudLightning as Lightning, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

interface QuizModeSelectorProps {
  onSelectMode: (mode: 'solo' | 'create-competition' | 'join-competition' | 'random-match') => void;
  onShowCompetitionManagement?: () => void;
}

const QuizModeSelector: React.FC<QuizModeSelectorProps> = ({ onSelectMode, onShowCompetitionManagement }) => {
  const [hoveredMode, setHoveredMode] = useState<string | null>(null);

  const modes = [
    {
      id: 'solo',
      title: 'Solo Practice',
      subtitle: 'Master your skills',
      description: 'Practice with AI-generated questions, get instant feedback, and track your progress',
      icon: Brain,
      gradient: 'from-blue-500 via-blue-600 to-indigo-600',
      bgGradient: 'from-blue-50 via-indigo-50 to-purple-50',
      borderColor: 'border-blue-200',
      shadowColor: 'shadow-blue-500/20',
      features: [
        'Instant AI feedback',
        'Adaptive difficulty',
        'Progress tracking',
        'Multiple formats'
      ],
      stats: '10M+ questions solved',
      badge: 'Most Popular',
      badgeColor: 'bg-blue-500'
    },
    {
      id: 'create-competition',
      title: 'Create Competition',
      subtitle: 'Challenge friends',
      description: 'Create custom competitions and invite friends to compete in real-time quizzes',
      icon: Crown,
      gradient: 'from-purple-500 via-pink-500 to-rose-500',
      bgGradient: 'from-purple-50 via-pink-50 to-rose-50',
      borderColor: 'border-purple-200',
      shadowColor: 'shadow-purple-500/20',
      features: [
        'Invite via email',
        'Real-time leaderboard',
        'Custom settings',
        'Live chat'
      ],
      stats: '500K+ competitions',
      badge: 'Team Play',
      badgeColor: 'bg-purple-500'
    },
    {
      id: 'join-competition',
      title: 'Join Competition',
      subtitle: 'Enter with code',
      description: 'Join existing competitions using a 6-digit code shared by friends',
      icon: Hash,
      gradient: 'from-green-500 via-emerald-500 to-teal-500',
      bgGradient: 'from-green-50 via-emerald-50 to-teal-50',
      borderColor: 'border-green-200',
      shadowColor: 'shadow-green-500/20',
      features: [
        'Quick join with code',
        'Compete globally',
        'Real-time rankings',
        'Earn achievements'
      ],
      stats: '2M+ players joined',
      badge: 'Quick Join',
      badgeColor: 'bg-green-500'
    },
    {
      id: 'random-match',
      title: 'Random Matchmaking',
      subtitle: 'Find opponents',
      description: 'Get matched with players globally based on your topic and skill level',
      icon: Zap,
      gradient: 'from-orange-500 via-red-500 to-pink-500',
      bgGradient: 'from-orange-50 via-red-50 to-pink-50',
      borderColor: 'border-orange-200',
      shadowColor: 'shadow-orange-500/20',
      features: [
        'Global matchmaking',
        'Skill-based pairing',
        'Quick 5-min games',
        'Climb leaderboards'
      ],
      stats: '1M+ matches daily',
      badge: 'Global Play',
      badgeColor: 'bg-orange-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-20 -right-20 w-60 h-60 bg-gradient-to-r from-pink-400/20 to-red-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-r from-green-400/20 to-teal-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-r from-indigo-400/10 to-purple-400/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center mb-8">
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 4, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="relative w-24 h-24 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mr-6 shadow-2xl"
            >
              <Gamepad2 className="w-12 h-12 text-white" />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/50 to-purple-400/50 rounded-3xl blur-xl animate-pulse" />
            </motion.div>
            <div>
              <h1 className="text-6xl font-bold bg-gradient-to-r from-slate-800 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Choose Your Quest
              </h1>
              <p className="text-2xl text-slate-600">Select your learning adventure</p>
            </div>
          </div>

          {/* Competition Management Button */}
          {onShowCompetitionManagement && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mb-8"
            >
              <Button
                onClick={onShowCompetitionManagement}
                variant="outline"
                className="border-2 border-purple-200 text-purple-600 hover:bg-purple-50 px-6 py-3 text-lg font-semibold shadow-lg"
              >
                <Settings className="w-5 h-5 mr-2" />
                Manage My Competitions
              </Button>
            </motion.div>
          )}
        </motion.div>

        {/* Mode Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
          {modes.map((mode, index) => (
            <motion.div
              key={mode.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15 }}
              onHoverStart={() => setHoveredMode(mode.id)}
              onHoverEnd={() => setHoveredMode(null)}
              className="group cursor-pointer"
              onClick={() => onSelectMode(mode.id as any)}
            >
              <Card className={`h-full overflow-hidden border-2 transition-all duration-500 transform ${
                hoveredMode === mode.id 
                  ? `${mode.borderColor} ${mode.shadowColor} shadow-2xl scale-[1.02] ring-4 ring-opacity-20` 
                  : 'border-slate-200 shadow-xl hover:shadow-2xl hover:scale-[1.01]'
              } bg-white/80 backdrop-blur-sm`}>
                {/* Gradient Header */}
                <div className={`h-2 bg-gradient-to-r ${mode.gradient}`} />
                
                {/* Badge */}
                <div className="relative">
                  <div className={`absolute top-6 right-6 px-3 py-1 rounded-full text-xs font-bold text-white ${mode.badgeColor} shadow-lg z-10`}>
                    {mode.badge}
                  </div>
                </div>
                
                <CardBody className="p-8 relative overflow-hidden">
                  {/* Background Pattern */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${mode.bgGradient} opacity-30 group-hover:opacity-50 transition-opacity duration-500`} />
                  
                  <div className="relative z-10">
                    {/* Icon and Title */}
                    <div className="flex items-start space-x-6 mb-8">
                      <motion.div
                        animate={hoveredMode === mode.id ? { 
                          scale: 1.1, 
                          rotate: 5,
                          y: -5
                        } : { 
                          scale: 1, 
                          rotate: 0,
                          y: 0
                        }}
                        transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
                        className={`w-20 h-20 rounded-2xl bg-gradient-to-r ${mode.gradient} flex items-center justify-center shadow-xl relative`}
                      >
                        <mode.icon className="w-10 h-10 text-white" />
                        <div className={`absolute inset-0 bg-gradient-to-r ${mode.gradient} opacity-50 rounded-2xl blur-lg animate-pulse`} />
                      </motion.div>
                      
                      <div className="flex-1">
                        <h3 className="text-3xl font-bold text-slate-800 mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-slate-800 group-hover:to-blue-600 transition-all duration-300">
                          {mode.title}
                        </h3>
                        <p className="text-lg font-semibold text-blue-600 mb-3">{mode.subtitle}</p>
                        <p className="text-slate-600 leading-relaxed text-lg">{mode.description}</p>
                      </div>
                    </div>

                    {/* Features Grid */}
                    <div className={`p-6 rounded-2xl bg-gradient-to-r ${mode.bgGradient} border ${mode.borderColor} mb-8 backdrop-blur-sm`}>
                      <h4 className="font-bold text-slate-800 mb-4 flex items-center text-lg">
                        <Star className="w-5 h-5 mr-2 text-yellow-500" />
                        Key Features
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        {mode.features.map((feature, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 + idx * 0.05 }}
                            className="flex items-center space-x-3"
                          >
                            <div className={`w-3 h-3 bg-gradient-to-r ${mode.gradient} rounded-full flex-shrink-0 shadow-sm`} />
                            <span className="text-slate-700 font-medium">{feature}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Stats and Action */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-slate-500">
                        <TrendingUp className="w-5 h-5" />
                        <span className="font-semibold">{mode.stats}</span>
                      </div>
                      
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          className={`bg-gradient-to-r ${mode.gradient} hover:opacity-90 transition-all duration-300 shadow-xl px-8 py-4 text-lg font-bold relative overflow-hidden group`}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                          <div className="relative flex items-center">
                            <Rocket className="w-5 h-5 mr-2" />
                            Start Now
                            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                          </div>
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Enhanced Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200 p-8 relative overflow-hidden"
        >
          {/* Background decorations */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100/50 to-purple-100/50 rounded-full blur-3xl opacity-50 -translate-y-32 translate-x-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-green-100/50 to-teal-100/50 rounded-full blur-3xl opacity-50 translate-y-24 -translate-x-24" />
          
          <div className="relative z-10">
            <h3 className="text-4xl font-bold text-center text-slate-800 mb-12 bg-gradient-to-r from-slate-800 to-blue-600 bg-clip-text text-transparent">
              Join the Learning Revolution
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              {[
                { icon: Users, value: '5M+', label: 'Active Learners', gradient: 'from-blue-500 to-indigo-500' },
                { icon: Trophy, value: '1M+', label: 'Competitions', gradient: 'from-purple-500 to-pink-500' },
                { icon: Target, value: '50M+', label: 'Questions Solved', gradient: 'from-green-500 to-emerald-500' },
                { icon: Award, value: '95%', label: 'Success Rate', gradient: 'from-orange-500 to-red-500' }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + index * 0.1 }}
                  className="group"
                >
                  <motion.div
                    whileHover={{ 
                      scale: 1.1, 
                      rotate: 5,
                      y: -5
                    }}
                    className={`w-24 h-24 bg-gradient-to-r ${stat.gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl group-hover:shadow-3xl transition-all duration-300 relative`}
                  >
                    <stat.icon className="w-12 h-12 text-white" />
                    <div className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} opacity-50 rounded-2xl blur-xl animate-pulse`} />
                  </motion.div>
                  <div className="text-5xl font-bold text-slate-800 mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-slate-800 group-hover:to-blue-600 transition-all duration-300">
                    {stat.value}
                  </div>
                  <div className="text-slate-600 font-semibold text-lg">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default QuizModeSelector;