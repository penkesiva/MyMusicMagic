'use client';

import React, { useState } from 'react';
import { Portfolio } from '@/types/portfolio';

interface PostMeDisplayProps {
  portfolio: Portfolio;
  theme: any;
  previewOnly?: boolean;
}

export default function PostMeDisplay({ portfolio, theme, previewOnly }: PostMeDisplayProps) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const maxWords = 100;
  const wordCount = message.trim() ? message.trim().split(/\s+/).length : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (previewOnly) return;
    if (!email.trim() || !message.trim() || wordCount > maxWords) return;
    setIsSubmitting(true);
    setSubmitStatus('idle');
    try {
      const res = await fetch('/api/post-me', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, message }),
      });
      if (res.ok) {
        setSubmitStatus('success');
        setEmail('');
        setMessage('');
      } else {
        setSubmitStatus('error');
      }
    } catch {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get section title from sections config
  const getSectionTitle = () => {
    if (portfolio.sections_config?.post_me?.title) {
      return portfolio.sections_config.post_me.title;
    }
    return 'Post Me';
  };

  return (
    <section className="py-16 px-4 flex flex-col items-center justify-center min-h-[60vh]">
      <div className="max-w-md w-full bg-black/60 rounded-xl shadow-lg p-8 border border-gray-700">
        <h2 className="text-4xl font-bold text-center mb-2" style={{ color: theme.colors?.heading || '#fff' }}>
          {getSectionTitle()}
        </h2>
        <p className="text-center text-lg text-gray-300 mb-8">
          {portfolio.post_me_subtitle || 'Share your musical thoughts'}
        </p>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="postme-email" className="block text-sm font-medium text-white mb-1">
              Email *
            </label>
            <input
              id="postme-email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              placeholder={portfolio.post_me_email_placeholder || 'your@email.com'}
              className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={isSubmitting || previewOnly}
            />
          </div>
          <div>
            <label htmlFor="postme-message" className="block text-sm font-medium text-white mb-1">
              Message (max 100 words) *
            </label>
            <textarea
              id="postme-message"
              value={message}
              onChange={e => setMessage(e.target.value)}
              required
              maxLength={1000}
              placeholder={portfolio.post_me_message_placeholder || 'Your message here...'}
              className="w-full px-4 py-3 rounded-lg border border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[100px]"
              disabled={isSubmitting || previewOnly}
            />
            <div className="text-xs text-gray-400 mt-1 text-right">
              {wordCount}/{maxWords} words
            </div>
          </div>
          <button
            type="submit"
            disabled={isSubmitting || !email.trim() || !message.trim() || wordCount > maxWords || previewOnly}
            className="w-full py-3 rounded-lg font-semibold text-lg bg-purple-500 hover:bg-purple-600 transition disabled:opacity-50 disabled:cursor-not-allowed text-white"
          >
            {isSubmitting ? 'Sending...' : (portfolio.post_me_button_text || 'Send Message')}
          </button>
          {submitStatus === 'success' && (
            <div className="mt-4 p-3 bg-green-600/20 border border-green-500/30 rounded-lg text-green-400 text-center">
              {portfolio.post_me_success_message || 'Message sent! Thank you for reaching out.'}
            </div>
          )}
          {submitStatus === 'error' && (
            <div className="mt-4 p-3 bg-red-600/20 border border-red-500/30 rounded-lg text-red-400 text-center">
              {portfolio.post_me_error_message || 'Something went wrong. Please try again.'}
            </div>
          )}
        </form>
      </div>
    </section>
  );
} 