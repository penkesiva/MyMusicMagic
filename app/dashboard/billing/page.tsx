'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { Avatar } from '@/components/ui/avatar'
import { Database } from '@/types/database'
import { CreditCard, Calendar, Download, Crown, Shield, Zap, Check, X, Star, Users, Globe, BarChart3 } from 'lucide-react'

type UserProfile = Database['public']['Tables']['user_profiles']['Row']
type UserSubscription = Database['public']['Tables']['user_subscriptions']['Row']

export default function BillingPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          router.push('/auth/signin')
          return
        }
        setUser(user)

        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileData) {
          setProfile(profileData)
        }

        // Fetch user subscription
        const { data: subscriptionData, error: subscriptionError } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (subscriptionData) {
          setSubscription(subscriptionData)
        } else {
          // Set default subscription if none exists
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
        }

        setIsLoading(false)
      } catch (error) {
        console.error('Error fetching user data:', error)
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [supabase, router])


  const getPlanFeatures = (planType: string) => {
    switch (planType) {
      case 'free':
        return [
          '1 Portfolio',
          'Basic Templates',
          'Standard Support',
          'Community Access'
        ]
      case 'pro':
        return [
          'Unlimited Portfolios',
          'All Templates',
          'Custom Domain',
          'Analytics Dashboard',
          'Priority Support',
          'Advanced SEO'
        ]
      case 'enterprise':
        return [
          'Everything in Pro',
          'White Label',
          'API Access',
          'Dedicated Support',
          'Custom Branding',
          'Team Management'
        ]
      default:
        return ['1 Portfolio', 'Basic Templates', 'Standard Support']
    }
  }

  const getPlanPrice = (planType: string) => {
    switch (planType) {
      case 'free':
        return { monthly: 0, yearly: 0 }
      case 'pro':
        return { monthly: 19, yearly: 190 }
      case 'enterprise':
        return { monthly: 99, yearly: 990 }
      default:
        return { monthly: 0, yearly: 0 }
    }
  }

  const handleUpgradePlan = (planType: string) => {
    // TODO: Implement Stripe integration
    setSuccess(`Upgrade to ${planType} plan coming soon!`)
    setTimeout(() => setSuccess(null), 3000)
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3366ff]"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
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

      <div className="layout-container flex flex-col max-w-[1400px] mx-auto px-4 py-6 md:px-6 md:py-6">
        {/* Header */}
        <header className="flex flex-col gap-1.5 mb-6">
          <h1 className="text-slate-900 dark:text-white text-2xl md:text-3xl font-bold leading-tight tracking-[-0.02em]">
            Billing & Plan
          </h1>
          <p className="text-slate-400 dark:text-slate-500 text-base md:text-lg font-normal">
            Manage your subscription and billing information
          </p>
        </header>

        <div className="max-w-6xl">
        <div id="billing-settings-card" className="space-y-6">
          {/* Current Plan Card */}
          <div className="bg-white dark:bg-[#23233a] rounded-xl p-6 border border-slate-200 dark:border-white/10 shadow-lg">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-[#3366ff]/20 rounded-lg flex items-center justify-center">
                <Crown className="w-4 h-4 text-[#3366ff]" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Current Plan</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-50 dark:bg-[#1a1a2e]/80 border border-slate-200 dark:border-white/10 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-[#3366ff]/20 rounded-lg flex items-center justify-center">
                    <Crown className="w-5 h-5 text-[#3366ff]" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white capitalize">{subscription?.plan_type || 'Free'} Plan</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Active Subscription</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Status</span>
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium capitalize">{subscription?.status || 'Active'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Next Billing</span>
                    <span className="text-xs text-slate-900 dark:text-white">
                      {subscription?.current_period_end 
                        ? new Date(subscription.current_period_end).toLocaleDateString()
                        : 'N/A'
                      }
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-[#1a1a2e]/80 border border-slate-200 dark:border-white/10 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Usage</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Portfolio Count</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Portfolios</span>
                    <span className="text-xs text-slate-900 dark:text-white">1 / {subscription?.plan_type === 'free' ? '1' : '∞'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Storage</span>
                    <span className="text-xs text-slate-900 dark:text-white">2.5GB / 5GB</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-[#1a1a2e]/80 border border-slate-200 dark:border-white/10 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">Billing</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Payment Method</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Method</span>
                    <span className="text-xs text-slate-900 dark:text-white">Not Set</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Next Charge</span>
                    <span className="text-xs text-slate-900 dark:text-white">Free Plan</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Plan Comparison Card */}
          <div className="bg-white dark:bg-[#23233a] rounded-xl p-6 border border-slate-200 dark:border-white/10 shadow-lg">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <Star className="w-4 h-4 text-yellow-500" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Choose Your Plan</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Free Plan */}
              <div className={`relative bg-gradient-to-br from-gray-500/10 to-gray-600/10 border rounded-xl p-6 ${subscription?.plan_type === 'free' ? 'border-purple-400/50' : 'border-gray-400/20'}`}>
                {subscription?.plan_type === 'free' && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-medium">Current Plan</span>
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-white mb-2">Free</h3>
                  <div className="text-3xl font-bold text-white mb-1">$0</div>
                  <p className="text-sm text-gray-400">Forever</p>
                </div>
                <ul className="space-y-3 mb-6">
                  {getPlanFeatures('free').map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-white">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleUpgradePlan('free')}
                  disabled={subscription?.plan_type === 'free'}
                  className="w-full py-3 bg-gray-600/20 border border-gray-400/30 text-gray-300 rounded-xl hover:bg-gray-600/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {subscription?.plan_type === 'free' ? 'Current Plan' : 'Downgrade'}
                </button>
              </div>

              {/* Pro Plan */}
              <div className={`relative bg-gradient-to-br from-purple-500/10 to-pink-500/10 border rounded-xl p-6 ${subscription?.plan_type === 'pro' ? 'border-purple-400/50' : 'border-purple-400/20'}`}>
                {subscription?.plan_type === 'pro' && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-medium">Current Plan</span>
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-white mb-2">Pro</h3>
                  <div className="text-3xl font-bold text-white mb-1">${getPlanPrice('pro').monthly}</div>
                  <p className="text-sm text-gray-400">per month</p>
                </div>
                <ul className="space-y-3 mb-6">
                  {getPlanFeatures('pro').map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-white">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleUpgradePlan('pro')}
                  disabled={subscription?.plan_type === 'pro'}
                  className="w-full py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 text-purple-200 rounded-xl hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {subscription?.plan_type === 'pro' ? 'Current Plan' : 'Upgrade to Pro'}
                </button>
              </div>

              {/* Enterprise Plan */}
              <div className={`relative bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border rounded-xl p-6 ${subscription?.plan_type === 'enterprise' ? 'border-blue-400/50' : 'border-blue-400/20'}`}>
                {subscription?.plan_type === 'enterprise' && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">Current Plan</span>
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-white mb-2">Enterprise</h3>
                  <div className="text-3xl font-bold text-white mb-1">${getPlanPrice('enterprise').monthly}</div>
                  <p className="text-sm text-gray-400">per month</p>
                </div>
                <ul className="space-y-3 mb-6">
                  {getPlanFeatures('enterprise').map((feature, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-white">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleUpgradePlan('enterprise')}
                  disabled={subscription?.plan_type === 'enterprise'}
                  className="w-full py-3 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-400/30 text-blue-200 rounded-xl hover:from-blue-500/30 hover:to-cyan-500/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {subscription?.plan_type === 'enterprise' ? 'Current Plan' : 'Upgrade to Enterprise'}
                </button>
              </div>
            </div>
          </div>

          {/* Billing History Card */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-white">Billing History</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                    <Download className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">No billing history</h3>
                    <p className="text-xs text-gray-400">You're on the free plan</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-white">$0.00</p>
                  <p className="text-xs text-gray-400">Free Plan</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Methods Card */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-white">Payment Methods</h2>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-gray-600 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">No payment methods</h3>
                    <p className="text-xs text-gray-400">Add a payment method to upgrade</p>
                  </div>
                </div>
                <button className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 text-purple-200 rounded-xl hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-300 text-sm font-medium">
                  Add Payment Method
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
} 