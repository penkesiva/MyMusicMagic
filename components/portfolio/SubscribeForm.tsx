'use client';

import React from 'react';
import { Portfolio } from '@/types/portfolio';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface SubscribeFormProps {
  portfolio: Portfolio;
  onFieldChange: (field: keyof Portfolio, value: any) => void;
  theme?: any;
}

export default function SubscribeForm({ portfolio, onFieldChange, theme }: SubscribeFormProps) {
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="subscribe_description" className={`text-sm font-medium ${theme?.colors?.text || 'text-white'}`}>
          Description
        </Label>
        <Textarea
          id="subscribe_description"
          value={portfolio.subscribe_description || ''}
          onChange={(e) => onFieldChange('subscribe_description', e.target.value)}
          placeholder="Leave your email to stay updated with my latest work and news."
          rows={3}
          className={`mt-1 ${theme?.colors?.textBox || 'bg-gray-800'} ${theme?.colors?.textBoxBorder || 'border-gray-600'} ${theme?.colors?.textBoxText || 'text-white'} ${theme?.colors?.textBoxPlaceholder || 'placeholder-gray-400'}`}
        />
        <p className={`mt-1 text-xs ${theme?.colors?.text || 'text-gray-400'} opacity-70`}>
          Brief description explaining what visitors will receive
        </p>
      </div>

      <div>
        <Label htmlFor="subscribe_button_text" className={`text-sm font-medium ${theme?.colors?.text || 'text-white'}`}>
          Button Text
        </Label>
        <Input
          id="subscribe_button_text"
          type="text"
          value={portfolio.subscribe_button_text || ''}
          onChange={(e) => onFieldChange('subscribe_button_text', e.target.value)}
          placeholder="Subscribe"
          className={`mt-1 ${theme?.colors?.textBox || 'bg-gray-800'} ${theme?.colors?.textBoxBorder || 'border-gray-600'} ${theme?.colors?.textBoxText || 'text-white'} ${theme?.colors?.textBoxPlaceholder || 'placeholder-gray-400'}`}
        />
        <p className={`mt-1 text-xs ${theme?.colors?.text || 'text-gray-400'} opacity-70`}>
          Text displayed on the submit button
        </p>
      </div>

      <div className={`p-4 ${theme?.colors?.card || 'bg-gray-800/50'} rounded-lg border ${theme?.colors?.textBoxBorder || 'border-gray-700'}`}>
        <h4 className={`text-sm font-medium ${theme?.colors?.heading || 'text-white'} mb-2`}>Preview</h4>
        <div className="text-center">
          <h3 className={`text-lg font-semibold ${theme?.colors?.heading || 'text-white'} mb-2`}>
            Subscribe
          </h3>
          <p className={`text-sm ${theme?.colors?.cardText || 'text-gray-300'} mb-4`}>
            {portfolio.subscribe_description || 'Leave your email to stay updated with my latest work and news.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-2 max-w-xs mx-auto">
            <input
              type="email"
              placeholder="Enter your email address"
              disabled
              className={`flex-1 px-3 py-2 rounded border ${theme?.colors?.textBoxBorder || 'border-gray-600'} ${theme?.colors?.textBox || 'bg-gray-700'} ${theme?.colors?.textBoxText || 'text-white'} ${theme?.colors?.textBoxPlaceholder || 'placeholder-gray-400'} text-sm`}
            />
            <button
              disabled
              className={`px-4 py-2 rounded ${theme?.colors?.button || 'bg-blue-600'} ${theme?.colors?.buttonText || 'text-white'} text-sm font-medium`}
            >
              {portfolio.subscribe_button_text || 'Subscribe'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 