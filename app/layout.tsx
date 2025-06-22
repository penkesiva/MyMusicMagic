import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'My Music Magic',
  description: 'A showcase of musical compositions and artistic journey.',
  keywords: ['music', 'composer', 'artist', 'portfolio', 'showcase'],
  authors: [{ name: 'Your Name' }],
  openGraph: {
    title: 'My Music Magic',
    description: 'A showcase of musical compositions and artistic journey.',
    type: 'website',
    locale: 'en_US',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'My Music Magic',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'My Music Magic',
    description: 'A showcase of musical compositions and artistic journey.',
    images: ['/og-image.jpg'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
} 