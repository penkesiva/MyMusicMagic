'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Database } from '@/types/database';
import { PencilIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';

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
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      console.log('Updating track:', {
        id: track.id,
        title,
        description,
        composerNotes,
        lyrics,
        isPublished,
      });

      const updateData = {
        title,
        description: description || null,
        composer_notes: composerNotes || null,
        lyrics: lyrics || null,
        is_published: isPublished,
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
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-300">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-md bg-dark-300 border-dark-400 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-300">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="mt-1 block w-full rounded-md bg-dark-300 border-dark-400 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="composerNotes" className="block text-sm font-medium text-gray-300">
            Composer Notes
          </label>
          <textarea
            id="composerNotes"
            value={composerNotes}
            onChange={(e) => setComposerNotes(e.target.value)}
            rows={4}
            className="mt-1 block w-full rounded-md bg-dark-300 border-dark-400 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="lyrics" className="block text-sm font-medium text-gray-300">
            Lyrics
          </label>
          <textarea
            id="lyrics"
            value={lyrics}
            onChange={(e) => setLyrics(e.target.value)}
            rows={6}
            className="mt-1 block w-full rounded-md bg-dark-300 border-dark-400 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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