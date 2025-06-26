"use client";
import { supabase } from '@/lib/supabase/client';
import { Database } from '@/types/database';
import Image from 'next/image';
import {
  Play, Mail, Music, Image as ImageIcon, User, ArrowRight, ExternalLink, Globe, FileText, Briefcase, Award, Star, Phone, MapPin, Calendar, Pause
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

type PageProps = {
  params: { username: string; slug: string };
};

type Track = Database['public']['Tables']['tracks']['Row'];
type GalleryItem = Database['public']['Tables']['gallery']['Row'];

export default function PortfolioPage({ params }: PageProps) {
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

        // First, get the user profile by username
        const { data: userProfileData, error: userError } = await supabase
          .from('user_profiles')
          .select('id, username, full_name')
          .eq('username', params.username)
          .single();

        if (userError || !userProfileData) {
          setError('User not found');
          return;
        }

        setUserProfile(userProfileData);

        // Then get the portfolio for that specific user
        const { data: portfolioData, error: portfolioError } = await supabase
          .from('user_portfolios')
          .select('*')
          .eq('user_id', userProfileData.id)
          .eq('slug', params.slug)
          .eq('is_published', true)
          .single();

        if (portfolioError || !portfolioData) {
          setError('Portfolio not found');
          return;
        }

        setPortfolio(portfolioData);

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

      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load portfolio');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [params.username, params.slug]);

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
  console.log('🔍 Portfolio Debug Info:');
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
    if (!portfolio.hobbies_title || !portfolio.hobbies_json || safeGetArray(portfolio.hobbies_json).length === 0) return null;
    
    const sectionTitle = (portfolio.sections_config as any)?.hobbies?.name || portfolio.hobbies_title || SECTIONS_CONFIG['hobbies'].defaultName;
    
    return <section id="hobbies" className={`${theme.colors.background} ${theme.colors.text} py-20 px-4 md:px-8`}>
      <div className="container mx-auto">
        <h2 className={`text-4xl font-bold mb-12 text-center ${theme.colors.heading}`}>{sectionTitle}</h2>
        <div className="flex flex-wrap justify-center gap-6">
          {safeGetArray(portfolio.hobbies_json)?.map((hobby: any) => (
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
    if (!portfolio.skills_title || !portfolio.skills_json || safeGetArray(portfolio.skills_json).length === 0) return null;
    
    const sectionTitle = (portfolio.sections_config as any)?.skills?.name || portfolio.skills_title || SECTIONS_CONFIG['skills'].defaultName;
    
    return (
      <section id="skills" className={`${theme.colors.background} ${theme.colors.text} py-32 px-4 md:px-8 relative overflow-hidden`}>
        {/* Background decorative elements */}
        <div className="absolute top-1/3 left-0 w-80 h-80 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/3 right-0 w-96 h-96 bg-gradient-to-tl from-purple-500/5 to-pink-500/5 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className={`text-5xl md:text-6xl font-bold mb-6 ${theme.colors.heading}`}>{sectionTitle}</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto rounded-full mb-8"></div>
            <p className={`text-xl ${theme.colors.text} opacity-80 max-w-2xl mx-auto`}>
              My technical expertise and creative skills that bring ideas to life
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {safeGetArray(portfolio.skills_json)?.map((skill: any, index: number) => {
              const skillDef = SKILLS_LIST.find(s => s.name === skill.name);
              const IconComponent = skillDef ? skillDef.icon : null;

              if (!IconComponent) return null;

              // Create varied card sizes for visual interest
              const isLarge = index % 5 === 0;
              const isMedium = index % 3 === 0;
              
              return (
                <div 
                  key={skill.name} 
                  className={`group relative ${isLarge ? 'md:col-span-2 lg:col-span-1' : ''} ${isMedium ? 'lg:col-span-2' : ''}`}
                >
                  <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 p-6 h-full">
                    {/* Skill icon with gradient background */}
                    <div className="relative mb-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center border border-white/10 group-hover:border-white/20 transition-colors">
                        <IconComponent className="h-8 w-8" style={{ color: skill.color || '#FFFFFF' }}/>
                      </div>
                      
                      {/* Floating glow effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>
                    
                    {/* Skill name */}
                    <h3 className={`text-lg font-bold mb-2 ${theme.colors.heading} group-hover:${theme.colors.primary} transition-colors`}>
                      {skill.name}
                    </h3>
                    
                    {/* Skill level indicator */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-1000"
                          style={{ width: `${(skill.level || 85)}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-white/60 font-medium">{skill.level || 85}%</span>
                    </div>
                    
                    {/* Skill description or category */}
                    {skill.category && (
                      <p className={`text-sm ${theme.colors.text} opacity-60`}>
                        {skill.category}
                      </p>
                    )}
                    
                    {/* Hover effect border */}
                    <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-white/20 transition-colors duration-500 pointer-events-none"></div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Skills summary */}
          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-8 px-8 py-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{safeGetArray(portfolio.skills_json).length}</div>
                <div className="text-sm text-white/60">Skills Mastered</div>
              </div>
              <div className="w-px h-12 bg-white/20"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">5+</div>
                <div className="text-sm text-white/60">Years Experience</div>
              </div>
              <div className="w-px h-12 bg-white/20"></div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">100+</div>
                <div className="text-sm text-white/60">Projects Completed</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };
  
  const renderAbout = (portfolio: Portfolio) => {
    if (!portfolio.about_text) return null;
    
    const sectionTitle = (portfolio.sections_config as any)?.about?.name || portfolio.about_title || SECTIONS_CONFIG['about'].defaultName;
    
    return (
      <section id="about" className={`${theme.colors.background} ${theme.colors.text} py-32 px-4 md:px-8 relative overflow-hidden`}>
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-tl from-blue-500/10 to-cyan-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className={`text-5xl md:text-6xl font-bold mb-6 ${theme.colors.heading}`}>{sectionTitle}</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            {portfolio.profile_photo_url && (
              <div className="lg:col-span-5 relative">
                <div className="relative group">
                  <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
                  <Image
                    src={portfolio.profile_photo_url}
                    alt={portfolio.artist_name || 'Artist profile photo'}
                    width={500}
                    height={600}
                    className="relative rounded-2xl aspect-[5/6] object-cover shadow-2xl transform group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
                
                {/* Floating stats or badges */}
                <div className="absolute -top-6 -right-6 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">5+</div>
                    <div className="text-sm text-white/80">Years Experience</div>
                  </div>
                </div>
              </div>
            )}
            
            <div className={portfolio.profile_photo_url ? "lg:col-span-7" : "lg:col-span-12"}>
              <div className="space-y-8">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <h3 className={`text-3xl font-bold ${theme.colors.heading}`}>About Me</h3>
                </div>
                
                <div className={`prose prose-lg max-w-none ${colors.text} ${colors.background === '#FFFFFF' ? 'prose-invert' : ''}`}>
                  <p className="text-xl leading-relaxed whitespace-pre-wrap opacity-90">{portfolio.about_text}</p>
                </div>
                
                {/* Call to action or additional info */}
                <div className="flex flex-wrap gap-4 pt-6">
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/20">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-sm">Available for projects</span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full border border-white/20">
                    <span className="text-sm">🎵 Music Producer</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };

  const renderTracks = (portfolio: Portfolio, tracks: Track[]) => {
    const sectionTitle = (portfolio.sections_config as any)?.tracks?.name || SECTIONS_CONFIG['tracks'].defaultName;
    
    return (
      <section id="tracks" className={`${theme.colors.background} ${theme.colors.text} py-32 px-4 md:px-8 relative overflow-hidden`}>
        {/* Background decorative elements */}
        <div className="absolute top-1/4 right-0 w-64 h-64 bg-gradient-to-bl from-purple-500/5 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-0 w-48 h-48 bg-gradient-to-tr from-pink-500/5 to-transparent rounded-full blur-3xl"></div>
        
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className={`text-5xl md:text-6xl font-bold mb-6 ${theme.colors.heading}`}>{sectionTitle}</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto rounded-full mb-8"></div>
            <p className={`text-xl ${theme.colors.text} opacity-80 max-w-2xl mx-auto`}>
              Explore my latest musical creations and discover the stories behind each track
            </p>
          </div>
          
          {tracks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {tracks.map((track, index) => (
                <div 
                  key={track.id} 
                  className={`group relative ${index % 3 === 0 ? 'md:col-span-2 lg:col-span-1' : ''} ${index % 4 === 0 ? 'lg:col-span-2' : ''}`}
                >
                  <div className="relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
                    {/* Track Image */}
                    <div className="relative aspect-square overflow-hidden">
                      <Image
                        src={track.thumbnail_url || '/default-track-thumbnail.jpg'}
                        alt={track.title || 'Track thumbnail'}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                      
                      {/* Play button overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30">
                          <Play className="w-8 h-8 text-white ml-1" />
                        </div>
                      </div>
                      
                      {/* Track duration badge */}
                      <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm rounded-full px-3 py-1 text-sm text-white">
                        {track.duration || '3:45'}
                      </div>
                    </div>
                    
                    {/* Track Info */}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className={`text-xl font-bold ${theme.colors.heading} group-hover:${theme.colors.primary} transition-colors`}>
                          {track.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          {/* Removed is_explicit and is_featured properties as they don't exist */}
                        </div>
                      </div>
                      
                      {track.description && (
                        <p className={`text-sm ${theme.colors.text} opacity-80 mb-4 line-clamp-2`}>
                          {track.description}
                        </p>
                      )}
                      
                      {/* Track metadata */}
                      <div className="flex items-center justify-between text-sm text-white/60">
                        <div className="flex items-center gap-4">
                          {track.release_date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(track.release_date).getFullYear()}
                            </span>
                          )}
                        </div>
                        
                        {/* Audio player controls */}
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handlePlay(track)}
                            className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
                          >
                            {currentTrack?.id === track.id && isPlaying ? (
                              <Pause className="w-4 h-4 text-white" />
                            ) : (
                              <Play className="w-4 h-4 text-white ml-0.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Hover effect border */}
                    <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-white/20 transition-colors duration-500 pointer-events-none"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Music className="w-12 h-12 text-white/50" />
              </div>
              <h3 className={`text-2xl font-bold mb-4 ${theme.colors.heading}`}>No tracks yet</h3>
              <p className={`${theme.colors.text} opacity-80 max-w-md mx-auto`}>
                Upload your first track to start sharing your music with the world.
              </p>
            </div>
          )}
        </div>
      </section>
    );
  };

  const renderGallery = (portfolio: Portfolio, galleryItems: GalleryItem[]) => {
    const sectionTitle = (portfolio.sections_config as any)?.gallery?.name || SECTIONS_CONFIG['gallery'].defaultName;
    
    return (
      <section id="gallery" className={`${theme.colors.background} ${theme.colors.text} py-32 px-4 md:px-8 relative overflow-hidden`}>
        {/* Background decorative elements */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-gradient-to-bl from-purple-500/5 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-gradient-to-tr from-pink-500/5 to-transparent rounded-full blur-3xl"></div>
        
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className={`text-5xl md:text-6xl font-bold mb-6 ${theme.colors.heading}`}>{sectionTitle}</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto rounded-full mb-8"></div>
            <p className={`text-xl ${theme.colors.text} opacity-80 max-w-2xl mx-auto`}>
              A visual journey through my creative work and artistic vision
            </p>
          </div>
          
          {galleryItems.length > 0 ? (
            <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
              {galleryItems.map((item, index) => {
                // Create varied heights for masonry effect
                const heightClass = index % 5 === 0 ? 'h-80' : 
                                  index % 3 === 0 ? 'h-64' : 
                                  index % 2 === 0 ? 'h-72' : 'h-56';
                
                return (
                  <div key={item.id} className={`group relative break-inside-avoid mb-6 ${heightClass} overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2`}>
                    <Image
                      src={item.image_url || '/default-track-thumbnail.jpg'}
                      alt={item.title || 'Gallery image'}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    {/* Content overlay */}
                    {item.title && (
                      <div className="absolute inset-0 flex items-end p-6 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0">
                        <div className="w-full">
                          <h3 className="text-white text-lg font-semibold mb-2">{item.title}</h3>
                          {item.description && (
                            <p className="text-white/80 text-sm line-clamp-2">{item.description}</p>
                          )}
                          
                          {/* Action buttons */}
                          <div className="flex items-center gap-3 mt-4">
                            <button className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 hover:bg-white/30 transition-colors">
                              <ImageIcon className="w-5 h-5 text-white" />
                            </button>
                            <button className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 hover:bg-white/30 transition-colors">
                              <ExternalLink className="w-5 h-5 text-white" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Floating badge for featured items */}
                    {index % 4 === 0 && (
                      <div className="absolute top-4 left-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-3 py-1 rounded-full font-medium">
                        Featured
                      </div>
                    )}
                    
                    {/* Hover effect border */}
                    <div className="absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-white/20 transition-colors duration-500 pointer-events-none"></div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <ImageIcon className="w-12 h-12 text-white/50" />
              </div>
              <h3 className={`text-2xl font-bold mb-4 ${theme.colors.heading}`}>Gallery empty</h3>
              <p className={`${theme.colors.text} opacity-80 max-w-md mx-auto`}>
                Add photos and videos to showcase your creative work and artistic vision.
              </p>
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
              <FileText className="w-6 h-6 mr-2" />
              Download My Resume
            </a>
          ) : (
            <div className="text-center text-gray-400">
              <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No resume uploaded yet.</p>
              <p className="text-sm mt-2">Upload your resume to share your professional experience.</p>
            </div>
          )}
        </div>
      </section>
    );
  };

  const renderContact = (portfolio: Portfolio) => {
    const sectionTitle = portfolio.contact_title || (portfolio.sections_config as any)?.contact?.name || SECTIONS_CONFIG['contact'].defaultName;
    
    return (
      <section id="contact" className={`${theme.colors.background} ${theme.colors.text} py-32 px-4 md:px-8 relative overflow-hidden`}>
        {/* Background decorative elements */}
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-gradient-to-br from-green-500/5 to-emerald-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/3 w-80 h-80 bg-gradient-to-tl from-blue-500/5 to-cyan-500/5 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto relative z-10">
          <div className="text-center mb-20">
            <h2 className={`text-5xl md:text-6xl font-bold mb-6 ${theme.colors.heading}`}>{sectionTitle}</h2>
            <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto rounded-full mb-8"></div>
            {portfolio.contact_description && (
              <p className={`text-xl ${theme.colors.text} opacity-80 max-w-3xl mx-auto leading-relaxed`}>
                {portfolio.contact_description}
              </p>
            )}
          </div>
          
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Contact Information */}
            <div className="space-y-8">
              <div className="text-center lg:text-left">
                <h3 className={`text-3xl font-bold mb-6 ${theme.colors.heading}`}>Let's Connect</h3>
                <p className={`text-lg ${theme.colors.text} opacity-80`}>
                  Ready to collaborate? I'm always excited to work on new projects and bring creative ideas to life.
                </p>
              </div>
              
              <div className="space-y-6">
                {portfolio.contact_email && (
                  <a 
                    href={`mailto:${portfolio.contact_email}`} 
                    className={`group flex items-center gap-4 p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-sm text-white/60 font-medium">Email</div>
                      <div className={`text-lg font-semibold ${theme.colors.primaryStrong} group-hover:${theme.colors.primary} transition-colors`}>
                        {portfolio.contact_email}
                      </div>
                    </div>
                  </a>
                )}
                
                {portfolio.contact_phone && (
                  <a 
                    href={`tel:${portfolio.contact_phone}`} 
                    className={`group flex items-center gap-4 p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Phone className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-sm text-white/60 font-medium">Phone</div>
                      <div className={`text-lg font-semibold ${theme.colors.primaryStrong} group-hover:${theme.colors.primary} transition-colors`}>
                        {portfolio.contact_phone}
                      </div>
                    </div>
                  </a>
                )}
                
                {portfolio.contact_location && (
                  <div className="group flex items-center gap-4 p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-sm text-white/60 font-medium">Location</div>
                      <div className={`text-lg font-semibold ${theme.colors.primaryStrong}`}>
                        {portfolio.contact_location}
                      </div>
                    </div>
                  </div>
                )}
                
                {portfolio.website_url && (
                  <a 
                    href={portfolio.website_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`group flex items-center gap-4 p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}
                  >
                    <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Globe className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-sm text-white/60 font-medium">Website</div>
                      <div className={`text-lg font-semibold ${theme.colors.primaryStrong} group-hover:${theme.colors.primary} transition-colors`}>
                        {portfolio.website_url}
                      </div>
                    </div>
                  </a>
                )}
              </div>
            </div>
            
            {/* Social Links & Quick Actions */}
            <div className="space-y-8">
              <div className="text-center lg:text-left">
                <h3 className={`text-3xl font-bold mb-6 ${theme.colors.heading}`}>Follow My Journey</h3>
                <p className={`text-lg ${theme.colors.text} opacity-80`}>
                  Stay connected and see my latest work across social platforms.
                </p>
              </div>
              
              {/* Social Media Grid */}
              <div className="grid grid-cols-2 gap-4">
                {portfolio.linkedin_url && (
                  <a 
                    href={portfolio.linkedin_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className={`group p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 text-center`}
                  >
                    <FaLinkedin className="w-8 h-8 mx-auto mb-3 text-blue-400 group-hover:scale-110 transition-transform"/>
                    <div className="text-sm font-medium text-white/80">LinkedIn</div>
                  </a>
                )}
                
                {portfolio.twitter_url && (
                  <a 
                    href={portfolio.twitter_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className={`group p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 text-center`}
                  >
                    <FaTwitter className="w-8 h-8 mx-auto mb-3 text-sky-400 group-hover:scale-110 transition-transform"/>
                    <div className="text-sm font-medium text-white/80">Twitter</div>
                  </a>
                )}
                
                {portfolio.instagram_url && (
                  <a 
                    href={portfolio.instagram_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className={`group p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 text-center`}
                  >
                    <FaInstagram className="w-8 h-8 mx-auto mb-3 text-pink-400 group-hover:scale-110 transition-transform"/>
                    <div className="text-sm font-medium text-white/80">Instagram</div>
                  </a>
                )}
                
                {portfolio.github_url && (
                  <a 
                    href={portfolio.github_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className={`group p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 text-center`}
                  >
                    <FaGithub className="w-8 h-8 mx-auto mb-3 text-gray-400 group-hover:scale-110 transition-transform"/>
                    <div className="text-sm font-medium text-white/80">GitHub</div>
                  </a>
                )}
                
                {portfolio.youtube_url && (
                  <a 
                    href={portfolio.youtube_url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className={`group p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 text-center`}
                  >
                    <FaYoutube className="w-8 h-8 mx-auto mb-3 text-red-400 group-hover:scale-110 transition-transform"/>
                    <div className="text-sm font-medium text-white/80">YouTube</div>
                  </a>
                )}
              </div>
              
              {/* Call to Action */}
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white font-semibold">
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  Available for new projects
                </div>
              </div>
            </div>
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

  // After fetching portfolio:
  console.log('✅ Portfolio found:', portfolio.name);
  console.log('📊 Portfolio data:', portfolio);

  // After fetching tracks:
  console.log('Tracks data:', tracks, 'Error:', error);

  // After fetching gallery items:
  console.log('Gallery items:', galleryItems, 'Error:', error);

  return (
    <div className={`min-h-screen ${theme.colors.background} overflow-x-hidden`}>
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
              {key === 'gallery' && renderGallery(portfolio, galleryItems)}
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