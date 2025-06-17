'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'
import { XMarkIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline'

type Track = Database['public']['Tables']['tracks']['Insert']

interface TrackUploadFormProps {
  onUploadComplete?: () => void;
}

export function TrackUploadForm({ onUploadComplete }: TrackUploadFormProps) {
  const [track, setTrack] = useState<Partial<Track>>({
    title: '',
    description: '',
    composer_notes: '',
    lyrics: '',
    is_published: false,
  })
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showOptionalFields, setShowOptionalFields] = useState(false)
  const audioFileRef = useRef<HTMLInputElement>(null)
  const thumbnailFileRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target
    setTrack((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const getAudioDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const audio = new Audio()
      audio.addEventListener('loadedmetadata', () => {
        resolve(audio.duration)
      })
      audio.src = URL.createObjectURL(file)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUploading(true)
    setError(null)
    setSuccess(false)

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError
      if (!user) throw new Error('Not authenticated')

      const audioFile = audioFileRef.current?.files?.[0]
      const thumbnailFile = thumbnailFileRef.current?.files?.[0]

      if (!audioFile) {
        throw new Error('Please select an audio file')
      }

      // Get audio duration
      const duration = await getAudioDuration(audioFile)

      // Upload audio file
      const audioPath = `${user.id}/tracks/${Date.now()}-${audioFile.name}`
      const { error: audioError } = await supabase.storage
        .from('tracks')
        .upload(audioPath, audioFile, {
          cacheControl: '3600',
          upsert: false
        })

      if (audioError) throw audioError

      const { data: audioUrlData } = supabase.storage
        .from('tracks')
        .getPublicUrl(audioPath)

      let thumbnailUrl = ''

      // Upload thumbnail if provided
      if (thumbnailFile) {
        const thumbnailPath = `${user.id}/thumbnails/${Date.now()}-${thumbnailFile.name}`
        const { error: thumbnailError } = await supabase.storage
          .from('track-thumbnails')
          .upload(thumbnailPath, thumbnailFile, {
            cacheControl: '3600',
            upsert: false
          })

        if (thumbnailError) throw thumbnailError

        const { data: thumbnailUrlData } = supabase.storage
          .from('track-thumbnails')
          .getPublicUrl(thumbnailPath)

        thumbnailUrl = thumbnailUrlData.publicUrl
      }

      // Create track record with all required fields
      const trackData: Track = {
        title: track.title || '',
        description: track.description || null,
        duration: Math.round(duration),
        audio_url: audioUrlData.publicUrl,
        thumbnail_url: thumbnailUrl,
        composer_notes: track.composer_notes || null,
        lyrics: track.lyrics || null,
        is_published: track.is_published || false,
        user_id: user.id,
      }

      const { error: insertError } = await supabase
        .from('tracks')
        .insert(trackData)

      if (insertError) throw insertError

      setSuccess(true)
      resetForm()
      onUploadComplete?.()
    } catch (err) {
      console.error('Error uploading track:', err)
      setError(err instanceof Error ? err.message : 'An error occurred while uploading the track')
    } finally {
      setIsUploading(false)
    }
  }

  const resetForm = () => {
    setTrack({
      title: '',
      description: '',
      composer_notes: '',
      lyrics: '',
      is_published: false,
    })
    if (audioFileRef.current) audioFileRef.current.value = ''
    if (thumbnailFileRef.current) thumbnailFileRef.current.value = ''
    setError(null)
    setSuccess(false)
  }

  const handleCancel = () => {
    resetForm()
    onUploadComplete?.()
  }

  return (
    <div className="bg-dark-200 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-dark-300">
        <h3 className="text-lg font-medium text-white">Upload Track</h3>
        <button
          onClick={handleCancel}
          className="p-2 text-gray-400 hover:text-white transition-colors"
          disabled={isUploading}
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500 rounded-lg">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-500/10 border border-green-500 rounded-lg">
            <p className="text-sm text-green-500">Track uploaded successfully!</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-300"
            >
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={track.title || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 bg-dark-300 border border-dark-400 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowOptionalFields(!showOptionalFields)}
            className="flex items-center text-sm text-gray-400 hover:text-white transition-colors"
          >
            {showOptionalFields ? (
              <>
                <ChevronUpIcon className="h-4 w-4 mr-1" />
                Hide optional details
              </>
            ) : (
              <>
                <ChevronDownIcon className="h-4 w-4 mr-1" />
                Show optional details
              </>
            )}
          </button>

          {showOptionalFields && (
            <div className="space-y-4 pt-2 border-t border-dark-300">
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-300"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={track.description || ''}
                  onChange={handleInputChange}
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 bg-dark-300 border border-dark-400 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="composer_notes"
                  className="block text-sm font-medium text-gray-300"
                >
                  Composer Notes
                </label>
                <textarea
                  id="composer_notes"
                  name="composer_notes"
                  value={track.composer_notes || ''}
                  onChange={handleInputChange}
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 bg-dark-300 border border-dark-400 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="lyrics"
                  className="block text-sm font-medium text-gray-300"
                >
                  Lyrics
                </label>
                <textarea
                  id="lyrics"
                  name="lyrics"
                  value={track.lyrics || ''}
                  onChange={handleInputChange}
                  rows={5}
                  className="mt-1 block w-full px-3 py-2 bg-dark-300 border border-dark-400 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
          )}

          <div>
            <label
              htmlFor="audio_file"
              className="block text-sm font-medium text-gray-300"
            >
              Audio File *
            </label>
            <input
              type="file"
              id="audio_file"
              name="audio_file"
              ref={audioFileRef}
              accept="audio/*"
              required
              className="mt-1 block w-full px-3 py-2 bg-dark-300 border border-dark-400 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="thumbnail_file"
              className="block text-sm font-medium text-gray-300"
            >
              Thumbnail Image
            </label>
            <input
              type="file"
              id="thumbnail_file"
              name="thumbnail_file"
              ref={thumbnailFileRef}
              accept="image/*"
              className="mt-1 block w-full px-3 py-2 bg-dark-300 border border-dark-400 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_published"
              name="is_published"
              checked={track.is_published || false}
              onChange={handleInputChange}
              className="h-4 w-4 rounded border-dark-400 bg-dark-300 text-primary-500 focus:ring-primary-500"
            />
            <label
              htmlFor="is_published"
              className="ml-2 block text-sm text-gray-300"
            >
              Publish track
            </label>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isUploading}
            className="px-3 py-1.5 text-sm font-medium text-gray-300 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isUploading}
            className="px-3 py-1.5 text-sm font-medium text-white bg-primary-500 rounded-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-dark-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isUploading ? 'Uploading...' : 'Upload Track'}
          </button>
        </div>
      </form>
    </div>
  )
} 