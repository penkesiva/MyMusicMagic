'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Database } from '@/types/database';
import { PencilIcon, XMarkIcon, CheckIcon, PhotoIcon } from '@heroicons/react/24/outline';

type Track = Database['public']['Tables']['tracks']['Row'];

interface TrackEditFormProps {
  track: Track;
  onSave: () => void;
  onCancel: () => void;
}

export function TrackEditForm({ track, onSave, onCancel }: TrackEditFormProps) {
  const [title, setTitle] = useState(track.title);
  const [description, setDescription] = useState(track.description || '');
  const [composerNotes, setComposerNotes] = useState(track.composer_notes || '');
  const [lyrics, setLyrics] = useState(track.lyrics || '');
  const [isPublished, setIsPublished] = useState(track.is_published);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const thumbnailFileRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  useEffect(() => {
    // Cleanup preview URL when component unmounts
    return () => {
      if (thumbnailPreview) {
        URL.revokeObjectURL(thumbnailPreview);
      }
    };
  }, [thumbnailPreview]);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const previewUrl = URL.createObjectURL(file);
      setThumbnailPreview(previewUrl);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      let thumbnailUrl = track.thumbnail_url;

      // Upload new thumbnail if one was selected
      if (thumbnailFile) {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) throw new Error('Not authenticated');

        const thumbnailPath = `${user.id}/${Date.now()}-${thumbnailFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from('thumbnails')
          .upload(thumbnailPath, thumbnailFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('thumbnails')
          .getPublicUrl(thumbnailPath);

        thumbnailUrl = urlData.publicUrl;
      }

      console.log('Updating track:', {
        id: track.id,
        title,
        description,
        composerNotes,
        lyrics,
        isPublished,
        thumbnailUrl,
      });

      const updateData = {
        title,
        description: description || null,
        composer_notes: composerNotes || null,
        lyrics: lyrics || null,
        is_published: isPublished,
        thumbnail_url: thumbnailUrl,
      };

      console.log('Update data:', updateData);

      const { data, error: updateError } = await supabase
        .from('tracks')
        .update(updateData)
        .eq('id', track.id)
        .select()
        .single();

      if (updateError) {
        console.error('Supabase update error:', updateError);
        throw new Error(`Database error: ${updateError.message}`);
      }

      if (!data) {
        console.error('No data returned from update');
        throw new Error('Failed to update track: No data returned');
      }

      console.log('Track updated successfully:', data);
      onSave();
    } catch (err) {
      console.error('Error updating track:', err);
      setError(err instanceof Error ? err.message : 'Failed to update track. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-dark-200 p-6 rounded-lg">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-white">Edit Track</h3>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            disabled={isSaving}
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
          <button
            type="submit"
            className="p-2 text-green-400 hover:text-green-300 transition-colors"
            disabled={isSaving}
          >
            <CheckIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {/* Thumbnail Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Thumbnail
          </label>
          <div className="flex items-start space-x-4">
            <div className="relative w-32 h-32 rounded-lg overflow-hidden bg-dark-300">
              <img
                src={thumbnailPreview || track.thumbnail_url}
                alt="Track thumbnail"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                <PhotoIcon className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="flex-grow">
              <input
                type="file"
                ref={thumbnailFileRef}
                accept="image/*"
                onChange={handleThumbnailChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => thumbnailFileRef.current?.click()}
                className="px-3 py-1.5 bg-dark-300 text-white rounded-lg hover:bg-dark-400 transition-colors text-sm font-medium"
              >
                Change Thumbnail
              </button>
              <p className="mt-2 text-xs text-gray-400">
                Recommended size: 1000x1000px. Max file size: 5MB.
              </p>
            </div>
          </div>
        </div>

        {/* Existing form fields */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-300">
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={track.title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-dark-300 border border-dark-400 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-300">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={track.description || ''}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 block w-full px-3 py-2 bg-dark-300 border border-dark-400 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          />
        </div>

        <div>
          <label htmlFor="composerNotes" className="block text-sm font-medium text-gray-300">
            Composer Notes
          </label>
          <textarea
            id="composerNotes"
            name="composer_notes"
            value={track.composer_notes || ''}
            onChange={(e) => setComposerNotes(e.target.value)}
            rows={3}
            className="mt-1 block w-full px-3 py-2 bg-dark-300 border border-dark-400 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          />
        </div>

        <div>
          <label htmlFor="lyrics" className="block text-sm font-medium text-gray-300">
            Lyrics
          </label>
          <textarea
            id="lyrics"
            name="lyrics"
            value={track.lyrics || ''}
            onChange={(e) => setLyrics(e.target.value)}
            rows={5}
            className="mt-1 block w-full px-3 py-2 bg-dark-300 border border-dark-400 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isPublished"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="h-4 w-4 rounded border-dark-400 text-indigo-600 focus:ring-indigo-500"
          />
          <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-300">
            Publish track
          </label>
        </div>
      </div>
    </form>
  );
} 