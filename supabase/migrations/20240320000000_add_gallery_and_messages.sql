-- Create gallery table
create table if not exists public.gallery (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  image_url text not null,
  date timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create messages table
create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  email text not null,
  message text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  is_read boolean default false not null
);

-- Add RLS policies
alter table public.gallery enable row level security;
alter table public.messages enable row level security;

-- Gallery policies
create policy "Gallery is viewable by everyone"
  on public.gallery for select
  using (true);

create policy "Gallery is insertable by authenticated users"
  on public.gallery for insert
  to authenticated
  with check (true);

create policy "Gallery is updatable by authenticated users"
  on public.gallery for update
  to authenticated
  using (true);

create policy "Gallery is deletable by authenticated users"
  on public.gallery for delete
  to authenticated
  using (true);

-- Messages policies
create policy "Messages are insertable by everyone"
  on public.messages for insert
  with check (true);

create policy "Messages are viewable by authenticated users"
  on public.messages for select
  to authenticated
  using (true);

create policy "Messages are updatable by authenticated users"
  on public.messages for update
  to authenticated
  using (true); 