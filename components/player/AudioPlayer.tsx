import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute } from 'react-icons/fa'
import { Database } from '@/types/database'

type Track = Database['public']['Tables']['tracks']['Row']

interface AudioPlayerProps {
  track: Track
  isPlaying: boolean
  onPlayPause: () => void
  onTrackEnd: () => void
}

export const AudioPlayer = ({
  track,
  isPlaying,
  onPlayPause,
  onTrackEnd,
}: AudioPlayerProps) => {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateProgress = () => {
      setProgress((audio.currentTime / audio.duration) * 100)
    }

    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
    }

    audio.addEventListener('timeupdate', updateProgress)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('ended', onTrackEnd)

    return () => {
      audio.removeEventListener('timeupdate', updateProgress)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('ended', onTrackEnd)
    }
  }, [onTrackEnd])

  useEffect(() => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.play()
    } else {
      audioRef.current.pause()
    }
  }, [isPlaying])

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = Number(e.target.value)
    setProgress(newProgress)
    if (audioRef.current) {
      audioRef.current.currentTime = (newProgress / 100) * duration
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value)
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
      setIsMuted(newVolume === 0)
    }
  }

  const toggleMute = () => {
    if (!audioRef.current) return
    const newMuted = !isMuted
    setIsMuted(newMuted)
    audioRef.current.volume = newMuted ? 0 : volume
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-dark-200 rounded-lg p-4 shadow-lg">
      <audio ref={audioRef} src={track.audio_url} />
      
      <div className="flex items-center space-x-4">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-16 h-16 rounded-lg overflow-hidden"
        >
          <img
            src={track.thumbnail_url}
            alt={track.title}
            className="w-full h-full object-cover"
          />
        </motion.div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white">{track.title}</h3>
          
          <div className="flex items-center space-x-2 mt-2">
            <button
              onClick={onPlayPause}
              className="p-2 rounded-full bg-primary-500 hover:bg-primary-600 transition-colors"
            >
              {isPlaying ? (
                <FaPause className="text-white" />
              ) : (
                <FaPlay className="text-white" />
              )}
            </button>

            <div className="flex-1">
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={handleProgressChange}
                className="w-full h-1 bg-dark-300 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={toggleMute}
                className="p-2 rounded-full hover:bg-dark-300 transition-colors"
              >
                {isMuted ? (
                  <FaVolumeMute className="text-white" />
                ) : (
                  <FaVolumeUp className="text-white" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="w-20 h-1 bg-dark-300 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <span className="text-sm text-gray-400">
              {formatTime((progress / 100) * duration)} / {formatTime(duration)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
} 