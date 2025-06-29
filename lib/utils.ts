import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// AI Title Suggestion Utility
export const generateAISectionTitle = async (
  sectionKey: string,
  portfolioData: any,
  artistName?: string
): Promise<string> => {
  try {
    const sectionConfig = {
      about: {
        context: "personal introduction and background",
        examples: ["About Me", "My Story", "Who I Am", "Background"]
      },
      tracks: {
        context: "music tracks and compositions",
        examples: ["My Music", "Tracks", "Discography", "Releases"]
      },
      gallery: {
        context: "photo gallery and visual work",
        examples: ["Photo Gallery", "Portfolio", "My Work", "Gallery"]
      },
      press: {
        context: "press mentions and media coverage",
        examples: ["Press & Media", "In the News", "Media Coverage", "Press"]
      },
      key_projects: {
        context: "key projects and achievements",
        examples: ["Key Projects", "Featured Work", "Projects", "Highlights"]
      },
      testimonials: {
        context: "client testimonials and reviews",
        examples: ["Testimonials", "What People Say", "Reviews", "Feedback"]
      },
      blog: {
        context: "blog posts and articles",
        examples: ["Blog", "Articles", "Writing", "Thoughts"]
      },
      status: {
        context: "current work and status updates",
        examples: ["What I'm Working On", "Current Projects", "Status", "Updates"]
      },
      skills: {
        context: "skills and tools",
        examples: ["Skills & Tools", "Expertise", "Technologies", "Skills"]
      },
      resume: {
        context: "resume and experience",
        examples: ["Resume", "Experience", "CV", "Background"]
      },
      hobbies: {
        context: "hobbies and interests",
        examples: ["Hobbies", "Interests", "Passions", "What I Love"]
      },
      contact: {
        context: "contact information",
        examples: ["Contact Me", "Get in Touch", "Let's Connect", "Contact"]
      }
    };

    const section = sectionConfig[sectionKey as keyof typeof sectionConfig];
    if (!section) {
      return "";
    }

    // For now, return a smart default based on context
    // In a real implementation, this would call an AI API
    const context = section.context;
    const examples = section.examples;
    
    // Simple logic to choose the best title based on portfolio data
    if (artistName && sectionKey === 'about') {
      return `About ${artistName}`;
    }
    
    if (sectionKey === 'tracks' && portfolioData?.artist_name) {
      return `${portfolioData.artist_name}'s Music`;
    }
    
    if (sectionKey === 'gallery' && portfolioData?.artist_name) {
      return `${portfolioData.artist_name}'s Work`;
    }
    
    // Return the first example as default
    return examples[0] || sectionConfig[sectionKey as keyof typeof sectionConfig]?.examples[0] || "";
    
  } catch (error) {
    console.error('Error generating AI title:', error);
    return "";
  }
};

// Enhanced AI title generation with more context
export const generateEnhancedAITitle = async (
  sectionKey: string,
  portfolioData: any,
  templateName?: string
): Promise<string> => {
  try {
    // Template-specific title suggestions
    const templateTitles: { [key: string]: { [key: string]: string[] } } = {
      'music-maestro': {
        tracks: ["My Compositions", "Musical Works", "Discography"],
        gallery: ["Performance Photos", "Behind the Scenes", "Studio Sessions"],
        press: ["Press Coverage", "Reviews & Features", "Media Mentions"]
      },
      'photo-gallery': {
        gallery: ["Photo Portfolio", "My Photography", "Visual Stories"],
        tracks: ["Audio Stories", "Soundscapes", "Audio Work"],
        press: ["Exhibitions", "Publications", "Press Features"]
      },
      'default': {
        tracks: ["My Work", "Portfolio", "Projects"],
        gallery: ["Gallery", "My Work", "Portfolio"],
        press: ["Press & Media", "In the News", "Media Coverage"]
      }
    };

    const template = templateTitles[templateName || 'default'];
    const sectionTitles = template[sectionKey] || template['default'] || [];
    
    // Use template-specific title if available
    if (sectionTitles.length > 0) {
      return sectionTitles[0];
    }

    // Fallback to basic AI generation
    return await generateAISectionTitle(sectionKey, portfolioData, portfolioData?.artist_name);
    
  } catch (error) {
    console.error('Error generating enhanced AI title:', error);
    return await generateAISectionTitle(sectionKey, portfolioData, portfolioData?.artist_name);
  }
};

/**
 * Get a random default track thumbnail URL
 * @returns A random default track thumbnail URL
 */
export function getRandomDefaultTrackThumbnail(): string {
  const defaultThumbnails = [
    '/default-track-thumbnail-1.jpg',
    '/default-track-thumbnail-2.jpg', 
    '/default-track-thumbnail-3.jpg',
    '/default-track-thumbnail-4.jpg',
    '/default-track-thumbnail-5.jpg',
    '/default-track-thumbnail-6.jpg',
    '/default-track-thumbnail-7.jpg',
    '/default-track-thumbnail-8.jpg',
    '/default-track-thumbnail-9.jpg',
    '/default-track-thumbnail-10.jpg'
  ]
  
  // Randomly select one of the default thumbnails
  const randomIndex = Math.floor(Math.random() * defaultThumbnails.length)
  return defaultThumbnails[randomIndex]
} 