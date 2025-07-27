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
  const editorSections = Object.keys(SECTIONS_CONFIG).filter(key => 
    key !== 'footer' // Exclude footer from editor sections
  );
  
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
  
  // Return enabled sections first, then disabled sections
  return [...enabledSections, ...disabledSections];
}; 