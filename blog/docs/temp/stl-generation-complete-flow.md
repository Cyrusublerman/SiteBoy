# How STL Files Are Actually Generated - Complete Flow

## Overview

STL (STereoLithography) files store 3D models as a collection of triangular facets. We use **ASCII STL format** (human-readable text, not binary).

---

## The Complete Process

### Step 1: User Exports Grid

```javascript
// User clicks "Export Grid STLs" in MFP tool
MFP-Main.js → calls sourceActions.exportGridSTL()
```

### Step 2: Prepare Grid Data

```javascript
// MFP-SourceActions.js:617-643
exportGridSTL(values, toolBase) {
    const grid = this.state.gridData;
    
    // Convert grid sequences to layer maps
    const layerMaps = this._createGridLayerMaps(grid);
    // layerMaps[layerIndex][filamentIndex] = Set("col,row", "col,row", ...)
    
    // Call STL generation algorithm
    const stls = exportArtworkSTLs(
        layerMaps,                    // Which tiles use which filament
        grid.colours.map(c => c.n),   // ["Red PLA", "Blue PLA", ...]
        {
            imageWidth: grid.cols,    // 3 columns
            imageHeight: grid.rows,   // 3 rows
            printWidth: grid.width,   // 36mm
            layerHeight: 0.08,        // 0.08mm per layer
            isGrid: true,
            tileSize: grid.tileSize,  // 10mm
            gap: grid.gap,            // 1mm
            perimeterMargin: grid.perimeterMargin,  // 2mm
            gapFillEnabled: true,
            gapFilamentName: "Jade White",
            baseLayers: grid.baseLayers  // 3
        }
    );
    // stls = { "artwork_Red_PLA.stl": "solid Red...", "artwork_Blue_PLA.stl": "solid Blue..." }
}
```

### Step 3: Generate STL for Each Filament

```javascript
// stl-generation.js:243-323
export function exportArtworkSTLs(layerMaps, filamentNames, config) {
    const stls = {};
    
    // Loop through each filament (e.g., Red PLA, Blue PLA, Yellow PLA)
    for (let fi = 0; fi < filamentCount; fi++) {
        let filamentFacets = '';  // Accumulate all geometry as text
        
        // Loop through each layer (e.g., layer 0, 1, 2, ...)
        for (let li = 0; li < layerMaps.length; li++) {
            const pixels = layerMaps[li][fi];  // Set("0,0", "1,0", "2,0")
            
            // Optimize: merge adjacent tiles into rectangles
            const rectangles = vectorizePixels(pixels, imageWidth, imageHeight);
            // rectangles = [{x: 0, y: 0, w: 3, h: 1}]  (3 tiles merged)
            
            const z0 = li * layerHeight;  // 0.00mm, 0.08mm, 0.16mm, ...
            const z1 = z0 + layerHeight;  // 0.08mm, 0.16mm, 0.24mm, ...
            
            // Generate box for each rectangle
            for (let rect of rectangles) {
                // Calculate position in mm
                const x0 = perimeterMargin + (rect.x * (tileSize + gap));
                const y0 = perimeterMargin + (rect.y * (tileSize + gap));
                const x1 = x0 + (rect.w * tileSize) + ((rect.w - 1) * gap);
                const y1 = y0 + (rect.h * tileSize) + ((rect.h - 1) * gap);
                
                // Generate ASCII STL text for this box
                filamentFacets += generateBox(x0, y0, z0, x1, y1, z1);
            }
        }
        
        // Add gap/perimeter geometry if enabled
        if (isGrid && gapFillEnabled && filamentNames[fi] === gapFilamentName) {
            filamentFacets += generateGapAndPerimeterGeometry(...);
        }
        
        // Wrap facets with STL header/footer
        if (filamentFacets.length > 0) {
            const fileName = `artwork_${filamentNames[fi]}.stl`;
            stls[fileName] = wrapSTL(filamentFacets, `Artwork_${filamentNames[fi]}`);
        }
    }
    
    return stls;
}
```

---

## The Core: Generating a Box (12 Triangles)

### Function

