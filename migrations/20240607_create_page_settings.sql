-- Migration: Create page_settings table for admin page visibility control
-- Run this in your Supabase SQL Editor

create table if not exists page_settings (
  id serial primary key,
  page_name text unique not null,
  enabled boolean not null default true
);

-- Insert default rows for each page (except home, which is always enabled and non-editable)
insert into page_settings (page_name, enabled) values
  ('gallery', true),
  ('contact', true),
  ('quotes', true)
on conflict (page_name) do nothing; 