'use client'

import { HomeButton } from '@/app/components/HomeButton'

const galleryItems = [
  {
    id: 1,
    title: "Musical Journey",
    description: "A collection of moments that define our musical path",
    color: 'bg-primary-500/20'
  },
  {
    id: 2,
    title: "Sound Waves",
    description: "Where melodies meet memories",
    color: 'bg-primary-600/20'
  },
  {
    id: 3,
    title: "Rhythm & Blues",
    description: "The heartbeat of musical expression",
    color: 'bg-primary-700/20'
  },
  {
    id: 4,
    title: "Harmony in Motion",
    description: "Capturing the dance of musical notes",
    color: 'bg-primary-800/20'
  },
  {
    id: 5,
    title: "Melodic Stories",
    description: "Tales told through musical notes",
    color: 'bg-primary-900/20'
  }
]

export default function GalleryPage() {
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
          <p className="text-gray-300">Coming soon: A collection of musical moments</p>
        </div>

        {/* Gallery Grid */}
        <div className="container mx-auto px-4 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {galleryItems.map((item) => (
              <div key={item.id} className="flex flex-col">
                {/* Image placeholder */}
                <div 
                  className={`aspect-square rounded-lg overflow-hidden backdrop-blur-sm ${item.color}
                    flex items-center justify-center border border-white/10 hover:border-primary-400/50 
                    transition-colors duration-300 mb-3`}
                >
                  <div className="text-center p-6">
                    <p className="text-2xl font-light text-white/80 mb-2">Coming Soon</p>
                    <p className="text-sm text-gray-400">Image {item.id}</p>
                  </div>
                </div>
                
                {/* Text box */}
                <div className="bg-dark-200/80 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                  <h3 className="text-lg font-medium text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-400">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 