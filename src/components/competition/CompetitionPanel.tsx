// src/components/competition/CompetitionPanel.tsx
import React, { useState, useEffect } from 'react'; // Add useState and useEffect
import { useCompetitionStore } from '../../store/useCompetitionStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../ui/Button';
import { Card, CardBody, CardHeader } from '../ui/Card';
import { 
  Trophy, Users, Clock, Calendar, Settings, 
  Trash2, Eye, Play, Pause, CheckCircle, 
  XCircle, AlertTriangle, Crown, Hash,
  Filter, Search, MoreVertical, Edit
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Competition } from '../../types/competition';
import { useNavigate } from 'react-router-dom';
import QuizHistory from './QuizHistory'; // Import QuizHistory

interface CompetitionPanelProps {
  userId: string;
}

const CompetitionPanel: React.FC<CompetitionPanelProps> = ({ userId }) => {
  const { 
    competitions, 
    loadUserCompetitions, 
    deleteCompetition, 
    loadCompetition, // Keep this for other uses
    isCompetitionsLoading, // Use the specific loading state
    error 
  } = useCompetitionStore();
  
  const [filter, setFilter] = useState<'all' | 'waiting' | 'active' | 'completed' | 'cancelled'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadUserCompetitions(userId);
  }, [userId, loadUserCompetitions]);

// Ensure competitions is an array before filtering
const activeOrWaitingCompetitions = (competitions ?? []).filter(competition =>
  (competition.status === 'waiting' || competition.status === 'active') && competition.creator_id === userId
);

