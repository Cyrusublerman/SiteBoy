# STL Gap & Perimeter Fix - Verification Guide

## Bug Fixed

**Before:** STL tiles were `(printWidth / cols)` mm → touching with no gaps
**After:** STL tiles are `tileSize` mm, positioned with proper gaps and perimeter offset

---

## Changes Made

### 1. Updated `stl-generation.js`

Added support for grid mode with explicit sizing:

```javascript
export function exportArtworkSTLs(layerMaps, filamentNames, config) {
    const { isGrid = false, tileSize, gap = 0, perimeterMargin = 0 } = config;
    
    if (isGrid) {
        // Grid mode: explicit tile/gap/perimeter sizes
        x0 = perimeterMargin + (rect.x * (tileSize + gap));
        y0 = perimeterMargin + (rect.y * (tileSize + gap));
        x1 = x0 + (rect.w * tileSize) + ((rect.w - 1) * gap);
        y1 = y0 + (rect.h * tileSize) + ((rect.h - 1) * gap);
    } else {
        // Image mode: uniform pixel scaling (unchanged)
        const pixelSize = printWidth / imageWidth;
        // ... existing code
    }
}
```

### 2. Updated `MFP-SourceActions.js`

Added grid parameters to STL export call:

```javascript
const stls = exportArtworkSTLs(
    this._createGridLayerMaps(grid),
    grid.colours.map(c => c.n),
    {
        imageWidth: grid.cols,
        imageHeight: grid.rows,
        printWidth: grid.width,
        layerHeight: 0.08,
        isGrid: true,                           // ← NEW
        tileSize: grid.tileSize,                // ← NEW
        gap: grid.gap,                          // ← NEW
        perimeterMargin: grid.perimeterMargin || 0  // ← NEW
    }
);
```

---

## Verification Examples

### Example 1: 3×3 Grid

**Settings:**
- Cols/Rows: 3×3
- Tile Size: 10mm
- Gap: 1mm
- Perimeter: 2mm
- Total Width: `(3×10) + (2×1) + (2×2) = 36mm`

**Expected STL Coordinates:**

| Tile | Position | Box Coordinates | Size | Verification |
|------|----------|-----------------|------|--------------|
| (0,0) | Row 0, Col 0 | `(2, 2)` to `(12, 12)` | 10×10mm | ✓ After 2mm perimeter |
| (1,0) | Row 0, Col 1 | `(13, 2)` to `(23, 12)` | 10×10mm | ✓ 1mm gap from tile 0 |
| (2,0) | Row 0, Col 2 | `(24, 2)` to `(34, 12)` | 10×10mm | ✓ 1mm gap from tile 1 |
| (0,1) | Row 1, Col 0 | `(2, 13)` to `(12, 23)` | 10×10mm | ✓ 1mm gap from row 0 |
| (1,1) | Row 1, Col 1 | `(13, 13)` to `(23, 23)` | 10×10mm | ✓ Center tile |
| (2,1) | Row 1, Col 2 | `(24, 13)` to `(34, 23)` | 10×10mm | ✓ |

**Gap Verification:**
- Horizontal gaps: `x=12→13`, `x=23→24` (1mm each) ✓
- Vertical gaps: `y=12→13`, `y=23→24` (1mm each) ✓
- Left perimeter: `x=0→2` (2mm) ✓
- Right perimeter: `x=34→36` (2mm) ✓

### Example 2: 5×5 Grid (Larger)

**Settings:**
- Cols/Rows: 5×5
- Tile Size: 8mm
- Gap: 0.5mm
- Perimeter: 3mm
- Total Width: `(5×8) + (4×0.5) + (2×3) = 48mm`

**Tile Spacing:** `8mm tile + 0.5mm gap = 8.5mm per position`

**Sample Tiles:**

| Tile | Calculation | Box Coordinates | Size |
|------|-------------|-----------------|------|
| (0,0) | `x=3+(0×8.5)=3`, `y=3` | `(3, 3)` to `(11, 11)` | 8×8mm ✓ |
| (1,0) | `x=3+(1×8.5)=11.5`, `y=3` | `(11.5, 3)` to `(19.5, 11)` | 8×8mm ✓ |
| (4,4) | `x=3+(4×8.5)=37`, `y=37` | `(37, 37)` to `(45, 45)` | 8×8mm ✓ |

**Gap Verification:**
- Gap between (0,0) and (1,0): `x=11→11.5` (0.5mm) ✓
- Perimeter space: `x=45→48` (3mm right edge) ✓

### Example 3: No Gap, No Perimeter

**Settings:**
- Cols/Rows: 4×4
- Tile Size: 12mm
- Gap: 0mm
- Perimeter: 0mm
- Total Width: `(4×12) + (0×0) + (0×0) = 48mm`

**Expected:**
- Tiles should be touching (no air gaps)
- No empty perimeter space

| Tile | Box Coordinates | Size |
|------|-----------------|------|
| (0,0) | `(0, 0)` to `(12, 12)` | 12×12mm ✓ |
| (1,0) | `(12, 0)` to `(24, 12)` | 12×12mm ✓ |
| (3,3) | `(36, 36)` to `(48, 48)` | 12×12mm ✓ |

---

## Testing Procedure

### 1. Generate Test Grid

In the MFP tool:
1. Select 2+ filaments
2. Set layer count: 4
3. Set tile size: 10mm
4. Set gap: 1mm
5. Set perimeter margin: 2mm
6. Click "Generate Grid"

### 2. Export STL

1. Click "Export Grid STLs"
2. Should download one STL per filament

