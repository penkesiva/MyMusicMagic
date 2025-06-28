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

  return (
    <div className="space-y-2">
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
              onClick={() => onFieldChange("theme_name", themeOption.name)}
              className={`rounded-full transition-all focus:outline-none`}
              style={{
                width: 22,
                height: 22,
                background: themeOption.colors.primary,
                border: theme.name === themeOption.name ? '2px solid #fff' : '1px solid #444',
                margin: 1,
              }}
              title={themeOption.name}
            />
          ))}
        </div>
      )}
    </div>
  );
} 