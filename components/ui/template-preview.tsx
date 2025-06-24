import React from 'react';
import { Music, Palette, Camera, Code, GraduationCap, Brush, Briefcase, Sparkles } from 'lucide-react';

interface TemplatePreviewProps {
  template: {
    id: string;
    name: string;
    description: string;
    industry: string;
    style: string;
    theme_colors?: any;
  };
  isSelected: boolean;
  onSelect: (templateId: string) => void;
}

const getIndustryIcon = (industry: string) => {
  switch (industry) {
    case 'music':
      return <Music className="w-6 h-6" />;
    case 'design':
      return <Palette className="w-6 h-6" />;
    case 'photography':
      return <Camera className="w-6 h-6" />;
    case 'tech':
      return <Code className="w-6 h-6" />;
    case 'education':
      return <GraduationCap className="w-6 h-6" />;
    case 'art':
      return <Brush className="w-6 h-6" />;
    case 'business':
      return <Briefcase className="w-6 h-6" />;
    default:
      return <Sparkles className="w-6 h-6" />;
  }
};

const getTemplateColors = (templateName: string) => {
  switch (templateName) {
    case 'Music Maestro':
      return {
        primary: '#4F46E5',
        secondary: '#7C3AED',
        accent: '#F59E0B',
        background: 'from-purple-950 via-indigo-950 to-purple-900'
      };
    case 'Design Studio':
      return {
        primary: '#000000',
        secondary: '#6B7280',
        accent: '#EF4444',
        background: 'from-gray-900 to-gray-800'
      };
    case 'Tech Portfolio':
      return {
        primary: '#2563EB',
        secondary: '#1F2937',
        accent: '#10B981',
        background: 'from-slate-900 to-slate-800'
      };
    case 'Photo Gallery':
      return {
        primary: '#DC2626',
        secondary: '#374151',
        accent: '#F59E0B',
        background: 'from-red-950 to-red-900'
      };
    default:
      return {
        primary: '#6B7280',
        secondary: '#374151',
        accent: '#F59E0B',
        background: 'from-gray-900 to-gray-800'
      };
  }
};

export function TemplatePreview({ template, isSelected, onSelect }: TemplatePreviewProps) {
  const colors = getTemplateColors(template.name);
  
  return (
    <div
      className={`relative p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
        isSelected
          ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/25'
          : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
      }`}
      onClick={() => onSelect(template.id)}
    >
      {/* Template Preview */}
      <div className={`w-full h-24 rounded-lg bg-gradient-to-br ${colors.background} mb-3 relative overflow-hidden`}>
        {/* Mock content preview */}
        <div className="absolute inset-0 p-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-white/60"></div>
              <div className="w-8 h-1 rounded bg-white/40"></div>
            </div>
            <div className="w-6 h-6 rounded bg-white/20 flex items-center justify-center">
              {getIndustryIcon(template.industry)}
            </div>
          </div>
          <div className="mt-2 space-y-1">
            <div className="w-16 h-1 rounded bg-white/50"></div>
            <div className="w-12 h-1 rounded bg-white/30"></div>
          </div>
        </div>
        
        {/* Color palette preview */}
        <div className="absolute bottom-1 right-1 flex space-x-1">
          <div 
            className="w-3 h-3 rounded-full border border-white/20" 
            style={{ backgroundColor: colors.primary }}
          ></div>
          <div 
            className="w-3 h-3 rounded-full border border-white/20" 
            style={{ backgroundColor: colors.secondary }}
          ></div>
          <div 
            className="w-3 h-3 rounded-full border border-white/20" 
            style={{ backgroundColor: colors.accent }}
          ></div>
        </div>
      </div>

      {/* Template Info */}
      <div className="space-y-1">
        <h3 className="font-semibold text-white text-sm">{template.name}</h3>
        <p className="text-gray-400 text-xs line-clamp-2">{template.description}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-500 capitalize">{template.industry}</span>
          <span className="text-xs text-gray-500 capitalize">{template.style}</span>
        </div>
      </div>

      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
      )}
    </div>
  );
} 