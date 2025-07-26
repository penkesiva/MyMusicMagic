// components/portfolio/PostMeForm.tsx
'use client';

import React from 'react';
import { Portfolio } from '@/types/portfolio';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import PostMeDisplay from './PostMeDisplay';

interface PostMeFormProps {
  portfolio: Portfolio;
  onFieldChange: (field: keyof Portfolio, value: any) => void;
  theme: any;
}

export default function PostMeForm({ portfolio, onFieldChange, theme }: PostMeFormProps) {
  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="post_me_subtitle" className={`text-sm font-medium ${theme.colors.text}`}>
          Subtitle
        </Label>
        <Input
          id="post_me_subtitle"
          type="text"
          value={portfolio.post_me_subtitle || ''}
          onChange={e => onFieldChange('post_me_subtitle', e.target.value)}
          placeholder="Share your musical thoughts"
          className={`mt-1 ${theme.colors.textBox} ${theme.colors.textBoxBorder} ${theme.colors.textBoxText} ${theme.colors.textBoxPlaceholder}`}
        />
        <p className="mt-1 text-xs text-gray-400">Short description under the title</p>
      </div>
      <div>
        <Label htmlFor="post_me_email_placeholder" className={`text-sm font-medium ${theme.colors.text}`}>
          Email Placeholder
        </Label>
        <Input
          id="post_me_email_placeholder"
          type="text"
          value={portfolio.post_me_email_placeholder || ''}
          onChange={e => onFieldChange('post_me_email_placeholder', e.target.value)}
          placeholder="your@email.com"
          className={`mt-1 ${theme.colors.textBox} ${theme.colors.textBoxBorder} ${theme.colors.textBoxText} ${theme.colors.textBoxPlaceholder}`}
        />
        <p className="mt-1 text-xs text-gray-400">Placeholder for the email input</p>
      </div>
      <div>
        <Label htmlFor="post_me_message_placeholder" className={`text-sm font-medium ${theme.colors.text}`}>
          Message Placeholder
        </Label>
        <Input
          id="post_me_message_placeholder"
          type="text"
          value={portfolio.post_me_message_placeholder || ''}
          onChange={e => onFieldChange('post_me_message_placeholder', e.target.value)}
          placeholder="Your message here..."
          className={`mt-1 ${theme.colors.textBox} ${theme.colors.textBoxBorder} ${theme.colors.textBoxText} ${theme.colors.textBoxPlaceholder}`}
        />
        <p className="mt-1 text-xs text-gray-400">Placeholder for the message textarea</p>
      </div>
      <div>
        <Label htmlFor="post_me_button_text" className={`text-sm font-medium ${theme.colors.text}`}>
          Button Text
        </Label>
        <Input
          id="post_me_button_text"
          type="text"
          value={portfolio.post_me_button_text || ''}
          onChange={e => onFieldChange('post_me_button_text', e.target.value)}
          placeholder="Send Message"
          className={`mt-1 ${theme.colors.textBox} ${theme.colors.textBoxBorder} ${theme.colors.textBoxText} ${theme.colors.textBoxPlaceholder}`}
        />
        <p className="mt-1 text-xs text-gray-400">Text displayed on the submit button</p>
      </div>
      <div>
        <Label htmlFor="post_me_success_message" className={`text-sm font-medium ${theme.colors.text}`}>
          Success Message
        </Label>
        <Input
          id="post_me_success_message"
          type="text"
          value={portfolio.post_me_success_message || ''}
          onChange={e => onFieldChange('post_me_success_message', e.target.value)}
          placeholder="Message sent! Thank you for reaching out."
          className={`mt-1 ${theme.colors.textBox} ${theme.colors.textBoxBorder} ${theme.colors.textBoxText} ${theme.colors.textBoxPlaceholder}`}
        />
        <p className="mt-1 text-xs text-gray-400">Message shown after successful submission</p>
      </div>
      <div>
        <Label htmlFor="post_me_error_message" className={`text-sm font-medium ${theme.colors.text}`}>
          Error Message
        </Label>
        <Input
          id="post_me_error_message"
          type="text"
          value={portfolio.post_me_error_message || ''}
          onChange={e => onFieldChange('post_me_error_message', e.target.value)}
          placeholder="Something went wrong. Please try again."
          className={`mt-1 ${theme.colors.textBox} ${theme.colors.textBoxBorder} ${theme.colors.textBoxText} ${theme.colors.textBoxPlaceholder}`}
        />
        <p className="mt-1 text-xs text-gray-400">Message shown if submission fails</p>
      </div>
      <div className={`p-4 ${theme.colors.background} rounded-lg border border-gray-700`}>
        <h4 className={`text-sm font-medium ${theme.colors.text} mb-2`}>Live Preview</h4>
        <PostMeDisplay portfolio={portfolio} theme={theme} previewOnly />
      </div>
    </div>
  );
} 