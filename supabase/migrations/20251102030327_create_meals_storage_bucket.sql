-- Create Storage Bucket for Meal Photos
-- 
-- 1. Storage Bucket
--    meals: Public bucket for meal photos
-- 
-- 2. Security
--    Users can upload to their own folder
--    Users can read from their own folder
--    Public read access for meal photos

-- Create the meals storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('meals', 'meals', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload own meal photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'meals' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow authenticated users to read their own meal photos
CREATE POLICY "Users can view own meal photos"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'meals' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow public read access (for displaying in app)
CREATE POLICY "Public can view meal photos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'meals');

-- Allow users to delete their own photos
CREATE POLICY "Users can delete own meal photos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'meals' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );