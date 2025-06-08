-- Add homepage hero image column to artist_info table
ALTER TABLE artist_info
ADD COLUMN IF NOT EXISTS homepage_hero_url text DEFAULT '/hero-bg.jpg';

-- Update existing rows to have default value
UPDATE artist_info
SET homepage_hero_url = COALESCE(homepage_hero_url, '/hero-bg.jpg')
WHERE homepage_hero_url IS NULL; 