'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/types/database'
import { SECTIONS_CONFIG } from '@/lib/sections'
import { getSmartFontSelection, getRotatedThemeSelection } from '@/lib/portfolioEditorUtils'
import { 
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { TemplatePreview } from '@/components/ui/template-preview'
import { Sparkles, Layout, Edit, ExternalLink, Trash2, Star, Briefcase, Home, FolderOpen, BarChart3, Settings, User, HelpCircle, LogOut, Palette, Eye, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Shield } from 'lucide-react';
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
  const [isAdmin, setIsAdmin] = useState(false)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [newPortfolioName, setNewPortfolioName] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<UserPortfolio | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  
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
  

  
  // Portfolio name validation state
  const [isCheckingName, setIsCheckingName] = useState(false);
  const [nameExists, setNameExists] = useState(false);

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

      // Check if user is admin (check profiles table for role)
      // Explicitly set to false first, then only set to true if confirmed admin
      setIsAdmin(false)
      
      const { data: adminProfile, error: adminError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      // Only set isAdmin to true if we have a valid response with role === 'admin'
      if (!adminError && adminProfile && adminProfile.role === 'admin') {
        setIsAdmin(true)
      } else {
        // Explicitly ensure isAdmin is false for non-admin users or errors
        setIsAdmin(false)
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

  // Portfolio name validation function
  const checkPortfolioName = async (name: string) => {
    if (!name.trim() || !user) return;

    setIsCheckingName(true);
    try {
      const { data: existingPortfolio, error } = await supabase
        .from('user_portfolios')
        .select('id, name')
        .eq('user_id', user.id)
        .eq('name', name.trim())
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking portfolio name:', error);
        return;
      }

      setNameExists(!!existingPortfolio);
    } catch (err) {
      console.error('Error checking portfolio name:', err);
    } finally {
      setIsCheckingName(false);
    }
  };

  // Debounced portfolio name check
  useEffect(() => {
    if (!newPortfolioName.trim()) {
      setNameExists(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      checkPortfolioName(newPortfolioName);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [newPortfolioName, user]);

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
    const hasDuplicateNameError = nameExists;

    if (hasPortfolioNameError || hasAiPromptError || hasDuplicateNameError) {
      setValidationErrors({
        portfolioName: hasPortfolioNameError || hasDuplicateNameError,
        aiPrompt: hasAiPromptError
      });
      
      // Show error message
      const errorMessages = [];
      if (hasPortfolioNameError) errorMessages.push('portfolio name');
      if (hasAiPromptError) errorMessages.push('AI description');
      if (hasDuplicateNameError) {
        setError(`Portfolio name "${newPortfolioName}" already exists. Please choose a different name.`);
        setTimeout(() => setError(null), 5000);
        return;
      }
      
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
      const baseSlug = newPortfolioName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-{2,}/g, '-').replace(/^-|-$/g, '') || 'portfolio'
      let finalSlug = baseSlug

      // Ensure slug uniqueness per user by appending a short suffix if needed
      for (let i = 0; i < 5; i++) {
        const { data: existing } = await supabase
          .from('user_portfolios')
          .select('id')
          .eq('user_id', user.id)
          .eq('slug', finalSlug)
          .maybeSingle()

        if (!existing) break
        finalSlug = `${baseSlug}-${Math.random().toString(36).slice(-4)}`
      }
      
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
          key_projects: { enabled: true, name: 'Key Projects', order: 6 },
          gallery: { enabled: true, name: 'Gallery', order: 4 },
          contact: { enabled: true, name: 'Contact', order: 12 },
          footer: { enabled: true, name: 'Footer', order: 99 }
        };
      }
      
      const { data, error } = await supabase
        .from('user_portfolios')
        .insert({
          user_id: user.id,
          name: newPortfolioName,
          slug: finalSlug,
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

      // Generate sample projects for the new portfolio
      if (aiPrompt.trim()) {
        try {
          const projectsResponse = await fetch('/api/generate-projects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt: aiPrompt
            }),
          });

          if (projectsResponse.ok) {
            const projectsData = await projectsResponse.json();
            console.log('Sample projects generated successfully for portfolio:', data.id);
            
            // Save the generated projects to the portfolio
            if (projectsData.projects && projectsData.projects.length > 0) {
              const { error: updateError } = await supabase
                .from('user_portfolios')
                .update({
                  key_projects_json: projectsData.projects
                })
                .eq('id', data.id);

              if (updateError) {
                console.error('Failed to save projects to database:', updateError);
              } else {
                console.log('Projects saved to database successfully');
              }
            }
          } else {
            console.log('Failed to generate sample projects, but portfolio was created successfully');
          }
        } catch (projectError) {
          console.log('Error generating sample projects:', projectError);
          // Don't fail the portfolio creation if project generation fails
        }
      }

      setPortfolios([data, ...portfolios])
      setNewPortfolioName('')
      setSelectedTemplate('')
      setAiPrompt('')
      setShowTemplates(false)
      setIsCreatingPortfolio(false)
      setCreatingPortfolioData(null)
      setSuccess(aiPrompt.trim() ? '✨ AI-generated portfolio with sample projects created successfully!' : 'Portfolio created successfully!')
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      console.error('Portfolio creation error:', err?.message || err)
      setIsCreatingPortfolio(false)
      setCreatingPortfolioData(null)
      setError(err?.message || 'Failed to create portfolio')
      setTimeout(() => setError(null), 3000)
    }
  }

  const handleDeletePortfolio = async (portfolioId: string) => {
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

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    await handleDeletePortfolio(deleteTarget.id)
    setIsDeleting(false)
    setDeleteTarget(null)
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#1a1a2e] text-slate-900 dark:text-slate-200 overflow-hidden h-screen flex">
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

      {/* Left Sidebar */}
      <aside className="w-64 h-full flex flex-col justify-between bg-white dark:bg-[#161625] border-r border-slate-200 dark:border-white/5 flex-shrink-0 transition-colors">
          <div className="flex flex-col gap-4 p-3">
          {/* Logo */}
          <div className="flex items-center gap-2 px-2">
            <div className="bg-center bg-no-repeat bg-cover rounded-full h-8 w-8 bg-[#3366ff]/20 flex items-center justify-center text-[#3366ff]">
              <Sparkles className="w-4 h-4 text-[#3366ff]" />
          </div>
            <h1 className="text-slate-900 dark:text-white text-base font-bold tracking-tight">Hero Portfolio</h1>
        </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-1">
            <Link 
              href="/dashboard" 
              className="flex items-center gap-2 px-2 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group"
            >
              <Home className="w-4 h-4" />
              <p className="text-xs font-medium leading-normal group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Home</p>
            </Link>
            <Link 
              href="/dashboard" 
              className="flex items-center gap-2 px-2 py-2 rounded-lg bg-[#3366ff]/20 text-[#3366ff] dark:bg-[#3366ff]/20 dark:text-white transition-colors group"
            >
              <FolderOpen className="w-4 h-4 group-hover:text-[#3366ff] transition-colors" />
              <p className="text-xs font-medium leading-normal">Projects</p>
            </Link>
            <Link 
              href="/dashboard/analytics" 
              className="flex items-center gap-2 px-2 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group"
            >
              <BarChart3 className="w-4 h-4" />
              <p className="text-xs font-medium leading-normal group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Analytics</p>
            </Link>
            <Link 
              href="/dashboard/settings" 
              className="flex items-center gap-2 px-2 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group"
            >
              <Settings className="w-4 h-4" />
              <p className="text-xs font-medium leading-normal group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Settings</p>
            </Link>
            <Link 
              href="/dashboard/profile" 
              className="flex items-center gap-2 px-2 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group"
            >
              <User className="w-4 h-4" />
              <p className="text-xs font-medium leading-normal group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Profile</p>
            </Link>
            {isAdmin && (
              <Link 
                href="/dashboard/admin" 
                className="flex items-center gap-2 px-2 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors group"
              >
                <Shield className="w-4 h-4" />
                <p className="text-xs font-medium leading-normal group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Admin</p>
              </Link>
            )}
          </nav>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col gap-3 p-3 border-t border-slate-200 dark:border-white/5">
          <button 
            onClick={() => router.push('/dashboard/billing')}
            className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg h-8 px-3 bg-[#3366ff] text-white text-xs font-bold shadow-lg shadow-[#3366ff]/25 hover:bg-[#4a7dfa] transition-all"
          >
            <span className="truncate">Upgrade Plan</span>
          </button>
          <div className="flex flex-col gap-0.5">
            <Link 
              href="/dashboard/help" 
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
              <p className="text-xs font-medium leading-normal">Help & Support</p>
            </Link>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <p className="text-xs font-medium leading-normal">Log Out</p>
            </button>
          </div>
        </div>
      </aside>

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

      {/* Main Content */}
      <main className="flex-1 h-full overflow-y-auto relative">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3366ff]"></div>
          </div>
        ) : (
          <div className="layout-container flex flex-col max-w-[1400px] mx-auto px-4 py-6 md:px-6 md:py-6">
            {/* Welcome Header */}
            <header className="flex flex-col gap-1.5 mb-6">
              <h1 className="text-slate-900 dark:text-white text-2xl md:text-3xl font-bold leading-tight tracking-[-0.02em]">
                Welcome, {profile?.full_name || profile?.username || 'there'}. <br/>
                <span className="text-slate-400 dark:text-slate-500 text-base md:text-lg font-normal">
                  What vision will you bring to life today?
                </span>
              </h1>
            </header>

            {/* AI Prompt Section */}
            <section className="relative w-full rounded-xl overflow-hidden mb-8 p-1 bg-gradient-to-br from-[#3366ff] via-[#3366ff]/50 to-[#3366ff]/30 p-[1px]">
              <div className="relative w-full bg-white dark:bg-[#23233a] rounded-xl p-4 md:p-6 flex flex-col gap-4 shadow-2xl">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-[#3366ff]/20 blur-[100px] rounded-full pointer-events-none"></div>
                
                <div className="flex flex-col gap-4 relative z-10">
                  <div className="flex flex-col w-full">
                    <label className="sr-only" htmlFor="ai-prompt">Describe your creative vision</label>
                    <div className="relative group">
                      <textarea
                        id="ai-prompt"
                        value={aiPrompt}
                        onChange={e => {
                          setAiPrompt(e.target.value);
                          if (e.target.value) setSelectedTemplate('');
                          if (validationErrors.aiPrompt) {
                            setValidationErrors(prev => ({ ...prev, aiPrompt: false }));
                          }
                        }}
                        className={`flex w-full min-w-0 resize-none overflow-hidden rounded-lg text-slate-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-[#3366ff]/50 border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#1a1a2e]/80 min-h-[120px] placeholder:text-slate-400 dark:placeholder:text-slate-500 p-3 text-sm font-normal leading-relaxed shadow-inner transition-all ${
                          validationErrors.aiPrompt 
                            ? 'border-red-400/60 bg-red-500/5' 
                            : ''
                        }`}
                        placeholder="Describe the essence of your project. What story do you want to tell? What emotions should it evoke? (e.g., 'A tranquil gallery for nature photography, with warm, muted tones and organic textures,' or 'A vibrant portfolio for a digital artist, full of dynamic shapes and bold colors')..."
                      />
                      <div className="absolute bottom-3 right-3 flex gap-2">
                        <button
                          onClick={handleCreatePortfolio}
                          disabled={nameExists || isCheckingName || !aiPrompt.trim() || !newPortfolioName.trim()}
                          className="flex items-center justify-center rounded-lg h-8 px-3 bg-[#3366ff] hover:bg-[#4a7dfa] text-white gap-1.5 text-xs font-bold tracking-[0.015em] shadow-lg shadow-[#3366ff]/30 transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Sparkles className="w-4 h-4" />
                          <span>Generate</span>
                        </button>
                      </div>
                    </div>
                  </div>
                    </div>

                {/* Portfolio Name Input */}
                <div className="flex flex-col gap-2 relative z-10">
                    <div className="flex items-center justify-center">
                      <div className="relative">
                        <input
                          type="text"
                          value={newPortfolioName}
                          onChange={(e) => {
                            const value = e.target.value.slice(0, 30);
                            const sanitizedValue = value.replace(/[^a-zA-Z0-9_-]/g, '');
                            setNewPortfolioName(sanitizedValue);
                            if (validationErrors.portfolioName) {
                              setValidationErrors(prev => ({ ...prev, portfolioName: false }));
                            }
                          }}
                        className={`w-56 px-2.5 py-1.5 pr-7 bg-slate-50 dark:bg-[#1a1a2e]/80 border rounded-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#3366ff]/50 text-xs ${
                          validationErrors.portfolioName || nameExists
                              ? 'border-red-400/60 bg-red-500/5' 
                            : 'border-slate-200 dark:border-white/10'
                          }`}
                        placeholder="Portfolio Name"
                          maxLength={30}
                        />
                      <span className="absolute bottom-0.5 right-1.5 text-[10px] text-slate-400">
                          {30 - newPortfolioName.length}
                        </span>
                      </div>
                    </div>
                    
                  {/* Name availability indicator */}
                    {newPortfolioName.trim() && (
                      <div className="flex justify-center">
                      <div className="flex items-center space-x-1.5 text-xs">
                          {isCheckingName ? (
                            <>
                            <div className="w-3 h-3 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                              <span className="text-yellow-400">Checking availability...</span>
                            </>
                          ) : nameExists ? (
                            <>
                              <span className="text-orange-400">Portfolio name already exists</span>
                            </>
                          ) : (
                            <>
                              <span className="text-green-400">Portfolio name available</span>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                </div>

                {/* Template Selection */}
                <div className="flex flex-col gap-2 relative z-10">
                  <h3 className="text-slate-900 dark:text-white tracking-tight text-base font-bold flex items-center gap-2">
                    <Palette className="w-4 h-4 text-[#3366ff]" />
                    Or draw inspiration from a template
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2">
                    {templates.slice(0, 6).map((template) => (
                      <button
                        key={template.id}
                        onClick={() => {
                          setSelectedTemplate(template.id);
                          setShowTemplateModal(false);
                        }}
                        className="group flex flex-col text-left gap-1.5 p-2 rounded-md border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-[#23233a] hover:border-[#3366ff]/50 hover:shadow-lg dark:hover:shadow-[#3366ff]/10 transition-all"
                      >
                        <div className="w-full aspect-[4/3] rounded overflow-hidden relative bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Layout className="w-6 h-6 text-slate-400" />
                        </div>
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity">
                            <span className="px-2 py-0.5 bg-white text-slate-900 text-[10px] font-bold rounded-full">Explore</span>
                    </div>
                        </div>
                        <div>
                          <h4 className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-[#3366ff] transition-colors truncate">{template.name}</h4>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1">{template.description || 'Template'}</p>
                        </div>
                      </button>
                    ))}
                      <button
                      onClick={() => setShowTemplateModal(true)}
                      className="group flex flex-col text-left gap-1.5 p-2 rounded-md border border-dashed border-slate-300 dark:border-white/20 bg-transparent hover:bg-slate-50 dark:hover:bg-white/5 transition-all items-center justify-center min-h-[80px]"
                    >
                      <Layout className="w-6 h-6 text-slate-400 group-hover:text-[#3366ff] transition-colors" />
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400 group-hover:text-[#3366ff] text-center">All Templates</span>
                      </button>
                    </div>
                  </div>
                </div>
            </section>



            {/* Your Creations Section */}
            <section className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Your Creations
                  <span className="text-xs font-normal px-1.5 py-0.5 rounded bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-300">
                    {portfolios.length} {portfolios.length === 1 ? 'Active' : 'Active'}
                  </span>
                </h2>
                {portfolios.length > 0 && (
                  <button className="text-xs font-medium text-[#3366ff] hover:text-[#4a7dfa] transition-colors">
                    View all projects
                      </button>
                )}
                </div>

                {portfolios.length === 0 ? (
                  <div className="text-center py-8">
                  <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Briefcase className="w-6 h-6 text-slate-400" />
                    </div>
                  <h3 className="text-base font-medium text-slate-900 dark:text-white mb-1">No portfolios yet</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">Create your first portfolio to get started</p>
                  </div>
                ) : (
                <div className="flex flex-col gap-4">
                    {/* Cooking Animation Card */}
                    {isCreatingPortfolio && creatingPortfolioData && (
                    <div className="group flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 rounded-lg bg-white dark:bg-[#23233a] border border-slate-200 dark:border-white/5 hover:border-[#3366ff]/30 transition-all shadow-sm animate-pulse">
                      <div className="w-full sm:w-24 h-16 sm:h-16 rounded-md overflow-hidden shrink-0 bg-gradient-to-br from-[#3366ff]/20 to-[#3366ff]/10 flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-[#3366ff] animate-spin" />
                            </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{creatingPortfolioData.name}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">Creating your portfolio...</p>
                            </div>
                      <div className="px-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 text-[10px] font-semibold">
                          <span className="w-1 h-1 rounded-full bg-current animate-pulse"></span>
                          Creating...
                            </span>
                        </div>
                      </div>
                    )}
                    
                  {/* Portfolio Cards */}
                    {portfolios.map((p) => (
                    <div key={p.id} className="group flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 rounded-lg bg-white dark:bg-[#23233a] border border-slate-200 dark:border-white/5 hover:border-[#3366ff]/30 transition-all shadow-sm">
                      <div className="w-full sm:w-24 h-16 sm:h-16 rounded-md overflow-hidden shrink-0 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800">
                        {p.theme_name && (
                          <div className="w-full h-full flex items-center justify-center">
                            <Layout className="w-6 h-6 text-slate-400" />
                          </div>
                        )}
                      </div>
                          <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{p.name}</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                          {p.is_published 
                            ? `https://${profile?.username || 'user'}.heroportfolio.com/${p.slug}`
                            : 'Not published yet'
                          }
                        </p>
                          </div>
                      <div className="px-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                p.is_published
                            ? 'bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                            : 'bg-slate-100 dark:bg-slate-700/30 text-slate-600 dark:text-slate-400'
                        }`}>
                          <span className="w-1 h-1 rounded-full bg-current"></span>
                              {p.is_published ? 'Published' : 'Draft'}
                              </span>
                          </div>
                      <div className="flex items-center gap-4 text-xs text-slate-400 sm:border-l sm:border-slate-200 sm:dark:border-white/10 sm:pl-4">
                        <div className="flex items-center gap-1" title="Total Views">
                          <Eye className="w-3.5 h-3.5" />
                          <span>{(p as any).views ?? 0}</span>
                        </div>
                        <div className="flex items-center gap-1" title="Last Edited">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{new Date(p.updated_at || p.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => router.push(`/dashboard/portfolio/${p.id}/edit`)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors"
                          title="Edit Site"
                            >
                          <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => window.open(`/portfolio/${profile?.username || 'user'}/${p.slug}`, '_blank', 'noopener,noreferrer')}
                          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300 transition-colors"
                              title="View Portfolio"
                            >
                          <ExternalLink className="w-4 h-4" />
                            </button>
                            <button
                          onClick={() => setDeleteTarget(p)}
                          className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-red-500 dark:text-red-400 transition-colors"
                          title="Delete portfolio"
                        >
                          <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                    ))}
                          </div>
                        )}
            </section>
                  </div>
                )}
      </main>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1f1f2d] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Delete Portfolio</p>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{deleteTarget.name}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                  This will permanently remove this portfolio and its content. This action cannot be undone.
                </p>
              </div>
              <button
                onClick={() => !isDeleting && setDeleteTarget(null)}
                className="p-2 text-slate-400 hover:text-slate-200 transition-colors"
                aria-label="Close delete modal"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition disabled:opacity-60 flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
          </div>
      </div>
        </div>
      )}

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

      {/* Mobile Floating Action Button */}
      <div className="fixed bottom-6 right-6 lg:hidden z-50">
        <button
          onClick={() => {
            setShowTemplateModal(true);
          }}
          className="flex items-center justify-center w-14 h-14 rounded-full bg-[#3366ff] text-white shadow-xl shadow-[#3366ff]/40 hover:scale-110 transition-transform"
        >
          <Sparkles className="w-7 h-7" />
        </button>
      </div>
    </div>
  )
} 