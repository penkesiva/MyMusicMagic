-- Fix styling columns for user_portfolios table
-- Add missing columns one by one to avoid syntax errors

-- Add card_shadows column
ALTER TABLE user_portfolios ADD COLUMN IF NOT EXISTS card_shadows BOOLEAN DEFAULT false;

-- Add section_blending column  
ALTER TABLE user_portfolios ADD COLUMN IF NOT EXISTS section_blending BOOLEAN DEFAULT false;

-- Add image_frames column
ALTER TABLE user_portfolios ADD COLUMN IF NOT EXISTS image_frames BOOLEAN DEFAULT false;

-- Add curved_separators column
ALTER TABLE user_portfolios ADD COLUMN IF NOT EXISTS curved_separators BOOLEAN DEFAULT false;

-- Add animations column
ALTER TABLE user_portfolios ADD COLUMN IF NOT EXISTS animations BOOLEAN DEFAULT false;

-- Success message
SELECT 'All styling columns added successfully!' as status; 