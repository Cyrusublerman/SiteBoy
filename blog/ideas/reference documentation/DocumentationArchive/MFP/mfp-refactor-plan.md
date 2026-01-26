# Multifilament Print Tool - Refactoring Plan

## Current State
- **Single monolithic file**: 200KB, 4892 lines
- **Violations**: Direct DOM manipulation, inline styles, no module separation
- **Location**: `assets/js/tools/fabrication/multifilament-print-tool.js`

## Target Architecture

### File Structure
```
assets/js/tools/fabrication/multifilament-print/
├── MFP-Main.js              [CREATED] - Entry point, tab coordination
├── MFP-Constants.js         [CREATED] - Shared constants, defaults
├── MFP-Source.js            [TODO] - SOURCE tab (grid generation)
├── MFP-Scan.js              [TODO] - SCAN tab (analysis, alignment)
├── MFP-Quantize.js          [TODO] - QUANTIZE tab (image processing)
├── MFP-Export.js            [TODO] - EXPORT tab (STL generation)
├── MFP-ProjectIO.js         [TODO] - Import/export ZIP projects
├── MFP-GridRenderer.js      [TODO] - Canvas drawing for grids
├── MFP-ScanRenderer.js      [TODO] - Canvas drawing for scan overlay
└── MFP-Utils.js             [TODO] - Shared utilities
```

### Module Responsibilities

#### MFP-Main.js ✅
- Initialize ToolBase
- Coordinate tab switching
- Manage shared state
- Delegate events to tab modules
- **NO DOM manipulation**
- **NO inline styles**

#### MFP-Source.js [TODO]
**Exports**: `MFPSourceTab` class
**Responsibilities**:
- Sidebar definition using ComponentLibrary
- Grid generation logic
- Filament selection
- Export grid as PNG/CSV/STL
- **Uses**: algorithms/combinatorics, algorithms/layout

#### MFP-Scan.js [TODO]
**Exports**: `MFPScanTab` class
**Responsibilities**:
- Scan image upload
- Grid overlay alignment (corner-based transform)
- Canvas interaction (drag corners/body)
- Analysis execution (pixel sampling)
- Visual analysis view (popup window)
- **Uses**: algorithms/color, MFP-ScanRenderer

#### MFP-Quantize.js [TODO]
**Exports**: `MFPQuantizeTab` class
**Responsibilities**:
- Source image upload
- Quantization with calibrated palette
- Preview quantized result
- **Uses**: algorithms/color/quantization

#### MFP-Export.js [TODO]
**Exports**: `MFPExportTab` class
**Responsibilities**:
- Complete project ZIP export
- STL file generation
- Canvas mode switching
- **Uses**: algorithms/geometry/stl-generation, MFP-ProjectIO

#### MFP-ProjectIO.js [TODO]
**Exports**: Helper functions
**Functions**:
- `importProject(file)` - Parse ZIP, detect version, migrate
- `exportProject(data)` - Generate complete ZIP with scans
- `parseFilename(name)` - Extract metadata from filename
- `migrateProject(data, fromVersion)` - Version migration
- **Uses**: algorithms/export, JSZip (dynamic import)

#### MFP-GridRenderer.js [TODO]
**Exports**: Helper functions
**Functions**:
- `drawCalibrationGrid(ctx, canvas, gridData)` - Detailed grid
- `drawGridStats(ctx, canvas, gridData)` - Stats overlay
- `drawConstraintBounds(ctx, canvas, constraints)` - Bed/scan bounds
- **NO DOM manipulation** - pure canvas only

#### MFP-ScanRenderer.js [TODO]
**Exports**: Helper functions
**Functions**:
- `drawScanOverlay(ctx, corners, gridData, options)` - Grid overlay with transform
- `drawCornerHandles(ctx, corners)` - Drag handles
- `isPointInQuad(x, y, corners)` - Hit testing
- `findCornerUnderMouse(x, y, corners, radius)` - Corner detection
- **NO DOM manipulation** - pure canvas only

#### MFP-Utils.js [TODO]
**Exports**: Helper functions
**Functions**:
- `generateSequenceMap(sequences, colours)` - Build lookup
- `rgbToBrightness(r, g, b)` - Color sorting
- `rgbToHue(r, g, b)` - Color sorting
- `lerp(a, b, t)` - Linear interpolation
- `lerp2D(p0, p1, t)` - 2D interpolation

### Shared State Pattern
```javascript
// Passed to all tab modules
sharedState = {
    // Grid
    selectedFilaments: [],
    gridData: null,
    sequences: null,
    sequenceMap: null,
    
    // Scan
    referenceGridData: null,
    gridCalculated: null,
    gridAlignment: { corners: [...], ... },
    scanImageElement: null,
    scanAnalysis: null,
    quantizationConfig: null,
    
    // Quantize
    sourceImageElement: null,
    quantizedImage: null,
    
    // Import
    importedState: null
}
```

