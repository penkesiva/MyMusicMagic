-- Complete Database Setup for MyMusicMagic
-- Run this in your Supabase SQL Editor to set up all required tables and data

-- ========================================
-- 1. USER AUTHENTICATION TABLES
-- ========================================

-- Create user_profiles table (extends Supabase auth.users)
create table if not exists public.user_profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  username text unique,
  avatar_url text,
  bio text,
  website_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create user_subscriptions table for future billing
create table if not exists public.user_subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.user_profiles(id) on delete cascade not null,
  plan_type text not null default 'free', -- 'free', 'pro', 'enterprise'
  status text not null default 'active', -- 'active', 'cancelled', 'expired'
  stripe_customer_id text,
  stripe_subscription_id text,
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create user_portfolio_settings table for future customization
create table if not exists public.user_portfolio_settings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.user_profiles(id) on delete cascade not null,
  portfolio_title text default 'My Portfolio',
  portfolio_description text,
  theme_color text default '#4F46E5',
  custom_domain text,
  is_published boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ========================================
-- 2. PORTFOLIO TABLES
-- ========================================

-- Create user_portfolios table
create table if not exists public.user_portfolios (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.user_profiles(id) on delete cascade not null,
  name text not null,
  slug text not null,
  template_id uuid,
  is_published boolean default false,
  is_default boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Artist Info
  artist_name text,
  bio text,
  
  -- Page Content
  sections_config jsonb,
  layout_config jsonb,
  
  -- Hero Section
  hero_title text,
  hero_subtitle text,
  hero_cta_buttons jsonb,
  
  -- About Section
  about_title text,
  about_text text,

  -- Hobbies
  hobbies_title text,
  hobbies_json jsonb,

  -- Skills
  skills_title text,
  skills_json jsonb,

  -- Press
  press_title text,
  press_json jsonb,

  -- Key Projects
  key_projects_title text,
  key_projects_json jsonb,

  -- Testimonials
  testimonials_title text,
  testimonials_json jsonb,

  -- Resume
  resume_title text,
  resume_url text,

  -- Contact Section
  contact_title text,
  contact_description text,
  contact_email text,
  contact_phone text,
  contact_location text,
  
  -- Social Links
  twitter_url text,
  instagram_url text,
  linkedin_url text,
  github_url text,
  website_url text,
  youtube_url text,

  -- Media URLs
  profile_photo_url text,
  hero_image_url text,
  
  -- SEO
  seo_title text,
  seo_description text,
  
  -- Theme
  theme_name text,
  
  -- Footer
  footer_text text,
  footer_about_summary text,
  footer_links_json jsonb,
  footer_social_links_json jsonb,
  footer_copyright_text text,
  footer_show_social_links boolean,
  footer_show_about_summary boolean,
  footer_show_links boolean,
  
  -- Published content snapshot
  published_content jsonb
);

-- ========================================
-- 3. TRACKS AND GALLERY TABLES
-- ========================================

-- Create tracks table
create table if not exists public.tracks (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  description text,
  duration numeric not null,
  audio_url text not null,
  thumbnail_url text,
  composer_notes text,
  lyrics text,
  release_date date,
  is_published boolean default true,
  user_id uuid references public.user_profiles(id) on delete cascade not null,
  portfolio_id uuid references public.user_portfolios(id) on delete cascade,
  "order" integer default 0
);

-- Create gallery table
create table if not exists public.gallery (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  image_url text not null,
  video_url text,
  media_type text default 'image',
  description text,
  date date default current_date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  portfolio_id uuid references public.user_portfolios(id) on delete cascade
);

-- ========================================
-- 4. ADD PUBLISHED_CONTENT FIELD
-- ========================================

-- Add published_content field to store the last published version
ALTER TABLE user_portfolios 
ADD COLUMN IF NOT EXISTS published_content JSONB;

-- Add a comment to explain the field
COMMENT ON COLUMN user_portfolios.published_content IS 'Stores a snapshot of the last published version of the portfolio content. Used to separate draft changes from published content.';

-- Create an index on published_content for better query performance
CREATE INDEX IF NOT EXISTS idx_user_portfolios_published_content ON user_portfolios USING GIN (published_content);

-- ========================================
-- 5. ENABLE RLS AND CREATE POLICIES
-- ========================================

-- Enable RLS on all tables
alter table public.user_profiles enable row level security;
alter table public.user_subscriptions enable row level security;
alter table public.user_portfolio_settings enable row level security;
alter table public.user_portfolios enable row level security;
alter table public.tracks enable row level security;
alter table public.gallery enable row level security;

-- RLS Policies for user_profiles
create policy "Users can view their own profile"
  on public.user_profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.user_profiles for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.user_profiles for insert
  with check (auth.uid() = id);

