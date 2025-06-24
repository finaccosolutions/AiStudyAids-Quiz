/*
  # Fix JSONB constraint error in competition_participants table

  1. Problem
    - The `answers_must_be_object` constraint is using array_length() on a JSONB column
    - This causes "function array_length(jsonb, integer) does not exist" error
    - The answers column stores a JSON object, not an array

  2. Solution
    - Drop the problematic constraint that uses array_length()
    - Add a proper constraint that checks if answers is a valid JSON object
    - Ensure the constraint works with JSONB type correctly
*/

-- Drop the existing problematic constraint
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'answers_must_be_object' 
    AND table_name = 'competition_participants'
  ) THEN
    ALTER TABLE competition_participants DROP CONSTRAINT answers_must_be_object;
  END IF;
END $$;

-- Add a proper constraint for JSONB object validation
ALTER TABLE competition_participants 
ADD CONSTRAINT answers_must_be_object 
CHECK (jsonb_typeof(answers) = 'object');

-- Ensure the answers column has a proper default value
ALTER TABLE competition_participants 
ALTER COLUMN answers SET DEFAULT '{}'::jsonb;