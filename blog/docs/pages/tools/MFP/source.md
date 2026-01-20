# Multifilament Print Tool - SOURCE Tab

## Purpose

Generate calibration grids containing all possible combinations of selected filaments across N layers. These grids are printed and scanned to create accurate color calibration data.

## Mathematical Foundation

### Sequence Generation

For `c` colors and `L` layers (with `b` base layers):
- Variable layers: `v = L - b`
- Total sequences: `c^v`
- Each sequence: `[f₀, f₁, ..., f_{L-1}]` where `fᵢ ∈ {1..c}`

**Base layers** cycle through all colors:
```
f₀ = (0 % c) + 1 = 1
f₁ = (1 % c) + 1 = 2
...
f_{b-1} = ((b-1) % c) + 1
```

**Variable layers** enumerate all combinations:
```
For sequence index i in [0, c^v):
  For layer j in [b, L):
    position = j - b
    f_j = (⌊i / c^position⌋ % c) + 1
```

**Example:** 2 colors, 4 layers, 2 base:
- Variable layers: 4 - 2 = 2
- Sequences: 2² = 4
```
Seq 0: [1,2,1,1]  base=[1,2], var=[1,1]
Seq 1: [1,2,2,1]  base=[1,2], var=[2,1]
Seq 2: [1,2,1,2]  base=[1,2], var=[1,2]
Seq 3: [1,2,2,2]  base=[1,2], var=[2,2]
```

### Grid Layout Calculation

Given `n` sequences, tile size `t`, gap `g`, perimeter `p`, constraints `W×H`:

```
step = t + g
cols = ⌊(W - 2p + g) / step⌋
rows = ⌈n / cols⌉

gridWidth = cols × step - g + 2p
gridHeight = rows × step - g + 2p

fits = gridWidth ≤ W ∧ gridHeight ≤ H
```

If oversized, use unconstrained square layout:
```
cols = ⌈√n⌉
rows = ⌈n / cols⌉
```

### Constraint Calculation

Two constraint types:
- **Bed constraint:** Printer build volume (bedW × bedH)
- **Scan constraint:** Scannable paper size (scanW × scanH)

```
maxWidth = min(bedW, scanW)
maxHeight = min(bedH, scanH)
```

Grid must fit within both to be printable AND scannable.

### Color Simulation

Multi-layer color mixing using Beer-Lambert law approximation (subtractive):

```javascript
simColour(sequence, colours) {
  // Start with white substrate
  let [r, g, b] = [255, 255, 255]
  
  for (filamentIndex of sequence) {
    if (filamentIndex === 0) continue  // skip empty
    
    let color = colours[filamentIndex - 1]  // 0-indexed
    let [fr, fg, fb] = hexToRGB(color.h)
    
    // Subtractive mixing (each layer absorbs light)
    r = r * (fr / 255)
    g = g * (fg / 255)
    b = b * (fb / 255)
  }
  
  return {r: ⌊r⌋, g: ⌊g⌋, b: ⌊b⌋}
}
```

**Why subtractive:** Light passes through translucent filament layers. Each layer absorbs wavelengths, multiplying transmittance.

## UI Controls

### Filament Picker (2-10 colors)
- Visual color palette grid (29 Bambu Lab PLA colors)
- Click to select/deselect
- Numbered selection badges
- Search filter

**Constraints:**
- Min 2: Need combinations
- Max 10: Grid size explodes (10⁴ = 10,000 tiles)

### Physical Constraints
- **Bed Width/Height:** Printer build volume (default: 220×220mm)
- **Scan Width/Height:** Paper size (default: 200×200mm)

Grid must fit smallest of both constraints.

### Tile Configuration
- **Layers per Tile:** Total `L` (1-10, default: 4)
- **Layer Height:** Print height in mm (0.04-0.4, default: 0.08)
- **Tile Size:** Dimensions (2-20mm, default: 10mm)
- **Gap:** Space between tiles (0-5mm, default: 2mm)
- **Perimeter Margin:** Border (0-10mm, default: 0mm)

**Gap purpose:** Prevents tile merging during print.
**Margin purpose:** Edge tolerance for scan alignment.

