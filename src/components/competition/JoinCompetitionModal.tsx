import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Trophy, Users, Hash } from 'lucide-react';
import { motion } from 'framer-motion';
import { useCompetitionStore } from '../../store/useCompetitionStore';

interface JoinCompetitionModalProps {
  onClose: () => void;
  onSuccess: (competitionId: string) => void;
}

const JoinCompetitionModal: React.FC<JoinCompetitionModalProps> = ({
  onClose,
  onSuccess
}) => {
  const { joinCompetition, isLoading, error } = useCompetitionStore();
  const [competitionCode, setCompetitionCode] = useState('');

  const handleJoin = async () => {
    try {
      await joinCompetition(competitionCode.toUpperCase());
      // Get the competition ID from the store after successful join
      // For now, we'll pass the code as ID since we need to refactor this
      onSuccess(competitionCode);
    } catch (error) {
      console.error('Error joining competition:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full"
      >
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Trophy className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Join Competition</h2>
                <p className="text-gray-600 text-sm">Enter the competition code to join</p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-purple-600" />
            </div>
            <p className="text-gray-600">
              Ask the competition creator for the 6-digit competition code
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Competition Code
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Hash className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="ABC123"
                value={competitionCode}
                onChange={(e) => setCompetitionCode(e.target.value.toUpperCase())}
                className="pl-10 text-center text-lg font-mono tracking-wider"
                maxLength={6}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <div className="flex space-x-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleJoin}
              disabled={!competitionCode.trim() || competitionCode.length !== 6 || isLoading}
              className="flex-1 gradient-bg"
            >
              {isLoading ? 'Joining...' : 'Join Competition'}
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default JoinCompetitionModal;