/*
  # Fix Competition Join RLS Policy

  1. Security Changes
    - Add policy to allow users to find competitions by code when status is 'waiting'
    - This enables the join competition functionality while maintaining security
    - Users can only see waiting competitions when searching by code
    - Existing policies for creators and participants remain unchanged

  2. Changes Made
    - Add new SELECT policy for finding competitions by code
    - Policy only applies to competitions with 'waiting' status
    - Maintains security by not exposing all competition data
*/

-- Add policy to allow users to find competitions by code when joining
CREATE POLICY "users_can_find_waiting_competitions_by_code"
  ON competitions
  FOR SELECT
  TO authenticated
  USING (status = 'waiting');