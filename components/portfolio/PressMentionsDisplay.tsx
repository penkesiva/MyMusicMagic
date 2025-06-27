"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { Database } from '@/types/database';
import { ExternalLink, Star, Calendar } from 'lucide-react';
import Image from 'next/image';

type PressMention = Database['public']['Tables']['press_mentions']['Row'];

interface PressMentionsDisplayProps {
  portfolioId: string;
  theme: any;
  layout?: 'featured' | 'list' | 'grid';
  sectionTitle?: string;
}

export default function PressMentionsDisplay({ 
  portfolioId, 
  theme, 
  layout = 'featured',
  sectionTitle = "Press & Media"
}: PressMentionsDisplayProps) {
  const [pressMentions, setPressMentions] = useState<PressMention[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPressMentions();
  }, [portfolioId]);

  const loadPressMentions = async () => {
    try {
      const { data, error } = await supabase
        .from('press_mentions')
        .select('*')
        .eq('portfolio_id', portfolioId)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setPressMentions(data || []);
    } catch (error) {
      console.error('Error loading press mentions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <section className={`${theme.colors.background} ${theme.colors.text} py-20 px-4 md:px-8`}>
        <div className="container mx-auto">
          <h2 className={`text-4xl font-bold mb-12 text-center ${theme.colors.heading}`}>{sectionTitle}</h2>
          <div className="text-center">Loading press mentions...</div>
        </div>
      </section>
    );
  }

  if (pressMentions.length === 0) {
    return null; // Don't render the section if no press mentions
  }

  const sortedMentions = [...pressMentions].sort((a, b) => {
    if (layout === 'featured') {
      // Featured first, then by order
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
    }
    return a.order_index - b.order_index;
  });

  const featuredMentions = sortedMentions.filter(item => item.featured);
  const regularMentions = sortedMentions.filter(item => !item.featured);

  const renderGridCard = (item: PressMention) => (
    <div
      key={item.id}
      className={`bg-white/5 rounded-xl border border-white/10 p-6 hover:bg-white/10 transition-all duration-300 ${item.featured ? 'ring-2 ring-yellow-500/50' : ''}`}
    >
      <div className="flex flex-col h-full">
        {/* Image */}
        {item.image_url && (
          <div className="mb-4 flex justify-center">
            <div className="relative h-16 w-32">
              <Image
                src={item.image_url}
                alt={item.title}
                fill
                className="object-contain"
              />
            </div>
          </div>
        )}
        
        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            {item.featured && (
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
            )}
            <h3 className={`font-semibold text-lg ${theme.colors.heading}`}>
              {item.title}
            </h3>
          </div>
          
          {item.description && (
            <p className={`text-sm ${theme.colors.text} opacity-80 mb-4 line-clamp-3`}>
              {item.description}
            </p>
          )}
          
          <div className="flex items-center gap-3 text-xs text-gray-400 mb-4">
            {item.source && <span>{item.source}</span>}
            {item.date && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(item.date).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
        
        {/* Action */}
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors text-sm font-medium`}
        >
          <ExternalLink className="w-4 h-4" />
          Read Article
        </a>
      </div>
    </div>
  );

  const renderListItem = (item: PressMention) => (
    <div
      key={item.id}
      className={`flex items-start gap-4 p-4 rounded-lg border border-white/10 hover:bg-white/5 transition-colors ${item.featured ? 'ring-2 ring-yellow-500/50' : ''}`}
    >
      {/* Image */}
      {item.image_url && (
        <div className="flex-shrink-0">
          <div className="relative h-12 w-16">
            <Image
              src={item.image_url}
              alt={item.title}
              fill
              className="object-contain"
            />
          </div>
        </div>
      )}
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          {item.featured && (
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
          )}
          <h3 className={`font-semibold ${theme.colors.heading}`}>
            {item.title}
          </h3>
        </div>
        
        {item.description && (
          <p className={`text-sm ${theme.colors.text} opacity-80 mb-2`}>
            {item.description}
          </p>
        )}
        
        <div className="flex items-center gap-4 text-xs text-gray-400">
          {item.source && <span>{item.source}</span>}
          {item.date && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {new Date(item.date).toLocaleDateString()}
            </span>
          )}
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-blue-400 hover:text-blue-300"
          >
            <ExternalLink className="w-3 h-3" />
            Read Article
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <section className={`${theme.colors.background} ${theme.colors.text} py-20 px-4 md:px-8`}>
      <div className="container mx-auto">
        <h2 className={`text-4xl font-bold mb-12 text-center ${theme.colors.heading}`}>
          {sectionTitle}
        </h2>
        
        {/* Featured Mentions */}
        {layout === 'featured' && featuredMentions.length > 0 && (
          <div className="mb-12">
            <h3 className={`text-2xl font-semibold mb-6 text-center ${theme.colors.heading}`}>
              Featured Press
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredMentions.map(renderGridCard)}
            </div>
          </div>
        )}
        
        {/* Regular Mentions */}
        {layout === 'featured' && regularMentions.length > 0 && (
          <div>
            <h3 className={`text-2xl font-semibold mb-6 text-center ${theme.colors.heading}`}>
              More Press
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularMentions.map(renderGridCard)}
            </div>
          </div>
        )}
        
        {/* List Layout */}
        {layout === 'list' && (
          <div className="space-y-4">
            {sortedMentions.map(renderListItem)}
          </div>
        )}
        
        {/* Grid Layout */}
        {layout === 'grid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedMentions.map(renderGridCard)}
          </div>
        )}
      </div>
    </section>
  );
} 