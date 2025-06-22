'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'

type GalleryItem = Database['public']['Tables']['gallery']['Row']
type GalleryItemInsert = Database['public']['Tables']['gallery']['Insert']
type GalleryItemUpdate = Database['public']['Tables']['gallery']['Update']


interface PortfolioGalleryFormProps {
  portfolioId: string
  item?: GalleryItem | null
  onSuccess: () => void
  onCancel: () => void
}

export default function PortfolioGalleryForm({ portfolioId, item: itemToEdit, onSuccess, onCancel }: PortfolioGalleryFormProps) {
  const [item, setItem] = useState<Partial<GalleryItemUpdate>>({})
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false)
  const [isProcessingUrl, setIsProcessingUrl] = useState(false);
  const [error, setError] = useState('')

  const supabase = createClient()

  useEffect(() => {
    if (itemToEdit) {
      setItem(itemToEdit)
      setImageUrl(itemToEdit.image_url || '');
      setMediaType(itemToEdit.media_type as 'image' | 'video' || 'image')
    } else {
      setItem({ title: '', description: '', media_type: 'image', image_url: '', video_url: '' })
      setImageUrl('');
    }
  }, [itemToEdit])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === 'image_url_input') {
        setImageUrl(value);
    } else {
        setItem((prev) => ({ ...prev, [name]: value }));
    }
  }

  const handleUrlBlur = async () => {
    if (!imageUrl || !imageUrl.startsWith('http')) return;

    setIsProcessingUrl(true);
    setError('');
    try {
        const { data, error } = await supabase.functions.invoke('image-proxy', {
            body: { url: imageUrl, portfolioId },
        });

        if (error) throw error;

        setItem(prev => ({ ...prev, image_url: data.publicUrl }));
        setImageUrl(data.publicUrl); // Update the input to show the new proxied URL
    } catch (err) {
        console.error('Error proxying image:', err);
        setError('Failed to process image URL. Please check the link or upload a file directly.');
    } finally {
        setIsProcessingUrl(false);
    }
  };


  const handleImageUpload = async (file: File): Promise<string> => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random()}.${fileExt}`
    const filePath = `portfolios/${portfolioId}/gallery/${fileName}`

    const { error: uploadError } = await supabase.storage.from('gallery-images').upload(filePath, file)
    if (uploadError) throw new Error('Error uploading image')

    const { data: { publicUrl } } = supabase.storage.from('gallery-images').getPublicUrl(filePath)
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
      let finalImageUrl = item.image_url || '';

      if (imageFile) {
        finalImageUrl = await handleImageUpload(imageFile)
      } else if (imageUrl && imageUrl !== item.image_url) {
        // This case is for when a user pastes a URL, we proxy it, and then they submit.
        // We rely on the handleUrlBlur function to have already updated item.image_url.
        finalImageUrl = item.image_url || '';
      }

      if (mediaType === 'video' && !finalImageUrl && item.video_url) {
        finalImageUrl = getYouTubeThumbnail(item.video_url)
      }

      if (!finalImageUrl) throw new Error('Please provide an image URL or upload an image file.')
      
      const galleryData: Partial<GalleryItemUpdate> = {
        ...item,
        title: item.title || 'Untitled',
        media_type: mediaType,
        image_url: finalImageUrl,
        video_url: mediaType === 'video' ? item.video_url : null,
      }

      if (itemToEdit) {
        delete galleryData.id
        delete galleryData.created_at
        const { error: updateError } = await supabase.from('gallery').update(galleryData as GalleryItemUpdate).eq('id', itemToEdit.id)
        if (updateError) throw updateError
      } else {
        const insertData: GalleryItemInsert = {
            portfolio_id: portfolioId,
            title: galleryData.title!,
            description: galleryData.description,
            media_type: galleryData.media_type!,
            image_url: galleryData.image_url!,
            video_url: galleryData.video_url,
        }
        const { error: insertError } = await supabase.from('gallery').insert(insertData)
        if (insertError) throw insertError
      }

      onSuccess()
    } catch (err) {
      console.error('Error saving gallery item:', err)
      setError(err instanceof Error ? err.message : 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-dark-400/90 backdrop-blur-sm rounded-lg p-6 border border-gray-600">
      <h3 className="text-lg font-semibold text-white mb-4">
        {itemToEdit ? 'Edit Gallery Item' : 'Add Gallery Item'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500 rounded-lg">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={item.title || ''}
            onChange={handleInputChange}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            placeholder="Enter title"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">Description</label>
          <textarea
            id="description"
            name="description"
            value={item.description || ''}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
            placeholder="Enter description (optional)"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Media Type *</label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input type="radio" value="image" checked={mediaType === 'image'} onChange={() => setMediaType('image')} className="mr-2 text-primary-500 focus:ring-primary-500" />
              <span className="text-gray-300">Image</span>
            </label>
            <label className="flex items-center">
              <input type="radio" value="video" checked={mediaType === 'video'} onChange={() => setMediaType('video')} className="mr-2 text-primary-500 focus:ring-primary-500"/>
              <span className="text-gray-300">YouTube Video</span>
            </label>
          </div>
        </div>

        {mediaType === 'video' && (
            <div>
                 <label htmlFor="video_url" className="block text-sm font-medium text-gray-300 mb-2">YouTube Video URL *</label>
                 <input
                    type="url"
                    id="video_url"
                    name="video_url"
                    value={item.video_url || ''}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                    placeholder="https://www.youtube.com/watch?v=..."
                    required
                 />
            </div>
        )}

        <div>
          <label htmlFor="image_url_input" className="block text-sm font-medium text-gray-300 mb-2">
            {mediaType === 'video' ? 'Custom Thumbnail (URL or Upload)' : 'Image (URL or Upload)'}
          </label>
          <div className="flex items-center gap-2">
            <input
                type="url"
                id="image_url_input"
                name="image_url_input"
                value={imageUrl}
                onChange={handleInputChange}
                onBlur={handleUrlBlur}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                placeholder="https://example.com/image.jpg"
                disabled={isProcessingUrl}
            />
            <input
                type="file"
                id="image_file_input"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="hidden"
            />
             <button
                type="button"
                onClick={() => document.getElementById('image_file_input')?.click()}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-lg text-sm font-semibold transition-colors shrink-0"
              >
                Upload
              </button>
          </div>
            {isProcessingUrl && <p className="text-sm text-yellow-400 mt-2">Processing URL...</p>}
            {imageFile && <p className="text-sm text-gray-300 mt-2">Selected file: {imageFile.name}</p>}

          {item.image_url && <img src={item.image_url} alt="thumbnail" className="mt-2 h-20 w-20 object-cover rounded-md" />}

        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-600">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
                type="submit"
                disabled={loading || isProcessingUrl}
                className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
                {loading ? 'Saving...' : (isProcessingUrl ? 'Processing...' : 'Save')}
            </button>
        </div>
      </form>
    </div>
  )
} 