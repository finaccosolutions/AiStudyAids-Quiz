/*
  # Add progress tracking columns to competition participants

  1. New Columns
    - `current_question` (integer) - tracks which question the participant is currently on
    - `questions_answered` (integer) - tracks how many questions the participant has answered
  
  2. Updates
    - Add default values for existing records
    - Ensure columns are nullable to handle edge cases
  
  3. Notes
    - These columns enable real-time progress tracking during competitions
    - Helps display participant progress in lobby and during quiz
*/

-- Add current_question column to track participant progress
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'competition_participants' AND column_name = 'current_question'
  ) THEN
    ALTER TABLE competition_participants ADD COLUMN current_question integer DEFAULT 0;
  END IF;
END $$;

-- Add questions_answered column to track completion progress
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'competition_participants' AND column_name = 'questions_answered'
  ) THEN
    ALTER TABLE competition_participants ADD COLUMN questions_answered integer DEFAULT 0;
  END IF;
END $$;

-- Update existing records to have default values
UPDATE competition_participants 
SET 
  current_question = 0,
  questions_answered = 0
WHERE 
  current_question IS NULL 
  OR questions_answered IS NULL;