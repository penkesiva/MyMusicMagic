import { Portfolio } from "@/types/portfolio";
import { SECTIONS_CONFIG } from "@/lib/sections";

// Font pair configurations
export const FONT_PAIRS = {
  'sf-pro': {
    heading: 'font-sf-pro-display',
    body: 'font-sf-pro-text'
  },
  'montserrat-merriweather': {
    heading: 'font-montserrat',
    body: 'font-merriweather'
  },
  'playfair-source': {
    heading: 'font-playfair-display',
    body: 'font-source-sans-pro'
  },
  'poppins-roboto': {
    heading: 'font-poppins',
    body: 'font-roboto'
  },
  'lato-open-sans': {
    heading: 'font-lato',
    body: 'font-open-sans'
  },
  'raleway-roboto-slab': {
    heading: 'font-raleway',
    body: 'font-roboto-slab'
  },
  'raleway-thin-nunito': {
    heading: 'font-raleway-thin',
    body: 'font-nunito-sans'
  }
} as const;

export const getFontClasses = (fontPair: string | null | undefined) => {
  if (!fontPair || !FONT_PAIRS[fontPair as keyof typeof FONT_PAIRS]) {
    return {
      heading: 'font-sf-pro-display',
      body: 'font-sf-pro-text'
    };
  }
  return FONT_PAIRS[fontPair as keyof typeof FONT_PAIRS];
};

