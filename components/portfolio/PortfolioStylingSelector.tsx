import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface PortfolioStylingSelectorProps {
  cardShadows: boolean;
  imageFrames: boolean;
  animations: boolean;
  onStylingChange: (setting: 'cardShadows' | 'imageFrames' | 'animations', value: boolean) => void;
}

const PortfolioStylingSelector: React.FC<PortfolioStylingSelectorProps> = ({
  cardShadows,
  imageFrames,
  animations,
  onStylingChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="space-y-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex justify-between items-center font-semibold text-sm text-slate-900 hover:text-slate-700 transition-colors"
      >
        Styles
        <ChevronDown className={`w-4 h-4 transition-transform text-slate-700 ${isExpanded ? 'rotate-180' : ''}`} />
      </button>
      
      {isExpanded && (
        <div className="space-y-3 pl-2">
          {/* Card Shadows */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-sm font-medium text-slate-900">Card Shadows</div>
              <div className="text-xs text-slate-500 mt-1">Soft drop-shadows under project cards</div>
            </div>
            <Switch
              id="card-shadows"
              isChecked={cardShadows}
              onChange={(e) => onStylingChange('cardShadows', e.target.checked)}
              style={{ transform: 'scale(0.8)' }}
            />
          </div>

          {/* Image Frames */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-sm font-medium text-slate-900">Image Frames</div>
              <div className="text-xs text-slate-500 mt-1">Rounded-corner or square images</div>
            </div>
            <Switch
              id="image-frames"
              isChecked={imageFrames}
              onChange={(e) => onStylingChange('imageFrames', e.target.checked)}
              style={{ transform: 'scale(0.8)' }}
            />
          </div>

          {/* Animations */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-sm font-medium text-slate-900">Animations</div>
              <div className="text-xs text-slate-500 mt-1">Simple fade-ins on scroll</div>
            </div>
            <Switch
              id="animations"
              isChecked={animations}
              onChange={(e) => onStylingChange('animations', e.target.checked)}
              style={{ transform: 'scale(0.8)' }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioStylingSelector; 