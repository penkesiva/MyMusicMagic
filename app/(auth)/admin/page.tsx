'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { TrackUploadForm } from '@/components/admin/TrackUploadForm'
import { TrackEditForm } from '@/components/admin/TrackEditForm'
import { ArtistInfoForm } from '@/components/admin/ArtistInfoForm'
import GalleryManagement from '@/components/admin/GalleryManagement'
import { Database } from '@/types/database'
import { 
  PencilIcon, 
  XMarkIcon, 
  ListBulletIcon, 
  Squares2X2Icon, 
  TrashIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PlusIcon
} from '@heroicons/react/24/outline'

type Track = Database['public']['Tables']['tracks']['Row']

export default function AdminPage() {
  const [tracks, setTracks] = useState<Track[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showArtistForm, setShowArtistForm] = useState(false)
  const [showUploadForm, setShowUploadForm] = useState(false)
  const [showTracks, setShowTracks] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [editingTrack, setEditingTrack] = useState<Track | null>(null)
  const [deletingTrack, setDeletingTrack] = useState<Track | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editSuccess, setEditSuccess] = useState(false)
  const [showGalleryForm, setShowGalleryForm] = useState(false)
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
    setEditSuccess(true)
    // Hide success message after 3 seconds
    setTimeout(() => setEditSuccess(false), 3000)
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
          .from('tracks')
          .remove([audioPath])

        if (audioError) throw audioError
      }

      // Delete the thumbnail file
      const thumbnailPath = track.thumbnail_url.split('/').pop()
      if (thumbnailPath) {
        const { error: thumbnailError } = await supabase.storage
          .from('track-thumbnails')
          .remove([thumbnailPath])

        if (thumbnailError) throw thumbnailError
      }

      await fetchTracks()
      setDeletingTrack(null)
    } catch (err) {
      console.error('Error deleting track:', err)
      setError(err instanceof Error ? err.message : 'An error occurred while deleting the track')
    } finally {
      setIsDeleting(false)
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
        <h1 className="text-2xl font-bold text-white mb-8">Admin Dashboard</h1>

        {/* Artist Info Section */}
        <div className="mb-8 bg-dark-200 rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-semibold text-white">Artist Info</h2>
                <p className="text-gray-400 mt-1">
                  Manage your artist profile, including bio, photo, and social links.
                </p>
              </div>
              <button
                onClick={() => setShowArtistForm(!showArtistForm)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  showArtistForm 
                    ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                    : 'bg-primary-500 hover:bg-primary-600 text-white'
                }`}
              >
                {showArtistForm ? (
                  <>
                    <ChevronUpIcon className="h-5 w-5" />
                    Collapse
                  </>
                ) : (
                  <>
                    <ChevronDownIcon className="h-5 w-5" />
                    Edit Artist Info
                  </>
                )}
              </button>
            </div>
            {showArtistForm && (
              <div className="mt-4">
                <ArtistInfoForm onSave={() => setShowArtistForm(false)} />
              </div>
            )}
          </div>
        </div>

        {/* Gallery Management Section */}
        <div className="mb-8 bg-dark-200 rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-semibold text-white">Gallery Management</h2>
                <p className="text-gray-400 mt-1">
                  Upload images and add YouTube videos to showcase your musical journey.
                </p>
              </div>
              <button
                onClick={() => setShowGalleryForm(!showGalleryForm)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                  showGalleryForm 
                    ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                    : 'bg-primary-500 hover:bg-primary-600 text-white'
                }`}
              >
                {showGalleryForm ? (
                  <>
                    <ChevronUpIcon className="h-5 w-5" />
                    Collapse
                  </>
                ) : (
                  <>
                    <ChevronDownIcon className="h-5 w-5" />
                    Manage Gallery
                  </>
                )}
              </button>
            </div>
            {showGalleryForm && (
              <div className="mt-4">
                <GalleryManagement />
              </div>
            )}
          </div>
        </div>

        {/* Track Management Section */}
        <div className="mb-8 bg-dark-200 rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-semibold text-white">Track Management</h2>
                <p className="text-gray-400 mt-1">
                  Upload new tracks or edit existing ones in your collection.
                </p>
              </div>
              <button
                onClick={() => setShowUploadForm(!showUploadForm)}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors flex items-center gap-2"
              >
                <PlusIcon className="h-5 w-5" />
                Upload New Track
              </button>
            </div>
            {showUploadForm && (
              <div className="mt-4">
                <TrackUploadForm onUploadComplete={() => {
                  fetchTracks();
                  setShowUploadForm(false);
                }} />
              </div>
            )}
          </div>
        </div>

        {/* Your Tracks Section */}
        <div className="bg-dark-200 rounded-lg overflow-hidden">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-semibold text-white">Your Tracks</h2>
                <p className="text-gray-400 mt-1">
                  Manage and organize your music collection.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'list' 
                        ? 'bg-primary-500 text-white' 
                        : 'bg-gray-600 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <ListBulletIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'grid' 
                        ? 'bg-primary-500 text-white' 
                        : 'bg-gray-600 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <Squares2X2Icon className="h-5 w-5" />
                  </button>
                </div>
                <button
                  onClick={() => setShowTracks(!showTracks)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                    showTracks 
                      ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                      : 'bg-primary-500 hover:bg-primary-600 text-white'
                  }`}
                >
                  {showTracks ? (
                    <>
                      <ChevronUpIcon className="h-5 w-5" />
                      Hide Tracks
                    </>
                  ) : (
                    <>
                      <ChevronDownIcon className="h-5 w-5" />
                      Show Tracks
                    </>
                  )}
                </button>
              </div>
            </div>
            {showTracks && (
              <div className="mt-4">
                {viewMode === 'list' ? (
                  <div className="space-y-4">
                    {tracks.map((track) => (
                      <div key={track.id} className="bg-dark-300 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <img
                              src={track.thumbnail_url}
                              alt={track.title}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                            <div>
                              <h3 className="text-white font-medium">{track.title}</h3>
                              <p className="text-gray-400 text-sm">{track.description}</p>
                              <p className="text-gray-500 text-xs">
                                {new Date(track.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(track)}
                              className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => setDeletingTrack(track)}
                              className="p-2 text-red-400 hover:text-red-300 transition-colors"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tracks.map((track) => (
                      <div key={track.id} className="bg-dark-300 rounded-lg overflow-hidden">
                        <img
                          src={track.thumbnail_url}
                          alt={track.title}
                          className="w-full h-48 object-cover"
                        />
                        <div className="p-4">
                          <h3 className="text-white font-medium mb-2">{track.title}</h3>
                          <p className="text-gray-400 text-sm mb-3">{track.description}</p>
                          <div className="flex items-center justify-between">
                            <p className="text-gray-500 text-xs">
                              {new Date(track.created_at).toLocaleDateString()}
                            </p>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => handleEdit(track)}
                                className="p-2 text-blue-400 hover:text-blue-300 transition-colors"
                              >
                                <PencilIcon className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => setDeletingTrack(track)}
                                className="p-2 text-red-400 hover:text-red-300 transition-colors"
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Success Message */}
        {editSuccess && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
            Track updated successfully!
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50">
            {error}
          </div>
        )}

        {/* Edit Track Modal */}
        {editingTrack && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-dark-200 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">Edit Track</h2>
                <button
                  onClick={handleCancel}
                  className="text-gray-400 hover:text-white"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-dark-200 rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold text-white mb-4">Delete Track</h2>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete "{deletingTrack.title}"? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setDeletingTrack(null)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deletingTrack)}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 