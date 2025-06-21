import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../ui/Button';
import { 
  ChevronDown, LogOut, User, BookOpen, 
  Home, Settings, GraduationCap, FileQuestion, 
  PenTool, NotebookText, Calendar, LineChart,
  Brain, Menu, Key, Trophy
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Header: React.FC = () => {
  const { user, logout, isLoggedIn } = useAuthStore();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  const handleLogout = async () => {
    await logout();
    setShowDropdown(false);
    navigate('/');
  };

  const handleSignUp = () => {
    setShowDropdown(false);
    navigate('/auth?mode=signup');
  };

  const handleSignIn = () => {
    setShowDropdown(false);
    navigate('/auth?mode=signin');
  };

  const isActive = (path: string) => location.pathname === path;

  const studyAids = [
    { path: '/quiz', icon: Brain, label: 'AI Quiz' },
    { path: '/question-bank', icon: FileQuestion, label: 'Question Bank' },
    { path: '/answer-evaluation', icon: PenTool, label: 'Answer Evaluation' },
    { path: '/notes', icon: NotebookText, label: 'Smart Notes' },
    { path: '/study-plan', icon: Calendar, label: 'Study Planner' },
    { path: '/progress', icon: LineChart, label: 'Progress' },
  ];

  const profileMenuItems = [
    { path: '/profile', icon: User, label: 'My Profile' },
    { path: '/api-settings', icon: Key, label: 'API Settings' },
  ];
  
  return (
    <header className="bg-white sticky top-0 z-50 border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="relative">
              <GraduationCap className="h-8 w-8 text-purple-600 transition-all duration-300 group-hover:scale-110" />
              <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl transition-all duration-300 group-hover:blur-2xl" />
            </div>
            <span className="text-xl font-bold text-purple-600">
              QuizGenius
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6">
            {isLoggedIn && (
              <>
                <Link 
                  to="/"
                  className={`nav-link px-3 py-2 rounded-lg transition-all duration-300 flex items-center space-x-1 text-gray-700 hover:text-purple-700 hover:bg-purple-50 ${
                    isActive('/') 
                      ? 'text-purple-700 bg-purple-50 font-semibold' 
                      : ''
                  }`}
                >
                  <Home className="w-4 h-4" />
                  <span>Home</span>
                </Link>

                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setShowMenu(!showMenu)}
                    className={`nav-link px-3 py-2 rounded-lg transition-all duration-300 flex items-center space-x-1 text-gray-700 hover:text-purple-700 hover:bg-purple-50 ${
                      showMenu ? 'text-purple-700 bg-purple-50 font-semibold' : ''
                    }`}
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Study Aids</span>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showMenu ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {showMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 border border-purple-100"
                      >
                        {studyAids.map((item) => (
                          <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center space-x-2 px-4 py-2 hover:bg-purple-50 transition-colors text-gray-700 hover:text-purple-700 ${
                              isActive(item.path) ? 'text-purple-700 bg-purple-50 font-semibold' : ''
                            }`}
                            onClick={() => setShowMenu(false)}
                          >
                            <item.icon className="w-4 h-4" />
                            <span>{item.label}</span>
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <Link 
                  to="/competitions"
                  className={`nav-link px-3 py-2 rounded-lg transition-all duration-300 flex items-center space-x-1 text-gray-700 hover:text-purple-700 hover:bg-purple-50 ${
                    isActive('/competitions') 
                      ? 'text-purple-700 bg-purple-50 font-semibold' 
                      : ''
                  }`}
                >
                  <Trophy className="w-4 h-4" />
                  <span>Competitions</span>
                </Link>
              </>
            )}
          </nav>
          
          <div className="relative" ref={dropdownRef}>
            <Button
              variant="ghost"
              className="flex items-center space-x-2 hover:bg-purple-100 group transition-all duration-300 text-gray-700"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              {isLoggedIn && user?.profile && (
                <span className="text-sm font-medium text-gray-700 mr-2">
                  {user.profile.fullName}
                </span>
              )}
              <User className="h-5 w-5 group-hover:scale-110 transition-transform text-gray-700" />
              <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${showDropdown ? 'rotate-180' : ''} group-hover:text-purple-600 text-gray-700`} />
            </Button>
            
            <AnimatePresence>
              {showDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-1 border border-purple-100"
                >
                  {isLoggedIn ? (
                    <>
                      <div className="px-4 py-2 border-b border-purple-100">
                        <div className="text-sm font-medium text-gray-900">{user?.email}</div>
                      </div>
                      
                      {profileMenuItems.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700"
                          onClick={() => setShowDropdown(false)}
                        >
                          <item.icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </Link>
                      ))}
                      
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 flex items-center space-x-2 transition-all duration-300"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={handleSignIn}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-all duration-300"
                      >
                        Sign In
                      </button>
                      <button
                        onClick={handleSignUp}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-all duration-300"
                      >
                        Sign Up
                      </button>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;