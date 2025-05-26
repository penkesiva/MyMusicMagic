'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { 
  MusicalNoteIcon, 
  MusicalNoteIcon as NoteIcon,
  MusicalNoteIcon as EighthNoteIcon,
  MusicalNoteIcon as QuarterNoteIcon,
  MusicalNoteIcon as HalfNoteIcon,
  MusicalNoteIcon as WholeNoteIcon
} from '@heroicons/react/24/outline'
import { HomeButton } from '@/app/components/HomeButton'

type Quote = {
  id: number
  text: string
  author: string
}

const quotes: Quote[] = [
  {
    id: 1,
    text: "If the sound of waves isn't your playlist at the beach, you're missing the essence.",
    author: "Unknown"
  },
  {
    id: 2,
    text: "Music is the divine way to tell beautiful, poetic things to the heart.",
    author: "Pablo Casals"
  },
  {
    id: 3,
    text: "Where words fail, music speaks.",
    author: "Hans Christian Andersen"
  },
  {
    id: 4,
    text: "Music is the strongest form of magic.",
    author: "Marilyn Manson"
  },
  {
    id: 5,
    text: "Music is the universal language of mankind.",
    author: "Henry Wadsworth Longfellow"
  }
]

// Music note animation component
function MusicNote({ delay, duration, startX, startY, isExiting, noteType }: { 
  delay: number; 
  duration: number; 
  startX: number; 
  startY: number;
  isExiting: boolean;
  noteType: 'eighth' | 'quarter' | 'half' | 'whole';
}) {
  const noteStyles = {
    eighth: { icon: EighthNoteIcon, color: 'text-white/40', size: 'h-5 w-5' },
    quarter: { icon: QuarterNoteIcon, color: 'text-gray-300/50', size: 'h-6 w-6' },
    half: { icon: HalfNoteIcon, color: 'text-white/60', size: 'h-7 w-7' },
    whole: { icon: WholeNoteIcon, color: 'text-gray-400/70', size: 'h-8 w-8' }
  }

  const { icon: NoteComponent, color, size } = noteStyles[noteType]

  return (
    <div
      className={`absolute transition-opacity duration-1000 ${color} ${
        isExiting ? 'opacity-0' : 'opacity-100'
      }`}
      style={{
        animation: `float ${duration}s ease-in-out ${delay}s ${isExiting ? 'forwards' : 'infinite'}`,
        left: `${startX}%`,
        top: `${startY}%`,
      }}
    >
      <NoteComponent className={size} />
    </div>
  )
}

export default function QuotesPage() {
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [musicNotes, setMusicNotes] = useState<Array<{
    id: number;
    delay: number;
    duration: number;
    startX: number;
    startY: number;
    isExiting: boolean;
    noteType: 'eighth' | 'quarter' | 'half' | 'whole';
  }>>([])
  const quoteRef = useRef<HTMLDivElement>(null)
  const noteIdRef = useRef(0)

  // Function to generate new music notes
  const generateMusicNotes = useCallback(() => {
    const noteTypes: Array<'eighth' | 'quarter' | 'half' | 'whole'> = ['eighth', 'quarter', 'half', 'whole']
    const newNotes = [...Array(12)].map(() => ({
      id: noteIdRef.current++,
      delay: Math.random() * 3,
      duration: 5 + Math.random() * 3,
      startX: Math.random() * 100,
      startY: Math.random() * 100,
      isExiting: false,
      noteType: noteTypes[Math.floor(Math.random() * noteTypes.length)]
    }))
    setMusicNotes(prev => [...prev, ...newNotes])
  }, [])

  // Function to fade out old notes
  const fadeOutOldNotes = useCallback(() => {
    setMusicNotes(prev => 
      prev.map(note => ({
        ...note,
        isExiting: true
      }))
    )
    // Start fading in new notes immediately while old ones are fading out
    setTimeout(() => {
      generateMusicNotes()
    }, 500) // Start new notes halfway through the fade out
  }, [generateMusicNotes])

  // Initialize music notes
  useEffect(() => {
    generateMusicNotes()
    const interval = setInterval(fadeOutOldNotes, 12000) // Change notes every 12 seconds
    return () => clearInterval(interval)
  }, [generateMusicNotes, fadeOutOldNotes])

  const getRandomPosition = useCallback(() => {
    if (!quoteRef.current) return { x: 0, y: 0 }

    const quoteWidth = 500 // increased from 400 to 500
    const quoteHeight = 200 // max quote height
    const padding = 20 // padding from screen edges

    // Calculate safe boundaries
    const maxX = window.innerWidth - quoteWidth - padding
    const maxY = window.innerHeight - quoteHeight - padding

    // Ensure we don't go below minimum values
    const x = Math.max(padding, Math.min(maxX, Math.random() * maxX))
    const y = Math.max(padding, Math.min(maxY, Math.random() * maxY))

    return { x, y }
  }, [])

  const showNextQuote = useCallback(() => {
    // Start fading out current quote
    setIsVisible(false)
    
    // After 500ms (halfway through fade out), start fading in new quote
    setTimeout(() => {
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)]
      setCurrentQuote(randomQuote)
      setPosition(getRandomPosition())
      setIsVisible(true)
    }, 500)
  }, [getRandomPosition])

  useEffect(() => {
    showNextQuote()
    const interval = setInterval(showNextQuote, 8000) // Show each quote for 8 seconds
    return () => clearInterval(interval)
  }, [showNextQuote])

  return (
    <div className="min-h-screen bg-dark-100 relative overflow-hidden">
      <HomeButton />
      
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark-200 to-dark-100" />

      {/* Animated music notes */}
      {musicNotes.map((note) => (
        <MusicNote
          key={note.id}
          delay={note.delay}
          duration={note.duration}
          startX={note.startX}
          startY={note.startY}
          isExiting={note.isExiting}
          noteType={note.noteType}
        />
      ))}

      {/* Quote display */}
      {currentQuote && (
        <div
          ref={quoteRef}
          className={`fixed transition-all duration-1000 ${
            isVisible 
              ? 'opacity-100 transform scale-100' 
              : 'opacity-0 transform scale-95'
          }`}
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            maxWidth: '500px', // increased from 400px to 500px
          }}
        >
          <div className="bg-dark-200/90 backdrop-blur-sm rounded-lg p-6 shadow-xl text-center">
            <p className="text-lg text-white/90 font-light leading-relaxed mb-4 italic">
              "{currentQuote.text}"
            </p>
            <p className="text-primary-400 text-sm font-medium">
              — {currentQuote.author}
            </p>
          </div>
        </div>
      )}
    </div>
  )
} 