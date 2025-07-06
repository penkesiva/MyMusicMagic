'use client'

import React, { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const FONT_PAIRS = [
  {
    id: 'sf-pro',
    name: 'SF Pro Display & SF Pro Text',
    description: 'Apple\'s signature system fonts'
  },
  {
    id: 'montserrat-merriweather',
    name: 'Montserrat & Merriweather',
    description: 'Clean and professional'
  },
  {
    id: 'playfair-source',
    name: 'Playfair Display & Source Sans Pro',
    description: 'Elegant and modern'
  },
  {
    id: 'poppins-roboto',
    name: 'Poppins & Roboto',
    description: 'Contemporary and readable'
  },
  {
    id: 'lato-open-sans',
    name: 'Lato & Open Sans',
    description: 'Friendly and approachable'
  },
  {
    id: 'raleway-roboto-slab',
    name: 'Raleway & Roboto Slab',
    description: 'Sophisticated with personality'
  },
  {
    id: 'raleway-thin-nunito',
    name: 'Raleway Thin & Nunito Sans',
    description: 'Light and modern'
  }
];

interface PortfolioFontSelectorProps {
  selectedFontPair: string;
  onFontPairChange: (fontPair: string) => void;
}

const PortfolioFontSelector: React.FC<PortfolioFontSelectorProps> = ({
  selectedFontPair,
  onFontPairChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="space-y-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex justify-between items-center font-semibold text-sm text-white hover:text-gray-300 transition-colors"
      >
        Fonts
        <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>
      
      {isExpanded && (
        <div className="space-y-2 pl-2">
          {FONT_PAIRS.map((fontPair) => (
            <button
              key={fontPair.id}
              onClick={() => onFontPairChange(fontPair.id)}
              className="w-full p-3 text-left transition-all duration-200 border-b border-gray-50/30 last:border-b-0"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium text-sm">{fontPair.name}</div>
                  <div className="text-xs text-gray-500 mt-1">{fontPair.description}</div>
                </div>
                {selectedFontPair === fontPair.id && (
                  <Check className="w-5 h-5 text-blue-600" />
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PortfolioFontSelector; 