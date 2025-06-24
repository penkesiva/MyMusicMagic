import { supabase } from '@/lib/supabase/client';
import { Database } from '@/types/database';
import Image from 'next/image';
import {
  Play, Mail, Music, Image as ImageIcon, User, ArrowRight, ExternalLink, Globe, FileText, Briefcase, Award, Star
} from 'lucide-react'
import { Portfolio } from '@/types/portfolio'
import { notFound } from 'next/navigation'
import { THEMES } from '@/lib/themes';
import { HOBBIES_LIST } from '@/lib/hobbies'
import { SKILLS_LIST } from '@/lib/skills'
import {
  FaTwitter, FaGithub, FaLinkedin, FaInstagram, FaFacebook, FaYoutube, FaSoundcloud, FaSpotify, FaApple
} from 'react-icons/fa'
import { TrackCard } from '@/app/components/tracks/TrackCard';
import { SECTIONS_CONFIG } from '@/lib/sections';

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

type PageProps = {
  params: { id: string };
};

type Track = Database['public']['Tables']['tracks']['Row'];
type GalleryItem = Database['public']['Tables']['gallery']['Row'];

export default async function PortfolioPreviewPage({ params }: PageProps) {
  console.log('🎯 Preview route called with ID:', params.id);
  console.log('⏰ Timestamp:', new Date().toISOString());
  
  // Get the portfolio by ID (allows unpublished portfolios for preview)
  const { data: portfolio, error: portfolioError } = await supabase
    .from('user_portfolios')
    .select('*')
    .eq('id', params.id)
    .single();

  if (portfolioError || !portfolio) {
    console.error('❌ Portfolio not found:', portfolioError);
    notFound();
  }

  console.log('✅ Portfolio found:', portfolio.name);
  console.log('📊 Portfolio data:', {
    id: portfolio.id,
    name: portfolio.name,
    artist_name: portfolio.artist_name,
    hero_title: portfolio.hero_title,
    hero_subtitle: portfolio.hero_subtitle,
    about_text: portfolio.about_text?.substring(0, 50) + '...', // Show first 50 chars
    hobbies_title: portfolio.hobbies_title,
    hobbies_json: portfolio.hobbies_json,
    sections_config: portfolio.sections_config,
    updated_at: portfolio.updated_at
  });

  // Get user profile for the portfolio
  const { data: userProfile, error: userError } = await supabase
    .from('user_profiles')
    .select('id, username, full_name')
    .eq('id', portfolio.user_id)
    .single();

  if (userError || !userProfile) {
    notFound();
  }

  const { data: tracksData, error: tracksError } = await supabase
    .from('tracks')
    .select('*')
    .eq('portfolio_id', portfolio.id)
    .order('order', { ascending: true });
    
  const { data: galleryItemsData, error: galleryError } = await supabase
    .from('gallery')
    .select('*')
    .eq('portfolio_id', portfolio.id)
    .order('order', { ascending: true });

  const tracks = tracksData || [];
  const galleryItems = galleryItemsData || [];

  let sortedSections: string[] = [];
  if (portfolio.sections_config) {
    // Handle different possible formats of sections_config
    let sectionsArray: string[] = [];
    
    if (Array.isArray(portfolio.sections_config)) {
      sectionsArray = portfolio.sections_config;
    } else if (typeof portfolio.sections_config === 'object') {
      // If it's an object, extract the keys that are enabled
      sectionsArray = Object.keys(portfolio.sections_config).filter(key => 
        (portfolio.sections_config as any)[key]?.enabled === true
      );
    } else if (typeof portfolio.sections_config === 'string') {
      // If it's a string, try to parse it
      try {
        const parsed = JSON.parse(portfolio.sections_config);
        if (Array.isArray(parsed)) {
          sectionsArray = parsed;
        } else if (typeof parsed === 'object') {
          sectionsArray = Object.keys(parsed).filter(key => 
            parsed[key]?.enabled === true
          );
        }
      } catch (e) {
        sectionsArray = [];
      }
    }
    
    // Only include sections that exist in SECTIONS_CONFIG
    const validSections = sectionsArray.filter(key => SECTIONS_CONFIG[key]) || [];
    
    // Sort sections by their order field from sections_config
    sortedSections = validSections.sort((a, b) => {
      const orderA = (portfolio.sections_config as any)?.[a]?.order ?? SECTIONS_CONFIG[a]?.defaultOrder ?? 999;
      const orderB = (portfolio.sections_config as any)?.[b]?.order ?? SECTIONS_CONFIG[b]?.defaultOrder ?? 999;
      return orderA - orderB;
    });
  }

  // Debug logging
  console.log('🔍 Portfolio Preview Debug Info:');
  console.log('Artist Name:', portfolio.artist_name);
  console.log('Hero Title:', portfolio.hero_title);
  console.log('Hero Subtitle:', portfolio.hero_subtitle);
  console.log('Hobbies Title:', portfolio.hobbies_title);
  console.log('Hobbies JSON:', portfolio.hobbies_json);
  console.log('Sections Config:', portfolio.sections_config);
  console.log('Sorted Sections:', sortedSections);
  console.log('Hobbies Section Enabled:', (portfolio.sections_config as any)?.hobbies?.enabled);

  const theme = THEMES.find(t => t.name === portfolio?.theme_name) || THEMES[0];
  const colors = theme.colors;

  // Safe array getter to handle JSON fields that might be strings
  const safeGetArray = (field: any): any[] => {
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

  const renderHobbies = (portfolio: Portfolio) => {
    const sectionTitle = (portfolio.sections_config as any)?.hobbies?.name || portfolio.hobbies_title || SECTIONS_CONFIG['hobbies'].defaultName;
    const hobbies = portfolio.hobbies_json as any[] || [];
    return (
      <section id="hobbies" className={`${theme.colors.background} ${theme.colors.text} py-20 px-4 md:px-8`}>
        <div className="container mx-auto">
          <h2 className={`text-4xl font-bold mb-12 text-center ${theme.colors.heading}`}>{sectionTitle}</h2>
          {hobbies.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-6">
              {hobbies.map((hobby: any) => (
                <div key={hobby.name} className="flex flex-col items-center gap-2 p-4 bg-white/10 rounded-lg w-32">
                  <span className="text-4xl">{hobby.icon}</span>
                  <span className="text-sm font-medium text-center">{hobby.name}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400">No hobbies added yet.</div>
          )}
        </div>
      </section>
    );
  };

  const renderSkills = (portfolio: Portfolio) => {
    const sectionTitle = (portfolio.sections_config as any)?.skills?.name || portfolio.skills_title || SECTIONS_CONFIG['skills'].defaultName;
    const skills = portfolio.skills_json as any[] || [];
    return (
      <section id="skills" className={`${theme.colors.background} ${theme.colors.text} py-20 px-4 md:px-8`}>
        <div className="container mx-auto">
          <h2 className={`text-4xl font-bold mb-12 text-center ${theme.colors.heading}`}>{sectionTitle}</h2>
          {skills.length > 0 ? (
            <div className="flex flex-wrap justify-center items-center gap-6">
              {skills.map((skill: any) => {
                const skillDef = SKILLS_LIST.find(s => s.name === skill.name);
                const IconComponent = skillDef ? skillDef.icon : null;
                if (!IconComponent) return null;
                return (
                  <div key={skill.name} className="flex items-center gap-3 py-2 px-4 bg-white/5 rounded-full border border-white/20" title={skill.name}>
                    <IconComponent className="h-6 w-6" style={{ color: skill.color || '#FFFFFF' }}/>
                    <span className="text-md font-semibold">{skill.name}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-gray-400">No skills added yet.</div>
          )}
        </div>
      </section>
    );
  };
  
  const renderAbout = (portfolio: Portfolio) => {
    const sectionTitle = (portfolio.sections_config as any)?.about?.name || portfolio.about_title || SECTIONS_CONFIG['about'].defaultName;
    return (
      <section id="about" className={`${theme.colors.background} ${theme.colors.text} py-20 px-4 md:px-8`}>
        <div className="container mx-auto">
          <h2 className={`text-4xl font-bold mb-12 text-center ${theme.colors.heading}`}>{sectionTitle}</h2>
          {portfolio.about_text ? (
            <div className="grid lg:grid-cols-3 gap-12 items-center">
              {portfolio.profile_photo_url && (
                <div className="lg:col-span-1 flex justify-center">
                  <div className="relative">
                    <Image
                      src={portfolio.profile_photo_url}
                      alt={portfolio.artist_name || 'Artist profile photo'}
                      width={300}
                      height={300}
                      className="rounded-2xl aspect-square object-cover shadow-2xl"
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black to-transparent opacity-20"></div>
                  </div>
                </div>
              )}
              <div className={portfolio.profile_photo_url ? "lg:col-span-2" : "lg:col-span-3"}>
                <div className="flex items-center mb-6">
                  <User className={`w-8 h-8 ${colors.primary} mr-3`} />
                  <h2 className={`text-4xl font-bold ${colors.heading}`}>{sectionTitle}</h2>
                </div>
                <div className={`prose prose-lg max-w-none ${colors.text} ${colors.background === '#FFFFFF' ? 'prose-invert' : ''}`}>
                  <p className="text-lg leading-relaxed whitespace-pre-wrap">{portfolio.about_text}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-400">No about text added yet.</div>
          )}
        </div>
      </section>
    );
  };

  const renderTracks = (portfolio: Portfolio, tracks: Track[]) => {
    const sectionTitle = (portfolio.sections_config as any)?.tracks?.name || SECTIONS_CONFIG['tracks'].defaultName;
    return (
      <section id="tracks" className={`${theme.colors.background} ${theme.colors.text} py-20 px-4 md:px-8`}>
        <div className="container mx-auto">
          <h2 className={`text-4xl font-bold mb-12 text-center ${theme.colors.heading}`}>{sectionTitle}</h2>
          {tracks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {tracks.map(track => (
                <TrackCard 
                  key={track.id} 
                  track={track}
                  onPlay={() => {}}
                  onInfo={() => {}}
                />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400">No tracks added yet.</div>
          )}
        </div>
      </section>
    );
  };

  const renderGallery = (portfolio: Portfolio, galleryItems: GalleryItem[]) => {
    const sectionTitle = (portfolio.sections_config as any)?.gallery?.name || SECTIONS_CONFIG['gallery'].defaultName;
    return (
      <section id="gallery" className={`${theme.colors.background} ${theme.colors.text} py-20 px-4 md:px-8`}>
        <div className="container mx-auto">
          <h2 className={`text-4xl font-bold mb-12 text-center ${theme.colors.heading}`}>{sectionTitle}</h2>
          {galleryItems.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {galleryItems.map((item) => (
                <div key={item.id} className="group relative aspect-square rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                  <Image
                    src={item.image_url || '/default-track-thumbnail.jpg'}
                    alt={item.title || 'Gallery image'}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  {item.title && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <p className="text-white text-center font-semibold text-sm">{item.title}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400">No gallery items yet.</div>
          )}
        </div>
      </section>
    );
  };

  const renderPress = (portfolio: Portfolio) => {
    const sectionTitle = (portfolio.sections_config as any)?.press?.name || SECTIONS_CONFIG['press'].defaultName;
    
    return (
      <section id="press" className={`${theme.colors.background} ${theme.colors.text} py-20 px-4 md:px-8`}>
        <div className="container mx-auto">
          <h2 className={`text-4xl font-bold mb-12 text-center ${theme.colors.heading}`}>{sectionTitle}</h2>
          <p className={`${colors.text} text-lg max-w-2xl mx-auto`}>Coming Soon</p>
        </div>
      </section>
    );
  };

  const renderKeyProjects = (portfolio: Portfolio) => {
    const sectionTitle = (portfolio.sections_config as any)?.key_projects?.name || SECTIONS_CONFIG['key_projects'].defaultName;
    
    return (
      <section id="key_projects" className={`${theme.colors.background} ${theme.colors.text} py-20 px-4 md:px-8`}>
        <div className="container mx-auto">
          <h2 className={`text-4xl font-bold mb-12 text-center ${theme.colors.heading}`}>{sectionTitle}</h2>
          <p className={`${colors.text} text-lg max-w-2xl mx-auto`}>Coming Soon</p>
        </div>
      </section>
    );
  };

  const renderResume = (portfolio: Portfolio) => {
    const sectionTitle = (portfolio.sections_config as any)?.resume?.name || SECTIONS_CONFIG['resume'].defaultName;
    return (
      <section id="resume" className={`${theme.colors.background} ${theme.colors.text} py-20 px-4 md:px-8`}>
        <div className="container mx-auto text-center">
          <h2 className={`text-4xl font-bold mb-12 text-center ${theme.colors.heading}`}>{sectionTitle}</h2>
          {portfolio.resume_url ? (
            <a href={portfolio.resume_url} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 ${colors.primary} hover:scale-105`}>
              Download My Resume
            </a>
          ) : (
            <div className="text-center text-gray-400">No resume uploaded yet.</div>
          )}
        </div>
      </section>
    );
  };

  const renderContact = (portfolio: Portfolio) => {
    const sectionTitle = (portfolio.sections_config as any)?.contact?.name || SECTIONS_CONFIG['contact'].defaultName;
    
    return (
      <section id="contact" className={`${theme.colors.background} ${theme.colors.text} py-20 px-4 md:px-8`}>
        <div className="container mx-auto text-center">
          <h2 className={`text-4xl font-bold mb-12 text-center ${theme.colors.heading}`}>{sectionTitle}</h2>
          {portfolio.contact_description && (
            <p className={`${colors.text} text-lg max-w-2xl mx-auto mb-8`}>{portfolio.contact_description}</p>
          )}
          {portfolio.contact_email && (
            <a href={`mailto:${portfolio.contact_email}`} className={`inline-block text-xl font-semibold ${colors.primaryStrong} hover:underline mb-8`}>{portfolio.contact_email}</a>
          )}
          <div className="flex justify-center gap-6 mt-4">
            {portfolio.instagram_url && <a href={portfolio.instagram_url} target="_blank" rel="noopener noreferrer" className={`${colors.text} hover:${colors.primary}`}><FaInstagram className="w-6 h-6"/></a>}
            {portfolio.twitter_url && <a href={portfolio.twitter_url} target="_blank" rel="noopener noreferrer" className={`${colors.text} hover:${colors.primary}`}><FaTwitter className="w-6 h-6"/></a>}
            {portfolio.youtube_url && <a href={portfolio.youtube_url} target="_blank" rel="noopener noreferrer" className={`${colors.text} hover:${colors.primary}`}><FaYoutube className="w-6 h-6"/></a>}
            {portfolio.linkedin_url && <a href={portfolio.linkedin_url} target="_blank" rel="noopener noreferrer" className={`${colors.text} hover:${colors.primary}`}><FaLinkedin className="w-6 h-6"/></a>}
            {portfolio.website_url && <a href={portfolio.website_url} target="_blank" rel="noopener noreferrer" className={`${colors.text} hover:${colors.primary}`}><Globe className="w-6 h-6"/></a>}
          </div>
        </div>
      </section>
    );
  };

  const renderTestimonials = (portfolio: Portfolio) => {
    const sectionTitle = (portfolio.sections_config as any)?.testimonials?.name || SECTIONS_CONFIG['testimonials'].defaultName;
    
    return (
      <section id="testimonials" className={`${theme.colors.background} ${theme.colors.text} py-20 px-4 md:px-8`}>
        <div className="container mx-auto">
          <h2 className={`text-4xl font-bold mb-12 text-center ${theme.colors.heading}`}>{sectionTitle}</h2>
          <p className={`${colors.text} text-lg max-w-2xl mx-auto text-center`}>Coming Soon</p>
        </div>
      </section>
    );
  };

  const renderBlog = (portfolio: Portfolio) => {
    const sectionTitle = (portfolio.sections_config as any)?.blog?.name || SECTIONS_CONFIG['blog'].defaultName;
    
    return (
      <section id="blog" className={`${theme.colors.background} ${theme.colors.text} py-20 px-4 md:px-8`}>
        <div className="container mx-auto">
          <h2 className={`text-4xl font-bold mb-12 text-center ${theme.colors.heading}`}>{sectionTitle}</h2>
          <p className={`${colors.text} text-lg max-w-2xl mx-auto text-center`}>Coming Soon</p>
        </div>
      </section>
    );
  };

  const renderStatus = (portfolio: Portfolio) => {
    const sectionTitle = (portfolio.sections_config as any)?.status?.name || SECTIONS_CONFIG['status'].defaultName;
    
    return (
      <section id="status" className={`${theme.colors.background} ${theme.colors.text} py-20 px-4 md:px-8`}>
        <div className="container mx-auto">
          <h2 className={`text-4xl font-bold mb-12 text-center ${theme.colors.heading}`}>{sectionTitle}</h2>
          <p className={`${colors.text} text-lg max-w-2xl mx-auto text-center`}>Coming Soon</p>
        </div>
      </section>
    );
  };

  const renderFooter = (portfolio: Portfolio) => {
    const showAboutSummary = (portfolio as any).footer_show_about_summary !== false;
    const showSocialLinks = (portfolio as any).footer_show_social_links !== false;
    const showLinks = (portfolio as any).footer_show_links !== false;
    
    return (
      <footer className={`py-16 mt-20 border-t ${colors.card} border-opacity-20`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* About Summary */}
            {showAboutSummary && (portfolio as any).footer_about_summary && (
              <div className="md:col-span-1">
                <h3 className={`text-lg font-semibold mb-4 ${colors.heading}`}>About</h3>
                <p className={`${colors.text} text-sm leading-relaxed`}>
                  {(portfolio as any).footer_about_summary}
                </p>
              </div>
            )}
            
            {/* Quick Links */}
            {showLinks && (portfolio as any).footer_links_json && safeGetArray((portfolio as any).footer_links_json).length > 0 && (
              <div className="md:col-span-1">
                <h3 className={`text-lg font-semibold mb-4 ${colors.heading}`}>Quick Links</h3>
                <ul className="space-y-2">
                  {safeGetArray((portfolio as any).footer_links_json).map((link: any, index: number) => (
                    <li key={index}>
                      <a 
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={`${colors.text} text-sm hover:${colors.primary} transition-colors`}
                      >
                        {link.text}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Social Links */}
            {showSocialLinks && (
              <div className="md:col-span-1">
                <h3 className={`text-lg font-semibold mb-4 ${colors.heading}`}>Connect</h3>
                <div className="flex flex-wrap gap-4">
                  {portfolio.instagram_url && (
                    <a href={portfolio.instagram_url} target="_blank" rel="noopener noreferrer" 
                       className={`${colors.text} hover:${colors.primary} transition-colors`} title="Instagram">
                      <FaInstagram className="w-5 h-5" />
                    </a>
                  )}
                  {portfolio.twitter_url && (
                    <a href={portfolio.twitter_url} target="_blank" rel="noopener noreferrer" 
                       className={`${colors.text} hover:${colors.primary} transition-colors`} title="Twitter">
                      <FaTwitter className="w-5 h-5" />
                    </a>
                  )}
                  {portfolio.youtube_url && (
                    <a href={portfolio.youtube_url} target="_blank" rel="noopener noreferrer" 
                       className={`${colors.text} hover:${colors.primary} transition-colors`} title="YouTube">
                      <FaYoutube className="w-5 h-5" />
                    </a>
                  )}
                  {portfolio.linkedin_url && (
                    <a href={portfolio.linkedin_url} target="_blank" rel="noopener noreferrer" 
                       className={`${colors.text} hover:${colors.primary} transition-colors`} title="LinkedIn">
                      <FaLinkedin className="w-5 h-5" />
                    </a>
                  )}
                  {portfolio.website_url && (
                    <a href={portfolio.website_url} target="_blank" rel="noopener noreferrer" 
                       className={`${colors.text} hover:${colors.primary} transition-colors`} title="Website">
                      <Globe className="w-5 h-5" />
                    </a>
                  )}
                  {portfolio.contact_email && (
                    <a href={`mailto:${portfolio.contact_email}`} 
                       className={`${colors.text} hover:${colors.primary} transition-colors`} title="Email">
                      <Mail className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {/* Copyright Bar */}
          <div className="border-t border-opacity-20 pt-8 text-center">
            <p className={`text-sm ${colors.text} opacity-80`}>
              {(portfolio as any).footer_copyright_text || `© ${new Date().getFullYear()} ${portfolio.artist_name || 'Hero Portfolio'}. All rights reserved.`}
            </p>
          </div>
        </div>
      </footer>
    );
  };

  return (
    <div className={`min-h-screen ${theme.colors.background}`}>
      {/* Preview Banner */}
      <div className="bg-yellow-500 text-yellow-900 px-4 py-2 text-center text-sm font-medium">
        🎯 PREVIEW MODE - This is how your portfolio will look when published
      </div>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-24 md:space-y-32 py-8 md:py-16">
          {/* Main sections rendering */}
          {sortedSections
            .filter(key => key !== 'footer')
            .map(key => (
              <section key={key} id={key} className="scroll-mt-20">
                {key === 'hero' && (
                  <div className="relative w-full min-h-[80vh] flex items-center justify-center text-center p-4 overflow-hidden">
                    {portfolio.hero_image_url && (
                      <Image
                        src={portfolio.hero_image_url}
                        alt={portfolio.artist_name || 'Hero image'}
                        fill
                        className="object-cover brightness-50"
                      />
                    )}
                    <div className="relative z-10 text-white max-w-3xl">
                      {portfolio.hero_title ? (
                        <>
                          <h1 className="text-5xl md:text-7xl font-extrabold mb-4" style={{ color: theme.colors.heading }}>
                            {portfolio.hero_title}
                          </h1>
                          {portfolio.hero_subtitle && (
                            <p className="text-xl md:text-2xl mb-8 opacity-90" style={{ color: theme.colors.text }}>
                              {portfolio.hero_subtitle}
                            </p>
                          )}
                        </>
                      ) : (
                        <h1 className="text-5xl md:text-7xl font-extrabold mb-4" style={{ color: theme.colors.heading }}>
                          {portfolio.artist_name || 'Artist Name'}
                        </h1>
                      )}
                      {portfolio.hero_cta_text && portfolio.hero_cta_link && (
                        <a
                          href={portfolio.hero_cta_link}
                          className="inline-block px-8 py-3 bg-white text-black font-bold rounded-full text-lg hover:bg-opacity-90 transition-all duration-300"
                          style={{ backgroundColor: theme.colors.primary, color: theme.colors.background }}
                        >
                          {portfolio.hero_cta_text}
                        </a>
                      )}
                    </div>
                  </div>
                )}
                {key === 'about' && renderAbout(portfolio)}
                {key === 'tracks' && renderTracks(portfolio, tracks)}
                {key === 'gallery' && renderGallery(portfolio, galleryItems)}
                {key === 'skills' && renderSkills(portfolio)}
                {key === 'hobbies' && renderHobbies(portfolio)}
                {key === 'contact' && renderContact(portfolio)}
                {key === 'resume' && renderResume(portfolio)}
                {key === 'press' && renderPress(portfolio)}
                {key === 'key_projects' && renderKeyProjects(portfolio)}
                {key === 'testimonials' && renderTestimonials(portfolio)}
                {key === 'blog' && renderBlog(portfolio)}
                {key === 'status' && renderStatus(portfolio)}
              </section>
            ))}
          {/* Render the footer at the end if enabled */}
          {(portfolio.sections_config?.footer?.enabled ?? true) && renderFooter(portfolio)}
        </div>
      </main>
    </div>
  );
} 