```javascript
// stl-generation.js:111-197
export function generateBox(x0, y0, z0, x1, y1, z1) {
    return `facet normal 0 0 -1
  outer loop
    vertex ${x0} ${y0} ${z0}
    vertex ${x1} ${y0} ${z0}
    vertex ${x1} ${y1} ${z0}
  endloop
endfacet
facet normal 0 0 -1
  outer loop
    vertex ${x0} ${y0} ${z0}
    vertex ${x1} ${y1} ${z0}
    vertex ${x0} ${y1} ${z0}
  endloop
endfacet
...  (10 more facets for other faces)
`;
}
```

### Concrete Example

**Input:**
```javascript
generateBox(2, 2, 0, 12, 12, 0.08)
// Create a 10mm × 10mm × 0.08mm box
// Bottom-left corner: (2, 2, 0)
// Top-right corner: (12, 12, 0.08)
```

**Output (ASCII text):**
```stl
facet normal 0 0 -1
  outer loop
    vertex 2 2 0
    vertex 12 2 0
    vertex 12 12 0
  endloop
endfacet
facet normal 0 0 -1
  outer loop
    vertex 2 2 0
    vertex 12 12 0
    vertex 2 12 0
  endloop
endfacet
facet normal 0 0 1
  outer loop
    vertex 2 2 0.08
    vertex 12 12 0.08
    vertex 12 2 0.08
  endloop
endfacet
facet normal 0 0 1
  outer loop
    vertex 2 2 0.08
    vertex 2 12 0.08
    vertex 12 12 0.08
  endloop
endfacet
facet normal 0 -1 0
  outer loop
    vertex 2 2 0
    vertex 12 2 0
    vertex 12 2 0.08
  endloop
endfacet
facet normal 0 -1 0
  outer loop
    vertex 2 2 0
    vertex 12 2 0.08
    vertex 2 2 0.08
  endloop
endfacet
facet normal 0 1 0
  outer loop
    vertex 2 12 0
    vertex 12 12 0.08
    vertex 12 12 0
  endloop
endfacet
facet normal 0 1 0
  outer loop
    vertex 2 12 0
    vertex 2 12 0.08
    vertex 12 12 0.08
  endloop
endfacet
facet normal -1 0 0
  outer loop
    vertex 2 2 0
    vertex 2 12 0.08
    vertex 2 12 0
  endloop
endfacet
facet normal -1 0 0
  outer loop
    vertex 2 2 0
    vertex 2 2 0.08
    vertex 2 12 0.08
  endloop
endfacet
facet normal 1 0 0
  outer loop
    vertex 12 2 0
    vertex 12 12 0
    vertex 12 12 0.08
  endloop
endfacet
facet normal 1 0 0
  outer loop
    vertex 12 2 0
    vertex 12 12 0.08
    vertex 12 2 0.08
  endloop
endfacet
```

**Explanation:**
- **12 facets** total (2 triangles per face × 6 faces)
- Each **facet** = 1 triangle
- Each **triangle** = 3 vertices (X Y Z coordinates in mm)
- Each face has a **normal vector** (direction the face is pointing)

---

## Box Geometry Breakdown

### The 6 Faces of a Box

```
        Top (z1)
         ┌─────┐
        /     /│
       /     / │
      ┌─────┐  │  Right (x1)
Left  │     │  │
(x0)  │     │  ┘
      │     │ /
      └─────┘/
     Bottom (z0)
```

### Face Normals (Which Direction Each Face Points)

| Face | Normal Vector | Meaning |
|------|---------------|---------|
| Bottom | `(0, 0, -1)` | Points down (-Z) |
| Top | `(0, 0, 1)` | Points up (+Z) |
| Front | `(0, -1, 0)` | Points toward you (-Y) |
| Back | `(0, 1, 0)` | Points away (+Y) |
| Left | `(-1, 0, 0)` | Points left (-X) |
| Right | `(1, 0, 0)` | Points right (+X) |

### Triangle Winding Order

Triangles must be defined **counter-clockwise** when viewed from outside the box. This ensures correct rendering (backface culling).

