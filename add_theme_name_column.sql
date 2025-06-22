-- ===================================================================
--  ADD THEME SELECTION TO PORTFOLIOS
-- ===================================================================
--  This script adds a new 'theme_name' column to the 'user_portfolios'
--  table to store the selected theme for each portfolio.
--
--  It is safe to run this script multiple times.
-- ===================================================================

DO $$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'user_portfolios' AND column_name = 'theme_name') THEN
    -- Add the column with a default value
    ALTER TABLE public.user_portfolios ADD COLUMN theme_name TEXT DEFAULT 'Midnight Dusk';
    RAISE NOTICE 'SUCCESS: Column theme_name added to user_portfolios table.';
  ELSE
    RAISE NOTICE 'INFO: Column theme_name already exists in user_portfolios table.';
  END IF;
END $$;

SELECT 'SUCCESS: Migration for theme_name column is complete.' as status; 