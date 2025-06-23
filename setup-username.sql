-- Setup Username for Existing Users
-- Run this in your Supabase SQL editor to set up usernames for existing users

-- Update users who don't have a username to use their email prefix
UPDATE user_profiles 
SET username = COALESCE(
  username, 
  LOWER(REGEXP_REPLACE(SPLIT_PART(email, '@', 1), '[^a-zA-Z0-9]', '', 'g'))
)
WHERE username IS NULL OR username = '';

-- Add a unique constraint to ensure usernames are unique
ALTER TABLE user_profiles 
ADD CONSTRAINT unique_username 
UNIQUE (username);

-- Success message
SELECT 'Username setup completed! Users can now access their portfolios at /portfolio/[username]/[slug]' as status; 