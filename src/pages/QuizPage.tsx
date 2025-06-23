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
    clearCurrentCompetition,
    cleanupSubscriptions,
    setCleanupFlag
  } = useCompetitionStore();
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Use refs to prevent unnecessary re-renders and state resets
  const isInitializedRef = useRef(false);
  const currentStepRef = useRef<string>('api-key');
  const competitionCompletedRef = useRef(false);
  const isOnResultsPageRef = useRef(false);
  const isComponentMountedRef = useRef(true);
  const lastCompetitionStatusRef = useRef<string | null>(null);
  const resultsPageLockedRef = useRef(false); // New ref to lock results page
  
const [step, setStep] = useState<
  'api-key' | 'mode-selector' | 'solo-preferences' | 'create-competition' | 
  'join-competition' | 'random-match' | 'quiz' | 'results' | 
  'competition-lobby' | 'competition-quiz' | 'competition-results' |
  'competition-management' | 'active-competitions-selector'
>('mode-selector');

// Add a new state for tracking quiz generation
const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [totalTimeRemaining, setTotalTimeRemaining] = useState<number | null>(null);
  const [competitionQuestions, setCompetitionQuestions] = useState<Question[]>([]);

  // Component lifecycle management
  useEffect(() => {
    isComponentMountedRef.current = true;
    
    return () => {
      console.log('QuizPage component unmounting, cleaning up...');
      isComponentMountedRef.current = false;
      
      // Cleanup competition store
      setCleanupFlag(true);
      cleanupSubscriptions();
    };
  }, [setCleanupFlag, cleanupSubscriptions]);
  
  // Prevent auto-refresh by using a stable initialization effect
  useEffect(() => {
    if (!user || isInitializedRef.current || !isComponentMountedRef.current) return;
    
    const initializeQuizPage = async () => {
      try {
        await Promise.all([
          loadApiKey(user.id),
          loadPreferences(user.id),
          loadUserCompetitions(user.id)
        ]);
        
        if (isComponentMountedRef.current) {
          isInitializedRef.current = true;
        }
      } catch (error) {
        console.error('Failed to initialize quiz page:', error);
      }
    };

    initializeQuizPage();
  }, [user, loadApiKey, loadPreferences, loadUserCompetitions]);

