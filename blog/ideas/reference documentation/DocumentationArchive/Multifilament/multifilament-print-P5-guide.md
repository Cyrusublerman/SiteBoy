# Phase 5: Implementation Guide — Multifilament Image Print Tool

## File Structure

```
assets/js/tools/
└── multifilament-print/
    └── multifilament-print-tool.js   [NEW - Main tool file]

assets/data/pages/
└── tools/
    └── multifilament-print.json      [NEW - Page definition]
```

---

## ToolBase Wiring

### TOOL_CONFIG Structure

```javascript
export const TOOL_CONFIG = {
    name: 'Multifilament Image Print',
    description: 'Convert images to multi-color 3D printable STL files',
    category: 'fabrication',
    
    // 4 tabs matching P3.5 design
    tabs: [
        { key: 'source', label: 'Source' },
        { key: 'controls', label: 'Controls' },
        { key: 'canvas', label: 'Canvas' },
        { key: 'export', label: 'Export' }
    ],
    
    // Parameter state (27 controls from P3.5)
    parameters: {
        // Source tab
        sourceImage: null,
        scanImage: null,
        
        // Controls tab - Grid
        filamentCount: 4,
        layerCount: 4,
        tileSize: 10,
        gap: 1,
        bedWidth: 256,
        bedHeight: 256,
        scanWidth: 210,
        scanHeight: 297,
        
        // Controls tab - Alignment
        offsetX: 0,
        offsetY: 0,
        scaleX: 11.81,
        scaleY: 11.81,
        
        // Controls tab - Quantize
        printWidth: 170,
        ditherStrength: 1.0,
        minDetail: 0.8,
        
        // Export tab - STL
        layerHeight: 0.08,
        
        // Internal state (not exposed as controls)
        sequences: [],
        sequenceMap: null,
        gridData: null,
        palette: [],
        quantizedImage: null,
        layerMaps: []
    },
    
    // UI definition
    controls: {
        source: [
            { type: 'file', key: 'sourceImage', label: 'Source Image', accept: 'image/*' },
            { type: 'file', key: 'scanImage', label: 'Scan Image', accept: 'image/*' },
            { type: 'button', key: 'generateGrid', label: 'Generate Grid' },
            { type: 'button', key: 'analyzeScan', label: 'Analyze Scan' }
        ],
        controls: [
            // Grid block
            { type: 'heading', label: 'Grid' },
            { type: 'slider', key: 'filamentCount', label: 'Filaments', min: 2, max: 8, step: 1 },
            { type: 'slider', key: 'layerCount', label: 'Layers', min: 2, max: 8, step: 1 },
            { type: 'slider', key: 'tileSize', label: 'Tile Size (mm)', min: 5, max: 20, step: 1 },
            { type: 'slider', key: 'gap', label: 'Gap (mm)', min: 0, max: 5, step: 0.5 },
            { type: 'slider', key: 'bedWidth', label: 'Bed Width (mm)', min: 100, max: 400, step: 1 },
            { type: 'slider', key: 'bedHeight', label: 'Bed Height (mm)', min: 100, max: 400, step: 1 },
            { type: 'slider', key: 'scanWidth', label: 'Scan Width (mm)', min: 100, max: 300, step: 1 },
            { type: 'slider', key: 'scanHeight', label: 'Scan Height (mm)', min: 100, max: 400, step: 1 },
            
            // Alignment block
            { type: 'heading', label: 'Alignment' },
            { type: 'slider', key: 'offsetX', label: 'Offset X (px)', min: -500, max: 500, step: 1 },
            { type: 'slider', key: 'offsetY', label: 'Offset Y (px)', min: -500, max: 500, step: 1 },
            { type: 'slider', key: 'scaleX', label: 'Scale X (px/mm)', min: 1, max: 30, step: 0.01 },
            { type: 'slider', key: 'scaleY', label: 'Scale Y (px/mm)', min: 1, max: 30, step: 0.01 },
            
            // Quantize block
            { type: 'heading', label: 'Quantize' },
            { type: 'slider', key: 'printWidth', label: 'Print Width (mm)', min: 50, max: 300, step: 1 },
            { type: 'slider', key: 'ditherStrength', label: 'Dither', min: 0, max: 1, step: 0.1 },
            { type: 'slider', key: 'minDetail', label: 'Min Detail (mm)', min: 0, max: 2, step: 0.1 },
            { type: 'button', key: 'quantize', label: 'Quantize' }
        ],
        canvas: [
            { type: 'dropdown', key: 'canvasMode', label: 'Mode', options: ['Source', 'Scan', 'Grid', 'Quantized', 'Layer 0', 'Layer 1', 'Layer 2', 'Layer 3'] }
        ],
        export: [
            { type: 'slider', key: 'layerHeight', label: 'Layer Height (mm)', min: 0.04, max: 0.3, step: 0.01 },
            { type: 'button', key: 'exportSTL', label: 'Export STL' },
            { type: 'button', key: 'exportPalette', label: 'Export Palette (GPL)' },
            { type: 'button', key: 'exportJSON', label: 'Export JSON' },
            { type: 'button', key: 'exportGrid', label: 'Export Grid PNG' }
        ]
    }
};
```

