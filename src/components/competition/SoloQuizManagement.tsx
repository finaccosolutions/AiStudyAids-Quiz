// src/components/competition/SoloQuizManagement.tsx
import React, { useEffect, useState } from 'react';
import { useQuizStore } from '../../store/useQuizStore';
import { Button } from '../ui/Button';
import { Card, CardBody, CardHeader } from '../ui/Card';
import {
  BookOpen, Clock, Calendar, Hash, Users,
  CheckCircle, XCircle, Eye, Trash2, Loader, AlertTriangle,
  Filter, Search, Sparkles, Award, Target, TrendingUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import QuizResults from '../quiz/QuizResults'; // Reusable QuizResults component

interface SoloQuizManagementProps {
  userId: string;
}

const SoloQuizManagement: React.FC<SoloQuizManagementProps> = ({ userId }) => {
  const { soloQuizHistory, loadSoloQuizHistory, deleteSoloQuizResult, preferences } = useQuizStore();
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSoloQuizDetails, setShowSoloQuizDetails] = useState<any | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    const loadHistory = async () => {
      setIsLoading(true);
      await loadSoloQuizHistory(userId);
      setIsLoading(false);
    };
    loadHistory();
  }, [userId, loadSoloQuizHistory]);

  const filteredHistory = soloQuizHistory.filter(item => {
    const matchesSearch = item.topic?.toLowerCase().includes(searchTerm.toLowerCase()) || item.course?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleDelete = async () => {
    if (!showDeleteConfirm) return;

    setIsLoading(true);
    try {
      await deleteSoloQuizResult(showDeleteConfirm);
    } catch (error) {
      console.error('Failed to delete item:', error);
    } finally {
      setShowDeleteConfirm(null);
      setIsLoading(false);
    }
  };

  if (showSoloQuizDetails) {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative w-full max-w-4xl mx-auto my-8"
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
          Solo Quiz Management
        </h1>
        <p className="text-gray-600 text-lg">
          Review and manage your past solo quiz attempts
        </p>
      </motion.div>

      <Card className="mb-8 shadow-lg border-2 border-purple-100">
        <CardBody className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by topic or course..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
              />
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
              No solo quiz history found
            </h3>
            <p className="text-gray-500">
              {searchTerm
                ? 'Try adjusting your search criteria'
                : 'Start a solo quiz to see your history here!'
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
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-500`}>
                          <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-800">
                            {item.course} - {item.topic}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            Solo Quiz on {item.difficulty} difficulty
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-600" />
                          <span className="text-gray-600">Date:</span>
                          <span className="font-semibold">{new Date(item.quiz_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-600" />
                          <span className="text-gray-600">Time:</span>
                          <span className="font-semibold">{new Date(item.quiz_date).toLocaleTimeString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Target className="w-4 h-4 text-gray-600" />
                          <span className="text-gray-600">Score:</span>
                          <span className="font-semibold text-purple-600">{item.percentage_score?.toFixed(1)}%</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-gray-600" />
                          <span className="text-gray-600">Status:</span>
                          <span className={`font-semibold text-green-600`}>
                            Completed
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2 ml-6">
                      <Button
                        onClick={() => setShowSoloQuizDetails(item)}
                        className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 px-4 py-2"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                      <Button
                        onClick={() => setShowDeleteConfirm(item.id)}
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
                  Are you sure you want to delete this solo quiz result? This action cannot be undone.
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

export default SoloQuizManagement;  