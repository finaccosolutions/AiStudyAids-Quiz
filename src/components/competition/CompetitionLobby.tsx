import React, { useEffect, useState } from 'react';
import { Button } from '../ui/Button';
import { Card, CardBody, CardHeader } from '../ui/Card';
import { 
  Users, Copy, Share, Crown, Clock, Play, 
  MessageCircle, Settings, Trophy, Zap 
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

  const copyCompetitionCode = async () => {
    await navigator.clipboard.writeText(competition.competition_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareCompetition = async () => {
    if (navigator.share) {
      await navigator.share({
        title: competition.title,
        text: `Join my quiz competition: ${competition.title}`,
        url: `${window.location.origin}/quiz?join=${competition.competition_code}`
      });
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
      onStartQuiz();
    } catch (error) {
      console.error('Error starting competition:', error);
    }
  };

  const joinedParticipants = participants.filter(p => p.status === 'joined');
  const canStart = joinedParticipants.length >= 2;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Competition Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-full">
            <Trophy className="w-12 h-12 text-purple-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{competition.title}</h1>
        {competition.description && (
          <p className="text-gray-600 mb-4">{competition.description}</p>
        )}
        <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
          <span>Code: {competition.competition_code}</span>
          <span>•</span>
          <span>{joinedParticipants.length}/{competition.max_participants} players</span>
          <span>•</span>
          <span className="capitalize">{competition.type} competition</span>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Participants */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Users className="w-6 h-6 text-purple-600" />
                  <h2 className="text-xl font-semibold">Participants</h2>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyCompetitionCode}
                    className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                  >
                    {copied ? <Zap className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
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
            
            <CardBody>
              <div className="space-y-4">
                {joinedParticipants.map((participant, index) => (
                  <motion.div
                    key={participant.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                      {participant.profile?.full_name?.charAt(0) || participant.email?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium text-gray-900">
                          {participant.profile?.full_name || participant.email || 'Anonymous'}
                        </h3>
                        {index === 0 && (
                          <Crown className="w-4 h-4 text-yellow-500" title="Creator" />
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        Joined {new Date(participant.joined_at!).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-gray-500">Ready</span>
                    </div>
                  </motion.div>
                ))}

                {/* Empty slots */}
                {Array.from({ length: competition.max_participants - joinedParticipants.length }).map((_, index) => (
                  <div
                    key={`empty-${index}`}
                    className="flex items-center space-x-4 p-4 border-2 border-dashed border-gray-300 rounded-lg"
                  >
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                      <Users className="w-6 h-6 text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-400">Waiting for player...</h3>
                      <p className="text-sm text-gray-400">Share the competition code to invite</p>
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
            <CardBody>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Course:</span>
                  <span className="font-medium">{competition.quiz_preferences.course}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Questions:</span>
                  <span className="font-medium">{competition.quiz_preferences.questionCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Difficulty:</span>
                  <span className="font-medium capitalize">{competition.quiz_preferences.difficulty}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Language:</span>
                  <span className="font-medium">{competition.quiz_preferences.language}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Mode:</span>
                  <span className="font-medium capitalize">{competition.quiz_preferences.mode}</span>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Start Competition */}
          <Card>
            <CardBody>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto">
                  <Play className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Ready to Start?</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {canStart 
                      ? 'All participants are ready. You can start the competition now!'
                      : `Need at least 2 participants to start (${joinedParticipants.length}/2)`
                    }
                  </p>
                </div>
                <Button
                  onClick={handleStartCompetition}
                  disabled={!canStart}
                  className="w-full gradient-bg"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Competition
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* Chat Toggle */}
          <Button
            variant="outline"
            onClick={() => setShowChat(!showChat)}
            className="w-full"
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
            className="overflow-hidden"
          >
            <Card>
              <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100">
                <div className="flex items-center space-x-3">
                  <MessageCircle className="w-6 h-6 text-purple-600" />
                  <h3 className="text-lg font-semibold">Competition Chat</h3>
                </div>
              </CardHeader>
              <CardBody>
                <div className="h-64 overflow-y-auto mb-4 space-y-3">
                  {chatMessages.map((message) => (
                    <div key={message.id} className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {message.profile?.full_name?.charAt(0) || '?'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-gray-900">
                            {message.profile?.full_name || 'Anonymous'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(message.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-gray-700">{message.message}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!chatMessage.trim()}
                    className="gradient-bg"
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