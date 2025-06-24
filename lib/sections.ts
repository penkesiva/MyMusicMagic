export type Section = {
    key: string;
    defaultName: string;
    defaultOrder: number;
    enabled: boolean;
    defaultEnabled: boolean;
    fields: {
        [key: string]: 'text' | 'textarea' | 'url' | 'boolean' | 'json';
    };
};

export const SECTIONS_CONFIG: { [key: string]: Section } = {
    hero: {
        key: 'hero',
        defaultName: 'Hero',
        defaultOrder: 0,
        enabled: true,
        defaultEnabled: true,
        fields: {
            hero_title: 'text',
            hero_subtitle: 'text',
            hero_cta_text: 'text',
            hero_cta_link: 'url',
            hero_image_url: 'url'
        }
    },
    about: {
        key: 'about',
        defaultName: 'About Me',
        defaultOrder: 1,
        enabled: true,
        defaultEnabled: true,
        fields: {
            about_title: 'text',
            about_text: 'textarea',
            profile_photo_url: 'url'
        }
    },
    tracks: {
        key: 'tracks',
        defaultName: 'Tracks',
        defaultOrder: 2,
        enabled: true,
        defaultEnabled: true,
        fields: {}
    },
    gallery: {
        key: 'gallery',
        defaultName: 'Photo Gallery',
        defaultOrder: 3,
        enabled: true,
        defaultEnabled: true,
        fields: {}
    },
    key_projects: {
        key: 'key_projects',
        defaultName: 'Key Projects',
        defaultOrder: 5,
        enabled: true,
        defaultEnabled: true,
        fields: {
            key_projects_title: 'text',
            key_projects_json: 'json'
        }
    },
    testimonials: {
        key: 'testimonials',
        defaultName: 'Testimonials',
        defaultOrder: 6,
        enabled: false,
        defaultEnabled: false,
        fields: {}
    },
    press: {
        key: 'press',
        defaultName: 'Press & Media',
        defaultOrder: 4,
        enabled: true,
        defaultEnabled: true,
        fields: {
            press_title: 'text',
            press_json: 'json'
        }
    },
    blog: {
        key: 'blog',
        defaultName: 'Blog',
        defaultOrder: 8,
        enabled: false,
        defaultEnabled: false,
        fields: {}
    },
    status: {
        key: 'status',
        defaultName: 'What I\'m Working On',
        defaultOrder: 9,
        enabled: false,
        defaultEnabled: false,
        fields: {}
    },
    skills: {
        key: 'skills',
        defaultName: 'Skills & Tools',
        defaultOrder: 6,
        enabled: true,
        defaultEnabled: true,
        fields: {
            skills_title: 'text',
            skills_json: 'json'
        }
    },
    resume: {
        key: 'resume',
        defaultName: 'Resume',
        defaultOrder: 9,
        enabled: true,
        defaultEnabled: true,
        fields: {
            resume_title: 'text',
            resume_url: 'url'
        }
    },
    hobbies: {
        key: 'hobbies',
        defaultName: 'Hobbies',
        defaultOrder: 7,
        enabled: true,
        defaultEnabled: true,
        fields: {
            hobbies_title: 'text',
            hobbies_json: 'json'
        }
    },
    contact: {
        key: 'contact',
        defaultName: 'Contact Me',
        defaultOrder: 9,
        enabled: true,
        defaultEnabled: true,
        fields: {
            contact_title: 'text',
            contact_description: 'textarea',
            contact_email: 'text',
            twitter_url: 'url',
            instagram_url: 'url',
            linkedin_url: 'url',
            github_url: 'url',
            website_url: 'url',
            youtube_url: 'url'
        }
    },
    footer: {
        key: 'footer',
        defaultName: 'Footer',
        defaultOrder: 14,
        enabled: true,
        defaultEnabled: true,
        fields: {
            footer_about_summary: 'textarea',
            footer_links_json: 'json',
            footer_social_links_json: 'json',
            footer_copyright_text: 'text',
            footer_show_social_links: 'boolean',
            footer_show_about_summary: 'boolean',
            footer_show_links: 'boolean'
        }
    }
}; 