# Multifilament Print Tool - Missing Features Analysis

## Current Status
✅ Top-level tabs working (SOURCE, SCAN, QUANTIZE, EXPORT)
✅ Grid generation algorithm working
✅ Basic grid visualization working
✅ Export buttons present

## Missing Critical Features

### 1. Filament Picker (SOURCE Tab)
**Status**: ❌ NOT IMPLEMENTED

**Required**:
- Color swatch grid showing 72 predefined filament colors
- Search bar to filter colors by name
- Selected colors row (2-10 filaments)
- Click to add/remove colors
- Visual feedback for selected colors

**Location**: `lib/core/constants.js` has 72 colors
**UI**: Needs to be first section in SOURCE sidebar

### 2. Layer Visualizations (SOURCE Tab)
**Status**: ❌ NOT IMPLEMENTED

**Required**:
#### Z-Config Visualization (Side View)
- Shows layer stack from bottom to top
- Each layer colored by selected filament
- Shows base layers (white)
- Updates when parameters change

#### XY-Config Visualization (Top-Down View)
- Shows grid layout preview
- Tile arrangement
- Updates when tile size/gap changes

### 3. Interactive Grid Canvas
**Status**: ⚠️ PARTIAL - Missing interactivity

**Required**:
- Click on any tile to show sequence popup
- Zoom controls (+/−/Reset)
- Pan/drag support
- Hover tooltip showing tile index

### 4. Sequence Popup
**Status**: ❌ NOT IMPLEMENTED

**Required**:
- Shows when clicking a grid tile
- Displays:
  - RGB color value
  - Layer sequence array [1,2,0,0]
  - Visual layer stack
  - Grid position (row, col, index)

### 5. Enhanced Stats Display
**Status**: ⚠️ PARTIAL - Basic stats in canvas

**Required**:
- Separate stats row below canvas
- Four stat boxes:
  - Sequences count
  - Rows
  - Columns  
  - Size (mm)
- Update in real-time

### 6. Grid Export Options
**Status**: ⚠️ PARTIAL - PNG/STL exist, missing JSON/Import

**Required**:
- ✅ Export Grid PNG (300 DPI)
- ✅ Export Grid STLs (per-filament)
- ❌ Export Grid JSON (config save)
- ❌ Import Grid JSON (config load)
- ❌ Export Reference Image (for scanning)

### 7. Base Layer Configuration
**Status**: ❌ NOT IMPLEMENTED

**Required**:
- Base layers count (0-10)
- Base layer height (mm)
- Base color selection dropdown
- Include in Z-visualization
- Include in STL export

### 8. SCAN Tab Features
**Status**: ❌ NOT IMPLEMENTED

**Required**:
- Scan image upload
- Grid overlay visualization
- Alignment controls (offset X/Y, scale X/Y)
- Auto-align button
- Extract colors button
- Palette strip showing extracted colors
- Click palette swatch to show sequence
- Export palette as GPL
- Metrics display (scanned/unique/duplicates/px per mm)

### 9. QUANTIZE Tab Features
**Status**: ❌ NOT IMPLEMENTED

**Required**:
- Source image upload
- Live preview canvas
- Dithering controls
- Min-detail filtering
- Palette display (from SCAN)
- Before/After comparison
- Processing metrics

### 10. EXPORT Tab Features
**Status**: ⚠️ PARTIAL - UI exists, logic missing

**Required**:
- Canvas mode dropdown (Source/Scan/Grid/Quantized/Layer 0-3)
- Layer-by-layer visualization
- STL export per filament
- JSON config export
- File size estimates
- Download progress

## Implementation Priority

### Phase 1: Complete SOURCE Tab (High Priority)
1. Filament color picker with 72 colors
2. Z-Config visualization
3. XY-Config visualization
4. Interactive grid (click to show sequence)
5. Sequence popup component
6. Enhanced stats row
7. Grid JSON export/import
8. Base layer configuration

### Phase 2: Complete SCAN Tab (High Priority)
1. Scan image upload
2. Grid overlay with alignment
3. Auto-align algorithm
4. Color extraction
5. Palette display with swatches
6. GPL export
7. Metrics display

### Phase 3: Complete QUANTIZE Tab (Medium Priority)
1. Source image upload
2. Quantization with dithering
3. Min-detail filtering
4. Live preview
5. Palette integration from SCAN

### Phase 4: Complete EXPORT Tab (Medium Priority)
1. Layer-by-layer visualization
2. Canvas mode switching
3. Per-filament STL generation
4. Config JSON export
5. File management UI

## Key Algorithms Already Available
✅ `generateSequences()` - Valid sequence generation
✅ `buildSequenceMap()` - RGB to sequence lookup
✅ `calculateGridLayout()` - Grid dimension calculation
✅ `simColour()` - Layer color simulation
✅ `quantizeImage()` - Image quantization
✅ `applyMinDetailFilter()` - Small detail removal
✅ `expandToLayers()` - Sequence to layer maps
✅ `vectorizePixels()` - Pixel to rectangle conversion
✅ `exportArtworkSTLs()` - STL file generation
✅ `extractColors()` - Scan color extraction

## Estimated Completion
- **Current**: ~30% functionality
- **After Phase 1**: ~60% functionality  
- **After Phase 2**: ~80% functionality
- **After Phase 3**: ~90% functionality
- **After Phase 4**: ~100% functionality

## Next Steps
Start with Phase 1, focusing on:
1. Filament picker (most critical missing feature)
2. Z/XY visualizations (essential for understanding)
3. Interactive grid + popup (key UX feature)

