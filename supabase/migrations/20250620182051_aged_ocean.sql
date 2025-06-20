/*
  # Add foreign key relationship between competition_chat and profiles

  1. Changes
    - Add foreign key constraint from competition_chat.user_id to profiles.user_id
    - This enables direct querying of profile information from competition chat

  2. Security
    - No changes to existing RLS policies
    - Maintains existing security model
*/

-- Add foreign key constraint to enable direct relationship between competition_chat and profiles
-- This allows Supabase to understand the relationship for PostgREST queries
ALTER TABLE competition_chat 
ADD CONSTRAINT competition_chat_user_id_profiles_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(user_id);

-- Create an index to improve query performance
CREATE INDEX IF NOT EXISTS competition_chat_user_id_profiles_idx 
ON competition_chat(user_id);