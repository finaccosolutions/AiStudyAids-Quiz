/*
  # Fix array_length JSONB error

  1. Problem
    - `array_length(jsonb, integer)` function doesn't exist in PostgreSQL
    - The `answers` column in `competition_participants` is JSONB object, not array
    - Various triggers and functions are trying to use array_length on JSONB

  2. Solution
    - Replace `array_length(answers, 1)` with `(SELECT COUNT(*) FROM jsonb_object_keys(answers))`
    - Update all triggers, functions, and constraints that use array_length on JSONB
    - Ensure proper null handling with COALESCE

  3. Changes
    - Drop and recreate trigger function `update_questions_answered`
    - Update any constraints or computed columns using array_length on JSONB
    - Test the fix by ensuring competition completion works
*/

-- First, let's check if there are any existing functions that use array_length on JSONB
-- and drop/recreate them

-- Drop the existing trigger function that likely contains the problematic array_length call
DROP FUNCTION IF EXISTS update_questions_answered() CASCADE;

-- Recreate the function with proper JSONB handling
CREATE OR REPLACE FUNCTION update_questions_answered()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate questions_answered from the answers JSONB object
  -- Use jsonb_object_keys to count the number of keys in the answers object
  NEW.questions_answered := (
    SELECT COUNT(*) FROM jsonb_object_keys(COALESCE(NEW.answers, '{}'::jsonb))
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
DROP TRIGGER IF EXISTS trigger_update_questions_answered ON competition_participants;
CREATE TRIGGER trigger_update_questions_answered
  BEFORE INSERT OR UPDATE OF answers ON competition_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_questions_answered();

-- Check if there are any other functions that might use array_length on JSONB
-- Let's also update the save_competition_result function if it exists

-- Drop and recreate save_competition_result function with proper JSONB handling
DROP FUNCTION IF EXISTS save_competition_result() CASCADE;

CREATE OR REPLACE FUNCTION save_competition_result()
RETURNS TRIGGER AS $$
DECLARE
  competition_record RECORD;
  total_questions INTEGER;
  questions_answered INTEGER;
  incorrect_answers INTEGER;
  skipped_answers INTEGER;
  percentage_score NUMERIC;
  accuracy_rate NUMERIC;
  rank_percentile NUMERIC;
  total_participants INTEGER;
BEGIN
  -- Only process when status changes to 'completed'
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    
    -- Get competition details
    SELECT * INTO competition_record
    FROM competitions
    WHERE id = NEW.competition_id;
    
    IF NOT FOUND THEN
      RETURN NEW;
    END IF;
    
    -- Calculate metrics
    total_questions := COALESCE(jsonb_array_length(COALESCE(competition_record.questions, '[]'::jsonb)), 0);
    
    -- Use jsonb_object_keys to count answers instead of array_length
    questions_answered := (
      SELECT COUNT(*) FROM jsonb_object_keys(COALESCE(NEW.answers, '{}'::jsonb))
    );
    
    incorrect_answers := GREATEST(0, questions_answered - COALESCE(NEW.correct_answers, 0));
    skipped_answers := GREATEST(0, total_questions - questions_answered);
    
    percentage_score := CASE 
      WHEN total_questions > 0 THEN (COALESCE(NEW.score, 0) / total_questions) * 100
      ELSE 0
    END;
    
    accuracy_rate := CASE 
      WHEN questions_answered > 0 THEN (COALESCE(NEW.correct_answers, 0)::NUMERIC / questions_answered) * 100
      ELSE 0
    END;
    
    -- Get total participants for rank percentile calculation
    SELECT COUNT(*) INTO total_participants
    FROM competition_participants
    WHERE competition_id = NEW.competition_id
    AND status = 'completed';
    
    rank_percentile := CASE 
      WHEN total_participants > 1 THEN 
        ((total_participants - COALESCE(NEW.final_rank, NEW.rank, total_participants)) / (total_participants - 1)::NUMERIC) * 100
      ELSE 100
    END;
    
    -- Insert or update competition result
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
      COALESCE(NEW.final_rank, NEW.rank),
      total_participants,
      COALESCE(NEW.score, 0),
      COALESCE(NEW.correct_answers, 0),
      incorrect_answers,
      skipped_answers,
      total_questions,
      COALESCE(NEW.time_taken, 0),
      CASE WHEN total_questions > 0 THEN COALESCE(NEW.time_taken, 0)::NUMERIC / total_questions ELSE 0 END,
      COALESCE(NEW.points_earned, 0),
      percentage_score,
      accuracy_rate,
      rank_percentile,
      COALESCE(NEW.answers, '{}'::jsonb),
      COALESCE(competition_record.questions, '[]'::jsonb),
      COALESCE(competition_record.quiz_preferences, '{}'::jsonb),
      competition_record.created_at,
      NEW.joined_at,
      competition_record.start_time,
      NEW.completed_at
    )
    ON CONFLICT (competition_id, user_id) 
    DO UPDATE SET
      final_rank = EXCLUDED.final_rank,
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

-- Check for any constraints that might use array_length on JSONB
-- The answers_must_be_object constraint should be fine as it uses jsonb_typeof
-- But let's make sure there are no other problematic constraints

-- If there were any computed columns or other constraints using array_length on JSONB,
-- they would need to be dropped and recreated here. Based on the schema provided,
-- the main issue seems to be in the trigger functions.

-- Let's also ensure the questions_answered column is properly updated for existing records
-- This is a one-time fix for existing data
UPDATE competition_participants 
SET questions_answered = (
  SELECT COUNT(*) FROM jsonb_object_keys(COALESCE(answers, '{}'::jsonb))
)
WHERE answers IS NOT NULL;

-- Ensure questions_answered is 0 for records with null or empty answers
UPDATE competition_participants 
SET questions_answered = 0
WHERE answers IS NULL OR answers = '{}'::jsonb;