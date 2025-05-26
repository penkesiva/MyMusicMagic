'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'

type Track = Database['public']['Tables']['tracks']['Insert']

interface TrackUploadFormProps {
  onUploadComplete?: () => void;
}

export function TrackUploadForm({ onUploadComplete }: TrackUploadFormProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [track, setTrack] = useState<Partial<Track>>({
    title: '',
    description: '',
    composer_notes: '',
    lyrics: '',
    is_published: false,
  })
  
  const audioFileRef = useRef<HTMLInputElement>(null)
  const thumbnailFileRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target
    setTrack((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value || '',
    }))
  }

  const getAudioDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const audio = new Audio()
      audio.src = URL.createObjectURL(file)
      audio.addEventListener('loadedmetadata', () => {
        URL.revokeObjectURL(audio.src)
        resolve(audio.duration)
      })
      audio.addEventListener('error', reject)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setIsUploading(true)

    try {
      const audioFile = audioFileRef.current?.files?.[0]
      const thumbnailFile = thumbnailFileRef.current?.files?.[0]

      if (!audioFile || !thumbnailFile) {
        throw new Error('Please select both audio and thumbnail files')
      }

      if (!track.title) {
        throw new Error('Title is required')
      }

      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) {
        console.error('Auth error:', userError)
        throw new Error(`Authentication error: ${userError.message}`)
      }
      if (!user) throw new Error('Not authenticated')

      console.log('Starting file uploads...')
      console.log('Audio file:', audioFile.name, 'Size:', audioFile.size)
      console.log('Thumbnail file:', thumbnailFile.name, 'Size:', thumbnailFile.size)

      // Upload audio file
      const audioPath = `${user.id}/${Date.now()}-${audioFile.name}`
      console.log('Uploading audio to path:', audioPath)
      const { data: audioData, error: audioError } = await supabase.storage
        .from('audio')
        .upload(audioPath, audioFile, {
          cacheControl: '3600',
          upsert: false
        })
      
      if (audioError) {
        console.error('Audio upload error:', audioError)
        throw new Error(`Audio upload failed: ${audioError.message}`)
      }
      console.log('Audio upload successful:', audioData)

      // Upload thumbnail
      const thumbnailPath = `${user.id}/${Date.now()}-${thumbnailFile.name}`
      console.log('Uploading thumbnail to path:', thumbnailPath)
      const { data: thumbnailData, error: thumbnailError } = await supabase.storage
        .from('thumbnails')
        .upload(thumbnailPath, thumbnailFile, {
          cacheControl: '3600',
          upsert: false
        })
      
      if (thumbnailError) {
        console.error('Thumbnail upload error:', thumbnailError)
        throw new Error(`Thumbnail upload failed: ${thumbnailError.message}`)
      }
      console.log('Thumbnail upload successful:', thumbnailData)

      // Get public URLs
      const { data: audioUrl } = supabase.storage
        .from('audio')
        .getPublicUrl(audioPath)
      const { data: thumbnailUrl } = supabase.storage
        .from('thumbnails')
        .getPublicUrl(thumbnailPath)

      console.log('Generated URLs:', { audioUrl, thumbnailUrl })

      // Get audio duration
      const duration = await getAudioDuration(audioFile)
      console.log('Audio duration:', duration)

      // Create track record
      const trackData = {
        ...track,
        audio_url: audioUrl.publicUrl,
        thumbnail_url: thumbnailUrl.publicUrl,
        duration,
        user_id: user.id,
      }
      console.log('Creating track record:', trackData)
      
      const { data: trackRecord, error: trackError } = await supabase
        .from('tracks')
        .insert(trackData)
        .select()
        .single()

      if (trackError) {
        console.error('Track creation error:', trackError)
        throw new Error(`Failed to create track: ${trackError.message}`)
      }
      console.log('Track created successfully:', trackRecord)

      setSuccess(true)
      setTrack({
        title: '',
        description: '',
        composer_notes: '',
        lyrics: '',
        is_published: false,
      })
      if (audioFileRef.current) audioFileRef.current.value = ''
      if (thumbnailFileRef.current) thumbnailFileRef.current.value = ''

      // Notify parent component
      onUploadComplete?.()
    } catch (err) {
      console.error('Upload error:', err)
      setError(err instanceof Error ? err.message : 'An error occurred during upload')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6">
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
            value={track.title}
            onChange={handleInputChange}
            className="mt-1 block w-full px-3 py-2 bg-dark-300 border border-dark-400 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

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
            className="mt-1 block w-full px-3 py-2 bg-dark-300 border border-dark-400 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
            rows={4}
            className="mt-1 block w-full px-3 py-2 bg-dark-300 border border-dark-400 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
            rows={6}
            className="mt-1 block w-full px-3 py-2 bg-dark-300 border border-dark-400 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <div>
          <label
            htmlFor="audio"
            className="block text-sm font-medium text-gray-300"
          >
            Audio File *
          </label>
          <input
            type="file"
            id="audio"
            ref={audioFileRef}
            accept="audio/*"
            required
            className="mt-1 block w-full text-sm text-gray-400
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:text-sm file:font-medium
              file:bg-primary-500 file:text-white
              hover:file:bg-primary-600
              file:cursor-pointer"
          />
        </div>

        <div>
          <label
            htmlFor="thumbnail"
            className="block text-sm font-medium text-gray-300"
          >
            Thumbnail Image *
          </label>
          <input
            type="file"
            id="thumbnail"
            ref={thumbnailFileRef}
            accept="image/*"
            required
            className="mt-1 block w-full text-sm text-gray-400
              file:mr-4 file:py-2 file:px-4
              file:rounded-lg file:border-0
              file:text-sm file:font-medium
              file:bg-primary-500 file:text-white
              hover:file:bg-primary-600
              file:cursor-pointer"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_published"
            name="is_published"
            checked={track.is_published}
            onChange={handleInputChange}
            className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-dark-400 rounded"
          />
          <label
            htmlFor="is_published"
            className="ml-2 block text-sm text-gray-300"
          >
            Publish immediately
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={isUploading}
        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isUploading ? 'Uploading...' : 'Upload Track'}
      </button>
    </form>
  )
} 