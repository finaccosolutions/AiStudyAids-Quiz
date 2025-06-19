import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Card, CardBody } from '../ui/Card';
import { 
  BookOpen, Crown, Hash, Users, Zap, Target, 
  Brain, Trophy, Sparkles, ArrowRight, Star,
  Clock, Award, TrendingUp, Play, Gamepad2
} from 'lucide-react';
import { motion } from 'framer-motion';

interface QuizModeSelectorProps {
  onSelectMode: (mode: 'solo' | 'create-competition' | 'join-competition' | 'random-match') => void;
}

const QuizModeSelector: React.FC<QuizModeSelectorProps> = ({ onSelectMode }) => {
  const [hoveredMode, setHoveredMode] = useState<string | null>(null);

  const modes = [
    {
      id: 'solo',
      title: 'Solo Practice',
      subtitle: 'Learn at your own pace',
      description: 'Practice with AI-generated questions, get instant feedback, and track your progress',
      icon: Brain,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-50 to-cyan-50',
      borderColor: 'border-blue-200',
      features: [
        'Instant feedback & explanations',
        'Adaptive difficulty levels',
        'Progress tracking',
        'Multiple question types'
      ],
      stats: '10M+ questions solved',
      badge: 'Most Popular'
    },
    {
      id: 'create-competition',
      title: 'Create Competition',
      subtitle: 'Challenge your friends',
      description: 'Create custom competitions and invite friends to compete in real-time quizzes',
      icon: Crown,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'from-purple-50 to-pink-50',
      borderColor: 'border-purple-200',
      features: [
        'Invite friends via email',
        'Real-time leaderboards',
        'Custom quiz settings',
        'Live chat during quiz'
      ],
      stats: '500K+ competitions created',
      badge: 'Team Play'
    },
    {
      id: 'join-competition',
      title: 'Join Competition',
      subtitle: 'Enter with competition code',
      description: 'Join existing competitions using a 6-digit code shared by friends',
      icon: Hash,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'from-green-50 to-emerald-50',
      borderColor: 'border-green-200',
      features: [
        'Quick join with code',
        'Compete with friends',
        'Real-time rankings',
        'Earn points & badges'
      ],
      stats: '2M+ players joined',
      badge: 'Quick Join'
    },
    {
      id: 'random-match',
      title: 'Random Matchmaking',
      subtitle: 'Find opponents worldwide',
      description: 'Get matched with players globally based on your topic and skill level',
      icon: Zap,
      color: 'from-orange-500 to-red-500',
      bgColor: 'from-orange-50 to-red-50',
      borderColor: 'border-orange-200',
      features: [
        'Global matchmaking',
        'Skill-based matching',
        'Quick 5-minute games',
        'Climb the leaderboards'
      ],
      stats: '1M+ matches daily',
      badge: 'Global Play'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center mb-8">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="w-20 h-20 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mr-6 shadow-2xl"
            >
              <Gamepad2 className="w-10 h-10 text-white" />
            </motion.div>
            <div>
              <h1 className="text-5xl font-bold text-gray-800 mb-2">Choose Your Quiz Mode</h1>
              <p className="text-xl text-gray-600">Select how you want to learn and compete</p>
            </div>
          </div>
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
                  ? `${mode.borderColor} shadow-2xl scale-[1.02] ring-4 ring-opacity-20` 
                  : 'border-gray-200 shadow-lg hover:shadow-xl hover:scale-[1.01]'
              }`}>
                {/* Badge */}
                <div className="relative">
                  <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${mode.color} shadow-lg z-10`}>
                    {mode.badge}
                  </div>
                  
                  {/* Gradient Header */}
                  <div className={`h-3 bg-gradient-to-r ${mode.color}`} />
                </div>
                
                <CardBody className="p-8 relative overflow-hidden">
                  {/* Background Pattern */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${mode.bgColor} opacity-30 group-hover:opacity-50 transition-opacity duration-500`} />
                  
                  <div className="relative z-10">
                    {/* Icon and Title */}
                    <div className="flex items-start space-x-6 mb-6">
                      <motion.div
                        animate={hoveredMode === mode.id ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`w-20 h-20 rounded-2xl bg-gradient-to-r ${mode.color} flex items-center justify-center shadow-xl`}
                      >
                        <mode.icon className="w-10 h-10 text-white" />
                      </motion.div>
                      
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-800 mb-2 group-hover:text-purple-600 transition-colors">
                          {mode.title}
                        </h3>
                        <p className="text-purple-600 font-semibold mb-3">{mode.subtitle}</p>
                        <p className="text-gray-600 leading-relaxed">{mode.description}</p>
                      </div>
                    </div>

                    {/* Features */}
                    <div className={`p-5 rounded-xl bg-gradient-to-r ${mode.bgColor} border ${mode.borderColor} mb-6`}>
                      <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                        <Star className="w-4 h-4 mr-2 text-yellow-500" />
                        Key Features
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {mode.features.map((feature, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 + idx * 0.05 }}
                            className="flex items-center space-x-2 text-sm"
                          >
                            <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex-shrink-0" />
                            <span className="text-gray-700">{feature}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Stats and Action */}
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500 flex items-center">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        {mode.stats}
                      </div>
                      
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          className={`bg-gradient-to-r ${mode.color} hover:opacity-90 transition-all duration-300 shadow-lg px-6 py-3 font-semibold`}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Start Now
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-3xl shadow-2xl border border-purple-100 p-8 relative overflow-hidden"
        >
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full blur-3xl opacity-30 -translate-y-32 translate-x-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-100 to-cyan-100 rounded-full blur-3xl opacity-30 translate-y-24 -translate-x-24" />
          
          <div className="relative z-10">
            <h3 className="text-3xl font-bold text-center text-gray-800 mb-12">
              Join the Learning Revolution
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              {[
                { icon: Users, value: '5M+', label: 'Active Learners', color: 'from-blue-500 to-indigo-500' },
                { icon: Trophy, value: '1M+', label: 'Competitions', color: 'from-purple-500 to-pink-500' },
                { icon: Target, value: '50M+', label: 'Questions Solved', color: 'from-green-500 to-emerald-500' },
                { icon: Award, value: '95%', label: 'Success Rate', color: 'from-orange-500 to-red-500' }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + index * 0.1 }}
                  className="group"
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className={`w-20 h-20 bg-gradient-to-r ${stat.color} rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl group-hover:shadow-2xl transition-shadow duration-300`}
                  >
                    <stat.icon className="w-10 h-10 text-white" />
                  </motion.div>
                  <div className="text-4xl font-bold text-gray-800 mb-2">{stat.value}</div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
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