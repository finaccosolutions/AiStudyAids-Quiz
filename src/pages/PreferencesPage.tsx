import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import QuizPreferencesForm from '../components/quiz/QuizPreferences';
import CompetitionPreferences from '../components/quiz/CompetitionPreferences';
import { useQuizStore, defaultPreferences } from '../store/useQuizStore';

const PreferencesPage: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { preferences, loadPreferences, generateQuiz, isLoading } = useQuizStore();

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

  const handleStartCompetition = (competitionPreferences: any) => {
    navigate('/quiz', { 
      state: { 
        mode: 'competition',
        preferences: competitionPreferences
      } 
    });
  };

  const handleJoinCompetition = () => {
    navigate('/quiz', { state: { mode: 'join-competition' } });
  };

  if (!user) return null;

  // Check if we should show competition preferences
  const showCompetitionPrefs = location.state?.mode === 'competition';

  if (showCompetitionPrefs) {
    return (
      <div className="space-y-6">
        <CompetitionPreferences
          initialPreferences={preferences || defaultPreferences}
          onStartCompetition={handleStartCompetition}
          onJoinCompetition={handleJoinCompetition}
          onCancel={() => navigate('/preferences')}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <QuizPreferencesForm
        userId={user.id}
        initialPreferences={preferences || defaultPreferences}
        onSave={handleStartQuiz}
        onStartCompetition={handleStartCompetition}
        onJoinCompetition={handleJoinCompetition}
      />
    </div>
  );
};

export default PreferencesPage;