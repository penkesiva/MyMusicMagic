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
    <div className="min-h-screen bg-gray-900 text-gray-200">
      {/* Header */}
      <header className="bg-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-400">Welcome, {profile?.username || user?.email}</span>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Sign Out
            </button>
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
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-lg text-gray-400">Loading your dashboard...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-1 space-y-8">
              {/* Subscription Status */}
              <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
                <h2 className="text-xl font-semibold text-white mb-4">Subscription Status</h2>
                {subscription ? (
                  <>
                    <p className="capitalize">
                      <span className="font-medium text-gray-400">Plan:</span> {subscription.plan_type}
                    </p>
                    <p className="capitalize">
                      <span className="font-medium text-gray-400">Status:</span> 
                      <span className={subscription.status === 'active' ? 'text-green-400' : 'text-yellow-400'}>
                        {` ${subscription.status}`}
                      </span>
                    </p>
                    <ul className="mt-4 space-y-2 text-gray-300">
                      {getPlanFeatures(subscription.plan_type).map((feature, i) => (
                        <li key={i} className="flex items-center">
                          <CheckIcon className="h-5 w-5 text-green-400 mr-2" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <p>No subscription details found.</p>
                )}
              </div>

              {/* User Profile */}
              <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-white">My Profile</h2>
                  <button
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                    className="flex items-center text-blue-400 hover:text-blue-300"
                  >
                    {isEditingProfile ? (
                      <>
                        <XMarkIcon className="h-4 w-4 mr-1" />
                        Cancel
                      </>
                    ) : (
                      <>
                        <PencilIcon className="h-4 w-4 mr-1" />
                        Edit
                      </>
                    )}
                  </button>
                </div>
                {isEditingProfile ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={editingProfile.full_name}
                        onChange={(e) => setEditingProfile({...editingProfile, full_name: e.target.value})}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Username</label>
                      <input
                        type="text"
                        value={editingProfile.username}
                        onChange={(e) => setEditingProfile({...editingProfile, username: e.target.value})}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Bio</label>
                      <textarea
                        value={editingProfile.bio}
                        onChange={(e) => setEditingProfile({...editingProfile, bio: e.target.value})}
                        rows={3}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-1">Website</label>
                      <input
                        type="text"
                        value={editingProfile.website_url}
                        onChange={(e) => setEditingProfile({...editingProfile, website_url: e.target.value})}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <button
                      onClick={handleSaveProfile}
                      className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Save Profile
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 text-gray-300">
                    <p><span className="font-semibold text-gray-400">Name:</span> {profile?.full_name || 'Not set'}</p>
                    <p><span className="font-semibold text-gray-400">Username:</span> {profile?.username || 'Not set'}</p>
                    <p><span className="font-semibold text-gray-400">Email:</span> {user?.email}</p>
                    <p><span className="font-semibold text-gray-400">Website:</span> {profile?.website_url || 'Not set'}</p>
                    <p><span className="font-semibold text-gray-400">Bio:</span> {profile?.bio || 'Not set'}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="lg:col-span-2">
              <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-white">My Portfolios</h2>
                  <button
                    onClick={() => setIsCreatingPortfolio(true)}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Create Portfolio
                  </button>
                </div>

                {/* Create Portfolio Modal */}
                {isCreatingPortfolio && (
                  <div className="mb-6 p-4 bg-gray-700 rounded-lg">
                    <h3 className="text-lg font-medium text-white mb-4">Create New Portfolio</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Portfolio Name</label>
                        <input
                          type="text"
                          value={newPortfolioName}
                          onChange={(e) => setNewPortfolioName(e.target.value)}
                          placeholder="My Awesome Portfolio"
                          className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Template (Optional)</label>
                        <select
                          value={selectedTemplate}
                          onChange={(e) => setSelectedTemplate(e.target.value)}
                          className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">No template (Custom portfolio)</option>
                          {templates.length === 0 ? (
                            <option value="" disabled>No templates available</option>
                          ) : (
                            templates.map((template) => (
                              <option key={template.id} value={template.id}>
                                {template.name} - {template.industry} ({template.style})
                              </option>
                            ))
                          )}
                        </select>
                        {templates.length === 0 && (
                          <p className="mt-1 text-sm text-gray-400">
                            Templates will be available soon. You can create a custom portfolio now.
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={handleCreatePortfolio}
                          disabled={!newPortfolioName.trim()}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Create
                        </button>
                        <button
                          onClick={() => {
                            setIsCreatingPortfolio(false);
                            setNewPortfolioName('');
                            setSelectedTemplate('');
                          }}
                          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Portfolio List */}
                {portfolios.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-400 mb-4">You haven't created any portfolios yet.</p>
                    <p className="text-gray-500">Click "Create Portfolio" to get started!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {portfolios.map((portfolio) => (
                      <div key={portfolio.id} className="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
                        <div>
                          <h3 className="text-white font-medium">{portfolio.name}</h3>
                          <p className="text-gray-400 text-sm">/{portfolio.slug}</p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            portfolio.is_published 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {portfolio.is_published ? 'Published' : 'Draft'}
                          </span>
                          <button
                            onClick={() => handleTogglePublish(portfolio.id, portfolio.is_published)}
                            className="flex items-center text-sm text-gray-300 hover:text-white"
                            title={portfolio.is_published ? 'Unpublish' : 'Publish'}
                          >
                            {portfolio.is_published ? <EyeSlashIcon className="h-5 w-5 text-yellow-400" /> : <EyeIcon className="h-5 w-5 text-green-400" />}
                          </button>
                          <a href={`/dashboard/portfolio/${portfolio.id}/edit`} className="flex items-center text-sm text-blue-400 hover:text-blue-300" title="Edit">
                            <PencilIcon className="h-5 w-5" />
                          </a>
                           <a href={`/portfolio/${portfolio.slug}`} target="_blank" className="flex items-center text-sm text-gray-300 hover:text-white" title="Preview">
                            <EyeIcon className="h-5 w-5" />
                          </a>
                          {!portfolio.is_default && (
                            <button
                              onClick={() => handleDeletePortfolio(portfolio.id)}
                              className="flex items-center text-red-400 hover:text-red-300"
                              title="Delete"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
} 