'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Bars3Icon } from '@heroicons/react/24/outline'

export function MainMenu() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="fixed top-4 right-4 z-50 p-2 bg-dark-200/80 rounded-lg text-white hover:bg-dark-300 transition-colors"
        aria-label="Main menu"
      >
        <Bars3Icon className="h-6 w-6" />
      </button>

      {isOpen && (
        <div
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
          className="fixed top-16 right-4 z-50 w-48 bg-dark-200 rounded-lg shadow-lg overflow-hidden"
        >
          <nav className="py-2">
            <Link
              href="/gallery"
              className="block px-4 py-2 text-white hover:bg-dark-300 transition-colors"
            >
              Gallery
            </Link>
            <Link
              href="/quotes"
              className="block px-4 py-2 text-white hover:bg-dark-300 transition-colors"
            >
              Musical Quotes
            </Link>
            <Link
              href="/contact"
              className="block px-4 py-2 text-white hover:bg-dark-300 transition-colors"
            >
              Post Me
            </Link>
          </nav>
        </div>
      )}
    </div>
  )
} 