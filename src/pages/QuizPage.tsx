import React, { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { useQuizStore, defaultPreferences } from '../store/useQuizStore';
import { Navigate, useNavigate } from 'react-router-dom';
import ApiKeyForm from '../components/quiz/ApiKeyForm';
import QuizPreferencesForm from '../components/quiz/QuizPreferences';
import QuizQuestion from '../components/quiz/QuizQuestion';
import QuizResults from '../components/quiz/QuizResults';
import { Button } from '../components/ui/Button';
import { RefreshCw, X } from 'lucide-react';

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
  
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);
  const [step, setStep] = useState<'api-key' | 'preferences' | 'quiz' | 'results'>('api-key');
  const [totalTimeRemaining, setTotalTimeRemaining] = useState<number | null>(null);
  
  useEffect(() => {
    if (user) {
      loadApiKey(user.id);
      loadPreferences(user.id);
    }
  }, [user]);
  
  useEffect(() => {
    if (apiKey && !preferences) {
      setStep('preferences');
    } else if (apiKey && preferences && questions.length === 0 && !result) {
      setStep('preferences');
    } else if (questions.length > 0 && !result) {
      setStep('quiz');
      // Initialize total time if set
      if (preferences?.timeLimitEnabled && preferences?.totalTimeLimit) {
        setTotalTimeRemaining(parseInt(preferences.totalTimeLimit));
      }
    } else if (result) {
      setStep('results');
    } else if (!apiKey) {
      setStep('api-key');
    }
  }, [apiKey, preferences, questions, result]);

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
  
  const handleStartQuiz = async () => {
    if (!user) return;
    await generateQuiz(user.id);
    setStep('quiz');
  };
  
  const handleApiKeySaved = () => {
    setStep('preferences');
  };
  
  const handleFinishQuiz = useCallback(() => {
    finishQuiz();
    setStep('results');
    setTotalTimeRemaining(null);
  }, [finishQuiz]);
  
  const handleNewQuiz = () => {
    resetQuiz();
    setTotalTimeRemaining(null);
    setStep('preferences');
  };
  
  const handleChangePreferences = () => {
    resetQuiz();
    setTotalTimeRemaining(null);
    navigate('/preferences');
  };

  const handleCloseQuiz = () => {
    resetQuiz();
    setTotalTimeRemaining(null);
    navigate('/preferences');
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
  
  const renderContent = () => {
    if (!user) return null;
    
    switch (step) {
      case 'api-key':
        return <ApiKeyForm userId={user.id} onSave={handleApiKeySaved} />;
      
      case 'preferences':
        return (
          <div className="space-y-6">
            <QuizPreferencesForm
              userId={user.id}
              initialPreferences={preferences || defaultPreferences}
            />
            
            <div className="flex justify-center">

            </div>
          </div>
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
            <div className="flex justify-end mb-4">
              <Button
                onClick={handleCloseQuiz}
                variant="ghost"
                className="text-gray-600 hover:text-red-600 transition-colors"
              >
                <X className="w-5 h-5 mr-2" />
                Close Quiz
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
      {showSettings && step !== 'api-key' && (
        <div className="mb-8 bg-white p-6 rounded-xl shadow-md border border-gray-100 transition-all duration-300">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">API Key Settings</h2>
          <div className="space-y-4">
            <ApiKeyForm userId={user!.id} />
          </div>
        </div>
      )}
      
      {renderContent()}
    </div>
  );
};

export default QuizPage;