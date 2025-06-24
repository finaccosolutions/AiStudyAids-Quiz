import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { useAuthStore } from '../store/useAuthStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { 
  Trophy, Target, Clock, BookOpen, Brain, 
  Calendar, TrendingUp, Award, CheckCircle2,
  BarChart as BarChartIcon, PieChart as PieChartIcon,
  ChevronDown, ChevronUp, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProgressStats {
  course: string;
  quiz_scores: {
    [key: string]: number[];
  };
  topics_covered: {
    [key: string]: {
      completed: string[];
      inProgress: string[];
    };
  };
  study_hours: number;
  last_updated: string;
}

const ProgressTrackerPage: React.FC = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState<ProgressStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    overview: true,
    performance: true,
    topics: true,
    achievements: true
  });

  const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'];

  useEffect(() => {
    const fetchProgressStats = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('progress_stats')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;
        setStats(data);
      } catch (error) {
        console.error('Error fetching progress stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgressStats();
  }, [user]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600 font-medium">Loading your progress...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12 bg-white rounded-2xl shadow-lg border border-gray-100"
        >
          <Brain className="w-16 h-16 text-purple-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Progress Data Available</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Start taking quizzes and studying to see your progress tracked here!
          </p>
          <Button className="gradient-bg">
            <Zap className="w-5 h-5 mr-2" />
            Start Your Learning Journey
          </Button>
        </motion.div>
      </div>
    );
  }

  // Calculate overall statistics
  const totalQuizzes = Object.values(stats.quiz_scores).reduce(
    (sum, scores) => sum + scores.length, 
    0
  );
  
  const averageScore = Object.values(stats.quiz_scores).reduce(
    (sum, scores) => sum + (scores.reduce((a, b) => a + b, 0) / scores.length),
    0
  ) / Object.keys(stats.quiz_scores).length;

  const totalTopics = Object.values(stats.topics_covered).reduce(
    (sum, topic) => sum + topic.completed.length + topic.inProgress.length,
    0
  );

  const completedTopics = Object.values(stats.topics_covered).reduce(
    (sum, topic) => sum + topic.completed.length,
    0
  );

  // Prepare chart data
  const performanceData = Object.entries(stats.quiz_scores).map(([topic, scores]) => ({
    topic,
    average: scores.reduce((a, b) => a + b, 0) / scores.length,
    highest: Math.max(...scores),
    lowest: Math.min(...scores),
  }));

  const topicProgressData = [
    { name: 'Completed', value: completedTopics },
    { name: 'In Progress', value: totalTopics - completedTopics },
  ];

  const studyTimeData = [
    { name: 'Mon', hours: 4 },
    { name: 'Tue', hours: 3 },
    { name: 'Wed', hours: 5 },
    { name: 'Thu', hours: 2 },
    { name: 'Fri', hours: 4 },
    { name: 'Sat', hours: 6 },
    { name: 'Sun', hours: 3 },
  ];

  const achievements = [
    {
      icon: Trophy,
      title: 'Perfect Score',
      description: 'Achieved 100% in a quiz',
      progress: 80,
      color: 'text-yellow-500',
    },
    {
      icon: Target,
      title: 'Topic Master',
      description: 'Completed all questions in a topic',
      progress: 60,
      color: 'text-blue-500',
    },
    {
      icon: Clock,
      title: 'Study Streak',
      description: '7 days consecutive study',
      progress: 100,
      color: 'text-green-500',
    },
    {
      icon: BookOpen,
      title: 'Knowledge Explorer',
      description: 'Studied 5 different topics',
      progress: 40,
      color: 'text-purple-500',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-purple-600" />
            Progress Tracker
          </h1>
          <p className="mt-2 text-gray-600">
            Track your learning journey and achievements
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-500">
            Last updated: {new Date(stats.last_updated).toLocaleDateString()}
          </span>
          <Button className="gradient-bg">
            <Calendar className="w-4 h-4 mr-2" />
            View Calendar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Overview Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 hover:shadow-lg transition-shadow duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-purple-100 p-3 rounded-xl">
                  <Brain className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-sm text-purple-600 font-medium px-3 py-1 bg-purple-100 rounded-full">
                  This Month
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-1">Quiz Performance</h3>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold text-purple-600">{averageScore.toFixed(1)}%</p>
                  <p className="text-sm text-gray-600">Average Score</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-semibold text-gray-700">{totalQuizzes}</p>
                  <p className="text-sm text-gray-600">Quizzes Taken</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 hover:shadow-lg transition-shadow duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-100 p-3 rounded-xl">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-sm text-blue-600 font-medium px-3 py-1 bg-blue-100 rounded-full">
                  Overall
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-1">Topics Progress</h3>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold text-blue-600">
                    {((completedTopics / totalTopics) * 100).toFixed(1)}%
                  </p>
                  <p className="text-sm text-gray-600">Completion Rate</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-semibold text-gray-700">{completedTopics}/{totalTopics}</p>
                  <p className="text-sm text-gray-600">Topics Completed</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-lg transition-shadow duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-green-100 p-3 rounded-xl">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-sm text-green-600 font-medium px-3 py-1 bg-green-100 rounded-full">
                  Total Time
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-1">Study Hours</h3>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold text-green-600">{stats.study_hours}</p>
                  <p className="text-sm text-gray-600">Hours Studied</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-semibold text-gray-700">4.5</p>
                  <p className="text-sm text-gray-600">Daily Average</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 hover:shadow-lg transition-shadow duration-300">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-amber-100 p-3 rounded-xl">
                  <Award className="w-6 h-6 text-amber-600" />
                </div>
                <span className="text-sm text-amber-600 font-medium px-3 py-1 bg-amber-100 rounded-full">
                  Achievements
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-1">Milestones</h3>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold text-amber-600">12</p>
                  <p className="text-sm text-gray-600">Achievements</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-semibold text-gray-700">3</p>
                  <p className="text-sm text-gray-600">This Week</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Study Time Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="h-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Weekly Study Pattern</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={studyTimeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="hours" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Performance Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <BarChartIcon className="w-6 h-6 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-800">Performance Trends</h3>
                </div>
                <Button variant="outline" size="sm">
                  Last 30 Days
                </Button>
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="topic" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="average"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="highest"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Topic Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <PieChartIcon className="w-6 h-6 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-800">Topic Progress</h3>
                </div>
              </div>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={topicProgressData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {topicProgressData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                {topicProgressData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm text-gray-600">{entry.name}</span>
                    </div>
                    <span className="text-sm font-medium">{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-3"
        >
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <Trophy className="w-6 h-6 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-800">Recent Achievements</h3>
                </div>
                <Button variant="outline" size="sm">View All</Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {achievements.map((achievement, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-all duration-300 group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-2 rounded-lg ${achievement.progress === 100 ? 'bg-green-100' : 'bg-gray-100'}`}>
                        <achievement.icon className={`w-6 h-6 ${achievement.color}`} />
                      </div>
                      {achievement.progress === 100 && (
                        <div className="bg-green-100 p-1 rounded-full">
                          <CheckCircle2 className="w-4 h-4 text-green-600" />
                        </div>
                      )}
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">{achievement.title}</h4>
                    <p className="text-sm text-gray-600 mb-3">{achievement.description}</p>
                    <div className="relative pt-1">
                      <div className="flex mb-2 items-center justify-between">
                        <div className="text-right">
                          <span className="text-xs font-semibold inline-block text-purple-600">
                            {achievement.progress}%
                          </span>
                        </div>
                      </div>
                      <div className="overflow-hidden h-2 text-xs flex rounded bg-purple-100">
                        <div
                          style={{ width: `${achievement.progress}%` }}
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-purple-600 transition-all duration-500 group-hover:bg-purple-500"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ProgressTrackerPage;