-- Add about_artist_title column to artist_info table
-- Run this in your Supabase SQL Editor

ALTER TABLE artist_info
ADD COLUMN IF NOT EXISTS about_artist_title text DEFAULT 'About the Artist';

-- Update existing rows to have default value
UPDATE artist_info
SET about_artist_title = COALESCE(about_artist_title, 'About the Artist')
WHERE about_artist_title IS NULL; 