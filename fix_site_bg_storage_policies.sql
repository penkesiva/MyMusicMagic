-- Fix storage policies for site-bg-images bucket
-- Run this in your Supabase SQL Editor

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for site-bg-images to avoid conflicts
DROP POLICY IF EXISTS "Public can view site bg images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads for site bg images" ON storage.objects;

-- Create public read policy for site-bg-images
CREATE POLICY "Public can view site bg images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'site-bg-images');

-- Create authenticated upload policy for site-bg-images
CREATE POLICY "Allow authenticated uploads for site bg images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'site-bg-images');

-- Create authenticated update policy for site-bg-images
CREATE POLICY "Allow authenticated updates for site bg images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'site-bg-images');

-- Create authenticated delete policy for site-bg-images
CREATE POLICY "Allow authenticated deletes for site bg images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'site-bg-images');

-- Verify the bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-bg-images', 'site-bg-images', true)
ON CONFLICT (id) DO UPDATE SET public = true; 