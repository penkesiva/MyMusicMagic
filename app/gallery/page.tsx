'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { HomeButton } from '@/app/components/HomeButton'
import { Database } from '@/types/database'

type GalleryItem = Database['public']['Tables']['gallery']['Row']

export default function GalleryPage() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'images' | 'videos'>('images')

  const supabase = createClient()

  useEffect(() => {
    fetchGalleryItems()
  }, [])

  const fetchGalleryItems = async () => {
    try {
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching gallery items:', error)
      } else {
        setGalleryItems(data || [])
      }
    } catch (error) {
      console.error('Error fetching gallery items:', error)
    } finally {
      setLoading(false)
    }
  }

  const images = galleryItems.filter(item => item.media_type === 'image')
  const videos = galleryItems.filter(item => item.media_type === 'video')

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

  return (
    <div className="min-h-screen relative">
      <HomeButton />
      
      {/* Hero background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url("/hero-bg.jpg")',
          filter: 'brightness(0.3)'
        }}
      />

      {/* Content */}
      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <div className="pt-20 pb-10 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Gallery</h1>
          <p className="text-gray-300">A collection of musical moments and performances</p>
        </div>

        {/* Tab Navigation */}
        <div className="container mx-auto px-4 mb-8">
          <div className="flex justify-center space-x-1 bg-dark-200/50 backdrop-blur-sm rounded-lg p-1 border border-white/10 max-w-md mx-auto">
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
        </div>

        {/* Gallery Content */}
        <div className="container mx-auto px-4 pb-20">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
          ) : (
            <>
              {/* Images Section */}
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

              {/* Videos Section */}
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
            </>
          )}
        </div>
      </div>

      {/* Video Modal */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl aspect-video bg-dark-200 rounded-lg overflow-hidden">
            <button
              onClick={closeVideoModal}
              className="absolute top-4 right-4 z-10 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-black/70 transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <iframe
              src={selectedVideo}
              title="YouTube video player"
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  )
} 