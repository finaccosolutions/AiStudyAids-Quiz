/*
  # Add participant activity tracking columns

  1. New Columns
    - `is_online` (boolean) - Track if participant is currently online
    - `last_activity` (timestamptz) - Track last activity timestamp

  2. Changes
    - Add is_online column with default true to competition_participants table
    - Add last_activity column with default now() to competition_participants table
    - These columns will help track participant presence and activity in competitions
*/

-- Add is_online column to track participant online status
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'competition_participants' AND column_name = 'is_online'
  ) THEN
    ALTER TABLE competition_participants ADD COLUMN is_online BOOLEAN DEFAULT TRUE;
  END IF;
END $$;

-- Add last_activity column to track participant activity
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'competition_participants' AND column_name = 'last_activity'
  ) THEN
    ALTER TABLE competition_participants ADD COLUMN last_activity TIMESTAMPTZ DEFAULT NOW();
  END IF;
END $$;

-- Update existing records to have default values
UPDATE competition_participants 
SET is_online = TRUE, last_activity = NOW() 
WHERE is_online IS NULL OR last_activity IS NULL;