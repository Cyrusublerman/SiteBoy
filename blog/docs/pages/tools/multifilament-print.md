# Multifilament Print Calibration Tool

**Category:** Fabrication  
**Status:** Production  
**Version:** 2.0.0 (Modular)

## Overview

Tool for generating, scanning, and calibrating multi-color 3D prints using filament layer sequences. Creates calibration grids that map theoretical filament combinations to actual printed colors, enabling accurate color prediction for multi-material prints.

## Workflow

```
1. SOURCE    → Generate calibration grid
2. SCAN      → Analyze scanned printed grid
3. QUANTIZE  → Process source image with calibrated palette
4. EXPORT    → Generate STL files for printing
```

## SOURCE Tab

### Purpose
Generate calibration grids containing all possible combinations of selected filaments across N layers.

### Mathematical Foundation

#### Sequence Generation
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

#### Grid Layout Calculation
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

#### Constraint Calculation
Two constraint types:
- **Bed constraint:** Printer build volume (bedW × bedH)
- **Scan constraint:** Scannable paper size (scanW × scanH)

```
maxWidth = min(bedW, scanW)
maxHeight = min(bedH, scanH)
```

Grid must fit within both to be printable AND scannable.

### Color Simulation

#### Multi-Layer Color Mixing
Simulates subtractive color mixing of translucent layers using Beer-Lambert law approximation:

```javascript
simColour(sequence, colours) {
  // Start with white substrate
  let [r, g, b] = [255, 255, 255]
  
  for (filamentIndex of sequence) {
    if (filamentIndex === 0) continue  // skip empty
    
    let color = colours[filamentIndex - 1]  // 0-indexed array
    let [fr, fg, fb] = hexToRGB(color.h)
    
    // Subtractive mixing (each layer absorbs light)
    r = r * (fr / 255)
    g = g * (fg / 255)
    b = b * (fb / 255)
  }
  
  return {r: ⌊r⌋, g: ⌊g⌋, b: ⌊b⌋}
}
```

**Why subtractive:** Light passes through translucent filament layers. Each layer absorbs certain wavelengths, multiplying transmittance.

### UI Controls

#### Filament Picker (2-10 colors)
- Visual color palette grid
- Click to select/deselect
- Numbered selection badges
- Search filter

**Constraint:** 2 ≤ colors ≤ 10
- Min 2: Need at least 2 colors for combinations
- Max 10: Grid size explodes (10² = 100, 10³ = 1000, 10⁴ = 10,000 tiles)

#### Physical Constraints
- **Bed Width/Height:** Printer build volume (default: 220×220mm)
- **Scan Width/Height:** Scannable paper size (default: 200×200mm)

Grid must fit smallest of both constraints.

#### Tile Configuration
- **Layers per Tile:** Total layer count `L` (1-10, default: 4)
- **Layer Height:** Print layer height in mm (0.04-0.4, default: 0.08)
- **Tile Size:** Individual tile dimensions (2-20mm, default: 10mm)
- **Gap:** Space between tiles (0-5mm, default: 2mm)
- **Perimeter Margin:** Border around entire grid (0-10mm, default: 0mm)

**Gap purpose:** Prevents tiles from merging during print. Acts as separation channel.

**Perimeter margin purpose:** Edge tolerance for scan alignment. Allows grid to be slightly off-center in scan without losing tiles.

#### Base & Top Layers
- **Base Layers:** Fixed bottom layers that cycle through all colors
- **Top Layers:** Fixed top layers (not yet implemented - reserved for future)

**Base layer purpose:** Ensures each sequence has representation of all selected colors, improving color distribution.

#### Gap Configuration
- **Fill Gaps:** Toggle to fill gap space with specific filament
- **Gap Filament:** Color selection for gap fill

**When enabled:** Entire grid background filled with gap filament, tiles print on top. Visually cleaner, structurally stronger.

#### Sort & View
- **Sort Method:** 
  - Layer Count (default)
  - Base Color
  - Top Color
  - Complexity
  - Lexicographic

