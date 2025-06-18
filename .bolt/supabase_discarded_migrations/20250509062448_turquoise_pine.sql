/*
  # Update profiles table RLS policies

  1. Changes
    - Drop existing RLS policies for profiles table
    - Create new comprehensive RLS policies that properly handle all operations
    
  2. Security
    - Enable RLS on profiles table (already enabled)
    - Add policies for INSERT, SELECT, and UPDATE operations
    - Ensure authenticated users can only:
      - Insert their own profile
      - View their own profile
      - Update their own profile
    
  3. Notes
    - All policies verify email is verified using is_email_verified(uid())
    - Policies ensure user_id matches authenticated user's ID
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;

-- Create new policies with email verification check
CREATE POLICY "Users can insert their own profile"
ON profiles
FOR INSERT
TO authenticated
WITH CHECK (
  uid() = user_id 
  AND is_email_verified(uid())
);

CREATE POLICY "Users can update their own profile"
ON profiles
FOR UPDATE
TO authenticated
USING (
  uid() = user_id 
  AND is_email_verified(uid())
)
WITH CHECK (
  uid() = user_id 
  AND is_email_verified(uid())
);

CREATE POLICY "Users can view their own profile"
ON profiles
FOR SELECT
TO authenticated
USING (
  uid() = user_id 
  AND is_email_verified(uid())
);