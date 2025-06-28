// src/components/competition/SoloQuizPanel.tsx
import React from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useQuizStore, defaultPreferences } from '../../store/useQuizStore';
import QuizPreferencesForm from '../quiz/QuizPreferences';
import SoloQuizStats from './SoloQuizStats';
import { Button } from '../ui/Button';
import { BookOpen, History, Brain } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface SoloQuizPanelProps {
  userId: string;
}

const SoloQuizPanel: React.FC<SoloQuizPanelProps> = ({ userId }) => {
  const navigate = useNavigate();
  const { preferences, generateQuiz } = useQuizStore();
  const [isGeneratingQuiz, setIsGeneratingQuiz] = React.useState(false);

  const handleStartSoloQuiz = async () => {
    setIsGeneratingQuiz(true);
    try {
      await generateQuiz(userId);
      navigate('/quiz'); // Navigate to the quiz page to start the quiz
    } catch (error) {
      console.error('Failed to generate quiz:', error);
      // Handle error, maybe show a toast
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <SoloQuizStats userId={userId} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <QuizPreferencesForm
          userId={userId}
          initialPreferences={preferences || defaultPreferences}
          onSave={handleStartSoloQuiz}
          isGeneratingQuiz={isGeneratingQuiz}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-center"
      >
        <Button
          onClick={() => navigate('/competitions', { state: { activeTab: 'my-history', historyFilter: 'solo' } })}
          variant="outline"
          className="border-2 border-purple-200 text-purple-600 hover:bg-purple-50 px-6 py-3"
        >
          <History className="w-5 h-5 mr-2" />
          View Solo Quiz History
        </Button>
      </motion.div>
    </div>
  );
};

export default SoloQuizPanel;