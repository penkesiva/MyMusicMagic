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
}

export const THEMES = [
  {
    name: 'Music Maestro',
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
    name: 'Midnight Dusk',
    colors: {
      background: 'bg-gray-900',
      text: 'text-gray-300',
      primary: 'text-blue-400',
      primaryStrong: 'text-blue-300',
      card: 'bg-gray-800',
      cardText: 'text-gray-300',
      heading: 'text-white',
      accent: 'text-blue-500'
    }
  },
  {
    name: 'Ocean Blue',
    colors: {
      background: 'bg-slate-900',
      text: 'text-slate-300',
      primary: 'text-sky-400',
      primaryStrong: 'text-sky-300',
      card: 'bg-slate-800',
      cardText: 'text-slate-300',
      heading: 'text-white',
      accent: 'text-sky-500'
    }
  },
  {
    name: 'Sunset Rose',
    colors: {
      background: 'bg-rose-950',
      text: 'text-rose-100',
      primary: 'text-rose-400',
      primaryStrong: 'text-rose-300',
      card: 'bg-rose-900',
      cardText: 'text-rose-200',
      heading: 'text-white',
      accent: 'text-rose-500'
    }
  },
  {
    name: 'Royal Purple',
    colors: {
      background: 'bg-violet-950',
      text: 'text-violet-100',
      primary: 'text-violet-400',
      primaryStrong: 'text-violet-300',
      card: 'bg-violet-900',
      cardText: 'text-violet-200',
      heading: 'text-white',
      accent: 'text-violet-500'
    }
  },
  {
    name: 'Golden Hour',
    colors: {
      background: 'bg-amber-950',
      text: 'text-amber-100',
      primary: 'text-amber-400',
      primaryStrong: 'text-amber-300',
      card: 'bg-amber-900',
      cardText: 'text-amber-200',
      heading: 'text-white',
      accent: 'text-amber-500'
    }
  },
  {
    name: 'Emerald Forest',
    colors: {
      background: 'bg-teal-950',
      text: 'text-teal-100',
      primary: 'text-teal-400',
      primaryStrong: 'text-teal-300',
      card: 'bg-teal-900',
      cardText: 'text-teal-200',
      heading: 'text-white',
      accent: 'text-teal-500'
    }
  },
  {
    name: 'Lime Fresh',
    colors: {
      background: 'bg-lime-950',
      text: 'text-lime-100',
      primary: 'text-lime-400',
      primaryStrong: 'text-lime-300',
      card: 'bg-lime-900',
      cardText: 'text-lime-200',
      heading: 'text-white',
      accent: 'text-lime-500'
    }
  },
  {
    name: 'Classic Gray',
    colors: {
      background: 'bg-gray-800',
      text: 'text-gray-200',
      primary: 'text-white',
      primaryStrong: 'text-white',
      card: 'bg-gray-700',
      cardText: 'text-gray-200',
      heading: 'text-white',
      accent: 'text-gray-400'
    }
  },
  {
    name: 'Stone Elegance',
    colors: {
      background: 'bg-stone-900',
      text: 'text-stone-300',
      primary: 'text-stone-100',
      primaryStrong: 'text-white',
      card: 'bg-stone-800',
      cardText: 'text-stone-300',
      heading: 'text-white',
      accent: 'text-stone-400'
    }
  }
]; 