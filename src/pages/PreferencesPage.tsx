import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useQuizStore, defaultPreferences } from '../store/useQuizStore';
import { useCompetitionStore } from '../store/useCompetitionStore';
import QuizPreferencesForm from '../components/quiz/QuizPreferences';

const PreferencesPage: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { preferences, loadPreferences, generateQuiz } = useQuizStore();
  const { currentCompetition } = useCompetitionStore();

  useEffect(() => {
    if (user) {
      loadPreferences(user.id);
    }
  }, [user]);

  const handleSave = async () => {
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

  const handleJoinCompetition = () => {
    navigate('/quiz', { 
      state: { 
        mode: 'competition-lobby',
        competitionId: currentCompetition?.id
      } 
    });
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <QuizPreferencesForm
          userId={user.id}
          initialPreferences={preferences || defaultPreferences}
          onSave={handleSave}
          onStartCompetition={handleStartCompetition}
          onJoinCompetition={handleJoinCompetition}
        />
      </div>
    </div>
  );
};

export default PreferencesPage;