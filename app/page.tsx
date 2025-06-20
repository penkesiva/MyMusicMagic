'use client'

import { createClient } from '@/lib/supabase/client'
import { TrackCard } from '@/components/tracks/TrackCard'
import { Database } from '@/types/database'
import AudioPlayer from '@/app/components/AudioPlayer'
import { useState, useEffect, useRef } from 'react'
import { Squares2X2Icon, ListBulletIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { FaPlay, FaPause } from 'react-icons/fa'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Link from 'next/link'

type Track = Database['public']['Tables']['tracks']['Row']
type ArtistInfo = Database['public']['Tables']['artist_info']['Row']
type ArtistLink = Database['public']['Tables']['artist_links']['Row']
type GalleryItem = Database['public']['Tables']['gallery']['Row']

// Define an extended type for artist info that includes the optional fields
type ExtendedArtistInfo = Database['public']['Tables']['artist_info']['Row'] & {
  use_same_text?: boolean;
  footer_text?: string | null;
  homepage_title?: string;
  homepage_description?: string;
  homepage_hero_url?: string;
  about_artist_title?: string;
};

type ViewMode = 'list' | 'grid'

export default function HomePage() {
  const [tracks, setTracks] = useState<Track[]>([])
  const [artistInfo, setArtistInfo] = useState<ExtendedArtistInfo | null>(null)
  const [artistLinks, setArtistLinks] = useState<ArtistLink[]>([])
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isFeaturedHighlighted, setIsFeaturedHighlighted] = useState(false)
  const featuredRef = useRef<HTMLDivElement>(null)
  const [volume, setVolume] = useState(1)
  const [showPlayer, setShowPlayer] = useState(false)
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null)
  
  // Gallery state
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'images' | 'videos'>('images')
  
  // Contact state
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const supabase = createClientComponentClient<Database>()

  // Fetch published tracks, artist info, and gallery items
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch tracks
        const { data: tracksData, error: tracksError } = await supabase
          .from('tracks')
          .select('*')
          .eq('is_published', true)
          .order('created_at', { ascending: false })

        if (tracksError) throw tracksError
        setTracks(tracksData || [])

        // Fetch artist info
        const { data: artistData, error: artistError } = await supabase
          .from('artist_info')
          .select('*')
          .single()

        if (artistError && artistError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
          throw artistError
        }

        if (artistData) {
          console.log('Artist data:', artistData);
          setArtistInfo(artistData)
          // Fetch artist links
          const { data: linksData, error: linksError } = await supabase
            .from('artist_links')
            .select('*')
            .eq('artist_info_id', artistData.id)

          if (linksError) {
            console.error('Error fetching artist links:', linksError);
            throw linksError
          }
          console.log('Artist links data:', linksData);
          setArtistLinks(linksData || [])
        }

        // Fetch gallery items
        const { data: galleryData, error: galleryError } = await supabase
          .from('gallery')
          .select('*')
          .order('created_at', { ascending: false })

        if (galleryError) {
          console.error('Error fetching gallery items:', galleryError)
        } else {
          setGalleryItems(galleryData || [])
        }
      } catch (err) {
        console.error('Error fetching data:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
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

  const scrollToFeatured = () => {
    if (featuredRef.current) {
      featuredRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }
  }

  // Gallery functions
  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1]
    return videoId ? `https://www.youtube.com/embed/${videoId}` : null
  }

  const openVideoModal = (videoUrl: string) => {
    setSelectedVideo(videoUrl)
  }

  const closeVideoModal = () => {
    setSelectedVideo(null)
  }

  // Contact functions
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    try {
      // Validate email
      if (!email || !email.includes('@')) {
        throw new Error('Please enter a valid email address')
      }

      // Validate message length
      if (!message.trim()) {
        throw new Error('Please enter a message')
      }
      if (message.length > 100) {
        throw new Error('Message must be 100 words or less')
      }

      console.log('Starting form submission...');
      console.log('Attempting to insert message:', { email, message });

      // Store in Supabase using the function
      const { data, error: dbError } = await supabase
        .rpc('insert_message', {
          p_email: email,
          p_message: message
        });

      console.log('RPC Response:', { data, error: dbError });

      if (dbError) {
        console.error('Database error:', {
          code: dbError.code,
          message: dbError.message,
          details: dbError.details,
          hint: dbError.hint
        });
        throw dbError;
      }

      console.log('Message inserted successfully:', data);
      setSuccess(true)
      setEmail('')
      setMessage('')
    } catch (err) {
      console.error('Full error object:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message')
    } finally {
      setIsSubmitting(false)
    }
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

  // Filter gallery items
  const images = galleryItems.filter(item => item.media_type === 'image')
  const videos = galleryItems.filter(item => item.media_type === 'video')

  return (
    <main className="min-h-screen bg-dark-100">
      {/* Hero Section */}
      <div 
        className="relative h-[80vh] flex items-center justify-center bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${artistInfo?.homepage_hero_url || '/hero-bg.jpg'})`,
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
            {artistInfo?.homepage_title || 'My Music Magic'}
          </h1>
          <p className="text-xl sm:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto">
            {artistInfo?.homepage_description || 'Discover a collection of carefully crafted musical compositions, each telling its own unique story through melody and rhythm.'}
          </p>
          <button
            onClick={scrollToFeatured}
            className="inline-block bg-primary-500 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-primary-600 transition-colors"
          >
            Explore Music
          </button>
        </div>
      </div>

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
          <h2 className="text-3xl font-bold text-white mb-8 text-center">{artistInfo?.about_artist_title || 'About the Artist'}</h2>
          <div className="flex flex-col md:flex-row items-start gap-8">
            <div className="w-full md:w-1/4 flex justify-center md:justify-start">
              <div className="w-64 h-64 rounded-lg overflow-hidden">
                <img
                  src={artistInfo?.photo_url || '/artist-photo.png'}
                  alt="Artist"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="w-full md:w-3/4 prose prose-invert">
              {artistInfo ? (
                <>
                  <p className="text-lg text-gray-300 mb-4 whitespace-pre-wrap">
                    {artistInfo.about_text}
                  </p>
                  {artistLinks.length > 0 && (
                    <div className="flex items-center space-x-4 mt-6">
                      {artistLinks.map((link) => {
                        console.log('Rendering link:', link);
                        return (
                          <a
                            key={link.id}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-white transition-colors"
                          >
                            {link.title}
                          </a>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <p className="text-lg text-gray-300 mb-4">
                    A passionate cellist with over a decade of experience, I've dedicated my life to the art of music. From performing in prestigious concert halls to collaborating with renowned orchestras, my journey has been driven by an unwavering love for the cello's rich, emotive voice.
                  </p>
                  <p className="text-lg text-gray-300">
                    Currently pursuing a professional career in music, I blend classical training with contemporary expression, creating performances that bridge traditional and modern musical landscapes. My work reflects a deep commitment to both technical excellence and emotional storytelling through music.
                  </p>
                  <div className="flex items-center space-x-4 mt-6">
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
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section id="gallery" className="py-16 px-4 sm:px-6 lg:px-8 bg-dark-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">Gallery</h2>
            <p className="text-gray-300">A collection of musical moments and performances</p>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center space-x-1 bg-dark-200/50 backdrop-blur-sm rounded-lg p-1 border border-white/10 max-w-md mx-auto mb-8">
            <button
              onClick={() => setActiveTab('images')}
              className={`px-6 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === 'images'
                  ? 'bg-primary-500 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Images ({images.length})
            </button>
            <button
              onClick={() => setActiveTab('videos')}
              className={`px-6 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                activeTab === 'videos'
                  ? 'bg-primary-500 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Videos ({videos.length})
            </button>
          </div>

          {/* Gallery Content */}
          {activeTab === 'images' && (
            <div className="space-y-8">
              {images.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-gray-400 text-lg mb-2">No images yet</div>
                  <p className="text-gray-500">Check back soon for musical moments captured in time.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {images.map((item) => (
                    <div key={item.id} className="group">
                      <div className="relative aspect-square rounded-lg overflow-hidden bg-dark-200/50 backdrop-blur-sm border border-white/10 hover:border-primary-400/50 transition-all duration-300">
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <h3 className="text-white font-medium text-lg mb-1">{item.title}</h3>
                            {item.description && (
                              <p className="text-gray-200 text-sm">{item.description}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'videos' && (
            <div className="space-y-8">
              {videos.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-gray-400 text-lg mb-2">No videos yet</div>
                  <p className="text-gray-500">Check back soon for musical performances and behind-the-scenes content.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {videos.map((item) => {
                    const embedUrl = getYouTubeEmbedUrl(item.video_url || '')
                    return (
                      <div key={item.id} className="group">
                        <div 
                          className="relative aspect-video rounded-lg overflow-hidden bg-dark-200/50 backdrop-blur-sm border border-white/10 hover:border-primary-400/50 transition-all duration-300 cursor-pointer"
                          onClick={() => embedUrl && openVideoModal(embedUrl)}
                        >
                          <img
                            src={item.image_url}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                              <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z"/>
                              </svg>
                            </div>
                          </div>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                              <h3 className="text-white font-medium text-lg mb-1">{item.title}</h3>
                              {item.description && (
                                <p className="text-gray-200 text-sm">{item.description}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 px-4 sm:px-6 lg:px-8 bg-dark-200">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">Post Me</h2>
              <p className="text-gray-300">Share your musical thoughts</p>
            </div>
            
            <div className="bg-dark-300/80 backdrop-blur-sm rounded-lg p-6 border border-white/10">
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 bg-dark-400/50 border border-white/10 rounded-lg text-white placeholder-gray-400 
                      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent backdrop-blur-sm"
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">
                    Message (max 100 words) *
                  </label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-4 py-2 bg-dark-400/50 border border-white/10 rounded-lg text-white placeholder-gray-400 
                      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent backdrop-blur-sm resize-none"
                    rows={4}
                    placeholder="Your message here..."
                    required
                    maxLength={100}
                  />
                  <p className="mt-1 text-sm text-gray-400">
                    {message.length}/100 words
                  </p>
                </div>

                {error && (
                  <p className="text-red-400 text-sm">{error}</p>
                )}

                {success && (
                  <p className="text-green-400 text-sm">
                    Message sent successfully! I'll get back to you soon.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 
                    transition-colors disabled:opacity-50 disabled:cursor-not-allowed 
                    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-dark-300"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
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
      <footer className="bg-dark-200 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 max-w-6xl mx-auto">
            {/* About Section - Takes 7 columns (60%) */}
            <div className="md:col-span-7 space-y-4">
              <h3 className="text-xl font-semibold text-white">{artistInfo?.about_artist_title || 'About the Artist'}</h3>
              <div className="prose prose-invert max-w-none">
                <p className="text-gray-400 text-base leading-relaxed">
                  {artistInfo && (
                    artistInfo.use_same_text === false && artistInfo.footer_text 
                      ? artistInfo.footer_text 
                      : artistInfo.about_text
                  )}
                </p>
              </div>
            </div>

            {/* Quick Links - Takes 2 columns */}
            <div className="md:col-span-2 space-y-4">
              <h3 className="text-lg font-semibold text-white">Quick Links</h3>
              <nav className="space-y-3">
                <a
                  href="#featured"
                  className="block text-gray-400 hover:text-white transition-colors"
                >
                  Featured Tracks
                </a>
                <a
                  href="#gallery"
                  className="block text-gray-400 hover:text-white transition-colors"
                >
                  Gallery
                </a>
                <a
                  href="#contact"
                  className="block text-gray-400 hover:text-white transition-colors"
                >
                  Contact
                </a>
              </nav>
            </div>

            {/* Social Links - Takes 3 columns */}
            <div className="md:col-span-3 space-y-4">
              <h3 className="text-lg font-semibold text-white">Connect</h3>
              {artistLinks.length > 0 ? (
                <div className="space-y-3">
                  {artistLinks.map((link) => (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-gray-400 hover:text-white transition-colors"
                    >
                      {link.title}
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">No social links available</p>
              )}
            </div>
          </div>

          {/* Copyright */}
          <div className="mt-16 pt-8 border-t border-dark-300">
            <div className="max-w-6xl mx-auto text-center">
              <p className="text-gray-400 text-sm">
                © {new Date().getFullYear()} My Music Magic. All rights reserved.
              </p>
            </div>
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
              onTrackEnd={() => setIsPlaying(false)}
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

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl aspect-video bg-dark-200 rounded-lg overflow-hidden">
            <button
              onClick={closeVideoModal}
              className="absolute top-4 right-4 z-10 p-2 bg-dark-200/80 rounded-full text-white hover:bg-dark-300 transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
            <iframe
              src={selectedVideo}
              title="YouTube video"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </main>
  )
} 