// src/components/competition/SoloQuizStats.tsx
import React, { useEffect, useState } from 'react';
import { useQuizStore } from '../../store/useQuizStore';
import { Card, CardBody, CardHeader } from '../ui/Card';
import { Trophy, Target, Clock, TrendingUp, Star, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

interface SoloQuizStatsProps {
  userId: string;
}

const SoloQuizStats: React.FC<SoloQuizStatsProps> = ({ userId }) => {
  const { soloQuizHistory, loadSoloQuizHistory } = useQuizStore();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    averageScore: 0,
    bestScore: 0,
    totalQuestionsAnswered: 0,
    totalTimeSpent: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      await loadSoloQuizHistory(userId);
      setIsLoading(false);
    };
    fetchStats();
  }, [userId, loadSoloQuizHistory]);

  useEffect(() => {
    if (soloQuizHistory.length > 0) {
      const totalQuizzes = soloQuizHistory.length;
      const totalScore = soloQuizHistory.reduce((sum, quiz) => sum + (quiz.percentage_score || 0), 0);
      const averageScore = totalScore / totalQuizzes;
      const bestScore = Math.max(...soloQuizHistory.map(quiz => quiz.percentage_score || 0));
      const totalQuestionsAnswered = soloQuizHistory.reduce((sum, quiz) => sum + (quiz.questions_attempted || 0), 0);
      const totalTimeSpent = soloQuizHistory.reduce((sum, quiz) => sum + (quiz.total_time_taken || 0), 0);

      setStats({
        totalQuizzes,
        averageScore: parseFloat(averageScore.toFixed(1)),
        bestScore: parseFloat(bestScore.toFixed(1)),
        totalQuestionsAnswered,
        totalTimeSpent,
      });
    } else {
      setStats({
        totalQuizzes: 0,
        averageScore: 0,
        bestScore: 0,
        totalQuestionsAnswered: 0,
        totalTimeSpent: 0,
      });
    }
  }, [soloQuizHistory]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <Card className="shadow-xl border-2 border-purple-100">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
        <h3 className="text-2xl font-bold text-slate-800 flex items-center">
          <BookOpen className="w-7 h-7 mr-3 text-purple-600" />
          Your Solo Quiz Stats
        </h3>
      </CardHeader>
      <CardBody className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              label: 'Total Quizzes',
              value: stats.totalQuizzes,
              icon: Trophy,
              color: 'from-blue-500 to-cyan-500',
            },
            {
              label: 'Average Score',
              value: `${stats.averageScore}%`,
              icon: Target,
              color: 'from-green-500 to-emerald-500',
            },
            {
              label: 'Best Score',
              value: `${stats.bestScore}%`,
              icon: Star,
              color: 'from-yellow-500 to-orange-500',
            },
            {
              label: 'Questions Answered',
              value: stats.totalQuestionsAnswered,
              icon: BookOpen,
              color: 'from-indigo-500 to-purple-500',
            },
            {
              label: 'Total Time Spent',
              value: formatTime(stats.totalTimeSpent),
              icon: Clock,
              color: 'from-teal-500 to-cyan-500',
            },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden">
                <div className={`h-2 bg-gradient-to-r ${stat.color}`} />
                <CardBody className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-gray-800 mb-1">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
};

export default SoloQuizStats;