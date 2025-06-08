'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { TrackUploadForm } from '@/components/admin/TrackUploadForm'
import { TrackEditForm } from '@/components/admin/TrackEditForm'
import { ArtistInfoForm } from '@/components/admin/ArtistInfoForm'
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
                  View and manage your uploaded tracks.
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'list'
                        ? 'bg-primary-500 text-white'
                        : 'bg-dark-300 text-gray-400 hover:text-white'
                    }`}
                  >
                    <ListBulletIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-primary-500 text-white'
                        : 'bg-dark-300 text-gray-400 hover:text-white'
                    }`}
                  >
                    <Squares2X2Icon className="h-5 w-5" />
                  </button>
                </div>
                <button
                  onClick={() => setShowTracks(!showTracks)}
                  className="px-4 py-2 bg-dark-300 text-white rounded-lg font-medium hover:bg-dark-400 transition-colors flex items-center gap-2"
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
                {isLoading ? (
                  <div className="text-white">Loading tracks...</div>
                ) : error ? (
                  <div className="text-red-500">{error}</div>
                ) : tracks.length === 0 ? (
                  <div className="text-gray-400">No tracks uploaded yet.</div>
                ) : viewMode === 'list' ? (
                  <div className="space-y-4">
                    {tracks.map((track) => (
                      <div
                        key={track.id}
                        className="bg-dark-300 p-4 rounded-lg flex items-center justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <img
                            src={track.thumbnail_url}
                            alt={track.title}
                            className="w-16 h-16 object-cover rounded"
                          />
                          <div>
                            <h3 className="text-white font-medium">{track.title}</h3>
                            <p className="text-gray-400 text-sm">
                              {track.description || 'No description'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingTrack(track)}
                            className="p-2 text-gray-400 hover:text-white transition-colors"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(track)}
                            className="p-2 text-red-400 hover:text-red-300 transition-colors"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {tracks.map((track) => (
                      <div
                        key={track.id}
                        className="bg-dark-300 rounded-lg overflow-hidden"
                      >
                        <img
                          src={track.thumbnail_url}
                          alt={track.title}
                          className="w-full h-48 object-cover"
                        />
                        <div className="p-4">
                          <h3 className="text-white font-medium mb-2">{track.title}</h3>
                          <p className="text-gray-400 text-sm mb-4">
                            {track.description || 'No description'}
                          </p>
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => setEditingTrack(track)}
                              className="p-2 text-gray-400 hover:text-white transition-colors"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(track)}
                              className="p-2 text-red-400 hover:text-red-300 transition-colors"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
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

        {/* Track Edit Modal */}
        {editingTrack && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-dark-200 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold text-white">Edit Track</h3>
                  <button
                    onClick={() => setEditingTrack(null)}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
                <TrackEditForm
                  track={editingTrack}
                  onSave={handleSave}
                  onCancel={handleCancel}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 