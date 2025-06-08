-- Add homepage title and description columns to artist_info table
ALTER TABLE artist_info
ADD COLUMN IF NOT EXISTS homepage_title text DEFAULT 'My Music Magic',
ADD COLUMN IF NOT EXISTS homepage_description text DEFAULT 'Discover a collection of carefully crafted musical compositions, each telling its own unique story through melody and rhythm.';

-- Update existing rows to have default values
UPDATE artist_info
SET 
  homepage_title = COALESCE(homepage_title, 'My Music Magic'),
  homepage_description = COALESCE(homepage_description, 'Discover a collection of carefully crafted musical compositions, each telling its own unique story through melody and rhythm.')
WHERE homepage_title IS NULL OR homepage_description IS NULL; 