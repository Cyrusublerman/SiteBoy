# Gap and Perimeter Geometry Structure

## Concrete Example: 3×3 Grid

### Configuration
- Cols: 3
- Rows: 3
- Tile Size: 10mm
- Gap: 1mm
- Perimeter Margin: 2mm
- Total Width: `(3×10) + (2×1) + (2×2) = 36mm`
- Total Height: `(3×10) + (2×1) + (2×2) = 36mm`
- Base Layers: 3
- Layer Height: 0.08mm

---

## PERIMETER STRUCTURE (4 Rectangles)

The perimeter is **4 separate rectangles** that form a border around the entire grid.

### Top Border

```javascript
generateBox(0, 0, z0, totalWidth, perimeterMargin, z1)
generateBox(0, 0, z0, 36, 2, z1)
```

**Dimensions:** 36mm wide × 2mm tall × 0.08mm thick
**Position:** Spans full width, flush with top edge
**Coordinates:**
- Bottom-left front: `(0, 0, z0)`
- Top-right back: `(36, 2, z1)`

```
Top View:
0mm                            36mm
├──────────────────────────────┤
┌──────────────────────────────┐  0mm
│████████████████████████████████│
└──────────────────────────────┘  2mm
```

---

### Bottom Border

```javascript
generateBox(0, totalHeight - perimeterMargin, z0, totalWidth, totalHeight, z1)
generateBox(0, 34, z0, 36, 36, z1)
```

**Dimensions:** 36mm wide × 2mm tall × 0.08mm thick
**Position:** Spans full width, flush with bottom edge
**Coordinates:**
- Bottom-left front: `(0, 34, z0)`
- Top-right back: `(36, 36, z1)`

```
Top View:
0mm                            36mm
├──────────────────────────────┤
┌──────────────────────────────┐  34mm
│████████████████████████████████│
└──────────────────────────────┘  36mm
```

---

### Left Border

```javascript
generateBox(0, perimeterMargin, z0, perimeterMargin, totalHeight - perimeterMargin, z1)
generateBox(0, 2, z0, 2, 34, z1)
```

**Dimensions:** 2mm wide × 32mm tall × 0.08mm thick
**Position:** Spans inner height (excluding corners to avoid overlap with top/bottom)
**Coordinates:**
- Bottom-left front: `(0, 2, z0)`
- Top-right back: `(2, 34, z1)`

```
Top View:
0mm
├─┤
┌─┐  2mm
│█│
│█│  ← 32mm tall
│█│
└─┘  34mm
  2mm
```

---

### Right Border

```javascript
generateBox(totalWidth - perimeterMargin, perimeterMargin, z0, totalWidth, totalHeight - perimeterMargin, z1)
generateBox(34, 2, z0, 36, 34, z1)
```

**Dimensions:** 2mm wide × 32mm tall × 0.08mm thick
**Position:** Spans inner height (excluding corners to avoid overlap with top/bottom)
**Coordinates:**
- Bottom-left front: `(34, 2, z0)`
- Top-right back: `(36, 34, z1)`

```
Top View:
         34mm
          ├─┤
          ┌─┐  2mm
          │█│
          │█│  ← 32mm tall
          │█│
          └─┘  34mm
         36mm
```

---

### Combined Perimeter (All 4 Borders)

```
Top View:
0mm                            36mm
├──────────────────────────────┤
┌──────────────────────────────┐  0mm
│████████████████████████████████│  ← Top (36×2)
│██┌──────────────────────┐██│  2mm
│██│                      │██│
│██│                      │██│  ← Left (2×32) + Right (2×32)
│██│                      │██│
│██└──────────────────────┘██│  34mm
│████████████████████████████████│  ← Bottom (36×2)
└──────────────────────────────┘  36mm

4 Rectangles:
  1. Top:    (0,0)   → (36,2)   = 36×2mm
  2. Bottom: (0,34)  → (36,36)  = 36×2mm
  3. Left:   (0,2)   → (2,34)   = 2×32mm
  4. Right:  (34,2)  → (36,34)  = 2×32mm
```

**Note:** Corners are included in top/bottom borders, not left/right (avoids double geometry).

---

## HORIZONTAL GAPS STRUCTURE (rows-1 Rectangles)

Horizontal gaps are **rows-1 separate rectangles** that span the width between tiles.

For 3 rows → 2 horizontal gaps

