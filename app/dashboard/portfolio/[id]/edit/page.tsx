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
import { Eye, PlusCircle, Trash2, Edit } from "lucide-react";
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
      <aside className="w-[300px] bg-gray-950 text-white p-6 flex flex-col gap-8 overflow-y-auto border-r border-gray-800">
        <div>
          <h2 className="text-xl font-bold">Portfolio Settings</h2>
          <p className="text-sm text-gray-400">
            Manage your portfolio's appearance and sections.
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="font-semibold">Color Theme</h3>
          <div className="grid grid-cols-5 gap-3">
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

        <div className="space-y-4">
          <h3 className="font-semibold">Sections</h3>
          {sortedEditorSections.map((key) => (
            <div key={key} className="flex items-center justify-between">
              <Label htmlFor={`enable-${key}`} className="font-medium text-white">
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
      <main className={`flex-1 overflow-y-auto p-8 sm:p-12 ${selectedTheme.colors.background} ${selectedTheme.colors.text}`}>
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-white/80">Editing: {portfolio.name}</h1>
            <div className="flex items-center space-x-4">
                 <span className={`text-sm font-medium px-3 py-1 rounded-full transition-colors ${
                    savingStatus === "saved" ? "bg-green-900/50 text-green-300" :
                    savingStatus === "saving" ? "bg-yellow-900/50 text-yellow-300 animate-pulse" :
                    "bg-red-900/50 text-red-300"
                }`}>
                    {savingStatus === 'saving' ? 'Saving...' : savingStatus === 'error' ? 'Error' : 'Saved'}
                </span>
                <Button onClick={() => window.open(`/portfolio/${portfolio.slug}`, "_blank")} variant="outline" size="sm">
                    <Eye className="mr-2 h-4 w-4" /> Preview
                </Button>
            </div>
        </div>

        <div className="max-w-4xl mx-auto space-y-16">
            {sortedEditorSections.filter(key => (portfolio.sections_config as any)?.[key]?.enabled).map(key => {
                const sectionConfig = SECTIONS_CONFIG[key];
                if (!sectionConfig) return null;
                
                return (
                    <section key={key} id={key}>
                        <h2 className={`text-3xl font-bold mb-6 border-b-2 pb-2 ${selectedTheme.colors.heading} border-white/10`}>
                           <EditableField value={(portfolio.sections_config as any)?.[key]?.name} onSave={(newValue) => handleSectionConfigChange(key as any, "name", newValue)} theme={selectedTheme} />
                        </h2>
                        
                        {key === 'hero' && (
                            <div className="text-center py-10">
                                <h1 className={`text-5xl font-extrabold ${selectedTheme.colors.heading}`}>
                                    <EditableField value={portfolio.name} onSave={(newValue) => handleFieldChange('name', newValue)} theme={selectedTheme} />
                                </h1>
                                <p className={`mt-4 text-xl ${selectedTheme.colors.primaryStrong}`}>
                                    <EditableField value={portfolio.subtitle || ''} onSave={(newValue) => handleFieldChange('subtitle', newValue)} theme={selectedTheme} />
                                </p>
                            </div>
                        )}

                        {key === 'about' && (
                            <div>
                                <h3 className={`text-2xl font-bold ${selectedTheme.colors.heading}`}>
                                     <EditableField value={portfolio.about_title || ''} onSave={(newValue) => handleFieldChange('about_title', newValue)} theme={selectedTheme} />
                                </h3>
                                <div className={`mt-4 prose prose-invert max-w-none ${selectedTheme.colors.text}`}>
                                     <EditableField value={portfolio.about_text || ''} onSave={(newValue) => handleFieldChange('about_text', newValue)} fieldType="textarea" theme={selectedTheme} />
                                </div>
                            </div>
                        )}
                        
                        {key === 'testimonials' && <div><p className="text-gray-400">Testimonials editor coming soon.</p></div>}
                        {key === 'blog' && <div><p className="text-gray-400">Blog editor coming soon.</p></div>}
                        
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

                        {key === 'social_links' && <div><p className="text-gray-400">Social links editor coming soon.</p></div>}
                        {key === 'news' && <div><p className="text-gray-400">News editor coming soon.</p></div>}
                        {key === 'skills' && <div><p className="text-gray-400">Skills editor coming soon.</p></div>}
                        {key === 'status' && <div><p className="text-gray-400">Status editor coming soon.</p></div>}
                        {key === 'ai_advantage' && <div><p className="text-gray-400">AI advantage editor coming soon.</p></div>}
                        
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
    </div>
  );
};

export default PortfolioEditorPage; 