-- Add use_same_text and footer_text columns to artist_info table
ALTER TABLE artist_info
ADD COLUMN IF NOT EXISTS use_same_text boolean DEFAULT true,
ADD COLUMN IF NOT EXISTS footer_text text;

-- Update existing rows to have use_same_text set to true
UPDATE artist_info
SET use_same_text = true
WHERE use_same_text IS NULL; 