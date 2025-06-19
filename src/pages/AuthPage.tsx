import React, { useState, useEffect } from 'react';
import { SignIn } from '../components/auth/SignIn';
import { SignUp } from '../components/auth/SignUp';
import { Brain, CheckCircle, Sparkles, Users, Award, TrendingUp } from 'lucide-react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { motion } from 'framer-motion';

const AuthPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') || 'signin';
  const [isSignIn, setIsSignIn] = useState(mode === 'signin');
  const { isLoggedIn } = useAuthStore();
  
  useEffect(() => {
    setIsSignIn(mode === 'signin');
  }, [mode]);
  
  if (isLoggedIn) {
    return <Navigate to="/" />;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-200 rounded-full blur-3xl opacity-20 animate-pulse" />
        <div className="absolute top-20 -right-20 w-60 h-60 bg-indigo-200 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-20 left-20 w-40 h-40 bg-blue-200 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full blur-3xl opacity-30" />
      </div>
      
      <div className="relative z-10 min-h-screen flex">
        {/* Left side - Branding and Features */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 xl:px-16">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-lg"
          >
            {/* Logo and Brand */}
            <div className="flex items-center mb-8">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="relative mr-4"
              >
                <Brain className="h-16 w-16 text-purple-600" />
                <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl animate-pulse" />
              </motion.div>
              <div>
                <h1 className="text-4xl font-bold gradient-text">QuizGenius</h1>
                <p className="text-gray-600 text-lg">AI-Powered Learning Platform</p>
              </div>
            </div>
            
            {/* Features */}
            <div className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-start space-x-4 p-4 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">Smart Learning</h3>
                  <p className="text-gray-600">AI-powered quizzes that adapt to your knowledge level and learning style.</p>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex items-start space-x-4 p-4 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">Instant Feedback</h3>
                  <p className="text-gray-600">Get detailed explanations and insights for every answer to accelerate learning.</p>
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex items-start space-x-4 p-4 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">Track Progress</h3>
                  <p className="text-gray-600">Monitor your improvement with detailed analytics and performance insights.</p>
                </div>
              </motion.div>
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-12 grid grid-cols-3 gap-6"
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">10M+</div>
                <div className="text-gray-600 text-sm">Questions Solved</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600">500K+</div>
                <div className="text-gray-600 text-sm">Active Learners</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">95%</div>
                <div className="text-gray-600 text-sm">Success Rate</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Right side - Auth Forms */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
          <div className="w-full max-w-md lg:max-w-lg">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center mb-4"
              >
                <Brain className="h-12 w-12 text-purple-600 mr-3" />
                <h1 className="text-3xl font-bold gradient-text">QuizGenius</h1>
              </motion.div>
              <p className="text-gray-600">
                {isSignIn ? 'Welcome back!' : 'Join our community of learners'}
              </p>
            </div>
            
            {/* Auth Forms */}
            <motion.div
              key={isSignIn ? 'signin' : 'signup'}
              initial={{ opacity: 0, x: isSignIn ? -20 : 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              {isSignIn ? (
                <SignIn onToggleMode={() => setIsSignIn(false)} />
              ) : (
                <SignUp onToggleMode={() => setIsSignIn(true)} />
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;