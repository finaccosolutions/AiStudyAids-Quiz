// src/App.tsx
import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { useQuizStore } from './store/useQuizStore';
import MainLayout from './components/layout/MainLayout';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import QuizPage from './pages/QuizPage';
import PreferencesPage from './pages/PreferencesPage';
import ApiSettingsPage from './pages/ApiSettingsPage';
import QuestionBankPage from './pages/QuestionBankPage';
import AnswerEvaluationPage from './pages/AnswerEvaluationPage';
import NotesGeneratorPage from './pages/NotesGeneratorPage';
import StudyPlannerPage from './pages/StudyPlannerPage';
import ProgressTrackerPage from './pages/ProgressTrackerPage';
import ChatPage from './pages/ChatPage';
import ProfilePage from './pages/ProfilePage';
import CompetitionPage from './pages/CompetitionPage';
import AiTutorialPage from './pages/AiTutorialPage';
import AuthRedirectPage from './pages/AuthRedirectPage';
import EmailConfirmationPage from './pages/EmailConfirmationPage';
import SharedQuizResultPage from './pages/SharedQuizResultPage';
import SharedCompetitionResultPage from './pages/SharedCompetitionResultPage'; // New import

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) return null; // Or show loading spinner

  if (!isLoggedIn) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const QuizRoute: React.FC = () => {
  const { apiKey, loadApiKey, preferences, loadPreferences } = useQuizStore();
  const { user, isLoggedIn } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      loadApiKey(user.id);
      loadPreferences(user.id);
    }
  }, [user]);

  if (!isLoggedIn) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return <QuizPage />;
};

const App: React.FC = () => {
  const { loadUser } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="auth" element={<AuthPage />} />
        <Route path="auth-redirect" element={<AuthRedirectPage />} />
        <Route path="EmailConfirmationPage" element={<EmailConfirmationPage />} />
        <Route path="quiz" element={<ProtectedRoute><QuizRoute /></ProtectedRoute>} />
        <Route path="api-settings" element={<ProtectedRoute><ApiSettingsPage /></ProtectedRoute>} />
        <Route path="question-bank" element={<ProtectedRoute><QuestionBankPage /></ProtectedRoute>} />
        <Route path="answer-evaluation" element={<ProtectedRoute><AnswerEvaluationPage /></ProtectedRoute>} />
        <Route path="notes" element={<ProtectedRoute><NotesGeneratorPage /></ProtectedRoute>} />
        <Route path="study-plan" element={<ProtectedRoute><StudyPlannerPage /></ProtectedRoute>} />
        <Route path="progress" element={<ProtectedRoute><ProgressTrackerPage /></ProtectedRoute>} />
        <Route path="chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        <Route path="profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="competitions" element={<ProtectedRoute><CompetitionPage /></ProtectedRoute>} />
        <Route path="ai-tutorial" element={<ProtectedRoute><AiTutorialPage /></ProtectedRoute>} />
        {/* New route for shared quiz results - accessible without authentication */}
        <Route path="/shared-quiz-result/:resultId" element={<SharedQuizResultPage />} />
        {/* New route for shared competition results - accessible without authentication */}
        <Route path="/shared-competition-result/:resultId" element={<SharedCompetitionResultPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};

export default App;
