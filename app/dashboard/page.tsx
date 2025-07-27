'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'
import { SECTIONS_CONFIG } from '@/lib/sections'
import { getSmartThemeSelection, getSmartFontSelection, getRotatedThemeSelection } from '@/lib/portfolioEditorUtils'
import { 
  PlusIcon, 
  PencilIcon, 
  EyeIcon, 
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  EyeSlashIcon,
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { TemplatePreview } from '@/components/ui/template-preview'
import { Sparkles, Layout, Edit, ExternalLink, Trash2, FileText, Star, Music, Image, Video, MessageSquare, Briefcase, Award, Heart, Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { User as UserIcon, Settings, LogOut, User as UserIconSolid, Crown, Shield, HelpCircle, Bell, ChevronDown } from 'lucide-react';
import Portal from '@/components/Portal'
import { Avatar } from '@/components/ui/avatar';

type UserProfile = Database['public']['Tables']['user_profiles']['Row']
type UserSubscription = Database['public']['Tables']['user_subscriptions']['Row']
type UserPortfolio = Database['public']['Tables']['user_portfolios']['Row']
type PortfolioTemplate = Database['public']['Tables']['portfolio_templates']['Row']

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [subscription, setSubscription] = useState<UserSubscription | null>(null)
  const [portfolios, setPortfolios] = useState<UserPortfolio[]>([])
  const [templates, setTemplates] = useState<PortfolioTemplate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [newPortfolioName, setNewPortfolioName] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  // Set Basic Template as default when templates load
  useEffect(() => {
    if (templates.length > 0 && !selectedTemplate) {
      const basicTemplate = templates.find(t => t.name === 'Basic Template');
      if (basicTemplate) {
        setSelectedTemplate(basicTemplate.id);
      }
    }
  }, [templates, selectedTemplate]);
  
  // Profile editing state
  const [editingProfile, setEditingProfile] = useState({
    username: ''
  })
  
  // Add state for AI prompt
  const [aiPrompt, setAiPrompt] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [originalTemplateSelection, setOriginalTemplateSelection] = useState<string>('');
  const [isCreatingPortfolio, setIsCreatingPortfolio] = useState(false);
  const [creatingPortfolioData, setCreatingPortfolioData] = useState<{
    name: string;
    template: string;
    aiPrompt: string;
  } | null>(null);
  const [validationErrors, setValidationErrors] = useState({
    portfolioName: false,
    aiPrompt: false
  });

  const router = useRouter()
  const supabase = createClient()



  useEffect(() => {
    const checkUser = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/signin')
        return
      }

      setUser(user)

      // Ensure user profile exists
      const { error: ensureProfileError } = await supabase
        .rpc('ensure_user_profile', { user_uuid: user.id })

      // Fetch user profile
      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileData) {
        setProfile(profileData)
        setEditingProfile({
          username: profileData.username || ''
        })
      }

      // Ensure user subscription exists
      // Temporarily disabled due to database issues
      // const { error: ensureSubscriptionError } = await supabase
      //   .rpc('ensure_user_subscription', { user_uuid: user.id })
      // console.log('Ensure subscription:', { ensureSubscriptionError })

      // Fetch user subscription - temporarily disabled
      // const { data: subscriptionData, error: subscriptionError } = await supabase
      //   .from('user_subscriptions')
      //   .select('*')
      //   .eq('user_id', user.id)
      //   .single()
      // console.log('Subscription fetch:', { subscriptionData, subscriptionError })
      // if (subscriptionData) {
      //   setSubscription(subscriptionData)
      // }

      // Set default subscription for now
      setSubscription({
        id: 'default',
        user_id: user.id,
        plan_type: 'free',
        status: 'active',
        stripe_customer_id: null,
        stripe_subscription_id: null,
        current_period_start: null,
        current_period_end: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

      // Fetch user portfolios
      const { data: portfoliosData, error: portfoliosError } = await supabase
        .from('user_portfolios')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (portfoliosData) {
        setPortfolios(portfoliosData)
      }

        // Fetch portfolio templates - Basic Template first, then others
  const { data: templatesData, error: templatesError } = await supabase
    .from('portfolio_templates')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })
    .order('name', { ascending: true })

      // Temporarily set empty templates array if there's an error
      if (templatesError) {
        console.warn('Templates not available:', templatesError.message)
        setTemplates([])
      } else if (templatesData) {
        setTemplates(templatesData)
      }

      setIsLoading(false)
    }

    checkUser()
  }, [supabase, router])



  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleSaveProfile = async () => {
    if (!profile) return

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ username: editingProfile.username })
        .eq('id', profile.id)

      if (error) throw error

      setProfile({ ...profile, username: editingProfile.username })
      setIsEditingProfile(false)
      setSuccess('Profile updated successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError('Failed to update profile')
      setTimeout(() => setError(null), 3000)
    }
  }

  const handleCreatePortfolio = async () => {
    // Clear previous validation errors
    setValidationErrors({
      portfolioName: false,
      aiPrompt: false
    });

    // Validate fields
    const hasPortfolioNameError = !newPortfolioName.trim();
    const hasAiPromptError = !aiPrompt.trim();

    if (hasPortfolioNameError || hasAiPromptError) {
      setValidationErrors({
        portfolioName: hasPortfolioNameError,
        aiPrompt: hasAiPromptError
      });
      
      // Show error message
      const errorMessages = [];
      if (hasPortfolioNameError) errorMessages.push('portfolio name');
      if (hasAiPromptError) errorMessages.push('AI description');
      
      setError(`Please enter your ${errorMessages.join(' and ')}`);
      setTimeout(() => setError(null), 3000);
      return;
    }

    // Ensure Basic Template is selected by default if no template is selected
    if (!selectedTemplate) {
      const basicTemplate = templates.find(t => t.name === 'Basic Template');
      if (basicTemplate) {
        setSelectedTemplate(basicTemplate.id);
      }
    }

    // Set creating state and show cooking card
    setIsCreatingPortfolio(true);
    setCreatingPortfolioData({
      name: newPortfolioName,
      template: templates.find(t => t.id === selectedTemplate)?.name || 'Basic Template',
      aiPrompt: aiPrompt
    });

    try {
      const slug = newPortfolioName.toLowerCase().replace(/[^a-z0-9]/g, '-')
      
      // Get template data if selected
      let templateData = null;
      if (selectedTemplate) {
        const { data: template } = await supabase
          .from('portfolio_templates')
          .select('*')
          .eq('id', selectedTemplate)
          .single();
        templateData = template;
      }

      // Prepare default sections config based on template
      let defaultSectionsConfig: Record<string, any> = {};
      let defaultThemeName = 'Midnight Dusk';
      let defaultFontPair = 'sf-pro'; // Default font pair
      let defaultContent: any = {};

      // AI Generation Logic
      console.log('=== PORTFOLIO CREATION DEBUG ===');
      console.log('AI Prompt:', aiPrompt);
      console.log('Selected Template ID:', selectedTemplate);
      console.log('Template Data:', templateData);
      
      if (aiPrompt.trim()) {
        setSuccess('🤖 AI is generating your portfolio... This may take a moment.');
        
        try {
          // Call AI API to generate portfolio content
          const response = await fetch('/api/generate-portfolio', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              prompt: aiPrompt,
              type: 'full_generation'
            }),
          });

          if (!response.ok) {
            throw new Error('AI generation failed');
          }

          const aiGeneratedData = await response.json();
          console.log('AI Generated Data:', aiGeneratedData);
          console.log('User Prompt:', aiPrompt);
          
          // Use AI-generated content
          defaultContent = {
            subtitle: aiGeneratedData.subtitle,
            hero_title: aiGeneratedData.hero_title,
            hero_subtitle: aiGeneratedData.hero_subtitle,
            about_title: aiGeneratedData.about_title,
            about_text: aiGeneratedData.about_text,
            contact_title: aiGeneratedData.contact_title,
            contact_description: aiGeneratedData.contact_description,
            contact_email: aiGeneratedData.contact_email,
            skills_title: aiGeneratedData.skills_title,
            skills_json: aiGeneratedData.skills_json,
            hobbies_title: aiGeneratedData.hobbies_title,
            hobbies_json: aiGeneratedData.hobbies_json,
            resume_title: aiGeneratedData.resume_title,
            footer_about_summary: aiGeneratedData.footer_about_summary
          };

          // Handle sections_config from AI response
          if (aiGeneratedData.sections_config) {
            defaultSectionsConfig = aiGeneratedData.sections_config as Record<string, any>;
            
            // Ensure essential sections are enabled
            const essentialSections = ['hero', 'about', 'contact'];
            essentialSections.forEach(sectionKey => {
              if (defaultSectionsConfig[sectionKey] && !defaultSectionsConfig[sectionKey].enabled) {
                defaultSectionsConfig[sectionKey].enabled = true;
              }
            });
            
            // Additional fallback: If AI enabled too few sections, enable some defaults
            const enabledSections = Object.keys(defaultSectionsConfig).filter(key => defaultSectionsConfig[key].enabled);
            if (enabledSections.length < 6) {
              const defaultSections = ['skills', 'hobbies', 'gallery', 'tracks'];
              defaultSections.forEach(sectionKey => {
                if (defaultSectionsConfig[sectionKey] && !defaultSectionsConfig[sectionKey].enabled) {
                  defaultSectionsConfig[sectionKey].enabled = true;
                }
              });
            }
            
            // Preserve original order from sections configuration - AI should only enable/disable, not reorder
            Object.keys(defaultSectionsConfig).forEach(sectionKey => {
              if (defaultSectionsConfig[sectionKey]) {
                // Use the default order from SECTIONS_CONFIG
                defaultSectionsConfig[sectionKey].order = SECTIONS_CONFIG[sectionKey]?.defaultOrder ?? 999;
              }
            });
          }

          // Set theme and font based on AI analysis or template
          console.log('--- THEME SELECTION DEBUG ---');
          console.log('Template Data:', templateData?.name);
          console.log('AI Prompt:', aiPrompt);
          console.log('AI Suggested Theme:', aiGeneratedData.theme_name);
          
          // Always prioritize AI suggestion or smart selection over template name
          if (aiGeneratedData.theme_name) {
            console.log('Using AI suggested theme:', aiGeneratedData.theme_name);
            defaultThemeName = aiGeneratedData.theme_name;
          } else {
            // No AI suggestion, use smart selection
            console.log('No AI theme suggestion, using smart theme selection');
            defaultThemeName = getRotatedThemeSelection(aiPrompt);
          }
          
          console.log('Final theme selected:', defaultThemeName);
          console.log('Final font pair selected:', defaultFontPair);
          console.log('=== END DEBUG ===');

          // Always use smart font selection based on theme and prompt
          defaultFontPair = getSmartFontSelection(defaultThemeName, aiPrompt);

          setSuccess('✨ AI has generated your portfolio! Creating your masterpiece...');
        } catch (aiError) {
          console.error('AI generation error:', aiError);
          setError('AI generation failed, creating portfolio with template defaults');
          // Fall back to template-based creation
        }
      } else if (templateData) {
        console.log('--- TEMPLATE-ONLY CREATION DEBUG ---');
        console.log('Template Data:', templateData?.name);
        // Apply template-specific settings
        if (templateData.name === 'Basic Template') {
          defaultThemeName = 'Midnight Dusk-light';
          defaultFontPair = getSmartFontSelection(defaultThemeName, 'professional portfolio');
          defaultSectionsConfig = {
            hero: { enabled: true, name: 'Welcome', order: 1 },
            about: { enabled: true, name: 'About Me', order: 2 },
            skills: { enabled: true, name: 'Skills', order: 3 },
            hobbies: { enabled: true, name: 'Interests', order: 4 },
            contact: { enabled: true, name: 'Contact', order: 5 },
            footer: { enabled: true, name: 'Footer', order: 6 }
          };
          defaultContent = {
            hero_title: 'Welcome to My Portfolio',
            hero_subtitle: 'Professional • Creative • Dedicated',
            about_title: 'About Me',
            about_text: 'I am a passionate professional dedicated to creating meaningful work and delivering exceptional results. With a focus on quality and innovation, I strive to make a positive impact in everything I do.',
            hobbies_title: 'Interests',
            hobbies_json: [
              { name: 'Problem Solving', icon: '🧩' },
              { name: 'Creative Design', icon: '🎨' },
              { name: 'Technology', icon: '💻' },
              { name: 'Learning', icon: '📚' },
              { name: 'Collaboration', icon: '🤝' },
              { name: 'Innovation', icon: '💡' }
            ],
            skills_title: 'Skills',
            skills_json: [
              { name: 'Project Management', color: '#059669' },
              { name: 'Problem Solving', color: '#7C3AED' },
              { name: 'Communication', color: '#F59E0B' },
              { name: 'Leadership', color: '#EF4444' },
              { name: 'Analytical Thinking', color: '#10B981' }
            ],
            contact_title: 'Get In Touch',
            contact_description: 'Ready to work together? I\'m always open to new opportunities and exciting projects.',
            footer_about_summary: 'Committed to excellence and continuous improvement in all aspects of my work.'
          };
        } else if (templateData.name === 'Royal Purple') {
          defaultThemeName = 'Royal Purple';
          defaultFontPair = getSmartFontSelection(defaultThemeName, 'music musician composer');
          defaultSectionsConfig = {
            hero: { enabled: true, name: 'Welcome', order: 1 },
            about: { enabled: true, name: 'About My Music', order: 2 },
            tracks: { enabled: true, name: 'My Music', order: 3 },
            gallery: { enabled: true, name: 'Gallery', order: 4 },
            skills: { enabled: true, name: 'Instruments & Skills', order: 5 },
            hobbies: { enabled: true, name: 'Musical Interests', order: 6 },
            contact: { enabled: true, name: 'Get In Touch', order: 7 },
            footer: { enabled: true, name: 'Footer', order: 8 }
          };
          defaultContent = {
            hero_title: 'Welcome to My Musical Journey',
            hero_subtitle: 'Composer • Performer • Music Producer',
            about_title: 'About My Music',
            about_text: 'I am a passionate musician dedicated to creating beautiful melodies that touch the soul. With years of experience in composition and performance, I blend classical techniques with modern innovation to create unique musical experiences.',
            hobbies_title: 'Musical Interests',
            hobbies_json: [
              { name: 'Piano', icon: '🎹' },
              { name: 'Guitar', icon: '🎸' },
              { name: 'Violin', icon: '🎻' },
              { name: 'Drums', icon: '🥁' },
              { name: 'Composing', icon: '🎵' },
              { name: 'Music Production', icon: '🎧' },
              { name: 'Singing', icon: '🎤' }
            ],
            skills_title: 'Instruments & Skills',
            skills_json: [
              { name: 'Piano', color: '#4F46E5' },
              { name: 'Guitar', color: '#7C3AED' },
              { name: 'Vocals', color: '#F59E0B' },
              { name: 'Music Production', color: '#10B981' },
              { name: 'Composition', color: '#EF4444' }
            ],
            contact_title: 'Let\'s Make Music Together',
            contact_description: 'Ready to collaborate on your next musical project? I\'m always excited to work with fellow musicians and creators.',
            footer_about_summary: 'Dedicated to creating beautiful music that inspires and connects people across the world.'
          };
        } else if (templateData.name === 'Crimson Sunset') {
          defaultThemeName = 'Crimson Sunset';
          defaultFontPair = getSmartFontSelection(defaultThemeName, 'photography photographer visual artist');
          defaultSectionsConfig = {
            hero: { enabled: true, name: 'Welcome', order: 1 },
            about: { enabled: true, name: 'About My Photography', order: 2 },
            gallery: { enabled: true, name: 'Portfolio', order: 3 },
            skills: { enabled: true, name: 'Photography Skills', order: 4 },
            hobbies: { enabled: true, name: 'Photography Interests', order: 5 },
            contact: { enabled: true, name: 'Get In Touch', order: 6 },
            footer: { enabled: true, name: 'Footer', order: 7 }
          };
          defaultContent = {
            hero_title: 'Capturing Life Through the Lens',
            hero_subtitle: 'Professional Photographer • Visual Storyteller • Creative Artist',
            about_title: 'About My Photography',
            about_text: 'I am a passionate photographer who believes that every moment tells a story. Through my lens, I capture the beauty of life, from intimate portraits to breathtaking landscapes. With years of experience in both digital and film photography, I blend technical expertise with artistic vision to create images that resonate with emotion and authenticity.',
            hobbies_title: 'Photography Interests',
            hobbies_json: [
              { name: 'Portrait Photography', icon: '📸' },
              { name: 'Landscape Photography', icon: '🏔️' },
              { name: 'Street Photography', icon: '🏙️' },
              { name: 'Wedding Photography', icon: '💒' },
              { name: 'Nature Photography', icon: '🌿' },
              { name: 'Architecture Photography', icon: '🏛️' },
              { name: 'Travel Photography', icon: '✈️' }
            ],
            skills_title: 'Photography Skills',
            skills_json: [
              { name: 'Portrait Photography', color: '#DC2626' },
              { name: 'Landscape Photography', color: '#059669' },
              { name: 'Street Photography', color: '#7C3AED' },
              { name: 'Wedding Photography', color: '#F59E0B' },
              { name: 'Photo Editing', color: '#EF4444' },
              { name: 'Lighting Techniques', color: '#10B981' },
              { name: 'Composition', color: '#8B5CF6' }
            ],
            contact_title: 'Let\'s Create Something Beautiful',
            contact_description: 'Ready to bring your vision to life? I\'m always excited to collaborate on new photography projects and capture those special moments that matter most.',
            footer_about_summary: 'Dedicated to capturing life\'s beautiful moments and creating visual stories that inspire and connect people across the world.'
          };
        } else if (templateData.name === 'Academic Profile') {
          defaultThemeName = 'Black & Lime';
          defaultSectionsConfig = {
            hero: { enabled: true, name: 'Hero', order: 1 },
            about: { enabled: true, name: 'About Me', order: 2 },
            resume: { enabled: true, name: 'Resume', order: 3 },
            key_projects: { enabled: true, name: 'Key Projects', order: 4 },
            skills: { enabled: true, name: 'Skills and Tools', order: 5 },
            hobbies: { enabled: true, name: 'Hobbies', order: 6 },
            contact: { enabled: true, name: 'Contact Me', order: 7 },
            blog: { enabled: true, name: 'Post Me', order: 8 },
            status: { enabled: true, name: 'What I\'m working on', order: 9 },
            footer: { enabled: true, name: 'Footer', order: 10 }
          };
          defaultContent = {
            hero_title: 'Academic Portfolio',
            hero_subtitle: 'Student • Researcher • Scholar',
            about_title: 'About My Academic Journey',
            about_text: 'I am a dedicated student and researcher passionate about advancing knowledge in my field. Through rigorous academic study and hands-on research experience, I strive to contribute meaningful insights to the academic community. My work focuses on innovative approaches to solving complex problems and pushing the boundaries of current understanding.',
            hobbies_title: 'Academic Interests',
            hobbies_json: [
              { name: 'Research', icon: '🔬' },
              { name: 'Data Analysis', icon: '📊' },
              { name: 'Academic Writing', icon: '✍️' },
              { name: 'Literature Review', icon: '📚' },
              { name: 'Lab Work', icon: '🧪' },
              { name: 'Presentations', icon: '🎤' },
              { name: 'Collaboration', icon: '🤝' }
            ],
            skills_title: 'Skills and Tools',
            skills_json: [
              { name: 'Research Methods', color: '#059669' },
              { name: 'Data Analysis', color: '#7C3AED' },
              { name: 'Academic Writing', color: '#DC2626' },
              { name: 'Statistical Analysis', color: '#F59E0B' },
              { name: 'Literature Review', color: '#10B981' },
              { name: 'Presentation Skills', color: '#EF4444' },
              { name: 'Critical Thinking', color: '#8B5CF6' }
            ],
            resume_title: 'Resume',
            key_projects_title: 'Key Projects',
            contact_title: 'Contact Me',
            contact_description: 'Interested in research collaboration, academic opportunities, or discussing potential projects? I\'m always open to connecting with fellow researchers and academic institutions.',
            blog_title: 'Post Me',
            blog_description: 'Share your academic thoughts and research insights',
            status_title: 'What I\'m working on',
            footer_about_summary: 'Committed to academic excellence and contributing to the advancement of knowledge through rigorous research and scholarly work.',
            font_pair: 'lato-open-sans',
            card_shadows: true,
            section_blending: true,
            image_frames: true,
            curved_separators: true,
            animations: true
          };
        } else if (templateData.name === 'Artist Showcase') {
          defaultThemeName = 'Midnight Dusk-dark';
          defaultSectionsConfig = {
            hero: { enabled: true, name: 'Welcome', order: 1 },
            about: { enabled: true, name: 'About My Art', order: 2 },
            gallery: { enabled: true, name: 'Portfolio', order: 3 },
            key_projects: { enabled: true, name: 'Featured Works', order: 4 },
            skills: { enabled: true, name: 'Artistic Skills', order: 5 },
            hobbies: { enabled: true, name: 'Creative Interests', order: 6 },
            testimonials: { enabled: true, name: 'Client Reviews', order: 7 },
            contact: { enabled: true, name: 'Get In Touch', order: 8 },
            footer: { enabled: true, name: 'Footer', order: 9 }
          };
          defaultContent = {
            hero_title: 'Artist Portfolio',
            hero_subtitle: 'Visual Artist • Creative Designer • Art Enthusiast',
            about_title: 'About My Art',
            about_text: 'I am a passionate visual artist dedicated to creating meaningful and inspiring artwork that speaks to the soul. Through various mediums and techniques, I explore themes of beauty, emotion, and human connection. My work reflects my deep appreciation for color, form, and the stories that art can tell.',
            hobbies_title: 'Creative Interests',
            hobbies_json: [
              { name: 'Painting', icon: '🎨' },
              { name: 'Drawing', icon: '✏️' },
              { name: 'Digital Art', icon: '💻' },
              { name: 'Sculpture', icon: '🗿' },
              { name: 'Photography', icon: '📸' },
              { name: 'Mixed Media', icon: '🖼️' },
              { name: 'Art History', icon: '🏛️' }
            ],
            skills_title: 'Artistic Skills',
            skills_json: [
              { name: 'Oil Painting', color: '#7C3AED' },
              { name: 'Watercolor', color: '#3B82F6' },
              { name: 'Digital Art', color: '#10B981' },
              { name: 'Sketching', color: '#F59E0B' },
              { name: 'Color Theory', color: '#EF4444' },
              { name: 'Composition', color: '#8B5CF6' },
              { name: 'Mixed Media', color: '#06B6D4' }
            ],
            key_projects_title: 'Featured Works',
            testimonials_title: 'Client Reviews',
            contact_title: 'Let\'s Create Together',
            contact_description: 'Interested in commissioning artwork, collaborating on creative projects, or discussing potential opportunities? I\'m always excited to connect with fellow artists and art enthusiasts.',
            footer_about_summary: 'Dedicated to creating beautiful artwork that inspires, connects, and brings joy to people\'s lives through the power of visual expression.',
            font_pair: 'playfair-source',
            card_shadows: true,
            section_blending: true,
            image_frames: true,
            curved_separators: true
          };
        } else {
          // Default sections for other templates
          defaultSectionsConfig = {
            hero: { enabled: true, name: 'Hero', order: 1 },
            about: { enabled: true, name: 'About', order: 2 },
            tracks: { enabled: true, name: 'Tracks', order: 3 },
            gallery: { enabled: true, name: 'Gallery', order: 4 },
            contact: { enabled: true, name: 'Contact', order: 5 },
            footer: { enabled: true, name: 'Footer', order: 6 }
          };
        }
              } else {
          console.log('--- NO TEMPLATE DEBUG ---');
          // Default sections if no template selected
          defaultSectionsConfig = {
          hero: { enabled: true, name: 'Hero', order: 1 },
          about: { enabled: true, name: 'About', order: 2 },
          tracks: { enabled: true, name: 'Tracks', order: 3 },
          gallery: { enabled: true, name: 'Gallery', order: 4 },
          contact: { enabled: true, name: 'Contact', order: 5 },
          footer: { enabled: true, name: 'Footer', order: 6 }
        };
      }
      
      const { data, error } = await supabase
        .from('user_portfolios')
        .insert({
          user_id: user.id,
          name: newPortfolioName,
          slug: slug,
          template_id: selectedTemplate || null,
          theme_name: defaultThemeName,
          font_pair: defaultFontPair,
          sections_config: defaultSectionsConfig,
          ...defaultContent,
          is_published: false, // Start as draft, user publishes after editing
          is_default: portfolios.length === 0 // First portfolio is default
        })
        .select()
        .single()

      if (error) throw error

      setPortfolios([data, ...portfolios])
      setNewPortfolioName('')
      setSelectedTemplate('')
      setAiPrompt('')
      setShowTemplates(false)
      setIsCreatingPortfolio(false)
      setCreatingPortfolioData(null)
      setSuccess(aiPrompt.trim() ? '✨ AI-generated portfolio created successfully!' : 'Portfolio created successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      console.error('Portfolio creation error:', err)
      setIsCreatingPortfolio(false)
      setCreatingPortfolioData(null)
      setError('Failed to create portfolio')
      setTimeout(() => setError(null), 3000)
    }
  }

  const handleDeletePortfolio = async (portfolioId: string) => {
    if (!confirm('Are you sure you want to delete this portfolio?')) return

    try {
      const { error } = await supabase
        .from('user_portfolios')
        .delete()
        .eq('id', portfolioId)

      if (error) throw error

      setPortfolios(portfolios.filter(p => p.id !== portfolioId))
      setSuccess('Portfolio deleted successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError('Failed to delete portfolio')
      setTimeout(() => setError(null), 3000)
    }
  }

  const handleTogglePublish = async (portfolioId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('user_portfolios')
        .update({ is_published: !currentStatus })
        .eq('id', portfolioId)

      if (error) throw error

      setPortfolios(portfolios.map(p => 
        p.id === portfolioId 
          ? { ...p, is_published: !currentStatus }
          : p
      ))
      setSuccess(`Portfolio ${!currentStatus ? 'published' : 'unpublished'} successfully!`)
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError('Failed to update portfolio status')
      setTimeout(() => setError(null), 3000)
    }
  }

  const getPlanFeatures = (planType: string) => {
    switch (planType) {
      case 'free':
        return ['1 Portfolio', 'Basic Templates', 'Standard Support']
      case 'pro':
        return ['Unlimited Portfolios', 'All Templates', 'Custom Domain', 'Analytics', 'Priority Support']
      case 'enterprise':
        return ['Everything in Pro', 'White Label', 'API Access', 'Dedicated Support']
      default:
        return ['1 Portfolio', 'Basic Templates', 'Standard Support']
    }
  }



  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-gray-200">
      {/* Header */}
      <header className="bg-white/5 backdrop-blur-sm border-b border-white/10 shadow-lg relative z-20">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">Hero Portfolio</h1>
          </div>
          <div className="flex items-center space-x-4 relative z-30">
            {/* Welcome message (desktop only) */}
            {profile?.username && (
              <span className="hidden md:inline-block text-white text-sm font-medium mr-4">Welcome {profile.username}</span>
            )}
            
            {/* Enhanced Avatar Component */}
            <Avatar 
              userProfile={profile} 
              size="lg" 
              showMenu={true}
              menuPosition="portal"
              menuTargetId="create-portfolio-card"
            />
          </div>
        </div>
      </header>

      {/* Success/Error Messages */}
      {success && (
        <div className="fixed top-4 right-4 bg-green-500/20 border border-green-500/30 text-green-400 px-6 py-3 rounded-lg shadow-lg z-50 backdrop-blur-sm">
          {success}
        </div>
      )}
      {error && (
        <div className="fixed top-4 right-4 bg-red-500/20 border border-red-500/30 text-red-400 px-6 py-3 rounded-lg shadow-lg z-50 backdrop-blur-sm">
          {error}
        </div>
      )}

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Profile and Subscription */}
            {/* Removed Profile and Subscription cards */}
            {/* Right Column - Create Portfolio and My Portfolios */}
            <div className="space-y-8 col-span-2">
              {/* Create Portfolio Card - always visible */}
              <div id="create-portfolio-card" className="relative overflow-hidden bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-purple-600/10 backdrop-blur-sm border border-purple-400/20 rounded-2xl p-6 shadow-2xl z-10">
                {/* Background decoration */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 opacity-50"></div>
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-pink-500/10 rounded-full blur-2xl"></div>
                
                <div className="relative z-10">
                                    <div className="mb-4">
                    <h2 className="text-base font-bold text-white">Create Portfolio</h2>
                  </div>
                  
                  {/* Modern AI-First Create Portfolio form */}
                  <div className="space-y-4">
                    {/* AI Description Section */}
                    <div className="relative">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center">
                            <Sparkles className="w-3 h-3 text-white" />
                          </div>
                          <h3 className="text-sm font-semibold text-white">Describe your portfolio</h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const examples = [
                              "A passionate jazz musician with 10+ years of experience performing at prestigious clubs and festivals across the country, specializing in contemporary jazz fusion and experimental compositions",
                              "A full-stack developer with 5 years of experience specializing in React, Node.js, and cloud architecture, passionate about creating scalable web applications and mentoring junior developers",
                              "A freelance photographer with expertise in wedding photography and corporate events, capturing authentic moments and creating stunning visual narratives for clients worldwide",
                              "A UI/UX designer with 7 years of experience creating beautiful mobile apps and websites, focusing on user-centered design and accessibility for major tech companies",
                              "A classical pianist and music educator with a love for contemporary compositions, performing regularly at concert halls and teaching students of all skill levels"
                            ];
                            const randomExample = examples[Math.floor(Math.random() * examples.length)];
                            setAiPrompt(randomExample);
                          }}
                          className="text-xs text-purple-300 hover:text-purple-200 transition-colors underline"
                        >
                          Try Example
                        </button>
                      </div>
                      <textarea
                        value={aiPrompt}
                        onChange={e => {
                          setAiPrompt(e.target.value);
                          if (e.target.value) setSelectedTemplate('');
                          // Clear validation error when user starts typing
                          if (validationErrors.aiPrompt) {
                            setValidationErrors(prev => ({ ...prev, aiPrompt: false }));
                          }
                        }}
                        className={`w-full px-4 py-3 bg-white/10 border rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all backdrop-blur-sm resize-none ${
                          validationErrors.aiPrompt 
                            ? 'border-red-400/60 bg-red-500/5' 
                            : 'border-purple-400/30'
                        }`}
                        placeholder="Tell us about your portfolio... (e.g., 'A jazz musician with 10 years of experience performing in clubs and festivals')"
                        rows={3}
                      />
                    </div>

                    {/* Portfolio Name - Username Style */}
                    <div className="flex items-center justify-center">
                      <div className="relative">
                        <input
                          type="text"
                          value={newPortfolioName}
                          onChange={(e) => {
                            // Limit to 30 characters (Instagram username limit)
                            const value = e.target.value.slice(0, 30);
                            // Only allow letters, numbers, underscores, and hyphens
                            const sanitizedValue = value.replace(/[^a-zA-Z0-9_-]/g, '');
                            setNewPortfolioName(sanitizedValue);
                            // Clear validation error when user starts typing
                            if (validationErrors.portfolioName) {
                              setValidationErrors(prev => ({ ...prev, portfolioName: false }));
                            }
                          }}
                          className={`w-64 px-3 py-2 pr-8 bg-white/10 border rounded-lg text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition-all backdrop-blur-sm text-sm ${
                            validationErrors.portfolioName 
                              ? 'border-red-400/60 bg-red-500/5' 
                              : 'border-purple-400/30'
                          }`}
                          placeholder="My Hero Portfolio Name"
                          maxLength={30}
                        />
                        <span className="absolute bottom-1 right-2 text-xs text-purple-300/70">
                          {30 - newPortfolioName.length}
                        </span>
                      </div>
                    </div>

                    {/* Templates section - Modal Trigger */}
                    <div className="flex items-center justify-center space-x-3">
                      <button
                        type="button"
                        onClick={() => {
                          setOriginalTemplateSelection(selectedTemplate);
                          setShowTemplateModal(true);
                        }}
                        className="px-4 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 text-purple-200 rounded-lg hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-300 text-sm font-medium shadow-sm"
                      >
                        Choose Template
                      </button>
                      {selectedTemplate && (
                        <div className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 rounded-lg text-xs font-medium border border-green-400/30 shadow-sm">
                          <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                          {templates.find(t => t.id === selectedTemplate)?.name || 'Template selected'}
                        </div>
                      )}
                    </div>



                    {/* Action buttons - Compact */}
                    <div className="flex justify-end space-x-3 pt-3">
                      <button
                        onClick={() => {
                          setNewPortfolioName('');
                          setSelectedTemplate('');
                          setAiPrompt('');
                          setShowTemplates(false);
                        }}
                        className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-all duration-300 text-sm"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleCreatePortfolio}
                        className="px-6 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 text-purple-200 rounded-lg hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-300 font-medium text-sm"
                      >
                        Create Portfolio
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* My Portfolios Card - remove Create Portfolio button */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-2xl relative z-10">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-base font-bold text-white">My Portfolios</h2>
                </div>
                {portfolios.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-white mb-2">No portfolios yet</h3>
                    <p className="text-gray-400 mb-4">Create your first portfolio to get started</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Cooking Animation Card */}
                    {isCreatingPortfolio && creatingPortfolioData && (
                      <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/30 rounded-xl p-5 animate-pulse">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center animate-spin">
                              <Sparkles className="h-4 w-4 text-white" />
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-white truncate">
                                {creatingPortfolioData.name}
                              </h3>
                              <p className="text-sm text-purple-300">
                                {creatingPortfolioData.template}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="px-3 py-1 text-xs bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 rounded-full animate-pulse">
                              Cooking...
                            </span>
                          </div>
                        </div>

                        {/* Cooking Animation */}
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                            <span className="text-sm text-gray-300">🤖 AI is analyzing your description...</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            <span className="text-sm text-gray-300">🎨 Generating personalized content...</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                            <span className="text-sm text-gray-300">✨ Crafting your portfolio...</span>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-4">
                          <div className="w-full bg-gray-700/50 rounded-full h-2">
                            <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Existing Portfolios */}
                    {portfolios.map((p) => (
                      <div key={p.id} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all duration-300 group">
                        {/* Portfolio Header */}
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-white truncate group-hover:text-purple-300 transition-colors">
                              {p.name}
                            </h3>
                            <p className="text-sm text-gray-400 mt-1">/{p.slug}</p>
                          </div>
                          <div className="flex flex-col items-end space-y-2">
                            <button
                              onClick={() => handleTogglePublish(p.id, p.is_published)}
                              className={`px-3 py-1 text-xs rounded-full font-medium ${
                                p.is_published
                                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                  : 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                              } hover:opacity-80 transition-all duration-300`}
                            >
                              {p.is_published ? 'Published' : 'Draft'}
                            </button>
                            {p.is_default && (
                              <span className="px-3 py-1 text-xs bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Portfolio Details */}
                        <div className="mb-4">
                          <p className="text-gray-400 text-sm">
                            {p.theme_name ? `${p.theme_name} Theme` : 'Default Theme'}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            Created {new Date(p.created_at).toLocaleDateString()}
                          </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-between items-center">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => router.push(`/dashboard/portfolio/${p.id}/edit`)}
                              className="p-2 bg-purple-600/20 border border-purple-500/30 text-purple-300 rounded-lg hover:bg-purple-600/30 transition-all duration-300 group"
                              title="Edit Portfolio"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => window.open(`/portfolio/${profile?.username || 'user'}/${p.slug}`, '_blank', 'noopener,noreferrer')}
                              className="p-2 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-all duration-300 group"
                              title="View Portfolio"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeletePortfolio(p.id)}
                              className="p-2 bg-red-600/20 border border-red-500/30 text-red-300 rounded-lg hover:bg-red-600/30 transition-all duration-300 group"
                              title="Delete Portfolio"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Public URL */}
                        {p.slug && (
                          <div className="mt-4 pt-4 border-t border-white/10">
                            <p className="text-xs text-gray-400 mb-1">Public URL:</p>
                            <a 
                              href={`/portfolio/${profile?.username || 'user'}/${p.slug}`} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-purple-400 hover:underline text-xs break-all"
                            >
                              {`/portfolio/${profile?.username || 'user'}/${p.slug}`}
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Template Selection Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900/95 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[85vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-white/10 flex-shrink-0">
              <h2 className="text-xl font-bold text-white">Choose Your Template</h2>
              <button
                onClick={() => setShowTemplateModal(false)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className={`relative p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                      selectedTemplate === template.id
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-white/10 bg-white/5 hover:border-purple-400/50 hover:bg-purple-500/5'
                    }`}
                    onClick={() => {
                      setSelectedTemplate(template.id);
                      setAiPrompt('');
                    }}
                  >
                    {/* Template Preview */}
                    <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg mb-3 flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                          <Layout className="h-6 w-6 text-purple-400" />
                        </div>
                        <p className="text-sm text-gray-300">{template.name}</p>
                      </div>
                    </div>

                    {/* Template Info */}
                    <div className="space-y-2">
                      <h3 className="font-semibold text-white text-sm">{template.name}</h3>
                      <p className="text-xs text-gray-400 line-clamp-2">
                        {template.description || 'No description available'}
                      </p>
                      
                      {/* Template Features */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1">
                          <Star className="h-3 w-3 text-yellow-400" />
                          <span className="text-xs text-gray-400">Free</span>
                        </div>
                        {selectedTemplate === template.id && (
                          <div className="flex items-center space-x-1">
                            <CheckIcon className="h-4 w-4 text-green-400" />
                            <span className="text-xs text-green-400 font-medium">Selected</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Selection Indicator */}
                    {selectedTemplate === template.id && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckIcon className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end items-center p-6 border-t border-white/10 space-x-3 flex-shrink-0">
              <button
                onClick={() => {
                  setSelectedTemplate(originalTemplateSelection);
                  setShowTemplateModal(false);
                }}
                className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-all duration-300 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowTemplateModal(false);
                }}
                className="px-6 py-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 text-purple-200 rounded-lg hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-300 font-medium text-sm"
              >
                Confirm Selection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 