-- Simple storage policy fix for site-bg-images bucket
-- Run this in your Supabase SQL Editor

-- Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-bg-images', 'site-bg-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Create policies for site-bg-images bucket
-- Note: These policies will be created if they don't exist, or ignored if they do

-- Public read access
CREATE POLICY IF NOT EXISTS "Public can view site bg images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'site-bg-images');

-- Authenticated user upload access
CREATE POLICY IF NOT EXISTS "Allow authenticated uploads for site bg images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'site-bg-images');

-- Authenticated user update access
CREATE POLICY IF NOT EXISTS "Allow authenticated updates for site bg images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'site-bg-images');

-- Authenticated user delete access
CREATE POLICY IF NOT EXISTS "Allow authenticated deletes for site bg images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'site-bg-images');

-- Alternative: Create a more permissive policy for testing
CREATE POLICY IF NOT EXISTS "Allow all authenticated operations for site bg images"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'site-bg-images')
WITH CHECK (bucket_id = 'site-bg-images'); 