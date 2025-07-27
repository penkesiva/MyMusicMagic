import type { Metadata } from 'next'
import { Inter, Montserrat, Merriweather, Playfair_Display, Source_Sans_3, Poppins, Roboto, Lato, Open_Sans, Raleway, Roboto_Slab, Nunito_Sans } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

// Font combinations for portfolio
const montserrat = Montserrat({ 
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap'
})

const merriweather = Merriweather({ 
  subsets: ['latin'],
  weight: ['300', '400', '700', '900'],
  variable: '--font-merriweather',
  display: 'swap'
})

const playfairDisplay = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair-display',
  display: 'swap'
})

const sourceSansPro = Source_Sans_3({ 
  subsets: ['latin'],
  variable: '--font-source-sans-pro',
  display: 'swap'
})

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap'
})

const roboto = Roboto({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-roboto',
  display: 'swap'
})

const lato = Lato({ 
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  variable: '--font-lato',
  display: 'swap'
})

const openSans = Open_Sans({ 
  subsets: ['latin'],
  variable: '--font-open-sans',
  display: 'swap'
})

const raleway = Raleway({ 
  subsets: ['latin'],
  variable: '--font-raleway',
  display: 'swap'
})

const robotoSlab = Roboto_Slab({ 
  subsets: ['latin'],
  variable: '--font-roboto-slab',
  display: 'swap'
})

// SF Pro fonts (system fonts, fallback to system-ui)
const sfProDisplay = { variable: '--font-sf-pro-display' }
const sfProText = { variable: '--font-sf-pro-text' }

// Raleway Thin variant
const ralewayThin = Raleway({ 
  subsets: ['latin'],
  weight: ['100', '200', '300'],
  variable: '--font-raleway-thin',
  display: 'swap'
})

const nunitoSans = Nunito_Sans({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-nunito-sans',
  display: 'swap'
})

export const metadata: Metadata = {
  title: 'Hero Portfolio - Showcase Your Heroic Work',
  description: 'Create stunning portfolios to showcase your heroic work. Professional templates, easy customization, and beautiful designs for creators, professionals, and anyone with a story to tell.',
  keywords: ['portfolio builder', 'heroic work', 'professional portfolio', 'creator showcase', 'work portfolio', 'achievement showcase'],
  authors: [{ name: 'Hero Portfolio' }],
  metadataBase: new URL('https://heroportfolio.com'),
  openGraph: {
    title: 'Hero Portfolio - Showcase Your Heroic Work',
    description: 'Create stunning portfolios to showcase your heroic work. Professional templates, easy customization, and beautiful designs for creators, professionals, and anyone with a story to tell.',
    type: 'website',
    locale: 'en_US',
    url: 'https://heroportfolio.com',
    siteName: 'Hero Portfolio',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Hero Portfolio - Showcase Your Heroic Work',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hero Portfolio - Showcase Your Heroic Work',
    description: 'Create stunning portfolios to showcase your heroic work. Professional templates, easy customization, and beautiful designs for creators, professionals, and anyone with a story to tell.',
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
      <body className={`${inter.className} h-full ${montserrat.variable} ${merriweather.variable} ${playfairDisplay.variable} ${sourceSansPro.variable} ${poppins.variable} ${roboto.variable} ${lato.variable} ${openSans.variable} ${raleway.variable} ${robotoSlab.variable} ${sfProDisplay.variable} ${sfProText.variable} ${ralewayThin.variable} ${nunitoSans.variable}`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
} 