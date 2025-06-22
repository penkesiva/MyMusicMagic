-- Add portfolio_id to gallery and tracks tables
-- Run this in your Supabase SQL editor

-- Add portfolio_id to gallery table
ALTER TABLE gallery 
ADD COLUMN IF NOT EXISTS portfolio_id UUID REFERENCES user_portfolios(id) ON DELETE CASCADE;

-- Add portfolio_id to tracks table
ALTER TABLE tracks 
ADD COLUMN IF NOT EXISTS portfolio_id UUID REFERENCES user_portfolios(id) ON DELETE CASCADE;

-- Add comments for documentation
COMMENT ON COLUMN gallery.portfolio_id IS 'Reference to the portfolio this gallery item belongs to';
COMMENT ON COLUMN tracks.portfolio_id IS 'Reference to the portfolio this track belongs to';

-- Success message
SELECT 'Portfolio ID fields added to gallery and tracks tables successfully!' as status; 