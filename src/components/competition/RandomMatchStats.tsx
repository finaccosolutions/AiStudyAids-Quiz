// src/components/competition/RandomMatchStats.tsx
import React, { useEffect, useState } from 'react';
import { useCompetitionStore } from '../../store/useCompetitionStore';
import { Card, CardBody, CardHeader } from '../ui/Card';
import { Trophy, Target, Clock, TrendingUp, Star, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

interface RandomMatchStatsProps {
  userId: string;
}

const RandomMatchStats: React.FC<RandomMatchStatsProps> = ({ userId }) => {
  const { competitionResultsHistory, loadCompetitionResultsHistory } = useCompetitionStore();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMatches: 0,
    wins: 0,
    losses: 0,
    averageRank: 0,
    averageScore: 0,
    totalTimePlayed: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      await loadCompetitionResultsHistory(userId);
      setIsLoading(false);
    };
    fetchStats();
  }, [userId, loadCompetitionResultsHistory]);

  useEffect(() => {
    // Add this check to ensure competitionResultsHistory is an array before filtering
    if (!Array.isArray(competitionResultsHistory)) {
      return;
    }

    const randomMatches = competitionResultsHistory.filter(
      (result: any) => result.competition_type === 'random'
    );

    if (randomMatches.length > 0) {
      const totalMatches = randomMatches.length;
      const wins = randomMatches.filter((match: any) => match.final_rank === 1).length;
      const losses = randomMatches.filter((match: any) => match.final_rank !== 1).length; // Simplified for now
      const totalRank = randomMatches.reduce((sum, match) => sum + (match.final_rank || 0), 0);
      const averageRank = totalRank / totalMatches;
      const totalScore = randomMatches.reduce((sum, match) => sum + (match.score || 0), 0);
      const averageScore = totalScore / totalMatches;
      const totalTimePlayed = randomMatches.reduce((sum, match) => sum + (match.time_taken || 0), 0);

      setStats({
        totalMatches,
        wins,
        losses,
        averageRank: parseFloat(averageRank.toFixed(1)),
        averageScore: parseFloat(averageScore.toFixed(1)),
        totalTimePlayed,
      });
    } else {
      setStats({
        totalMatches: 0,
        wins: 0,
        losses: 0,
        averageRank: 0,
        averageScore: 0,
        totalTimePlayed: 0,
      });
    }
  }, [competitionResultsHistory]);

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
    <Card className="shadow-xl border-2 border-orange-100">
      <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50">
        <h3 className="text-2xl font-bold text-slate-800 flex items-center">
          <Zap className="w-7 h-7 mr-3 text-orange-600" />
          Your Random Match Stats
        </h3>
      </CardHeader>
      <CardBody className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              label: 'Total Matches',
              value: stats.totalMatches,
              icon: Trophy,
              color: 'from-orange-500 to-red-500',
            },
            {
              label: 'Wins',
              value: stats.wins,
              icon: Star,
              color: 'from-yellow-500 to-orange-500',
            },
            {
              label: 'Losses',
              value: stats.losses,
              icon: Target,
              color: 'from-gray-500 to-slate-500',
            },
            {
              label: 'Average Rank',
              value: `#${stats.averageRank}`,
              icon: TrendingUp,
              color: 'from-blue-500 to-cyan-500',
            },
            {
              label: 'Average Score',
              value: `${stats.averageScore}%`,
              icon: Zap,
              color: 'from-green-500 to-emerald-500',
            },
            {
              label: 'Total Time Played',
              value: formatTime(stats.totalTimePlayed),
              icon: Clock,
              color: 'from-purple-500 to-pink-500',
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

export default RandomMatchStats;
