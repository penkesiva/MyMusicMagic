'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Avatar } from '@/components/ui/avatar';
import { Database } from '@/types/database';
import { ArrowLeft, CreditCard, Calendar, Download, Crown, Shield, Zap, Check, X, Star, Users, Globe, BarChart3 } from 'lucide-react';

type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
type UserSubscription = Database['public']['Tables']['user_subscriptions']['Row'];

export default function BillingPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/auth/signin');
          return;
        }
        setUser(user);

        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileData) {
          setProfile(profileData);
        }

        // Fetch user subscription
        const { data: subscriptionData, error: subscriptionError } = await supabase
          .from('user_subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (subscriptionData) {
          setSubscription(subscriptionData);
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
          });
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [supabase, router]);

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  const getPlanFeatures = (planType: string) => {
    switch (planType) {
      case 'free':
        return [
          '1 Portfolio',
          'Basic Templates',
          'Standard Support',
          'Community Access'
        ];
      case 'pro':
        return [
          'Unlimited Portfolios',
          'All Templates',
          'Custom Domain',
          'Analytics Dashboard',
          'Priority Support',
          'Advanced SEO'
        ];
      case 'enterprise':
        return [
          'Everything in Pro',
          'White Label',
          'API Access',
          'Dedicated Support',
          'Custom Branding',
          'Team Management'
        ];
      default:
        return ['1 Portfolio', 'Basic Templates', 'Standard Support'];
    }
  };

  const getPlanPrice = (planType: string) => {
    switch (planType) {
      case 'free':
        return { monthly: 0, yearly: 0 };
      case 'pro':
        return { monthly: 19, yearly: 190 };
      case 'enterprise':
        return { monthly: 99, yearly: 990 };
      default:
        return { monthly: 0, yearly: 0 };
    }
  };

  const handleUpgradePlan = (planType: string) => {
    // TODO: Implement Stripe integration
    setSuccess(`Upgrade to ${planType} plan coming soon!`);
    setTimeout(() => setSuccess(null), 3000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-gray-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-gray-200">
      {/* Header - Same as Dashboard */}
      <header className="bg-white/5 backdrop-blur-sm border-b border-white/10 shadow-lg relative z-20">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBackToDashboard}
              className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors group"
              aria-label="Back to Dashboard"
              title="Back to Dashboard"
            >
              <ArrowLeft className="h-5 w-5 group-hover:animate-pulse" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white">Billing & Plan</h1>
            </div>
          </div>
          <div className="flex items-center space-x-4 relative z-30">
            {/* Avatar Component */}
            <Avatar 
              userProfile={profile} 
              size="lg" 
              showMenu={true}
              menuPosition="portal"
              menuTargetId="billing-settings-card"
            />
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

      {/* Main Content */}
      <div className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div id="billing-settings-card" className="space-y-8">
          {/* Current Plan Card */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Crown className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-white">Current Plan</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/20 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                    <Crown className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white capitalize">{subscription?.plan_type || 'Free'} Plan</h3>
                    <p className="text-sm text-purple-300">Active Subscription</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Status</span>
                    <span className="text-sm text-green-400 font-medium capitalize">{subscription?.status || 'Active'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Next Billing</span>
                    <span className="text-sm text-white">
                      {subscription?.current_period_end 
                        ? new Date(subscription.current_period_end).toLocaleDateString()
                        : 'N/A'
                      }
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-400/20 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Usage</h3>
                    <p className="text-sm text-blue-300">Portfolio Count</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Portfolios</span>
                    <span className="text-sm text-white">1 / {subscription?.plan_type === 'free' ? '1' : '∞'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Storage</span>
                    <span className="text-sm text-white">2.5GB / 5GB</span>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-400/20 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Billing</h3>
                    <p className="text-sm text-green-300">Payment Method</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Method</span>
                    <span className="text-sm text-white">Not Set</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Next Charge</span>
                    <span className="text-sm text-white">Free Plan</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Plan Comparison Card */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 shadow-2xl">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                <Star className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-white">Choose Your Plan</h2>
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

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              onClick={handleBackToDashboard}
              className="px-6 py-3 bg-white/10 border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all duration-300"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 