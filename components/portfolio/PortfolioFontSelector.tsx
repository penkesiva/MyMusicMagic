'use client'

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const FONT_PAIRS = [
  {
    id: 'sf-pro',
    name: 'SF Pro',
    description: 'Apple\'s signature system fonts'
  },
  {
    id: 'montserrat-merriweather',
    name: 'Montserrat',
    description: 'Clean and professional'
  },
  {
    id: 'playfair-source',
    name: 'Playfair Display',
    description: 'Elegant and modern'
  },
  {
    id: 'poppins-roboto',
    name: 'Poppins',
    description: 'Contemporary and readable'
  },
  {
    id: 'lato-open-sans',
    name: 'Lato',
    description: 'Friendly and approachable'
  },
  {
    id: 'raleway-roboto-slab',
    name: 'Raleway',
    description: 'Sophisticated with personality'
  },
  {
    id: 'raleway-thin-nunito',
    name: 'Raleway Thin',
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
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedFont = FONT_PAIRS.find(f => f.id === selectedFontPair) || FONT_PAIRS[0];

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
      <label className="block font-semibold text-sm text-slate-900 mb-2">Typography</label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 hover:border-slate-300 transition-colors"
      >
        <span>{selectedFont.name}</span>
        <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-auto">
          {FONT_PAIRS.map((fontPair) => (
            <button
              key={fontPair.id}
              onClick={() => {
                onFontPairChange(fontPair.id);
                setIsOpen(false);
              }}
              className="w-full p-3 text-left transition-all duration-200 hover:bg-slate-50 first:rounded-t-lg last:rounded-b-lg"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-medium text-sm text-slate-900">{fontPair.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{fontPair.description}</div>
                </div>
                {selectedFontPair === fontPair.id && (
                  <Check className="w-4 h-4 text-[#7f13ec] ml-2" />
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