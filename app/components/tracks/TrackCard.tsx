'use client'

import { useState, useRef, useEffect } from "react"
import { Play, Pause, Info } from "lucide-react"
import Image from "next/image"
import { PortfolioTheme } from "@/lib/themes"
import { Database } from "@/types/database"

type Track = Database['public']['Tables']['tracks']['Row']

interface TrackCardProps {
  track: Track
  theme?: PortfolioTheme
  variant?: 'list' | 'grid'
  onPlay?: (track: Track) => void
  onInfo?: (track: Track) => void
  isPlaying?: boolean
}

export function TrackCard({ track, theme, variant = 'grid', onPlay, onInfo, isPlaying: externalIsPlaying }: TrackCardProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)
  
  // Use external isPlaying state if provided, otherwise use internal state
  const isPlayingState = externalIsPlaying !== undefined ? externalIsPlaying : isPlaying

  const togglePlay = () => {
    if (onPlay) {
      onPlay(track)
    } else {
      if (!audioRef.current) return
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleInfo = () => {
    if (onInfo) {
      onInfo(track)
    }
  }

  useEffect(() => {
    const audio = audioRef.current
    if (!audio || onPlay) return // Don't set up internal audio if external control is used

    const updateProgress = () => {
      setProgress((audio.currentTime / audio.duration) * 100)
    }

    const handleEnded = () => {
      setIsPlaying(false)
      setProgress(0)
    }

    audio.addEventListener('timeupdate', updateProgress)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', updateProgress)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [onPlay])

  // Default theme if none provided
  const defaultTheme: PortfolioTheme = {
    name: 'Default',
    colors: {
      background: 'bg-gray-900',
      text: 'text-gray-300',
      primary: 'text-blue-500',
      primaryStrong: 'text-blue-400',
      card: 'bg-gray-800',
      cardText: 'text-gray-300',
      heading: 'text-white',
      accent: 'text-blue-500'
    },
    previewColor: 'bg-gray-900'
  }

  const colors = theme?.colors || defaultTheme.colors;

  if (variant === 'list') {
    return (
      <div className={`flex items-center space-x-4 p-4 rounded-lg ${colors.card} transition-all duration-300 hover:shadow-lg`}>
        <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
          <Image 
            src={track.thumbnail_url} 
            alt={track.title}
            fill
            className="object-cover"
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className={`text-lg font-semibold ${colors.heading} truncate`}>{track.title}</h3>
          {track.description && <p className={`text-sm ${colors.cardText} truncate`}>{track.description}</p>}
        </div>

        <div className="flex items-center space-x-2">
          <button 
            onClick={togglePlay}
            className={`p-2 rounded-full transition-colors duration-200 ${colors.primary.replace('text-','hover:bg-')} hover:bg-opacity-20 ${colors.primary}`}
          >
            {isPlayingState ? <Pause size={16} /> : <Play size={16} />}
          </button>
          <button 
            onClick={handleInfo}
            className={`p-2 rounded-full transition-colors duration-200 ${colors.primary.replace('text-','hover:bg-')} hover:bg-opacity-20 ${colors.primary}`}
          >
            <Info size={16} />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`rounded-xl shadow-lg overflow-hidden transition-all duration-300 ${colors.card} hover:shadow-2xl hover:-translate-y-1`}>
      {!onPlay && <audio ref={audioRef} src={track.audio_url} preload="metadata"></audio>}
      
      <div className="relative aspect-square">
        <Image 
          src={track.thumbnail_url} 
          alt={track.title}
          fill
          className="object-cover"
        />
         <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
      </div>

      <div className="p-5">
        <h3 className={`text-xl font-bold ${colors.heading}`}>{track.title}</h3>
        {track.description && <p className={`mt-1 text-sm ${colors.cardText}`}>{track.description}</p>}

        {!onPlay && (
          <div className="mt-4">
            <div className="w-full h-1.5 bg-gray-600/50 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-200 ${colors.primary.replace('text-', 'bg-')}`}
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        <div className="mt-4 flex justify-between items-center">
          <button 
            onClick={togglePlay}
            className={`p-3 rounded-full transition-colors duration-200 ${colors.primary.replace('text-','hover:bg-')} hover:bg-opacity-20 ${colors.primary}`}
          >
            {isPlayingState ? <Pause size={20} /> : <Play size={20} />}
          </button>
          <button 
            onClick={handleInfo}
            className={`p-3 rounded-full transition-colors duration-200 ${colors.primary.replace('text-','hover:bg-')} hover:bg-opacity-20 ${colors.primary}`}
          >
            <Info size={20} />
          </button>
        </div>
      </div>
    </div>
  )
} 