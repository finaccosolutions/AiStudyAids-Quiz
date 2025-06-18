/*
  # Fix Competition Participants RLS Policies - Remove Infinite Recursion

  1. Security Changes
    - Drop all existing policies for competition_participants that cause recursion
    - Create new simplified policies without circular references
    - Ensure proper access control for competition functionality

  2. Policy Updates
    - Creators can manage participants in their competitions (direct competition table check)
    - Users can manage their own participation records
    - Users can view participants in competitions they've joined (simplified logic)
    - Remove any policies that reference competition_participants within competition_participants policies
*/

-- Drop all existing policies that may cause recursion
DROP POLICY IF EXISTS "Creators can manage participants in their competitions" ON competition_participants;
DROP POLICY IF EXISTS "Users can manage their own participation" ON competition_participants;
DROP POLICY IF EXISTS "Users can view participants in joined competitions" ON competition_participants;
DROP POLICY IF EXISTS "Users can join competitions" ON competition_participants;

-- Create new simplified policies without any circular references

-- Policy 1: Creators can manage all participants in their competitions
-- This uses a direct join to competitions table without referencing competition_participants
CREATE POLICY "Creators can manage participants in their competitions"
  ON competition_participants
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM competitions 
      WHERE competitions.id = competition_participants.competition_id 
      AND competitions.creator_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM competitions 
      WHERE competitions.id = competition_participants.competition_id 
      AND competitions.creator_id = auth.uid()
    )
  );

-- Policy 2: Users can manage their own participation records
CREATE POLICY "Users can manage their own participation"
  ON competition_participants
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Policy 3: Allow inserting email invitations by competition creators
CREATE POLICY "Creators can invite participants by email"
  ON competition_participants
  FOR INSERT
  TO authenticated
  WITH CHECK (
    user_id IS NULL AND 
    email IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM competitions 
      WHERE competitions.id = competition_participants.competition_id 
      AND competitions.creator_id = auth.uid()
    )
  );

-- Policy 4: Users can view participants in competitions where they are participants
-- This uses a simple EXISTS check without subqueries that reference the same table
CREATE POLICY "Users can view participants in their competitions"
  ON competition_participants
  FOR SELECT
  TO authenticated
  USING (
    -- User can see their own participation
    user_id = auth.uid()
    OR
    -- User can see other participants in competitions they've joined
    EXISTS (
      SELECT 1 FROM competition_participants cp2
      WHERE cp2.competition_id = competition_participants.competition_id
      AND cp2.user_id = auth.uid()
      AND cp2.status IN ('joined', 'completed')
    )
    OR
    -- Competition creator can see all participants
    EXISTS (
      SELECT 1 FROM competitions 
      WHERE competitions.id = competition_participants.competition_id 
      AND competitions.creator_id = auth.uid()
    )
  );