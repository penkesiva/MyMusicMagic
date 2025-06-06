-- Create artist_info table
create table artist_info (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  about_text text not null,
  footer_text text,
  use_same_text boolean default true not null,
  photo_url text not null,
  user_id uuid references auth.users on delete cascade not null
);

-- Create artist_links table
create table artist_links (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  url text not null,
  artist_info_id uuid references artist_info on delete cascade not null
);

-- Set up Row Level Security (RLS)
alter table artist_info enable row level security;
alter table artist_links enable row level security;

-- Create policies
create policy "Artist info is viewable by everyone"
  on artist_info for select
  using (true);

create policy "Users can insert their own artist info"
  on artist_info for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own artist info"
  on artist_info for update
  using (auth.uid() = user_id);

create policy "Artist links are viewable by everyone"
  on artist_links for select
  using (true);

create policy "Users can insert their own artist links"
  on artist_links for insert
  with check (exists (
    select 1 from artist_info
    where id = artist_info_id
    and user_id = auth.uid()
  ));

create policy "Users can update their own artist links"
  on artist_links for update
  using (exists (
    select 1 from artist_info
    where id = artist_info_id
    and user_id = auth.uid()
  ));

create policy "Users can delete their own artist links"
  on artist_links for delete
  using (exists (
    select 1 from artist_info
    where id = artist_info_id
    and user_id = auth.uid()
  ));

-- Create storage bucket for artist photos
insert into storage.buckets (id, name, public) values ('artist-photos', 'artist-photos', true);

-- Set up storage policies for artist photos
create policy "Artist photos are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'artist-photos');

create policy "Users can upload artist photos"
  on storage.objects for insert
  with check (bucket_id = 'artist-photos' AND auth.uid() = owner);

create policy "Users can update their own artist photos"
  on storage.objects for update
  using (bucket_id = 'artist-photos' AND auth.uid() = owner);

create policy "Users can delete their own artist photos"
  on storage.objects for delete
  using (bucket_id = 'artist-photos' AND auth.uid() = owner);
