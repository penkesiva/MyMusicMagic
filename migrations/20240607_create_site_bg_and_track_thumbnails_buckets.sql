-- Migration: Create 'site-bg-images' and 'track-thumbnails' storage buckets
-- Run this in your Supabase SQL Editor

-- Create site-wide background images bucket
insert into storage.buckets (id, name, public)
values ('site-bg-images', 'site-bg-images', true)
on conflict (id) do nothing;

-- Create track thumbnails bucket
insert into storage.buckets (id, name, public)
values ('track-thumbnails', 'track-thumbnails', true)
on conflict (id) do nothing;

-- (Optional) Add public select policy for both buckets
create policy if not exists "Public can view site bg images"
  on storage.objects for select
  using (bucket_id = 'site-bg-images');

create policy if not exists "Public can view track thumbnails"
  on storage.objects for select
  using (bucket_id = 'track-thumbnails'); 