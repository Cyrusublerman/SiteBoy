# Phase 1: Technique Extraction — Multifilament Image Print Tool

## Techniques by Requirement

### REQ 1: Generate Calibration Grid

| Technique | Role | Data Source | Data Sink | Integration |
|-----------|------|-------------|-----------|-------------|
| **SequenceGenerator** | Generator | User params (N colors, M layers) | sequences[], SequenceMap | "Generate all possible layer sequences for N colours and M layers" — produces the foundational data structure |
| **SequenceMapBuilder** | Generator | sequences[], colours[] | SequenceMap | "Build sequence map (RGB color -> sequence data). This map is CRITICAL for the entire workflow" |
| **GridLayoutCalculator** | Transformer | sequences[] (count), tile params | GridLayout {rows, cols, width, height, emptyCells} | "Calculate optimal grid dimensions to fit sequences" — uses sequence count to determine grid size |
| **GridRenderer** | Renderer | GridLayout, SequenceMap | Canvas pixels | "Render calibration grid on canvas" — visualizes the grid for user verification |
| **GridSTLExporter** | Renderer | GridLayout, SequenceMap, layer params | STL file strings | "Export calibration grid as STL files. Generates: Base layer STL + One STL per filament" |
| **GridJSONExporter** | Renderer | GridLayout, SequenceMap, config | JSON string | "Export grid configuration as JSON" — allows saving/loading grid state |

### REQ 2: Analyze Scanned Grid

| Technique | Role | Data Source | Data Sink | Integration |
|-----------|------|-------------|-----------|-------------|
| **ScaleCalculator** | Transformer | scan dimensions, grid dimensions, A4 size | {scaleX, scaleY} | "Calculate scale from A4 scan dimensions" — auto-compute pixels-per-mm |
| **ColorExtractor** | Transformer | scan canvas, GridLayout, alignment params | palette[] (RGB), colorMap | "Extract colors from scanned calibration grid. Uses grid-aligned sampling (not random!)" — samples from tile centers |
| **PaletteRenderer** | Renderer | palette[] | Canvas swatches | Visualizes extracted colors for user verification |
| **GPLExporter** | Renderer | palette[], name | GPL file string | "Generate GPL file content from palette" — exports GIMP-compatible palette |

### REQ 3: Quantize & Export Artwork

| Technique | Role | Data Source | Data Sink | Integration |
|-----------|------|-------------|-----------|-------------|
| **ImageQuantizer** | Transformer | ImageData, palette[], dither option | ImageData (modified) | "Quantize image data to palette with dithering. Modifies imageData in place!" — Floyd-Steinberg algorithm |
| **MinDetailFilter** | Transformer | ImageData, palette[], minDetailMM, printWidth | Uint8Array (mask) | "Filter small isolated regions for printability" — spatial analysis prevents unprintable details |
| **LayerExpander** | Transformer | ImageData (quantized), SequenceMap, filamentCount | layerMaps[][] (Set per layer/filament) | "Expand to layers using sequence map. This is where the magic happens! Uses the sequence map to convert pixels to layers" |
| **PixelVectorizer** | Transformer | pixelSet (Set), image dimensions | rectangles[] {x,y,w,h} | "Vectorize pixel set into rectangles using greedy merging. Optimization: Reduces STL file size dramatically!" |
| **STLBoxGenerator** | Generator | box dimensions (x0,y0,z0,x1,y1,z1) | STL facet string | "Generate STL box geometry (12 triangular facets)" — creates individual 3D boxes |
| **ArtworkSTLExporter** | Renderer | layerMaps[][], filamentNames[], config | STL file strings | "Export artwork as STL files. Generates: One STL per filament (all layers combined)" |
| **PreviewRenderer** | Renderer | ImageData (quantized) | Canvas pixels | Displays quantized result for user verification |

### REQ 4: UI Requirements

