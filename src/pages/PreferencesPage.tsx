import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import QuizPreferencesForm from '../components/quiz/QuizPreferences';
import CompetitionModeSelector from '../components/competition/CompetitionModeSelector';
import CreateCompetitionModal from '../components/competition/CreateCompetitionModal';
import JoinCompetitionModal from '../components/competition/JoinCompetitionModal';
import RandomMatchmaking from '../components/competition/RandomMatchmaking';
import { useQuizStore, defaultPreferences } from '../store/useQuizStore';
import { useCompetitionStore } from '../store/useCompetitionStore';

const PreferencesPage: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { preferences, loadPreferences, generateQuiz } = useQuizStore();
  const { createCompetition } = useCompetitionStore();

  const [showCompetitionModeSelector, setShowCompetitionModeSelector] = useState(false);
  const [showCreateCompetitionModal, setShowCreateCompetitionModal] = useState(false);
  const [showJoinCompetitionModal, setShowJoinCompetitionModal] = useState(false);
  const [showRandomMatchmaking, setShowRandomMatchmaking] = useState(false);
  const [selectedMode, setSelectedMode] = useState<'private' | 'random' | null>(null);

  useEffect(() => {
    if (user) {
      loadPreferences(user.id);
    }
  }, [user]);

  const handleStartQuiz = async () => {
    if (!user) return;
    
    await generateQuiz(user.id);
    navigate('/quiz', { state: { from: '/preferences' } });
  };

  const handleStartCompetition = () => {
    setShowCompetitionModeSelector(true);
  };

  const handleJoinCompetition = () => {
    setShowJoinCompetitionModal(true);
  };

  const handleModeSelected = (mode: 'private' | 'random') => {
    setSelectedMode(mode);
    setShowCompetitionModeSelector(false);
    
    if (mode === 'private') {
      setShowCreateCompetitionModal(true);
    } else {
      setShowRandomMatchmaking(true);
    }
  };

  const handleCreateCompetition = async (competitionPreferences: any, competitionData: any) => {
    if (!user) return;

    try {
      const competition = await createCompetition({
        title: competitionData.title,
        description: competitionData.description,
        type: selectedMode,
        maxParticipants: competitionData.maxParticipants,
        quizPreferences: competitionPreferences,
        emails: competitionData.emails || []
      });

      setShowCreateCompetitionModal(false);
      
      // Navigate to competition lobby
      navigate('/quiz', { 
        state: { 
          mode: 'competition-lobby',
          competitionId: competition.id
        } 
      });
    } catch (error) {
      console.error('Failed to create competition:', error);
    }
  };

  const handleJoinSuccess = (competitionId: string) => {
    setShowJoinCompetitionModal(false);
    navigate('/quiz', { 
      state: { 
        mode: 'competition-lobby',
        competitionId
      } 
    });
  };

  const handleMatchFound = (competitionId: string) => {
    setShowRandomMatchmaking(false);
    navigate('/quiz', { 
      state: { 
        mode: 'competition-lobby',
        competitionId
      } 
    });
  };

  const handleCloseModals = () => {
    setShowCompetitionModeSelector(false);
    setShowCreateCompetitionModal(false);
    setShowJoinCompetitionModal(false);
    setShowRandomMatchmaking(false);
    setSelectedMode(null);
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      <QuizPreferencesForm
        userId={user.id}
        initialPreferences={preferences || defaultPreferences}
        onSave={handleStartQuiz}
        onStartCompetition={handleStartCompetition}
        onJoinCompetition={handleJoinCompetition}
      />

      {/* Competition Mode Selector */}
      {showCompetitionModeSelector && (
        <CompetitionModeSelector
          onSelectMode={handleModeSelected}
          onCancel={handleCloseModals}
        />
      )}

      {/* Create Competition Modal */}
      {showCreateCompetitionModal && selectedMode && (
        <CreateCompetitionModal
          mode={selectedMode}
          quizPreferences={preferences || defaultPreferences}
          onClose={handleCloseModals}
          onSuccess={handleCreateCompetition}
        />
      )}

      {/* Join Competition Modal */}
      {showJoinCompetitionModal && (
        <JoinCompetitionModal
          onClose={handleCloseModals}
          onSuccess={handleJoinSuccess}
        />
      )}

      {/* Random Matchmaking */}
      {showRandomMatchmaking && (
        <RandomMatchmaking
          onClose={handleCloseModals}
          onMatchFound={handleMatchFound}
        />
      )}
    </div>
  );
};

export default PreferencesPage;