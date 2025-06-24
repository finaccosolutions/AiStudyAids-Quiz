import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from '../components/ui/Button';
import { 
  Brain, GraduationCap, 
  FileQuestion, PenTool, BookOpen, Calendar, 
  LineChart, Rocket, Target,
  Award, Users, Zap, CheckCircle, Star,
  ArrowRight, Sparkles, TrendingUp, Shield,
  Clock, Globe, Heart, ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';

const HomePage: React.FC = () => {
  const { isLoggedIn } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleGetStarted = () => {
    if (isLoggedIn) {
      navigate('/quiz');
    } else {
      navigate('/auth', { state: { from: location } });
    }
  };

  const studyAids = [
    {
      title: 'AI Quiz',
      description: 'Generate personalized quizzes with intelligent question generation and adaptive difficulty.',
      icon: Brain,
      path: '/quiz',
      color: 'from-violet-500 to-purple-500',
      bgColor: 'from-violet-50 to-purple-50',
      borderColor: 'border-violet-200',
      textColor: 'text-violet-700',
      iconBg: 'bg-violet-500',
      stats: '10M+ questions',
      badge: 'Most Popular'
    },
    {
      title: 'Question Bank',
      description: 'Generate comprehensive question banks from text or PDFs with intelligent analysis.',
      icon: FileQuestion,
      path: '/question-bank',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'from-blue-50 to-cyan-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-700',
      iconBg: 'bg-blue-500',
      stats: '500K+ banks',
      badge: 'AI Powered'
    },
    {
      title: 'Answer Evaluation',
      description: 'Get detailed feedback on your written answers using advanced AI analysis.',
      icon: PenTool,
      path: '/answer-evaluation',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'from-green-50 to-emerald-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-700',
      iconBg: 'bg-green-500',
      stats: '95% accuracy',
      badge: 'Smart Feedback'
    },
    {
      title: 'Smart Notes',
      description: 'Generate summaries, mind maps, and interactive study materials.',
      icon: BookOpen,
      path: '/notes',
      color: 'from-purple-500 to-indigo-500',
      bgColor: 'from-purple-50 to-indigo-50',
      borderColor: 'border-purple-200',
      textColor: 'text-purple-700',
      iconBg: 'bg-purple-500',
      stats: '1M+ notes',
      badge: 'Interactive'
    },
    {
      title: 'Study Planner',
      description: 'Create personalized study schedules optimized for your learning goals.',
      icon: Calendar,
      path: '/study-plan',
      color: 'from-orange-500 to-amber-500',
      bgColor: 'from-orange-50 to-amber-50',
      borderColor: 'border-orange-200',
      textColor: 'text-orange-700',
      iconBg: 'bg-orange-500',
      stats: '80% success',
      badge: 'Optimized'
    },
    {
      title: 'Progress Tracker',
      description: 'Monitor your learning journey with detailed analytics and insights.',
      icon: LineChart,
      path: '/progress',
      color: 'from-rose-500 to-pink-500',
      bgColor: 'from-rose-50 to-pink-50',
      borderColor: 'border-rose-200',
      textColor: 'text-rose-700',
      iconBg: 'bg-rose-500',
      stats: 'Real-time',
      badge: 'Analytics'
    }
  ];

  const features = [
    {
      icon: Rocket,
      title: 'AI-Powered Learning',
      description: 'Advanced algorithms create personalized study paths tailored to your unique learning style and pace.',
      color: 'from-blue-500 to-indigo-500',
      bgColor: 'from-blue-50 to-indigo-50'
    },
    {
      icon: Target,
      title: 'Smart Assessment',
      description: 'Detailed feedback and performance analysis help you identify strengths and areas for improvement.',
      color: 'from-green-500 to-teal-500',
      bgColor: 'from-green-50 to-teal-50'
    },
    {
      icon: Award,
      title: 'Progress Tracking',
      description: 'Visual analytics and achievement milestones keep you motivated throughout your learning journey.',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'from-purple-50 to-pink-50'
    },
    {
      icon: Users,
      title: 'Personalized Experience',
      description: 'Adaptive technology that learns from your interactions to provide increasingly relevant content.',
      color: 'from-orange-500 to-red-500',
      bgColor: 'from-orange-50 to-red-50'
    }
  ];

  const stats = [
    { number: '10M+', label: 'Questions Solved', icon: Brain },
    { number: '500K+', label: 'Active Learners', icon: Users },
    { number: '95%', label: 'Success Rate', icon: TrendingUp },
    { number: '24/7', label: 'AI Support', icon: Shield }
  ];
  
  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-200/30 to-indigo-200/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-20 -right-20 w-60 h-60 bg-gradient-to-br from-blue-200/30 to-cyan-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-br from-green-200/30 to-emerald-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-5xl mx-auto relative mb-20"
        >
          <div className="flex justify-center mb-8 relative">
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
              className="relative"
            >
              <GraduationCap className="h-24 w-24 text-purple-600" />
              <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-2xl animate-pulse" />
            </motion.div>
          </div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight"
          >
            Your AI-Powered <br />
            <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Learning Companion
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="text-xl sm:text-2xl text-gray-700 mb-10 max-w-4xl mx-auto leading-relaxed font-medium"
          >
            Transform your learning experience with intelligent study tools. 
            Get personalized guidance, instant feedback, and comprehensive analytics.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            <Button
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 group"
            >
              <Zap className="w-6 h-6 mr-2 group-hover:animate-pulse" />
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            
            <Button
              variant="outline"
              onClick={() => navigate('/competitions')}
              className="border-2 border-purple-200 text-purple-700 hover:bg-purple-50 px-8 py-4 text-lg font-semibold hover:border-purple-300 transition-all duration-300"
            >
              <Trophy className="w-6 h-6 mr-2" />
              Explore Competitions
            </Button>
          </motion.div>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 + index * 0.1, duration: 0.5 }}
                className="text-center group"
              >
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl hover:scale-105 transition-all duration-300">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{stat.number}</div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Study Aids Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="w-full mb-20"
        >
          <div className="text-center mb-12">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Powerful Study Tools
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to excel in your studies, powered by advanced AI technology
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {studyAids.map((aid, index) => (
              <motion.div
                key={aid.path}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.4 + index * 0.1, duration: 0.6 }}
                whileHover={{ y: -8, scale: 1.02 }}
                className="group cursor-pointer"
                onClick={() => isLoggedIn ? navigate(aid.path) : navigate('/auth')}
              >
                <div className={`relative overflow-hidden rounded-3xl p-8 transition-all duration-500 bg-gradient-to-br ${aid.bgColor} border-2 ${aid.borderColor} shadow-lg hover:shadow-2xl backdrop-blur-sm`}>
                  {/* Badge */}
                  <div className="absolute top-4 right-4 z-10">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${aid.iconBg} shadow-lg`}>
                      {aid.badge}
                    </span>
                  </div>

                  {/* Background Pattern */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${aid.color} opacity-5 group-hover:opacity-10 transition-opacity duration-500`} />
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-16 -translate-y-16" />
                  
                  <div className="relative z-10">
                    <div className="flex items-start justify-between mb-6">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        className={`bg-gradient-to-br ${aid.color} p-4 rounded-2xl w-fit shadow-xl group-hover:shadow-2xl transition-all duration-300`}
                      >
                        <aid.icon className="h-8 w-8 text-white" />
                      </motion.div>
                      
                      <div className="text-right">
                        <div className={`text-sm font-bold ${aid.textColor} opacity-80`}>
                          {aid.stats}
                        </div>
                      </div>
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-4 text-gray-900 group-hover:text-purple-700 transition-colors duration-300">
                      {aid.title}
                    </h3>
                    
                    <p className="text-gray-700 leading-relaxed mb-6 group-hover:text-gray-800 transition-colors duration-300">
                      {aid.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-purple-600 font-semibold group-hover:text-purple-700 transition-colors duration-300">
                        Get Started
                      </span>
                      <ChevronRight className="w-5 h-5 text-purple-600 group-hover:translate-x-2 group-hover:text-purple-700 transition-all duration-300" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Features Section */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.8, duration: 0.8 }}
          className="w-full bg-gradient-to-br from-white/80 to-purple-50/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 py-20 px-8 mb-20 relative overflow-hidden"
        >
          {/* Background decorations */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-100/20 to-indigo-100/20 rounded-3xl" />
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-br from-blue-200/30 to-cyan-200/30 rounded-full blur-3xl" />

          <div className="relative z-10">
            <div className="text-center mb-16">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2, duration: 0.6 }}
                className="text-4xl sm:text-5xl font-bold mb-6 text-gray-900"
              >
                Why Choose QuizGenius?
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.2, duration: 0.6 }}
                className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed"
              >
                Experience the future of learning with our comprehensive suite of AI-powered tools
              </motion.p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2.4 + index * 0.1, duration: 0.6 }}
                  whileHover={{ y: -5, scale: 1.02 }}
                  className="group"
                >
                  <div className={`relative overflow-hidden rounded-2xl p-8 bg-gradient-to-br ${feature.bgColor} border border-white/50 shadow-lg hover:shadow-xl transition-all duration-300 h-full backdrop-blur-sm`}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
                    
                    <div className="relative z-10">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                        className={`bg-gradient-to-br ${feature.color} p-4 rounded-xl w-fit mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300`}
                      >
                        <feature.icon className="h-8 w-8 text-white" />
                      </motion.div>
                      
                      <h3 className="text-xl font-bold mb-4 text-gray-900 group-hover:text-purple-700 transition-colors duration-300">
                        {feature.title}
                      </h3>
                      
                      <p className="text-gray-700 leading-relaxed group-hover:text-gray-800 transition-colors duration-300">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.8, duration: 0.8 }}
          className="w-full max-w-6xl mx-auto mb-16"
        >
          <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 rounded-3xl shadow-2xl p-8 sm:p-16 text-white relative overflow-hidden">
            {/* Background effects */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 backdrop-blur-3xl" />
            <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute -left-10 -top-10 w-40 h-40 bg-purple-400/20 rounded-full blur-3xl" />
            <div className="absolute top-10 right-10 w-20 h-20 bg-white/5 rounded-full blur-2xl" />

            <div className="relative z-10 text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <Sparkles className="w-8 h-8 text-white" />
              </motion.div>
              
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                Ready to Transform Your Learning?
              </h2>
              
              <p className="text-purple-100 mb-8 max-w-2xl mx-auto text-lg sm:text-xl leading-relaxed">
                Join thousands of students who are already experiencing the power of AI-assisted learning.
                Start your journey today and unlock your full potential.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  onClick={handleGetStarted}
                  className="bg-white text-purple-700 hover:bg-purple-50 px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 group"
                >
                  <Rocket className="w-6 h-6 mr-2 group-hover:animate-bounce" />
                  Start Learning Now
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => navigate('/competitions')}
                  className="border-2 border-white/30 text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold backdrop-blur-sm transition-all duration-300"
                >
                  <Heart className="w-6 h-6 mr-2" />
                  Join Community
                </Button>
              </div>

              <div className="mt-8 flex items-center justify-center space-x-8 text-purple-200">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Free to start</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>No credit card</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Instant access</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HomePage;