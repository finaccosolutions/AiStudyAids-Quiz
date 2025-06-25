/*
  # Fix array_length JSONB Error - Complete Solution

  1. Problem
    - PostgreSQL function `array_length(jsonb, integer)` does not exist
    - The `answers` column in `competition_participants` is JSONB object, not array
    - Various triggers and functions are trying to use array_length on JSONB

  2. Solution
    - Replace all `array_length(answers, 1)` with `(SELECT COUNT(*) FROM jsonb_object_keys(answers))`
    - Update all triggers, functions, and constraints that use array_length on JSONB
    - Ensure proper null handling with COALESCE
    - Test the fix by ensuring competition completion works

  3. Changes
    - Drop and recreate all problematic functions and triggers
    - Update constraints that use array_length on JSONB
    - Fix generated columns that use array_length
    - Update existing data to have correct values
*/

-- First, let's drop all existing triggers and functions that might contain the problematic array_length call
DROP TRIGGER IF EXISTS trigger_update_questions_answered ON competition_participants;
DROP TRIGGER IF EXISTS save_competition_result_trigger ON competition_participants;
DROP TRIGGER IF EXISTS trigger_update_competition_result_calculations ON competition_results;
DROP TRIGGER IF EXISTS trigger_update_quiz_result_calculations ON quiz_results;

DROP FUNCTION IF EXISTS update_questions_answered() CASCADE;
DROP FUNCTION IF EXISTS save_competition_result() CASCADE;
DROP FUNCTION IF EXISTS update_competition_result_calculations() CASCADE;
DROP FUNCTION IF EXISTS update_quiz_result_calculations() CASCADE;

-- Drop any constraints that might use array_length on JSONB
DO $$
BEGIN
  -- Drop the problematic constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'answers_must_be_object' 
    AND table_name = 'competition_participants'
  ) THEN
    ALTER TABLE competition_participants DROP CONSTRAINT answers_must_be_object;
  END IF;
END $$;

-- Check and fix any generated columns that use array_length on JSONB
DO $$
BEGIN
  -- Fix questions_answered if it's a generated column using array_length
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'competition_participants' 
    AND column_name = 'questions_answered'
    AND is_generated = 'ALWAYS'
  ) THEN
    ALTER TABLE competition_participants DROP COLUMN questions_answered;
    ALTER TABLE competition_participants ADD COLUMN questions_answered integer DEFAULT 0;
  END IF;
  
  -- Fix percentage_score if it's a generated column in competition_results
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'competition_results' 
    AND column_name = 'percentage_score'
    AND is_generated = 'ALWAYS'
  ) THEN
    ALTER TABLE competition_results DROP COLUMN percentage_score;
    ALTER TABLE competition_results ADD COLUMN percentage_score numeric DEFAULT 0;
  END IF;
  
  -- Fix accuracy_rate if it's a generated column in competition_results
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'competition_results' 
    AND column_name = 'accuracy_rate'
    AND is_generated = 'ALWAYS'
  ) THEN
    ALTER TABLE competition_results DROP COLUMN accuracy_rate;
    ALTER TABLE competition_results ADD COLUMN accuracy_rate numeric DEFAULT 0;
  END IF;
  
  -- Fix rank_percentile if it's a generated column in competition_results
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'competition_results' 
    AND column_name = 'rank_percentile'
    AND is_generated = 'ALWAYS'
  ) THEN
    ALTER TABLE competition_results DROP COLUMN rank_percentile;
    ALTER TABLE competition_results ADD COLUMN rank_percentile numeric DEFAULT 0;
  END IF;
  
  -- Fix accuracy_rate if it's a generated column in quiz_results
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'quiz_results' 
    AND column_name = 'accuracy_rate'
    AND is_generated = 'ALWAYS'
  ) THEN
    ALTER TABLE quiz_results DROP COLUMN accuracy_rate;
    ALTER TABLE quiz_results ADD COLUMN accuracy_rate numeric DEFAULT 0;
  END IF;
  
  -- Fix completion_rate if it's a generated column in quiz_results
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'quiz_results' 
    AND column_name = 'completion_rate'
    AND is_generated = 'ALWAYS'
  ) THEN
    ALTER TABLE quiz_results DROP COLUMN completion_rate;
    ALTER TABLE quiz_results ADD COLUMN completion_rate numeric DEFAULT 0;
  END IF;
END $$;

-- Add proper constraint for JSONB object validation (without array_length)
ALTER TABLE competition_participants 
ADD CONSTRAINT answers_must_be_object 
CHECK (jsonb_typeof(answers) = 'object');

-- Ensure the answers column has a proper default value
ALTER TABLE competition_participants 
ALTER COLUMN answers SET DEFAULT '{}'::jsonb;

