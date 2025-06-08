'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { HomeButton } from '@/app/components/HomeButton'

export default function ContactPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const supabase = createClientComponentClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)
    setSuccess(false)

    try {
      // Validate email
      if (!email || !email.includes('@')) {
        throw new Error('Please enter a valid email address')
      }

      // Validate message length
      if (!message.trim()) {
        throw new Error('Please enter a message')
      }
      if (message.length > 100) {
        throw new Error('Message must be 100 words or less')
      }

      console.log('Starting form submission...');
      console.log('Attempting to insert message:', { email, message });

      // Store in Supabase using the function
      const { data, error: dbError } = await supabase
        .rpc('insert_message', {
          p_email: email,
          p_message: message
        });

      console.log('RPC Response:', { data, error: dbError });

      if (dbError) {
        console.error('Database error:', {
          code: dbError.code,
          message: dbError.message,
          details: dbError.details,
          hint: dbError.hint
        });
        throw dbError;
      }

      console.log('Message inserted successfully:', data);
      setSuccess(true)
      setEmail('')
      setMessage('')
    } catch (err) {
      console.error('Full error object:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen relative">
      <HomeButton />
      
      {/* Hero background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url("/hero-bg.jpg")',
          filter: 'brightness(0.3)'
        }}
      />

      {/* Content */}
      <div className="relative z-10 min-h-screen">
        <div className="container mx-auto px-4 pt-20 pb-20">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-white mb-4">Post Me</h1>
              <p className="text-gray-300">Share your musical thoughts</p>
            </div>
            
            <div className="bg-dark-200/80 backdrop-blur-sm rounded-lg p-6 border border-white/10">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 bg-dark-300/50 border border-white/10 rounded-lg text-white placeholder-gray-400 
                      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent backdrop-blur-sm"
                    placeholder="your@email.com"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">
                    Message (max 100 words) *
                  </label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-4 py-2 bg-dark-300/50 border border-white/10 rounded-lg text-white placeholder-gray-400 
                      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent backdrop-blur-sm resize-none"
                    rows={4}
                    placeholder="Your message here..."
                    required
                    maxLength={100}
                  />
                  <p className="mt-1 text-sm text-gray-400">
                    {message.length}/100 words
                  </p>
                </div>

                {error && (
                  <p className="text-red-400 text-sm">{error}</p>
                )}

                {success && (
                  <p className="text-green-400 text-sm">
                    Message sent successfully! I'll get back to you soon.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 
                    transition-colors disabled:opacity-50 disabled:cursor-not-allowed 
                    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-dark-200"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 