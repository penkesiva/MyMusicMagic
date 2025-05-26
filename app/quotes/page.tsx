'use client'

import { useState, useEffect, useCallback } from 'react'

type Quote = {
  id: number
  text: string
  author: string
}

const quotes: Quote[] = [
  {
    id: 1,
    text: "Music is the divine way to tell beautiful, poetic things to the heart.",
    author: "Pablo Casals"
  },
  {
    id: 2,
    text: "Music is the language of the spirit. It opens the secret of life bringing peace, abolishing strife.",
    author: "Kahlil Gibran"
  },
  {
    id: 3,
    text: "Music is the strongest form of magic.",
    author: "Marilyn Manson"
  },
  {
    id: 4,
    text: "Music is the art which is most nigh to tears and memory.",
    author: "Oscar Wilde"
  },
  {
    id: 5,
    text: "Music is the poetry of the air.",
    author: "Jean Paul Richter"
  },
  {
    id: 6,
    text: "Music is the medicine of the mind.",
    author: "John A. Logan"
  },
  {
    id: 7,
    text: "Music is the universal language of mankind.",
    author: "Henry Wadsworth Longfellow"
  },
  {
    id: 8,
    text: "Music is the art of thinking with sounds.",
    author: "Jules Combarieu"
  },
  {
    id: 9,
    text: "Music is the shorthand of emotion.",
    author: "Leo Tolstoy"
  },
  {
    id: 10,
    text: "Music is the divine way to tell beautiful, poetic things to the heart.",
    author: "Pablo Casals"
  }
]

export default function QuotesPage() {
  const [currentQuote, setCurrentQuote] = useState<Quote | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const getRandomPosition = useCallback(() => {
    const x = Math.random() * (window.innerWidth - 400) // 400 is max quote width
    const y = Math.random() * (window.innerHeight - 200) // 200 is max quote height
    return { x, y }
  }, [])

  const showNextQuote = useCallback(() => {
    setIsVisible(false)
    setTimeout(() => {
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)]
      setCurrentQuote(randomQuote)
      setPosition(getRandomPosition())
      setIsVisible(true)
    }, 1000) // 1 second overlap
  }, [getRandomPosition])

  useEffect(() => {
    showNextQuote()
    const interval = setInterval(showNextQuote, 5000) // Show each quote for 5 seconds
    return () => clearInterval(interval)
  }, [showNextQuote])

  return (
    <div className="min-h-screen bg-dark-100 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark-200 to-dark-100" />

      {/* Quote display */}
      {currentQuote && (
        <div
          className={`fixed transition-all duration-1000 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
            maxWidth: '400px',
            transform: 'translate(-50%, -50%)'
          }}
        >
          <div className="bg-dark-200/90 backdrop-blur-sm rounded-lg p-6 shadow-xl">
            <p className="text-xl text-white mb-4 italic">
              "{currentQuote.text}"
            </p>
            <p className="text-right text-gray-400">
              — {currentQuote.author}
            </p>
          </div>
        </div>
      )}
    </div>
  )
} 