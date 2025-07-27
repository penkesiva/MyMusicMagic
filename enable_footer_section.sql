-- Add Footer Section to ux-dude portfolio specifically
-- This avoids trigger conflicts by targeting one portfolio at a time

-- Add footer section to ux-dude portfolio
UPDATE user_portfolios 
SET sections_config = sections_config || '{"footer": {"enabled": true, "order": 16, "name": "Footer"}}'::jsonb
WHERE name = 'ux-dude';

-- Verify the update
SELECT 
  id,
  name,
  sections_config->'footer' as footer_config
FROM user_portfolios 
WHERE name = 'ux-dude'; 