---

## Lifecycle Hook Implementation

### onInit()
```javascript
onInit() {
    // Initialize canvas
    this.canvas = this.getCanvas();
    this.ctx = this.canvas.getContext('2d');
    
    // Set initial canvas mode
    this.params.canvasMode = 'Source';
    
    // No animation loop needed (static renders)
}
```

### onUpdate(changedParams)
```javascript
onUpdate(changedParams) {
    // Handle file uploads
    if (changedParams.sourceImage) {
        this.loadSourceImage();
    }
    if (changedParams.scanImage) {
        this.loadScanImage();
    }
    
    // Handle grid parameter changes
    if (['filamentCount', 'layerCount', 'tileSize', 'gap', 'bedWidth', 'bedHeight', 'scanWidth', 'scanHeight'].some(k => changedParams[k])) {
        this.recalculateGrid();
    }
    
    // Handle canvas mode change
    if (changedParams.canvasMode) {
        this.renderCanvas();
    }
    
    // Trigger canvas render on any change
    this.renderCanvas();
}
```

### onDraw()
```javascript
onDraw() {
    // No continuous animation - renders happen on demand via renderCanvas()
}
```

### onDestroy()
```javascript
onDestroy() {
    // Clean up image references
    this.sourceImageData = null;
    this.scanImageData = null;
    
    // No animators to destroy (static tool)
}
```

---

## Pipeline Methods

### Method Map (Requirements → Implementation)

| Requirement | Method | Algorithm Used | Status |
|-------------|--------|----------------|--------|
| Generate sequences | `generateGridAction()` | `generateSequences()` | ✅ Ready |
| Build sequence map | `generateGridAction()` | `buildSequenceMap()` | ✅ Ready |
| Calculate grid layout | `generateGridAction()` | `calculateGridLayout()` | ✅ Ready |
| Render calibration grid | `renderGridPNG()` | Canvas 2D + VGA colors | ✅ Ready |
| Load scan image | `loadScanImage()` | FileReader + Canvas | ✅ Ready |
| Extract colors from scan | `analyzeScanAction()` | `extractColors()` | ✅ Ready |
| Load source image | `loadSourceImage()` | FileReader + Canvas | ✅ Ready |
| Quantize image | `quantizeAction()` | `quantizeImage()` | ✅ Ready |
| Apply min detail filter | `quantizeAction()` | `applyMinDetailFilter()` | ✅ Ready |
| Expand to layers | `quantizeAction()` | `expandToLayers()` | ✅ Ready |
| Export STL files | `exportSTLAction()` | `exportArtworkSTLs()` | ✅ Ready |
| Export palette GPL | `exportPaletteAction()` | `generateGPL()` | ✅ Ready |
| Export JSON config | `exportJSONAction()` | `JSON.stringify()` | ✅ Ready |
| Export grid PNG | `exportGridAction()` | Canvas → Blob | ✅ Ready |
| Render source view | `renderCanvas()` | Canvas drawImage | ✅ Ready |
| Render scan view | `renderCanvas()` | Canvas + grid overlay | ✅ Ready |
| Render quantized view | `renderCanvas()` | ImageData → Canvas | ✅ Ready |
| Render layer view | `renderCanvas()` | Layer pixels → Canvas | ✅ Ready |

### Implementation Methods

