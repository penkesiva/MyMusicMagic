'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'

type UserProfile = Database['public']['Tables']['user_profiles']['Row']
type UserSubscription = Database['public']['Tables']['user_subscriptions']['Row']
type UserPortfolioSettings = Database['public']['Tables']['user_portfolio_settings']['Row']

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [portfolioSettings, setPortfolioSettings] = useState<UserPortfolioSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/signin')
        return
      }

      setUser(user)

      // Fetch user profile
      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileData) {
        setProfile(profileData)
      }

      // Fetch user subscription
      const { data: subscriptionData } = await supabase
        .from('user_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (subscriptionData) {
        setSubscription(subscriptionData)
      }

      // Fetch portfolio settings
      const { data: settingsData } = await supabase
        .from('user_portfolio_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (settingsData) {
        setPortfolioSettings(settingsData)
      }

      setIsLoading(false)
    }

    checkUser()
  }, [supabase, router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-100">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark-100">
      {/* Header */}
      <header className="bg-dark-200 border-b border-dark-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-white">
                HeroPortfolio Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">
                Welcome, {profile?.full_name || user?.email}
              </span>
              <button
                onClick={handleSignOut}
                className="text-sm text-gray-300 hover:text-white transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <div className="bg-dark-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Profile</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-400">Name</label>
                  <p className="text-white">{profile?.full_name || 'Not set'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Email</label>
                  <p className="text-white">{profile?.email}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Username</label>
                  <p className="text-white">{profile?.username || 'Not set'}</p>
                </div>
              </div>
            </div>

            {/* Subscription Card */}
            <div className="bg-dark-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Subscription</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-400">Plan</label>
                  <p className="text-white capitalize">{subscription?.plan_type || 'Free'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Status</label>
                  <p className="text-white capitalize">{subscription?.status || 'Active'}</p>
                </div>
              </div>
            </div>

            {/* Portfolio Settings Card */}
            <div className="bg-dark-200 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Portfolio</h2>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-400">Title</label>
                  <p className="text-white">{portfolioSettings?.portfolio_title || 'My Portfolio'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Status</label>
                  <p className="text-white">
                    {portfolioSettings?.is_published ? 'Published' : 'Draft'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Coming Soon Section */}
          <div className="mt-8 bg-dark-200 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Coming Soon</h2>
            <p className="text-gray-400">
              Portfolio management features are coming soon! You'll be able to:
            </p>
            <ul className="mt-4 space-y-2 text-gray-400">
              <li>• Upload and manage your tracks</li>
              <li>• Customize your portfolio design</li>
              <li>• Add gallery images and videos</li>
              <li>• Manage your artist information</li>
              <li>• View analytics and visitor stats</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  )
} 