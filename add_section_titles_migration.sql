-- ===================================================================
--  ADD SECTION TITLES MIGRATION
-- ===================================================================
--  This script adds title fields to the sections_config for all
--  sections that support custom titles. It initializes them with
--  the default names from SECTIONS_CONFIG.
--
--  It is safe to run this script multiple times.
-- ===================================================================

-- Update sections_config to include title fields for sections that support them
UPDATE user_portfolios 
SET sections_config = jsonb_set(
  COALESCE(sections_config, '{}'::jsonb),
  '{about}',
  COALESCE(
    jsonb_set(
      sections_config->'about',
      '{title}',
      COALESCE(sections_config->'about'->>'title', '"About Me"')::jsonb
    ),
    '{"enabled": true, "name": "About Me", "order": 1, "title": "About Me"}'::jsonb
  )
)
WHERE sections_config IS NULL OR sections_config->'about' IS NULL OR sections_config->'about'->>'title' IS NULL;

UPDATE user_portfolios 
SET sections_config = jsonb_set(
  COALESCE(sections_config, '{}'::jsonb),
  '{tracks}',
  COALESCE(
    jsonb_set(
      sections_config->'tracks',
      '{title}',
      COALESCE(sections_config->'tracks'->>'title', '"Tracks"')::jsonb
    ),
    '{"enabled": true, "name": "Tracks", "order": 2, "title": "Tracks"}'::jsonb
  )
)
WHERE sections_config IS NULL OR sections_config->'tracks' IS NULL OR sections_config->'tracks'->>'title' IS NULL;

UPDATE user_portfolios 
SET sections_config = jsonb_set(
  COALESCE(sections_config, '{}'::jsonb),
  '{gallery}',
  COALESCE(
    jsonb_set(
      sections_config->'gallery',
      '{title}',
      COALESCE(sections_config->'gallery'->>'title', '"Photo Gallery"')::jsonb
    ),
    '{"enabled": true, "name": "Photo Gallery", "order": 3, "title": "Photo Gallery"}'::jsonb
  )
)
WHERE sections_config IS NULL OR sections_config->'gallery' IS NULL OR sections_config->'gallery'->>'title' IS NULL;

UPDATE user_portfolios 
SET sections_config = jsonb_set(
  COALESCE(sections_config, '{}'::jsonb),
  '{press}',
  COALESCE(
    jsonb_set(
      sections_config->'press',
      '{title}',
      COALESCE(sections_config->'press'->>'title', '"Press & Media"')::jsonb
    ),
    '{"enabled": true, "name": "Press & Media", "order": 4, "title": "Press & Media"}'::jsonb
  )
)
WHERE sections_config IS NULL OR sections_config->'press' IS NULL OR sections_config->'press'->>'title' IS NULL;

UPDATE user_portfolios 
SET sections_config = jsonb_set(
  COALESCE(sections_config, '{}'::jsonb),
  '{key_projects}',
  COALESCE(
    jsonb_set(
      sections_config->'key_projects',
      '{title}',
      COALESCE(sections_config->'key_projects'->>'title', '"Key Projects"')::jsonb
    ),
    '{"enabled": true, "name": "Key Projects", "order": 5, "title": "Key Projects"}'::jsonb
  )
)
WHERE sections_config IS NULL OR sections_config->'key_projects' IS NULL OR sections_config->'key_projects'->>'title' IS NULL;

UPDATE user_portfolios 
SET sections_config = jsonb_set(
  COALESCE(sections_config, '{}'::jsonb),
  '{testimonials}',
  COALESCE(
    jsonb_set(
      sections_config->'testimonials',
      '{title}',
      COALESCE(sections_config->'testimonials'->>'title', '"Testimonials"')::jsonb
    ),
    '{"enabled": false, "name": "Testimonials", "order": 6, "title": "Testimonials"}'::jsonb
  )
)
WHERE sections_config IS NULL OR sections_config->'testimonials' IS NULL OR sections_config->'testimonials'->>'title' IS NULL;

