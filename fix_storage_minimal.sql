-- Minimal storage policy fix - only create missing policies
-- Run this in your Supabase SQL Editor

-- Create a simple permissive policy for authenticated users
-- This will allow all operations (SELECT, INSERT, UPDATE, DELETE) for authenticated users
CREATE POLICY "Allow authenticated operations for site bg images"
ON storage.objects FOR ALL
TO authenticated
USING (bucket_id = 'site-bg-images')
WITH CHECK (bucket_id = 'site-bg-images'); 