| Technique | Role | Data Source | Data Sink | Integration |
|-----------|------|-------------|-----------|-------------|
| **ToolBaseIntegrator** | Transformer | Tool config, user inputs | Tool state, UI updates | Manages UI ↔ algorithm integration via ToolBase declarative config |
| **StateManager** | Transformer | User actions | Tool state (sourceImage, palette, sequenceMap, etc.) | Coordinates state across 3-step workflow |
| **StatusReporter** | Renderer | Tool state, operation results | Status messages | Provides user feedback at each step |

### REQ 5: Algorithm Library Integration

| Technique | Role | Data Source | Data Sink | Integration |
|-----------|------|-------------|-----------|-------------|
| **AlgorithmExtractor** | N/A (meta) | Reference impl in lib/ | Algorithms library files | Extracts pure functions with @source citations |

---

## Technique Glossary

| Technique | Role | Reads | Writes | ReqLink |
|-----------|------|-------|--------|---------|
| SequenceGenerator | Generator | N (colors), M (layers) | sequences[] | REQ1 |
| SequenceMapBuilder | Generator | sequences[], colours[] | SequenceMap | REQ1 |
| GridLayoutCalculator | Transformer | sequences.length, tileSize, gap, bedW, bedH | GridLayout | REQ1 |
| GridRenderer | Renderer | GridLayout, SequenceMap | Canvas | REQ1 |
| GridSTLExporter | Renderer | GridLayout, SequenceMap, layerH, baseLayers | STL strings | REQ1 |
| GridJSONExporter | Renderer | GridLayout, SequenceMap, config | JSON string | REQ1 |
| ScaleCalculator | Transformer | scanW, scanH, gridW, gridH, a4W, a4H | {scaleX, scaleY} | REQ2 |
| ColorExtractor | Transformer | scanCanvas, GridLayout, alignment | palette[], colorMap | REQ2 |
| PaletteRenderer | Renderer | palette[] | Canvas | REQ2 |
| GPLExporter | Renderer | palette[], name | GPL string | REQ2 |
| ImageQuantizer | Transformer | ImageData, palette[], options | ImageData (mutated) | REQ3 |
| MinDetailFilter | Transformer | ImageData, palette[], minDetailMM, printWidth | Uint8Array mask | REQ3 |
| LayerExpander | Transformer | ImageData, SequenceMap, filamentCount | layerMaps[][] | REQ3 |
| PixelVectorizer | Transformer | pixelSet, width, height | rectangles[] | REQ3 |
| STLBoxGenerator | Generator | x0,y0,z0,x1,y1,z1 | STL facet string | REQ3 |
| ArtworkSTLExporter | Renderer | layerMaps[][], filamentNames[], config | STL strings | REQ3 |
| PreviewRenderer | Renderer | ImageData | Canvas | REQ3 |
| ToolBaseIntegrator | Transformer | TOOL_CONFIG, user events | Tool state | REQ4 |
| StateManager | Transformer | User actions | Tool state vars | REQ4 |
| StatusReporter | Renderer | Tool state | Status text | REQ4 |

---

## Dependency Graph

```
Step 1: Grid Generation
=====================
User Input (N, M, colours)
    ↓
SequenceGenerator → sequences[]
    ↓
SequenceMapBuilder → SequenceMap (CORE_DATA)
    ↓
GridLayoutCalculator → GridLayout
    ↓
├── GridRenderer → Canvas Display
├── GridSTLExporter → STL Files (for physical printing)
└── GridJSONExporter → JSON Config

Step 2: Scan Analysis
=====================
Scanned Image Upload
    ↓
ScaleCalculator → {scaleX, scaleY}
    ↓
ColorExtractor ← GridLayout (from Step 1)
               ← SequenceMap (from Step 1)
    ↓
palette[] (extracted colors)
    ↓
├── PaletteRenderer → Canvas Display
└── GPLExporter → GPL File

Step 3: Artwork Processing
===========================
Artwork Image Upload
    ↓
ImageData extraction
    ↓
MinDetailFilter → mask (Uint8Array)
    ↓
ImageQuantizer ← palette[] (from Step 2)
               ← mask
    ↓
quantized ImageData
    ↓
LayerExpander ← SequenceMap (from Step 1)
    ↓
layerMaps[][] (per layer, per filament)
    ↓
PixelVectorizer → rectangles[]
    ↓
STLBoxGenerator → box geometry (called for each rectangle)
    ↓
ArtworkSTLExporter → STL Files (one per filament)

Preview Path:
quantized ImageData → PreviewRenderer → Canvas Display

UI Coordination:
==================
User Events → StateManager → Tool State → StatusReporter → UI Feedback
                ↑                ↓
                └── ToolBaseIntegrator (orchestrates all above)
```