#### 1. Generate Grid Action
```javascript
generateGridAction() {
    const { filamentCount, layerCount, tileSize, gap, bedWidth, bedHeight, scanWidth, scanHeight } = this.params;
    
    // Generate sequences
    this.params.sequences = generateSequences(filamentCount, layerCount);
    
    // Calculate grid layout
    const constraints = calculateConstraints({ bedW: bedWidth, bedH: bedHeight, scanW: scanWidth, scanH: scanHeight });
    this.params.gridData = calculateGridLayout({
        sequenceCount: this.params.sequences.length,
        tileSize,
        gap,
        maxWidth: constraints.maxWidth,
        maxHeight: constraints.maxHeight
    });
    
    if (!this.params.gridData.fits) {
        this.showError(this.params.gridData.error);
        return;
    }
    
    this.showStatus(`Grid: ${this.params.gridData.cols}×${this.params.gridData.rows} = ${this.params.sequences.length} tiles`);
}
```

#### 2. Analyze Scan Action
```javascript
analyzeScanAction() {
    if (!this.scanImageData || !this.params.gridData) {
        this.showError('Load scan image and generate grid first');
        return;
    }
    
    const { palette, colorMap } = extractColors(
        this.canvas,
        {
            sequences: this.params.sequences,
            rows: this.params.gridData.rows,
            cols: this.params.gridData.cols,
            tileSize: this.params.tileSize,
            gap: this.params.gap
        },
        {
            offsetX: this.params.offsetX,
            offsetY: this.params.offsetY,
            scaleX: this.params.scaleX,
            scaleY: this.params.scaleY
        }
    );
    
    this.params.palette = palette;
    
    // Build sequence map
    this.params.sequenceMap = buildSequenceMap(
        this.params.sequences,
        palette,
        this.params.gridData.cols,
        { simColour, rgb_to_key }
    );
    
    this.showStatus(`Extracted ${palette.length} colors`);
}
```

#### 3. Quantize Action
```javascript
quantizeAction() {
    if (!this.sourceImageData || !this.params.palette.length) {
        this.showError('Load source image and analyze scan first');
        return;
    }
    
    // Step 1: Quantize
    const quantized = quantizeImage(this.sourceImageData, this.params.palette, {
        ditherStrength: this.params.ditherStrength
    });
    
    // Step 2: Min detail filter
    const filtered = applyMinDetailFilter(quantized, this.params.palette, this.params.minDetail, this.params.printWidth);
    
    this.params.quantizedImage = filtered;
    
    // Step 3: Expand to layers
    this.params.layerMaps = expandToLayers(filtered, this.params.sequenceMap, this.params.filamentCount);
    
    this.showStatus(`Quantized to ${this.params.palette.length} colors`);
}
```

#### 4. Export STL Action
```javascript
exportSTLAction() {
    if (!this.params.layerMaps.length) {
        this.showError('Quantize image first');
        return;
    }
    
    const filamentNames = this.params.palette.map((c, i) => `Filament_${i + 1}`);
    
    const stls = exportArtworkSTLs(
        this.params.layerMaps,
        filamentNames,
        {
            imageWidth: this.sourceImageData.width,
            imageHeight: this.sourceImageData.height,
            printWidth: this.params.printWidth,
            layerHeight: this.params.layerHeight
        }
    );
    
    // Download each STL file
    Object.entries(stls).forEach(([filename, content]) => {
        this.downloadFile(filename, content, 'text/plain');
    });
    
    this.showStatus(`Exported ${Object.keys(stls).length} STL files`);
}
```

#### 5. Render Canvas (Mode-based)
```javascript
renderCanvas() {
    const mode = this.params.canvasMode;
    
    switch (mode) {
        case 'Source':
            if (this.sourceImageData) {
                this.ctx.putImageData(this.sourceImageData, 0, 0);
            }
            break;
            
        case 'Scan':
            if (this.scanImageData) {
                this.ctx.putImageData(this.scanImageData, 0, 0);
                if (this.params.gridData) {
                    drawGridOverlay(this.canvas, this.params.gridData, {
                        offsetX: this.params.offsetX,
                        offsetY: this.params.offsetY,
                        scaleX: this.params.scaleX,
                        scaleY: this.params.scaleY
                    });
                }
            }
            break;
            
        case 'Quantized':
            if (this.params.quantizedImage) {
                this.ctx.putImageData(this.params.quantizedImage, 0, 0);
            }
            break;
            
        case 'Layer 0':
        case 'Layer 1':
        case 'Layer 2':
        case 'Layer 3':
            const layerIndex = parseInt(mode.split(' ')[1]);
            this.renderLayerView(layerIndex);
            break;
    }
}
```

