'use client';

import { useState, useRef, useEffect } from 'react';
import { PlayIcon, PauseIcon, SpeakerWaveIcon, SpeakerXMarkIcon, XMarkIcon } from '@heroicons/react/24/solid';
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
  const [showPlayPrompt, setShowPlayPrompt] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isAudioReady, setIsAudioReady] = useState(false);
  const previousAudioUrlRef = useRef(audioUrl);
  const promptTimeoutRef = useRef<NodeJS.Timeout>();
  const playButtonRef = useRef<HTMLButtonElement>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      if (audio) {
        setCurrentTime(audio.currentTime);
        animationFrameRef.current = requestAnimationFrame(updateTime);
      }
    };

    const handlePlay = () => {
      animationFrameRef.current = requestAnimationFrame(updateTime);
    };

    const handlePause = () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsAudioReady(true);
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
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

    console.log('AudioPlayer audio element updated:', {
      audioUrl,
      isPlaying,
      isAudioReady,
      hasAudioElement: !!audio,
      audioElementSrc: audio.src
    });

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
      
      setTimeout(() => {
        audio.play()
          .then(() => {
            setIsPlaying(true);
            onPlay?.();
          })
          .catch(error => {
            console.error('Error playing new audio:', error);
            setIsPlaying(false);
          });
      }, 100);
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

  useEffect(() => {
    // Check if user has seen the prompt before
    const hasSeenPrompt = localStorage.getItem('hasSeenPlayPrompt');
    if (!hasSeenPrompt) {
      setShowPlayPrompt(true);
      // Hide after 5 seconds
      promptTimeoutRef.current = setTimeout(() => {
        setShowPlayPrompt(false);
        localStorage.setItem('hasSeenPlayPrompt', 'true');
      }, 5000);
    }

    return () => {
      if (promptTimeoutRef.current) {
        clearTimeout(promptTimeoutRef.current);
      }
    };
  }, []);

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
    
    // Hide prompt and mark as seen when user interacts
    if (showPlayPrompt) {
      setShowPlayPrompt(false);
      localStorage.setItem('hasSeenPlayPrompt', 'true');
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
    // Don't set currentTime here, let the animation frame handle it
  };

  return (
    <div className="max-w-md mx-auto backdrop-blur-sm bg-gray-900/80 rounded-lg p-3 space-y-2 border border-gray-800/50">
      <div className="relative">
        <audio 
          ref={audioRef} 
          src={audioUrl} 
          preload="auto"
          crossOrigin="anonymous"
          onLoadedMetadata={() => {
            console.log('Audio metadata loaded:', {
              duration: audioRef.current?.duration,
              readyState: audioRef.current?.readyState
            });
            setIsAudioReady(true);
          }}
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
              onClick={onClose}
              className="p-1 rounded-full bg-gray-800/80 hover:bg-gray-700/80 transition-colors"
              title="Close player"
            >
              <XMarkIcon className="h-4 w-4 text-white" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-2">
          <div className="relative flex-shrink-0">
            <button
              ref={playButtonRef}
              onClick={togglePlay}
              className="p-2 rounded-full bg-indigo-600/80 hover:bg-indigo-700/80 transition-colors"
            >
              {isPlaying ? (
                <PauseIcon className="h-5 w-5 text-white" />
              ) : (
                <PlayIcon className="h-5 w-5 text-white" />
              )}
            </button>
            
            {/* Play prompt tooltip */}
            {showPlayPrompt && !isPlaying && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 
                bg-white rounded-lg px-3 py-2 text-sm text-gray-800
                border border-gray-200 shadow-lg whitespace-nowrap z-50">
                Click to play
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 
                  rotate-45 w-2 h-2 bg-white border-r border-b border-gray-200" />
              </div>
            )}
          </div>

          {isAudioReady && (
            <div className="flex-1">
              <AudioAnalyzer
                audioElement={audioRef.current || undefined}
                isPlaying={isPlaying}
                onDurationChange={setDuration}
              />
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2 mt-2">
          <span className="text-xs text-gray-300">{formatTime(currentTime)}</span>
          <input
            type="range"
            min={0}
            max={duration}
            value={currentTime}
            onChange={handleSeek}
            step="any"
            className="flex-1 h-1 bg-gray-700/50 rounded-lg appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-3
              [&::-webkit-slider-thumb]:h-3
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-indigo-500
              [&::-webkit-slider-thumb]:hover:bg-indigo-400
              [&::-webkit-slider-thumb]:transition-all
              [&::-webkit-slider-thumb]:duration-150
              [&::-moz-range-thumb]:appearance-none
              [&::-moz-range-thumb]:w-3
              [&::-moz-range-thumb]:h-3
              [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:bg-indigo-500
              [&::-moz-range-thumb]:hover:bg-indigo-400
              [&::-moz-range-thumb]:transition-all
              [&::-moz-range-thumb]:duration-150
              [&::-moz-range-thumb]:border-0
              [&::-webkit-slider-runnable-track]:transition-all
              [&::-webkit-slider-runnable-track]:duration-150
              [&::-moz-range-track]:transition-all
              [&::-moz-range-track]:duration-150"
          />
          <span className="text-xs text-gray-300">{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
} 