UPDATE user_portfolios 
SET sections_config = jsonb_set(
  COALESCE(sections_config, '{}'::jsonb),
  '{blog}',
  COALESCE(
    jsonb_set(
      sections_config->'blog',
      '{title}',
      COALESCE(sections_config->'blog'->>'title', '"Blog"')::jsonb
    ),
    '{"enabled": false, "name": "Blog", "order": 8, "title": "Blog"}'::jsonb
  )
)
WHERE sections_config IS NULL OR sections_config->'blog' IS NULL OR sections_config->'blog'->>'title' IS NULL;

UPDATE user_portfolios 
SET sections_config = jsonb_set(
  COALESCE(sections_config, '{}'::jsonb),
  '{status}',
  COALESCE(
    jsonb_set(
      sections_config->'status',
      '{title}',
      COALESCE(sections_config->'status'->>'title', '"What I\'m Working On"')::jsonb
    ),
    '{"enabled": false, "name": "What I\'m Working On", "order": 9, "title": "What I\'m Working On"}'::jsonb
  )
)
WHERE sections_config IS NULL OR sections_config->'status' IS NULL OR sections_config->'status'->>'title' IS NULL;

UPDATE user_portfolios 
SET sections_config = jsonb_set(
  COALESCE(sections_config, '{}'::jsonb),
  '{skills}',
  COALESCE(
    jsonb_set(
      sections_config->'skills',
      '{title}',
      COALESCE(sections_config->'skills'->>'title', '"Skills & Tools"')::jsonb
    ),
    '{"enabled": true, "name": "Skills & Tools", "order": 6, "title": "Skills & Tools"}'::jsonb
  )
)
WHERE sections_config IS NULL OR sections_config->'skills' IS NULL OR sections_config->'skills'->>'title' IS NULL;

UPDATE user_portfolios 
SET sections_config = jsonb_set(
  COALESCE(sections_config, '{}'::jsonb),
  '{resume}',
  COALESCE(
    jsonb_set(
      sections_config->'resume',
      '{title}',
      COALESCE(sections_config->'resume'->>'title', '"Resume"')::jsonb
    ),
    '{"enabled": true, "name": "Resume", "order": 9, "title": "Resume"}'::jsonb
  )
)
WHERE sections_config IS NULL OR sections_config->'resume' IS NULL OR sections_config->'resume'->>'title' IS NULL;

UPDATE user_portfolios 
SET sections_config = jsonb_set(
  COALESCE(sections_config, '{}'::jsonb),
  '{hobbies}',
  COALESCE(
    jsonb_set(
      sections_config->'hobbies',
      '{title}',
      COALESCE(sections_config->'hobbies'->>'title', '"Hobbies"')::jsonb
    ),
    '{"enabled": true, "name": "Hobbies", "order": 7, "title": "Hobbies"}'::jsonb
  )
)
WHERE sections_config IS NULL OR sections_config->'hobbies' IS NULL OR sections_config->'hobbies'->>'title' IS NULL;

UPDATE user_portfolios 
SET sections_config = jsonb_set(
  COALESCE(sections_config, '{}'::jsonb),
  '{contact}',
  COALESCE(
    jsonb_set(
      sections_config->'contact',
      '{title}',
      COALESCE(sections_config->'contact'->>'title', '"Contact Me"')::jsonb
    ),
    '{"enabled": true, "name": "Contact Me", "order": 9, "title": "Contact Me"}'::jsonb
  )
)
WHERE sections_config IS NULL OR sections_config->'contact' IS NULL OR sections_config->'contact'->>'title' IS NULL;

-- Verify the migration
SELECT 
    'SUCCESS: Section titles migration completed.' as status,
    COUNT(*) as portfolios_updated
FROM user_portfolios 
WHERE sections_config IS NOT NULL;

-- Show sample of updated sections_config
SELECT 
    id,
    name,
    sections_config->'about'->>'title' as about_title,
    sections_config->'tracks'->>'title' as tracks_title,
    sections_config->'gallery'->>'title' as gallery_title,
    sections_config->'press'->>'title' as press_title
FROM user_portfolios 
LIMIT 5; 