import React, { useState, useEffect, useCallback } from 'react';
import { useCompetitionStore } from '../../store/useCompetitionStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../ui/Button';
import { Card, CardBody } from '../ui/Card';
import { 
  Clock, Users, Trophy, Target, Zap, 
  CheckCircle, ArrowRight, Crown, Timer
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Competition } from '../../types/competition';
import { Question } from '../../types';

interface CompetitionQuizProps {
  competition: Competition;
  questions: Question[];
  onComplete: () => void;
}

const CompetitionQuiz: React.FC<CompetitionQuizProps> = ({
  competition,
  questions,
  onComplete
}) => {
  const { user } = useAuthStore();
  const { 
    participants, 
    updateParticipantProgress,
    completeCompetition,
    subscribeToCompetition
  } = useCompetitionStore();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>(
    parseInt(competition.quiz_preferences?.timeLimit || '30')
  );
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [startTime] = useState(Date.now());
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const joinedParticipants = participants.filter(p => p.status === 'joined' || p.status === 'completed');

  useEffect(() => {
    if (competition.id) {
      const unsubscribe = subscribeToCompetition(competition.id);
      return unsubscribe;
    }
  }, [competition.id]);

  useEffect(() => {
    setQuestionStartTime(Date.now());
    setTimeLeft(parseInt(competition.quiz_preferences?.timeLimit || '30'));
  }, [currentQuestionIndex]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      handleNextQuestion();
    }
  }, [timeLeft]);

  const calculateScore = useCallback((questionId: number, userAnswer: string) => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return false;

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
      default:
        isCorrect = userAnswer && question.correctAnswer && 
                   userAnswer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();
    }

    return isCorrect;
  }, [questions]);

  const handleAnswerSelect = (answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: answer
    }));
  };

  const handleNextQuestion = useCallback(async () => {
    const userAnswer = answers[currentQuestion.id] || '';
    const isCorrect = calculateScore(currentQuestion.id, userAnswer);
    
    let newScore = score;
    let newCorrectAnswers = correctAnswers;
    
    if (isCorrect) {
      newScore += 1;
      newCorrectAnswers += 1;
    } else if (userAnswer) {
      // Apply negative marking for wrong answers
      newScore -= 0.25;
    }
    
    setScore(Math.max(0, newScore));
    setCorrectAnswers(newCorrectAnswers);

    // Update progress in real-time
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    await updateParticipantProgress(
      competition.id,
      answers,
      Math.max(0, newScore),
      newCorrectAnswers,
      timeTaken
    );

    if (isLastQuestion) {
      await completeCompetition(competition.id);
      onComplete();
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  }, [
    currentQuestion, 
    answers, 
    score, 
    correctAnswers, 
    isLastQuestion, 
    calculateScore,
    competition.id,
    startTime,
    updateParticipantProgress,
    completeCompetition,
    onComplete
  ]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const renderQuestionContent = () => {
    switch (currentQuestion.type) {
      case 'multiple-choice':
        return (
          <div className="space-y-4">
            {currentQuestion.options?.map((option, index) => (
              <motion.button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-300 ${
                  answers[currentQuestion.id] === option
                    ? 'border-purple-500 bg-purple-50 shadow-lg'
                    : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    answers[currentQuestion.id] === option
                      ? 'border-purple-600 bg-purple-600'
                      : 'border-gray-400'
                  }`}>
                    {answers[currentQuestion.id] === option && (
                      <CheckCircle className="w-4 h-4 text-white" />
                    )}
                  </div>
                  <span className="font-medium">{option}</span>
                </div>
              </motion.button>
            ))}
          </div>
        );

      case 'true-false':
        return (
          <div className="flex space-x-4">
            {['True', 'False'].map((option) => (
              <motion.button
                key={option}
                onClick={() => handleAnswerSelect(option)}
                className={`flex-1 py-6 px-8 rounded-xl font-bold text-lg transition-all duration-300 ${
                  answers[currentQuestion.id] === option
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-xl'
                    : 'bg-gray-100 text-gray-700 hover:bg-purple-100'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {option}
              </motion.button>
            ))}
          </div>
        );

      default:
        return (
          <input
            type="text"
            placeholder="Type your answer..."
            value={answers[currentQuestion.id] || ''}
            onChange={(e) => handleAnswerSelect(e.target.value)}
            className="w-full p-4 text-lg border-2 border-gray-300 rounded-xl focus:border-purple-500 focus:outline-none"
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      {/* Header with live stats */}
      <div className="bg-black bg-opacity-20 backdrop-blur-sm border-b border-white border-opacity-20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Trophy className="w-6 h-6 text-yellow-400" />
                <span className="text-xl font-bold">{competition.title}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-blue-400" />
                <span>Question {currentQuestionIndex + 1}/{questions.length}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                timeLeft <= 10 ? 'bg-red-500 bg-opacity-20' : 'bg-white bg-opacity-10'
              }`}>
                <Clock className={`w-5 h-5 ${timeLeft <= 10 ? 'text-red-400' : 'text-white'}`} />
                <span className={`font-mono text-lg font-bold ${
                  timeLeft <= 10 ? 'text-red-400' : 'text-white'
                }`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-green-400" />
                <span className="font-bold">{score.toFixed(1)} pts</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Quiz Area */}
          <div className="lg:col-span-3">
            <Card className="bg-white bg-opacity-95 backdrop-blur-sm border-0 shadow-2xl">
              <CardBody className="p-8">
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
                      {currentQuestion.difficulty} • {currentQuestion.type}
                    </span>
                    <div className="w-full bg-gray-200 rounded-full h-2 mx-4">
                      <motion.div
                        className="bg-gradient-to-r from-purple-500 to-indigo-500 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">
                    {currentQuestion.text}
                  </h2>
                  
                  {renderQuestionContent()}
                </div>

                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">
                    Time per question: {competition.quiz_preferences?.timeLimit}s
                  </div>
                  <Button
                    onClick={handleNextQuestion}
                    disabled={!answers[currentQuestion.id]}
                    className="gradient-bg hover:opacity-90 transition-all duration-300 px-8 py-3"
                  >
                    {isLastQuestion ? 'Finish' : 'Next'}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Live Leaderboard */}
          <div className="lg:col-span-1">
            <Card className="bg-white bg-opacity-95 backdrop-blur-sm border-0 shadow-2xl h-fit">
              <CardBody className="p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-purple-600" />
                  Live Rankings
                </h3>
                
                <div className="space-y-3">
                  {joinedParticipants
                    .sort((a, b) => {
                      if (b.score !== a.score) return b.score - a.score;
                      return a.time_taken - b.time_taken;
                    })
                    .map((participant, index) => (
                      <motion.div
                        key={participant.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-3 rounded-lg border-2 ${
                          participant.user_id === user?.id
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 bg-white'
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
                            </p>
                            <div className="flex items-center space-x-2 text-xs text-gray-600">
                              <span>{participant.score.toFixed(1)} pts</span>
                              <span>•</span>
                              <span>{participant.correct_answers}/{questions.length}</span>
                              <span>•</span>
                              <span>{formatTime(participant.time_taken)}</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                </div>

                <div className="mt-6 p-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                    <Timer className="w-4 h-4 mr-2 text-purple-600" />
                    Your Progress
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Correct:</span>
                      <span className="font-medium">{correctAnswers}/{questions.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Score:</span>
                      <span className="font-medium">{score.toFixed(1)} pts</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time:</span>
                      <span className="font-medium">{formatTime(Math.floor((Date.now() - startTime) / 1000))}</span>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompetitionQuiz;