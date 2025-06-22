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
import { Eye, PlusCircle, Trash2, Edit, Upload, Image, X, RefreshCw, ExternalLink } from "lucide-react";
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


  const supabase = useMemo(() => createClient(), []);

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

  const sortedEditorSections = Object.keys(SECTIONS_CONFIG)
    .sort((a, b) => (portfolio.sections_config as any)?.[a]?.order - (portfolio.sections_config as any)?.[b]?.order);
  
  const selectedTheme = THEMES.find(t => t.name === portfolio.theme_name) || THEMES[0];

  return (
    <div className="flex h-full min-h-screen font-sans">
      {/* --- Left Sidebar --- */}
      <aside className="w-[280px] bg-gray-950 text-white p-4 flex flex-col gap-6 overflow-y-auto border-r border-gray-800">
        <div>
          <h2 className="text-lg font-bold">Portfolio Settings</h2>
          <p className="text-xs text-gray-400 mt-1">
            Manage your portfolio's appearance and sections.
          </p>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold text-sm">Color Theme</h3>
          <div className="grid grid-cols-5 gap-2">
            {THEMES.map((theme) => (
              <button
                key={theme.name}
                onClick={() => handleFieldChange("theme_name", theme.name)}
                className={`w-full aspect-square rounded-full border-2 transition-all ${
                  portfolio.theme_name === theme.name ? 'border-white ring-2 ring-white' : 'border-gray-700 hover:border-white'
                } ${theme.colors.background}`}
                title={theme.name}
              ><div className={`h-1/2 w-1/2 rounded-full ${theme.colors.primary}`}></div></button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="font-semibold text-sm">Sections</h3>
          {sortedEditorSections.map((key) => (
            <div key={key} className="flex items-center justify-between">
              <Label htmlFor={`enable-${key}`} className="font-medium text-white text-sm">
                {SECTIONS_CONFIG[key].defaultName}
              </Label>
              <Switch
                id={`enable-${key}`}
                checked={(portfolio.sections_config as any)?.[key]?.enabled ?? false}
                onCheckedChange={(checked) =>
                  handleSectionConfigChange(key as any, "enabled", checked)
                }
              />
            </div>
          ))}
        </div>
      </aside>

      {/* --- Right Main Area (Live Editor) --- */}
      <main className={`flex-1 overflow-y-auto p-6 ${selectedTheme.colors.background} ${selectedTheme.colors.text}`}>
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-xl font-bold text-white/80">Editing: {portfolio.name}</h1>
            <div className="flex items-center space-x-3">
                 <span className={`text-xs font-medium px-2 py-1 rounded-full transition-colors ${
                    savingStatus === "saved" ? "bg-green-900/50 text-green-300" :
                    savingStatus === "saving" ? "bg-yellow-900/50 text-yellow-300 animate-pulse" :
                    "bg-red-900/50 text-red-300"
                }`}>
                    {savingStatus === 'saving' ? 'Saving...' : savingStatus === 'error' ? 'Error' : 'Saved'}
                </span>
                <Button 
                    onClick={() => setShowPreview(!showPreview)} 
                    variant={showPreview ? "default" : "outline"} 
                    size="sm"
                >
                    <Eye className="mr-2 h-3 w-3" /> {showPreview ? 'Hide Preview' : 'Live Preview'}
                </Button>
                {showPreview && (
                    <Button 
                        onClick={() => setPreviewMode(previewMode === 'fullscreen' ? 'side-by-side' : 'fullscreen')} 
                        variant="outline" 
                        size="sm"
                    >
                        {previewMode === 'fullscreen' ? 'Side-by-Side' : 'Fullscreen'}
                    </Button>
                )}
                <Button onClick={() => window.open(`/portfolio/${portfolio.slug}`, "_blank")} variant="outline" size="sm">
                    Open in New Tab
                </Button>
            </div>
        </div>

        <div className="max-w-5xl mx-auto space-y-8">
            {sortedEditorSections.filter(key => (portfolio.sections_config as any)?.[key]?.enabled).map(key => {
                const sectionConfig = SECTIONS_CONFIG[key];
                if (!sectionConfig) return null;
                
                return (
                    <section key={key} id={key}>
                        <h2 className={`text-2xl font-bold mb-4 border-b pb-2 ${selectedTheme.colors.heading} border-white/10`}>
                           <EditableField value={(portfolio.sections_config as any)?.[key]?.name} onSave={(newValue) => handleSectionConfigChange(key as any, "name", newValue)} theme={selectedTheme} />
                        </h2>
                        
                        {key === 'hero' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Hero Content */}
                                    <div className="space-y-3">
                                        <h3 className={`text-lg font-semibold ${selectedTheme.colors.heading}`}>
                                            Hero Content
                                        </h3>
                                        <div>
                                            <label className={`block text-sm font-medium ${selectedTheme.colors.text} mb-1`}>
                                                Portfolio Title
                                            </label>
                                            <input
                                                type="text"
                                                value={portfolio.name}
                                                onChange={(e) => handleFieldChange('name', e.target.value)}
                                                placeholder="Your portfolio title"
                                                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium ${selectedTheme.colors.text} mb-1`}>
                                                Subtitle
                                            </label>
                                            <input
                                                type="text"
                                                value={portfolio.subtitle || ''}
                                                onChange={(e) => handleFieldChange('subtitle', e.target.value)}
                                                placeholder="Brief description or tagline"
                                                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                            />
                                        </div>
                                    </div>

                                    {/* Hero Image Upload */}
                                    <div>
                                        <label className={`block text-sm font-medium ${selectedTheme.colors.text} mb-1`}>
                                            Image URL
                                        </label>
                                        <div className="flex gap-2">
                                            <input
                                                type="url"
                                                value={portfolio.hero_image_url || ''}
                                                onChange={(e) => handleFieldChange('hero_image_url', e.target.value)}
                                                placeholder="https://example.com/image.jpg"
                                                className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                            />
                                            <input
                                                type="file"
                                                id="hero-upload"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        uploadHeroImage(file);
                                                        e.target.value = '';
                                                    }
                                                }}
                                                className="hidden"
                                            />
                                            <Button
                                                onClick={() => document.getElementById('hero-upload')?.click()}
                                                variant="outline"
                                                size="sm"
                                                disabled={uploadingHero}
                                            >
                                                {uploadingHero ? (
                                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                                ) : (
                                                    <Upload className="h-3 w-3 mr-1" />
                                                )}
                                                {uploadingHero ? 'Uploading...' : 'Upload'}
                                            </Button>
                                        </div>
                                        <p className={`text-xs ${selectedTheme.colors.text} opacity-60 mt-1`}>
                                            Enter an image URL or upload a file (recommended: 1920x1080 or larger)
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {key === 'about' && (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* About Content */}
                                    <div className="space-y-3">
                                        <h3 className={`text-lg font-semibold ${selectedTheme.colors.heading}`}>
                                            About Content
                                        </h3>
                                        <div>
                                            <label className={`block text-sm font-medium ${selectedTheme.colors.text} mb-1`}>
                                                About Title
                                            </label>
                                            <input
                                                type="text"
                                                value={portfolio.about_title || ''}
                                                onChange={(e) => handleFieldChange('about_title', e.target.value)}
                                                placeholder="About Me"
                                                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className={`block text-sm font-medium ${selectedTheme.colors.text} mb-1`}>
                                                About Text
                                            </label>
                                            <textarea
                                                value={portfolio.about_text || ''}
                                                onChange={(e) => handleFieldChange('about_text', e.target.value)}
                                                placeholder="Tell your story, share your musical journey, and connect with your audience..."
                                                rows={6}
                                                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm resize-none"
                                            />
                                        </div>
                                    </div>

                                    {/* Profile Photo Upload */}
                                    <div className="space-y-3">
                                        <h3 className={`text-lg font-semibold ${selectedTheme.colors.heading}`}>
                                            Profile Photo
                                        </h3>
                                        <div className="space-y-3">
                                            {portfolio.profile_photo_url ? (
                                                <div className="relative">
                                                    <img
                                                        src={portfolio.profile_photo_url}
                                                        alt="Profile photo"
                                                        className="w-full h-40 object-cover rounded-lg border border-gray-600"
                                                    />
                                                    <button
                                                        onClick={() => handleFieldChange('profile_photo_url', '')}
                                                        className="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                                                    <Image className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                                                    <p className={`text-xs ${selectedTheme.colors.text} mb-1`}>
                                                        No profile photo uploaded
                                                    </p>
                                                    <p className={`text-xs ${selectedTheme.colors.text} opacity-75`}>
                                                        Upload a professional photo of yourself
                                                    </p>
                                                </div>
                                            )}
                                            
                                            <div>
                                                <label className={`block text-sm font-medium ${selectedTheme.colors.text} mb-1`}>
                                                    Photo URL
                                                </label>
                                                <div className="flex gap-2">
                                                    <input
                                                        type="url"
                                                        value={portfolio.profile_photo_url || ''}
                                                        onChange={(e) => handleFieldChange('profile_photo_url', e.target.value)}
                                                        placeholder="https://example.com/photo.jpg"
                                                        className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                                    />
                                                    <input
                                                        type="file"
                                                        id="profile-upload"
                                                        accept="image/*"
                                                        onChange={(e) => {
                                                            const file = e.target.files?.[0];
                                                            if (file) {
                                                                uploadProfilePhoto(file);
                                                                e.target.value = '';
                                                            }
                                                        }}
                                                        className="hidden"
                                                    />
                                                    <Button
                                                        onClick={() => document.getElementById('profile-upload')?.click()}
                                                        variant="outline"
                                                        size="sm"
                                                        disabled={uploadingProfile}
                                                    >
                                                        {uploadingProfile ? (
                                                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                                        ) : (
                                                            <Upload className="h-3 w-3 mr-1" />
                                                        )}
                                                        {uploadingProfile ? 'Uploading...' : 'Upload'}
                                                    </Button>
                                                </div>
                                                <p className={`text-xs ${selectedTheme.colors.text} opacity-60 mt-1`}>
                                                    Enter an image URL or upload a file (recommended: square image, 400x400 or larger)
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {key === 'testimonials' && (
                            <div className="space-y-4">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className={`text-lg font-semibold ${selectedTheme.colors.heading}`}>
                                            <EditableField 
                                                value={portfolio.testimonials_title || 'Testimonials'} 
                                                onSave={(newValue) => handleFieldChange('testimonials_title', newValue)} 
                                                theme={selectedTheme} 
                                            />
                                        </h3>
                                        <p className={`text-xs ${selectedTheme.colors.text} opacity-75 mt-1`}>
                                            Showcase reviews and feedback from fans, critics, and collaborators.
                                        </p>
                                    </div>
                                    <Button 
                                        size="sm" 
                                        onClick={() => {
                                            const currentTestimonials = portfolio.testimonials_json ? JSON.parse(portfolio.testimonials_json) : [];
                                            const newTestimonial = {
                                                id: Date.now(),
                                                author: '',
                                                content: '',
                                                rating: 5,
                                                date: new Date().toISOString().split('T')[0]
                                            };
                                            const updatedTestimonials = [...currentTestimonials, newTestimonial];
                                            handleFieldChange('testimonials_json', JSON.stringify(updatedTestimonials));
                                        }}
                                    >
                                        <PlusCircle className="mr-1 h-3 w-3" /> Add Testimonial
                                    </Button>
                                </div>

                                {(portfolio.testimonials_json || portfolio.testimonials_json === '') && (() => {
                                    try {
                                        const testimonialsJson = typeof portfolio.testimonials_json === 'string' 
                                            ? portfolio.testimonials_json 
                                            : JSON.stringify(portfolio.testimonials_json || []);
                                        const testimonials = JSON.parse(testimonialsJson);
                                        if (!Array.isArray(testimonials) || testimonials.length === 0) {
                                            return (
                                                <div className="text-center py-6">
                                                    <p className={`text-gray-400 ${selectedTheme.colors.text}`}>
                                                        No testimonials yet. Click "Add Testimonial" to get started.
                                                    </p>
                                                </div>
                                            );
                                        }

                                        return (
                                            <div className="space-y-3">
                                                {testimonials.map((testimonial: any, index: number) => (
                                                    <div key={testimonial.id || index} className="p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div className="flex-1 space-y-2">
                                                                <input
                                                                    type="text"
                                                                    value={testimonial.author || ''}
                                                                    onChange={(e) => {
                                                                        const updatedTestimonials = testimonials.map((t: any, i: number) => 
                                                                            i === index ? { ...t, author: e.target.value } : t
                                                                        );
                                                                        handleFieldChange('testimonials_json', JSON.stringify(updatedTestimonials));
                                                                    }}
                                                                    placeholder="Author name"
                                                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm font-medium"
                                                                />
                                                                <div className="flex items-center space-x-2">
                                                                    <span className={`text-xs ${selectedTheme.colors.text} opacity-75`}>Rating:</span>
                                                                    <div className="flex space-x-1">
                                                                        {[1, 2, 3, 4, 5].map((star) => (
                                                                            <button
                                                                                key={star}
                                                                                onClick={() => {
                                                                                    const updatedTestimonials = testimonials.map((t: any, i: number) => 
                                                                                        i === index ? { ...t, rating: star } : t
                                                                                    );
                                                                                    handleFieldChange('testimonials_json', JSON.stringify(updatedTestimonials));
                                                                                }}
                                                                                className={`text-sm ${testimonial.rating >= star ? 'text-yellow-400' : 'text-gray-500'}`}
                                                                            >
                                                                                ★
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => {
                                                                        const updatedTestimonials = testimonials.filter((_: any, i: number) => i !== index);
                                                                        handleFieldChange('testimonials_json', JSON.stringify(updatedTestimonials));
                                                                    }}
                                                                className="text-red-400 hover:text-red-300 p-1"
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                            </button>
                                                        </div>
                                                        <textarea
                                                            value={testimonial.content || ''}
                                                            onChange={(e) => {
                                                                const updatedTestimonials = testimonials.map((t: any, i: number) => 
                                                                    i === index ? { ...t, content: e.target.value } : t
                                                                );
                                                                handleFieldChange('testimonials_json', JSON.stringify(updatedTestimonials));
                                                            }}
                                                            placeholder="Write the testimonial content here..."
                                                            rows={2}
                                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm resize-none"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    } catch (error) {
                                        return (
                                            <div className="text-center py-6">
                                                <p className={`text-red-400 ${selectedTheme.colors.text}`}>
                                                    Error loading testimonials. Please try refreshing the page.
                                                </p>
                                            </div>
                                        );
                                    }
                                })()}
                            </div>
                        )}

                        {key === 'blog' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className={`text-2xl font-bold ${selectedTheme.colors.heading}`}>
                                            <EditableField 
                                                value={portfolio.blog_title || 'Blog'} 
                                                onSave={(newValue) => handleFieldChange('blog_title', newValue)} 
                                                theme={selectedTheme} 
                                            />
                                        </h3>
                                        <p className={`text-sm ${selectedTheme.colors.text} opacity-75 mt-2`}>
                                            Share your thoughts, behind-the-scenes stories, and musical insights.
                                        </p>
                                    </div>
                                    <Button 
                                        size="sm" 
                                        onClick={() => {
                                            const currentPosts = portfolio.blog_posts_json ? 
                                                (typeof portfolio.blog_posts_json === 'string' ? JSON.parse(portfolio.blog_posts_json) : portfolio.blog_posts_json) : [];
                                            const newPost = {
                                                id: Date.now(),
                                                title: '',
                                                content: '',
                                                excerpt: '',
                                                published_date: new Date().toISOString().split('T')[0],
                                                is_published: false
                                            };
                                            const updatedPosts = [...currentPosts, newPost];
                                            handleFieldChange('blog_posts_json', JSON.stringify(updatedPosts));
                                        }}
                                    >
                                        <PlusCircle className="mr-2 h-4 w-4" /> Add Post
                                    </Button>
                                </div>

                                <div>
                                    <label className={`block text-sm font-medium ${selectedTheme.colors.text} mb-2`}>
                                        Blog Description
                                    </label>
                                    <textarea
                                        value={portfolio.blog_description || ''}
                                        onChange={(e) => handleFieldChange('blog_description', e.target.value)}
                                        placeholder="Describe what your blog is about..."
                                        rows={2}
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm resize-none"
                                    />
                                </div>

                                {(() => {
                                    try {
                                        const postsJson = typeof portfolio.blog_posts_json === 'string' 
                                            ? portfolio.blog_posts_json 
                                            : JSON.stringify(portfolio.blog_posts_json || []);
                                        const posts = JSON.parse(postsJson);
                                        
                                        if (!Array.isArray(posts) || posts.length === 0) {
                                            return (
                                                <div className="text-center py-8">
                                                    <p className={`text-gray-400 ${selectedTheme.colors.text}`}>
                                                        No blog posts yet. Click "Add Post" to get started.
                                                    </p>
                                                </div>
                                            );
                                        }

                                        return (
                                            <div className="space-y-4">
                                                {posts.map((post: any, index: number) => (
                                                    <div key={post.id || index} className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                                                        <div className="flex justify-between items-start mb-3">
                                                            <div className="flex-1 space-y-3">
                                                                <input
                                                                    type="text"
                                                                    value={post.title || ''}
                                                                    onChange={(e) => {
                                                                        const updatedPosts = posts.map((p: any, i: number) => 
                                                                            i === index ? { ...p, title: e.target.value } : p
                                                                        );
                                                                        handleFieldChange('blog_posts_json', JSON.stringify(updatedPosts));
                                                                    }}
                                                                    placeholder="Post title"
                                                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm font-medium"
                                                                />
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                    <input
                                                                        type="date"
                                                                        value={post.published_date || ''}
                                                                        onChange={(e) => {
                                                                            const updatedPosts = posts.map((p: any, i: number) => 
                                                                                i === index ? { ...p, published_date: e.target.value } : p
                                                                            );
                                                                            handleFieldChange('blog_posts_json', JSON.stringify(updatedPosts));
                                                                        }}
                                                                        className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                                                    />
                                                                    <div className="flex items-center space-x-2">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={post.is_published || false}
                                                                            onChange={(e) => {
                                                                                const updatedPosts = posts.map((p: any, i: number) => 
                                                                                    i === index ? { ...p, is_published: e.target.checked } : p
                                                                                );
                                                                                handleFieldChange('blog_posts_json', JSON.stringify(updatedPosts));
                                                                            }}
                                                                            className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-indigo-500 focus:ring-indigo-500"
                                                                        />
                                                                        <span className={`text-xs ${selectedTheme.colors.text} opacity-75`}>Published</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => {
                                                                        const updatedPosts = posts.filter((_: any, i: number) => i !== index);
                                                                        handleFieldChange('blog_posts_json', JSON.stringify(updatedPosts));
                                                                    }}
                                                                className="text-red-400 hover:text-red-300 p-1"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                        <div className="space-y-2">
                                                            <textarea
                                                                value={post.excerpt || ''}
                                                                onChange={(e) => {
                                                                    const updatedPosts = posts.map((p: any, i: number) => 
                                                                        i === index ? { ...p, excerpt: e.target.value } : p
                                                                    );
                                                                    handleFieldChange('blog_posts_json', JSON.stringify(updatedPosts));
                                                                }}
                                                                placeholder="Brief excerpt (optional)"
                                                                rows={2}
                                                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm resize-none"
                                                            />
                                                            <textarea
                                                                value={post.content || ''}
                                                                onChange={(e) => {
                                                                    const updatedPosts = posts.map((p: any, i: number) => 
                                                                        i === index ? { ...p, content: e.target.value } : p
                                                                    );
                                                                    handleFieldChange('blog_posts_json', JSON.stringify(updatedPosts));
                                                                }}
                                                                placeholder="Write your blog post content here..."
                                                                rows={4}
                                                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm resize-none"
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    } catch (error) {
                                        return (
                                            <div className="text-center py-8">
                                                <p className={`text-red-400 ${selectedTheme.colors.text}`}>
                                                    Error loading blog posts. Please try refreshing the page.
                                                </p>
                                            </div>
                                        );
                                    }
                                })()}
                            </div>
                        )}
                        
                        {key === 'tracks' && (
                            <>
                                {showAddTrackForm ? (
                                    <PortfolioTrackForm 
                                        portfolioId={portfolio.id} 
                                        onSuccess={() => { setShowAddTrackForm(false); fetchPortfolio(); }} 
                                        onCancel={() => setShowAddTrackForm(false)}
                                    />
                                ) : editingTrack ? (
                                    <PortfolioTrackForm 
                                        portfolioId={portfolio.id} 
                                        track={editingTrack}
                                        onSuccess={() => { setEditingTrack(null); fetchPortfolio(); }}
                                        onCancel={() => setEditingTrack(null)}
                                    />
                                ) : (
                                    <>
                                        <div className="text-right mb-4">
                                            <Button size="sm" onClick={() => setShowAddTrackForm(true)}><PlusCircle className="mr-2 h-4 w-4" /> Add Track</Button>
                                        </div>
                                        <PortfolioTracksDisplay 
                                            portfolioId={portfolio.id} 
                                            onRefresh={fetchPortfolio} 
                                            onEdit={setEditingTrack}
                                        />
                                    </>
                                )}
                            </>
                        )}

                        {key === 'gallery' && (
                           <>
                                {showAddGalleryForm ? (
                                    <PortfolioGalleryForm 
                                        portfolioId={portfolio.id} 
                                        onSuccess={() => { setShowAddGalleryForm(false); fetchPortfolio(); }}
                                        onCancel={() => setShowAddGalleryForm(false)}
                                    />
                                ) : editingGalleryItem ? (
                                    <PortfolioGalleryForm
                                        portfolioId={portfolio.id}
                                        item={editingGalleryItem}
                                        onSuccess={() => { setEditingGalleryItem(null); fetchPortfolio(); }}
                                        onCancel={() => setEditingGalleryItem(null)}
                                    />
                                ) : (
                                    <>
                                        <div className="text-right mb-4">
                                             <Button size="sm" onClick={() => setShowAddGalleryForm(true)}><PlusCircle className="mr-2 h-4 w-4" /> Add Gallery Item</Button>
                                        </div>
                                       <PortfolioGalleryDisplay 
                                            portfolioId={portfolio.id} 
                                            onRefresh={fetchPortfolio}
                                            onEdit={setEditingGalleryItem}
                                       />
                                    </>
                                )}
                            </>
                        )}

                        {key === 'social_links' && (
                            <div className="space-y-4">
                                <h3 className={`text-lg font-semibold ${selectedTheme.colors.heading}`}>
                                    Social Media Links
                                </h3>
                                <p className={`text-xs ${selectedTheme.colors.text} opacity-75`}>
                                    Add your social media profiles to help fans connect with you across platforms.
                                </p>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className={`block text-sm font-medium ${selectedTheme.colors.text} mb-1`}>
                                            Instagram
                                        </label>
                                        <input
                                            type="url"
                                            value={portfolio.instagram_url || ''}
                                            onChange={(e) => handleFieldChange('instagram_url', e.target.value)}
                                            placeholder="https://instagram.com/yourusername"
                                            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className={`block text-sm font-medium ${selectedTheme.colors.text} mb-1`}>
                                            Twitter/X
                                        </label>
                                        <input
                                            type="url"
                                            value={portfolio.twitter_url || ''}
                                            onChange={(e) => handleFieldChange('twitter_url', e.target.value)}
                                            placeholder="https://twitter.com/yourusername"
                                            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className={`block text-sm font-medium ${selectedTheme.colors.text} mb-1`}>
                                            YouTube
                                        </label>
                                        <input
                                            type="url"
                                            value={portfolio.youtube_url || ''}
                                            onChange={(e) => handleFieldChange('youtube_url', e.target.value)}
                                            placeholder="https://youtube.com/@yourchannel"
                                            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className={`block text-sm font-medium ${selectedTheme.colors.text} mb-1`}>
                                            LinkedIn
                                        </label>
                                        <input
                                            type="url"
                                            value={portfolio.linkedin_url || ''}
                                            onChange={(e) => handleFieldChange('linkedin_url', e.target.value)}
                                            placeholder="https://linkedin.com/in/yourprofile"
                                            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className={`block text-sm font-medium ${selectedTheme.colors.text} mb-1`}>
                                            Personal Website
                                        </label>
                                        <input
                                            type="url"
                                            value={portfolio.website_url || ''}
                                            onChange={(e) => handleFieldChange('website_url', e.target.value)}
                                            placeholder="https://yourwebsite.com"
                                            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {key === 'news' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className={`text-2xl font-bold ${selectedTheme.colors.heading}`}>
                                            <EditableField 
                                                value={portfolio.news_title || 'News & Updates'} 
                                                onSave={(newValue) => handleFieldChange('news_title', newValue)} 
                                                theme={selectedTheme} 
                                            />
                                        </h3>
                                        <p className={`text-sm ${selectedTheme.colors.text} opacity-75 mt-2`}>
                                            Share your latest news, announcements, and updates with your audience.
                                        </p>
                                    </div>
                                    <Button 
                                        size="sm" 
                                        onClick={() => {
                                            const currentNews = portfolio.news_items_json ? 
                                                (typeof portfolio.news_items_json === 'string' ? JSON.parse(portfolio.news_items_json) : portfolio.news_items_json) : [];
                                            const newItem = {
                                                id: Date.now(),
                                                title: '',
                                                content: '',
                                                published_date: new Date().toISOString().split('T')[0],
                                                is_published: false,
                                                is_featured: false
                                            };
                                            const updatedNews = [...currentNews, newItem];
                                            handleFieldChange('news_items_json', JSON.stringify(updatedNews));
                                        }}
                                    >
                                        <PlusCircle className="mr-2 h-4 w-4" /> Add News
                                    </Button>
                                </div>

                                <div>
                                    <label className={`block text-sm font-medium ${selectedTheme.colors.text} mb-2`}>
                                        News Description
                                    </label>
                                    <textarea
                                        value={portfolio.news_description || ''}
                                        onChange={(e) => handleFieldChange('news_description', e.target.value)}
                                        placeholder="Describe what kind of news you'll be sharing..."
                                        rows={2}
                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm resize-none"
                                    />
                                </div>

                                {(() => {
                                    try {
                                        const newsJson = typeof portfolio.news_items_json === 'string' 
                                            ? portfolio.news_items_json 
                                            : JSON.stringify(portfolio.news_items_json || []);
                                        const newsItems = JSON.parse(newsJson);
                                        
                                        if (!Array.isArray(newsItems) || newsItems.length === 0) {
                                            return (
                                                <div className="text-center py-8">
                                                    <p className={`text-gray-400 ${selectedTheme.colors.text}`}>
                                                        No news items yet. Click "Add News" to get started.
                                                    </p>
                                                </div>
                                            );
                                        }

                                        return (
                                            <div className="space-y-4">
                                                {newsItems.map((item: any, index: number) => (
                                                    <div key={item.id || index} className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                                                        <div className="flex justify-between items-start mb-3">
                                                            <div className="flex-1 space-y-3">
                                                                <input
                                                                    type="text"
                                                                    value={item.title || ''}
                                                                    onChange={(e) => {
                                                                        const updatedNews = newsItems.map((n: any, i: number) => 
                                                                            i === index ? { ...n, title: e.target.value } : n
                                                                        );
                                                                        handleFieldChange('news_items_json', JSON.stringify(updatedNews));
                                                                    }}
                                                                    placeholder="News title"
                                                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm font-medium"
                                                                />
                                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                                                    <input
                                                                        type="date"
                                                                        value={item.published_date || ''}
                                                                        onChange={(e) => {
                                                                            const updatedNews = newsItems.map((n: any, i: number) => 
                                                                                i === index ? { ...n, published_date: e.target.value } : n
                                                                            );
                                                                            handleFieldChange('news_items_json', JSON.stringify(updatedNews));
                                                                        }}
                                                                        className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                                                    />
                                                                    <div className="flex items-center space-x-2">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={item.is_published || false}
                                                                            onChange={(e) => {
                                                                                const updatedNews = newsItems.map((n: any, i: number) => 
                                                                                    i === index ? { ...n, is_published: e.target.checked } : n
                                                                                );
                                                                                handleFieldChange('news_items_json', JSON.stringify(updatedNews));
                                                                            }}
                                                                            className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-indigo-500 focus:ring-indigo-500"
                                                                        />
                                                                        <span className={`text-xs ${selectedTheme.colors.text} opacity-75`}>Published</span>
                                                                    </div>
                                                                    <div className="flex items-center space-x-2">
                                                                        <input
                                                                            type="checkbox"
                                                                            checked={item.is_featured || false}
                                                                            onChange={(e) => {
                                                                                const updatedNews = newsItems.map((n: any, i: number) => 
                                                                                    i === index ? { ...n, is_featured: e.target.checked } : n
                                                                                );
                                                                                handleFieldChange('news_items_json', JSON.stringify(updatedNews));
                                                                            }}
                                                                            className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-indigo-500 focus:ring-indigo-500"
                                                                        />
                                                                        <span className={`text-xs ${selectedTheme.colors.text} opacity-75`}>Featured</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => {
                                                                        const updatedNews = newsItems.filter((_: any, i: number) => i !== index);
                                                                        handleFieldChange('news_items_json', JSON.stringify(updatedNews));
                                                                    }}
                                                                className="text-red-400 hover:text-red-300 p-1"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                        <textarea
                                                            value={item.content || ''}
                                                            onChange={(e) => {
                                                                const updatedNews = newsItems.map((n: any, i: number) => 
                                                                    i === index ? { ...n, content: e.target.value } : n
                                                                );
                                                                handleFieldChange('news_items_json', JSON.stringify(updatedNews));
                                                            }}
                                                            placeholder="Write your news content here..."
                                                            rows={4}
                                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm resize-none"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    } catch (error) {
                                        return (
                                            <div className="text-center py-8">
                                                <p className={`text-red-400 ${selectedTheme.colors.text}`}>
                                                    Error loading news items. Please try refreshing the page.
                                                </p>
                                            </div>
                                        );
                                    }
                                })()}
                            </div>
                        )}

                        {key === 'skills' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className={`text-2xl font-bold ${selectedTheme.colors.heading}`}>
                                            <EditableField 
                                                value={portfolio.skills_title || 'Skills & Instruments'} 
                                                onSave={(newValue) => handleFieldChange('skills_title', newValue)} 
                                                theme={selectedTheme} 
                                            />
                                        </h3>
                                        <p className={`text-sm ${selectedTheme.colors.text} opacity-75 mt-2`}>
                                            Showcase your musical abilities, instruments, and other relevant skills.
                                        </p>
                                    </div>
                                    <Button 
                                        size="sm" 
                                        onClick={() => {
                                            const currentSkills = portfolio.skills_json ? 
                                                (typeof portfolio.skills_json === 'string' ? JSON.parse(portfolio.skills_json) : portfolio.skills_json) : [];
                                            const newSkill = {
                                                id: Date.now(),
                                                name: '',
                                                category: 'Instrument',
                                                level: 'Intermediate',
                                                description: ''
                                            };
                                            const updatedSkills = [...currentSkills, newSkill];
                                            handleFieldChange('skills_json', JSON.stringify(updatedSkills));
                                        }}
                                    >
                                        <PlusCircle className="mr-2 h-4 w-4" /> Add Skill
                                    </Button>
                                </div>

                                {(() => {
                                    try {
                                        const skillsJson = typeof portfolio.skills_json === 'string' 
                                            ? portfolio.skills_json 
                                            : JSON.stringify(portfolio.skills_json || []);
                                        const skills = JSON.parse(skillsJson);
                                        
                                        if (!Array.isArray(skills) || skills.length === 0) {
                                            return (
                                                <div className="text-center py-8">
                                                    <p className={`text-gray-400 ${selectedTheme.colors.text}`}>
                                                        No skills added yet. Click "Add Skill" to get started.
                                                    </p>
                                                </div>
                                            );
                                        }

                                        return (
                                            <div className="space-y-4">
                                                {skills.map((skill: any, index: number) => (
                                                    <div key={skill.id || index} className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                                                        <div className="flex justify-between items-start mb-3">
                                                            <div className="flex-1 space-y-3">
                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                                    <input
                                                                        type="text"
                                                                        value={skill.name || ''}
                                                                        onChange={(e) => {
                                                                            const updatedSkills = skills.map((s: any, i: number) => 
                                                                                i === index ? { ...s, name: e.target.value } : s
                                                                            );
                                                                            handleFieldChange('skills_json', JSON.stringify(updatedSkills));
                                                                        }}
                                                                        placeholder="Skill name (e.g., Piano, Music Production)"
                                                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm font-medium"
                                                                    />
                                                                    <select
                                                                        value={skill.category || 'Instrument'}
                                                                        onChange={(e) => {
                                                                            const updatedSkills = skills.map((s: any, i: number) => 
                                                                                i === index ? { ...s, category: e.target.value } : s
                                                                            );
                                                                            handleFieldChange('skills_json', JSON.stringify(updatedSkills));
                                                                        }}
                                                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                                                    >
                                                                        <option value="Instrument">Instrument</option>
                                                                        <option value="Production">Production</option>
                                                                        <option value="Composition">Composition</option>
                                                                        <option value="Performance">Performance</option>
                                                                        <option value="Technical">Technical</option>
                                                                        <option value="Other">Other</option>
                                                                    </select>
                                                                </div>
                                                                <div className="flex items-center space-x-3">
                                                                    <span className={`text-xs ${selectedTheme.colors.text} opacity-75`}>Level:</span>
                                                                    <select
                                                                        value={skill.level || 'Intermediate'}
                                                                        onChange={(e) => {
                                                                            const updatedSkills = skills.map((s: any, i: number) => 
                                                                                i === index ? { ...s, level: e.target.value } : s
                                                                            );
                                                                            handleFieldChange('skills_json', JSON.stringify(updatedSkills));
                                                                        }}
                                                                        className="px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                                                    >
                                                                        <option value="Beginner">Beginner</option>
                                                                        <option value="Intermediate">Intermediate</option>
                                                                        <option value="Advanced">Advanced</option>
                                                                        <option value="Expert">Expert</option>
                                                                        <option value="Professional">Professional</option>
                                                                    </select>
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => {
                                                                        const updatedSkills = skills.filter((_: any, i: number) => i !== index);
                                                                        handleFieldChange('skills_json', JSON.stringify(updatedSkills));
                                                                    }}
                                                                className="text-red-400 hover:text-red-300 p-1"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                        <textarea
                                                            value={skill.description || ''}
                                                            onChange={(e) => {
                                                                const updatedSkills = skills.map((s: any, i: number) => 
                                                                    i === index ? { ...s, description: e.target.value } : s
                                                                );
                                                                handleFieldChange('skills_json', JSON.stringify(updatedSkills));
                                                            }}
                                                            placeholder="Describe your experience with this skill..."
                                                            rows={2}
                                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm resize-none"
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    } catch (error) {
                                        return (
                                            <div className="text-center py-8">
                                                <p className={`text-red-400 ${selectedTheme.colors.text}`}>
                                                    Error loading skills. Please try refreshing the page.
                                                </p>
                                            </div>
                                        );
                                    }
                                })()}
                            </div>
                        )}
                        {key === 'status' && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className={`text-2xl font-bold ${selectedTheme.colors.heading}`}>
                                        <EditableField 
                                            value={portfolio.status_title || 'Current Status'} 
                                            onSave={(newValue) => handleFieldChange('status_title', newValue)} 
                                            theme={selectedTheme} 
                                        />
                                    </h3>
                                    <p className={`text-sm ${selectedTheme.colors.text} opacity-75 mt-2`}>
                                        Let visitors know about your current availability and upcoming projects.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div>
                                            <label className={`block text-sm font-medium ${selectedTheme.colors.text} mb-2`}>
                                                Current Status
                                            </label>
                                            <select
                                                value={portfolio.current_status || 'Available'}
                                                onChange={(e) => handleFieldChange('current_status', e.target.value)}
                                                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                            >
                                                <option value="Available">Available for Work</option>
                                                <option value="Busy">Currently Busy</option>
                                                <option value="Limited">Limited Availability</option>
                                                <option value="Unavailable">Unavailable</option>
                                                <option value="On Tour">On Tour</option>
                                                <option value="Recording">In Studio Recording</option>
                                                <option value="Writing">Writing New Music</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className={`block text-sm font-medium ${selectedTheme.colors.text} mb-2`}>
                                                Status Description
                                            </label>
                                            <textarea
                                                value={portfolio.status_description || ''}
                                                onChange={(e) => handleFieldChange('status_description', e.target.value)}
                                                placeholder="Describe your current situation, upcoming projects, or availability details..."
                                                rows={4}
                                                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm resize-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                                            <h4 className={`text-sm font-semibold ${selectedTheme.colors.text} mb-3`}>
                                                💡 Status Tips
                                            </h4>
                                            <ul className={`text-xs space-y-2 ${selectedTheme.colors.text} opacity-75`}>
                                                <li>• Keep your status updated regularly</li>
                                                <li>• Mention specific projects or timeframes</li>
                                                <li>• Let people know how to reach you</li>
                                                <li>• Be honest about your availability</li>
                                                <li>• Update when you're back available</li>
                                            </ul>
                                        </div>

                                        <div className="p-4 bg-blue-900/20 rounded-lg border border-blue-700/30">
                                            <h4 className={`text-sm font-semibold text-blue-300 mb-2`}>
                                                🎵 Musician Status Ideas
                                            </h4>
                                            <ul className={`text-xs space-y-1 text-blue-200/75`}>
                                                <li>• "Recording new album - available for sessions"</li>
                                                <li>• "On tour until June - booking for fall"</li>
                                                <li>• "Writing new material - open to collaborations"</li>
                                                <li>• "Studio sessions available - DM for rates"</li>
                                                <li>• "Taking a break - back in September"</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        {key === 'ai_advantage' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className={`text-2xl font-bold ${selectedTheme.colors.heading}`}>
                                            <EditableField 
                                                value={portfolio.ai_advantage_title || 'AI-Powered Features'} 
                                                onSave={(newValue) => handleFieldChange('ai_advantage_title', newValue)} 
                                                theme={selectedTheme} 
                                            />
                                        </h3>
                                        <p className={`text-sm ${selectedTheme.colors.text} opacity-75 mt-2`}>
                                            Highlight your AI-powered capabilities and how they enhance your music.
                                        </p>
                                    </div>
                                </div>

                                {(() => {
                                    try {
                                        const aiAdvantagesJson = typeof portfolio.ai_advantages_json === 'string' 
                                            ? portfolio.ai_advantages_json 
                                            : JSON.stringify(portfolio.ai_advantages_json || {});
                                        const aiAdvantages = JSON.parse(aiAdvantagesJson);
                                        
                                        return (
                                            <div className="space-y-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <label className={`block text-sm font-medium ${selectedTheme.colors.text} mb-2`}>
                                                            Main Description
                                                        </label>
                                                        <textarea
                                                            value={aiAdvantages.description || ''}
                                                            onChange={(e) => {
                                                                const updated = { ...aiAdvantages, description: e.target.value };
                                                                handleFieldChange('ai_advantages_json', JSON.stringify(updated));
                                                            }}
                                                            placeholder="Describe how AI enhances your music creation process..."
                                                            rows={4}
                                                            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm resize-none"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className={`block text-sm font-medium ${selectedTheme.colors.text} mb-2`}>
                                                            Key Benefits
                                                        </label>
                                                        <textarea
                                                            value={aiAdvantages.benefits || ''}
                                                            onChange={(e) => {
                                                                const updated = { ...aiAdvantages, benefits: e.target.value };
                                                                handleFieldChange('ai_advantages_json', JSON.stringify(updated));
                                                            }}
                                                            placeholder="List the key benefits of your AI-powered approach..."
                                                            rows={4}
                                                            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm resize-none"
                                                        />
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className={`block text-sm font-medium ${selectedTheme.colors.text} mb-2`}>
                                                        AI Features List
                                                    </label>
                                                    <textarea
                                                        value={aiAdvantages.features || ''}
                                                        onChange={(e) => {
                                                            const updated = { ...aiAdvantages, features: e.target.value };
                                                            handleFieldChange('ai_advantages_json', JSON.stringify(updated));
                                                        }}
                                                        placeholder="List specific AI features you use (e.g., AI composition, smart mixing, automated mastering)..."
                                                        rows={3}
                                                        className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm resize-none"
                                                    />
                                                    <p className={`text-xs ${selectedTheme.colors.text} opacity-60 mt-1`}>
                                                        Separate features with commas or line breaks
                                                    </p>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <label className={`block text-sm font-medium ${selectedTheme.colors.text} mb-2`}>
                                                            Technology Stack
                                                        </label>
                                                        <textarea
                                                            value={aiAdvantages.tech_stack || ''}
                                                            onChange={(e) => {
                                                                const updated = { ...aiAdvantages, tech_stack: e.target.value };
                                                                handleFieldChange('ai_advantages_json', JSON.stringify(updated));
                                                            }}
                                                            placeholder="List the AI tools and technologies you use..."
                                                            rows={3}
                                                            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm resize-none"
                                                        />
                                                    </div>

                                                    <div>
                                                        <label className={`block text-sm font-medium ${selectedTheme.colors.text} mb-2`}>
                                                            Call to Action
                                                        </label>
                                                        <textarea
                                                            value={aiAdvantages.cta || ''}
                                                            onChange={(e) => {
                                                                const updated = { ...aiAdvantages, cta: e.target.value };
                                                                handleFieldChange('ai_advantages_json', JSON.stringify(updated));
                                                            }}
                                                            placeholder="Encourage visitors to explore your AI-powered music..."
                                                            rows={3}
                                                            className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm resize-none"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="bg-gray-800/30 p-4 rounded-lg border border-gray-700">
                                                    <h4 className={`text-sm font-medium ${selectedTheme.colors.text} mb-2`}>
                                                        Preview
                                                    </h4>
                                                    <div className={`text-sm ${selectedTheme.colors.text} space-y-2`}>
                                                        <p><strong>Title:</strong> {portfolio.ai_advantage_title || 'AI-Powered Features'}</p>
                                                        <p><strong>Description:</strong> {aiAdvantages.description || 'No description yet'}</p>
                                                        <p><strong>Benefits:</strong> {aiAdvantages.benefits || 'No benefits listed yet'}</p>
                                                        <p><strong>Features:</strong> {aiAdvantages.features || 'No features listed yet'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    } catch (error) {
                                        return (
                                            <div className="text-center py-8">
                                                <p className={`text-red-400 ${selectedTheme.colors.text}`}>
                                                    Error loading AI advantages. Please try refreshing the page.
                                                </p>
                                            </div>
                                        );
                                    }
                                })()}
                            </div>
                        )}
                        
                        {key === 'contact' && (
                            <div>
                                <h3 className={`text-2xl font-bold ${selectedTheme.colors.heading}`}>
                                     <EditableField value={portfolio.contact_title || ''} onSave={(newValue) => handleFieldChange('contact_title', newValue)} theme={selectedTheme} />
                                </h3>
                                <div className={`mt-4 prose prose-invert max-w-none ${selectedTheme.colors.text}`}>
                                     <EditableField value={portfolio.contact_description || ''} onSave={(newValue) => handleFieldChange('contact_description', newValue)} fieldType="textarea" theme={selectedTheme} />
                                </div>
                            </div>
                        )}
                        
                        {key === 'footer' && (
                             <div>
                                <h3 className={`text-2xl font-bold ${selectedTheme.colors.heading}`}>Footer Content</h3>
                                <div className={`mt-4 prose prose-invert max-w-none ${selectedTheme.colors.text}`}>
                                     <EditableField value={portfolio.footer_text || ''} onSave={(newValue) => handleFieldChange('footer_text', newValue)} fieldType="textarea" theme={selectedTheme} />
                                </div>
                            </div>
                        )}


                    </section>
                )
            })}
        </div>
      </main>

      {/* Live Preview Panel */}
      {showPreview && previewMode === 'fullscreen' && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Live Preview - {portfolio.name}</h3>
              <Button onClick={() => setShowPreview(false)} variant="outline" size="sm">
                Close Preview
              </Button>
            </div>
            <div className="flex-1 overflow-hidden">
              <iframe
                src={`/portfolio/${portfolio.slug}?preview=true&t=${Date.now()}`}
                className="w-full h-full border-0"
                title="Portfolio Preview"
              />
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Side-by-Side Live Preview */}
      {showPreview && previewMode === 'side-by-side' && (
        <div className="fixed inset-0 z-50 bg-gray-900 flex">
          {/* Editor Panel */}
          <div className="w-1/2 bg-gray-800 overflow-y-auto">
            <div className="sticky top-0 z-10 bg-gray-800 border-b border-gray-700 p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <h3 className="text-lg font-semibold text-white">Editor</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    savingStatus === 'saved' ? 
                    "bg-green-900/50 text-green-300" : 
                    savingStatus === 'saving' ? 
                    "bg-yellow-900/50 text-yellow-300" : 
                    "bg-red-900/50 text-red-300"
                  }`}>
                    {savingStatus === 'saving' ? 'Saving...' : savingStatus === 'error' ? 'Error' : 'Saved'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    onClick={() => {
                      const iframe = document.getElementById('side-preview-iframe') as HTMLIFrameElement;
                      if (iframe) {
                        iframe.src = iframe.src;
                      }
                    }} 
                    variant="outline" 
                    size="sm"
                  >
                    <RefreshCw className="mr-1 h-3 w-3" /> Refresh
                  </Button>
                  <Button onClick={() => setShowPreview(false)} variant="outline" size="sm">
                    <X className="mr-1 h-3 w-3" /> Close
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Editor Content */}
            <div className="p-4">
              <div className="max-w-4xl mx-auto space-y-6">
                {sortedEditorSections.filter(key => (portfolio.sections_config as any)?.[key]?.enabled).map(key => {
                  const sectionConfig = SECTIONS_CONFIG[key];
                  if (!sectionConfig) return null;
                  
                  return (
                    <section key={key} id={key}>
                      <h2 className={`text-xl font-bold mb-3 border-b pb-2 ${selectedTheme.colors.heading} border-white/10`}>
                         <EditableField value={(portfolio.sections_config as any)?.[key]?.name} onSave={(newValue) => handleSectionConfigChange(key as any, "name", newValue)} theme={selectedTheme} />
                      </h2>
                      
                      {/* Section content - simplified for side-by-side view */}
                      <div className="space-y-3">
                        {key === 'hero' && (
                          <div className="space-y-3">
                            <div>
                              <label className={`block text-sm font-medium ${selectedTheme.colors.text} mb-1`}>Title</label>
                              <input
                                type="text"
                                value={portfolio.name}
                                onChange={(e) => handleFieldChange('name', e.target.value)}
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                              />
                            </div>
                            <div>
                              <label className={`block text-sm font-medium ${selectedTheme.colors.text} mb-1`}>Subtitle</label>
                              <input
                                type="text"
                                value={portfolio.subtitle || ''}
                                onChange={(e) => handleFieldChange('subtitle', e.target.value)}
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                              />
                            </div>
                            <div>
                              <label className={`block text-sm font-medium ${selectedTheme.colors.text} mb-1`}>Hero Image URL</label>
                              <input
                                type="url"
                                value={portfolio.hero_image_url || ''}
                                onChange={(e) => handleFieldChange('hero_image_url', e.target.value)}
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                              />
                            </div>
                          </div>
                        )}

                        {key === 'about' && (
                          <div className="space-y-3">
                            <div>
                              <label className={`block text-sm font-medium ${selectedTheme.colors.text} mb-1`}>About Title</label>
                              <input
                                type="text"
                                value={portfolio.about_title || ''}
                                onChange={(e) => handleFieldChange('about_title', e.target.value)}
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                              />
                            </div>
                            <div>
                              <label className={`block text-sm font-medium ${selectedTheme.colors.text} mb-1`}>About Text</label>
                              <textarea
                                value={portfolio.about_text || ''}
                                onChange={(e) => handleFieldChange('about_text', e.target.value)}
                                rows={4}
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm resize-none"
                              />
                            </div>
                            <div>
                              <label className={`block text-sm font-medium ${selectedTheme.colors.text} mb-1`}>Profile Photo URL</label>
                              <input
                                type="url"
                                value={portfolio.profile_photo_url || ''}
                                onChange={(e) => handleFieldChange('profile_photo_url', e.target.value)}
                                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                              />
                            </div>
                          </div>
                        )}

                        {/* Add other sections as needed */}
                        {key !== 'hero' && key !== 'about' && (
                          <div className="text-sm text-gray-400">
                            {sectionConfig.defaultName} section editor - use full editor for complete functionality
                          </div>
                        )}
                      </div>
                    </section>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="w-1/2 bg-white flex flex-col">
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <div className="flex items-center space-x-4">
                <h3 className="text-lg font-semibold text-gray-900">Live Preview</h3>
                <span className="text-xs text-gray-500">Theme: {selectedTheme.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  onClick={() => window.open(`/portfolio/${portfolio.slug}`, "_blank")} 
                  variant="outline" 
                  size="sm"
                >
                  <ExternalLink className="mr-1 h-3 w-3" /> Open Full
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <iframe
                id="side-preview-iframe"
                src={`/portfolio/${portfolio.slug}?preview=true&t=${Date.now()}`}
                className="w-full h-full border-0"
                title="Portfolio Preview"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioEditorPage; 