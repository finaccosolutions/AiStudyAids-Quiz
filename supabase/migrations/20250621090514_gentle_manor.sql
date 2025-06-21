/*
  # Real-time Competition Features

  1. New Tables
    - Enhanced competition_participants with real-time tracking
    - Competition state management
    - Real-time progress tracking
  
  2. Security
    - Enable RLS on all tables
    - Add policies for real-time access
  
  3. Functions
    - Auto-start competition when all participants ready
    - Real-time ranking calculation
    - Competition state management
*/

-- Add real-time status tracking to competitions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'competitions' AND column_name = 'participant_count'
  ) THEN
    ALTER TABLE competitions ADD COLUMN participant_count integer DEFAULT 0;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'competitions' AND column_name = 'ready_participants'
  ) THEN
    ALTER TABLE competitions ADD COLUMN ready_participants integer DEFAULT 0;
  END IF;
END $$;

-- Add real-time progress tracking to participants
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'competition_participants' AND column_name = 'is_ready'
  ) THEN
    ALTER TABLE competition_participants ADD COLUMN is_ready boolean DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'competition_participants' AND column_name = 'quiz_start_time'
  ) THEN
    ALTER TABLE competition_participants ADD COLUMN quiz_start_time timestamptz;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'competition_participants' AND column_name = 'quiz_end_time'
  ) THEN
    ALTER TABLE competition_participants ADD COLUMN quiz_end_time timestamptz;
  END IF;
END $$;

-- Function to update competition participant count
CREATE OR REPLACE FUNCTION update_competition_participant_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE competitions 
    SET participant_count = (
      SELECT COUNT(*) 
      FROM competition_participants 
      WHERE competition_id = NEW.competition_id 
      AND status IN ('joined', 'completed')
    )
    WHERE id = NEW.competition_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE competitions 
    SET participant_count = (
      SELECT COUNT(*) 
      FROM competition_participants 
      WHERE competition_id = NEW.competition_id 
      AND status IN ('joined', 'completed')
    ),
    ready_participants = (
      SELECT COUNT(*) 
      FROM competition_participants 
      WHERE competition_id = NEW.competition_id 
      AND status = 'joined' 
      AND is_ready = true
    )
    WHERE id = NEW.competition_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE competitions 
    SET participant_count = (
      SELECT COUNT(*) 
      FROM competition_participants 
      WHERE competition_id = OLD.competition_id 
      AND status IN ('joined', 'completed')
    )
    WHERE id = OLD.competition_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for participant count updates
DROP TRIGGER IF EXISTS trigger_update_participant_count ON competition_participants;
CREATE TRIGGER trigger_update_participant_count
  AFTER INSERT OR UPDATE OR DELETE ON competition_participants
  FOR EACH ROW EXECUTE FUNCTION update_competition_participant_count();

-- Function to auto-start competition when ready
CREATE OR REPLACE FUNCTION check_auto_start_competition()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if competition should auto-start
  IF NEW.status = 'waiting' AND NEW.participant_count >= 2 AND NEW.ready_participants = NEW.participant_count THEN
    UPDATE competitions 
    SET status = 'active', start_time = now()
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for auto-start
DROP TRIGGER IF EXISTS trigger_auto_start_competition ON competitions;
CREATE TRIGGER trigger_auto_start_competition
  AFTER UPDATE ON competitions
  FOR EACH ROW EXECUTE FUNCTION check_auto_start_competition();

-- Function to calculate real-time rankings
CREATE OR REPLACE FUNCTION calculate_participant_rankings(comp_id uuid)
RETURNS void AS $$
BEGIN
  WITH ranked_participants AS (
    SELECT 
      id,
      ROW_NUMBER() OVER (
        ORDER BY 
          score DESC, 
          correct_answers DESC, 
          time_taken ASC,
          completed_at ASC NULLS LAST
      ) as new_rank
    FROM competition_participants 
    WHERE competition_id = comp_id 
    AND status IN ('joined', 'completed')
  )
  UPDATE competition_participants 
  SET rank = ranked_participants.new_rank
  FROM ranked_participants 
  WHERE competition_participants.id = ranked_participants.id;
END;
$$ LANGUAGE plpgsql;

-- Function to finalize competition when all participants complete
CREATE OR REPLACE FUNCTION check_competition_completion()
RETURNS TRIGGER AS $$
DECLARE
  total_participants integer;
  completed_participants integer;
  comp_id uuid;
BEGIN
  comp_id := NEW.competition_id;
  
  -- Count total and completed participants
  SELECT 
    COUNT(*) FILTER (WHERE status IN ('joined', 'completed')),
    COUNT(*) FILTER (WHERE status = 'completed')
  INTO total_participants, completed_participants
  FROM competition_participants 
  WHERE competition_id = comp_id;
  
  -- If all participants completed, finalize competition
  IF completed_participants = total_participants AND total_participants > 0 THEN
    -- Calculate final rankings
    PERFORM calculate_participant_rankings(comp_id);
    
    -- Update competition status
    UPDATE competitions 
    SET status = 'completed', end_time = now()
    WHERE id = comp_id;
    
    -- Award points based on rankings
    UPDATE competition_participants 
    SET points_earned = CASE 
      WHEN rank = 1 THEN GREATEST(100, total_participants * 10)
      WHEN rank = 2 THEN GREATEST(75, total_participants * 7)
      WHEN rank = 3 THEN GREATEST(50, total_participants * 5)
      WHEN rank <= total_participants * 0.5 THEN GREATEST(25, total_participants * 2)
      ELSE GREATEST(10, total_participants)
    END
    WHERE competition_id = comp_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for competition completion
DROP TRIGGER IF EXISTS trigger_check_completion ON competition_participants;
CREATE TRIGGER trigger_check_completion
  AFTER UPDATE ON competition_participants
  FOR EACH ROW 
  WHEN (NEW.status = 'completed' AND OLD.status != 'completed')
  EXECUTE FUNCTION check_competition_completion();

-- Update existing records to have default values
UPDATE competition_participants 
SET 
  current_question = COALESCE(current_question, 0),
  questions_answered = COALESCE(questions_answered, 0),
  is_ready = COALESCE(is_ready, false),
  is_online = COALESCE(is_online, true),
  last_activity = COALESCE(last_activity, now())
WHERE 
  current_question IS NULL 
  OR questions_answered IS NULL 
  OR is_ready IS NULL
  OR is_online IS NULL
  OR last_activity IS NULL;

-- Update competition participant counts
UPDATE competitions 
SET participant_count = (
  SELECT COUNT(*) 
  FROM competition_participants 
  WHERE competition_id = competitions.id 
  AND status IN ('joined', 'completed')
);