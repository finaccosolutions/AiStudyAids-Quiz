import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Card, CardBody } from '../ui/Card';
import { 
  BookOpen, Crown, Hash, Users, Zap, Target, 
  Brain, Trophy, Sparkles, ArrowRight, Star,
  Clock, Award, TrendingUp
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
      icon: BookOpen,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-50 to-cyan-50',
      features: [
        'Instant feedback & explanations',
        'Adaptive difficulty levels',
        'Progress tracking',
        'Multiple question types'
      ],
      stats: '10M+ questions solved'
    },
    {
      id: 'create-competition',
      title: 'Create Competition',
      subtitle: 'Challenge your friends',
      description: 'Create custom competitions and invite friends to compete in real-time quizzes',
      icon: Crown,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'from-purple-50 to-pink-50',
      features: [
        'Invite friends via email',
        'Real-time leaderboards',
        'Custom quiz settings',
        'Live chat during quiz'
      ],
      stats: '500K+ competitions created'
    },
    {
      id: 'join-competition',
      title: 'Join Competition',
      subtitle: 'Enter with competition code',
      description: 'Join existing competitions using a 6-digit code shared by friends',
      icon: Hash,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'from-green-50 to-emerald-50',
      features: [
        'Quick join with code',
        'Compete with friends',
        'Real-time rankings',
        'Earn points & badges'
      ],
      stats: '2M+ players joined'
    },
    {
      id: 'random-match',
      title: 'Random Matchmaking',
      subtitle: 'Find opponents worldwide',
      description: 'Get matched with players globally based on your topic and skill level',
      icon: Zap,
      color: 'from-orange-500 to-red-500',
      bgColor: 'from-orange-50 to-red-50',
      features: [
        'Global matchmaking',
        'Skill-based matching',
        'Quick 5-minute games',
        'Climb the leaderboards'
      ],
      stats: '1M+ matches daily'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mr-4">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-800">Choose Your Quiz Experience</h1>
              <p className="text-xl text-gray-600 mt-2">Select how you want to learn and compete</p>
            </div>
          </div>
        </motion.div>

        {/* Mode Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {modes.map((mode, index) => (
            <motion.div
              key={mode.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onHoverStart={() => setHoveredMode(mode.id)}
              onHoverEnd={() => setHoveredMode(null)}
              className="group cursor-pointer"
              onClick={() => onSelectMode(mode.id as any)}
            >
              <Card className={`h-full overflow-hidden border-2 transition-all duration-300 transform ${
                hoveredMode === mode.id 
                  ? 'border-purple-300 shadow-2xl scale-[1.02]' 
                  : 'border-gray-200 shadow-lg hover:shadow-xl hover:scale-[1.01]'
              }`}>
                <div className={`h-2 bg-gradient-to-r ${mode.color}`} />
                
                <CardBody className="p-8">
                  <div className="flex items-start space-x-4 mb-6">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${mode.color} flex items-center justify-center transform transition-transform duration-300 ${
                      hoveredMode === mode.id ? 'scale-110 rotate-3' : ''
                    }`}>
                      <mode.icon className="w-8 h-8 text-white" />
                    </div>
                    
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-gray-800 mb-1">{mode.title}</h3>
                      <p className="text-purple-600 font-medium mb-3">{mode.subtitle}</p>
                      <p className="text-gray-600 leading-relaxed">{mode.description}</p>
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl bg-gradient-to-r ${mode.bgColor} border border-opacity-20 mb-6`}>
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                      <Star className="w-4 h-4 mr-2 text-yellow-500" />
                      Key Features
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {mode.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center space-x-2 text-sm">
                          <div className="w-1.5 h-1.5 bg-purple-500 rounded-full" />
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      {mode.stats}
                    </div>
                    
                    <Button
                      className={`bg-gradient-to-r ${mode.color} hover:opacity-90 transition-all duration-300 transform ${
                        hoveredMode === mode.id ? 'scale-105' : ''
                      }`}
                    >
                      Get Started
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
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
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-xl border border-purple-100 p-8"
        >
          <h3 className="text-2xl font-bold text-center text-gray-800 mb-8">
            Join the Learning Revolution
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-800 mb-2">5M+</div>
              <div className="text-gray-600">Active Learners</div>
            </div>
            
            <div>
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-800 mb-2">1M+</div>
              <div className="text-gray-600">Competitions</div>
            </div>
            
            <div>
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-800 mb-2">50M+</div>
              <div className="text-gray-600">Questions Solved</div>
            </div>
            
            <div>
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-white" />
              </div>
              <div className="text-3xl font-bold text-gray-800 mb-2">95%</div>
              <div className="text-gray-600">Success Rate</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default QuizModeSelector;