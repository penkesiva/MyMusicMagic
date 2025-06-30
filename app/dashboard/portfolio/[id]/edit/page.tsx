"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useDebouncedCallback } from "use-debounce";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  PlusCircle, Trash2, Edit, Upload, Image, X, RefreshCw, ExternalLink, ChevronDown, List, Grid, FileText, Sparkles, Star, Plus, Eye, Wand2, Save, Layout, Check, Home, User, Music, ImageIcon, Briefcase, MessageSquare, Newspaper, Contact, Settings, Heart, Code, GraduationCap, Camera, Video, Mic, Headphones, Palette, Globe, Mail, Phone, MapPin, Twitter, Instagram, Linkedin, Github, Youtube, ExternalLink as ExternalLinkIcon, Award
} from "lucide-react";
import { Portfolio } from "@/types/portfolio";
import { SECTIONS_CONFIG } from "@/lib/sections";
import { HOBBIES_LIST } from "@/lib/hobbies";
import { SKILLS_LIST } from "@/lib/skills";
import { PortfolioTrackForm } from "@/components/portfolio/PortfolioTrackForm";
import PortfolioGalleryForm from "@/components/portfolio/PortfolioGalleryForm";
import { THEMES } from "@/lib/themes";
import PortfolioTracksDisplay from "@/components/portfolio/PortfolioTracksDisplay";
import PortfolioGalleryDisplay from "@/components/portfolio/PortfolioGalleryDisplay";
import PortfolioKeyProjectsEditor from "@/components/portfolio/PortfolioKeyProjectsEditor";
import PortfolioTestimonialsEditor from "@/components/portfolio/PortfolioTestimonialsEditor";
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import PressMentionsForm from '@/components/portfolio/PressMentionsForm';
import { generateEnhancedAITitle } from '@/lib/utils';
import PortfolioAIAssistant from '@/components/portfolio/PortfolioAIAssistant';
import PortfolioThemeSelector from '@/components/portfolio/PortfolioThemeSelector';
import PortfolioSectionManager from '@/components/portfolio/PortfolioSectionManager';
import { PortfolioFileUploader } from '@/components/portfolio/PortfolioFileUploader';
import { safeGetArray, getSectionTitle, getSortedEditorSections } from '@/lib/portfolioEditorUtils';
import PortfolioBottomAudioPlayer from '@/components/portfolio/PortfolioBottomAudioPlayer'
import { Switch } from '@/components/ui/switch';
import SponsorsForm from '@/components/portfolio/SponsorsForm';

const NAVBAR_HEIGHT = 56;
const SIDEBAR_MIN_WIDTH = 220;
const SIDEBAR_DEFAULT_WIDTH = 240;
const SIDEBAR_MAX_WIDTH = 320;

// Section icons mapping
const SECTION_ICONS: Record<string, React.ComponentType<any>> = {
  hero: Home,
  about: User,
  tracks: Music,
  gallery: ImageIcon,
  key_projects: Briefcase,
  testimonials: MessageSquare,
  press: Newspaper,
  resume: FileText,
  contact: Contact,
  skills: Code,
  hobbies: Heart,
  blog: FileText,
  status: Star,
  sponsors: Award,
  footer: Settings
};

// Helper function to get section icon
const getSectionIcon = (sectionKey: string) => {
  const IconComponent = SECTION_ICONS[sectionKey];
  return IconComponent ? <IconComponent className="w-5 h-5" /> : <Settings className="w-5 h-5" />;
};