### ComponentLibrary Usage
All tabs MUST use ComponentLibrary for UI:
```javascript
// ✅ CORRECT
getSidebar() {
    return [['CONTROLS', [
        ['FILAMENT SELECTION', [
            ['multi-select', 'Filaments', FILAMENT_COLOURS.map(f => f.n), { 
                key: 'filaments',
                minSelection: 2,
                maxSelection: 10
            }]
        ]]
    ]]];
}

// ❌ FORBIDDEN
getSidebar() {
    const div = document.createElement('div'); // NEVER!
    div.innerHTML = '<select>...</select>';    // NEVER!
}
```

### Canvas Rendering Pattern
All drawing MUST go through ToolBase canvas:
```javascript
// ✅ CORRECT
onDraw(ctx, canvas, values) {
    // Pure canvas operations
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Delegate to renderer modules
    drawCalibrationGrid(ctx, canvas, this.state.gridData);
}

// ❌ FORBIDDEN
onDraw(ctx, canvas, values) {
    const overlay = document.createElement('div'); // NEVER!
    canvas.parentElement.appendChild(overlay);     // NEVER!
}
```

### Migration Steps

#### Phase 1: Infrastructure ✅
- [x] Create folder structure
- [x] Create MFP-Main.js (coordinator)
- [x] Create MFP-Constants.js (shared data)

#### Phase 2: Renderers [NEXT]
- [ ] Create MFP-GridRenderer.js (extract grid drawing)
- [ ] Create MFP-ScanRenderer.js (extract scan overlay)
- [ ] Create MFP-Utils.js (extract helpers)

#### Phase 3: Tab Modules
- [ ] Create MFP-Source.js (migrate SOURCE tab logic)
- [ ] Create MFP-Scan.js (migrate SCAN tab logic)
- [ ] Create MFP-Quantize.js (migrate QUANTIZE tab logic)
- [ ] Create MFP-Export.js (migrate EXPORT tab logic)

#### Phase 4: Project I/O
- [ ] Create MFP-ProjectIO.js (extract ZIP handling)
- [ ] Test import/export with scan data

#### Phase 5: Integration
- [ ] Update section registration to use MFP-Main
- [ ] Test all workflows (generate → scan → quantize → export)
- [ ] Verify no DOM violations
- [ ] Delete old monolithic file

#### Phase 6: Optimization
- [ ] Add lazy loading for heavy imports (JSZip)
- [ ] Add RAF throttling for canvas updates
- [ ] Profile performance

## Architecture Rules Compliance

### ✅ Must Follow
1. **NO `document.*` outside BaseComponent/foundation**
2. **NO `.innerHTML`, `.appendChild`, `.createElement`**
3. **NO inline styles** (`element.style.*`)
4. **NO manual RAF/setInterval for animations** (use AnimationFoundation)
5. **All UI via ComponentLibrary**
6. **All colors via VGA palette** (var(--vga-*) or VGA_PALETTE array)
7. **All dimensions via F-system** (calc(var(--f) * N))
8. **All routing via router.js**
9. **Import only what's needed** (tree-shakeable)

### ✅ Current Violations to Fix
- [x] Direct DOM manipulation for project status bar
- [x] Direct DOM manipulation for analysis view
- [x] Inline styles for button state (filter: invert)
- [ ] Canvas operations mixed with business logic
- [ ] No module boundaries

## Testing Checklist
After migration:
- [ ] Generate calibration grid (2-10 filaments)
- [ ] Import old project ZIP (v1.0.0, v1.0.5, v1.1.0)
- [ ] Upload scan image → auto-align
- [ ] Drag grid corners → skew/resize
- [ ] Drag grid body → move
- [ ] Analyze scan → loading state
- [ ] View analysis → popup with sorting
- [ ] Export complete project → ZIP with scans
- [ ] Quantize image → use calibrated palette
- [ ] Export STL → multi-color files
- [ ] No console errors
- [ ] No linter errors

## Migration Priority
**Critical path**: Scan tab (most complex, most violations)
**Order**: Renderers → Scan → Source → Export → Quantize → ProjectIO

## Estimated Effort
- Renderers: 2 files, ~400 lines
- Tab modules: 4 files, ~2500 lines
- ProjectIO: 1 file, ~800 lines
- Utils: 1 file, ~200 lines
- Testing/integration: ~1000 lines
**Total**: ~4900 lines (same as current, but properly modularized)

## Next Immediate Action
Create MFP-ScanRenderer.js and MFP-GridRenderer.js to extract canvas logic.

