import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from './store/useAuthStore';
import { useQuizStore } from './store/useQuizStore';
import MainLayout from './components/layout/MainLayout';
import HomePage from './pages/HomePage';
import QuizPage from './pages/QuizPage';
import PreferencesPage from './pages/PreferencesPage';
import ApiSettingsPage from './pages/ApiSettingsPage';

// Protected route wrapper component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return null; // Or a loading spinner
  }

  if (!isLoggedIn) {
    return <Navigate to="/PreferencesPage" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Quiz route wrapper to handle API key and preferences flow
const QuizRoute: React.FC = () => {
  const { apiKey, loadApiKey, preferences, loadPreferences, questions } = useQuizStore();
  const { user, isLoggedIn } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      loadApiKey(user.id);
      loadPreferences(user.id);
    }
  }, [user]);

  if (!isLoggedIn) {
    return <Navigate to="/PreferencesPage" state={{ from: location }} replace />;
  }

  if (questions.length === 0 && location.state?.from !== '/PreferencesPage') {
    return <Navigate to="/PreferencesPage" replace />;
  }

  return <QuizPage />;
};

function App() {
  const { loadUser } = useAuthStore();
  
  useEffect(() => {
    loadUser();
  }, []);
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route
            path="quiz"
            element={
              <ProtectedRoute>
                <QuizRoute />
              </ProtectedRoute>
            }
          />
          <Route
            path="PreferencesPage"
            element={
              <ProtectedRoute>
                <PreferencesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="api-settings"
            element={
              <ProtectedRoute>
                <ApiSettingsPage />
              </ProtectedRoute>
            }
          />
          {/* Catch all route for non-existent pages */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;