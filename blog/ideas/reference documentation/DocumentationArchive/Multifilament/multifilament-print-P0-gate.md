# Phase 0: Pre-Flight Check — Multifilament Image Print Tool

## GATE 0: Comprehension Check

### 1. Is this a unified system or separate tools?
**Answer:** Sequential Pipeline

**Evidence:**
The tool implements a 3-step workflow where each step's output feeds the next:
1. Generate calibration grid → produces physical print + sequence map
2. Scan printed grid → extracts actual color palette
3. Quantize image with palette → produces STL files

### 2. What is the PRIMARY data structure everything operates on?
**Answer:** Sequence Map (RGB Color → Layer Sequence lookup)

**Evidence:**
The entire workflow revolves around building and using a Map that connects RGB colors to layer sequences:
- Step 1 builds the map: `Map<string, {sequence, colours, grid_position}>`
- Step 2 populates the map with actual printed colors
- Step 3 uses the map to expand pixels into layers

### 3. Name 3 integration relationships

**Relationship 1:** Sequence Generation **determines** Grid Layout
- Quote from `lib/grid/sequences.js`: "Generate all possible layer sequences for N colours and M layers"
- The number of generated sequences (340 for 4 colors × 4 layers) determines the required grid dimensions

**Relationship 2:** Sequence Map **enables** Layer Expansion
- Quote from `lib/grid/sequences.js`: "This map is CRITICAL for the entire workflow - it allows us to look up the layer sequence for any color in the final image"
- The sequence map built in Step 1 is used in Step 3 to convert quantized pixels into layer-by-layer filament instructions

**Relationship 3:** Calibration Grid **determines** Quantization Palette
- Quote from `API.md`: "Extract colors from scanned calibration grid...Uses grid-aligned sampling (not random!)"
- The actual printed colors extracted from the scanned grid in Step 2 become the palette used for image quantization in Step 3

### 4. If the design mentions different "modes", are they:
**Answer:** Sequential transformations

**Evidence:**
The tool has 3 distinct steps that must be executed in order:
1. Generate → produces grid and sequence map
2. Scan → produces color palette
3. Quantize → produces final STL files

Each step transforms data from the previous step. There are no "modes" to switch between - it's a linear pipeline.

---

## Architecture Type Classification

**Type:** [X] Sequential Pipeline

**Evidence quotes:**

1. From `MODULAR_LIBRARY_README.md`:
   "Complete Workflow: 1. GENERATE GRID → 2. ANALYZE SCAN → 3. QUANTIZE ARTWORK"

2. From `API.md` (Table of Contents):
   "Grid Module, Scan Module, Quantize Module, STL Module" - showing separate processing stages

3. From `image-to-stl-process.md`:
   "PHASE 1: PIXELIZATION → PHASE 2: COLOR QUANTIZATION → PHASE 3: SEQUENCE EXPANSION → PHASE 4: VECTORIZATION → PHASE 5: STL GENERATION"

---

## Core Data Structure

**Primary structure:** Sequence Map (color-to-layer lookup table)

**Properties it must have:**
- `sequence: number[]` — Layer-by-layer filament indices (used by Layer Expansion, STL Generation)
- `colours: ColorObject[]` — Filament colors that produced this sequence (used by Color Simulation, Palette Building)
- `grid_position: {row, col, index}` — Location in calibration grid (used by Scan Analysis)

**TypeScript definition:**
```typescript
interface SequenceMapEntry {
    sequence: number[];              // e.g., [1, 2, 0, 0] = Red on layer 0, Blue on layer 1
    colours: ColorObject[];          // Array of {h: string, n: string}
    grid_position: {
        row: number;
        col: number;
        index: number;
    };
}

type SequenceMap = Map<string, SequenceMapEntry>;  // Key: "r,g,b" RGB string
```

**Evidence from reference docs:**

