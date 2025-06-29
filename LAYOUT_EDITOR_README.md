# Portfolio Layout Editor

## Overview

The Portfolio Layout Editor is a powerful drag-and-drop interface that allows users to customize the layout of their portfolio sections. Similar to website builders like Wix, Squarespace, and Webflow, users can:

- **Drag and drop** sections to reposition them
- **Resize sections** by dragging the corners
- **Toggle between grid and freeform modes**
- **Snap to grid** for precise alignment
- **Lock/unlock sections** to prevent accidental changes
- **Show/hide sections** for layout experimentation
- **Customize grid size** (6, 12, 16, or 24 columns)

## Features

### 🎯 Grid Mode
- **12-column grid system** by default (configurable)
- **Snap-to-grid** functionality for precise alignment
- **Visual grid overlay** to guide positioning
- **Responsive grid cells** that adapt to container width

### 🎨 Freeform Mode
- **Unrestricted positioning** for creative layouts
- **Pixel-perfect placement** without grid constraints
- **Smooth dragging** with real-time preview

### 🔧 Section Controls
- **Lock/Unlock**: Prevent accidental movement of sections
- **Show/Hide**: Temporarily hide sections during layout work
- **Visual feedback**: Selected sections show purple border
- **Hover controls**: Section controls appear on hover

### 💾 Auto-Save
- **Real-time saving** with 2-second debounce
- **Visual status indicators** (Saving/Saved/Error)
- **Persistent layout data** stored in database

## Technical Implementation

### Database Schema
```sql
-- Added to user_portfolios table
ALTER TABLE user_portfolios 
ADD COLUMN layout_config JSONB DEFAULT NULL;

-- Index for performance
CREATE INDEX idx_user_portfolios_layout_config ON user_portfolios USING GIN (layout_config);
```

### Layout Data Structure
```typescript
interface LayoutData {
  [sectionKey: string]: {
    x: number;           // X position
    y: number;           // Y position  
    width: number;       // Section width
    height: number;      // Section height
    visible: boolean;    // Section visibility
    locked: boolean;     // Section lock state
  };
}
```

### Components

#### `PortfolioLayoutPage` (`/app/dashboard/portfolio/[id]/layout/page.tsx`)
- Main layout editor page
- Handles data fetching and saving
- Manages layout state and auto-save

#### `PortfolioLayoutToolbar` (`/components/portfolio/PortfolioLayoutToolbar.tsx`)
- Grid mode toggle (Grid/Freeform)
- Grid size selector (6, 12, 16, 24 columns)
- Show/hide grid toggle
- Snap-to-grid toggle
- Advanced controls panel

#### `PortfolioLayoutEditor` (`/components/portfolio/PortfolioLayoutEditor.tsx`)
- Drag-and-drop interface using `react-rnd`
- Grid rendering and snapping logic
- Section preview rendering
- Section controls (lock, hide, resize)

## Usage

### Accessing the Layout Editor
1. **From Dashboard**: Click "Layout" button on any portfolio card
2. **From Editor**: Click "Layout" button in the navigation bar
3. **Direct URL**: `/dashboard/portfolio/{id}/layout`

### Basic Workflow
1. **Enable sections** in the main editor first
2. **Switch to Layout Editor** using the Layout button
3. **Choose layout mode** (Grid or Freeform)
4. **Drag sections** to reposition them
5. **Resize sections** by dragging corners
6. **Lock sections** to prevent accidental changes
7. **Save automatically** or use manual save button

### Grid Mode Tips
- **12-column grid** is recommended for most layouts
- **Snap-to-grid** ensures clean alignment
- **Grid overlay** helps visualize spacing
- **Section widths** should be multiples of grid columns

### Freeform Mode Tips
- **Unrestricted positioning** for creative layouts
- **Pixel-perfect control** over section placement
- **No grid constraints** for organic layouts
- **Use for artistic portfolios** or unique designs

## Integration with Existing System

### Section Compatibility
The layout editor works with all existing portfolio sections:
- Hero
- About
- Tracks
- Gallery
- Press & Media
- Key Projects
- Testimonials
- Contact
- Skills
- Hobbies
- Resume

### Theme Integration
- **Theme-aware previews** with proper colors
- **Responsive design** that adapts to theme settings
- **Visual consistency** with main editor

### Preview Integration
- **Layout changes** are reflected in preview mode
- **Real-time updates** when switching between editors
- **Consistent rendering** across all views

## Future Enhancements

### Planned Features
- **Section templates** for common layouts
- **Undo/Redo functionality**
- **Layout presets** for quick setup
- **Advanced snapping** (snap to other sections)
- **Section grouping** for complex layouts
- **Mobile layout editor** for responsive design

### Technical Improvements
- **Performance optimization** for large portfolios
- **Better touch support** for mobile devices
- **Keyboard shortcuts** for power users
- **Layout validation** to prevent conflicts
- **Export/Import layouts** for sharing

## Dependencies

- **react-rnd**: Drag-and-drop functionality
- **lucide-react**: Icons
- **@chakra-ui/react**: UI components (Switch)
- **use-debounce**: Auto-save functionality

## Browser Support

- **Chrome/Edge**: Full support
- **Firefox**: Full support  
- **Safari**: Full support
- **Mobile browsers**: Basic support (touch events)

## Performance Considerations

- **Debounced auto-save** (2-second delay)
- **Optimized re-renders** with React.memo
- **Efficient grid calculations** with useCallback
- **Lazy loading** of section previews
- **Database indexing** for fast queries 