export interface Competition {
  id: string;
  creator_id: string;
  title: string;
  description?: string;
  competition_code: string;
  type: 'private' | 'random';
  status: 'waiting' | 'active' | 'completed' | 'cancelled';
  max_participants: number;
  quiz_preferences: any;
  questions?: any[];
  start_time?: string;
  end_time?: string;
  created_at: string;
  updated_at: string;
}

export interface CompetitionParticipant {
  id: string;
  competition_id: string;
  user_id?: string;
  email?: string;
  status: 'invited' | 'joined' | 'completed' | 'declined';
  score: number;
  correct_answers: number;
  time_taken: number;
  answers: Record<string, any>;
  rank?: number;
  points_earned: number;
  joined_at?: string;
  completed_at?: string;
  created_at: string;
  profile?: {
    full_name: string;
    avatar_url?: string;
  };
}

export interface UserStats {
  id: string;
  user_id: string;
  total_competitions: number;
  wins: number;
  losses: number;
  draws: number;
  total_points: number;
  average_score: number;
  best_rank?: number;
  total_time_played: number;
  created_at: string;
  updated_at: string;
}

export interface RandomQueueEntry {
  id: string;
  user_id: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  language: string;
  status: 'waiting' | 'matched' | 'cancelled';
  created_at: string;
}

export interface CompetitionChat {
  id: string;
  competition_id: string;
  user_id: string;
  message: string;
  created_at: string;
  profile?: {
    full_name: string;
    avatar_url?: string;
  };
}

export interface CompetitionInvite {
  competition_id: string;
  competition_code: string;
  title: string;
  creator_name: string;
  participant_count: number;
  max_participants: number;
}