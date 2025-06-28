// src/components/competition/CompetitionPanel.tsx
import React from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import CompetitionManagement from './CompetitionManagement';
import CompetitionStats from './CompetitionStats';
import { Button } from '../ui/Button';
import { Plus, Users, History, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface CompetitionPanelProps {
  userId: string;
}

const CompetitionPanel: React.FC<CompetitionPanelProps> = ({ userId }) => {
  const navigate = useNavigate();

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <CompetitionStats userId={userId} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <CompetitionManagement userId={userId} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex flex-col sm:flex-row justify-center gap-4"
      >
        <Button
          onClick={() => navigate('/quiz', { state: { mode: 'create-competition' } })}
          className="gradient-bg hover:opacity-90 transition-all duration-300 px-6 py-3"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create New Competition
        </Button>
        <Button
          onClick={() => navigate('/quiz', { state: { mode: 'join-competition' } })}
          variant="outline"
          className="border-2 border-purple-200 text-purple-600 hover:bg-purple-50 px-6 py-3"
        >
          <Users className="w-5 h-5 mr-2" />
          Join Competition
        </Button>
        <Button
          onClick={() => navigate('/competitions', { state: { activeTab: 'my-history', historyFilter: 'competition' } })}
          variant="outline"
          className="border-2 border-purple-200 text-purple-600 hover:bg-purple-50 px-6 py-3"
        >
          <History className="w-5 h-5 mr-2" />
          View Competition History
        </Button>
      </motion.div>
    </div>
  );
};

export default CompetitionPanel;