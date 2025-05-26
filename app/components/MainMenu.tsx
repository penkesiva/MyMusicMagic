'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  Bars3Icon,
  MusicalNoteIcon,
  MusicalNoteIcon as TrebleClefIcon,
  MusicalNoteIcon as BassClefIcon,
  MusicalNoteIcon as SharpIcon,
  MusicalNoteIcon as FlatIcon
} from '@heroicons/react/24/outline'

export function MainMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>()
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsOpen(true)
  }

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false)
    }, 300) // 300ms delay before closing
  }

  const handleLinkClick = (path: string) => {
    setIsOpen(false)
    router.push(path)
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <div 
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Menu button */}
      <button
        className="fixed top-4 right-4 z-50 p-2 bg-dark-200/80 rounded-lg text-white hover:bg-dark-300 transition-colors"
        aria-label="Main menu"
      >
        <Bars3Icon className="h-6 w-6" />
      </button>

      {/* Menu dropdown with extended hover area */}
      {isOpen && (
        <div
          ref={menuRef}
          className="fixed top-0 right-0 z-40 w-48 pt-16 pb-4 pr-4"
        >
          <nav className="bg-dark-200 rounded-lg shadow-lg overflow-hidden">
            <button
              onClick={() => handleLinkClick('/')}
              className="w-full flex items-center gap-1.5 px-3 py-1.5 text-sm text-white hover:bg-dark-300 transition-colors whitespace-nowrap"
            >
              <TrebleClefIcon className="h-4 w-4 text-primary-400" />
              <span>Home</span>
            </button>
            <button
              onClick={() => handleLinkClick('/gallery')}
              className="w-full flex items-center gap-1.5 px-3 py-1.5 text-sm text-white hover:bg-dark-300 transition-colors whitespace-nowrap"
            >
              <BassClefIcon className="h-4 w-4 text-primary-400" />
              <span>Gallery</span>
            </button>
            <button
              onClick={() => handleLinkClick('/quotes')}
              className="w-full flex items-center gap-1.5 px-3 py-1.5 text-sm text-white hover:bg-dark-300 transition-colors whitespace-nowrap"
            >
              <SharpIcon className="h-4 w-4 text-primary-400" />
              <span>Musical Quotes</span>
            </button>
            <button
              onClick={() => handleLinkClick('/contact')}
              className="w-full flex items-center gap-1.5 px-3 py-1.5 text-sm text-white hover:bg-dark-300 transition-colors whitespace-nowrap"
            >
              <FlatIcon className="h-4 w-4 text-primary-400" />
              <span>Post Me</span>
            </button>
          </nav>
        </div>
      )}
    </div>
  )
} 