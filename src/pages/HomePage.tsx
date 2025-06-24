import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Button } from '../components/ui/Button';
import { 
  Brain, GraduationCap, 
  FileQuestion, PenTool, BookOpen, Calendar, 
  LineChart, Rocket, Target,
  Award, Users, Zap, CheckCircle
} from 'lucide-react';

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
      color: 'from-violet-500 to-purple-400',
      hoverEffect: 'hover:shadow-violet-200'
    },
    {
      title: 'Question Bank',
      description: 'Generate comprehensive question banks from text or PDFs with intelligent analysis.',
      icon: FileQuestion,
      path: '/question-bank',
      color: 'from-blue-500 to-cyan-400',
      hoverEffect: 'hover:shadow-blue-200'
    },
    {
      title: 'Answer Evaluation',
      description: 'Get detailed feedback on your written answers using advanced AI analysis.',
      icon: PenTool,
      path: '/answer-evaluation',
      color: 'from-green-500 to-emerald-400',
      hoverEffect: 'hover:shadow-green-200'
    },
    {
      title: 'Smart Notes',
      description: 'Generate summaries, mind maps, and interactive study materials.',
      icon: BookOpen,
      path: '/notes',
      color: 'from-purple-500 to-indigo-400',
      hoverEffect: 'hover:shadow-purple-200'
    },
    {
      title: 'Study Planner',
      description: 'Create personalized study schedules optimized for your learning goals.',
      icon: Calendar,
      path: '/study-plan',
      color: 'from-orange-500 to-amber-400',
      hoverEffect: 'hover:shadow-orange-200'
    },
    {
      title: 'Progress Tracker',
      description: 'Monitor your learning journey with detailed analytics and insights.',
      icon: LineChart,
      path: '/progress',
      color: 'from-rose-500 to-pink-400',
      hoverEffect: 'hover:shadow-rose-200'
    }
  ];

  const features = [
    {
      icon: Rocket,
      title: 'AI-Powered Learning',
      description: 'Advanced algorithms create personalized study paths',
      color: 'from-blue-500 to-indigo-500'
    },
    {
      icon: Target,
      title: 'Smart Assessment',
      description: 'Detailed feedback and performance analysis',
      color: 'from-green-500 to-teal-500'
    },
    {
      icon: Award,
      title: 'Progress Tracking',
      description: 'Visual analytics and achievement milestones',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Users,
      title: 'Personalized Experience',
      description: 'Adapts to your learning style and pace',
      color: 'from-orange-500 to-red-500'
    }
  ];
  
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <div className="text-center max-w-4xl mx-auto relative mb-16">
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-purple-200 rounded-full blur-3xl opacity-20" />
        <div className="absolute -top-10 right-0 w-32 h-32 bg-indigo-200 rounded-full blur-3xl opacity-20" />
        
        <div className="flex justify-center mb-6 relative">
          <GraduationCap className="h-20 w-20 text-purple-600 animate-pulse" />
          <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-2xl" />
        </div>
        
        <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
          Your AI-Powered <br />
          <span className="gradient-text">Learning Companion</span>
        </h1>
        
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Transform your learning experience with intelligent study tools. 
          Get personalized guidance, instant feedback, and comprehensive analytics.
        </p>
      </div>

      {/* Study Aids Grid */}
      <div className="w-full max-w-7xl mx-auto px-4 mb-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {studyAids.map((aid) => (
            <button
              key={aid.path}
              onClick={() => isLoggedIn ? navigate(aid.path) : navigate('/auth')}
              className={`group relative overflow-hidden rounded-2xl p-8 transition-all duration-300 transform hover:scale-[1.02] bg-white border border-gray-100 shadow-lg ${aid.hoverEffect}`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${aid.color} opacity-5 group-hover:opacity-10 transition-opacity`} />
              
              <div className="relative">
                <div className={`bg-gradient-to-br ${aid.color} p-3 rounded-xl w-fit mb-4 group-hover:scale-110 transition-transform`}>
                  <aid.icon className="h-6 w-6 text-white" />
                </div>
                
                <h3 className="text-xl font-semibold mb-3 text-gray-900 group-hover:text-purple-600 transition-colors">
                  {aid.title}
                </h3>
                
                <p className="text-gray-600">
                  {aid.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="w-full bg-gradient-to-b from-purple-50 to-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose QuizGenius?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Experience the future of learning with our comprehensive suite of AI-powered tools
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="relative overflow-hidden rounded-2xl p-8 bg-white shadow-lg border border-gray-100 transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-5`} />
                <div className={`bg-gradient-to-br ${feature.color} p-3 rounded-xl w-fit mb-4`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="w-full max-w-6xl mx-auto px-4 mb-16">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl shadow-xl p-8 sm:p-12 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Learning?</h2>
            <p className="text-purple-100 mb-6 max-w-xl">
              Join thousands of students who are already experiencing the power of AI-assisted learning.
            </p>
            <Button
              onClick={handleGetStarted}
              className="bg-white text-purple-700 hover:bg-purple-50 group"
            >
              <Zap className="w-5 h-5 mr-2" />
              Get Started Free
            </Button>
          </div>
          
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 backdrop-blur-3xl" />
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -left-10 -top-10 w-40 h-40 bg-purple-400/20 rounded-full blur-2xl" />
        </div>
      </div>
    </div>
  );
};

export default HomePage;