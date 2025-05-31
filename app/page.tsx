'use client'

import { createClient } from '@/lib/supabase/client'
import { TrackCard } from '@/components/tracks/TrackCard'
import { Database } from '@/types/database'
import AudioPlayer from '@/app/components/AudioPlayer'
import { useState, useEffect, useRef } from 'react'
import { Squares2X2Icon, ListBulletIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { FaPlay, FaPause } from 'react-icons/fa'

type Track = Database['public']['Tables']['tracks']['Row']
type ViewMode = 'grid' | 'list'

export default function HomePage() {
  const [tracks, setTracks] = useState<Track[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isFeaturedHighlighted, setIsFeaturedHighlighted] = useState(false)
  const featuredRef = useRef<HTMLDivElement>(null)
  const [volume, setVolume] = useState(1)
  const [showPlayer, setShowPlayer] = useState(false)
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null)
  const supabase = createClient()

  // Fetch published tracks
  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const { data, error } = await supabase
          .from('tracks')
          .select('*')
          .eq('is_published', true)
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

  // Scroll observer for featured section
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsFeaturedHighlighted(entry.isIntersecting)
      },
      {
        threshold: 0.3, // Trigger when 30% of the section is visible
      }
    )

    if (featuredRef.current) {
      observer.observe(featuredRef.current)
    }

    return () => observer.disconnect()
  }, [])

  const handlePlay = (track: Track) => {
    if (currentTrack?.id === track.id) {
      setIsPlaying(!isPlaying)
      return
    }

    setCurrentTrack(track)
    setShowPlayer(true)
    setIsPlaying(true)
  }

  const handleClose = () => {
    setShowPlayer(false)
    setIsPlaying(false)
    setCurrentTrack(null)
  }

  const handleInfo = (track: Track) => {
    setSelectedTrack(track)
  }

  const handleCloseInfo = () => {
    setSelectedTrack(null)
  }

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-100">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  // Split tracks into featured and remaining
  const featuredTracks = tracks.slice(0, 3)
  const remainingTracks = tracks.slice(3)

  return (
    <div className="min-h-screen bg-dark-100">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="/hero-bg.jpg"
            alt="Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-dark-100/40 to-dark-100/90" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
            My Music Magic
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Discover a collection of carefully crafted musical compositions,
            each telling its own unique story through melody and rhythm.
          </p>
          <a
            href="#featured"
            className="inline-block px-8 py-3 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
          >
            Explore Tracks
          </a>
        </div>
      </section>

      {/* Featured Tracks Section */}
      <section 
        id="featured" 
        ref={featuredRef}
        className={`py-16 px-4 sm:px-6 lg:px-8 transition-colors duration-500 ${
          isFeaturedHighlighted 
            ? 'bg-gradient-to-b from-dark-200 to-dark-100' 
            : 'bg-gradient-to-b from-dark-100/50 to-dark-100'
        }`}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white">Featured Tracks</h2>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => handleViewModeChange('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-primary-500 text-white'
                    : 'bg-dark-200 text-white hover:bg-dark-300'
                }`}
                title="List View"
              >
                <ListBulletIcon className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => handleViewModeChange('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-primary-500 text-white'
                    : 'bg-dark-200 text-white hover:bg-dark-300'
                }`}
                title="Grid View"
              >
                <Squares2X2Icon className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className={viewMode === 'grid' ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3' : 'space-y-4'}>
            {featuredTracks.map((track) => (
              <TrackCard
                key={track.id}
                track={track}
                variant={viewMode}
                onPlay={() => {
                  console.log('TrackCard: Play requested for', track.title);
                  handlePlay(track);
                }}
                onInfo={handleInfo}
                isPlaying={currentTrack?.id === track.id && isPlaying}
              />
            ))}
          </div>
        </div>
      </section>

      {/* About Artist Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-dark-200">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">About the Artist</h2>
          <div className="flex flex-col md:flex-row items-start gap-8">
            <div className="w-full md:w-1/4 flex justify-center md:justify-start">
              <div className="w-64 h-64 rounded-lg overflow-hidden">
                <img
                  src="/artist-photo.png"
                  alt="Artist"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="w-full md:w-3/4 prose prose-invert">
              <p className="text-lg text-gray-300 mb-4">
                A passionate cellist with over a decade of experience, I've dedicated my life to the art of music. From performing in prestigious concert halls to collaborating with renowned orchestras, my journey has been driven by an unwavering love for the cello's rich, emotive voice.
              </p>
              <p className="text-lg text-gray-300">
                Currently pursuing a professional career in music, I blend classical training with contemporary expression, creating performances that bridge traditional and modern musical landscapes. My work reflects a deep commitment to both technical excellence and emotional storytelling through music.
              </p>
              <div className="flex items-center space-x-4 mt-6">
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Instagram
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Twitter
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  YouTube
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* More Tracks Section */}
      {remainingTracks.length > 0 && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-dark-100">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-8">More Tracks</h2>
            <div className={viewMode === 'grid' ? 'grid gap-6 md:grid-cols-2 lg:grid-cols-3' : 'space-y-4'}>
              {remainingTracks.map((track) => (
                <TrackCard
                  key={track.id}
                  track={track}
                  variant={viewMode}
                  onPlay={() => {
                    console.log('TrackCard: Play requested for', track.title);
                    handlePlay(track);
                  }}
                  onInfo={handleInfo}
                  isPlaying={currentTrack?.id === track.id && isPlaying}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-dark-200 border-t border-dark-300">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="col-span-1 md:col-span-2">
              <h3 className="text-xl font-bold text-white mb-4">About the Artist</h3>
              <p className="text-gray-400 mb-4">
                A dedicated cellist with a passion for both classical and contemporary music. With extensive experience in orchestral performances and solo recitals, I strive to create meaningful musical experiences that resonate with audiences. My approach combines technical precision with emotional depth, bringing stories to life through the expressive voice of the cello.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Instagram
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  Twitter
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  YouTube
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#featured" className="text-gray-400 hover:text-white transition-colors">
                    Featured Tracks
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-dark-300 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} My Music Magic. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Audio Player */}
      {showPlayer && currentTrack && (
        <div className="fixed bottom-0 left-0 right-0 bg-transparent p-4">
          <div className="relative">
            <AudioPlayer
              audioUrl={currentTrack.audio_url}
              title={currentTrack.title}
              onPlay={() => {
                console.log('AudioPlayer: Play requested');
                setIsPlaying(true);
              }}
              onPause={() => {
                console.log('AudioPlayer: Pause requested');
                setIsPlaying(false);
              }}
              onClose={handleClose}
              isPlaying={isPlaying}
            />
          </div>
        </div>
      )}

      {/* Track Info Modal */}
      {selectedTrack && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-2xl bg-dark-200 rounded-lg overflow-hidden">
            <div className="relative">
              <img
                src={selectedTrack.thumbnail_url}
                alt={selectedTrack.title}
                className="w-full h-64 object-cover"
              />
              <button
                onClick={handleCloseInfo}
                className="absolute top-4 right-4 p-2 bg-dark-200/80 rounded-full text-gray-400 hover:text-white transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <h3 className="text-2xl font-bold text-white">{selectedTrack.title}</h3>
              
              {selectedTrack.description && (
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-1">Description</h4>
                  <p className="text-gray-400">{selectedTrack.description}</p>
                </div>
              )}

              {selectedTrack.composer_notes && (
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-1">Composer Notes</h4>
                  <p className="text-gray-400 whitespace-pre-wrap">{selectedTrack.composer_notes}</p>
                </div>
              )}

              {selectedTrack.lyrics && (
                <div>
                  <h4 className="text-sm font-medium text-gray-300 mb-1">Lyrics</h4>
                  <p className="text-gray-400 whitespace-pre-wrap">{selectedTrack.lyrics}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-dark-300">
                <span className="text-sm text-gray-400">
                  Duration: {Math.floor(selectedTrack.duration / 60)}:{(Math.floor(selectedTrack.duration) % 60).toString().padStart(2, '0')}
                </span>
                <button
                  onClick={() => {
                    if (currentTrack?.id === selectedTrack.id && isPlaying) {
                      setIsPlaying(false);
                    } else {
                      handlePlay(selectedTrack);
                    }
                  }}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2"
                >
                  {currentTrack?.id === selectedTrack.id && isPlaying ? (
                    <FaPause className="text-white" />
                  ) : (
                    <FaPlay className="text-white" />
                  )}
                  {currentTrack?.id === selectedTrack.id && isPlaying ? 'Pause' : 'Play'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 