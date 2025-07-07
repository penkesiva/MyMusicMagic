-- Add missing styling columns to user_portfolios table
-- These columns are needed for the portfolio styling features

-- Add card_shadows column
ALTER TABLE user_portfolios 
ADD COLUMN IF NOT EXISTS card_shadows BOOLEAN DEFAULT false;

-- Add section_blending column
ALTER TABLE user_portfolios 
ADD COLUMN IF NOT EXISTS section_blending BOOLEAN DEFAULT false;

-- Add image_frames column
ALTER TABLE user_portfolios 
ADD COLUMN IF NOT EXISTS image_frames BOOLEAN DEFAULT false;

-- Add curved_separators column
ALTER TABLE user_portfolios 
ADD COLUMN IF NOT EXISTS curved_separators BOOLEAN DEFAULT false;

-- Add animations column
ALTER TABLE user_portfolios 
ADD COLUMN IF NOT EXISTS animations BOOLEAN DEFAULT false;

-- Add comments to document the columns
COMMENT ON COLUMN user_portfolios.card_shadows IS 'Enable card shadows for portfolio elements';
COMMENT ON COLUMN user_portfolios.section_blending IS 'Enable section blending effects';
COMMENT ON COLUMN user_portfolios.image_frames IS 'Enable image frames and borders';
COMMENT ON COLUMN user_portfolios.curved_separators IS 'Enable curved separators between sections';
COMMENT ON COLUMN user_portfolios.animations IS 'Enable animations and transitions';

-- Success message
SELECT 'Styling columns added to user_portfolios table successfully!' as status; 