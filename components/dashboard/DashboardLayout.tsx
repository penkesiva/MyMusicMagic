'use client'

import { useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Sparkles, Home, BarChart3, Settings, User, HelpCircle, LogOut, Shield } from 'lucide-react'

type DashboardLayoutProps = {
  children: ReactNode
  currentPage?: string
}

export default function DashboardLayout({ children, currentPage }: DashboardLayoutProps) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setIsAdmin(false)
      const { data: adminProfile, error: adminError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!adminError && adminProfile && adminProfile.role === 'admin') {
        setIsAdmin(true)
      } else {
        setIsAdmin(false)
      }
    }
    checkAdmin()
  }, [supabase])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard'
    }
    return pathname?.startsWith(path)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#1a1a2e] text-slate-900 dark:text-slate-200 overflow-hidden h-screen flex">
      {/* Left Sidebar */}
      <aside className="w-64 h-full flex flex-col justify-between bg-white dark:bg-[#161625] border-r border-slate-200 dark:border-white/5 flex-shrink-0 transition-colors">
        <div className="flex flex-col gap-4 p-3">
          {/* Logo */}
          <div className="flex items-center gap-2 px-2">
            <div className="bg-center bg-no-repeat bg-cover rounded-full h-8 w-8 bg-[#3366ff]/20 flex items-center justify-center text-[#3366ff]">
              <Sparkles className="w-4 h-4 text-[#3366ff]" />
            </div>
            <h1 className="text-slate-900 dark:text-white text-base font-bold tracking-tight">Hero Portfolio</h1>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-1">
            <Link 
              href="/dashboard" 
              className={`flex items-center gap-2 px-2 py-2 rounded-lg transition-colors group ${
                isActive('/dashboard')
                  ? 'bg-[#3366ff]/20 text-[#3366ff] dark:bg-[#3366ff]/20 dark:text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 group-hover:text-slate-900 dark:group-hover:text-white'
              }`}
            >
              <Home className="w-4 h-4" />
              <p className="text-xs font-medium leading-normal">Home</p>
            </Link>
            <Link 
              href="/dashboard/analytics" 
              className={`flex items-center gap-2 px-2 py-2 rounded-lg transition-colors group ${
                isActive('/dashboard/analytics')
                  ? 'bg-[#3366ff]/20 text-[#3366ff] dark:bg-[#3366ff]/20 dark:text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 group-hover:text-slate-900 dark:group-hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <p className="text-xs font-medium leading-normal">Analytics</p>
            </Link>
            <Link 
              href="/dashboard/settings" 
              className={`flex items-center gap-2 px-2 py-2 rounded-lg transition-colors group ${
                isActive('/dashboard/settings')
                  ? 'bg-[#3366ff]/20 text-[#3366ff] dark:bg-[#3366ff]/20 dark:text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 group-hover:text-slate-900 dark:group-hover:text-white'
              }`}
            >
              <Settings className="w-4 h-4" />
              <p className="text-xs font-medium leading-normal">Settings</p>
            </Link>
            <Link 
              href="/dashboard/profile" 
              className={`flex items-center gap-2 px-2 py-2 rounded-lg transition-colors group ${
                isActive('/dashboard/profile')
                  ? 'bg-[#3366ff]/20 text-[#3366ff] dark:bg-[#3366ff]/20 dark:text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 group-hover:text-slate-900 dark:group-hover:text-white'
              }`}
            >
              <User className="w-4 h-4" />
              <p className="text-xs font-medium leading-normal">Profile</p>
            </Link>
            {isAdmin && (
              <Link 
                href="/dashboard/admin" 
                className={`flex items-center gap-2 px-2 py-2 rounded-lg transition-colors group ${
                  isActive('/dashboard/admin')
                    ? 'bg-[#3366ff]/20 text-[#3366ff] dark:bg-[#3366ff]/20 dark:text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 group-hover:text-slate-900 dark:group-hover:text-white'
                }`}
              >
                <Shield className="w-4 h-4" />
                <p className="text-xs font-medium leading-normal">Admin</p>
              </Link>
            )}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col gap-3 p-3 border-t border-slate-200 dark:border-white/5">
          <button 
            onClick={() => router.push('/dashboard/billing')}
            className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-8 px-3 bg-[#3366ff] text-white text-xs font-bold shadow-lg shadow-[#3366ff]/25 hover:bg-[#4a7dfa] transition-all"
          >
            <span className="truncate">Upgrade Plan</span>
          </button>
          <div className="flex flex-col gap-0.5">
            <Link 
              href="/dashboard/help" 
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
              <p className="text-xs font-medium leading-normal">Help & Support</p>
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <p className="text-xs font-medium leading-normal">Log Out</p>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 h-full overflow-y-auto relative">
        {children}
      </main>
    </div>
  )
}