From `lib/grid/sequences.js`:
```javascript
/**
 * Build sequence map (RGB color -> sequence data)
 * This map is CRITICAL for the entire workflow - it allows
 * us to look up the layer sequence for any color in the final image
 */
export function buildSequenceMap(sequences, colours, cols) {
    const map = new Map();
    sequences.forEach((seq, idx) => {
        const colour = simColour(seq, colours);
        const key = rgb_to_key(colour);
        map.set(key, {
            sequence: seq,
            colours: colours,
            grid_position: {
                row: Math.floor(idx / cols),
                col: idx % cols,
                index: idx
            }
        });
    });
    return map;
}
```

---

## Integration Map

### Feature A: Sequence Generator
- **Consumes:** User-selected filament colors (N colors), layers per tile (M)
- **Produces:** Array of valid sequences, Sequence Map
- **Modulates:** Grid Layout (determines cell count)
- **Quote:** "Generate all possible layer sequences for N colours and M layers. CRITICAL: Only generates VALID sequences (no gaps)"

### Feature B: Grid Layout Calculator
- **Consumes:** Sequence count from Generator, tile size, gap, bed dimensions
- **Produces:** Grid dimensions (rows, cols), empty cell indices
- **Modulates:** Scan Analysis (determines sampling positions)
- **Quote:** "Calculate optimal grid dimensions to fit sequences. Returns rows, cols, width, height, emptyCells, fits boolean"

### Feature C: Color Extractor (Scan Analysis)
- **Consumes:** Scanned image, Grid Layout, Sequence Map
- **Produces:** Calibrated color palette (actual printed colors)
- **Modulates:** Image Quantizer (provides target palette)
- **Quote:** "Extract colors from scanned calibration grid. Uses grid-aligned sampling (not random!). Samples 5×5 pixel area at center of each tile"

### Feature D: Image Quantizer
- **Consumes:** Source image, calibrated palette from Extractor
- **Produces:** Quantized image (pixels mapped to palette colors)
- **Modulates:** Layer Expander (provides RGB values to look up in Sequence Map)
- **Quote:** "Quantize image data to palette with dithering. Modifies imageData in place! Finds closest color in palette for each pixel"

### Feature E: Layer Expander
- **Consumes:** Quantized image, Sequence Map
- **Produces:** Layer Maps (per-layer, per-filament pixel sets)
- **Modulates:** STL Generator (provides geometry data)
- **Quote:** "Expand quantized image to layer maps using sequence map. This is where the magic happens! Uses the sequence map to convert pixels to layers"

### Feature F: Pixel Vectorizer
- **Consumes:** Layer Maps (pixel sets)
- **Produces:** Rectangle arrays (optimized geometry)
- **Modulates:** STL Generator (reduces facet count)
- **Quote:** "Convert pixel set to rectangles using greedy merging. Optimization: Reduces STL file size dramatically!"

### Feature G: STL Generator
- **Consumes:** Rectangle arrays from Vectorizer
- **Produces:** ASCII STL files (one per filament)
- **Modulates:** User export (file download)
- **Quote:** "Generate STL box geometry (12 triangular facets). Generates: One STL per filament (all layers combined)"

---

## Architecture Diagram

```
User Input (N colors, M layers)
       ↓
[Sequence Generator] → sequences[], SequenceMap
       ↓                      ↓
[Grid Layout] ← sequences.length
   calculates rows, cols
       ↓
[Grid STL Export] → calibration STLs (for printing)
       ↓
User: Print grid & scan
       ↓
[Scan Image Upload]
       ↓
[Color Extractor] ← Grid Layout (sampling positions)
                  ← SequenceMap (sequence per color)
   extracts actual colors
       ↓
   [Calibrated Palette] (array of RGB)
       ↓
[Artwork Image Upload]
       ↓
[Image Quantizer] ← Calibrated Palette
   Floyd-Steinberg dithering
       ↓
   [Quantized Image] (ImageData)
       ↓
[Layer Expander] ← Quantized Image
                 ← SequenceMap (RGB → sequence lookup)
   expands pixels to layers
       ↓
   [Layer Maps] (Set[][] indexed by [layer][filament])
       ↓
[Pixel Vectorizer] ← Layer Maps
   greedy rectangle merging
       ↓
   [Rectangle Arrays]
       ↓
[STL Generator] ← Rectangle Arrays
   12-facet box geometry
       ↓
   [Artwork STL Files] (one per filament)
```

