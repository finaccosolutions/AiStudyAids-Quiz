/*
  # Fix Competition Database Relationships

  1. Database Changes
    - Add missing foreign key constraint between competition_participants and profiles
    - Ensure proper relationships for competition functionality
    
  2. Security
    - Maintain existing RLS policies
    - Ensure proper access control for competition data
*/

-- Add foreign key constraint between competition_participants and profiles
-- This allows joining participant data with user profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'competition_participants_user_id_profiles_fkey'
    AND table_name = 'competition_participants'
  ) THEN
    ALTER TABLE competition_participants 
    ADD CONSTRAINT competition_participants_user_id_profiles_fkey 
    FOREIGN KEY (user_id) REFERENCES profiles(user_id);
  END IF;
END $$;

-- Ensure we have proper indexes for performance
CREATE INDEX IF NOT EXISTS competition_participants_user_id_profiles_idx 
ON competition_participants(user_id);

-- Add index on competition_code for faster lookups
CREATE INDEX IF NOT EXISTS competitions_code_lookup_idx 
ON competitions(competition_code) WHERE status = 'waiting';

-- Ensure competition_chat has proper foreign key to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'competition_chat_user_id_profiles_fkey'
    AND table_name = 'competition_chat'
  ) THEN
    ALTER TABLE competition_chat 
    ADD CONSTRAINT competition_chat_user_id_profiles_fkey 
    FOREIGN KEY (user_id) REFERENCES profiles(user_id);
  END IF;
END $$;