-- Fix RLS and Authentication Issues
-- Run this in your Supabase SQL editor

-- 1. Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can view their own subscription" ON user_subscriptions;
DROP POLICY IF EXISTS "Users can update their own subscription" ON user_subscriptions;
DROP POLICY IF EXISTS "Users can insert their own subscription" ON user_subscriptions;

DROP POLICY IF EXISTS "Users can view their own portfolios" ON user_portfolios;
DROP POLICY IF EXISTS "Users can insert their own portfolios" ON user_portfolios;
DROP POLICY IF EXISTS "Users can update their own portfolios" ON user_portfolios;
DROP POLICY IF EXISTS "Users can delete their own portfolios" ON user_portfolios;

DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON user_profiles;

-- 2. Create RPC functions to ensure user data exists
CREATE OR REPLACE FUNCTION ensure_user_profile(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO user_profiles (id, email, full_name)
  VALUES (user_uuid, (SELECT email FROM auth.users WHERE id = user_uuid), '')
  ON CONFLICT (id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION ensure_user_subscription(user_uuid UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO user_subscriptions (user_id, plan_type, status)
  VALUES (user_uuid, 'free', 'active')
  ON CONFLICT (user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Recreate RLS policies with proper authentication checks
-- User Subscriptions policies
CREATE POLICY "Users can view their own subscription"
  ON user_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscription"
  ON user_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own subscription"
  ON user_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- User Portfolios policies
CREATE POLICY "Users can view their own portfolios"
  ON user_portfolios FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own portfolios"
  ON user_portfolios FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own portfolios"
  ON user_portfolios FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own portfolios"
  ON user_portfolios FOR DELETE
  USING (auth.uid() = user_id);

-- User Profiles policies
CREATE POLICY "Users can view their own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 4. Add public read access for published portfolios
CREATE POLICY "Published portfolios are viewable by everyone"
  ON user_portfolios FOR SELECT
  USING (is_published = true);

-- 5. Fix gallery and tracks policies to work with portfolio_id
DROP POLICY IF EXISTS "Gallery is viewable by everyone" ON gallery;
DROP POLICY IF EXISTS "Gallery is insertable by authenticated users" ON gallery;
DROP POLICY IF EXISTS "Gallery is updatable by authenticated users" ON gallery;
DROP POLICY IF EXISTS "Gallery is deletable by authenticated users" ON gallery;

-- Gallery policies
CREATE POLICY "Gallery is viewable by everyone"
  ON gallery FOR SELECT
  USING (true);

CREATE POLICY "Gallery is insertable by portfolio owners"
  ON gallery FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_portfolios 
      WHERE id = portfolio_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Gallery is updatable by portfolio owners"
  ON gallery FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_portfolios 
      WHERE id = portfolio_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Gallery is deletable by portfolio owners"
  ON gallery FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_portfolios 
      WHERE id = portfolio_id 
      AND user_id = auth.uid()
    )
  );

-- Tracks policies
DROP POLICY IF EXISTS "Tracks are viewable by everyone when published" ON tracks;
DROP POLICY IF EXISTS "Users can insert their own tracks" ON tracks;
DROP POLICY IF EXISTS "Users can update their own tracks" ON tracks;

CREATE POLICY "Tracks are viewable by everyone when published"
  ON tracks FOR SELECT
  USING (is_published = true);

CREATE POLICY "Tracks are insertable by portfolio owners"
  ON tracks FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_portfolios 
      WHERE id = portfolio_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Tracks are updatable by portfolio owners"
  ON tracks FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM user_portfolios 
      WHERE id = portfolio_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Tracks are deletable by portfolio owners"
  ON tracks FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM user_portfolios 
      WHERE id = portfolio_id 
      AND user_id = auth.uid()
    )
  );

-- 6. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 7. Success message
SELECT 'RLS policies and authentication fixed successfully!' as status; 