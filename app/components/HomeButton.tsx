'use client'

import Link from 'next/link'
import { MusicalNoteIcon } from '@heroicons/react/24/outline'

export function HomeButton() {
  return (
    <Link 
      href="/"
      className="fixed top-4 left-4 z-50 p-2 bg-dark-200/80 rounded-lg text-white 
        hover:bg-dark-300 transition-colors group flex items-center gap-2"
      aria-label="Return to home"
    >
      <MusicalNoteIcon className="h-5 w-5 text-primary-400 group-hover:animate-bounce" />
      <span className="text-sm font-medium">Home</span>
    </Link>
  )
} 