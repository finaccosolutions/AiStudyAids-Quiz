/*
  # Enhance question bank with essay questions and previous papers

  1. Changes
    - Add essay type to question_types constraint
    - Add previous year questions support
    - Add constraints and validation
  
  2. Notes
    - Maintains existing data
    - Adds support for previous year questions
    - Updates question types validation
*/

-- Add new columns to question_banks table
ALTER TABLE question_banks
ADD COLUMN IF NOT EXISTS is_previous_year boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS year_count integer;

-- Update question_types constraint to include essay type
ALTER TABLE question_banks 
DROP CONSTRAINT IF EXISTS question_types_check;

ALTER TABLE question_banks 
ADD CONSTRAINT question_types_check 
CHECK (
  array_length(question_types, 1) > 0 AND
  array_length(question_types, 1) <= 8 AND
  question_types <@ ARRAY[
    'multiple-choice',
    'true-false',
    'fill-blank',
    'short-answer',
    'sequence',
    'case-study',
    'situation',
    'multi-select',
    'essay'
  ]::text[]
);

-- Add constraint for year_count
ALTER TABLE question_banks
ADD CONSTRAINT year_count_check
CHECK (
  (NOT is_previous_year) OR
  (year_count BETWEEN 1 AND 20)
);