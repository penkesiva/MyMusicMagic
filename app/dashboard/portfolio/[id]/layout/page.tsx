"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft, Save, Eye, ExternalLink, Grid, Move, Maximize2, Minimize2, RotateCcw, Settings, Palette, Layout
} from "lucide-react";
import { Portfolio } from "@/types/portfolio";
import { SECTIONS_CONFIG } from "@/lib/sections";
import { THEMES } from "@/lib/themes";
import PortfolioLayoutEditor from "@/components/portfolio/PortfolioLayoutEditor";
import PortfolioLayoutToolbar from "@/components/portfolio/PortfolioLayoutToolbar";

const PortfolioLayoutPage = () => {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [portfolio, setPortfolio] = useState<Portfolio | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [savingStatus, setSavingStatus] = useState("saved");
  const [isSaving, setIsSaving] = useState(false);
  
  // Layout editor state
  const [gridSize, setGridSize] = useState(16);
  const [gridColumns, setGridColumns] = useState(48);
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [layoutMode, setLayoutMode] = useState<'grid' | 'freeform'>('grid');
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [layoutData, setLayoutData] = useState<any>({});

  const gridSizeOptions = [
    { value: 6, label: '6 columns' },
    { value: 12, label: '12 columns' },
    { value: 16, label: '16 columns' },
    { value: 24, label: '24 columns' },
    { value: 48, label: '48 columns' }
  ];

  // Layout action handlers
  const handleMaximizeAll = useCallback(() => {
    if (!portfolio) return;
    
    const containerWidth = 1200; // Approximate container width
    const maxHeight = 200; // Maximum height for sections
    
    const updatedLayout = { ...layoutData };
    Object.keys(updatedLayout).forEach(sectionKey => {
      updatedLayout[sectionKey] = {
        ...updatedLayout[sectionKey],
        x: 0,
        y: Object.keys(updatedLayout).indexOf(sectionKey) * (maxHeight + 20),
        width: containerWidth,
        height: maxHeight,
        visible: true,
        locked: false
      };
    });
    
    setLayoutData(updatedLayout);
  }, [layoutData, portfolio]);

  const handleMinimizeAll = useCallback(() => {
    if (!portfolio) return;
    
    const minWidth = 200;
    const minHeight = 100;
    
    const updatedLayout = { ...layoutData };
    Object.keys(updatedLayout).forEach(sectionKey => {
      updatedLayout[sectionKey] = {
        ...updatedLayout[sectionKey],
        x: Object.keys(updatedLayout).indexOf(sectionKey) * (minWidth + 20),
        y: 0,
        width: minWidth,
        height: minHeight,
        visible: true,
        locked: false
      };
    });
    
    setLayoutData(updatedLayout);
  }, [layoutData, portfolio]);

  const handleResetLayout = useCallback(() => {
    if (!portfolio) return;
    
    // Create intelligent default layout based on enabled sections and content
    const defaultLayout: any = {};
    if (portfolio.sections_config) {
      // Get enabled sections sorted by their current order
      const enabledSections = Object.keys(portfolio.sections_config)
        .filter(key => portfolio.sections_config[key]?.enabled)
        .sort((a, b) => {
          const orderA = portfolio.sections_config[a]?.order ?? SECTIONS_CONFIG[a]?.defaultOrder ?? 999;
          const orderB = portfolio.sections_config[b]?.order ?? SECTIONS_CONFIG[b]?.defaultOrder ?? 999;
          return orderA - orderB;
        });

      // Calculate layout based on section order and content
      enabledSections.forEach((sectionKey, index) => {
        const sectionConfig = SECTIONS_CONFIG[sectionKey];
        const sectionData = portfolio.sections_config[sectionKey];
        
        // Determine section size based on content and type
        let sectionWidth = 48; // Full width by default (48 columns)
        let sectionHeight = 1; // Default height
        
        // Adjust size based on section type and content
        switch (sectionKey) {
          case 'hero':
            sectionWidth = 48;
            sectionHeight = 2; // Hero sections are typically taller
            break;
          case 'about':
            // Check if about section has content
            if (portfolio.about_text && portfolio.about_text.length > 200) {
              sectionWidth = 48;
              sectionHeight = 1.5;
            } else {
              sectionWidth = 32; // 2/3 of 48 columns
              sectionHeight = 1;
            }
            break;
          case 'tracks':
            // Check number of tracks
            const trackCount = portfolio.tracks?.length || 0;
            if (trackCount > 6) {
              sectionWidth = 48;
              sectionHeight = 2;
            } else if (trackCount > 3) {
              sectionWidth = 48;
              sectionHeight = 1.5;
            } else {
              sectionWidth = 32;
              sectionHeight = 1;
            }
            break;
          case 'gallery':
            // Check number of gallery items
            const galleryCount = portfolio.gallery?.length || 0;
            if (galleryCount > 8) {
              sectionWidth = 48;
              sectionHeight = 2;
            } else if (galleryCount > 4) {
              sectionWidth = 40; // 5/6 of 48 columns
              sectionHeight = 1.5;
            } else {
              sectionWidth = 32;
              sectionHeight = 1;
            }
            break;
          case 'press':
            // Check number of press mentions
            const pressCount = portfolio.press_json?.length || 0;
            if (pressCount > 6) {
              sectionWidth = 48;
              sectionHeight = 1.5;
            } else {
              sectionWidth = 32;
              sectionHeight = 1;
            }
            break;
          case 'key_projects':
            // Check number of key projects
            const projectsCount = portfolio.key_projects_json?.length || 0;
            if (projectsCount > 4) {
              sectionWidth = 48;
              sectionHeight = 1.5;
            } else {
              sectionWidth = 32;
              sectionHeight = 1;
            }
            break;
          case 'testimonials':
            // Check number of testimonials
            const testimonialsCount = portfolio.testimonials_json?.length || 0;
            if (testimonialsCount > 3) {
              sectionWidth = 48;
              sectionHeight = 1.5;
            } else {
              sectionWidth = 32;
              sectionHeight = 1;
            }
            break;
          case 'contact':
            sectionWidth = 24; // Half of 48 columns
            sectionHeight = 1;
            break;
          case 'skills':
            // Check number of skills
            const skillsCount = portfolio.skills_json?.length || 0;
            if (skillsCount > 8) {
              sectionWidth = 48;
              sectionHeight = 1.5;
            } else {
              sectionWidth = 32;
              sectionHeight = 1;
            }
            break;
          case 'hobbies':
            // Check number of hobbies
            const hobbiesCount = portfolio.hobbies_json?.length || 0;
            if (hobbiesCount > 6) {
              sectionWidth = 40;
              sectionHeight = 1.5;
            } else {
              sectionWidth = 32;
              sectionHeight = 1;
            }
            break;
          case 'resume':
            sectionWidth = 24; // Half of 48 columns
            sectionHeight = 1;
            break;
          default:
            sectionWidth = 32;
            sectionHeight = 1;
            break;
        }

        // Calculate position based on previous sections
        let yPosition = 0;
        for (let i = 0; i < index; i++) {
          const prevSection = enabledSections[i];
          const prevLayout = defaultLayout[prevSection];
          if (prevLayout) {
            yPosition += prevLayout.height + 0.5; // Add some spacing between sections
          }
        }

        defaultLayout[sectionKey] = {
          x: 0,
          y: yPosition,
          width: sectionWidth,
          height: sectionHeight,
          visible: true,
          locked: false
        };
      });
    }
    
    setLayoutData(defaultLayout);
  }, [portfolio]);

  const handleToggleSectionLock = useCallback((sectionKey: string) => {
    setLayoutData((prev: any) => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        locked: !prev[sectionKey]?.locked
      }
    }));
  }, []);

  const handleToggleSectionVisibility = useCallback((sectionKey: string) => {
    setLayoutData((prev: any) => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        visible: !prev[sectionKey]?.visible
      }
    }));
  }, []);

  // Fetch portfolio data
  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        setLoading(true);
        const supabase = createClient();

        const { data: portfolioData, error: portfolioError } = await supabase
          .from('user_portfolios')
          .select('*')
          .eq('id', id)
          .single();

        if (portfolioError || !portfolioData) {
          console.error('Portfolio not found:', portfolioError);
          router.push('/dashboard');
          return;
        }

        setPortfolio(portfolioData);

        // Get user profile
        const { data: userProfileData } = await supabase
          .from('user_profiles')
          .select('username, full_name')
          .eq('id', portfolioData.user_id)
          .single();

        setUserProfile(userProfileData);

        // Fetch tracks and gallery data for layout calculations
        const [tracksResult, galleryResult] = await Promise.all([
          supabase
            .from('tracks')
            .select('*')
            .eq('portfolio_id', portfolioData.id)
            .order('order', { ascending: true }),
          supabase
            .from('gallery')
            .select('*')
            .eq('portfolio_id', portfolioData.id)
            .order('created_at', { ascending: true })
        ]);

        // Create portfolio object with tracks and gallery data
        const portfolioWithData = {
          ...portfolioData,
          tracks: tracksResult.data || [],
          gallery: galleryResult.data || []
        };

        setPortfolio(portfolioWithData);

        // Initialize layout data from portfolio or create default
        if (portfolioWithData.layout_config) {
          setLayoutData(portfolioWithData.layout_config);
        } else {
          // Create default layout based on enabled sections and their current order
          const defaultLayout: any = {};
          if (portfolioWithData.sections_config) {
            // Get enabled sections sorted by their current order
            const enabledSections = Object.keys(portfolioWithData.sections_config)
              .filter(key => portfolioWithData.sections_config[key]?.enabled)
              .sort((a, b) => {
                const orderA = portfolioWithData.sections_config[a]?.order ?? SECTIONS_CONFIG[a]?.defaultOrder ?? 999;
                const orderB = portfolioWithData.sections_config[b]?.order ?? SECTIONS_CONFIG[b]?.defaultOrder ?? 999;
                return orderA - orderB;
              });

            // Calculate layout based on section order and content
            enabledSections.forEach((sectionKey, index) => {
              const sectionConfig = SECTIONS_CONFIG[sectionKey];
              const sectionData = portfolioWithData.sections_config[sectionKey];
              
              // Determine section size based on content and type
              let sectionWidth = 48; // Full width by default (48 columns)
              let sectionHeight = 1; // Default height
              
              // Adjust size based on section type and content
              switch (sectionKey) {
                case 'hero':
                  sectionWidth = 48;
                  sectionHeight = 2; // Hero sections are typically taller
                  break;
                case 'about':
                  // Check if about section has content
                  if (portfolioWithData.about_text && portfolioWithData.about_text.length > 200) {
                    sectionWidth = 48;
                    sectionHeight = 1.5;
                  } else {
                    sectionWidth = 32; // 2/3 of 48 columns
                    sectionHeight = 1;
                  }
                  break;
                case 'tracks':
                  // Check number of tracks
                  const trackCount = portfolioWithData.tracks?.length || 0;
                  if (trackCount > 6) {
                    sectionWidth = 48;
                    sectionHeight = 2;
                  } else if (trackCount > 3) {
                    sectionWidth = 48;
                    sectionHeight = 1.5;
                  } else {
                    sectionWidth = 32;
                    sectionHeight = 1;
                  }
                  break;
                case 'gallery':
                  // Check number of gallery items
                  const galleryCount = portfolioWithData.gallery?.length || 0;
                  if (galleryCount > 8) {
                    sectionWidth = 48;
                    sectionHeight = 2;
                  } else if (galleryCount > 4) {
                    sectionWidth = 40; // 5/6 of 48 columns
                    sectionHeight = 1.5;
                  } else {
                    sectionWidth = 32;
                    sectionHeight = 1;
                  }
                  break;
                case 'press':
                  // Check number of press mentions
                  const pressCount = portfolioWithData.press_json?.length || 0;
                  if (pressCount > 6) {
                    sectionWidth = 48;
                    sectionHeight = 1.5;
                  } else {
                    sectionWidth = 32;
                    sectionHeight = 1;
                  }
                  break;
                case 'key_projects':
                  // Check number of key projects
                  const projectsCount = portfolioWithData.key_projects_json?.length || 0;
                  if (projectsCount > 4) {
                    sectionWidth = 48;
                    sectionHeight = 1.5;
                  } else {
                    sectionWidth = 32;
                    sectionHeight = 1;
                  }
                  break;
                case 'testimonials':
                  // Check number of testimonials
                  const testimonialsCount = portfolioWithData.testimonials_json?.length || 0;
                  if (testimonialsCount > 3) {
                    sectionWidth = 48;
                    sectionHeight = 1.5;
                  } else {
                    sectionWidth = 32;
                    sectionHeight = 1;
                  }
                  break;
                case 'contact':
                  sectionWidth = 24; // Half of 48 columns
                  sectionHeight = 1;
                  break;
                case 'skills':
                  // Check number of skills
                  const skillsCount = portfolioWithData.skills_json?.length || 0;
                  if (skillsCount > 8) {
                    sectionWidth = 48;
                    sectionHeight = 1.5;
                  } else {
                    sectionWidth = 32;
                    sectionHeight = 1;
                  }
                  break;
                case 'hobbies':
                  // Check number of hobbies
                  const hobbiesCount = portfolioWithData.hobbies_json?.length || 0;
                  if (hobbiesCount > 6) {
                    sectionWidth = 40;
                    sectionHeight = 1.5;
                  } else {
                    sectionWidth = 32;
                    sectionHeight = 1;
                  }
                  break;
                case 'resume':
                  sectionWidth = 24; // Half of 48 columns
                  sectionHeight = 1;
                  break;
                default:
                  sectionWidth = 32;
                  sectionHeight = 1;
                  break;
              }

              // Calculate position based on previous sections
              let yPosition = 0;
              for (let i = 0; i < index; i++) {
                const prevSection = enabledSections[i];
                const prevLayout = defaultLayout[prevSection];
                if (prevLayout) {
                  yPosition += prevLayout.height + 0.5; // Add some spacing between sections
                }
              }

              defaultLayout[sectionKey] = {
                x: 0,
                y: yPosition,
                width: sectionWidth,
                height: sectionHeight,
                visible: true,
                locked: false
              };
            });
          }
          setLayoutData(defaultLayout);
        }

      } catch (error) {
        console.error('Error fetching portfolio:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPortfolio();
    }
  }, [id, router]);

  // Save layout changes
  const handleSaveLayout = useCallback(async () => {
    if (!portfolio) return;

    try {
      setIsSaving(true);
      setSavingStatus("saving");

      const supabase = createClient();
      const { error } = await supabase
        .from('user_portfolios')
        .update({ 
          layout_config: layoutData,
          updated_at: new Date().toISOString()
        })
        .eq('id', portfolio.id);

      if (error) {
        console.error('Error saving layout:', error);
        setSavingStatus("error");
      } else {
        setSavingStatus("saved");
        // Update local portfolio state
        setPortfolio(prev => prev ? { ...prev, layout_config: layoutData } : null);
      }
    } catch (error) {
      console.error('Error saving layout:', error);
      setSavingStatus("error");
    } finally {
      setIsSaving(false);
    }
  }, [portfolio, layoutData]);

  // Auto-save layout changes
  useEffect(() => {
    if (portfolio && Object.keys(layoutData).length > 0) {
      const timeoutId = setTimeout(() => {
        handleSaveLayout();
      }, 2000);

      return () => clearTimeout(timeoutId);
    }
  }, [layoutData, portfolio, handleSaveLayout]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading layout editor...</div>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Portfolio not found</div>
      </div>
    );
  }

  const theme = THEMES.find(t => t.name === portfolio.theme_name) || THEMES[0];

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => router.push(`/dashboard/portfolio/${id}/edit`)}
              variant="ghost"
              size="sm"
              className="text-gray-300 hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Editor
            </Button>
            <div className="flex items-center gap-3">
              <Layout className="h-5 w-5 text-purple-400" />
              <div>
                <h1 className="text-lg font-semibold text-white">Layout Editor</h1>
                <p className="text-sm text-gray-400">{portfolio.name}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span>Status:</span>
              <span className={`px-2 py-1 rounded-full text-xs ${
                savingStatus === 'saving' ? 'bg-yellow-500/20 text-yellow-300' :
                savingStatus === 'saved' ? 'bg-green-500/20 text-green-300' :
                'bg-red-500/20 text-red-300'
              }`}>
                {savingStatus === 'saving' ? 'Saving...' :
                  savingStatus === 'saved' ? 'Saved' : 'Error'}
              </span>
            </div>
            
            <Button
              onClick={handleSaveLayout}
              disabled={isSaving}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Layout'}
            </Button>
            
            <Button
              onClick={() => window.open(`/portfolio/preview/${portfolio.id}`, '_blank')}
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            
            <Button
              onClick={() => window.open(`/portfolio/${userProfile?.username}/${portfolio.slug}`, '_blank')}
              variant="outline"
              size="sm"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Public
            </Button>
          </div>
        </div>
      </header>

      {/* Layout Toolbar */}
      <PortfolioLayoutToolbar
        layoutMode={layoutMode}
        onLayoutModeChange={setLayoutMode}
        gridSize={gridSize}
        gridColumns={gridColumns}
        onGridSizeChange={setGridColumns}
        showGrid={showGrid}
        onShowGridChange={setShowGrid}
        snapToGrid={snapToGrid}
        onSnapToGridChange={setSnapToGrid}
        onMaximizeAll={handleMaximizeAll}
        onMinimizeAll={handleMinimizeAll}
        onResetLayout={handleResetLayout}
        onToggleSectionLock={handleToggleSectionLock}
        onToggleSectionVisibility={handleToggleSectionVisibility}
      />

      {/* Layout Editor */}
      <div className="flex-1 overflow-hidden">
        <PortfolioLayoutEditor
          portfolio={portfolio}
          layoutData={layoutData}
          onLayoutChange={setLayoutData}
          selectedSection={selectedSection}
          onSectionSelect={setSelectedSection}
          gridSize={gridSize}
          gridColumns={gridColumns}
          showGrid={showGrid}
          snapToGrid={snapToGrid}
          layoutMode={layoutMode}
        />
      </div>
    </div>
  );
};

export default PortfolioLayoutPage; 