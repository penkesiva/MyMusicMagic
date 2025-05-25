'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { TrackUploadForm } from '@/components/admin/TrackUploadForm'
import { Database } from '@/types/database'

type Track = Database['public']['Tables']['tracks']['Row']

export default function AdminPage() {
  const [tracks, setTracks] = useState<Track[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
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

    fetchTracks()
  }, [supabase])

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
        <h1 className="text-2xl font-bold text-white">Upload New Track</h1>
        <p className="mt-2 text-sm text-gray-400">
          Fill out the form below to upload a new track to your collection.
        </p>
      </div>

      <TrackUploadForm />

      <div className="mt-12">
        <h2 className="text-2xl font-bold text-white mb-6">Recent Uploads</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tracks.map((track) => (
            <div
              key={track.id}
              className="bg-dark-200 rounded-lg overflow-hidden"
            >
              <div className="aspect-square relative">
                <img
                  src={track.thumbnail_url}
                  alt={track.title}
                  className="w-full h-full object-cover"
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
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-white">
                  {track.title}
                </h3>
                {track.description && (
                  <p className="mt-1 text-sm text-gray-400 line-clamp-2">
                    {track.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 