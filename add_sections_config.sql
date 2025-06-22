-- ===================================================================
--  ADD SECTIONS CONFIGURATION TO PORTFOLIOS
-- ===================================================================
--  This script adds a new 'sections_config' column to the
--  'user_portfolios' table to store the enabled/disabled state
--  and order of the various portfolio sections.
--
--  It is safe to run this script multiple times.
-- ===================================================================

DO $$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'user_portfolios' AND column_name = 'sections_config') THEN
    ALTER TABLE public.user_portfolios ADD COLUMN sections_config JSONB;
    RAISE NOTICE 'SUCCESS: Column sections_config added to user_portfolios table.';
  ELSE
    RAISE NOTICE 'INFO: Column sections_config already exists in user_portfolios table.';
  END IF;
END $$;

SELECT 'SUCCESS: Migration for sections_config column is complete.' as status; 