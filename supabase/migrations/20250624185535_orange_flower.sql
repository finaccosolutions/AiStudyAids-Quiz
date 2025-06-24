/*
  # Fix Competition Ranking System

  1. Updates
    - Fix the save_competition_result function to properly calculate ranks
    - Add proper ranking logic based on score (descending) and time (ascending for tie-breaking)
    - Ensure all participants get correct ranks in ascending order (1, 2, 3, etc.)

  2. Data Fixes
    - Update existing competition results with correct rankings
*/

-- Drop and recreate the save_competition_result function with proper ranking logic
DROP FUNCTION IF EXISTS save_competition_result();

CREATE OR REPLACE FUNCTION save_competition_result()
RETURNS TRIGGER AS $$
DECLARE
  competition_record RECORD;
  participant_rank INTEGER;
  total_participants INTEGER;
BEGIN
  -- Only process if status changed to completed
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    
    -- Get competition details
    SELECT * INTO competition_record
    FROM competitions
    WHERE id = NEW.competition_id;
    
    -- First, update all completed participants' ranks using a proper ranking system
    WITH ranked_participants AS (
      SELECT 
        id,
        user_id,
        RANK() OVER (
          ORDER BY 
            COALESCE(score, 0) DESC, 
            COALESCE(time_taken, 999999) ASC,
            COALESCE(completed_at, NOW()) ASC
        ) as calculated_rank
      FROM competition_participants
      WHERE competition_id = NEW.competition_id 
        AND status = 'completed'
    )
    UPDATE competition_participants cp
    SET 
      rank = rp.calculated_rank,
      final_rank = rp.calculated_rank
    FROM ranked_participants rp
    WHERE cp.id = rp.id;
    
    -- Get the rank for the current participant
    SELECT rank INTO participant_rank
    FROM competition_participants
    WHERE id = NEW.id;
    
    -- Get total completed participants
    SELECT COUNT(*) INTO total_participants
    FROM competition_participants
    WHERE competition_id = NEW.competition_id 
      AND status = 'completed';
    
    -- Calculate additional metrics
    DECLARE
      total_questions INTEGER := COALESCE(array_length(competition_record.questions, 1), 0);
      incorrect_answers INTEGER := GREATEST(0, COALESCE(NEW.questions_answered, 0) - COALESCE(NEW.correct_answers, 0));
      skipped_answers INTEGER := GREATEST(0, total_questions - COALESCE(NEW.questions_answered, 0));
      percentage_score NUMERIC := CASE 
        WHEN total_questions > 0 THEN (COALESCE(NEW.score, 0) / total_questions) * 100
        ELSE 0
      END;
      accuracy_rate NUMERIC := CASE 
        WHEN (COALESCE(NEW.correct_answers, 0) + incorrect_answers) > 0 
        THEN (COALESCE(NEW.correct_answers, 0)::NUMERIC / (COALESCE(NEW.correct_answers, 0) + incorrect_answers)) * 100
        ELSE 0
      END;
      rank_percentile NUMERIC := CASE 
        WHEN total_participants > 1 
        THEN ((total_participants - participant_rank)::NUMERIC / (total_participants - 1)) * 100
        ELSE 100
      END;
      avg_time_per_question NUMERIC := CASE 
        WHEN total_questions > 0 
        THEN COALESCE(NEW.time_taken, 0)::NUMERIC / total_questions
        ELSE 0
      END;
    BEGIN
      -- Create or update competition result with correct ranking
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
        percentage_score,
        accuracy_rate,
        rank_percentile,
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
        incorrect_answers,
        skipped_answers,
        total_questions,
        COALESCE(NEW.time_taken, 0),
        avg_time_per_question,
        COALESCE(NEW.points_earned, 0),
        percentage_score,
        accuracy_rate,
        rank_percentile,
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
        percentage_score = EXCLUDED.percentage_score,
        accuracy_rate = EXCLUDED.accuracy_rate,
        rank_percentile = EXCLUDED.rank_percentile,
        answers = EXCLUDED.answers,
        completed_at = EXCLUDED.completed_at;
    END;
      
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
DROP TRIGGER IF EXISTS save_competition_result_trigger ON competition_participants;
CREATE TRIGGER save_competition_result_trigger
  AFTER UPDATE ON competition_participants
  FOR EACH ROW
  EXECUTE FUNCTION save_competition_result();

-- Fix existing data: Update all competition participants with correct rankings
DO $$
DECLARE
  comp_id UUID;
BEGIN
  -- Loop through all competitions
  FOR comp_id IN 
    SELECT DISTINCT competition_id 
    FROM competition_participants 
    WHERE status = 'completed'
  LOOP
    -- Update rankings for this competition
    WITH ranked_participants AS (
      SELECT 
        id,
        user_id,
        RANK() OVER (
          ORDER BY 
            COALESCE(score, 0) DESC, 
            COALESCE(time_taken, 999999) ASC,
            COALESCE(completed_at, NOW()) ASC
        ) as calculated_rank
      FROM competition_participants
      WHERE competition_id = comp_id
        AND status = 'completed'
    )
    UPDATE competition_participants cp
    SET 
      rank = rp.calculated_rank,
      final_rank = rp.calculated_rank
    FROM ranked_participants rp
    WHERE cp.id = rp.id
      AND cp.competition_id = comp_id;
      
    -- Update competition_results table with correct rankings
    WITH ranked_results AS (
      SELECT 
        cr.competition_id,
        cr.user_id,
        cp.rank as correct_rank,
        COUNT(*) OVER (PARTITION BY cr.competition_id) as total_count
      FROM competition_results cr
      JOIN competition_participants cp ON cr.competition_id = cp.competition_id AND cr.user_id = cp.user_id
      WHERE cr.competition_id = comp_id
        AND cp.status = 'completed'
    )
    UPDATE competition_results cr
    SET 
      final_rank = rr.correct_rank,
      total_participants = rr.total_count,
      rank_percentile = CASE 
        WHEN rr.total_count > 1 
        THEN ((rr.total_count - rr.correct_rank)::NUMERIC / (rr.total_count - 1)) * 100
        ELSE 100
      END
    FROM ranked_results rr
    WHERE cr.competition_id = rr.competition_id 
      AND cr.user_id = rr.user_id;
  END LOOP;
END $$;