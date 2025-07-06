-- Add font_pair column to user_portfolios table
-- This column will store the selected font combination ID

ALTER TABLE user_portfolios 
ADD COLUMN font_pair TEXT DEFAULT 'montserrat-merriweather';

-- Add comment to document the column
COMMENT ON COLUMN user_portfolios.font_pair IS 'Selected font combination for portfolio typography';

-- Update existing portfolios to have the default font pair
UPDATE user_portfolios 
SET font_pair = 'montserrat-merriweather' 
WHERE font_pair IS NULL; 