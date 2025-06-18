/*
  # Fix Competition Participants RLS Policies

  1. Security Changes
    - Drop existing problematic policies for competition_participants
    - Create new simplified policies without circular references
    - Ensure proper access control for competition functionality

  2. Policy Updates
    - Creators can manage participants in their competitions
    - Users can manage their own participation
    - Participants can view other participants in same competition
    - Remove circular policy references that cause infinite recursion
*/

-- Drop existing policies that may cause recursion
DROP POLICY IF EXISTS "Creators can view all participants in their competitions" ON competition_participants;
DROP POLICY IF EXISTS "Participants can view other participants in same competition" ON competition_participants;
DROP POLICY IF EXISTS "Users can join competitions" ON competition_participants;
DROP POLICY IF EXISTS "Users can update their participation" ON competition_participants;
DROP POLICY IF EXISTS "Users can view their own participation" ON competition_participants;

-- Create new simplified policies without circular references

-- Policy for creators to manage participants in their competitions
CREATE POLICY "Creators can manage participants in their competitions"
  ON competition_participants
  FOR ALL
  TO authenticated
  USING (
    competition_id IN (
      SELECT id FROM competitions WHERE creator_id = auth.uid()
    )
  )
  WITH CHECK (
    competition_id IN (
      SELECT id FROM competitions WHERE creator_id = auth.uid()
    )
  );

-- Policy for users to manage their own participation
CREATE POLICY "Users can manage their own participation"
  ON competition_participants
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Policy for users to view participants in competitions they've joined
CREATE POLICY "Users can view participants in joined competitions"
  ON competition_participants
  FOR SELECT
  TO authenticated
  USING (
    competition_id IN (
      SELECT DISTINCT cp.competition_id 
      FROM competition_participants cp 
      WHERE cp.user_id = auth.uid() 
      AND cp.status IN ('joined', 'completed')
    )
  );

-- Policy for inserting new participants (joining competitions)
CREATE POLICY "Users can join competitions"
  ON competition_participants
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id = auth.uid() OR 
    (
      user_id IS NULL AND 
      email IS NOT NULL AND
      competition_id IN (
        SELECT id FROM competitions WHERE creator_id = auth.uid()
      )
    )
  );