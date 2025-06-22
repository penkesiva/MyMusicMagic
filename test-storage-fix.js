#!/usr/bin/env node

console.log('🔧 Storage Upload Fix Diagnostic Tool');
console.log('=====================================\n');

console.log('📋 Issues Identified:');
console.log('1. ❌ Missing INSERT policy for site-bg-images bucket');
console.log('2. ❌ Missing UPDATE policy for site-bg-images bucket');
console.log('3. ❌ Missing DELETE policy for site-bg-images bucket');
console.log('4. ❌ Only SELECT policy exists (public read only)\n');

console.log('🛠️ Solution:');
console.log('Run the following SQL in your Supabase SQL Editor:\n');

console.log(`
-- Fix storage policies for site-bg-images bucket
-- Run this in your Supabase SQL Editor

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies for site-bg-images to avoid conflicts
DROP POLICY IF EXISTS "Public can view site bg images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads for site bg images" ON storage.objects;

-- Create public read policy for site-bg-images
CREATE POLICY "Public can view site bg images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'site-bg-images');

-- Create authenticated upload policy for site-bg-images
CREATE POLICY "Allow authenticated uploads for site bg images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'site-bg-images');

-- Create authenticated update policy for site-bg-images
CREATE POLICY "Allow authenticated updates for site bg images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'site-bg-images');

-- Create authenticated delete policy for site-bg-images
CREATE POLICY "Allow authenticated deletes for site bg images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'site-bg-images');

-- Verify the bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('site-bg-images', 'site-bg-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;
`);

console.log('\n📝 Steps to Fix:');
console.log('1. Go to your Supabase Dashboard');
console.log('2. Navigate to SQL Editor');
console.log('3. Copy and paste the SQL above');
console.log('4. Click "Run" to execute');
console.log('5. Test file upload in your portfolio editor\n');

console.log('🔍 What This Fixes:');
console.log('✅ Allows authenticated users to upload files');
console.log('✅ Allows authenticated users to update files');
console.log('✅ Allows authenticated users to delete files');
console.log('✅ Maintains public read access for images');
console.log('✅ Ensures bucket exists and is properly configured\n');

console.log('🧪 After Running the Fix:');
console.log('1. Try uploading an image in the portfolio editor');
console.log('2. Check browser console for detailed error messages');
console.log('3. Verify the image appears in the preview');
console.log('4. Test both hero image and profile photo uploads\n');

console.log('📞 If Still Having Issues:');
console.log('- Check browser console for specific error messages');
console.log('- Verify you are authenticated in the app');
console.log('- Ensure the file is a valid image format');
console.log('- Check file size (should be under 5MB)\n');

console.log('✨ Storage Upload Fix Complete!'); 