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

-- Verify the columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_portfolios' 
AND column_name IN (
  'hobbies_title', 'hobbies_json', 'skills_title', 'skills_json',
  'press_title', 'press_json', 'key_projects_title', 'key_projects_json',
  'resume_title', 'hero_title', 'hero_subtitle', 'hero_cta_text', 'hero_cta_link',
  'footer_about_summary', 'footer_links_json', 'footer_social_links_json',
  'footer_copyright_text', 'footer_show_social_links', 'footer_show_about_summary',
  'footer_show_links', 'artist_name', 'bio', 'seo_title', 'seo_description', 'github_url'
)
ORDER BY column_name; 