-- Create the corrected update_questions_answered function
CREATE OR REPLACE FUNCTION update_questions_answered()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate questions_answered from JSONB object keys (NOT using array_length)
  NEW.questions_answered := (
    SELECT COUNT(*) FROM jsonb_object_keys(COALESCE(NEW.answers, '{}'::jsonb))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the corrected save_competition_result function
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
  participant_rank INTEGER;
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
    
    -- Calculate total questions from JSONB array (NOT using array_length on answers)
    total_questions := CASE 
      WHEN competition_record.questions IS NOT NULL AND jsonb_typeof(competition_record.questions) = 'array'
      THEN jsonb_array_length(competition_record.questions)
      ELSE 0
    END;
    
    -- Calculate questions_answered from JSONB object keys (NOT using array_length)
    questions_answered := (
      SELECT COUNT(*) FROM jsonb_object_keys(COALESCE(NEW.answers, '{}'::jsonb))
    );
    
    -- Update the questions_answered column
    NEW.questions_answered := questions_answered;
    
    -- Calculate other metrics
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
    
    -- Calculate rank for this participant
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
    
    -- Get the updated rank and total participants
    SELECT rank INTO participant_rank
    FROM competition_participants
    WHERE id = NEW.id;
    
    SELECT COUNT(*) INTO total_participants
    FROM competition_participants
    WHERE competition_id = NEW.competition_id
    AND status = 'completed';
    
    rank_percentile := CASE 
      WHEN total_participants > 1 THEN 
        ((total_participants - participant_rank) / (total_participants - 1)::NUMERIC) * 100
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
      participant_rank,
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

-- Create function to update calculated fields in competition_results
CREATE OR REPLACE FUNCTION update_competition_result_calculations()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate percentage_score
  NEW.percentage_score := CASE
    WHEN NEW.total_questions > 0 THEN (NEW.score / NEW.total_questions::numeric) * 100
    ELSE 0
  END;
  
  -- Calculate accuracy_rate
  NEW.accuracy_rate := CASE
    WHEN (NEW.correct_answers + NEW.incorrect_answers) > 0 THEN 
      (NEW.correct_answers::numeric / (NEW.correct_answers + NEW.incorrect_answers)::numeric) * 100
    ELSE 0
  END;
  
  -- Calculate rank_percentile
  NEW.rank_percentile := CASE
    WHEN NEW.total_participants > 1 THEN 
      ((NEW.total_participants - NEW.final_rank)::numeric / (NEW.total_participants - 1)::numeric) * 100
    ELSE 100
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to update calculated fields in quiz_results
CREATE OR REPLACE FUNCTION update_quiz_result_calculations()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate accuracy_rate
  NEW.accuracy_rate := CASE
    WHEN NEW.questions_attempted > 0 THEN 
      (NEW.questions_correct::numeric / NEW.questions_attempted::numeric) * 100
    ELSE 0
  END;
  
  -- Calculate completion_rate
  NEW.completion_rate := CASE
    WHEN NEW.total_questions > 0 THEN
      (NEW.questions_attempted::numeric / NEW.total_questions::numeric) * 100
    ELSE 0
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to update quiz_results updated_at timestamp
CREATE OR REPLACE FUNCTION update_quiz_results_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate all triggers with the corrected functions
CREATE TRIGGER trigger_update_questions_answered
  BEFORE INSERT OR UPDATE OF answers ON competition_participants
  FOR EACH ROW EXECUTE FUNCTION update_questions_answered();

CREATE TRIGGER save_competition_result_trigger
  AFTER UPDATE ON competition_participants
  FOR EACH ROW EXECUTE FUNCTION save_competition_result();

CREATE TRIGGER trigger_update_competition_result_calculations
  BEFORE INSERT OR UPDATE ON competition_results
  FOR EACH ROW EXECUTE FUNCTION update_competition_result_calculations();

CREATE TRIGGER trigger_update_quiz_result_calculations
  BEFORE INSERT OR UPDATE ON quiz_results
  FOR EACH ROW EXECUTE FUNCTION update_quiz_result_calculations();

CREATE TRIGGER quiz_results_updated_at
  BEFORE UPDATE ON quiz_results
  FOR EACH ROW EXECUTE FUNCTION update_quiz_results_updated_at();

-- Update existing records to have correct questions_answered values
UPDATE competition_participants 
SET questions_answered = (
  SELECT COUNT(*) FROM jsonb_object_keys(COALESCE(answers, '{}'::jsonb))
)
WHERE answers IS NOT NULL;

-- Ensure questions_answered is 0 for records with null or empty answers
UPDATE competition_participants 
SET questions_answered = 0
WHERE answers IS NULL OR answers = '{}'::jsonb;

-- Update existing competition_results records with correct calculated values
UPDATE competition_results 
SET 
  percentage_score = CASE
    WHEN total_questions > 0 THEN (score / total_questions::numeric) * 100
    ELSE 0
  END,
  accuracy_rate = CASE
    WHEN (correct_answers + incorrect_answers) > 0 THEN 
      (correct_answers::numeric / (correct_answers + incorrect_answers)::numeric) * 100
    ELSE 0
  END,
  rank_percentile = CASE
    WHEN total_participants > 1 THEN 
      ((total_participants - final_rank)::numeric / (total_participants - 1)::numeric) * 100
    ELSE 100
  END
WHERE percentage_score IS NULL OR accuracy_rate IS NULL OR rank_percentile IS NULL;

-- Update existing quiz_results records with correct calculated values
UPDATE quiz_results 
SET 
  accuracy_rate = CASE
    WHEN questions_attempted > 0 THEN 
      (questions_correct::numeric / questions_attempted::numeric) * 100
    ELSE 0
  END,
  completion_rate = CASE
    WHEN total_questions > 0 THEN
      (questions_attempted::numeric / total_questions::numeric) * 100
    ELSE 0
  END
WHERE accuracy_rate IS NULL OR completion_rate IS NULL;

-- Test the fix by ensuring no functions use array_length on JSONB
-- This query should return no results if the fix is successful
DO $$
DECLARE
  function_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO function_count
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
  AND pg_get_functiondef(p.oid) LIKE '%array_length%answers%';
  
  IF function_count > 0 THEN
    RAISE NOTICE 'WARNING: % functions still contain array_length(answers, 1)', function_count;
  ELSE
    RAISE NOTICE 'SUCCESS: No functions contain problematic array_length(answers, 1) calls';
  END IF;
END $$;