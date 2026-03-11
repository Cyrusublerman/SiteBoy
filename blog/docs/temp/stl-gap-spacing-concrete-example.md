# How Gaps & Perimeter are Created in STL - CONCRETE EXAMPLE

## The Core Problem

**You're right to be confused!** The code seems to create tiles that are too big. Let me trace through with ACTUAL numbers.

---

## Example: 3×3 Grid

### Settings
- `cols = 3, rows = 3`
- `tileSize = 10mm`
- `gap = 1mm`
- `perimeterMargin = 2mm`

---

## Step 1: Calculate Physical Dimensions

```javascript
// From grid-layout.js
const tilesWidth = 3 × 10 = 30mm
const gapsWidth = 2 × 1 = 2mm      // (3-1) gaps
const perimeterWidth = 2 × 2 = 4mm  // both sides

grid.width = 30 + 2 + 4 = 36mm
```

---

## Step 2: Create Tile Coordinates (Layer Map)

```javascript
// _createGridLayerMaps() produces tile coordinates (0-indexed)
layerMaps[0][0] = Set([
    "0,0", "1,0", "2,0",  // First row
    "0,1", "1,1", "2,1",  // Second row  
    "0,2", "1,2", "2,2"   // Third row
])
// Just 9 tile positions - no gap coordinates, no perimeter coordinates
```

---

## Step 3: Calculate Pixel Size

```javascript
// exportArtworkSTLs() in stl-generation.js:246
const pixelSize = printWidth / imageWidth;
const pixelSize = 36mm / 3;
const pixelSize = 12mm;
```

**Critical**: `pixelSize = 12mm` but our actual tiles are only 10mm!

---

## Step 4: Generate STL Boxes (THE PROBLEM)

Current code (lines 269-275):

```javascript
for (let rect of rectangles) {
    // Tile at position (0, 0):
    const x0 = rect.x * pixelSize;        // 0 * 12 = 0mm
    const y0 = rect.y * pixelSize;        // 0 * 12 = 0mm
    const x1 = (rect.x + rect.w) * pixelSize;  // (0 + 1) * 12 = 12mm ❌
    const y1 = (rect.y + rect.h) * pixelSize;  // (0 + 1) * 12 = 12mm ❌
    
    filamentFacets += generateBox(x0, y0, z0, x1, y1, z1);
}
```

**This creates a 12mm × 12mm box! But we want 10mm × 10mm!**

---

## The Actual Result (What Currently Happens)

```
Position (0,0): Box from (0, 0) to (12, 12)    = 12×12mm ❌
Position (1,0): Box from (12, 0) to (24, 12)   = 12×12mm ❌
Position (2,0): Box from (24, 0) to (36, 12)   = 12×12mm ❌
...
```

**NO GAPS! The tiles are touching because they're 12mm wide positioned 12mm apart!**

---

## What SHOULD Happen

Looking at this, I think there's a bug in the current implementation! Let me check if there's offset logic elsewhere...

Actually, let me look at what `grid.width` actually is. Let me check the grid layout calculation:

```javascript
// From calculateGridLayout()
const physicalWidth = (cols * tileSize) + ((cols - 1) * gap) + (2 * perimeterMargin);
```

So:
- `physicalWidth = (3 × 10) + (2 × 1) + (2 × 2) = 36mm` ✓

But then we're dividing by `cols = 3` to get `pixelSize = 12mm`.

---

## The Real Solution (What Should Be Implemented)

### Option 1: Tile-Only Width (Current Bug Fix Needed)

The STL should be calculated using ONLY the tile+gap area, excluding perimeter:

```javascript
const innerWidth = (cols * tileSize) + ((cols - 1) * gap);
const innerWidth = (3 × 10) + (2 × 1) = 32mm;
const pixelSize = innerWidth / cols = 32 / 3 = 10.67mm;

// Now for tile at (0,0):
x0 = 0 * 10.67 = 0mm
x1 = 1 * 10.67 = 10.67mm
```

**Still wrong!** The tile is 10.67mm but should be 10mm.

---

## Option 2: Separate Tile Size from Spacing (CORRECT)

The issue is that `pixelSize` represents SPACING, not SIZE.

```javascript
// Calculate spacing (center-to-center)
const innerWidth = (cols * tileSize) + ((cols - 1) * gap) = 32mm;
const spacing = innerWidth / cols = 10.67mm;

// Calculate tile size (actual geometry)
const actualTileSize = tileSize = 10mm;

// Generate boxes:
for (let rect of rectangles) {
    // Position based on spacing
    const centerX = (rect.x + 0.5) * spacing;
    const centerY = (rect.y + 0.5) * spacing;
    
    // But size based on actual tile size
    const x0 = centerX - (actualTileSize * rect.w / 2);
    const y0 = centerY - (actualTileSize * rect.h / 2);
    const x1 = x0 + (actualTileSize * rect.w);
    const y1 = y0 + (actualTileSize * rect.h);
    
    filamentFacets += generateBox(x0, y0, z0, x1, y1, z1);
}
```

---

## Option 3: Position + Size (SIMPLEST CORRECT APPROACH)

Actually, the CLEANEST solution is:

```javascript
// Calculate individual component sizes
const tileSize = grid.tileSize;  // 10mm
const gap = grid.gap;            // 1mm
const perimeterMargin = grid.perimeterMargin; // 2mm

for (let rect of rectangles) {
    // Calculate position including gaps
    const x0 = perimeterMargin + (rect.x * (tileSize + gap));
    const y0 = perimeterMargin + (rect.y * (tileSize + gap));
    
    // Calculate size (just tile size * rect dimensions)
    const x1 = x0 + (rect.w * tileSize) + ((rect.w - 1) * gap);
    const y1 = y0 + (rect.h * tileSize) + ((rect.h - 1) * gap);
    
    filamentFacets += generateBox(x0, y0, z0, x1, y1, z1);
}
```

