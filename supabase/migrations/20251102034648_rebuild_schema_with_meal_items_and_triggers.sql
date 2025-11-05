/*
  # Rebuild CalorieAI Database Schema

  ## New Tables
  1. user_profiles
     - Stores user onboarding data (age, gender, height, weight, goals)
     - Stores calculated daily nutrition goals (calories, protein, carbs, fat)
     - Links to auth.users for authentication
     - Auto-updates timestamp on changes

  2. meals
     - Tracks individual meals (breakfast, lunch, dinner, snack)
     - Stores meal date and nutritional totals
     - Optional photo URL and notes fields
     - Indexed on user_id and meal_date for fast queries

  3. meal_items
     - Stores individual food items within each meal
     - Tracks food name, serving size, and macros
     - Linked to parent meal via meal_id

  4. daily_totals
     - Aggregates daily nutritional totals
     - One record per user per day (enforced by unique constraint)
     - Automatically calculated via triggers when meals change

  ## Key Features
  - Database triggers automatically recalculate daily_totals when meals are inserted, updated, or deleted
  - get_daily_progress() function returns comprehensive daily progress with goals, consumed amounts, remaining amounts, and percentages
  - Row Level Security on all tables
  - Proper indexes for performance

  ## Security
  - RLS enabled on all tables
  - Users can only access their own data
  - All policies check auth.uid() = user_id
*/

-- Drop existing tables if they exist (in correct order due to foreign keys)
DROP TABLE IF EXISTS meal_items CASCADE;
DROP TABLE IF EXISTS meals CASCADE;
DROP TABLE IF EXISTS daily_totals CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- 1. Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  age integer NOT NULL,
  gender text NOT NULL CHECK (gender IN ('male', 'female')),
  height numeric NOT NULL,
  current_weight numeric NOT NULL,
  goal_weight numeric NOT NULL,
  activity_level text NOT NULL CHECK (activity_level IN ('sedentary', 'light', 'moderate', 'very_active', 'athlete')),
  goal_type text NOT NULL CHECK (goal_type IN ('lose_weight', 'maintain', 'build_muscle')),
  rate numeric NOT NULL DEFAULT 0,
  bmr integer NOT NULL,
  tdee integer NOT NULL,
  daily_calorie_goal integer NOT NULL,
  daily_protein_goal integer NOT NULL,
  daily_carbs_goal integer NOT NULL,
  daily_fat_goal integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Create meals table
CREATE TABLE IF NOT EXISTS meals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meal_date date NOT NULL DEFAULT CURRENT_DATE,
  meal_type text NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  photo_url text,
  notes text,
  total_calories integer NOT NULL DEFAULT 0,
  total_protein integer NOT NULL DEFAULT 0,
  total_carbs integer NOT NULL DEFAULT 0,
  total_fat integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 3. Create meal_items table
CREATE TABLE IF NOT EXISTS meal_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_id uuid NOT NULL REFERENCES meals(id) ON DELETE CASCADE,
  food_name text NOT NULL,
  serving_size text NOT NULL,
  calories integer NOT NULL,
  protein integer NOT NULL,
  carbs integer NOT NULL,
  fat integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 4. Create daily_totals table
CREATE TABLE IF NOT EXISTS daily_totals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL DEFAULT CURRENT_DATE,
  total_calories integer NOT NULL DEFAULT 0,
  total_protein integer NOT NULL DEFAULT 0,
  total_carbs integer NOT NULL DEFAULT 0,
  total_fat integer NOT NULL DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS meals_user_date_idx ON meals(user_id, meal_date DESC);
CREATE INDEX IF NOT EXISTS meals_user_id_idx ON meals(user_id);
CREATE INDEX IF NOT EXISTS meal_items_meal_id_idx ON meal_items(meal_id);
CREATE INDEX IF NOT EXISTS daily_totals_user_date_idx ON daily_totals(user_id, date DESC);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_totals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile"
  ON user_profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for meals
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

-- RLS Policies for meal_items
CREATE POLICY "Users can view own meal items"
  ON meal_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM meals
      WHERE meals.id = meal_items.meal_id
      AND meals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own meal items"
  ON meal_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM meals
      WHERE meals.id = meal_items.meal_id
      AND meals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own meal items"
  ON meal_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM meals
      WHERE meals.id = meal_items.meal_id
      AND meals.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM meals
      WHERE meals.id = meal_items.meal_id
      AND meals.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own meal items"
  ON meal_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM meals
      WHERE meals.id = meal_items.meal_id
      AND meals.user_id = auth.uid()
    )
  );

-- RLS Policies for daily_totals
CREATE POLICY "Users can view own daily totals"
  ON daily_totals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily totals"
  ON daily_totals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own daily totals"
  ON daily_totals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own daily totals"
  ON daily_totals FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to update meal totals from meal_items
