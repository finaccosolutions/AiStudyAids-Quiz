/*
  # Fix Competition Policies and User Display Issues

  1. Database Changes
    - Fix RLS policies to allow proper user data access
    - Add function to check competition participation
    - Ensure proper foreign key relationships

  2. Security
    - Maintain security while allowing necessary data access
    - Fix policies for competition participants and chat
*/

-- Drop existing functions first to avoid parameter name conflicts
DROP FUNCTION IF EXISTS can_participate_in_competition(uuid, uuid);
DROP FUNCTION IF EXISTS is_competition_creator(uuid, uuid);
DROP FUNCTION IF EXISTS is_email_verified(uuid);

-- Create helper function to check if user can participate in competition
CREATE OR REPLACE FUNCTION can_participate_in_competition(competition_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM competitions c
    WHERE c.id = competition_id
    AND (
      c.creator_id = user_id
      OR EXISTS (
        SELECT 1 FROM competition_participants cp
        WHERE cp.competition_id = competition_id
        AND cp.user_id = user_id
        AND cp.status IN ('joined', 'completed', 'invited')
      )
    )
  );
$$;

-- Create helper function to check if user is competition creator
CREATE OR REPLACE FUNCTION is_competition_creator(competition_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM competitions c
    WHERE c.id = competition_id
    AND c.creator_id = user_id
  );
$$;

-- Create helper function to check if email is verified
CREATE OR REPLACE FUNCTION is_email_verified(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (auth.jwt() ->> 'email_confirmed_at') IS NOT NULL,
    true
  );
$$;

-- Drop existing problematic policies
DROP POLICY IF EXISTS "users_manage_own_participation" ON competition_participants;
DROP POLICY IF EXISTS "creators_manage_participants" ON competition_participants;
DROP POLICY IF EXISTS "invite_by_email" ON competition_participants;

-- Create new comprehensive policies for competition_participants
CREATE POLICY "users_manage_own_participation"
  ON competition_participants
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "creators_manage_participants"
  ON competition_participants
  FOR ALL
  TO authenticated
  USING (is_competition_creator(competition_id, auth.uid()))
  WITH CHECK (is_competition_creator(competition_id, auth.uid()));

CREATE POLICY "invite_by_email"
  ON competition_participants
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id IS NULL 
    AND email IS NOT NULL 
    AND is_competition_creator(competition_id, auth.uid())
  );

-- Fix competition chat policies
DROP POLICY IF EXISTS "Users can send messages in their competitions" ON competition_chat;
DROP POLICY IF EXISTS "Users can view chat in their competitions" ON competition_chat;

CREATE POLICY "Users can send messages in their competitions"
  ON competition_chat
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid()
    AND (
      is_competition_creator(competition_id, auth.uid())
      OR EXISTS (
        SELECT 1 FROM competition_participants cp
        WHERE cp.competition_id = competition_chat.competition_id
        AND cp.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can view chat in their competitions"
  ON competition_chat
  FOR SELECT
  TO authenticated
  USING (
    is_competition_creator(competition_id, auth.uid())
    OR EXISTS (
      SELECT 1 FROM competition_participants cp
      WHERE cp.competition_id = competition_chat.competition_id
      AND cp.user_id = auth.uid()
    )
  );

-- Ensure profiles table has proper policies for competition access
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON profiles;
DROP POLICY IF EXISTS "Enable insert for users based on user_id" ON profiles;

-- Create comprehensive profile policies
CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() AND is_email_verified(auth.uid()));

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() AND is_email_verified(auth.uid()))
  WITH CHECK (user_id = auth.uid() AND is_email_verified(auth.uid()));

CREATE POLICY "Users can delete their own profile"
  ON profiles
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid() AND is_email_verified(auth.uid()));

CREATE POLICY "Enable insert for users based on user_id"
  ON profiles
  FOR INSERT
  TO public
  WITH CHECK (auth.uid() = user_id);

-- Add policy to allow viewing profiles of competition participants
CREATE POLICY "Users can view profiles of competition participants"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM competition_participants cp1
      JOIN competition_participants cp2 ON cp1.competition_id = cp2.competition_id
      WHERE cp1.user_id = auth.uid()
      AND cp2.user_id = profiles.user_id
      AND cp1.status IN ('joined', 'completed')
      AND cp2.status IN ('joined', 'completed')
    )
    OR EXISTS (
      SELECT 1 FROM competitions c
      JOIN competition_participants cp ON c.id = cp.competition_id
      WHERE c.creator_id = auth.uid()
      AND cp.user_id = profiles.user_id
    )
  );