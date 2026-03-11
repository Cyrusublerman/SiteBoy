# Gap & Perimeter Representation in STL Generation

## Summary

**Gaps and perimeter margins are NOT represented in the STL files.** The STL export only includes the actual tile geometry where filament is printed. Gaps and perimeters are empty space (air).

---

## UI Configuration

### Location: SOURCE Tab → "GAP & PERIMETER" Section

```
Toggle:   "Fill Gaps & Perimeter" (on/off)
Dropdown: "Fill Filament" (filament selector)
Caption:  "Fills gaps between tiles AND perimeter margin"
```

### Behavior

- **Toggle ON**: Canvas preview shows gaps + perimeter filled with selected filament color
- **Toggle OFF**: Canvas preview shows gaps + perimeter as dark grey (`#202020`)
- **Important**: This setting ONLY affects the canvas preview—it does NOT affect STL export

---

## Canvas Rendering (Preview Only)

File: `assets/js/tools/fabrication/multifilament-print/MFP-Main.js` (lines 565-591)

```javascript
// Draw perimeter margin
if (perimeterMargin > 0) {
    if (gapFillEnabled) {
        // Fill with selected filament color (PREVIEW ONLY)
        const gapFilamentColor = FILAMENT_COLOURS.find(f => f.n === gapFilamentName);
        ctx.fillStyle = gapFilamentColor.h;
        ctx.fillRect(/* perimeter areas */);
    } else {
        // Fill with dark grey (visual indication of empty space)
        ctx.fillStyle = '#202020';
        ctx.fillRect(/* perimeter areas */);
    }
}

// Gap rendering (between tiles)
if (gapFillEnabled) {
    // Draw gaps with selected filament color
    ctx.fillStyle = gapHex;
    ctx.fillRect(x, y, gap, tileSize); // Horizontal gaps
    ctx.fillRect(x, y, tileSize, gap); // Vertical gaps
}
```

**Key Point**: This is purely visual—it helps you preview what the print will look like, but it doesn't change the 3D geometry.

---

## STL Generation (Actual 3D Model)

### Architecture

```
MFP-SourceActions.exportGridSTL()
  ↓
exportArtworkSTLs(layerMaps, filamentNames, config)  // stl-generation.js
  ↓
_createGridLayerMaps(grid)  // Converts sequences → layer maps
  ↓
vectorizePixels()  // Merges adjacent pixels → rectangles
  ↓
generateBox()  // Creates 3D box geometry for each rectangle
```

### Step 1: Create Layer Maps

File: `MFP-SourceActions.js:928-949`

```javascript
_createGridLayerMaps(grid) {
    // layerMaps[layerIdx][filamentIdx] = Set of "col,row" coordinates
    const layerMaps = Array(numLayers).fill().map(() => 
        Array(colours.length).fill().map(() => new Set())
    );
    
    sequences.forEach((seq, idx) => {
        if (grid.emptyCells.includes(idx)) return;  // Skip empty tiles
        
        const row = Math.floor(idx / cols);
        const col = idx % cols;
        
        seq.forEach((filamentIdx, layerIdx) => {
            if (filamentIdx > 0) {  // 0 = no filament (gap/air)
                layerMaps[layerIdx][filamentIdx - 1].add(`${col},${row}`);
            }
        });
    });
    
    return layerMaps;
}
```

**Critical Logic**:
- Each tile is 1 "pixel" in the layer map
- Only tiles with `filamentIdx > 0` are included
- Gaps (between tiles) and perimeter (border) are **not represented as pixels**
- Empty cells are explicitly skipped

### Step 2: Vectorize Pixels → Rectangles

File: `stl-generation.js:30-81`

```javascript
vectorizePixels(pixelSet, width, height) {
    // Converts Set("x,y") → [{x, y, w, h}]
    // Merges adjacent tiles into larger rectangles for optimization
}
```

Example:
```
Input:  Set(['0,0', '1,0', '2,0'])  // 3 tiles in a row
Output: [{x: 0, y: 0, w: 3, h: 1}] // 1 merged rectangle
```

### Step 3: Generate Box Geometry

File: `stl-generation.js:111-197`

```javascript
generateBox(x0, y0, z0, x1, y1, z1) {
    // Creates 12 triangular facets (6 faces × 2 triangles per face)
    // Each box represents a tile or merged group of tiles
}
```

### Step 4: Export Per-Filament STLs

File: `stl-generation.js:243-287`

```javascript
exportArtworkSTLs(layerMaps, filamentNames, config) {
    const { imageWidth, imageHeight, printWidth, layerHeight } = config;
    
    // imageWidth = grid.cols (number of tiles horizontally)
    // imageHeight = grid.rows (number of tiles vertically)
    // printWidth = grid.width (physical width INCLUDING gaps + perimeter)
    
    const pixelSize = printWidth / imageWidth;  // Size per tile in mm
    
    for (let fi = 0; fi < filamentCount; fi++) {
        for (let li = 0; li < layerMaps.length; li++) {
            const rectangles = vectorizePixels(layerMaps[li][fi], imageWidth, imageHeight);
            
            for (let rect of rectangles) {
                const x0 = rect.x * pixelSize;  // Tile position in mm
                const y0 = rect.y * pixelSize;
                const x1 = (rect.x + rect.w) * pixelSize;
                const y1 = (rect.y + rect.h) * pixelSize;
                
                // Generate 3D box for this rectangle
                facets += generateBox(x0, y0, z0, x1, y1, z1);
            }
        }
    }
}
```

---

## The Key Insight: `pixelSize` Calculation

