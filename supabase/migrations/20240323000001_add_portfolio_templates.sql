-- Migration: Add portfolio templates for different industries
-- Run this in your Supabase SQL Editor

-- Create portfolio_templates table
create table if not exists public.portfolio_templates (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  industry text not null, -- 'music', 'design', 'photography', 'tech', 'education', etc.
  style text not null, -- 'minimal', 'creative', 'professional'
  preview_image_url text,
  theme_colors jsonb, -- Store theme colors as JSON
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create user_portfolios table
create table if not exists public.user_portfolios (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.user_profiles(id) on delete cascade not null,
  name text not null,
  slug text unique not null, -- URL-friendly name
  template_id uuid references public.portfolio_templates(id),
  is_published boolean default false,
  is_default boolean default false, -- Only one portfolio per user can be default
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS on new tables
alter table public.portfolio_templates enable row level security;
alter table public.user_portfolios enable row level security;

-- RLS Policies for portfolio_templates (readable by everyone)
create policy "Portfolio templates are viewable by everyone"
  on public.portfolio_templates for select
  using (is_active = true);

-- RLS Policies for user_portfolios
create policy "Users can view their own portfolios"
  on public.user_portfolios for select
  using (auth.uid() = user_id);

create policy "Users can insert their own portfolios"
  on public.user_portfolios for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own portfolios"
  on public.user_portfolios for update
  using (auth.uid() = user_id);

create policy "Users can delete their own portfolios"
  on public.user_portfolios for delete
  using (auth.uid() = user_id);

-- Create indexes
create index if not exists idx_portfolio_templates_industry on public.portfolio_templates(industry);
create index if not exists idx_portfolio_templates_style on public.portfolio_templates(style);
create index if not exists idx_user_portfolios_user_id on public.user_portfolios(user_id);
create index if not exists idx_user_portfolios_slug on public.user_portfolios(slug);

-- Insert default portfolio templates
insert into public.portfolio_templates (name, description, industry, style, theme_colors) values
  ('Music Maestro', 'Perfect for musicians and composers', 'music', 'creative', '{"primary": "#4F46E5", "secondary": "#7C3AED", "accent": "#F59E0B"}'),
  ('Design Studio', 'Ideal for designers and creatives', 'design', 'minimal', '{"primary": "#000000", "secondary": "#6B7280", "accent": "#EF4444"}'),
  ('Tech Portfolio', 'Great for developers and tech professionals', 'tech', 'professional', '{"primary": "#2563EB", "secondary": "#1F2937", "accent": "#10B981"}'),
  ('Photo Gallery', 'Perfect for photographers', 'photography', 'creative', '{"primary": "#DC2626", "secondary": "#374151", "accent": "#F59E0B"}'),
  ('Academic Profile', 'Ideal for students and researchers', 'education', 'professional', '{"primary": "#059669", "secondary": "#4B5563", "accent": "#7C3AED"}'),
  ('Artist Showcase', 'For visual artists and creators', 'art', 'creative', '{"primary": "#7C3AED", "secondary": "#1F2937", "accent": "#F59E0B"}'),
  ('Business Professional', 'For business and corporate portfolios', 'business', 'professional', '{"primary": "#1F2937", "secondary": "#6B7280", "accent": "#2563EB"}'),
  ('Minimalist', 'Clean and simple design', 'general', 'minimal', '{"primary": "#000000", "secondary": "#6B7280", "accent": "#EF4444"}')
on conflict do nothing;

-- Function to ensure only one default portfolio per user
create or replace function public.ensure_single_default_portfolio()
returns trigger as $$
begin
  if new.is_default = true then
    -- Set all other portfolios for this user to not default
    update public.user_portfolios 
    set is_default = false 
    where user_id = new.user_id and id != new.id;
  end if;
  return new;
end;
$$ language plpgsql;

-- Trigger to ensure single default portfolio
create trigger ensure_single_default_portfolio_trigger
  before insert or update on public.user_portfolios
  for each row execute procedure public.ensure_single_default_portfolio();

-- Function to update updated_at timestamp
create or replace function public.handle_portfolio_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger for updated_at
create trigger handle_user_portfolios_updated_at
  before update on public.user_portfolios
  for each row execute procedure public.handle_portfolio_updated_at(); 