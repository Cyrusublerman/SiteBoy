# Gap & Perimeter Fill in STL Export

## Overview

The "Fill Gaps & Perimeter" feature creates **actual 3D geometry** for gaps and perimeter when enabled, rather than leaving empty space.

---

## How It Works

### UI Controls (SOURCE Tab → "GAP & PERIMETER")

```
Toggle:   "Fill Gaps & Perimeter" (on/off)
Dropdown: "Fill Filament" (which filament to use)
```

### STL Export Behavior

**Fill DISABLED** (default):
- Gaps = empty space (no geometry)
- Perimeter = empty space (no geometry)
- Only tile geometry is exported

**Fill ENABLED**:
- Gaps = solid geometry using selected filament
- Perimeter = solid geometry using selected filament  
- Gap/perimeter geometry added to the selected filament's STL file

---

## Implementation Details

### Configuration Passed to STL Generator

File: `MFP-SourceActions.js:617-637`

```javascript
const gapFillEnabled = values.gapFillOptions && values.gapFillOptions.includes('Fill Gaps');
const gapFilamentName = gapFillEnabled ? (values.gapFilament || 'Jade White') : null;

const stls = exportArtworkSTLs(
    this._createGridLayerMaps(grid),
    grid.colours.map(c => c.n),
    {
        // ... other config ...
        isGrid: true,
        tileSize: grid.tileSize,
        gap: grid.gap,
        perimeterMargin: grid.perimeterMargin || 0,
        // Gap fill settings
        gapFillEnabled: gapFillEnabled,
        gapFilamentName: gapFilamentName,
        baseLayers: grid.baseLayers
    }
);
```

### STL Generation Logic

File: `stl-generation.js:243-323`

```javascript
export function exportArtworkSTLs(layerMaps, filamentNames, config) {
    // ... tile geometry generation ...
    
    // Add gap/perimeter fill geometry if enabled
    if (isGrid && gapFillEnabled && gapFilamentName && filamentNames[fi] === gapFilamentName) {
        filamentFacets += generateGapAndPerimeterGeometry(
            imageWidth, imageHeight, tileSize, gap, perimeterMargin,
            layerHeight, baseLayers, layerMaps.length
        );
    }
}
```

**Key Logic:**
- Gap/perimeter geometry is only added to the STL file of the selected fill filament
- Geometry is only generated for **base layers** (not variable layers)
- If gap=0 and perimeterMargin=0, no geometry is generated

---

## Gap & Perimeter Geometry Generation

File: `stl-generation.js:325-403`

### Perimeter Border

Creates 4 rectangles around the grid:

```javascript
// Top border
generateBox(0, 0, z0, totalWidth, perimeterMargin, z1);

// Bottom border  
generateBox(0, totalHeight - perimeterMargin, z0, totalWidth, totalHeight, z1);

// Left border
generateBox(0, perimeterMargin, z0, perimeterMargin, totalHeight - perimeterMargin, z1);

// Right border
generateBox(totalWidth - perimeterMargin, perimeterMargin, z0, totalWidth, totalHeight - perimeterMargin, z1);
```

### Horizontal Gaps (Between Rows)

```javascript
for (let row = 0; row < rows - 1; row++) {
    const y0 = perimeterMargin + ((row + 1) * tileSize) + (row * gap);
    const y1 = y0 + gap;
    
    generateBox(perimeterMargin, y0, z0, totalWidth - perimeterMargin, y1, z1);
}
```

### Vertical Gaps (Between Columns)

```javascript
for (let col = 0; col < cols - 1; col++) {
    const x0 = perimeterMargin + ((col + 1) * tileSize) + (col * gap);
    const x1 = x0 + gap;
    
    generateBox(x0, perimeterMargin, z0, x1, totalHeight - perimeterMargin, z1);
}
```

---

## Example: 3×3 Grid with Gap Fill

### Settings
- Cols/Rows: 3×3
- Tile Size: 10mm
- Gap: 1mm
- Perimeter: 2mm
- Fill Enabled: YES
- Fill Filament: "Jade White"
- Base Layers: 3

### STL Files Generated

**Per-Tile Filaments (e.g., "Red PLA", "Blue PLA", "Yellow PLA"):**
- Contains tile geometry only
- Tiles positioned with gaps/perimeter spacing
- Example tile (0,0): `(2, 2)` to `(12, 12)` = 10×10mm

**Fill Filament ("Jade White"):**
- Contains tile geometry (if any tiles use this filament)
- PLUS gap/perimeter geometry for base layers only:

**Layer 0, 1, 2 (base layers):**
```
Perimeter boxes:
  - Top:    (0, 0) to (36, 2)         = 36×2mm
  - Bottom: (0, 34) to (36, 36)       = 36×2mm
  - Left:   (0, 2) to (2, 34)         = 2×32mm
  - Right:  (34, 2) to (36, 34)       = 2×32mm

Horizontal gap boxes (2 rows of gaps):
  - Gap 1:  (2, 12) to (34, 13)       = 32×1mm
  - Gap 2:  (2, 23) to (34, 24)       = 32×1mm

Vertical gap boxes (2 columns of gaps):
  - Gap 1:  (12, 2) to (13, 34)       = 1×32mm
  - Gap 2:  (23, 2) to (24, 34)       = 1×32mm
```

**Layer 3+ (variable layers):**
- No gap/perimeter geometry (only tiles)

---

## Visual Comparison

### 3×3 Grid, 10mm tiles, 1mm gap, 2mm perimeter

#### Without Fill (gap/perimeter = empty)

