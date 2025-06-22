-- Comprehensive Schema and RLS Fix for Gallery and Tracks
-- This script ensures required columns exist and then applies the correct RLS policies.
-- Run this in your Supabase SQL Editor. It is safe to run multiple times.

-- =========
--  SCHEMA FIXES
-- =========

-- 1. Ensure 'portfolio_id' column exists on the 'gallery' table.
DO $$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'gallery' AND column_name = 'portfolio_id') THEN
    ALTER TABLE public.gallery ADD COLUMN portfolio_id UUID REFERENCES public.user_portfolios(id) ON DELETE SET NULL;
    RAISE NOTICE 'Column portfolio_id added to gallery table.';
  ELSE
    RAISE NOTICE 'Column portfolio_id already exists in gallery table.';
  END IF;
END $$;

-- 2. Ensure 'portfolio_id' column exists on the 'tracks' table.
DO $$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'tracks' AND column_name = 'portfolio_id') THEN
    ALTER TABLE public.tracks ADD COLUMN portfolio_id UUID REFERENCES public.user_portfolios(id) ON DELETE SET NULL;
    RAISE NOTICE 'Column portfolio_id added to tracks table.';
  ELSE
    RAISE NOTICE 'Column portfolio_id already exists in tracks table.';
  END IF;
END $$;

-- 3. Ensure 'is_published' column exists on the 'tracks' table (for the public-facing page).
DO $$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'tracks' AND column_name = 'is_published') THEN
    ALTER TABLE public.tracks ADD COLUMN is_published BOOLEAN DEFAULT FALSE NOT NULL;
    RAISE NOTICE 'Column is_published added to tracks table.';
  ELSE
    RAISE NOTICE 'Column is_published already exists in tracks table.';
  END IF;
END $$;


-- =========
--  RLS FIXES
-- =========

-- Drop all possible old policies on gallery and tracks to avoid conflicts
DROP POLICY IF EXISTS "Public gallery items are viewable by everyone" ON public.gallery;
DROP POLICY IF EXISTS "Owners can view their own gallery items" ON public.gallery;
DROP POLICY IF EXISTS "Users can insert gallery items for their own portfolios" ON public.gallery;
DROP POLICY IF EXISTS "Users can update gallery items for their own portfolios" ON public.gallery;
DROP POLICY IF EXISTS "Users can delete gallery items for their own portfolios" ON public.gallery;
DROP POLICY IF EXISTS "Gallery is viewable by everyone" ON public.gallery;
DROP POLICY IF EXISTS "Gallery is insertable by authenticated users" ON public.gallery;
DROP POLICY IF EXISTS "Gallery is updatable by authenticated users" ON public.gallery;
DROP POLICY IF EXISTS "Gallery is deletable by authenticated users" ON public.gallery;
DROP POLICY IF EXISTS "Gallery is insertable by portfolio owners" ON public.gallery;
DROP POLICY IF EXISTS "Gallery is updatable by portfolio owners" ON public.gallery;
DROP POLICY IF EXISTS "Gallery is deletable by portfolio owners" ON public.gallery;

DROP POLICY IF EXISTS "Public tracks are viewable by everyone" ON public.tracks;
DROP POLICY IF EXISTS "Owners can view their own tracks" ON public.tracks;
DROP POLICY IF EXISTS "Users can insert tracks for their own portfolios" ON public.tracks;
DROP POLICY IF EXISTS "Users can update tracks for their own portfolios" ON public.tracks;
DROP POLICY IF EXISTS "Users can delete tracks for their own portfolios" ON public.tracks;
DROP POLICY IF EXISTS "Tracks are viewable by everyone when published" ON public.tracks;
DROP POLICY IF EXISTS "Users can insert their own tracks" ON public.tracks;
DROP POLICY IF EXISTS "Users can update their own tracks" ON public.tracks;
DROP POLICY IF EXISTS "Users can delete their own tracks" ON public.tracks;
DROP POLICY IF EXISTS "Tracks are viewable by portfolio owners" ON public.tracks;
DROP POLICY IF EXISTS "Tracks are insertable by portfolio owners" ON public.tracks;
DROP POLICY IF EXISTS "Tracks are updatable by portfolio owners" ON public.tracks;
DROP POLICY IF EXISTS "Tracks are deletable by portfolio owners" ON public.tracks;

-- =========
--  GALLERY RLS
-- =========

CREATE POLICY "Public gallery items are viewable by everyone"
ON public.gallery FOR SELECT USING (true);

CREATE POLICY "Users can insert gallery items for their own portfolios"
ON public.gallery FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM public.user_portfolios WHERE id = portfolio_id));

CREATE POLICY "Users can update gallery items for their own portfolios"
ON public.gallery FOR UPDATE USING (auth.uid() = (SELECT user_id FROM public.user_portfolios WHERE id = portfolio_id))
WITH CHECK (auth.uid() = (SELECT user_id FROM public.user_portfolios WHERE id = portfolio_id));

CREATE POLICY "Users can delete gallery items for their own portfolios"
ON public.gallery FOR DELETE USING (auth.uid() = (SELECT user_id FROM public.user_portfolios WHERE id = portfolio_id));

-- =========
--  TRACKS RLS
-- =========

CREATE POLICY "Public tracks are viewable by everyone"
ON public.tracks FOR SELECT USING (is_published = true);

CREATE POLICY "Owners can view their own tracks"
ON public.tracks FOR SELECT USING (auth.uid() = (SELECT user_id FROM public.user_portfolios WHERE id = portfolio_id));

CREATE POLICY "Users can insert tracks for their own portfolios"
ON public.tracks FOR INSERT WITH CHECK (auth.uid() = (SELECT user_id FROM public.user_portfolios WHERE id = portfolio_id));

CREATE POLICY "Users can update tracks for their own portfolios"
ON public.tracks FOR UPDATE USING (auth.uid() = (SELECT user_id FROM public.user_portfolios WHERE id = portfolio_id))
WITH CHECK (auth.uid() = (SELECT user_id FROM public.user_portfolios WHERE id = portfolio_id));

CREATE POLICY "Users can delete tracks for their own portfolios"
ON public.tracks FOR DELETE USING (auth.uid() = (SELECT user_id FROM public.user_portfolios WHERE id = portfolio_id));

-- Final success message
SELECT 'Schema and RLS policies for Gallery and Tracks have been successfully updated.' as status; 