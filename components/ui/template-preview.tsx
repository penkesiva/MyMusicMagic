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
    is_free?: boolean;
    is_locked?: boolean;
  };
  isSelected: boolean;
  onSelect: (templateId: string) => void;
  onUpgrade?: () => void;
  userSubscription?: {
    plan_type: string;
  };
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
    case 'Basic Template':
      return {
        primary: '#6B7280',
        secondary: '#374151',
        accent: '#F59E0B',
        background: 'from-gray-900 to-gray-800'
      };
    case 'Royal Purple':
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
    case 'Crimson Sunset':
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

export function TemplatePreview({ template, isSelected, onSelect, onUpgrade, userSubscription }: TemplatePreviewProps) {
  const colors = getTemplateColors(template.name);
  
  // Check if template is locked for current user
  const isLocked = template.is_locked && userSubscription?.plan_type === 'free';
  
  return (
    <div
      className={`relative p-4 rounded-xl border-2 transition-all duration-300 ${
        isLocked 
          ? 'cursor-not-allowed opacity-60' 
          : 'cursor-pointer hover:border-white/20 hover:bg-white/10'
      } ${
        isSelected
          ? 'border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/25'
          : 'border-white/10 bg-white/5'
      }`}
      onClick={() => {
        if (!isLocked) {
          onSelect(template.id);
        } else if (onUpgrade) {
          onUpgrade();
        }
      }}
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

      {/* Lock indicator for locked templates */}
      {isLocked && (
        <div className="absolute top-2 right-2 w-7 h-7 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white/20">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}

      {/* Selection indicator */}
      {isSelected && !isLocked && (
        <div className="absolute top-2 right-2 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
          <div className="w-2 h-2 bg-white rounded-full"></div>
        </div>
      )}

      {/* Upgrade button for locked templates */}
      {isLocked && (
        <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onUpgrade) onUpgrade();
            }}
            className="px-3 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-medium rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
          >
            Upgrade
          </button>
        </div>
      )}
    </div>
  );
} 