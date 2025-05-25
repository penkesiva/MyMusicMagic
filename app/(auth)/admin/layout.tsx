'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const checkAuth = async () => {
      // Don't check auth for login page
      if (pathname === '/admin/login') {
        setIsLoading(false)
        return
      }

      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/admin/login')
        return
      }

      // Check if user has admin role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role !== 'admin') {
        router.push('/')
        return
      }

      setIsLoading(false)
    }

    checkAuth()
  }, [pathname, router, supabase])

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-100">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  // Don't show admin layout for login page
  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-dark-100">
      <nav className="bg-dark-200 border-b border-dark-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-white">
                  Admin Dashboard
                </span>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={async () => {
                  await supabase.auth.signOut()
                  router.push('/admin/login')
                }}
                className="text-sm text-gray-300 hover:text-white transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
} 