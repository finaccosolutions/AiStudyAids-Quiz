import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Shuffle, Users, MessageCircle, Clock, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCompetitionStore } from '../../store/useCompetitionStore';

interface RandomMatchmakingProps {
  onClose: () => void;
  onMatchFound: (competitionId: string) => void;
}

const RandomMatchmaking: React.FC<RandomMatchmakingProps> = ({
  onClose,
  onMatchFound
}) => {
  const { 
    joinRandomQueue, 
    leaveRandomQueue, 
    queueEntry, 
    isLoading,
    sendChatMessage,
    loadChatMessages,
    chatMessages
  } = useCompetitionStore();
  
  const [preferences, setPreferences] = useState({
    topic: '',
    difficulty: 'medium',
    language: 'English'
  });
  const [chatMessage, setChatMessage] = useState('');
  const [timeInQueue, setTimeInQueue] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (queueEntry?.status === 'waiting') {
      interval = setInterval(() => {
        setTimeInQueue(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [queueEntry]);

  const handleJoinQueue = async () => {
    if (!preferences.topic.trim()) return;
    
    try {
      await joinRandomQueue(preferences.topic, preferences.difficulty, preferences.language);
      setTimeInQueue(0);
    } catch (error) {
      console.error('Error joining queue:', error);
    }
  };

  const handleLeaveQueue = async () => {
    await leaveRandomQueue();
    setTimeInQueue(0);
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim() || !queueEntry) return;
    
    try {
      await sendChatMessage(queueEntry.id, chatMessage);
      setChatMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Shuffle className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Random Matchmaking</h2>
                <p className="text-gray-600">Find opponents with similar interests</p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </Button>
          </div>
        </div>

        <div className="p-6">
          <AnimatePresence mode="wait">
            {!queueEntry ? (
              <motion.div
                key="setup"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-purple-600" />
                  </div>
                  <p className="text-gray-600">
                    Set your preferences and we'll match you with other players
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Topic/Subject *
                    </label>
                    <Input
                      type="text"
                      placeholder="e.g., Computer Science"
                      value={preferences.topic}
                      onChange={(e) => setPreferences(prev => ({ ...prev, topic: e.target.value }))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Difficulty
                    </label>
                    <Select
                      options={[
                        { value: 'easy', label: 'Easy' },
                        { value: 'medium', label: 'Medium' },
                        { value: 'hard', label: 'Hard' }
                      ]}
                      value={preferences.difficulty}
                      onChange={(e) => setPreferences(prev => ({ ...prev, difficulty: e.target.value }))}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Language
                    </label>
                    <Select
                      options={[
                        { value: 'English', label: 'English' },
                        { value: 'Hindi', label: 'Hindi' },
                        { value: 'Malayalam', label: 'Malayalam' },
                        { value: 'Tamil', label: 'Tamil' },
                        { value: 'Telugu', label: 'Telugu' }
                      ]}
                      value={preferences.language}
                      onChange={(e) => setPreferences(prev => ({ ...prev, language: e.target.value }))}
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
                  <h4 className="font-medium text-purple-800 mb-2">How it works:</h4>
                  <ul className="text-sm text-purple-700 space-y-1">
                    <li>• We'll match you with 1-3 other players with similar preferences</li>
                    <li>• You can chat with matched players before the quiz starts</li>
                    <li>• Quiz begins automatically when all players are ready</li>
                    <li>• Compete in real-time and see live rankings</li>
                  </ul>
                </div>

                <div className="flex justify-end space-x-4">
                  <Button
                    variant="outline"
                    onClick={onClose}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleJoinQueue}
                    disabled={!preferences.topic.trim() || isLoading}
                    className="gradient-bg"
                  >
                    {isLoading ? 'Joining...' : 'Find Match'}
                    <Shuffle className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="waiting"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <Shuffle className="w-8 h-8 text-white" />
                  </motion.div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {queueEntry.status === 'waiting' ? 'Finding opponents...' : 'Match found!'}
                  </h3>
                  <p className="text-gray-600">
                    {queueEntry.status === 'waiting' 
                      ? `Looking for players interested in ${preferences.topic}`
                      : 'Preparing your competition...'
                    }
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-purple-600">{formatTime(timeInQueue)}</div>
                      <div className="text-sm text-gray-600">Time in queue</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-600">{preferences.topic}</div>
                      <div className="text-sm text-gray-600">Topic</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600 capitalize">{preferences.difficulty}</div>
                      <div className="text-sm text-gray-600">Difficulty</div>
                    </div>
                  </div>
                </div>

                {queueEntry.status === 'matched' && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-green-50 border border-green-200 p-4 rounded-lg"
                  >
                    <div className="flex items-center space-x-2 text-green-700 mb-2">
                      <Zap className="w-5 h-5" />
                      <span className="font-medium">Match Found!</span>
                    </div>
                    <p className="text-green-600 text-sm">
                      Great! We found other players. You can chat with them below while we prepare the quiz.
                    </p>
                  </motion.div>
                )}

                {/* Chat Section */}
                {queueEntry.status === 'matched' && (
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 p-3 border-b border-gray-200">
                      <div className="flex items-center space-x-2">
                        <MessageCircle className="w-4 h-4 text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">Pre-game Chat</span>
                      </div>
                    </div>
                    
                    <div className="h-32 overflow-y-auto p-3 space-y-2">
                      {chatMessages.map((message) => (
                        <div key={message.id} className="text-sm">
                          <span className="font-medium text-purple-600">
                            {message.profile?.full_name || 'Player'}:
                          </span>
                          <span className="ml-2 text-gray-700">{message.message}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="p-3 border-t border-gray-200">
                      <div className="flex space-x-2">
                        <Input
                          type="text"
                          placeholder="Say hello to your opponents..."
                          value={chatMessage}
                          onChange={(e) => setChatMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          className="flex-1"
                        />
                        <Button
                          onClick={handleSendMessage}
                          disabled={!chatMessage.trim()}
                          className="gradient-bg"
                        >
                          Send
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-center">
                  <Button
                    variant="outline"
                    onClick={handleLeaveQueue}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    Leave Queue
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default RandomMatchmaking;