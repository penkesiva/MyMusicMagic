'use client'

import { useState, useEffect, useRef } from 'react'
import { Database } from '@/types/database'
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, X, Maximize2, Minimize2 } from 'lucide-react'
import { useAudioStore } from '@/lib/audioState'

type Track = Database['public']['Tables']['tracks']['Row']

interface PortfolioBottomAudioPlayerProps {
  isVisible: boolean
  onClose: () => void
  theme?: any
}

export default function PortfolioBottomAudioPlayer({ isVisible, onClose, theme }: PortfolioBottomAudioPlayerProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Global audio state
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    setCurrentTime,
    setDuration,
    setVolume,
    setMuted,
    play,
    pause,
    togglePlay,
    reset
  } = useAudioStore()

  console.log('PortfolioBottomAudioPlayer render:', { 
    isVisible, 
    currentTrack: currentTrack?.title, 
    isPlaying, 
    currentTime, 
    duration 
  })

  // Default theme colors if none provided
  const colors = theme?.colors || {
    background: 'bg-gray-900',
    text: 'text-white',
    primary: 'text-blue-400',
    primaryStrong: 'text-blue-300'
  }

  // Handle custom play track events
  useEffect(() => {
    const handlePlayTrack = (event: CustomEvent) => {
      const { track, isPlaying: shouldPlay } = event.detail
      console.log('Play track event received:', track.title, shouldPlay)
      
      const store = useAudioStore.getState()
      
      if (store.currentTrack?.id === track.id) {
        // Same track - toggle play/pause
        console.log('Same track, toggling play/pause')
        if (shouldPlay) {
          store.pause()
        } else {
          store.play()
        }
      } else {
        // New track - start playing
        console.log('New track, setting track:', track.title)
        store.setTrack(track)
      }
    }

    console.log('Setting up playTrack event listener')
    window.addEventListener('playTrack', handlePlayTrack as EventListener)
    return () => {
      console.log('Cleaning up playTrack event listener')
      window.removeEventListener('playTrack', handlePlayTrack as EventListener)
    }
  }, []) // No dependencies to prevent recreation

  // Audio element event handlers
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    console.log('Setting up audio event listeners')

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
      setDuration(audio.duration || 0)
    }

    const handleEnded = () => {
      console.log('Audio ended')
      pause()
      setCurrentTime(0)
    }

    const handleLoadedMetadata = () => {
      console.log('Loaded metadata:', audio.duration)
      setDuration(audio.duration || 0)
    }

    const handleCanPlay = () => {
      console.log('Audio can play:', audio.duration)
      // Auto-start playing when audio is ready
      play()
    }

    const handlePlay = () => {
      console.log('Audio play event fired')
    }

    const handlePause = () => {
      console.log('Audio pause event fired')
    }

    const handleError = (e: Event) => {
      console.log('Audio error:', e)
      useAudioStore.getState().pause()
    }

    // Set up event listeners
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('canplay', handleCanPlay)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)
    audio.addEventListener('error', handleError)

    return () => {
      console.log('Cleaning up audio event listeners')
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('canplay', handleCanPlay)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
      audio.removeEventListener('error', handleError)
    }
  }, [setCurrentTime, setDuration, pause, play]) // Include play dependency

  // Control audio playback based on global state
  useEffect(() => {
    if (!audioRef.current) return
    
    const audio = audioRef.current
    console.log('Play/pause effect triggered:', isPlaying, 'Audio paused:', audio.paused)
    
    if (isPlaying) {
      // Try to play the audio
      console.log('Attempting to play audio...')
      audio.play().then(() => {
        console.log('Audio play successful, paused:', audio.paused)
      }).catch((error) => {
        console.error('Error playing audio:', error)
        // If play fails, update the state to reflect that
        useAudioStore.getState().pause()
      })
    } else {
      console.log('Pausing audio...')
      audio.pause()
    }
  }, [isPlaying])

  // Update audio element when track changes
  useEffect(() => {
    if (!audioRef.current || !currentTrack) return
    
    const audio = audioRef.current
    console.log('Updating audio element with track:', currentTrack.title, currentTrack.audio_url)
    
    // Update the audio source
    audio.src = currentTrack.audio_url
    audio.load()
    
    // Reset time and duration
    setCurrentTime(0)
    setDuration(0)
    
    // Ensure autoplay works by setting a small delay
    const timer = setTimeout(() => {
      if (audio.readyState >= 2) { // HAVE_CURRENT_DATA
        console.log('Audio ready, starting playback')
        play()
      }
    }, 100)
    
    return () => clearTimeout(timer)
  }, [currentTrack, setCurrentTime, setDuration, play])

  // Control volume based on global state
  useEffect(() => {
    if (!audioRef.current) return
    audioRef.current.volume = isMuted ? 0 : volume
  }, [volume, isMuted])

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(e.target.value)
    setCurrentTime(newTime)
    if (audioRef.current) {
      audioRef.current.currentTime = newTime
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value)
    setVolume(newVolume)
  }

  const handleToggleMute = () => {
    setMuted(!isMuted)
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const formatTime = (time: number) => {
    if (isNaN(time) || time === 0) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  if (!isVisible || !currentTrack) {
    console.log('PortfolioBottomAudioPlayer hidden:', { isVisible, hasTrack: !!currentTrack })
    return null
  }

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ${
      isExpanded ? 'h-32' : 'h-20'
    }`}>
      {/* Audio element - always present when track is available */}
      <audio 
        ref={audioRef} 
        preload="metadata"
      />
      
      {/* Main Player Bar */}
      <div className={`${colors.background} bg-opacity-95 backdrop-blur-sm border-t border-white/20 shadow-lg h-full relative`}>
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none"></div>
        
        <div className="max-w-4xl mx-auto px-4 h-full relative z-10">
          {/* Compact Mode */}
          {!isExpanded && (
            <div className="flex flex-col h-full">
              {/* Main controls row */}
              <div className="flex items-center justify-between flex-1">
                {/* Track Info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <img
                    src={currentTrack.thumbnail_url}
                    alt={currentTrack.title}
                    className="w-10 h-10 rounded-lg object-cover flex-shrink-0 shadow-md"
                  />
                  <div className="min-w-0">
                    <h3 className={`${colors.text} font-medium truncate text-sm`}>{currentTrack.title}</h3>
                    {currentTrack.description && (
                      <p className={`${colors.text} opacity-70 text-xs truncate`}>{currentTrack.description}</p>
                    )}
                  </div>
                </div>

                {/* Playback Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={togglePlay}
                    className={`p-2 rounded-full transition-colors ${
                      isPlaying 
                        ? 'bg-white/20 text-white' 
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    {isPlaying ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </button>
                  
                  {/* Time Display */}
                  <div className={`${colors.text} text-xs font-mono hidden sm:block`}>
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </div>

                  {/* Volume Control */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={handleToggleMute}
                      className={`p-1 ${colors.text} opacity-70 hover:opacity-100 transition-opacity`}
                    >
                      {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-12 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer hidden md:block"
                    />
                  </div>

                  {/* Expand/Collapse */}
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className={`p-1 ${colors.text} opacity-70 hover:opacity-100 transition-opacity`}
                  >
                    <Maximize2 className="w-3 h-3" />
                  </button>

                  {/* Close */}
                  <button
                    onClick={handleClose}
                    className={`p-1 ${colors.text} opacity-70 hover:opacity-100 transition-opacity`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Progress bar in compact mode */}
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-400 transition-all duration-100"
                  style={{ 
                    width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` 
                  }}
                />
              </div>
            </div>
          )}

          {/* Expanded Mode */}
          {isExpanded && (
            <div className="flex flex-col h-full py-3">
              {/* Top Row - Track Info, Controls, and Volume */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <img
                    src={currentTrack.thumbnail_url}
                    alt={currentTrack.title}
                    className="w-14 h-14 rounded-lg object-cover flex-shrink-0 shadow-md"
                  />
                  <div className="min-w-0">
                    <h3 className={`${colors.text} font-semibold truncate`}>{currentTrack.title}</h3>
                    {currentTrack.description && (
                      <p className={`${colors.text} opacity-70 text-sm truncate`}>{currentTrack.description}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Volume Control */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleToggleMute}
                      className={`p-1 ${colors.text} opacity-70 hover:opacity-100 transition-opacity`}
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={isMuted ? 0 : volume}
                      onChange={handleVolumeChange}
                      className="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <button
                    onClick={togglePlay}
                    className={`p-2 rounded-full transition-colors ${
                      isPlaying 
                        ? 'bg-white/20 text-white' 
                        : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                  >
                    {isPlaying ? (
                      <Pause className="w-5 h-5" />
                    ) : (
                      <Play className="w-5 h-5" />
                    )}
                  </button>

                  <button
                    onClick={() => setIsExpanded(false)}
                    className={`p-2 ${colors.text} opacity-70 hover:opacity-100 transition-opacity`}
                  >
                    <Minimize2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={handleClose}
                    className={`p-2 ${colors.text} opacity-70 hover:opacity-100 transition-opacity`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="flex-1 flex flex-col justify-center">
                <div className="flex items-center gap-3">
                  <span className={`${colors.text} text-sm font-mono`}>{formatTime(currentTime)}</span>
                  <div className="flex-1 relative">
                    <input
                      type="range"
                      min="0"
                      max={duration || 0}
                      value={currentTime}
                      onChange={handleProgressChange}
                      className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, ${colors.primary} 0%, ${colors.primary} ${duration > 0 ? (currentTime / duration) * 100 : 0}%, rgba(255,255,255,0.2) ${duration > 0 ? (currentTime / duration) * 100 : 0}%, rgba(255,255,255,0.2) 100%)`
                      }}
                    />
                  </div>
                  <span className={`${colors.text} text-sm font-mono`}>{formatTime(duration)}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 