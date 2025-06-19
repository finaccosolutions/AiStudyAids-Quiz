import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useQuizStore, defaultPreferences } from '../store/useQuizStore';
import { useCompetitionStore } from '../store/useCompetitionStore';
import QuizModeSelector from '../components/quiz/QuizModeSelector';
import QuizPreferencesForm from '../components/quiz/QuizPreferences';
import JoinCompetitionForm from '../components/quiz/JoinCompetitionForm';
import RandomMatchmaking from '../components/competition/RandomMatchmaking';
import { Button } from '../components/ui/Button';
import { ArrowLeft } from 'lucide-react';

const PreferencesPage: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { preferences, loadPreferences, generateQuiz } = useQuizStore();
  const { currentCompetition } = useCompetitionStore();
  
  const [selectedMode, setSelectedMode] = useState<'solo' | 'create-competition' | 'join-competition' | 'random-match' | null>(null);

  useEffect(() => {
    if (user) {
      loadPreferences(user.id);
    }
  }, [user]);

  const handleModeSelect = (mode: 'solo' | 'create-competition' | 'join-competition' | 'random-match') => {
    setSelectedMode(mode);
  };

  const handleBackToModeSelector = () => {
    setSelectedMode(null);
  };

  const handleSoloSave = async () => {
    if (!user) return;
    await generateQuiz(user.id);
    navigate('/quiz');
  };

  const handleStartCompetition = () => {
    navigate('/quiz', { 
      state: { 
        mode: 'competition-lobby',
        competitionId: currentCompetition?.id
      } 
    });
  };

  const handleJoinSuccess = () => {
    navigate('/quiz', { 
      state: { 
        mode: 'competition-lobby',
        competitionId: currentCompetition?.id
      } 
    });
  };

  const handleMatchFound = (competitionId: string) => {
    navigate('/quiz', { 
      state: { 
        mode: 'competition-lobby',
        competitionId
      } 
    });
  };

  if (!user) return null;

  // Show mode selector if no mode is selected
  if (!selectedMode) {
    return <QuizModeSelector onSelectMode={handleModeSelect} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={handleBackToModeSelector}
            className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-all duration-300 px-6 py-3 rounded-xl"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Quiz Modes
          </Button>
        </div>

        {/* Render appropriate component based on selected mode */}
        {selectedMode === 'solo' && (
          <QuizPreferencesForm
            userId={user.id}
            initialPreferences={preferences || defaultPreferences}
            onSave={handleSoloSave}
          />
        )}

        {selectedMode === 'create-competition' && (
          <QuizPreferencesForm
            userId={user.id}
            initialPreferences={preferences || defaultPreferences}
            onStartCompetition={handleStartCompetition}
          />
        )}

        {selectedMode === 'join-competition' && (
          <JoinCompetitionForm
            onJoinSuccess={handleJoinSuccess}
            onCancel={handleBackToModeSelector}
          />
        )}

        {selectedMode === 'random-match' && (
          <RandomMatchmaking
            onMatchFound={handleMatchFound}
            onCancel={handleBackToModeSelector}
          />
        )}
      </div>
    </div>
  );
};

export default PreferencesPage;