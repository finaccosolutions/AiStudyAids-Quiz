/*
  # Add tables for study assistant features

  1. New Tables
    - `question_banks`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `course` (text)
      - `topic` (text)
      - `subtopic` (text)
      - `difficulty` (text)
      - `language` (text)
      - `question_types` (text[])
      - `source` (text) - 'manual' or 'pdf'
      - `pdf_url` (text)
      - `questions` (jsonb)
      - `created_at` (timestamptz)
    
    - `answer_evaluations`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `question_paper_id` (uuid)
      - `answer_sheet_url` (text)
      - `score` (numeric)
      - `feedback` (text)
      - `improvements` (text[])
      - `evaluated_at` (timestamptz)
    
    - `question_papers`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `course` (text)
      - `topic` (text)
      - `questions` (jsonb)
      - `total_marks` (integer)
      - `duration` (integer)
      - `created_at` (timestamptz)
    
    - `notes`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `course` (text)
      - `topic` (text)
      - `source` (text) - 'text' or 'pdf'
      - `content` (text)
      - `pdf_url` (text)
      - `output_format` (text[])
      - `language` (text)
      - `generated_content` (jsonb)
      - `created_at` (timestamptz)
    
    - `study_plans`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `course` (text)
      - `syllabus` (jsonb)
      - `exam_date` (date)
      - `start_date` (date)
      - `daily_hours` (integer)
      - `schedule` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `progress_stats`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `course` (text)
      - `quiz_scores` (jsonb)
      - `topics_covered` (jsonb)
      - `study_hours` (integer)
      - `last_updated` (timestamptz)
    
    - `chat_history`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `content` (text)
      - `type` (text) - 'user' or 'assistant'
      - `context` (jsonb)
      - `timestamp` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Add constraints and validation
*/

-- Create question_banks table
CREATE TABLE IF NOT EXISTS question_banks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  course text NOT NULL,
  topic text,
  subtopic text,
  difficulty text NOT NULL,
  language text NOT NULL,
  question_types text[] NOT NULL,
  source text NOT NULL,
  pdf_url text,
  questions jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT question_banks_difficulty_check CHECK (difficulty IN ('easy', 'medium', 'hard')),
  CONSTRAINT question_banks_source_check CHECK (source IN ('manual', 'pdf'))
);

-- Create answer_evaluations table
CREATE TABLE IF NOT EXISTS answer_evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  question_paper_id uuid,
  answer_sheet_url text NOT NULL,
  score numeric NOT NULL,
  feedback text NOT NULL,
  improvements text[] NOT NULL,
  evaluated_at timestamptz DEFAULT now()
);

-- Create question_papers table
CREATE TABLE IF NOT EXISTS question_papers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  course text NOT NULL,
  topic text,
  questions jsonb NOT NULL,
  total_marks integer NOT NULL,
  duration integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create notes table
CREATE TABLE IF NOT EXISTS notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  course text NOT NULL,
  topic text,
  source text NOT NULL,
  content text,
  pdf_url text,
  output_format text[] NOT NULL,
  language text NOT NULL,
  generated_content jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT notes_source_check CHECK (source IN ('text', 'pdf'))
);

-- Create study_plans table
CREATE TABLE IF NOT EXISTS study_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  course text NOT NULL,
  syllabus jsonb NOT NULL,
  exam_date date NOT NULL,
  start_date date NOT NULL,
  daily_hours integer NOT NULL,
  schedule jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create progress_stats table
CREATE TABLE IF NOT EXISTS progress_stats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  course text NOT NULL,
  quiz_scores jsonb NOT NULL,
  topics_covered jsonb NOT NULL,
  study_hours integer NOT NULL DEFAULT 0,
  last_updated timestamptz DEFAULT now()
);

-- Create chat_history table
CREATE TABLE IF NOT EXISTS chat_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  content text NOT NULL,
  type text NOT NULL,
  context jsonb,
  timestamp timestamptz DEFAULT now(),
  CONSTRAINT chat_type_check CHECK (type IN ('user', 'assistant'))
);

-- Enable RLS on all tables
ALTER TABLE question_banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE answer_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_papers ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS question_banks_user_id_idx ON question_banks (user_id);
CREATE INDEX IF NOT EXISTS question_banks_course_idx ON question_banks (course);
CREATE INDEX IF NOT EXISTS answer_evaluations_user_id_idx ON answer_evaluations (user_id);
CREATE INDEX IF NOT EXISTS question_papers_user_id_idx ON question_papers (user_id);
CREATE INDEX IF NOT EXISTS notes_user_id_idx ON notes (user_id);
CREATE INDEX IF NOT EXISTS notes_course_idx ON notes (course);
CREATE INDEX IF NOT EXISTS study_plans_user_id_idx ON study_plans (user_id);
CREATE INDEX IF NOT EXISTS progress_stats_user_id_idx ON progress_stats (user_id);
CREATE INDEX IF NOT EXISTS chat_history_user_id_idx ON chat_history (user_id);
CREATE INDEX IF NOT EXISTS chat_history_timestamp_idx ON chat_history ("timestamp");

-- Create RLS policies for question_banks
CREATE POLICY "Users can manage their own question banks"
ON question_banks
FOR ALL
TO public
USING (uid() = user_id)
WITH CHECK (uid() = user_id);

-- Create RLS policies for answer_evaluations
CREATE POLICY "Users can manage their own evaluations"
ON answer_evaluations
FOR ALL
TO public
USING (uid() = user_id)
WITH CHECK (uid() = user_id);

-- Create RLS policies for question_papers
CREATE POLICY "Users can manage their own question papers"
ON question_papers
FOR ALL
TO public
USING (uid() = user_id)
WITH CHECK (uid() = user_id);

-- Create RLS policies for notes
CREATE POLICY "Users can manage their own notes"
ON notes
FOR ALL
TO public
USING (uid() = user_id)
WITH CHECK (uid() = user_id);

-- Create RLS policies for study_plans
CREATE POLICY "Users can manage their own study plans"
ON study_plans
FOR ALL
TO public
USING (uid() = user_id)
WITH CHECK (uid() = user_id);

-- Create RLS policies for progress_stats
CREATE POLICY "Users can manage their own progress stats"
ON progress_stats
FOR ALL
TO public
USING (uid() = user_id)
WITH CHECK (uid() = user_id);

-- Create RLS policies for chat_history
CREATE POLICY "Users can manage their own chat history"
ON chat_history
FOR ALL
TO public
USING (uid() = user_id)
WITH CHECK (uid() = user_id);