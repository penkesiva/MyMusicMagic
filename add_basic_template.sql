-- Add Basic Template and template locking functionality
-- Run this in your Supabase SQL Editor

-- 1. Add is_free column to portfolio_templates table
ALTER TABLE portfolio_templates 
ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT false;

-- 2. Add is_locked column to portfolio_templates table  
ALTER TABLE portfolio_templates 
ADD COLUMN IF NOT EXISTS is_locked BOOLEAN DEFAULT false;

-- 3. Add display_order column for template ordering
ALTER TABLE portfolio_templates 
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 999;

-- 4. Insert the Basic Template as the first template (free) - only if it doesn't exist
INSERT INTO portfolio_templates (
  name, 
  description, 
  industry, 
  style, 
  theme_colors,
  is_free,
  is_locked,
  is_active,
  display_order
) 
SELECT 
  'Basic Template',
  'Clean horizontal layout for any portfolio.',
  'general',
  'minimal',
  '{"primary": "#6B7280", "secondary": "#374151", "accent": "#F59E0B", "background": "from-gray-900 to-gray-800"}',
  true,
  false,
  true,
  1
WHERE NOT EXISTS (
  SELECT 1 FROM portfolio_templates WHERE name = 'Basic Template'
);

-- 5. Update existing templates to be locked (paid)
UPDATE portfolio_templates 
SET is_free = false, is_locked = true, display_order = 10
WHERE name != 'Basic Template';

-- 6. Set Basic Template as free and unlocked with first priority
UPDATE portfolio_templates 
SET is_free = true, is_locked = false, display_order = 1
WHERE name = 'Basic Template';

-- 7. Verify the changes
SELECT 
  name, 
  description, 
  is_free, 
  is_locked, 
  display_order,
  is_active
FROM portfolio_templates 
ORDER BY display_order, name;

-- 8. Add comments for documentation
COMMENT ON COLUMN portfolio_templates.is_free IS 'Whether this template is available for free users';
COMMENT ON COLUMN portfolio_templates.is_locked IS 'Whether this template requires a paid subscription';
COMMENT ON COLUMN portfolio_templates.display_order IS 'Order in which templates should be displayed (lower numbers first)'; 