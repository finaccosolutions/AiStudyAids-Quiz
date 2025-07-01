// src/components/competition/QuizHistory.tsx
import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useQuizStore } from '../../store/useQuizStore';
import { useCompetitionStore } from '../../store/useCompetitionStore'; // Corrected import statement
import { Button } from '../ui/Button';
import { Card, CardBody, CardHeader } from '../ui/Card';
import {
  Trophy, BookOpen, Clock, Calendar, Hash, Users,
  CheckCircle, XCircle, Eye, Trash2, Loader, AlertTriangle,
  Filter, Search, Sparkles, Award, Target, TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import QuizResults from '../quiz/QuizResults'; // Reusable QuizResults component
import { useNavigate } from 'react-router-dom'; // Import useNavigate

interface QuizHistoryProps {
  userId: string;
  filter?: 'all' | 'solo' | 'competition' | 'random'; // Added filter prop
}

const QuizHistory: React.FC<QuizHistoryProps> = ({ userId, filter = 'all' }) => {
  const { soloQuizHistory, loadSoloQuizHistory, deleteSoloQuizResult, preferences } = useQuizStore();
  const { competitionResultsHistory, loadCompetitionResultsHistory } = useCompetitionStore();
  const [isLoading, setIsLoading] = useState(true);
  const [currentFilter, setCurrentFilter] = useState<'all' | 'solo' | 'competition' | 'random'>(filter); // Use currentFilter state
  const [searchTerm, setSearchTerm] = useState('');
  const [showSoloQuizDetails, setShowSoloQuizDetails] = useState<any | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ id: string; type: 'solo' | 'competition' } | null>(null);
  const navigate = useNavigate(); // Initialize useNavigate

  useEffect(() => {
    const loadHistory = async () => {
      setIsLoading(true);
      console.log('QuizHistory: Starting to load solo and competition history...');
      try {
        await Promise.all([
          loadSoloQuizHistory(userId),
          loadCompetitionResultsHistory(userId)
        ]);
        console.log('QuizHistory: Finished loading solo and competition history.');
      } catch (error) {
        console.error('QuizHistory: Error loading history:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadHistory();
  }, [userId, loadSoloQuizHistory, loadCompetitionResultsHistory]);

  useEffect(() => {
    setCurrentFilter(filter); // Update filter when prop changes
  }, [filter]);

  const allHistory = [
    ...soloQuizHistory.map(item => ({ ...item, type: 'solo', date: item.quizDate })), // Changed this line
    ...competitionResultsHistory.map(item => ({ ...item, type: item.competition_type === 'random' ? 'random' : 'competition', date: item.competition_date ? new Date(item.competition_date) : null }))
  ].sort((a, b) => (b.date?.getTime() || 0) - (a.date?.getTime() || 0)); // Sort by most recent

  const filteredHistory = allHistory.filter(item => {
    const matchesFilter = currentFilter === 'all' || item.type === currentFilter;
    const matchesSearch = item.type === 'solo'
      ? (item.topic?.toLowerCase().includes(searchTerm.toLowerCase()) || item.course?.toLowerCase().includes(searchTerm.toLowerCase()))
      : (item.competition_title?.toLowerCase().includes(searchTerm.toLowerCase()) || item.competition_code?.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const handleDelete = async () => {
    if (!showDeleteConfirm) return;

    setIsLoading(true);
    try {
      if (showDeleteConfirm.type === 'solo') {
        await deleteSoloQuizResult(showDeleteConfirm.id);
      } else {
        // For competition results, we typically don't allow deletion from client side
        // as they are part of a shared competition record.
        // You might implement a soft delete or a different mechanism here.
        console.warn('Deletion of competition results is not directly supported from client.');
        // For now, just simulate removal from view if needed, or show an error.
        // If you implement a backend function for this, call it here.
      }
    } catch (error) {
      console.error('Failed to delete item:', error);
    } finally {
      setShowDeleteConfirm(null);
      setIsLoading(false);
    }
  };

  if (showSoloQuizDetails) {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4 overflow-y-auto"> {/* Removed max-h-screen */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative w-full max-w-full mx-auto my-8" // Changed max-w-4xl to max-w-full
        >
          <QuizResults
            result={showSoloQuizDetails}
            preferences={preferences || {} as any} // Pass preferences from store
            onClose={() => setShowSoloQuizDetails(null)}
          />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold text-gray-800 mb-4 flex items-center justify-center">
          <BookOpen className="w-10 h-10 mr-4 text-purple-600" />
          Quiz History
        </h1>
        <p className="text-gray-600 text-lg">
          Review your past solo quizzes and competition results
        </p>
      </motion.div>

      <Card className="mb-8 shadow-lg border-2 border-purple-100">
        <CardBody className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by topic or competition code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={currentFilter}
                onChange={(e) => setCurrentFilter(e.target.value as any)}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
              >
                <option value="all">All Quizzes</option>
                <option value="solo">Solo Quizzes</option>
                <option value="competition">Competitions</option>
                <option value="random">Random Matches</option>
              </select>
            </div>
          </div>
        </CardBody>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      ) : filteredHistory.length === 0 ? (
        <Card className="shadow-lg">
          <CardBody className="p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No history found
            </h3>
            <p className="text-gray-500">
              {searchTerm || currentFilter !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Start a quiz or competition to see your history here!'
              }
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredHistory.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="shadow-lg border-2 border-gray-100 hover:shadow-xl transition-all duration-300 hover:scale-[1.01]">
                <CardBody className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          item.type === 'solo' ? 'bg-gradient-to-r from-blue-500 to-indigo-500' : 'bg-gradient-to-r from-yellow-500 to-orange-500'
                        }`}>
                          {item.type === 'solo' ? <BookOpen className="w-6 h-6 text-white" /> : <Trophy className="w-6 h-6 text-white" />}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-800">
                            {item.type === 'solo' ? `${item.course} - ${item.topic}` : item.competition_title}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            {item.type === 'solo' ? `Solo Quiz on ${item.difficulty} difficulty` : `Competition Code: ${item.competition_code}`}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-600" />
                          <span className="text-gray-600">Date:</span>
                          <span className="font-semibold">
                            {item.date && !isNaN(item.date.getTime()) ? item.date.toLocaleDateString() : 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-600" />
                          <span className="text-gray-600">Time:</span>
                          <span className="font-semibold">
                            {item.date && !isNaN(item.date.getTime()) ? item.date.toLocaleTimeString() : 'N/A'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Target className="w-4 h-4 text-gray-600" />
                          <span className="text-gray-600">Score:</span>
                          <span className="font-semibold text-purple-600">{item.percentage_score?.toFixed(1) || item.score?.toFixed(1)}%</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-gray-600" />
                          <span className="text-gray-600">Status:</span>
                          <span className={`font-semibold ${item.status === 'completed' ? 'text-green-600' : 'text-orange-600'}`}>
                            {item.status === 'completed' ? 'Completed' : 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2 ml-6">
                      {item.type === 'solo' && (
                        <Button
                          onClick={() => setShowSoloQuizDetails(item)}
                          className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 px-4 py-2"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      )}
                      {(item.type === 'competition' || item.type === 'random') && (
                        <Button
                          onClick={() => navigate(`/shared-competition-result/${item.id}`)} // Navigate to shared competition result page
                          className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 px-4 py-2"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          View Results
                        </Button>
                      )}
                      <Button
                        onClick={() => setShowDeleteConfirm({ id: item.id, type: item.type })}
                        variant="outline"
                        className="border-red-200 text-red-600 hover:bg-red-50 px-4 py-2"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

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
                <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Confirm Deletion</h3>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete this {showDeleteConfirm.type} result? This action cannot be undone.
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
                    onClick={handleDelete}
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
    </div>
  );
};

export default QuizHistory;