### 3. Verify in STL Viewer

Open any STL file in a viewer (e.g., Windows 3D Viewer, Blender, online viewer):

**Check:**
- [ ] Tiles are 10mm × 10mm (not 12mm)
- [ ] 1mm gaps visible between tiles
- [ ] 2mm empty space around perimeter
- [ ] Total model is 36mm × 36mm (if 3×3 grid)

### 4. Manual Coordinate Check

Open STL file in text editor, look for vertex coordinates:

```stl
solid Artwork_ColorName
facet normal 0 0 -1
  outer loop
    vertex 2 2 0         ← First tile should start at (2, 2) not (0, 0)
    vertex 12 2 0        ← Width = 10mm (12-2)
    vertex 12 12 0       ← Height = 10mm (12-2)
  endloop
endfacet
...
```

**Verify:**
- First tile starts at `(2, 2)` = perimeter offset ✓
- Tile dimensions are 10mm (not 12mm) ✓
- Second tile starts at `(13, 2)` = 10mm tile + 1mm gap + 2mm offset ✓

---

## Common Issues to Watch For

### Issue 1: Tiles Still Touching
**Symptom:** No visible gaps in STL viewer
**Cause:** `isGrid: true` not being passed
**Fix:** Verify MFP-SourceActions.js line 632 has `isGrid: true`

### Issue 2: Wrong Total Size
**Symptom:** Model is larger/smaller than expected
**Cause:** `perimeterMargin` not being applied
**Fix:** Check that `grid.perimeterMargin` is defined in gridData

### Issue 3: Tiles Wrong Size
**Symptom:** Tiles are not `tileSize` mm
**Cause:** Still using old `pixelSize` calculation
**Fix:** Ensure `isGrid` branch is being executed (add console.log if needed)

---

## Mathematical Verification

### Formula: Tile Position

```javascript
x0 = perimeterMargin + (tileIndex * (tileSize + gap))
```

**Example (3rd tile, 10mm tiles, 1mm gap, 2mm perimeter):**
```javascript
x0 = 2 + (2 * (10 + 1))
x0 = 2 + 22
x0 = 24mm ✓
```

### Formula: Tile Size

```javascript
width = (rectWidth * tileSize) + ((rectWidth - 1) * gap)
```

**Single tile (rectWidth=1):**
```javascript
width = (1 * 10) + ((1 - 1) * 1)
width = 10 + 0
width = 10mm ✓
```

**Merged 3-tile rectangle (rectWidth=3):**
```javascript
width = (3 * 10) + ((3 - 1) * 1)
width = 30 + 2
width = 32mm ✓  (includes 2 internal gaps)
```

### Formula: Total Grid Size

```javascript
totalWidth = (cols * tileSize) + ((cols - 1) * gap) + (2 * perimeterMargin)
```

**Example (3 cols, 10mm tiles, 1mm gap, 2mm perimeter):**
```javascript
totalWidth = (3 * 10) + (2 * 1) + (2 * 2)
totalWidth = 30 + 2 + 4
totalWidth = 36mm ✓
```

**Rightmost tile end position:**
```javascript
lastTileX = perimeterMargin + ((cols - 1) * (tileSize + gap)) + tileSize
lastTileX = 2 + (2 * 11) + 10
lastTileX = 2 + 22 + 10
lastTileX = 34mm

remainingSpace = totalWidth - lastTileX
remainingSpace = 36 - 34
remainingSpace = 2mm ✓ (matches perimeterMargin)
```

---

## Regression Prevention

Before committing, verify that:
- [ ] 3×3 grid with gaps produces visible gaps in STL
- [ ] Perimeter margin creates empty border in STL
- [ ] Grid with gap=0 has touching tiles (no gaps)
- [ ] Grid with perimeterMargin=0 starts at (0,0)
- [ ] Merged rectangles (vectorization) maintain correct internal gaps
- [ ] Split grids (oversized) all have correct spacing

---

## Visual Comparison

### Before Fix (Bug)
```
STL Output:
┌────────────────────────────────┐
│████████████████████████████████│  ← All tiles touching
│████████████████████████████████│     No gaps or perimeter
│████████████████████████████████│
└────────────────────────────────┘
Total: 36mm (but tiles are 12mm each = wrong!)
```

### After Fix (Correct)
```
STL Output:
┌──┬──────┬─┬──────┬─┬──────┬──┐
│  │██████│ │██████│ │██████│  │  ← 10mm tiles
│  │██████│ │██████│ │██████│  │  ← 1mm gaps
│  └──────┘ └──────┘ └──────┘  │  ← 2mm perimeter
└──────────────────────────────┘
Total: 36mm (tiles are 10mm = correct!)
```

---

## Success Criteria

✓ **Tile Size:** Each tile is exactly `tileSize` mm in STL
✓ **Gap Size:** Space between tiles is exactly `gap` mm
✓ **Perimeter:** Empty border is exactly `perimeterMargin` mm
✓ **Total Size:** Model dimensions match `grid.width` and `grid.height`
✓ **Vectorization:** Merged rectangles maintain internal gaps correctly
✓ **Edge Cases:** Works with gap=0, perimeterMargin=0, and various tile sizes

---

## Related Documentation

- Implementation: `blog/docs/temp/stl-gap-spacing-concrete-example.md`
- Bug Analysis: `blog/docs/temp/gap-perimeter-stl-representation.md`
- Algorithm: `assets/js/shared/algorithms/geometry/stl-generation.js`
- Usage: `assets/js/tools/fabrication/multifilament-print/MFP-SourceActions.js`

