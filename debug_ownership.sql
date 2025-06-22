-- ===================================================================
--  DEBUG SCRIPT: CHECK PORTFOLIO OWNERSHIP
-- ===================================================================
--  This script checks if the user from your logs is the true owner
--  of the portfolio they are trying to add tracks to.
--
--  Please run this in your Supabase SQL Editor and share the results.
-- ===================================================================

-- Values taken directly from your latest error logs:
-- User ID: '1ef6357e-6cf0-48a2-a5f2-fb6adab54871'
-- Portfolio ID: '5dda1d6f-325e-4599-ab2f-7e84576438c1'


-- Query 1: Find the owner of the target portfolio.
-- This will tell us who the database thinks owns this portfolio.
SELECT
  id as portfolio_id,
  name as portfolio_name,
  user_id as owner_user_id
FROM
  public.user_portfolios
WHERE
  id = '5dda1d6f-325e-4599-ab2f-7e84576438c1'::uuid;


-- Query 2: Confirm the ID of the user currently logged in.
-- This should return the same User ID as seen in your logs.
SELECT auth.uid() as currently_logged_in_user_id;


-- Query 3: Simulate the exact check performed by the RLS policy.
-- If this query returns a row, the policy should pass.
-- If it returns an empty result, the policy will fail (which is what's happening).
SELECT
  'The RLS check was successful for this user and portfolio.' as result
FROM public.user_portfolios
WHERE
  id = '5dda1d6f-325e-4599-ab2f-7e84576438c1'::uuid
  AND user_id = '1ef6357e-6cf0-48a2-a5f2-fb6adab54871'::uuid; 