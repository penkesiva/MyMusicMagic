-- Add sponsors fields to user_portfolios table
-- This migration adds fields for the new Sponsors section

-- Add sponsors_title column
ALTER TABLE user_portfolios 
ADD COLUMN IF NOT EXISTS sponsors_title TEXT;

-- Add sponsors_json column
ALTER TABLE user_portfolios 
ADD COLUMN IF NOT EXISTS sponsors_json JSONB DEFAULT '[]'::jsonb;

-- Add sponsors fields to published_content if it exists
DO $$
BEGIN
    -- Check if published_content column exists
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_portfolios' 
        AND column_name = 'published_content'
    ) THEN
        -- Update existing published_content to include sponsors fields
        UPDATE user_portfolios 
        SET published_content = COALESCE(published_content, '{}'::jsonb) || 
            jsonb_build_object(
                'sponsors_title', COALESCE(sponsors_title, ''),
                'sponsors_json', COALESCE(sponsors_json, '[]'::jsonb)
            )
        WHERE published_content IS NOT NULL;
    END IF;
END $$;

-- Add comments for documentation
COMMENT ON COLUMN user_portfolios.sponsors_title IS 'Custom title for the sponsors section';
COMMENT ON COLUMN user_portfolios.sponsors_json IS 'JSON array of sponsor objects with name, description, icon_url, website_url, and order fields';

-- Verify the changes
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_portfolios' 
AND column_name IN ('sponsors_title', 'sponsors_json')
ORDER BY column_name; 