**Bottom face example:**
```
Looking down from above (+Z):

    (x0,y0) ─────► (x1,y0)
       │              │
       │              │
       ▼              ▼
    (x0,y1) ◄───── (x1,y1)

Triangle 1: (x0,y0) → (x1,y0) → (x1,y1)  ✓ Counter-clockwise
Triangle 2: (x0,y0) → (x1,y1) → (x0,y1)  ✓ Counter-clockwise
```

---

## Wrapping Facets into Complete STL File

```javascript
// stl-generation.js:206-208
function wrapSTL(facets, name) {
    return `solid ${name}\n${facets}endsolid ${name}\n`;
}
```

**Input:**
```javascript
const facets = `facet normal 0 0 -1
  outer loop
    vertex 2 2 0
    ...
  endloop
endfacet
...`;

const stl = wrapSTL(facets, "Artwork_Red_PLA");
```

**Output:**
```stl
solid Artwork_Red_PLA
facet normal 0 0 -1
  outer loop
    vertex 2 2 0
    vertex 12 2 0
    vertex 12 12 0
  endloop
endfacet
facet normal 0 0 -1
  outer loop
    vertex 2 2 0
    vertex 12 12 0
    vertex 2 12 0
  endloop
endfacet
...  (more facets)
endsolid Artwork_Red_PLA
```

This is the complete ASCII STL file content!

---

## Complete Example: 3×3 Grid, Layer 0

### Input Data

**Grid:**
- 3×3 tiles
- Tile size: 10mm
- Gap: 1mm
- Perimeter: 2mm
- Layer 0 (z = 0.00 to 0.08mm)

**Layer map for Red PLA:**
```javascript
layerMaps[0][0] = Set(["0,0", "1,1", "2,2"])  // Diagonal tiles
```

### Processing

```javascript
// Vectorize: no adjacent tiles, so 3 separate rectangles
rectangles = [
    {x: 0, y: 0, w: 1, h: 1},
    {x: 1, y: 1, w: 1, h: 1},
    {x: 2, y: 2, w: 1, h: 1}
];

// Calculate positions
z0 = 0 * 0.08 = 0.00mm
z1 = 0.08mm

// Tile (0,0):
x0 = 2 + (0 * 11) = 2mm
y0 = 2 + (0 * 11) = 2mm
x1 = 2 + 10 = 12mm
y1 = 2 + 10 = 12mm
// Generate box(2, 2, 0, 12, 12, 0.08) → 12 facets

// Tile (1,1):
x0 = 2 + (1 * 11) = 13mm
y0 = 2 + (1 * 11) = 13mm
x1 = 13 + 10 = 23mm
y1 = 13 + 10 = 23mm
// Generate box(13, 13, 0, 23, 23, 0.08) → 12 facets

// Tile (2,2):
x0 = 2 + (2 * 11) = 24mm
y0 = 2 + (2 * 11) = 24mm
x1 = 24 + 10 = 34mm
y1 = 24 + 10 = 34mm
// Generate box(24, 24, 0, 34, 34, 0.08) → 12 facets
```

### Output STL

```stl
solid Artwork_Red_PLA
facet normal 0 0 -1
  outer loop
    vertex 2 2 0
    vertex 12 2 0
    vertex 12 12 0
  endloop
endfacet
facet normal 0 0 -1
  outer loop
    vertex 2 2 0
    vertex 12 12 0
    vertex 2 12 0
  endloop
endfacet
...  (10 more facets for tile 0,0)
facet normal 0 0 -1
  outer loop
    vertex 13 13 0
    vertex 23 13 0
    vertex 23 23 0
  endloop
endfacet
...  (11 more facets for tile 1,1)
facet normal 0 0 -1
  outer loop
    vertex 24 24 0
    vertex 34 24 0
    vertex 34 34 0
  endloop
endfacet
...  (11 more facets for tile 2,2)
endsolid Artwork_Red_PLA
```

**Total:** 36 facets (12 per tile × 3 tiles)

---

## Gap & Perimeter Geometry

