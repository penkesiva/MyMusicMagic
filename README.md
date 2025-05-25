# My Music Magic

A professional music showcase website built with Next.js, Tailwind CSS, and Supabase. This platform allows artists to showcase their musical compositions with a beautiful, responsive interface and an admin dashboard for content management.

## Features

- 🎵 Beautiful music showcase with grid and list views
- 🎨 Modern, responsive design with dark theme
- 🎧 In-page audio player with waveform visualization
- 🔒 Secure admin dashboard with authentication
- 📤 Easy track upload with metadata management
- 🎯 SEO optimized with OpenGraph and Twitter cards
- 🚀 Fast performance with Next.js and server components

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, Tailwind CSS, Framer Motion
- **Backend**: Supabase (Auth, Storage, PostgreSQL)
- **Deployment**: Vercel
- **Styling**: Tailwind CSS with custom design system
- **Animations**: Framer Motion for smooth transitions

## Prerequisites

- Node.js 18+ and npm/yarn
- Supabase account
- Vercel account (for deployment)

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/mymusicmagic.git
   cd mymusicmagic
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Set up Supabase:
   - Create a new Supabase project
   - Run the following SQL in the Supabase SQL editor to create the necessary tables:
     ```sql
     -- Create profiles table
     create table profiles (
       id uuid references auth.users on delete cascade,
       updated_at timestamp with time zone,
       username text unique,
       full_name text,
       avatar_url text,
       bio text,
       website text,
       role text default 'user'::text,
       primary key (id)
     );

     -- Create tracks table
     create table tracks (
       id uuid default uuid_generate_v4() primary key,
       created_at timestamp with time zone default timezone('utc'::text, now()) not null,
       title text not null,
       description text,
       duration integer not null,
       audio_url text not null,
       thumbnail_url text not null,
       composer_notes text,
       lyrics text,
       release_date timestamp with time zone,
       is_published boolean default false,
       user_id uuid references auth.users on delete cascade not null
     );

     -- Set up Row Level Security (RLS)
     alter table profiles enable row level security;
     alter table tracks enable row level security;

     -- Create policies
     create policy "Public profiles are viewable by everyone"
       on profiles for select
       using (true);

     create policy "Users can insert their own profile"
       on profiles for insert
       with check (auth.uid() = id);

     create policy "Users can update their own profile"
       on profiles for update
       using (auth.uid() = id);

     create policy "Tracks are viewable by everyone when published"
       on tracks for select
       using (is_published = true);

     create policy "Users can insert their own tracks"
       on tracks for insert
       with check (auth.uid() = user_id);

     create policy "Users can update their own tracks"
       on tracks for update
       using (auth.uid() = user_id);

     create policy "Users can delete their own tracks"
       on tracks for delete
       using (auth.uid() = user_id);

     -- Create storage buckets
     insert into storage.buckets (id, name, public) values ('audio', 'audio', true);
     insert into storage.buckets (id, name, public) values ('thumbnails', 'thumbnails', true);

     -- Set up storage policies
     create policy "Audio files are publicly accessible"
       on storage.objects for select
       using (bucket_id = 'audio');

     create policy "Thumbnail images are publicly accessible"
       on storage.objects for select
       using (bucket_id = 'thumbnails');

     create policy "Users can upload audio files"
       on storage.objects for insert
       with check (bucket_id = 'audio' AND auth.uid() = owner);

     create policy "Users can upload thumbnail images"
       on storage.objects for insert
       with check (bucket_id = 'thumbnails' AND auth.uid() = owner);
     ```

5. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add your environment variables in the Vercel dashboard
4. Deploy!

## Project Structure

```
mymusicmagic/
├── app/                      # Next.js 14 app directory
│   ├── (auth)/              # Auth group routes
│   │   ├── admin/           # Admin routes
│   │   └── login/           # Login page
│   ├── api/                 # API routes
│   ├── tracks/              # Public track pages
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Landing page
├── components/              # Reusable components
│   ├── auth/               # Auth components
│   ├── player/             # Audio player components
│   ├── tracks/             # Track display components
│   └── ui/                 # UI components
├── lib/                    # Utility functions
│   ├── supabase/          # Supabase client & helpers
│   └── utils/             # General utilities
├── public/                # Static assets
├── styles/               # Global styles
└── types/               # TypeScript types
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.io/)
- [Framer Motion](https://www.framer.com/motion/)
- [React Icons](https://react-icons.github.io/react-icons/) 