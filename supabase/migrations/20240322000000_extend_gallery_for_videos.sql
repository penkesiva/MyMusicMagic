-- Extend gallery table to support videos
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