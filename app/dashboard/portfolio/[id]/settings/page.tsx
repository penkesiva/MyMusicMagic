'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'
import { 
  ArrowLeftIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

type UserPortfolio = Database['public']['Tables']['user_portfolios']['Row']
type PortfolioTemplate = Database['public']['Tables']['portfolio_templates']['Row']

export default function PortfolioSettingsPage() {
  const [portfolio, setPortfolio] = useState<UserPortfolio | null>(null)
  const [templates, setTemplates] = useState<PortfolioTemplate[]>([])
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    template_id: '',
    description: ''
  })
  
  const router = useRouter()
  const params = useParams()
  const portfolioId = params.id as string
  const supabase = createClient()

  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/signin')
        return
      }

      setUser(user)

      // Fetch portfolio and verify ownership
      const { data: portfolioData, error: portfolioError } = await supabase
        .from('user_portfolios')
        .select('*')
        .eq('id', portfolioId)
        .eq('user_id', user.id)
        .single()

      if (portfolioError || !portfolioData) {
        setError('Portfolio not found or access denied')
        setIsLoading(false)
        return
      }

      setPortfolio(portfolioData)
      setFormData({
        name: portfolioData.name || '',
        slug: portfolioData.slug || '',
        template_id: portfolioData.template_id || '',
        description: portfolioData.description || ''
      })

      // Fetch available templates
      const { data: templatesData } = await supabase
        .from('portfolio_templates')
        .select('*')
        .order('name')

      if (templatesData) {
        setTemplates(templatesData)
      }

      setIsLoading(false)
    }

    loadData()
  }, [portfolioId, supabase, router])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Auto-generate slug from name
    if (field === 'name') {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
      setFormData(prev => ({ ...prev, slug }))
    }
  }

  const handleSave = async () => {
    if (!portfolio) return

    setIsSaving(true)
    setError(null)
    setSuccess(null)

    try {
      // Validate slug uniqueness (excluding current portfolio)
      if (formData.slug !== portfolio.slug) {
        const { data: existingPortfolio } = await supabase
          .from('user_portfolios')
          .select('id')
          .eq('slug', formData.slug)
          .neq('id', portfolio.id)
          .single()

        if (existingPortfolio) {
          throw new Error('This URL slug is already taken. Please choose a different one.')
        }
      }

      const { error } = await supabase
        .from('user_portfolios')
        .update({
          name: formData.name,
          slug: formData.slug,
          template_id: formData.template_id || null,
          description: formData.description,
          updated_at: new Date().toISOString()
        })
        .eq('id', portfolio.id)

      if (error) throw error

      setPortfolio(prev => prev ? { ...prev, ...formData } : null)
      setSuccess('Portfolio settings updated successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to update portfolio settings')
      setTimeout(() => setError(null), 5000)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!portfolio || !confirm('Are you sure you want to delete this portfolio? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('user_portfolios')
        .delete()
        .eq('id', portfolio.id)

      if (error) throw error

      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Failed to delete portfolio')
      setTimeout(() => setError(null), 5000)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-100">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (error && !portfolio) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-100">
        <div className="text-center">
          <div className="text-red-400 text-lg mb-4">{error}</div>
          <Link
            href="/dashboard"
            className="text-primary-400 hover:text-primary-300 transition-colors"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  if (!portfolio) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-100">
        <div className="text-white">Portfolio not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-100">
      {/* Header */}
      <header className="bg-dark-200 border-b border-dark-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link
                href={`/dashboard/portfolio/${portfolio.id}/edit`}
                className="flex items-center text-gray-300 hover:text-white transition-colors"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Edit Portfolio
              </Link>
              <h1 className="text-xl font-bold text-white">
                Portfolio Settings
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Success/Error Messages */}
      {success && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {success}
        </div>
      )}
      {error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {error}
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          
          {/* Settings Form */}
          <div className="bg-dark-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-6">Basic Information</h2>
            
            <div className="space-y-6">
              {/* Portfolio Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                  Portfolio Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 bg-dark-300 border border-dark-400 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter portfolio name"
                />
                <p className="mt-1 text-sm text-gray-400">
                  This is the display name for your portfolio
                </p>
              </div>

              {/* URL Slug */}
              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-gray-300 mb-2">
                  URL Slug
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-dark-400 bg-dark-300 text-gray-400 text-sm">
                    heroportfolio.com/portfolio/
                  </span>
                  <input
                    type="text"
                    id="slug"
                    value={formData.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    className="flex-1 px-3 py-2 bg-dark-300 border border-dark-400 rounded-r-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="your-portfolio-name"
                  />
                </div>
                <p className="mt-1 text-sm text-gray-400">
                  This will be your portfolio's unique URL. Only letters, numbers, and hyphens are allowed.
                </p>
              </div>

              {/* Template Selection */}
              <div>
                <label htmlFor="template" className="block text-sm font-medium text-gray-300 mb-2">
                  Portfolio Template
                </label>
                <select
                  id="template"
                  value={formData.template_id}
                  onChange={(e) => handleInputChange('template_id', e.target.value)}
                  className="w-full px-3 py-2 bg-dark-300 border border-dark-400 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">No template (Custom)</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name} - {template.description}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-sm text-gray-400">
                  Choose a template to get started quickly, or leave empty for a custom portfolio
                </p>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 bg-dark-300 border border-dark-400 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Brief description of your portfolio"
                />
                <p className="mt-1 text-sm text-gray-400">
                  A short description of your portfolio (optional)
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-6 border-t border-dark-300">
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Delete Portfolio
              </button>
              
              <div className="flex space-x-3">
                <Link
                  href={`/dashboard/portfolio/${portfolio.id}/edit`}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </Link>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckIcon className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Portfolio Preview */}
          <div className="bg-dark-200 rounded-lg p-6 mt-6">
            <h2 className="text-lg font-semibold text-white mb-4">Preview</h2>
            <div className="bg-dark-300 rounded-lg p-4">
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-gray-400">Name:</span>
                  <span className="text-white ml-2">{formData.name || 'Untitled Portfolio'}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-400">URL:</span>
                  <span className="text-blue-400 ml-2">
                    heroportfolio.com/portfolio/{formData.slug || 'your-portfolio-name'}
                  </span>
                </div>
                {formData.description && (
                  <div>
                    <span className="text-sm text-gray-400">Description:</span>
                    <span className="text-white ml-2">{formData.description}</span>
                  </div>
                )}
                {formData.template_id && (
                  <div>
                    <span className="text-sm text-gray-400">Template:</span>
                    <span className="text-white ml-2">
                      {templates.find(t => t.id === formData.template_id)?.name}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 