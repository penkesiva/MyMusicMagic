'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'
import { XMarkIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline'

type Track = Database['public']['Tables']['tracks']['Row']
type TrackInsert = Database['public']['Tables']['tracks']['Insert']
type TrackUpdate = Database['public']['Tables']['tracks']['Update']


interface PortfolioTrackFormProps {
  portfolioId: string
  track?: Track | null
  onSuccess: () => void
  onCancel: () => void
}

export function PortfolioTrackForm({ portfolioId, track: trackToEdit, onSuccess, onCancel }: PortfolioTrackFormProps) {
  const [track, setTrack] = useState<Partial<TrackUpdate>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showOptionalFields, setShowOptionalFields] = useState(false)
  const audioFileRef = useRef<HTMLInputElement>(null)
  const thumbnailFileRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  useEffect(() => {
    if (trackToEdit) {
      setTrack(trackToEdit)
      setShowOptionalFields(!!(trackToEdit.description || trackToEdit.composer_notes || trackToEdit.lyrics))
    } else {
      setTrack({ title: '', description: '', composer_notes: '', lyrics: '', is_published: false })
    }
  }, [trackToEdit])

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
    setIsSubmitting(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const audioFile = audioFileRef.current?.files?.[0]
      const thumbnailFile = thumbnailFileRef.current?.files?.[0]

      let audio_url = track.audio_url || ''
      let duration = track.duration || 0

      if (audioFile) {
        duration = await getAudioDuration(audioFile)
        const fileExt = audioFile.name.split('.').pop()
        const fileName = `${Date.now()}-${Math.random()}.${fileExt}`
        const filePath = `portfolios/${portfolioId}/tracks/${fileName}`
        
        const { error: uploadError } = await supabase.storage.from('tracks').upload(filePath, audioFile)
        if (uploadError) throw uploadError
        audio_url = supabase.storage.from('tracks').getPublicUrl(filePath).data.publicUrl
      }

      let thumbnail_url = track.thumbnail_url || ''
      if (thumbnailFile) {
        const thumbnailPath = `portfolios/${portfolioId}/track-thumbnails/${Date.now()}-${thumbnailFile.name}`
        const { error: thumbnailError } = await supabase.storage.from('track-thumbnails').upload(thumbnailPath, thumbnailFile)
        if (thumbnailError) throw thumbnailError
        thumbnail_url = supabase.storage.from('track-thumbnails').getPublicUrl(thumbnailPath).data.publicUrl
      }

      const trackData: TrackUpdate = {
        ...track,
        audio_url,
        thumbnail_url,
        duration: Math.round(duration),
      }
      
      if (trackToEdit) {
        // Update
        delete trackData.id // Not allowed in update
        delete trackData.created_at
        const { error: dbError } = await supabase.from('tracks').update(trackData).eq('id', trackToEdit.id)
        if (dbError) throw dbError
      } else {
        // Insert
        const insertData: TrackInsert = {
            title: track.title || 'Untitled',
            description: track.description,
            composer_notes: track.composer_notes,
            lyrics: track.lyrics,
            is_published: track.is_published,
            audio_url: audio_url,
            thumbnail_url: thumbnail_url,
            duration: duration,
            user_id: user.id,
            portfolio_id: portfolioId,
        }
        const { error: dbError } = await supabase.from('tracks').insert(insertData)
        if (dbError) throw dbError
      }

      onSuccess()
    } catch (err) {
      console.error('Error submitting track:', err)
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-dark-400/90 backdrop-blur-sm rounded-lg p-6 border border-gray-600">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">{trackToEdit ? 'Edit Track' : 'Add New Track'}</h3>
        <button
          onClick={onCancel}
          className="p-2 text-gray-400 hover:text-white transition-colors"
          disabled={isSubmitting}
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500 rounded-lg">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300">Title *</label>
            <input
              type="text"
              id="title"
              name="title"
              required
              value={track.title || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 bg-dark-400 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300">Audio File *</label>
            <input
              type="file"
              ref={audioFileRef}
              accept="audio/*"
              required={!trackToEdit}
              className="mt-1 block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-500/10 file:text-primary-300 hover:file:bg-primary-500/20"
            />
             {trackToEdit && track.audio_url && <p className="text-xs text-gray-400 mt-1">Current: <a href={track.audio_url} target="_blank" rel="noopener noreferrer" className="underline hover:text-white">Listen</a>. Upload a new file to replace.</p>}
          </div>

          <button
            type="button"
            onClick={() => setShowOptionalFields(!showOptionalFields)}
            className="flex items-center text-sm text-gray-400 hover:text-white transition-colors"
          >
            {showOptionalFields ? <ChevronUpIcon className="h-4 w-4 mr-1" /> : <ChevronDownIcon className="h-4 w-4 mr-1" />}
            Optional Details
          </button>

          {showOptionalFields && (
            <div className="space-y-4 pt-2 border-t border-gray-600">
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-300">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={track.description || ''}
                  onChange={handleInputChange}
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300">Thumbnail Image</label>
                <input
                  type="file"
                  ref={thumbnailFileRef}
                  accept="image/*"
                  className="mt-1 block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-500/10 file:text-primary-300 hover:file:bg-primary-500/20"
                />
                 {trackToEdit && track.thumbnail_url && <img src={track.thumbnail_url} alt="thumbnail" className="mt-2 h-20 w-20 object-cover rounded-md" />}
              </div>

              <div>
                <label htmlFor="composer_notes" className="block text-sm font-medium text-gray-300">Composer Notes</label>
                <textarea
                  id="composer_notes"
                  name="composer_notes"
                  value={track.composer_notes || ''}
                  onChange={handleInputChange}
                  rows={3}
                  className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label htmlFor="lyrics" className="block text-sm font-medium text-gray-300">Lyrics</label>
                <textarea
                  id="lyrics"
                  name="lyrics"
                  value={track.lyrics || ''}
                  onChange={handleInputChange}
                  rows={5}
                  className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                />
              </div>

              <div className="flex items-center">
                <input
                  id="is_published"
                  name="is_published"
                  type="checkbox"
                  checked={!!track.is_published}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-indigo-500 focus:ring-indigo-500"
                />
                <label htmlFor="is_published" className="ml-2 block text-sm text-gray-300">
                  Published
                </label>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-600">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? 'Saving...' : (trackToEdit ? 'Save Changes' : 'Add Track')}
          </button>
        </div>
      </form>
    </div>
  )
} 