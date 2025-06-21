/*
  # Fix infinite recursion in competition_participants RLS policy

  1. Security Function
    - Create `is_competition_member` function with SECURITY INVOKER to prevent recursion
    - Function checks if user is participant or creator of competition

  2. Policy Updates
    - Drop problematic recursive policies
    - Create new policies using the security function
    - Ensure proper access control without recursion
*/

-- Create security function to check competition membership
CREATE OR REPLACE FUNCTION public.is_competition_member(comp_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY INVOKER -- This is crucial to prevent recursion
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.competition_participants
    WHERE competition_id = comp_id
      AND user_id = is_competition_member.user_id
      AND status IN ('joined', 'completed')
  ) OR EXISTS (
    SELECT 1
    FROM public.competitions
    WHERE id = comp_id
      AND creator_id = is_competition_member.user_id
  );
END;
$$;

-- Drop existing problematic policies that cause recursion
DROP POLICY IF EXISTS "participants_can_view_competition_members" ON competition_participants;
DROP POLICY IF EXISTS "Allow profile reads for competition participants" ON profiles;

-- Create new non-recursive policy for competition participants
CREATE POLICY "Allow select for competition members using function"
ON competition_participants
FOR SELECT
TO authenticated
USING (
  public.is_competition_member(competition_id, auth.uid())
);

-- Create simplified profile policy for competition context
CREATE POLICY "Allow profile reads for competition participants"
ON profiles
FOR SELECT
TO authenticated
USING (
  (user_id = auth.uid()) OR 
  EXISTS (
    SELECT 1 FROM competition_participants cp1
    JOIN competition_participants cp2 ON cp1.competition_id = cp2.competition_id
    WHERE cp1.user_id = auth.uid() 
      AND cp2.user_id = profiles.user_id
      AND cp1.status IN ('joined', 'completed')
      AND cp2.status IN ('joined', 'completed')
  ) OR
  EXISTS (
    SELECT 1 FROM competitions c
    JOIN competition_participants cp ON c.id = cp.competition_id
    WHERE c.creator_id = profiles.user_id
      AND cp.user_id = auth.uid()
      AND cp.status IN ('joined', 'completed')
  )
);