import { motion } from 'framer-motion'
import { FaPlay, FaInfoCircle } from 'react-icons/fa'
import { Database } from '@/types/database'

type Track = Database['public']['Tables']['tracks']['Row']

interface TrackCardProps {
  track: Track
  variant: 'list' | 'grid'
  onPlay: (track: Track) => void
  onInfo: (track: Track) => void
  isPlaying?: boolean
}

export const TrackCard = ({ track, variant, onPlay, onInfo, isPlaying = false }: TrackCardProps) => {
  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  if (variant === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center space-x-4 p-4 bg-dark-200 rounded-lg hover:bg-dark-300 transition-colors"
      >
        <div className="w-16 h-16 rounded-lg overflow-hidden relative group">
          <img
            src={track.thumbnail_url}
            alt={track.title}
            className="w-full h-full object-cover"
          />
          <button
            onClick={() => onPlay(track)}
            className={`absolute inset-0 flex items-center justify-center transition-opacity ${
              isPlaying ? 'bg-black bg-opacity-50 opacity-100' : 'bg-black bg-opacity-50 opacity-0 group-hover:opacity-100'
            }`}
          >
            <FaPlay className="text-white text-xl" />
          </button>
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-semibold text-white">{track.title}</h3>
          {track.description && (
            <p className="text-sm text-gray-400 mt-1">{track.description}</p>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-400">
            {formatDuration(track.duration)}
          </span>
          <button
            onClick={() => onInfo(track)}
            className="p-2 rounded-full hover:bg-dark-400 transition-colors"
          >
            <FaInfoCircle className="text-white" />
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative aspect-square rounded-lg overflow-hidden group"
    >
      <img
        src={track.thumbnail_url}
        alt={track.title}
        className="w-full h-full object-cover"
      />
      
      <div className={`absolute inset-0 bg-gradient-to-t from-black/80 to-transparent transition-opacity ${
        isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
      }`}>
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-lg font-semibold text-white mb-2">{track.title}</h3>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">
              {formatDuration(track.duration)}
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onPlay(track)}
                className="p-2 rounded-full bg-primary-500 hover:bg-primary-600 transition-colors"
              >
                <FaPlay className="text-white" />
              </button>
              <button
                onClick={() => onInfo(track)}
                className="p-2 rounded-full bg-dark-400 hover:bg-dark-500 transition-colors"
              >
                <FaInfoCircle className="text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
} 