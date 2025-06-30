"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X, Upload, Trash2, Image as ImageIcon, Award } from "lucide-react";
import { Portfolio } from "@/types/portfolio";

interface Sponsor {
  id: string;
  name: string;
  icon_url: string;
  website_url: string;
  order: number;
}

interface SponsorsFormProps {
  portfolio: Portfolio;
  onFieldChange: (field: keyof Portfolio, value: any) => void;
  theme: any;
}

export default function SponsorsForm({ portfolio, onFieldChange, theme }: SponsorsFormProps) {
  const [uploadingIcons, setUploadingIcons] = useState<Record<string, boolean>>({});

  const sponsors = safeGetArray(portfolio.sponsors_json);

  const handleAddSponsor = () => {
    const newSponsor: Sponsor = {
      id: `sponsor-${Date.now()}`,
      name: '',
      icon_url: '',
      website_url: '',
      order: sponsors.length + 1
    };
    onFieldChange('sponsors_json', [...sponsors, newSponsor]);
  };

  const handleRemoveSponsor = (sponsorId: string) => {
    const updatedSponsors = sponsors.filter((sponsor: Sponsor) => sponsor.id !== sponsorId);
    onFieldChange('sponsors_json', updatedSponsors);
  };

  const handleSponsorChange = (sponsorId: string, field: keyof Sponsor, value: any) => {
    const updatedSponsors = sponsors.map((sponsor: Sponsor) => 
      sponsor.id === sponsorId ? { ...sponsor, [field]: value } : sponsor
    );
    onFieldChange('sponsors_json', updatedSponsors);
  };

  const handleIconUpload = async (file: File, sponsorId: string) => {
    if (!file) return;

    setUploadingIcons(prev => ({ ...prev, [sponsorId]: true }));

    try {
      // Create a simple file upload handler (you can replace this with your actual upload logic)
      const formData = new FormData();
      formData.append('file', file);
      
      // For now, we'll create a mock URL - replace with actual upload
      const mockUrl = URL.createObjectURL(file);
      
      handleSponsorChange(sponsorId, 'icon_url', mockUrl);
    } catch (error) {
      console.error('Error uploading sponsor icon:', error);
      alert('Failed to upload icon. Please try again.');
    } finally {
      setUploadingIcons(prev => ({ ...prev, [sponsorId]: false }));
    }
  };

  const moveSponsor = (sponsorId: string, direction: 'up' | 'down') => {
    const currentIndex = sponsors.findIndex((sponsor: Sponsor) => sponsor.id === sponsorId);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= sponsors.length) return;

    const updatedSponsors = [...sponsors];
    [updatedSponsors[currentIndex], updatedSponsors[newIndex]] = [updatedSponsors[newIndex], updatedSponsors[currentIndex]];
    
    // Update order numbers
    updatedSponsors.forEach((sponsor: Sponsor, index: number) => {
      sponsor.order = index + 1;
    });

    onFieldChange('sponsors_json', updatedSponsors);
  };

  return (
    <div className="space-y-6">
      {/* Add Sponsor Button */}
      <div className="flex justify-between items-center">
        <h3 className={`text-lg font-semibold ${theme.colors.heading}`}>
          Manage Sponsors
        </h3>
        <Button
          onClick={handleAddSponsor}
          variant="outline"
          size="sm"
          className="bg-green-600/20 border-green-500/30 text-green-300 hover:bg-green-600/30"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Sponsor
        </Button>
      </div>

      {/* Sponsors List */}
      <div className="space-y-4">
        {sponsors.map((sponsor: Sponsor, index: number) => (
          <div key={sponsor.id} className="p-4 bg-white/5 rounded-lg border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h4 className={`text-md font-medium ${theme.colors.heading}`}>
                Sponsor {index + 1}
              </h4>
              <div className="flex gap-2">
                <Button
                  onClick={() => moveSponsor(sponsor.id, 'up')}
                  variant="outline"
                  size="sm"
                  disabled={index === 0}
                  className="bg-blue-600/20 border-blue-500/30 text-blue-300 hover:bg-blue-600/30"
                >
                  ↑
                </Button>
                <Button
                  onClick={() => moveSponsor(sponsor.id, 'down')}
                  variant="outline"
                  size="sm"
                  disabled={index === sponsors.length - 1}
                  className="bg-blue-600/20 border-blue-500/30 text-blue-300 hover:bg-blue-600/30"
                >
                  ↓
                </Button>
                <Button
                  onClick={() => handleRemoveSponsor(sponsor.id)}
                  variant="outline"
                  size="sm"
                  className="bg-red-600/20 border-red-500/30 text-red-300 hover:bg-red-600/30"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column: Text Fields */}
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium ${theme.colors.text} mb-2`}>
                    Sponsor Name
                  </label>
                  <Input
                    type="text"
                    value={sponsor.name || ''}
                    onChange={(e) => handleSponsorChange(sponsor.id, 'name', e.target.value)}
                    placeholder="Enter sponsor name"
                    className={`w-full text-sm ${theme.colors.background} ${theme.colors.text} border-transparent focus:ring-2 focus:ring-purple-400`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium ${theme.colors.text} mb-2`}>
                    Website URL
                  </label>
                  <Input
                    type="url"
                    value={sponsor.website_url || ''}
                    onChange={(e) => handleSponsorChange(sponsor.id, 'website_url', e.target.value)}
                    placeholder="https://sponsor-website.com"
                    className={`w-full text-sm ${theme.colors.background} ${theme.colors.text} border-transparent focus:ring-2 focus:ring-purple-400`}
                  />
                </div>
              </div>

              {/* Right Column: Icon Upload */}
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium ${theme.colors.text} mb-2`}>
                    Sponsor Icon
                  </label>
                  {sponsor.icon_url ? (
                    <div className="relative group">
                      <img 
                        src={sponsor.icon_url} 
                        alt={sponsor.name || 'Sponsor'} 
                        className="w-24 h-24 object-contain rounded-lg border border-white/10 bg-white/5" 
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                        <button 
                          onClick={() => handleSponsorChange(sponsor.id, 'icon_url', '')} 
                          className="p-2 bg-red-500/80 text-white rounded-full hover:bg-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-white/20 rounded-lg p-6 text-center">
                      <ImageIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                      <p className={`text-xs ${theme.colors.text} mb-2`}>No icon uploaded</p>
                    </div>
                  )}
                  
                  <div className="flex gap-2 mt-2">
                    <Input
                      type="url"
                      value={sponsor.icon_url || ''}
                      onChange={(e) => handleSponsorChange(sponsor.id, 'icon_url', e.target.value)}
                      placeholder="Paste icon URL"
                      className={`flex-1 text-sm ${theme.colors.background} ${theme.colors.text} border-transparent focus:ring-2 focus:ring-purple-400`}
                    />
                    <input
                      type="file"
                      id={`sponsor-upload-${sponsor.id}`}
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleIconUpload(file, sponsor.id);
                        e.target.value = '';
                      }}
                      className="hidden"
                    />
                    <Button
                      onClick={() => document.getElementById(`sponsor-upload-${sponsor.id}`)?.click()}
                      variant="outline"
                      size="sm"
                      disabled={uploadingIcons[sponsor.id]}
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      {uploadingIcons[sponsor.id] ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {sponsors.length === 0 && (
        <div className="text-center py-8">
          <Award className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className={`text-gray-400 ${theme.colors.text}`}>
            No sponsors added yet. Click "Add Sponsor" to get started.
          </p>
        </div>
      )}
    </div>
  );
}

// Helper function to safely get array
const safeGetArray = (field: any): any[] => {
  if (!field) return [];
  if (Array.isArray(field)) return field;
  if (typeof field === 'string') {
    try {
      const parsed = JSON.parse(field);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}; 