/*
  # Update time_limit column type

  1. Changes
    - Modify `time_limit` column in `quiz_preferences` table to accept text values
    - Add check constraint to ensure valid values
    - Update existing values to handle the transition
  
  2. Security
    - Existing RLS policies remain unchanged
*/

DO $$ 
BEGIN
  -- First convert existing integer values to text
  UPDATE quiz_preferences 
  SET time_limit = time_limit::text 
  WHERE time_limit IS NOT NULL;

  -- Alter the column type to text
  ALTER TABLE quiz_preferences 
  ALTER COLUMN time_limit TYPE text USING time_limit::text;

  -- Add check constraint to ensure valid values
  ALTER TABLE quiz_preferences 
  ADD CONSTRAINT time_limit_check 
  CHECK (
    time_limit IS NULL OR 
    time_limit = 'none' OR 
    time_limit ~ '^[0-9]+$'
  );
END $$;