-- Migration to add audio_player_mode to tracks section configuration
-- This sets the default to show audio player (bottom mode) for existing portfolios

-- Update existing portfolio sections_config to include audio_player_mode for tracks
UPDATE user_portfolios 
SET sections_config = jsonb_set(
  COALESCE(sections_config, '{}'::jsonb),
  '{tracks,audio_player_mode}',
  '"bottom"'
)
WHERE sections_config IS NOT NULL 
  AND sections_config ? 'tracks';

-- For portfolios that don't have tracks section configured yet, add it
UPDATE user_portfolios 
SET sections_config = COALESCE(sections_config, '{}'::jsonb) || 
  '{"tracks": {"audio_player_mode": "bottom"}}'::jsonb
WHERE sections_config IS NULL 
   OR NOT (sections_config ? 'tracks');

-- Verify the migration
SELECT 
  id,
  name,
  sections_config->'tracks'->'audio_player_mode' as show_audio_player
FROM user_portfolios 
WHERE sections_config IS NOT NULL; 