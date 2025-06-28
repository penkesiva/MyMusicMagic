"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { List, ChevronDown } from "lucide-react";
import { SECTIONS_CONFIG } from "@/lib/sections";
import { Portfolio } from "@/types/portfolio";
import { DndContext, closestCenter, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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
}

// Sortable Section Item component
type SortableSectionItemProps = {
  id: string;
  name: string;
  enabled: boolean;
  onToggle: (e: React.ChangeEvent<HTMLInputElement>) => void;
  dragHandleProps: React.HTMLAttributes<HTMLSpanElement>;
  onNameEdit?: () => void;
};

function SortableSectionItem({ id, name, enabled, onToggle, dragHandleProps, onNameEdit }: SortableSectionItemProps) {
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
  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      <span {...listeners} {...dragHandleProps} style={{ marginRight: 8, cursor: 'grab', color: '#aaa' }}>
        <List size={16} />
      </span>
      <span style={{ flex: 1, fontWeight: enabled ? 500 : 400, color: enabled ? '#fff' : '#888' }}>{name}</span>
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
  theme
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