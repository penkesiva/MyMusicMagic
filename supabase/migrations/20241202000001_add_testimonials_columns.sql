-- Add testimonials columns to user_portfolios table
ALTER TABLE user_portfolios 
ADD COLUMN IF NOT EXISTS testimonials_title TEXT,
ADD COLUMN IF NOT EXISTS testimonials_json JSONB DEFAULT '[]'::jsonb;

-- Add testimonials section to sections_config if it doesn't exist
UPDATE user_portfolios 
SET sections_config = COALESCE(sections_config, '{}'::jsonb) || 
  '{"testimonials": {"enabled": true, "name": "Testimonials", "order": 6}}'::jsonb
WHERE NOT (sections_config ? 'testimonials');

-- Update existing portfolios to enable testimonials section
UPDATE user_portfolios 
SET sections_config = sections_config || 
  '{"testimonials": {"enabled": true, "name": "Testimonials", "order": 6}}'::jsonb
WHERE sections_config ? 'testimonials' AND NOT (sections_config->'testimonials' ? 'enabled');

-- Add some sample testimonials for testing
UPDATE user_portfolios 
SET testimonials_json = '[
  {
    "id": "1",
    "name": "Sarah Johnson",
    "role": "Music Producer",
    "company": "Studio Records",
    "content": "Working with this artist was an absolute pleasure. Their creativity and attention to detail brought our project to life in ways I never expected.",
    "image_url": "",
    "rating": 5
  },
  {
    "id": "2", 
    "name": "Michael Chen",
    "role": "A&R Director",
    "company": "Global Music",
    "content": "Exceptional talent and professionalism. This artist consistently delivers high-quality work that exceeds expectations.",
    "image_url": "",
    "rating": 5
  },
  {
    "id": "3",
    "name": "Emma Rodriguez",
    "role": "Event Coordinator",
    "company": "Live Events Co",
    "content": "The performance was absolutely incredible. The audience was captivated from start to finish. Highly recommended!",
    "image_url": "",
    "rating": 5
  }
]'::jsonb
WHERE testimonials_json IS NULL OR testimonials_json = '[]'::jsonb; 