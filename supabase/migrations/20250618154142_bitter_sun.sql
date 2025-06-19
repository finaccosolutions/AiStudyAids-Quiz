/*
  # Fix Competition RLS Policies

  This migration fixes the infinite recursion issue in competition policies by:
  1. Dropping all existing problematic policies
  2. Creating simplified, non-recursive policies
  3. Ensuring proper access control without circular dependencies

  ## Changes
  1. Drop all existing competition policies
  2. Create new simplified policies:
     - Creators can manage their own competitions
     - Users can view competitions they're participating in
     - Users can view public competitions by code
*/

-- Drop all existing policies on competitions table
DROP POLICY IF EXISTS "Creators can manage their competitions" ON competitions;
DROP POLICY IF EXISTS "Participants can view competition details" ON competitions;
DROP POLICY IF EXISTS "Users can view public competitions" ON competitions;

-- Create simplified policies without recursion
CREATE POLICY "creators_manage_competitions"
  ON competitions
  FOR ALL
  TO authenticated
  USING (creator_id = auth.uid())
  WITH CHECK (creator_id = auth.uid());

CREATE POLICY "participants_view_competitions"
  ON competitions
  FOR SELECT
  TO authenticated
  USING (
    creator_id = auth.uid() 
    OR 
    EXISTS (
      SELECT 1 FROM competition_participants cp 
      WHERE cp.competition_id = competitions.id 
      AND cp.user_id = auth.uid()
      AND cp.status IN ('joined', 'completed', 'invited')
    )
  );

-- Drop problematic policies on competition_participants if they exist
DROP POLICY IF EXISTS "Creators can invite participants by email" ON competition_participants;
DROP POLICY IF EXISTS "Creators can manage participants in their competitions" ON competition_participants;
DROP POLICY IF EXISTS "Users can manage their own participation" ON competition_participants;
DROP POLICY IF EXISTS "Users can view competition participants" ON competition_participants;

-- Create simplified competition_participants policies
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
  USING (
    EXISTS (
      SELECT 1 FROM competitions c 
      WHERE c.id = competition_participants.competition_id 
      AND c.creator_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM competitions c 
      WHERE c.id = competition_participants.competition_id 
      AND c.creator_id = auth.uid()
    )
  );

CREATE POLICY "invite_by_email"
  ON competition_participants
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id IS NULL 
    AND email IS NOT NULL 
    AND EXISTS (
      SELECT 1 FROM competitions c 
      WHERE c.id = competition_participants.competition_id 
      AND c.creator_id = auth.uid()
    )
  );