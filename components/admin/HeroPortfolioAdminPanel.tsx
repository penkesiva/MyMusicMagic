'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'
import { 
  Users, 
  Briefcase, 
  Layout, 
  CreditCard, 
  ChevronDown,
  ChevronUp,
  Edit,
  Trash2,
  Eye,
  Search
} from 'lucide-react'
import { Button } from '@/components/ui/button'

type UserProfile = Database['public']['Tables']['user_profiles']['Row']
type UserPortfolio = Database['public']['Tables']['user_portfolios']['Row']
type PortfolioTemplate = Database['public']['Tables']['portfolio_templates']['Row']
type UserSubscription = Database['public']['Tables']['user_subscriptions']['Row']

export default function HeroPortfolioAdminPanel() {
  // Data states
  const [users, setUsers] = useState<UserProfile[]>([])
  const [portfolios, setPortfolios] = useState<UserPortfolio[]>([])
  const [templates, setTemplates] = useState<PortfolioTemplate[]>([])
  const [subscriptions, setSubscriptions] = useState<UserSubscription[]>([])
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPortfolios: 0,
    publishedPortfolios: 0,
    totalTemplates: 0,
    activeSubscriptions: 0
  })
  
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  
  // Collapsible sections
  const [sectionsOpen, setSectionsOpen] = useState({
    users: true,
    portfolios: true,
    templates: true,
    subscriptions: true
  })

  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true)
      const supabase = createClient()
      
      try {
        // Fetch all data in parallel
        const [usersData, portfoliosData, templatesData, subscriptionsData] = await Promise.all([
          supabase.from('user_profiles').select('*').order('created_at', { ascending: false }),
          supabase.from('user_portfolios').select('*').order('created_at', { ascending: false }),
          supabase.from('portfolio_templates').select('*').order('created_at', { ascending: false }),
          supabase.from('user_subscriptions').select('*').order('created_at', { ascending: false })
        ])

        if (usersData.data) setUsers(usersData.data)
        if (portfoliosData.data) setPortfolios(portfoliosData.data)
        if (templatesData.data) setTemplates(templatesData.data)
        if (subscriptionsData.data) setSubscriptions(subscriptionsData.data)

        // Calculate stats
        setStats({
          totalUsers: usersData.data?.length || 0,
          totalPortfolios: portfoliosData.data?.length || 0,
          publishedPortfolios: portfoliosData.data?.filter(p => p.is_published).length || 0,
          totalTemplates: templatesData.data?.length || 0,
          activeSubscriptions: subscriptionsData.data?.filter(s => s.status === 'active').length || 0
        })
      } catch (error) {
        console.error('Error fetching admin data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAllData()
  }, [])

  const toggleSection = (section: keyof typeof sectionsOpen) => {
    setSectionsOpen(prev => ({ ...prev, [section]: !prev[section] }))
  }

  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredPortfolios = portfolios.filter(portfolio =>
    portfolio.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    portfolio.slug?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Hero Portfolio Admin Panel</h2>
            <p className="text-gray-400">Manage users, portfolios, templates, and subscriptions</p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Users</p>
                <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
              </div>
              <Users className="w-8 h-8 text-purple-400" />
            </div>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Portfolios</p>
                <p className="text-2xl font-bold text-white">{stats.totalPortfolios}</p>
              </div>
              <Briefcase className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Published</p>
                <p className="text-2xl font-bold text-white">{stats.publishedPortfolios}</p>
              </div>
              <Eye className="w-8 h-8 text-green-400" />
            </div>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Templates</p>
                <p className="text-2xl font-bold text-white">{stats.totalTemplates}</p>
              </div>
              <Layout className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Subs</p>
                <p className="text-2xl font-bold text-white">{stats.activeSubscriptions}</p>
              </div>
              <CreditCard className="w-8 h-8 text-pink-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
        <div className="flex items-center gap-2">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search users, portfolios..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>
      </div>

      {/* Users Section */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
        <div 
          className="p-4 cursor-pointer flex items-center justify-between hover:bg-white/5 transition-colors"
          onClick={() => toggleSection('users')}
        >
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">Users ({filteredUsers.length})</h3>
          </div>
          {sectionsOpen.users ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </div>
        {sectionsOpen.users && (
          <div className="border-t border-white/10 p-4">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-400 text-sm">
                    <th className="pb-2">Email</th>
                    <th className="pb-2">Username</th>
                    <th className="pb-2">Full Name</th>
                    <th className="pb-2">Created</th>
                    <th className="pb-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-400">
                        No users found
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b border-white/5">
                        <td className="py-3 text-white text-sm">{user.email}</td>
                        <td className="py-3 text-gray-300 text-sm">{user.username || '-'}</td>
                        <td className="py-3 text-gray-300 text-sm">{user.full_name || '-'}</td>
                        <td className="py-3 text-gray-400 text-sm">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Portfolios Section */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
        <div 
          className="p-4 cursor-pointer flex items-center justify-between hover:bg-white/5 transition-colors"
          onClick={() => toggleSection('portfolios')}
        >
          <div className="flex items-center gap-3">
            <Briefcase className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Portfolios ({filteredPortfolios.length})</h3>
          </div>
          {sectionsOpen.portfolios ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </div>
        {sectionsOpen.portfolios && (
          <div className="border-t border-white/10 p-4">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-400 text-sm">
                    <th className="pb-2">Name</th>
                    <th className="pb-2">Slug</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2">Theme</th>
                    <th className="pb-2">Created</th>
                    <th className="pb-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPortfolios.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-400">
                        No portfolios found
                      </td>
                    </tr>
                  ) : (
                    filteredPortfolios.map((portfolio) => (
                      <tr key={portfolio.id} className="border-b border-white/5">
                        <td className="py-3 text-white text-sm">{portfolio.name}</td>
                        <td className="py-3 text-gray-300 text-sm">/{portfolio.slug}</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            portfolio.is_published 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-orange-500/20 text-orange-400'
                          }`}>
                            {portfolio.is_published ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td className="py-3 text-gray-300 text-sm">{portfolio.theme_name || '-'}</td>
                        <td className="py-3 text-gray-400 text-sm">
                          {new Date(portfolio.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Templates Section */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
        <div 
          className="p-4 cursor-pointer flex items-center justify-between hover:bg-white/5 transition-colors"
          onClick={() => toggleSection('templates')}
        >
          <div className="flex items-center gap-3">
            <Layout className="w-5 h-5 text-yellow-400" />
            <h3 className="text-lg font-semibold text-white">Templates ({templates.length})</h3>
          </div>
          {sectionsOpen.templates ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </div>
        {sectionsOpen.templates && (
          <div className="border-t border-white/10 p-4">
            {templates.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                No templates found
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templates.map((template) => (
                <div key={template.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-semibold">{template.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      template.is_active 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {template.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mb-4">{template.description || 'No description'}</p>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300">
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300">
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
                  ))}
                </div>
                <Button className="mt-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                  <Layout className="w-4 h-4 mr-2" />
                  Create New Template
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Subscriptions Section */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
        <div 
          className="p-4 cursor-pointer flex items-center justify-between hover:bg-white/5 transition-colors"
          onClick={() => toggleSection('subscriptions')}
        >
          <div className="flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-pink-400" />
            <h3 className="text-lg font-semibold text-white">Subscriptions ({subscriptions.length})</h3>
          </div>
          {sectionsOpen.subscriptions ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
        </div>
        {sectionsOpen.subscriptions && (
          <div className="border-t border-white/10 p-4">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-gray-400 text-sm">
                    <th className="pb-2">User</th>
                    <th className="pb-2">Plan</th>
                    <th className="pb-2">Status</th>
                    <th className="pb-2">Created</th>
                    <th className="pb-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subscriptions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-400">
                        No subscriptions found
                      </td>
                    </tr>
                  ) : (
                    subscriptions.map((subscription) => (
                      <tr key={subscription.id} className="border-b border-white/5">
                        <td className="py-3 text-white text-sm">{subscription.user_id}</td>
                        <td className="py-3">
                          <span className="px-2 py-1 rounded-full text-xs bg-purple-500/20 text-purple-400">
                            {subscription.plan_type}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            subscription.status === 'active'
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-gray-500/20 text-gray-400'
                          }`}>
                            {subscription.status}
                          </span>
                        </td>
                        <td className="py-3 text-gray-400 text-sm">
                          {new Date(subscription.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3">
                          <Button size="sm" variant="ghost" className="text-blue-400 hover:text-blue-300">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
