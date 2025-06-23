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
import { Eye, PlusCircle, Trash2, Edit, Upload, Image, X, RefreshCw, ExternalLink, ChevronDown } from "lucide-react";
import { Portfolio } from "@/types/portfolio";
import { SECTIONS_CONFIG } from "@/lib/sections";
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

  const supabase = useMemo(() => createClient(), []);

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

  const selectedTheme = useMemo(() => THEMES.find(t => t.name === portfolio?.theme_name) || THEMES[0], [portfolio?.theme_name]);

  const fetchPortfolio = async () => {
    if (!id) return;
    setLoading(true);
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
      setPortfolio(portfolioData);
    }
    setLoading(false);
  };


  useEffect(() => {
    fetchPortfolio();
  }, [id, router, supabase]);

  const saveChanges = useDebouncedCallback(async (updatedPortfolio: Partial<Portfolio>) => {
    if (!portfolio) return;
    setSavingStatus("saving");

    const validPortfolioKeys: (keyof Portfolio)[] = [
      'name', 'slug', 'template_id', 'is_published', 'is_default', 'subtitle', 'hero_image_url',
      'about_title', 'about_text', 'profile_photo_url', 'instagram_url', 'twitter_url',
      'youtube_url', 'linkedin_url', 'website_url', 'testimonials_title', 'testimonials_json',
      'blog_title', 'blog_description', 'blog_posts_json', 'news_title', 'news_items_json',
      'skills_title', 'skills_json', 'status_title', 'current_status', 'status_description',
      'ai_advantage_title', 'ai_advantages_json', 'contact_title', 'contact_description',
      'contact_email', 'contact_phone', 'contact_location', 'footer_text', 'footer_links_json',
      'sections_config', 'theme_name'
    ];

    const portfolioToSave: Partial<Portfolio> = {};
    for (const key of Object.keys(updatedPortfolio) as (keyof Portfolio)[]) {
      if (validPortfolioKeys.includes(key)) {
        (portfolioToSave as any)[key] = updatedPortfolio[key];
      }
    }

    if (Object.keys(portfolioToSave).length === 0) {
      setSavingStatus("saved");
      return;
    }
    
    const { error } = await supabase
      .from("user_portfolios")
      .update(portfolioToSave)
      .eq("id", portfolio.id);

    if (error) {
      console.error("Error saving portfolio:", error);
      setSavingStatus("error");
    } else {
      setSavingStatus("saved");
      // Optimistically update local state, no need to re-fetch immediately
      setPortfolio(prev => ({...prev, ...updatedPortfolio}) as Portfolio);
    }
  }, 1500);

  const handleFieldChange = (field: keyof Portfolio, value: any) => {
    saveChanges({ [field]: value });
    setPortfolio(prev => ({ ...prev!, [field]: value }));
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
            </div>
            <div className="flex items-center space-x-3">
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
              <button 
                onClick={() => window.open(`/portfolio/${portfolio.slug}`, "_blank")} 
                className="px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/20 transition-all duration-300 text-sm font-medium flex items-center"
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Open in New Tab
              </button>
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
                        {(portfolio.sections_config as any)?.[key]?.name}
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
                                    Subtitle
                                  </label>
                                  <Input
                                    type="text"
                                    value={portfolio.subtitle || ''}
                                    onChange={(e) => handleFieldChange('subtitle', e.target.value)}
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
                                   <label className={`block text-sm font-medium ${selectedTheme.colors.text} mb-2`}>About Title</label>
                                   <Input
                                     type="text"
                                     value={portfolio.about_title || ''}
                                     onChange={(e) => handleFieldChange('about_title', e.target.value)}
                                     placeholder="About Me"
                                     className={`w-full text-sm ${selectedTheme.colors.background} ${selectedTheme.colors.text} border-transparent focus:ring-2 focus:ring-purple-400`}
                                   />
                                 </div>
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
                              <Button 
                                onClick={() => setShowAddTrackForm(true)}
                                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                              >
                                <PlusCircle className="mr-2 h-4 w-4" /> Add Track
                              </Button>
                              <PortfolioTracksDisplay
                                portfolioId={portfolio.id}
                                onEdit={(track) => setEditingTrack(track)}
                                onRefresh={fetchPortfolio}
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
                              <Button 
                                onClick={() => setShowAddGalleryForm(true)}
                                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                              >
                                <PlusCircle className="mr-2 h-4 w-4" /> Add Gallery Item
                              </Button>
                              <PortfolioGalleryDisplay
                                portfolioId={portfolio.id}
                                onEdit={(item) => setEditingGalleryItem(item)}
                                onRefresh={fetchPortfolio}
                              />
                            </div>
                          )
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
    </div>
  );
};

export default PortfolioEditorPage; 