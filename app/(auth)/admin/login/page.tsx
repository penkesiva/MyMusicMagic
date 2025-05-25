'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      if (isSignUp) {
        // Sign up
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        if (data.user) {
          // Create profile with default role
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([{ id: data.user.id, role: 'user' }])
          if (profileError) throw profileError
          alert('Account created! Please check your email for verification.')
        }
      } else {
        // Sign in
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        if (data.user) {
          router.push('/admin')
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-100">
      <div className="w-full max-w-md p-8 space-y-8 bg-dark-200 rounded-lg shadow-lg">
        <div>
          <h2 className="text-2xl font-bold text-white text-center">
            {isSignUp ? 'Create Admin Account' : 'Admin Login'}
          </h2>
          <p className="mt-2 text-sm text-gray-400 text-center">
            {isSignUp
              ? 'Create your account to access the admin dashboard'
              : 'Sign in to access the admin dashboard'}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500 rounded-lg">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-dark-300 border border-dark-400 rounded-lg text-white"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-dark-300 border border-dark-400 rounded-lg text-white"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
          >
            {isLoading
              ? 'Please wait...'
              : isSignUp
              ? 'Create Account'
              : 'Sign In'}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-gray-400 hover:text-white"
            >
              {isSignUp
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 