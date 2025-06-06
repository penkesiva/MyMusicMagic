-- Step 1: Drop existing tables if they exist
DROP TABLE IF EXISTS public.artist_links;
DROP TABLE IF EXISTS public.artist_info;

-- Step 2: Create artist_info table
CREATE TABLE public.artist_info (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    about_text TEXT,
    photo_url TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Step 3: Create artist_links table
CREATE TABLE public.artist_links (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    artist_info_id UUID REFERENCES public.artist_info(id) ON DELETE CASCADE NOT NULL
);

-- Step 4: Enable Row Level Security
ALTER TABLE public.artist_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.artist_links ENABLE ROW LEVEL SECURITY;

-- Step 5: Create policies for artist_info
CREATE POLICY "Enable read access for all users" ON public.artist_info
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.artist_info
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for users based on user_id" ON public.artist_info
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Enable delete for users based on user_id" ON public.artist_info
    FOR DELETE USING (auth.uid() = user_id);

-- Step 6: Create policies for artist_links
CREATE POLICY "Enable read access for all users" ON public.artist_links
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.artist_links
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.artist_info
            WHERE id = artist_info_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Enable update for users based on artist_info" ON public.artist_links
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.artist_info
            WHERE id = artist_info_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "Enable delete for users based on artist_info" ON public.artist_links
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.artist_info
            WHERE id = artist_info_id
            AND user_id = auth.uid()
        )
    );

-- Step 7: Create storage bucket for artist photos
INSERT INTO storage.buckets (id, name, public)
VALUES ('artist-photos', 'artist-photos', true)
ON CONFLICT (id) DO NOTHING;

-- Step 8: Create storage policies
CREATE POLICY "Give public access to artist photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'artist-photos');

CREATE POLICY "Allow authenticated users to upload artist photos"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'artist-photos'
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow users to update their own artist photos"
ON storage.objects FOR UPDATE
USING (
    bucket_id = 'artist-photos'
    AND auth.role() = 'authenticated'
);

CREATE POLICY "Allow users to delete their own artist photos"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'artist-photos'
    AND auth.role() = 'authenticated'
); 