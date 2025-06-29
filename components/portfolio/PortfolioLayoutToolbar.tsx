"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Grid, Move, Settings, Palette, Maximize2, Minimize2, RotateCcw, Lock, Unlock, Eye, EyeOff
} from "lucide-react";
import { SECTIONS_CONFIG } from "@/lib/sections";

interface PortfolioLayoutToolbarProps {
  layoutMode: 'grid' | 'freeform';
  onLayoutModeChange: (mode: 'grid' | 'freeform') => void;
  gridSize: number;
  gridColumns: number;
  onGridSizeChange: (columns: number) => void;
  showGrid: boolean;
  onShowGridChange: (show: boolean) => void;
  snapToGrid: boolean;
  onSnapToGridChange: (snap: boolean) => void;
  onMaximizeAll: () => void;
  onMinimizeAll: () => void;
  onResetLayout: () => void;
  onToggleSectionLock: (sectionKey: string) => void;
  onToggleSectionVisibility: (sectionKey: string) => void;
}

export default function PortfolioLayoutToolbar({
  layoutMode,
  onLayoutModeChange,
  gridSize,
  gridColumns,
  onGridSizeChange,
  showGrid,
  onShowGridChange,
  snapToGrid,
  onSnapToGridChange,
  onMaximizeAll,
  onMinimizeAll,
  onResetLayout,
  onToggleSectionLock,
  onToggleSectionVisibility
}: PortfolioLayoutToolbarProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="bg-gray-800 border-b border-gray-700 px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Left side - Layout controls */}
        <div className="flex items-center gap-4">
          {/* Layout Mode Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-300">Mode:</span>
            <div className="flex bg-gray-700 rounded-lg p-1">
              <Button
                onClick={() => onLayoutModeChange('grid')}
                variant={layoutMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                className={`h-8 px-3 text-xs ${
                  layoutMode === 'grid' 
                    ? 'bg-purple-600 text-white' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                <Grid className="h-3 w-3 mr-1" />
                Grid
              </Button>
              <Button
                onClick={() => onLayoutModeChange('freeform')}
                variant={layoutMode === 'freeform' ? 'default' : 'ghost'}
                size="sm"
                className={`h-8 px-3 text-xs ${
                  layoutMode === 'freeform' 
                    ? 'bg-purple-600 text-white' 
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                <Move className="h-3 w-3 mr-1" />
                Freeform
              </Button>
            </div>
          </div>

          {/* Grid Size Selector */}
          {layoutMode === 'grid' && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-300">Grid:</span>
              <select
                value={gridSize}
                onChange={(e) => onGridSizeChange(Number(e.target.value))}
                className="bg-gray-700 border border-gray-600 text-white text-sm rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value={6}>6 columns</option>
                <option value={12}>12 columns</option>
                <option value={16}>16 columns</option>
                <option value={24}>24 columns</option>
              </select>
            </div>
          )}

          {/* Grid Visibility Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-300">Show Grid:</span>
            <Switch
              isChecked={showGrid}
              onChange={(e) => onShowGridChange(e.target.checked)}
              colorScheme="purple"
            />
          </div>

          {/* Snap to Grid Toggle */}
          {layoutMode === 'grid' && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-300">Snap:</span>
              <Switch
                isChecked={snapToGrid}
                onChange={(e) => onSnapToGridChange(e.target.checked)}
                colorScheme="purple"
              />
            </div>
          )}
        </div>

        {/* Right side - Advanced controls and section info */}
        <div className="flex items-center gap-4">
          {/* Advanced Controls Toggle */}
          <Button
            onClick={() => setShowAdvanced(!showAdvanced)}
            variant="ghost"
            size="sm"
            className="text-gray-300 hover:text-white"
          >
            <Settings className="h-4 w-4 mr-2" />
            Advanced
          </Button>
        </div>
      </div>

      {/* Advanced Controls Panel */}
      {showAdvanced && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="flex items-center gap-6">
            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-300">Quick Actions:</span>
              <Button
                onClick={onMaximizeAll}
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-gray-700 text-xs"
              >
                <Maximize2 className="h-3 w-3 mr-1" />
                Maximize All
              </Button>
              <Button
                onClick={onMinimizeAll}
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-gray-700 text-xs"
              >
                <Minimize2 className="h-3 w-3 mr-1" />
                Minimize All
              </Button>
              <Button
                onClick={onResetLayout}
                variant="outline"
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-gray-700 text-xs"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset Layout
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 