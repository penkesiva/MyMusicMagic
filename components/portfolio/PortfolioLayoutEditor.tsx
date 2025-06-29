"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Move, Maximize2, Minimize2, Lock, Unlock, Eye, EyeOff, GripVertical, CornerDownRight
} from "lucide-react";
import { Portfolio } from "@/types/portfolio";
import { SECTIONS_CONFIG } from "@/lib/sections";
import { Rnd } from "react-rnd";

interface PortfolioLayoutEditorProps {
  portfolio: Portfolio;
  layoutData: any;
  onLayoutChange: (layout: any) => void;
  selectedSection: string | null;
  onSectionSelect: (section: string | null) => void;
  gridSize: number;
  gridColumns: number;
  showGrid: boolean;
  snapToGrid: boolean;
  layoutMode: 'grid' | 'freeform';
}

interface LayoutData {
  [key: string]: {
    x: number;
    y: number;
    width: number;
    height: number;
    visible: boolean;
    locked: boolean;
  };
}

export default function PortfolioLayoutEditor({
  portfolio,
  layoutData,
  onLayoutChange,
  selectedSection,
  onSectionSelect,
  gridSize,
  gridColumns,
  showGrid,
  snapToGrid,
  layoutMode
}: PortfolioLayoutEditorProps) {
  const [dragging, setDragging] = useState(false);
  const [resizing, setResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get enabled sections
  const enabledSections = Object.keys(portfolio.sections_config || {}).filter(
    key => portfolio.sections_config[key]?.enabled
  );

  // Calculate maximum Y position for grid height
  const maxY = Math.max(
    ...Object.values(layoutData).map((section: any) => (section.y || 0) + (section.height || 1)),
    0
  );

  // Calculate grid dimensions
  const gridWidth = gridColumns * gridSize; // Total grid width
  const gridHeight = Math.max(20, Math.ceil(maxY + 2)) * gridSize; // Dynamic height based on content

  // Grid background pattern
  const gridPattern = showGrid ? (
    <defs>
      <pattern
        id="grid"
        width={gridSize}
        height={gridSize}
        patternUnits="userSpaceOnUse"
      >
        <path
          d={`M ${gridSize} 0 L 0 0 0 ${gridSize}`}
          fill="none"
          stroke="rgba(0, 0, 0, 0.1)"
          strokeWidth="1"
        />
      </pattern>
    </defs>
  ) : null;

  // Calculate grid cell size
  const getGridCellSize = useCallback(() => {
    if (!containerRef.current) return { width: 100, height: 100 };
    const containerWidth = containerRef.current.offsetWidth;
    const cellWidth = containerWidth / gridSize;
    return { width: cellWidth, height: 80 }; // Fixed height for grid cells
  }, [gridSize]);

  // Snap position to grid
  const snapToGridPosition = useCallback((x: number, y: number) => {
    if (!snapToGrid || layoutMode !== 'grid') return { x, y };
    
    const { width: cellWidth, height: cellHeight } = getGridCellSize();
    const snappedX = Math.round(x / cellWidth) * cellWidth;
    const snappedY = Math.round(y / cellHeight) * cellHeight;
    
    return { x: snappedX, y: snappedY };
  }, [snapToGrid, layoutMode, getGridCellSize]);

  // Snap size to grid
  const snapToGridSize = useCallback((width: number, height: number) => {
    if (!snapToGrid || layoutMode !== 'grid') return { width, height };
    
    const { width: cellWidth, height: cellHeight } = getGridCellSize();
    const snappedWidth = Math.round(width / cellWidth) * cellWidth;
    const snappedHeight = Math.round(height / cellHeight) * cellHeight;
    
    return { width: snappedWidth, height: snappedHeight };
  }, [snapToGrid, layoutMode, getGridCellSize]);

  // Handle section drag
  const handleDrag = useCallback((sectionKey: string, x: number, y: number) => {
    const snapped = snapToGridPosition(x, y);
    onLayoutChange((prev: LayoutData) => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        x: snapped.x,
        y: snapped.y
      }
    }));
  }, [snapToGridPosition, onLayoutChange]);

  // Handle section resize
  const handleResize = useCallback((sectionKey: string, width: number, height: number) => {
    const snapped = snapToGridSize(width, height);
    onLayoutChange((prev: LayoutData) => ({
      ...prev,
      [sectionKey]: {
        ...prev[sectionKey],
        width: snapped.width,
        height: snapped.height
      }
    }));
  }, [snapToGridSize, onLayoutChange]);

  // Get section position and size
  const getSectionStyle = useCallback((sectionKey: string) => {
    const section = layoutData[sectionKey];
    if (!section) return {};

    if (layoutMode === 'grid') {
      const { width: cellWidth, height: cellHeight } = getGridCellSize();
      return {
        x: section.x || 0,
        y: section.y || 0,
        width: section.width || cellWidth * 12,
        height: section.height || cellHeight
      };
    } else {
      return {
        x: section.x || 0,
        y: section.y || 0,
        width: section.width || 400,
        height: section.height || 200
      };
    }
  }, [layoutData, layoutMode, getGridCellSize]);

  // Render grid background
  const renderGrid = () => {
    if (!showGrid || layoutMode !== 'grid') return null;

    const { width: cellWidth, height: cellHeight } = getGridCellSize();
    const containerWidth = containerRef.current?.offsetWidth || 1200;
    const containerHeight = 2000; // Fixed height for demo

    const gridLines = [];
    
    // Vertical lines
    for (let i = 0; i <= gridSize; i++) {
      gridLines.push(
        <div
          key={`v-${i}`}
          className="absolute bg-gray-700/30"
          style={{
            left: i * cellWidth,
            top: 0,
            width: 1,
            height: containerHeight
          }}
        />
      );
    }

    // Horizontal lines
    for (let i = 0; i <= Math.ceil(containerHeight / cellHeight); i++) {
      gridLines.push(
        <div
          key={`h-${i}`}
          className="absolute bg-gray-700/30"
          style={{
            left: 0,
            top: i * cellHeight,
            width: containerWidth,
            height: 1
          }}
        />
      );
    }

    return gridLines;
  };

  // Render section content preview
  const renderSectionContent = (sectionKey: string) => {
    const sectionConfig = SECTIONS_CONFIG[sectionKey];
    if (!sectionConfig) return null;

    switch (sectionKey) {
      case 'hero':
        return (
          <div className="w-full h-full bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-lg border border-purple-500/30 flex items-center justify-center">
            <div className="text-center">
              <div className="text-lg font-bold text-white mb-2">Hero Section</div>
              <div className="text-sm text-gray-300">{portfolio.hero_title || 'Your Title'}</div>
            </div>
          </div>
        );
      
      case 'about':
        return (
          <div className="w-full h-full bg-gradient-to-br from-blue-600/20 to-cyan-600/20 rounded-lg border border-blue-500/30 flex items-center justify-center">
            <div className="text-center">
              <div className="text-lg font-bold text-white mb-2">About Section</div>
              <div className="text-sm text-gray-300">About Me</div>
            </div>
          </div>
        );
      
      case 'tracks':
        return (
          <div className="w-full h-full bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-lg border border-green-500/30 flex items-center justify-center">
            <div className="text-center">
              <div className="text-lg font-bold text-white mb-2">Tracks Section</div>
              <div className="text-sm text-gray-300">Music Tracks</div>
            </div>
          </div>
        );
      
      case 'gallery':
        return (
          <div className="w-full h-full bg-gradient-to-br from-orange-600/20 to-red-600/20 rounded-lg border border-orange-500/30 flex items-center justify-center">
            <div className="text-center">
              <div className="text-lg font-bold text-white mb-2">Gallery Section</div>
              <div className="text-sm text-gray-300">Photo Gallery</div>
            </div>
          </div>
        );
      
      case 'press':
        return (
          <div className="w-full h-full bg-gradient-to-br from-indigo-600/20 to-purple-600/20 rounded-lg border border-indigo-500/30 flex items-center justify-center">
            <div className="text-center">
              <div className="text-lg font-bold text-white mb-2">Press Section</div>
              <div className="text-sm text-gray-300">Press & Media</div>
            </div>
          </div>
        );
      
      case 'contact':
        return (
          <div className="w-full h-full bg-gradient-to-br from-teal-600/20 to-green-600/20 rounded-lg border border-teal-500/30 flex items-center justify-center">
            <div className="text-center">
              <div className="text-lg font-bold text-white mb-2">Contact Section</div>
              <div className="text-sm text-gray-300">Get In Touch</div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="w-full h-full bg-gradient-to-br from-gray-600/20 to-gray-700/20 rounded-lg border border-gray-500/30 flex items-center justify-center">
            <div className="text-center">
              <div className="text-lg font-bold text-white mb-2">{sectionConfig.defaultName}</div>
              <div className="text-sm text-gray-300">{sectionKey}</div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="relative w-full h-full overflow-auto bg-gray-900">
      {/* Grid Background */}
      <div 
        ref={containerRef}
        className="relative w-full min-h-[2000px] bg-gray-900"
        style={{ padding: '20px' }}
      >
        {renderGrid()}

        {/* Sections */}
        {enabledSections.map(sectionKey => {
          const sectionConfig = SECTIONS_CONFIG[sectionKey];
          if (!sectionConfig) return null;

          const section = layoutData[sectionKey];
          if (!section || !section.visible) return null;

          const isSelected = selectedSection === sectionKey;
          const style = getSectionStyle(sectionKey);

          return (
            <Rnd
              key={sectionKey}
              size={{
                width: section.width * gridSize,
                height: section.height * gridSize
              }}
              position={{
                x: section.x * gridSize,
                y: section.y * gridSize
              }}
              onDragStop={(e, d) => {
                const newX = snapToGrid ? Math.round(d.x / gridSize) : d.x / gridSize;
                const newY = snapToGrid ? Math.round(d.y / gridSize) : d.y / gridSize;
                
                const updatedLayout = {
                  ...layoutData,
                  [sectionKey]: {
                    ...section,
                    x: Math.max(0, Math.min(gridColumns - section.width, newX)),
                    y: Math.max(0, newY)
                  }
                };
                onLayoutChange(updatedLayout);
              }}
              onResizeStop={(e, direction, ref, delta, position) => {
                const newWidth = snapToGrid 
                  ? Math.round(ref.offsetWidth / gridSize) 
                  : ref.offsetWidth / gridSize;
                const newHeight = snapToGrid 
                  ? Math.round(ref.offsetHeight / gridSize) 
                  : ref.offsetHeight / gridSize;
                const newX = snapToGrid 
                  ? Math.round(position.x / gridSize) 
                  : position.x / gridSize;
                const newY = snapToGrid 
                  ? Math.round(position.y / gridSize) 
                  : position.y / gridSize;
                
                const updatedLayout = {
                  ...layoutData,
                  [sectionKey]: {
                    ...section,
                    width: Math.max(1, Math.min(gridColumns - newX, newWidth)),
                    height: Math.max(1, newHeight),
                    x: Math.max(0, Math.min(gridColumns - newWidth, newX)),
                    y: Math.max(0, newY)
                  }
                };
                onLayoutChange(updatedLayout);
              }}
              minWidth={gridSize}
              minHeight={gridSize}
              maxWidth={gridColumns * gridSize}
              maxHeight={gridHeight}
              bounds="parent"
              grid={snapToGrid ? [gridSize, gridSize] : [1, 1]}
              enableResizing={{
                top: true,
                right: true,
                bottom: true,
                left: true,
                topRight: true,
                bottomRight: true,
                bottomLeft: true,
                topLeft: true
              }}
              disableDragging={section.locked}
              className={`section-rnd ${isSelected ? 'selected' : ''} ${!section.visible ? 'hidden' : ''}`}
              onClick={() => onSectionSelect(sectionKey)}
            >
              <div className={`w-full h-full relative group ${isSelected ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-gray-900' : ''}`}>
                {/* Section Content */}
                {renderSectionContent(sectionKey)}
                
                {/* Section Controls */}
                <div className={`absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${isSelected ? 'opacity-100' : ''}`}>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 bg-gray-800/80 hover:bg-gray-700/80 text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      onLayoutChange((prev: LayoutData) => ({
                        ...prev,
                        [sectionKey]: {
                          ...prev[sectionKey],
                          locked: !prev[sectionKey].locked
                        }
                      }));
                    }}
                  >
                    {section.locked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 bg-gray-800/80 hover:bg-gray-700/80 text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      onLayoutChange((prev: LayoutData) => ({
                        ...prev,
                        [sectionKey]: {
                          ...prev[sectionKey],
                          visible: !prev[sectionKey].visible
                        }
                      }));
                    }}
                  >
                    {section.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                  </Button>
                </div>

                {/* Section Label */}
                <div className="absolute bottom-2 left-2 bg-gray-800/80 text-white text-xs px-2 py-1 rounded">
                  {sectionConfig.defaultName}
                </div>

                {/* Resize Handle */}
                {!section.locked && (
                  <div className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize flex items-center justify-center">
                    <CornerDownRight className="w-3 h-3 text-gray-400" />
                  </div>
                )}
              </div>
            </Rnd>
          );
        })}
      </div>

      {/* Instructions Overlay */}
      {enabledSections.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-gray-400">
            <div className="text-xl font-semibold mb-2">No sections enabled</div>
            <div className="text-sm">Enable sections in the main editor to start customizing your layout</div>
          </div>
        </div>
      )}
    </div>
  );
} 