### Base & Top Layers
- **Base Layers:** Fixed bottom layers cycling through all colors
- **Top Layers:** Fixed top layers (reserved for future)

**Base purpose:** Ensures each sequence represents all colors.

### Gap Configuration
- **Fill Gaps:** Toggle gap fill with specific filament
- **Gap Filament:** Color for gap fill

**When enabled:** Grid background filled with gap filament. Visually cleaner, structurally stronger.

### Sort & View
**Sort Method:**
- Layer Count (default)
- Base Color
- Top Color
- Complexity
- Lexicographic

**Affects:** Grid layout order, CSV export, scan matching

**Canvas View:**
- Combined: Simulated multi-layer color
- Layer 0-3: Individual layer colors

### Live Preview
Auto-regenerates on changes:
- Filament selection (2+ colors)
- Layer count
- Tile size/gap
- Constraints
- Sort method

**Shows:**
- Fit status (green=fits, red=oversized)
- Grid dimensions (rows×cols)
- Physical size (mm)
- Sequence count

## Export Formats

### Grid PNG (300 DPI)
High-resolution render for reference.

**Calculation:**
```
widthInches = gridWidth / 25.4  // mm to inches
heightInches = gridHeight / 25.4
canvasWidth = round(widthInches × 300)
canvasHeight = round(heightInches × 300)
```

### Grid STL
3D printable files, one per filament-layer combination.

**Geometry:**
```
For each tile at (row, col):
  x = col × (tileSize + gap) + perimeterMargin
  y = row × (tileSize + gap) + perimeterMargin
  z = layerIndex × layerHeight
  
  Create rectangular prism:
    vertices = [
      (x, y, z),
      (x+tileSize, y, z),
      (x+tileSize, y+tileSize, z),
      (x, y+tileSize, z),
      (x, y, z+layerHeight),
      (x+tileSize, y, z+layerHeight),
      (x+tileSize, y+tileSize, z+layerHeight),
      (x, y+tileSize, z+layerHeight)
    ]
```

### Grid CSV
Sequence reference for scan alignment.

**Format:**
```csv
Sequence,Layer_0,Layer_1,Layer_2,Layer_3
0,1,2,1,1
1,1,2,2,1
```

### Complete Package (ZIP)
Contains:
- `grid-layout.json`: Grid metadata + settings
- `sequences.json`: Full sequence definitions
- `sequences.csv`: Human-readable table
- `README.md`: Usage instructions
- `config.json`: All tool settings
- `manifest.json`: File inventory
- `stl/`: STL files per layer/color
- `visuals/`: PNG renders

**Filename format:**
```
cal-{colors}c{layers}L-{rows}x{cols}-{tilesize}mm-g{gap}mm-base{B}top{T}-{sort}-YYYYMMDD.zip
```

Example: `cal-4c4L-10x10-10mm-g1mm-base2top0-layercount-20260114.zip`

## Workflow

1. **Select Filaments** (2-10 colors)
2. **Configure Constraints** (bed size, scan size)
3. **Set Tile Parameters** (size, gap, layers)
4. **Generate Grid** (or let live preview show it)
5. **Export Complete Package** (ZIP with all files)
6. **Print Grid** (load STLs into slicer)
7. **Scan Printed Grid** (move to SCAN tab)

## Troubleshooting

### Grid Won't Fit
**Solutions:**
1. Reduce layers (4→3: 16→8 tiles for 2 colors)
2. Remove one color
3. Reduce tile size (10mm→8mm)
4. Reduce gap (2mm→1mm)
5. Use "Generate Split Grids"

### Too Many Sequences
**Cause:** Too many colors × layers
- 3 colors, 4 layers, 2 base: 3² = 9 tiles ✓
- 4 colors, 4 layers, 2 base: 4² = 16 tiles ✓
- 5 colors, 4 layers, 2 base: 5² = 25 tiles ⚠
- 10 colors, 4 layers, 2 base: 10² = 100 tiles ❌

**Solutions:**
- Increase base layers (reduces variable layers)
- Reduce total layers
- Reduce color count

---

**Next Step:** Print the grid and move to SCAN tab to analyze actual colors.