**Example for tile at (0,0):**
```javascript
x0 = 2 + (0 * 11) = 2mm           // Starts after perimeter
y0 = 2 + (0 * 11) = 2mm
x1 = 2 + (1 * 10) + (0 * 1) = 12mm  // 10mm tile
y1 = 2 + (1 * 10) + (0 * 1) = 12mm

// Box from (2, 2) to (12, 12) = 10mm × 10mm ✓
```

**Example for tile at (1,0):**
```javascript
x0 = 2 + (1 * 11) = 13mm          // After first tile + gap
y0 = 2 + (0 * 11) = 2mm
x1 = 13 + 10 = 23mm
y1 = 2 + 10 = 12mm

// Box from (13, 2) to (23, 12) = 10mm × 10mm ✓
```

**Example for tile at (2,0):**
```javascript
x0 = 2 + (2 * 11) = 24mm          // After two tiles + gaps
y0 = 2mm
x1 = 24 + 10 = 34mm
y1 = 12mm

// Box from (24, 2) to (34, 12) = 10mm × 10mm ✓
```

---

## Visual Diagram of Corrected Output

```
0mm                  36mm
├─────────────────────┤
┌──┬──────┬─┬──────┬─┬──────┬──┐
│  │      │ │      │ │      │  │  ← 2mm perimeter
│  │ 10mm │1│ 10mm │1│ 10mm │  │
│  │      │ │      │ │      │  │
├──┼──────┼─┼──────┼─┼──────┼──┤
│  │      │ │      │ │      │  │
└──┴──────┴─┴──────┴─┴──────┴──┘
↑  ↑      ↑ ↑      ↑ ↑      ↑  ↑
2  12     13 23    24 34    36
```

Tile positions in STL:
- Tile (0,0): `(2,2)` to `(12,12)` = 10×10mm ✓
- Tile (1,0): `(13,2)` to `(23,12)` = 10×10mm ✓
- Tile (2,0): `(24,2)` to `(34,12)` = 10×10mm ✓

Gaps are from:
- `x=12` to `x=13` (1mm gap) ✓
- `x=23` to `x=24` (1mm gap) ✓

Perimeter is:
- `x=0` to `x=2` (2mm left) ✓
- `x=34` to `x=36` (2mm right) ✓

---

## The Bug in Current Code

**Current Implementation:**
```javascript
const pixelSize = printWidth / imageWidth;  // 36 / 3 = 12mm
const x1 = (rect.x + rect.w) * pixelSize;   // Creates 12mm tiles!
```

**Should Be:**
```javascript
const x0 = perimeterMargin + (rect.x * (tileSize + gap));
const x1 = x0 + (rect.w * tileSize) + ((rect.w - 1) * gap);
```

---

## Why This Bug Exists

The `exportArtworkSTLs()` function was designed for IMAGE quantization, where:
- `imageWidth` = image width in pixels
- `printWidth` = desired print width in mm
- `pixelSize = printWidth / imageWidth` makes sense (each pixel scales uniformly)

But for CALIBRATION GRIDS:
- Tiles have explicit size (`tileSize`)
- Gaps have explicit size (`gap`)
- Perimeter has explicit size (`perimeterMargin`)
- These should NOT be scaled uniformly!

---

## The Fix Needed

**File:** `assets/js/shared/algorithms/geometry/stl-generation.js`

Add a new parameter to distinguish grid mode from image mode:

```javascript
export function exportArtworkSTLs(layerMaps, filamentNames, config) {
    const { imageWidth, imageHeight, printWidth, layerHeight, 
            isGrid, tileSize, gap, perimeterMargin } = config;
    
    if (isGrid) {
        // Grid mode: explicit tile/gap/perimeter sizes
        for (let rect of rectangles) {
            const x0 = perimeterMargin + (rect.x * (tileSize + gap));
            const y0 = perimeterMargin + (rect.y * (tileSize + gap));
            const x1 = x0 + (rect.w * tileSize) + ((rect.w - 1) * gap);
            const y1 = y0 + (rect.h * tileSize) + ((rect.h - 1) * gap);
            
            filamentFacets += generateBox(x0, y0, z0, x1, y1, z1);
        }
    } else {
        // Image mode: uniform pixel scaling (existing code)
        const pixelSize = printWidth / imageWidth;
        // ... existing code ...
    }
}
```

**And update the call in MFP-SourceActions.js:**

```javascript
const stls = exportArtworkSTLs(
    this._createGridLayerMaps(grid),
    grid.colours.map(c => c.n),
    {
        imageWidth: grid.cols,
        imageHeight: grid.rows,
        printWidth: grid.width,
        layerHeight: 0.08,
        isGrid: true,              // ← ADD THIS
        tileSize: grid.tileSize,   // ← ADD THIS
        gap: grid.gap,             // ← ADD THIS
        perimeterMargin: grid.perimeterMargin || 0  // ← ADD THIS
    }
);
```

---

## Summary

**Your confusion was justified!** The current code has a bug:

1. ❌ **Current**: Creates tiles that are `(printWidth / cols)` mm → tiles touch, no gaps
2. ✓ **Should**: Create tiles that are `tileSize` mm, positioned at `(tileSize + gap)` intervals

**The gaps and perimeter are created by:**
- Positioning tiles at `perimeterMargin + (index × (tileSize + gap))`
- Making each tile only `tileSize` mm
- The arithmetic difference creates the physical gaps
