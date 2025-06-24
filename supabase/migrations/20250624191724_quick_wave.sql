/*
  # Fix PostgreSQL array_length function error for jsonb columns

  1. Database Changes
    - Create helper function to safely count jsonb object keys
    - Fix any problematic computed columns using array_length on jsonb
    - Add trigger to automatically update questions_answered column
    - Update existing records with correct values

  2. Security
    - Maintain existing RLS policies
    - Ensure proper constraints on jsonb columns
*/

-- First, let's create a helper function to safely count jsonb object keys
CREATE OR REPLACE FUNCTION count_jsonb_keys(jsonb_obj jsonb)
RETURNS integer
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE 
    WHEN jsonb_typeof(jsonb_obj) = 'object' THEN 
      array_length(ARRAY(SELECT jsonb_object_keys(jsonb_obj)), 1)
    ELSE 0
  END;
$$;

-- Check if there are any computed columns that need fixing
-- We'll drop and recreate the questions_answered column if it has a problematic computed expression
DO $$
BEGIN
  -- Check if questions_answered has a problematic default expression
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'competition_participants' 
    AND column_name = 'questions_answered'
    AND column_default LIKE '%array_length%answers%'
  ) THEN
    -- Drop the problematic default
    ALTER TABLE competition_participants ALTER COLUMN questions_answered DROP DEFAULT;
    
    -- Set a safe default
    ALTER TABLE competition_participants ALTER COLUMN questions_answered SET DEFAULT 0;
    
    -- Update existing records to have correct values
    UPDATE competition_participants 
    SET questions_answered = count_jsonb_keys(answers)
    WHERE answers IS NOT NULL;
  END IF;
END $$;

-- Ensure the answers column has proper constraints
DO $$
BEGIN
  -- Check if the answers_must_be_object constraint exists using the correct table reference
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints tc
    JOIN information_schema.constraint_column_usage ccu 
      ON tc.constraint_name = ccu.constraint_name
    WHERE tc.constraint_name = 'answers_must_be_object'
    AND tc.table_name = 'competition_participants'
    AND tc.constraint_type = 'CHECK'
  ) THEN
    -- Add the constraint if it doesn't exist
    ALTER TABLE competition_participants 
    ADD CONSTRAINT answers_must_be_object 
    CHECK (jsonb_typeof(answers) = 'object');
  END IF;
END $$;

-- Create a trigger function to automatically update questions_answered when answers change
CREATE OR REPLACE FUNCTION update_questions_answered()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.questions_answered = count_jsonb_keys(NEW.answers);
  RETURN NEW;
END;
$$;

-- Create trigger to automatically update questions_answered
DROP TRIGGER IF EXISTS trigger_update_questions_answered ON competition_participants;
CREATE TRIGGER trigger_update_questions_answered
  BEFORE INSERT OR UPDATE OF answers ON competition_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_questions_answered();

-- Update any existing records that might have incorrect questions_answered values
UPDATE competition_participants 
SET questions_answered = count_jsonb_keys(answers)
WHERE answers IS NOT NULL;

-- Also update any records where answers is null but questions_answered is not 0
UPDATE competition_participants 
SET questions_answered = 0
WHERE answers IS NULL AND questions_answered != 0;