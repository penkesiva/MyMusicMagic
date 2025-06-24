# 🚀 Theme Name Column Migration

## Problem
The `theme_name` column is missing from the `user_portfolios` table, causing errors when trying to save portfolio themes.

## Solution
Run the following SQL in your Supabase SQL Editor:

### Step 1: Go to Supabase Dashboard
1. Open your Supabase project dashboard
2. Navigate to the **SQL Editor** section
3. Click **New Query**

### Step 2: Run the Migration
Copy and paste this SQL:

```sql
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
```

### Step 3: Verify the Migration
After running the migration, you can verify it worked by running:

```sql
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'user_portfolios' AND column_name = 'theme_name';
```

## Expected Result
You should see a success message and the `theme_name` column will be added to your `user_portfolios` table with a default value of 'Midnight Dusk'.

## After Migration
Once the migration is complete:
1. The Music Maestro template will work properly
2. Portfolio theme selection will save correctly
3. The error "Could not find the 'theme_name' column" will be resolved

## Alternative Quick Fix
If you want to test immediately without the migration, you can temporarily comment out the `theme_name` field in the portfolio save function in `app/dashboard/portfolio/[id]/edit/page.tsx` around line 329. 