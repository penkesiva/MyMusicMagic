"use client";

import { useState, useEffect } from "react";
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
  const [clickedTheme, setClickedTheme] = useState<string | null>(null);

  // Auto-hide theme name after 2 seconds
  useEffect(() => {
    if (clickedTheme) {
      const timer = setTimeout(() => {
        setClickedTheme(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [clickedTheme]);

  const handleThemeClick = (themeName: string) => {
    onFieldChange("theme_name", themeName);
    setClickedTheme(themeName);
  };

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
        <div className="flex gap-1 flex-wrap">
          {THEMES.map((themeOption) => (
            <button
              key={themeOption.name}
              onClick={() => handleThemeClick(themeOption.name)}
              className={`rounded-full transition-all focus:outline-none`}
              style={{
                width: 22,
                height: 22,
                background: themeOption.previewColor,
                border: theme.name === themeOption.name ? '2px solid #fff' : '1px solid #444',
                margin: 1,
              }}
              title={themeOption.name}
            />
          ))}
        </div>
      )}
      
      {/* Theme name display at bottom right of section */}
      {clickedTheme && (
        <div className="absolute bottom-0 right-0 bg-black/80 text-white px-2 py-1 rounded text-xs font-medium animate-in slide-in-from-bottom-2 duration-300">
          {clickedTheme}
        </div>
      )}
    </div>
  );
} 