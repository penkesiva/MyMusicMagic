-- Complete Gallery table setup and sample data
-- Run this in your Supabase SQL Editor

-- Create gallery table if it doesn't exist
create table if not exists public.gallery (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  image_url text not null,
  date timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add new columns for video support
alter table public.gallery 
add column if not exists video_url text,
add column if not exists media_type text default 'image' check (media_type in ('image', 'video')),
add column if not exists description text;

-- Update existing rows to have media_type = 'image'
update public.gallery 
set media_type = 'image' 
where media_type is null;

-- Make media_type not null after setting default values
alter table public.gallery 
alter column media_type set not null;

-- Enable RLS (Row Level Security)
alter table public.gallery enable row level security;

-- Create RLS policies if they don't exist
do $$
begin
  -- Gallery is viewable by everyone
  if not exists (select 1 from pg_policies where tablename = 'gallery' and policyname = 'Gallery is viewable by everyone') then
    create policy "Gallery is viewable by everyone"
      on public.gallery for select
      using (true);
  end if;

  -- Gallery is insertable by authenticated users
  if not exists (select 1 from pg_policies where tablename = 'gallery' and policyname = 'Gallery is insertable by authenticated users') then
    create policy "Gallery is insertable by authenticated users"
      on public.gallery for insert
      to authenticated
      with check (true);
  end if;

  -- Gallery is updatable by authenticated users
  if not exists (select 1 from pg_policies where tablename = 'gallery' and policyname = 'Gallery is updatable by authenticated users') then
    create policy "Gallery is updatable by authenticated users"
      on public.gallery for update
      to authenticated
      using (true);
  end if;

  -- Gallery is deletable by authenticated users
  if not exists (select 1 from pg_policies where tablename = 'gallery' and policyname = 'Gallery is deletable by authenticated users') then
    create policy "Gallery is deletable by authenticated users"
      on public.gallery for delete
      to authenticated
      using (true);
  end if;
end $$;

-- Insert sample gallery items (only if table is empty)
insert into public.gallery (title, description, media_type, image_url, video_url)
select * from (values
  ('Live Performance', 'An electrifying live performance showcasing musical talent', 'image', 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop', null),
  ('Studio Session', 'Behind the scenes in the recording studio', 'image', 'https://images.unsplash.com/photo-1598653222000-6b7b7a552625?w=800&h=600&fit=crop', null),
  ('Concert Highlights', 'Memorable moments from our latest concert', 'video', 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
  ('Music Video', 'Official music video release', 'video', 'https://img.youtube.com/vi/9bZkp7q19f0/maxresdefault.jpg', 'https://www.youtube.com/watch?v=9bZkp7q19f0'),
  ('Backstage Pass', 'Exclusive backstage moments with the band', 'image', 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?w=800&h=600&fit=crop', null),
  ('Soundcheck', 'Pre-show soundcheck and preparation', 'image', 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&h=600&fit=crop', null)
) as sample_data(title, description, media_type, image_url, video_url)
where not exists (select 1 from public.gallery limit 1); 