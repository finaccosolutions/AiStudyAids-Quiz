/*
  # Remove unique constraint on mobile_number in profiles table

  1. Changes
    - Drop the unique constraint on mobile_number column in profiles table
    - This allows multiple users to have the same mobile number
  
  2. Security
    - RLS policies remain unchanged
    - Users can still only access their own profile data
*/

-- Drop the unique constraint on mobile_number
DROP INDEX IF EXISTS unique_mobile_number;

-- Remove the unique constraint from the table
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS unique_mobile_number;