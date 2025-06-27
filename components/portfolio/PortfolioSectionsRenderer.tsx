import React from 'react';
import Image from 'next/image';
import { SECTIONS_CONFIG } from '@/lib/sections';
import { THEMES } from '@/lib/themes';
import { Portfolio } from '@/types/portfolio';
import { TrackCard } from '@/app/components/tracks/TrackCard';
import AudioPlayer from '@/app/components/AudioPlayer';
import PortfolioGalleryDisplay from '@/components/portfolio/PortfolioGalleryDisplay';
import PressMentionsDisplay from '@/components/portfolio/PressMentionsDisplay';
import { HOBBIES_LIST } from '@/lib/hobbies';
import { SKILLS_LIST } from '@/lib/skills';
import { FaTwitter, FaGithub, FaLinkedin, FaInstagram, FaFacebook, FaYoutube, FaSoundcloud, FaSpotify, FaApple } from 'react-icons/fa';
import { Globe } from 'lucide-react';

// Add other imports as needed (skills, hobbies, etc.)

interface PortfolioSectionsRendererProps {
  portfolio: Portfolio;
  tracks: any[];
  galleryItems: any[];
  theme: any;
  showPreviewBanner?: boolean;
}

const PortfolioSectionsRenderer: React.FC<PortfolioSectionsRendererProps> = ({
  portfolio,
  tracks,
  galleryItems,
  theme,
  showPreviewBanner = false,
}) => {
  let sortedSections: string[] = [];
  if (portfolio.sections_config) {
    let sectionsArray: string[] = [];
    if (Array.isArray(portfolio.sections_config)) {
      sectionsArray = portfolio.sections_config;
    } else if (typeof portfolio.sections_config === 'object') {
      sectionsArray = Object.keys(portfolio.sections_config).filter(key => (portfolio.sections_config as any)[key]?.enabled === true);
    } else if (typeof portfolio.sections_config === 'string') {
      try {
        const parsed = JSON.parse(portfolio.sections_config);
        if (Array.isArray(parsed)) {
          sectionsArray = parsed;
        } else if (typeof parsed === 'object') {
          sectionsArray = Object.keys(parsed).filter(key => parsed[key]?.enabled === true);
        }
      } catch (e) {
        sectionsArray = [];
      }
    }
    const validSections = sectionsArray.filter(key => SECTIONS_CONFIG[key]) || [];
    sortedSections = validSections.sort((a, b) => {
      const orderA = (portfolio.sections_config as any)?.[a]?.order ?? SECTIONS_CONFIG[a]?.defaultOrder ?? 999;
      const orderB = (portfolio.sections_config as any)?.[b]?.order ?? SECTIONS_CONFIG[b]?.defaultOrder ?? 999;
      return orderA - orderB;
    });
  }

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

  return (
    <div className={`min-h-screen ${theme.colors.background} overflow-x-hidden`}>
      {showPreviewBanner && (
        <div className="bg-yellow-500 text-yellow-900 px-4 py-2 text-center text-sm font-medium">
          🎯 PREVIEW MODE - This is how your portfolio will look when published
        </div>
      )}
      <main className="relative">
        {sortedSections.filter(key => key !== 'footer').map((key, index) => (
          <section key={key} id={key} className="scroll-mt-20">
            {/* Example: Hero Section */}
            {key === 'hero' && (
              <div className="relative w-full min-h-[90vh] flex items-center justify-center text-center p-4 overflow-hidden">
                {portfolio.hero_image_url && (
                  <Image
                    src={portfolio.hero_image_url}
                    alt={portfolio.hero_title || 'Hero image'}
                    fill
                    className="object-cover brightness-50"
                  />
                )}
                <div className="relative z-10 text-white max-w-4xl mx-auto">
                  {portfolio.hero_title && (
                    <h1 className="text-6xl md:text-8xl font-extrabold mb-6 leading-tight" style={{ color: theme.colors.heading }}>
                      {portfolio.hero_title}
                    </h1>
                  )}
                  {portfolio.hero_subtitle && (
                    <p className="text-xl md:text-2xl mb-12 opacity-90 max-w-2xl mx-auto leading-relaxed" style={{ color: theme.colors.text }}>
                      {portfolio.hero_subtitle}
                    </p>
                  )}
                  {/* Add CTA buttons if needed */}
                </div>
              </div>
            )}
            {/* Add other section renderings here, e.g. about, tracks, gallery, press, etc. */}
            {key === 'gallery' && <PortfolioGalleryDisplay portfolioId={portfolio.id} viewMode="grid" filter="all" />}
            {key === 'press' && <PressMentionsDisplay portfolioId={portfolio.id} theme={theme} layout="featured" />}
            {key === 'about' && (
              <section id="about" className={`${theme.colors.background} ${theme.colors.text} py-20 px-4 md:px-8`}>
                <div className="container mx-auto flex flex-col md:flex-row items-center gap-12">
                  {portfolio.profile_photo_url && (
                    <div className="flex-shrink-0 w-48 h-48 relative rounded-full overflow-hidden border-4 border-white/20 shadow-lg">
                      <Image src={portfolio.profile_photo_url} alt="Profile" fill className="object-cover" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h2 className={`text-4xl font-bold mb-6 ${theme.colors.heading}`}>{portfolio.about_title || SECTIONS_CONFIG['about'].defaultName}</h2>
                    <p className={`${theme.colors.text} text-lg leading-relaxed whitespace-pre-line`}>{portfolio.about_text}</p>
                  </div>
                </div>
              </section>
            )}
            {key === 'tracks' && (
              <section id="tracks" className={`${theme.colors.background} ${theme.colors.text} py-20 px-4 md:px-8`}>
                <div className="container mx-auto">
                  <h2 className={`text-4xl font-bold mb-12 text-center ${theme.colors.heading}`}>{SECTIONS_CONFIG['tracks'].defaultName}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {tracks.map((track: any) => (
                      <TrackCard key={track.id} track={track} theme={theme} />
                    ))}
                  </div>
                </div>
              </section>
            )}
            {key === 'hobbies' && (
              <section id="hobbies" className={`${theme.colors.background} ${theme.colors.text} py-20 px-4 md:px-8`}>
                <div className="container mx-auto">
                  <h2 className={`text-4xl font-bold mb-12 text-center ${theme.colors.heading}`}>{portfolio.hobbies_title || SECTIONS_CONFIG['hobbies'].defaultName}</h2>
                  <div className="flex flex-wrap justify-center gap-6">
                    {safeGetArray(portfolio.hobbies_json)?.map((hobby: any) => (
                      <div key={hobby.name} className="flex flex-col items-center gap-2 p-4 bg-white/10 rounded-lg w-32">
                        <span className="text-4xl">{hobby.icon}</span>
                        <span className="text-sm font-medium text-center">{hobby.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </section>
            )}
            {key === 'skills' && (
              <section id="skills" className={`${theme.colors.background} ${theme.colors.text} py-20 px-4 md:px-8`}>
                <div className="container mx-auto">
                  <h2 className={`text-4xl font-bold mb-12 text-center ${theme.colors.heading}`}>{portfolio.skills_title || SECTIONS_CONFIG['skills'].defaultName}</h2>
                  <div className="flex flex-wrap justify-center gap-4">
                    {safeGetArray(portfolio.skills_json)?.map((skill: any) => (
                      <span key={skill.name} className="px-4 py-2 rounded-full bg-white/10 text-sm font-medium" style={{ color: skill.color }}>{skill.name}</span>
                    ))}
                  </div>
                </div>
              </section>
            )}
            {key === 'contact' && (
              <section id="contact" className={`${theme.colors.background} ${theme.colors.text} py-20 px-4 md:px-8`}>
                <div className="container mx-auto max-w-2xl">
                  <h2 className={`text-4xl font-bold mb-8 text-center ${theme.colors.heading}`}>{portfolio.contact_title || SECTIONS_CONFIG['contact'].defaultName}</h2>
                  <p className="text-lg mb-8 text-center">{portfolio.contact_description}</p>
                  <div className="flex flex-col gap-4 items-center">
                    {portfolio.contact_email && <a href={`mailto:${portfolio.contact_email}`} className="text-blue-400 hover:underline">{portfolio.contact_email}</a>}
                    {portfolio.contact_phone && <span>{portfolio.contact_phone}</span>}
                    {portfolio.contact_location && <span>{portfolio.contact_location}</span>}
                    <div className="flex gap-4 mt-4">
                      {portfolio.twitter_url && <a href={portfolio.twitter_url} target="_blank" rel="noopener noreferrer" className="text-blue-400"><FaTwitter className="w-6 h-6" /></a>}
                      {portfolio.instagram_url && <a href={portfolio.instagram_url} target="_blank" rel="noopener noreferrer" className="text-pink-400"><FaInstagram className="w-6 h-6" /></a>}
                      {portfolio.linkedin_url && <a href={portfolio.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-700"><FaLinkedin className="w-6 h-6" /></a>}
                      {portfolio.github_url && <a href={portfolio.github_url} target="_blank" rel="noopener noreferrer" className="text-gray-400"><FaGithub className="w-6 h-6" /></a>}
                      {portfolio.youtube_url && <a href={portfolio.youtube_url} target="_blank" rel="noopener noreferrer" className="text-red-500"><FaYoutube className="w-6 h-6" /></a>}
                      {portfolio.website_url && <a href={portfolio.website_url} target="_blank" rel="noopener noreferrer" className="text-green-400"><Globe className="w-6 h-6" /></a>}
                    </div>
                  </div>
                </div>
              </section>
            )}
            {/* ...repeat for all other sections, using the same logic as before... */}
          </section>
        ))}
        {/* Footer */}
        {sortedSections.includes('footer') && (
          <footer className={`${theme.colors.background} ${theme.colors.text} py-16 px-4 md:px-8 border-t border-white/10`}>
            <div className="container mx-auto text-center">
              {/* Footer content here */}
              <div className="mt-12 pt-8 border-t border-white/10">
                <p className={`${theme.colors.text} opacity-60`}>© 2024 {portfolio.artist_name}. All rights reserved.</p>
              </div>
            </div>
          </footer>
        )}
      </main>
    </div>
  );
};

export default PortfolioSectionsRenderer; 