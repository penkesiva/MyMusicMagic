-- Check and setup user profile
-- Run this in your Supabase SQL Editor

-- 1. Check if user_profiles table exists and has data
SELECT 'user_profiles table exists' as status, COUNT(*) as count FROM public.user_profiles;

-- 2. Show all user profiles (replace 'your-email@example.com' with your actual email)
SELECT id, email, full_name, username, created_at 
FROM public.user_profiles 
WHERE email = 'your-email@example.com'; -- Replace with your email

-- 3. If no user profile exists, you need to create one
-- First, get your user ID from auth.users:
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com'; -- Replace with your email

-- 4. If you have a user ID but no profile, create one:
-- Replace 'your-user-id' with the actual user ID from step 3
-- Replace 'your-email@example.com' with your actual email
-- Replace 'your-username' with your desired username
/*
INSERT INTO public.user_profiles (id, email, full_name, username, bio)
VALUES (
  'your-user-id', -- Replace with actual user ID from step 3
  'your-email@example.com', -- Replace with your email
  'Your Full Name', -- Replace with your name
  'your-username', -- Replace with your desired username (this is what the public route looks for)
  'Your bio here'
);
*/

-- 5. Check if you have any portfolios
SELECT id, name, slug, is_published, user_id 
FROM public.user_portfolios 
WHERE user_id IN (SELECT id FROM public.user_profiles WHERE email = 'your-email@example.com'); -- Replace with your email

-- 6. If you have a portfolio but it's not published, publish it:
-- Replace 'your-portfolio-id' with the actual portfolio ID from step 5
/*
UPDATE public.user_portfolios 
SET is_published = true 
WHERE id = 'your-portfolio-id';
*/

-- 7. Test the public route by checking if the data exists:
-- Replace 'your-username' and 'your-portfolio-slug' with actual values
SELECT 
  up.id as user_id,
  up.username,
  up.full_name,
  p.id as portfolio_id,
  p.name as portfolio_name,
  p.slug as portfolio_slug,
  p.is_published
FROM public.user_profiles up
JOIN public.user_portfolios p ON up.id = p.user_id
WHERE up.username = 'your-username' -- Replace with your username
  AND p.slug = 'your-portfolio-slug' -- Replace with your portfolio slug
  AND p.is_published = true; 