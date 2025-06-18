import React, { useState, useEffect, useCallback } from 'react';
import { Question } from '../../types';
import { Competition, CompetitionParticipant } from '../../types/competition';
import { Button } from '../ui/Button';
import { Card, CardBody } from '../ui/Card';
import { 
  Clock, Users, Trophy, Target, Zap, 
  ArrowRight, ArrowLeft, CheckCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCompetitionStore } from '../../store/useCompetitionStore';
import QuizQuestion from '../quiz/QuizQuestion';

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
  const { 
    participants, 
    updateParticipantProgress, 
    completeCompetition,
    subscribeToCompetition 
  } = useCompetitionStore();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [score, setScore] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);

  useEffect(() => {
    const unsubscribe = subscribeToCompetition(competition.id);
    return unsubscribe;
  }, [competition.id]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Update progress every 5 seconds
  useEffect(() => {
    const progressTimer = setInterval(() => {
      updateParticipantProgress(
        competition.id,
        answers,
        score,
        correctAnswers,
        timeElapsed
      );
    }, 5000);

    return () => clearInterval(progressTimer);
  }, [answers, score, correctAnswers, timeElapsed]);

  const handleAnswer = useCallback((questionId: number, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  }, []);

  const handleNext = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  }, [currentQuestionIndex, questions.length]);

  const handlePrevious = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  }, [currentQuestionIndex]);

  const handleFinish = useCallback(async () => {
    // Calculate final score
    let finalScore = 0;
    let finalCorrectAnswers = 0;

    questions.forEach(question => {
      const userAnswer = answers[question.id];
      if (userAnswer && question.correctAnswer) {
        if (userAnswer.toLowerCase() === question.correctAnswer.toLowerCase()) {
          finalScore += 1;
          finalCorrectAnswers += 1;
        }
      }
    });

    // Apply negative marking if enabled
    if (competition.quiz_preferences.negativeMarking) {
      const incorrectAnswers = Object.keys(answers).length - finalCorrectAnswers;
      finalScore += incorrectAnswers * (competition.quiz_preferences.negativeMarks || 0);
    }

    setScore(finalScore);
    setCorrectAnswers(finalCorrectAnswers);

    // Update final progress
    await updateParticipantProgress(
      competition.id,
      answers,
      finalScore,
      finalCorrectAnswers,
      timeElapsed
    );

    // Mark as completed
    await completeCompetition(competition.id);
    onComplete();
  }, [answers, questions, timeElapsed, competition]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const answeredQuestions = Object.keys(answers).length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Competition Header */}
      <div className="mb-8">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 rounded-2xl shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold">{competition.title}</h1>
              <p className="text-purple-100">Live Competition</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{formatTime(timeElapsed)}</div>
                <div className="text-sm text-purple-200">Time Elapsed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">{currentQuestionIndex + 1}/{questions.length}</div>
                <div className="text-sm text-purple-200">Question</div>
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-purple-400 rounded-full h-2">
            <motion.div
              className="bg-white h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Quiz Area */}
        <div className="lg:col-span-3">
          <QuizQuestion
            question={currentQuestion}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={questions.length}
            userAnswer={answers[currentQuestion.id]}
            onAnswer={handleAnswer}
            onPrevious={handlePrevious}
            onNext={handleNext}
            isLastQuestion={currentQuestionIndex === questions.length - 1}
            onFinish={handleFinish}
            language={competition.quiz_preferences.language}
            timeLimitEnabled={false} // No individual time limits in competition
            mode="exam" // Always exam mode for competitions
            answerMode="end"
          />
        </div>

        {/* Live Leaderboard */}
        <div className="space-y-6">
          {/* Current Stats */}
          <Card>
            <CardBody>
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto">
                  <Target className="w-8 h-8 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Your Progress</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Answered:</span>
                      <span className="font-medium">{answeredQuestions}/{questions.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time:</span>
                      <span className="font-medium">{formatTime(timeElapsed)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Progress:</span>
                      <span className="font-medium">{Math.round(progress)}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Live Participants */}
          <Card>
            <CardBody>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-gray-900">Live Standings</h3>
                </div>
                
                <div className="space-y-3">
                  {participants
                    .filter(p => p.status === 'joined' || p.status === 'completed')
                    .sort((a, b) => {
                      if (b.score !== a.score) return b.score - a.score;
                      return a.time_taken - b.time_taken;
                    })
                    .map((participant, index) => (
                      <motion.div
                        key={participant.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex items-center space-x-3 p-3 rounded-lg ${
                          index === 0 ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                          index === 0 ? 'bg-yellow-500' : 
                          index === 1 ? 'bg-gray-400' : 
                          index === 2 ? 'bg-orange-400' : 'bg-purple-500'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">
                            {participant.profile?.full_name || 'Anonymous'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {participant.correct_answers} correct • {formatTime(participant.time_taken)}
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          {participant.status === 'completed' && (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                          <span className="text-sm font-medium">{participant.score}</span>
                        </div>
                      </motion.div>
                    ))}
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Quick Navigation */}
          <Card>
            <CardBody>
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <Zap className="w-4 h-4 mr-2 text-purple-600" />
                  Quick Navigation
                </h3>
                
                <div className="grid grid-cols-5 gap-2">
                  {questions.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentQuestionIndex(index)}
                      className={`w-8 h-8 rounded text-xs font-medium transition-all ${
                        index === currentQuestionIndex
                          ? 'bg-purple-600 text-white'
                          : answers[questions[index].id]
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CompetitionQuiz;