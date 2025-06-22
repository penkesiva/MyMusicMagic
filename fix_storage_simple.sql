-- Simple storage policy fix for site-bg-images bucket
-- Run this in your Supabase SQL Editor

-- Create the bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-bg-images', 'site-bg-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Create a simple permissive policy for authenticated users
-- This will allow all operations (SELECT, INSERT, UPDATE, DELETE) for authenticated users
CREATE POLICY "Allow authenticated operations for site bg images"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'site-bg-images')
WITH CHECK (bucket_id = 'site-bg-images');

-- Create public read policy
CREATE POLICY "Public can view site bg images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'site-bg-images'); 