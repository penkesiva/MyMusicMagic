-- Enable Resume Section for Portfolio
-- This script enables the resume section for the portfolio with slug 'mm1'

UPDATE user_portfolios 
SET sections_config = jsonb_set(
  COALESCE(sections_config, '{}'::jsonb),
  '{resume}',
  '{"enabled": true, "name": "Resume", "order": 9}'::jsonb
)
WHERE slug = 'mm1';

-- Verify the update
SELECT 
  name,
  slug,
  sections_config->'resume' as resume_section_config
FROM user_portfolios 
WHERE slug = 'mm1'; 