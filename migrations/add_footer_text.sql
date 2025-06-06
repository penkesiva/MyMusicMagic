-- Add new columns to artist_info table
ALTER TABLE public.artist_info
ADD COLUMN IF NOT EXISTS footer_text text,
ADD COLUMN IF NOT EXISTS use_same_text boolean NOT NULL DEFAULT true;

-- Update existing rows to have use_same_text = true
UPDATE public.artist_info
SET use_same_text = true
WHERE use_same_text IS NULL; 