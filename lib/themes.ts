export interface PortfolioTheme {
  name: string;
  colors: {
    background: string;
    text: string;
    primary: string;
    primaryStrong: string;
    card: string;
    cardText: string;
    heading: string;
    accent: string;
  };
  previewColor: string;
  isGradient?: boolean;
  gradientColors?: [string, string]; // [startColor, endColor]
}

export const THEMES = [
  {
    name: 'Music Maestro',
    previewColor: '#a78bfa', // purple-400
    isGradient: true,
    gradientColors: ['#581c87', '#7c3aed'], // purple-950 to purple-600
    colors: {
      background: 'bg-gradient-to-br from-purple-950 via-indigo-950 to-purple-900',
      text: 'text-purple-100',
      primary: 'text-purple-400',
      primaryStrong: 'text-purple-300',
      card: 'bg-purple-900/50 backdrop-blur-sm border border-purple-800/50',
      cardText: 'text-purple-200',
      heading: 'text-white',
      accent: 'text-amber-400'
    }
  },
  {
    name: 'Photo Gallery',
    previewColor: '#f87171', // red-400
    isGradient: true,
    gradientColors: ['#7f1d1d', '#dc2626'], // red-950 to red-600
    colors: {
      background: 'bg-gradient-to-br from-red-950 via-red-900 to-red-800',
      text: 'text-red-100',
      primary: 'text-red-400',
      primaryStrong: 'text-red-300',
      card: 'bg-red-900/50 backdrop-blur-sm border border-red-800/50',
      cardText: 'text-red-200',
      heading: 'text-white',
      accent: 'text-amber-400'
    }
  },
  {
    name: 'Ocean Blue',
    previewColor: '#1e40af', // blue-800
    isGradient: true,
    gradientColors: ['#1e3a8a', '#3b82f6'], // blue-950 to blue-500
    colors: {
      background: 'bg-gradient-to-br from-blue-950 via-indigo-950 to-blue-900',
      text: 'text-blue-100',
      primary: 'text-blue-400',
      primaryStrong: 'text-blue-300',
      card: 'bg-blue-900/50 backdrop-blur-sm border border-blue-800/50',
      cardText: 'text-blue-200',
      heading: 'text-white',
      accent: 'text-blue-500'
    }
  },
  {
    name: 'Midnight Dusk-light',
    previewColor: '#2C3E50', // accent color
    isGradient: false,
    colors: {
      background: 'bg-[#F0F3F5]',
      text: 'text-[#1A2025]',
      primary: 'text-[#2C3E50]',
      primaryStrong: 'text-[#243240]',
      card: 'bg-[#E1E6EB]',
      cardText: 'text-[#5A636C]',
      heading: 'text-[#1A2025]',
      accent: 'text-[#2C3E50]'
    }
  },
  {
    name: 'Sunset Rose-light',
    previewColor: '#E5989B', // accent color
    isGradient: false,
    colors: {
      background: 'bg-[#FFF2F2]',
      text: 'text-[#3A2E2F]',
      primary: 'text-[#E5989B]',
      primaryStrong: 'text-[#CC7F81]',
      card: 'bg-[#FFE6E6]',
      cardText: 'text-[#7D6A6C]',
      heading: 'text-[#3A2E2F]',
      accent: 'text-[#E5989B]'
    }
  },
  {
    name: 'Royal Purple-light',
    previewColor: '#6A0DAD', // accent color
    isGradient: false,
    colors: {
      background: 'bg-[#F5F0FA]',
      text: 'text-[#2F1D3E]',
      primary: 'text-[#6A0DAD]',
      primaryStrong: 'text-[#590BA0]',
      card: 'bg-[#E9E1F5]',
      cardText: 'text-[#77618A]',
      heading: 'text-[#2F1D3E]',
      accent: 'text-[#6A0DAD]'
    }
  },
  {
    name: 'Golden Hour-light',
    previewColor: '#F1C40F', // accent color
    isGradient: false,
    colors: {
      background: 'bg-[#FFFBEA]',
      text: 'text-[#3A3300]',
      primary: 'text-[#F1C40F]',
      primaryStrong: 'text-[#D4AC0D]',
      card: 'bg-[#FFF8D1]',
      cardText: 'text-[#7D7200]',
      heading: 'text-[#3A3300]',
      accent: 'text-[#F1C40F]'
    }
  },
  {
    name: 'Emerald Forest-light',
    previewColor: '#2E8B57', // accent color
    isGradient: false,
    colors: {
      background: 'bg-[#EDF8F1]',
      text: 'text-[#193522]',
      primary: 'text-[#2E8B57]',
      primaryStrong: 'text-[#277046]',
      card: 'bg-[#DBF2E3]',
      cardText: 'text-[#5A755F]',
      heading: 'text-[#193522]',
      accent: 'text-[#2E8B57]'
    }
  },
  {
    name: 'Lime Fresh-light',
    previewColor: '#A4C639', // accent color
    isGradient: false,
    colors: {
      background: 'bg-[#F7FAE8]',
      text: 'text-[#3A3D16]',
      primary: 'text-[#A4C639]',
      primaryStrong: 'text-[#8EAF34]',
      card: 'bg-[#EEF5D1]',
      cardText: 'text-[#767A4A]',
      heading: 'text-[#3A3D16]',
      accent: 'text-[#A4C639]'
    }
  },
  {
    name: 'Classic Gray-light',
    previewColor: '#7F8C8D', // accent color
    isGradient: false,
    colors: {
      background: 'bg-[#F5F7F7]',
      text: 'text-[#2C3A3B]',
      primary: 'text-[#7F8C8D]',
      primaryStrong: 'text-[#6B7A7B]',
      card: 'bg-[#EBEFF0]',
      cardText: 'text-[#5A696A]',
      heading: 'text-[#2C3A3B]',
      accent: 'text-[#7F8C8D]'
    }
  },
  {
    name: 'Stone Elegance-light',
    previewColor: '#95A5A6', // accent color
    isGradient: false,
    colors: {
      background: 'bg-[#F2F4F4]',
      text: 'text-[#2B3334]',
      primary: 'text-[#95A5A6]',
      primaryStrong: 'text-[#7D8C8D]',
      card: 'bg-[#E6EAEB]',
      cardText: 'text-[#5D6A6B]',
      heading: 'text-[#2B3334]',
      accent: 'text-[#95A5A6]'
    }
  },
  {
    name: 'Navy & Coral',
    previewColor: '#FF6F61', // coral accent
    isGradient: false,
    colors: {
      background: 'bg-[#001F3F]',
      text: 'text-[#B0B8C1]',
      primary: 'text-white',
      primaryStrong: 'text-white',
      card: 'bg-[#0A2747]',
      cardText: 'text-[#B0B8C1]',
      heading: 'text-white',
      accent: 'text-[#FF6F61]'
    }
  },
  {
    name: 'White & Teal',
    previewColor: '#008080', // teal accent
    isGradient: false,
    colors: {
      background: 'bg-[#FFFFFF]',
      text: 'text-[#7A7A7A]',
      primary: 'text-[#333333]',
      primaryStrong: 'text-[#333333]',
      card: 'bg-[#F0F8F8]',
      cardText: 'text-[#7A7A7A]',
      heading: 'text-[#333333]',
      accent: 'text-[#008080]'
    }
  },
  {
    name: 'Light Gray & Mustard',
    previewColor: '#D4A32A', // mustard accent
    isGradient: false,
    colors: {
      background: 'bg-[#F5F5F5]',
      text: 'text-[#6E6E6E]',
      primary: 'text-[#2E2E2E]',
      primaryStrong: 'text-[#2E2E2E]',
      card: 'bg-[#FFFFFF]',
      cardText: 'text-[#6E6E6E]',
      heading: 'text-[#2E2E2E]',
      accent: 'text-[#D4A32A]'
    }
  },
  {
    name: 'Black & Lime',
    previewColor: '#A4C639', // lime accent
    isGradient: false,
    colors: {
      background: 'bg-[#000000]',
      text: 'text-[#8A8A8A]',
      primary: 'text-[#E0E0E0]',
      primaryStrong: 'text-[#E0E0E0]',
      card: 'bg-[#1A1A1A]',
      cardText: 'text-[#8A8A8A]',
      heading: 'text-[#E0E0E0]',
      accent: 'text-[#A4C639]'
    }
  },
  {
    name: 'White & Electric Blue',
    previewColor: '#007BFF', // electric blue accent
    isGradient: false,
    colors: {
      background: 'bg-[#FFFFFF]',
      text: 'text-[#666666]',
      primary: 'text-[#1A1A1A]',
      primaryStrong: 'text-[#1A1A1A]',
      card: 'bg-[#F2F8FF]',
      cardText: 'text-[#666666]',
      heading: 'text-[#1A1A1A]',
      accent: 'text-[#007BFF]'
    }
  },
  {
    name: 'Midnight & Gold',
    previewColor: '#F1C40F', // gold accent
    isGradient: false,
    colors: {
      background: 'bg-[#2C3E50]',
      text: 'text-[#B0BEC5]',
      primary: 'text-[#ECF0F1]',
      primaryStrong: 'text-[#ECF0F1]',
      card: 'bg-[#354B5E]',
      cardText: 'text-[#B0BEC5]',
      heading: 'text-[#ECF0F1]',
      accent: 'text-[#F1C40F]'
    }
  },
  {
    name: 'Cream & Blush',
    previewColor: '#E5989B', // blush accent
    isGradient: false,
    colors: {
      background: 'bg-[#FFF9F2]',
      text: 'text-[#8C8C8C]',
      primary: 'text-[#4A4A4A]',
      primaryStrong: 'text-[#4A4A4A]',
      card: 'bg-[#FFF4EC]',
      cardText: 'text-[#8C8C8C]',
      heading: 'text-[#4A4A4A]',
      accent: 'text-[#E5989B]'
    }
  },
  {
    name: 'Teal & Salmon',
    previewColor: '#FF8C94', // salmon accent
    isGradient: false,
    colors: {
      background: 'bg-[#006D77]',
      text: 'text-[#CED4D6]',
      primary: 'text-[#FAF9F9]',
      primaryStrong: 'text-[#FAF9F9]',
      card: 'bg-[#0A7A83]',
      cardText: 'text-[#CED4D6]',
      heading: 'text-[#FAF9F9]',
      accent: 'text-[#FF8C94]'
    }
  },
  {
    name: 'Mint & Coral',
    previewColor: '#FF6B6B', // coral accent
    isGradient: false,
    colors: {
      background: 'bg-[#E0F2F1]',
      text: 'text-[#546C72]',
      primary: 'text-[#263238]',
      primaryStrong: 'text-[#263238]',
      card: 'bg-[#D1EBE9]',
      cardText: 'text-[#546C72]',
      heading: 'text-[#263238]',
      accent: 'text-[#FF6B6B]'
    }
  },
  {
    name: 'White & Vibrant Purple',
    previewColor: '#9B59B6', // vibrant purple accent
    isGradient: false,
    colors: {
      background: 'bg-[#FFFFFF]',
      text: 'text-[#777777]',
      primary: 'text-[#333333]',
      primaryStrong: 'text-[#333333]',
      card: 'bg-[#F5F0FA]',
      cardText: 'text-[#777777]',
      heading: 'text-[#333333]',
      accent: 'text-[#9B59B6]'
    }
  }
]; 