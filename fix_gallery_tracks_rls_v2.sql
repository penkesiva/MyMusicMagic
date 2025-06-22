-- Fix Gallery and Tracks RLS Policies v2
-- This script fixes access control for the gallery and tracks tables.
-- Run this in your Supabase SQL Editor.

-- Drop all existing policies on gallery and tracks to avoid conflicts
DROP POLICY IF EXISTS "Public gallery items are viewable by everyone" ON public.gallery;
DROP POLICY IF EXISTS "Owners can view their own gallery items" ON public.gallery;
DROP POLICY IF EXISTS "Users can insert gallery items for their own portfolios" ON public.gallery;
DROP POLICY IF EXISTS "Users can update gallery items for their own portfolios" ON public.gallery;
DROP POLICY IF EXISTS "Users can delete gallery items for their own portfolios" ON public.gallery;

DROP POLICY IF EXISTS "Public tracks are viewable by everyone" ON public.tracks;
DROP POLICY IF EXISTS "Owners can view their own tracks" ON public.tracks;
DROP POLICY IF EXISTS "Users can insert tracks for their own portfolios" ON public.tracks;
DROP POLICY IF EXISTS "Users can update tracks for their own portfolios" ON public.tracks;
DROP POLICY IF EXISTS "Users can delete tracks for their own portfolios" ON public.tracks;


-- =========
--  GALLERY
-- =========

-- 1. SELECT Policy: Anyone can view any gallery item.
-- This is for the public-facing portfolio page.
CREATE POLICY "Public gallery items are viewable by everyone"
ON public.gallery FOR SELECT
USING (true);

-- 2. INSERT Policy: Users can insert gallery items into their own portfolios.
CREATE POLICY "Users can insert gallery items for their own portfolios"
ON public.gallery FOR INSERT
WITH CHECK (
  auth.uid() = (SELECT user_id FROM public.user_portfolios WHERE id = portfolio_id)
);

-- 3. UPDATE Policy: Users can update gallery items in their own portfolios.
CREATE POLICY "Users can update gallery items for their own portfolios"
ON public.gallery FOR UPDATE
USING (
  auth.uid() = (SELECT user_id FROM public.user_portfolios WHERE id = portfolio_id)
);

-- 4. DELETE Policy: Users can delete gallery items from their own portfolios.
CREATE POLICY "Users can delete gallery items for their own portfolios"
ON public.gallery FOR DELETE
USING (
  auth.uid() = (SELECT user_id FROM public.user_portfolios WHERE id = portfolio_id)
);


-- =========
--  TRACKS
-- =========

-- 1. SELECT Policy (Public): Anyone can view tracks that are marked as published.
CREATE POLICY "Public tracks are viewable by everyone"
ON public.tracks FOR SELECT
USING (is_published = true);

-- 2. SELECT Policy (Owner): The owner of a portfolio can view all their tracks, even if unpublished.
-- This is crucial for the portfolio editor.
CREATE POLICY "Owners can view their own tracks"
ON public.tracks FOR SELECT
USING (
  auth.uid() = (SELECT user_id FROM public.user_portfolios WHERE id = portfolio_id)
);

-- 3. INSERT Policy: Users can insert tracks into their own portfolios.
CREATE POLICY "Users can insert tracks for their own portfolios"
ON public.tracks FOR INSERT
WITH CHECK (
  auth.uid() = (SELECT user_id FROM public.user_portfolios WHERE id = portfolio_id)
);

-- 4. UPDATE Policy: Users can update tracks in their own portfolios.
CREATE POLICY "Users can update tracks for their own portfolios"
ON public.tracks FOR UPDATE
USING (
  auth.uid() = (SELECT user_id FROM public.user_portfolios WHERE id = portfolio_id)
);

-- 5. DELETE Policy: Users can delete tracks from their own portfolios.
CREATE POLICY "Users can delete tracks for their own portfolios"
ON public.tracks FOR DELETE
USING (
  auth.uid() = (SELECT user_id FROM public.user_portfolios WHERE id = portfolio_id)
);


-- Final success message
SELECT 'Gallery and Tracks RLS policies have been successfully updated.' as status; 