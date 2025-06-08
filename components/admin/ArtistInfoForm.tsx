'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'

type ArtistInfo = Database['public']['Tables']['artist_info']['Row']
type ArtistLink = Database['public']['Tables']['artist_links']['Row']

// Define a type for the form data that includes the new fields
type ArtistInfoFormData = Omit<ArtistInfo, 'created_at' | 'updated_at' | 'user_id'> & {
  use_same_text: boolean
  footer_text: string | null
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
  })
  const [links, setLinks] = useState<Array<{ id?: string; title: string; url: string }>>([])
  const [newLink, setNewLink] = useState({ title: '', url: '' })
  const photoFileRef = useRef<HTMLInputElement>(null)
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

      // Upload new photo if one was selected
      if (photoFileRef.current?.files?.[0]) {
        const photoFile = photoFileRef.current.files[0]
        const photoPath = `${user.id}/${Date.now()}-${photoFile.name}`
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

      // Create or update artist info
      const artistInfoData = {
        about_text: artistInfo.about_text,
        photo_url: photoUrl,
        user_id: user.id,
        use_same_text: artistInfo.use_same_text ?? true,
        footer_text: artistInfo.use_same_text ? null : artistInfo.footer_text,
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
        
        <div className="space-y-4">
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
              className="mt-1 block w-full px-3 py-2 bg-dark-300 border border-dark-400 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                  className="mt-1 block w-full px-3 py-2 bg-dark-300 border border-dark-400 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
            <input
              type="file"
              id="photo"
              name="photo"
              ref={photoFileRef}
              accept="image/*"
              className="mt-1 block w-full px-3 py-2 bg-dark-300 border border-dark-400 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            {artistInfo.photo_url && (
              <div className="mt-2">
                <img
                  src={artistInfo.photo_url}
                  alt="Current artist photo"
                  className="w-32 h-32 object-cover rounded-lg"
                />
              </div>
            )}
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
                    className="flex-1 px-3 py-2 bg-dark-300 border border-dark-400 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                    className="flex-1 px-3 py-2 bg-dark-300 border border-dark-400 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
                  className="flex-1 px-3 py-2 bg-dark-300 border border-dark-400 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <input
                  type="url"
                  name="url"
                  value={newLink.url}
                  onChange={handleNewLinkChange}
                  placeholder="New link URL"
                  className="flex-1 px-3 py-2 bg-dark-300 border border-dark-400 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
          className="px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
} 