-- Enable Footer Section for All Existing Portfolios
-- This script ensures all portfolios have the footer section enabled by default

-- First, let's see the current state
SELECT 
  id,
  name,
  sections_config->'footer' as footer_config,
  CASE 
    WHEN sections_config IS NULL THEN 'no_config'
    WHEN sections_config->'footer' IS NULL THEN 'no_footer'
    WHEN (sections_config->'footer'->>'enabled')::boolean = true THEN 'enabled'
    ELSE 'disabled'
  END as footer_status
FROM user_portfolios
ORDER BY name;

-- Update portfolios with no sections_config
UPDATE user_portfolios
SET sections_config = COALESCE(sections_config, '{}'::jsonb) || '{"footer": {"enabled": true, "order": 99, "name": "Footer"}}'::jsonb
WHERE sections_config IS NULL;

-- Update portfolios with sections_config but no footer
UPDATE user_portfolios
SET sections_config = sections_config || '{"footer": {"enabled": true, "order": 99, "name": "Footer"}}'::jsonb
WHERE sections_config IS NOT NULL 
  AND sections_config->'footer' IS NULL;

-- Update portfolios with disabled footer
UPDATE user_portfolios
SET sections_config = jsonb_set(
  sections_config,
  '{footer,enabled}',
  'true'::jsonb
)
WHERE sections_config->'footer'->>'enabled' = 'false';

-- Verify the updates
SELECT 
  id,
  name,
  sections_config->'footer' as footer_config,
  CASE 
    WHEN sections_config IS NULL THEN 'no_config'
    WHEN sections_config->'footer' IS NULL THEN 'no_footer'
    WHEN (sections_config->'footer'->>'enabled')::boolean = true THEN 'enabled'
    ELSE 'disabled'
  END as footer_status
FROM user_portfolios
ORDER BY name; 