---

## Export Strategy

### File Downloads (Browser-Based)

All exports use the download helper:

```javascript
downloadFile(filename, content, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}
```

### Export Formats

| Format | Method | MIME Type | Use Case |
|--------|--------|-----------|----------|
| STL | `exportSTLAction()` | `text/plain` | 3D printing |
| GPL | `exportPaletteAction()` | `text/plain` | GIMP palette |
| JSON | `exportJSONAction()` | `application/json` | Config backup |
| PNG | `exportGridAction()` | `image/png` | Calibration print |

---

## Animation Foundation Usage

**None required** - This is a static tool with on-demand renders only.

No `AnimationLoop`, no `FrameSequencer`, no `IntervalAnimator`.

All rendering triggered via `onUpdate()` when parameters change.

---

## Asset Loader Usage

**File uploads handled via ToolBase file input controls:**

```javascript
{ type: 'file', key: 'sourceImage', accept: 'image/*' }
{ type: 'file', key: 'scanImage', accept: 'image/*' }
```

No external asset loading needed.

---

## Registration Steps

### 1. Create page JSON

**File:** `assets/data/pages/tools/multifilament-print.json`

```json
{
    "header": "Multifilament Image Print",
    "subheader": "Convert images to multi-color 3D printable STL files using calibrated printer profiles",
    "url": "/tools/multifilament-image-print",
    "blocks": [
        {
            "type": "CanvasWidget",
            "props": {
                "toolPath": "./tools/multifilament-print/multifilament-print-tool.js",
                "toolClass": "MultifilamentPrintTool"
            }
        }
    ]
}
```

### 2. No router changes needed

ToolsSection automatically discovers JSON pages in `assets/data/pages/tools/`.

### 3. Verify page navigation

Navigate to `/tools/multifilament-image-print` after implementation.

---

## Gaps & Limitations

### Known Gaps

1. **No palette editing UI** - User cannot manually adjust extracted colors
   - Workaround: Edit GPL file externally and re-import
   - Future: Add color picker controls

2. **No real-time scan alignment** - Must manually adjust offset/scale sliders
   - Workaround: Visual feedback via grid overlay
   - Future: Auto-detect corners/markers

3. **No image preview scaling** - Large images may exceed canvas size
   - Workaround: Canvas auto-sizes to container
   - Future: Add zoom/pan controls

4. **No progress indicators** - Heavy operations (quantize, STL export) block UI
   - Workaround: Show status messages
   - Future: Use Web Workers for off-thread processing

5. **No undo/redo** - Parameter changes are immediate and irreversible
   - Workaround: Export/import JSON configs
   - Future: Implement history stack

### Architecture Limitations

1. **Browser memory constraints** - Large images (>2000px) may cause slowdowns
   - Solution: Document recommended image sizes (<1000px)

2. **STL file size** - ASCII STL files can be very large (100MB+)
   - Solution: Vectorization reduces size significantly
   - Future: Binary STL export

3. **No multi-image batch processing** - One image at a time
   - Solution: Design decision (keep tool focused)

---

## Testing Checklist

### Unit-Level Tests (Manual)

- [ ] Grid generation: Try N=2-8, M=2-8
- [ ] Grid layout: Test with various bed/scan sizes
- [ ] Sequence count: Verify formula N^M - ...
- [ ] File upload: Test JPG, PNG, WebP images
- [ ] Scan analysis: Test alignment with known grids
- [ ] Color extraction: Verify palette correctness
- [ ] Quantization: Test with/without dither
- [ ] Min detail filter: Verify spatial filtering
- [ ] Layer expansion: Check pixel→layer mapping
- [ ] STL export: Verify file validity (import to slicer)
- [ ] GPL export: Import to GIMP, verify colors
- [ ] JSON export/import: Verify state preservation
- [ ] Grid PNG export: Verify dimensions

### Integration Tests (Workflow)