-- Public read access for user_profiles (needed for public portfolios)
create policy "Public can view user profiles"
  on public.user_profiles for select
  using (true);

-- RLS Policies for user_portfolios
create policy "Users can view their own portfolios"
  on public.user_portfolios for select
  using (auth.uid() = user_id);

create policy "Users can update their own portfolios"
  on public.user_portfolios for update
  using (auth.uid() = user_id);

create policy "Users can insert their own portfolios"
  on public.user_portfolios for insert
  with check (auth.uid() = user_id);

-- Public read access for published portfolios
create policy "Public can view published portfolios"
  on public.user_portfolios for select
  using (is_published = true);

-- RLS Policies for tracks
create policy "Users can view their own tracks"
  on public.tracks for select
  using (auth.uid() = user_id);

create policy "Users can update their own tracks"
  on public.tracks for update
  using (auth.uid() = user_id);

create policy "Users can insert their own tracks"
  on public.tracks for insert
  with check (auth.uid() = user_id);

-- Public read access for tracks
create policy "Public can view tracks"
  on public.tracks for select
  using (true);

-- RLS Policies for gallery
create policy "Users can view their own gallery items"
  on public.gallery for select
  using (true);

create policy "Users can update their own gallery items"
  on public.gallery for update
  using (true);

create policy "Users can insert their own gallery items"
  on public.gallery for insert
  with check (true);

-- Public read access for gallery
create policy "Public can view gallery items"
  on public.gallery for select
  using (true);

-- ========================================
-- 6. CREATE INDEXES
-- ========================================

create index if not exists idx_user_profiles_email on public.user_profiles(email);
create index if not exists idx_user_profiles_username on public.user_profiles(username);
create index if not exists idx_user_subscriptions_user_id on public.user_subscriptions(user_id);
create index if not exists idx_user_portfolio_settings_user_id on public.user_portfolio_settings(user_id);
create index if not exists idx_user_portfolios_user_id on public.user_portfolios(user_id);
create index if not exists idx_user_portfolios_slug on public.user_portfolios(slug);
create index if not exists idx_tracks_portfolio_id on public.tracks(portfolio_id);
create index if not exists idx_gallery_portfolio_id on public.gallery(portfolio_id);

-- ========================================
-- 7. CREATE TEST DATA (OPTIONAL)
-- ========================================

-- Insert a test user profile (you can modify this or remove it)
-- Note: You'll need to replace 'test-user-id' with an actual user ID from auth.users
-- or create a user through your app's signup process

-- Uncomment and modify the following lines if you want to create test data:
/*
INSERT INTO public.user_profiles (id, email, full_name, username, bio)
VALUES (
  'test-user-id', -- Replace with actual user ID
  'test@example.com',
  'Test User',
  'testuser',
  'This is a test user for development'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO public.user_portfolios (
  user_id, name, slug, is_published, is_default,
  artist_name, hero_title, hero_subtitle, theme_name
)
VALUES (
  'test-user-id', -- Replace with actual user ID
  'My Test Portfolio',
  'test-portfolio',
  true,
  true,
  'Test Artist',
  'Welcome to My Portfolio',
  'Music Producer & Composer',
  'dark'
) ON CONFLICT DO NOTHING;
*/

-- ========================================
-- 8. CREATE TRIGGERS AND FUNCTIONS
-- ========================================

-- Function to handle new user registration
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  
  -- Create default subscription
  insert into public.user_subscriptions (user_id, plan_type)
  values (new.id, 'free');
  
  -- Create default portfolio settings
  insert into public.user_portfolio_settings (user_id)
  values (new.id);
  
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to automatically create user profile on signup
create trigger if not exists on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger if not exists handle_user_profiles_updated_at
  before update on public.user_profiles
  for each row execute procedure public.handle_updated_at();

create trigger if not exists handle_user_subscriptions_updated_at
  before update on public.user_subscriptions
  for each row execute procedure public.handle_updated_at();

create trigger if not exists handle_user_portfolio_settings_updated_at
  before update on public.user_portfolio_settings
  for each row execute procedure public.handle_updated_at();

create trigger if not exists handle_user_portfolios_updated_at
  before update on public.user_portfolios
  for each row execute procedure public.handle_updated_at();

-- ========================================
-- 9. VERIFICATION QUERIES
-- ========================================

-- Check if tables exist
SELECT 'user_profiles' as table_name, COUNT(*) as row_count FROM public.user_profiles
UNION ALL
SELECT 'user_portfolios' as table_name, COUNT(*) as row_count FROM public.user_portfolios
UNION ALL
SELECT 'tracks' as table_name, COUNT(*) as row_count FROM public.tracks
UNION ALL
SELECT 'gallery' as table_name, COUNT(*) as row_count FROM public.gallery;

-- Check if published_content column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'user_portfolios' AND column_name = 'published_content'; 