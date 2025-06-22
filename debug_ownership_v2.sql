-- ===================================================================
--  DEBUG SCRIPT (v2): CHECK PORTFOLIO OWNERSHIP & DATA STATE
-- ===================================================================
--  This script will give us a complete picture of the data state
--  to understand why the security policies are failing.
--
--  Please run this in your Supabase SQL Editor and share the
--  results of ALL THREE queries below.
-- ===================================================================

-- Values taken directly from your latest error logs:
-- User ID: '1ef6357e-6cf0-48a2-a5f2-fb6adab54871'
-- Portfolio ID: '5dda1d6f-325e-4599-ab2f-7e84576438c1'


-- Query 1: What is the actual `user_id` on the portfolio you're uploading to?
-- This tells us who the database thinks is the owner.
SELECT
  id as portfolio_id,
  name as portfolio_name,
  user_id as owner_user_id
FROM
  public.user_portfolios
WHERE
  id = '5dda1d6f-325e-4599-ab2f-7e84576438c1'::uuid;


-- Query 2: What portfolios does the currently logged-in user own?
-- This checks from the user's perspective. The result should include the portfolio from Query 1.
SELECT
  id as portfolio_id,
  name as portfolio_name,
  user_id as owner_user_id
FROM
  public.user_portfolios
WHERE
  user_id = '1ef6357e-6cf0-48a2-a5f2-fb6adab54871'::uuid;


-- Query 3: Let's run the exact check the RLS policy runs.
-- If this query returns an empty result, the policy is correctly failing.
-- If it returns a result, something else is wrong.
SELECT
  'SUCCESS: The RLS ownership check passed for this combination.' as result
FROM public.user_portfolios
WHERE
  id = '5dda1d6f-325e-4599-ab2f-7e84576438c1'::uuid
  AND user_id = '1ef6357e-6cf0-48a2-a5f2-fb6adab54871'::uuid; 