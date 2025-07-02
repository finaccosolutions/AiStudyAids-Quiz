// src/components/competition/CompetitionQuiz.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useCompetitionStore } from '../../store/useCompetitionStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../ui/Button';
import { Card, CardBody } from '../ui/Card';
import {
  Clock, Users, Trophy, Target, Zap,
  CheckCircle, ArrowRight, Crown, Timer,
  Activity, Star, Award, TrendingUp,
  Brain, Eye, EyeOff, XCircle, MessageCircle,
  Send, Sparkles, Volume2, VolumeX, ArrowLeft,
  LogOut, AlertTriangle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Competition } from '../../types/competition';
import { Question } from '../../types';
import { speechService } from '../../services/speech';
import { supabase } from '../../services/supabase';
import QuizQuestion from '../quiz/QuizQuestion';


interface CompetitionQuizProps {
  competition: Competition;
  onComplete: () => void;
  onLeave?: () => void;
}

const CompetitionQuiz: React.FC<CompetitionQuizProps> = ({
  competition,
  onComplete,
  onLeave
}) => {
  console.log('CompetitionQuiz: Received competition prop:', competition);
  const questions = competition.questions || [];

  const { user } = useAuthStore();
  const {
    participants,
    updateParticipantProgress,
    completeCompetition,
    subscribeToCompetition,
    getLiveLeaderboard,
    chatMessages,
    loadChatMessages,
    sendChatMessage,
    subscribeToChat,
    loadParticipants,
    leaveCompetition,
    cancelCompetition
  } = useCompetitionStore();


  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>(
    parseInt(competition.quiz_preferences?.timeLimit || '30')
  );
  const [totalTimeElapsed, setTotalTimeElapsed] = useState(0);
  const [score, setScore] = useState(0);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(0);
  const [incorrectAnswersCount, setIncorrectAnswersCount] = useState(0);
  const [skippedAnswersCount, setSkippedAnswersCount] = useState(0);
  const [questionsAnsweredCount, setQuestionsAnsweredCount] = useState(0);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [showLeaderboard, setShowLeaderboard] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isQuizCompleted, setIsQuizCompleted] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const joinedParticipants = participants.filter(p => p.status === 'joined' || p.status === 'completed');
  const leaderboard = getLiveLeaderboard(competition.id);
  const isCreator = user?.id === competition.creator_id;

  console.log('CompetitionQuiz: questions array:', questions);
  console.log('CompetitionQuiz: currentQuestionIndex:', currentQuestionIndex);
  const currentQuestion = questions[currentQuestionIndex];
  console.log('CompetitionQuiz: currentQuestion:', currentQuestion);
  console.log('CompetitionQuiz: currentQuestion.id:', currentQuestion?.id);

  const calculateScore = useCallback((questionId: number, userAnswer: string) => {
    const question = questions.find(q => q.id === questionId);
    if (!question) {
      console.error('calculateScore: Question not found for ID:', questionId);
      return false;
    }

    console.log('calculateScore: Evaluating question:', question.id, 'Type:', question.type);
    console.log('calculateScore: User Answer:', userAnswer);
    console.log('calculateScore: Correct Answer/Options:', question.correctAnswer || question.correctOptions || question.correctSequence);

    const isSkipped = !userAnswer || userAnswer.trim() === '';
    if (isSkipped) {
      console.log('calculateScore: Answer skipped.');
      return false;
    }

    let isCorrect = false;

    switch (question.type) {
      case 'multiple-choice':
      case 'true-false':
        isCorrect = userAnswer && question.correctAnswer &&
                   userAnswer.toLowerCase() === question.correctAnswer.toLowerCase();
        break;
      case 'multi-select':
        if (userAnswer && question.correctOptions) {
          const userOptions = userAnswer.split(',').sort();
          const correctOptions = question.correctOptions.sort();
          isCorrect = userOptions.length === correctOptions.length &&
                     userOptions.every((opt, index) => opt === correctOptions[index]);
        }
        break;
      case 'sequence':
        if (userAnswer && question.correctSequence) {
          try {
            const userSequence = JSON.parse(userAnswer);
            isCorrect = userSequence.length === question.correctSequence.length &&
                        userSequence.every((step: string, index: number) => step === question.correctSequence![index]);
          } catch (e) {
            console.error("Failed to parse sequence answer:", e);
            isCorrect = false;
          }
        }
        break;
      case 'short-answer':
      case 'fill-blank':
        if (userAnswer && question.correctAnswer) {
          const userLower = userAnswer.toLowerCase().trim();
          const correctLower = question.correctAnswer.toLowerCase().trim();
          isCorrect = userLower === correctLower;

          if (!isCorrect && question.keywords) {
            isCorrect = question.keywords.some(keyword =>
              userLower.includes(keyword.toLowerCase())
            );
          }
        }
        break;
      default:
        isCorrect = false;
    }
    console.log('calculateScore: Is Correct:', isCorrect);
    return isCorrect;
  }, [questions]);

  const handleCompetitionCompletion = useCallback(async (finalScore: number, correctAnswers: number, incorrectAnswers: number, skippedAnswers: number, timeTaken: number, answers: Record<number, string>) => {
    try {
      console.log('Attempting to complete competition with:', {
        competitionId: competition.id,
        userId: user?.id,
        finalScore,
        correctAnswers,
        incorrectAnswers,
        skippedAnswers,
        timeTaken,
        answers
      });

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/competition-completion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          competitionId: competition.id,
          userId: user?.id,
          finalScore,
          correctAnswers,
          incorrectAnswers,
          skippedAnswers,
          timeTaken,
          answers
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          errorData
        });
        throw new Error(errorData.error || 'Failed to complete competition');
      }

      const result = await response.json();
      console.log('Competition completion result:', result);

      return result;
    } catch (error) {
      console.error('Detailed competition completion error:', error);
      try {
        await completeCompetition(competition.id);
      } catch (fallbackError) {
        console.error('Fallback method also failed:', fallbackError);
        throw fallbackError;
      }
    }
  }, [competition.id, user?.id, completeCompetition]);

  const handleNextQuestion = useCallback(async (userAnswerForCurrentQuestion: string) => {
    if (!currentQuestion) {
      console.error('handleNextQuestion: currentQuestion is undefined. Cannot proceed.');
      return;
    }

    if (isQuizCompleted || isSubmitting) return;

    setIsSubmitting(true);

   const userAnswer = userAnswerForCurrentQuestion; // Use the passed argument directly

    console.log('handleNextQuestion: Processing question:', currentQuestion.id, 'with userAnswer:', userAnswer);

    try {
      const isSkipped = !userAnswer || userAnswer.trim() === '';

      const questionId = currentQuestion.id;
      if (questionId === undefined || questionId === null) {
        console.error('handleNextQuestion: currentQuestion.id is undefined or null. Cannot process answer.');
        setIsSubmitting(false);
        return;
      }

      const isCorrect = isSkipped ? false : calculateScore(questionId, userAnswer);

      let newScore = score;
      let newCorrectAnswersCount = correctAnswersCount;
      let newIncorrectAnswersCount = incorrectAnswersCount;
      let newSkippedAnswersCount = skippedAnswersCount;
      let newQuestionsAnsweredCount = questionsAnsweredCount;

      if (isSkipped) {
        newSkippedAnswersCount++;
      } else {
        newQuestionsAnsweredCount++;
        if (isCorrect) {
          newScore += 1;
          newCorrectAnswersCount++;
        } else {
          newIncorrectAnswersCount++;
          if (competition.quiz_preferences?.negativeMarking) {
            newScore += competition.quiz_preferences.negativeMarks || 0;
          }
        }
      }

      setScore(Math.max(0, newScore));
      setCorrectAnswersCount(newCorrectAnswersCount);
      setIncorrectAnswersCount(newIncorrectAnswersCount);
      setSkippedAnswersCount(newSkippedAnswersCount);
      setQuestionsAnsweredCount(newQuestionsAnsweredCount);

      const timeTaken = Math.floor((Date.now() - questionStartTime) / 1000);

      const updatedAnswers = { ...answers, [questionId]: userAnswer };

      setAnswers(updatedAnswers);

      console.log('handleNextQuestion: Calculated values before updateParticipantProgress:');
      console.log('  newScore:', newScore);
      console.log('  newCorrectAnswersCount:', newCorrectAnswersCount);
      console.log('  newIncorrectAnswersCount:', newIncorrectAnswersCount);
      console.log('  newSkippedAnswersCount:', newSkippedAnswersCount);
      console.log('  newQuestionsAnsweredCount:', newQuestionsAnsweredCount);
      console.log('  updatedAnswers:', updatedAnswers);

      if (user?.id) {
        await updateParticipantProgress(
          user.id,
          competition.id,
          updatedAnswers,
          Math.max(0, newScore),
          newCorrectAnswersCount,
          newQuestionsAnsweredCount,
          totalTimeElapsed,
          currentQuestionIndex + 1
        );
      }

      if (isLastQuestion) {
        console.log('Quiz completed, finishing...');
        setIsQuizCompleted(true);

        await handleCompetitionCompletion(
          Math.max(0, newScore),
          newCorrectAnswersCount,
          newIncorrectAnswersCount,
          newSkippedAnswersCount,
          totalTimeElapsed,
          updatedAnswers
        );

        setTimeout(() => {
          onComplete();
        }, 1000);
      } else {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedAnswer('');
        setQuestionStartTime(Date.now());
      }
    } catch (error) {
      console.error('Error handling next question:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    currentQuestion,
    score,
    correctAnswersCount,
    incorrectAnswersCount,
    skippedAnswersCount,
    questionsAnsweredCount,
    isLastQuestion,
    calculateScore,
    competition.id,
    competition.quiz_preferences?.negativeMarking,
    competition.quiz_preferences?.negativeMarks,
    questionStartTime,
    updateParticipantProgress,
    onComplete,
    isQuizCompleted,
    isSubmitting,
    answers,
    totalTimeElapsed,
    handleCompetitionCompletion,
    user?.id,
    selectedAnswer
  ]);

  useEffect(() => {
    if (competition.id) {
      console.log('Setting up quiz subscriptions for competition:', competition.id);
      loadParticipants(competition.id);
      const unsubscribe = subscribeToCompetition(competition.id);
      const unsubscribeChat = subscribeToChat(competition.id);
      loadChatMessages(competition.id);

      return () => {
        console.log('Cleaning up quiz subscriptions');
        unsubscribe();
        unsubscribeChat();
      };
    }
  }, [competition.id, loadParticipants, subscribeToCompetition, subscribeToChat, loadChatMessages]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isQuizCompleted) {
        loadParticipants(competition.id);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [competition.id, loadParticipants, isQuizCompleted]);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    const quizPrefs = competition.quiz_preferences;

    if (!quizPrefs || isQuizCompleted || questions.length === 0) {
      setTimeLeft(null);
      return;
    }

    if (quizPrefs.timeLimitEnabled && quizPrefs.timeLimit && !quizPrefs.totalTimeLimit) {
      const perQuestionLimit = parseInt(quizPrefs.timeLimit);
      if (isNaN(perQuestionLimit) || perQuestionLimit <= 0) {
        setTimeLeft(null);
        return;
      }

      if (currentQuestion && currentQuestion.id !== (questions[currentQuestionIndex - 1]?.id || null)) {
        setTimeLeft(perQuestionLimit);
      }

      if (timeLeft !== null && timeLeft > 0) {
        timer = setTimeout(() => setTimeLeft(prev => (prev !== null ? prev - 1 : null)), 1000);
      } else if (timeLeft === 0) {
        // This will now be handled by onQuestionSubmit -> handleNextQuestion
        // handleNextQuestion();
      }
    }
    else if (quizPrefs.timeLimitEnabled && quizPrefs.totalTimeLimit) {
      const totalLimit = parseInt(quizPrefs.totalTimeLimit);
      if (isNaN(totalLimit) || totalLimit <= 0) {
        setTimeLeft(null);
        return;
      }

      const remaining = totalLimit - totalTimeElapsed;
      setTimeLeft(remaining);

      if (remaining <= 0) {
        handleCompetitionCompletion(score, correctAnswersCount, incorrectAnswersCount, skippedAnswersCount, totalTimeElapsed, answers);
        onComplete();
      } else {
        timer = setTimeout(() => {}, 1000);
      }
    } else {
      setTimeLeft(null);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [
    timeLeft,
    questions.length,
    isQuizCompleted,
    competition.quiz_preferences,
    // handleNextQuestion, // Removed from dependencies as it's called via onQuestionSubmit
    totalTimeElapsed,
    currentQuestion,
    currentQuestionIndex,
    handleCompetitionCompletion,
    onComplete,
    score,
    correctAnswersCount,
    incorrectAnswersCount,
    skippedAnswersCount,
    answers,
    selectedAnswer
  ]);


  useEffect(() => {
      let timer: NodeJS.Timeout;
      if (competition.start_time && questions.length > 0 && !isQuizCompleted) {
        const startTime = new Date(competition.start_time).getTime();
        timer = setInterval(() => {
          const elapsed = Math.floor((Date.now() - startTime) / 1000);
          setTotalTimeElapsed(elapsed);
        }, 1000);
      }
      return () => {
        if (timer) {
          clearInterval(timer);
        }
      };
    }, [competition.start_time, questions.length, isQuizCompleted]);

    // NEW: Re-introduce handleAnswerSelect for QuizQuestion's onAnswer prop
    const handleAnswerSelect = useCallback((answer: string) => {
      if (isQuizCompleted || isSubmitting) return;
      console.log('CompetitionQuiz: handleAnswerSelect: Setting selectedAnswer to:', answer);
      setSelectedAnswer(answer);
    }, [isQuizCompleted, isSubmitting]);

    // NEW: handleQuestionSubmit callback for QuizQuestion's onQuestionSubmit prop
    const handleQuestionSubmit = useCallback((answer: string) => {
      // This function is called by QuizQuestion when an answer is finalized (submitted, next, or timer runs out)
      // We need to ensure the selectedAnswer state is updated before processing the next question.
      // Since QuizQuestion already passes the latest selected answer, we can use it directly.
      setSelectedAnswer(answer); // Update CompetitionQuiz's selectedAnswer state (for display)
    handleNextQuestion(answer); // Pass the answer directly to handleNextQuestion
  }, [setSelectedAnswer, handleNextQuestion]);

  const handleLeaveQuiz = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    console.log('Attempting to leave competition...');
    console.log('User:', user);
    console.log('Is creator:', isCreator);

    try {
        if (isCreator) {
          console.log('User is creator, canceling competition...');
          await cancelCompetition(competition.id);
        }
      console.log('Leaving competition for participant...');
      await leaveCompetition(competition.id);
      if (onLeave) {
        console.log('Calling onLeave callback...');
        onLeave();
      }
    } catch (error) {
      console.error('Error leaving competition:', error);
    } finally {
      setIsSubmitting(false);
      setShowLeaveConfirm(false);
      console.log('Leave process finished.');
    }
  };

  const handleSendMessage = async () => {
    if (chatMessage.trim() && user) {
      await sendChatMessage(competition.id, chatMessage.trim());
      setChatMessage('');
    }
  };

  const playQuestionAudio = () => {
    if (!currentQuestion) return;

    if (isSpeaking) {
      speechService.stop();
      setIsSpeaking(false);
    } else {
      speechService.speak(currentQuestion.text, competition.quiz_preferences?.language || 'English');
      setIsSpeaking(true);

      const checkSpeakingInterval = setInterval(() => {
        if (!speechService.isSpeaking()) {
          setIsSpeaking(false);
          clearInterval(checkSpeakingInterval);
        }
      }, 100);
    }
  };

  const formatTime = (seconds: number | null | undefined) => {
  if (seconds === null || seconds === undefined || isNaN(seconds)) {
    return '00:00';
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};


  const getProgressPercentage = (participant: any) => {
    const questionsAnswered = participant.questions_answered || 0;
    return (questionsAnswered / questions.length) * 100;
  };

  if (!questions.length || !currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center text-white"
        >
          <XCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
          <h2 className="text-2xl font-bold mb-2">No Questions Available or Quiz Not Ready</h2>
          <p className="text-white/80">Please wait while questions are loaded, or return to the lobby.</p>
          <Button
            onClick={onLeave}
            variant="outline"
            className="mt-6 border-white text-white hover:bg-white hover:text-gray-800"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Lobby
          </Button>
        </motion.div>
      </div>
    );
  }


  if (isQuizCompleted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center text-white"
        >
          <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
          <h2 className="text-2xl font-bold mb-2">Quiz Completed!</h2>
          <p className="text-white/80">Processing results and updating rankings...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="bg-black bg-opacity-30 backdrop-blur-sm border-b border-white border-opacity-20 py-2 sm:py-4">
        <div className="w-full px-2 sm:px-4">
          <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center space-x-1 sm:space-x-4">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <span className="text-base sm:text-xl font-bold text-white">{competition.title}</span>
                {isCreator && (
                  <span className="px-1.5 py-0.5 bg-yellow-500 text-yellow-900 text-xs font-bold rounded-full">
                    CREATOR
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Target className="w-4 h-4 sm:w-5 h-5 text-blue-400" />
                <span className="text-sm sm:text-base text-white">Question {currentQuestionIndex + 1}/{questions.length}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              {competition.quiz_preferences?.timeLimitEnabled && (
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg ${
                  timeLeft !== null && timeLeft <= 10 ? 'bg-red-500 bg-opacity-30' : 'bg-white bg-opacity-20'
                }`}>
                  <Clock className={`w-4 h-4 ${timeLeft !== null && timeLeft <= 10 ? 'text-red-300' : 'text-white'}`} />
                  <span className={`font-mono text-sm font-bold ${
                    timeLeft !== null && timeLeft <= 10 ? 'text-red-300' : 'text-white'
                  }`}>
                    {timeLeft !== null ? formatTime(timeLeft) : 'N/A'}
                  </span>
                </div>
              )}
              <div className="flex items-center space-x-1 bg-white bg-opacity-20 px-2 py-1 rounded-lg">
                <Timer className="w-4 h-4 text-cyan-400" />
                <span className="font-mono text-sm font-bold text-white">{formatTime(totalTimeElapsed)}</span>
              </div>
              <div className="flex items-center space-x-1 bg-white bg-opacity-20 px-2 py-1 rounded-lg">
                <Zap className="w-4 h-4 text-green-400" />
                <span className="font-bold text-sm text-white">{score.toFixed(1)} pts</span>
              </div>
              <button
                onClick={() => setShowLeaderboard(!showLeaderboard)}
                className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-white bg-opacity-20 hover:bg-opacity-30 transition-all text-white"
              >
                {showLeaderboard ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                <span className="text-xs">Leaderboard</span>
              </button>
              <button
                onClick={() => setShowChat(!showChat)}
                className="flex items-center space-x-1 px-2 py-1 rounded-lg bg-white bg-opacity-20 hover:bg-opacity-30 transition-all text-white"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="text-sm">Chat</span>
              </button>
              <button
                onClick={() => setShowLeaveConfirm(true)}
                disabled={isSubmitting}
                className={`flex items-center space-x-1 px-2 py-1 rounded-lg bg-red-500 bg-opacity-30 hover:bg-opacity-50 transition-all text-red-200 hover:text-white ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Leave</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-0 sm:px-4 py-8">
        <div className={showLeaderboard ? 'lg:col-span-3' : 'w-full'}>
          <div className={showLeaderboard ? 'lg:col-span-3' : 'w-full max-w-full mx-auto'}>
            {currentQuestion && (
              <QuizQuestion
                question={currentQuestion}
                questionNumber={currentQuestionIndex + 1}
                totalQuestions={questions.length}
                userAnswer={answers[currentQuestion.id]}
                onAnswer={handleAnswerSelect}
                onPrevious={() => {}}
                isLastQuestion={isLastQuestion}
                language={competition.quiz_preferences?.language || 'English'}
                timeLimitEnabled={competition.quiz_preferences?.timeLimitEnabled || false}
                timeLimit={competition.quiz_preferences?.timeLimit}
                totalTimeLimit={competition.quiz_preferences?.totalTimeLimit}
                totalTimeRemaining={timeLeft}
                mode="exam"
                answerMode="immediate"
                showQuitButton={true}
                onQuitQuiz={() => setShowLeaveConfirm(true)}
                displayHeader={false}
                showPreviousButton={false}
                onQuestionSubmit={handleQuestionSubmit} 
              />
            )}
          </div>

          <AnimatePresence>
            {showLeaderboard && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="lg:col-span-1"
              >
                <Card className="bg-white bg-opacity-98 backdrop-blur-sm border-0 shadow-2xl h-fit sticky top-4">
                  <CardBody className="p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                      <Users className="w-5 h-5 mr-2 text-purple-600" />
                      Live Rankings ({joinedParticipants.length})
                    </h3>

                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {joinedParticipants.map((participant, index) => {
                        const participantScore = typeof participant.score === 'number' ? participant.score : 0;
                        return (
                          <motion.div
                            key={participant.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className={`p-3 rounded-lg border-2 ${
                              participant.user_id === user?.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200 bg-white'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                                index === 0 ? 'bg-yellow-500' :
                                index === 1 ? 'bg-gray-400' :
                                index === 2 ? 'bg-orange-500' :
                                'bg-gray-300'
                              }`}>
                                {index === 0 ? <Crown className="w-4 h-4" /> : index + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-800 truncate">
                                  {participant.profile?.full_name || 'Anonymous'}
                                  {participant.user_id === user?.id && ' (You)'}
                                  {participant.user_id === competition.creator_id && ' (Creator)'}
                                </p>
                                <div className="flex items-center space-x-2 text-xs text-gray-600">
                                  <span>{participantScore.toFixed(1)} pts</span>
                                  <span>•</span>
                                  <span>{participant.correct_answers || 0}/{questions.length}</span>
                                  <span>•</span>
                                  <span>{formatTime(participant.time_taken || 0)}</span>
                                </div>

                                <div className="mt-2">
                                  <div className="w-full bg-gray-200 rounded-full h-1">
                                    <div
                                      className="bg-gradient-to-r from-purple-500 to-indigo-500 h-1 rounded-full transition-all duration-300"
                                      style={{ width: `${getProgressPercentage(participant)}%` }}
                                    />
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {participant.questions_answered || 0}/{questions.length} answered
                                    {participant.status === 'completed' && (
                                      <span className="ml-2 text-green-600 font-medium">✓ Completed</span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex flex-col items-center space-y-1">
                                <div className={`w-2 h-2 rounded-full ${
                                  participant.is_online ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
                                }`} />
                                <Activity className="w-3 h-3 text-gray-400" />
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>

                    <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg border border-purple-200">
                      <h4 className="font-semibold text-purple-800 mb-3 flex items-center">
                        <Star className="w-4 h-4 mr-2" />
                        Your Progress
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Correct:</span>
                          <span className="font-medium text-gray-800">{correctAnswersCount}/{questions.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Incorrect:</span>
                          <span className="font-medium text-gray-800">{incorrectAnswersCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Skipped:</span>
                          <span className="font-medium text-gray-800">{skippedAnswersCount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Score:</span>
                          <span className="font-medium text-gray-800">{score.toFixed(1)} pts</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Rank:</span>
                          <span className="font-medium text-gray-800">
                            {joinedParticipants.findIndex(p => p.user_id === user?.id) + 1}/{joinedParticipants.length}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {showChat && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-8"
            >
              <Card className="bg-white bg-opacity-98 backdrop-blur-sm border-0 shadow-2xl">
                <CardBody className="p-0">
                  <div className="h-60 overflow-y-auto p-4 space-y-3 bg-gradient-to-br from-slate-50 to-indigo-50">
                    {chatMessages.length === 0 ? (
                      <div className="text-center text-slate-500 py-8">
                        <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No messages yet</p>
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
                            className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                              message.user_id === user?.id
                                ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white'
                                : 'bg-white text-slate-800 border border-slate-200'
                            }`}
                          >
                            <p className="text-xs font-medium mb-1 opacity-75">
                              {message.profile?.full_name || 'Anonymous'}
                            </p>
                            <p>{message.message}</p>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                  <div className="p-4 border-t border-slate-200 bg-white">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type a message..."
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm text-gray-800"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!chatMessage.trim()}
                        size="sm"
                        className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showLeaveConfirm && (
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
                className="bg-white rounded-xl p-6 max-w-md mx-4 shadow-2xl"
              >
                <div className="flex items-center mb-4">
                  <AlertTriangle className="w-6 h-6 text-red-500 mr-3" />
                  <h3 className="text-lg font-bold text-gray-800">Leave Competition?</h3>
                </div>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to leave this quiz? Your progress will be lost and you won't be able to rejoin.
                  {isCreator && (
                    <span className="block mt-2 text-orange-600 font-medium">
                      As the creator, leaving will end the competition for all participants.
                    </span>
                  )}
                </p>
                <div className="flex space-x-3">
                  <Button
                    onClick={() => setShowLeaveConfirm(false)}
                    variant="outline"
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleLeaveQuiz}
                    disabled={isSubmitting}
                    className="flex-1 bg-red-500 hover:bg-red-600"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Leaving...
                      </>
                    ) : (
                      <>
                        <LogOut className="w-4 h-4 mr-2" />
                        Leave
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CompetitionQuiz;
