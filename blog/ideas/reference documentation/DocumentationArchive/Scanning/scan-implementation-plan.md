# Scan Tab Implementation Plan

## Overview
Complete implementation of the SCAN tab for calibrating printer color output by analyzing scanned calibration grids.

## Core Problems to Solve

### 1. Resolution/Aspect Ratio Mismatch
**Problem**: Scan resolution != print resolution, aspect ratio may differ
**Solution**: Interactive transform overlay (drag, resize, rotate, skew?)

### 2. Edge Contamination
**Problem**: Tile edges may have bleeding, poor adhesion, scanner artifacts
**Solution**: Adjustable "dead zone" inset from tile edges

### 3. Grid Configuration Persistence
**Problem**: Need to resume analysis sessions
**Solution**: Import/export grid CSV with full configuration

### 4. Tile-to-Sequence Matching
**Problem**: Extract correct RGB from correct tile position
**Solution**: Transform-aware sampling with dead zones

### 5. Sequence Library Organization
**Problem**: Need to find similar colors for optimization
**Solution**: Group by RGB similarity, provide search/filter

---

## Data Structures

### Grid Configuration (imported from CSV)
```javascript
{
    sequences: [[1,2,0,0], [2,1,0,0], ...],  // All tile sequences
    colours: [{h:'#FF0000', n:'Red'}, ...],   // Selected filaments
    rows: 10,
    cols: 8,
    tileSize: 10,  // mm
    gap: 1,        // mm
    width: 88,     // total mm
    height: 110,   // total mm
    layerCount: 4,
    baseLayers: 3,
    emptyCells: [0, 5, 12]  // indices of empty tiles
}
```

### Scan Transform State
```javascript
{
    offsetX: 0,      // px
    offsetY: 0,      // px
    scaleX: 1.0,     // scale factor
    scaleY: 1.0,     // scale factor
    rotation: 0,     // degrees (future)
    deadZone: 0.15   // 15% inset from each edge
}
```

### Sequence Library (output of analysis)
```javascript
[
    {
        rgb: {r: 145, g: 187, b: 98},      // Measured average
        hex: '#91BB62',
        sequence: [1, 2, 0, 0],
        filaments: ['Cyan', 'Yellow'],
        gridPosition: {row: 3, col: 5, index: 29},
        sampleCount: 245,                  // pixels sampled
        variance: 12.3                     // color variance (quality metric)
    },
    // ... one per tile
]
```

---

## UI Components

### Canvas Modes
1. **Scan Only** - show raw scan
2. **Overlay Mode** - scan + draggable grid overlay
3. **Analysis Preview** - show dead zones and sample areas
4. **Comparison** - side-by-side expected vs measured

### Interactive Overlay Controls
- **Drag**: Move entire overlay
- **Resize**: Corner/edge handles
- **Rotate**: Corner rotation handles (optional)
- **Dead Zone**: Visualize inset area with semi-transparent overlay

### Sidebar Controls
```
GRID CONFIGURATION
  [Import Grid CSV]
  ✓ Grid: 10×8, 78 tiles, 4 layers
  
SCAN ALIGNMENT
  [Upload Scan Image]
  
  Transform
    Offset X: [slider] 0 px
    Offset Y: [slider] 0 px
    Scale: [slider] 1.00x
    Lock Aspect: [✓]
  
  Sampling
    Dead Zone: [slider] 15%
    Min Sample Size: [number] 100 px
  
ANALYSIS
  [Analyze Colors]
  Status: Analyzed 78/78 tiles
  Average Variance: 8.2
  
EXPORT
  [Export Sequence Library (JSON)]
  [Export Palette (GPL)]
  [Export Comparison CSV]

VISUALIZATION
  View Mode: [Overlay | Analysis | Comparison]
  Show Dead Zones: [✓]
  Show Grid Lines: [✓]
  Highlight Tile: [dropdown] or click canvas
```

---

## Implementation Steps

### Phase 1: Grid Import (scan-1)
1. Add "Import Grid CSV" button
2. Parse CSV to reconstruct grid configuration
3. Store in `this.gridConfig`
4. Update status label

### Phase 2: Interactive Overlay (scan-2)
1. Implement draggable overlay rendering
2. Add mouse handlers (down, move, up)
3. Add resize handles (8 corners/edges)
4. Update transform state
5. Redraw overlay on every interaction

### Phase 3: Dead Zone Visualization (scan-3)
1. Add dead zone slider (0-50%)
2. Calculate inset rectangles for each tile
3. Render analysis preview mode showing:
   - Green: sample area
   - Red: dead zone
   - Gray: gaps

### Phase 4: Color Extraction (scan-4)
1. Create algorithm module: `image/color-extraction.js`
   - `extractTileColor(imageData, tileRect, deadZone)`
   - Returns: `{avgRGB, sampleCount, variance}`
