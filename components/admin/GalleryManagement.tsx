'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'
import GalleryUploadForm from './GalleryUploadForm'
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'

type GalleryItem = Database['public']['Tables']['gallery']['Row']

export default function GalleryManagement() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null)
  const [deletingItem, setDeletingItem] = useState<string | null>(null)

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
      }
    } catch (error) {
      console.error('Error deleting gallery item:', error)
      alert('Error deleting gallery item')
    } finally {
      setDeletingItem(null)
    }
  }

  const handleEdit = (item: GalleryItem) => {
    setEditingItem(item)
    setShowForm(true)
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingItem(null)
    fetchGalleryItems()
  }

  const handleFormCancel = () => {
    setShowForm(false)
    setEditingItem(null)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  if (showForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Add/Edit Gallery Item</h2>
          <button
            onClick={() => setShowForm(false)}
            className="text-gray-400 hover:text-white"
          >
            ← Back to Gallery
          </button>
        </div>
        <GalleryUploadForm
          editItem={editingItem}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowForm(true)}
          className="bg-primary-500 hover:bg-primary-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200"
        >
          Add Item
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      ) : (
        <div className="bg-dark-200/50 backdrop-blur-sm rounded-lg border border-white/10 overflow-hidden">
          {galleryItems.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-gray-400 text-lg mb-2">No gallery items yet</div>
              <p className="text-gray-500 mb-6">Add your first gallery item to get started.</p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg transition-colors duration-200"
              >
                Add First Item
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark-300/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Preview
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {galleryItems.map((item) => (
                    <tr key={item.id} className="hover:bg-dark-300/30 transition-colors duration-200">
                      <td className="px-6 py-4">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-dark-300">
                          <img
                            src={item.image_url}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-white font-medium">{item.title}</div>
                          {item.description && (
                            <div className="text-gray-400 text-sm mt-1 line-clamp-2">
                              {item.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          item.media_type === 'video' 
                            ? 'bg-blue-900/20 text-blue-300 border border-blue-500/20' 
                            : 'bg-green-900/20 text-green-300 border border-green-500/20'
                        }`}>
                          {item.media_type === 'video' ? 'Video' : 'Image'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-400 text-sm">
                        {formatDate(item.created_at)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-2 text-blue-400 hover:text-blue-300 transition-colors duration-200"
                            title="Edit gallery item"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            disabled={deletingItem === item.id}
                            className="p-2 text-red-400 hover:text-red-300 disabled:text-red-600 transition-colors duration-200"
                            title="Delete gallery item"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 