```javascript
// stl-generation.js:325-403
function generateGapAndPerimeterGeometry(cols, rows, tileSize, gap, perimeterMargin, 
                                          layerHeight, baseLayers, totalLayers) {
    let facets = '';
    
    // Only fill base layers
    for (let li = 0; li < baseLayers; li++) {
        const z0 = li * layerHeight;
        const z1 = z0 + layerHeight;
        
        // Perimeter border (4 rectangles)
        if (perimeterMargin > 0) {
            // Top border
            facets += generateBox(0, 0, z0, totalWidth, perimeterMargin, z1);
            
            // Bottom, left, right borders
            // ...
        }
        
        // Horizontal gaps (between rows)
        if (gap > 0) {
            for (let row = 0; row < rows - 1; row++) {
                const y0 = perimeterMargin + ((row + 1) * tileSize) + (row * gap);
                const y1 = y0 + gap;
                
                facets += generateBox(perimeterMargin, y0, z0,
                                     totalWidth - perimeterMargin, y1, z1);
            }
        }
        
        // Vertical gaps (between columns)
        // ...
    }
    
    return facets;
}
```

**Example (layer 0, top perimeter border):**
```javascript
generateBox(0, 0, 0, 36, 2, 0.08)
```

**Output:**
```stl
facet normal 0 0 -1
  outer loop
    vertex 0 0 0
    vertex 36 0 0
    vertex 36 2 0
  endloop
endfacet
...  (11 more facets)
```

This creates a solid 36mm × 2mm × 0.08mm strip along the top edge.

---

## File Download

```javascript
// MFP-SourceActions.js:648-656
Object.entries(stls).forEach(([filename, content]) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;  // "cal-3c6L-10x10-10mm-g1mm-base3top0-Layer_Count-20260117_Red_PLA.stl"
    a.click();
    URL.revokeObjectURL(url);
});
```

This creates a text file containing the ASCII STL content and triggers browser download.

---

## Why ASCII STL?

### Advantages
- **Human-readable**: Open in text editor, debug coordinates
- **Simple**: Just text templates with string interpolation
- **Universal**: All 3D software reads ASCII STL
- **Debuggable**: Easy to verify geometry is correct

### Disadvantages
- **Large file size**: ~10x bigger than binary STL
- **Slower to parse**: Text parsing vs binary reading

### Our Use Case
For calibration grids (9-100 tiles), file size is ~100KB-2MB → ASCII is fine!

---

## Summary: Complete Data Flow

```
User Action
    ↓
exportGridSTL()
    ↓
_createGridLayerMaps()  →  layerMaps[layer][filament] = Set("col,row")
    ↓
exportArtworkSTLs()
    ↓
For each filament:
    ↓
  For each layer:
      ↓
    vectorizePixels()  →  rectangles = [{x, y, w, h}]
      ↓
    For each rectangle:
        ↓
      Calculate position:  x0 = perimeter + (col * (tile + gap))
        ↓
      generateBox(x0, y0, z0, x1, y1, z1)  →  12 facets (ASCII text)
        ↓
      Accumulate facets string
  
  If gap fill enabled:
      ↓
    generateGapAndPerimeterGeometry()  →  more facets (ASCII text)
    ↓
  wrapSTL(facets, name)  →  "solid Name\n...\nendsolid Name\n"
    ↓
stls = { "filename.stl": "solid ...", ... }
    ↓
Download each STL file
    ↓
User opens in slicer/3D viewer
```

---

## Visual Example: Single Tile STL

**Input:**
```javascript
generateBox(2, 2, 0, 12, 12, 0.08)
```

**Visual (ASCII art):**
```
     12,12,0.08
        ┌────────┐
       /│       /│
      / │      / │
 2,12,0.08    /  │
    │  │     /   │
    │  └────/────┘ 12,2,0.08
    │ /    /    /
    │/    /    /
    └────/────┘
 2,2,0      12,2,0

Corners:
  Bottom: (2,2,0), (12,2,0), (12,12,0), (2,12,0)
  Top:    (2,2,0.08), (12,2,0.08), (12,12,0.08), (2,12,0.08)
```

**STL text (36 triangles = 12 facets):**
- Bottom face: 2 triangles
- Top face: 2 triangles
- Front face: 2 triangles
- Back face: 2 triangles
- Left face: 2 triangles
- Right face: 2 triangles

Each triangle defined by 3 vertices in counter-clockwise order.

That's how STL files are made!

