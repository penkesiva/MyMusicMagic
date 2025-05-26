'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

type GalleryItem = {
  id: string
  title: string
  image_url: string
  date: string
}

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchGalleryItems = async () => {
      try {
        const { data, error } = await supabase
          .from('gallery')
          .select('*')
          .order('date', { ascending: false })

        if (error) throw error
        setItems(data || [])
      } catch (err) {
        console.error('Error fetching gallery items:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchGalleryItems()
  }, [supabase])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-100">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-white mb-8">Gallery</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item.id}
              className="bg-dark-200 rounded-lg overflow-hidden group"
            >
              <div className="relative aspect-square">
                <img
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-300">
                      {new Date(item.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 