/*
  # Fix competition ranking and results

  1. Updates
    - Add final_rank column to competition_participants if not exists
    - Update save_competition_result function to properly calculate and save ranks
    - Add trigger to automatically calculate ranks when competition completes

  2. Security
    - Maintain existing RLS policies
*/

-- Add final_rank column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'competition_participants' AND column_name = 'final_rank'
  ) THEN
    ALTER TABLE competition_participants ADD COLUMN final_rank integer;
  END IF;
END $$;

-- Update the save_competition_result function to properly handle ranking
CREATE OR REPLACE FUNCTION save_competition_result()
RETURNS TRIGGER AS $$
DECLARE
  competition_record RECORD;
  participant_rank INTEGER;
  total_participants INTEGER;
BEGIN
  -- Only process if status changed to completed
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    
    -- Get competition details
    SELECT * INTO competition_record
    FROM competitions
    WHERE id = NEW.competition_id;
    
    -- Calculate rank based on score (desc) and time_taken (asc for tie-breaking)
    WITH ranked_participants AS (
      SELECT 
        user_id,
        ROW_NUMBER() OVER (
          ORDER BY 
            score DESC, 
            time_taken ASC,
            completed_at ASC
        ) as rank
      FROM competition_participants
      WHERE competition_id = NEW.competition_id 
        AND status = 'completed'
    )
    SELECT rank INTO participant_rank
    FROM ranked_participants
    WHERE user_id = NEW.user_id;
    
    -- Get total completed participants
    SELECT COUNT(*) INTO total_participants
    FROM competition_participants
    WHERE competition_id = NEW.competition_id 
      AND status = 'completed';
    
    -- Update the participant's rank
    UPDATE competition_participants
    SET 
      rank = participant_rank,
      final_rank = participant_rank
    WHERE id = NEW.id;
    
    -- Create or update competition result
    INSERT INTO competition_results (
      competition_id,
      user_id,
      competition_title,
      competition_type,
      competition_code,
      final_rank,
      total_participants,
      score,
      correct_answers,
      incorrect_answers,
      skipped_answers,
      total_questions,
      time_taken,
      average_time_per_question,
      points_earned,
      answers,
      question_details,
      quiz_preferences,
      competition_date,
      joined_at,
      started_at,
      completed_at
    ) VALUES (
      NEW.competition_id,
      NEW.user_id,
      competition_record.title,
      competition_record.type,
      competition_record.competition_code,
      participant_rank,
      total_participants,
      COALESCE(NEW.score, 0),
      COALESCE(NEW.correct_answers, 0),
      GREATEST(0, COALESCE(NEW.questions_answered, 0) - COALESCE(NEW.correct_answers, 0)),
      GREATEST(0, COALESCE(array_length(competition_record.questions, 1), 0) - COALESCE(NEW.questions_answered, 0)),
      COALESCE(array_length(competition_record.questions, 1), 0),
      COALESCE(NEW.time_taken, 0),
      CASE 
        WHEN COALESCE(array_length(competition_record.questions, 1), 0) > 0 
        THEN COALESCE(NEW.time_taken, 0)::numeric / array_length(competition_record.questions, 1)
        ELSE 0
      END,
      COALESCE(NEW.points_earned, 0),
      COALESCE(NEW.answers, '{}'::jsonb),
      COALESCE(competition_record.questions, '[]'::jsonb),
      COALESCE(competition_record.quiz_preferences, '{}'::jsonb),
      competition_record.created_at,
      NEW.joined_at,
      NEW.quiz_start_time,
      COALESCE(NEW.completed_at, NEW.quiz_end_time, NOW())
    )
    ON CONFLICT (competition_id, user_id) 
    DO UPDATE SET
      final_rank = participant_rank,
      total_participants = EXCLUDED.total_participants,
      score = EXCLUDED.score,
      correct_answers = EXCLUDED.correct_answers,
      incorrect_answers = EXCLUDED.incorrect_answers,
      skipped_answers = EXCLUDED.skipped_answers,
      time_taken = EXCLUDED.time_taken,
      average_time_per_question = EXCLUDED.average_time_per_question,
      points_earned = EXCLUDED.points_earned,
      answers = EXCLUDED.answers,
      completed_at = EXCLUDED.completed_at;
    
    -- Update all other participants' ranks to ensure consistency
    WITH ranked_participants AS (
      SELECT 
        id,
        user_id,
        ROW_NUMBER() OVER (
          ORDER BY 
            score DESC, 
            time_taken ASC,
            completed_at ASC
        ) as new_rank
      FROM competition_participants
      WHERE competition_id = NEW.competition_id 
        AND status = 'completed'
    )
    UPDATE competition_participants cp
    SET 
      rank = rp.new_rank,
      final_rank = rp.new_rank
    FROM ranked_participants rp
    WHERE cp.id = rp.id
      AND cp.competition_id = NEW.competition_id;
      
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Ensure the trigger exists
DROP TRIGGER IF EXISTS save_competition_result_trigger ON competition_participants;
CREATE TRIGGER save_competition_result_trigger
  AFTER UPDATE ON competition_participants
  FOR EACH ROW
  EXECUTE FUNCTION save_competition_result();