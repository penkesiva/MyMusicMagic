-- Add Sample Gallery Items for Portfolio
-- This script adds sample gallery items for the portfolio with slug 'mm1'

-- First, get the portfolio ID
WITH portfolio_info AS (
  SELECT id FROM user_portfolios WHERE slug = 'mm1'
)
INSERT INTO gallery (
  portfolio_id,
  title,
  description,
  image_url,
  type,
  order
)
SELECT 
  portfolio_info.id,
  'Studio Session',
  'Recording in the studio',
  'https://images.unsplash.com/photo-1598653222000-6b7b7a552625?w=800&h=600&fit=crop',
  'photo',
  1
FROM portfolio_info
UNION ALL
SELECT 
  portfolio_info.id,
  'Live Performance',
  'On stage performing live',
  'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
  'photo',
  2
FROM portfolio_info
UNION ALL
SELECT 
  portfolio_info.id,
  'Music Production',
  'Working on new tracks',
  'https://images.unsplash.com/photo-1598387993448-9440c6d3227c?w=800&h=600&fit=crop',
  'photo',
  3
FROM portfolio_info;

-- Verify the gallery items were added
SELECT 
  g.id,
  g.title,
  g.description,
  g.image_url,
  g.type,
  g.order,
  p.name as portfolio_name
FROM gallery g
JOIN user_portfolios p ON g.portfolio_id = p.id
WHERE p.slug = 'mm1'
ORDER BY g.order; 