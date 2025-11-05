/*
  # Create Demo Video Storage Bucket

  1. Storage
    - Creates public 'demo-videos' bucket for hosting app demo videos
    - Allows public read access so videos can be embedded
    - Restricts uploads to authenticated users only
  
  2. Security
    - Public bucket with controlled upload permissions
    - Anyone can view videos (for landing page)
    - Only authenticated users can upload
*/

-- Create demo videos bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('demo-videos', 'demo-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access
CREATE POLICY "Public can view demo videos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'demo-videos');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload demo videos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'demo-videos');