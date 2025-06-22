'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'
import { THEMES, PortfolioTheme } from '@/lib/themes'
import { SECTIONS_CONFIG } from '@/lib/sections'
import { TrackCard } from '@/components/tracks/TrackCard'
import Image from 'next/image'
import { Play, Mail, Music, Image as ImageIcon, User, ArrowRight, ExternalLink, Instagram, Twitter, Youtube, Linkedin, Globe } from 'lucide-react'

type Portfolio = Database['public']['Tables']['user_portfolios']['Row']
type Track = Database['public']['Tables']['tracks']['Row']
type GalleryItem = Database['public']['Tables']['gallery']['Row']

const PortfolioPage = ({ params }: { params: { slug: string } }) => {
  const [portfolio, setPortfolio] = useState<Portfolio | null>(null)
  const [tracks, setTracks] = useState<Track[]>([])
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    const fetchPortfolioData = async () => {
      if (!params.slug) return

      try {
        setLoading(true)
        const { data: portfolioData, error: portfolioError } = await supabase
          .from('user_portfolios')
          .select('*')
          .eq('slug', params.slug)
          .eq('is_published', true)
          .single()

        if (portfolioError || !portfolioData) {
          throw new Error('Portfolio not found or is not published.')
        }
        setPortfolio(portfolioData)

        const portfolioId = portfolioData.id;

        const { data: tracksData, error: tracksError } = await supabase
          .from('tracks')
          .select('*')
          .eq('portfolio_id', portfolioId)
          .order('created_at', { ascending: false })
        
        if (tracksError) console.error('Error fetching tracks:', tracksError.message);
        else setTracks(tracksData || [])

        const { data: galleryData, error: galleryError } = await supabase
            .from('gallery')
            .select('*')
            .eq('portfolio_id', portfolioId)
            .order('created_at', { ascending: false });

        if (galleryError) console.error('Error fetching gallery items:', galleryError.message);
        else setGalleryItems(galleryData || []);

      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchPortfolioData()
  }, [params.slug, supabase])

  const theme: PortfolioTheme = THEMES.find(t => t.name === (portfolio?.theme_name || 'Midnight Dusk')) || THEMES[0];
  const colors = theme.colors;

  const getSectionConfig = (key: string) => {
    const config = (portfolio?.sections_config as any)?.[key];
    const defaultConfig = SECTIONS_CONFIG[key];
    if (!config || typeof config.enabled === 'undefined') {
        return { ...defaultConfig, enabled: defaultConfig.defaultEnabled };
    }
    return { ...defaultConfig, enabled: config.enabled };
  }

  const sortedSections = Object.keys(SECTIONS_CONFIG)
    .sort((a, b) => getSectionConfig(a).defaultOrder - getSectionConfig(b).defaultOrder)
    .filter(key => getSectionConfig(key).enabled);

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-500 ${colors.background}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className={`${colors.text} text-lg`}>Loading your portfolio...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-500 ${colors.background}`}>
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h1 className={`text-2xl font-bold ${colors.heading} mb-2`}>Oops!</h1>
          <p className={`${colors.text} mb-4`}>{error}</p>
          <a href="/" className={`inline-flex items-center px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${colors.primary} hover:scale-105`}>
            <ArrowRight className="w-4 h-4 mr-2" />
            Go Home
          </a>
        </div>
      </div>
    )
  }

  if (!portfolio) {
    return null;
  }

  const SectionComponent = ({ sectionKey }: { sectionKey: string }) => {
    switch (sectionKey) {
        case 'hero':
            return (
                <div className="relative w-full min-h-[80vh] flex items-center justify-center text-center p-4 overflow-hidden">
                    {portfolio.hero_image_url && (
                        <Image
                            src={portfolio.hero_image_url}
                            alt="Hero background"
                            fill
                            className="absolute inset-0 z-0 object-cover opacity-40"
                            priority
                        />
                    )}
                    <div className={`absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black opacity-80`}></div>
                    <div className="relative z-10 max-w-4xl mx-auto">
                        <h1 className={`text-6xl md:text-8xl font-black ${colors.heading} tracking-tight mb-6 leading-tight`}>
                            {portfolio.name}
                        </h1>
                        {portfolio.subtitle && (
                            <p className={`text-xl md:text-3xl ${colors.primaryStrong} mb-8 font-light`}>
                                {portfolio.subtitle}
                            </p>
                        )}
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            {tracks.length > 0 && (
                                <a 
                                    href="#tracks" 
                                    className={`inline-flex items-center px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 bg-white text-gray-900 hover:scale-105 hover:shadow-2xl`}
                                >
                                    <Music className="w-5 h-5 mr-2" />
                                    Listen Now
                                </a>
                            )}
                            {portfolio.contact_email && (
                                <a 
                                    href="#contact" 
                                    className={`inline-flex items-center px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 ${colors.primary} border-2 border-current hover:scale-105 hover:shadow-2xl`}
                                >
                                    <Mail className="w-5 h-5 mr-2" />
                                    Get In Touch
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            )
        case 'about':
             if (!portfolio.about_text) return null;
            return (
                <div className="grid lg:grid-cols-3 gap-12 items-center">
                    {portfolio.profile_photo_url && (
                        <div className="lg:col-span-1 flex justify-center">
                            <div className="relative">
                                <Image
                                    src={portfolio.profile_photo_url}
                                    alt={portfolio.name || 'Artist profile photo'}
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
                        <div className={`prose prose-lg max-w-none ${colors.text}`}>
                            <p className="text-lg leading-relaxed whitespace-pre-wrap">{portfolio.about_text}</p>
                        </div>
                    </div>
                </div>
            )
        case 'tracks':
             if (tracks.length === 0) return null;
            return (
                <div id="tracks">
                    <div className="text-center mb-12">
                        <div className="flex items-center justify-center mb-4">
                            <Music className={`w-8 h-8 ${colors.primary} mr-3`} />
                            <h2 className={`text-4xl font-bold ${colors.heading}`}>My Music</h2>
                        </div>
                        <p className={`${colors.text} text-lg max-w-2xl mx-auto`}>
                            Discover my latest tracks and musical journey
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {tracks.map(track => (
                            <TrackCard key={track.id} track={track} theme={theme} />
                        ))}
                    </div>
                </div>
            )
        case 'gallery':
             if (galleryItems.length === 0) return null;
            return (
                <div>
                    <div className="text-center mb-12">
                        <div className="flex items-center justify-center mb-4">
                            <ImageIcon className={`w-8 h-8 ${colors.primary} mr-3`} />
                            <h2 className={`text-4xl font-bold ${colors.heading}`}>Gallery</h2>
                        </div>
                        <p className={`${colors.text} text-lg max-w-2xl mx-auto`}>
                            Behind the scenes and visual moments
                        </p>
                    </div>
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
            )
        case 'social_links':
            const socialLinks = [
                { url: portfolio.instagram_url || undefined, icon: Instagram, label: 'Instagram', color: 'hover:text-pink-400' },
                { url: portfolio.twitter_url || undefined, icon: Twitter, label: 'Twitter', color: 'hover:text-blue-400' },
                { url: portfolio.youtube_url || undefined, icon: Youtube, label: 'YouTube', color: 'hover:text-red-400' },
                { url: portfolio.linkedin_url || undefined, icon: Linkedin, label: 'LinkedIn', color: 'hover:text-blue-600' },
                { url: portfolio.website_url || undefined, icon: Globe, label: 'Website', color: 'hover:text-green-400' }
            ].filter(link => link.url && link.url.trim() !== '');

            if (socialLinks.length === 0) return null;
            
            return (
                <div className="text-center">
                    <h2 className={`text-4xl font-bold ${colors.heading} mb-6`}>Connect With Me</h2>
                    <p className={`${colors.text} text-lg max-w-2xl mx-auto mb-8`}>
                        Follow my journey and stay updated with my latest work
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        {socialLinks.map((link, index) => {
                            const IconComponent = link.icon;
                            return (
                                <a
                                    key={index}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`inline-flex items-center px-6 py-3 rounded-full font-semibold transition-all duration-300 ${colors.primary} border-2 border-current hover:scale-105 hover:shadow-lg ${link.color}`}
                                >
                                    <IconComponent className="w-5 h-5 mr-2" />
                                    {link.label}
                                </a>
                            );
                        })}
                    </div>
                </div>
            )
        case 'contact':
            if (!portfolio.contact_email) return null;
            return (
                 <div id="contact" className="text-center">
                    <div className="max-w-3xl mx-auto">
                        <div className="flex items-center justify-center mb-6">
                            <Mail className={`w-8 h-8 ${colors.primary} mr-3`} />
                            <h2 className={`text-4xl font-bold ${colors.heading}`}>
                                {portfolio.contact_title || 'Get In Touch'}
                            </h2>
                        </div>
                        <p className={`${colors.text} text-lg max-w-2xl mx-auto mb-8 leading-relaxed`}>
                            {portfolio.contact_description || "I'm available for new projects, collaborations, and exciting opportunities. Let's create something amazing together!"}
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <a 
                                href={`mailto:${portfolio.contact_email}`} 
                                className={`inline-flex items-center px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 bg-white text-gray-900 hover:scale-105 hover:shadow-2xl`}
                            >
                                <Mail className="w-5 h-5 mr-2" />
                                Send Email
                            </a>
                            <a 
                                href={`mailto:${portfolio.contact_email}?subject=Collaboration Inquiry`} 
                                className={`inline-flex items-center px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 ${colors.primary} border-2 border-current hover:scale-105 hover:shadow-2xl`}
                            >
                                <ExternalLink className="w-5 h-5 mr-2" />
                                Work Together
                            </a>
                        </div>
                    </div>
                </div>
            )
        default:
            return null
    }
  }

  return (
    <div className={`min-h-screen w-full transition-colors duration-500 font-sans ${colors.background} ${colors.text}`}>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="space-y-24 md:space-y-32 py-8 md:py-16">
                {sortedSections.map(key => (
                    <section key={key} id={key} className="scroll-mt-20">
                        <SectionComponent sectionKey={key} />
                    </section>
                ))}
            </div>
        </main>
        <footer className={`py-12 mt-20 border-t ${colors.card} border-opacity-20`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <h3 className={`text-2xl font-bold ${colors.heading} mb-4`}>{portfolio.name}</h3>
                    <p className={`${colors.cardText} mb-6 max-w-2xl mx-auto`}>
                        Thank you for visiting my portfolio. Let's create something extraordinary together.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                        {portfolio.contact_email && (
                            <a 
                                href={`mailto:${portfolio.contact_email}`} 
                                className={`inline-flex items-center px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${colors.primary} hover:scale-105`}
                            >
                                <Mail className="w-4 h-4 mr-2" />
                                Contact
                            </a>
                        )}
                        {tracks.length > 0 && (
                            <a 
                                href="#tracks" 
                                className={`inline-flex items-center px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${colors.primary} hover:scale-105`}
                            >
                                <Music className="w-4 h-4 mr-2" />
                                Listen
                            </a>
                        )}
                    </div>
                    <div className={`border-t border-opacity-20 pt-6 ${colors.cardText}`}>
                        <p className="text-sm">
                            &copy; {new Date().getFullYear()} {portfolio.name}. All Rights Reserved.
                        </p>
                        {portfolio.footer_text && (
                            <p className="mt-2 text-sm opacity-80">{portfolio.footer_text}</p>
                        )}
                    </div>
                </div>
            </div>
        </footer>
    </div>
  )
}

export default PortfolioPage 