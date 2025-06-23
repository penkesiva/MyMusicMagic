export interface Section {
    defaultName: string;
    defaultEnabled: boolean;
    defaultOrder: number;
}

export const SECTIONS_CONFIG: Record<string, Section> = {
    hero: { defaultName: 'Hero', defaultEnabled: true, defaultOrder: 1 },
    about: { defaultName: 'About Me', defaultEnabled: true, defaultOrder: 2 },
    tracks: { defaultName: 'Tracks', defaultEnabled: true, defaultOrder: 3 },
    gallery: { defaultName: 'Photo Gallery', defaultEnabled: true, defaultOrder: 4 },
    key_projects: { defaultName: 'Key Projects', defaultEnabled: false, defaultOrder: 5 },
    testimonials: { defaultName: 'Testimonials', defaultEnabled: false, defaultOrder: 6 },
    press: { defaultName: 'Press', defaultEnabled: false, defaultOrder: 7 },
    blog: { defaultName: 'Blog', defaultEnabled: false, defaultOrder: 8 },
    status: { defaultName: 'What I’m Working On', defaultEnabled: false, defaultOrder: 9 },
    skills: { defaultName: 'Skills & Tools', defaultEnabled: false, defaultOrder: 10 },
    resume: { defaultName: 'Resume', defaultEnabled: false, defaultOrder: 11 },
    ai_advantage: { defaultName: 'Hobbies', defaultEnabled: false, defaultOrder: 12 },
    contact: { defaultName: 'Connect', defaultEnabled: true, defaultOrder: 13 },
    footer: { defaultName: 'Footer', defaultEnabled: true, defaultOrder: 14 },
}; 