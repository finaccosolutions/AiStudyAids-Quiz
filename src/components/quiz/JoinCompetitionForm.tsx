import React, { useState } from 'react';
import { useCompetitionStore } from '../../store/useCompetitionStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardBody, CardHeader } from '../ui/Card';
import { Hash, Users, ArrowRight, Search, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface JoinCompetitionFormProps {
  onJoinSuccess: () => void;
  onCancel: () => void;
}

const JoinCompetitionForm: React.FC<JoinCompetitionFormProps> = ({
  onJoinSuccess,
  onCancel
}) => {
  const { joinCompetition, isLoading, error } = useCompetitionStore();
  const [competitionCode, setCompetitionCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!competitionCode.trim()) return;

    setIsJoining(true);
    try {
      await joinCompetition(competitionCode.toUpperCase());
      onJoinSuccess();
    } catch (error) {
      console.error('Failed to join competition:', error);
    } finally {
      setIsJoining(false);
    }
  };

  const handleCodeChange = (value: string) => {
    // Only allow alphanumeric characters and limit to 6 characters
    const cleanValue = value.replace(/[^A-Z0-9]/g, '').substring(0, 6);
    setCompetitionCode(cleanValue);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-2xl border-2 border-purple-100 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Hash className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Join Competition</h2>
                <p className="text-green-100">Enter a 6-digit competition code</p>
              </div>
            </div>
            <Button
              variant="ghost"
              onClick={onCancel}
              className="text-white hover:bg-white hover:bg-opacity-20"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </CardHeader>

        <CardBody className="p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Instructions */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Hash className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Enter Competition Code
              </h3>
              <p className="text-gray-600">
                Ask the competition creator for the 6-digit code to join their quiz
              </p>
            </div>

            {/* Code Input Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 text-center">
                  Competition Code
                </label>
                <div className="relative">
                  <Input
                    type="text"
                    placeholder="ABC123"
                    value={competitionCode}
                    onChange={(e) => handleCodeChange(e.target.value.toUpperCase())}
                    className="w-full py-4 text-center text-3xl font-mono tracking-wider border-2 focus:border-green-500 focus:ring-green-200"
                    maxLength={6}
                    autoComplete="off"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <Search className="w-6 h-6 text-gray-400" />
                  </div>
                </div>
                <div className="text-center">
                  <span className="text-sm text-gray-500">
                    {competitionCode.length}/6 characters
                  </span>
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-50 border border-red-200 rounded-lg"
                >
                  <p className="text-red-700 text-center">{error}</p>
                </motion.div>
              )}

              <Button
                type="submit"
                disabled={competitionCode.length !== 6 || isJoining}
                className="w-full gradient-bg hover:opacity-90 transition-all duration-300 py-4 text-lg"
              >
                {isJoining ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Joining...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <span>Join Competition</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </Button>
            </form>

            {/* Help Section */}
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                How to Join a Competition
              </h4>
              <div className="space-y-2 text-sm text-blue-700">
                <div className="flex items-start space-x-2">
                  <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">1</span>
                  <span>Get the 6-digit competition code from the creator</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">2</span>
                  <span>Enter the code in the field above</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">3</span>
                  <span>Wait in the lobby for the competition to start</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">4</span>
                  <span>Compete and climb the leaderboard!</span>
                </div>
              </div>
            </div>

            {/* Sample Code Format */}
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">Example code format:</p>
              <div className="inline-block bg-gray-100 px-4 py-2 rounded-lg">
                <code className="text-lg font-mono font-bold text-gray-800">ABC123</code>
              </div>
            </div>
          </motion.div>
        </CardBody>
      </Card>
    </div>
  );
};

export default JoinCompetitionForm;