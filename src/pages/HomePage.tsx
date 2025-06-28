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
  Lightbulb, BarChart3, Activity,
  Layers, Cpu, Database, Code,
  Palette, Briefcase, Heart
} from 'lucide-react';
import { motion } from 'framer-motion';

const HomePage: React.FC = () => {
  const { isLoggedIn } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleGetStarted = () => {
      if (isLoggedIn) {
        // If logged in, scroll to the "Powerful Study Tools" section
        const studyToolsSection = document.getElementById('study-tools');
        if (studyToolsSection) {
          studyToolsSection.scrollIntoView({ behavior: 'smooth' });
        } else {
          // Fallback if section not found
          navigate('/quiz');
        }
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
      gradient: 'from-violet-500 via-purple-500 to-indigo-600',
      hoverGradient: 'hover:from-violet-600 hover:via-purple-600 hover:to-indigo-700',
      shadowColor: 'shadow-violet-500/25',
      hoverShadow: 'hover:shadow-violet-500/40',
      stats: '10M+ questions',
      badge: 'Most Popular',
      badgeColor: 'bg-violet-500',
      pattern: 'bg-gradient-to-br from-violet-100/50 to-purple-100/30',
      iconBg: 'bg-gradient-to-br from-violet-400 to-purple-500'
    },
    {
      title: 'AI Tutorial',
      description: 'Learn complex topics with interactive AI-guided tutorials and explanations.',
      icon: Lightbulb,
      path: '/ai-tutorial',
      gradient: 'from-yellow-500 via-amber-500 to-orange-600',
      hoverGradient: 'hover:from-yellow-600 hover:via-amber-600 hover:to-orange-700',
      shadowColor: 'shadow-yellow-500/25',
      hoverShadow: 'hover:shadow-yellow-500/40',
      stats: 'Interactive',
      badge: 'New!',
      badgeColor: 'bg-yellow-500',
      pattern: 'bg-gradient-to-br from-yellow-100/50 to-amber-100/30',
      iconBg: 'bg-gradient-to-br from-yellow-400 to-orange-500'
    },
    {
      title: 'Question Bank',
      description: 'Generate comprehensive question banks from text or PDFs with intelligent analysis.',
      icon: FileQuestion,
      path: '/question-bank',
      gradient: 'from-blue-500 via-cyan-500 to-teal-600',
      hoverGradient: 'hover:from-blue-600 hover:via-cyan-600 hover:to-teal-700',
      shadowColor: 'shadow-blue-500/25',
      hoverShadow: 'hover:shadow-blue-500/40',
      stats: '500K+ banks',
      badge: 'AI Powered',
      badgeColor: 'bg-blue-500',
      pattern: 'bg-gradient-to-br from-blue-100/50 to-cyan-100/30',
      iconBg: 'bg-gradient-to-br from-blue-400 to-cyan-500'
    },
    {
      title: 'Answer Evaluation',
      description: 'Get detailed feedback on your written answers using advanced AI analysis.',
      icon: PenTool,
      path: '/answer-evaluation',
      gradient: 'from-emerald-500 via-green-500 to-teal-600',
      hoverGradient: 'hover:from-emerald-600 hover:via-green-600 hover:to-teal-700',
      shadowColor: 'shadow-emerald-500/25',
      hoverShadow: 'hover:shadow-emerald-500/40',
      stats: '95% accuracy',
      badge: 'Smart Grading',
      badgeColor: 'bg-emerald-500',
      pattern: 'bg-gradient-to-br from-emerald-100/50 to-green-100/30',
      iconBg: 'bg-gradient-to-br from-emerald-400 to-green-500'
    },
    {
      title: 'Smart Notes',
      description: 'Generate summaries, mind maps, and interactive study materials.',
      icon: BookOpen,
      path: '/notes',
      gradient: 'from-purple-500 via-indigo-500 to-blue-600',
      hoverGradient: 'hover:from-purple-600 hover:via-indigo-600 hover:to-blue-700',
      shadowColor: 'shadow-purple-500/25',
      hoverShadow: 'hover:shadow-purple-500/40',
      stats: '1M+ notes',
      badge: 'Interactive',
      badgeColor: 'bg-purple-500',
      pattern: 'bg-gradient-to-br from-purple-100/50 to-indigo-100/30',
      iconBg: 'bg-gradient-to-br from-purple-400 to-indigo-500'
    },
    {
      title: 'Study Planner',
      description: 'Create personalized study schedules optimized for your learning goals.',
      icon: Calendar,
      path: '/study-plan',
      gradient: 'from-orange-500 via-amber-500 to-yellow-600',
      hoverGradient: 'hover:from-orange-600 hover:via-amber-600 hover:to-yellow-700',
      shadowColor: 'shadow-orange-500/25',
      hoverShadow: 'hover:shadow-orange-500/40',
      stats: 'Optimized',
      badge: 'Personalized',
      badgeColor: 'bg-orange-500',
      pattern: 'bg-gradient-to-br from-orange-100/50 to-amber-100/30',
      iconBg: 'bg-gradient-to-br from-orange-400 to-amber-500'
    }
  ];

  const features = [
    {
      icon: Rocket,
      title: 'AI-Powered Learning',
      description: 'Advanced algorithms create personalized study paths tailored to your learning style',
      gradient: 'from-blue-500 to-indigo-500',
      stats: '99.9% uptime'
    },
    {
      icon: Target,
      title: 'Smart Assessment',
      description: 'Detailed feedback and performance analysis with actionable insights',
      gradient: 'from-green-500 to-teal-500',
      stats: '95% accuracy'
    },
    {
      icon: Award,
      title: 'Progress Tracking',
      description: 'Visual analytics and achievement milestones to keep you motivated',
      gradient: 'from-purple-500 to-pink-500',
      stats: '10M+ tracked'
    },
    {
      icon: Users,
      title: 'Global Community',
      description: 'Connect with learners worldwide and compete in real-time challenges',
      gradient: 'from-orange-500 to-red-500',
      stats: '5M+ users'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Medical Student',
      content: 'QuizGenius helped me ace my medical exams with personalized practice questions.',
      rating: 5,
      avatar: '👩‍⚕️',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      name: 'Alex Kumar',
      role: 'Software Engineer',
      content: 'The AI-powered feedback is incredibly detailed and helped improve my coding skills.',
      rating: 5,
      avatar: '👨‍💻',
      gradient: 'from-purple-500 to-indigo-500'
    },
    {
      name: 'Maria Rodriguez',
      role: 'High School Teacher',
      content: 'I use QuizGenius to create engaging quizzes for my students. They love it!',
      rating: 5,
      avatar: '👩‍🏫',
      gradient: 'from-green-500 to-emerald-500'
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
        {/* Enhanced Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-r from-purple-200/30 to-pink-200/30 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-20 -right-20 w-60 h-60 bg-gradient-to-r from-blue-200/30 to-cyan-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-20 left-20 w-40 h-40 bg-gradient-to-r from-green-200/30 to-teal-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
          
          {/* Floating Elements */}
          <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-purple-400/20 rounded-full animate-bounce" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-blue-400/20 rounded-full animate-bounce" style={{ animationDelay: '2s' }} />
          <div className="absolute bottom-1/4 right-1/4 w-5 h-5 bg-green-400/20 rounded-full animate-bounce" style={{ animationDelay: '3s' }} />
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
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 rounded-3xl flex items-center justify-center shadow-2xl">
                <GraduationCap className="h-12 w-12 sm:h-14 sm:w-14 text-white" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/50 to-blue-400/50 rounded-3xl blur-xl animate-pulse" />
              
              {/* Orbiting Elements */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute -inset-8"
              >
                <div className="w-3 h-3 bg-purple-400 rounded-full absolute top-0 left-1/2 transform -translate-x-1/2" />
                <div className="w-2 h-2 bg-blue-400 rounded-full absolute bottom-0 right-0" />
                <div className="w-2 h-2 bg-indigo-400 rounded-full absolute top-1/2 left-0 transform -translate-y-1/2" />
              </motion.div>
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
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-4 text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              <div className="relative flex items-center text-white group-hover:text-white transition-colors duration-300">
                <Rocket className="w-6 h-6 mr-2 group-hover:animate-bounce" />
                Start Learning Now
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </div>
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Study Aids Section */}
      <div id="study-tools" className="w-full max-w-7xl mx-auto px-4 py-16 sm:py-24">
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
              whileHover={{ 
                scale: 1.05, 
                y: -10,
                rotateY: 5,
                rotateX: 5
              }}
              onClick={() => isLoggedIn ? navigate(aid.path) : navigate('/auth')}
              className={`group relative overflow-hidden rounded-3xl p-8 transition-all duration-500 transform bg-white border border-gray-100 shadow-xl ${aid.shadowColor} ${aid.hoverShadow} hover:shadow-2xl cursor-pointer`}
              style={{
                transformStyle: 'preserve-3d',
                perspective: '1000px'
              }}
            >
              {/* Enhanced Badge */}
              <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold text-white ${aid.badgeColor} shadow-lg z-20 transform group-hover:scale-110 transition-transform duration-300`}>
                {aid.badge}
              </div>

              {/* Background Pattern */}
              <div className={`absolute inset-0 ${aid.pattern} opacity-50 group-hover:opacity-70 transition-opacity duration-500`} />
              
              {/* Gradient Overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${aid.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
              
               {/* Floating Particles */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-white/30 rounded-full"
                  initial={{
                    x: Math.random() * 100 + '%',
                    y: Math.random() * 100 + '%',
                  }}
                  animate={{
                    y: [null, '-20px', null],
                    opacity: [0.3, 0.8, 0.3],
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </div>
              
              <div className="relative z-10">
                <div className={`${aid.iconBg} p-4 rounded-2xl w-fit mb-6 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-lg relative overflow-hidden`}>
                  <aid.icon className="h-8 w-8 text-white relative z-10" />
                  <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                
                <h3 className="text-2xl font-bold mb-4 text-gray-900 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-purple-600 group-hover:to-indigo-600 transition-all duration-300">
                  {aid.title}
                </h3>
                
                <p className="text-gray-600 mb-6 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">
                  {aid.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full group-hover:bg-white group-hover:text-gray-700 transition-all duration-300">
                    {aid.stats}
                  </span>
                  <motion.div
                    whileHover={{ x: 5 }}
                    className="flex items-center text-gray-400 group-hover:text-purple-600 transition-colors duration-300"
                  >
                    <span className="mr-2 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      Explore
                    </span>
                    <ArrowRight className="w-5 h-5" />
                  </motion.div>
                </div>
              </div>

              {/* Hover Glow Effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${aid.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500 rounded-3xl`} />
            </motion.div>
          ))}
        </div>

        {/* Stats Section - Moved here after study aids */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto mt-20"
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
              <div className={`w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gradient-to-r ${stat.gradient} rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg group-hover:shadow-xl transition-all duration-300 relative overflow-hidden`}>
                <stat.icon className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white relative z-10" />
                <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-slate-800 group-hover:to-blue-600 transition-all duration-300">
                {stat.value}
              </div>
              <div className="text-xs sm:text-sm lg:text-base text-gray-600 font-semibold">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
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
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
                <div className={`bg-gray-100 p-4 rounded-2xl w-fit mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-8 w-8 text-gray-600" />
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
              className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300 relative overflow-hidden group"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${testimonial.gradient} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
              <div className="flex items-center mb-6 relative z-10">
                <div className={`w-12 h-12 bg-gradient-to-r ${testimonial.gradient} rounded-full flex items-center justify-center text-2xl mr-4 shadow-lg`}>
                  {testimonial.avatar}
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                  <p className="text-gray-600 text-sm">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-gray-700 mb-4 leading-relaxed relative z-10">"{testimonial.content}"</p>
              <div className="flex relative z-10">
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
          className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl shadow-2xl p-8 sm:p-16 text-white relative overflow-hidden text-center"
        >
          <div className="relative z-10 text-center">
            <h2 className="text-3xl sm:text-5xl font-bold mb-6">Ready to Transform Your Learning?</h2>
            <p className="text-purple-100 mb-8 max-w-2xl mx-auto text-lg sm:text-xl leading-relaxed">
              Join thousands of students who are already experiencing the power of AI-assisted learning. 
              Start your journey today and unlock your full potential.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HomePage;