**Sorting affects:**
- Grid layout order
- CSV export sequence
- Scan analysis matching

- **Canvas View:**
  - Combined: Simulated multi-layer color
  - Layer 0-3: Individual layer filament colors

#### Live Preview
Grid regenerates automatically on:
- Filament selection change (2+ colors)
- Layer count change
- Tile size/gap change
- Constraint change
- Sort method change

Shows real-time:
- Fit status (green=fits, red=oversized)
- Grid dimensions (rows×cols)
- Physical size (width×height in mm)
- Sequence count

#### Export Options
- **STL Combined:** Single STL per color (all layers merged)
- **STL Per Layer:** Separate STL for each layer/color combination
- **Sorted Variants:** Export grid in all sort orders
- **Layer Visuals:** PNG renders of each layer

### Export Formats

#### Grid PNG (300 DPI)
High-resolution render for reference/documentation.

**Calculation:**
```
widthInches = gridWidth / 25.4  // mm to inches
heightInches = gridHeight / 25.4
canvasWidth = round(widthInches × 300)
canvasHeight = round(heightInches × 300)
```

#### Grid STL
3D printable files. One file per filament-layer combination.

**Geometry:**
```
For each tile at position (row, col):
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

#### Grid CSV
Sequence index, layer-by-layer filament indices.

**Format:**
```csv
Sequence,Layer_0,Layer_1,Layer_2,Layer_3
0,1,2,1,1
1,1,2,2,1
2,1,2,1,2
3,1,2,2,2
```

**Purpose:** Reference for scan alignment. Each sequence number corresponds to tile position in grid.

#### Complete Package (ZIP)
Contains:
- `grid-layout.json`: Grid metadata + all settings
- `sequences.json`: Full sequence definitions
- `sequences.csv`: Human-readable sequence table
- `README.md`: Usage instructions
- `config.json`: All tool settings for reimport
- `manifest.json`: File inventory
- `stl/`: STL files per layer/color
- `visuals/`: PNG renders
- `scans/` (if analysis done):
  - `scan-image.png`
  - `analysis.json`
  - `quantization-config.json`
  - `calibrated-palette.gpl`
  - `comparison.csv`

**Filename format:**
```
cal-{colors}c{layers}L-{rows}x{cols}-{tilesize}mm-g{gap}mm-base{B}top{T}-{sort}-YYYYMMDD.{ext}
```

Example: `cal-4c4L-10x10-10mm-g1mm-base2top0-layercount-20260114.zip`

## SCAN Tab

### Purpose
Align scanned calibration grid image with reference grid data to extract actual printed colors from each tile.

### Grid Alignment

#### Auto-Calculation
On scan image upload, automatically calculates grid overlay position:

```javascript
// Physical grid dimensions (mm)
physicalWidth = gridData.width
physicalHeight = gridData.height

// Assume scan DPI or calculate from known size
assumedDPI = 150  // typical flatbed scanner

// Calculate expected pixel dimensions
expectedPixelWidth = (physicalWidth / 25.4) × assumedDPI
expectedPixelHeight = (physicalHeight / 25.4) × assumedDPI

// Scale to actual scan image size
scaleX = scanImage.width / expectedPixelWidth
scaleY = scanImage.height / expectedPixelHeight
scale = (scaleX + scaleY) / 2

// Center grid on image
offsetX = (scanImage.width - expectedPixelWidth × scale) / 2
offsetY = (scanImage.height - expectedPixelHeight × scale) / 2
```

#### Manual Fine-Tuning
- **Offset X/Y:** Pixel-level position adjustment (-50 to +50px)
- **Rotation:** Angular correction (-5° to +5°)
- **Corner Dragging:** Skew/perspective correction (planned)

#### Display Modes
- **Fit:** Scale to container (maintain aspect)
- **Fill:** Cover container (may crop)
- **Actual Size:** 1:1 pixel mapping

### Color Extraction

#### Sampling Strategy
For each tile in grid:

```javascript
// Calculate tile boundaries in scan coordinates
tileX = col × (tileSize + gap) × scale + offsetX + marginOffset
tileY = row × (tileSize + gap) × scale + offsetY + marginOffset
tilePixelWidth = tileSize × scale
tilePixelHeight = tileSize × scale

