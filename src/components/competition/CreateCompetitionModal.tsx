import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardBody, CardHeader } from '../ui/Card';
import { Users, Mail, Plus, X, Trophy, Settings, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCompetitionStore } from '../../store/useCompetitionStore';
import { QuizPreferences } from '../../types';

interface CreateCompetitionModalProps {
  mode: 'private' | 'random';
  quizPreferences: QuizPreferences;
  onClose: () => void;
  onSuccess: (competitionId: string) => void;
}

const CreateCompetitionModal: React.FC<CreateCompetitionModalProps> = ({
  mode,
  quizPreferences,
  onClose,
  onSuccess
}) => {
  const { createCompetition, inviteParticipants, isLoading } = useCompetitionStore();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    maxParticipants: 4,
    emails: ['']
  });

  const handleCreateCompetition = async () => {
    try {
      const competition = await createCompetition({
        title: formData.title,
        description: formData.description,
        type: mode,
        maxParticipants: formData.maxParticipants,
        quizPreferences
      });

      if (mode === 'private' && formData.emails.some(email => email.trim())) {
        const validEmails = formData.emails.filter(email => email.trim());
        if (validEmails.length > 0) {
          await inviteParticipants(competition.id, validEmails);
        }
      }

      onSuccess(competition.id);
    } catch (error) {
      console.error('Error creating competition:', error);
    }
  };

  const addEmailField = () => {
    setFormData(prev => ({
      ...prev,
      emails: [...prev.emails, '']
    }));
  };

  const removeEmailField = (index: number) => {
    setFormData(prev => ({
      ...prev,
      emails: prev.emails.filter((_, i) => i !== index)
    }));
  };

  const updateEmail = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      emails: prev.emails.map((email, i) => i === index ? value : email)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Trophy className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Create {mode === 'private' ? 'Private' : 'Random'} Competition
                </h2>
                <p className="text-gray-600">Set up your quiz competition</p>
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

        <div className="p-6">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <Settings className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-semibold">Competition Details</h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Competition Title *
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g., Computer Science Challenge"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    placeholder="Describe your competition..."
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors resize-none"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum Participants
                  </label>
                  <Input
                    type="number"
                    min={2}
                    max={20}
                    value={formData.maxParticipants}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) }))}
                    className="w-full"
                  />
                </div>

                {/* Quiz Settings Preview */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    Quiz Settings
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Course:</span>
                      <span className="ml-2 font-medium">{quizPreferences.course}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Questions:</span>
                      <span className="ml-2 font-medium">{quizPreferences.questionCount}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Difficulty:</span>
                      <span className="ml-2 font-medium capitalize">{quizPreferences.difficulty}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Language:</span>
                      <span className="ml-2 font-medium">{quizPreferences.language}</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <Button
                    variant="outline"
                    onClick={onClose}
                  >
                    Cancel
                  </Button>
                  {mode === 'private' ? (
                    <Button
                      onClick={() => setStep(2)}
                      disabled={!formData.title.trim()}
                      className="gradient-bg"
                    >
                      Next: Invite Participants
                    </Button>
                  ) : (
                    <Button
                      onClick={handleCreateCompetition}
                      disabled={!formData.title.trim() || isLoading}
                      className="gradient-bg"
                    >
                      {isLoading ? 'Creating...' : 'Create Competition'}
                    </Button>
                  )}
                </div>
              </motion.div>
            )}

            {step === 2 && mode === 'private' && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center space-x-3 mb-6">
                  <Users className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg font-semibold">Invite Participants</h3>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-blue-800 text-sm">
                    You can invite participants now or share the competition code later. 
                    Participants will receive email invitations and can also join using the competition code.
                  </p>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Participant Email Addresses (Optional)
                  </label>
                  
                  {formData.emails.map((email, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="flex-1 relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-gray-400" />
                        </div>
                        <Input
                          type="email"
                          placeholder="participant@example.com"
                          value={email}
                          onChange={(e) => updateEmail(index, e.target.value)}
                          className="pl-10"
                        />
                      </div>
                      {formData.emails.length > 1 && (
                        <Button
                          variant="ghost"
                          onClick={() => removeEmailField(index)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    onClick={addEmailField}
                    className="w-full border-dashed"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Another Email
                  </Button>
                </div>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={() => setStep(1)}
                  >
                    Back
                  </Button>
                  <Button
                    onClick={handleCreateCompetition}
                    disabled={isLoading}
                    className="gradient-bg"
                  >
                    {isLoading ? 'Creating...' : 'Create Competition'}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateCompetitionModal;