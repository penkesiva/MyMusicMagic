-- Migration: Add user authentication tables for HeroPortfolio multi-user platform
-- Run this in your Supabase SQL Editor

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

-- Enable RLS on new tables
alter table public.user_profiles enable row level security;
alter table public.user_subscriptions enable row level security;
alter table public.user_portfolio_settings enable row level security;

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

-- RLS Policies for user_subscriptions
create policy "Users can view their own subscription"
  on public.user_subscriptions for select
  using (auth.uid() = user_id);

create policy "Users can update their own subscription"
  on public.user_subscriptions for update
  using (auth.uid() = user_id);

create policy "Users can insert their own subscription"
  on public.user_subscriptions for insert
  with check (auth.uid() = user_id);

-- RLS Policies for user_portfolio_settings
create policy "Users can view their own portfolio settings"
  on public.user_portfolio_settings for select
  using (auth.uid() = user_id);

create policy "Users can update their own portfolio settings"
  on public.user_portfolio_settings for update
  using (auth.uid() = user_id);

create policy "Users can insert their own portfolio settings"
  on public.user_portfolio_settings for insert
  with check (auth.uid() = user_id);

-- Create indexes for better performance
create index if not exists idx_user_profiles_email on public.user_profiles(email);
create index if not exists idx_user_profiles_username on public.user_profiles(username);
create index if not exists idx_user_subscriptions_user_id on public.user_subscriptions(user_id);
create index if not exists idx_user_portfolio_settings_user_id on public.user_portfolio_settings(user_id);

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
create trigger on_auth_user_created
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
create trigger handle_user_profiles_updated_at
  before update on public.user_profiles
  for each row execute procedure public.handle_updated_at();

create trigger handle_user_subscriptions_updated_at
  before update on public.user_subscriptions
  for each row execute procedure public.handle_updated_at();

create trigger handle_user_portfolio_settings_updated_at
  before update on public.user_portfolio_settings
  for each row execute procedure public.handle_updated_at(); 