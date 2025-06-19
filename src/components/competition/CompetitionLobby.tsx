import React, { useState, useEffect } from 'react';
import { useCompetitionStore } from '../../store/useCompetitionStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../ui/Button';
import { Card, CardBody, CardHeader } from '../ui/Card';
import { 
  Users, Clock, Trophy, Copy, CheckCircle, 
  MessageCircle, Crown, Zap, Play, UserPlus,
  Hash, Mail, Timer, Target, Brain, Settings,
  Globe, BookOpen, Award, Star, Activity
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
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mr-6 shadow-2xl">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-800">{competition.title}</h1>
              <p className="text-gray-600 text-lg">{competition.description}</p>
            </div>
          </div>
          
          <div className="flex items-center justify-center space-x-8 text-sm">
            <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-md">
              <Hash className="w-5 h-5 text-purple-600" />
              <span className="font-mono text-xl font-bold text-purple-600">{competition.competition_code}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyCompetitionCode}
                className="text-purple-600 hover:text-purple-700 p-1"
              >
                {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <div className="flex items-center space-x-2 text-gray-600 bg-white px-4 py-2 rounded-full shadow-md">
              <Users className="w-5 h-5" />
              <span className="font-semibold">{joinedParticipants.length} participants joined</span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600 bg-white px-4 py-2 rounded-full shadow-md">
              <Activity className="w-5 h-5" />
              <span className="font-semibold capitalize">{competition.status}</span>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="xl:col-span-2 space-y-8">
            {/* Participants Panel */}
            <Card className="shadow-xl">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                    <Users className="w-7 h-7 mr-3 text-purple-600" />
                    Participants
                  </h3>
                  {isCreator && (
                    <Button
                      onClick={handleStartCompetition}
                      disabled={!canStart}
                      className="gradient-bg hover:opacity-90 transition-all duration-300 px-6 py-3"
                    >
                      <Play className="w-5 h-5 mr-2" />
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
                      className="bg-white p-6 rounded-2xl border-2 border-gray-100 shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full flex items-center justify-center shadow-lg">
                            <span className="text-white font-bold text-xl">
                              {participant.profile?.full_name?.charAt(0) || participant.email?.charAt(0) || '?'}
                            </span>
                          </div>
                          {participant.user_id === competition.creator_id && (
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                              <Crown className="w-4 h-4 text-white" />
                            </div>
                          )}
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                          </div>
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800 text-lg">
                            {participant.profile?.full_name || participant.email || 'Anonymous'}
                          </h4>
                          <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span>Ready to compete</span>
                          </div>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span>Joined: {new Date(participant.joined_at || '').toLocaleTimeString()}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {/* Waiting for more players */}
                  <div className="bg-gray-50 p-6 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center min-h-[120px]">
                    <div className="text-center text-gray-500">
                      <UserPlus className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <span className="text-sm font-medium">Waiting for more players...</span>
                      <p className="text-xs mt-1">Share the code: <strong>{competition.competition_code}</strong></p>
                    </div>
                  </div>
                </div>
                
                {!canStart && (
                  <div className="mt-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
                    <div className="flex items-center space-x-3 text-yellow-800">
                      <Timer className="w-6 h-6" />
                      <div>
                        <span className="font-semibold">Waiting for participants</span>
                        <p className="text-sm mt-1">At least 2 participants are needed to start the competition</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Competition Details */}
            <Card className="shadow-xl">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                  <Settings className="w-6 h-6 mr-2 text-blue-600" />
                  Competition Details
                </h3>
              </CardHeader>
              <CardBody className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center space-x-3 mb-2">
                      <BookOpen className="w-5 h-5 text-purple-600" />
                      <span className="font-semibold text-gray-700">Course</span>
                    </div>
                    <p className="text-gray-800 font-medium">{competition.quiz_preferences?.course}</p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center space-x-3 mb-2">
                      <Target className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-gray-700">Questions</span>
                    </div>
                    <p className="text-gray-800 font-medium">{competition.quiz_preferences?.questionCount}</p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center space-x-3 mb-2">
                      <Brain className="w-5 h-5 text-orange-600" />
                      <span className="font-semibold text-gray-700">Difficulty</span>
                    </div>
                    <p className="text-gray-800 font-medium capitalize">{competition.quiz_preferences?.difficulty}</p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center space-x-3 mb-2">
                      <Clock className="w-5 h-5 text-red-600" />
                      <span className="font-semibold text-gray-700">Time Limit</span>
                    </div>
                    <p className="text-gray-800 font-medium">
                      {competition.quiz_preferences?.timeLimitEnabled 
                        ? `${competition.quiz_preferences?.timeLimit}s per question`
                        : 'No time limit'
                      }
                    </p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center space-x-3 mb-2">
                      <Globe className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-gray-700">Language</span>
                    </div>
                    <p className="text-gray-800 font-medium">{competition.quiz_preferences?.language}</p>
                  </div>
                  
                  <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center space-x-3 mb-2">
                      <Award className="w-5 h-5 text-yellow-600" />
                      <span className="font-semibold text-gray-700">Mode</span>
                    </div>
                    <p className="text-gray-800 font-medium capitalize">{competition.quiz_preferences?.mode}</p>
                  </div>
                </div>

                {/* Question Types */}
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                    <Star className="w-5 h-5 mr-2 text-purple-600" />
                    Question Types
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {competition.quiz_preferences?.questionTypes?.map((type: string, index: number) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                      >
                        {type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    ))}
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Share Competition */}
            <Card className="shadow-xl">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                <h3 className="text-lg font-bold text-gray-800 flex items-center">
                  <Mail className="w-5 h-5 mr-2 text-green-600" />
                  Share Competition
                </h3>
              </CardHeader>
              <CardBody className="p-6">
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="text-sm text-gray-600 mb-3 font-medium">Competition Code:</p>
                    <div className="flex items-center space-x-3">
                      <code className="flex-1 font-mono text-2xl font-bold text-purple-600 bg-white p-3 rounded-lg border">
                        {competition.competition_code}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={copyCompetitionCode}
                        className="text-purple-600 hover:bg-purple-100 p-3"
                      >
                        {copied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                      </Button>
                    </div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                    <p className="text-sm text-blue-800">
                      <strong>How to join:</strong>
                    </p>
                    <ol className="text-sm text-blue-700 mt-2 space-y-1">
                      <li>1. Go to Quiz → Join Competition</li>
                      <li>2. Enter code: <strong>{competition.competition_code}</strong></li>
                      <li>3. Click "Join Competition"</li>
                    </ol>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Competition Stats */}
            <Card className="shadow-xl">
              <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
                <h3 className="text-lg font-bold text-gray-800 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-indigo-600" />
                  Live Stats
                </h3>
              </CardHeader>
              <CardBody className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Participants:</span>
                    <span className="font-bold text-lg text-purple-600">{joinedParticipants.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-bold capitalize ${
                      competition.status === 'waiting' ? 'text-yellow-600' :
                      competition.status === 'active' ? 'text-green-600' :
                      'text-blue-600'
                    }`}>
                      {competition.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Created:</span>
                    <span className="font-medium text-gray-800">
                      {new Date(competition.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-medium text-gray-800 capitalize">{competition.type}</span>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Chat Toggle */}
            <Button
              onClick={() => setShowChat(!showChat)}
              className="w-full gradient-bg hover:opacity-90 transition-all duration-300 py-3"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
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
              <Card className="shadow-xl">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
                  <h3 className="text-lg font-bold text-gray-800 flex items-center">
                    <MessageCircle className="w-5 h-5 mr-2 text-indigo-600" />
                    Competition Chat
                  </h3>
                </CardHeader>
                <CardBody className="p-0">
                  <div className="h-80 overflow-y-auto p-6 space-y-4 bg-gray-50">
                    {chatMessages.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      chatMessages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${message.user_id === user?.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs px-4 py-3 rounded-2xl shadow-sm ${
                              message.user_id === user?.id
                                ? 'bg-purple-500 text-white'
                                : 'bg-white text-gray-800 border border-gray-200'
                            }`}
                          >
                            <p className="text-xs font-medium mb-1 opacity-75">
                              {message.profile?.full_name || 'Anonymous'}
                            </p>
                            <p className="text-sm">{message.message}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-6 border-t border-gray-200 bg-white">
                    <div className="flex space-x-3">
                      <input
                        type="text"
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!chatMessage.trim()}
                        className="gradient-bg hover:opacity-90 px-6 py-3"
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