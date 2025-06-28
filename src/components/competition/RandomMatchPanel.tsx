// src/components/competition/RandomMatchPanel.tsx
import React from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import RandomMatchmaking from './RandomMatchmaking';
import RandomMatchStats from './RandomMatchStats';
import { Button } from '../ui/Button';
import { History, Zap } from 'lucide-react';
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

  const handleCancelMatchmaking = () => {
    // Logic to cancel matchmaking, perhaps navigate back to quiz modes
    navigate('/quiz', { state: { mode: 'mode-selector' } });
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
      >
        <RandomMatchmaking
          onMatchFound={handleMatchFound}
          onCancel={handleCancelMatchmaking}
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="text-center"
      >
        <Button
          onClick={() => navigate('/competitions', { state: { activeTab: 'my-history', historyFilter: 'random' } })}
          variant="outline"
          className="border-2 border-purple-200 text-purple-600 hover:bg-purple-50 px-6 py-3"
        >
          <History className="w-5 h-5 mr-2" />
          View Random Match History
        </Button>
      </motion.div>
    </div>
  );
};

export default RandomMatchPanel;