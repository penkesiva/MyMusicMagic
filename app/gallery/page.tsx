'use client'

import { HomeButton } from '@/app/components/HomeButton'

const placeholderColors = [
  'bg-primary-500/20',
  'bg-primary-600/20',
  'bg-primary-700/20',
  'bg-primary-800/20',
  'bg-primary-900/20'
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(5)].map((_, index) => (
              <div 
                key={index}
                className={`aspect-square rounded-lg overflow-hidden backdrop-blur-sm ${placeholderColors[index % placeholderColors.length]} 
                  flex items-center justify-center border border-white/10 hover:border-primary-400/50 transition-colors duration-300`}
              >
                <div className="text-center p-6">
                  <p className="text-2xl font-light text-white/80 mb-2">Coming Soon</p>
                  <p className="text-sm text-gray-400">Image {index + 1}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 