CREATE OR REPLACE FUNCTION update_meal_totals()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE meals
  SET 
    total_calories = COALESCE((
      SELECT SUM(calories) FROM meal_items WHERE meal_id = meals.id
    ), 0),
    total_protein = COALESCE((
      SELECT SUM(protein) FROM meal_items WHERE meal_id = meals.id
    ), 0),
    total_carbs = COALESCE((
      SELECT SUM(carbs) FROM meal_items WHERE meal_id = meals.id
    ), 0),
    total_fat = COALESCE((
      SELECT SUM(fat) FROM meal_items WHERE meal_id = meals.id
    ), 0),
    updated_at = now()
  WHERE id = COALESCE(NEW.meal_id, OLD.meal_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to recalculate daily totals
CREATE OR REPLACE FUNCTION recalculate_daily_totals()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id uuid;
  v_date date;
BEGIN
  -- Get user_id and date from the meal
  IF TG_OP = 'DELETE' THEN
    v_user_id := OLD.user_id;
    v_date := OLD.meal_date;
  ELSE
    v_user_id := NEW.user_id;
    v_date := NEW.meal_date;
  END IF;

  -- Insert or update daily_totals
  INSERT INTO daily_totals (user_id, date, total_calories, total_protein, total_carbs, total_fat, updated_at)
  SELECT 
    v_user_id,
    v_date,
    COALESCE(SUM(total_calories), 0),
    COALESCE(SUM(total_protein), 0),
    COALESCE(SUM(total_carbs), 0),
    COALESCE(SUM(total_fat), 0),
    now()
  FROM meals
  WHERE user_id = v_user_id AND meal_date = v_date
  ON CONFLICT (user_id, date)
  DO UPDATE SET
    total_calories = EXCLUDED.total_calories,
    total_protein = EXCLUDED.total_protein,
    total_carbs = EXCLUDED.total_carbs,
    total_fat = EXCLUDED.total_fat,
    updated_at = now();

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Triggers for meal_items to update meal totals
CREATE TRIGGER trigger_update_meal_totals_on_insert
  AFTER INSERT ON meal_items
  FOR EACH ROW
  EXECUTE FUNCTION update_meal_totals();

CREATE TRIGGER trigger_update_meal_totals_on_update
  AFTER UPDATE ON meal_items
  FOR EACH ROW
  EXECUTE FUNCTION update_meal_totals();

CREATE TRIGGER trigger_update_meal_totals_on_delete
  AFTER DELETE ON meal_items
  FOR EACH ROW
  EXECUTE FUNCTION update_meal_totals();

-- Triggers for meals to update daily_totals
CREATE TRIGGER trigger_recalculate_daily_on_insert
  AFTER INSERT ON meals
  FOR EACH ROW
  EXECUTE FUNCTION recalculate_daily_totals();

CREATE TRIGGER trigger_recalculate_daily_on_update
  AFTER UPDATE ON meals
  FOR EACH ROW
  EXECUTE FUNCTION recalculate_daily_totals();

CREATE TRIGGER trigger_recalculate_daily_on_delete
  AFTER DELETE ON meals
  FOR EACH ROW
  EXECUTE FUNCTION recalculate_daily_totals();

-- Function to get daily progress with goals
CREATE OR REPLACE FUNCTION get_daily_progress(p_user_id uuid, p_date date)
RETURNS TABLE(
  date date,
  calories_goal integer,
  calories_consumed integer,
  calories_remaining integer,
  calories_percentage numeric,
  protein_goal integer,
  protein_consumed integer,
  protein_remaining integer,
  protein_percentage numeric,
  carbs_goal integer,
  carbs_consumed integer,
  carbs_remaining integer,
  carbs_percentage numeric,
  fat_goal integer,
  fat_consumed integer,
  fat_remaining integer,
  fat_percentage numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p_date,
    up.daily_calorie_goal,
    COALESCE(dt.total_calories, 0) as calories_consumed,
    up.daily_calorie_goal - COALESCE(dt.total_calories, 0) as calories_remaining,
    ROUND((COALESCE(dt.total_calories, 0)::numeric / up.daily_calorie_goal::numeric) * 100, 1) as calories_percentage,
    up.daily_protein_goal,
    COALESCE(dt.total_protein, 0) as protein_consumed,
    up.daily_protein_goal - COALESCE(dt.total_protein, 0) as protein_remaining,
    ROUND((COALESCE(dt.total_protein, 0)::numeric / up.daily_protein_goal::numeric) * 100, 1) as protein_percentage,
    up.daily_carbs_goal,
    COALESCE(dt.total_carbs, 0) as carbs_consumed,
    up.daily_carbs_goal - COALESCE(dt.total_carbs, 0) as carbs_remaining,
    ROUND((COALESCE(dt.total_carbs, 0)::numeric / up.daily_carbs_goal::numeric) * 100, 1) as carbs_percentage,
    up.daily_fat_goal,
    COALESCE(dt.total_fat, 0) as fat_consumed,
    up.daily_fat_goal - COALESCE(dt.total_fat, 0) as fat_remaining,
    ROUND((COALESCE(dt.total_fat, 0)::numeric / up.daily_fat_goal::numeric) * 100, 1) as fat_percentage
  FROM user_profiles up
  LEFT JOIN daily_totals dt ON dt.user_id = up.user_id AND dt.date = p_date
  WHERE up.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
