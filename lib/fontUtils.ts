export interface FontPair {
  id: string
  name: string
  heading: string
  body: string
  preview: string
}

export const FONT_PAIRS: FontPair[] = [
  {
    id: 'montserrat-merriweather',
    name: 'Montserrat & Merriweather',
    heading: 'Montserrat',
    body: 'Merriweather',
    preview: 'Clean & Readable'
  },
  {
    id: 'playfair-source-sans',
    name: 'Playfair Display & Source Sans Pro',
    heading: 'Playfair Display',
    body: 'Source Sans Pro',
    preview: 'Elegant & Modern'
  },
  {
    id: 'poppins-roboto',
    name: 'Poppins & Roboto',
    heading: 'Poppins',
    body: 'Roboto',
    preview: 'Modern & Versatile'
  },
  {
    id: 'lato-open-sans',
    name: 'Lato & Open Sans',
    heading: 'Lato',
    body: 'Open Sans',
    preview: 'Friendly & Clear'
  },
  {
    id: 'raleway-roboto-slab',
    name: 'Raleway & Roboto Slab',
    heading: 'Raleway',
    body: 'Roboto Slab',
    preview: 'Stylish & Solid'
  }
]

export function getFontClasses(fontPairId: string) {
  const fontPair = FONT_PAIRS.find(pair => pair.id === fontPairId) || FONT_PAIRS[0]
  
  const headingClass = getHeadingFontClass(fontPair.heading)
  const bodyClass = getBodyFontClass(fontPair.body)
  
  return {
    heading: headingClass,
    body: bodyClass,
    fontPair
  }
}

function getHeadingFontClass(fontName: string): string {
  switch (fontName) {
    case 'Montserrat':
      return 'font-montserrat'
    case 'Playfair Display':
      return 'font-playfair-display'
    case 'Poppins':
      return 'font-poppins'
    case 'Lato':
      return 'font-lato'
    case 'Raleway':
      return 'font-raleway'
    default:
      return 'font-montserrat'
  }
}

function getBodyFontClass(fontName: string): string {
  switch (fontName) {
    case 'Merriweather':
      return 'font-merriweather'
    case 'Source Sans Pro':
      return 'font-source-sans-pro'
    case 'Roboto':
      return 'font-roboto'
    case 'Open Sans':
      return 'font-open-sans'
    case 'Roboto Slab':
      return 'font-roboto-slab'
    default:
      return 'font-merriweather'
  }
} 