export const safeGetArray = (field: any): any[] => {
  if (!field) return [];
  if (Array.isArray(field)) return field;
  if (typeof field === 'string') {
    try {
      const parsed = JSON.parse(field);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

export const getSectionTitle = (sectionKey: string, portfolio: Portfolio | null): string => {
  if (!portfolio?.sections_config) return SECTIONS_CONFIG[sectionKey]?.defaultName || sectionKey;
  
  const sectionConfig = (portfolio.sections_config as any)?.[sectionKey];
  if (!sectionConfig) return SECTIONS_CONFIG[sectionKey]?.defaultName || sectionKey;
  
  // Check for custom title first
  if (sectionConfig.title) return sectionConfig.title;
  
  // Fallback to name field
  if (sectionConfig.name) return sectionConfig.name;
  
  // Final fallback to default
  return SECTIONS_CONFIG[sectionKey]?.defaultName || sectionKey;
};

export const getSortedEditorSections = (portfolio: Portfolio | null): string[] => {
  if (!portfolio?.sections_config) return [];
  
  // Get all sections that should be shown in editor
  const editorSections = Object.keys(SECTIONS_CONFIG);
  
  // Separate enabled and disabled sections
  const enabledSections: string[] = [];
  const disabledSections: string[] = [];
  
  editorSections.forEach(sectionKey => {
    const isEnabled = (portfolio.sections_config as any)?.[sectionKey]?.enabled ?? SECTIONS_CONFIG[sectionKey]?.defaultEnabled ?? false;
    const order = (portfolio.sections_config as any)?.[sectionKey]?.order ?? SECTIONS_CONFIG[sectionKey]?.defaultOrder ?? 999;
    
    const sectionInfo = { key: sectionKey, order };
    
    if (isEnabled) {
      enabledSections.push(sectionKey);
    } else {
      disabledSections.push(sectionKey);
    }
  });
  
  // Sort enabled sections by order (Hero always first)
  enabledSections.sort((a, b) => {
    if (a === 'hero') return -1;
    if (b === 'hero') return 1;
    
    const orderA = (portfolio.sections_config as any)?.[a]?.order ?? SECTIONS_CONFIG[a]?.defaultOrder ?? 999;
    const orderB = (portfolio.sections_config as any)?.[b]?.order ?? SECTIONS_CONFIG[b]?.defaultOrder ?? 999;
    return orderA - orderB;
  });
  
  // Sort disabled sections by order
  disabledSections.sort((a, b) => {
    const orderA = (portfolio.sections_config as any)?.[a]?.order ?? SECTIONS_CONFIG[a]?.defaultOrder ?? 999;
    const orderB = (portfolio.sections_config as any)?.[b]?.order ?? SECTIONS_CONFIG[b]?.defaultOrder ?? 999;
    return orderA - orderB;
  });
  
  // Ensure footer is always at the very end in both enabled and disabled sections
  const enabledWithoutFooter = enabledSections.filter(section => section !== 'footer');
  const disabledWithoutFooter = disabledSections.filter(section => section !== 'footer');
  const footerSection = (enabledSections.includes('footer') || disabledSections.includes('footer')) ? ['footer'] : [];
  
  // Return enabled sections first, then disabled sections, with footer always at the end
  return [...enabledWithoutFooter, ...disabledWithoutFooter, ...footerSection];
};

export const getSortedRenderSections = (portfolio: Portfolio | null): string[] => {
  if (!portfolio?.sections_config) return [];
  
  // Get all sections including footer for rendering
  const allSections = Object.keys(SECTIONS_CONFIG);
  
  // Only include enabled sections for rendering
  const enabledSections: string[] = [];
  
  allSections.forEach(sectionKey => {
    const isEnabled = (portfolio.sections_config as any)?.[sectionKey]?.enabled ?? SECTIONS_CONFIG[sectionKey]?.defaultEnabled ?? false;
    
    if (isEnabled) {
      enabledSections.push(sectionKey);
    }
  });
  
  // Sort enabled sections by order (Hero always first)
  enabledSections.sort((a, b) => {
    if (a === 'hero') return -1;
    if (b === 'hero') return 1;
    
    const orderA = (portfolio.sections_config as any)?.[a]?.order ?? SECTIONS_CONFIG[a]?.defaultOrder ?? 999;
    const orderB = (portfolio.sections_config as any)?.[b]?.order ?? SECTIONS_CONFIG[b]?.defaultOrder ?? 999;
    return orderA - orderB;
  });
  
  // Always include footer if it's not already in the enabled sections
  if (!enabledSections.includes('footer')) {
    enabledSections.push('footer');
  }
  
  // Ensure footer is always at the very end
  const sectionsWithoutFooter = enabledSections.filter(section => section !== 'footer');
  const footerSection = enabledSections.includes('footer') ? ['footer'] : [];
  
  // Return enabled sections with footer always at the end
  return [...sectionsWithoutFooter, ...footerSection];
}; 

// Smart theme and font selection utilities
export const getSmartThemeSelection = (prompt: string, profession?: string): string => {
  const lowerPrompt = prompt.toLowerCase();
  const lowerProfession = profession?.toLowerCase() || '';

  // Music and creative arts
  if (lowerPrompt.includes('music') || lowerPrompt.includes('musician') || lowerPrompt.includes('composer') || 
      lowerProfession.includes('music') || lowerProfession.includes('artist')) {
    return ['Deep Ocean', 'Crimson Sunset', 'White & Vibrant Purple', 'Navy & Coral'][Math.floor(Math.random() * 4)];
  }

  // Photography and visual arts
  if (lowerPrompt.includes('photography') || lowerPrompt.includes('photographer') || lowerPrompt.includes('visual') ||
      lowerProfession.includes('photography') || lowerProfession.includes('designer')) {
    return ['Crimson Sunset', 'Deep Ocean', 'Golden Hour-dark'][Math.floor(Math.random() * 3)];
  }

  // Technology and development
  if (lowerPrompt.includes('developer') || lowerPrompt.includes('programmer') || lowerPrompt.includes('tech') ||
      lowerProfession.includes('developer') || lowerProfession.includes('engineer')) {
    return ['Deep Ocean', 'Black & Lime', 'White & Electric Blue'][Math.floor(Math.random() * 3)];
  }

  // Writing and content creation
  if (lowerPrompt.includes('writer') || lowerPrompt.includes('content') || lowerPrompt.includes('blog') ||
      lowerProfession.includes('writer') || lowerProfession.includes('author')) {
    return ['Midnight Dusk-dark', 'Classic Gray-dark', 'Stone Elegance-dark'][Math.floor(Math.random() * 3)];
  }

  // Education and academia
  if (lowerPrompt.includes('teacher') || lowerPrompt.includes('professor') || lowerPrompt.includes('academic') ||
      lowerProfession.includes('educator') || lowerProfession.includes('professor')) {
    return ['Deep Ocean', 'Classic Gray-light', 'Emerald Forest-light'][Math.floor(Math.random() * 3)];
  }

  // Students
  if (lowerPrompt.includes('student') || lowerPrompt.includes('learning') || lowerProfession.includes('student')) {
    return ['Lime Fresh-light', 'White & Electric Blue', 'Cream & Blush'][Math.floor(Math.random() * 3)];
  }

  // Corporate and business
  if (lowerPrompt.includes('business') || lowerPrompt.includes('corporate') || lowerPrompt.includes('professional') ||
      lowerProfession.includes('manager') || lowerProfession.includes('executive')) {
    return ['Classic Gray-dark', 'Midnight Dusk-dark', 'Stone Elegance-dark'][Math.floor(Math.random() * 3)];
  }

  // Warm and friendly
  if (lowerPrompt.includes('friendly') || lowerPrompt.includes('warm') || lowerPrompt.includes('caring') ||
      lowerProfession.includes('counselor') || lowerProfession.includes('therapist')) {
    return ['Sunset Rose-light', 'Golden Hour-light', 'Cream & Blush'][Math.floor(Math.random() * 3)];
  }

  // Modern and minimalist
  if (lowerPrompt.includes('minimal') || lowerPrompt.includes('clean') || lowerPrompt.includes('modern') ||
      lowerProfession.includes('designer')) {
    return ['White & Teal', 'White & Electric Blue', 'Classic Gray-light'][Math.floor(Math.random() * 3)];
  }

  // Bold and energetic
  if (lowerPrompt.includes('bold') || lowerPrompt.includes('energetic') || lowerPrompt.includes('dynamic') ||
      lowerProfession.includes('entrepreneur') || lowerProfession.includes('startup')) {
    return ['Black & Lime', 'White & Vibrant Purple', 'Navy & Coral'][Math.floor(Math.random() * 3)];
  }

  // Elegant and sophisticated
  if (lowerPrompt.includes('elegant') || lowerPrompt.includes('sophisticated') || lowerPrompt.includes('luxury') ||
      lowerProfession.includes('consultant') || lowerProfession.includes('advisor')) {
    return ['Midnight & Gold', 'Stone Elegance-dark', 'Royal Purple-dark'][Math.floor(Math.random() * 3)];
  }

  // Fresh and vibrant
  if (lowerPrompt.includes('fresh') || lowerPrompt.includes('vibrant') || lowerPrompt.includes('creative') ||
      lowerProfession.includes('creative')) {
    return ['Lime Fresh-light', 'Mint & Coral', 'Teal & Salmon'][Math.floor(Math.random() * 3)];
  }

  // Default fallback
  return ['Deep Ocean', 'Midnight Dusk', 'Crimson Sunset', 'White & Teal'][Math.floor(Math.random() * 4)];
};

export const getSmartFontSelection = (themeName: string, prompt: string, profession?: string): string => {
  const lowerPrompt = prompt.toLowerCase();
  const lowerProfession = profession?.toLowerCase() || '';

  // Modern, tech-focused
  if (lowerPrompt.includes('tech') || lowerPrompt.includes('developer') || lowerPrompt.includes('programmer') ||
      lowerProfession.includes('developer') || lowerProfession.includes('engineer')) {
    return ['sf-pro', 'poppins-roboto'][Math.floor(Math.random() * 2)];
  }

  // Creative, artistic
  if (lowerPrompt.includes('artist') || lowerPrompt.includes('creative') || lowerPrompt.includes('design') ||
      lowerProfession.includes('artist') || lowerProfession.includes('designer')) {
    return ['playfair-source', 'montserrat-merriweather'][Math.floor(Math.random() * 2)];
  }

  // Professional, corporate
  if (lowerPrompt.includes('business') || lowerPrompt.includes('corporate') || lowerPrompt.includes('professional') ||
      lowerProfession.includes('manager') || lowerProfession.includes('executive')) {
    return ['lato-open-sans', 'raleway-roboto-slab'][Math.floor(Math.random() * 2)];
  }

  // Elegant, sophisticated
  if (lowerPrompt.includes('elegant') || lowerPrompt.includes('sophisticated') || lowerPrompt.includes('luxury') ||
      lowerProfession.includes('consultant') || lowerProfession.includes('advisor')) {
    return ['raleway-thin-nunito', 'playfair-source'][Math.floor(Math.random() * 2)];
  }

  // Clean, readable
  if (lowerPrompt.includes('clean') || lowerPrompt.includes('minimal') || lowerPrompt.includes('simple') ||
      lowerProfession.includes('educator') || lowerProfession.includes('writer')) {
    return ['sf-pro', 'lato-open-sans'][Math.floor(Math.random() * 2)];
  }

  // Bold, impactful
  if (lowerPrompt.includes('bold') || lowerPrompt.includes('energetic') || lowerPrompt.includes('dynamic') ||
      lowerProfession.includes('entrepreneur') || lowerProfession.includes('speaker')) {
    return ['montserrat-merriweather', 'poppins-roboto'][Math.floor(Math.random() * 2)];
  }

  // Theme-based selection
  if (themeName.includes('Crimson Sunset') || themeName.includes('Golden Hour')) {
    return 'playfair-source';
  } else if (themeName.includes('Deep Ocean') || themeName.includes('Black & Lime')) {
    return 'poppins-roboto';
  } else if (themeName.includes('Classic Gray') || themeName.includes('Stone Elegance')) {
    return 'lato-open-sans';
  } else if (themeName.includes('Lime Fresh') || themeName.includes('White & Electric Blue')) {
    return 'sf-pro';
  } else if (themeName.includes('Royal Purple')) {
    // For Royal Purple, use a different font to break the pattern
    return ['poppins-roboto', 'lato-open-sans'][Math.floor(Math.random() * 2)];
  }

  // Default fallback
  return 'montserrat-merriweather';
}; 

// Theme rotation system to ensure better distribution
const themeUsageCount: Record<string, number> = {};

export const getRotatedThemeSelection = (prompt: string, profession?: string): string => {
  console.log('🔍 getRotatedThemeSelection called with:', { prompt, profession });
  const lowerPrompt = prompt.toLowerCase();
  const lowerProfession = profession?.toLowerCase() || '';

  // Get appropriate themes for the profession
  let appropriateThemes: string[] = [];

  // Music and creative arts
  if (lowerPrompt.includes('music') || lowerPrompt.includes('musician') || lowerPrompt.includes('composer') || 
      lowerProfession.includes('music') || lowerProfession.includes('artist')) {
    appropriateThemes = ['Deep Ocean', 'Crimson Sunset', 'White & Vibrant Purple', 'Navy & Coral'];
  }
  // Photography and visual arts
  else if (lowerPrompt.includes('photography') || lowerPrompt.includes('photographer') || lowerPrompt.includes('visual') ||
      lowerProfession.includes('photography') || lowerProfession.includes('designer')) {
    appropriateThemes = ['Crimson Sunset', 'Golden Hour-dark', 'Deep Ocean', 'Midnight & Gold'];
  }
  // Technology and development
  else if (lowerPrompt.includes('developer') || lowerPrompt.includes('programmer') || lowerPrompt.includes('tech') ||
      lowerProfession.includes('developer') || lowerProfession.includes('engineer')) {
    appropriateThemes = ['Deep Ocean', 'Black & Lime', 'White & Electric Blue', 'Classic Gray-dark'];
  }
  // Writing and content creation
  else if (lowerPrompt.includes('writer') || lowerPrompt.includes('content') || lowerPrompt.includes('blog') ||
      lowerProfession.includes('writer') || lowerProfession.includes('author')) {
    appropriateThemes = ['Midnight Dusk-dark', 'Classic Gray-dark', 'Stone Elegance-dark', 'Deep Ocean'];
  }
  // Education and academia
  else if (lowerPrompt.includes('teacher') || lowerPrompt.includes('professor') || lowerPrompt.includes('academic') ||
      lowerProfession.includes('educator') || lowerProfession.includes('professor')) {
    appropriateThemes = ['Emerald Forest-light', 'Classic Gray-light', 'Deep Ocean', 'White & Teal'];
  }
  // Students
  else if (lowerPrompt.includes('student') || lowerPrompt.includes('learning') || lowerProfession.includes('student')) {
    appropriateThemes = ['Lime Fresh-light', 'White & Electric Blue', 'Cream & Blush', 'Mint & Coral'];
  }
  // Corporate and business
  else if (lowerPrompt.includes('business') || lowerPrompt.includes('corporate') || lowerPrompt.includes('professional') ||
      lowerProfession.includes('manager') || lowerProfession.includes('executive')) {
    appropriateThemes = ['Classic Gray-dark', 'Stone Elegance-dark', 'Midnight Dusk-dark', 'White & Teal'];
  }
  // Warm and friendly
  else if (lowerPrompt.includes('friendly') || lowerPrompt.includes('warm') || lowerPrompt.includes('caring') ||
      lowerProfession.includes('counselor') || lowerProfession.includes('therapist')) {
    appropriateThemes = ['Sunset Rose-light', 'Golden Hour-light', 'Cream & Blush', 'Teal & Salmon'];
  }
  // Modern and minimalist
  else if (lowerPrompt.includes('minimal') || lowerPrompt.includes('clean') || lowerPrompt.includes('modern') ||
      lowerProfession.includes('designer')) {
    appropriateThemes = ['White & Teal', 'Classic Gray-light', 'White & Electric Blue', 'Stone Elegance-light'];
  }
  // Bold and energetic
  else if (lowerPrompt.includes('bold') || lowerPrompt.includes('energetic') || lowerPrompt.includes('dynamic') ||
      lowerProfession.includes('entrepreneur') || lowerProfession.includes('startup')) {
    appropriateThemes = ['Black & Lime', 'White & Vibrant Purple', 'Navy & Coral', 'Lime Fresh-dark'];
  }
  // Elegant and sophisticated
  else if (lowerPrompt.includes('elegant') || lowerPrompt.includes('sophisticated') || lowerPrompt.includes('luxury') ||
      lowerProfession.includes('consultant') || lowerProfession.includes('advisor')) {
    appropriateThemes = ['Midnight & Gold', 'Stone Elegance-dark', 'Deep Ocean', 'Classic Gray-dark'];
  }
  // Fresh and vibrant
  else if (lowerPrompt.includes('fresh') || lowerPrompt.includes('vibrant') || lowerPrompt.includes('creative') ||
      lowerProfession.includes('creative')) {
    appropriateThemes = ['Lime Fresh-light', 'Mint & Coral', 'Teal & Salmon', 'White & Vibrant Purple'];
  }
  // Default fallback
  else {
    appropriateThemes = ['Deep Ocean', 'Midnight Dusk', 'Crimson Sunset', 'White & Teal'];
  }

  // Find the theme with the lowest usage count
  let selectedTheme = appropriateThemes[0];
  let lowestCount = themeUsageCount[selectedTheme] || 0;

  for (const theme of appropriateThemes) {
    const count = themeUsageCount[theme] || 0;
    if (count < lowestCount) {
      lowestCount = count;
      selectedTheme = theme;
    }
  }

  // Increment the usage count for the selected theme
  themeUsageCount[selectedTheme] = (themeUsageCount[selectedTheme] || 0) + 1;

  console.log('🎨 getRotatedThemeSelection result:', {
    appropriateThemes,
    selectedTheme,
    themeUsageCount: { ...themeUsageCount }
  });

  return selectedTheme;
}; 