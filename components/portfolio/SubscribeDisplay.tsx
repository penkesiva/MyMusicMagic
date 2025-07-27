'use client';

import React, { useState } from 'react';
import { Portfolio } from '@/types/portfolio';

interface SubscribeDisplayProps {
  portfolio: Portfolio;
  theme: any;
}

export default function SubscribeDisplay({ portfolio, theme }: SubscribeDisplayProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // TODO: Implement email submission logic
      // For now, just simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSubmitStatus('success');
      setEmail('');
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSectionTitle = () => {
    if (portfolio.sections_config?.subscribe?.title) {
      return portfolio.sections_config.subscribe.title;
    }
    return 'Subscribe';
  };

  const getDescription = () => {
    return portfolio.subscribe_description || 'Leave your email to stay updated with my latest work and news.';
  };

  const getButtonText = () => {
    return portfolio.subscribe_button_text || 'Subscribe';
  };

  return (
    <section 
      className="py-16 px-4"
      style={{
        backgroundColor: theme.colors?.background || '#1a1a1a',
        color: theme.colors?.text || '#ffffff'
      }}
    >
      <div className="max-w-4xl mx-auto text-center">
        <h2 
          className={`text-3xl md:text-4xl font-bold mb-6 ${theme.fontClasses?.heading || ''}`}
          style={{ color: theme.colors?.primary || '#ffffff' }}
        >
          {getSectionTitle()}
        </h2>
        
        <p className={`text-lg mb-8 opacity-90 max-w-2xl mx-auto ${theme.fontClasses?.body || ''}`}>
          {getDescription()}
        </p>

        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              className={`flex-1 px-4 py-3 rounded-lg border border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${theme.fontClasses?.body || ''}`}
              disabled={isSubmitting}
            />
            <button
              type="submit"
              disabled={isSubmitting || !email.trim()}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 ${theme.fontClasses?.body || ''}`}
              style={{
                backgroundColor: theme.colors?.accent || '#3b82f6',
                color: theme.colors?.accentText || '#ffffff'
              }}
            >
              {isSubmitting ? 'Submitting...' : getButtonText()}
            </button>
          </div>
        </form>

        {submitStatus === 'success' && (
          <div className="mt-4 p-3 bg-green-600/20 border border-green-500/30 rounded-lg text-green-400">
            Thanks! You've been subscribed successfully.
          </div>
        )}

        {submitStatus === 'error' && (
          <div className="mt-4 p-3 bg-red-600/20 border border-red-500/30 rounded-lg text-red-400">
            Something went wrong. Please try again.
          </div>
        )}
      </div>
    </section>
  );
} 