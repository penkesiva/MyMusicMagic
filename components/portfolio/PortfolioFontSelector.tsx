'use client'

import React from 'react';

const FONT_PAIRS = [
  {
    id: 'sf-pro',
    name: 'SF Pro Display & SF Pro Text',
    description: 'Apple\'s signature system fonts',
    preview: 'Aa'
  },
  {
    id: 'montserrat-merriweather',
    name: 'Montserrat & Merriweather',
    description: 'Clean and professional',
    preview: 'Aa'
  },
  {
    id: 'playfair-source',
    name: 'Playfair Display & Source Sans Pro',
    description: 'Elegant and modern',
    preview: 'Aa'
  },
  {
    id: 'poppins-roboto',
    name: 'Poppins & Roboto',
    description: 'Contemporary and readable',
    preview: 'Aa'
  },
  {
    id: 'lato-open-sans',
    name: 'Lato & Open Sans',
    description: 'Friendly and approachable',
    preview: 'Aa'
  },
  {
    id: 'raleway-roboto-slab',
    name: 'Raleway & Roboto Slab',
    description: 'Sophisticated with personality',
    preview: 'Aa'
  },
  {
    id: 'raleway-thin-nunito',
    name: 'Raleway Thin & Nunito Sans',
    description: 'Light and modern',
    preview: 'Aa'
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
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Typography</h3>
        <p className="text-sm text-gray-600 mb-4">Choose your font combination</p>
      </div>
      
      <div className="space-y-2">
        {FONT_PAIRS.map((fontPair) => (
          <button
            key={fontPair.id}
            onClick={() => onFontPairChange(fontPair.id)}
            className={`w-full p-3 text-left rounded-lg border transition-all duration-200 ${
              selectedFontPair === fontPair.id
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="font-medium text-sm">{fontPair.name}</div>
                <div className="text-xs text-gray-500 mt-1">{fontPair.description}</div>
              </div>
              <div className="text-2xl font-light text-gray-400">{fontPair.preview}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default PortfolioFontSelector; 