- [ ] Full workflow: Grid → Scan → Quantize → Export
- [ ] Parameter persistence: Change values, verify state
- [ ] Canvas modes: Cycle through all modes
- [ ] Error handling: Try actions in wrong order
- [ ] File downloads: Verify all 4 export formats
- [ ] UI responsiveness: Test on smaller viewports
- [ ] Tab navigation: Verify all 4 tabs function

### Real-World Tests

- [ ] Print calibration grid on real printer
- [ ] Scan with real scanner (300 DPI recommended)
- [ ] Process full-resolution photo (800×600)
- [ ] Slice STL files in PrusaSlicer/Cura
- [ ] Print test artwork to validate colors

---

## Requirements Satisfaction Table

| ID | Requirement | Method | Algorithm | Status |
|----|-------------|--------|-----------|--------|
| R1 | Generate valid sequences | `generateGridAction()` | `generateSequences()` | ✅ Ready |
| R2 | Build RGB→sequence map | `analyzeScanAction()` | `buildSequenceMap()` | ✅ Ready |
| R3 | Calculate grid layout | `generateGridAction()` | `calculateGridLayout()` | ✅ Ready |
| R4 | Render calibration grid | `renderGridPNG()` | Canvas 2D API | ✅ Ready |
| R5 | Extract scan colors | `analyzeScanAction()` | `extractColors()` | ✅ Ready |
| R6 | Grid-aligned sampling | `analyzeScanAction()` | `extractColors()` | ✅ Ready |
| R7 | Quantize with dithering | `quantizeAction()` | `quantizeImage()` | ✅ Ready |
| R8 | Min detail filtering | `quantizeAction()` | `applyMinDetailFilter()` | ✅ Ready |
| R9 | Expand pixels to layers | `quantizeAction()` | `expandToLayers()` | ✅ Ready |
| R10 | Vectorize pixels | `exportSTLAction()` | `vectorizePixels()` | ✅ Ready |
| R11 | Generate STL geometry | `exportSTLAction()` | `generateBox()` | ✅ Ready |
| R12 | Export multiple STLs | `exportSTLAction()` | `exportArtworkSTLs()` | ✅ Ready |
| R13 | Export GIMP palette | `exportPaletteAction()` | `generateGPL()` | ✅ Ready |
| R14 | Export JSON config | `exportJSONAction()` | JSON.stringify | ✅ Ready |
| R15 | Export grid PNG | `exportGridAction()` | Canvas.toBlob | ✅ Ready |
| R16 | Multi-mode canvas | `renderCanvas()` | Switch statement | ✅ Ready |
| R17 | Parameter controls | ToolBase | ComponentLibrary | ✅ Ready |
| R18 | File upload | ToolBase | FileReader API | ✅ Ready |
| R19 | 4-tab UI | TOOL_CONFIG | ToolBase tabs | ✅ Ready |
| R20 | VGA color system | Rendering | CSS variables | ✅ Ready |

**Total Requirements:** 20
**Satisfied:** 20 (100%)
**Ready for Implementation:** YES

---

## Implementation Timeline Estimate

| Task | Time | Dependencies |
|------|------|--------------|
| Create TOOL_CONFIG | 30 min | None |
| Implement lifecycle hooks | 1 hour | TOOL_CONFIG |
| Implement grid generation | 1 hour | Algorithms |
| Implement scan analysis | 1 hour | Algorithms |
| Implement quantization | 1.5 hours | Algorithms |
| Implement STL export | 1 hour | Algorithms |
| Implement canvas rendering | 2 hours | All above |
| Implement file I/O | 1 hour | Browser APIs |
| Create page JSON | 15 min | None |
| Testing & debugging | 3 hours | All above |
| **TOTAL** | **12 hours** | |

---

## Phase 5 Gate Validation

### ❓ Implementation guide generated separately?
**[X] YES** - This document

### ❓ File structure + registration steps listed?
**[X] YES** - File structure section + registration section

### ❓ ToolBase wiring + animation/export plans specified?
**[X] YES** - Lifecycle hooks + export strategy sections

### ❓ Mapping table (requirements → satisfaction → status)?
**[X] YES** - Requirements satisfaction table + method map

### ❓ Gaps and tests enumerated?
**[X] YES** - Gaps section + testing checklist

---

## Passing Score: ✅ 100% YES

Ready to proceed with implementation.

---

*Phase 5 Guide completed: January 3, 2026*
*Implementation ready: YES*
*Estimated completion: 12 hours*

