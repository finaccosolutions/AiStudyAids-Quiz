// src/components/competition/RandomMatchPanel.tsx
import React from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import RandomMatchmaking from './RandomMatchmaking';
import RandomMatchStats from './RandomMatchStats';
import RandomMatchManagement from './RandomMatchManagement'; // New import
import { Button } from '../ui/Button';
import { History, Zap, Play } from 'lucide-react'; // Added Play icon
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface RandomMatchPanelProps {
  userId: string;
}

const RandomMatchPanel: React.FC<RandomMatchPanelProps> = ({ userId }) => {
  const navigate = useNavigate();

  const handleMatchFound = (competitionId: string) => {
    navigate('/quiz', { state: { mode: 'competition-lobby', competitionId } });
  };

  const handleStartRandomMatchmaking = () => {
    navigate('/quiz', { state: { mode: 'random-match' } });
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <RandomMatchStats userId={userId} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-center"
      >
        <Button
          onClick={handleStartRandomMatchmaking}
          className="gradient-bg hover:opacity-90 transition-all duration-300 px-6 py-3"
        >
          <Play className="w-5 h-5 mr-2" />
          Start New Random Match
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <RandomMatchManagement userId={userId} /> {/* New component */}
      </motion.div>
    </div>
  );
};

export default RandomMatchPanel;