-- =====================================================================================
--  HEROPORTFOLIO - COMPREHENSIVE SCHEMA & RLS POLICY FIX (v3)
-- =====================================================================================
--  This script resolves issues with table access (403, 406 errors) and file
--  uploads (400 errors) by correcting schema and applying all necessary RLS policies
--  for tables and Supabase Storage.
--
--  It is safe to run this script multiple times.
-- =====================================================================================


-- =========
--  STEP 1: VERIFY & FIX TABLE SCHEMAS
-- =========

-- 1.1: Ensure 'portfolio_id' column exists on the 'gallery' table.
DO $$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'gallery' AND column_name = 'portfolio_id') THEN
    ALTER TABLE public.gallery ADD COLUMN portfolio_id UUID REFERENCES public.user_portfolios(id) ON DELETE SET NULL;
    RAISE NOTICE 'SUCCESS: Column portfolio_id added to gallery table.';
  END IF;
END $$;

-- 1.2: Ensure 'portfolio_id' column exists on the 'tracks' table.
DO $$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'tracks' AND column_name = 'portfolio_id') THEN
    ALTER TABLE public.tracks ADD COLUMN portfolio_id UUID REFERENCES public.user_portfolios(id) ON DELETE SET NULL;
    RAISE NOTICE 'SUCCESS: Column portfolio_id added to tracks table.';
  END IF;
END $$;

-- 1.3: Ensure 'is_published' column exists on the 'tracks' table.
DO $$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_name = 'tracks' AND column_name = 'is_published') THEN
    ALTER TABLE public.tracks ADD COLUMN is_published BOOLEAN DEFAULT FALSE NOT NULL;
    RAISE NOTICE 'SUCCESS: Column is_published added to tracks table.';
  END IF;
END $$;


-- =========
--  STEP 2: RESET ALL RELEVANT RLS POLICIES
-- =========

--  Dropping all old policies prevents conflicts and ensures a clean slate.
DO $$
DECLARE
  policy_record RECORD;
BEGIN
  -- Clear gallery policies
  FOR policy_record IN SELECT policyname FROM pg_policies WHERE tablename = 'gallery' LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON public.gallery;';
  END LOOP;
  -- Clear tracks policies
  FOR policy_record IN SELECT policyname FROM pg_policies WHERE tablename = 'tracks' LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON public.tracks;';
  END LOOP;
  -- Clear user_subscriptions policies
  FOR policy_record IN SELECT policyname FROM pg_policies WHERE tablename = 'user_subscriptions' LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || policy_record.policyname || '" ON public.user_subscriptions;';
  END LOOP;
  RAISE NOTICE 'SUCCESS: All old RLS policies on gallery, tracks, and user_subscriptions have been cleared.';
END $$;


-- =========
--  STEP 3: APPLY CORRECT TABLE RLS POLICIES
-- =========

-- 3.1: Policies for `user_subscriptions` (Fixes 406 Error)
CREATE POLICY "Users can manage their own subscriptions"
ON public.user_subscriptions FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 3.2: Policies for `gallery` (Fixes 403 Error)
CREATE POLICY "Public can view all gallery items"
ON public.gallery FOR SELECT USING (true);

CREATE POLICY "Owners can manage their own gallery items"
ON public.gallery FOR ALL
USING (auth.uid() = (SELECT user_id FROM public.user_portfolios WHERE id = portfolio_id))
WITH CHECK (auth.uid() = (SELECT user_id FROM public.user_portfolios WHERE id = portfolio_id));

-- 3.3: Policies for `tracks` (Fixes 403 Error)
CREATE POLICY "Public can view published tracks"
ON public.tracks FOR SELECT USING (is_published = true);

CREATE POLICY "Owners can manage their own tracks"
ON public.tracks FOR ALL
USING (auth.uid() = (SELECT user_id FROM public.user_portfolios WHERE id = portfolio_id))
WITH CHECK (auth.uid() = (SELECT user_id FROM public.user_portfolios WHERE id = portfolio_id));


-- =========
--  STEP 4: APPLY CORRECT STORAGE RLS POLICIES
-- =========
--  This is the CRUCIAL step to fix the 400 upload error.

-- 4.1: Create Storage Buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery-images', 'gallery-images', true) ON CONFLICT DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('tracks', 'tracks', true) ON CONFLICT DO NOTHING;

-- 4.2: Clear existing Storage policies
DROP POLICY IF EXISTS "Allow owner uploads for gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access for gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Allow owner uploads for tracks" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access for tracks" ON storage.objects;

-- 4.3: Policies for `gallery-images` Bucket
CREATE POLICY "Allow public read access for gallery images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'gallery-images');

CREATE POLICY "Allow owner uploads for gallery images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'gallery-images' AND
  auth.uid()::text = (string_to_array(name, '/'))[2] -- path is "portfolios/[user_id]/..."
);

-- 4.4: Policies for `tracks` Bucket
CREATE POLICY "Allow public read access for tracks"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'tracks');

CREATE POLICY "Allow owner uploads for tracks"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'tracks' AND
  auth.uid()::text = (string_to_array(name, '/'))[2] -- path is "portfolios/[user_id]/..."
);

-- =========
--  FINAL CONFIRMATION
-- =========
SELECT 'SUCCESS: Comprehensive Schema and RLS fix has been applied.' as status; 