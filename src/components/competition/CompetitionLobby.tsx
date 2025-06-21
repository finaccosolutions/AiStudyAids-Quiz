import React, { useState, useEffect, useRef } from 'react';
import { useCompetitionStore } from '../../store/useCompetitionStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useQuizStore } from '../../store/useQuizStore';
import { supabase } from '../../services/supabase';
import { Button } from '../ui/Button';
import { Card, CardBody, CardHeader } from '../ui/Card';
import { Users, Clock, Trophy, Copy, CheckCircle, MessageCircle, Crown, Zap, Play, UserPlus, Hash, Mail, Timer, Target, Brain, Settings, Globe, BookOpen, Award, Star, Activity, Rocket, Shield, CloudLightning as Lightning, Sparkles, X, LogOut, Trash2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Competition } from '../../types/competition';
import { useNavigate } from 'react-router-dom';

interface CompetitionLobbyProps {
  competition: Competition;
  onStartQuiz: () => void;
  onLeave?: () => void;
}

const CompetitionLobby: React.FC<CompetitionLobbyProps> = ({ 
  competition, 
  onStartQuiz,
  onLeave 
}) => {
  const { user } = useAuthStore();
  const { apiKey } = useQuizStore();
  const navigate = useNavigate();
  const { 
    participants, 
    loadParticipants, 
    chatMessages, 
    loadChatMessages,
    sendChatMessage,
    subscribeToCompetition,
    subscribeToChat,
    startCompetition,
    leaveCompetition,
    cancelCompetition,
    cleanupSubscriptions
  } = useCompetitionStore();
  
  const [copied, setCopied] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [countdownInitiated, setCountdownInitiated] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isComponentMounted, setIsComponentMounted] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  
  // Refs for subscription cleanup
  const competitionSubscriptionRef = useRef<(() => void) | null>(null);
  const chatSubscriptionRef = useRef<(() => void) | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const isCreator = user?.id === competition.creator_id;
  const joinedParticipants = participants.filter(p => p.status === 'joined');
  const canStart = joinedParticipants.length >= 2 && !isStarting;
  const userParticipant = participants.find(p => p.user_id === user?.id);

  // Heartbeat to keep session alive and update participant activity
  useEffect(() => {
    const startHeartbeat = () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
      
      heartbeatIntervalRef.current = setInterval(async () => {
        if (!isComponentMounted) return;
        
        try {
          // Keep session alive by making a lightweight request
          const { data: { session } } = await supabase.auth.getSession();
          if (!session) {
            console.warn('Session expired, redirecting to auth');
            navigate('/auth');
            return;
          }
          
          // Update participant activity
          if (user?.id && competition.id) {
            try {
              await supabase
                .from('competition_participants')
                .update({ 
                  last_activity: new Date().toISOString(),
                  is_online: true 
                })
                .eq('competition_id', competition.id)
                .eq('user_id', user.id);
            } catch (updateError) {
              console.debug('Participant activity update skipped:', updateError);
            }
          }
        } catch (error) {
          console.error('Heartbeat error:', error);
        }
      }, 30000); // Every 30 seconds
    };

    startHeartbeat();

    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
    };
  }, [competition.id, user?.id, isComponentMounted, navigate]);

  // Component lifecycle management
  useEffect(() => {
    setIsComponentMounted(true);
    
    return () => {
      setIsComponentMounted(false);
      // Cleanup subscriptions when component unmounts
      if (competitionSubscriptionRef.current) {
        competitionSubscriptionRef.current();
      }
      if (chatSubscriptionRef.current) {
        chatSubscriptionRef.current();
      }
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
    };
  }, []);

  // Enhanced subscription management - using centralized loadParticipants
    useEffect(() => {
      if (!competition.id || !isComponentMounted) return;
    
      console.log('Setting up subscriptions for competition:', competition.id);
      
      // Load initial data using centralized function
      loadParticipants(competition.id);
      loadChatMessages(competition.id);
      
      // Set up subscriptions with proper cleanup
      const setupSubscriptions = () => {
        // Clean up existing subscriptions
        if (competitionSubscriptionRef.current) {
          competitionSubscriptionRef.current();
        }
        if (chatSubscriptionRef.current) {
          chatSubscriptionRef.current();
        }
    
        // Set up new subscriptions
        competitionSubscriptionRef.current = subscribeToCompetition(competition.id);
        chatSubscriptionRef.current = subscribeToChat(competition.id);
      };
    
      setupSubscriptions();
    
      // Cleanup function
      return () => {
        console.log('Cleaning up subscriptions for competition:', competition.id);
        if (competitionSubscriptionRef.current) {
          competitionSubscriptionRef.current();
          competitionSubscriptionRef.current = null;
        }
        if (chatSubscriptionRef.current) {
          chatSubscriptionRef.current();
          chatSubscriptionRef.current = null;
        }
      };
    }, [competition.id, isComponentMounted, loadParticipants, loadChatMessages, subscribeToCompetition, subscribeToChat]);
    
    // Also add this periodic refresh effect:
    useEffect(() => {
      if (!competition.id || !isComponentMounted) return;
    
      const refreshInterval = setInterval(() => {
        if (isComponentMounted) {
          console.log('Periodic refresh of participants');
          loadParticipants(competition.id);
        }
      }, 3000); // Refresh every 3 seconds for better real-time updates
    
      return () => clearInterval(refreshInterval);
    }, [competition.id, isComponentMounted, loadParticipants]);

  // Enhanced status monitoring with countdown flickering fix
  useEffect(() => {
    if (!isComponentMounted) return;
    
    // Only initiate countdown if competition is active AND countdown hasn't been initiated yet
    if (competition.status === 'active' && !countdownInitiated) {
      console.log('Initiating countdown for competition:', competition.id);
      setCountdownInitiated(true);
      setCountdown(5);
      
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(timer);
            if (isComponentMounted) {
              console.log('Countdown finished, starting quiz');
              onStartQuiz();
            }
            return null;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => {
        console.log('Cleaning up countdown timer');
        clearInterval(timer);
      };
    }
  }, [competition.status, countdownInitiated, onStartQuiz, isComponentMounted, competition.id]);

  // Periodic data refresh to ensure consistency - using centralized function
  useEffect(() => {
    if (!competition.id || !isComponentMounted) return;

    const refreshInterval = setInterval(() => {
      if (isComponentMounted) {
        loadParticipants(competition.id);
      }
    }, 10000); // Refresh every 10 seconds for better real-time updates

    return () => clearInterval(refreshInterval);
  }, [competition.id, isComponentMounted, loadParticipants]);

  const copyCompetitionCode = async () => {
    await navigator.clipboard.writeText(competition.competition_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendMessage = async () => {
    if (chatMessage.trim() && user && isComponentMounted) {
      await sendChatMessage(competition.id, chatMessage.trim());
      setChatMessage('');
    }
  };

  const handleStartCompetition = async () => {
    if (isCreator && canStart && isComponentMounted && apiKey) {
      try {
        setIsStarting(true);
        await startCompetition(competition.id, apiKey);
      } catch (error) {
        console.error('Failed to start competition:', error);
        setIsStarting(false);
      }
    }
  };

  const handleLeaveCompetition = async () => {
    if (user && userParticipant && isComponentMounted) {
      try {
        setIsComponentMounted(false);
        await leaveCompetition(competition.id);
        // Navigate to preferences page instead of quiz page
        navigate('/preferences');
      } catch (error) {
        console.error('Failed to leave competition:', error);
        setIsComponentMounted(true);
      }
    }
    setShowLeaveConfirm(false);
  };

  const handleCancelCompetition = async () => {
    if (isCreator && isComponentMounted) {
      try {
        setIsComponentMounted(false);
        await cancelCompetition(competition.id);
        navigate('/preferences');
      } catch (error) {
        console.error('Failed to cancel competition:', error);
        setIsComponentMounted(true);
      }
    }
    setShowCancelConfirm(false);
  };

  // Show countdown screen
  if (countdown !== null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          {Array.from({ length: 20 }).map((_, i) => (
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
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-center text-white relative z-10"
        >
          <motion.div
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0]
            }}
            transition={{ duration: 1, repeat: Infinity }}
            className="text-9xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent"
          >
            {countdown}
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold mb-4"
          >
            Quiz Starting...
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl opacity-80"
          >
            Get ready to compete!
          </motion.p>
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="mt-8"
          >
            <Rocket className="w-16 h-16 mx-auto text-yellow-400" />
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Show cancelled/completed message
  if (competition.status === 'cancelled' || competition.status === 'completed') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center text-white"
        >
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-12 h-12" />
          </div>
          <h2 className="text-4xl font-bold mb-4">
            Competition {competition.status === 'cancelled' ? 'Cancelled' : 'Completed'}
          </h2>
          <p className="text-xl opacity-80 mb-6">
            {competition.status === 'cancelled' 
              ? 'This competition has been cancelled by the creator.'
              : 'This competition has ended.'
            }
          </p>
          <Button
            onClick={() => navigate('/preferences')}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 px-8 py-3 text-lg font-bold"
          >
            Back to Quiz
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 py-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-200/30 to-pink-200/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-200/30 to-cyan-200/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="flex items-center justify-center mb-6">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="w-24 h-24 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center mr-6 shadow-2xl relative"
            >
              <Trophy className="w-12 h-12 text-white" />
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/50 to-indigo-400/50 rounded-2xl blur-xl animate-pulse" />
            </motion.div>
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-slate-800 to-purple-600 bg-clip-text text-transparent">
                {competition.title}
              </h1>
              <p className="text-slate-600 text-xl">{competition.description}</p>
            </div>
          </div>
          
          <div className="flex items-center justify-center space-x-8 text-sm">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2 bg-white px-6 py-3 rounded-full shadow-lg border border-purple-200"
            >
              <Hash className="w-5 h-5 text-purple-600" />
              <span className="font-mono text-2xl font-bold text-purple-600">{competition.competition_code}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyCompetitionCode}
                className="text-purple-600 hover:text-purple-700 p-1"
              >
                {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2 text-slate-600 bg-white px-6 py-3 rounded-full shadow-lg border border-blue-200"
            >
              <Users className="w-5 h-5" />
              <span className="font-semibold">{joinedParticipants.length} participants joined</span>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2 text-slate-600 bg-white px-6 py-3 rounded-full shadow-lg border border-green-200"
            >
              <Activity className="w-5 h-5" />
              <span className="font-semibold capitalize">{competition.status}</span>
            </motion.div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="xl:col-span-2 space-y-8">
            {/* Participants Panel */}
            <Card className="shadow-2xl border-2 border-purple-100 overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
                <div className="flex items-center justify-between">
                  <h3 className="text-3xl font-bold text-slate-800 flex items-center">
                    <Users className="w-8 h-8 mr-3 text-purple-600" />
                    Battle Arena
                  </h3>
                  <div className="flex items-center space-x-3">
                    {isCreator && (
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          onClick={handleStartCompetition}
                          disabled={!canStart || !apiKey}
                          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 transition-all duration-300 px-8 py-4 text-lg font-bold shadow-xl disabled:opacity-50"
                        >
                          {isStarting ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                              Starting...
                            </>
                          ) : (
                            <>
                              <Play className="w-6 h-6 mr-2" />
                              Start Battle
                            </>
                          )}
                        </Button>
                      </motion.div>
                    )}
                    {/* Leave/Cancel Competition Buttons */}
                    {isCreator ? (
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          onClick={() => setShowCancelConfirm(true)}
                          variant="outline"
                          className="border-red-200 text-red-600 hover:bg-red-50 px-6 py-4 text-lg font-bold"
                          disabled={isStarting}
                        >
                          <Trash2 className="w-5 h-5 mr-2" />
                          Cancel
                        </Button>
                      </motion.div>
                    ) : (
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          onClick={() => setShowLeaveConfirm(true)}
                          variant="outline"
                          className="border-orange-200 text-orange-600 hover:bg-orange-50 px-6 py-4 text-lg font-bold"
                        >
                          <LogOut className="w-5 h-5 mr-2" />
                          Leave
                        </Button>
                      </motion.div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardBody className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {joinedParticipants.map((participant, index) => {
                    const participantName = participant.profile?.full_name || 'Anonymous User';
                    
                    return (
                      <motion.div
                        key={participant.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`bg-gradient-to-r from-white to-purple-50 p-6 rounded-2xl border-2 shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden ${
                          participant.user_id === user?.id ? 'border-purple-500 ring-2 ring-purple-200' : 'border-purple-100'
                        }`}
                      >
                        {/* Background Pattern */}
                        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-200/20 to-indigo-200/20 rounded-full blur-xl" />
                        
                        <div className="flex items-center space-x-4 relative z-10">
                          <div className="relative">
                            <motion.div
                              whileHover={{ scale: 1.1, rotate: 5 }}
                              className="w-16 h-16 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full flex items-center justify-center shadow-lg"
                            >
                              <span className="text-white font-bold text-xl">
                                {participantName.charAt(0).toUpperCase()}
                              </span>
                            </motion.div>
                            {participant.user_id === competition.creator_id && (
                              <motion.div
                                animate={{ rotate: [0, 10, -10, 0] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg"
                              >
                                <Crown className="w-4 h-4 text-white" />
                              </motion.div>
                            )}
                            <motion.div
                              animate={{ scale: [1, 1.2, 1] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white flex items-center justify-center"
                            >
                              <div className="w-2 h-2 bg-white rounded-full" />
                            </motion.div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-bold text-slate-800 text-xl">
                                {participantName}
                              </h4>
                              {participant.user_id === competition.creator_id && (
                                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded-full">
                                  CREATOR
                                </span>
                              )}
                              {participant.user_id === user?.id && (
                                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-bold rounded-full">
                                  YOU
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-green-600 mt-1">
                              <Shield className="w-4 h-4" />
                              <span className="font-medium">Ready for battle</span>
                            </div>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-slate-500">
                              <span>Joined: {new Date(participant.joined_at || '').toLocaleTimeString()}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                  
                  {/* Show waiting slot only if less than max participants */}
                  {joinedParticipants.length < (competition.max_participants || 10) && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-gradient-to-r from-slate-50 to-slate-100 p-6 rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center min-h-[140px] relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-100/50 to-slate-200/50 rounded-2xl" />
                      <div className="text-center relative z-10">
                        <motion.div
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <UserPlus className="w-12 h-12 mx-auto mb-3 text-slate-400" />
                        </motion.div>
                        <span className="text-sm font-medium text-slate-500">Waiting for warriors...</span>
                        <p className="text-xs mt-1 text-slate-400">Share code: <strong>{competition.competition_code}</strong></p>
                      </div>
                    </motion.div>
                  )}
                </div>
                
                {!canStart && !isStarting && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl"
                  >
                    <div className="flex items-center space-x-3 text-yellow-800">
                      <Timer className="w-6 h-6" />
                      <div>
                        <span className="font-semibold text-lg">Gathering Warriors</span>
                        <p className="text-sm mt-1">
                          {!apiKey 
                            ? 'Please set up your Gemini API key in settings to start the competition'
                            : 'At least 2 participants needed to start the epic battle'
                          }
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {isStarting && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl"
                  >
                    <div className="flex items-center space-x-3 text-blue-800">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      <div>
                        <span className="font-semibold text-lg">Preparing Battle Arena</span>
                        <p className="text-sm mt-1">Generating questions and setting up the competition...</p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </CardBody>
            </Card>

            {/* Competition Details */}
            <Card className="shadow-2xl border-2 border-blue-100">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
                <h3 className="text-2xl font-bold text-slate-800 flex items-center">
                  <Settings className="w-7 h-7 mr-3 text-blue-600" />
                  Battle Configuration
                </h3>
              </CardHeader>
              <CardBody className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <BookOpen className="w-6 h-6 text-purple-600" />
                      <span className="font-semibold text-slate-700">Course</span>
                    </div>
                    <p className="text-slate-800 font-medium text-lg">{competition.quiz_preferences?.course}</p>
                  </motion.div>
                  
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <Target className="w-6 h-6 text-green-600" />
                      <span className="font-semibold text-slate-700">Questions</span>
                    </div>
                    <p className="text-slate-800 font-medium text-lg">{competition.quiz_preferences?.questionCount}</p>
                  </motion.div>
                  
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <Brain className="w-6 h-6 text-orange-600" />
                      <span className="font-semibold text-slate-700">Difficulty</span>
                    </div>
                    <p className="text-slate-800 font-medium text-lg capitalize">{competition.quiz_preferences?.difficulty}</p>
                  </motion.div>
                  
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <Clock className="w-6 h-6 text-red-600" />
                      <span className="font-semibold text-slate-700">Time Limit</span>
                    </div>
                    <p className="text-slate-800 font-medium text-lg">
                      {competition.quiz_preferences?.timeLimitEnabled 
                        ? `${competition.quiz_preferences?.timeLimit}s per question`
                        : 'No time limit'
                      }
                    </p>
                  </motion.div>
                  
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <Globe className="w-6 h-6 text-blue-600" />
                      <span className="font-semibold text-slate-700">Language</span>
                    </div>
                    <p className="text-slate-800 font-medium text-lg">{competition.quiz_preferences?.language}</p>
                  </motion.div>
                  
                  <motion.div 
                    whileHover={{ scale: 1.05 }}
                    className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300"
                  >
                    <div className="flex items-center space-x-3 mb-3">
                      <Award className="w-6 h-6 text-yellow-600" />
                      <span className="font-semibold text-slate-700">Mode</span>
                    </div>
                    <p className="text-slate-800 font-medium text-lg capitalize">{competition.quiz_preferences?.mode}</p>
                  </motion.div>
                </div>

                {/* Question Types */}
                <div className="mt-8">
                  <h4 className="font-semibold text-slate-700 mb-4 flex items-center text-lg">
                    <Star className="w-6 h-6 mr-2 text-purple-600" />
                    Question Arsenal
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {competition.quiz_preferences?.questionTypes?.map((type: string, index: number) => (
                      <motion.span
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="px-4 py-2 bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-700 rounded-full text-sm font-medium border border-purple-200 shadow-sm"
                      >
                        {type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </motion.span>
                    ))}
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Side Panel */}
          <div className="space-y-6">
            {/* Share Competition */}
            <Card className="shadow-2xl border-2 border-green-100">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
                <h3 className="text-xl font-bold text-slate-800 flex items-center">
                  <Mail className="w-6 h-6 mr-2 text-green-600" />
                  Invite Warriors
                </h3>
              </CardHeader>
              <CardBody className="p-6">
                <div className="space-y-4">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-sm text-slate-600 mb-3 font-medium">Battle Code:</p>
                    <div className="flex items-center space-x-3">
                      <code className="flex-1 font-mono text-3xl font-bold text-purple-600 bg-white p-4 rounded-lg border-2 border-purple-200">
                        {competition.competition_code}
                      </code>
                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={copyCompetitionCode}
                          className="text-purple-600 hover:bg-purple-100 p-3"
                        >
                          {copied ? <CheckCircle className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                    <p className="text-sm text-blue-800 font-semibold mb-2">
                      <Lightning className="w-4 h-4 inline mr-1" />
                      How to join the battle:
                    </p>
                    <ol className="text-sm text-blue-700 space-y-1">
                      <li>1. Go to Quiz → Join Competition</li>
                      <li>2. Enter code: <strong>{competition.competition_code}</strong></li>
                      <li>3. Click "Join Competition"</li>
                    </ol>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Chat Toggle */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={() => setShowChat(!showChat)}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 py-4 text-lg font-bold shadow-xl"
              >
                <MessageCircle className="w-6 h-6 mr-2" />
                {showChat ? 'Hide Chat' : 'Battle Chat'}
                <Sparkles className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
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
              <Card className="shadow-2xl border-2 border-indigo-100">
                <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50">
                  <h3 className="text-2xl font-bold text-slate-800 flex items-center">
                    <MessageCircle className="w-7 h-7 mr-3 text-indigo-600" />
                    Battle Chat
                  </h3>
                </CardHeader>
                <CardBody className="p-0">
                  <div className="h-80 overflow-y-auto p-6 space-y-4 bg-gradient-to-br from-slate-50 to-indigo-50">
                    {chatMessages.length === 0 ? (
                      <div className="text-center text-slate-500 py-8">
                        <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No messages yet. Start the conversation!</p>
                      </div>
                    ) : (
                      chatMessages.map((message) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${message.user_id === user?.id ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs px-4 py-3 rounded-2xl shadow-sm ${
                              message.user_id === user?.id
                                ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white'
                                : 'bg-white text-slate-800 border border-slate-200'
                            }`}
                          >
                            <p className="text-xs font-medium mb-1 opacity-75">
                              {message.profile?.full_name || 'Anonymous'}
                            </p>
                            <p className="text-sm">{message.message}</p>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                  <div className="p-6 border-t border-slate-200 bg-white">
                    <div className="flex space-x-3">
                      <input
                        type="text"
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-3 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      />
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          onClick={handleSendMessage}
                          disabled={!chatMessage.trim()}
                          className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 px-6 py-3 font-bold"
                        >
                          Send
                        </Button>
                      </motion.div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Confirmation Modals */}
        <AnimatePresence>
          {showLeaveConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl"
              >
                <div className="text-center">
                  <AlertTriangle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">Leave Competition?</h3>
                  <p className="text-gray-600 mb-6">
                    Are you sure you want to leave this competition? You won't be able to rejoin once you leave.
                  </p>
                  <div className="flex space-x-4">
                    <Button
                      onClick={() => setShowLeaveConfirm(false)}
                      variant="outline"
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleLeaveCompetition}
                      className="flex-1 bg-orange-500 hover:bg-orange-600"
                    >
                      Leave
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {showCancelConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl"
              >
                <div className="text-center">
                  <Trash2 className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">Cancel Competition?</h3>
                  <p className="text-gray-600 mb-6">
                    Are you sure you want to cancel this competition? This action cannot be undone and all participants will be notified.
                  </p>
                  <div className="flex space-x-4">
                    <Button
                      onClick={() => setShowCancelConfirm(false)}
                      variant="outline"
                      className="flex-1"
                    >
                      Keep Competition
                    </Button>
                    <Button
                      onClick={handleCancelCompetition}
                      className="flex-1 bg-red-500 hover:bg-red-600"
                    >
                      Cancel Competition
                    </Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CompetitionLobby;
