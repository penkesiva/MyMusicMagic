-- Check and fix portfolio-related table issues
-- Run this in your Supabase SQL editor

-- 1. Check if portfolio_id columns exist in gallery table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'gallery' AND column_name = 'portfolio_id'
    ) THEN
        ALTER TABLE gallery ADD COLUMN portfolio_id UUID REFERENCES user_portfolios(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added portfolio_id column to gallery table';
    ELSE
        RAISE NOTICE 'portfolio_id column already exists in gallery table';
    END IF;
END $$;

-- 2. Check if portfolio_id columns exist in tracks table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'tracks' AND column_name = 'portfolio_id'
    ) THEN
        ALTER TABLE tracks ADD COLUMN portfolio_id UUID REFERENCES user_portfolios(id) ON DELETE CASCADE;
        RAISE NOTICE 'Added portfolio_id column to tracks table';
    ELSE
        RAISE NOTICE 'portfolio_id column already exists in tracks table';
    END IF;
END $$;

-- 3. Check gallery table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'gallery' 
ORDER BY ordinal_position;

-- 4. Check tracks table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'tracks' 
ORDER BY ordinal_position;

-- 5. Test insert into gallery (this will show any remaining issues)
-- Uncomment the line below to test (it will fail if there are issues, showing the exact error)
-- INSERT INTO gallery (title, image_url, media_type, date, portfolio_id) VALUES ('Test', 'https://example.com/test.jpg', 'image', CURRENT_DATE, '00000000-0000-0000-0000-000000000000');

-- Success message
SELECT 'Portfolio table check completed. Check the results above for any issues.' as status; 