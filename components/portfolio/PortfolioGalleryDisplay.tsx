'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'
import { PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline'

type GalleryItem = Database['public']['Tables']['gallery']['Row']

interface PortfolioGalleryDisplayProps {
  portfolioId: string
  onEdit?: (item: GalleryItem) => void
  onRefresh?: () => void
  viewMode?: 'list' | 'grid'
  filter?: 'all' | 'photo' | 'video'
}

export default function PortfolioGalleryDisplay({ portfolioId, onEdit, onRefresh, viewMode = 'grid', filter = 'all' }: PortfolioGalleryDisplayProps) {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingItem, setDeletingItem] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    fetchGalleryItems()
  }, [portfolioId])

  const fetchGalleryItems = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .eq('portfolio_id', portfolioId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching gallery items:', error)
        setError('Failed to load gallery items')
      } else {
        setGalleryItems(data || [])
      }
    } catch (err) {
      console.error('Error fetching gallery items:', err)
      setError('Failed to load gallery items')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this gallery item?')) return

    setDeletingItem(id)
    try {
      const { error } = await supabase
        .from('gallery')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Error deleting gallery item:', error)
        alert('Error deleting gallery item')
      } else {
        await fetchGalleryItems()
        onRefresh?.()
      }
    } catch (err) {
      console.error('Error deleting gallery item:', err)
      alert('Error deleting gallery item')
    } finally {
      setDeletingItem(null)
    }
  }

  const filteredItems = galleryItems.filter(item => {
    if (filter === 'all') return true;
    if (filter === 'photo') return item.media_type === 'image';
    if (filter === 'video') return item.media_type === 'video';
    return true;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    )
  }

  if (filteredItems.length === 0) {
    return (
      <div className="text-center p-8 border-2 border-dashed border-white/20 rounded-lg">
        <h3 className="text-lg font-semibold text-white/80">No Gallery Items Found</h3>
        <p className="text-sm text-white/50 mt-2">
          {filter === 'all' ? 'Add your first item to get started.' : `No ${filter === 'photo' ? 'photos' : 'videos'} found. Try a different filter.`}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white/5 rounded-lg overflow-hidden border border-white/10 group">
              {/* Image/Video Preview */}
              <div className="relative aspect-video">
                <img src={item.image_url} alt={item.title} className="w-full h-full object-cover"/>
                {item.media_type === 'video' && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    </div>
                  </div>
                )}
                 <div className="absolute top-2 right-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {onEdit && (
                    <button onClick={() => onEdit(item)} className="p-2 bg-blue-500/80 text-white rounded-full hover:bg-blue-500" title="Edit"><PencilIcon className="h-4 w-4" /></button>
                  )}
                  <button onClick={() => handleDelete(item.id)} disabled={deletingItem === item.id} className="p-2 bg-red-500/80 text-white rounded-full hover:bg-red-500" title="Delete"><TrashIcon className="h-4 w-4" /></button>
                </div>
              </div>

              {/* Content */}
              <div className="p-3">
                <h4 className="font-medium text-sm mb-1 line-clamp-1 text-white">{item.title}</h4>
                <p className="text-gray-400 text-xs mb-2 line-clamp-2">{item.description}</p>
                <div className="flex justify-between items-center">
                   <p className="text-gray-500 text-xs">{formatDate(item.created_at)}</p>
                   <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      item.media_type === 'video' ? 'bg-blue-900/20 text-blue-300 border border-blue-500/20' : 'bg-green-900/20 text-green-300 border border-green-500/20'
                    }`}>{item.media_type === 'video' ? 'Video' : 'Image'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <div key={item.id} className="flex items-center p-3 bg-white/5 rounded-lg border border-white/10">
              <img src={item.image_url} alt={item.title} className="w-16 h-16 object-cover rounded-md mr-4" />
              <div className="flex-1">
                <h4 className="font-medium text-sm text-white">{item.title}</h4>
                <p className="text-gray-400 text-xs line-clamp-1">{item.description}</p>
                <p className="text-gray-500 text-xs mt-1">{formatDate(item.created_at)}</p>
              </div>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full mx-4 ${
                  item.media_type === 'video' ? 'bg-blue-900/20 text-blue-300 border border-blue-500/20' : 'bg-green-900/20 text-green-300 border border-green-500/20'
                }`}>{item.media_type === 'video' ? 'Video' : 'Image'}</span>
              <div className="flex items-center gap-2">
                {onEdit && (
                  <button onClick={() => onEdit(item)} className="p-2 text-blue-400 hover:text-blue-300 transition-colors" title="Edit"><PencilIcon className="h-4 w-4" /></button>
                )}
                <button onClick={() => handleDelete(item.id)} disabled={deletingItem === item.id} className="p-2 text-red-400 hover:text-red-300 transition-colors" title="Delete"><TrashIcon className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
} 