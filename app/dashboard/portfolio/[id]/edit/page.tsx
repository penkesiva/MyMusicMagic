"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useDebouncedCallback } from "use-debounce";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Eye, PlusCircle, Trash2, Edit, Upload, Image, X, RefreshCw, ExternalLink, ChevronDown, List, Grid, FileText, Sparkles, Star, Plus
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

const EditableField = ({ value, onSave, fieldType = 'input', theme }: { value: string; onSave: (newValue: string) => void; fieldType?: 'input' | 'textarea', theme: any }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);

  const handleSave = () => {
    onSave(currentValue);
    setIsEditing(false);
  };

  if (isEditing) {
    const inputClasses = `w-full ${theme.colors.card} ${theme.colors.text} border border-transparent focus:ring-2 focus:ring-blue-400`;
    return (
      <div className="flex items-center gap-2">
        {fieldType === 'input' ? (
          <Input
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            autoFocus
            className={inputClasses}
          />
        ) : (
          <Textarea
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            onBlur={handleSave}
            autoFocus
            className={inputClasses}
            rows={5}
          />
        )}
      </div>
    );
  }

  return (
    <div onClick={() => setIsEditing(true)} className={`cursor-pointer hover:bg-white/5 p-2 rounded-md transition-colors w-full min-h-[40px]`}>
      {value || <span className="text-gray-400">Click to edit</span>}
    </div>
  );
};


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
  const [showPreview, setShowPreview] = useState(false);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const [previewMode, setPreviewMode] = useState<'fullscreen' | 'side-by-side'>('side-by-side');
  const [colorThemeOpen, setColorThemeOpen] = useState(true);
  const [sectionsOpen, setSectionsOpen] = useState(true);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [galleryViewMode, setGalleryViewMode] = useState<'list' | 'grid'>('list');
  const [galleryFilter, setGalleryFilter] = useState<'all' | 'photo' | 'video'>('all');
  const [trackViewMode, setTrackViewMode] = useState<'list' | 'grid'>('list');
  const [uploadingResume, setUploadingResume] = useState(false);
  const [hobbySearch, setHobbySearch] = useState("");
  const [skillSearch, setSkillSearch] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [placeholder, setPlaceholder] = useState("");

  const placeholders = [
    "Build a portfolio for an upcoming cello artist...",
    "A full-stack developer specializing in React and Node.js...",
    "Create a page for a freelance photographer...",
    "A UI/UX designer with a passion for mobile apps...",
  ];

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setPlaceholder(placeholders[i]);
      i = (i + 1) % placeholders.length;
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const supabase = useMemo(() => createClient(), []);

  const handleGenerate = async () => {
    if (!aiPrompt || !portfolio) return;
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate-portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt, currentPortfolio: portfolio }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate content from AI.');
      }

      const data = await response.json();
      
      // Merge AI data with existing portfolio, keeping IDs and other essential fields
      const updatedPortfolio = { ...portfolio, ...data };
      setPortfolio(updatedPortfolio);
      
      // Save the AI-generated changes
      saveChanges(data);

    } catch (error) {
      console.error("AI Generation Error:", error);
      alert("There was an error generating the portfolio content. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    if (window.confirm("Are you sure you want to reset the entire portfolio? All your current content will be cleared.")) {
      fetchPortfolio(); // Re-fetches the original data from the database
      alert("Portfolio has been reset to its last saved state.");
    }
  };

  const sortedEditorSections = useMemo(() => {
    if (!portfolio) return [];
    return Object.keys(SECTIONS_CONFIG)
      .sort((a, b) => (portfolio?.sections_config as any)?.[a]?.order - (portfolio?.sections_config as any)?.[b]?.order);
  }, [portfolio]);

  useEffect(() => {
    // Initialize sections to open only when a portfolio is first loaded
    if (portfolio && sortedEditorSections.length > 0 && Object.keys(openSections).length === 0) {
      const allOpen: Record<string, boolean> = {};
      sortedEditorSections.forEach(key => { allOpen[key] = true; });
      setOpenSections(allOpen);
    }
  }, [portfolio, sortedEditorSections, openSections]);

  const toggleSection = (key: string) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const expandAll = () => {
    const allOpen: Record<string, boolean> = {};
    sortedEditorSections.forEach(key => { allOpen[key] = true; });
    setOpenSections(allOpen);
  };

  const collapseAll = () => {
    const allClosed: Record<string, boolean> = {};
    sortedEditorSections.forEach(key => { allClosed[key] = false; });
    setOpenSections(allClosed);
  };

  const safeGetArray = (field: any) => {
    if (Array.isArray(field)) {
      return field;
    }
    if (typeof field === 'string') {
      try {
        const parsed = JSON.parse(field);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
        return [];
      }
    }
    return [];
  };

  const selectedTheme = useMemo(() => THEMES.find(t => t.name === portfolio?.theme_name) || THEMES[0], [portfolio?.theme_name]);

  const fetchPortfolio = async () => {
    if (!id) return;
    setLoading(true);
    
    // First get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      router.push("/auth/signin");
      return;
    }

    // Get user profile
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (profileData) {
      setUserProfile(profileData);
    }

    const { data, error } = await supabase
      .from("user_portfolios")
      .select("*, tracks(*), gallery(*)")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching portfolio:", error);
      router.push("/dashboard");
    } else if (data) {
      const portfolioData = data as any;
      console.log('📥 Fetched portfolio data:', {
        name: portfolioData.name,
        hobbies_title: portfolioData.hobbies_title,
        hobbies_json: portfolioData.hobbies_json,
        sections_config: portfolioData.sections_config
      });
      
      if (!portfolioData.sections_config || typeof portfolioData.sections_config !== 'object') {
          portfolioData.sections_config = {};
      }

      for (const key in SECTIONS_CONFIG) {
          if (!(portfolioData.sections_config as any)[key]) {
              (portfolioData.sections_config as any)[key] = {
                  enabled: SECTIONS_CONFIG[key].defaultEnabled,
                  name: SECTIONS_CONFIG[key].defaultName,
                  order: SECTIONS_CONFIG[key].defaultOrder,
              };
          }
      }
      
      console.log('🔧 Initialized sections_config:', portfolioData.sections_config);
      console.log('🎯 Hobbies section enabled:', (portfolioData.sections_config as any)?.hobbies?.enabled);
      
      setPortfolio(portfolioData);
    }
    setLoading(false);
  };


  useEffect(() => {
    fetchPortfolio();
  }, [id, router, supabase]);

  const saveChanges = useDebouncedCallback(async (updatedPortfolio: Partial<Portfolio>) => {
    if (!portfolio) return;

    // Debug user context
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.error('❌ User auth error:', userError);
      return;
    }
    
    console.log('👤 Current user:', user?.id);
    console.log('📄 Portfolio user_id:', portfolio.user_id);
    console.log('🔐 User matches portfolio owner:', user?.id === portfolio.user_id);

    const validPortfolioKeys: (keyof Portfolio)[] = [
      'name', 'slug', 'template_id', 'is_published', 'is_default', 'hero_image_url',
      'hero_title', 'hero_subtitle', 'hero_cta_text', 'hero_cta_link',
      'about_title', 'about_text', 'profile_photo_url', 'instagram_url', 'twitter_url',
      'youtube_url', 'linkedin_url', 'website_url', 'github_url',
      'hobbies_title', 'hobbies_json', 'skills_title', 'skills_json',
      'press_title', 'press_json', 'key_projects_title', 'key_projects_json',
      'contact_title', 'contact_description', 'contact_email', 'footer_text',
      'footer_about_summary', 'footer_links_json', 'footer_social_links_json', 'footer_copyright_text',
      'footer_show_social_links', 'footer_show_about_summary', 'footer_show_links',
      'sections_config', 'theme_name', 'resume_url', 'resume_title', 'artist_name', 'bio',
      'seo_title', 'seo_description'
    ];

    const portfolioToSave: Partial<Portfolio> = {};
    for (const key of Object.keys(updatedPortfolio) as (keyof Portfolio)[]) {
      if (validPortfolioKeys.includes(key)) {
        let value = updatedPortfolio[key];
        
        // Handle JSON fields - if the database expects text, stringify them
        if (key === 'hobbies_json' || key === 'skills_json' || key === 'sections_config' || 
            key === 'press_json' || key === 'key_projects_json' || key === 'footer_links_json' || 
            key === 'footer_social_links_json') {
          if (value && typeof value === 'object') {
            value = JSON.stringify(value);
            console.log(`🔄 Stringified ${key}:`, value);
          }
        }
        
        (portfolioToSave as any)[key] = value;
      } else {
        console.warn('⚠️ Field not in validPortfolioKeys:', key, updatedPortfolio[key]);
      }
    }

    if (Object.keys(portfolioToSave).length === 0) {
      setSavingStatus("saved");
      return;
    }
    
    // Debug logging
    console.log('💾 Saving portfolio data:', JSON.stringify(portfolioToSave, null, 2));
    console.log('🔍 Fields being sent:', Object.keys(portfolioToSave));
    console.log('🎯 Portfolio ID:', portfolio.id);
    
    const { error } = await supabase
      .from("user_portfolios")
      .update(portfolioToSave)
      .eq("id", portfolio.id);

    if (error) {
      console.error("Error saving portfolio:", error);
      console.error("Error details:", {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      console.error("Full error object:", JSON.stringify(error, null, 2));
      setSavingStatus("error");
    } else {
      console.log('✅ Portfolio saved successfully');
      setSavingStatus("saved");
      // Optimistically update local state, no need to re-fetch immediately
      setPortfolio(prev => ({...prev, ...updatedPortfolio}) as Portfolio);
    }
  }, 1500);

  const handleFieldChange = (field: keyof Portfolio, value: any) => {
    // Set saving status immediately when changes start
    setSavingStatus("saving");
    
    // Update local state immediately for responsive UI
    setPortfolio(prev => ({ ...prev!, [field]: value }));
    
    // Debounce the actual save to database
    saveChanges({ [field]: value });
  };

  const uploadHeroImage = async (file: File) => {
    if (!portfolio) return;
    
    setUploadingHero(true);
    try {
      console.log('Starting hero image upload...', { file: file.name, size: file.size });
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${portfolio.id}/hero-${Date.now()}.${fileExt}`;
      
      console.log('Uploading to path:', fileName);
      
      // Try site-bg-images first, fallback to gallery-images
      let bucketName = 'site-bg-images';
      let uploadError = null;
      
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) {
        console.log('site-bg-images failed, trying gallery-images...', error);
        uploadError = error;
        
        // Fallback to gallery-images bucket
        bucketName = 'gallery-images';
        const fallbackResult = await supabase.storage
          .from(bucketName)
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });
        
        if (fallbackResult.error) {
          console.error('Both buckets failed:', fallbackResult.error);
          throw fallbackResult.error;
        }
        
        console.log('Upload successful to gallery-images, getting public URL...');
        const { data: { publicUrl } } = supabase.storage
          .from(bucketName)
          .getPublicUrl(fileName);
        
        console.log('Public URL generated:', publicUrl);
        handleFieldChange('hero_image_url', publicUrl);
        return;
      }
      
      console.log('Upload successful to site-bg-images, getting public URL...');
      
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);
      
      console.log('Public URL generated:', publicUrl);
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
      console.log('Starting profile photo upload...', { file: file.name, size: file.size });
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${portfolio.id}/profile-${Date.now()}.${fileExt}`;
      
      console.log('Uploading to path:', fileName);
      
      // Try site-bg-images first, fallback to gallery-images
      let bucketName = 'site-bg-images';
      let uploadError = null;
      
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) {
        console.log('site-bg-images failed, trying gallery-images...', error);
        uploadError = error;
        
        // Fallback to gallery-images bucket
        bucketName = 'gallery-images';
        const fallbackResult = await supabase.storage
          .from(bucketName)
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });
        
        if (fallbackResult.error) {
          console.error('Both buckets failed:', fallbackResult.error);
          throw fallbackResult.error;
        }
        
        console.log('Upload successful to gallery-images, getting public URL...');
        const { data: { publicUrl } } = supabase.storage
          .from(bucketName)
          .getPublicUrl(fileName);
        
        console.log('Public URL generated:', publicUrl);
        handleFieldChange('profile_photo_url', publicUrl);
        return;
      }
      
      console.log('Upload successful to site-bg-images, getting public URL...');
      
      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);
      
      console.log('Public URL generated:', publicUrl);
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
      const fileExt = file.name.split('.').pop();
      const fileName = `${portfolio.id}/resume-${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('resumes')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true 
        });

      if (error) throw error;
      
      const { data: { publicUrl } } = supabase.storage
        .from('resumes')
        .getPublicUrl(fileName);
      
      handleFieldChange('resume_url', publicUrl);
    } catch (error: any) {
      console.error('Error uploading resume:', error);
      alert(`Failed to upload resume: ${error.message || 'Unknown error'}`);
    } finally {
      setUploadingResume(false);
    }
  };
  
  const handleSectionConfigChange = (
    sectionKey: keyof typeof SECTIONS_CONFIG,
    configKey: "enabled" | "name",
    value: boolean | string
  ) => {
    if (!portfolio || !portfolio.sections_config) return;
    const newConfig = { ...(portfolio.sections_config as Record<string, any>) };
    (newConfig[sectionKey] as any)[configKey] = value;
    handleFieldChange("sections_config", newConfig);
  };

  const handleAddHobby = (hobby: { name: string; icon: string }) => {
    console.log('➕ Adding hobby:', JSON.stringify(hobby, null, 2));
    const currentHobbies = safeGetArray(portfolio?.hobbies_json);
    console.log('Current hobbies:', JSON.stringify(currentHobbies, null, 2));
    if (!currentHobbies.some(h => h.name === hobby.name)) {
        const newHobbies = [...currentHobbies, hobby];
        console.log('New hobbies array:', JSON.stringify(newHobbies, null, 2));
        handleFieldChange('hobbies_json', newHobbies);
    }
    setHobbySearch("");
  };

  const handleRemoveHobby = (hobbyName: string) => {
    console.log('➖ Removing hobby:', hobbyName);
    const currentHobbies = safeGetArray(portfolio?.hobbies_json);
    const filteredHobbies = currentHobbies.filter(h => h.name !== hobbyName);
    console.log('Filtered hobbies:', JSON.stringify(filteredHobbies, null, 2));
    handleFieldChange('hobbies_json', filteredHobbies);
  };

  const filteredHobbies = HOBBIES_LIST.filter(hobby => 
    hobby.name.toLowerCase().includes(hobbySearch.toLowerCase()) &&
    !safeGetArray(portfolio?.hobbies_json).some(h => h.name === hobby.name)
  );

  const isHobbyAlreadyAdded = safeGetArray(portfolio?.hobbies_json).some(h => h.name.toLowerCase() === hobbySearch.toLowerCase());

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

  const filteredSkills = SKILLS_LIST.filter(skill => 
    skill.name.toLowerCase().includes(skillSearch.toLowerCase()) &&
    !safeGetArray(portfolio?.skills_json).some(s => s.name === skill.name)
  );
  
  const isSkillAlreadyAdded = safeGetArray(portfolio?.skills_json).some(s => s.name.toLowerCase() === skillSearch.toLowerCase());

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

  return (
    <div className="flex h-full min-h-screen font-sans bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* --- Left Sidebar (Hero Portfolio Theme) --- */}
      <aside className="w-[280px] bg-white/5 backdrop-blur-sm border-r border-white/10 text-white p-6 flex flex-col gap-6 overflow-y-auto">
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

        <div className="space-y-3 p-4 rounded-lg bg-white/5 border border-white/10">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-400" />
            <h3 className="font-semibold text-sm text-white">AI Assistant</h3>
          </div>
          <Textarea
            placeholder={placeholder}
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            rows={3}
            className="w-full text-sm bg-gray-900/50 border-white/20 placeholder:text-gray-500 focus:ring-purple-400"
          />
          <div className="flex items-center gap-2">
            <Button 
                onClick={handleGenerate} 
                disabled={isGenerating || !aiPrompt}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 disabled:opacity-50"
            >
              {isGenerating ? 'Generating...' : 'Generate'}
            </Button>
            <Button 
                onClick={handleReset}
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            >
              Reset
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <button onClick={() => setColorThemeOpen(!colorThemeOpen)} className="w-full flex justify-between items-center font-semibold text-sm text-white">
            Color Theme
            <ChevronDown className={`w-4 h-4 transition-transform ${colorThemeOpen ? 'rotate-180' : ''}`} />
          </button>
          {colorThemeOpen && (
            <div className="grid grid-cols-5 gap-2 pt-2">
              {THEMES.map((theme) => (
                <button
                  key={theme.name}
                  onClick={() => handleFieldChange("theme_name", theme.name)}
                  className={`w-full aspect-square rounded-full border-2 transition-all ${
                    portfolio.theme_name === theme.name ? 'border-purple-400 ring-2 ring-purple-400' : 'border-white/20 hover:border-white/40'
                  } ${theme.colors.background}`}
                  title={theme.name}
                ><div className={`h-1/2 w-1/2 rounded-full ${theme.colors.primary}`}></div></button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <button onClick={() => setSectionsOpen(!sectionsOpen)} className="w-full flex justify-between items-center font-semibold text-sm text-white">
            Sections
            <ChevronDown className={`w-4 h-4 transition-transform ${sectionsOpen ? 'rotate-180' : ''}`} />
          </button>
          {sectionsOpen && (
            <div className="space-y-2 pt-2">
              {sortedEditorSections.map((key) => (
                <div key={key} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors">
                  <Label htmlFor={`enable-${key}`} className="font-medium text-white text-sm cursor-pointer">
                    {SECTIONS_CONFIG[key].defaultName}
                  </Label>
                  <Switch
                    id={`enable-${key}`}
                    isChecked={(portfolio.sections_config as any)?.[key]?.enabled ?? false}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleSectionConfigChange(key as any, "enabled", e.target.checked)
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Back to Dashboard - MOVED */}
        <div className="mt-auto"></div>
      </aside>

      {/* --- Right Column (Editor & Preview) --- */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar (Hero Portfolio Theme) */}
        <div className="bg-white/5 backdrop-blur-sm border-b border-white/10 p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-white">Editing: {portfolio.name}</h1>
              <span className={`text-xs font-medium px-3 py-1 rounded-full transition-colors ${
                savingStatus === "saved" ? "bg-green-500/20 text-green-400 border border-green-500/30" :
                savingStatus === "saving" ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 animate-pulse" :
                "bg-red-500/20 text-red-400 border border-red-500/30"
              }`}>
                {savingStatus === 'saving' ? 'Saving...' : savingStatus === 'error' ? 'Error' : 'Saved'}
              </span>
              {!portfolio.is_published && (
                <span className="text-xs font-medium px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                  ⚠️ Unpublished - Preview may not work
                </span>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <Switch
                id="publish-switch"
                isChecked={portfolio.is_published}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFieldChange('is_published', e.target.checked)}
              />
              <Label htmlFor="publish-switch" className="text-white font-medium">
                {portfolio.is_published ? 'Published' : 'Unpublished'}
              </Label>
              <button 
                onClick={() => setShowPreview(!showPreview)} 
                className={`px-4 py-2 rounded-lg transition-all duration-300 text-sm font-medium ${
                  showPreview 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-purple-500/25' 
                    : 'bg-white/10 border border-white/20 text-white hover:bg-white/20'
                }`}
              >
                <Eye className="mr-2 h-4 w-4 inline" /> {showPreview ? 'Hide Preview' : 'Live Preview'}
              </button>
              {showPreview && (
                <button 
                  onClick={() => setPreviewMode(previewMode === 'fullscreen' ? 'side-by-side' : 'fullscreen')} 
                  className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-all duration-300 text-sm font-medium"
                >
                  {previewMode === 'fullscreen' ? 'Side-by-Side' : 'Fullscreen'}
                </button>
              )}
              <div title={!portfolio.is_published ? "You must publish your portfolio to make it public." : "Open public page"}>
                <button
                  onClick={() => portfolio.is_published && window.open(`/portfolio/${userProfile?.username || 'user'}/${portfolio.slug}`, "_blank")} 
                  disabled={!portfolio.is_published}
                  className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-all duration-300 text-sm font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Open in New Tab
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* --- Right Main Area (User's Theme) --- */}
        <main className={`flex-1 overflow-y-auto ${selectedTheme.colors.background} ${selectedTheme.colors.text}`}>
          {/* Content Area (User's Theme) */}
          <div className="p-6">
            <div className="max-w-5xl mx-auto space-y-6">
              <div className="flex justify-end items-center gap-2">
                  <span className="text-sm text-gray-400">Manage Sections</span>
                  <Button onClick={expandAll} variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">Expand All</Button>
                  <Button onClick={collapseAll} variant="outline" size="sm" className="bg-white/10 border-white/20 text-white hover:bg-white/20">Collapse All</Button>
              </div>

              {sortedEditorSections.filter(key => (portfolio.sections_config as any)?.[key]?.enabled).map(key => {
                const sectionConfig = SECTIONS_CONFIG[key];
                if (!sectionConfig) return null;
                
                return (
                  <section key={key} id={key} className="bg-white/5 rounded-xl border border-white/10 overflow-hidden transition-all duration-300">
                    <button 
                      onClick={() => toggleSection(key)} 
                      className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-purple-600/10 to-pink-500/10 hover:from-purple-600/20 hover:to-pink-500/20 transition-colors"
                    >
                      <h2 className={`text-xl font-bold ${selectedTheme.colors.heading}`}>
                        {SECTIONS_CONFIG[key]?.defaultName}
                      </h2>
                      <ChevronDown className={`w-6 h-6 transform transition-transform text-white ${openSections[key] ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {openSections[key] && (
                      <div className="p-6">
                        {key === 'hero' && (
                          <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                              {/* Left Column: Title & Subtitle */}
                              <div className="space-y-4">
                                <div>
                                  <label className={`block text-sm font-medium ${selectedTheme.colors.text} mb-2`}>
                                    Portfolio Title
                                  </label>
                                  <Input
                                    type="text"
                                    value={portfolio.name}
                                    onChange={(e) => handleFieldChange('name', e.target.value)}
                                    placeholder="Your portfolio title"
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
                          </div>
                        )}
                        
                        {key === 'about' && (
                           <div className="space-y-6">
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                               {/* Left Column: About Text */}
                               <div className="space-y-4">
                                 <div>
                                   <label className={`block text-sm font-medium ${selectedTheme.colors.text} mb-2`}>About Text</label>
                                   <Textarea
                                     value={portfolio.about_text || ''}
                                     onChange={(e) => handleFieldChange('about_text', e.target.value)}
                                     placeholder="Tell your story..."
                                     rows={8}
                                     className={`w-full text-sm ${selectedTheme.colors.background} ${selectedTheme.colors.text} border-transparent focus:ring-2 focus:ring-purple-400 resize-none`}
                                   />
                                 </div>
                               </div>
                               
                               {/* Right Column: Profile Photo */}
                               <div className="space-y-2">
                                 <label className={`block text-sm font-medium ${selectedTheme.colors.text} mb-2`}>Profile Photo</label>
                                 {portfolio.profile_photo_url ? (
                                   <div className="relative group">
                                     <img src={portfolio.profile_photo_url} alt="Profile" className="w-40 h-40 object-cover rounded-lg border border-white/10" />
                                     <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                                       <button onClick={() => handleFieldChange('profile_photo_url', '')} className="p-2 bg-red-500/80 text-white rounded-full hover:bg-red-500">
                                         <Trash2 className="h-4 w-4" />
                                       </button>
                                     </div>
                                   </div>
                                 ) : (
                                   <div className="w-40 h-40 border-2 border-dashed border-white/20 rounded-lg flex flex-col items-center justify-center text-center">
                                     <Image className="h-8 w-8 text-gray-400 mb-2" />
                                     <p className={`text-xs ${selectedTheme.colors.text}`}>No photo</p>
                                   </div>
                                 )}
                                 <div className="flex gap-2 max-w-sm">
                                   <Input
                                     type="url"
                                     value={portfolio.profile_photo_url || ''}
                                     onChange={(e) => handleFieldChange('profile_photo_url', e.target.value)}
                                     placeholder="Paste image URL"
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
                          (showAddTrackForm || !!editingTrack) ? (
                            <PortfolioTrackForm
                              portfolioId={portfolio.id}
                              track={editingTrack}
                              onCancel={() => {
                                setEditingTrack(null);
                                setShowAddTrackForm(false);
                              }}
                              onSuccess={fetchPortfolio}
                            />
                          ) : (
                            <div className="space-y-4">
                               <div className="flex justify-end items-center mb-4 gap-2">
                                  <Button onClick={() => setTrackViewMode('list')} variant="ghost" size="icon" className={trackViewMode === 'list' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}><List className="h-5 w-5" /></Button>
                                  <Button onClick={() => setTrackViewMode('grid')} variant="ghost" size="icon" className={trackViewMode === 'grid' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}><Grid className="h-5 w-5" /></Button>
                                  <Button onClick={() => setShowAddTrackForm(true)} className="bg-white/10 border-white/20 text-white hover:bg-white/20"><PlusCircle className="mr-2 h-4 w-4" /> Add Item</Button>
                                </div>
                              <PortfolioTracksDisplay
                                portfolioId={portfolio.id}
                                onEdit={(track) => setEditingTrack(track)}
                                onRefresh={fetchPortfolio}
                                viewMode={trackViewMode}
                              />
                            </div>
                          )
                        )}
                        
                        {key === 'gallery' && (
                          (showAddGalleryForm || !!editingGalleryItem) ? (
                            <PortfolioGalleryForm
                              portfolioId={portfolio.id}
                              item={editingGalleryItem}
                              onCancel={() => {
                                setEditingGalleryItem(null);
                                setShowAddGalleryForm(false);
                              }}
                              onSuccess={fetchPortfolio}
                            />
                          ) : (
                            <div className="space-y-4">
                              <div className="flex justify-between items-center mb-4">
                                <div className="flex-1 flex justify-center">
                                  <div className="inline-flex items-center bg-white/10 p-1 rounded-lg">
                                    <Button onClick={() => setGalleryFilter('all')} size="sm" variant="ghost" className={galleryFilter === 'all' ? 'bg-purple-500 text-white hover:bg-purple-600' : 'text-gray-300 hover:bg-white/20 hover:text-white'}>All</Button>
                                    <Button onClick={() => setGalleryFilter('photo')} size="sm" variant="ghost" className={galleryFilter === 'photo' ? 'bg-purple-500 text-white hover:bg-purple-600' : 'text-gray-300 hover:bg-white/20 hover:text-white'}>Photos</Button>
                                    <Button onClick={() => setGalleryFilter('video')} size="sm" variant="ghost" className={galleryFilter === 'video' ? 'bg-purple-500 text-white hover:bg-purple-600' : 'text-gray-300 hover:bg-white/20 hover:text-white'}>Videos</Button>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button onClick={() => setGalleryViewMode('list')} variant="ghost" size="icon" className={galleryViewMode === 'list' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}><List className="h-5 w-5" /></Button>
                                  <Button onClick={() => setGalleryViewMode('grid')} variant="ghost" size="icon" className={galleryViewMode === 'grid' ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white'}><Grid className="h-5 w-5" /></Button>
                                  <Button onClick={() => setShowAddGalleryForm(true)} className="bg-white/10 border-white/20 text-white hover:bg-white/20"><PlusCircle className="mr-2 h-4 w-4" /> Add Item</Button>
                                </div>
                              </div>
                              <PortfolioGalleryDisplay
                                portfolioId={portfolio.id}
                                onEdit={(item) => setEditingGalleryItem(item)}
                                onRefresh={fetchPortfolio}
                                viewMode={galleryViewMode}
                                filter={galleryFilter}
                              />
                            </div>
                          )
                        )}

                        {key === 'key_projects' && (
                          <div className="text-center p-8 border-2 border-dashed border-white/20 rounded-lg">
                            <h3 className="text-lg font-semibold text-white/80">Key Projects Section</h3>
                            <p className="text-sm text-white/50 mt-2">Customization options for this section are coming soon!</p>
                          </div>
                        )}

                        {key === 'press' && (
                          <div className="text-center p-8 border-2 border-dashed border-white/20 rounded-lg">
                            <h3 className="text-lg font-semibold text-white/80">Press Section</h3>
                            <p className="text-sm text-white/50 mt-2">Customization options for this section are coming soon!</p>
                          </div>
                        )}

                        {key === 'hobbies' && (
                          <div className="space-y-4">
                            <div>
                               <label className={`block text-sm font-medium ${selectedTheme.colors.text} mb-2`}>Add a Hobby</label>
                               <div className="relative max-w-sm">
                                 <Input
                                    type="text"
                                    placeholder="Search for hobbies..."
                                    value={hobbySearch}
                                    onChange={(e) => setHobbySearch(e.target.value)}
                                    className={`w-full text-sm ${selectedTheme.colors.background} ${selectedTheme.colors.text} border-transparent focus:ring-2 focus:ring-purple-400`}
                                  />
                                  {hobbySearch && (
                                    <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-white/20 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                        {filteredHobbies.map(hobby => (
                                            <button
                                              key={hobby.name}
                                              onClick={() => handleAddHobby(hobby)}
                                              className="w-full text-left px-4 py-2 text-white hover:bg-purple-500/20 flex items-center gap-3"
                                            >
                                              <span className="text-xl">{hobby.icon}</span>
                                              <span>{hobby.name}</span>
                                            </button>
                                        ))}
                                        {filteredHobbies.length === 0 && !isHobbyAlreadyAdded && (
                                           <button
                                              onClick={() => handleAddHobby({ name: hobbySearch, icon: '⭐' })}
                                              className="w-full text-left px-4 py-2 text-white hover:bg-purple-500/20 flex items-center gap-3"
                                            >
                                              <span className="text-xl">⭐</span>
                                              <span>Add "{hobbySearch}"</span>
                                            </button>
                                        )}
                                    </div>
                                  )}
                              </div>
                            </div>
                            <div>
                               <label className={`block text-sm font-medium ${selectedTheme.colors.text} mb-2`}>Your Hobbies</label>
                               <div className="flex flex-wrap gap-2 p-3 bg-white/5 rounded-lg border border-white/10 min-h-[40px]">
                                {safeGetArray(portfolio.hobbies_json).map((hobby: any) => (
                                  <div key={hobby.name} className="flex items-center gap-2 bg-purple-500/20 text-white px-3 py-1 rounded-full text-sm">
                                    <span>{hobby.icon}</span>
                                    <span>{hobby.name}</span>
                                    <button onClick={() => handleRemoveHobby(hobby.name)} className="text-purple-300 hover:text-white">
                                      <X className="h-3 w-3" />
                                    </button>
                                  </div>
                                ))}
                                {safeGetArray(portfolio.hobbies_json).length === 0 && (
                                   <p className="text-sm text-gray-400">Add hobbies from the list above.</p>
                                )}
                               </div>
                            </div>
                          </div>
                        )}

                        {key === 'skills' && (
                          <div className="space-y-4">
                            <div>
                               <label className={`block text-sm font-medium ${selectedTheme.colors.text} mb-2`}>Add a Skill or Tool</label>
                               <div className="relative max-w-sm">
                                 <Input
                                    type="text"
                                    placeholder="Search for skills..."
                                    value={skillSearch}
                                    onChange={(e) => setSkillSearch(e.target.value)}
                                    className={`w-full text-sm ${selectedTheme.colors.background} ${selectedTheme.colors.text} border-transparent focus:ring-2 focus:ring-purple-400`}
                                  />
                                  {skillSearch && (
                                    <div className="absolute z-50 w-full mt-1 bg-gray-800 border border-white/20 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                        {filteredSkills.map(skill => {
                                          const IconComponent = skill.icon;
                                          return (
                                            <button
                                              key={skill.name}
                                              onClick={() => handleAddSkill(skill)}
                                              className="w-full text-left px-4 py-2 text-white hover:bg-purple-500/20 flex items-center gap-3"
                                            >
                                              <IconComponent className="h-5 w-5" style={{ color: skill.color }}/>
                                              <span>{skill.name}</span>
                                            </button>
                                          );
                                        })}
                                        {filteredSkills.length === 0 && !isSkillAlreadyAdded && (
                                           <button
                                              onClick={() => handleAddSkill({ name: skillSearch, color: '#FFFFFF' })}
                                              className="w-full text-left px-4 py-2 text-white hover:bg-purple-500/20 flex items-center gap-3"
                                            >
                                              <Star className="h-5 w-5" style={{ color: '#FFFFFF' }}/>
                                              <span>Add "{skillSearch}"</span>
                                            </button>
                                        )}
                                    </div>
                                  )}
                              </div>
                            </div>
                            <div>
                               <label className={`block text-sm font-medium ${selectedTheme.colors.text} mb-2`}>Your Skills</label>
                               <div className="flex flex-wrap gap-2 p-3 bg-white/5 rounded-lg border border-white/10 min-h-[40px]">
                                {safeGetArray(portfolio.skills_json).map((skill: any) => {
                                  const skillDef = SKILLS_LIST.find(s => s.name === skill.name);
                                  const IconComponent = skillDef ? skillDef.icon : Star;
                                  return(
                                    <div key={skill.name} className="flex items-center gap-2 bg-purple-500/20 text-white px-3 py-1 rounded-full text-sm">
                                      <IconComponent className="h-4 w-4" style={{ color: skill.color || '#FFFFFF' }}/>
                                      <span>{skill.name}</span>
                                      <button onClick={() => handleRemoveSkill(skill.name)} className="text-purple-300 hover:text-white">
                                        <X className="h-3 w-3" />
                                      </button>
                                    </div>
                                  );
                                })}
                                {safeGetArray(portfolio.skills_json).length === 0 && (
                                   <p className="text-sm text-gray-400">Add skills from the list above.</p>
                                )}
                               </div>
                            </div>
                          </div>
                        )}

                        {key === 'resume' && (
                           <div className="space-y-4">
                            <label className={`block text-sm font-medium ${selectedTheme.colors.text} mb-2`}>
                              Resume Document
                            </label>
                            {portfolio.resume_url ? (
                                <div className="flex items-center gap-4 p-3 bg-white/10 rounded-lg">
                                    <FileText className="h-6 w-6 text-purple-400" />
                                    <a href={portfolio.resume_url} target="_blank" rel="noopener noreferrer" className="flex-1 text-sm text-white truncate hover:underline">
                                      {portfolio.resume_url.split('/').pop()}
                                    </a>
                                    <button onClick={() => handleFieldChange('resume_url', null)} className="p-2 text-red-400 hover:text-red-300 transition-colors" title="Remove resume">
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center">
                                  <FileText className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                                  <p className={`text-xs ${selectedTheme.colors.text} mb-2`}>No resume uploaded</p>
                                </div>
                            )}
                            <div className="flex gap-2">
                              <Input
                                type="url"
                                value={portfolio.resume_url || ''}
                                onChange={(e) => handleFieldChange('resume_url', e.target.value)}
                                placeholder="Or paste public URL to resume"
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
                                <span className="ml-2">Upload</span>
                              </Button>
                            </div>
                           </div>
                        )}

                        {key === 'footer' && (
                          <div className="space-y-6">
                            {/* About Summary */}
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <label className={`block text-sm font-medium ${selectedTheme.colors.text}`}>
                                  About Summary
                                </label>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    id="footer_show_about_summary"
                                    checked={portfolio.footer_show_about_summary !== false}
                                    onChange={(e) => handleFieldChange('footer_show_about_summary', e.target.checked)}
                                    className="rounded border-white/20 bg-white/10"
                                  />
                                  <label htmlFor="footer_show_about_summary" className={`text-xs ${selectedTheme.colors.text}`}>
                                    Show in footer
                                  </label>
                                </div>
                              </div>
                              <div className="flex gap-2 mb-2">
                                <Textarea
                                  value={portfolio.footer_about_summary || ''}
                                  onChange={(e) => handleFieldChange('footer_about_summary', e.target.value)}
                                  placeholder="A brief summary about yourself for the footer..."
                                  className={`flex-1 text-sm ${selectedTheme.colors.background} ${selectedTheme.colors.text} border-transparent focus:ring-2 focus:ring-purple-400`}
                                  rows={3}
                                />
                                <Button
                                  onClick={async () => {
                                    if (!portfolio.about_text) {
                                      alert('Please add some content to your About section first.');
                                      return;
                                    }
                                    try {
                                      const response = await fetch('/api/generate-portfolio', {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                          type: 'footer_about_summary',
                                          about_text: portfolio.about_text,
                                          artist_name: portfolio.artist_name
                                        })
                                      });
                                      const data = await response.json();
                                      if (data.content) {
                                        handleFieldChange('footer_about_summary', data.content);
                                      }
                                    } catch (error) {
                                      console.error('Error generating footer about summary:', error);
                                    }
                                  }}
                                  variant="outline" size="sm"
                                  className="bg-purple-600/20 border-purple-500/30 text-purple-300 hover:bg-purple-600/30"
                                >
                                  <Sparkles className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            {/* Quick Links */}
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <label className={`block text-sm font-medium ${selectedTheme.colors.text}`}>
                                  Quick Links
                                </label>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    id="footer_show_links"
                                    checked={portfolio.footer_show_links !== false}
                                    onChange={(e) => handleFieldChange('footer_show_links', e.target.checked)}
                                    className="rounded border-white/20 bg-white/10"
                                  />
                                  <label htmlFor="footer_show_links" className={`text-xs ${selectedTheme.colors.text}`}>
                                    Show in footer
                                  </label>
                                </div>
                              </div>
                              <div className="space-y-2">
                                {safeGetArray(portfolio.footer_links_json).map((link: any, index: number) => (
                                  <div key={index} className="flex gap-2">
                                    <Input
                                      type="text"
                                      value={link.text || ''}
                                      onChange={(e) => {
                                        const links = safeGetArray(portfolio.footer_links_json);
                                        links[index] = { ...link, text: e.target.value };
                                        handleFieldChange('footer_links_json', links);
                                      }}
                                      placeholder="Link text"
                                      className={`flex-1 text-sm ${selectedTheme.colors.background} ${selectedTheme.colors.text} border-transparent focus:ring-2 focus:ring-purple-400`}
                                    />
                                    <Input
                                      type="url"
                                      value={link.url || ''}
                                      onChange={(e) => {
                                        const links = safeGetArray(portfolio.footer_links_json);
                                        links[index] = { ...link, url: e.target.value };
                                        handleFieldChange('footer_links_json', links);
                                      }}
                                      placeholder="URL"
                                      className={`flex-1 text-sm ${selectedTheme.colors.background} ${selectedTheme.colors.text} border-transparent focus:ring-2 focus:ring-purple-400`}
                                    />
                                    <Button
                                      onClick={() => {
                                        const links = safeGetArray(portfolio.footer_links_json);
                                        links.splice(index, 1);
                                        handleFieldChange('footer_links_json', links);
                                      }}
                                      variant="outline" size="sm"
                                      className="bg-red-600/20 border-red-500/30 text-red-300 hover:bg-red-600/30"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}
                                <Button
                                  onClick={() => {
                                    const links = safeGetArray(portfolio.footer_links_json);
                                    links.push({ text: '', url: '' });
                                    handleFieldChange('footer_links_json', links);
                                  }}
                                  variant="outline" size="sm"
                                  className="bg-green-600/20 border-green-500/30 text-green-300 hover:bg-green-600/30"
                                >
                                  <Plus className="h-4 w-4 mr-1" />
                                  Add Link
                                </Button>
                              </div>
                            </div>

                            {/* Social Links Toggle */}
                            <div>
                              <div className="flex items-center justify-between">
                                <label className={`block text-sm font-medium ${selectedTheme.colors.text}`}>
                                  Social Links
                                </label>
                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    id="footer_show_social_links"
                                    checked={portfolio.footer_show_social_links !== false}
                                    onChange={(e) => handleFieldChange('footer_show_social_links', e.target.checked)}
                                    className="rounded border-white/20 bg-white/10"
                                  />
                                  <label htmlFor="footer_show_social_links" className={`text-xs ${selectedTheme.colors.text}`}>
                                    Show in footer
                                  </label>
                                </div>
                              </div>
                              <p className={`text-xs ${selectedTheme.colors.text} opacity-70 mt-1`}>
                                Uses social links from Contact section
                              </p>
                            </div>

                            {/* Copyright Text */}
                            <div>
                              <label className={`block text-sm font-medium ${selectedTheme.colors.text} mb-2`}>
                                Copyright Text
                              </label>
                              <Input
                                type="text"
                                value={portfolio.footer_copyright_text || ''}
                                onChange={(e) => handleFieldChange('footer_copyright_text', e.target.value)}
                                placeholder={`© ${new Date().getFullYear()} ${portfolio.artist_name || 'Hero Portfolio'}. All rights reserved.`}
                                className={`text-sm ${selectedTheme.colors.background} ${selectedTheme.colors.text} border-transparent focus:ring-2 focus:ring-purple-400`}
                              />
                              <p className={`text-xs ${selectedTheme.colors.text} opacity-70 mt-1`}>
                                Leave empty to use default copyright text
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </section>
                );
              })}
            </div>
          </div>
        </main>
      </div>

      {showPreview && (
        <div className={`fixed inset-0 z-50 bg-black ${previewMode === 'fullscreen' ? '' : 'p-4'}`}>
          <div className={`relative h-full ${previewMode === 'fullscreen' ? '' : 'rounded-lg overflow-hidden'}`}>
            <div className="absolute top-4 right-4 z-10 flex gap-2">
              <button
                onClick={() => setShowPreview(false)}
                className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const iframe = document.getElementById('preview-iframe') as HTMLIFrameElement;
                  if (iframe) {
                    const newUrl = `/portfolio/preview/${portfolio?.id}?t=${Date.now()}&v=${Math.random()}&cache=${new Date().getTime()}&refresh=true`;
                    console.log('🔄 Refreshing preview with URL:', newUrl);
                    iframe.src = newUrl;
                  }
                }}
                className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
              >
                Refresh
              </button>
            </div>
            {!portfolio.is_published && (
              <div className="absolute top-4 left-4 z-10">
                <div className="px-3 py-1 bg-yellow-500/90 text-yellow-900 rounded text-sm font-medium">
                  ⚠️ Portfolio is unpublished - some content may not display
                </div>
              </div>
            )}
            <iframe
              id="preview-iframe"
              src={`/portfolio/preview/${portfolio?.id}?t=${Date.now()}&v=${Math.random()}&cache=${new Date().getTime()}`}
              className="w-full h-full border-0"
              title="Portfolio Preview"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioEditorPage; 