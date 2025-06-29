'use client'

import { useState, useEffect } from 'react'
import { Database } from '@/types/database'
import { Play, Pause, MoreVertical, Edit, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useAudioStore, playTrack } from '@/lib/audioState'

type Track = Database['public']['Tables']['tracks']['Row']

interface PortfolioTracksDisplayProps {
  portfolioId: string
  onEdit?: (track: Track) => void
  onRefresh?: () => void
  viewMode?: 'list' | 'grid'
  refreshKey?: number
  audioPlayerMode?: 'bottom' | 'inline'
}

export default function PortfolioTracksDisplay({ portfolioId, onEdit, onRefresh, viewMode = 'list', refreshKey = 0, audioPlayerMode = 'bottom' }: PortfolioTracksDisplayProps) {
  const [tracks, setTracks] = useState<Track[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  // Global audio state
  const { currentTrack, isPlaying } = useAudioStore()

  // Debug logging
  useEffect(() => {
    console.log('PortfolioTracksDisplay state:', {
      currentTrackId: currentTrack?.id,
      isPlaying,
      trackCount: tracks.length
    })
  }, [currentTrack, isPlaying, tracks.length])

  // Fetch tracks
  useEffect(() => {
    const fetchTracks = async () => {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from('tracks')
          .select('*')
          .eq('portfolio_id', portfolioId)
          .order('order', { ascending: true })

        if (error) {
          console.error('Error fetching tracks:', error)
          setError('Failed to load tracks')
        } else {
          setTracks(data || [])
        }
      } catch (err) {
        console.error('Error:', err)
        setError('Failed to load tracks')
      } finally {
        setLoading(false)
      }
    }

    fetchTracks()
  }, [portfolioId, refreshKey])

  const handlePlayPause = (track: Track) => {
    if (audioPlayerMode === 'inline') {
      // Inline mode - use global state
      playTrack(track)
    } else {
      // Bottom player mode - dispatch custom event for bottom player
      const playEvent = new CustomEvent('playTrack', {
        detail: { 
          track, 
          isPlaying: currentTrack?.id === track.id && isPlaying 
        }
      })
      window.dispatchEvent(playEvent)
    }
  }

  const handleDelete = async (trackId: string) => {
    try {
      const { error } = await supabase
        .from('tracks')
        .delete()
        .eq('id', trackId)

      if (error) {
        console.error('Error deleting track:', error)
        alert('Failed to delete track')
      } else {
        setTracks(tracks.filter(track => track.id !== trackId))
        setShowDeleteConfirm(null)
        onRefresh?.()
      }
    } catch (err) {
      console.error('Error:', err)
      alert('Failed to delete track')
    }
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-400">
        <p>{error}</p>
      </div>
    )
  }

  if (tracks.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <p>No tracks added yet.</p>
        <p className="text-sm mt-2">Add your first track to get started.</p>
      </div>
    )
  }

  const isCurrentTrack = (track: Track) => currentTrack?.id === track.id
  const isTrackPlaying = (track: Track) => isCurrentTrack(track) && isPlaying

  if (viewMode === 'grid') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tracks.map((track) => (
          <div key={track.id} className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-white/20 transition-colors">
            <div className="relative mb-4">
              <img
                src={track.thumbnail_url}
                alt={track.title}
                className="w-full h-48 object-cover rounded-lg"
              />
              <button
                onClick={() => handlePlayPause(track)}
                className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity rounded-lg"
              >
                {isTrackPlaying(track) ? (
                  <Pause className="w-12 h-12 text-white" />
                ) : (
                  <Play className="w-12 h-12 text-white ml-1" />
                )}
              </button>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-semibold text-white truncate">{track.title}</h3>
              {track.description && (
                <p className="text-gray-400 text-sm line-clamp-2">{track.description}</p>
              )}
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{formatDuration(track.duration || 0)}</span>
                <div className="flex items-center gap-2">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(track)}
                      className="p-1 hover:bg-white/10 rounded transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setShowDeleteConfirm(track.id)}
                    className="p-1 hover:bg-white/10 rounded transition-colors text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Delete confirmation */}
            {showDeleteConfirm === track.id && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg">
                <div className="bg-gray-800 p-4 rounded-lg text-center">
                  <p className="text-white mb-4">Delete this track?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleDelete(track.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(null)}
                      className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {tracks.map((track) => (
        <div key={track.id} className="flex items-center gap-4 bg-white/5 rounded-lg p-4 border border-white/10 hover:border-white/20 transition-colors">
          <img
            src={track.thumbnail_url}
            alt={track.title}
            className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
          />
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white truncate">{track.title}</h3>
            {track.description && (
              <p className="text-gray-400 text-sm truncate">{track.description}</p>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">{formatDuration(track.duration || 0)}</span>
            
            <button
              onClick={() => handlePlayPause(track)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              {isTrackPlaying(track) ? (
                <Pause className="w-5 h-5 text-white" />
              ) : (
                <Play className="w-5 h-5 text-white" />
              )}
            </button>
            
            <div className="flex items-center gap-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(track)}
                  className="p-1 hover:bg-white/10 rounded transition-colors"
                >
                  <Edit className="w-4 h-4 text-gray-400" />
                </button>
              )}
              <button
                onClick={() => setShowDeleteConfirm(track.id)}
                className="p-1 hover:bg-white/10 rounded transition-colors text-red-400 hover:text-red-300"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Delete confirmation */}
          {showDeleteConfirm === track.id && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg">
              <div className="bg-gray-800 p-4 rounded-lg text-center">
                <p className="text-white mb-4">Delete this track?</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDelete(track.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
} 