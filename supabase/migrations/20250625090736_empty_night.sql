/*
  # Fix Competition Database Errors

  1. Database Schema Fixes
    - Drop and recreate generated columns that use array_length on JSONB
    - Update triggers to use jsonb_object_keys instead of array_length
    - Fix any constraints that use array_length on JSONB

  2. Changes Made
    - Update questions_answered calculation in triggers
    - Fix generated column definitions
    - Ensure JSONB operations use correct functions
*/

-- First, let's check if there are any generated columns using array_length on JSONB
-- and recreate them with the correct JSONB functions

-- Drop and recreate the trigger function that updates questions_answered
DROP FUNCTION IF EXISTS update_questions_answered() CASCADE;

CREATE OR REPLACE FUNCTION update_questions_answered()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate questions_answered from JSONB object keys
  NEW.questions_answered := (
    SELECT COUNT(*) FROM jsonb_object_keys(COALESCE(NEW.answers, '{}'::jsonb))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER trigger_update_questions_answered
  BEFORE INSERT OR UPDATE OF answers ON competition_participants
  FOR EACH ROW EXECUTE FUNCTION update_questions_answered();

-- Update any existing records to have correct questions_answered values
UPDATE competition_participants 
SET questions_answered = (
  SELECT COUNT(*) FROM jsonb_object_keys(COALESCE(answers, '{}'::jsonb))
)
WHERE answers IS NOT NULL;

-- Check if percentage_score is a generated column in competition_results and fix it
DO $$
BEGIN
  -- Drop the generated column if it exists and recreate as a regular column with a trigger
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'competition_results' 
    AND column_name = 'percentage_score'
    AND is_generated = 'ALWAYS'
  ) THEN
    ALTER TABLE competition_results DROP COLUMN IF EXISTS percentage_score;
    ALTER TABLE competition_results ADD COLUMN percentage_score numeric DEFAULT 0;
  END IF;
END $$;

-- Check if accuracy_rate is a generated column in competition_results and fix it
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'competition_results' 
    AND column_name = 'accuracy_rate'
    AND is_generated = 'ALWAYS'
  ) THEN
    ALTER TABLE competition_results DROP COLUMN IF EXISTS accuracy_rate;
    ALTER TABLE competition_results ADD COLUMN accuracy_rate numeric DEFAULT 0;
  END IF;
END $$;

-- Check if rank_percentile is a generated column in competition_results and fix it
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'competition_results' 
    AND column_name = 'rank_percentile'
    AND is_generated = 'ALWAYS'
  ) THEN
    ALTER TABLE competition_results DROP COLUMN IF EXISTS rank_percentile;
    ALTER TABLE competition_results ADD COLUMN rank_percentile numeric DEFAULT 0;
  END IF;
END $$;

-- Create a function to update calculated fields in competition_results
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

-- Create trigger for competition_results calculations
DROP TRIGGER IF EXISTS trigger_update_competition_result_calculations ON competition_results;
CREATE TRIGGER trigger_update_competition_result_calculations
  BEFORE INSERT OR UPDATE ON competition_results
  FOR EACH ROW EXECUTE FUNCTION update_competition_result_calculations();

-- Similar fixes for quiz_results table if needed
DO $$
BEGIN
  -- Check if accuracy_rate is a generated column in quiz_results and fix it
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'quiz_results' 
    AND column_name = 'accuracy_rate'
    AND is_generated = 'ALWAYS'
  ) THEN
    ALTER TABLE quiz_results DROP COLUMN IF EXISTS accuracy_rate;
    ALTER TABLE quiz_results ADD COLUMN accuracy_rate numeric DEFAULT 0;
  END IF;
  
  -- Check if completion_rate is a generated column in quiz_results and fix it
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'quiz_results' 
    AND column_name = 'completion_rate'
    AND is_generated = 'ALWAYS'
  ) THEN
    ALTER TABLE quiz_results DROP COLUMN IF EXISTS completion_rate;
    ALTER TABLE quiz_results ADD COLUMN completion_rate numeric DEFAULT 0;
  END IF;
END $$;

-- Create a function to update calculated fields in quiz_results
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

-- Create trigger for quiz_results calculations
DROP TRIGGER IF EXISTS trigger_update_quiz_result_calculations ON quiz_results;
CREATE TRIGGER trigger_update_quiz_result_calculations
  BEFORE INSERT OR UPDATE ON quiz_results
  FOR EACH ROW EXECUTE FUNCTION update_quiz_result_calculations();

-- Update existing records to have correct calculated values
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
  END;

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
  END;