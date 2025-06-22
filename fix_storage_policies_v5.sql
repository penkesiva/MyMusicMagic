-- =====================================================================================
--  HEROPORTFOLIO - DEFINITIVE STORAGE RLS POLICY FIX (v5)
-- =====================================================================================
--  This script resolves the 400 Bad Request error on file uploads by creating
--  robust RLS policies for Supabase Storage. It verifies that the uploader
--  owns the portfolio they are uploading to.
--
--  It is safe to run this script multiple times.
-- =====================================================================================

-- =========
--  STEP 1: CLEAR ALL OLD STORAGE POLICIES TO PREVENT CONFLICTS
-- =========
DROP POLICY IF EXISTS "Allow public read access for gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Allow owner uploads for gallery images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read access for tracks" ON storage.objects;
DROP POLICY IF EXISTS "Allow owner uploads for tracks" ON storage.objects;


-- =========
--  STEP 2: APPLY CORRECT STORAGE RLS POLICIES
-- =========

-- 2.1: Policies for the `gallery-images` Bucket
CREATE POLICY "Allow public read access for gallery images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'gallery-images');

CREATE POLICY "Allow owner uploads for gallery images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'gallery-images' AND
  -- Check if the user owns the portfolio referenced in the upload path.
  -- The path is 'portfolios/[portfolio_id]/gallery/[filename]'
  auth.uid() = (
    SELECT user_id FROM public.user_portfolios
    WHERE id = (string_to_array(name, '/'))[2]::uuid
  )
);

-- 2.2: Policies for the `tracks` Bucket
CREATE POLICY "Allow public read access for tracks"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'tracks');

CREATE POLICY "Allow owner uploads for tracks"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'tracks' AND
  -- Check if the user owns the portfolio referenced in the upload path.
  -- The path is 'portfolios/[portfolio_id]/tracks/[filename]'
  auth.uid() = (
    SELECT user_id FROM public.user_portfolios
    WHERE id = (string_to_array(name, '/'))[2]::uuid
  )
);


-- =========
--  FINAL CONFIRMATION
-- =========
SELECT 'SUCCESS: Definitive Storage RLS policies have been applied.' as status; 