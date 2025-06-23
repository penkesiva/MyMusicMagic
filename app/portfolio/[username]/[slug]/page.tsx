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

type PageProps = {
  params: { username: string; slug: string };
};

type Track = Database['public']['Tables']['tracks']['Row'];
type GalleryItem = Database['public']['Tables']['gallery']['Row'];

export default async function PortfolioPage({ params }: PageProps) {
  // First, get the user profile by username
  const { data: userProfile, error: userError } = await supabase
    .from('user_profiles')
    .select('id, username, full_name')
    .eq('username', params.username)
    .single();

  if (userError || !userProfile) {
    notFound();
  }

  // Then get the portfolio for that specific user
  const { data: portfolio, error: portfolioError } = await supabase
    .from('user_portfolios')
    .select('*')
    .eq('user_id', userProfile.id)
    .eq('slug', params.slug)
    .eq('is_published', true)
    .single();

  if (portfolioError || !portfolio) {
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
      // If it's an object, extract the keys
      sectionsArray = Object.keys(portfolio.sections_config);
    } else if (typeof portfolio.sections_config === 'string') {
      // If it's a string, try to parse it
      try {
        const parsed = JSON.parse(portfolio.sections_config);
        sectionsArray = Array.isArray(parsed) ? parsed : Object.keys(parsed || {});
      } catch (e) {
        sectionsArray = [];
      }
    }
    
    sortedSections = sectionsArray.filter(key => SECTIONS_CONFIG[key]?.enabled) || [];
  }

  const theme = THEMES.find(t => t.name === portfolio?.theme_name) || THEMES[0];
  const colors = theme.colors;

  const renderHobbies = (portfolio: Portfolio) => {
    if (!portfolio.hobbies_title || !portfolio.hobbies_json || (portfolio.hobbies_json as any[]).length === 0) return null;
    
    return <section id="hobbies" className={`${theme.colors.background} ${theme.colors.text} py-20 px-4 md:px-8`}>
      <div className="container mx-auto">
        <h2 className={`text-4xl font-bold mb-12 text-center ${theme.colors.heading}`}>{portfolio.hobbies_title || 'Hobbies & Interests'}</h2>
        <div className="flex flex-wrap justify-center gap-6">
          {(portfolio.hobbies_json as any[])?.map((hobby: any) => (
            <div key={hobby.name} className="flex flex-col items-center gap-2 p-4 bg-white/10 rounded-lg w-32">
              <span className="text-4xl">{hobby.icon}</span>
              <span className="text-sm font-medium text-center">{hobby.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>;
  };

  const renderSkills = (portfolio: Portfolio) => {
    if (!portfolio.skills_title || !portfolio.skills_json || (portfolio.skills_json as any[]).length === 0) return null;
    
    return (
      <section id="skills" className={`${theme.colors.background} ${theme.colors.text} py-20 px-4 md:px-8`}>
        <div className="container mx-auto">
          <h2 className={`text-4xl font-bold mb-12 text-center ${theme.colors.heading}`}>{portfolio.skills_title || 'Skills & Tools'}</h2>
          <div className="flex flex-wrap justify-center items-center gap-6">
            {(portfolio.skills_json as any[])?.map((skill: any) => {
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
        </div>
      </section>
    );
  };
  
  const renderAbout = (portfolio: Portfolio) => {
    if (!portfolio.about_text) return null;
    return (
      <section id="about" className={`${theme.colors.background} ${theme.colors.text} py-20 px-4 md:px-8`}>
        <div className="container mx-auto">
          <h2 className={`text-4xl font-bold mb-12 text-center ${theme.colors.heading}`}>{portfolio.about_title || 'About Me'}</h2>
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
                <h2 className={`text-4xl font-bold ${colors.heading}`}>
                  {portfolio.about_title || 'About Me'}
                </h2>
              </div>
              <div className={`prose prose-lg max-w-none ${colors.text} ${colors.background === '#FFFFFF' ? 'prose-invert' : ''}`}>
                <p className="text-lg leading-relaxed whitespace-pre-wrap">{portfolio.about_text}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };

  const renderTracks = (portfolio: Portfolio, tracks: Track[]) => {
    if (tracks.length === 0) return null;
    return (
      <section id="tracks" className={`${theme.colors.background} ${theme.colors.text} py-20 px-4 md:px-8`}>
        <div className="container mx-auto">
          <h2 className={`text-4xl font-bold mb-12 text-center ${theme.colors.heading}`}>{SECTIONS_CONFIG['tracks'].defaultName}</h2>
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
        </div>
      </section>
    );
  };

  const renderGallery = (portfolio: Portfolio, galleryItems: GalleryItem[]) => {
    if (galleryItems.length === 0) return null;
    return (
      <section id="gallery" className={`${theme.colors.background} ${theme.colors.text} py-20 px-4 md:px-8`}>
        <div className="container mx-auto">
          <h2 className={`text-4xl font-bold mb-12 text-center ${theme.colors.heading}`}>{SECTIONS_CONFIG['gallery'].defaultName}</h2>
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
        </div>
      </section>
    );
  };

  const renderPress = (portfolio: Portfolio) => {
    return (
      <section id="press" className={`${theme.colors.background} ${theme.colors.text} py-20 px-4 md:px-8`}>
        <div className="container mx-auto">
          <h2 className={`text-4xl font-bold mb-12 text-center ${theme.colors.heading}`}>{SECTIONS_CONFIG['press'].defaultName}</h2>
          <p className={`${colors.text} text-lg max-w-2xl mx-auto`}>Coming Soon</p>
        </div>
      </section>
    );
  };

  const renderKeyProjects = (portfolio: Portfolio) => {
    return (
      <section id="key_projects" className={`${theme.colors.background} ${theme.colors.text} py-20 px-4 md:px-8`}>
        <div className="container mx-auto">
          <h2 className={`text-4xl font-bold mb-12 text-center ${theme.colors.heading}`}>{SECTIONS_CONFIG['key_projects'].defaultName}</h2>
          <p className={`${colors.text} text-lg max-w-2xl mx-auto`}>Coming Soon</p>
        </div>
      </section>
    );
  };

  const renderResume = (portfolio: Portfolio) => {
    if (!portfolio.resume_url) return null;
    return (
      <section id="resume" className={`${theme.colors.background} ${theme.colors.text} py-20 px-4 md:px-8`}>
        <div className="container mx-auto text-center">
          <h2 className={`text-4xl font-bold mb-12 text-center ${theme.colors.heading}`}>{SECTIONS_CONFIG['resume'].defaultName}</h2>
          <a href={portfolio.resume_url} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 ${colors.primary} hover:scale-105`}>
            Download My Resume
          </a>
        </div>
      </section>
    );
  };

  const renderContact = (portfolio: Portfolio) => {
    return (
      <section id="contact" className={`${theme.colors.background} ${theme.colors.text} py-20 px-4 md:px-8`}>
        <div className="container mx-auto text-center">
          <h2 className={`text-4xl font-bold mb-12 text-center ${theme.colors.heading}`}>{SECTIONS_CONFIG['contact'].defaultName}</h2>
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

  return (
    <div className={`min-h-screen ${theme.colors.background}`}>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-24 md:space-y-32 py-8 md:py-16">
          {sortedSections.map(key => (
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
                     <h1 className="text-5xl md:text-7xl font-extrabold mb-4" style={{ color: theme.colors.heading }}>
                       {portfolio.artist_name || 'Artist Name'}
                     </h1>
                     <p className="text-xl md:text-2xl mb-8 opacity-90" style={{ color: theme.colors.text }}>
                       {portfolio.hero_title || 'Welcome to my portfolio'}
                     </p>
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
              {key === 'key_projects' && renderKeyProjects(portfolio)}
              {key === 'press' && renderPress(portfolio)}
              {key === 'resume' && renderResume(portfolio)}
              {key === 'contact' && renderContact(portfolio)}
            </section>
          ))}
          {renderHobbies(portfolio)}
          {renderSkills(portfolio)}
        </div>
      </main>
      <footer className={`py-12 mt-20 border-t ${colors.card} border-opacity-20`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm">
            {portfolio.footer_text || `© ${new Date().getFullYear()} ${portfolio.artist_name}. All rights reserved.`}
          </p>
        </div>
      </footer>
    </div>
  );
} 