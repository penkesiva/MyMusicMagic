"use client";
import { supabase } from '@/lib/supabase/client';
import { Database } from '@/types/database';
import Image from 'next/image';
import {
  Play, Mail, Music, Image as ImageIcon, User, ArrowRight, ExternalLink, Globe, FileText, Briefcase, Award, Star, Phone, MapPin
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
import { useState, useEffect } from 'react';
import AudioPlayer from '@/app/components/AudioPlayer';
import PortfolioGalleryDisplay from '@/components/portfolio/PortfolioGalleryDisplay';

// Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

type PageProps = {
  params: { id: string };
};

type Track = Database['public']['Tables']['tracks']['Row'];
type GalleryItem = Database['public']['Tables']['gallery']['Row'];

export default function PortfolioPreviewPage({ params }: PageProps) {
  console.log('🎯 Preview route called with ID:', params.id);
  console.log('⏰ Timestamp:', new Date().toISOString());
  
  // State for data fetching
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Audio player state
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPlayer, setShowPlayer] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get the portfolio by ID (allows unpublished portfolios for preview)
        const { data: portfolioData, error: portfolioError } = await supabase
          .from('user_portfolios')
          .select('*')
          .eq('id', params.id)
          .single();

        if (portfolioError || !portfolioData) {
          console.error('❌ Portfolio not found:', portfolioError);
          setError('Portfolio not found');
          return;
        }

        console.log('✅ Portfolio found:', portfolioData.name);
        console.log('📊 Portfolio data:', portfolioData);
        setPortfolio(portfolioData);

        // Get user profile for the portfolio
        const { data: userProfileData, error: userError } = await supabase
          .from('user_profiles')
          .select('id, username, full_name')
          .eq('id', portfolioData.user_id)
          .single();

        if (userError || !userProfileData) {
          setError('User profile not found');
          return;
        }

        setUserProfile(userProfileData);

        // Fetch tracks
        const { data: tracksData, error: tracksError } = await supabase
          .from('tracks')
          .select('*')
          .eq('portfolio_id', portfolioData.id)
          .order('order', { ascending: true });

        if (tracksError) {
          console.error('Error fetching tracks:', tracksError);
        } else {
          setTracks(tracksData || []);
        }

        // Fetch gallery items
        const { data: galleryItemsData, error: galleryError } = await supabase
          .from('gallery')
          .select('*')
          .eq('portfolio_id', portfolioData.id)
          .order('created_at', { ascending: true });

        if (galleryError) {
          console.error('Error fetching gallery items:', galleryError);
        } else {
          setGalleryItems(galleryItemsData || []);
        }

        console.log('Tracks data:', tracksData, 'Error:', tracksError);
        console.log('Gallery items:', galleryItemsData, 'Error:', galleryError);

      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load portfolio');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading portfolio...</div>
      </div>
    );
  }

  // Show error state
  if (error || !portfolio) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">{error || 'Portfolio not found'}</div>
      </div>
    );
  }

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
    const hobbies = safeGetArray(portfolio.hobbies_json);
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
    const skills = safeGetArray(portfolio.skills_json);
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
                  theme={theme}
                  onPlay={handlePlay}
                  onInfo={() => {}}
                  isPlaying={currentTrack?.id === track.id && isPlaying}
                />
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400">
              <Music className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No tracks added yet.</p>
              <p className="text-sm mt-2">Add your music tracks to showcase your work.</p>
            </div>
          )}
        </div>
      </section>
    );
  };

  const renderGallery = (portfolio: Portfolio, galleryItems: GalleryItem[]) => {
    const sectionTitle = (portfolio.sections_config as any)?.gallery?.name || SECTIONS_CONFIG['gallery'].defaultName;
    const [tab, setTab] = useState<'photo' | 'video'>('photo');
    // Filter items by tab
    const filteredItems = galleryItems.filter(item => {
      if (tab === 'photo') return item.media_type === 'image';
      if (tab === 'video') return item.media_type === 'video';
      return true;
    });
    return (
      <section id="gallery" className={`${theme.colors.background} ${theme.colors.text} py-20 px-4 md:px-8`}>
        <div className="container mx-auto">
          <h2 className={`text-4xl font-bold mb-12 text-center ${theme.colors.heading}`}>{sectionTitle}</h2>
          {/* Tabs for Photos and Videos */}
          <div className="flex justify-center gap-4 mb-6">
            <button
              className={`px-6 py-2 rounded-full font-semibold transition-all ${tab === 'photo' ? 'bg-purple-600 text-white shadow' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}
              onClick={() => setTab('photo')}
            >
              Photos
            </button>
            <button
              className={`px-6 py-2 rounded-full font-semibold transition-all ${tab === 'video' ? 'bg-purple-600 text-white shadow' : 'bg-white/10 text-white/60 hover:bg-white/20'}`}
              onClick={() => setTab('video')}
            >
              Videos
            </button>
          </div>
          {/* Grid display */}
          {filteredItems.length === 0 ? (
            <div className="text-center p-8 border-2 border-dashed border-white/20 rounded-lg">
              <h3 className="text-lg font-semibold text-white/80">No {tab === 'photo' ? 'Photos' : 'Videos'} Found</h3>
              <p className="text-sm text-white/50 mt-2">
                {tab === 'photo' ? 'Add your first photo to get started.' : 'No videos found. Try uploading a video.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {filteredItems.map((item) => (
                <div key={item.id} className="bg-white/5 rounded-xl overflow-hidden border border-white/10 group flex flex-col">
                  {/* Image/Video Preview */}
                  <div className="relative aspect-square w-full min-h-[220px] max-h-[320px]">
                    <img src={item.image_url} alt={item.title} className="w-full h-full object-cover"/>
                    {item.media_type === 'video' && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                        <div className="w-14 h-14 bg-purple-500 rounded-full flex items-center justify-center shadow-lg">
                          <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                        </div>
                      </div>
                    )}
                    {/* Optional: Featured badge */}
                    {Boolean((item as any)['is_featured']) ? (
                      <span className="absolute top-3 left-3 bg-gradient-to-r from-purple-500 to-pink-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow">Featured</span>
                    ) : null}
                  </div>
                  {/* Content */}
                  <div className="p-3 flex-1 flex flex-col justify-between">
                    <h4 className="font-medium text-sm mb-1 line-clamp-1 text-white">{item.title}</h4>
                    <p className="text-gray-400 text-xs mb-2 line-clamp-2">{item.description}</p>
                    <div className="flex justify-between items-center mt-auto">
                      <p className="text-gray-500 text-xs">{new Date(item.created_at).toLocaleDateString()}</p>
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        item.media_type === 'video' ? 'bg-blue-900/20 text-blue-300 border border-blue-500/20' : 'bg-green-900/20 text-green-300 border border-green-500/20'
                      }`}>{item.media_type === 'video' ? 'Video' : 'Image'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
    const sectionTitle = portfolio.contact_title || (portfolio.sections_config as any)?.contact?.name || SECTIONS_CONFIG['contact'].defaultName;
    return (
      <section id="contact" className={`${theme.colors.background} ${theme.colors.text} py-20 px-4 md:px-8`}>
        <div className="container mx-auto text-center">
          <h2 className={`text-4xl font-bold mb-12 text-center ${theme.colors.heading}`}>{sectionTitle}</h2>
          {portfolio.contact_description && (
            <p className={`${colors.text} text-lg max-w-2xl mx-auto mb-8`}>{portfolio.contact_description}</p>
          )}
          <div className="flex flex-col items-center gap-4 mb-8">
            {portfolio.contact_email && (
              <a href={`mailto:${portfolio.contact_email}`} className={`flex items-center gap-2 text-xl font-semibold ${colors.primaryStrong} hover:underline`}><Mail className="w-5 h-5" />{portfolio.contact_email}</a>
            )}
            {portfolio.contact_phone && (
              <a href={`tel:${portfolio.contact_phone}`} className={`flex items-center gap-2 text-lg ${colors.text} hover:${colors.primaryStrong}`}><Phone className="w-5 h-5" />{portfolio.contact_phone}</a>
            )}
            {portfolio.contact_location && (
              <div className={`flex items-center gap-2 text-lg ${colors.text}`}><MapPin className="w-5 h-5" />{portfolio.contact_location}</div>
            )}
            {portfolio.website_url && (
              <a href={portfolio.website_url} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 text-lg ${colors.text} hover:${colors.primaryStrong}`}><Globe className="w-5 h-5" />{portfolio.website_url}</a>
            )}
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {portfolio.linkedin_url && <a href={portfolio.linkedin_url} target="_blank" rel="noopener noreferrer" className={`${colors.text} hover:${colors.primary}`} title="LinkedIn"><FaLinkedin className="w-6 h-6"/></a>}
            {portfolio.twitter_url && <a href={portfolio.twitter_url} target="_blank" rel="noopener noreferrer" className={`${colors.text} hover:${colors.primary}`} title="Twitter"><FaTwitter className="w-6 h-6"/></a>}
            {portfolio.instagram_url && <a href={portfolio.instagram_url} target="_blank" rel="noopener noreferrer" className={`${colors.text} hover:${colors.primary}`} title="Instagram"><FaInstagram className="w-6 h-6"/></a>}
            {portfolio.github_url && <a href={portfolio.github_url} target="_blank" rel="noopener noreferrer" className={`${colors.text} hover:${colors.primary}`} title="GitHub"><FaGithub className="w-6 h-6"/></a>}
            {portfolio.youtube_url && <a href={portfolio.youtube_url} target="_blank" rel="noopener noreferrer" className={`${colors.text} hover:${colors.primary}`} title="YouTube"><FaYoutube className="w-6 h-6"/></a>}
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

  // Audio player handlers
  const handlePlay = (track: Track) => {
    if (currentTrack?.id === track.id) {
      setIsPlaying(!isPlaying);
      return;
    }

    setCurrentTrack(track);
    setShowPlayer(true);
    setIsPlaying(true);
  };

  const handleClose = () => {
    setShowPlayer(false);
    setIsPlaying(false);
    setCurrentTrack(null);
  };

  return (
    <div className={`min-h-screen ${theme.colors.background} overflow-x-hidden`}>
      {/* Preview Banner */}
      <div className="bg-yellow-500 text-yellow-900 px-4 py-2 text-center text-sm font-medium">
        🎯 PREVIEW MODE - This is how your portfolio will look when published
      </div>
      
      <main className="relative">
        {/* Main sections rendering with improved layout */}
        {sortedSections
          .filter(key => key !== 'footer')
          .map((key, index) => (
            <section key={key} id={key} className="scroll-mt-20">
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
                    {safeGetArray(portfolio.hero_cta_buttons).length > 0 && (
                      <div className="flex flex-wrap justify-center gap-6">
                        {safeGetArray(portfolio.hero_cta_buttons).map((button: any, btnIndex: number) => (
                          <a
                            key={btnIndex}
                            href={button.url || '#'}
                            className={`inline-flex items-center px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 ${btnIndex === 0 ? 'bg-white text-gray-900 hover:bg-gray-100' : 'border-2 border-white text-white hover:bg-white hover:text-gray-900'}`}
                          >
                            {button.text}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  {/* Floating decorative elements */}
                  <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse"></div>
                  <div className="absolute bottom-20 right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse delay-1000"></div>
                </div>
              )}

              {key === 'about' && renderAbout(portfolio)}
              {key === 'tracks' && renderTracks(portfolio, tracks)}
              {key === 'gallery' && <PortfolioGalleryDisplay portfolioId={portfolio.id} viewMode="grid" filter="all" />}
              {key === 'hobbies' && renderHobbies(portfolio)}
              {key === 'skills' && renderSkills(portfolio)}
              {key === 'press' && renderPress(portfolio)}
              {key === 'key_projects' && renderKeyProjects(portfolio)}
              {key === 'resume' && renderResume(portfolio)}
              {key === 'contact' && renderContact(portfolio)}
              {key === 'testimonials' && renderTestimonials(portfolio)}
              {key === 'blog' && renderBlog(portfolio)}
              {key === 'status' && renderStatus(portfolio)}
            </section>
          ))}

        {/* Footer */}
        {sortedSections.includes('footer') && (
          <footer className={`${theme.colors.background} ${theme.colors.text} py-16 px-4 md:px-8 border-t border-white/10`}>
            <div className="container mx-auto text-center">
              <div className="grid md:grid-cols-3 gap-8 items-start">
                <div className="text-left">
                  <h3 className={`text-2xl font-bold mb-4 ${theme.colors.heading}`}>{portfolio.artist_name}</h3>
                  {portfolio.footer_about_summary && (
                    <p className={`${theme.colors.text} opacity-80 leading-relaxed`}>{portfolio.footer_about_summary}</p>
                  )}
                </div>
                <div className="text-center">
                  <h4 className={`text-lg font-semibold mb-4 ${theme.colors.heading}`}>Quick Links</h4>
                  <div className="flex flex-col gap-2">
                    {sortedSections.filter(s => s !== 'hero' && s !== 'footer').map(section => (
                      <a key={section} href={`#${section}`} className={`${theme.colors.text} hover:${theme.colors.primary} transition-colors`}>
                        {SECTIONS_CONFIG[section]?.defaultName || section}
                      </a>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <h4 className={`text-lg font-semibold mb-4 ${theme.colors.heading}`}>Connect</h4>
                  <div className="flex justify-end gap-4">
                    {portfolio.linkedin_url && <a href={portfolio.linkedin_url} target="_blank" rel="noopener noreferrer" className={`${theme.colors.text} hover:${theme.colors.primary} transition-colors`} title="LinkedIn"><FaLinkedin className="w-5 h-5"/></a>}
                    {portfolio.twitter_url && <a href={portfolio.twitter_url} target="_blank" rel="noopener noreferrer" className={`${theme.colors.text} hover:${theme.colors.primary} transition-colors`} title="Twitter"><FaTwitter className="w-5 h-5"/></a>}
                    {portfolio.instagram_url && <a href={portfolio.instagram_url} target="_blank" rel="noopener noreferrer" className={`${theme.colors.text} hover:${theme.colors.primary} transition-colors`} title="Instagram"><FaInstagram className="w-5 h-5"/></a>}
                    {portfolio.github_url && <a href={portfolio.github_url} target="_blank" rel="noopener noreferrer" className={`${theme.colors.text} hover:${theme.colors.primary} transition-colors`} title="GitHub"><FaGithub className="w-5 h-5"/></a>}
                    {portfolio.youtube_url && <a href={portfolio.youtube_url} target="_blank" rel="noopener noreferrer" className={`${theme.colors.text} hover:${theme.colors.primary} transition-colors`} title="YouTube"><FaYoutube className="w-5 h-5"/></a>}
                  </div>
                </div>
              </div>
              <div className="mt-12 pt-8 border-t border-white/10">
                <p className={`${theme.colors.text} opacity-60`}>© 2024 {portfolio.artist_name}. All rights reserved.</p>
              </div>
            </div>
          </footer>
        )}
      </main>

      {/* Audio Player */}
      {showPlayer && currentTrack && (
        <div className="fixed bottom-0 left-0 right-0 bg-transparent p-4 z-50">
          <div className="relative">
            <AudioPlayer
              audioUrl={currentTrack.audio_url}
              title={currentTrack.title}
              onPlay={() => {
                console.log('AudioPlayer: Play requested');
                setIsPlaying(true);
              }}
              onPause={() => {
                console.log('AudioPlayer: Pause requested');
                setIsPlaying(false);
              }}
              onClose={handleClose}
              isPlaying={isPlaying}
              onTrackEnd={() => setIsPlaying(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}