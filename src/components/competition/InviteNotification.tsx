import React, { useEffect } from 'react';
import { Button } from '../ui/Button';
import { Trophy, Users, Clock, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCompetitionStore } from '../../store/useCompetitionStore';
import { useAuthStore } from '../../store/useAuthStore';

const InviteNotification: React.FC = () => {
  const { user } = useAuthStore();
  const { 
    pendingInvites, 
    loadPendingInvites, 
    respondToInvite,
    subscribeToInvites 
  } = useCompetitionStore();

  useEffect(() => {
    if (user) {
      loadPendingInvites(user.id);
      const unsubscribe = subscribeToInvites(user.id);
      return unsubscribe;
    }
  }, [user]);

  const handleAccept = async (competitionId: string) => {
    try {
      await respondToInvite(competitionId, true);
    } catch (error) {
      console.error('Error accepting invite:', error);
    }
  };

  const handleDecline = async (competitionId: string) => {
    try {
      await respondToInvite(competitionId, false);
    } catch (error) {
      console.error('Error declining invite:', error);
    }
  };

  if (pendingInvites.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-50 space-y-4">
      <AnimatePresence>
        {pendingInvites.map((invite) => (
          <motion.div
            key={invite.competition_id}
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="bg-white rounded-2xl shadow-2xl border border-purple-200 p-6 max-w-sm"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Trophy className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Competition Invite</h3>
                  <p className="text-sm text-gray-600">From {invite.creator_name}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDecline(invite.competition_id)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">{invite.title}</h4>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {invite.participant_count}/{invite.max_participants}
                </span>
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  Code: {invite.competition_code}
                </span>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDecline(invite.competition_id)}
                className="flex-1"
              >
                Decline
              </Button>
              <Button
                size="sm"
                onClick={() => handleAccept(invite.competition_id)}
                className="flex-1 gradient-bg"
              >
                Join
              </Button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default InviteNotification;