2. Implement pixel averaging in safe zone
3. Calculate variance as quality metric

### Phase 5: Build Sequence Library (scan-5)
1. For each tile in grid:
   - Calculate transformed tile bounds
   - Extract color with dead zone
   - Match to sequence from grid config
   - Build library entry
2. Store in `this.sequenceLibrary`
3. Update status with progress

### Phase 6: Library Organization (scan-6)
1. Sort library by:
   - RGB distance from reference (e.g., white)
   - Hue angle
   - Luminance
   - Sequence complexity
2. Group similar colors (ΔE < threshold)
3. Provide search/filter UI

### Phase 7: Comparison View (scan-7)
1. Implement split-screen canvas
2. Left: Scan with overlay
3. Right: Rendered grid with expected colors
4. Synchronized zoom/pan
5. Click tile to highlight both sides

### Phase 8: Export Library (scan-8)
1. JSON export with full library
2. GPL palette export (measured colors only)
3. Comparison CSV (expected vs measured)

---

## Algorithm Modules to Create

### `image/color-extraction.js`
```javascript
/**
 * Extract average color from tile area with dead zone
 * @param {ImageData} imageData - Scan image
 * @param {Object} rect - {x, y, width, height} in image pixels
 * @param {number} deadZone - Inset percentage (0-0.5)
 * @returns {Object} {rgb, sampleCount, variance}
 */
export function extractTileColor(imageData, rect, deadZone) {
    // Calculate inset bounds
    // Sample all pixels in safe zone
    // Compute average RGB
    // Compute variance (quality metric)
}

/**
 * Transform grid coordinates to scan coordinates
 * @param {Object} gridPoint - {x, y} in mm
 * @param {Object} transform - {offsetX, offsetY, scaleX, scaleY, rotation}
 * @returns {Object} {x, y} in scan pixels
 */
export function transformGridToScan(gridPoint, transform) {
    // Apply scale, rotation, offset
}
```

### `color/color-distance.js` (extend existing)
```javascript
/**
 * Group colors by similarity threshold
 * @param {Array} colors - [{rgb, ...}, ...]
 * @param {number} threshold - ΔE2000 threshold
 * @returns {Array<Array>} Grouped color arrays
 */
export function groupBySimilarity(colors, threshold) {
    // Cluster colors using ΔE2000 distance
}
```

---

## User Workflow

1. **SOURCE Tab**: Generate and print calibration grid
2. **Scan physically**: Use scanner/camera
3. **SCAN Tab**:
   a. Import Grid CSV (restores configuration)
   b. Upload scan image
   c. Switch to "Overlay" view mode
   d. Drag/resize overlay to align with scan
   e. Adjust dead zone slider (preview in "Analysis" mode)
   f. Click "Analyze Colors"
   g. Review results in "Comparison" mode
   h. Export Sequence Library (JSON) for QUANTIZE tab
   i. Export Comparison CSV for analysis
4. **QUANTIZE Tab**: Use calibrated library
5. **EXPORT Tab**: Generate final STLs

---

## Technical Considerations

### Canvas Interaction Architecture
- Mouse handlers in tool file (UI, not algorithm)
- Transform calculations in algorithm module
- Separation: UI state vs mathematical transforms

### Dead Zone Calculation
```
Given tile at (x, y) with size (w, h) and deadZone d:
  safeX = x + w * d
  safeY = y + h * d
  safeW = w * (1 - 2*d)
  safeH = h * (1 - 2*d)
```

### Color Averaging
- Use arithmetic mean for RGB (not gamma-correct)
- Match quantization algorithm's color space
- Calculate standard deviation for variance

### Transform Math
```
scanX = gridX * scaleX + offsetX
scanY = gridY * scaleY + offsetY

// With rotation (future):
scanX = gridX * cos(θ) - gridY * sin(θ) * scaleX + offsetX
scanY = gridX * sin(θ) + gridY * cos(θ) * scaleY + offsetY
```

---

## Future Enhancements

1. **Auto-alignment**: Use computer vision to detect grid automatically
2. **Rotation support**: For skewed scans
3. **Perspective correction**: For camera photos (not flat scans)
4. **Multi-scan averaging**: Average multiple scans for better accuracy
5. **Outlier detection**: Flag tiles with high variance
6. **Color space conversion**: Analyze in LAB space instead of RGB
7. **Interactive library editor**: Manually adjust/remove bad samples

---

## Success Criteria

- [x] Can import grid configuration from CSV
- [x] Can upload and display scan image
- [x] Can interactively align overlay with drag/resize
- [x] Can adjust and visualize dead zones
- [x] Can extract average RGB from each tile
- [x] Can build complete sequence library
- [x] Can export library for use in QUANTIZE tab
- [x] Can view side-by-side comparison
- [x] Results persist across browser refresh (via JSON export/import)

