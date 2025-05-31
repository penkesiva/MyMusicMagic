import React, { useState } from 'react';
import { PlayIcon, PauseIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { Database } from '@/types/database';

type Track = Database['public']['Tables']['tracks']['Row'];

interface TrackCardProps {
  track: Track;
  variant?: 'grid' | 'list';
  onPlay: () => void;
  onInfo: (track: Track) => void;
  isPlaying?: boolean;
}

function AudioWaveformAnimation() {
  return (
    <div className="flex items-center h-4 space-x-[3px]">
      <div className="w-[3px] h-3 bg-indigo-400 rounded-full animate-[bounce_1s_ease-in-out_infinite_0ms]" />
      <div className="w-[3px] h-3 bg-indigo-400 rounded-full animate-[bounce_1s_ease-in-out_infinite_200ms]" />
      <div className="w-[3px] h-3 bg-indigo-400 rounded-full animate-[bounce_1s_ease-in-out_infinite_400ms]" />
      <div className="w-[3px] h-3 bg-indigo-400 rounded-full animate-[bounce_1s_ease-in-out_infinite_600ms]" />
    </div>
  );
}

export function TrackCard({ track, variant = 'grid', onPlay, onInfo, isPlaying }: TrackCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onPlay();
  };

  const handleInfoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onInfo(track);
    setShowInfo(!showInfo);
  };

  // DEBUG BANNER
  return (
    <div>
      <div style={{ background: 'red', color: 'white', padding: 8, fontWeight: 'bold' }}>
        DEBUG TRACKCARD (app/components/tracks/TrackCard.tsx)
      </div>
      {/* ...rest of the component code... */}
    </div>
  );
} 