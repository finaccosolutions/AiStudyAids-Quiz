import React, { useState, useEffect } from 'react';
import { useCompetitionStore } from '../../store/useCompetitionStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../ui/Button';
import { Card, CardBody, CardHeader } from '../ui/Card';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Zap, Users, Search, MessageCircle, Clock, Target, Brain, Globe, X, Send, Crown, Star, Trophy, Timer, Activity, Sparkles, Rocket, Shield, CloudLightning as Lightning, Gamepad2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RandomMatchmakingProps {
  onMatchFound: (competitionId: string) => void;
  onCancel: () => void;
}

const RandomMatchmaking: React.FC<RandomMatchmakingProps> = ({
  onMatchFound,
  onCancel
}) => {
  const { user } = useAuthStore();
  const { 
    queueEntry, 
    joinRandomQueue, 
    leaveRandomQueue,
    chatMessages,
    loadChatMessages,
    sendChatMessage,
    subscribeToChat
  } = useCompetitionStore();

  const [preferences, setPreferences] = useState({
    topic: '',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    language: 'English'
  });
  const [isSearching, setIsSearching] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [matchedUsers, setMatchedUsers] = useState<any[]>([]);
  const [searchTime, setSearchTime] = useState(0);

  const difficultyOptions = [
    { value: 'easy', label: 'Easy', icon: '🌱', color: 'from-green-400 to-emerald-500' },
    { value: 'medium', label: 'Medium', icon: '🔥', color: 'from-yellow-400 to-orange-500' },
    { value: 'hard', label: 'Hard', icon: '⚡', color: 'from-red-400 to-pink-500' }
  ];

  const languageOptions = [
    { value: 'English', label: 'English', flag: '🇺🇸' },
    { value: 'Hindi', label: 'Hindi', flag: '🇮🇳' },
    { value: 'Malayalam', label: 'Malayalam', flag: '🇮🇳' },
    { value: 'Tamil', label: 'Tamil', flag: '🇮🇳' },
    { value: 'Telugu', label: 'Telugu', flag: '🇮🇳' }
  ];

  // Popular topics for quick selection
  const popularTopics = [
    { name: 'Computer Science', icon: '💻', color: 'from-blue-500 to-indigo-500' },
    { name: 'Mathematics', icon: '📐', color: 'from-purple-500 to-pink-500' },
    { name: 'Physics', icon: '⚛️', color: 'from-green-500 to-teal-500' },
    { name: 'Chemistry', icon: '🧪', color: 'from-orange-500 to-red-500' },
    { name: 'Biology', icon: '🧬', color: 'from-emerald-500 to-cyan-500' },
    { name: 'History', icon: '📚', color: 'from-amber-500 to-yellow-500' },
    { name: 'Geography', icon: '🌍', color: 'from-blue-500 to-cyan-500' },
    { name: 'English Literature', icon: '📖', color: 'from-indigo-500 to-purple-500' },
    { name: 'Economics', icon: '📊', color: 'from-green-500 to-emerald-500' },
    { name: 'Psychology', icon: '🧠', color: 'from-pink-500 to-rose-500' }
  ];

  useEffect(() => {
    if (queueEntry?.status === 'matched') {
      // Simulate finding a match and creating competition
      setTimeout(() => {
        onMatchFound('random-competition-id');
      }, 2000);
    }
  }, [queueEntry, onMatchFound]);

  // Search timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSearching) {
      timer = setInterval(() => {
        setSearchTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isSearching]);

  const handleStartSearch = async () => {
    if (!preferences.topic.trim()) {
      alert('Please enter a topic');
      return;
    }

    setIsSearching(true);
    setSearchTime(0);
    
    try {
      await joinRandomQueue({
        topic: preferences.topic,
        difficulty: preferences.difficulty,
        language: preferences.language
      });
    } catch (error) {
      console.error('Failed to join queue:', error);
      setIsSearching(false);
    }
  };

  const handleCancelSearch = async () => {
    setIsSearching(false);
    setSearchTime(0);
    
    try {
      await leaveRandomQueue();
    } catch (error) {
      console.error('Failed to leave queue:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;
    
    try {
      await sendChatMessage(chatMessage);
      setChatMessage('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isSearching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          {Array.from({ length: 30 }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-white rounded-full opacity-20"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
              }}
              animate={{
                y: [null, -100],
                opacity: [0.2, 0.8, 0.2],
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl relative z-10"
        >
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white overflow-hidden">
            <CardHeader className="text-center pb-8 relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-pink-400 animate-pulse" />
              
              <motion.div
                animate={{ 
                  rotate: 360,
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                  scale: { duration: 2, repeat: Infinity }
                }}
                className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center relative"
              >
                <Search className="w-12 h-12 text-white" />
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/50 to-pink-400/50 rounded-full blur-xl animate-pulse" />
              </motion.div>
              
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                Finding Your Match
              </h2>
              <p className="text-white/80 text-xl">
                Searching for worthy opponents across the globe...
              </p>
            </CardHeader>

            <CardBody className="space-y-8">
              {/* Search Status */}
              <div className="text-center space-y-6">
                <div className="flex items-center justify-center space-x-4 text-xl">
                  <Timer className="w-6 h-6" />
                  <span>Search Time: {formatTime(searchTime)}</span>
                </div>
                
                <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm border border-white/20">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-white/80">Topic:</span>
                      <span className="font-semibold">{preferences.topic}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/80">Difficulty:</span>
                      <span className="font-semibold capitalize">{preferences.difficulty}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/80">Language:</span>
                      <span className="font-semibold">{preferences.language}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Animated dots */}
              <div className="flex justify-center space-x-3">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ 
                      scale: [1, 1.5, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity, 
                      delay: i * 0.2 
                    }}
                    className="w-4 h-4 bg-purple-400 rounded-full"
                  />
                ))}
              </div>

              {/* Cancel Button */}
              <div className="flex justify-center pt-4">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={handleCancelSearch}
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10 px-8 py-3 text-lg font-semibold"
                  >
                    <X className="w-5 h-5 mr-2" />
                    Cancel Search
                  </Button>
                </motion.div>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-6">
            <motion.div
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ duration: 4, repeat: Infinity }}
              className="bg-gradient-to-r from-purple-400 to-pink-400 p-4 rounded-full mr-6 shadow-2xl relative"
            >
              <Zap className="w-12 h-12 text-white" />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/50 to-pink-400/50 rounded-full blur-xl animate-pulse" />
            </motion.div>
            <div>
              <h1 className="text-5xl font-bold text-white mb-2">Random Matchmaking</h1>
              <p className="text-white/80 text-xl">Find opponents worldwide for epic quiz battles!</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Setup Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-pink-400" />
              
              <CardHeader>
                <h2 className="text-3xl font-bold flex items-center">
                  <Target className="w-8 h-8 mr-3" />
                  Battle Preferences
                </h2>
                <p className="text-white/80 text-lg">
                  Set your preferences to find the perfect opponent
                </p>
              </CardHeader>

              <CardBody className="space-y-8">
                {/* Topic Selection */}
                <div>
                  <label className="block text-lg font-medium mb-4">
                    <Brain className="w-6 h-6 inline mr-2" />
                    Battle Topic
                  </label>
                  <Input
                    value={preferences.topic}
                    onChange={(e) => setPreferences(prev => ({ ...prev, topic: e.target.value }))}
                    placeholder="Enter your topic (e.g., Computer Science)"
                    className="w-full bg-white/10 border-white/20 text-white placeholder-white/50 py-4 text-lg rounded-xl"
                  />
                  
                  {/* Popular Topics */}
                  <div className="mt-6">
                    <p className="text-lg text-white/70 mb-4">Popular battle arenas:</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {popularTopics.slice(0, 6).map((topic) => (
                        <motion.button
                          key={topic.name}
                          onClick={() => setPreferences(prev => ({ ...prev, topic: topic.name }))}
                          className={`p-4 rounded-xl border border-white/20 transition-all duration-300 text-left ${
                            preferences.topic === topic.name 
                              ? 'bg-white/20 border-white/40' 
                              : 'hover:bg-white/10 hover:border-white/30'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 bg-gradient-to-r ${topic.color} rounded-lg flex items-center justify-center text-lg`}>
                              {topic.icon}
                            </div>
                            <span className="font-medium">{topic.name}</span>
                          </div>
                        </motion.button>
                      ))}
                
                    </div>
                  </div>
                </div>

                {/* Difficulty & Language */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-lg font-medium mb-4">
                      <Activity className="w-6 h-6 inline mr-2" />
                      Difficulty Level
                    </label>
                    <div className="space-y-3">
                      {difficultyOptions.map((option) => (
                        <motion.button
                          key={option.value}
                          onClick={() => setPreferences(prev => ({ 
                            ...prev, 
                            difficulty: option.value as 'easy' | 'medium' | 'hard' 
                          }))}
                          className={`w-full p-4 rounded-xl border transition-all duration-300 text-left ${
                            preferences.difficulty === option.value
                              ? 'border-white/40 bg-white/20'
                              : 'border-white/20 hover:bg-white/10 hover:border-white/30'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 bg-gradient-to-r ${option.color} rounded-lg flex items-center justify-center text-lg`}>
                              {option.icon}
                            </div>
                            <span className="font-medium text-lg">{option.label}</span>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-lg font-medium mb-4">
                      <Globe className="w-6 h-6 inline mr-2" />
                      Language
                    </label>
                    <div className="space-y-3">
                      {languageOptions.map((option) => (
                        <motion.button
                          key={option.value}
                          onClick={() => setPreferences(prev => ({ ...prev, language: option.value }))}
                          className={`w-full p-4 rounded-xl border transition-all duration-300 text-left ${
                            preferences.language === option.value
                              ? 'border-white/40 bg-white/20'
                              : 'border-white/20 hover:bg-white/10 hover:border-white/30'
                          }`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <div className="flex items-center space-x-3">
                            <span className="text-2xl">{option.flag}</span>
                            <span className="font-medium text-lg">{option.label}</span>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4 pt-6">
                  <motion.div 
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }}
                    className="flex-1"
                  >
                    <Button
                      onClick={handleStartSearch}
                      disabled={!preferences.topic.trim()}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 text-xl shadow-2xl"
                    >
                      <Rocket className="w-6 h-6 mr-2" />
                      Find Battle
                    </Button>
                  </motion.div>
                  
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button
                      onClick={onCancel}
                      variant="outline"
                      className="border-white/30 text-white hover:bg-white/10 px-8 py-4"
                    >
                      <X className="w-5 h-5 mr-2" />
                      Cancel
                    </Button>
                  </motion.div>
                </div>
              </CardBody>
            </Card>
          </motion.div>

          {/* Side Panel */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Stats Card */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white">
              <CardHeader>
                <h3 className="text-xl font-semibold flex items-center">
                  <Trophy className="w-6 h-6 mr-2" />
                  Your Battle Stats
                </h3>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-white/80">Matches Played:</span>
                  <span className="font-semibold text-xl">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/80">Win Rate:</span>
                  <span className="font-semibold text-xl">0%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/80">Best Rank:</span>
                  <span className="font-semibold text-xl">-</span>
                </div>
              </CardBody>
            </Card>

            {/* How It Works */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white">
              <CardHeader>
                <h3 className="text-xl font-semibold flex items-center">
                  <Sparkles className="w-6 h-6 mr-2" />
                  Battle Guide
                </h3>
              </CardHeader>
              <CardBody className="space-y-4 text-sm">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-xs font-bold">1</div>
                  <p className="text-white/80">Set your battle preferences and topic</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-xs font-bold">2</div>
                  <p className="text-white/80">We find you a matching opponent globally</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-xs font-bold">3</div>
                  <p className="text-white/80">Compete in an epic timed quiz battle</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-xs font-bold">4</div>
                  <p className="text-white/80">Climb the global leaderboards</p>
                </div>
              </CardBody>
            </Card>

            {/* Global Activity */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white">
              <CardHeader>
                <h3 className="text-xl font-semibold flex items-center">
                  <Gamepad2 className="w-6 h-6 mr-2" />
                  Global Activity
                </h3>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-white/80">Active Players:</span>
                  <span className="font-semibold text-xl text-green-400">1,247</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/80">Battles Today:</span>
                  <span className="font-semibold text-xl text-blue-400">8,932</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/80">Avg Wait Time:</span>
                  <span className="font-semibold text-xl text-yellow-400">45s</span>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default RandomMatchmaking;