-- Create Test Portfolio
-- Run this in your Supabase SQL editor after running the debug script

-- First, let's get your user ID (replace with your actual user ID if you know it)
-- You can find your user ID in the debug results above
DO $$
DECLARE
    user_uuid UUID;
BEGIN
    -- Get the first user (you can replace this with your specific user ID)
    SELECT id INTO user_uuid FROM user_profiles LIMIT 1;
    
    IF user_uuid IS NOT NULL THEN
        -- Create a test portfolio
        INSERT INTO user_portfolios (
            user_id,
            name,
            slug,
            is_published,
            is_default,
            subtitle,
            about_title,
            about_text
        ) VALUES (
            user_uuid,
            'My Test Portfolio',
            'test',
            true,  -- Make it published
            true,  -- Make it default
            'A test portfolio for debugging',
            'About Me',
            'This is a test portfolio to verify everything is working correctly.'
        ) ON CONFLICT (slug) DO UPDATE SET
            is_published = true,
            updated_at = NOW();
            
        RAISE NOTICE 'Test portfolio created/updated for user: %', user_uuid;
    ELSE
        RAISE NOTICE 'No users found. Please create a user profile first.';
    END IF;
END $$;

-- Verify the test portfolio was created
SELECT 
    'Test Portfolio Created:' as status,
    id,
    name,
    slug,
    user_id,
    is_published,
    is_default,
    created_at
FROM user_portfolios 
WHERE slug = 'test'; 