// Apply deadzone (avoid edges where ink bleeds)
deadzone = deadzonePercent / 100
margin = tilePixelWidth × deadzone / 2

sampleX = tileX + margin
sampleY = tileY + margin
sampleWidth = tilePixelWidth × (1 - deadzone)
sampleHeight = tilePixelHeight × (1 - deadzone)

// Sample all pixels in safe zone
colors = []
for y in [sampleY, sampleY + sampleHeight):
  for x in [sampleX, sampleX + sampleWidth):
    pixel = scanImage.getPixel(x, y)
    colors.push(pixel.rgb)
```

#### Statistical Analysis
Per tile:
- **Average RGB:** Mean color across all sampled pixels
- **Standard Deviation:** Color consistency (σ_r, σ_g, σ_b)
- **Variance:** Spread of values
- **Min/Max RGB:** Range of observed colors

**Low variance:** Uniform tile, reliable color sample  
**High variance:** Print defect, edge bleed, or lighting issue

### Analysis Outputs

#### Calibrated Palette (GPL)
GIMP Palette format with extracted colors:

```
GIMP Palette
Name: Calibrated Palette
Columns: 4
#
255 200 180  Seq_0
220 180 160  Seq_1
```

**Purpose:** Use in image editor to quantize artwork with actual printed colors, not theoretical ones.

#### Quantization Config (JSON)
Maps filament combinations to measured RGB:

```json
{
  "colorMap": [
    {
      "sequence": [1,2,1,1],
      "expected": {"r": 200, "g": 150, "b": 100},
      "actual": {"r": 195, "g": 148, "b": 98},
      "deviation": 4.36
    }
  ]
}
```

**Deviation calculation:**
```
δ = √[(r_actual - r_expected)² + (g_actual - g_expected)² + (b_actual - b_expected)²]
```

#### Comparison CSV
Side-by-side expected vs actual:

```csv
Sequence,Expected_R,Expected_G,Expected_B,Actual_R,Actual_G,Actual_B,Deviation
0,200,150,100,195,148,98,4.36
```

**Use case:** Import to spreadsheet for quality analysis, deviation plotting.

### Interactive Analysis Viewer
Opens popup window showing extracted colors in grid layout with sorting options:
- Grid Order (position in scan)
- Sequence Order (generation order)
- Brightness (luminance)
- Hue (color wheel position)
- Color Deviation (error magnitude)
- RGB Channels (individual R/G/B values)

## QUANTIZE Tab

### Purpose
Convert arbitrary source images to printable multi-color format using calibrated or theoretical palette.

### Color Quantization Algorithm

#### K-Means Clustering (if calibrated palette available)
```
1. Extract unique colors from calibrated palette
2. Initialize k centroids = palette colors
3. For each pixel in source image:
     Find nearest centroid (Euclidean distance)
     Assign pixel to that cluster
4. No iteration needed (palette is fixed)
```

#### Nearest Color Mapping (fallback)
```
For each pixel (r, g, b):
  minDist = ∞
  bestColor = null
  
  For each paletteColor:
    dist = √[(r - pr)² + (g - pg)² + (b - pb)²]
    if dist < minDist:
      minDist = dist
      bestColor = paletteColor
  
  outputPixel = bestColor
```

#### Dithering
Optional Floyd-Steinberg error diffusion:

```
For each pixel at (x, y):
  oldPixel = image[y][x]
  newPixel = findClosestPaletteColor(oldPixel)
  image[y][x] = newPixel
  
  error = oldPixel - newPixel
  
  // Distribute error to neighbors
  image[y][x+1]   += error × 7/16
  image[y+1][x-1] += error × 3/16
  image[y+1][x]   += error × 5/16
  image[y+1][x+1] += error × 1/16
