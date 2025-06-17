'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'
import { PlusIcon, XMarkIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline'

type ArtistInfo = Database['public']['Tables']['artist_info']['Row']
type ArtistLink = Database['public']['Tables']['artist_links']['Row']

// Define a type for the form data that includes the new fields
type ArtistInfoFormData = Omit<ArtistInfo, 'created_at' | 'updated_at' | 'user_id'> & {
  use_same_text: boolean
  footer_text: string | null
  homepage_title: string
  homepage_description: string
  homepage_hero_url: string
}

interface ArtistInfoFormProps {
  onSave: () => void
}

export function ArtistInfoForm({ onSave }: ArtistInfoFormProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [artistInfo, setArtistInfo] = useState<Partial<ArtistInfoFormData>>({
    about_text: '',
    photo_url: '',
    use_same_text: true,
    footer_text: '',
    homepage_title: 'My Music Magic',
    homepage_description: 'Discover a collection of carefully crafted musical compositions, each telling its own unique story through melody and rhythm.',
    homepage_hero_url: '/hero-bg.jpg',
  })
  const [links, setLinks] = useState<Array<{ id?: string; title: string; url: string }>>([])
  const [newLink, setNewLink] = useState({ title: '', url: '' })
  const [showImageGuidelines, setShowImageGuidelines] = useState(false)
  const [showPhotoGuidelines, setShowPhotoGuidelines] = useState(false)
  const photoFileRef = useRef<HTMLInputElement>(null)
  const heroImageFileRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchArtistInfo()
  }, [])

  const fetchArtistInfo = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError
      if (!user) throw new Error('Not authenticated')

      // Fetch artist info
      const { data: info, error: infoError } = await supabase
        .from('artist_info')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (infoError && infoError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        throw infoError
      }

      if (info) {
        setArtistInfo(info)
        // Fetch artist links
        const { data: artistLinks, error: linksError } = await supabase
          .from('artist_links')
          .select('*')
          .eq('artist_info_id', info.id)

        if (linksError) throw linksError
        if (artistLinks) {
          setLinks(artistLinks)
        }
      }
    } catch (err) {
      console.error('Error fetching artist info:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target
    setArtistInfo((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleNewLinkChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target
    setNewLink((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const addLink = () => {
    if (newLink.title && newLink.url) {
      setLinks((prev) => [...prev, { ...newLink }])
      setNewLink({ title: '', url: '' })
    }
  }

  const removeLink = (index: number) => {
    setLinks((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError
      if (!user) throw new Error('Not authenticated')

      let photoUrl = artistInfo.photo_url
      let heroImageUrl = artistInfo.homepage_hero_url

      // Upload new photo if one was selected
      if (photoFileRef.current?.files?.[0]) {
        const photoFile = photoFileRef.current.files[0]
        const photoPath = `${user.id}/artist-photos/${Date.now()}-${photoFile.name}`
        const { error: uploadError } = await supabase.storage
          .from('artist-photos')
          .upload(photoPath, photoFile, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage
          .from('artist-photos')
          .getPublicUrl(photoPath)

        photoUrl = urlData.publicUrl
      }

      // Upload new hero image if one was selected
      if (heroImageFileRef.current?.files?.[0]) {
        const heroFile = heroImageFileRef.current.files[0]
        const heroPath = `${user.id}/hero-images/${Date.now()}-${heroFile.name}`
        const { error: uploadError } = await supabase.storage
          .from('hero-images')
          .upload(heroPath, heroFile, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage
          .from('hero-images')
          .getPublicUrl(heroPath)

        heroImageUrl = urlData.publicUrl
      }

      // Create or update artist info
      const artistInfoData = {
        about_text: artistInfo.about_text,
        photo_url: photoUrl,
        user_id: user.id,
        use_same_text: artistInfo.use_same_text ?? true,
        footer_text: artistInfo.use_same_text ? null : artistInfo.footer_text,
        homepage_title: artistInfo.homepage_title || 'My Music Magic',
        homepage_description: artistInfo.homepage_description || 'Discover a collection of carefully crafted musical compositions, each telling its own unique story through melody and rhythm.',
        homepage_hero_url: heroImageUrl,
        updated_at: new Date().toISOString(),
      }

      let artistInfoId: string

      if (artistInfo.id) {
        // Update existing artist info
        const { error: updateError } = await supabase
          .from('artist_info')
          .update(artistInfoData)
          .eq('id', artistInfo.id)

        if (updateError) throw updateError
        artistInfoId = artistInfo.id
      } else {
        // Create new artist info
        const { data, error: insertError } = await supabase
          .from('artist_info')
          .insert(artistInfoData)
          .select()
          .single()

        if (insertError) throw insertError
        if (!data) throw new Error('Failed to create artist info')
        artistInfoId = data.id
      }

      // Delete existing links
      if (artistInfo.id) {
        const { error: deleteError } = await supabase
          .from('artist_links')
          .delete()
          .eq('artist_info_id', artistInfo.id)

        if (deleteError) throw deleteError
      }

      // Insert new links
      if (links.length > 0) {
        const linksData = links.map(link => ({
          title: link.title,
          url: link.url,
          artist_info_id: artistInfoId,
          updated_at: new Date().toISOString(),
        }))

        const { error: linksError } = await supabase
          .from('artist_links')
          .insert(linksData)

        if (linksError) throw linksError
      }

      setSuccess(true)
      onSave()
    } catch (err) {
      console.error('Error saving artist info:', err)
      setError(err instanceof Error ? err.message : 'An error occurred while saving')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="text-white">Loading...</div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-dark-200 p-6 rounded-lg">
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">About the Artist</h2>
        
        <div className="space-y-6">
          {/* Homepage Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Homepage Content</h3>
            <div>
              <label
                htmlFor="homepage_title"
                className="block text-sm font-medium text-gray-300"
              >
                Homepage Title
              </label>
              <input
                type="text"
                id="homepage_title"
                name="homepage_title"
                value={artistInfo.homepage_title || ''}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 bg-dark-300 border border-dark-400 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                placeholder="Enter homepage title"
              />
            </div>
            <div>
              <label
                htmlFor="homepage_description"
                className="block text-sm font-medium text-gray-300"
              >
                Homepage Description
              </label>
              <textarea
                id="homepage_description"
                name="homepage_description"
                value={artistInfo.homepage_description || ''}
                onChange={handleInputChange}
                rows={3}
                className="mt-1 block w-full px-3 py-2 bg-dark-300 border border-dark-400 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                placeholder="Enter homepage description"
              />
            </div>
            <div>
              <label
                htmlFor="hero_image"
                className="block text-sm font-medium text-gray-300"
              >
                Homepage Hero Image *
              </label>
              
              {/* Image Guidelines */}
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => setShowImageGuidelines(!showImageGuidelines)}
                  className="flex items-center text-sm text-blue-300 hover:text-blue-200 transition-colors mb-2"
                >
                  {showImageGuidelines ? (
                    <>
                      <ChevronUpIcon className="h-4 w-4 mr-1" />
                      Hide Image Guidelines
                    </>
                  ) : (
                    <>
                      <ChevronDownIcon className="h-4 w-4 mr-1" />
                      Show Image Guidelines
                    </>
                  )}
                </button>
                
                {showImageGuidelines && (
                  <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-300 mb-2">📸 Image Guidelines</h4>
                    <ul className="text-xs text-blue-200 space-y-1">
                      <li>• <strong>Recommended size:</strong> 1920×1080 pixels (16:9 aspect ratio)</li>
                      <li>• <strong>Minimum size:</strong> 1200×675 pixels</li>
                      <li>• <strong>File format:</strong> JPG, PNG, or WebP</li>
                      <li>• <strong>File size:</strong> Under 5MB for fast loading</li>
                      <li>• <strong>Content:</strong> High contrast, avoid text-heavy images</li>
                      <li>• <strong>Focus:</strong> Center the main subject for best mobile display</li>
                    </ul>
                  </div>
                )}
              </div>

              <input
                type="file"
                id="hero_image"
                name="hero_image"
                ref={heroImageFileRef}
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    // Validate file size
                    if (file.size > 5 * 1024 * 1024) {
                      alert('File size must be under 5MB')
                      e.target.value = ''
                      return
                    }
                    
                    // Preview image
                    const reader = new FileReader()
                    reader.onload = (event) => {
                      setArtistInfo(prev => ({
                        ...prev,
                        homepage_hero_url: event.target?.result as string
                      }))
                    }
                    reader.readAsDataURL(file)
                  }
                }}
                className="mt-3 block w-full px-3 py-2 bg-dark-300 border border-dark-400 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              />
              
              {/* Current Image Preview with Editing */}
              {artistInfo.homepage_hero_url && (
                <div className="mt-4 space-y-4">
                  <div className="relative group">
                    <div className="relative">
                      <img
                        src={artistInfo.homepage_hero_url}
                        alt="Current hero image"
                        className="w-full h-64 object-cover rounded-lg border-2 border-gray-600"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <span className="text-white text-sm font-medium">Current Hero Image</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Image Info */}
                    <div className="mt-2 p-3 bg-dark-300 rounded-lg">
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>Hero Image Preview</span>
                        <button
                          type="button"
                          onClick={() => {
                            setArtistInfo(prev => ({ ...prev, homepage_hero_url: '/hero-bg.jpg' }))
                            if (heroImageFileRef.current) {
                              heroImageFileRef.current.value = ''
                            }
                          }}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          Reset to Default
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* URL Input Alternative */}
              <div className="mt-4">
                <label
                  htmlFor="hero_image_url"
                  className="block text-sm font-medium text-gray-300"
                >
                  Or enter image URL
                </label>
                <input
                  type="url"
                  id="hero_image_url"
                  name="homepage_hero_url"
                  value={artistInfo.homepage_hero_url || ''}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 bg-dark-300 border border-dark-400 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  placeholder="https://example.com/image.jpg"
                />
                <p className="mt-1 text-xs text-gray-500">
                  You can also paste an image URL instead of uploading a file
                </p>
              </div>
            </div>
          </div>

          {/* About Text Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">About Text</h3>
            <div>
              <label
                htmlFor="about_text"
                className="block text-sm font-medium text-gray-300"
              >
                About Text
              </label>
              <textarea
                id="about_text"
                name="about_text"
                value={artistInfo.about_text || ''}
                onChange={handleInputChange}
                rows={6}
                className="mt-1 block w-full px-3 py-2 bg-dark-300 border border-dark-400 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                placeholder="Write about yourself..."
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="use_same_text"
                  name="use_same_text"
                  checked={artistInfo.use_same_text ?? true}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary-500 focus:ring-primary-500 border-dark-400 rounded bg-dark-300"
                />
                <label
                  htmlFor="use_same_text"
                  className="ml-2 block text-sm text-gray-300"
                >
                  Use the same text in the footer
                </label>
              </div>

              {!artistInfo.use_same_text && (
                <div>
                  <label
                    htmlFor="footer_text"
                    className="block text-sm font-medium text-gray-300"
                  >
                    Footer About Text
                  </label>
                  <textarea
                    id="footer_text"
                    name="footer_text"
                    value={artistInfo.footer_text || ''}
                    onChange={handleInputChange}
                    rows={4}
                    className="mt-1 block w-full px-3 py-2 bg-dark-300 border border-dark-400 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    placeholder="Write a shorter version for the footer..."
                  />
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="photo"
                className="block text-sm font-medium text-gray-300"
              >
                Artist Photo
              </label>
              
              {/* Photo Guidelines */}
              <div className="mt-2">
                <button
                  type="button"
                  onClick={() => setShowPhotoGuidelines(!showPhotoGuidelines)}
                  className="flex items-center text-sm text-green-300 hover:text-green-200 transition-colors mb-2"
                >
                  {showPhotoGuidelines ? (
                    <>
                      <ChevronUpIcon className="h-4 w-4 mr-1" />
                      Hide Photo Guidelines
                    </>
                  ) : (
                    <>
                      <ChevronDownIcon className="h-4 w-4 mr-1" />
                      Show Photo Guidelines
                    </>
                  )}
                </button>
                
                {showPhotoGuidelines && (
                  <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg">
                    <h4 className="text-sm font-medium text-green-300 mb-2">📷 Photo Guidelines</h4>
                    <ul className="text-xs text-green-200 space-y-1">
                      <li>• <strong>Recommended size:</strong> 800×800 pixels (square format)</li>
                      <li>• <strong>Minimum size:</strong> 400×400 pixels</li>
                      <li>• <strong>File format:</strong> JPG, PNG, or WebP</li>
                      <li>• <strong>File size:</strong> Under 2MB for fast loading</li>
                      <li>• <strong>Style:</strong> Professional headshot or artistic portrait</li>
                      <li>• <strong>Background:</strong> Simple, uncluttered background works best</li>
                    </ul>
                  </div>
                )}
              </div>

              <input
                type="file"
                id="photo"
                name="photo"
                ref={photoFileRef}
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    // Validate file size
                    if (file.size > 2 * 1024 * 1024) {
                      alert('File size must be under 2MB')
                      e.target.value = ''
                      return
                    }
                    
                    // Preview image
                    const reader = new FileReader()
                    reader.onload = (event) => {
                      setArtistInfo(prev => ({
                        ...prev,
                        photo_url: event.target?.result as string
                      }))
                    }
                    reader.readAsDataURL(file)
                  }
                }}
                className="mt-3 block w-full px-3 py-2 bg-dark-300 border border-dark-400 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              />
              
              {/* Current Photo Preview with Editing */}
              {artistInfo.photo_url && (
                <div className="mt-4 space-y-4">
                  <div className="relative group">
                    <div className="relative inline-block">
                      <img
                        src={artistInfo.photo_url}
                        alt="Current artist photo"
                        className="w-40 h-40 object-cover rounded-lg border-2 border-gray-600"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 rounded-lg flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <span className="text-white text-sm font-medium">Artist Photo</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Photo Info */}
                    <div className="mt-2 p-3 bg-dark-300 rounded-lg">
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>Artist Photo Preview</span>
                        <button
                          type="button"
                          onClick={() => {
                            setArtistInfo(prev => ({ ...prev, photo_url: '' }))
                            if (photoFileRef.current) {
                              photoFileRef.current.value = ''
                            }
                          }}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          Remove Photo
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* URL Input Alternative */}
              <div className="mt-4">
                <label
                  htmlFor="photo_url"
                  className="block text-sm font-medium text-gray-300"
                >
                  Or enter photo URL
                </label>
                <input
                  type="url"
                  id="photo_url"
                  name="photo_url"
                  value={artistInfo.photo_url || ''}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 bg-dark-300 border border-dark-400 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  placeholder="https://example.com/photo.jpg"
                />
                <p className="mt-1 text-xs text-gray-500">
                  You can also paste a photo URL instead of uploading a file
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Social Links
              </label>
              <div className="space-y-2">
                {links.map((link, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={link.title}
                      onChange={(e) => {
                        const newLinks = [...links]
                        newLinks[index].title = e.target.value
                        setLinks(newLinks)
                      }}
                      placeholder="Link title (e.g., YouTube)"
                      className="flex-1 px-3 py-2 bg-dark-300 border border-dark-400 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    />
                    <input
                      type="url"
                      value={link.url}
                      onChange={(e) => {
                        const newLinks = [...links]
                        newLinks[index].url = e.target.value
                        setLinks(newLinks)
                      }}
                      placeholder="URL"
                      className="flex-1 px-3 py-2 bg-dark-300 border border-dark-400 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeLink(index)}
                      className="p-2 text-gray-400 hover:text-white transition-colors"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    name="title"
                    value={newLink.title}
                    onChange={handleNewLinkChange}
                    placeholder="New link title"
                    className="flex-1 px-3 py-2 bg-dark-300 border border-dark-400 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  />
                  <input
                    type="url"
                    name="url"
                    value={newLink.url}
                    onChange={handleNewLinkChange}
                    placeholder="New link URL"
                    className="flex-1 px-3 py-2 bg-dark-300 border border-dark-400 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  />
                  <button
                    type="button"
                    onClick={addLink}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <PlusIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      {success && (
        <div className="text-green-500 text-sm">Artist information saved successfully!</div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="px-3 py-1.5 bg-primary-500 text-white rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
} 