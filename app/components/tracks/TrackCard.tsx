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

  if (variant === 'list') {
    return (
      <div
        className="group relative bg-gray-900/30 backdrop-blur-sm rounded-lg p-4 border border-gray-800/50 hover:border-gray-700/50 transition-all"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 flex-shrink-0">
            <img
              src={track.thumbnail_url || '/default-thumbnail.jpg'}
              alt={track.title}
              className="w-full h-full object-cover rounded-lg"
            />
            <button
              onClick={handlePlayClick}
              className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
            >
              {isPlaying ? (
                <PauseIcon className="h-8 w-8 text-white" />
              ) : (
                <PlayIcon className="h-8 w-8 text-white" />
              )}
            </button>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium text-white truncate">{track.title}</h3>
            <p className="text-sm text-gray-400 truncate">{track.description}</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleInfoClick}
              className="p-2 rounded-full hover:bg-gray-800/50 transition-colors"
              title="Track Info"
            >
              <InformationCircleIcon className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>

        {showInfo && (
          <div className="mt-4 p-4 bg-gray-800/50 rounded-lg">
            <h4 className="text-sm font-medium text-white mb-2">Track Details</h4>
            <p className="text-sm text-gray-300 whitespace-pre-wrap">{track.composer_notes}</p>
            {track.lyrics && (
              <div className="mt-4">
                <h5 className="text-sm font-medium text-white mb-2">Lyrics</h5>
                <p className="text-sm text-gray-300 whitespace-pre-wrap">{track.lyrics}</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="group relative bg-gray-900/30 backdrop-blur-sm rounded-lg overflow-hidden border border-gray-800/50 hover:border-gray-700/50 transition-all"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="aspect-square relative">
        <img
          src={track.thumbnail_url || '/default-thumbnail.jpg'}
          alt={track.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            onClick={handlePlayClick}
            className="p-3 rounded-full bg-indigo-600/80 hover:bg-indigo-700/80 transition-colors"
          >
            {isPlaying ? (
              <PauseIcon className="h-8 w-8 text-white" />
            ) : (
              <PlayIcon className="h-8 w-8 text-white" />
            )}
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium text-white truncate">{track.title}</h3>
            <p className="text-sm text-gray-400 line-clamp-2">{track.description}</p>
          </div>
          <button
            onClick={handleInfoClick}
            className="p-2 rounded-full hover:bg-gray-800/50 transition-colors flex-shrink-0"
            title="Track Info"
          >
            <InformationCircleIcon className="h-5 w-5 text-gray-400" />
          </button>
        </div>

        {showInfo && (
          <div className="mt-4 p-4 bg-gray-800/50 rounded-lg">
            <h4 className="text-sm font-medium text-white mb-2">Track Details</h4>
            <p className="text-sm text-gray-300 whitespace-pre-wrap">{track.composer_notes}</p>
            {track.lyrics && (
              <div className="mt-4">
                <h5 className="text-sm font-medium text-white mb-2">Lyrics</h5>
                <p className="text-sm text-gray-300 whitespace-pre-wrap">{track.lyrics}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 