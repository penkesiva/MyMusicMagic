-- Check for missing columns in user_portfolios table
-- This will help identify what columns need to be added

-- Check if font_pair column exists
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'user_portfolios' AND column_name = 'font_pair'
    ) THEN 'font_pair column exists'
    ELSE 'font_pair column MISSING'
  END as font_pair_status;

-- Check if card_shadows column exists
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'user_portfolios' AND column_name = 'card_shadows'
    ) THEN 'card_shadows column exists'
    ELSE 'card_shadows column MISSING'
  END as card_shadows_status;

-- Check if section_blending column exists
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'user_portfolios' AND column_name = 'section_blending'
    ) THEN 'section_blending column exists'
    ELSE 'section_blending column MISSING'
  END as section_blending_status;

-- Check if image_frames column exists
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'user_portfolios' AND column_name = 'image_frames'
    ) THEN 'image_frames column exists'
    ELSE 'image_frames column MISSING'
  END as image_frames_status;

-- Check if curved_separators column exists
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'user_portfolios' AND column_name = 'curved_separators'
    ) THEN 'curved_separators column exists'
    ELSE 'curved_separators column MISSING'
  END as curved_separators_status;

-- Check if animations column exists
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'user_portfolios' AND column_name = 'animations'
    ) THEN 'animations column exists'
    ELSE 'animations column MISSING'
  END as animations_status;

-- Show all columns in user_portfolios table for reference
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_portfolios' 
ORDER BY ordinal_position; 