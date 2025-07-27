'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowLeft, Star, Zap, Eye, EyeOff, Check } from 'lucide-react'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const supabase = createClient()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/signin`,
        },
      })

      if (error) throw error

      if (data.user) {
        setSuccess(true)
        // Redirect to signin page after successful signup
        setTimeout(() => {
          router.push('/auth/signin')
        }, 2000)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) throw error
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setIsLoading(false)
    }
  }

  const passwordRequirements = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Contains a number', met: /\d/.test(password) },
    { label: 'Contains a letter', met: /[a-zA-Z]/.test(password) },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/welcome" className="inline-flex items-center space-x-2 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Hero Portfolio</h1>
          </Link>
          
          <h2 className="text-3xl font-bold text-white mb-2">
            Create your account
          </h2>
          <p className="text-gray-300">
            Start building your professional portfolio today
          </p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 shadow-2xl">
          {success ? (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-8 h-8 text-green-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Account created successfully!
                </h3>
                <p className="text-gray-300">
                  Please check your email to verify your account, then sign in.
                </p>
              </div>
              <div className="pt-4">
                <p className="text-sm text-gray-400">
                  Redirecting to sign in page...
                </p>
              </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSignUp}>
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Email address
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <input
                      key={`password-${showPassword}`}
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors z-10 p-1 rounded-md hover:bg-white/10"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  
                  <div className="mt-3 space-y-2">
                    {passwordRequirements.map((req, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                          req.met ? 'bg-green-500' : 'bg-gray-600'
                        }`}>
                          {req.met && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className={`text-xs ${req.met ? 'text-green-400' : 'text-gray-400'}`}>
                          {req.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      key={`confirmPassword-${showConfirmPassword}`}
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full px-4 py-3 pr-12 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors z-10 p-1 rounded-md hover:bg-white/10"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3 px-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-75 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-purple-500/25 transform hover:scale-105"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating account...
                  </div>
                ) : (
                  'Create account'
                )}
              </button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-900 text-gray-400">Or continue with</span>
                </div>
              </div>

              {/* Google Sign Up Button */}
              <button
                type="button"
                onClick={handleGoogleSignUp}
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3 px-4 bg-white/5 border border-white/10 text-white rounded-lg font-semibold hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-75 disabled:cursor-not-allowed transition-all duration-300"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>

              <div className="text-center">
                <p className="text-sm text-gray-400">
                  Already have an account?{' '}
                  <Link
                    href="/auth/signin"
                    className="font-medium text-purple-400 hover:text-purple-300 transition-colors"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          )}
        </div>

        <div className="mt-8 text-center">
          <Link 
            href="/welcome" 
            className="inline-flex items-center text-sm font-medium text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>

        <div className="mt-8 text-center">
          <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
            <div className="flex items-center space-x-1">
              <Zap className="w-3 h-3" />
              <span>Lightning Fast</span>
            </div>
            <div className="flex items-center space-x-1">
              <Star className="w-3 h-3" />
              <span>Trusted by 10k+ creators</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 