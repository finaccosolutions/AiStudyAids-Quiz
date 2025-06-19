import React, { useState, useEffect } from 'react';
import { useCompetitionStore } from '../../store/useCompetitionStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../ui/Button';
import { Card, CardBody, CardHeader } from '../ui/Card';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { 
  Zap, Users, Search, MessageCircle, Clock, 
  Target, Brain, Globe, X, Send, Crown,
  Star, Trophy, Timer, Activity, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RandomMatchmakingProps {
  onMatchFound: (competitionId: string) => void;
  onCancel: () => void;
}

const RandomMatchmaking: React.FC<RandomMatchmakingProps> = ({
  onMatchFound,
  onCancel
}) => {
  const { user } = useAuthStore();
  const { 
    queueEntry, 
    joinRandomQueue, 
    leaveRandomQueue,
    chatMessages,
    loadChatMessages,
    sendChatMessage,
    subscribeToChat
  } = useCompetitionStore();

  const [preferences, setPreferences] = useState({
    topic: '',
    difficulty: 'medium' as 'easy' | 'medium' | 'hard',
    language: 'English'
  });
  const [isSearching, setIsSearching] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [matchedUsers, setMatchedUsers] = useState<any[]>([]);
  const [searchTime, setSearchTime] = useState(0);

  const difficultyOptions = [
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' }
  ];

  const languageOptions = [
    { value: 'English', label: 'English' },
    { value: 'Hindi', label: 'Hindi' },
    { value: 'Malayalam', label: 'Malayalam' },
    { value: 'Tamil', label: 'Tamil' },
    { value: 'Telugu', label: 'Telugu' }
  ];

  // Popular topics for quick selection
  const popularTopics = [
    'Computer Science',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'History',
    'Geography',
    'English Literature',
    'Economics',
    'Psychology'
  ];

  useEffect(() => {
    if (queueEntry?.status === 'matched') {
      // Simulate finding a match and creating competition
      setTimeout(() => {
        onMatchFound('random-competition-id');
      }, 2000);
    }
  }, [queueEntry, onMatchFound]);

  // Search timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSearching) {
      timer = setInterval(() => {
        setSearchTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isLet me fix all the issues and implement the comprehensive competition system:
  ]
  )
}

<boltArtifact id="fix-quiz-competition-system" title="Fix Quiz Competition System with All Features">