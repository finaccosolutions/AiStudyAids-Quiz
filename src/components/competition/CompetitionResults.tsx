import React, { useEffect } from 'react';
import { Button } from '../ui/Button';
import { Card, CardBody, CardHeader } from '../ui/Card';
import { 
  Trophy, Medal, Clock, Target, Users, 
  Star, TrendingUp, Award, Crown, Zap 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useCompetitionStore } from '../../store/useCompetitionStore';
import { Competition } from '../../types/competition';

interface CompetitionResultsProps {
  competition: Competition;
  onNewCompetition: () => void;
  onBackToHome: () => void;
}

const CompetitionResults: React.FC<CompetitionResultsProps> = ({
  competition,
  onNewCompetition,
  onBackToHome
}) => {
  const { participants, loadParticipants } = useCompetitionStore();

  useEffect(() => {
    loadParticipants(competition.id);
  }, [competition.id]);

  const sortedParticipants = participants
    .filter(p => p.status === 'completed')
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.time_taken - b.time_taken;
    });

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2: return <Medal className="w-6 h-6 text-gray-400" />;
      case 3: return <Award className="w-6 h-6 text-orange-400" />;
      default: return <Star className="w-6 h-6 text-purple-500" />;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'from-yellow-400 to-yellow-600';
      case 2: return 'from-gray-300 to-gray-500';
      case 3: return 'from-orange-400 to-orange-600';
      default: return 'from-purple-400 to-purple-600';
    }
  };

  const getRankBg = (rank: number) => {
    switch (rank) {
      case 1: return 'from-yellow-50 to-yellow-100 border-yellow-200';
      case 2: return 'from-gray-50 to-gray-100 border-gray-200';
      case 3: return 'from-orange-50 to-orange-100 border-orange-200';
      default: return 'from-purple-50 to-purple-100 border-purple-200';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="flex justify-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="p-6 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-full"
          >
            <Trophy className="w-16 h-16 text-purple-600" />
          </motion.div>
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Competition Complete!</h1>
        <h2 className="text-2xl font-semibold text-purple-600 mb-2">{competition.title}</h2>
        <p className="text-gray-600">
          {sortedParticipants.length} participants • {competition.quiz_preferences.questionCount} questions
        </p>
      </motion.div>

      {/* Podium */}
      {sortedParticipants.length >= 3 && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center items-end space-x-8 mb-12"
        >
          {/* 2nd Place */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            <div className="w-24 h-24 bg-gradient-to-r from-gray-300 to-gray-500 rounded-full flex items-center justify-center mb-4 mx-auto">
              <span className="text-white text-2xl font-bold">2</span>
            </div>
            <div className="bg-gray-100 p-4 rounded-t-lg w-32 h-20 flex flex-col justify-center">
              <div className="font-semibold text-gray-900 truncate">
                {sortedParticipants[1]?.profile?.full_name || 'Player 2'}
              </div>
              <div className="text-sm text-gray-600">{sortedParticipants[1]?.score} pts</div>
            </div>
          </motion.div>

          {/* 1st Place */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center"
          >
            <div className="w-32 h-32 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mb-4 mx-auto relative">
              <span className="text-white text-3xl font-bold">1</span>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute -top-2 -right-2"
              >
                <Crown className="w-8 h-8 text-yellow-300" />
              </motion.div>
            </div>
            <div className="bg-yellow-100 p-6 rounded-t-lg w-36 h-28 flex flex-col justify-center">
              <div className="font-bold text-yellow-800 truncate text-lg">
                {sortedParticipants[0]?.profile?.full_name || 'Winner'}
              </div>
              <div className="text-yellow-700 font-semibold">{sortedParticipants[0]?.score} pts</div>
            </div>
          </motion.div>

          {/* 3rd Place */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center"
          >
            <div className="w-20 h-20 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center mb-4 mx-auto">
              <span className="text-white text-xl font-bold">3</span>
            </div>
            <div className="bg-orange-100 p-3 rounded-t-lg w-28 h-16 flex flex-col justify-center">
              <div className="font-semibold text-orange-900 truncate text-sm">
                {sortedParticipants[2]?.profile?.full_name || 'Player 3'}
              </div>
              <div className="text-xs text-orange-700">{sortedParticipants[2]?.score} pts</div>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Detailed Results */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card>
          <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b border-purple-100">
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl font-semibold">Final Rankings</h2>
            </div>
          </CardHeader>
          
          <CardBody>
            <div className="space-y-4">
              {sortedParticipants.map((participant, index) => (
                <motion.div
                  key={participant.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className={`p-6 rounded-2xl border-2 bg-gradient-to-r ${getRankBg(index + 1)} transition-all duration-300 hover:shadow-lg`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${getRankColor(index + 1)} flex items-center justify-center shadow-lg`}>
                        <span className="text-white text-xl font-bold">#{index + 1}</span>
                      </div>
                      
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-xl font-bold text-gray-900">
                            {participant.profile?.full_name || 'Anonymous Player'}
                          </h3>
                          {getRankIcon(index + 1)}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <Target className="w-4 h-4 mr-1" />
                            {participant.correct_answers}/{competition.quiz_preferences.questionCount} correct
                          </span>
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {formatTime(participant.time_taken)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-3xl font-bold text-gray-900 mb-1">
                        {participant.score}
                      </div>
                      <div className="text-sm text-gray-600">points</div>
                      <div className="text-xs text-purple-600 font-medium">
                        +{participant.points_earned} XP
                      </div>
                    </div>
                  </div>
                  
                  {/* Performance Bar */}
                  <div className="mt-4">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Accuracy</span>
                      <span>{Math.round((participant.correct_answers / competition.quiz_preferences.questionCount) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        className={`h-2 rounded-full bg-gradient-to-r ${getRankColor(index + 1)}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${(participant.correct_answers / competition.quiz_preferences.questionCount) * 100}%` }}
                        transition={{ duration: 1, delay: 1 + index * 0.1 }}
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Competition Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <Card className="text-center">
          <CardBody>
            <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{sortedParticipants.length}</div>
            <div className="text-sm text-gray-600">Participants</div>
          </CardBody>
        </Card>
        
        <Card className="text-center">
          <CardBody>
            <Target className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {Math.round(sortedParticipants.reduce((sum, p) => sum + (p.correct_answers / competition.quiz_preferences.questionCount) * 100, 0) / sortedParticipants.length)}%
            </div>
            <div className="text-sm text-gray-600">Avg. Accuracy</div>
          </CardBody>
        </Card>
        
        <Card className="text-center">
          <CardBody>
            <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {formatTime(Math.round(sortedParticipants.reduce((sum, p) => sum + p.time_taken, 0) / sortedParticipants.length))}
            </div>
            <div className="text-sm text-gray-600">Avg. Time</div>
          </CardBody>
        </Card>
        
        <Card className="text-center">
          <CardBody>
            <Zap className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">
              {sortedParticipants.reduce((sum, p) => sum + p.points_earned, 0)}
            </div>
            <div className="text-sm text-gray-600">Total XP</div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4 }}
        className="flex justify-center space-x-4"
      >
        <Button
          variant="outline"
          onClick={onBackToHome}
          className="px-8 py-3"
        >
          Back to Home
        </Button>
        <Button
          onClick={onNewCompetition}
          className="gradient-bg px-8 py-3"
        >
          <Trophy className="w-4 h-4 mr-2" />
          New Competition
        </Button>
      </motion.div>
    </div>
  );
};

export default CompetitionResults;