import React, { useState, useEffect } from 'react';
import SignIn from '../components/auth/SignIn';
import SignUp from '../components/auth/SignUp';
import { Brain, CheckCircle } from 'lucide-react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

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
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-50 to-white -z-10" />
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-200 rounded-full blur-3xl opacity-20" />
        <div className="absolute top-20 right-0 w-60 h-60 bg-indigo-200 rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-0 left-20 w-40 h-40 bg-blue-200 rounded-full blur-3xl opacity-20" />
      </div>
      
      <div className="bg-white/70 backdrop-blur-lg p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-100">
        <div className="flex flex-col items-center mb-8">
          <div className="relative mb-2">
            <Brain className="h-12 w-12 text-purple-600 animate-pulse" />
            <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl" />
          </div>
          <h1 className="text-3xl font-bold gradient-text">QuizGenius</h1>
          <p className="mt-2 text-center text-gray-600">
            {isSignIn ? 'Welcome back!' : 'Join our community of learners'}
          </p>
        </div>
        
        {isSignIn ? (
          <SignIn onToggleForm={() => setIsSignIn(false)} />
        ) : (
          <SignUp onToggleForm={() => setIsSignIn(true)} />
        )}
      </div>
      
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3 w-full max-w-3xl">
        <div className="feature-card">
          <div className="flex items-center mb-2 text-purple-600">
            <CheckCircle className="h-5 w-5 mr-2" />
            <h3 className="font-semibold">Smart Learning</h3>
          </div>
          <p className="text-sm text-gray-600">
            AI-powered quizzes adapt to your knowledge level.
          </p>
        </div>
        
        <div className="feature-card">
          <div className="flex items-center mb-2 text-purple-600">
            <CheckCircle className="h-5 w-5 mr-2" />
            <h3 className="font-semibold">Instant Feedback</h3>
          </div>
          <p className="text-sm text-gray-600">
            Get detailed explanations for every answer.
          </p>
        </div>
        
        <div className="feature-card">
          <div className="flex items-center mb-2 text-purple-600">
            <CheckCircle className="h-5 w-5 mr-2" />
            <h3 className="font-semibold">Track Progress</h3>
          </div>
          <p className="text-sm text-gray-600">
            Monitor your improvement over time.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;