-- Add section blending style field to user_portfolios table
ALTER TABLE user_portfolios 
ADD COLUMN section_blending_style VARCHAR(50) DEFAULT 'full-bleed';

-- Add comment to explain the field
COMMENT ON COLUMN user_portfolios.section_blending_style IS 'Controls how sections blend together: full-bleed, card-based, alternating, minimal-spacing, overlapping, parallax, timeline, grid-based'; 