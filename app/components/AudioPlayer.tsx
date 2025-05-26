'use client';

import { useState, useRef, useEffect } from 'react';
import { PlayIcon, PauseIcon, SpeakerWaveIcon, SpeakerXMarkIcon, XMarkIcon } from '@heroicons/react/24/solid';
import AudioVisualizer from './AudioVisualizer';
import AudioAnalyzer from './AudioAnalyzer';

interface AudioPlayerProps {
  audioUrl: string;
  title: string;
  onPlay?: () => void;
  onPause?: () => void;
  onClose: () => void;
  isPlaying?: boolean;
}

export default function AudioPlayer({ 
  audioUrl, 
  title, 
  onPlay, 
  onPause, 
  onClose,
  isPlaying: externalIsPlaying = false 
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(externalIsPlaying);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isAudioReady, setIsAudioReady] = useState(false);
  const previousAudioUrlRef = useRef(audioUrl);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsAudioReady(true);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    setIsPlaying(externalIsPlaying);
  }, [externalIsPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (previousAudioUrlRef.current !== audioUrl) {
      if (isPlaying) {
        audio.pause();
        onPause?.();
      }
      
      setCurrentTime(0);
      setIsAudioReady(false);
      
      audio.src = audioUrl;
      audio.load();
      
      previousAudioUrlRef.current = audioUrl;
      audio.play()
        .then(() => {
          setIsPlaying(true);
          onPlay?.();
        })
        .catch(error => {
          console.error('Error playing new audio:', error);
          setIsPlaying(false);
        });
    }
  }, [audioUrl, isPlaying, onPlay, onPause]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !isAudioReady) return;

    if (previousAudioUrlRef.current === audioUrl && isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error('Error playing audio:', error);
          setIsPlaying(false);
        });
      }
    }
  }, [isAudioReady, audioUrl, isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          console.error('Error playing audio:', error);
          setIsPlaying(false);
        });
      }
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    const newIsPlaying = !isPlaying;
    setIsPlaying(newIsPlaying);
    
    if (newIsPlaying) {
      onPlay?.();
    } else {
      onPause?.();
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const time = parseFloat(e.target.value);
    audio.currentTime = time;
    setCurrentTime(time);
  };

  return (
    <div className="max-w-md mx-auto backdrop-blur-sm bg-gray-900/30 rounded-lg p-3 space-y-2 border border-gray-800/50">
      <div className="relative">
        <audio 
          ref={audioRef} 
          src={audioUrl} 
          preload="auto"
          crossOrigin="anonymous"
        />
        
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-white truncate max-w-[200px]">{title}</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleMute}
              className="p-1 rounded-full hover:bg-gray-800/50 transition-colors"
            >
              {isMuted ? (
                <SpeakerXMarkIcon className="h-4 w-4 text-white" />
              ) : (
                <SpeakerWaveIcon className="h-4 w-4 text-white" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-20 h-1 bg-gray-700/50 rounded-lg appearance-none cursor-pointer"
            />
            <button
              onClick={togglePlay}
              className="p-1 rounded-full bg-indigo-600/80 hover:bg-indigo-700/80 transition-colors"
            >
              {isPlaying ? (
                <PauseIcon className="h-4 w-4 text-white" />
              ) : (
                <PlayIcon className="h-4 w-4 text-white" />
              )}
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-full bg-gray-800/80 hover:bg-gray-700/80 transition-colors"
              title="Close player"
            >
              <XMarkIcon className="h-4 w-4 text-white" />
            </button>
          </div>
        </div>

        {isAudioReady && (
          <AudioAnalyzer
            audioElement={audioRef.current || undefined}
            isPlaying={isPlaying}
            onDurationChange={setDuration}
          />
        )}

        <div className="flex items-center space-x-2">
          <span className="text-xs text-gray-300">{formatTime(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={duration}
            value={currentTime}
            onChange={handleSeek}
            className="flex-1 h-1 bg-gray-700/50 rounded-lg appearance-none cursor-pointer"
          />
          <span className="text-xs text-gray-300">{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
} 