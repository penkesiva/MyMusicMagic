"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
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
  const [colorThemeOpen, setColorThemeOpen] = useState(true);

  const handleThemeClick = (themeName: string) => {
    onFieldChange("theme_name", themeName);
  };

  // Separate gradient and solid themes
  const gradientThemes = THEMES.filter(t => t.isGradient);
  const solidThemes = THEMES.filter(t => !t.isGradient);

  return (
    <div className="space-y-2 relative">
      <button 
        onClick={() => setColorThemeOpen(!colorThemeOpen)} 
        className="w-full flex justify-between items-center font-semibold text-sm text-white"
      >
        Color Theme
        <ChevronDown className={`w-4 h-4 transition-transform ${colorThemeOpen ? 'rotate-180' : ''}`} />
      </button>
      {colorThemeOpen && (
        <div className="space-y-3">
          {/* Gradient Themes */}
          <div>
            <div className="text-xs text-gray-400 mb-2 px-1">Gradients</div>
            <div className="grid grid-cols-6 gap-1 p-1">
              {gradientThemes.map((themeOption) => (
                <button
                  key={themeOption.name}
                  onClick={() => handleThemeClick(themeOption.name)}
                  className={`aspect-square w-8 h-8 transition-all duration-200 focus:outline-none rounded-md ${
                    theme.name === themeOption.name 
                      ? 'ring-2 ring-white ring-offset-1 ring-offset-gray-800' 
                      : 'hover:scale-105'
                  }`}
                  style={{
                    background: themeOption.gradientColors 
                      ? `linear-gradient(135deg, ${themeOption.gradientColors[0]} 0%, ${themeOption.gradientColors[1]} 100%)`
                      : themeOption.previewColor,
                    border: theme.name === themeOption.name ? '2px solid #fff' : '1px solid rgba(255,255,255,0.1)',
                  }}
                  title={themeOption.name}
                />
              ))}
            </div>
          </div>

          {/* Solid Themes */}
          <div>
            <div className="text-xs text-gray-400 mb-2 px-1">Solid</div>
            <div className="grid grid-cols-6 gap-1 p-1">
              {solidThemes.map((themeOption) => (
                <button
                  key={themeOption.name}
                  onClick={() => handleThemeClick(themeOption.name)}
                  className={`aspect-square w-8 h-8 transition-all duration-200 focus:outline-none rounded-md ${
                    theme.name === themeOption.name 
                      ? 'ring-2 ring-white ring-offset-1 ring-offset-gray-800' 
                      : 'hover:scale-105'
                  }`}
                  style={{
                    background: themeOption.previewColor,
                    border: theme.name === themeOption.name ? '2px solid #fff' : '1px solid rgba(255,255,255,0.1)',
                  }}
                  title={themeOption.name}
                />
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Theme name display at bottom right of section - now permanent */}
      {theme.name && (
        <div className="absolute bottom-0 right-0 bg-black/80 text-white px-2 py-1 rounded text-xs font-medium">
          {theme.name}
        </div>
      )}
    </div>
  );
} 