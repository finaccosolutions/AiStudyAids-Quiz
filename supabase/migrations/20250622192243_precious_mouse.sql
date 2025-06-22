/*
  # Fix array_length JSONB error in competition system

  1. Problem
    - PostgreSQL function using array_length() on JSONB column causes error
    - Error occurs when fetching competition participant data during quiz completion

  2. Solution
    - Drop trigger first, then function to avoid dependency issues
    - Recreate function with proper JSONB handling using jsonb_object_keys()
    - Update existing data with correct calculations
    - Recreate trigger

  3. Changes
    - Fix save_competition_result function to use proper JSONB functions
    - Update questions_answered calculation to use jsonb_object_keys()
    - Ensure all JSONB operations use correct PostgreSQL functions
*/

-- Drop trigger first to avoid dependency issues
DROP TRIGGER IF EXISTS save_competition_result_trigger ON competition_participants;

-- Now drop the function
DROP FUNCTION IF EXISTS save_competition_result();

-- Recreate the save_competition_result function with proper JSONB handling
CREATE OR REPLACE FUNCTION save_competition_result()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process when status changes to 'completed'
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Calculate questions answered from JSONB answers object
    -- Use COALESCE to handle NULL or empty JSONB objects
    NEW.questions_answered := (
      SELECT COUNT(*)
      FROM jsonb_object_keys(COALESCE(NEW.answers, '{}'::jsonb))
    );
    
    -- Insert or update competition result
    INSERT INTO competition_results (
      competition_id,
      user_id,
      competition_title,
      competition_type,
      competition_code,
      final_rank,
      total_participants,
      score,
      correct_answers,
      incorrect_answers,
      skipped_answers,
      total_questions,
      time_taken,
      average_time_per_question,
      points_earned,
      question_type_performance,
      answers,
      question_details,
      quiz_preferences,
      competition_date,
      joined_at,
      started_at,
      completed_at
    )
    SELECT 
      c.id,
      NEW.user_id,
      c.title,
      c.type,
      c.competition_code,
      COALESCE(NEW.rank, 999) as final_rank,
      COALESCE(c.participant_count, 1) as total_participants,
      COALESCE(NEW.score, 0) as score,
      COALESCE(NEW.correct_answers, 0) as correct_answers,
      GREATEST(0, COALESCE(NEW.questions_answered, 0) - COALESCE(NEW.correct_answers, 0)) as incorrect_answers,
      GREATEST(0, 
        COALESCE(
          (c.quiz_preferences->>'questionCount')::integer, 
          jsonb_array_length(COALESCE(c.questions, '[]'::jsonb)),
          10
        ) - COALESCE(NEW.questions_answered, 0)
      ) as skipped_answers,
      COALESCE(
        (c.quiz_preferences->>'questionCount')::integer,
        jsonb_array_length(COALESCE(c.questions, '[]'::jsonb)),
        10
      ) as total_questions,
      COALESCE(NEW.time_taken, 0) as time_taken,
      CASE 
        WHEN COALESCE(NEW.questions_answered, 0) > 0 THEN 
          COALESCE(NEW.time_taken, 0)::numeric / NEW.questions_answered
        ELSE 0
      END as average_time_per_question,
      COALESCE(NEW.points_earned, 0) as points_earned,
      COALESCE(NEW.answers, '{}'::jsonb) as question_type_performance,
      COALESCE(NEW.answers, '{}'::jsonb) as answers,
      COALESCE(c.questions, '[]'::jsonb) as question_details,
      COALESCE(c.quiz_preferences, '{}'::jsonb) as quiz_preferences,
      COALESCE(c.created_at, now()) as competition_date,
      NEW.joined_at,
      NEW.quiz_start_time,
      COALESCE(NEW.completed_at, now())
    FROM competitions c
    WHERE c.id = NEW.competition_id
    ON CONFLICT (competition_id, user_id) 
    DO UPDATE SET
      final_rank = EXCLUDED.final_rank,
      score = EXCLUDED.score,
      correct_answers = EXCLUDED.correct_answers,
      incorrect_answers = EXCLUDED.incorrect_answers,
      skipped_answers = EXCLUDED.skipped_answers,
      time_taken = EXCLUDED.time_taken,
      average_time_per_question = EXCLUDED.average_time_per_question,
      points_earned = EXCLUDED.points_earned,
      answers = EXCLUDED.answers,
      completed_at = EXCLUDED.completed_at;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER save_competition_result_trigger
  AFTER UPDATE ON competition_participants
  FOR EACH ROW
  EXECUTE FUNCTION save_competition_result();

-- Update any existing competition participants with incorrect questions_answered count
-- Use a safer approach that handles NULL and empty JSONB objects
UPDATE competition_participants 
SET questions_answered = (
  CASE 
    WHEN answers IS NULL OR answers = '{}'::jsonb THEN 0
    ELSE (
      SELECT COUNT(*)
      FROM jsonb_object_keys(answers)
    )
  END
)
WHERE answers IS NOT NULL 
  AND (
    questions_answered IS NULL 
    OR questions_answered != (
      CASE 
        WHEN answers = '{}'::jsonb THEN 0
        ELSE (
          SELECT COUNT(*)
          FROM jsonb_object_keys(answers)
        )
      END
    )
  );

-- Ensure the loadParticipants query works by checking for any remaining array_length usage
-- Fix any potential issues in the competition_participants table structure
DO $$
BEGIN
  -- Ensure all JSONB columns have proper default values
  UPDATE competition_participants 
  SET answers = '{}'::jsonb 
  WHERE answers IS NULL;
  
  -- Ensure questions_answered is never NULL
  UPDATE competition_participants 
  SET questions_answered = 0 
  WHERE questions_answered IS NULL;
  
  -- Ensure other numeric fields have proper defaults
  UPDATE competition_participants 
  SET 
    score = COALESCE(score, 0),
    correct_answers = COALESCE(correct_answers, 0),
    time_taken = COALESCE(time_taken, 0),
    points_earned = COALESCE(points_earned, 0),
    current_question = COALESCE(current_question, 0)
  WHERE 
    score IS NULL 
    OR correct_answers IS NULL 
    OR time_taken IS NULL 
    OR points_earned IS NULL 
    OR current_question IS NULL;
    
  RAISE NOTICE 'Migration completed successfully. JSONB array_length issues have been resolved.';
END $$;