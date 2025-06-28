// src/components/competition/RandomMatchManagement.tsx
import React, { useEffect, useState } from 'react';
import { useCompetitionStore } from '../../store/useCompetitionStore';
import { Button } from '../ui/Button';
import { Card, CardBody, CardHeader } from '../ui/Card';
import {
  Trophy, Clock, Calendar, Hash, Users,
  CheckCircle, XCircle, Eye, Trash2, Loader, AlertTriangle,
  Filter, Search, Sparkles, Award, Target, TrendingUp, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RandomMatchManagementProps {
  userId: string;
}

const RandomMatchManagement: React.FC<RandomMatchManagementProps> = ({ userId }) => {
  const { competitionResultsHistory, loadCompetitionResultsHistory } = useCompetitionStore();
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  // Note: Deletion of competition results is generally not allowed from client-side
  // as they are part of a shared competition record.
  // This component will not include a delete functionality for competition results.

  useEffect(() => {
    const loadHistory = async () => {
      setIsLoading(true);
      await loadCompetitionResultsHistory(userId);
      setIsLoading(false);
    };
    loadHistory();
  }, [userId, loadCompetitionResultsHistory]);

  const filteredHistory = competitionResultsHistory.filter(item => {
    const isRandomMatch = item.competition_type === 'random';
    const matchesSearch = item.competition_title?.toLowerCase().includes(searchTerm.toLowerCase()) || item.competition_code?.toLowerCase().includes(searchTerm.toLowerCase());
    return isRandomMatch && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold text-gray-800 mb-4 flex items-center justify-center">
          <Zap className="w-10 h-10 mr-4 text-orange-600" />
          Random Match History
        </h1>
        <p className="text-gray-600 text-lg">
          Review your past random match battles
        </p>
      </motion.div>

      <Card className="mb-8 shadow-lg border-2 border-orange-100">
        <CardBody className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by title or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none transition-colors"
              />
            </div>
          </div>
        </CardBody>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
        </div>
      ) : filteredHistory.length === 0 ? (
        <Card className="shadow-lg">
          <CardBody className="p-12 text-center">
            <Zap className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No random match history found
            </h3>
            <p className="text-gray-500">
              {searchTerm
                ? 'Try adjusting your search criteria'
                : 'Participate in a random match to see your history here!'
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
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-r from-orange-500 to-red-500`}>
                          <Zap className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-800">
                            {item.competition_title}
                          </h3>
                          <p className="text-gray-600 text-sm">
                            Code: {item.competition_code} | Type: {item.competition_type}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-600" />
                          <span className="text-gray-600">Date:</span>
                          <span className="font-semibold">{new Date(item.competition_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-gray-600" />
                          <span className="text-gray-600">Time:</span>
                          <span className="font-semibold">{new Date(item.competition_date).toLocaleTimeString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Trophy className="w-4 h-4 text-gray-600" />
                          <span className="text-gray-600">Rank:</span>
                          <span className="font-semibold text-purple-600">#{item.final_rank}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Target className="w-4 h-4 text-gray-600" />
                          <span className="text-gray-600">Score:</span>
                          <span className="font-semibold text-green-600">{item.score?.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2 ml-6">
                      <Button
                        onClick={() => console.log('View random match results for:', item.id)} // Implement detailed view if needed
                        className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 px-4 py-2"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Results
                      </Button>
                      {/* No delete button for competition results */}
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RandomMatchManagement;