export interface Section {
    defaultName: string;
    defaultEnabled: boolean;
    defaultOrder: number;
}

export const SECTIONS_CONFIG: Record<string, Section> = {
    hero: { defaultName: 'Hero', defaultEnabled: true, defaultOrder: 1 },
    about: { defaultName: 'About Me', defaultEnabled: true, defaultOrder: 2 },
    tracks: { defaultName: 'Music Gallery', defaultEnabled: true, defaultOrder: 3 },
    gallery: { defaultName: 'Photo Gallery', defaultEnabled: true, defaultOrder: 4 },
    testimonials: { defaultName: 'Testimonials', defaultEnabled: false, defaultOrder: 5 },
    social_links: { defaultName: 'Social Links', defaultEnabled: true, defaultOrder: 6 },
    skills: { defaultName: 'Skills & Instruments', defaultEnabled: false, defaultOrder: 7 },
    status: { defaultName: 'Current Status', defaultEnabled: false, defaultOrder: 8 },
    blog: { defaultName: 'Blog', defaultEnabled: false, defaultOrder: 9 },
    news: { defaultName: 'News & Updates', defaultEnabled: false, defaultOrder: 10 },
    ai_advantage: { defaultName: 'AI Advantage', defaultEnabled: false, defaultOrder: 11 },
    contact: { defaultName: 'Contact', defaultEnabled: true, defaultOrder: 12 },
    footer: { defaultName: 'Footer', defaultEnabled: true, defaultOrder: 13 },
}; 