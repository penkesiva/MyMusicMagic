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
  viewMode?: 'list' | 'grid'
}

export default function PortfolioTracksDisplay({ portfolioId, onEdit, onRefresh, viewMode = 'list' }: PortfolioTracksDisplayProps) {
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
      <div className="text-center p-8 border-2 border-dashed border-white/20 rounded-lg">
        <h3 className="text-lg font-semibold text-white/80">No Tracks Found</h3>
        <p className="text-sm text-white/50 mt-2">Add your first track to get started.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {tracks.map((track) => (
            <div key={track.id} className="bg-white/5 rounded-lg overflow-hidden border border-white/10 group">
              <div className="relative aspect-square">
                <img src={track.thumbnail_url || '/default-track-thumbnail.jpg'} alt={track.title} className="w-full h-full object-cover"/>
                 <button onClick={() => handlePlayPause(track)} className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {playingTrack === track.id ? (<PauseIcon className="h-8 w-8 text-white" />) : (<PlayIcon className="h-8 w-8 text-white ml-1" />)}
                </button>
              </div>
              <div className="p-3">
                <h4 className="font-medium text-sm text-white truncate">{track.title}</h4>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-gray-400 text-xs">{formatDuration(track.duration)}</p>
                  <div className="flex items-center gap-1">
                    {onEdit && (<button onClick={() => onEdit(track)} className="p-1 text-blue-400 hover:text-blue-300" title="Edit"><PencilIcon className="h-4 w-4" /></button>)}
                    <button onClick={() => handleDelete(track.id)} disabled={deletingTrack === track.id} className="p-1 text-red-400 hover:text-red-300" title="Delete"><TrashIcon className="h-4 w-4" /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {tracks.map((track) => (
            <div key={track.id} className="flex items-center p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="relative w-16 h-16 flex-shrink-0">
                <img src={track.thumbnail_url || '/default-track-thumbnail.jpg'} alt={track.title} className="w-full h-full object-cover rounded-md"/>
                <button onClick={() => handlePlayPause(track)} className="absolute inset-0 bg-black/40 rounded-md flex items-center justify-center hover:bg-black/60 transition-colors">
                  {playingTrack === track.id ? (<PauseIcon className="h-6 w-6 text-white" />) : (<PlayIcon className="h-6 w-6 text-white ml-1" />)}
                </button>
              </div>
              <div className="flex-1 min-w-0 mx-4">
                <h4 className="font-medium text-sm text-white truncate">{track.title}</h4>
                <p className="text-gray-400 text-xs truncate">{track.description}</p>
              </div>
              <div className="text-gray-400 text-xs mx-4">{formatDuration(track.duration)}</div>
              <div className="flex items-center gap-2">
                {onEdit && (<button onClick={() => onEdit(track)} className="p-2 text-blue-400 hover:text-blue-300 transition-colors" title="Edit track"><PencilIcon className="h-4 w-4" /></button>)}
                <button onClick={() => handleDelete(track.id)} disabled={deletingTrack === track.id} className="p-2 text-red-400 hover:text-red-300 disabled:text-red-600 transition-colors" title="Delete track"><TrashIcon className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 