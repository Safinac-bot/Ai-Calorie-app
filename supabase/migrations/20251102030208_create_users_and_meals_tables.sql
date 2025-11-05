-- Create CalorieAI Database Schema
-- 
-- 1. New Tables
--    profiles: User profile and goal data
--    meals: Logged meals with nutrition information
-- 
-- 2. Security
--    RLS enabled on both tables
--    Users can only access their own data
-- 
-- 3. Indexes
--    Optimized for user-based and date-based queries

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  age integer NOT NULL,
  sex text NOT NULL CHECK (sex IN ('male', 'female')),
  height numeric NOT NULL,
  current_weight numeric NOT NULL,
  goal_weight numeric NOT NULL,
  activity_level text NOT NULL CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'very_active', 'athlete')),
  goal_type text NOT NULL CHECK (goal_type IN ('lose_weight', 'maintain', 'build_muscle')),
  rate numeric NOT NULL DEFAULT 0,
  bmr integer NOT NULL,
  tdee integer NOT NULL,
  daily_calorie_target integer NOT NULL,
  protein_target integer NOT NULL,
  carbs_target integer NOT NULL,
  fat_target integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create meals table
CREATE TABLE IF NOT EXISTS meals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  timestamp timestamptz NOT NULL DEFAULT now(),
  photo_url text,
  foods jsonb NOT NULL DEFAULT '[]'::jsonb,
  total_calories integer NOT NULL DEFAULT 0,
  total_protein integer NOT NULL DEFAULT 0,
  total_carbs integer NOT NULL DEFAULT 0,
  total_fat integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS meals_user_id_idx ON meals(user_id);
CREATE INDEX IF NOT EXISTS meals_timestamp_idx ON meals(timestamp DESC);
CREATE INDEX IF NOT EXISTS meals_user_timestamp_idx ON meals(user_id, timestamp DESC);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles table
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile"
  ON profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for meals table
CREATE POLICY "Users can view own meals"
  ON meals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own meals"
  ON meals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own meals"
  ON meals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own meals"
  ON meals FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);