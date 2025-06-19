import React, { useEffect, useState } from 'react';
import { Button } from '../ui/Button';
import { Card, CardBody, CardHeader } from '../ui/Card';
import { 
  Users, Copy, Share, Crown, Clock, Play, 
  MessageCircle, Settings, Trophy, Zap, 
  CheckCircle2, UserCheck, Mail, Globe,
  Timer, Target, Brain, Star, Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCompetitionStore } from '../../store/useCompetitionStore';
import { Competition, CompetitionParticipant } from '../../types/competition';

interface CompetitionLobbyProps {
  competition: Competition;
  onStartQuiz: () => void;
}

const CompetitionLobby: React.FC<CompetitionLobbyProps> = ({
  competition,
  onStartQuiz
}) => {
  const { 
    participants, 
    loadParticipants, 
    startCompetition,
    chatMessages,
    loadChatMessages,
    sendChatMessage,
    subscribeToCompetition,
    subscribeToChat
  } = useCompetitionStore();
  
  const [chatMessage, setChatMessage] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    loadParticipants(competition.id);
    loadChatMessages(competition.id);

    const unsubscribeCompetition = subscribeToCompetition(competition.id);
    const unsubscribeChat = subscribeToChat(competition.id);

    return () => {
      unsubscribeCompetition();
      unsubscribeChat();
    };
  }, [competition.id]);

  // Countdown effect when competition starts
  useEffect(() => {
    if (competition.status === 'active' && countdown === null) {
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
  }, [competition.status, countdown, onStartQuiz]);

  const copyCompetitionCode = async () => {
    await navigator.clipboard.writeText(competition.competition_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareCompetition = async () => {
    const shareData = {
      title: competition.title,
      text: `Join my quiz competition: ${competition.title}`,
      url: `${window.location.origin}/quiz?join=${competition.competition_code}`
    };

    if (navigator.share && navigator.canShare(shareData)) {
      await navigator.share(shareData);
    } else {
      copyCompetitionCode();
    }
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim()) return;
    
    try {
      await sendChatMessage(competition.id, chatMessage);
      setChatMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleStartCompetition = async () => {
    try {
      await startCompetition(competition.id);
    } catch (error) {
      console.error('Error starting competition:', error);
    }
  };

  const joinedParticipants = participants.filter(p => p.status === 'joined');
  const canStart = joinedParticipants.length >= 2;

  // Show countdown overlay
  if (countdown !== null) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900 to-indigo-900 flex items-center justify-center z-50">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center text-white"
        >
          <motion.div
            key={countdown}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            className="text-8xl font-bold mb-4"
          >
            {countdown}
          </motion.div>
          <h2 className="text-2xl font-semibold mb-2">Competition Starting...</h2>
          <p className="text-purple-200">Get ready to compete!</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Competition Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-2xl opacity-50" />
        <div className="relative p-8">
          <div className="flex justify-center mb-6">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="p-4 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full shadow-xl"
            >
              <Trophy className="w-12 h-12 text-white" />
            </motion.div>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{competition.title}</h1>
          {competition.description && (
            <p className="text-xl text-gray-600 mb-6 max-w-2xl mx-auto">{competition.description}</p>
          )}
          
          <div className="flex flex-wrap items-center justify-center gap-6 text-lg">
            <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-md">
              <Globe className="w-5 h-5 text-purple-600" />
              <span className="font-mono font-bold text-purple-600">{competition.competition_code}</span>
            </div>
            <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-md">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="font-semibold">{joinedParticipants.length}/{competition.max_participants}</span>
            </div>
            <div className="flex items-center space-x-2 bg-white px-4 py-2 rounded-full shadow-md">
              <Crown className="w-5 h-5 text-yellow-600" />
              <span className="capitalize">{competition.type}</span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Participants Panel */}
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Users className="w-6 h-6 text-purple-600" />
                  <h2 className="text-xl font-semibold">Participants</h2>
                  <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                    {joinedParticipants.length} joined
                  </span>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyCompetitionCode}
                    className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                  >
                    {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied!' : 'Copy Code'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={shareCompetition}
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    <Share className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </CardHeader>
            
            <CardBody className="p-6">
              <div className="space-y-4">
                {joinedParticipants.map((participant, index) => (
                  <motion.div
                    key={participant.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-300"
                  >
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                        {participant.profile?.full_name?.charAt(0) || participant.email?.charAt(0) || '?'}
                      </div>
                      {index === 0 && (
                        <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                          <Crown className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold text-gray-900">
                          {participant.profile?.full_name || participant.email || 'Anonymous Player'}
                        </h3>
                        {index === 0 && (
                          <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">
                            Creator
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        Joined {new Date(participant.joined_at!).toLocaleTimeString()}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-green-600">Ready</span>
                    </div>
                  </motion.div>
                ))}

                {/* Empty slots */}
                {Array.from({ length: competition.max_participants - joinedParticipants.length }).map((_, index) => (
                  <div
                    key={`empty-${index}`}
                    className="flex items-center space-x-4 p-4 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50"
                  >
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-400">Waiting for player...</h3>
                      <p className="text-sm text-gray-400">Share the competition code to invite</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-400">Invite</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Competition Info & Controls */}
        <div className="space-y-6">
          {/* Quiz Settings */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100">
              <div className="flex items-center space-x-3">
                <Settings className="w-6 h-6 text-purple-600" />
                <h3 className="text-lg font-semibold">Quiz Settings</h3>
              </div>
            </CardHeader>
            <CardBody className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Brain className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium text-gray-700">Course:</span>
                  </div>
                  <span className="font-semibold text-gray-900">{competition.quiz_preferences.course}</span>
                </div>
                
                {competition.quiz_preferences.topic && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Target className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-700">Topic:</span>
                    </div>
                    <span className="font-semibold text-gray-900">{competition.quiz_preferences.topic}</span>
                  </div>
                )}
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-700">Questions:</span>
                  </div>
                  <span className="font-semibold text-gray-900">{competition.quiz_preferences.questionCount}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Timer className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-medium text-gray-700">Time/Question:</span>
                  </div>
                  <span className="font-semibold text-gray-900">{competition.quiz_preferences.timeLimit}s</span>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Award className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm font-medium text-gray-700">Difficulty:</span>
                  </div>
                  <span className="font-semibold text-gray-900 capitalize">{competition.quiz_preferences.difficulty}</span>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Start Competition */}
          <Card>
            <CardBody className="p-6">
              <div className="text-center space-y-6">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-20 h-20 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto"
                >
                  <Play className="w-10 h-10 text-green-600" />
                </motion.div>
                
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to Start?</h3>
                  <p className="text-gray-600 mb-4">
                    {canStart 
                      ? `${joinedParticipants.length} participants are ready. Start the competition now!`
                      : `Need at least 2 participants to start (${joinedParticipants.length}/2)`
                    }
                  </p>
                  
                  {canStart && (
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200 mb-4">
                      <div className="flex items-center justify-center space-x-2 text-green-700">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="font-medium">All systems ready!</span>
                      </div>
                    </div>
                  )}
                </div>
                
                <Button
                  onClick={handleStartCompetition}
                  disabled={!canStart}
                  className={`w-full py-4 text-lg font-semibold ${
                    canStart 
                      ? 'gradient-bg hover:opacity-90 transform hover:scale-105 transition-all duration-300' 
                      : 'bg-gray-300 cursor-not-allowed'
                  }`}
                >
                  {canStart ? (
                    <>
                      <Zap className="w-5 h-5 mr-2" />
                      Start Competition
                    </>
                  ) : (
                    <>
                      <Users className="w-5 h-5 mr-2" />
                      Waiting for Players
                    </>
                  )}
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* Chat Toggle */}
          <Button
            variant="outline"
            onClick={() => setShowChat(!showChat)}
            className="w-full py-3 border-2 hover:border-purple-300 hover:bg-purple-50"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            {showChat ? 'Hide Chat' : 'Show Pre-Game Chat'}
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
            className="overflow-hidden"
          >
            <Card>
              <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100">
                <div className="flex items-center space-x-3">
                  <MessageCircle className="w-6 h-6 text-purple-600" />
                  <h3 className="text-lg font-semibold">Pre-Game Chat</h3>
                  <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
                    {chatMessages.length} messages
                  </span>
                </div>
              </CardHeader>
              <CardBody className="p-6">
                <div className="h-64 overflow-y-auto mb-4 space-y-3 bg-gray-50 rounded-lg p-4">
                  {chatMessages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">
                      <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>No messages yet. Start the conversation!</p>
                    </div>
                  ) : (
                    chatMessages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start space-x-3"
                      >
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                          {message.profile?.full_name?.charAt(0) || '?'}
                        </div>
                        <div className="flex-1 bg-white p-3 rounded-lg shadow-sm">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-gray-900 text-sm">
                              {message.profile?.full_name || 'Anonymous'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(message.created_at).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="text-gray-700">{message.message}</p>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
                
                <div className="flex space-x-3">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!chatMessage.trim()}
                    className="gradient-bg px-6"
                  >
                    Send
                  </Button>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CompetitionLobby;