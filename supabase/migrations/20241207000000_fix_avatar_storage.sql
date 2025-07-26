-- =====================================================================================
--  FIX AVATAR STORAGE MIGRATION
-- =====================================================================================
--  This migration ensures the avatar storage bucket and policies are properly
--  configured for profile picture uploads.
-- =====================================================================================

-- Step 1: Ensure the avatars bucket exists with proper configuration
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types) 
VALUES (
  'avatars', 
  'avatars', 
  true, 
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Step 2: Clear any existing avatar policies to prevent conflicts
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Avatars are publicly viewable" ON storage.objects;

-- Step 3: Create comprehensive avatar storage policies
CREATE POLICY "Users can upload their own avatar" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own avatar" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own avatar" ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatars' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Avatars are publicly viewable" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

-- Step 4: Add a comment to document the migration
COMMENT ON POLICY "Users can upload their own avatar" ON storage.objects IS 'Allows users to upload avatar images to their own folder';
COMMENT ON POLICY "Users can update their own avatar" ON storage.objects IS 'Allows users to update their own avatar images';
COMMENT ON POLICY "Users can delete their own avatar" ON storage.objects IS 'Allows users to delete their own avatar images';
COMMENT ON POLICY "Avatars are publicly viewable" ON storage.objects IS 'Makes all avatar images publicly accessible for display'; 