/*
  # Update quiz preferences schema constraints

  1. Changes
    - Add constraints to ensure valid values for mode and answer_mode
    - Add constraints for negative marks range
    - Add constraints for question count range
    - Ensure question_types array is not empty
  
  2. Notes
    - Maintains existing data
    - Adds data validation rules
*/

DO $$ 
BEGIN
  -- Add constraints for mode values
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.check_constraints 
    WHERE constraint_name = 'quiz_preferences_mode_check'
  ) THEN
    ALTER TABLE quiz_preferences 
    ADD CONSTRAINT quiz_preferences_mode_check 
    CHECK (mode IN ('practice', 'exam'));
  END IF;

  -- Add constraints for answer_mode values
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.check_constraints 
    WHERE constraint_name = 'quiz_preferences_answer_mode_check'
  ) THEN
    ALTER TABLE quiz_preferences 
    ADD CONSTRAINT quiz_preferences_answer_mode_check 
    CHECK (answer_mode IN ('immediate', 'end'));
  END IF;

  -- Add constraints for negative marks range
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.check_constraints 
    WHERE constraint_name = 'quiz_preferences_negative_marks_check'
  ) THEN
    ALTER TABLE quiz_preferences 
    ADD CONSTRAINT quiz_preferences_negative_marks_check 
    CHECK (negative_marks >= -5 AND negative_marks <= 0);
  END IF;

  -- Add constraints for question count range
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.check_constraints 
    WHERE constraint_name = 'quiz_preferences_question_count_check'
  ) THEN
    ALTER TABLE quiz_preferences 
    ADD CONSTRAINT quiz_preferences_question_count_check 
    CHECK (question_count >= 1 AND question_count <= 50);
  END IF;

  -- Add constraints for question_types array
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.check_constraints 
    WHERE constraint_name = 'quiz_preferences_question_types_check'
  ) THEN
    ALTER TABLE quiz_preferences 
    ADD CONSTRAINT quiz_preferences_question_types_check 
    CHECK (
      array_length(question_types, 1) > 0 AND
      array_length(question_types, 1) <= 6
    );
  END IF;

  -- Add constraints for difficulty values
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.check_constraints 
    WHERE constraint_name = 'quiz_preferences_difficulty_check'
  ) THEN
    ALTER TABLE quiz_preferences 
    ADD CONSTRAINT quiz_preferences_difficulty_check 
    CHECK (difficulty IN ('easy', 'medium', 'hard'));
  END IF;
END $$;