```

**Purpose:** Reduces banding, creates apparent color gradients through spatial mixing.

### Print Width Scaling
Calculates required resolution:

```
printWidthMM = userInput  // e.g., 100mm
tileSize = gridData.tileSize  // e.g., 10mm
tilesPerWidth = printWidthMM / tileSize  // 10 tiles

outputWidth = tilesPerWidth  // pixels
outputHeight = (inputHeight / inputWidth) × outputWidth
```

Each pixel = one tile in final print.

### Min Detail Filter
Removes isolated single-pixel noise:

```
For each pixel at (x, y):
  if pixel differs from all 8 neighbors:
    replace with most common neighbor color
```

**Purpose:** Prevents unintentional single-tile accents that may be print errors or noise.

## EXPORT Tab

### STL Generation

#### Per-Color Combined
Single STL per filament containing all tiles/layers of that color:

```
For filamentIndex in [1..numColors]:
  stl = new STL()
  
  For each tile at (row, col):
    sequence = sequences[row × cols + col]
    
    For layerIndex in [0..numLayers):
      if sequence[layerIndex] === filamentIndex:
        prism = createPrism(
          x = col × step,
          y = row × step,
          z = layerIndex × layerHeight,
          width = tileSize,
          height = tileSize,
          depth = layerHeight
        )
        stl.add(prism)
  
  export(stl, "color_" + filamentIndex + ".stl")
```

**Use:** Load all STLs into slicer, assign each to different extruder/filament.

#### Per-Layer Split
Separate STL for each layer/color combination:

```
For layerIndex in [0..numLayers):
  For filamentIndex in [1..numColors]:
    stl = new STL()
    
    For each tile where sequence[layerIndex] === filamentIndex:
      prism = createPrism(...)
      stl.add(prism)
    
    export(stl, "layer_" + layerIndex + "_color_" + filamentIndex + ".stl")
```

**Use:** Manual layer-by-layer printing, inspection, or remix.

### Canvas Modes
- **Source:** Original quantized artwork
- **Scan:** Scanned calibration grid
- **Grid:** Generated calibration grid
- **Quantized:** Color-reduced artwork
- **Layer 0-3:** Individual layer preview

## Technical Architecture

### File Structure
```
assets/js/tools/fabrication/multifilament-print/
├── MFP-Main.js              Entry point, UI config, canvas drawing
├── MFP-Constants.js         FILAMENT_COLOURS, DEFAULTS
├── MFP-SourceActions.js     Grid generation, export, project I/O
├── MFP-ScanActions.js       Scan alignment, color extraction
├── MFP-QuantizeActions.js   Image quantization
├── MFP-ExportActions.js     Export orchestration
├── MFP-GridRenderer.js      Canvas rendering helpers
└── MFP-ScanRenderer.js      Scan overlay rendering
```

### State Management
Shared state object passed to all action modules:

```javascript
sharedState = {
  selectedFilaments: [],      // [0, 1, 5] (palette indices)
  gridData: null,             // Layout, sequences, dimensions
  sequences: null,            // [[1,2,1,1], ...]
  sequenceMap: null,          // Rendering lookup
  gridConstraints: null,      // Bed/scan size limits
  scanImageElement: null,     // HTMLImageElement
  scanAnalysis: null,         // Extracted color data
  sourceImageElement: null,   // Quantize source
  quantizedImage: null,       // ImageData result
  importedState: null         // Loaded project settings
}
```

No global state. All data flows through shared state reference.

### Algorithm Imports
Modular functions from shared algorithm library:

```javascript
// Sequence generation
import { generateSequences, buildSequenceMap, sortSequences } 
  from 'algorithms/combinatorics/sequences.js'

// Color operations
import { simColour, rgb2hex, hex2rgb } 
  from 'algorithms/color/color-utils.js'

// Layout calculation
import { calculateGridLayout, calculateConstraints } 
  from 'algorithms/layout/grid-layout.js'

