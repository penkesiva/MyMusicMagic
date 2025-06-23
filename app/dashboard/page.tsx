'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'
import { 
  PlusIcon, 
  PencilIcon, 
  EyeIcon, 
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline'
import Link from 'next/link'

type UserProfile = Database['public']['Tables']['user_profiles']['Row']
type UserSubscription = Database['public']['Tables']['user_subscriptions']['Row']
type UserPortfolio = Database['public']['Tables']['user_portfolios']['Row']
type PortfolioTemplate = Database['public']['Tables']['portfolio_templates']['Row']

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [portfolios, setPortfolios] = useState<UserPortfolio[]>([])
  const [templates, setTemplates] = useState<PortfolioTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [isCreatingPortfolio, setIsCreatingPortfolio] = useState(false)
  const [newPortfolioName, setNewPortfolioName] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // Profile editing state
  const [editingProfile, setEditingProfile] = useState({
    full_name: '',
    username: '',
    bio: '',
    website_url: ''
  })
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      console.log('User auth check:', { user, userError })
      
      if (!user) {
        router.push('/auth/signin')
        return
      }

      setUser(user)

      // Ensure user profile exists
      const { error: ensureProfileError } = await supabase
        .rpc('ensure_user_profile', { user_uuid: user.id })

      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileData) {
        setProfile(profileData)
        setEditingProfile({
          username: profileData.username || '',
          full_name: profileData.full_name || '',
          bio: profileData.bio || '',
          website_url: profileData.website_url || ''
        })
      }

      // Ensure user subscription exists
      // Temporarily disabled due to database issues
      // const { error: ensureSubscriptionError } = await supabase
      //   .rpc('ensure_user_subscription', { user_uuid: user.id })
      // console.log('Ensure subscription:', { ensureSubscriptionError })

      // Fetch user subscription - temporarily disabled
      // const { data: subscriptionData, error: subscriptionError } = await supabase
      //   .from('user_subscriptions')
      //   .select('*')
      //   .eq('user_id', user.id)
      //   .single()
      // console.log('Subscription fetch:', { subscriptionData, subscriptionError })
      // if (subscriptionData) {
      //   setSubscription(subscriptionData)
      // }

      // Set default subscription for now
      setSubscription({
        id: 'default',
        user_id: user.id,
        plan_type: 'free',
        status: 'active',
        stripe_customer_id: null,
        stripe_subscription_id: null,
        current_period_start: null,
        current_period_end: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

      // Fetch user portfolios
      const { data: portfoliosData, error: portfoliosError } = await supabase
        .from('user_portfolios')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (portfoliosData) {
        setPortfolios(portfoliosData)
      }

      // Fetch portfolio templates
      const { data: templatesData, error: templatesError } = await supabase
        .from('portfolio_templates')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true })

      // Temporarily set empty templates array if there's an error
      if (templatesError) {
        console.warn('Templates not available:', templatesError.message)
        setTemplates([])
      } else if (templatesData) {
        setTemplates(templatesData)
      }

      setIsLoading(false)
    }

    checkUser()
  }, [supabase, router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleSaveProfile = async () => {
    if (!profile) return

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update(editingProfile)
        .eq('id', profile.id)

      if (error) throw error

      setProfile({ ...profile, ...editingProfile })
      setIsEditingProfile(false)
      setSuccess('Profile updated successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError('Failed to update profile')
      setTimeout(() => setError(null), 3000)
    }
  }

  const handleCreatePortfolio = async () => {
    if (!newPortfolioName.trim()) return

    try {
      const slug = newPortfolioName.toLowerCase().replace(/[^a-z0-9]/g, '-')
      
      const { data, error } = await supabase
        .from('user_portfolios')
        .insert({
          user_id: user.id,
          name: newPortfolioName,
          slug: slug,
          template_id: selectedTemplate || null,
          is_published: true, // Make portfolios published by default
          is_default: portfolios.length === 0 // First portfolio is default
        })
        .select()
        .single()

      if (error) throw error

      setPortfolios([data, ...portfolios])
      setIsCreatingPortfolio(false)
      setNewPortfolioName('')
      setSelectedTemplate('')
      setSuccess('Portfolio created successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error('Portfolio creation error:', err)
      setError('Failed to create portfolio')
      setTimeout(() => setError(null), 3000)
    }
  }

  const handleDeletePortfolio = async (portfolioId: string) => {
    if (!confirm('Are you sure you want to delete this portfolio?')) return

    try {
      const { error } = await supabase
        .from('user_portfolios')
        .delete()
        .eq('id', portfolioId)

      if (error) throw error

      setPortfolios(portfolios.filter(p => p.id !== portfolioId))
      setSuccess('Portfolio deleted successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError('Failed to delete portfolio')
      setTimeout(() => setError(null), 3000)
    }
  }

  const handleTogglePublish = async (portfolioId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('user_portfolios')
        .update({ is_published: !currentStatus })
        .eq('id', portfolioId)

      if (error) throw error

      setPortfolios(portfolios.map(p => 
        p.id === portfolioId 
          ? { ...p, is_published: !currentStatus }
          : p
      ))
      setSuccess(`Portfolio ${!currentStatus ? 'published' : 'unpublished'} successfully!`)
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError('Failed to update portfolio status')
      setTimeout(() => setError(null), 3000)
    }
  }

  const getPlanFeatures = (planType: string) => {
    switch (planType) {
      case 'free':
        return ['1 Portfolio', 'Basic Templates', 'Standard Support']
      case 'pro':
        return ['Unlimited Portfolios', 'All Templates', 'Custom Domain', 'Analytics', 'Priority Support']
      case 'enterprise':
        return ['Everything in Pro', 'White Label', 'API Access', 'Dedicated Support']
      default:
        return ['1 Portfolio', 'Basic Templates', 'Standard Support']
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-gray-200">
      {/* Header */}
      <header className="bg-white/5 backdrop-blur-sm border-b border-white/10 shadow-lg">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">Hero Portfolio</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-300">Welcome, {profile?.username || user?.email}</span>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg hover:bg-red-500/30 transition-all duration-300"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Success/Error Messages */}
      {success && (
        <div className="fixed top-4 right-4 bg-green-500/20 border border-green-500/30 text-green-400 px-6 py-3 rounded-lg shadow-lg z-50 backdrop-blur-sm">
          {success}
        </div>
      )}
      {error && (
        <div className="fixed top-4 right-4 bg-red-500/20 border border-red-500/30 text-red-400 px-6 py-3 rounded-lg shadow-lg z-50 backdrop-blur-sm">
          {error}
        </div>
      )}

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Profile Section */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">Profile</h2>
                {!isEditingProfile ? (
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
                  >
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSaveProfile}
                      className="px-4 py-2 bg-green-500/20 border border-green-500/30 text-green-400 rounded-lg hover:bg-green-500/30 transition-all duration-300"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setIsEditingProfile(false)}
                      className="px-4 py-2 bg-gray-500/20 border border-gray-500/30 text-gray-400 rounded-lg hover:bg-gray-500/30 transition-all duration-300"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              {isEditingProfile ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
                    <input
                      type="text"
                      value={editingProfile.username}
                      onChange={(e) => setEditingProfile({ ...editingProfile, username: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={editingProfile.full_name}
                      onChange={(e) => setEditingProfile({ ...editingProfile, full_name: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Bio</label>
                    <textarea
                      value={editingProfile.bio}
                      onChange={(e) => setEditingProfile({ ...editingProfile, bio: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Website URL</label>
                    <input
                      type="url"
                      value={editingProfile.website_url}
                      onChange={(e) => setEditingProfile({ ...editingProfile, website_url: e.target.value })}
                      className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="https://example.com"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-1">Username</h3>
                    <p className="text-white">{profile?.username || 'Not set'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-1">Full Name</h3>
                    <p className="text-white">{profile?.full_name || 'Not set'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-1">Bio</h3>
                    <p className="text-white">{profile?.bio || 'No bio added yet'}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-1">Website</h3>
                    <p className="text-white">
                      {profile?.website_url ? (
                        <a href={profile.website_url} target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 transition-colors">
                          {profile.website_url}
                        </a>
                      ) : (
                        'Not set'
                      )}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Subscription Section */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-2xl">
              <h2 className="text-xl font-semibold text-white mb-4">Subscription</h2>
              <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium text-white capitalize">{subscription?.plan_type || 'Free'} Plan</h3>
                    <p className="text-gray-300">Status: <span className="text-green-400">{subscription?.status || 'Active'}</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-white">
                      {subscription?.plan_type === 'free' ? 'Free' : '$9.99'}
                    </p>
                    <p className="text-sm text-gray-400">per month</p>
                  </div>
                </div>
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Features:</h4>
                  <ul className="space-y-1">
                    {getPlanFeatures(subscription?.plan_type || 'free').map((feature, index) => (
                      <li key={index} className="text-sm text-gray-300 flex items-center">
                        <svg className="w-4 h-4 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Portfolios Section */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">Portfolios</h2>
                <button
                  onClick={() => setIsCreatingPortfolio(true)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
                >
                  Create Portfolio
                </button>
              </div>

              {isCreatingPortfolio && (
                <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Portfolio Name</label>
                      <input
                        type="text"
                        value={newPortfolioName}
                        onChange={(e) => setNewPortfolioName(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                        placeholder="My Awesome Portfolio"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Template</label>
                      <select
                        value={selectedTemplate}
                        onChange={(e) => setSelectedTemplate(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      >
                        <option value="">Choose a template</option>
                        {templates.map((template) => (
                          <option key={template.id} value={template.id}>
                            {template.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <button
                      onClick={handleCreatePortfolio}
                      disabled={!newPortfolioName.trim()}
                      className="px-4 py-2 bg-green-500/20 border border-green-500/30 text-green-400 rounded-lg hover:bg-green-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Create
                    </button>
                    <button
                      onClick={() => {
                        setIsCreatingPortfolio(false)
                        setNewPortfolioName('')
                        setSelectedTemplate('')
                      }}
                      className="px-4 py-2 bg-gray-500/20 border border-gray-500/30 text-gray-400 rounded-lg hover:bg-gray-500/30 transition-all duration-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {portfolios.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">No portfolios yet</h3>
                  <p className="text-gray-400 mb-4">Create your first portfolio to get started</p>
                  <button
                    onClick={() => setIsCreatingPortfolio(true)}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
                  >
                    Create Your First Portfolio
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {portfolios.map((portfolio) => (
                    <div key={portfolio.id} className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all duration-300">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-medium text-white">{portfolio.name}</h3>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleTogglePublish(portfolio.id, portfolio.is_published)}
                            className={`px-2 py-1 text-xs rounded ${
                              portfolio.is_published
                                ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                            } hover:opacity-80 transition-all duration-300`}
                          >
                            {portfolio.is_published ? 'Published' : 'Draft'}
                          </button>
                          {portfolio.is_default && (
                            <span className="px-2 py-1 text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded">
                              Default
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-400 mb-4">/{portfolio.slug}</p>
                      <div className="flex space-x-2">
                        <Link
                          href={`/dashboard/portfolio/${portfolio.id}/edit`}
                          className="flex-1 px-3 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm rounded hover:from-purple-600 hover:to-pink-600 transition-all duration-300 text-center"
                        >
                          Edit
                        </Link>
                        <Link
                          href={`/portfolio/${portfolio.slug}`}
                          target="_blank"
                          className="flex-1 px-3 py-2 bg-white/10 border border-white/20 text-white text-sm rounded hover:bg-white/20 transition-all duration-300 text-center"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleDeletePortfolio(portfolio.id)}
                          className="px-3 py-2 bg-red-500/20 border border-red-500/30 text-red-400 text-sm rounded hover:bg-red-500/30 transition-all duration-300"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 