-- Add missing columns to user_portfolios table
-- Based on the Portfolio type definition

-- Hobbies section
ALTER TABLE user_portfolios 
ADD COLUMN IF NOT EXISTS hobbies_title TEXT,
ADD COLUMN IF NOT EXISTS hobbies_json JSONB;

-- Skills section  
ALTER TABLE user_portfolios 
ADD COLUMN IF NOT EXISTS skills_title TEXT,
ADD COLUMN IF NOT EXISTS skills_json JSONB;

-- Press section
ALTER TABLE user_portfolios 
ADD COLUMN IF NOT EXISTS press_title TEXT,
ADD COLUMN IF NOT EXISTS press_json JSONB;

-- Key Projects section
ALTER TABLE user_portfolios 
ADD COLUMN IF NOT EXISTS key_projects_title TEXT,
ADD COLUMN IF NOT EXISTS key_projects_json JSONB;

-- Resume section
ALTER TABLE user_portfolios 
ADD COLUMN IF NOT EXISTS resume_title TEXT;

-- Hero section (if missing)
ALTER TABLE user_portfolios 
ADD COLUMN IF NOT EXISTS hero_title TEXT,
ADD COLUMN IF NOT EXISTS hero_subtitle TEXT,
ADD COLUMN IF NOT EXISTS hero_cta_text TEXT,
ADD COLUMN IF NOT EXISTS hero_cta_link TEXT;

-- Footer section
ALTER TABLE user_portfolios 
ADD COLUMN IF NOT EXISTS footer_about_summary TEXT,
ADD COLUMN IF NOT EXISTS footer_links_json JSONB,
ADD COLUMN IF NOT EXISTS footer_social_links_json JSONB,
ADD COLUMN IF NOT EXISTS footer_copyright_text TEXT,
ADD COLUMN IF NOT EXISTS footer_show_social_links BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS footer_show_about_summary BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS footer_show_links BOOLEAN DEFAULT true;

-- Other missing fields
ALTER TABLE user_portfolios 
ADD COLUMN IF NOT EXISTS artist_name TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS seo_title TEXT,
ADD COLUMN IF NOT EXISTS seo_description TEXT,
ADD COLUMN IF NOT EXISTS github_url TEXT; 