// FIXED: Enhanced step determination with proper results page protection
useEffect(() => {
  if (!isInitializedRef.current || !isComponentMountedRef.current) return;

  const determineStep = async () => {
    try {
      // Handle competition mode from location state
      if (location.state?.mode === 'competition-lobby' && location.state?.competitionId) {
        if (isComponentMountedRef.current) {
          loadCompetition(location.state.competitionId);
          setStep('competition-lobby');
          currentStepRef.current = 'competition-lobby';
        }
        return;
      }

      // CRITICAL FIX: If results page is locked, don't change step
      if (resultsPageLockedRef.current && step === 'competition-results') {
        console.log('Results page is locked, preventing auto-redirect');
        return;
      }

      // CRITICAL FIX: Don't override manual step changes from mode selection
      if (selectedMode && (step === 'solo-preferences' || step === 'create-competition' || 
          step === 'join-competition' || step === 'random-match')) {
        console.log('User has selected a mode, maintaining current step:', step);
        return;
      }

      // Check if user has active competitions first
      if (user && isComponentMountedRef.current) {
        const activeCompetitions = await loadUserActiveCompetitions(user.id);
        
        if (activeCompetitions.length > 0 && isComponentMountedRef.current) {
          if (activeCompetitions.length === 1) {
            const competition = activeCompetitions[0];
            
            // FIXED: Only load competition if it's different from current
            if (!currentCompetition || currentCompetition.id !== competition.id) {
              loadCompetition(competition.id);
            }
            
            // Check if user has completed this competition
            const { data: userParticipant } = await supabase
              .from('competition_participants')
              .select('status')
              .eq('competition_id', competition.id)
              .eq('user_id', user.id)
              .maybeSingle();

            // FIXED: Only go to results if competition is actually completed AND user completed
            if (competition.status === 'completed' && userParticipant?.status === 'completed' && isComponentMountedRef.current) {
              if (step !== 'competition-results') {
                console.log('Competition and user completed, going to results');
                setStep('competition-results');
                currentStepRef.current = 'competition-results';
                competitionCompletedRef.current = true;
                isOnResultsPageRef.current = true;
                resultsPageLockedRef.current = true; // Lock the results page
              }
              return;
            }
            
            if (isComponentMountedRef.current) {
              const newStep = competition.status === 'waiting' ? 'competition-lobby' : 
                            competition.status === 'active' ? 'competition-quiz' : 'competition-lobby';
              
              // Only change step if it's actually different
              if (step !== newStep) {
                setStep(newStep);
                currentStepRef.current = newStep;
              }
            }
            return;
          } else {
            if (isComponentMountedRef.current && step !== 'active-competitions-selector') {
              setStep('active-competitions-selector');
              currentStepRef.current = 'active-competitions-selector';
            }
            return;
          }
        }
      }

      // FIXED: Enhanced competition context handling
      if (currentCompetition && isComponentMountedRef.current) {
        const { data: competitionCheck } = await supabase
          .from('competitions')
          .select('status')
          .eq('id', currentCompetition.id)
          .maybeSingle();

        if (!competitionCheck) {
          console.log('Competition not found, clearing state');
          clearCurrentCompetition();
          competitionCompletedRef.current = false;
          isOnResultsPageRef.current = false;
          resultsPageLockedRef.current = false;
          if (isComponentMountedRef.current) {
            setStep('mode-selector');
            currentStepRef.current = 'mode-selector';
          }
          return;
        }

        // FIXED: Track status changes properly
        const statusChanged = lastCompetitionStatusRef.current !== competitionCheck.status;
        lastCompetitionStatusRef.current = competitionCheck.status;

        // FIXED: Only check user completion if status changed to completed
        if (statusChanged && competitionCheck.status === 'completed' && user && isComponentMountedRef.current) {
          console.log('Competition status changed to completed, checking user completion');
          
          const { data: userParticipant } = await supabase
            .from('competition_participants')
            .select('status')
            .eq('competition_id', currentCompetition.id)
            .eq('user_id', user.id)
            .maybeSingle();

          // FIXED: Only go to results if user has actually completed
          if (userParticipant?.status === 'completed' && step !== 'competition-results' && isComponentMountedRef.current) {
            console.log('User completed and competition completed, going to results');
            setStep('competition-results');
            currentStepRef.current = 'competition-results';
            competitionCompletedRef.current = true;
            isOnResultsPageRef.current = true;
            resultsPageLockedRef.current = true; // Lock the results page
            return;
          }
        }

        // Handle other competition status changes (but not if on results page)
        if (step !== 'competition-results' && isComponentMountedRef.current) {
          const newStep = competitionCheck.status === 'waiting' ? 'competition-lobby' :
                        competitionCheck.status === 'active' ? 'competition-quiz' :
                        competitionCheck.status === 'completed' ? 'competition-results' : 'mode-selector';
          
          // Only change step if it's different
          if (step !== newStep) {
            if (newStep === 'mode-selector') {
              clearCurrentCompetition();
              competitionCompletedRef.current = false;
              isOnResultsPageRef.current = false;
              resultsPageLockedRef.current = false;
            } else if (newStep === 'competition-results') {
              competitionCompletedRef.current = true;
              isOnResultsPageRef.current = true;
              resultsPageLockedRef.current = true;
            }
            
            setStep(newStep);
            currentStepRef.current = newStep;
          }
          return;
        }
      }
    
      // FIXED: Only handle solo quiz logic if NOT in competition context AND no mode selected
      if (!currentCompetition && !competitionCompletedRef.current && !selectedMode && isComponentMountedRef.current) {
        let newStep: string;
        
        // If quiz is being generated, stay on current step
        if (isGeneratingQuiz) {
          return;
        }
        
        // Check result first, then questions
        if (result && result.questions && result.questions.length > 0) {
          newStep = 'results';
        } else if (questions.length > 0 && !result) {
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
          console.log(`Step changing from ${currentStepRef.current} to ${newStep}`);
          setStep(newStep as any);
          currentStepRef.current = newStep;
        }
      }
    } catch (error: any) {
      console.error('Step determination error:', error);
      if (!error.message?.includes('Competition') && !error.message?.includes('competition') && isComponentMountedRef.current) {
        navigate('/auth');
      }
    }
  };

  const timeoutId = setTimeout(determineStep, 100);
  return () => clearTimeout(timeoutId);
}, [questions, result, location.state, currentCompetition, navigate, user, isInitializedRef.current, isGeneratingQuiz, preferences, step, selectedMode]);


  const handleFinishQuiz = useCallback(() => {
    if (!isComponentMountedRef.current) return;
    
    console.log('Finishing quiz...');
    finishQuiz();
    // Force step change to results
    setStep('results');
    currentStepRef.current = 'results';
    setTotalTimeRemaining(null);
  }, [finishQuiz]);

  
  // Total quiz timer effect
