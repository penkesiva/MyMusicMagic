'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ContactPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    setIsSubmitting(true)

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

      // Store in Supabase
      const { error: dbError } = await supabase
        .from('messages')
        .insert([
          {
            email,
            message,
            created_at: new Date().toISOString()
          }
        ])

      if (dbError) throw dbError

      setSuccess(true)
      setEmail('')
      setMessage('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-dark-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-md mx-auto">
          <h1 className="text-4xl font-bold text-white mb-8">Post Me</h1>
          
          <div className="bg-dark-200 rounded-lg p-6 shadow-xl">
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
                  className="w-full px-4 py-2 bg-dark-300 border border-dark-400 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                  className="w-full px-4 py-2 bg-dark-300 border border-dark-400 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
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
                className="w-full px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
} 