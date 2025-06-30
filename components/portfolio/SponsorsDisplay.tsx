"use client";

import { ExternalLink } from "lucide-react";
import { Portfolio } from "@/types/portfolio";

interface Sponsor {
  id: string;
  name: string;
  icon_url: string;
  website_url: string;
  order: number;
}

interface SponsorsDisplayProps {
  portfolio: Portfolio;
  theme: any;
}

export default function SponsorsDisplay({ portfolio, theme }: SponsorsDisplayProps) {
  const sponsors = safeGetArray(portfolio.sponsors_json);
  
  if (!sponsors || sponsors.length === 0) {
    return null;
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${theme.colors.heading}`}>
            {portfolio.sponsors_title || 'Sponsors & Partners'}
          </h2>
        </div>

        {/* Sponsors Grid */}
        <div className="flex flex-wrap justify-center items-center gap-8">
          {sponsors.map((sponsor: Sponsor) => (
            <div 
              key={sponsor.id} 
              className={`group relative p-4 rounded-lg border transition-all duration-300 hover:shadow-lg ${theme.colors.card} ${theme.colors.cardBorder} hover:scale-105`}
            >
              {/* Sponsor Icon */}
              <div className="flex justify-center mb-3">
                {sponsor.icon_url ? (
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-white/5 border border-white/10 flex items-center justify-center">
                    <img 
                      src={sponsor.icon_url} 
                      alt={sponsor.name} 
                      className="w-full h-full object-contain p-2"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <div className={`hidden w-full h-full flex items-center justify-center ${theme.colors.text}`}>
                      <span className="text-xl font-bold">{sponsor.name.charAt(0).toUpperCase()}</span>
                    </div>
                  </div>
                ) : (
                  <div className={`w-16 h-16 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center ${theme.colors.text}`}>
                    <span className="text-xl font-bold">{sponsor.name.charAt(0).toUpperCase()}</span>
                  </div>
                )}
              </div>

              {/* Sponsor Name */}
              <h4 className={`text-sm font-semibold text-center ${theme.colors.heading}`}>
                {sponsor.name}
              </h4>
            </div>
          ))}
        </div>
      </div>
    </section>
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