### Gap 1 (Between Row 0 and Row 1)

```javascript
// row = 0
y0 = perimeterMargin + ((row + 1) * tileSize) + (row * gap)
y0 = 2 + (1 * 10) + (0 * 1)
y0 = 12mm

y1 = y0 + gap
y1 = 13mm

generateBox(perimeterMargin, y0, z0, totalWidth - perimeterMargin, y1, z1)
generateBox(2, 12, z0, 34, 13, z1)
```

**Dimensions:** 32mm wide × 1mm tall × 0.08mm thick
**Position:** Between first and second row of tiles
**Coordinates:**
- Bottom-left front: `(2, 12, z0)`
- Top-right back: `(34, 13, z1)`

```
Top View:
2mm                          34mm
├────────────────────────────┤
┌──────┬─┬──────┬─┬──────┐
│TILE  │ │TILE  │ │TILE  │  ← Row 0
└──────┴─┴──────┴─┴──────┘  12mm
████████████████████████████  ← Gap 1 (32×1)
┌──────┬─┬──────┬─┬──────┐  13mm
│TILE  │ │TILE  │ │TILE  │  ← Row 1
```

---

### Gap 2 (Between Row 1 and Row 2)

```javascript
// row = 1
y0 = perimeterMargin + ((row + 1) * tileSize) + (row * gap)
y0 = 2 + (2 * 10) + (1 * 1)
y0 = 23mm

y1 = y0 + gap
y1 = 24mm

generateBox(2, 23, z0, 34, 24, z1)
```

**Dimensions:** 32mm wide × 1mm tall × 0.08mm thick
**Position:** Between second and third row of tiles
**Coordinates:**
- Bottom-left front: `(2, 23, z0)`
- Top-right back: `(34, 24, z1)`

```
Top View:
┌──────┬─┬──────┬─┬──────┐
│TILE  │ │TILE  │ │TILE  │  ← Row 1
└──────┴─┴──────┴─┴──────┘  23mm
████████████████████████████  ← Gap 2 (32×1)
┌──────┬─┬──────┬─┬──────┐  24mm
│TILE  │ │TILE  │ │TILE  │  ← Row 2
```

---

### Combined Horizontal Gaps

```
Side View (looking along X axis):
   ┌──────┐  ← Row 0 (tiles)
   └──────┘  12mm
   ████████  ← Gap 1 (1mm)
   ┌──────┐  13mm ← Row 1 (tiles)
   └──────┘  23mm
   ████████  ← Gap 2 (1mm)
   ┌──────┐  24mm ← Row 2 (tiles)
   └──────┘

2 Rectangles:
  1. Gap 1: (2,12)  → (34,13)  = 32×1mm
  2. Gap 2: (2,23)  → (34,24)  = 32×1mm
```

**Key:** Each gap spans from `perimeterMargin` to `totalWidth - perimeterMargin` (stays inside perimeter border).

---

## VERTICAL GAPS STRUCTURE (cols-1 Rectangles)

Vertical gaps are **cols-1 separate rectangles** that span the height between tiles.

For 3 cols → 2 vertical gaps

### Gap 1 (Between Col 0 and Col 1)

```javascript
// col = 0
x0 = perimeterMargin + ((col + 1) * tileSize) + (col * gap)
x0 = 2 + (1 * 10) + (0 * 1)
x0 = 12mm

x1 = x0 + gap
x1 = 13mm

generateBox(x0, perimeterMargin, z0, x1, totalHeight - perimeterMargin, z1)
generateBox(12, 2, z0, 13, 34, z1)
```

**Dimensions:** 1mm wide × 32mm tall × 0.08mm thick
**Position:** Between first and second column of tiles
**Coordinates:**
- Bottom-left front: `(12, 2, z0)`
- Top-right back: `(13, 34, z1)`

```
Top View:
        12mm
         ├┤
   ┌──────┐█┌──────┐
   │TILE  │█│TILE  │
   │  0   │█│  1   │
   │      │█│      │
   └──────┘█└──────┘
           ↑
      Gap 1 (1×32)
```

---

### Gap 2 (Between Col 1 and Col 2)

```javascript
// col = 1
x0 = perimeterMargin + ((col + 1) * tileSize) + (col * gap)
x0 = 2 + (2 * 10) + (1 * 1)
x0 = 23mm

x1 = x0 + gap
x1 = 24mm

generateBox(23, 2, z0, 24, 34, z1)
```