useEffect(() => {
  let timer: NodeJS.Timeout;
  if (totalTimeRemaining !== null && totalTimeRemaining > 0 && step === 'quiz' && questions.length > 0 && isComponentMountedRef.current) {
    timer = setInterval(() => {
      setTotalTimeRemaining(prev => {
        if (prev === null || prev <= 1) {
          // Auto-finish quiz when time runs out
          setTimeout(() => {
            if (isComponentMountedRef.current) {
              handleFinishQuiz();
            }
          }, 100);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }
  return () => {
    if (timer) {
      clearInterval(timer);
    }
  };
}, [totalTimeRemaining, step, questions.length, handleFinishQuiz]);

  
  if (!isLoggedIn) {
    return <Navigate to="/auth" />;
  }
  
  const handleApiKeySaved = useCallback(() => {
    if (!isComponentMountedRef.current) return;
    setStep('mode-selector');
    currentStepRef.current = 'mode-selector';
  }, []);

  const handleModeSelect = useCallback((mode: 'solo' | 'create-competition' | 'join-competition' | 'random-match') => {
    if (!isComponentMountedRef.current) return;
    setSelectedMode(mode);
    const newStep = mode === 'solo' ? 'solo-preferences' :
                   mode === 'create-competition' ? 'create-competition' :
                   mode === 'join-competition' ? 'join-competition' : 'random-match';
    setStep(newStep);
    currentStepRef.current = newStep;
  }, []);

  const handleBackToModeSelector = useCallback(() => {
    if (!isComponentMountedRef.current) return;
    
    resetQuiz();
    clearCurrentCompetition();
    setCleanupFlag(false); // Reset cleanup flag for new session
    competitionCompletedRef.current = false;
    isOnResultsPageRef.current = false;
    resultsPageLockedRef.current = false; // Unlock results page
    lastCompetitionStatusRef.current = null; // Reset status tracking
    setSelectedMode(null);
    setTotalTimeRemaining(null);
    setCompetitionQuestions([]);
    setStep('mode-selector');
    currentStepRef.current = 'mode-selector';
  }, [resetQuiz, clearCurrentCompetition, setCleanupFlag]);

  const handleShowCompetitionManagement = useCallback(() => {
    if (!isComponentMountedRef.current) return;
    setStep('competition-management');
    currentStepRef.current = 'competition-management';
  }, []);
  
    const handleStartSoloQuiz = useCallback(async () => {
      if (!user || !isComponentMountedRef.current) return;
      
      // Check if API key is required and available
      if (!apiKey) {
        setStep('api-key');
        currentStepRef.current = 'api-key';
        return;
      }
      
      setIsGeneratingQuiz(true);
      try {
        await generateQuiz(user.id);
        if (isComponentMountedRef.current) {
          setStep('quiz');
          currentStepRef.current = 'quiz';
        }
      } catch (error) {
        console.error('Failed to generate quiz:', error);
        // Stay on preferences page if quiz generation fails
      } finally {
        setIsGeneratingQuiz(false);
      }
    }, [user, generateQuiz, apiKey]);

  
  const handleNewQuiz = useCallback(() => {
    if (!isComponentMountedRef.current) return;
    
    resetQuiz();
    competitionCompletedRef.current = false;
    isOnResultsPageRef.current = false;
    resultsPageLockedRef.current = false; // Unlock results page
    setTotalTimeRemaining(null);
    setStep('mode-selector');
    currentStepRef.current = 'mode-selector';
  }, [resetQuiz]);
  
  const handleChangePreferences = useCallback(() => {
    if (!isComponentMountedRef.current) return;
    
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
    if (!isComponentMountedRef.current) return;
    setStep('competition-lobby');
    currentStepRef.current = 'competition-lobby';
  }, []);

  const handleMatchFound = useCallback((competitionId: string) => {
    if (!isComponentMountedRef.current) return;
    setStep('competition-lobby');
    currentStepRef.current = 'competition-lobby';
  }, []);

  const handleStartCompetitionQuiz = useCallback(async () => {
    if (!currentCompetition || !user || !apiKey || !isComponentMountedRef.current) return;
  
    try {
      setStep('competition-quiz');
      currentStepRef.current = 'competition-quiz';
    } catch (error) {
      console.error('Failed to start competition quiz:', error);
    }
  }, [currentCompetition, user, apiKey]);

  // FIXED: Enhanced completion handler with results page locking
  const handleCompetitionComplete = useCallback(() => {
    if (!isComponentMountedRef.current) return;
    
    console.log('Competition completed, setting completion flag and navigating to results');
    competitionCompletedRef.current = true;
    isOnResultsPageRef.current = true;
    resultsPageLockedRef.current = true; // Lock the results page
    setStep('competition-results');
    currentStepRef.current = 'competition-results';
  }, []);

  const handleNewCompetition = useCallback(() => {
    if (!isComponentMountedRef.current) return;
    
    clearCurrentCompetition();
    setCleanupFlag(false); // Reset cleanup flag for new session
    competitionCompletedRef.current = false;
    isOnResultsPageRef.current = false;
    resultsPageLockedRef.current = false; // Unlock results page
    lastCompetitionStatusRef.current = null; // Reset status tracking
    setCompetitionQuestions([]);
    setStep('mode-selector');
    currentStepRef.current = 'mode-selector';
  }, [clearCurrentCompetition, setCleanupFlag]);

  const handleBackToHome = useCallback(() => {
    // Clear all competition-related state when going back to home
    setCleanupFlag(true);
    cleanupSubscriptions();
    clearCurrentCompetition();
    competitionCompletedRef.current = false;
    isOnResultsPageRef.current = false;
    resultsPageLockedRef.current = false; // Unlock results page
    lastCompetitionStatusRef.current = null; // Reset status tracking
    navigate('/');
  }, [navigate, clearCurrentCompetition, setCleanupFlag, cleanupSubscriptions]);

const handleCreateCompetitionSuccess = useCallback(() => {
  if (!isComponentMountedRef.current) return;
  setStep('competition-lobby');
  currentStepRef.current = 'competition-lobby';
}, []);

  const handleSelectActiveCompetition = useCallback((competition: any) => {
    if (!isComponentMountedRef.current) return;
    
    loadCompetition(competition.id);
    
    const newStep = competition.status === 'waiting' ? 'competition-lobby' : 
                   competition.status === 'active' ? 'competition-quiz' : 'competition-lobby';
    setStep(newStep);
    currentStepRef.current = newStep;
  }, [loadCompetition]);

  // FIXED: Enhanced leave handler for competitions with proper cleanup
  const handleLeaveCompetition = useCallback(() => {
    if (!isComponentMountedRef.current) return;
    
    // Clear competition state and reset flags
    setCleanupFlag(true);
    cleanupSubscriptions();
    clearCurrentCompetition();
    competitionCompletedRef.current = false;
    isOnResultsPageRef.current = false;
    resultsPageLockedRef.current = false; // Unlock results page
    lastCompetitionStatusRef.current = null; // Reset status tracking
    setStep('mode-selector');
    currentStepRef.current = 'mode-selector';
  }, [clearCurrentCompetition, setCleanupFlag, cleanupSubscriptions]);
  
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
                  disabled={isGeneratingQuiz}
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back to Quiz Modes
                </Button>
              </div>
              {isGeneratingQuiz ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-lg text-gray-600">Generating your quiz...</p>
                  </div>
                </div>
              ) : (
                <QuizPreferencesForm
                  userId={user.id}
                  initialPreferences={preferences || defaultPreferences}
                  onSave={handleStartSoloQuiz}
                />
              )}
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
                    disabled={isGeneratingQuiz}
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to Quiz Modes
                  </Button>
                </div>
                {isGeneratingQuiz ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                      <p className="text-lg text-gray-600">Creating your competition...</p>
                    </div>
                  </div>
                ) : (
                  <QuizPreferencesForm
                    userId={user.id}
                    initialPreferences={preferences || defaultPreferences}
                    onStartCompetition={handleCreateCompetitionSuccess}
                  />
                )}
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
            onLeave={handleLeaveCompetition}
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
            onLeave={handleLeaveCompetition}
          />
        );

      case 'competition-results':
        if (!currentCompetition) {
          return <div>Loading results...</div>;
        }
        // Set the results page flag when rendering results
        isOnResultsPageRef.current = true;
        resultsPageLockedRef.current = true; // Ensure results page is locked
        return (
          <CompetitionResults
            competition={currentCompetition}
            onNewCompetition={handleNewCompetition}
            onBackToHome={handleBackToHome}
            onLeave={handleLeaveCompetition}
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
                onQuitQuiz={handleBackToModeSelector}
                totalTimeElapsed={Math.floor((Date.now() - Date.now()) / 1000)} // You'll need to track this properly 
                showQuitButton={true}
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