// src/components/competition/CompetitionResults.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useCompetitionStore } from '../../store/useCompetitionStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../ui/Button';
import { Card, CardBody, CardHeader } from '../ui/Card';
import {
  Trophy, Crown, Medal, Star, Clock, Target,
  TrendingUp, Award, Zap, Users, Home, RefreshCw,
  ChevronDown, ChevronUp, BarChart3, PieChart, Activity,
  Lightbulb, ThumbsUp, AlertTriangle, Sparkles,
  LogOut, ArrowLeft, Eye, EyeOff, Loader, Share2, Copy, CheckCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line, PieChart as RechartsPieChart, Cell, Area, AreaChart, Pie,
} from 'recharts';
import { Competition } from '../../types/competition';
import { supabase } from '../../services/supabase';
import { useNavigate } from 'react-router-dom';

interface CompetitionResultsProps {
  competition: Competition;
  onNewCompetition: () => void;
  onBackToHome: () => void;
  onLeave?: () => void;
}

const CompetitionResults: React.FC<CompetitionResultsProps> = ({
  competition,
  onNewCompetition,
  onBackToHome,
  onLeave
}) => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const {
    participants,
    userStats,
    loadUserStats,
    loadParticipants,
    subscribeToCompetition,
    cleanupSubscriptions,
    setCleanupFlag
  } = useCompetitionStore();

  const [copied, setCopied] = useState(false);
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false);
  const [confettiVisible, setConfettiVisible] = useState(true);
  const [showLiveUpdates, setShowLiveUpdates] = useState(true);
  const [competitionStatus, setCompetitionStatus] = useState(competition.status);
  const [isLoading, setIsLoading] = useState(true);
  const [competitionResults, setCompetitionResults] = useState<any | null>(null); // Changed to single object
  const [showResultsTimer, setShowResultsTimer] = useState<number | null>(null);
  const [showTimerWarning, setShowTimerWarning] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false); // New state for share modal
  const [shareLink, setShareLink] = useState(''); // New state for share link
  const [showParticipantGraph, setShowParticipantGraph] = useState(false); // New state for participant graph

  // New states for chart visibility
  const [showQuestionTypePerformance, setShowQuestionTypePerformance] = useState(false);
  const [showAnswerDistribution, setShowAnswerDistribution] = useState(false);
  const [showScoreProgression, setShowScoreProgression] = useState(false);

  // Refs for cleanup management
  const isComponentMountedRef = useRef(true);
  const subscriptionCleanupRef = useRef<(() => void) | null>(null);
  const resultsTimerRef = useRef<NodeJS.Timeout | null>(null);
  const statusCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get all participants (completed and still playing)
  const allParticipants = participants.filter(p =>
    p.status === 'completed' || p.status === 'joined'
  );

  // Sort participants by rank (ascending) for proper display order
  const sortedParticipants = [...allParticipants].sort((a, b) => {
    // Completed participants first, then by rank
    if (a.status === 'completed' && b.status !== 'completed') return -1;
    if (b.status === 'completed' && a.status !== 'completed') return 1;

    // Among completed participants, sort by rank (ascending: 1, 2, 3...)
    if (a.status === 'completed' && b.status === 'completed') {
      const rankA = a.rank || a.final_rank || 999;
      const rankB = b.rank || b.final_rank || 999;
      return rankA - rankB;
    }

    // Among active participants, sort by current progress
    const aProgress = (a.questions_answered || 0) / (competition.questions?.length || 1);
    const bProgress = (b.questions_answered || 0) / (competition.questions?.length || 1);
    if (bProgress !== aProgress) return bProgress - aProgress;

    return (b.score || 0) - (a.score || 0);
  });

  const userParticipant = sortedParticipants.find(p => p.user_id === user?.id);
  const userRank = userParticipant?.rank || userParticipant?.final_rank ||
    sortedParticipants.findIndex(p => p.user_id === user?.id) + 1;
  const completedCount = sortedParticipants.filter(p => p.status === 'completed').length;
  const totalParticipants = sortedParticipants.length;
  const isCompetitionFullyComplete = competitionStatus === 'completed';

  // Component lifecycle management
  useEffect(() => {
    isComponentMountedRef.current = true;

    return () => {
      console.log('CompetitionResults component unmounting, cleaning up...');
      isComponentMountedRef.current = false;

      // Clear all timers
      if (resultsTimerRef.current) {
        clearTimeout(resultsTimerRef.current);
      }
      if (statusCheckIntervalRef.current) {
        clearInterval(statusCheckIntervalRef.current);
      }

      // Cleanup subscriptions
      if (subscriptionCleanupRef.current) {
        subscriptionCleanupRef.current();
      }

      // Mark store as cleaned up
      setCleanupFlag(true);
    };
  }, [setCleanupFlag]);

  // Load competition results from database if competition is completed
  useEffect(() => {
    const loadCompetitionResults = async () => {
      if (!isComponentMountedRef.current) return;

      if (isCompetitionFullyComplete && user?.id) {
        try {
          console.log('Loading competition results for completed competition...');

          // Get competition results for the current user
          const { data: resultsData, error: resultsError } = await supabase
            .from('competition_results')
            .select(`
              *,
              profiles(full_name)
            `)
            .eq('competition_id', competition.id)
            .eq('user_id', user.id) // Fetch only the current user's result
            .maybeSingle();

          if (resultsError) {
            console.error('Error loading competition results:', resultsError);
            setCompetitionResults(null);
            setIsLoading(false);
            return;
          }

          if (resultsData) {
            // Map the database data to a more usable format (camelCase)
            const mappedResult = {
              id: resultsData.id,
              competitionId: resultsData.competition_id,
              userId: resultsData.user_id,
              competitionTitle: resultsData.competition_title,
              competitionType: resultsData.competition_type,
              competitionCode: resultsData.competition_code,
              finalRank: resultsData.final_rank,
              totalParticipants: resultsData.total_participants,
              score: resultsData.score,
              correctAnswers: resultsData.correct_answers,
              incorrectAnswers: resultsData.incorrect_answers,
              skippedAnswers: resultsData.skipped_answers,
              totalQuestions: resultsData.total_questions,
              timeTaken: resultsData.time_taken,
              averageTimePerQuestion: resultsData.average_time_per_question,
              pointsEarned: resultsData.points_earned,
              questionTypePerformance: resultsData.question_type_performance,
              answers: resultsData.answers,
              questionDetails: resultsData.question_details,
              quizPreferences: resultsData.quiz_preferences,
              strengths: resultsData.strengths,
              areasForImprovement: resultsData.areas_for_improvement, // Corrected field name
              comparativePerformance: resultsData.comparative_performance,
              competitionDate: resultsData.competition_date ? new Date(resultsData.competition_date) : null,
              joinedAt: resultsData.joined_at ? new Date(resultsData.joined_at) : null,
              startedAt: resultsData.started_at ? new Date(resultsData.started_at) : null,
              completedAt: resultsData.completed_at ? new Date(resultsData.completed_at) : null,
              createdAt: resultsData.created_at ? new Date(resultsData.created_at) : null,
              percentageScore: resultsData.percentage_score,
              accuracyRate: resultsData.accuracy_rate,
              rankPercentile: resultsData.rank_percentile,
              profile: resultsData.profiles || null
            };
            if (isComponentMountedRef.current) {
              console.log('Successfully loaded competition result:', mappedResult);
              setCompetitionResults(mappedResult);
            }
          } else {
            console.log('No competition result found for current user, using live participant data');
            if (isComponentMountedRef.current) {
              setCompetitionResults(null); // Ensure it's null if no specific result found
            }
          }
        } catch (error) {
          console.error('Error loading competition results:', error);
          if (isComponentMountedRef.current) {
            setCompetitionResults(null);
          }
        }
      }

      if (isComponentMountedRef.current) {
        setIsLoading(false);
      }
    };

    loadCompetitionResults();
  }, [competition.id, isCompetitionFullyComplete, user?.id]);

  useEffect(() => {
    if (user && isComponentMountedRef.current) {
      loadUserStats(user.id);
    }

    // Hide confetti after 5 seconds
    const timer = setTimeout(() => {
      if (isComponentMountedRef.current) {
        setConfettiVisible(false);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [user, loadUserStats]);

  const handleCancelTimer = () => {
    if (resultsTimerRef.current) {
      clearTimeout(resultsTimerRef.current);
    }
    setShowTimerWarning(false);
    setShowResultsTimer(null);
  };

  // Set up real-time subscriptions for live updates with proper cleanup
  useEffect(() => {
    if (!competition.id || !isComponentMountedRef.current) return;

    console.log('Setting up real-time subscriptions for results page');

    // Subscribe to competition and participant updates
    const unsubscribe = supabase
      .channel(`competition_${competition.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'competition_participants',
          filter: `competition_id=eq.${competition.id}`,
        },
        (payload) => {
          console.log('Participant change received!', payload);
          loadParticipants(competition.id); // Reload participants on any change
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'competitions',
          filter: `id=eq.${competition.id}`,
        },
        (payload) => {
          console.log('Competition change received!', payload);
          // Update competition status locally
          if (payload.new) {
            setCompetitionStatus(payload.new.status);
          }
        }
      )
      .subscribe();

    subscriptionCleanupRef.current = () => {
      console.log(`Unsubscribing from competition_${competition.id}`);
      supabase.removeChannel(unsubscribe);
    };

    // Check competition status periodically
    statusCheckIntervalRef.current = setInterval(async () => {
      if (!isComponentMountedRef.current) return;

      try {
        const { data } = await supabase
          .from('competitions')
          .select('status')
          .eq('id', competition.id)
          .single();

        if (data && data.status !== competitionStatus && isComponentMountedRef.current) {
          setCompetitionStatus(data.status);
          console.log('Competition status updated to:', data.status);
        }
      } catch (error) {
        console.error('Error checking competition status:', error);
      }
    }, 3000);

    // Refresh participants data periodically if not completed
    let refreshInterval: NodeJS.Timeout;
    if (!isCompetitionFullyComplete) {
      refreshInterval = setInterval(() => {
        if (isComponentMountedRef.current) {
          loadParticipants(competition.id);
        }
      }, 3000);
    }

    return () => {
      console.log('Cleaning up results page subscriptions');
      if (subscriptionCleanupRef.current) {
        subscriptionCleanupRef.current();
      }
      if (statusCheckIntervalRef.current) {
        clearInterval(statusCheckIntervalRef.current);
      }
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [competition.id, loadParticipants, competitionStatus, isCompetitionFullyComplete]);

  useEffect(() => {
    setShowLiveUpdates(!isCompetitionFullyComplete);
  }, [isCompetitionFullyComplete]);

  const handleLeaveCompetition = async () => {
    try {
      // Cleanup first
      setCleanupFlag(true);
      cleanupSubscriptions();

      // Call the leaveCompetition action from the store
      // This action is responsible for updating the participant status in the DB
      // and clearing the currentCompetition state in the store.
      // It also handles navigation if onLeave is not provided.
      // No need to call `clearCurrentCompetition()` directly here as `leaveCompetition` handles it.
      await useCompetitionStore.getState().leaveCompetition(competition.id);

      if (onLeave) {
        onLeave();
      } else {
        navigate('/quiz'); // Navigate to quiz page after leaving
      }
    } catch (error) {
      console.error('Error leaving competition:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getPerformanceMessage = () => {
    // Use competitionResults if available, otherwise fallback to userParticipant
    const currentResult = competitionResults || userParticipant;

    if (!currentResult || currentResult.status !== 'completed') {
      return {
        message: isCompetitionFullyComplete
          ? 'Competition completed! Check your final results below.'
          : 'Quiz completed! Waiting for other participants to finish...',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        icon: Trophy,
        emoji: '⏳'
      };
    }

    if (!isCompetitionFullyComplete) {
      return {
        message: `Currently ranked #${userRank}. Final results will be available when all participants finish.`,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
        icon: Clock,
        emoji: '⏳'
      };
    }

    // Final results messages
    const finalRank = currentResult.final_rank || userRank;
    if (finalRank === 1) return {
      message: '🎉 Congratulations! You won the competition!',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      icon: Trophy,
      emoji: '🏆'
    };
    if (finalRank <= 3) return {
      message: '🏆 Excellent! You finished in the top 3!',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      icon: Award,
      emoji: '🌟'
    };
    if (finalRank <= totalParticipants / 2) return {
      message: '👏 Great performance! You finished in the top half!',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      icon: TrendingUp,
      emoji: '👏'
    };
    return {
      message: '💪 Good effort! Keep practicing for even better results!',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      icon: Target,
      emoji: '💪'
    };
  };

  const performance = getPerformanceMessage();

  const getCompetitionInsights = () => {
    if (completedCount === 0) return null;

    const completedParticipants = sortedParticipants.filter(p => p.status === 'completed');
    const totalQuestions = competition.questions?.length || 1;
    const averageScore = completedParticipants.reduce((sum, p) => sum + (p.score || 0), 0) / completedParticipants.length;
    const averageTime = completedParticipants.reduce((sum, p) => sum + (p.time_taken || 0), 0) / completedParticipants.length;
    const highestScore = Math.max(...completedParticipants.map(p => p.score || 0));
    const fastestTime = Math.min(...completedParticipants.map(p => p.time_taken || Infinity));

    return {
      averageScore: averageScore.toFixed(1),
      averageAccuracy: totalQuestions > 0 ? ((averageScore / totalQuestions) * 100).toFixed(1) : '0',
      averageTime: formatTime(Math.round(averageTime)),
      highestScore: highestScore.toFixed(1),
      fastestTime: formatTime(fastestTime),
      completedParticipants: completedCount,
      totalParticipants
    };
  };

  const insights = getCompetitionInsights();

  const getRankIcon = (rank: number, isCompleted: boolean) => {
    if (!isCompleted && !isCompetitionFullyComplete) return <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />;

    if (rank === 1) return <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />;
    return <span className="text-base sm:text-lg font-bold text-gray-600">#{rank}</span>;
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-400 to-yellow-500';
    if (rank === 2) return 'from-gray-300 to-gray-400';
    if (rank === 3) return 'from-orange-400 to-orange-500';
    if (rank <= 5) return 'from-purple-400 to-purple-500';
    return 'from-blue-400 to-blue-500';
  };

  const getProgressPercentage = (participant: any) => {
    const totalQuestions = competition.questions?.length || 1;
    return ((participant.questions_answered || 0) / totalQuestions) * 100;
  };

  const handleShareResult = () => {
    if (competitionResults?.id) {
      const shareUrl = `https://aistudyaids.com/shared-competition-result/${competitionResults.id}`;
      setShareLink(shareUrl);
      setShowShareModal(true);
    } else {
      alert('Result not yet available for sharing. Please wait for the competition to finalize.');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Data for charts (using competitionResults)
  const questionTypePerformanceData = Object.keys(competitionResults?.questionTypePerformance || {}).map(type => {
    const perf = competitionResults.questionTypePerformance[type];
    // Safely get correct and total, defaulting to 0 if undefined or null
    const correct = typeof perf?.correct === 'number' ? perf.correct : 0;
    const total = typeof perf?.total === 'number' ? perf.total : 0;
    return {
      name: type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      accuracy: total > 0 ? (correct / total) * 100 : 0,
      correct: correct,
      total: total,
    };
  });

  const answerDistributionData = [
    { name: 'Correct', value: competitionResults?.correctAnswers || 0, color: '#10B981' },
    { name: 'Incorrect', value: competitionResults?.incorrectAnswers || 0, color: '#EF4444' },
    { name: 'Skipped', value: competitionResults?.skippedAnswers || 0, color: '#6B7280' },
  ];

  // Mock data for score progression (replace with actual data if available)
  const scoreProgressionData = [
    { name: 'Start', score: 0 },
    { name: 'Mid', score: (competitionResults?.percentageScore || 0) * 0.7 },
    { name: 'Final', score: competitionResults?.percentageScore || 0 },
  ];


  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader className="w-12 h-12 text-purple-600 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Loading Results...</h2>
          <p className="text-gray-600">Please wait while we prepare your competition results</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 py-4 sm:py-8 relative overflow-hidden">
      {/* Confetti Animation */}
      <AnimatePresence>
        {confettiVisible && userParticipant?.status === 'completed' && isCompetitionFullyComplete && userRank <= 3 && (
          <div className="fixed inset-0 pointer-events-none z-10">
            {Array.from({ length: 50 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full"
                initial={{
                  x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 800),
                  y: -10,
                  rotate: 0,
                }}
                animate={{
                  y: (typeof window !== 'undefined' ? window.innerHeight : 600) + 10,
                  rotate: 360,
                }}
                transition={{
                  duration: Math.random() * 3 + 2,
                  ease: "easeOut",
                  delay: Math.random() * 2,
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 relative z-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 sm:mb-8"
        >
          <div className="flex flex-col sm:flex-row items-center justify-center mb-4 sm:mb-6">
            <div className="w-16 h-16 sm:w-24 sm:h-24 mb-6 sm:mb-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center flex-shrink-0">
              <Trophy className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
            </div>
            <div className="text-center sm:text-left sm:ml-4">
              <h1 className="text-3xl sm:text-5xl font-bold text-gray-800">
                {isCompetitionFullyComplete ? 'Final Results!' : 'Live Results'}
              </h1>
              <p className="text-lg sm:text-2xl text-gray-600">{competition.title}</p>
              {!isCompetitionFullyComplete && (
                <p className="text-base sm:text-lg text-orange-600 mt-2">
                  {completedCount}/{totalParticipants} participants finished
                </p>
              )}
            </div>
          </div>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200, damping: 20 }}
            className={`text-2xl sm:text-3xl font-bold ${performance.color} mb-4`}
          >
            {performance.emoji} {performance.message}
          </motion.div>
        </motion.div>

        {/* Live Updates Toggle */}
        {!isCompetitionFullyComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-4 sm:mb-6 flex justify-center"
          >
            <button
              onClick={() => setShowLiveUpdates(!showLiveUpdates)}
              className="flex items-center space-x-2 px-4 py-2 bg-white rounded-full shadow-lg border border-blue-200 hover:bg-blue-50 transition-all duration-300"
            >
              {showLiveUpdates ? <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" /> : <EyeOff className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />}
              <span className={`text-sm sm:text-base ${showLiveUpdates ? 'text-blue-600' : 'text-gray-500'}`}>
                Live Updates {showLiveUpdates ? 'ON' : 'OFF'}
              </span>
              <div className={`w-2 h-2 rounded-full ${showLiveUpdates ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
            </button>
          </motion.div>
        )}

        {/* User Performance Summary */}
        {competitionResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-6 sm:mb-8"
          >
            <Card className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white border-0 shadow-2xl">
              <CardBody className="p-4 sm:p-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
                  <div>
                    <div className="flex items-center justify-center mb-2 sm:mb-3">
                      {getRankIcon(competitionResults.finalRank, true)}
                    </div>
                    <div className="text-2xl sm:text-4xl font-bold">{competitionResults.finalRank}</div>
                    <div className="text-purple-100 text-sm sm:text-base">
                      Final Rank
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-center mb-2 sm:mb-3">
                      <Zap className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-300" />
                    </div>
                    <div className="text-2xl sm:text-4xl font-bold">{competitionResults.score.toFixed(1)}</div>
                    <div className="text-purple-100 text-sm sm:text-base">Score</div>
                  </div>
                  <div>
                    <div className="flex items-center justify-center mb-2 sm:mb-3">
                      <Target className="w-8 h-8 sm:w-10 sm:h-10 text-green-300" />
                    </div>
                    <div className="text-2xl sm:text-4xl font-bold">
                      {competitionResults.correctAnswers}/{competitionResults.totalQuestions || 0}
                    </div>
                    <div className="text-purple-100 text-sm sm:text-base">Correct Answers</div>
                  </div>
                  <div>
                    <div className="flex items-center justify-center mb-2 sm:mb-3">
                      <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-blue-300" />
                    </div>
                    <div className="text-2xl sm:text-4xl font-bold">{formatTime(competitionResults.timeTaken)}</div>
                    <div className="text-purple-100 text-sm sm:text-base">Time Taken</div>
                  </div>
                </div>

                {/* Points Earned */}
                {competitionResults.pointsEarned !== undefined && (
                  <div className="mt-4 sm:mt-6 text-center">
                    <div className="inline-flex items-center space-x-2 bg-white bg-opacity-20 px-4 sm:px-6 py-2 sm:py-3 rounded-full">
                      <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-300" />
                      <span className="text-lg sm:text-xl font-bold">+{competitionResults.pointsEarned || 0} Points Earned</span>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>
          </motion.div>
        )}

        {/* Competition Insights */}
        {insights && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-6 sm:mb-8"
          >
            <Card className="shadow-xl border-2 border-blue-100">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 sm:p-6">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center">
                  <BarChart3 className="w-6 h-6 sm:w-7 sm:h-7 mr-2 sm:mr-3 text-blue-600" />
                  Competition Insights
                  {!isCompetitionFullyComplete && (
                    <span className="ml-2 sm:ml-3 px-2 sm:px-3 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                      Live Data
                    </span>
                  )}
                </h3>
              </CardHeader>
              <CardBody className="p-4 sm:p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                  <div className="text-center p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
                    <div className="text-lg sm:text-2xl font-bold text-blue-600">{insights.completedParticipants}/{insights.totalParticipants}</div>
                    <div className="text-xs sm:text-sm text-gray-600">Completed</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
                    <div className="text-lg sm:text-2xl font-bold text-green-600">{insights.averageScore}</div>
                    <div className="text-xs sm:text-sm text-gray-600">Avg Score</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl">
                    <div className="text-lg sm:text-2xl font-bold text-purple-600">{insights.averageAccuracy}%</div>
                    <div className="text-xs sm:text-sm text-gray-600">Avg Accuracy</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl">
                    <div className="text-lg sm:text-2xl font-bold text-orange-600">{insights.averageTime}</div>
                    <div className="text-xs sm:text-sm text-gray-600">Avg Time</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl">
                    <div className="text-lg sm:text-2xl font-bold text-yellow-600">{insights.highestScore}</div>
                    <div className="text-xs sm:text-sm text-gray-600">Highest Score</div>
                  </div>
                  <div className="text-center p-3 sm:p-4 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl">
                    <div className="text-lg sm:text-2xl font-bold text-teal-600">{insights.fastestTime}</div>
                    <div className="text-xs sm:text-sm text-gray-600">Fastest Time</div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        )}

        {/* Live Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-6 sm:mb-8"
        >
          <Card className="shadow-2xl border-2 border-purple-100">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center">
                  <Trophy className="w-6 h-6 sm:w-8 sm:h-8 mr-2 sm:mr-3 text-yellow-500" />
                  {isCompetitionFullyComplete ? 'Final Rankings' : 'Live Leaderboard'}
                </h3>
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                  <div className="text-sm text-gray-600">
                    {completedCount}/{totalParticipants} finished
                  </div>
                  {!isCompetitionFullyComplete && showLiveUpdates && (
                    <div className="flex items-center space-x-2 text-green-600">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-sm font-medium">Live</span>
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardBody className="p-4 sm:p-6">
              <div className="space-y-3 sm:space-y-4">
                {sortedParticipants.map((participant, index) => {
                  // Use the correct rank from the database or calculated rank
                  const rank = participant.rank || participant.final_rank || (index + 1);
                  const isCompleted = isCompetitionFullyComplete || participant.status === 'completed';
                  const isCurrentUser = participant.user_id === user?.id;
                  const progressPercentage = getProgressPercentage(participant);

                  // Handle different data structures for participant names
                  let participantName = 'Anonymous';
                  if (participant.profile?.full_name) {
                    participantName = participant.profile.full_name;
                  } else if (participant.profiles?.full_name) {
                    participantName = participant.profiles.full_name;
                  }

                  return (
                    <motion.div
                      key={participant.id || participant.user_id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7 + index * 0.05 }}
                      className={`p-4 sm:p-6 rounded-2xl border-2 transition-all duration-300 ${
                        isCurrentUser
                          ? 'border-purple-500 bg-purple-50 shadow-lg scale-105'
                          : 'border-gray-200 bg-white hover:shadow-md'
                      } ${!isCompleted && !isCompetitionFullyComplete ? 'border-l-4 border-l-orange-400' : ''}`}
                    >
                      <div className="flex items-center space-x-3 sm:space-x-6">
                        {/* Rank Badge with Medal/Crown Icons */}
                        <div className={`w-12 h-12 sm:w-20 sm:h-20 rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-2xl shadow-lg bg-gradient-to-r ${getRankColor(rank)}`}>
                          {getRankIcon(rank, isCompleted)}
                        </div>

                        {/* Participant Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-3 mb-2 sm:mb-3">
                            <h4 className="text-lg sm:text-2xl font-bold text-gray-800 truncate">
                              {participantName}
                            </h4>
                            <div className="flex items-center space-x-2">
                              {isCurrentUser && (
                                <span className="px-2 sm:px-3 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                                  You
                                </span>
                              )}
                              {participant.user_id === competition.creator_id && (
                                <Crown className="w-4 h-4 sm:w-6 sm:h-6 text-yellow-500" />
                              )}
                              <span className={`px-2 sm:px-3 py-1 text-xs font-bold rounded-full ${
                                isCompleted
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-orange-100 text-orange-700'
                              }`}>
                                {isCompleted ? 'FINISHED' : 'IN PROGRESS'}
                              </span>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-4 text-xs sm:text-sm">
                            <div className="flex items-center space-x-1 sm:space-x-2">
                              <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
                              <span className="text-gray-600">Score:</span>
                              <span className="font-bold text-purple-600">
                                {participant.score?.toFixed(1) || '0.0'}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1 sm:space-x-2">
                              <Target className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                              <span className="text-gray-600">Correct:</span>
                              <span className="font-bold text-green-600">
                                {participant.correct_answers || 0}/{competition.questions?.length || 0}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1 sm:space-x-2">
                              <Activity className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                              <span className="text-gray-600">Progress:</span>
                              <span className="font-bold text-blue-600">
                                {isCompleted ? '100%' : `${progressPercentage.toFixed(0)}%`}
                              </span>
                            </div>
                            <div className="flex items-center space-x-1 sm:space-x-2">
                              <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600" />
                              <span className="text-gray-600">Time:</span>
                              <span className="font-bold text-orange-600">
                                {formatTime(participant.time_taken || 0)}
                              </span>
                            </div>
                            {isCompleted && (
                              <div className="flex items-center space-x-1 sm:space-x-2">
                                <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600" />
                                <span className="text-gray-600">Points:</span>
                                <span className="font-bold text-yellow-600">
                                  +{participant.points_earned || 0}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Progress Bar for Active Participants */}
                          {!isCompleted && !isCompetitionFullyComplete && (
                            <div className="mt-3 sm:mt-4">
                              <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                <span>Quiz Progress</span>
                                <span>{participant.questions_answered || 0}/{competition.questions?.length || 0} questions</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <motion.div
                                  className="bg-gradient-to-r from-orange-400 to-yellow-400 h-2 rounded-full transition-all duration-500"
                                  initial={{ width: 0 }}
                                  animate={{ width: `${progressPercentage}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Participant Performance Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="mb-6 sm:mb-8 px-0 sm:px-0"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center">
              <BarChart3 className="w-6 h-6 sm:w-7 sm:h-7 mr-2 sm:mr-3 text-blue-600" />
              Participant Performance Overview
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowParticipantGraph(!showParticipantGraph)}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-sm"
            >
              {showParticipantGraph ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-2" />
                  Hide Graph
                </>
               ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-2" />
                  Show Graph
                </>
              )}
            </Button>
          </div>

          <AnimatePresence>
            {showParticipantGraph && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 sm:mt-6 overflow-hidden"
              >
                <Card className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-200">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={sortedParticipants}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey={(participant) => participant.profile?.full_name || 'Anonymous'}
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        interval={0}
                      />
                      <YAxis />
                      <Tooltip
                        formatter={(value: number, name: string, props: any) => {
                          // Correctly access the participant object from the payload
                          const participant = props.payload?.[0]?.payload;
                          if (!participant) {
                            return ['N/A']; // Handle case where participant is undefined
                          }

                          // Robustly get score and format it
                          const scoreValue = typeof participant.score === 'number' ? participant.score : 0;
                          const formattedScore = scoreValue.toFixed(1);

                          const correctAnswers = participant.correct_answers || 0;
                          const totalQuestions = competition.questions?.length || 0;
                          const timeTaken = participant.time_taken || 0;

                          return [
                            `Score: ${formattedScore}`,
                            `Correct: ${correctAnswers}/${totalQuestions}`,
                            `Time: ${formatTime(timeTaken)}`,
                          ];
                        }}
                        labelFormatter={(label: string) => `Participant: ${label}`}
                      />
                      <Legend />
                      <Bar dataKey="score" fill="#8884d8" name="Score" />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Detailed Analysis Section (using competitionResults) */}
        {competitionResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="mb-6 sm:mb-8 px-0 sm:px-0"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center">
                <BarChart3 className="w-6 h-6 sm:w-7 sm:h-7 mr-2 sm:mr-3 text-purple-600" />
                Detailed Performance Analysis
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDetailedAnalysis(!showDetailedAnalysis)}
                className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 text-sm"
              >
                {showDetailedAnalysis ? (
                  <>
                    <ChevronUp className="w-4 h-4 mr-2" />
                    Hide Details
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-2" />
                    Show Details
                  </>
                )}
              </Button>
            </div>

            <AnimatePresence>
              {showDetailedAnalysis && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 sm:mt-6 overflow-hidden"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-200">
                      <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <Activity className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-blue-600" />
                        Accuracy Rate
                      </h4>
                      <div className="relative">
                        <div className="w-full bg-gray-200 rounded-full h-3 sm:h-4 mb-2">
                          <motion.div
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 sm:h-4 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${competitionResults.accuracyRate}%` }}
                            transition={{ duration: 1, delay: 0.9 }}
                          />
                        </div>
                        <div className="text-xl sm:text-2xl font-bold text-blue-600">{competitionResults.accuracyRate.toFixed(1)}%</div>
                        <p className="text-xs sm:text-sm text-gray-600">
                          {competitionResults.correctAnswers} correct out of {competitionResults.questionsAttempted} attempted
                        </p>
                      </div>
                    </div>

                    <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-200">
                      <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <PieChart className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-purple-600" />
                        Completion Rate
                      </h4>
                      <div className="relative">
                        <div className="w-full bg-gray-200 rounded-full h-3 sm:h-4 mb-2">
                          <motion.div
                            className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 sm:h-4 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: `${competitionResults.completionRate}%` }}
                            transition={{ duration: 1, delay: 0.9 }}
                          />
                        </div>
                        <div className="text-xl sm:text-2xl font-bold text-purple-600">{competitionResults.completionRate.toFixed(1)}%</div>
                        <p className="text-xs sm:text-sm text-gray-600">
                          {competitionResults.questionsAttempted} attempted out of {competitionResults.totalQuestions} total
                        </p>
                      </div>
                    </div>

                    {/* Question Type Performance Chart */}
                    <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-4 gap-2">
                        <h4 className="text-base sm:text-lg font-semibold text-gray-800 mb-4 flex items-center">
                          <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-600" />
                          Performance by Question Type
                        </h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowQuestionTypePerformance(!showQuestionTypePerformance)}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50 text-sm"
                        >
                          {showQuestionTypePerformance ? (
                            <>
                              <ChevronUp className="w-4 h-4 mr-2" />
                              Hide Chart
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4 mr-2" />
                              Show Chart
                            </>
                          )}
                        </Button>
                      </div>
                      <AnimatePresence>
                        {showQuestionTypePerformance && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="mt-4 overflow-hidden"
                          >
                            <ResponsiveContainer width="100%" height={250}>
                              <BarChart data={questionTypePerformanceData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                                <Legend />
                                <Bar dataKey="accuracy" fill="#8884d8" name="Accuracy (%)" />
                              </BarChart>
                            </ResponsiveContainer>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Answer Distribution Chart */}
                    <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-4 gap-2">
                        <h4 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center">
                          <PieChart className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-orange-600" />
                          Answer Distribution
                        </h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowAnswerDistribution(!showAnswerDistribution)}
                          className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 text-sm"
                        >
                          {showAnswerDistribution ? (
                            <>
                              <ChevronUp className="w-4 h-4 mr-2" />
                              Hide Chart
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4 mr-2" />
                              Show Chart
                            </>
                          )}
                        </Button>
                      </div>
                      <AnimatePresence>
                        {showAnswerDistribution && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="mt-4 overflow-hidden"
                          >
                            <ResponsiveContainer width="100%" height={250}>
                              <RechartsPieChart>
                                <Pie
                                  data={answerDistributionData}
                                  cx="50%"
                                  cy="50%"
                                  outerRadius={80}
                                  dataKey="value"
                                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                  {answerDistributionData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                              </RechartsPieChart>
                            </ResponsiveContainer>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Score Progression Chart (New) */}
                    <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-4 gap-2">
                        <h4 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center">
                          <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-teal-600" />
                          Score Progression
                        </h4>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowScoreProgression(!showScoreProgression)}
                          className="text-teal-600 hover:text-teal-700 hover:bg-teal-50 text-sm"
                        >
                          {showScoreProgression ? (
                            <>
                              <ChevronUp className="w-4 h-4 mr-2" />
                              Hide Chart
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4 mr-2" />
                              Show Chart
                            </>
                          )}
                        </Button>
                      </div>
                      <AnimatePresence>
                        {showScoreProgression && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="mt-4 overflow-hidden"
                          >
                            <ResponsiveContainer width="100%" height={250}>
                              <LineChart data={scoreProgressionData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis domain={[0, 100]} />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="score" stroke="#14b8a6" activeDot={{ r: 8 }} />
                              </LineChart>
                            </ResponsiveContainer>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
      )}

          {/* Recommendations */}
          {competitionResults && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              className="mb-6 sm:mb-8 px-0 sm:px-0"
            >
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center">
                <Star className="w-6 h-6 sm:w-7 sm:h-7 mr-2 sm:mr-3 text-yellow-500" />
                Personalized Recommendations
              </h3>
              {competitionResults.comparativePerformance && Object.keys(competitionResults.comparativePerformance).length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0 }}
                  className="p-4 sm:p-6 rounded-2xl border-2 shadow-lg bg-blue-50 border-blue-200 mb-4"
                >
                  <h4 className="font-semibold text-blue-800 mb-2 text-base sm:text-lg flex items-center">
                    <BarChart3 className="w-5 h-5 mr-2" /> Comparative Performance
                  </h4>
                  <ul className="list-disc list-inside text-gray-700 text-sm sm:text-base space-y-1">
                    {competitionResults.comparativePerformance.overall && <li>{competitionResults.comparativePerformance.overall}</li>}
                    {competitionResults.comparativePerformance.topicSpecific && <li>{competitionResults.comparativePerformance.topicSpecific}</li>}
                    {competitionResults.comparativePerformance.difficultySpecific && <li>{competitionResults.comparativePerformance.difficultySpecific}</li>}
                  </ul>
                </motion.div>
              )}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
                {competitionResults.strengths && competitionResults.strengths.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.1 }}
                    className="p-4 sm:p-6 rounded-2xl border-2 shadow-lg bg-green-50 border-green-200"
                  >
                    <h4 className="font-semibold text-green-800 mb-2 text-base sm:text-lg flex items-center">
                      <ThumbsUp className="w-5 h-5 mr-2" /> Strengths
                    </h4>
                    <ul className="list-disc list-inside text-gray-700 text-sm sm:text-base space-y-1">
                      {competitionResults.strengths.map((s: string, i: number) => <li key={i}>{s}</li>)}
                    </ul>
                  </motion.div>
                )}
                {competitionResults.areasForImprovement && competitionResults.areasForImprovement.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.2 }}
                    className="p-4 sm:p-6 rounded-2xl border-2 shadow-lg bg-red-50 border-red-200"
                  >
                    <h4 className="font-semibold text-red-800 mb-2 text-base sm:text-lg flex items-center">
                      <AlertTriangle className="w-5 h-5 mr-2" /> Areas for Improvement
                    </h4>
                    <ul className="list-disc list-inside text-gray-700 text-sm sm:text-base space-y-1">
                      {competitionResults.areasForImprovement.map((w: string, i: number) => <li key={i}>{w}</li>)}
                    </ul>
                  </motion.div>
                )}
                {competitionResults.recommendations && competitionResults.recommendations.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.3 }}
                    className="lg:col-span-2 p-4 sm:p-6 rounded-2xl border-2 shadow-lg bg-blue-50 border-blue-200"
                  >
                    <h4 className="font-semibold text-blue-800 mb-2 text-base sm:text-lg flex items-center">
                      <Lightbulb className="w-5 h-5 mr-2" /> Recommendations
                    </h4>
                    <ul className="list-disc list-inside text-gray-700 text-sm sm:text-base space-y-1">
                      {competitionResults.recommendations.map((r: string, i: number) => <li key={i}>{r}</li>)}
                    </ul>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6"
        >
          <Button
            onClick={onNewCompetition}
            className="gradient-bg hover:opacity-90 transition-all duration-300 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold shadow-xl w-full sm:w-auto"
          >
            <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
            New Competition
          </Button>
          <Button
            onClick={onBackToHome}
            variant="outline"
            className="border-2 border-purple-200 text-purple-600 hover:bg-purple-50 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold w-full sm:w-auto"
          >
            <Home className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
            Back to Home
          </Button>
          <Button
            onClick={handleShareResult}
            variant="outline"
            className="border-2 border-blue-200 text-blue-600 hover:bg-blue-50 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold w-full sm:w-auto"
          >
            <Share2 className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
            Share Result
          </Button>
        </motion.div>
      </div>

      {/* Share Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 sm:p-8 max-w-md mx-4 shadow-2xl w-full"
            >
              <div className="text-center">
                <Share2 className="w-12 h-12 sm:w-16 sm:h-16 text-blue-500 mx-auto mb-4" />
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4">Share Your Result!</h3>
                <p className="text-gray-600 mb-6 text-base sm:text-lg leading-relaxed">
                  Copy the link below to share your competition performance with others.
                </p>
                <div className="flex items-center space-x-2 bg-gray-100 p-3 rounded-lg mb-6">
                  <input
                    type="text"
                    readOnly
                    value={shareLink}
                    className="flex-1 bg-transparent outline-none text-gray-800 text-sm sm:text-base font-mono"
                  />
                  <Button
                    onClick={copyToClipboard}
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 hover:text-blue-600"
                  >
                    {copied ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </Button>
                </div>
                <Button
                  onClick={() => setShowShareModal(false)}
                  className="w-full bg-blue-500 hover:bg-blue-600"
                >
                  Done
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
 
export default CompetitionResults;
