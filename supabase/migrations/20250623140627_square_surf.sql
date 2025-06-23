/*
  # Fix Competition Results User Relationship

  1. Database Changes
    - Add foreign key constraint from competition_results.user_id to auth.users.id
    - This enables proper joins between competition results and user data
  
  2. Schema Cache
    - The foreign key will allow Supabase to automatically detect the relationship
    - Enables proper data fetching with user profiles in competition results
*/

-- Add foreign key constraint from competition_results.user_id to auth.users.id
DO $$
BEGIN
  -- Check if the foreign key constraint doesn't already exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'competition_results_user_id_auth_fkey'
    AND table_name = 'competition_results'
  ) THEN
    -- Add the foreign key constraint
    ALTER TABLE competition_results 
    ADD CONSTRAINT competition_results_user_id_auth_fkey 
    FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Refresh the schema cache to ensure Supabase recognizes the new relationship
NOTIFY pgrst, 'reload schema';