'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { TrackUploadForm } from '@/components/admin/TrackUploadForm'
import { TrackEditForm } from '@/components/admin/TrackEditForm'
import { ArtistInfoForm } from '@/components/admin/ArtistInfoForm'
import { Database } from '@/types/database'
import { PencilIcon, XMarkIcon, ListBulletIcon, Squares2X2Icon, TrashIcon } from '@heroicons/react/24/outline'

type Track = Database['public']['Tables']['tracks']['Row']

type ViewMode = 'grid' | 'list'

export default function AdminPage() {
  const [tracks, setTracks] = useState<Track[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingTrack, setEditingTrack] = useState<Track | null>(null)
  const [deletingTrack, setDeletingTrack] = useState<Track | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [showArtistForm, setShowArtistForm] = useState(false)
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

  const handleDelete = async (track: Track) => {
    setIsDeleting(true)
    try {
      // Delete the track record
      const { error: deleteError } = await supabase
        .from('tracks')
        .delete()
        .eq('id', track.id)

      if (deleteError) throw deleteError

      // Delete the audio file
      const audioPath = track.audio_url.split('/').pop()
      if (audioPath) {
        const { error: audioError } = await supabase.storage
          .from('audio')
          .remove([audioPath])
        if (audioError) console.error('Error deleting audio file:', audioError)
      }

      // Delete the thumbnail file
      const thumbnailPath = track.thumbnail_url.split('/').pop()
      if (thumbnailPath) {
        const { error: thumbnailError } = await supabase.storage
          .from('thumbnails')
          .remove([thumbnailPath])
        if (thumbnailError) console.error('Error deleting thumbnail file:', thumbnailError)
      }

      // Refresh the tracks list
      await fetchTracks()
    } catch (err) {
      console.error('Error deleting track:', err)
    } finally {
      setIsDeleting(false)
      setDeletingTrack(null)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-100">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowArtistForm(!showArtistForm)}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
            >
              {showArtistForm ? 'Hide Artist Info' : 'Edit Artist Info'}
            </button>
            <button
              onClick={() => setShowUploadForm(!showUploadForm)}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
            >
              {showUploadForm ? 'Hide Upload Form' : 'Upload New Track'}
            </button>
          </div>
        </div>

        {showArtistForm && (
          <div className="mb-8">
            <ArtistInfoForm onSave={() => setShowArtistForm(false)} />
          </div>
        )}

        {showUploadForm && (
          <div className="mb-8">
            <TrackUploadForm onUploadComplete={fetchTracks} />
          </div>
        )}

        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Track Management</h2>
            <p className="mt-2 text-sm text-gray-400">
              Upload new tracks or edit existing ones in your collection.
            </p>
          </div>

          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Your Tracks</h3>
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
                    <div className="absolute top-2 right-2 flex space-x-2">
                      <button
                        onClick={() => handleEdit(track)}
                        className="p-2 bg-dark-200/80 rounded-full text-gray-400 hover:text-white transition-colors"
                        title="Edit track"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => setDeletingTrack(track)}
                        className="p-2 bg-dark-200/80 rounded-full text-gray-400 hover:text-red-400 transition-colors"
                        title="Delete track"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <div className={`p-4 ${viewMode === 'list' ? 'flex-grow' : ''}`}>
                    <h4 className="text-lg font-semibold text-white">
                      {track.title}
                    </h4>
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

        {/* Delete Confirmation Modal */}
        {deletingTrack && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-dark-200 rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-medium text-white mb-4">Delete Track</h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete "{deletingTrack.title}"? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setDeletingTrack(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deletingTrack)}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete Track'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 