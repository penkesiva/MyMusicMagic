"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { List, ChevronDown, Home, User, Music, Image as ImageIcon, Briefcase, MessageSquare, Newspaper, FileText, Contact, Settings, Heart, Code, Star, Award } from "lucide-react";
import { SECTIONS_CONFIG } from "@/lib/sections";
import { Portfolio } from "@/types/portfolio";
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Section icons mapping for sidebar
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
  return IconComponent ? <IconComponent size={14} /> : <Settings size={14} />;
};

interface PortfolioSectionManagerProps {
  portfolio: Portfolio | null;
  onSectionConfigChange: (
    sectionKey: keyof typeof SECTIONS_CONFIG,
    configKey: "enabled" | "name" | "title",
    value: boolean | string
  ) => void;
  onDragEnd: (event: DragEndEvent) => void;
  sectionOrder: string[];
  theme: any;
  onSectionClick?: (sectionId: string) => void;
}

// Sortable Section Item component
type SortableSectionItemProps = {
  id: string;
  name: string;
  enabled: boolean;
  onToggle: (e: React.ChangeEvent<HTMLInputElement>) => void;
  dragHandleProps: React.HTMLAttributes<HTMLSpanElement>;
  onNameEdit?: () => void;
  onSectionClick?: (sectionId: string) => void;
};

function SortableSectionItem({ id, name, enabled, onToggle, dragHandleProps, onNameEdit, onSectionClick }: SortableSectionItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    background: enabled ? 'rgba(255,255,255,0.04)' : 'transparent',
    borderRadius: 6,
    padding: '4px 8px',
    marginBottom: 4,
    display: 'flex',
    alignItems: 'center',
    fontSize: 14,
    minHeight: 32,
    cursor: 'grab',
  };

  const handleSectionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSectionClick) {
      onSectionClick(id);
    }
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <span {...listeners} {...dragHandleProps} style={{ marginRight: 8, cursor: 'grab', color: '#aaa' }}>
        <List size={16} />
      </span>
      <div 
        style={{ 
          flex: 1, 
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          cursor: 'pointer',
          transition: 'color 0.2s ease'
        }}
        onClick={handleSectionClick}
        onMouseEnter={(e) => {
          if (enabled) {
            e.currentTarget.style.color = '#a855f7';
          }
        }}
        onMouseLeave={(e) => {
          if (enabled) {
            e.currentTarget.style.color = '#fff';
          }
        }}
        title={`Click to scroll to ${name} section`}
      >
        <span style={{ color: enabled ? '#a855f7' : '#666' }}>
          {getSectionIcon(id)}
        </span>
        <span style={{ 
          fontWeight: enabled ? 500 : 400, 
          color: enabled ? '#fff' : '#888'
        }}>
          {name}
        </span>
      </div>
      <Switch
        id={`enable-${id}`}
        isChecked={enabled}
        onChange={onToggle}
        style={{ transform: 'scale(0.8)' }}
      />
    </div>
  );
}

export default function PortfolioSectionManager({
  portfolio,
  onSectionConfigChange,
  onDragEnd,
  sectionOrder,
  theme,
  onSectionClick
}: PortfolioSectionManagerProps) {
  const [sectionsOpen, setSectionsOpen] = useState(true);

  if (!portfolio) return null;

  return (
    <div className="space-y-2">
      <button 
        onClick={() => setSectionsOpen(!sectionsOpen)} 
        className="w-full flex justify-between items-center font-semibold text-sm text-white"
      >
        Sections
        <ChevronDown className={`w-4 h-4 transition-transform ${sectionsOpen ? 'rotate-180' : ''}`} />
      </button>
      {sectionsOpen && (
        <div className="space-y-2">
          <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={sectionOrder} strategy={verticalListSortingStrategy}>
              {sectionOrder.map((key) => {
                const sectionConfig = SECTIONS_CONFIG[key as keyof typeof SECTIONS_CONFIG];
                if (!sectionConfig) return null;
                
                const isEnabled = (portfolio.sections_config as any)?.[key]?.enabled;
                
                return (
                  <SortableSectionItem
                    key={key}
                    id={key}
                    name={sectionConfig.defaultName}
                    enabled={isEnabled}
                    onToggle={(e) => onSectionConfigChange(
                      key as keyof typeof SECTIONS_CONFIG, 
                      'enabled', 
                      e.target.checked
                    )}
                    dragHandleProps={{}}
                    onSectionClick={onSectionClick}
                  />
                );
              })}
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  );
} 