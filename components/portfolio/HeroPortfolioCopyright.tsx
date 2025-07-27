import React from 'react';

interface HeroPortfolioCopyrightProps {
  theme?: any;
}

const HeroPortfolioCopyright: React.FC<HeroPortfolioCopyrightProps> = ({ theme }) => {
  const currentYear = new Date().getFullYear();
  
  return (
    <div className={`py-4 px-4 md:px-8 border-t ${theme?.colors?.text || 'text-gray-400'} ${theme?.imageFrames ? 'border-white/10' : 'border-gray-300/10'}`}>
      <div className="container mx-auto text-center">
        <p className={`text-sm opacity-60 ${theme?.colors?.text || 'text-gray-400'}`}>
          © {currentYear} HeroPortfolio. All rights reserved. | 
          <a 
            href="/privacy" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:opacity-80 transition-opacity ml-2"
          >
            Privacy Policy
          </a> | 
          <a 
            href="/terms" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:opacity-80 transition-opacity ml-2"
          >
            Terms of Service
          </a>
        </p>
      </div>
    </div>
  );
};

export default HeroPortfolioCopyright; 