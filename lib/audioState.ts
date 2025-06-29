import { create } from 'zustand'
import { Database } from '@/types/database'

type Track = Database['public']['Tables']['tracks']['Row']

interface AudioState {
  currentTrack: Track | null
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isMuted: boolean
  
  // Actions
  setTrack: (track: Track | null) => void
  play: () => void
  pause: () => void
  togglePlay: () => void
  setCurrentTime: (time: number) => void
  setDuration: (duration: number) => void
  setVolume: (volume: number) => void
  setMuted: (muted: boolean) => void
  reset: () => void
}

export const useAudioStore = create<AudioState>((set: any, get: any) => ({
  currentTrack: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 1,
  isMuted: false,

  setTrack: (track: Track | null) => {
    set({ 
      currentTrack: track, 
      currentTime: 0, 
      duration: 0,
      isPlaying: false
    })
  },

  play: () => set({ isPlaying: true }),
  
  pause: () => set({ isPlaying: false }),
  
  togglePlay: () => {
    const { isPlaying, currentTrack } = get()
    if (currentTrack) {
      set({ isPlaying: !isPlaying })
    }
  },

  setCurrentTime: (time: number) => set({ currentTime: time }),
  
  setDuration: (duration: number) => set({ duration }),
  
  setVolume: (volume: number) => set({ volume, isMuted: volume === 0 }),
  
  setMuted: (muted: boolean) => set({ isMuted: muted }),
  
  reset: () => set({
    currentTrack: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isMuted: false
  })
}))

// Helper function to play a track
export const playTrack = (track: Track) => {
  const store = useAudioStore.getState()
  
  if (store.currentTrack?.id === track.id) {
    // Same track - toggle play/pause
    store.togglePlay()
  } else {
    // New track - start playing
    store.setTrack(track)
  }
} 