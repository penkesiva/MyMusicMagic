'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import DashboardLayout from '@/components/dashboard/DashboardLayout'
import { BarChart3, TrendingUp, Eye, Users, Clock, ArrowUpRight } from 'lucide-react'

export default function AnalyticsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/auth/signin')
        return
      }
      setIsLoading(false)
    }
    checkUser()
  }, [supabase, router])

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
      <div className="layout-container flex flex-col max-w-[1400px] mx-auto px-4 py-6 md:px-6 md:py-6">
        {/* Header */}
        <header className="flex flex-col gap-1.5 mb-6">
          <h1 className="text-slate-900 dark:text-white text-2xl md:text-3xl font-bold leading-tight tracking-[-0.02em]">
            Analytics
          </h1>
          <p className="text-slate-400 dark:text-slate-500 text-base md:text-lg font-normal">
            Track your portfolio performance and insights
          </p>
        </header>

        {/* Coming Soon Card */}
        <div className="relative w-full rounded-xl overflow-hidden mb-8 p-1 bg-gradient-to-br from-[#3366ff] via-[#3366ff]/50 to-[#3366ff]/30 p-[1px]">
          <div className="relative w-full bg-white dark:bg-[#23233a] rounded-xl p-8 md:p-12 flex flex-col items-center justify-center gap-6 shadow-2xl">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-[#3366ff]/20 blur-[100px] rounded-full pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col items-center gap-4">
              <div className="w-20 h-20 bg-[#3366ff]/20 rounded-full flex items-center justify-center">
                <BarChart3 className="w-10 h-10 text-[#3366ff]" />
              </div>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Analytics Coming Soon</h2>
                <p className="text-slate-500 dark:text-slate-400 max-w-md">
                  We're building powerful analytics features to help you track your portfolio performance, 
                  visitor insights, and engagement metrics. Stay tuned!
                </p>
              </div>
              
              {/* Preview Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 w-full max-w-2xl">
                <div className="bg-slate-50 dark:bg-[#1a1a2e]/80 rounded-lg p-4 border border-slate-200 dark:border-white/10">
                  <Eye className="w-6 h-6 text-[#3366ff] mb-2" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Visitor Analytics</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Track page views, unique visitors, and traffic sources</p>
                </div>
                <div className="bg-slate-50 dark:bg-[#1a1a2e]/80 rounded-lg p-4 border border-slate-200 dark:border-white/10">
                  <TrendingUp className="w-6 h-6 text-[#3366ff] mb-2" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Performance Metrics</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Monitor engagement rates and conversion metrics</p>
                </div>
                <div className="bg-slate-50 dark:bg-[#1a1a2e]/80 rounded-lg p-4 border border-slate-200 dark:border-white/10">
                  <Clock className="w-6 h-6 text-[#3366ff] mb-2" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Time Insights</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">See when your visitors are most active</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

