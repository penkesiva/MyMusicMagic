'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { TrackUploadForm } from '@/components/admin/TrackUploadForm'
import { TrackEditForm } from '@/components/admin/TrackEditForm'
import { ArtistInfoForm } from '@/components/admin/ArtistInfoForm'
import GalleryManagement from '@/components/admin/GalleryManagement'
import PageVisibility from '@/components/admin/PageVisibility'
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
import { Button } from "@/components/ui/button"

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

  // State for expand/collapse
  const [artistInfoOpen, setArtistInfoOpen] = useState(true)
  const [galleryOpen, setGalleryOpen] = useState(true)
  const [trackMgmtOpen, setTrackMgmtOpen] = useState(true)

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
    <div className="min-h-screen bg-dark-100 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Visibility Section */}
        <PageVisibility />

        {/* Artist Info Section */}
        <div className="mb-6 bg-dark-200 rounded-lg overflow-hidden">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-lg font-semibold text-white">Artist Info</h2>
                <p className="text-gray-400 text-sm mt-1">
                  Manage your artist profile, including bio, photo, and social links.
                </p>
              </div>
              <Button variant="ghost" type="button" onClick={() => setArtistInfoOpen(v => !v)} aria-label={artistInfoOpen ? 'Collapse' : 'Expand'}>
                {artistInfoOpen ? (
                  <><ChevronUpIcon className="h-4 w-4 mr-1" /> Collapse</>
                ) : (
                  <><ChevronDownIcon className="h-4 w-4 mr-1" /> Expand</>
                )}
              </Button>
            </div>
            {artistInfoOpen && (
              <div className="mt-3">
                <ArtistInfoForm onSave={() => {}} />
              </div>
            )}
          </div>
        </div>

        {/* Gallery Management Section */}
        <div className="mb-6 bg-dark-200 rounded-lg overflow-hidden">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-lg font-semibold text-white">Gallery Management</h2>
                <p className="text-gray-400 text-sm mt-1">
                  Upload images and add YouTube videos to showcase your musical journey.
                </p>
              </div>
              <Button variant="ghost" type="button" onClick={() => setGalleryOpen(v => !v)} aria-label={galleryOpen ? 'Collapse' : 'Expand'}>
                {galleryOpen ? (
                  <><ChevronUpIcon className="h-4 w-4 mr-1" /> Collapse</>
                ) : (
                  <><ChevronDownIcon className="h-4 w-4 mr-1" /> Expand</>
                )}
              </Button>
            </div>
            {galleryOpen && (
              <div className="mt-3">
                <GalleryManagement />
              </div>
            )}
          </div>
        </div>

        {/* Track Management Section */}
        <div className="mb-6 bg-dark-200 rounded-lg overflow-hidden">
          <div className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h2 className="text-lg font-semibold text-white">Track Management</h2>
                <p className="text-gray-400 text-sm mt-1">
                  Upload new tracks or edit existing ones in your collection.
                </p>
              </div>
              <Button variant="ghost" type="button" onClick={() => setTrackMgmtOpen(v => !v)} aria-label={trackMgmtOpen ? 'Collapse' : 'Expand'}>
                {trackMgmtOpen ? (
                  <><ChevronUpIcon className="h-4 w-4 mr-1" /> Collapse</>
                ) : (
                  <><ChevronDownIcon className="h-4 w-4 mr-1" /> Expand</>
                )}
              </Button>
            </div>
            {trackMgmtOpen && (
              <div className="mt-3">
                <TrackUploadForm onUploadComplete={() => { fetchTracks(); }} />
              </div>
            )}
          </div>
        </div>

        {/* Your Tracks Section */}
        <div className="bg-dark-200 rounded-lg overflow-hidden">
          <div className="p-4">
            <div className="flex justify-between items-center mb-3">
              <div>
                <h2 className="text-lg font-semibold text-white">Your Tracks</h2>
                <p className="text-gray-400 text-sm mt-1">
                  Manage and organize your music collection.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Button size="icon" variant={viewMode === 'list' ? 'default' : 'secondary'} onClick={() => setViewMode('list')}>
                    <ListBulletIcon className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant={viewMode === 'grid' ? 'default' : 'secondary'} onClick={() => setViewMode('grid')}>
                    <Squares2X2Icon className="h-4 w-4" />
                  </Button>
                </div>
                <button
                  onClick={() => setShowTracks(!showTracks)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                    showTracks 
                      ? 'bg-gray-600 hover:bg-gray-700 text-white' 
                      : 'bg-primary-500 hover:bg-primary-600 text-white'
                  }`}
                >
                  {showTracks ? (
                    <>
                      <ChevronUpIcon className="h-4 w-4" />
                      Hide Tracks
                    </>
                  ) : (
                    <>
                      <ChevronDownIcon className="h-4 w-4" />
                      Show Tracks
                    </>
                  )}
                </button>
              </div>
            </div>
            {showTracks && (
              <div className="mt-3">
                {viewMode === 'list' ? (
                  <div className="space-y-3">
                    {tracks.map((track) => (
                      <div key={track.id} className="bg-dark-300 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <img
                              src={track.thumbnail_url}
                              alt={track.title}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                            <div>
                              <h3 className="text-white font-medium text-sm">{track.title}</h3>
                              <p className="text-gray-400 text-xs">{track.description}</p>
                              <p className="text-gray-500 text-xs">
                                {new Date(track.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button size="icon" variant="ghost" onClick={() => handleEdit(track)}>
                              <PencilIcon className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => setDeletingTrack(track)}>
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {tracks.map((track) => (
                      <div key={track.id} className="bg-dark-300 rounded-lg overflow-hidden">
                        <img
                          src={track.thumbnail_url}
                          alt={track.title}
                          className="w-full h-32 object-cover"
                        />
                        <div className="p-3">
                          <h3 className="text-white font-medium text-sm mb-1">{track.title}</h3>
                          <p className="text-gray-400 text-xs mb-2">{track.description}</p>
                          <div className="flex items-center justify-between">
                            <p className="text-gray-500 text-xs">
                              {new Date(track.created_at).toLocaleDateString()}
                            </p>
                            <div className="flex items-center gap-1">
                              <Button size="icon" variant="ghost" onClick={() => handleEdit(track)}>
                                <PencilIcon className="h-4 w-4" />
                              </Button>
                              <Button size="icon" variant="ghost" onClick={() => setDeletingTrack(track)}>
                                <TrashIcon className="h-4 w-4" />
                              </Button>
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
          <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm">
            Track updated successfully!
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 text-sm">
            {error}
          </div>
        )}

        {/* Edit Track Modal */}
        {editingTrack && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-dark-200 rounded-lg p-4 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-semibold text-white">Edit Track</h2>
                <button
                  onClick={handleCancel}
                  className="text-gray-400 hover:text-white"
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
        )}

        {/* Delete Confirmation Modal */}
        {deletingTrack && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-dark-200 rounded-lg p-4 w-full max-w-md">
              <h2 className="text-lg font-semibold text-white mb-3">Delete Track</h2>
              <p className="text-gray-300 text-sm mb-4">
                Are you sure you want to delete "{deletingTrack.title}"? This action cannot be undone.
              </p>
              <div className="flex justify-end gap-3">
                <Button variant="destructive" onClick={() => handleDelete(deletingTrack)} disabled={isDeleting}>
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </Button>
                <Button variant="secondary" onClick={() => setDeletingTrack(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 