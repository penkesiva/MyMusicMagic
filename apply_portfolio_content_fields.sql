-- Apply portfolio content fields migration
-- Run this in your Supabase SQL editor

-- Add content fields to user_portfolios table
ALTER TABLE user_portfolios 
ADD COLUMN IF NOT EXISTS subtitle TEXT,
ADD COLUMN IF NOT EXISTS hero_image_url TEXT,
ADD COLUMN IF NOT EXISTS about_title TEXT DEFAULT 'About Me',
ADD COLUMN IF NOT EXISTS about_text TEXT,
ADD COLUMN IF NOT EXISTS profile_photo_url TEXT,
ADD COLUMN IF NOT EXISTS instagram_url TEXT,
ADD COLUMN IF NOT EXISTS twitter_url TEXT,
ADD COLUMN IF NOT EXISTS youtube_url TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS website_url TEXT,
ADD COLUMN IF NOT EXISTS testimonials_title TEXT DEFAULT 'What People Say',
ADD COLUMN IF NOT EXISTS testimonials_json JSONB,
ADD COLUMN IF NOT EXISTS blog_title TEXT DEFAULT 'Post Me',
ADD COLUMN IF NOT EXISTS blog_description TEXT DEFAULT 'Share your musical thoughts',
ADD COLUMN IF NOT EXISTS blog_posts_json JSONB,
ADD COLUMN IF NOT EXISTS news_title TEXT DEFAULT 'What''s New',
ADD COLUMN IF NOT EXISTS news_items_json JSONB,
ADD COLUMN IF NOT EXISTS skills_title TEXT DEFAULT 'Tech Skills',
ADD COLUMN IF NOT EXISTS skills_json JSONB,
ADD COLUMN IF NOT EXISTS status_title TEXT DEFAULT 'What am I looking for',
ADD COLUMN IF NOT EXISTS current_status TEXT DEFAULT 'available',
ADD COLUMN IF NOT EXISTS status_description TEXT,
ADD COLUMN IF NOT EXISTS ai_advantage_title TEXT DEFAULT 'Things I can do better than AI',
ADD COLUMN IF NOT EXISTS ai_advantages_json JSONB,
ADD COLUMN IF NOT EXISTS contact_title TEXT DEFAULT 'Get in Touch',
ADD COLUMN IF NOT EXISTS contact_description TEXT DEFAULT 'Ready to work together? Let''s talk!',
ADD COLUMN IF NOT EXISTS contact_email TEXT,
ADD COLUMN IF NOT EXISTS contact_phone TEXT,
ADD COLUMN IF NOT EXISTS contact_location TEXT,
ADD COLUMN IF NOT EXISTS footer_text TEXT,
ADD COLUMN IF NOT EXISTS footer_links_json JSONB;

-- Add comments for documentation
COMMENT ON COLUMN user_portfolios.subtitle IS 'Hero section subtitle/tagline';
COMMENT ON COLUMN user_portfolios.hero_image_url IS 'Background image URL for hero section';
COMMENT ON COLUMN user_portfolios.about_title IS 'Title for the about section';
COMMENT ON COLUMN user_portfolios.about_text IS 'Main about section content';
COMMENT ON COLUMN user_portfolios.profile_photo_url IS 'Profile photo URL for about section';
COMMENT ON COLUMN user_portfolios.testimonials_json IS 'JSON array of testimonials with name, role, text, rating';
COMMENT ON COLUMN user_portfolios.blog_posts_json IS 'JSON array of blog posts with title, content, date';
COMMENT ON COLUMN user_portfolios.news_items_json IS 'JSON array of news items with title, content, date';
COMMENT ON COLUMN user_portfolios.skills_json IS 'JSON array of skills with name and level (0-100)';
COMMENT ON COLUMN user_portfolios.current_status IS 'Current availability status: available, busy, hiring, collaborating';
COMMENT ON COLUMN user_portfolios.ai_advantages_json IS 'JSON array of AI advantages with title and description';
COMMENT ON COLUMN user_portfolios.footer_links_json IS 'JSON array of footer links with title and url';

-- Success message
SELECT 'Portfolio content fields migration applied successfully!' as status; 