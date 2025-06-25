-- Hero CTA Buttons Migration
-- Run this in your Supabase SQL Editor

-- Step 1: Add the new hero_cta_buttons column
ALTER TABLE user_portfolios 
ADD COLUMN IF NOT EXISTS hero_cta_buttons JSONB;

-- Step 2: Migrate existing single CTA data to the new format
UPDATE user_portfolios 
SET hero_cta_buttons = CASE 
  WHEN hero_cta_text IS NOT NULL AND hero_cta_link IS NOT NULL 
  THEN jsonb_build_array(
    jsonb_build_object(
      'text', hero_cta_text,
      'link', hero_cta_link,
      'style', 'primary',
      'order', 1
    )
  )
  ELSE NULL
END
WHERE hero_cta_text IS NOT NULL OR hero_cta_link IS NOT NULL;

-- Step 3: Add comment for documentation
COMMENT ON COLUMN user_portfolios.hero_cta_buttons IS 'JSON array of CTA buttons with text, link, style, and order properties';

-- Step 4: Verify the migration
SELECT 
  'Migration completed successfully!' as status,
  COUNT(*) as portfolios_with_cta_buttons
FROM user_portfolios 
WHERE hero_cta_buttons IS NOT NULL;

-- Step 5: Show sample of migrated data
SELECT 
  id,
  name,
  hero_cta_text,
  hero_cta_link,
  hero_cta_buttons
FROM user_portfolios 
WHERE hero_cta_buttons IS NOT NULL
LIMIT 3; 