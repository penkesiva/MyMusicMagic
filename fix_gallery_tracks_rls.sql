-- Fix Gallery and Tracks RLS Policies
-- Run this in your Supabase SQL editor

-- 1. Drop existing gallery policies
DROP POLICY IF EXISTS "Gallery is viewable by everyone" ON gallery;
DROP POLICY IF EXISTS "Gallery is insertable by authenticated users" ON gallery;
DROP POLICY IF EXISTS "Gallery is updatable by authenticated users" ON gallery;
DROP POLICY IF EXISTS "Gallery is deletable by authenticated users" ON gallery;

-- 2. Drop existing tracks policies
DROP POLICY IF EXISTS "Tracks are viewable by everyone when published" ON tracks;
DROP POLICY IF EXISTS "Users can insert their own tracks" ON tracks;
DROP POLICY IF EXISTS "Users can update their own tracks" ON tracks;
DROP POLICY IF EXISTS "Users can delete their own tracks" ON tracks;

-- 3. Create new gallery policies
CREATE POLICY "Gallery is viewable by everyone"
  ON gallery FOR SELECT
  USING (true);

CREATE POLICY "Gallery is insertable by portfolio owners"
  ON gallery FOR INSERT
  WITH CHECK (
    portfolio_id IS NULL OR
    EXISTS (
      SELECT 1 FROM user_portfolios 
      WHERE id = portfolio_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Gallery is updatable by portfolio owners"
  ON gallery FOR UPDATE
  USING (
    portfolio_id IS NULL OR
    EXISTS (
      SELECT 1 FROM user_portfolios 
      WHERE id = portfolio_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Gallery is deletable by portfolio owners"
  ON gallery FOR DELETE
  USING (
    portfolio_id IS NULL OR
    EXISTS (
      SELECT 1 FROM user_portfolios 
      WHERE id = portfolio_id 
      AND user_id = auth.uid()
    )
  );

-- 4. Create new tracks policies
CREATE POLICY "Tracks are viewable by everyone when published"
  ON tracks FOR SELECT
  USING (is_published = true);

CREATE POLICY "Tracks are viewable by portfolio owners"
  ON tracks FOR SELECT
  USING (
    portfolio_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM user_portfolios 
      WHERE id = portfolio_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Tracks are insertable by portfolio owners"
  ON tracks FOR INSERT
  WITH CHECK (
    portfolio_id IS NULL OR
    EXISTS (
      SELECT 1 FROM user_portfolios 
      WHERE id = portfolio_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Tracks are updatable by portfolio owners"
  ON tracks FOR UPDATE
  USING (
    portfolio_id IS NULL OR
    EXISTS (
      SELECT 1 FROM user_portfolios 
      WHERE id = portfolio_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Tracks are deletable by portfolio owners"
  ON tracks FOR DELETE
  USING (
    portfolio_id IS NULL OR
    EXISTS (
      SELECT 1 FROM user_portfolios 
      WHERE id = portfolio_id 
      AND user_id = auth.uid()
    )
  );

-- 5. Grant necessary permissions
GRANT ALL ON gallery TO authenticated;
GRANT ALL ON tracks TO authenticated;

-- 6. Success message
SELECT 'Gallery and Tracks RLS policies fixed successfully!' as status; 