const PortfolioEditorPage = () => {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [savingStatus, setSavingStatus] = useState("saved");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isPublished, setIsPublished] = useState(false);
  const [isMac, setIsMac] = useState(false);
  const [hasUnpublishedChanges, setHasUnpublishedChanges] = useState(false);
  
  const [editingTrack, setEditingTrack] = useState<any | null>(null);
  const [showAddTrackForm, setShowAddTrackForm] = useState(false);
  
  const [editingGalleryItem, setEditingGalleryItem] = useState<any | null>(null);
  const [showAddGalleryForm, setShowAddGalleryForm] = useState(false);
  const [showEditTrackForm, setShowEditTrackForm] = useState(false);
  const [showEditGalleryForm, setShowEditGalleryForm] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [galleryViewMode, setGalleryViewMode] = useState<'list' | 'grid'>('list');
  const [galleryFilter, setGalleryFilter] = useState<'all' | 'photo' | 'video'>('all');
  const [trackViewMode, setTrackViewMode] = useState<'list' | 'grid'>('list');
  const [uploadingResume, setUploadingResume] = useState(false);
  const [hobbySearch, setHobbySearch] = useState("");
  const [skillSearch, setSkillSearch] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [sectionOrder, setSectionOrder] = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(SIDEBAR_DEFAULT_WIDTH);
  const [isResizing, setIsResizing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [tracksRefreshKey, setTracksRefreshKey] = useState(0);
  const [galleryRefreshKey, setGalleryRefreshKey] = useState(0);
  const [showBottomAudioPlayer, setShowBottomAudioPlayer] = useState(false);

  const supabase = useMemo(() => createClient(), []);
  const fileUploader = useMemo(() => new PortfolioFileUploader(), []);

  // Helper function to scroll to section (moved inside component to access state)
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      // Expand the section if it's collapsed
      if (!openSections[sectionId]) {
        setOpenSections(prev => ({ ...prev, [sectionId]: true }));
      }
      
      // Add a subtle highlight effect
      element.style.transition = 'box-shadow 0.3s ease';
      element.style.boxShadow = '0 0 0 2px rgba(168, 85, 247, 0.3)';
      
      // Scroll to the element
      element.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest'
      });
      
      // Remove the highlight after a delay
      setTimeout(() => {
        element.style.boxShadow = '';
      }, 2000);
    }
  };

  // Refresh functions for tracks and gallery
  const refreshTracks = () => {
    setTracksRefreshKey(prev => prev + 1)
  }

  const refreshGallery = useCallback(() => {
    setGalleryRefreshKey(prev => prev + 1);
  }, []);

  // Save changes to database
  const saveChanges = useDebouncedCallback(async (fields: Partial<Portfolio>) => {
    if (!portfolio) return;
    
    setSavingStatus("saving");
    setSaveError(null);
    
    try {
      const { id } = portfolio;
      const { error } = await supabase
        .from('user_portfolios')
        .update(fields)
        .eq('id', id);
      
      if (error) {
        setSavingStatus("error");
        setSaveError(error.message);
        console.error('Save error:', error);
      } else {
        setSavingStatus("saved");
        setHasUnpublishedChanges(true);
      }
    } catch (error: any) {
      setSavingStatus("error");
      setSaveError(error.message || 'Unknown error occurred');
      console.error('Save error:', error);
    }
  }, 600);

  // Fetch portfolio data
  const fetchPortfolio = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      
      // Get portfolio data
      const { data: portfolioData, error: portfolioError } = await supabase
        .from('user_portfolios')
        .select('*')
        .eq('id', id)
        .single();

      if (portfolioError) {
        console.error('Error fetching portfolio:', portfolioError);
        return;
      }

      setPortfolio(portfolioData);
      setSectionOrder(getSortedEditorSections(portfolioData));
      setIsPublished(portfolioData.is_published || false);

      // Get user profile
      const { data: userData, error: userError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', portfolioData.user_id)
        .single();

      if (!userError) {
        setUserProfile(userData);
      }

    } catch (error) {
      console.error('Error in fetchPortfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
  }, [id, router, supabase]);

  // Detect operating system for keyboard shortcuts
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    setIsMac(userAgent.includes('mac'));
  }, []);

  // Handle field changes
  const handleFieldChange = (field: keyof Portfolio, value: any) => {
    setSavingStatus("unsaved");
    setPortfolio(prev => ({ ...prev!, [field]: value }));
    
    // Always auto-save
    saveChanges({ [field]: value });
  };

  // Handle section config changes
  const handleSectionConfigChange = (
    sectionKey: keyof typeof SECTIONS_CONFIG,
    configKey: "enabled" | "name" | "title" | "audio_player_mode",
    value: boolean | string
  ) => {
    if (!portfolio || !portfolio.sections_config) return;
    
    setSavingStatus("unsaved");
    
    const newConfig = { ...(portfolio.sections_config as Record<string, any>) };
    
    if (!newConfig[sectionKey]) {
      newConfig[sectionKey] = {};
    }
    
    // Track manual user choices for enabled/disabled sections
    if (configKey === "enabled") {
      const currentEnabled = newConfig[sectionKey].enabled;
      const newEnabled = value as boolean;
      
      if (currentEnabled !== newEnabled) {
        if (newEnabled) {
          newConfig[sectionKey].user_manually_enabled = true;
          newConfig[sectionKey].user_manually_disabled = false;
        } else {
          newConfig[sectionKey].user_manually_disabled = true;
          newConfig[sectionKey].user_manually_enabled = false;
        }
      }
    }
    
    (newConfig[sectionKey] as any)[configKey] = value;
    setPortfolio(prev => prev ? { ...prev, sections_config: newConfig } : null);
    
    // Always auto-save
    saveChanges({ sections_config: newConfig });
  };

  // Handle drag end for section reordering
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id !== over.id) {
      const oldIndex = sectionOrder.indexOf(active.id as string);
      const newIndex = sectionOrder.indexOf(over.id as string);
      const newOrder = arrayMove(sectionOrder, oldIndex, newIndex);
      setSectionOrder(newOrder);
      
      if (portfolio) {
        setSavingStatus("unsaved");
        const updatedConfig = { ...portfolio.sections_config };
        newOrder.forEach((key: string, idx: number) => {
          if (updatedConfig[key]) updatedConfig[key].order = idx + 1;
        });
        setPortfolio({ ...portfolio, sections_config: updatedConfig });
        
        // Always auto-save
        saveChanges({ sections_config: updatedConfig });
      }
    }
  };

  // File upload handlers
  const uploadHeroImage = async (file: File) => {
    if (!portfolio) return;
    setUploadingHero(true);
    try {
      const publicUrl = await fileUploader.uploadHeroImage(file, portfolio.id);
      handleFieldChange('hero_image_url', publicUrl);
    } catch (error: any) {
      console.error('Error uploading hero image:', error);
      alert(`Failed to upload image: ${error.message || 'Unknown error'}`);
    } finally {
      setUploadingHero(false);
    }
  };

  const uploadProfilePhoto = async (file: File) => {
    if (!portfolio) return;
    setUploadingProfile(true);
    try {
      const publicUrl = await fileUploader.uploadProfilePhoto(file, portfolio.id);
      handleFieldChange('profile_photo_url', publicUrl);
    } catch (error: any) {
      console.error('Error uploading profile photo:', error);
      alert(`Failed to upload image: ${error.message || 'Unknown error'}`);
    } finally {
      setUploadingProfile(false);
    }
  };

  const uploadResume = async (file: File) => {
    if (!portfolio) return;
    setUploadingResume(true);
    try {
      const publicUrl = await fileUploader.uploadResume(file, portfolio.id);
      handleFieldChange('resume_url', publicUrl);
    } catch (error: any) {
      console.error('Error uploading resume:', error);
      alert(`Failed to upload resume: ${error.message || 'Unknown error'}`);
    } finally {
      setUploadingResume(false);
    }
  };

  // Hobby and skill handlers
  const handleAddHobby = (hobby: { name: string; icon: string }) => {
    const currentHobbies = safeGetArray(portfolio?.hobbies_json);
    if (!currentHobbies.some(h => h.name === hobby.name)) {
      const newHobbies = [...currentHobbies, hobby];
      handleFieldChange('hobbies_json', newHobbies);
    }
    setHobbySearch("");
  };

  const handleRemoveHobby = (hobbyName: string) => {
    const currentHobbies = safeGetArray(portfolio?.hobbies_json);
    const filteredHobbies = currentHobbies.filter(h => h.name !== hobbyName);
    handleFieldChange('hobbies_json', filteredHobbies);
  };

  const handleAddSkill = (skill: { name: string; color: string }) => {
    const currentSkills = safeGetArray(portfolio?.skills_json);
    if (!currentSkills.some(s => s.name === skill.name)) {
      handleFieldChange('skills_json', [...currentSkills, skill]);
    }
    setSkillSearch("");
  };

  const handleRemoveSkill = (skillName: string) => {
    const currentSkills = safeGetArray(portfolio?.skills_json);
    handleFieldChange('skills_json', currentSkills.filter(s => s.name !== skillName));
  };

  // Section toggle handlers
  const toggleSection = (key: string) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const expandAll = () => {
    const allOpen = Object.keys(SECTIONS_CONFIG).reduce((acc, key) => ({ ...acc, [key]: true }), {});
    setOpenSections(allOpen);
  };

  const collapseAll = () => {
    setOpenSections({});
  };

  // Filtered lists
  const filteredHobbies = HOBBIES_LIST.filter(hobby => 
    hobby.name.toLowerCase().includes(hobbySearch.toLowerCase()) &&
    !safeGetArray(portfolio?.hobbies_json).some(h => h.name === hobby.name)
  );

  const filteredSkills = SKILLS_LIST.filter(skill => 
    skill.name.toLowerCase().includes(skillSearch.toLowerCase()) &&
    !safeGetArray(portfolio?.skills_json).some(s => s.name === skill.name)
  );

  // Explicit save function
  const handleExplicitSave = async () => {
    if (!portfolio) return;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('user_portfolios')
        .update(portfolio)
        .eq('id', portfolio.id);
      
      if (error) {
        console.error('Save error:', error);
        alert('Error saving portfolio. Please try again.');
      } else {
        setSavingStatus('saved');
        alert('Portfolio saved successfully!');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Error saving portfolio. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Manual save function
  const handleManualSave = async () => {
    if (!portfolio) return;
    
    setSavingStatus("saving");
    setSaveError(null);
    
    try {
      // Save the complete current portfolio state
      const { error } = await supabase
        .from('user_portfolios')
        .update(portfolio)
        .eq('id', portfolio.id);
      
      if (error) {
        setSavingStatus("error");
        setSaveError(error.message);
        console.error('Manual save error:', error);
      } else {
        setSavingStatus("saved");
        setHasUnpublishedChanges(true);
        console.log('Manual save successful:', portfolio);
      }
    } catch (error: any) {
      setSavingStatus("error");
      setSaveError(error.message || 'Unknown error occurred');
      console.error('Manual save error:', error);
    }
  };

  // Publish portfolio to make it publicly visible
  const handlePublish = async () => {
    if (!portfolio) return;
    
    try {
      const { error } = await supabase
        .from('user_portfolios')
        .update({ is_published: true })
        .eq('id', portfolio.id);
      
      if (error) {
        setSaveError(error.message);
        console.error('Publish error:', error);
      } else {
        setIsPublished(true);
        setHasUnpublishedChanges(false);
        setPortfolio(prev => prev ? { ...prev, is_published: true } : null);
      }
    } catch (error: any) {
      setSaveError(error.message || 'Failed to publish portfolio');
      console.error('Publish error:', error);
    }
  };

  // Add event listener for bottom audio player
  useEffect(() => {
    const handlePlayTrack = () => {
      if (portfolio?.sections_config?.tracks?.audio_player_mode === 'bottom') {
        setShowBottomAudioPlayer(true)
      }
    }

    window.addEventListener('playTrack', handlePlayTrack)
    return () => {
      window.removeEventListener('playTrack', handlePlayTrack)
    }
  }, [portfolio?.sections_config?.tracks?.audio_player_mode])

  const handleEditTrack = (track: any) => {
    setEditingTrack(track)
    setShowEditTrackForm(true)
  }

  const handleEditGalleryItem = (item: any) => {
    setEditingGalleryItem(item)
    setShowEditGalleryForm(true)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900">
        <p>Loading Portfolio Editor...</p>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900">
        <p className="text-red-500">Portfolio not found.</p>
      </div>
    );
  }

  const selectedTheme = THEMES.find(t => t.name === portfolio.theme_name) || THEMES[0];

  return (
    <div className="h-screen w-screen flex flex-row bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Left Sidebar - Full height, from top to bottom */}
      <aside
        className={`flex flex-col gap-4 bg-black/40 text-sm overflow-y-auto h-full border-r border-white/10 transition-all duration-200 relative ${sidebarOpen ? '' : 'hidden md:flex'} pt-4 px-2 custom-scrollbar-hide`}
        style={{
          width: 320,
          minWidth: 320,
          maxWidth: 320,
          transition: 'width 0.2s',
        }}
      >
        <button
          onClick={() => router.push('/dashboard')}
          className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/15 hover:border-white/20 transition-all duration-200 text-sm font-medium group mx-auto justify-center"
        >
          <svg className="w-4 h-4 text-white group-hover:text-purple-300 transition" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span className="whitespace-nowrap">Back to Dashboard</span>
        </button>
        <div className="flex flex-row items-center justify-center text-center mb-4 gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
          <div className="flex flex-col items-start text-left">
            <h2 className="text-lg font-bold text-white">Portfolio Editor</h2>
            <p className="text-xs text-gray-300 mt-1">Customize your hero-portfolio.</p>
          </div>
        </div>

        {/* AI Assistant Component */}
        <PortfolioAIAssistant
          portfolio={portfolio}
          onPortfolioUpdate={(updatedPortfolio) => {
            setPortfolio(updatedPortfolio);
            // Update sectionOrder to include all enabled sections, sorted by order/defaultOrder
            const enabledSections = Object.keys(updatedPortfolio.sections_config)
              .filter(key => updatedPortfolio.sections_config[key]?.enabled);
            const sortedSections = enabledSections.sort((a, b) => {
              const orderA = updatedPortfolio.sections_config[a]?.order ?? SECTIONS_CONFIG[a]?.defaultOrder ?? 999;
              const orderB = updatedPortfolio.sections_config[b]?.order ?? SECTIONS_CONFIG[b]?.defaultOrder ?? 999;
              return orderA - orderB;
            });
            setSectionOrder(sortedSections);
          }}
          isGenerating={isGenerating}
          setIsGenerating={setIsGenerating}
          theme={selectedTheme}
          onSave={handleExplicitSave}
        />

        {/* Theme Selector Component */}
        <PortfolioThemeSelector
          portfolio={portfolio}
          onFieldChange={handleFieldChange}
          theme={selectedTheme}
        />

        {/* Section Manager Component */}
        <PortfolioSectionManager
          portfolio={portfolio}
          onSectionConfigChange={handleSectionConfigChange}
          onDragEnd={handleDragEnd}
          sectionOrder={sectionOrder}
          theme={selectedTheme}
          onSectionClick={scrollToSection}
        />
      </aside>
      {/* Main Area: Nav-Bar + Editor */}
      <div className="flex flex-col flex-1 min-h-0">
        {/* Nav-Bar - Only above editor area */}
        <div
          className="flex items-center justify-between px-6"
          style={{
            height: NAVBAR_HEIGHT,
            minHeight: NAVBAR_HEIGHT,
            maxHeight: NAVBAR_HEIGHT,
            background: 'rgba(20,20,30,0.95)',
            boxShadow: '0 2px 8px 0 rgba(0,0,0,0.10)',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
            zIndex: 50,
            position: 'relative',
          }}
        >
          <div className="flex items-center gap-4">
            <button
              className="md:hidden p-2 text-white"
              onClick={() => setSidebarOpen((v) => !v)}
              aria-label="Toggle sidebar"
            >
              <span className="material-icons">menu</span>
            </button>
            <span className="text-lg font-semibold text-gray-300">Editing:</span>
            <span className="text-xl font-bold text-white">{portfolio.name || 'Untitled Portfolio'}</span>
          </div>
          <div className="flex items-center gap-4">
            {/* Save Controls Group */}
            <div className="flex items-center gap-4 bg-white/5 rounded-lg px-4 py-2 border border-white/10">
              {/* Save Status */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Status:</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  savingStatus === 'saving' ? 'bg-yellow-500/20 text-yellow-300' :
                  savingStatus === 'saved' ? 'bg-green-500/20 text-green-300' :
                  savingStatus === 'unsaved' ? 'bg-orange-500/20 text-orange-300' :
                  'bg-red-500/20 text-red-300'
                }`}>
                  {savingStatus === 'saving' ? 'Saving...' :
                    savingStatus === 'saved' ? 'Saved' :
                    savingStatus === 'unsaved' ? 'Unsaved' : 'Error'}
                </span>
              </div>
            </div>

            {/* Preview Button */}
            <Button
              onClick={() => window.open(`/portfolio/preview/${portfolio.id}`, '_blank', 'noopener,noreferrer')}
              variant="outline"
              size="sm"
              className="bg-blue-600/20 border-blue-500/30 text-blue-300 hover:bg-blue-600/30"
            >
              <Eye className="h-4 w-4 mr-1" />
              Preview
            </Button>

            {/* Publish Button */}
            <Button
              onClick={handlePublish}
              variant="outline"
              size="sm"
              disabled={!hasUnpublishedChanges && isPublished}
              className={`${
                hasUnpublishedChanges 
                  ? 'bg-orange-600/20 border-orange-500/30 text-orange-300 hover:bg-orange-600/30' 
                  : isPublished
                  ? 'bg-green-600/20 border-green-500/30 text-green-300'
                  : 'bg-gray-600/20 border-gray-500/30 text-gray-400'
              }`}
            >
              {hasUnpublishedChanges ? (
                <>
                  <Upload className="h-4 w-4 mr-1" />
                  Publish Changes
                </>
              ) : isPublished ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Published
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-1" />
                  Publish
                </>
              )}
            </Button>

            {/* Public Button */}
            <Button
              onClick={() => window.open(`/portfolio/${userProfile?.username}/${portfolio.slug}`, '_blank', 'noopener,noreferrer')}
              variant="outline"
              size="sm"
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              Public
            </Button>
          </div>
        </div>
        {/* Error Popup */}
        {saveError && (
          <div className="fixed top-20 right-6 z-50 bg-red-900/90 border border-red-500/50 rounded-lg p-4 max-w-sm shadow-lg">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h3 className="text-red-200 font-medium mb-1">Save Error</h3>
                <p className="text-red-300 text-sm">{saveError}</p>
              </div>
              <button
                onClick={() => setSaveError(null)}
                className="text-red-300 hover:text-red-100 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* Main Editor Content */}
        <main className={`flex-1 p-6 overflow-y-auto ${selectedTheme.colors.background}`} style={{ minHeight: 0 }}>
          {/* AI Loading Animation */}
          {isGenerating && (
            <div className="mb-6">
              <div className="bg-white/10 rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full animate-pulse" style={{ width: '100%' }}></div>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm text-purple-300">AI is generating content...</span>
                </div>
                <span className="text-xs text-gray-500">Please wait</span>
              </div>
            </div>
          )}
          
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="flex justify-end items-center gap-2">
              <span className="text-sm text-gray-400">Manage Sections</span>
              <Button onClick={expandAll} variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">Expand All</Button>
              <Button onClick={collapseAll} variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">Collapse All</Button>
            </div>

            {/* Section Editors */}
            {sectionOrder.map(key => {
              const sectionConfig = SECTIONS_CONFIG[key];
              if (!sectionConfig) return null;
              
              const isEnabled = (portfolio.sections_config as any)?.[key]?.enabled;
              
              return (
                <section key={key} id={key} className={`bg-white/5 rounded-xl border border-white/10 overflow-hidden transition-all duration-300 ${!isEnabled ? 'opacity-50' : ''}`}>
                  <button 
                    onClick={() => toggleSection(key)} 
                    className={`w-full flex items-center justify-between p-4 ${selectedTheme.colors.card} hover:bg-opacity-80 transition-colors ${!isEnabled ? 'cursor-not-allowed' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 text-purple-400">
                        {getSectionIcon(key)}
                        <h2 className={`text-lg font-semibold ${selectedTheme.colors.heading}`}>
                          {sectionConfig.defaultName}
                        </h2>
                      </div>
                      {!isEnabled && (
                        <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded-full">
                          Disabled
                        </span>
                      )}
                    </div>
                    <ChevronDown className={`w-5 h-5 transform transition-transform text-white ${openSections[key] ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {openSections[key] && (
                    <div className="p-6">
                      {!isEnabled && (
                        <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                          <p className="text-yellow-300 text-sm">
                            This section is currently disabled. Enable it in the Sections panel to the left to start editing.
                          </p>
                        </div>
                      )}

                      {/* Section Title Editor */}
                      {sectionConfig.hasCustomTitle && (
                        <div className="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
                          <div className="flex items-center justify-between mb-3">
                            <label className={`block text-sm font-medium ${selectedTheme.colors.text}`}>
                              Section Title
                            </label>
                          </div>
                          <Input
                            type="text"
                            value={getSectionTitle(key, portfolio)}
                            onChange={(e) => handleSectionConfigChange(key as keyof typeof SECTIONS_CONFIG, 'title', e.target.value)}
                            placeholder={`Enter title for ${sectionConfig.defaultName} section`}
                            className={`w-full text-sm ${selectedTheme.colors.background} ${selectedTheme.colors.text} border-transparent focus:ring-2 focus:ring-purple-400`}
                          />
                          <p className={`text-xs ${selectedTheme.colors.text} opacity-70 mt-1`}>
                            This title will be displayed at the top of the {sectionConfig.defaultName} section on your portfolio. Use the AI Assistant to generate creative titles.
                          </p>
                        </div>
                      )}
                      
                      {/* Section-specific content would go here */}
                      {/* This is where you'd add the individual section editors */}
                      
                      {key === 'hero' && (
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                            {/* Left Column: Title & Subtitle */}
                            <div className="space-y-4">
                              <div>
                                <label className={`block text-sm font-medium ${selectedTheme.colors.text} mb-2`}>
                                  Hero Title
                                </label>
                                <Input
                                  type="text"
                                  value={portfolio.hero_title || ''}
                                  onChange={(e) => handleFieldChange('hero_title', e.target.value)}
                                  placeholder="Your main title"
                                  className={`w-full text-sm ${selectedTheme.colors.background} ${selectedTheme.colors.text} border-transparent focus:ring-2 focus:ring-purple-400`}
                                />
                              </div>
                              <div>
                                <label className={`block text-sm font-medium ${selectedTheme.colors.text} mb-2`}>
                                  Hero Subtitle
                                </label>
                                <Input
                                  type="text"
                                  value={portfolio.hero_subtitle || ''}
                                  onChange={(e) => handleFieldChange('hero_subtitle', e.target.value)}
                                  placeholder="Brief description or tagline"
                                  className={`w-full text-sm ${selectedTheme.colors.background} ${selectedTheme.colors.text} border-transparent focus:ring-2 focus:ring-purple-400`}
                                />
                              </div>
                            </div>

                            {/* Right Column: Image Upload */}
                            <div className="space-y-2">
                              <label className={`block text-sm font-medium ${selectedTheme.colors.text} mb-2`}>
                                Hero Background Image
                              </label>
                              {portfolio.hero_image_url ? (
                                  <div className="relative group">
                                      <img src={portfolio.hero_image_url} alt="Hero" className="w-full h-32 object-cover rounded-lg border border-white/10" />
                                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                                          <button onClick={() => handleFieldChange('hero_image_url', '')} className="p-2 bg-red-500/80 text-white rounded-full hover:bg-red-500">
                                              <Trash2 className="h-4 w-4" />
                                          </button>
                                      </div>
                                  </div>
                              ) : (
                                  <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center">
                                    <Image className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                                    <p className={`text-xs ${selectedTheme.colors.text} mb-2`}>No image set</p>
                                  </div>
                              )}
                              <div className="flex gap-2">
                                <Input
                                  type="url"
                                  value={portfolio.hero_image_url || ''}
                                  onChange={(e) => handleFieldChange('hero_image_url', e.target.value)}
                                  placeholder="Paste image URL"
                                  className={`flex-1 text-sm ${selectedTheme.colors.background} ${selectedTheme.colors.text} border-transparent focus:ring-2 focus:ring-purple-400`}
                                />
                                <input
                                  type="file" id="hero-upload" accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) uploadHeroImage(file);
                                    e.target.value = '';
                                  }}
                                  className="hidden"
                                />
                                <Button
                                  onClick={() => document.getElementById('hero-upload')?.click()}
                                  variant="outline" size="sm" disabled={uploadingHero}
                                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                                >
                                  {uploadingHero ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                </Button>
                              </div>
                            </div>
                          </div>

                          {/* CTA Buttons Section */}
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <label className={`block text-sm font-medium ${selectedTheme.colors.text}`}>
                                Call-to-Action Buttons
                              </label>
                              <Button
                                onClick={() => {
                                  const buttons = safeGetArray(portfolio.hero_cta_buttons);
                                  buttons.push({ text: '', link: '', style: 'primary', order: buttons.length + 1 });
                                  handleFieldChange('hero_cta_buttons', buttons);
                                }}
                                variant="outline" size="sm"
                                className="bg-green-600/20 border-green-500/30 text-green-300 hover:bg-green-600/30"
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Add Button
                              </Button>
                            </div>
                            
                            <div className="space-y-3">
                              {safeGetArray(portfolio.hero_cta_buttons).map((button: any, index: number) => (
                                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2 p-3 bg-white/5 rounded-lg border border-white/10">
                                  <Input
                                    type="text"
                                    value={button.text || ''}
                                    onChange={(e) => {
                                      const buttons = safeGetArray(portfolio.hero_cta_buttons);
                                      buttons[index] = { ...button, text: e.target.value };
                                      handleFieldChange('hero_cta_buttons', buttons);
                                    }}
                                    placeholder="Button text"
                                    className={`text-sm ${selectedTheme.colors.background} ${selectedTheme.colors.text} border-transparent focus:ring-2 focus:ring-purple-400`}
                                  />
                                  <Input
                                    type="url"
                                    value={button.link || ''}
                                    onChange={(e) => {
                                      const buttons = safeGetArray(portfolio.hero_cta_buttons);
                                      buttons[index] = { ...button, link: e.target.value };
                                      handleFieldChange('hero_cta_buttons', buttons);
                                    }}
                                    placeholder="URL"
                                    className={`text-sm ${selectedTheme.colors.background} ${selectedTheme.colors.text} border-transparent focus:ring-2 focus:ring-purple-400`}
                                  />
                                  <select
                                    value={button.style || 'primary'}
                                    onChange={(e) => {
                                      const buttons = safeGetArray(portfolio.hero_cta_buttons);
                                      buttons[index] = { ...button, style: e.target.value };
                                      handleFieldChange('hero_cta_buttons', buttons);
                                    }}
                                    className={`text-sm ${selectedTheme.colors.background} ${selectedTheme.colors.text} border-transparent focus:ring-2 focus:ring-purple-400 rounded-md`}
                                  >
                                    <option value="primary">Primary</option>
                                    <option value="secondary">Secondary</option>
                                    <option value="outline">Outline</option>
                                  </select>
                                  <div className="flex gap-1">
                                    <Button
                                      onClick={() => {
                                        const buttons = safeGetArray(portfolio.hero_cta_buttons);
                                        if (index > 0) {
                                          [buttons[index], buttons[index - 1]] = [buttons[index - 1], buttons[index]];
                                          handleFieldChange('hero_cta_buttons', buttons);
                                        }
                                      }}
                                      variant="outline" size="sm" disabled={index === 0}
                                      className="bg-blue-600/20 border-blue-500/30 text-blue-300 hover:bg-blue-600/30"
                                    >
                                      ↑
                                    </Button>
                                    <Button
                                      onClick={() => {
                                        const buttons = safeGetArray(portfolio.hero_cta_buttons);
                                        if (index < buttons.length - 1) {
                                          [buttons[index], buttons[index + 1]] = [buttons[index + 1], buttons[index]];
                                          handleFieldChange('hero_cta_buttons', buttons);
                                        }
                                      }}
                                      variant="outline" size="sm" disabled={index === safeGetArray(portfolio.hero_cta_buttons).length - 1}
                                      className="bg-blue-600/20 border-blue-500/30 text-blue-300 hover:bg-blue-600/30"
                                    >
                                      ↓
                                    </Button>
                                    <Button
                                      onClick={() => {
                                        const buttons = safeGetArray(portfolio.hero_cta_buttons);
                                        buttons.splice(index, 1);
                                        handleFieldChange('hero_cta_buttons', buttons);
                                      }}
                                      variant="outline" size="sm"
                                      className="bg-red-600/20 border-red-500/30 text-red-300 hover:bg-red-600/30"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {key === 'about' && (
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                            {/* Left Column: Text Content */}
                            <div className="space-y-4">
                              <div>
                                <label className={`block text-sm font-medium ${selectedTheme.colors.text} mb-2`}>
                                  About Text
                                </label>
                                <Textarea
                                  value={portfolio.about_text || ''}
                                  onChange={(e) => handleFieldChange('about_text', e.target.value)}
                                  placeholder="Tell your story..."
                                  rows={8}
                                  className={`w-full text-sm ${selectedTheme.colors.background} ${selectedTheme.colors.text} border-transparent focus:ring-2 focus:ring-purple-400`}
                                />
                              </div>
                            </div>

                            {/* Right Column: Profile Photo */}
                            <div className="space-y-2">
                              <label className={`block text-sm font-medium ${selectedTheme.colors.text} mb-2`}>
                                Profile Photo
                              </label>
                              {portfolio.profile_photo_url ? (
                                  <div className="relative group">
                                      <img src={portfolio.profile_photo_url} alt="Profile" className="w-full h-48 object-cover rounded-lg border border-white/10" />
                                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                                          <button onClick={() => handleFieldChange('profile_photo_url', '')} className="p-2 bg-red-500/80 text-white rounded-full hover:bg-red-500">
                                              <Trash2 className="h-4 w-4" />
                                          </button>
                                      </div>
                                  </div>
                              ) : (
                                  <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center">
                                    <Image className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                                    <p className={`text-xs ${selectedTheme.colors.text} mb-2`}>No photo set</p>
                                  </div>
                              )}
                              <div className="flex gap-2">
                                <Input
                                  type="url"
                                  value={portfolio.profile_photo_url || ''}
                                  onChange={(e) => handleFieldChange('profile_photo_url', e.target.value)}
                                  placeholder="Paste photo URL"
                                  className={`flex-1 text-sm ${selectedTheme.colors.background} ${selectedTheme.colors.text} border-transparent focus:ring-2 focus:ring-purple-400`}
                                />
                                <input
                                  type="file" id="profile-upload" accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) uploadProfilePhoto(file);
                                    e.target.value = '';
                                  }}
                                  className="hidden"
                                />
                                <Button
                                  onClick={() => document.getElementById('profile-upload')?.click()}
                                  variant="outline" size="sm" disabled={uploadingProfile}
                                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                                >
                                  {uploadingProfile ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {key === 'tracks' && (
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <h3 className={`text-lg font-semibold ${selectedTheme.colors.heading}`}>Tracks</h3>
                            <div className="flex items-center gap-2">
                              {/* View Mode Toggle Buttons */}
                              <div className="flex items-center gap-1">
                                <Button
                                  size="sm"
                                  variant={trackViewMode === 'list' ? 'default' : 'outline'}
                                  onClick={() => setTrackViewMode('list')}
                                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                                >
                                  <List className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant={trackViewMode === 'grid' ? 'default' : 'outline'}
                                  onClick={() => setTrackViewMode('grid')}
                                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                                >
                                  <Grid className="h-4 w-4" />
                                </Button>
                              </div>
                              <Button
                                onClick={() => setShowAddTrackForm(true)}
                                variant="outline"
                                className="bg-green-600/20 border-green-500/30 text-green-300 hover:bg-green-600/30"
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Track
                              </Button>
                            </div>
                          </div>

                          {/* Audio Player Mode Preference */}
                          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                            <div className="flex items-center justify-between">
                              <div>
                                <label className={`block text-sm font-medium ${selectedTheme.colors.text} mb-1`}>
                                  Show Audio Player
                                </label>
                                <p className={`text-xs ${selectedTheme.colors.text} opacity-70`}>
                                  {((portfolio.sections_config?.tracks?.audio_player_mode || 'bottom') === 'bottom') 
                                    ? 'Audio player will appear at the bottom of the page when a track is played.'
                                    : 'Audio controls will appear inline with each track for direct playback.'
                                  }
                                </p>
                              </div>
                              <button
                                onClick={() => handleSectionConfigChange('tracks', 'audio_player_mode', 
                                  (portfolio.sections_config?.tracks?.audio_player_mode || 'bottom') === 'bottom' ? 'inline' : 'bottom'
                                )}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                  (portfolio.sections_config?.tracks?.audio_player_mode || 'bottom') === 'bottom'
                                    ? 'bg-blue-600'
                                    : 'bg-gray-600'
                                }`}
                              >
                                <span
                                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    (portfolio.sections_config?.tracks?.audio_player_mode || 'bottom') === 'bottom'
                                      ? 'translate-x-6'
                                      : 'translate-x-1'
                                  }`}
                                />
                              </button>
                            </div>
                          </div>
                          
                          <PortfolioTracksDisplay 
                            portfolioId={portfolio.id} 
                            viewMode={trackViewMode} 
                            onRefresh={refreshTracks}
                            onEdit={handleEditTrack}
                            refreshKey={tracksRefreshKey}
                            audioPlayerMode={portfolio.sections_config?.tracks?.audio_player_mode || 'bottom'}
                          />
                          
                          {showAddTrackForm && (
                            <PortfolioTrackForm
                              portfolioId={portfolio.id}
                              onCancel={() => setShowAddTrackForm(false)}
                              onSuccess={() => {
                                setShowAddTrackForm(false);
                                refreshTracks();
                              }}
                            />
                          )}

                          {showEditTrackForm && editingTrack && (
                            <PortfolioTrackForm
                              portfolioId={portfolio.id}
                              track={editingTrack}
                              onCancel={() => {
                                setShowEditTrackForm(false);
                                setEditingTrack(null);
                              }}
                              onSuccess={() => {
                                setShowEditTrackForm(false);
                                setEditingTrack(null);
                                refreshTracks();
                              }}
                            />
                          )}
                        </div>
                      )}

                      {key === 'key_projects' && (
                        <div className="space-y-6">
                          <PortfolioKeyProjectsEditor 
                            portfolioId={portfolio.id}
                            title={getSectionTitle(key, portfolio)}
                            projects={safeGetArray(portfolio.key_projects_json)}
                            theme={selectedTheme}
                            onRefresh={() => {
                              // Refresh the portfolio data
                              fetchPortfolio();
                            }}
                          />
                        </div>
                      )}

                      {key === 'testimonials' && (
                        <div className="space-y-6">
                          <PortfolioTestimonialsEditor 
                            portfolioId={portfolio.id}
                            title={getSectionTitle(key, portfolio)}
                            testimonials={safeGetArray(portfolio.testimonials_json)}
                            theme={selectedTheme}
                            onRefresh={() => {
                              // Refresh the portfolio data
                              fetchPortfolio();
                            }}
                          />
                        </div>
                      )}

                      {key === 'gallery' && (
                        <div className="space-y-6">
                          <div className="flex items-center justify-between">
                            <h3 className={`text-lg font-semibold ${selectedTheme.colors.heading}`}>Gallery</h3>
                            <div className="flex items-center gap-2">
                              {/* View Mode Toggle Buttons */}
                              <div className="flex items-center gap-1">
                                <Button
                                  size="sm"
                                  variant={galleryViewMode === 'list' ? 'default' : 'outline'}
                                  onClick={() => setGalleryViewMode('list')}
                                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                                >
                                  <List className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant={galleryViewMode === 'grid' ? 'default' : 'outline'}
                                  onClick={() => setGalleryViewMode('grid')}
                                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                                >
                                  <Grid className="h-4 w-4" />
                                </Button>
                              </div>
                              <Button
                                onClick={() => setShowAddGalleryForm(true)}
                                variant="outline"
                                className="bg-green-600/20 border-green-500/30 text-green-300 hover:bg-green-600/30"
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Item
                              </Button>
                            </div>
                          </div>
                          
                          <PortfolioGalleryDisplay 
                            portfolioId={portfolio.id} 
                            viewMode={galleryViewMode} 
                            filter={galleryFilter}
                            onRefresh={refreshGallery}
                            onEdit={handleEditGalleryItem}
                            refreshKey={galleryRefreshKey}
                          />
                          
                          {showAddGalleryForm && (
                            <PortfolioGalleryForm
                              portfolioId={portfolio.id}
                              onCancel={() => setShowAddGalleryForm(false)}
                              onSuccess={() => {
                                setShowAddGalleryForm(false);
                                refreshGallery();
                              }}
                            />
                          )}

                          {showEditGalleryForm && editingGalleryItem && (
                            <PortfolioGalleryForm
                              portfolioId={portfolio.id}
                              item={editingGalleryItem}
                              onCancel={() => {
                                setShowEditGalleryForm(false);
                                setEditingGalleryItem(null);
                              }}
                              onSuccess={() => {
                                setShowEditGalleryForm(false);
                                setEditingGalleryItem(null);
                                refreshGallery();
                              }}
                            />
                          )}
                        </div>
                      )}

                      {key === 'hobbies' && (
                        <div className="space-y-6">
                          <div>
                            <label className={`block text-sm font-medium ${selectedTheme.colors.text} mb-2`}>
                              Add Hobbies
                            </label>
                            <div className="flex gap-2 mb-4">
                              <Input
                                type="text"
                                value={hobbySearch}
                                onChange={(e) => setHobbySearch(e.target.value)}
                                placeholder="Search hobbies..."
                                className={`flex-1 text-sm ${selectedTheme.colors.background} ${selectedTheme.colors.text} border-transparent focus:ring-2 focus:ring-purple-400`}
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-40 overflow-y-auto">
                              {filteredHobbies.map((hobby) => (
                                <button
                                  key={hobby.name}
                                  onClick={() => handleAddHobby(hobby)}
                                  className="flex flex-col items-center p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                                >
                                  <span className="text-2xl mb-1">{hobby.icon}</span>
                                  <span className="text-xs text-center">{hobby.name}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <label className={`block text-sm font-medium ${selectedTheme.colors.text} mb-2`}>
                              Selected Hobbies
                            </label>
                            <div className="flex flex-wrap gap-2">
                              {safeGetArray(portfolio.hobbies_json).map((hobby: any, index: number) => (
                                <div key={`hobby-${index}-${hobby.name}`} className="flex items-center gap-2 p-2 bg-white/10 rounded-lg border border-white/20">
                                  <span className="text-lg">{hobby.icon}</span>
                                  <span className="text-sm">{hobby.name}</span>
                                  <button
                                    onClick={() => handleRemoveHobby(hobby.name)}
                                    className="text-red-400 hover:text-red-300"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {key === 'skills' && (
                        <div className="space-y-6">
                          <div>
                            <label className={`block text-sm font-medium ${selectedTheme.colors.text} mb-2`}>
                              Add Skills
                            </label>
                            <div className="flex gap-2 mb-4">
                              <Input
                                type="text"
                                value={skillSearch}
                                onChange={(e) => setSkillSearch(e.target.value)}
                                placeholder="Search skills..."
                                className={`flex-1 text-sm ${selectedTheme.colors.background} ${selectedTheme.colors.text} border-transparent focus:ring-2 focus:ring-purple-400`}
                              />
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-40 overflow-y-auto">
                              {filteredSkills.map((skill) => (
                                <button
                                  key={skill.name}
                                  onClick={() => handleAddSkill(skill)}
                                  className="flex items-center gap-2 p-3 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
                                >
                                  <skill.icon className="h-5 w-5" style={{ color: skill.color }} />
                                  <span className="text-sm">{skill.name}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <label className={`block text-sm font-medium ${selectedTheme.colors.text} mb-2`}>
                              Selected Skills
                            </label>
                            <div className="flex flex-wrap gap-2">
                              {safeGetArray(portfolio.skills_json).map((skill: any, index: number) => (
                                <div key={`skill-${index}-${skill.name}`} className="flex items-center gap-2 p-2 bg-white/10 rounded-lg border border-white/20">
                                  <span className="text-sm">{skill.name}</span>
                                  <button
                                    onClick={() => handleRemoveSkill(skill.name)}
                                    className="text-red-400 hover:text-red-300"
                                  >
                                    <X className="h-4 w-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {key === 'resume' && (
                        <div className="space-y-6">
                          <div>
                            <label className={`block text-sm font-medium ${selectedTheme.colors.text} mb-2`}>
                              Resume File
                            </label>
                            <div className="flex gap-2">
                              <Input
                                type="url"
                                value={portfolio.resume_url || ''}
                                onChange={(e) => handleFieldChange('resume_url', e.target.value)}
                                placeholder="Paste resume URL"
                                className={`flex-1 text-sm ${selectedTheme.colors.background} ${selectedTheme.colors.text} border-transparent focus:ring-2 focus:ring-purple-400`}
                              />
                              <input
                                type="file" id="resume-upload" accept=".pdf,.doc,.docx"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) uploadResume(file);
                                  e.target.value = '';
                                }}
                                className="hidden"
                              />
                              <Button
                                onClick={() => document.getElementById('resume-upload')?.click()}
                                variant="outline" size="sm" disabled={uploadingResume}
                                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                              >
                                {uploadingResume ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      {key === 'press' && (
                        <PressMentionsForm portfolioId={portfolio.id} theme={selectedTheme} />
                      )}

                      {key === 'sponsors' && (
                        <SponsorsForm portfolio={portfolio} onFieldChange={handleFieldChange} theme={selectedTheme} />
                      )}

                      {key === 'contact' && (
                        <div className="space-y-6">
                          <div>
                            <label className={`block text-sm font-medium ${selectedTheme.colors.text} mb-2`}>
                              Contact Description
                            </label>
                            <Textarea
                              value={portfolio.contact_description || ''}
                              onChange={(e) => handleFieldChange('contact_description', e.target.value)}
                              placeholder="Ready to work together? Let's talk!"
                              rows={3}
                              className={`w-full text-sm ${selectedTheme.colors.background} ${selectedTheme.colors.text} border-transparent focus:ring-2 focus:ring-purple-400`}
                            />
                          </div>
                          
                          <div>
                            <label className={`block text-sm font-medium ${selectedTheme.colors.text} mb-2`}>
                              Contact Email
                            </label>
                            <Input
                              type="email"
                              value={portfolio.contact_email || ''}
                              onChange={(e) => handleFieldChange('contact_email', e.target.value)}
                              placeholder="your.email@example.com"
                              className={`w-full text-sm ${selectedTheme.colors.background} ${selectedTheme.colors.text} border-transparent focus:ring-2 focus:ring-purple-400`}
                            />
                          </div>
                          
                          <div>
                            <label className={`block text-sm font-medium ${selectedTheme.colors.text} mb-2`}>
                              Contact Phone
                            </label>
                            <Input
                              type="tel"
                              value={portfolio.contact_phone || ''}
                              onChange={(e) => handleFieldChange('contact_phone', e.target.value)}
                              placeholder="e.g. +1 555-123-4567"
                              className={`w-full text-sm ${selectedTheme.colors.background} ${selectedTheme.colors.text} border-transparent focus:ring-2 focus:ring-purple-400`}
                            />
                          </div>
                          
                          <div>
                            <label className={`block text-sm font-medium ${selectedTheme.colors.text} mb-2`}>
                              Contact Location
                            </label>
                            <Input
                              type="text"
                              value={portfolio.contact_location || ''}
                              onChange={(e) => handleFieldChange('contact_location', e.target.value)}
                              placeholder="e.g. New York, NY"
                              className={`w-full text-sm ${selectedTheme.colors.background} ${selectedTheme.colors.text} border-transparent focus:ring-2 focus:ring-purple-400`}
                            />
                          </div>
                          
                          <div>
                            <label className={`block text-sm font-medium ${selectedTheme.colors.text} mb-2`}>
                              Website URL
                            </label>
                            <Input
                              type="url"
                              value={portfolio.website_url || ''}
                              onChange={(e) => handleFieldChange('website_url', e.target.value)}
                              placeholder="https://yourwebsite.com"
                              className={`w-full text-sm ${selectedTheme.colors.background} ${selectedTheme.colors.text} border-transparent focus:ring-2 focus:ring-purple-400`}
                            />
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className={`block text-sm font-medium ${selectedTheme.colors.text} mb-2`}>
                                LinkedIn URL
                              </label>
                              <Input
                                type="url"
                                value={portfolio.linkedin_url || ''}
                                onChange={(e) => handleFieldChange('linkedin_url', e.target.value)}
                                placeholder="https://linkedin.com/in/yourprofile"
                                className={`w-full text-sm ${selectedTheme.colors.background} ${selectedTheme.colors.text} border-transparent focus:ring-2 focus:ring-purple-400`}
                              />
                            </div>
                            <div>
                              <label className={`block text-sm font-medium ${selectedTheme.colors.text} mb-2`}>
                                Twitter URL
                              </label>
                              <Input
                                type="url"
                                value={portfolio.twitter_url || ''}
                                onChange={(e) => handleFieldChange('twitter_url', e.target.value)}
                                placeholder="https://twitter.com/yourhandle"
                                className={`w-full text-sm ${selectedTheme.colors.background} ${selectedTheme.colors.text} border-transparent focus:ring-2 focus:ring-purple-400`}
                              />
                            </div>
                            <div>
                              <label className={`block text-sm font-medium ${selectedTheme.colors.text} mb-2`}>
                                Instagram URL
                              </label>
                              <Input
                                type="url"
                                value={portfolio.instagram_url || ''}
                                onChange={(e) => handleFieldChange('instagram_url', e.target.value)}
                                placeholder="https://instagram.com/yourhandle"
                                className={`w-full text-sm ${selectedTheme.colors.background} ${selectedTheme.colors.text} border-transparent focus:ring-2 focus:ring-purple-400`}
                              />
                            </div>
                            <div>
                              <label className={`block text-sm font-medium ${selectedTheme.colors.text} mb-2`}>
                                GitHub URL
                              </label>
                              <Input
                                type="url"
                                value={portfolio.github_url || ''}
                                onChange={(e) => handleFieldChange('github_url', e.target.value)}
                                placeholder="https://github.com/yourusername"
                                className={`w-full text-sm ${selectedTheme.colors.background} ${selectedTheme.colors.text} border-transparent focus:ring-2 focus:ring-purple-400`}
                              />
                            </div>
                            <div>
                              <label className={`block text-sm font-medium ${selectedTheme.colors.text} mb-2`}>
                                YouTube URL
                              </label>
                              <Input
                                type="url"
                                value={portfolio.youtube_url || ''}
                                onChange={(e) => handleFieldChange('youtube_url', e.target.value)}
                                placeholder="https://youtube.com/@yourchannel"
                                className={`w-full text-sm ${selectedTheme.colors.background} ${selectedTheme.colors.text} border-transparent focus:ring-2 focus:ring-purple-400`}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        </main>
      </div>

      {/* Custom CSS for hiding scrollbar */}
      <style jsx global>{`
        .custom-scrollbar-hide::-webkit-scrollbar {
          width: 0 !important;
          background: transparent;
        }
        .custom-scrollbar-hide {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        
        /* Custom range input styling for audio player */
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
          cursor: pointer;
        }
        
        input[type="range"]::-webkit-slider-track {
          background: rgba(255, 255, 255, 0.2);
          height: 4px;
          border-radius: 2px;
        }
        
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          background: white;
          height: 12px;
          width: 12px;
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        input[type="range"]::-moz-range-track {
          background: rgba(255, 255, 255, 0.2);
          height: 4px;
          border-radius: 2px;
          border: none;
        }
        
        input[type="range"]::-moz-range-thumb {
          background: white;
          height: 12px;
          width: 12px;
          border-radius: 50%;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>

      {/* Bottom Audio Player */}
      <PortfolioBottomAudioPlayer
        isVisible={showBottomAudioPlayer}
        onClose={() => setShowBottomAudioPlayer(false)}
        theme={selectedTheme}
      />
    </div>
  );
};

export default PortfolioEditorPage;