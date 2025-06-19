import React, { useState, useEffect } from 'react';
import { useCompetitionStore } from '../../store/useCompetitionStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../ui/Button';
import { Card, CardBody, CardHeader } from '../ui/Card';
import { 
  Users, Clock, Trophy, Copy, CheckCircle, 
  MessageCircle, Crown, Zap, Play, UserPlus,
  Hash, Mail, Timer, Target, Brain
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Competition } from '../../types/competition';

interface CompetitionLobbyProps {
  competition: Competition;
  onStartQuiz: () => void;
}

const CompetitionLobby: React.FC<CompetitionLobbyProps> = ({ 
  competition, 
  onStartQuiz 
}) => {
  const { user } = useAuthStore();
  const { 
    participants, 
    loadParticipants, 
    chatMessages, 
    loadChatMessages,
    sendChatMessage,
    subscribeToCompetition,
    subscribeToChat,
    startCompetition
  } = useCompetitionStore();
  
  const [copied, setCopied] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const isCreator = user?.id === competition.creator_id;
  const joinedParticipants = participants.filter(p => p.status === 'joined');
  const canStart = joinedParticipants.length >= 2;

  useEffect(() => {
    if (competition.id) {
      loadParticipants(competition.id);
      loadChatMessages(competition.id);
      
      const unsubscribeCompetition = subscribeToCompetition(competition.id);
      const unsubscribeChat = subscribeToChat(competition.id);
      
      return () => {
        unsubscribeCompetition();
        unsubscribeChat();
      };
    }
  }, [competition.id]);

  useEffect(() => {
    if (competition.status === 'active') {
      setCountdown(5);
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(timer);
            onStartQuiz();
            return null;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [competition.status, onStartQuiz]);

  const copyCompetitionCode = async () => {
    await navigator.clipboard.writeText(competition.competition_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendMessage = async () => {
    if (chatMessage.trim() && user) {
      await sendChatMessage(competition.id, chatMessage.trim());
      setChatMessage('');
    }
  };

  const handleStartCompetition = async () => {
    if (isCreator && canStart) {
      await startCompetition(competition.id);
    }
  };

  if (countdown !== null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center text-white"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="text-8xl font-bold mb-4"
          >
            {countdown}
          </motion.div>
          <h2 className="text-3xl font-bold mb-2">Quiz Starting...</h2>
          <p className="text-xl opacity-80">Get ready to compete!</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mr-4">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{competition.title}</h1>
              <p className="text-gray-600">{competition.description}</p>
            </div>
          </div>
          
          <div className="flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <Hash className="w-4 h-4 text-purple-600" />
              <span className="font-mono text-lg font-bold">{competition.competition_code}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyCompetitionCode}
                className="text-purple-600 hover:text-purple-700"
              >
                {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <Users className="w-4 h-4" />
              <span>{joinedParticipants.length}/{competition.max_participants} joined</span>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Participants Panel */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-800 flex items-center">
                    <Users className="w-6 h-6 mr-2 text-purple-600" />
                    Participants
                  </h3>
                  {isCreator && (
                    <Button
                      onClick={handleStartCompetition}
                      disabled={!canStart}
                      className="gradient-bg hover:opacity-90 transition-all duration-300"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      Start Competition
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardBody className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {joinedParticipants.map((participant, index) => (
                    <motion.div
                      key={participant.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-lg">
                              {participant.profile?.full_name?.charAt(0) || participant.email?.charAt(0) || '?'}
                            </span>
                          </div>
                          {participant.user_id === competition.creator_id && (
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                              <Crown className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800">
                            {participant.profile?.full_name || participant.email || 'Anonymous'}
                          </h4>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                            <span>Ready</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {/* Empty slots */}
                  {Array.from({ length: competition.max_participants - joinedParticipants.length }).map((_, index) => (
                    <div
                      key={`empty-${index}`}
                      className="bg-gray-50 p-4 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center"
                    >
                      <div className="text-center text-gray-500">
                        <UserPlus className="w-8 h-8 mx-auto mb-2" />
                        <span className="text-sm">Waiting for player...</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                {!canStart && (
                  <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center space-x-2 text-yellow-800">
                      <Timer className="w-5 h-5" />
                      <span className="font-medium">
                        Waiting for at least 2 participants to start the competition
                      </span>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Quiz Settings */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
                <h3 className="text-lg font-bold text-gray-800 flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-blue-600" />
                  Quiz Settings
                </h3>
              </CardHeader>
              <CardBody className="p-4">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Course:</span>
                    <span className="font-medium">{competition.quiz_preferences?.course}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Questions:</span>
                    <span className="font-medium">{competition.quiz_preferences?.questionCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Difficulty:</span>
                    <span className="font-medium capitalize">{competition.quiz_preferences?.difficulty}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time/Question:</span>
                    <span className="font-medium">{competition.quiz_preferences?.timeLimit}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Language:</span>
                    <span className="font-medium">{competition.quiz_preferences?.language}</span>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Share Competition */}
            <Card>
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                <h3 className="text-lg font-bold text-gray-800 flex items-center">
                  <Mail className="w-5 h-5 mr-2 text-green-600" />
                  Share Competition
                </h3>
              </CardHeader>
              <CardBody className="p-4">
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-2">Competition Code:</p>
                    <div className="flex items-center space-x-2">
                      <code className="flex-1 font-mono text-lg font-bold text-purple-600">
                        {competition.competition_code}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={copyCompetitionCode}
                        className="text-purple-600"
                      >
                        {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    Share this code with others to let them join the competition
                  </p>
                </div>
              </CardBody>
            </Card>

            {/* Chat Toggle */}
            <Button
              onClick={() => setShowChat(!showChat)}
              className="w-full gradient-bg hover:opacity-90 transition-all duration-300"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              {showChat ? 'Hide Chat' : 'Show Chat'}
            </Button>
          </div>
        </div>

        {/* Chat Panel */}
        <AnimatePresence>
          {showChat && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-8"
            >
              <Card>
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center">
                    <MessageCircle className="w-5 h-5 mr-2 text-indigo-600" />
                    Competition Chat
                  </h3>
                </CardHeader>
                <CardBody className="p-0">
                  <div className="h-64 overflow-y-auto p-4 space-y-3">
                    {chatMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.user_id === user?.id ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs px-3 py-2 rounded-lg ${
                            message.user_id === user?.id
                              ? 'bg-purple-500 text-white'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          <p className="text-xs font-medium mb-1">
                            {message.profile?.full_name || 'Anonymous'}
                          </p>
                          <p className="text-sm">{message.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 border-t border-gray-200">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type a message..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!chatMessage.trim()}
                        className="gradient-bg hover:opacity-90"
                      >
                        Send
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CompetitionLobby;