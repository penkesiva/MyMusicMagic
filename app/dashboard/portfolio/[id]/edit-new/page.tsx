"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useDebouncedCallback } from "use-debounce";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  PlusCircle, Trash2, Edit, Upload, Image, X, RefreshCw, ExternalLink, ChevronDown, List, Grid, FileText, Sparkles, Star, Plus, Eye, Wand2
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

const PortfolioEditorPage = () => {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [savingStatus, setSavingStatus] = useState("saved");
  
  const [editingTrack, setEditingTrack] = useState<any | null>(null);
  const [showAddTrackForm, setShowAddTrackForm] = useState(false);
  
  const [editingGalleryItem, setEditingGalleryItem] = useState<any | null>(null);
  const [showAddGalleryForm, setShowAddGalleryForm] = useState(false);
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

  const supabase = useMemo(() => createClient(), []);
  const fileUploader = useMemo(() => new PortfolioFileUploader(), []);

  // Save changes to database
  const saveChanges = useDebouncedCallback(async (fields: Partial<Portfolio>) => {
    if (!portfolio) return;
    const { id } = portfolio;
    const { error } = await supabase
      .from('user_portfolios')
      .update(fields)
      .eq('id', id);
    setSavingStatus(error ? "error" : "saved");
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

  // Handle field changes
  const handleFieldChange = (field: keyof Portfolio, value: any) => {
    setSavingStatus("saving");
    setPortfolio(prev => ({ ...prev!, [field]: value }));
    saveChanges({ [field]: value });
  };

  // Handle section config changes
  const handleSectionConfigChange = (
    sectionKey: keyof typeof SECTIONS_CONFIG,
    configKey: "enabled" | "name" | "title",
    value: boolean | string
  ) => {
    if (!portfolio || !portfolio.sections_config) return;
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
    handleFieldChange("sections_config", newConfig);
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
        const updatedConfig = { ...portfolio.sections_config };
        newOrder.forEach((key: string, idx: number) => {
          if (updatedConfig[key]) updatedConfig[key].order = idx + 1;
        });
        setPortfolio({ ...portfolio, sections_config: updatedConfig });
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
    <div className="flex h-full min-h-screen font-sans bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Left Sidebar */}
      <aside className="flex flex-col gap-4 bg-black/40 p-2 md:p-3 rounded-xl w-full max-w-xs min-w-[220px] text-sm overflow-y-auto max-h-screen" style={{ fontSize: 13 }}>
        <button
          onClick={() => router.push('/dashboard')}
          className="w-full mb-4 px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-all duration-300 text-sm font-medium"
        >
          ← Back to Dashboard
        </button>

        <div>
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-white">Portfolio Editor</h2>
          </div>
          <p className="text-xs text-gray-300">
            Customize your hero-portfolio.
          </p>
        </div>

        {/* AI Assistant Component */}
        <PortfolioAIAssistant
          portfolio={portfolio}
          onPortfolioUpdate={setPortfolio}
          isGenerating={isGenerating}
          setIsGenerating={setIsGenerating}
          theme={selectedTheme}
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
        />

        {/* Saving Status */}
        <div className="text-xs text-gray-400 text-center">
          {savingStatus === 'saving' && <span>Saving...</span>}
          {savingStatus === 'saved' && <span className="text-green-400">Saved</span>}
          {savingStatus === 'error' && <span className="text-red-400">Error saving</span>}
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 overflow-y-auto">
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
                  className={`w-full flex items-center justify-between p-4 bg-gradient-to-r from-purple-600/10 to-pink-500/10 hover:from-purple-600/20 hover:to-pink-500/20 transition-colors ${!isEnabled ? 'cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <h2 className={`text-xl font-bold ${selectedTheme.colors.heading}`}>
                      {sectionConfig.defaultName}
                    </h2>
                    {!isEnabled && (
                      <span className="text-xs bg-red-500/20 text-red-300 px-2 py-1 rounded-full">
                        Disabled
                      </span>
                    )}
                  </div>
                  <ChevronDown className={`w-6 h-6 transform transition-transform text-white ${openSections[key] ? 'rotate-180' : ''}`} />
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
                  </div>
                )}
              </section>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default PortfolioEditorPage; 