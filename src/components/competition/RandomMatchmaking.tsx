import React, { useState, useEffect } from 'react';
import { useCompetitionStore } from '../../store/useCompetitionStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../ui/Button';
import { Card, CardBody, CardHeader } from '../ui/Card';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { 
  Zap, Users, Search, MessageCircle, Clock, 
  Target, Brain, Globe, X, Send, Crown
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

  useEffect(() => {
    if (queueEntry?.status === 'matched') {
      // Simulate finding a match and creating competition
      setTimeout(() => {
        onMatchFound('random-competition-id');
      }, 2000);
    }
  }, [queueEntry, onMatchFound]);

  const handleStartSearch = async () => {
    if (!preferences.topic.trim()) return;
    
    setIsSearching(true);
    await joinRandomQueue(preferences.topic, preferences.difficulty, preferences.language);
    
    // Simulate finding other users with same preferences
    setTimeout(() => {
      setMatchedUsers([
        { id: '1', name: 'Alex Kumar', avatar: 'AK' },
        { id: '2', name: 'Sarah Chen', avatar: 'SC' }
      ]);
      setShowChat(true);
    }, 3000);
  };

  const handleCancelSearch = async () => {
    setIsSearching(false);
    setShowChat(false);
    setMatchedUsers([]);
    await leaveRandomQueue();
  };

  const handleSendMessage = async () => {
    if (chatMessage.trim()) {
      // In real implementation, this would send to a temporary chat room
      setChatMessage('');
    }
  };

  const handleStartQuiz = () => {
    // In real implementation, this would create a competition with matched users
    onMatchFound('random-competition-id');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="shadow-2xl border-2 border-purple-100 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Random Matchmaking</h2>
                <p className="text-purple-100">Find opponents with similar interests</p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={onCancel}
              className="text-white hover:bg-white hover:bg-opacity-20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardBody className="p-8">
          {!isSearching ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Set Your Quiz Preferences
                </h3>
                <p className="text-gray-600">
                  We'll match you with other players who have similar preferences
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    <Brain className="w-4 h-4 inline mr-2" />
                    Topic/Subject
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., Computer Science, Mathematics"
                    value={preferences.topic}
                    onChange={(e) => setPreferences({ ...preferences, topic: e.target.value })}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    <Target className="w-4 h-4 inline mr-2" />
                    Difficulty Level
                  </label>
                  <Select
                    options={difficultyOptions}
                    value={preferences.difficulty}
                    onChange={(e) => setPreferences({ ...preferences, difficulty: e.target.value as any })}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">
                    <Globe className="w-4 h-4 inline mr-2" />
                    Language
                  </label>
                  <Select
                    options={languageOptions}
                    value={preferences.language}
                    onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  How Random Matchmaking Works
                </h4>
                <div className="space-y-2 text-sm text-blue-700">
                  <div className="flex items-start space-x-2">
                    <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">1</span>
                    <span>Set your quiz preferences and start searching</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">2</span>
                    <span>We'll find other players with matching preferences</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">3</span>
                    <span>Chat with matched players and decide quiz settings</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">4</span>
                    <span>Start the competition when everyone is ready!</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={handleStartSearch}
                  disabled={!preferences.topic.trim()}
                  className="gradient-bg hover:opacity-90 transition-all duration-300 px-8 py-3 text-lg"
                >
                  <Search className="w-5 h-5 mr-2" />
                  Find Opponents
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              {!showChat ? (
                <>
                  <div className="relative">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="w-20 h-20 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-6"
                    >
                      <Search className="w-10 h-10 text-white" />
                    </motion.div>
                    <div className="absolute inset-0 bg-purple-500 rounded-full opacity-20 animate-ping" />
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                      Searching for Opponents...
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Looking for players interested in <span className="font-semibold text-purple-600">{preferences.topic}</span>
                    </p>
                    <div className="text-sm text-gray-500">
                      Difficulty: <span className="font-medium capitalize">{preferences.difficulty}</span> • 
                      Language: <span className="font-medium">{preferences.language}</span>
                    </div>
                  </div>

                  <Button
                    onClick={handleCancelSearch}
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50"
                  >
                    Cancel Search
                  </Button>
                </>
              ) : (
                <div className="space-y-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                  >
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">
                      Players Found!
                    </h3>
                    <p className="text-gray-600">
                      {matchedUsers.length + 1} players ready for {preferences.topic}
                    </p>
                  </motion.div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Matched Players */}
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                        <Users className="w-5 h-5 mr-2 text-purple-600" />
                        Matched Players
                      </h4>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                          <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                            {user?.profile?.fullName?.charAt(0) || 'Y'}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{user?.profile?.fullName || 'You'}</p>
                            <div className="flex items-center space-x-1">
                              <Crown className="w-4 h-4 text-yellow-500" />
                              <span className="text-xs text-gray-600">Host</span>
                            </div>
                          </div>
                        </div>
                        {matchedUsers.map((matchedUser) => (
                          <div key={matchedUser.id} className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full flex items-center justify-center text-white font-bold">
                              {matchedUser.avatar}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{matchedUser.name}</p>
                              <div className="flex items-center space-x-1">
                                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                <span className="text-xs text-gray-600">Ready</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Quick Chat */}
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-4 flex items-center">
                        <MessageCircle className="w-5 h-5 mr-2 text-blue-600" />
                        Quick Chat
                      </h4>
                      <div className="bg-gray-50 rounded-lg border border-gray-200 h-48 flex flex-col">
                        <div className="flex-1 p-3 overflow-y-auto space-y-2">
                          <div className="text-xs text-gray-500 text-center">
                            Chat with your opponents before starting
                          </div>
                          <div className="bg-blue-100 p-2 rounded text-sm">
                            <span className="font-medium text-blue-800">Alex:</span>
                            <span className="ml-2">Ready for the challenge! 🚀</span>
                          </div>
                          <div className="bg-green-100 p-2 rounded text-sm">
                            <span className="font-medium text-green-800">Sarah:</span>
                            <span className="ml-2">Let's do this! Good luck everyone 👍</span>
                          </div>
                        </div>
                        <div className="p-3 border-t border-gray-200">
                          <div className="flex space-x-2">
                            <input
                              type="text"
                              value={chatMessage}
                              onChange={(e) => setChatMessage(e.target.value)}
                              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                              placeholder="Type a message..."
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            <Button
                              onClick={handleSendMessage}
                              size="sm"
                              className="gradient-bg"
                            >
                              <Send className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center space-x-4">
                    <Button
                      onClick={handleStartQuiz}
                      className="gradient-bg hover:opacity-90 transition-all duration-300 px-8 py-3"
                    >
                      <Zap className="w-5 h-5 mr-2" />
                      Start Quiz Competition
                    </Button>
                    <Button
                      onClick={handleCancelSearch}
                      variant="outline"
                      className="border-gray-300 text-gray-600 hover:bg-gray-50 px-6 py-3"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default RandomMatchmaking;