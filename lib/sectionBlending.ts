export interface SectionBlendingStyle {
  id: string;
  name: string;
  description: string;
  preview: string;
  containerClass: string;
  sectionClass: string;
  spacingClass: string;
}

export const SECTION_BLENDING_STYLES: SectionBlendingStyle[] = [
  {
    id: 'full-bleed',
    name: 'Full-Bleed',
    description: 'Sections flow seamlessly without gaps, creating a continuous magazine-style layout',
    preview: 'Sections blend together with overlapping elements and no visual breaks',
    containerClass: 'relative overflow-x-hidden',
    sectionClass: 'relative',
    spacingClass: 'py-32'
  },
  {
    id: 'card-based',
    name: 'Card-Based',
    description: 'Each section has distinct card-like containers with shadows and rounded corners',
    preview: 'Clear visual separation with elegant card containers',
    containerClass: 'relative overflow-x-hidden',
    sectionClass: 'relative mx-4 md:mx-8 mb-8',
    spacingClass: 'py-20'
  },
  {
    id: 'alternating',
    name: 'Alternating Backgrounds',
    description: 'Sections alternate between light and dark backgrounds for visual rhythm',
    preview: 'Creates visual rhythm with alternating section backgrounds',
    containerClass: 'relative overflow-x-hidden',
    sectionClass: 'relative',
    spacingClass: 'py-24'
  },
  {
    id: 'minimal-spacing',
    name: 'Minimal Spacing',
    description: 'Small, consistent gaps between sections for clean separation',
    preview: 'Clean, modern separation with subtle spacing',
    containerClass: 'relative overflow-x-hidden space-y-8',
    sectionClass: 'relative',
    spacingClass: 'py-16'
  },
  {
    id: 'overlapping',
    name: 'Overlapping Sections',
    description: 'Sections slightly overlap each other creating depth and visual interest',
    preview: 'Modern layered appearance with overlapping elements',
    containerClass: 'relative overflow-x-hidden',
    sectionClass: 'relative -mt-8 first:mt-0',
    spacingClass: 'py-24'
  },
  {
    id: 'parallax',
    name: 'Parallax Style',
    description: 'Background elements move at different speeds creating depth and movement',
    preview: 'Dynamic visual experience with moving background elements',
    containerClass: 'relative overflow-x-hidden',
    sectionClass: 'relative',
    spacingClass: 'py-32'
  },
  {
    id: 'timeline',
    name: 'Timeline/Story',
    description: 'Sections connected by visual timeline elements for narrative flow',
    preview: 'Story-driven presentation with connecting timeline elements',
    containerClass: 'relative overflow-x-hidden',
    sectionClass: 'relative',
    spacingClass: 'py-24'
  },
  {
    id: 'grid-based',
    name: 'Grid-Based',
    description: 'Magazine-style layout with varied section widths for visual hierarchy',
    preview: 'Creates visual interest with sections of different widths',
    containerClass: 'relative overflow-x-hidden',
    sectionClass: 'relative',
    spacingClass: 'py-20'
  },
  {
    id: 'curved-separators',
    name: 'Curved Separators',
    description: 'Sections separated by beautiful curved dividers with decorative elements',
    preview: 'Elegant curved separators with flowing designs between sections',
    containerClass: 'relative overflow-x-hidden',
    sectionClass: 'relative',
    spacingClass: 'py-24'
  }
];

export const getSectionBlendingStyle = (id: string): SectionBlendingStyle => {
  return SECTION_BLENDING_STYLES.find(style => style.id === id) || SECTION_BLENDING_STYLES[0];
}; 