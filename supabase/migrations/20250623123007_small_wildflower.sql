/*
  # Fix Competition Results RLS Policy

  1. Security Changes
    - Add policy to allow users to view competition results for competitions they participated in
    - This enables the leaderboard to display all participants' results
    - Users can only see results from competitions they were part of

  2. Policy Details
    - Allow SELECT on competition_results for users who participated in the competition
    - Check participation through competition_participants table
*/

-- Add policy to allow users to view results from competitions they participated in
CREATE POLICY "Users can view results from competitions they participated in"
  ON competition_results
  FOR SELECT
  TO authenticated
  USING (
    competition_id IN (
      SELECT competition_id 
      FROM competition_participants 
      WHERE user_id = auth.uid()
    )
  );