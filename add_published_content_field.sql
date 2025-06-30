-- Add published_content field to store the last published version
ALTER TABLE user_portfolios 
ADD COLUMN published_content JSONB;

-- Add a comment to explain the field
COMMENT ON COLUMN user_portfolios.published_content IS 'Stores a snapshot of the last published version of the portfolio content. Used to separate draft changes from published content.';

-- Create an index on published_content for better query performance
CREATE INDEX idx_user_portfolios_published_content ON user_portfolios USING GIN (published_content); 