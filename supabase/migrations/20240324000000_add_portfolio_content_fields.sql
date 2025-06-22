-- Add content fields to user_portfolios table
ALTER TABLE user_portfolios 
ADD COLUMN subtitle TEXT,
ADD COLUMN hero_image_url TEXT,
ADD COLUMN about_title TEXT DEFAULT 'About Me',
ADD COLUMN about_text TEXT,
ADD COLUMN profile_photo_url TEXT,
ADD COLUMN instagram_url TEXT,
ADD COLUMN twitter_url TEXT,
ADD COLUMN youtube_url TEXT,
ADD COLUMN linkedin_url TEXT,
ADD COLUMN website_url TEXT,
ADD COLUMN testimonials_title TEXT DEFAULT 'What People Say',
ADD COLUMN testimonials_json JSONB,
ADD COLUMN blog_title TEXT DEFAULT 'Post Me',
ADD COLUMN blog_description TEXT DEFAULT 'Share your musical thoughts',
ADD COLUMN blog_posts_json JSONB,
ADD COLUMN news_title TEXT DEFAULT 'What''s New',
ADD COLUMN news_items_json JSONB,
ADD COLUMN skills_title TEXT DEFAULT 'Tech Skills',
ADD COLUMN skills_json JSONB,
ADD COLUMN status_title TEXT DEFAULT 'What am I looking for',
ADD COLUMN current_status TEXT DEFAULT 'available',
ADD COLUMN status_description TEXT,
ADD COLUMN ai_advantage_title TEXT DEFAULT 'Things I can do better than AI',
ADD COLUMN ai_advantages_json JSONB,
ADD COLUMN contact_title TEXT DEFAULT 'Get in Touch',
ADD COLUMN contact_description TEXT DEFAULT 'Ready to work together? Let''s talk!',
ADD COLUMN contact_email TEXT,
ADD COLUMN contact_phone TEXT,
ADD COLUMN contact_location TEXT,
ADD COLUMN footer_text TEXT,
ADD COLUMN footer_links_json JSONB;

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