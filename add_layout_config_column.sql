-- Add layout_config column to user_portfolios table
-- This column will store the layout configuration for the portfolio editor

ALTER TABLE user_portfolios 
ADD COLUMN layout_config JSONB DEFAULT NULL;

-- Add comment to document the column
COMMENT ON COLUMN user_portfolios.layout_config IS 'JSON configuration for portfolio layout editor including section positions, sizes, and visibility settings';

-- Create index for better query performance
CREATE INDEX idx_user_portfolios_layout_config ON user_portfolios USING GIN (layout_config); 