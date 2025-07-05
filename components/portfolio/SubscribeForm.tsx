'use client';

import React from 'react';
import { Portfolio } from '@/types/portfolio';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface SubscribeFormProps {
  portfolio: Portfolio;
  onFieldChange: (field: keyof Portfolio, value: any) => void;
}

export default function SubscribeForm({ portfolio, onFieldChange }: SubscribeFormProps) {
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="subscribe_description" className="text-sm font-medium text-white">
          Description
        </Label>
        <Textarea
          id="subscribe_description"
          value={portfolio.subscribe_description || ''}
          onChange={(e) => onFieldChange('subscribe_description', e.target.value)}
          placeholder="Leave your email to stay updated with my latest work and news."
          rows={3}
          className="mt-1 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
        />
        <p className="mt-1 text-xs text-gray-400">
          Brief description explaining what visitors will receive
        </p>
      </div>

      <div>
        <Label htmlFor="subscribe_button_text" className="text-sm font-medium text-white">
          Button Text
        </Label>
        <Input
          id="subscribe_button_text"
          type="text"
          value={portfolio.subscribe_button_text || ''}
          onChange={(e) => onFieldChange('subscribe_button_text', e.target.value)}
          placeholder="Subscribe"
          className="mt-1 bg-gray-800 border-gray-600 text-white placeholder-gray-400"
        />
        <p className="mt-1 text-xs text-gray-400">
          Text displayed on the submit button
        </p>
      </div>

      <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
        <h4 className="text-sm font-medium text-white mb-2">Preview</h4>
        <div className="text-center">
          <h3 className="text-lg font-semibold text-white mb-2">
            Subscribe
          </h3>
          <p className="text-sm text-gray-300 mb-4">
            {portfolio.subscribe_description || 'Leave your email to stay updated with my latest work and news.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-2 max-w-xs mx-auto">
            <input
              type="email"
              placeholder="Enter your email address"
              disabled
              className="flex-1 px-3 py-2 rounded border border-gray-600 bg-gray-700 text-white placeholder-gray-400 text-sm"
            />
            <button
              disabled
              className="px-4 py-2 rounded bg-blue-600 text-white text-sm font-medium"
            >
              {portfolio.subscribe_button_text || 'Subscribe'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 