// Geometry export
import { exportArtworkSTLs, vectorizePixels } 
  from 'algorithms/geometry/stl-generation.js'

// Image processing
import { quantizeImage, applyMinDetailFilter } 
  from 'algorithms/color/quantization.js'
```

### ToolBase Integration
Extends ToolBase declarative framework:

```javascript
class MultifilamentPrintTool {
  constructor(container, deps) {
    const config = {
      title: 'Multifilament Print',
      sidebar: this._getSidebarConfig(),  // 4 tabs, all controls
      canvas: { width: 800, height: 600 },
      onInit: (values) => this._handleInit(values),
      onUpdate: (key, value, allValues) => this._handleUpdate(key, value, allValues),
      onDraw: (ctx, canvas, values) => this._handleDraw(ctx, canvas, values)
    }
    
    this.toolBase = new ToolBase(config, deps)
    this.toolBase.mount(container)
  }
}
```

**No direct DOM manipulation.** All UI through ToolBase declarative config.

## Filament Palette (Bambu Lab PLA Basic)

29 colors from Bambu Lab's PLA Basic line:

| Index | Hex | Name |
|-------|-----|------|
| 0 | #FFFFFF | Jade White |
| 1 | #EC008C | Magenta |
| 2 | #E4BD68 | Gold |
| 3 | #3F8E43 | Mistletoe Green |
| ... | ... | ... |
| 28 | #000000 | Black |

**Extensible:** Can swap palette by modifying `FILAMENT_COLOURS` constant.

## Common Issues & Solutions

### Grid Won't Fit
**Symptoms:** Red "OVERSIZED" warning, preview shows dimensions exceeding constraints.

**Solutions:**
1. Reduce layer count (4 → 3: 16 tiles → 8 tiles for 2 colors)
2. Remove one color (3 colors, 2 layers: 9 tiles → 2 colors: 4 tiles)
3. Reduce tile size (10mm → 8mm)
4. Reduce gap (2mm → 1mm)
5. Use "Generate Split Grids" to break into multiple printable grids

### Scan Alignment Off
**Symptoms:** Grid overlay doesn't match printed tiles, colors sampled from wrong locations.

**Solutions:**
1. Use "Auto Calculate" button to reset to calculated position
2. Adjust offset X/Y in 1px increments
3. Rotate if scan was slightly crooked
4. Check scan DPI matches expected (150 DPI default)
5. Verify physical grid dimensions match grid-layout.json

### Color Deviation Too High
**Symptoms:** Analysis shows >20 RGB deviation between expected and actual.

**Causes:**
- Incorrect filament loaded
- Printer temperature variance
- Lighting conditions during scan
- Camera vs scanner color space

**Solutions:**
1. Re-print with verified filaments
2. Calibrate printer temperature
3. Scan in consistent lighting (avoid window light)
4. Use scanner (not camera) for color accuracy

### Quantized Image Looks Wrong
**Symptoms:** Colors don't match palette, banding, or noise.

**Solutions:**
1. Enable dithering for gradients
2. Increase min detail threshold to remove noise
3. Use calibrated palette (SCAN tab) instead of theoretical
4. Adjust print width to match intended output size

## Future Enhancements

### Planned
- Corner-drag perspective correction for scan alignment
- Top layer implementation (currently reserved)
- Multi-page split grid printing
- Temperature/speed parameter tracking
- Batch quantization for animation frames

### Under Consideration
- Custom filament palette editor
- 3D preview of multi-layer stack
- Estimated print time calculation
- Material cost estimation
- Integration with slicer APIs

## References

- **Color Theory:** Subtractive color mixing (Beer-Lambert)
- **Combinatorics:** Sequence enumeration (permutations with replacement)
- **Image Processing:** Floyd-Steinberg dithering, k-means quantization
- **3D Geometry:** STL binary format specification
- **File Formats:** GIMP GPL palette, CSV RFC 4180

---

**Last Updated:** 2026-01-14  
**Maintained By:** SiteBoy Development  
**Tool Version:** 2.0.0 (Modular Refactor)

