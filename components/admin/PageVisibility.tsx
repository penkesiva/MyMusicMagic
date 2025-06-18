import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline'

interface PageSetting {
  id: number
  page_name: string
  enabled: boolean
}

const PAGE_LABELS: Record<string, string> = {
  home: 'Home',
  gallery: 'Gallery',
  contact: 'Contact',
  quotes: 'Quotes',
}

export default function PageVisibility() {
  const [settings, setSettings] = useState<PageSetting[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from('page_settings')
        .select('*')
        .order('id', { ascending: true })
      if (error) throw error
      setSettings(data || [])
    } catch (err) {
      setError('Failed to load page settings')
    } finally {
      setLoading(false)
    }
  }

  const handleToggle = async (id: number, enabled: boolean) => {
    setError(null)
    try {
      const { error } = await supabase
        .from('page_settings')
        .update({ enabled })
        .eq('id', id)
      if (error) throw error
      setSettings((prev) => prev.map(s => s.id === id ? { ...s, enabled } : s))
    } catch (err) {
      setError('Failed to update page setting')
    }
  }

  return (
    <div className="mb-6 bg-dark-200 rounded-lg overflow-hidden">
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-white">Page Visibility</h2>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex items-center text-sm text-blue-300 hover:text-blue-200 transition-colors"
            aria-label={open ? 'Collapse' : 'Expand'}
          >
            {open ? (
              <><ChevronUpIcon className="h-4 w-4 mr-1" /> Collapse</>
            ) : (
              <><ChevronDownIcon className="h-4 w-4 mr-1" /> Expand</>
            )}
          </button>
        </div>
        {open && (
          <>
            <p className="text-gray-400 text-sm mb-4">Enable or disable pages on your website. The Home page is always enabled.</p>
            {error && <div className="text-red-400 mb-2">{error}</div>}
            {loading ? (
              <div className="text-gray-300">Loading...</div>
            ) : (
              <div className="space-y-3">
                {/* Home page (always enabled, non-editable) */}
                <div className="flex items-center justify-between bg-dark-300 rounded-lg px-4 py-3">
                  <span className="text-white font-medium">Home</span>
                  <span className="text-green-400 font-semibold">Enabled</span>
                </div>
                {/* Other pages */}
                {settings.map(setting => (
                  <div key={setting.page_name} className="flex items-center justify-between bg-dark-300 rounded-lg px-4 py-3">
                    <span className="text-white">{PAGE_LABELS[setting.page_name] || setting.page_name}</span>
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={setting.enabled}
                        onChange={e => handleToggle(setting.id, e.target.checked)}
                        className="form-checkbox h-5 w-5 text-primary-500"
                      />
                      <span className="ml-2 text-sm text-gray-300">{setting.enabled ? 'Enabled' : 'Disabled'}</span>
                    </label>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
} 