```
Top View:
┌──┬──────┬─┬──────┬─┬──────┬──┐
│  │TILE  │ │TILE  │ │TILE  │  │  ← 2mm perimeter (empty)
│  │      │ │      │ │      │  │
├──┼──────┼─┼──────┼─┼──────┼──┤
│  │      │ │      │ │      │  │  ← 1mm gaps (empty)
└──┴──────┴─┴──────┴─┴──────┴──┘

STL files:
  - Red_PLA.stl:    Tiles only
  - Blue_PLA.stl:   Tiles only
  - Yellow_PLA.stl: Tiles only
```

#### With Fill (gap/perimeter = solid geometry)

```
Top View (base layers):
┌────────────────────────────────┐
│████████████████████████████████│  ← 2mm perimeter (SOLID)
│██┌──────┬─┬──────┬─┬──────┐██│
│██│TILE  │█│TILE  │█│TILE  │██│  ← 1mm gaps (SOLID)
│██│      │█│      │█│      │██│
│██├──────┼─┼──────┼─┼──────┤██│
│██│      │█│      │█│      │██│
│██└──────┴─┴──────┴─┴──────┘██│
│████████████████████████████████│
└────────────────────────────────┘

STL files:
  - Red_PLA.stl:    Tiles only
  - Blue_PLA.stl:   Tiles only  
  - Yellow_PLA.stl: Tiles only
  - Jade_White.stl: Tiles + gaps + perimeter (base layers)
```

---

## Layer Distribution

### Base Layers (layers 0 to baseLayers-1)
- **Tiles:** Standard variable sequences (different colors)
- **Gaps:** Filled with selected filament (if enabled)
- **Perimeter:** Filled with selected filament (if enabled)

**Result:** Base provides structural support + perimeter frame

### Variable Layers (layers baseLayers to layerCount-1)
- **Tiles:** Variable sequences for color mixing
- **Gaps:** Empty (no geometry)
- **Perimeter:** Empty (no geometry)

**Result:** Only the tiles are visible for color calibration

---

## Use Cases

### Fill Enabled (Structural)
**When to use:**
- Need structural integrity (grid won't fall apart)
- Want continuous base platform
- Printing on glass (needs adhesion around entire perimeter)
- Large tiles that might warp without support

**Print behavior:**
- Base layers: solid platform with perimeter frame
- Variable layers: isolated tiles for color testing

### Fill Disabled (Separated)
**When to use:**
- Want physically separated tiles (easy to cut apart)
- Testing individual tile adhesion
- Minimal material usage
- Easy tile removal/inspection

**Print behavior:**
- All layers: independent tiles with air gaps

---

## Physical Example

### 3×3 Grid, Base Layers = 3, Variable Layers = 3

**Layer 0 (base, z=0.00mm):**
```
SOLID PERIMETER + GAPS (fill filament)
┌────────────────────┐
│████████████████████│
│██┌──┬─┬──┬─┬──┐██│
│██│01│█│02│█│03│██│
│██└──┴─┴──┴─┴──┘██│
│████████████████████│
└────────────────────┘
```

**Layer 3 (variable, z=0.24mm):**
```
SEPARATED TILES (no fill)
┌──┬──┬─┬──┬─┬──┬──┐
│  │01│ │02│ │03│  │  ← Empty gaps
│  └──┘ └──┘ └──┘  │
│  ┌──┐ ┌──┐ ┌──┐  │
│  │04│ │05│ │06│  │
└──┴──┴─┴──┴─┴──┴──┘
```

**Result:**
- Bottom 3 layers: solid structural base
- Top 3 layers: isolated color test tiles

---

## Verification

### Test 1: Gap Fill Disabled
1. Set "Fill Gaps & Perimeter" = OFF
2. Export STL
3. Check STL viewer:
   - [ ] Gaps are empty (no geometry)
   - [ ] Perimeter is empty (no geometry)
   - [ ] Only tile boxes exist

### Test 2: Gap Fill Enabled
1. Set "Fill Gaps & Perimeter" = ON
2. Select "Fill Filament" = "Jade White"
3. Set "Base Layers" = 3
4. Export STL
5. Check "Jade_White.stl":
   - [ ] Contains tile geometry (if any tiles use it)
   - [ ] Contains perimeter border (4 rectangles)
   - [ ] Contains horizontal gaps (rows-1 rectangles)
   - [ ] Contains vertical gaps (cols-1 rectangles)
   - [ ] Gap/perimeter geometry only in layers 0-2 (base)
   - [ ] No gap/perimeter geometry in layers 3+ (variable)

### Test 3: Manual Coordinate Check

Open "Jade_White.stl", find perimeter vertices:

```stl
facet normal 0 0 -1
  outer loop
    vertex 0 0 0           ← Top-left corner of perimeter
    vertex 36 0 0          ← Top-right corner
    vertex 36 2 0          ← Perimeter is 2mm wide
  endloop
endfacet
```

**Verify:**
- Starts at (0, 0) ✓
- Width = 36mm (full grid width) ✓
- Depth = 2mm (perimeterMargin) ✓

---

## Summary

**Gap & Perimeter Fill Behavior:**

| Setting | Gaps | Perimeter | Result |
|---------|------|-----------|--------|
| Fill OFF | Empty space | Empty space | Separated tiles, no support |
| Fill ON | Solid geometry (base) | Solid geometry (base) | Structural base + isolated top |

**Implementation:**
- Fill geometry is added to the selected filament's STL file
- Only applies to base layers (not variable layers)
- Creates complete solid platform on base + isolated tiles above
- Enables structural integrity while maintaining calibration capability

