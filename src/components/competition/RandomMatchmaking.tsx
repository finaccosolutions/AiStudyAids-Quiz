import React, { useState, useEffect } from 'react';
import { useCompetitionStore } from '../../store/useCompetitionStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../ui/Button';
import { Card, CardBody, CardHeader } from '../ui/Card';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { 
  Zap, Users, Search, MessageCircle, Clock, 
  Target, Brain, Globe, X, Send, Crown,
  Star, Trophy, Timer, Activity, Sparkles
} from 'lucide-react';
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
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' }
  ];

  const languageOptions = [
    { value: 'English', label: 'English' },
    { value: 'Hindi', label: 'Hindi' },
    { value: 'Malayalam', label: 'Malayalam' },
    { value: 'Tamil', label: 'Tamil' },
    { value: 'Telugu', label: 'Telugu' }
  ];

  // Popular topics for quick selection
  const popularTopics = [
    'Computer Science',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'History',
    'Geography',
    'English Literature',
    'Economics',
    'Psychology'
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
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl"
        >
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white">
            <CardHeader className="text-center pb-8">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center"
              >
                <Search className="w-10 h-10 text-white" />
              </motion.div>
              
              <h2 className="text-3xl font-bold mb-2">Finding Your Match</h2>
              <p className="text-white/80 text-lg">
                Searching for opponents with similar preferences...
              </p>
            </CardHeader>

            <CardBody className="space-y-6">
              {/* Search Status */}
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center space-x-4 text-lg">
                  <Timer className="w-5 h-5" />
                  <span>Search Time: {formatTime(searchTime)}</span>
                </div>
                
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span>Topic:</span>
                    <span className="font-semibold">{preferences.topic}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span>Difficulty:</span>
                    <span className="font-semibold capitalize">{preferences.difficulty}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Language:</span>
                    <span className="font-semibold">{preferences.language}</span>
                  </div>
                </div>
              </div>

              {/* Animated dots */}
              <div className="flex justify-center space-x-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity, 
                      delay: i * 0.2 
                    }}
                    className="w-3 h-3 bg-purple-400 rounded-full"
                  />
                ))}
              </div>

              {/* Cancel Button */}
              <div className="flex justify-center pt-4">
                <Button
                  onClick={handleCancelSearch}
                  variant="outline"
                  className="border-white/30 text-white hover:bg-white/10"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel Search
                </Button>
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-purple-400 to-pink-400 p-3 rounded-full mr-4">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white">Random Matchmaking</h1>
          </div>
          <p className="text-white/80 text-lg">
            Get matched with random opponents for exciting quiz battles!
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Setup Panel */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white">
              <CardHeader>
                <h2 className="text-2xl font-bold flex items-center">
                  <Target className="w-6 h-6 mr-2" />
                  Match Preferences
                </h2>
                <p className="text-white/80">
                  Set your preferences to find the perfect opponent
                </p>
              </CardHeader>

              <CardBody className="space-y-6">
                {/* Topic Selection */}
                <div>
                  <label className="block text-sm font-medium mb-3">
                    <Brain className="w-4 h-4 inline mr-2" />
                    Topic
                  </label>
                  <Input
                    value={preferences.topic}
                    onChange={(e) => setPreferences(prev => ({ ...prev, topic: e.target.value }))}
                    placeholder="Enter your topic (e.g., Computer Science)"
                    className="bg-white/10 border-white/20 text-white placeholder-white/50"
                  />
                  
                  {/* Popular Topics */}
                  <div className="mt-3">
                    <p className="text-sm text-white/70 mb-2">Popular topics:</p>
                    <div className="flex flex-wrap gap-2">
                      {popularTopics.slice(0, 6).map((topic) => (
                        <button
                          key={topic}
                          onClick={() => setPreferences(prev => ({ ...prev, topic }))}
                          className="px-3 py-1 text-xs bg-white/10 hover:bg-white/20 rounded-full border border-white/20 transition-colors"
                        >
                          {topic}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Difficulty & Language */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <Activity className="w-4 h-4 inline mr-2" />
                      Difficulty
                    </label>
                    <Select
                      value={preferences.difficulty}
                      onChange={(value) => setPreferences(prev => ({ 
                        ...prev, 
                        difficulty: value as 'easy' | 'medium' | 'hard' 
                      }))}
                      options={difficultyOptions}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      <Globe className="w-4 h-4 inline mr-2" />
                      Language
                    </label>
                    <Select
                      value={preferences.language}
                      onChange={(value) => setPreferences(prev => ({ ...prev, language: value }))}
                      options={languageOptions}
                      className="bg-white/10 border-white/20 text-white"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4 pt-4">
                  <Button
                    onClick={handleStartSearch}
                    disabled={!preferences.topic.trim()}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3"
                  >
                    <Search className="w-5 h-5 mr-2" />
                    Find Match
                  </Button>
                  
                  <Button
                    onClick={onCancel}
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
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
                <h3 className="text-lg font-semibold flex items-center">
                  <Trophy className="w-5 h-5 mr-2" />
                  Your Stats
                </h3>
              </CardHeader>
              <CardBody className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-white/80">Matches Played:</span>
                  <span className="font-semibold">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/80">Win Rate:</span>
                  <span className="font-semibold">0%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/80">Best Rank:</span>
                  <span className="font-semibold">-</span>
                </div>
              </CardBody>
            </Card>

            {/* How It Works */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white">
              <CardHeader>
                <h3 className="text-lg font-semibold flex items-center">
                  <Sparkles className="w-5 h-5 mr-2" />
                  How It Works
                </h3>
              </CardHeader>
              <CardBody className="space-y-3 text-sm">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-xs font-bold">1</div>
                  <p className="text-white/80">Set your topic and preferences</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-xs font-bold">2</div>
                  <p className="text-white/80">We find you a matching opponent</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-xs font-bold">3</div>
                  <p className="text-white/80">Compete in a timed quiz battle</p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-xs font-bold">4</div>
                  <p className="text-white/80">See results and improve your rank</p>
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