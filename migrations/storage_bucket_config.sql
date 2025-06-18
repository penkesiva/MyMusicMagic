-- Configure storage bucket limits and MIME types
-- Run this in your Supabase SQL Editor

-- artist-photos: Allow common image formats, max 5MB
update storage.buckets
set file_size_limit = 5242880,  -- 5MB in bytes
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
where name = 'artist-photos';

-- audio: Allow common audio formats, max 50MB
update storage.buckets
set file_size_limit = 52428800,  -- 50MB in bytes
    allowed_mime_types = array['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg']
where name = 'audio';

-- gallery-images: Allow common image formats, max 10MB
update storage.buckets
set file_size_limit = 10485760,  -- 10MB in bytes
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
where name = 'gallery-images';

-- thumbnails: Allow common image formats, max 2MB
update storage.buckets
set file_size_limit = 2097152,  -- 2MB in bytes
    allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp']
where name = 'thumbnails'; 