**Dimensions:** 1mm wide × 32mm tall × 0.08mm thick
**Position:** Between second and third column of tiles
**Coordinates:**
- Bottom-left front: `(23, 2, z0)`
- Top-right back: `(24, 34, z1)`

```
Top View:
                23mm
                 ├┤
   ┌──────┐█┌──────┐
   │TILE  │█│TILE  │
   │  1   │█│  2   │
   │      │█│      │
   └──────┘█└──────┘
           ↑
      Gap 2 (1×32)
```

---

### Combined Vertical Gaps

```
Top View (zoomed):
2mm  12  13   23  24   34mm
├────┼┤─────┼┤────────┤
┌────┬┬─────┬┬────────┐
│    ││     ││        │
│  0 ││  1  ││   2    │
│    ││     ││        │
└────┴┴─────┴┴────────┘
     ↑      ↑
   Gap 1  Gap 2

2 Rectangles:
  1. Gap 1: (12,2)  → (13,34)  = 1×32mm
  2. Gap 2: (23,2)  → (24,34)  = 1×32mm
```

**Key:** Each gap spans from `perimeterMargin` to `totalHeight - perimeterMargin` (stays inside perimeter border).

---

## COMPLETE COMBINED VIEW

All gaps and perimeter together for layer 0 (z = 0.00 to 0.08mm):

```
Top View:
0mm                            36mm
├──────────────────────────────┤
┌──────────────────────────────┐  0mm
│████████████████████████████████│  ← Perimeter Top
│██┌──────┬─┬──────┬─┬──────┐██│  2mm
│██│  0,0 │█│  1,0 │█│  2,0 │██│
│██│      │█│      │█│      │██│
│██└──────┴─┴──────┴─┴──────┘██│  12mm
│████████████████████████████████│  ← Horizontal Gap 1
│██┌──────┬─┬──────┬─┬──────┐██│  13mm
│██│  0,1 │█│  1,1 │█│  2,1 │██│
│██│      │█│      │█│      │██│
│██└──────┴─┴──────┴─┴──────┘██│  23mm
│████████████████████████████████│  ← Horizontal Gap 2
│██┌──────┬─┬──────┬─┬──────┐██│  24mm
│██│  0,2 │█│  1,2 │█│  2,2 │██│
│██│      │█│      │█│      │██│
│██└──────┴─┴──────┴─┴──────┘██│  34mm
│████████████████████████████████│  ← Perimeter Bottom
└──────────────────────────────┘  36mm
 2mm  12 13  23 24           34mm
  ↑    ↑  ↑   ↑  ↑
  │    │  │   │  │
  │    │  │   │  └─ Perimeter Right
  │    │  │   └──── Vertical Gap 2
  │    │  └──────── Vertical Gap 1
  │    └─────────── Perimeter Left (continues down)
  └──────────────── Perimeter Left
```

---

## GEOMETRY COUNT

For a 3×3 grid with gaps and perimeter:

### Perimeter: 4 boxes
1. Top border: 36×2×0.08mm
2. Bottom border: 36×2×0.08mm
3. Left border: 2×32×0.08mm
4. Right border: 2×32×0.08mm

### Horizontal Gaps: 2 boxes (rows - 1)
1. Gap 1: 32×1×0.08mm
2. Gap 2: 32×1×0.08mm

### Vertical Gaps: 2 boxes (cols - 1)
1. Gap 1: 1×32×0.08mm
2. Gap 2: 1×32×0.08mm

**Total: 8 boxes per layer**

For 3 base layers: **24 boxes** of gap/perimeter geometry

Each box = 12 triangular facets → **288 facets** for gap/perimeter fill

---

## COORDINATE FORMULAS

### Perimeter

```javascript
// Top
(0, 0) → (totalWidth, perimeterMargin)

// Bottom  
(0, totalHeight - perimeterMargin) → (totalWidth, totalHeight)

// Left
(0, perimeterMargin) → (perimeterMargin, totalHeight - perimeterMargin)

// Right
(totalWidth - perimeterMargin, perimeterMargin) → (totalWidth, totalHeight - perimeterMargin)
```

### Horizontal Gaps (Between Rows)

```javascript
for (row = 0; row < rows - 1; row++) {
    y0 = perimeterMargin + ((row + 1) * tileSize) + (row * gap)
    y1 = y0 + gap
    
    (perimeterMargin, y0) → (totalWidth - perimeterMargin, y1)
}
```

