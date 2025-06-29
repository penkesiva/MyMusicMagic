import { Database } from './database';

export type Portfolio = {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  template_id: string | null;
  is_published: boolean;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  
  // Artist Info
  artist_name: string | null;
  bio: string | null;
  
  // Page Content
  sections_config: any; // json
  layout_config: any; // json - layout editor configuration
  
  // Hero Section
  hero_title: string | null;
  hero_subtitle: string | null;
  hero_cta_buttons: any; // JSON array of CTA buttons
  
  // About Section
  about_title: string | null;
  about_text: string | null;

  // Hobbies
  hobbies_title: string | null;
  hobbies_json: any; // json

  // Skills
  skills_title: string | null;
  skills_json: any; // json

  // Press
  press_title: string | null;
  press_json: any; // json

  // Key Projects
  key_projects_title: string | null;
  key_projects_json: any; // json

  // Testimonials
  testimonials_title: string | null;
  testimonials_json: any; // json

  // Resume
  resume_title: string | null;
  resume_url: string | null;

  // Contact Section
  contact_title: string | null;
  contact_description: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  contact_location: string | null;
  
  // Social Links
  twitter_url: string | null;
  instagram_url: string | null;
  linkedin_url: string | null;
  github_url: string | null;
  website_url: string | null;
  youtube_url: string | null;

  // Media URLs
  profile_photo_url: string | null;
  hero_image_url: string | null;
  
  // SEO
  seo_title: string | null;
  seo_description: string | null;
  
  // Theme
  theme_name: string | null;
  
  // Footer
  footer_text: string | null;
  footer_about_summary: string | null;
  footer_links_json: any; // json
  footer_social_links_json: any; // json
  footer_copyright_text: string | null;
  footer_show_social_links: boolean | null;
  footer_show_about_summary: boolean | null;
  footer_show_links: boolean | null;
  
  // Layout editor data (added dynamically)
  tracks?: any[]; // Track data for layout calculations
  gallery?: any[]; // Gallery data for layout calculations
}; 