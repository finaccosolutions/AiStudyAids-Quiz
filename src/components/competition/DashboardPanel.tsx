// src/components/competition/DashboardPanel.tsx
import React from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useQuizStore } from '../../store/useQuizStore';
import { useCompetitionStore } from '../../store/useCompetitionStore';
import { Button } from '../ui/Button';
import { Card, CardBody, CardHeader } from '../ui/Card';
import { 
  Brain, Plus, Users, Zap, Activity, BookOpen, Play, Trophy, Hash
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

interface DashboardPanelProps {
  userId: string;
}

const DashboardPanel: React.FC<DashboardPanelProps> = ({ userId }) => {
  const navigate = useNavigate();
  const { preferences, soloQuizHistory } = useQuizStore();
  const { userActiveCompetitions } = useCompetitionStore();

  const quizLearningActions = [
    {
      id: 'solo',
      title: 'Solo Quiz',
      subtitle: 'Master your skills',
      description: 'Generate personalized quizzes with intelligent questions and get instant feedback',
      icon: Brain,
      path: '/quiz',
      action: () => navigate('/quiz', { state: { mode: 'solo-preferences' } }),
      color: 'from-violet-500 to-purple-500',
      stats: preferences ? `${preferences.questionCount} questions` : 'Not configured',
      features: ['Instant feedback', 'Progress tracking', 'Multiple formats'],
      badge: 'Most Popular',
      badgeColor: 'bg-violet-500'
    },
    {
      id: 'create-competition',
      title: 'Create Competition',
      subtitle: 'Challenge friends',
      description: 'Create custom competitions and invite friends to compete',
      icon: Plus,
      path: '/quiz',
      action: () => navigate('/quiz', { state: { mode: 'create-competition' } }),
      color: 'from-purple-500 to-pink-500',
      stats: 'Invite friends',
      features: ['Invite friends', 'Real-time leaderboard', 'Custom settings'],
      badge: 'Team Play',
      badgeColor: 'bg-purple-500'
    },
    {
      id: 'join-competition',
      title: 'Join Competition',
      subtitle: 'Enter with code',
      description: 'Join existing competitions using a 6-digit code',
      icon: Hash,
      path: '/quiz',
      action: () => navigate('/quiz', { state: { mode: 'join-competition' } }),
      color: 'from-green-500 to-emerald-500',
      stats: 'Quick join',
      features: ['Quick join', 'Global competition', 'Earn achievements'],
      badge: 'Quick Join',
      badgeColor: 'bg-green-500'
    },
    {
      id: 'random-match',
      title: 'Random Match',
      subtitle: 'Find opponents',
      description: 'Get matched with players globally based on your skill level',
      icon: Zap,
      path: '/quiz',
      action: () => navigate('/quiz', { state: { mode: 'random-match' } }),
      color: 'from-orange-500 to-red-500',
      stats: 'Global players',
      features: ['Global matchmaking', 'Skill-based pairing', 'Quick games'],
      badge: 'Global Play',
      badgeColor: 'bg-orange-500'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Quiz Learnings Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="shadow-xl border-2 border-blue-100 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-800">Quiz Learnings</h3>
                <p className="text-slate-600">Explore solo study tools and competitive quiz modes</p>
              </div>
            </div>
          </CardHeader>
          <CardBody className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {quizLearningActions.map((action, index) => (
                <motion.div
                  key={action.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card className="h-full overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
                        onClick={action.action}>
                    <CardBody className="p-6 relative">
                      <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />
                      <div className="relative z-10">
                        <div className="flex items-start justify-between mb-4">
                          <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                            <action.icon className="w-6 h-6 text-white" />
                          </div>
                          <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                            {action.stats}
                          </span>
                        </div>
                        <h4 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-purple-600 transition-colors duration-300">
                          {action.title}
                        </h4>
                        <p className="text-slate-600 text-sm leading-relaxed">{action.description}</p>
                      </div>
                    </CardBody>
                  </Card>
                </motion.div>
              ))}
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="shadow-xl border-2 border-gray-100">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50">
            <h3 className="text-2xl font-bold text-slate-800 flex items-center">
              <Activity className="w-7 h-7 mr-3 text-slate-600" />
              Recent Activity
            </h3>
          </CardHeader>
          <CardBody className="p-6">
            <div className="space-y-4">
              {userActiveCompetitions.length > 0 && (
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-2 flex items-center">
                    <Play className="w-5 h-5 mr-2" />
                    Your Active Competitions
                  </h4>
                  {userActiveCompetitions.map((comp, idx) => (
                    <div key={comp.id} className="flex items-center justify-between py-2 border-b border-blue-100 last:border-b-0">
                      <div>
                        <p className="font-medium text-blue-700">{comp.title}</p>
                        <p className="text-sm text-blue-600">Status: {comp.status}</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => navigate('/quiz', { state: { mode: 'competition-lobby', competitionId: comp.id } })}
                        className="bg-blue-500 hover:bg-blue-600"
                      >
                        Continue
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {soloQuizHistory.length > 0 && (
                <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
                  <h4 className="font-semibold text-purple-800 mb-2 flex items-center">
                    <BookOpen className="w-5 h-5 mr-2" />
                    Your Latest Solo Quiz
                  </h4>
                  <div className="flex items-center justify-between py-2">
                    <div>
                      <p className="font-medium text-purple-700">{soloQuizHistory[0].course} - {soloQuizHistory[0].topic}</p>
                      <p className="text-sm text-purple-600">Score: {soloQuizHistory[0].percentage?.toFixed(1)}%</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => navigate('/competitions', { state: { activeTab: 'my-history' } })}
                      className="bg-purple-500 hover:bg-purple-600"
                    >
                      View History
                    </Button>
                  </div>
                </div>
              )}

              {/* Placeholder for other activities if no real data */}
              {userActiveCompetitions.length === 0 && soloQuizHistory.length === 0 && (
                <div className="text-center text-gray-500 py-4">
                  <p>No recent activity. Start a quiz or competition!</p>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
};

export default DashboardPanel;