```javascript
const pixelSize = printWidth / imageWidth;
```

Where:
- `printWidth = grid.width` (total physical width)
- `imageWidth = grid.cols` (number of tiles)
- `grid.width = (cols × tileSize) + ((cols - 1) × gap) + (2 × perimeterMargin)`

### Example Calculation

**Grid Settings:**
- 10×10 tiles
- 10mm tile size
- 1mm gap
- 5mm perimeter margin

**Calculation:**
```
grid.width = (10 × 10) + (9 × 1) + (2 × 5) = 100 + 9 + 10 = 119mm
imageWidth = 10 cols
pixelSize = 119mm / 10 = 11.9mm per "pixel"
```

**Result:**
- Each tile (1 "pixel") is positioned at 11.9mm intervals
- But each tile's STL box is still only 10mm × 10mm
- The extra 1.9mm per tile accounts for gaps (1mm) + distributed perimeter (0.9mm per tile)
- **This creates physical gaps in the STL model**

---

## Visual Comparison

### What You See in Canvas Preview

```
┌─────────────────────────────────────┐ ← Perimeter (5mm, filled if enabled)
│ ┌───┬─┬───┬─┬───┬─┬───┬─┬───┐      │
│ │ T │ │ T │ │ T │ │ T │ │ T │      │ T = Tile (10mm)
│ ├───┼─┼───┼─┼───┼─┼───┼─┼───┤      │ Gap (1mm, filled if enabled)
│ │ T │ │ T │ │ T │ │ T │ │ T │      │
│ └───┴─┴───┴─┴───┴─┴───┴─┴───┘      │
└─────────────────────────────────────┘
```

### What the STL Actually Contains

```
┌─────────────────────────────────────┐ ← No geometry (air)
│ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐      │
│ │ T │ │ T │ │ T │ │ T │ │ T │      │ T = 3D box geometry
│ ├───┤ ├───┤ ├───┤ ├───┤ ├───┤      │ Gaps = no geometry (air)
│ │ T │ │ T │ │ T │ │ T │ │ T │      │
│ └───┘ └───┘ └───┘ └───┘ └───┘      │
└─────────────────────────────────────┘
   ↑                                   ↑
   No geometry                         No geometry
```

---

## Why This Design?

### Physical Printing Benefits

1. **Easier Manual Assembly**: Physical gaps make it easier to cut/separate individual tiles after printing
2. **Reduced Warping**: Smaller individual tiles warp less than one large continuous surface
3. **Calibration Purpose**: Each tile is physically independent for accurate color measurement
4. **Material Efficiency**: Don't waste filament on structural gaps that aren't part of the test

### Slicer Handling

The slicer (PrusaSlicer, Cura, etc.) will:
1. Import the STL (only contains tile geometry)
2. Add perimeter/wall passes around each tile
3. Add infill inside each tile
4. Generate support (if needed) in the gap areas
5. **Leave gaps as empty space** (no extrusion moves)

---

## Configuration Summary

| Setting | Canvas Preview | STL Export | Physical Print |
|---------|----------------|------------|----------------|
| Tile Size (10mm) | Shows 10mm tiles | 10mm boxes | 10mm tiles |
| Gap (1mm) | Shows 1mm spacing | No geometry | 1mm air gap |
| Perimeter (5mm) | Shows 5mm border | No geometry | 5mm empty border |
| Gap Fill Toggle | Changes preview color | **No effect** | No geometry |
| Gap Fill Filament | Changes preview color | **No effect** | No geometry |

---

## Future Enhancement Possibility

If you wanted to **actually print** the gaps/perimeter with filament:

### Option 1: Modify `_createGridLayerMaps`
```javascript
// Add gap/perimeter pixels to layer map
for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
        // Add gap pixels between tiles
        if (col < cols - 1) {
            // Add vertical gap pixels
        }
        if (row < rows - 1) {
            // Add horizontal gap pixels
        }
    }
}

// Add perimeter border pixels
for (let side of ['top', 'bottom', 'left', 'right']) {
    // Add perimeter pixels
}
```

### Option 2: Generate Separate STL
Export a separate `grid-frame.stl` file containing only gaps + perimeter geometry, using a different filament.

**Current Implementation**: Neither option is implemented—gaps/perimeter are structural voids only.

---

## Data Flow Diagram

```
UI Settings
│
├─ tileSize, gap, perimeterMargin
│  │
│  ├─ Canvas Rendering (_drawGrid)
│  │  ├─ Visual preview with gap fill colors
│  │  └─ Shows perimeter as filled/unfilled
│  │
│  └─ Grid Layout Calculation
│     └─ grid.width = (cols × tileSize) + (gaps) + (perimeter)
│
└─ sequences[] (which filament on which layer)
   │
   └─ _createGridLayerMaps()
      └─ layerMaps[layer][filament] = Set("col,row")
         │
         └─ exportArtworkSTLs()
            └─ pixelSize = grid.width / grid.cols
               └─ STL boxes positioned at pixelSize intervals
                  └─ But each box is only tileSize × tileSize
                     └─ **Physical gaps created automatically**
```

---

## Conclusion

**Gaps and perimeter margins are architectural voids, not 3D geometry.**

- **Canvas**: Visual preview tool—shows what the final print will *look like*
- **STL**: Only contains tile geometry—gaps/perimeter are *absent* (air)
- **Print**: Slicer respects the physical spacing—gaps/perimeter remain *empty*

The "Fill Gaps & Perimeter" toggle is purely cosmetic for preview purposes. It helps you visualize the print, but doesn't change the 3D model or print behavior.

