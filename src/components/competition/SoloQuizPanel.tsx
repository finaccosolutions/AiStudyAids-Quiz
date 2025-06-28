// src/components/competition/SoloQuizPanel.tsx
import React from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useQuizStore, defaultPreferences } from '../../store/useQuizStore';
import QuizPreferencesForm from '../quiz/QuizPreferences';
import SoloQuizStats from './SoloQuizStats';
import SoloQuizManagement from './SoloQuizManagement'; // New import
import { Button } from '../ui/Button';
import { BookOpen, History, Brain, Play } from 'lucide-react'; // Added Play icon
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
        transition={{ delay: 0.6 }}
        className="text-center"
      >
        <Button
          onClick={() => navigate('/quiz', { state: { mode: 'solo-preferences' } })} // Navigate to preferences to start a new quiz
          className="gradient-bg hover:opacity-90 transition-all duration-300 px-6 py-3"
        >
          <Play className="w-5 h-5 mr-2" />
          Start New Solo Quiz
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <SoloQuizManagement userId={userId} /> {/* New component */}
      </motion.div>
    </div>
  );
};

export default SoloQuizPanel; 