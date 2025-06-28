// src/components/competition/SoloQuizStats.tsx
import React, { useEffect, useState } from 'react';
import { useQuizStore } from '../../store/useQuizStore';
import { Card, CardBody, CardHeader } from '../ui/Card';
import { Trophy, Target, Clock, TrendingUp, Star, BookOpen, ChevronDown, ChevronUp, BarChart3, PieChart, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar,
  PieChart as RechartsPieChart, Pie, Cell, Legend
} from 'recharts';
import { Button } from '../ui/Button'; // Import the Button component

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
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [questionTypePerformanceData, setQuestionTypePerformanceData] = useState<any[]>([]);
  const [answerDistributionData, setAnswerDistributionData] = useState<any[]>([]); // New state for answer distribution
  const [showDetailedStats, setShowDetailedStats] = useState(false);

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
      const totalScore = soloQuizHistory.reduce((sum, quiz) => sum + (quiz.percentage || 0), 0);
      const averageScore = totalScore / totalQuizzes;
      const bestScore = Math.max(...soloQuizHistory.map(quiz => quiz.percentage || 0));
      const totalQuestionsAnswered = soloQuizHistory.reduce((sum, quiz) => sum + (quiz.questionsAttempted || 0), 0);
      const totalTimeSpent = soloQuizHistory.reduce((sum, quiz) => sum + (quiz.totalTimeTaken || 0), 0);

      setStats({
        totalQuizzes,
        averageScore: parseFloat(averageScore.toFixed(1)),
        bestScore: parseFloat(bestScore.toFixed(1)),
        totalQuestionsAnswered,
        totalTimeSpent,
      });
      generateChartData(soloQuizHistory);
    } else {
      setStats({
        totalQuizzes: 0,
        averageScore: 0,
        bestScore: 0,
        totalQuestionsAnswered: 0,
        totalTimeSpent: 0,
      });
      setPerformanceData([]);
      setCategoryData([]);
      setQuestionTypePerformanceData([]);
      setAnswerDistributionData([]); // Reset new data
    }
  }, [soloQuizHistory]);

  const generateChartData = (history: any[]) => {
    // Performance Trends (Score over time)
   const sortedHistory = [...history].sort((a, b) => (a.quizDate?.getTime() || 0) - (b.quizDate?.getTime() || 0));
    const perfData = sortedHistory.map(quiz => ({
      date: quiz.quizDate ? quiz.quizDate.toLocaleDateString() : 'N/A',
      score: quiz.percentage || 0,
    }));
    setPerformanceData(perfData);

    // Subject Distribution
    const categoryMap = new Map<string, number>();
    history.forEach(quiz => {
      const category = quiz.topic || quiz.course || 'General';
      categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
    });
    const catData = Array.from(categoryMap.entries()).map(([name, value], index) => ({
      name,
      value,
      color: ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#6366F1', '#EC4899'][index % 7],
    }));
    setCategoryData(catData);

    // Question Type Performance
    const qtpMap = new Map<string, { correct: number; total: number }>();
    history.forEach(quiz => {
      for (const type in quiz.questionTypePerformance) {
        if (quiz.questionTypePerformance.hasOwnProperty(type)) {
          const current = qtpMap.get(type) || { correct: 0, total: 0 };
          qtpMap.set(type, {
            correct: current.correct + quiz.questionTypePerformance[type].correct,
            total: current.total + quiz.questionTypePerformance[type].total,
          });
        }
      }
    });
    const qtpData = Array.from(qtpMap.entries()).map(([name, data]) => ({ name: name.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()), correct: data.correct, total: data.total, percentage: data.total > 0 ? (data.correct / data.total) * 100 : 0 }));
    setQuestionTypePerformanceData(qtpData);

    // Answer Distribution (Correct, Incorrect, Skipped)
    let totalCorrect = 0;
    let totalIncorrect = 0;
    let totalSkipped = 0;
    history.forEach(quiz => {
      totalCorrect += quiz.correctAnswers || 0;
      totalIncorrect += (quiz.questionsAttempted || 0) - (quiz.correctAnswers || 0);
      totalSkipped += quiz.questionsSkipped || 0;
    });
    setAnswerDistributionData([
      { name: 'Correct', value: totalCorrect, color: '#10B981' },
      { name: 'Incorrect', value: totalIncorrect, color: '#EF4444' },
      { name: 'Skipped', value: totalSkipped, color: '#6B7280' },
    ]);
  };

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

        {/* Detailed Analytics */}
        {soloQuizHistory.length > 0 && ( // Check soloQuizHistory.length instead of performanceData.length
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-8"
          >
            <Card className="shadow-xl border-2 border-gray-100">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-purple-50">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                    <Activity className="w-7 h-7 mr-3 text-purple-600" />
                    Detailed Analytics
                  </h3>
                  <Button
                    variant="ghost"
                    onClick={() => setShowDetailedStats(!showDetailedStats)}
                    className="text-purple-600"
                  >
                    {showDetailedStats ? (
                      <>
                        <ChevronUp className="w-5 h-5 mr-2" />
                        Hide Details
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-5 h-5 mr-2" />
                        Show Details
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>

              <AnimatePresence>
                {showDetailedStats && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CardBody className="p-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Performance Trends Chart */}
                        <div>
                          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                            Score Performance Over Time
                          </h4>
                          <ResponsiveContainer width="100%" height={250}>
                            <AreaChart data={performanceData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="date" />
                              <YAxis />
                              <Tooltip />
                              <Area
                                type="monotone"
                                dataKey="score"
                                stroke="#10B981"
                                fill="#10B981"
                                fillOpacity={0.3}
                                name="Score (%)"
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>

                        {/* Subject Distribution Chart */}
                        <div>
                          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <PieChart className="w-5 h-5 mr-2 text-purple-600" />
                            Quiz Subject Distribution
                          </h4>
                          <ResponsiveContainer width="100%" height={250}>
                            <RechartsPieChart>
                              <Pie
                                data={categoryData}
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              >
                                {categoryData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </RechartsPieChart>
                          </ResponsiveContainer>
                        </div>

                        {/* Question Type Performance Bar Chart */}
                        <div>
                          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                            Performance by Question Type
                          </h4>
                          <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={questionTypePerformanceData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip formatter={(value: number, name: string) => [`${value.toFixed(1)}%`, name === 'percentage' ? 'Accuracy' : name]} />
                              <Legend />
                              <Bar dataKey="percentage" fill="#8884d8" name="Accuracy (%)" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>

                        {/* New: Answer Distribution Bar Chart */}
                        <div>
                          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                            <BarChart3 className="w-5 h-5 mr-2 text-orange-600" />
                            Answer Distribution
                          </h4>
                          <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={answerDistributionData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Bar dataKey="value" fill="#82ca9d">
                                {answerDistributionData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </CardBody>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        )}
      </CardBody>
    </Card>
  );
};

export default SoloQuizStats;