const filteredCompetitions = (competitions ?? []).filter(competition => {
  const matchesFilter = filter === 'all' || competition.status === filter;
  const matchesSearch = competition.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       competition.competition_code.toLowerCase().includes(searchTerm.toLowerCase());
  return matchesFilter && matchesSearch;
});

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'waiting': return 'text-yellow-600 bg-yellow-100 border-yellow-200';
      case 'active': return 'text-green-600 bg-green-100 border-green-200';
      case 'completed': return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'cancelled': return 'text-red-600 bg-red-100 border-red-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'waiting': return Clock;
      case 'active': return Play;
      case 'completed': return CheckCircle;
      case 'cancelled': return XCircle;
      default: return AlertTriangle;
    }
  };

  const handleViewCompetition = (competition: Competition) => {
    loadCompetition(competition.id);
  };

  const handleDeleteCompetition = async (competitionId: string) => {
    try {
      await deleteCompetition(competitionId);
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete competition:', error);
    }
  };

  const getParticipantCount = (competition: Competition) => {
    // This would need to be loaded from the database
    // For now, return a placeholder
    return Math.floor(Math.random() * 10) + 1;
  };

   if (isCompetitionsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4 flex items-center">
          <Trophy className="w-10 h-10 mr-4 text-purple-600" />
          Competition Management
        </h1>
        <p className="text-gray-600 text-lg">
          Manage all your created competitions and track their progress
        </p>
      </div>

      {/* Filters and Search */}
      <Card className="mb-8 shadow-lg border-2 border-purple-100">
        <CardBody className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search competitions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Status Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
              >
                <option value="all">All Status</option>
                <option value="waiting">Waiting</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Competition Stats */}
          {/* Locate the "Competition Stats" section (around line 120) and add this block immediately after it: */}
    {activeOrWaitingCompetitions.length > 0 && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <Card className="shadow-xl border-2 border-green-100">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50">
            <h3 className="text-2xl font-bold text-gray-800 flex items-center">
              <Play className="w-7 h-7 mr-3 text-green-600" />
              Your Active Competitions
            </h3>
          </CardHeader>
          <CardBody className="p-6">
            <div className="space-y-4">
              {activeOrWaitingCompetitions.map((competition, index) => (
                <motion.div
                  key={competition.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 shadow-sm"
                >
                  <div>
                    <h4 className="font-bold text-lg text-gray-800">{competition.title}</h4>
                    <p className="text-gray-600 text-sm">Code: <span className="font-mono font-bold text-purple-600">{competition.competition_code}</span></p>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(competition.status)}`}>
                      {/* Assuming StatusIcon is defined or imported */}
                      {/* <StatusIcon className="w-3 h-3 inline mr-1" /> */}
                      {competition.status.toUpperCase()}
                    </span>
                  </div>
                  <Button
                    onClick={() => handleViewCompetition(competition)}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 px-4 py-2"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Resume
                  </Button>
                </motion.div>
              ))}
            </div>
          </CardBody>
        </Card>
      </motion.div>
    )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { 
            label: 'Total Competitions', 
            value: (competitions ?? []).length, 
            icon: Trophy, 
            color: 'from-blue-500 to-cyan-500' 
          },
          { 
            label: 'Active', 
            value: (competitions ?? []).filter(c => c.status === 'active').length, 
            icon: Play, 
            color: 'from-green-500 to-emerald-500' 
          },
          { 
            label: 'Completed', 
            value: (competitions ?? []).filter(c => c.status === 'completed').length, 
            icon: CheckCircle, 
            color: 'from-blue-500 to-cyan-500' 
          },
          { 
            label: 'Waiting', 
            value: (competitions ?? []).filter(c => c.status === 'waiting').length, 
            icon: Clock, 
            color: 'from-yellow-500 to-orange-500' 
          }
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="shadow-lg border-2 border-gray-100 hover:shadow-xl transition-shadow">
              <CardBody className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                    <p className="text-3xl font-bold text-gray-800">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-xl flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Competitions List */}
      {filteredCompetitions.length === 0 ? (
        <Card className="shadow-lg">
          <CardBody className="p-12 text-center">
            <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {searchTerm || filter !== 'all' ? 'No competitions found' : 'No competitions yet'}
            </h3>
            <p className="text-gray-500">
              {searchTerm || filter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Create your first competition to get started'
              }
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredCompetitions.map((competition, index) => {
            const StatusIcon = getStatusIcon(competition.status);
            const participantCount = getParticipantCount(competition);
            
            return (
              <motion.div
                key={competition.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="shadow-lg border-2 border-gray-100 hover:shadow-xl transition-all duration-300 hover:scale-[1.01]">
                  <CardBody className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Header */}
                        <div className="flex items-center space-x-4 mb-4">
                          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
                            <Trophy className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-xl font-bold text-gray-800">{competition.title}</h3>
                              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(competition.status)}`}>
                                <StatusIcon className="w-3 h-3 inline mr-1" />
                                {competition.status.toUpperCase()}
                              </span>
                              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold flex items-center">
                                <Crown className="w-3 h-3 mr-1" />
                                CREATOR
                              </span>
                            </div>
                            <p className="text-gray-600">{competition.description}</p>
                          </div>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="flex items-center space-x-2">
                            <Hash className="w-4 h-4 text-purple-600" />
                            <span className="text-sm text-gray-600">Code:</span>
                            <span className="font-mono font-bold text-purple-600">{competition.competition_code}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4 text-blue-600" />
                            <span className="text-sm text-gray-600">Participants:</span>
                            <span className="font-semibold">{participantCount}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-gray-600">Created:</span>
                            <span className="font-semibold">{new Date(competition.created_at).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Settings className="w-4 h-4 text-orange-600" />
                            <span className="text-sm text-gray-600">Type:</span>
                            <span className="font-semibold capitalize">{competition.type}</span>
                          </div>
                        </div>

                        {/* Quiz Settings */}
                        <div className="bg-gray-50 p-4 rounded-xl">
                          <h4 className="font-semibold text-gray-700 mb-2">Quiz Configuration</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Course:</span>
                              <span className="ml-2 font-medium">{competition.quiz_preferences?.course}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Questions:</span>
                              <span className="ml-2 font-medium">{competition.quiz_preferences?.questionCount}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Difficulty:</span>
                              <span className="ml-2 font-medium capitalize">{competition.quiz_preferences?.difficulty}</span>
                            </div>
                            <div>
                              <span className="text-gray-600">Language:</span>
                              <span className="ml-2 font-medium">{competition.quiz_preferences?.language}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col space-y-2 ml-6">
                        <Button
                          onClick={() => handleViewCompetition(competition)}
                          className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 px-4 py-2"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View
                        </Button>
                        
                        {competition.status === 'waiting' && (
                          <Button
                            onClick={() => setShowDeleteConfirm(competition.id)}
                            variant="outline"
                            className="border-red-200 text-red-600 hover:bg-red-50 px-4 py-2"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl"
            >
              <div className="text-center">
                <Trash2 className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Delete Competition?</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this competition? This action cannot be undone and all participants will be notified.
                </p>
                <div className="flex space-x-4">
                  <Button
                    onClick={() => setShowDeleteConfirm(null)}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleDeleteCompetition(showDeleteConfirm)}
                    className="flex-1 bg-red-500 hover:bg-red-600"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      {/* Display Competition History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <QuizHistory userId={userId} filter="competition" />
      </motion.div>
    </div>
  );
};

export default CompetitionPanel;