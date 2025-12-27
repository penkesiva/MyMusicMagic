"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import { THEMES } from "@/lib/themes";
import { Portfolio } from "@/types/portfolio";

interface PortfolioThemeSelectorProps {
  portfolio: Portfolio | null;
  onFieldChange: (field: keyof Portfolio, value: any) => void;
  theme: any;
}

export default function PortfolioThemeSelector({
  portfolio,
  onFieldChange,
  theme
}: PortfolioThemeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleThemeClick = (themeName: string) => {
    onFieldChange("theme_name", themeName);
    setIsOpen(false);
  };

  // Separate gradient and solid themes
  const gradientThemes = THEMES.filter(t => t.isGradient);
  const solidThemes = THEMES.filter(t => !t.isGradient);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="space-y-2 relative" ref={dropdownRef}>
      <label className="block font-semibold text-sm text-slate-900 mb-2">Accent Color</label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 hover:border-slate-300 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded border border-slate-300"
            style={{
              background: theme.gradientColors 
                ? `linear-gradient(135deg, ${theme.gradientColors[0]} 0%, ${theme.gradientColors[1]} 100%)`
                : theme.previewColor,
            }}
          />
          <span>{theme.name}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-96 overflow-auto">
          {/* Gradient Themes */}
          <div className="p-3 border-b border-slate-100">
            <div className="text-xs font-medium text-slate-500 mb-2 px-1">Gradients</div>
            <div className="grid grid-cols-5 gap-2">
              {gradientThemes.map((themeOption) => (
                <button
                  key={themeOption.name}
                  onClick={() => handleThemeClick(themeOption.name)}
                  className={`aspect-square w-full transition-all duration-200 focus:outline-none rounded-md relative ${
                    theme.name === themeOption.name 
                      ? 'ring-2 ring-[#7f13ec] ring-offset-1' 
                      : 'hover:scale-105'
                  }`}
                  style={{
                    background: themeOption.gradientColors 
                      ? `linear-gradient(135deg, ${themeOption.gradientColors[0]} 0%, ${themeOption.gradientColors[1]} 100%)`
                      : themeOption.previewColor,
                    border: theme.name === themeOption.name ? '2px solid #7f13ec' : '1px solid rgba(0,0,0,0.1)',
                  }}
                  title={themeOption.name}
                >
                  {theme.name === themeOption.name && (
                    <Check className="absolute top-0.5 right-0.5 w-3 h-3 text-white drop-shadow-md" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Solid Themes */}
          <div className="p-3">
            <div className="text-xs font-medium text-slate-500 mb-2 px-1">Solid</div>
            <div className="grid grid-cols-5 gap-2">
              {solidThemes.map((themeOption) => (
                <button
                  key={themeOption.name}
                  onClick={() => handleThemeClick(themeOption.name)}
                  className={`aspect-square w-full transition-all duration-200 focus:outline-none rounded-md relative ${
                    theme.name === themeOption.name 
                      ? 'ring-2 ring-[#7f13ec] ring-offset-1' 
                      : 'hover:scale-105'
                  }`}
                  style={{
                    background: themeOption.previewColor,
                    border: theme.name === themeOption.name ? '2px solid #7f13ec' : '1px solid rgba(0,0,0,0.1)',
                  }}
                  title={themeOption.name}
                >
                  {theme.name === themeOption.name && (
                    <Check className="absolute top-0.5 right-0.5 w-3 h-3 text-white drop-shadow-md" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 