---

## GATE 0.5: Architecture Validation

### ❓ Can you trace data flow from input to output?
**[X] YES** — Every feature connects through the Sequence Map or feeds into the next stage

Data flow path:
1. User colors → Sequence Generator → SequenceMap
2. SequenceMap → Grid Layout → Grid STLs → Physical Print
3. Scanned Print → Color Extractor → Calibrated Palette
4. Image + Palette → Quantizer → Quantized Image
5. Quantized Image + SequenceMap → Layer Expander → Layer Maps
6. Layer Maps → Vectorizer → Rectangles → STL Generator → Files

### ❓ If design says "X modulates Y", does the diagram show data flow from X to Y?
**[X] YES** — All relationships verified:
- Sequence count → Grid Layout ✓ (sequences.length used in calculateGridLayout)
- Sequence Map → Layer Expansion ✓ (map.get(rgb_key) in expandToLayers)
- Calibration Grid → Quantization Palette ✓ (extracted colors used as palette)

### ❓ If design says "unified", is there ONE shared structure or multiple separate ones?
**[X] ONE** — The Sequence Map is THE central data structure:
- Built in Step 1 (Grid Generation)
- Populated in Step 2 (Scan Analysis - maps RGB to grid positions)
- Used in Step 3 (Layer Expansion - maps RGB to sequences)

### ❓ Can you explain how "modes" work without looking at the doc?
**[X] YES** — There are no "modes" in the traditional sense. This is a sequential pipeline where each step transforms data for the next step. The user progresses through 3 distinct stages (Generate → Scan → Quantize), but cannot switch between them arbitrarily - they must complete Step 1 before Step 2, etc.

---

## Passing Score: ✅ 100% YES

All gate questions answered YES. Proceeding to Phase 1.

---

## Requirements List (REQ_LIST)

### Must-Do Features:

1. **Generate Calibration Grid**
   - Select 2-10 filament colors from 72-color palette
   - Generate valid layer sequences (formula: `N × (N^M - 1) / (N - 1)`)
   - Build sequence map (RGB → sequence lookup)
   - Calculate grid layout (fit within bed dimensions)
   - Visualize grid on canvas
   - Export STL files (one per filament + base layer)
   - Export JSON (grid configuration for later reload)

2. **Analyze Scanned Grid**
   - Upload scanned calibration print (image file)
   - Auto-calculate scale from A4 dimensions
   - Allow manual alignment adjustment (offset X/Y)
   - Extract colors using grid-aligned sampling (5×5 pixel areas)
   - Build calibrated palette (actual printed colors)
   - Visualize extracted palette
   - Export palette as GPL file (GIMP format)

3. **Quantize & Export Artwork**
   - Upload artwork image (any size)
   - Quantize to calibrated palette using Floyd-Steinberg dithering
   - Apply min-detail spatial filter (remove unprintable small regions)
   - Expand pixels to layer maps using sequence map
   - Vectorize pixels (greedy rectangle merging)
   - Generate STL geometry (12-facet boxes)
   - Export STL files (one per filament, all layers combined)
   - Display quantized preview on canvas

4. **UI Requirements (SiteBoy Compliance)**
   - Maximum 4 tabs
   - All controls using ToolBase declarative config
   - Canvas: 30F (420px) for previews
   - VGA color palette for UI elements
   - No inline styles, no manual DOM manipulation
   - F-system dimensions throughout
   - Status messages for user feedback

5. **Algorithm Library Integration**
   - Extract all algorithms to `assets/js/shared/algorithms/`
   - Add @source/@wikipedia/@formula annotations
   - Pure functional code (no DOM, no side effects)
   - Tool file orchestrates algorithms, no duplication

---

*Phase 0 Complete: January 3, 2026*