**Example:**
- Row 0: `y0 = 2 + 10 + 0 = 12`, `y1 = 13`
- Row 1: `y0 = 2 + 20 + 1 = 23`, `y1 = 24`

### Vertical Gaps (Between Columns)

```javascript
for (col = 0; col < cols - 1; col++) {
    x0 = perimeterMargin + ((col + 1) * tileSize) + (col * gap)
    x1 = x0 + gap
    
    (x0, perimeterMargin) → (x1, totalHeight - perimeterMargin)
}
```

**Example:**
- Col 0: `x0 = 2 + 10 + 0 = 12`, `x1 = 13`
- Col 1: `x0 = 2 + 20 + 1 = 23`, `x1 = 24`

---

## LAYER DISTRIBUTION

Gap/perimeter geometry is only generated for **base layers**.

### Example: 3 Base + 3 Variable Layers

**Layers 0-2 (Base):**
```
Each layer has:
  - 4 perimeter boxes
  - 2 horizontal gap boxes
  - 2 vertical gap boxes
  = 8 boxes × 3 layers = 24 boxes
```

**Layers 3-5 (Variable):**
```
NO gap/perimeter geometry
Only tile geometry exists
```

### Why Base Layers Only?

- **Structural:** Base provides solid foundation for print adhesion
- **Calibration:** Variable layers need isolated tiles for color testing
- **Efficiency:** Don't waste filament on structural support at top

---

## 3D VISUALIZATION

### Side View (YZ plane, looking along X axis)

```
Z (height)
↑
│  Layer 3+ (no gaps)
│  ┌──┐  ┌──┐  ┌──┐
│  └──┘  └──┘  └──┘  ← Floating tiles
│  
0.24mm ──────────────
│  Layer 2 (base with gaps)
│  ┌──┐  ┌──┐  ┌──┐
│  └──┘  └──┘  └──┘
│  ████  ████  ████  ← Gap
│  ┌──┐  ┌──┐  ┌──┐
│  └──┘  └──┘  └──┘
│  
0.16mm ──────────────
│  Layer 1 (base with gaps)
│  [similar structure]
│  
0.08mm ──────────────
│  Layer 0 (base with gaps)
│  ████████████████  ← Perimeter
│  ██┌──┐██┌──┐██
│  ██└──┘██└──┘██
│  ████████████████  ← Gap
│  ██┌──┐██┌──┐██
│  ██└──┘██└──┘██
│  ████████████████  ← Perimeter
│  
0mm ──────────────────► Y
```

---

## PRACTICAL EXAMPLE: STL TEXT OUTPUT

For layer 0, gap 1 horizontal:

```stl
solid Artwork_Jade_White

... (tile geometry) ...

facet normal 0 0 -1
  outer loop
    vertex 2 12 0
    vertex 34 12 0
    vertex 34 13 0
  endloop
endfacet
facet normal 0 0 -1
  outer loop
    vertex 2 12 0
    vertex 34 13 0
    vertex 2 13 0
  endloop
endfacet
... (10 more facets for this box) ...

... (more gap/perimeter boxes) ...

endsolid Artwork_Jade_White
```

---

## SUMMARY

| Entity | Count (3×3 grid) | Size | Position |
|--------|------------------|------|----------|
| **Perimeter Top** | 1 box/layer | 36×2mm | `(0,0)` to `(36,2)` |
| **Perimeter Bottom** | 1 box/layer | 36×2mm | `(0,34)` to `(36,36)` |
| **Perimeter Left** | 1 box/layer | 2×32mm | `(0,2)` to `(2,34)` |
| **Perimeter Right** | 1 box/layer | 2×32mm | `(34,2)` to `(36,34)` |
| **Horizontal Gap 1** | 1 box/layer | 32×1mm | `(2,12)` to `(34,13)` |
| **Horizontal Gap 2** | 1 box/layer | 32×1mm | `(2,23)` to `(34,24)` |
| **Vertical Gap 1** | 1 box/layer | 1×32mm | `(12,2)` to `(13,34)` |
| **Vertical Gap 2** | 1 box/layer | 1×32mm | `(23,2)` to `(24,34)` |
| **TOTAL** | 8 boxes/layer × 3 base layers | | **24 boxes** |

Each box = 12 facets → **288 facets** for complete gap/perimeter fill.

