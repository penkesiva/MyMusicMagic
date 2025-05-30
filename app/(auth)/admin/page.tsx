'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { TrackUploadForm } from '@/components/admin/TrackUploadForm'
import { TrackEditForm } from '@/components/admin/TrackEditForm'
import { Database } from '@/types/database'
import { PencilIcon, XMarkIcon, ListBulletIcon, Squares2X2Icon } from '@heroicons/react/24/outline'

type Track = Database['public']['Tables']['tracks']['Row']

type ViewMode = 'grid' | 'list'

export default function AdminPage() {
  const [tracks, setTracks] = useState<Track[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingTrack, setEditingTrack] = useState<Track | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const supabase = createClient()

  const fetchTracks = async () => {
    try {
      const { data, error } = await supabase
        .from('tracks')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setTracks(data || [])
    } catch (err) {
      console.error('Error fetching tracks:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTracks()
  }, [supabase])

  const handleEdit = (track: Track) => {
    setEditingTrack(track)
  }

  const handleSave = async () => {
    await fetchTracks()
    setEditingTrack(null)
  }

  const handleCancel = () => {
    setEditingTrack(null)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-100">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Track Management</h1>
        <p className="mt-2 text-sm text-gray-400">
          Upload new tracks or edit existing ones in your collection.
        </p>
      </div>

      <TrackUploadForm onUploadComplete={fetchTracks} />

      <div className="mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Your Tracks</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-dark-300'
              }`}
              title="List view"
            >
              <ListBulletIcon className="h-5 w-5" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-dark-300'
              }`}
              title="Grid view"
            >
              <Squares2X2Icon className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className={viewMode === 'grid' 
          ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          : "space-y-4"
        }>
          {tracks.map((track) => (
            <div
              key={track.id}
              className={`bg-dark-200 rounded-lg overflow-hidden ${
                viewMode === 'list' ? 'flex' : ''
              }`}
            >
              <div className={`relative ${viewMode === 'list' ? 'w-48 flex-shrink-0' : 'aspect-square'}`}>
                <img
                  src={track.thumbnail_url}
                  alt={track.title}
                  className={`w-full h-full object-cover ${
                    viewMode === 'list' ? 'h-48' : ''
                  }`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end p-4">
                  <div className="w-full">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-white">
                        {new Date(track.created_at).toLocaleDateString()}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          track.is_published
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}
                      >
                        {track.is_published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleEdit(track)}
                  className="absolute top-2 right-2 p-2 bg-dark-200/80 rounded-full text-gray-400 hover:text-white transition-colors"
                  title="Edit track"
                >
                  <PencilIcon className="h-5 w-5" />
                </button>
              </div>
              <div className={`p-4 ${viewMode === 'list' ? 'flex-grow' : ''}`}>
                <h3 className="text-lg font-semibold text-white">
                  {track.title}
                </h3>
                {track.description && (
                  <p className={`mt-1 text-sm text-gray-400 ${
                    viewMode === 'grid' ? 'line-clamp-2' : ''
                  }`}>
                    {track.description}
                  </p>
                )}
                {viewMode === 'list' && (
                  <div className="mt-2 space-y-2">
                    {track.composer_notes && (
                      <p className="text-sm text-gray-400 line-clamp-2">
                        <span className="font-medium text-gray-300">Composer Notes:</span> {track.composer_notes}
                      </p>
                    )}
                    {track.lyrics && (
                      <p className="text-sm text-gray-400 line-clamp-2">
                        <span className="font-medium text-gray-300">Lyrics:</span> {track.lyrics}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Edit Modal */}
      {editingTrack && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-2xl">
            <TrackEditForm
              track={editingTrack}
              onSave={handleSave}
              onCancel={handleCancel}
            />
          </div>
        </div>
      )}
    </div>
  )
} 