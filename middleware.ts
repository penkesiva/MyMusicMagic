import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Check auth status
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Get user role if logged in
  let userRole = null
  if (session?.user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()
    userRole = profile?.role
  }

  // Handle admin routes
  if (req.nextUrl.pathname.startsWith('/admin')) {
    // Allow access to login page
    if (req.nextUrl.pathname === '/admin/login') {
      // If user is already logged in and is an admin, redirect to admin dashboard
      if (session && userRole === 'admin') {
        return NextResponse.redirect(new URL('/admin', req.url))
      }
      return res
    }

    // For all other admin routes, require admin role
    if (!session || userRole !== 'admin') {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
  }

  return res
}

export const config = {
  matcher: ['/admin/:path*'],
} 