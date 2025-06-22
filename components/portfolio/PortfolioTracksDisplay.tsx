'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'
import { PencilIcon, TrashIcon, PlayIcon, PauseIcon } from '@heroicons/react/24/outline'

type Track = Database['public']['Tables']['tracks']['Row']

interface PortfolioTracksDisplayProps {
  portfolioId: string
  onEdit?: (track: Track) => void
  onRefresh?: () => void
}

export default function PortfolioTracksDisplay({ portfolioId, onEdit, onRefresh }: PortfolioTracksDisplayProps) {
  const [tracks, setTracks] = useState<Track[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingTrack, setDeletingTrack] = useState<string | null>(null)
  const [playingTrack, setPlayingTrack] = useState<string | null>(null)
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)

  const supabase = createClient()

  useEffect(() => {
    fetchTracks()
  }, [portfolioId])

  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause()
        audio.src = ''
      }
    }
  }, [audio])

  const fetchTracks = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('tracks')
        .select('*')
        .eq('portfolio_id', portfolioId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching tracks:', error)
        setError('Failed to load tracks')
      } else {
        setTracks(data || [])
      }
    } catch (err) {
      console.error('Error fetching tracks:', err)
      setError('Failed to load tracks')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this track?')) return

    setDeletingTrack(id)
    try {
      const { error } = await supabase
        .from('tracks')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting track:', error)
        alert('Error deleting track')
      } else {
        await fetchTracks()
        onRefresh?.()
      }
    } catch (err) {
      console.error('Error deleting track:', err)
      alert('Error deleting track')
    } finally {
      setDeletingTrack(null)
    }
  }

  const handlePlayPause = (track: Track) => {
    if (playingTrack === track.id) {
      // Pause current track
      if (audio) {
        audio.pause()
      }
      setPlayingTrack(null)
      setAudio(null)
    } else {
      // Stop any currently playing track
      if (audio) {
        audio.pause()
        audio.src = ''
      }

      // Play new track
      const newAudio = new Audio(track.audio_url)
      newAudio.addEventListener('ended', () => {
        setPlayingTrack(null)
        setAudio(null)
      })
      newAudio.play()
      setPlayingTrack(track.id)
      setAudio(newAudio)
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    )
  }

  if (tracks.length === 0) {
    return (
      <div className="bg-dark-400/30 rounded-lg p-6 text-center">
        <div className="text-gray-400 mb-2">🎵 No tracks yet</div>
        <p className="text-gray-500 text-sm">Add your first track to get started.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {tracks.map((track) => (
        <div key={track.id} className="bg-dark-400/50 rounded-lg p-4 border border-gray-600">
          <div className="flex items-center gap-4">
            {/* Thumbnail */}
            <div className="relative w-16 h-16 flex-shrink-0">
              <img
                src={track.thumbnail_url || '/default-track-thumbnail.jpg'}
                alt={track.title}
                className="w-full h-full object-cover rounded-lg"
              />
              <button
                onClick={() => handlePlayPause(track)}
                className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center hover:bg-black/60 transition-colors"
              >
                {playingTrack === track.id ? (
                  <PauseIcon className="h-6 w-6 text-white" />
                ) : (
                  <PlayIcon className="h-6 w-6 text-white ml-1" />
                )}
              </button>
            </div>

            {/* Track Info */}
            <div className="flex-1 min-w-0">
              <h4 className="text-white font-medium text-sm mb-1 line-clamp-1">{track.title}</h4>
              {track.description && (
                <p className="text-gray-500 text-xs mb-2 line-clamp-1">{track.description}</p>
              )}
              <div className="flex items-center gap-4 text-xs text-gray-500">
                {track.duration && (
                  <span>{formatDuration(track.duration)}</span>
                )}
                <span>{formatDate(track.created_at)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(track)}
                  className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                  title="Edit track"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
              )}
              <button
                onClick={() => handleDelete(track.id)}
                disabled={deletingTrack === track.id}
                className="p-2 text-red-400 hover:text-red-300 disabled:text-red-600 transition-colors"
                title="Delete track"
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
} 