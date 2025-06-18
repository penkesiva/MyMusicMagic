'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'

type GalleryItem = Database['public']['Tables']['gallery']['Row']

interface GalleryUploadFormProps {
  onSuccess?: () => void
  onCancel?: () => void
  editItem?: GalleryItem | null
}

export default function GalleryUploadForm({ onSuccess, onCancel, editItem }: GalleryUploadFormProps) {
  const [title, setTitle] = useState(editItem?.title || '')
  const [description, setDescription] = useState(editItem?.description || '')
  const [mediaType, setMediaType] = useState<'image' | 'video'>(editItem?.media_type as 'image' | 'video' || 'image')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState(editItem?.image_url || '')
  const [videoUrl, setVideoUrl] = useState(editItem?.video_url || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const supabase = createClient()

  const handleImageUpload = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `gallery/${fileName}`

    const { error: uploadError, data } = await supabase.storage
      .from('gallery-images')
      .upload(filePath, file)

    if (uploadError) {
      throw new Error('Error uploading image')
    }

    const { data: { publicUrl } } = supabase.storage
      .from('gallery-images')
      .getPublicUrl(filePath)

    return publicUrl
  }

  const getYouTubeThumbnail = (url: string): string => {
    const videoId = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)?.[1]
    return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : ''
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      let finalImageUrl = imageUrl

      // Upload new image if selected
      if (imageFile) {
        finalImageUrl = await handleImageUpload(imageFile)
      }

      // For videos, get YouTube thumbnail if no image is provided
      if (mediaType === 'video' && !finalImageUrl && videoUrl) {
        finalImageUrl = getYouTubeThumbnail(videoUrl)
      }

      const galleryData = {
        title,
        description: description || null,
        media_type: mediaType,
        image_url: finalImageUrl,
        video_url: mediaType === 'video' ? videoUrl : null,
      }

      if (editItem) {
        // Update existing item
        const { error: updateError } = await supabase
          .from('gallery')
          .update(galleryData)
          .eq('id', editItem.id)

        if (updateError) throw updateError
      } else {
        // Create new item
        const { error: insertError } = await supabase
          .from('gallery')
          .insert(galleryData)

        if (insertError) throw insertError
      }

      onSuccess?.()
    } catch (err) {
      console.error('Error saving gallery item:', err)
      setError('Error saving gallery item. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-dark-200/90 backdrop-blur-sm rounded-lg p-6 border border-white/10">
      <h2 className="text-2xl font-bold text-white mb-6">
        {editItem ? 'Edit Gallery Item' : 'Add Gallery Item'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
            Title *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 bg-dark-300 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            placeholder="Enter title"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 bg-dark-300 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            placeholder="Enter description (optional)"
          />
        </div>

        {/* Media Type */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Media Type *
          </label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="image"
                checked={mediaType === 'image'}
                onChange={(e) => setMediaType(e.target.value as 'image' | 'video')}
                className="mr-2 text-primary-500 focus:ring-primary-500"
              />
              <span className="text-gray-300">Image</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="video"
                checked={mediaType === 'video'}
                onChange={(e) => setMediaType(e.target.value as 'image' | 'video')}
                className="mr-2 text-primary-500 focus:ring-primary-500"
              />
              <span className="text-gray-300">YouTube Video</span>
            </label>
          </div>
        </div>

        {/* Image Upload/URL */}
        <div>
          <label htmlFor="image" className="block text-sm font-medium text-gray-300 mb-2">
            {mediaType === 'video' ? 'Thumbnail Image' : 'Image'} *
          </label>
          <div className="space-y-3">
            <div className="flex items-center">
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => document.getElementById('image')?.click()}
                className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg text-sm font-semibold transition-colors duration-200"
              >
                Upload
              </button>
              {imageFile && (
                <span className="ml-3 text-sm text-gray-300">
                  {imageFile.name}
                </span>
              )}
            </div>
            <div className="text-sm text-gray-400">
              Image URL:
            </div>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-4 py-3 bg-dark-300 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              placeholder="https://example.com/image.jpg"
            />
            <div className="text-xs text-gray-500">
              You can also paste an image URL instead of uploading a file
            </div>
            {mediaType === 'video' && (
              <div className="text-xs text-gray-500">
                For YouTube videos, you can leave this empty to automatically use the video thumbnail.
              </div>
            )}
          </div>
        </div>

        {/* Video URL */}
        {mediaType === 'video' && (
          <div>
            <label htmlFor="videoUrl" className="block text-sm font-medium text-gray-300 mb-2">
              YouTube Video URL *
            </label>
            <input
              type="url"
              id="videoUrl"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              className="w-full px-4 py-3 bg-dark-300 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              placeholder="https://www.youtube.com/watch?v=..."
              required={mediaType === 'video'}
            />
            <div className="text-xs text-gray-500 mt-1">
              Supports YouTube watch URLs and youtu.be links
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="text-red-400 text-sm bg-red-900/20 border border-red-500/20 rounded-lg p-3">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-primary-500 hover:bg-primary-600 disabled:bg-primary-500/50 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
          >
            {loading ? 'Saving...' : (editItem ? 'Update' : 'Add')}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  )
} 