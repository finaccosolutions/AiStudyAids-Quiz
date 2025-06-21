import { supabase } from '../services/supabase';
import React, { useEffect, useState, useCallback, useRef } from 'react';
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
import CompetitionManagement from '../components/competition/CompetitionManagement';
import { Button } from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';
import { ArrowLeft, Trophy, Users, Clock } from 'lucide-react';
import { Question } from '../types';
import { motion } from 'framer-motion';

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
    loadUserCompetitions,
    loadUserActiveCompetitions,
    userActiveCompetitions,
    participants,
    loadParticipants,
    clearCurrentCompetition
  } = useCompetitionStore();
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Use refs to prevent unnecessary re-renders and state resets
  const isInitializedRef = useRef(false);
  const currentStepRef = useRef<string>('api-key');
  
  const [step, setStep] = useState<
    'api-key' | 'mode-selector' | 'solo-preferences' | 'create-competition' | 
    'join-competition' | 'random-match' | 'quiz' | 'results' | 
    'competition-lobby' | 'competition-quiz' | 'competition-results' |
    'competition-management' | 'active-competitions-selector'
  >('api-key');
  
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [totalTimeRemaining, setTotalTimeRemaining] = useState<number | null>(null);
  const [competitionQuestions, setCompetitionQuestions] = useState<Question[]>([]);
  
  // Prevent auto-refresh by using a stable initialization effect
  useEffect(() => {
    if (!user || isInitializedRef.current) return;
    
    const initializeQuizPage = async () => {
      try {
        await Promise.all([
          loadApiKey(user.id),
          loadPreferences(user.id),
          loadUserCompetitions(user.id)
        ]);
        isInitializedRef.current = true;
      } catch (error) {
        console.error('Failed to initialize quiz page:', error);
      }
    };

    initializeQuizPage();
  }, [user, loadApiKey, loadPreferences, loadUserCompetitions]);

  // Separate effect for step determination to prevent loops
  useEffect(() => {
    if (!isInitializedRef.current) return;

    const determineStep = async () => {
      try {
        // Handle competition mode from location state
        if (location.state?.mode === 'competition-lobby' && location.state?.competitionId) {
          loadCompetition(location.state.competitionId);
          setStep('competition-lobby');
          currentStepRef.current = 'competition-lobby';
          return;
        }

        // Check if user has active competitions first
        if (user) {
          const activeCompetitions = await loadUserActiveCompetitions(user.id);
          
          if (activeCompetitions.length > 0) {
            if (activeCompetitions.length === 1) {
              // Auto-redirect to the single active competition
              const competition = activeCompetitions[0];
              loadCompetition(competition.id);
              
              // Determine step based on competition status
              const newStep = competition.status === 'waiting' ? 'competition-lobby' : 
                            competition.status === 'active' ? 'competition-quiz' : 'competition-lobby';
              setStep(newStep);
              currentStepRef.current = newStep;
              return;
            } else {
              // Multiple active competitions - let user choose
              setStep('active-competitions-selector');
              currentStepRef.current = 'active-competitions-selector';
              return;
            }
          }
        }

        // Check if user has an active competition in current state
        if (currentCompetition) {
          // Verify competition still exists and is valid
          const { data: competitionCheck } = await supabase
            .from('competitions')
            .select('status')
            .eq('id', currentCompetition.id)
            .maybeSingle();

          if (!competitionCheck) {
            // Competition no longer exists
            clearCurrentCompetition();
            setStep('mode-selector');
            currentStepRef.current = 'mode-selector';
            return;
          }

          // Determine step based on competition status
          const newStep = competitionCheck.status === 'waiting' ? 'competition-lobby' :
                        competitionCheck.status === 'active' ? 'competition-quiz' :
                        competitionCheck.status === 'completed' ? 'competition-results' : 'mode-selector';
          
          if (newStep === 'mode-selector') {
            clearCurrentCompetition();
          }
          
          setStep(newStep);
          currentStepRef.current = newStep;
          return;
        }
      
        // Determine initial step based on current state
        let newStep: string;
        if (!apiKey) {
          newStep = 'api-key';
        } else if (result) {
          newStep = 'results';
        } else if (questions.length > 0) {
          newStep = 'quiz';
          // Initialize total time if set
          if (preferences?.timeLimitEnabled && preferences?.totalTimeLimit) {
            setTotalTimeRemaining(parseInt(preferences.totalTimeLimit));
          }
        } else {
          newStep = 'mode-selector';
        }
        
        // Only update if step actually changed
        if (currentStepRef.current !== newStep) {
          setStep(newStep as any);
          currentStepRef.current = newStep;
        }
      } catch (error) {
        console.error('Step determination error:', error);
        navigate('/auth');
      }
    };

    // Use a timeout to prevent rapid state changes
    const timeoutId = setTimeout(determineStep, 100);
    return () => clearTimeout(timeoutId);
  }, [apiKey, preferences, questions, result, location.state, currentCompetition, navigate, user, isInitializedRef.current]);

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
  
  const handleApiKeySaved = useCallback(() => {
    setStep('mode-selector');
    currentStepRef.current = 'mode-selector';
  }, []);

  const handleModeSelect = useCallback((mode: 'solo' | 'create-competition' | 'join-competition' | 'random-match') => {
    setSelectedMode(mode);
    const newStep = mode === 'solo' ? 'solo-preferences' :
                   mode === 'create-competition' ? 'create-competition' :
                   mode === 'join-competition' ? 'join-competition' : 'random-match';
    setStep(newStep);
    currentStepRef.current = newStep;
  }, []);

  const handleBackToModeSelector = useCallback(() => {
    resetQuiz();
    clearCurrentCompetition();
    setSelectedMode(null);
    setTotalTimeRemaining(null);
    setCompetitionQuestions([]);
    setStep('mode-selector');
    currentStepRef.current = 'mode-selector';
  }, [resetQuiz, clearCurrentCompetition]);

  const handleShowCompetitionManagement = useCallback(() => {
    setStep('competition-management');
    currentStepRef.current = 'competition-management';
  }, []);
  
  const handleStartSoloQuiz = useCallback(async () => {
    if (!user) return;
    await generateQuiz(user.id);
    setStep('quiz');
    currentStepRef.current = 'quiz';
  }, [user, generateQuiz]);
  
  const handleFinishQuiz = useCallback(() => {
    finishQuiz();
    setStep('results');
    currentStepRef.current = 'results';
    setTotalTimeRemaining(null);
  }, [finishQuiz]);
  
  const handleNewQuiz = useCallback(() => {
    resetQuiz();
    setTotalTimeRemaining(null);
    setStep('mode-selector');
    currentStepRef.current = 'mode-selector';
  }, [resetQuiz]);
  
  const handleChangePreferences = useCallback(() => {
    resetQuiz();
    setTotalTimeRemaining(null);
    const newStep = selectedMode === 'solo' ? 'solo-preferences' : 'mode-selector';
    setStep(newStep);
    currentStepRef.current = newStep;
  }, [resetQuiz, selectedMode]);

  const handleNext = useCallback(() => {
    nextQuestion();
  }, [nextQuestion]);

  const handlePrevious = useCallback(() => {
    prevQuestion();
  }, [prevQuestion]);

  // Competition handlers
  const handleJoinSuccess = useCallback(() => {
    setStep('competition-lobby');
    currentStepRef.current = 'competition-lobby';
  }, []);

  const handleMatchFound = useCallback((competitionId: string) => {
    setStep('competition-lobby');
    currentStepRef.current = 'competition-lobby';
  }, []);

  const handleStartCompetitionQuiz = useCallback(async () => {
    if (!currentCompetition || !user || !apiKey) return;
  
    try {
      setStep('competition-quiz');
      currentStepRef.current = 'competition-quiz';
    } catch (error) {
      console.error('Failed to start competition quiz:', error);
    }
  }, [currentCompetition, user, apiKey]);

  const handleCompetitionComplete = useCallback(() => {
    setStep('competition-results');
    currentStepRef.current = 'competition-results';
  }, []);

  const handleNewCompetition = useCallback(() => {
    clearCurrentCompetition();
    setCompetitionQuestions([]);
    setStep('mode-selector');
    currentStepRef.current = 'mode-selector';
  }, [clearCurrentCompetition]);

  const handleBackToHome = useCallback(() => {
    navigate('/');
  }, [navigate]);

  const handleCreateCompetitionSuccess = useCallback(() => {
    setStep('competition-lobby');
    currentStepRef.current = 'competition-lobby';
  }, []);

  const handleSelectActiveCompetition = useCallback((competition: any) => {
    loadCompetition(competition.id);
    
    const newStep = competition.status === 'waiting' ? 'competition-lobby' : 
                   competition.status === 'active' ? 'competition-quiz' : 'competition-lobby';
    setStep(newStep);
    currentStepRef.current = newStep;
  }, [loadCompetition]);
  
  const renderContent = () => {
    if (!user) return null;
    
    switch (step) {
      case 'api-key':
        return <ApiKeyForm userId={user.id} onSave={handleApiKeySaved} />;

      case 'active-competitions-selector':
        return (
          <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-8"
              >
                <div className="flex items-center justify-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center mr-4 shadow-xl">
                    <Trophy className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold text-gray-800">Active Competitions</h1>
                    <p className="text-gray-600 text-lg">You have multiple active competitions. Choose one to continue:</p>
                  </div>
                </div>
              </motion.div>

              <div className="space-y-4 mb-8">
                {userActiveCompetitions.map((competition, index) => (
                  <motion.div
                    key={competition.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-gray-200 hover:border-purple-300"
                          onClick={() => handleSelectActiveCompetition(competition)}>
                      <CardBody className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
                              <Trophy className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-gray-800">{competition.title}</h3>
                              <p className="text-gray-600">{competition.description}</p>
                              <div className="flex items-center space-x-4 mt-2 text-sm">
                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                  competition.status === 'waiting' 
                                    ? 'bg-yellow-100 text-yellow-700' 
                                    : 'bg-green-100 text-green-700'
                                }`}>
                                  {competition.status === 'waiting' ? 'Waiting for participants' : 'Active'}
                                </span>
                                <span className="flex items-center text-gray-500">
                                  <Users className="w-4 h-4 mr-1" />
                                  {competition.participant_count || 0} participants
                                </span>
                                <span className="flex items-center text-gray-500">
                                  <Clock className="w-4 h-4 mr-1" />
                                  Created {new Date(competition.created_at).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-purple-600">#{competition.competition_code}</div>
                            <div className="text-sm text-gray-500">Competition Code</div>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <div className="text-center">
                <Button
                  variant="outline"
                  onClick={handleBackToModeSelector}
                  className="border-2 border-gray-300 text-gray-600 hover:bg-gray-50 px-6 py-3"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Start New Quiz Instead
                </Button>
              </div>
            </div>
          </div>
        );
      
      case 'mode-selector':
        return (
          <QuizModeSelector 
            onSelectMode={handleModeSelect} 
            onShowCompetitionManagement={handleShowCompetitionManagement}
          />
        );

      case 'competition-management':
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
            <CompetitionManagement userId={user.id} />
          </div>
        );

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
              onStartCompetition={handleCreateCompetitionSuccess}
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
        if (!currentCompetition) {
          return <div>Loading competition...</div>;
        }
        return (
          <CompetitionQuiz
            competition={currentCompetition}
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
