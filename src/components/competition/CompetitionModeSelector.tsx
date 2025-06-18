import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Card, CardBody, CardHeader } from '../ui/Card';
import { Users, Shuffle, Trophy, Zap, Clock, Target } from 'lucide-react';
import { motion } from 'framer-motion';

interface CompetitionModeSelectorProps {
  onSelectMode: (mode: 'private' | 'random') => void;
  onCancel: () => void;
}

const CompetitionModeSelector: React.FC<CompetitionModeSelectorProps> = ({
  onSelectMode,
  onCancel
}) => {
  const [selectedMode, setSelectedMode] = useState<'private' | 'random' | null>(null);

  const modes = [
    {
      id: 'private' as const,
      title: 'Private Competition',
      description: 'Create a private competition and invite specific friends or colleagues',
      icon: Users,
      features: [
        'Invite specific participants',
        'Custom competition settings',
        'Share via email or competition code',
        'Full control over participants'
      ],
      color: 'from-blue-500 to-indigo-500',
      bgColor: 'from-blue-50 to-indigo-50'
    },
    {
      id: 'random' as const,
      title: 'Random Matchmaking',
      description: 'Get matched with other players based on topic and difficulty',
      icon: Shuffle,
      features: [
        'Instant matchmaking',
        'Similar skill level opponents',
        'Quick 2-4 player matches',
        'Chat before quiz starts'
      ],
      color: 'from-purple-500 to-pink-500',
      bgColor: 'from-purple-50 to-pink-50'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Trophy className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Choose Competition Mode</h2>
                <p className="text-gray-600">Select how you want to compete with others</p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={onCancel}
              className="text-gray-500 hover:text-gray-700"
            >
              ×
            </Button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {modes.map((mode) => (
              <motion.div
                key={mode.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`relative overflow-hidden rounded-2xl border-2 transition-all duration-300 cursor-pointer ${
                  selectedMode === mode.id
                    ? 'border-purple-500 shadow-lg ring-4 ring-purple-200'
                    : 'border-gray-200 hover:border-purple-300 hover:shadow-md'
                }`}
                onClick={() => setSelectedMode(mode.id)}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${mode.bgColor} opacity-50`} />
                
                <div className="relative p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${mode.color}`}>
                      <mode.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">{mode.title}</h3>
                      <p className="text-gray-600 text-sm">{mode.description}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {mode.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {selectedMode === mode.id && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-3 bg-white bg-opacity-80 rounded-lg border border-purple-200"
                    >
                      <div className="flex items-center space-x-2 text-purple-700">
                        <Zap className="w-4 h-4" />
                        <span className="text-sm font-medium">Selected</span>
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={onCancel}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              onClick={() => selectedMode && onSelectMode(selectedMode)}
              disabled={!selectedMode}
              className="gradient-bg px-6"
            >
              <Target className="w-4 h-4 mr-2" />
              Continue
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CompetitionModeSelector;