---

## GATE 1: Technique Integration Verification

### ❓ For EACH technique, can you name what data structure it reads/writes?

**[X] YES** — All techniques verified:

**Generators:**
- SequenceGenerator: reads (N, M) → writes sequences[]
- SequenceMapBuilder: reads sequences[], colours[] → writes SequenceMap ✓
- STLBoxGenerator: reads box coords → writes STL facet string ✓

**Transformers:**
- GridLayoutCalculator: reads sequences.length → writes GridLayout ✓
- ScaleCalculator: reads dimensions → writes {scaleX, scaleY} ✓
- ColorExtractor: reads scanCanvas, GridLayout → writes palette[] ✓
- ImageQuantizer: reads ImageData, palette[] → writes ImageData (mutated) ✓
- MinDetailFilter: reads ImageData → writes mask ✓
- LayerExpander: reads ImageData, SequenceMap → writes layerMaps[][] ✓
- PixelVectorizer: reads pixelSet → writes rectangles[] ✓
- StateManager: reads user events → writes tool state vars ✓

**Renderers:**
- GridRenderer, PaletteRenderer, PreviewRenderer: read data → write canvas pixels ✓
- GridSTLExporter, ArtworkSTLExporter: read data → write STL strings ✓
- GPLExporter: reads palette[] → writes GPL string ✓
- StatusReporter: reads tool state → writes status text ✓

All 20 techniques have clear I/O.

### ❓ Can you trace a path from Generator to Renderer through transformers?

**[X] YES** — Complete pipeline paths:

**Path 1 (Grid Generation):**
```
SequenceGenerator (G) → SequenceMapBuilder (G) → GridLayoutCalculator (T) → GridRenderer (R)
                                                                          → GridSTLExporter (R)
```

**Path 2 (Scan Analysis):**
```
ScaleCalculator (T) → ColorExtractor (T) → PaletteRenderer (R)
                                         → GPLExporter (R)
```

**Path 3 (Artwork Processing):**
```
MinDetailFilter (T) → ImageQuantizer (T) → LayerExpander (T) → PixelVectorizer (T) → ArtworkSTLExporter (R)
                                                                                    → STLBoxGenerator (G) ↗
                                        → PreviewRenderer (R)
```

All paths connect Generator/Transformer → Renderer.

### ❓ If idea doc says "X determined by Y", is Y before X in dependency graph?

**[X] YES** — Dependencies verified:

1. **"Sequence count determines grid layout"**
   - Y (SequenceGenerator) → X (GridLayoutCalculator) ✓
   - sequences.length used in calculateGridLayout

2. **"Sequence map enables layer expansion"**
   - Y (SequenceMapBuilder) → X (LayerExpander) ✓
   - SequenceMap passed to expandToLayers

3. **"Calibrated palette determines quantization"**
   - Y (ColorExtractor) → X (ImageQuantizer) ✓
   - palette[] used in quantizeImage

4. **"Grid layout determines sampling positions"**
   - Y (GridLayoutCalculator) → X (ColorExtractor) ✓
   - GridLayout used to calculate tile centers

All dependencies correctly ordered.

---

## Passing Score: ✅ 100% YES

All gate questions answered YES. Proceeding to Phase 2.

---

*Phase 1 Complete: January 3, 2026*

