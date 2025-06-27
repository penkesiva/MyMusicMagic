-- Create press_mentions table for portfolio press and media mentions
CREATE TABLE IF NOT EXISTS press_mentions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portfolio_id UUID REFERENCES user_portfolios(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  image_url TEXT,
  date DATE,
  source TEXT,
  featured BOOLEAN DEFAULT FALSE,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add RLS policies for press_mentions
ALTER TABLE press_mentions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view press mentions for portfolios they own
CREATE POLICY "Users can view their own press mentions" ON press_mentions
  FOR SELECT USING (
    portfolio_id IN (
      SELECT id FROM user_portfolios 
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can insert press mentions for portfolios they own
CREATE POLICY "Users can insert their own press mentions" ON press_mentions
  FOR INSERT WITH CHECK (
    portfolio_id IN (
      SELECT id FROM user_portfolios 
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can update press mentions for portfolios they own
CREATE POLICY "Users can update their own press mentions" ON press_mentions
  FOR UPDATE USING (
    portfolio_id IN (
      SELECT id FROM user_portfolios 
      WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can delete press mentions for portfolios they own
CREATE POLICY "Users can delete their own press mentions" ON press_mentions
  FOR DELETE USING (
    portfolio_id IN (
      SELECT id FROM user_portfolios 
      WHERE user_id = auth.uid()
    )
  );

-- Create index for better performance
CREATE INDEX idx_press_mentions_portfolio_id ON press_mentions(portfolio_id);
CREATE INDEX idx_press_mentions_featured ON press_mentions(featured);
CREATE INDEX idx_press_mentions_order ON press_mentions(order_index);

-- Add press section to sections_config if it doesn't exist
-- This will be handled by the application logic, but here's the structure:
-- sections_config: { "press": { "enabled": true, "name": "Press & Media", "order": 6 } } 