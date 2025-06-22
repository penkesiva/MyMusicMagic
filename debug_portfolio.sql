-- Debug Portfolio Issues
-- Run this in your Supabase SQL editor

-- 1. Check if user_profiles table has data
SELECT 'User Profiles:' as table_name, COUNT(*) as count FROM user_profiles;

-- 2. Check if user_subscriptions table has data
SELECT 'User Subscriptions:' as table_name, COUNT(*) as count FROM user_subscriptions;

-- 3. Check if user_portfolios table has data
SELECT 'User Portfolios:' as table_name, COUNT(*) as count FROM user_portfolios;

-- 4. Show all portfolios with their status
SELECT 
  id,
  name,
  slug,
  user_id,
  is_published,
  is_default,
  created_at
FROM user_portfolios
ORDER BY created_at DESC;

-- 5. Show user profiles
SELECT 
  id,
  email,
  full_name,
  username,
  created_at
FROM user_profiles
ORDER BY created_at DESC;

-- 6. Show user subscriptions
SELECT 
  id,
  user_id,
  plan_type,
  status,
  created_at
FROM user_subscriptions
ORDER BY created_at DESC;

-- 7. Check if there are any published portfolios
SELECT 
  'Published Portfolios:' as status,
  COUNT(*) as count
FROM user_portfolios 
WHERE is_published = true;

-- 8. Check if there are any portfolios with the slug 'test'
SELECT 
  'Portfolios with slug "test":' as search,
  COUNT(*) as count
FROM user_portfolios 
WHERE slug = 'test';

-- 9. Show detailed info for portfolios with slug 'test'
SELECT 
  id,
  name,
  slug,
  user_id,
  is_published,
  is_default,
  created_at,
  updated_at
FROM user_portfolios 
WHERE slug = 'test'; 