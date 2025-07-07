-- Add font_pair column to user_portfolios table
-- This column stores the selected font combination

ALTER TABLE user_portfolios ADD COLUMN IF NOT EXISTS font_pair TEXT DEFAULT 'montserrat-merriweather';

-- Success message
SELECT 'Font pair column added successfully!' as status; 