import React, { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useQuizStore, defaultPreferences } from '../store/useQuizStore';
import { useCompetitionStore } from '../store/useCompetitionStore';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import ApiKeyForm from '../components/quiz/ApiKeyForm';
import QuizModeSelector from '../components/quiz/QuizModeSelector';
import QuizPreferencesForm from '../components/quiz/QuizPreferences';
import JoinCompetitionForm from '../components/quiz/JoinCompetitionForm';
import RandomMatchmaking from '../components/competition/RandomMatchmaking';
import QuizQuestion from '../components/quiz/QuizQuestion';
import QuizResults from '../components/quiz/QuizResults';
import CompetitionLobby from '../components/competition/CompetitionLobby';
import CompetitionQuiz from '../components/competition/CompetitionQuiz';
import CompetitionResults from '../components/competition/CompetitionResults';
import { Button } from '../components/ui/Button';
import { ArrowLeft } from 'lucide-react';

const QuizPage: React.FC = () => {
  const { user, isLoggedIn } = useAuthStore();
  const { 
    apiKey, loadApiKey, 
    preferences, loadPreferences, 
    questions, generateQuiz, 
    currentQuestionIndex, answers, answerQuestion, 
    nextQuestion, prevQuestion, 
    finishQuiz, resetQuiz, result 
  } = useQuizStore();
  
  const {
    currentCompetition,
    loadCompetition,
    participants,
    loadParticipants
  } = useCompetitionStore();
  
  const navigate = useNavigate();
  const location = useLocation();
  
  const [step, setStep] = useState<
    'api-key' | 'mode-selector' | 'solo-preferences' | 'create-competition' | 
    'join-competition' | 'random-match' | 'quiz' | 'results' | 
    'competition-lobby' | 'competition-quiz' | 'competition-results'
  >('api-key');
  
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [totalTimeRemaining, setTotalTimeRemaining] = useState<number | null>(null);
  const [competitionQuestions, setCompetitionQuestions] = useState<any[]>([]);
  
  useEffect(() => {
    if (user) {
      loadApiKey(user.id);
      loadPreferences(user.id);
    }
  }, [user]);

  useEffect(() => {
    // Handle competition mode from location state
    if (location.state?.mode === 'competition-lobby' && location.state?.competitionId) {
      loadCompetition(location.state.competitionId);
      setStep('competition-lobby');
      return;
    }

    // Determine initial step based on current state
    if (!apiKey) {
      setStep('api-key');
    } else if (result) {
      setStep('results');
    } else if (questions.length > 0) {
      setStep('quiz');
      // Initialize total time if set
      if (preferences?.timeLimitEnabled && preferences?.totalTimeLimit) {
        setTotalTimeRemaining(parseInt(preferences.totalTimeLimit));
      }
    } else {
      setStep('mode-selector');
    }
  }, [apiKey, preferences, questions, result, location.state]);

  // Total quiz timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (totalTimeRemaining !== null && totalTimeRemaining > 0 && step === 'quiz') {
      timer = setInterval(() => {
        setTotalTimeRemaining(prev => {
          if (prev === null || prev <= 0) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (totalTimeRemaining === 0) {
      handleFinishQuiz();
    }
    return () => clearInterval(timer);
  }, [totalTimeRemaining, step]);
  
  if (!isLoggedIn) {
    return <Navigate to="/auth" />;
  }
  
  const handleApiKeySaved = () => {
    setStep('mode-selector');
  };

  const handleModeSelect = (mode: 'solo' | 'create-competition' | 'join-competition' | 'random-match') => {
    setSelectedMode(mode);
    switch (mode) {
      case 'solo':
        setStep('solo-preferences');
        break;
      case 'create-competition':
        setStep('create-competition');
        break;
      case 'join-competition':
        setStep('join-competition');
        break;
      case 'random-match':
        setStep('random-match');
        break;
    }
  };

  const handleBackToModeSelector = () => {
    resetQuiz();
    setSelectedMode(null);
    setTotalTimeRemaining(null);
    setStep('mode-selector');
  };
  
  const handleStartSoloQuiz = async () => {
    if (!user) return;
    await generateQuiz(user.id);
    setStep('quiz');
  };
  
  const handleFinishQuiz = useCallback(() => {
    finishQuiz();
    setStep('results');
    setTotalTimeRemaining(null);
  }, [finishQuiz]);
  
  const handleNewQuiz = () => {
    resetQuiz();
    setTotalTimeRemaining(null);
    setStep('mode-selector');
  };
  
  const handleChangePreferences = () => {
    resetQuiz();
    setTotalTimeRemaining(null);
    if (selectedMode === 'solo') {
      setStep('solo-preferences');
    } else {
      setStep('mode-selector');
    }
  };

  const handleAnswerSubmit = useCallback(() => {
    // This will be called from QuizQuestion when answer is submitted
  }, []);

  const handleNext = useCallback(() => {
    nextQuestion();
  }, [nextQuestion]);

  const handlePrevious = useCallback(() => {
    prevQuestion();
  }, [prevQuestion]);

  // Competition handlers
  const handleJoinSuccess = () => {
    setStep('competition-lobby');
  };

  const handleMatchFound = (competitionId: string) => {
    // In real implementation, load the competition and go to lobby
    setStep('competition-lobby');
  };

  const handleStartCompetitionQuiz = async () => {
    if (!currentCompetition || !user || !apiKey) return;

    try {
      // Generate questions for competition
      const { generateQuiz } = await import('../services/gemini');
      const questions = await generateQuiz(apiKey, currentCompetition.quiz_preferences);
      setCompetitionQuestions(questions);
      setStep('competition-quiz');
    } catch (error) {
      console.error('Failed to generate competition questions:', error);
    }
  };

  const handleCompetitionComplete = () => {
    setStep('competition-results');
  };

  const handleNewCompetition = () => {
    setStep('mode-selector');
  };

  const handleBackToHome = () => {
    navigate('/');
  };
  
  const renderContent = () => {
    if (!user) return null;
    
    switch (step) {
      case 'api-key':
        return <ApiKeyForm userId={user.id} onSave={handleApiKeySaved} />;
      
      case 'mode-selector':
        return <QuizModeSelector onSelectMode={handleModeSelect} />;

      case 'solo-preferences':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="ghost"
                onClick={handleBackToModeSelector}
                className="text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Quiz Modes
              </Button>
            </div>
            <QuizPreferencesForm
              userId={user.id}
              initialPreferences={preferences || defaultPreferences}
              onSave={handleStartSoloQuiz}
            />
          </div>
        );

      case 'create-competition':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="ghost"
                onClick={handleBackToModeSelector}
                className="text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Quiz Modes
              </Button>
            </div>
            <QuizPreferencesForm
              userId={user.id}
              initialPreferences={preferences || defaultPreferences}
              onStartCompetition={() => setStep('competition-lobby')}
            />
          </div>
        );

      case 'join-competition':
        return (
          <JoinCompetitionForm
            onJoinSuccess={handleJoinSuccess}
            onCancel={handleBackToModeSelector}
          />
        );

      case 'random-match':
        return (
          <RandomMatchmaking
            onMatchFound={handleMatchFound}
            onCancel={handleBackToModeSelector}
          />
        );

      case 'competition-lobby':
        if (!currentCompetition) {
          return <div>Loading competition...</div>;
        }
        return (
          <CompetitionLobby
            competition={currentCompetition}
            onStartQuiz={handleStartCompetitionQuiz}
          />
        );

      case 'competition-quiz':
        if (!currentCompetition || competitionQuestions.length === 0) {
          return <div>Loading quiz...</div>;
        }
        return (
          <CompetitionQuiz
            competition={currentCompetition}
            questions={competitionQuestions}
            onComplete={handleCompetitionComplete}
          />
        );

      case 'competition-results':
        if (!currentCompetition) {
          return <div>Loading results...</div>;
        }
        return (
          <CompetitionResults
            competition={currentCompetition}
            onNewCompetition={handleNewCompetition}
            onBackToHome={handleBackToHome}
          />
        );
      
      case 'quiz':
        if (currentQuestionIndex < 0 || currentQuestionIndex >= questions.length) {
          return null;
        }
        
        const currentQuestion = questions[currentQuestionIndex];
        if (!currentQuestion || !preferences) {
          return null;
        }
        
        return (
          <div className="max-w-4xl mx-auto px-2 sm:px-4">
            <div className="flex justify-between items-center mb-4">
              <Button
                variant="ghost"
                onClick={handleBackToModeSelector}
                className="text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Quiz Modes
              </Button>
            </div>
            <QuizQuestion
              question={currentQuestion}
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={questions.length}
              userAnswer={answers[currentQuestion.id]}
              onAnswer={(answer) => answerQuestion(currentQuestion.id, answer)}
              onPrevious={handlePrevious}
              onNext={handleNext}
              isLastQuestion={currentQuestionIndex === questions.length - 1}
              onFinish={handleFinishQuiz}
              language={preferences.language || 'en'}
              timeLimitEnabled={preferences.timeLimitEnabled || false}
              timeLimit={preferences.timeLimit}
              totalTimeLimit={preferences.totalTimeLimit}
              totalTimeRemaining={totalTimeRemaining}
              mode={preferences.mode || 'practice'}
              answerMode={preferences.mode === 'practice' ? 'immediate' : 'end'}
            />
          </div>
        );
      
      case 'results':
        if (!result) return null;
        
        return (
          <div className="max-w-4xl mx-auto px-2 sm:px-4">
            <QuizResults
              result={result}
              onNewQuiz={handleNewQuiz}
              onChangePreferences={handleChangePreferences}
            />
          </div>
        );
    }
  };
  
  return (
    <div className="relative min-h-screen bg-gray-50">
      {renderContent()}
    </div>
  );
};

export default QuizPage;