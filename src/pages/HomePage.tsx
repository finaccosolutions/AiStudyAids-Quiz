import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from '../components/ui/Button';
import { 
  Brain, GraduationCap, 
  FileQuestion, PenTool, BookOpen, Calendar, 
  LineChart, Rocket, Target,
  Award, Users, Zap, CheckCircle, Star,
  TrendingUp, Shield, Globe, Sparkles,
  ArrowRight, Play, Trophy, Clock,
  Lightbulb, BarChart3, Activity
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
      color: 'from-violet-500 to-purple-600',
      hoverEffect: 'hover:shadow-violet-200',
      stats: '10M+ questions',
      badge: 'Most Popular',
      badgeColor: 'bg-violet-500'
    },
    {
      title: 'Question Bank',
      description: 'Generate comprehensive question banks from text or PDFs with intelligent analysis.',
      icon: FileQuestion,
      path: '/question-bank',
      color: 'from-blue-500 to-cyan-600',
      hoverEffect: 'hover:shadow-blue-200',
      stats: '500K+ banks',
      badge: 'AI Powered',
      badgeColor: 'bg-blue-500'
    },
    {
      title: 'Answer Evaluation',
      description: 'Get detailed feedback on your written answers using advanced AI analysis.',
      icon: PenTool,
      path: '/answer-evaluation',
      color: 'from-green-500 to-emerald-600',
      hoverEffect: 'hover:shadow-green-200',
      stats: '95% accuracy',
      badge: 'Smart Grading',
      badgeColor: 'bg-green-500'
    },
    {
      title: 'Smart Notes',
      description: 'Generate summaries, mind maps, and interactive study materials.',
      icon: BookOpen,
      path: '/notes',
      color: 'from-purple-500 to-indigo-600',
      hoverEffect: 'hover:shadow-purple-200',
      stats: '1M+ notes',
      badge: 'Interactive',
      badgeColor: 'bg-purple-500'
    },
    {
      title: 'Study Planner',
      description: 'Create personalized study schedules optimized for your learning goals.',
      icon: Calendar,
      path: '/study-plan',
      color: 'from-orange-500 to-amber-600',
      hoverEffect: 'hover:shadow-orange-200',
      stats: 'Optimized',
      badge: 'Personalized',
      badgeColor: 'bg-orange-500'
    },
    {
      title: 'Progress Tracker',
      description: 'Monitor your learning journey with detailed analytics and insights.',
      icon: LineChart,
      path: '/progress',
      color: 'from-rose-500 to-pink-600',
      hoverEffect: 'hover:shadow-rose-200',
      stats: 'Real-time',
      badge: 'Analytics',
      badgeColor: 'bg-rose-500'
    }
  ];

  const features = [
    {
      icon: Rocket,
      title: 'AI-Powered Learning',
      description: 'Advanced algorithms create personalized study paths tailored to your learning style',
      color: 'from-blue-500 to-indigo-500',
      stats: '99.9% uptime'
    },
    {
      icon: Target,
      title: 'Smart Assessment',
      description: 'Detailed feedback and performance analysis with actionable insights',
      color: 'from-green-500 to-teal-500',
      stats: '95% accuracy'
    },
    {
      icon: Award,
      title: 'Progress Tracking',
      description: 'Visual analytics and achievement milestones to keep you motivated',
      color: 'from-purple-500 to-pink-500',
      stats: '10M+ tracked'
    },
    {
      icon: Users,
      title: 'Global Community',
      description: 'Connect with learners worldwide and compete in real-time challenges',
      color: 'from-orange-500 to-red-500',
      stats: '5M+ users'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Medical Student',
      content: 'QuizGenius helped me ace my medical exams with personalized practice questions.',
      rating: 5,
      avatar: '👩‍⚕️'
    },
    {
      name: 'Alex Kumar',
      role: 'Software Engineer',
      content: 'The AI-powered feedback is incredibly detailed and helped improve my coding skills.',
      rating: 5,
      avatar: '👨‍💻'
    },
    {
      name: 'Maria Rodriguez',
      role: 'High School Teacher',
      content: 'I use QuizGenius to create engaging quizzes for my students. They love it!',
      rating: 5,
      avatar: '👩‍🏫'
    }
  ];

  const stats = [
    { icon: Users, value: '5M+', label: 'Active Learners', gradient: 'from-blue-500 to-indigo-500' },
    { icon: Trophy, value: '1M+', label: 'Competitions', gradient: 'from-purple-500 to-pink-500' },
    { icon: Target, value: '50M+', label: 'Questions Solved', gradient: 'from-green-500 to-emerald-500' },
    { icon: Award, value: '95%', label: 'Success Rate', gradient: 'from-orange-500 to-red-500' }
  ];
  
  return (
    <div className="flex flex-col items-center bg-white">
      {/* Hero Section */}
      <div className="w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-r from-purple-200/30 to-pink-200/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-20 -right-20 w-60 h-60 bg-gradient-to-r from-blue-200/30 to-cyan-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-r from-green-200/30 to-teal-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
        </div>

        <div className="relative z-10 text-center max-w-6xl mx-auto px-4 py-16 sm:py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex justify-center mb-8 relative"
          >
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
              <GraduationCap className="h-20 w-20 sm:h-24 sm:w-24 text-purple-600" />
              <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-2xl animate-pulse" />
            </motion.div>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6"
          >
            Your AI-Powered <br />
            <span className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Learning Companion
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl sm:text-2xl text-gray-700 mb-8 max-w-4xl mx-auto leading-relaxed"
          >
            Transform your learning experience with intelligent study tools. 
            Get personalized guidance, instant feedback, and comprehensive analytics.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            <Button
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 group"
            >
              <Rocket className="w-6 h-6 mr-2 group-hover:animate-bounce" />
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/competitions')}
              className="border-2 border-purple-200 text-purple-700 hover:bg-purple-50 px-8 py-4 text-lg font-semibold"
            >
              <Play className="w-5 h-5 mr-2" />
              Watch Demo
            </Button>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="text-center group"
              >
                <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r ${stat.gradient} rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                  <stat.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">{stat.value}</div>
                <div className="text-sm sm:text-base text-gray-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Study Aids Section */}
      <div className="w-full max-w-7xl mx-auto px-4 py-16 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-6">
            Powerful Study Tools
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to excel in your studies, powered by advanced AI technology
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {studyAids.map((aid, index) => (
            <motion.div
              key={aid.path}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              onClick={() => isLoggedIn ? navigate(aid.path) : navigate('/auth')}
              className={`group relative overflow-hidden rounded-2xl p-8 transition-all duration-300 transform bg-white border border-gray-100 shadow-lg hover:shadow-2xl cursor-pointer ${aid.hoverEffect}`}
            >
              {/* Badge */}
              <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold text-white ${aid.badgeColor} shadow-lg`}>
                {aid.badge}
              </div>

              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${aid.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
              
              <div className="relative">
                <div className={`bg-gradient-to-br ${aid.color} p-4 rounded-2xl w-fit mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <aid.icon className="h-8 w-8 text-white" />
                </div>
                
                <h3 className="text-2xl font-bold mb-4 text-gray-900 group-hover:text-purple-600 transition-colors duration-300">
                  {aid.title}
                </h3>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {aid.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-500">{aid.stats}</span>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all duration-300" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="w-full bg-gradient-to-br from-gray-50 to-purple-50 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-6">Why Choose QuizGenius?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the future of learning with our comprehensive suite of AI-powered tools
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.05, y: -5 }}
                className="relative overflow-hidden rounded-2xl p-8 bg-white shadow-lg border border-gray-100 transform transition-all duration-300 hover:shadow-2xl group"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
                <div className={`bg-gradient-to-br ${feature.color} p-4 rounded-2xl w-fit mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 mb-4 leading-relaxed">{feature.description}</p>
                <div className="text-sm font-semibold text-gray-500">{feature.stats}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="w-full max-w-7xl mx-auto px-4 py-16 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-5xl font-bold text-gray-900 mb-6">
            Loved by Students Worldwide
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Join millions of learners who have transformed their education with QuizGenius
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02, y: -5 }}
              className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300"
            >
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-2xl mr-4">
                  {testimonial.avatar}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                  <p className="text-gray-600 text-sm">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4 leading-relaxed">"{testimonial.content}"</p>
              <div className="flex">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="w-full max-w-6xl mx-auto px-4 mb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl shadow-2xl p-8 sm:p-16 text-white relative overflow-hidden"
        >
          {/* Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 backdrop-blur-3xl" />
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -left-10 -top-10 w-40 h-40 bg-purple-400/20 rounded-full blur-2xl" />
          
          <div className="relative z-10 text-center">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-8"
            >
              <Sparkles className="w-10 h-10 text-white" />
            </motion.div>
            
            <h2 className="text-3xl sm:text-5xl font-bold mb-6">Ready to Transform Your Learning?</h2>
            <p className="text-purple-100 mb-8 max-w-2xl mx-auto text-lg sm:text-xl leading-relaxed">
              Join thousands of students who are already experiencing the power of AI-assisted learning. 
              Start your journey today and unlock your full potential.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={handleGetStarted}
                className="bg-white text-purple-700 hover:bg-purple-50 px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 group"
              >
                <Zap className="w-6 h-6 mr-2 group-hover:animate-pulse" />
                Get Started Free
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
              
              <div className="flex items-center space-x-2 text-purple-100">
                <CheckCircle className="w-5 h-5" />
                <span>No credit card required</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HomePage;