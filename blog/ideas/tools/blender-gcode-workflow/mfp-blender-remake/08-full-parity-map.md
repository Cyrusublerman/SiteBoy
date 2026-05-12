# MFP Blender Remake — Full Parity Map

## 1. Purpose

This file is the coverage gate for a faithful Blender remake of the Multifilament Print Calibration tool.

Nothing is considered fully specified until it appears in this map with:

```text
current behaviour
maths / data
Blender equivalent
owner
coverage status
```

## 2. Source Material

Documentation authority:

- `blog/docs/pages/tools/multifilament-print.md`
- `blog/docs/pages/tools/MFP/source.md`
- `blog/docs/pages/tools/MFP/scan.md`
- `blog/docs/pages/tools/MFP/quantize.md`

Implementation authority:

- `assets/js/tools/fabrication/multifilament-print/MFP-Main.js`
- `assets/js/tools/fabrication/multifilament-print/MFP-Constants.js`
- `assets/js/tools/fabrication/multifilament-print/MFP-SourceActions.js`
- `assets/js/tools/fabrication/multifilament-print/MFP-ScanActions.js`
- `assets/js/tools/fabrication/multifilament-print/MFP-QuantizeActions.js`
- `assets/js/tools/fabrication/multifilament-print/MFP-ExportActions.js`
- `assets/js/tools/fabrication/multifilament-print/MFP-GridRenderer.js`
- `assets/js/tools/fabrication/multifilament-print/MFP-ScanRenderer.js`
- `assets/js/tools/fabrication/multifilament-print/MFP-Utils.js`
- `assets/js/tools/fabrication/multifilament-print/ProjectStatusBar.js`

Algorithm authority:

- `assets/js/shared/algorithms/combinatorics/sequences.js`
- `assets/js/shared/algorithms/layout/grid-layout.js`
- `assets/js/shared/algorithms/color/color-utils.js`
- `assets/js/shared/algorithms/color/color-space.js`
- `assets/js/shared/algorithms/dither/error-diffusion.js`
- `assets/js/shared/algorithms/dither/ordered.js`
- `assets/js/shared/algorithms/dither/nearest-color.js`
- `assets/js/shared/algorithms/geometry/stl-generation.js`

## 3. Coverage Status Values

| Status | Meaning |
|--------|---------|
| covered | Blender remake spec contains exact behaviour |
| partial | concept exists, details missing |
| conflict | docs and implementation disagree |
| missing | not yet specified |
| deferred | intentionally not in first Blender remake |

## 4. Workflow Parity

| Feature | Current Behaviour | Blender Equivalent | Owner | Status |
|---------|-------------------|--------------------|-------|--------|
| SOURCE tab | Generate grid, sequences, preview, exports | Blender calibration grid generator | `MFP_*` GN + Python import/export | partial |
| SCAN tab | Load/reference grid, align scan, sample colours | Initially import scan results; later Blender scan mode | Python import first | partial |
| QUANTIZE tab | Image to sequence map with dither/optimisation | Import or run quantise then generate geometry | Python/image preprocess + GN geometry | partial |
| OUTPUTS tab | Download grid/scans/quant/artwork/STL/ZIP | Blender export package + nozzleboss | Python + nozzleboss | partial |
| Canvas toolbar | Auto/source/scan/grid/quantised/output views, save/load | Blender viewport/debug collections | Blender scene + optional UI | missing |
| Info/docs toggle | In-canvas docs overlay per tab | Not needed for Blender MVP | Docs/Blender text block optional | deferred |

## 5. SOURCE Parity

| Feature | Current Behaviour | Maths / Data | Blender Equivalent | Status |
|---------|-------------------|--------------|--------------------|--------|
| Filament palette | 30 Bambu PLA Basic entries in implementation, docs mention 29 | `{h,n}` list | Blender material/data table | partial |
| Filament picker | 2-10 colours; badges/search in docs | selected palette indices | UI/Python property list | partial |
| Bed constraints | default implementation `256x256`, docs mention `220x220` | `bedWidth`, `bedHeight` | `MFP_Params` | conflict |
| Scan constraints | implementation `210x297`, docs mention `200x200` in some places | `scanWidth`, `scanHeight` | `MFP_Params` | conflict |
| Layers per tile | 1-10; implementation default 6, docs often default 4 | `layerCount` | `MFP_Params` | conflict |
| Base layers | default implementation 3, docs often 2 | `baseLayers` | `MFP_Params` | conflict |
| Top layers | default 0; reserved/future but UI exists | `topLayers`, `topFilament` | `MFP_Params` | partial |
| Layer height | 0.04-0.4, default 0.08 | mm | shared print params | covered |
| Tile size | 2-20, default 10 | mm | grid/tile generator | covered |
| Gap | 0-5, implementation default 1, docs often 2 | mm | gap geometry/path | conflict |
| Perimeter margin | 0-10 default 0 | mm | grid layout | covered |
| Fill gaps/perimeter | toggle + fill filament | `gapFillOptions`, `gapFilament` | `MFP_GAP_*` | partial |
| Sort method | Layer Count, Base Color, Top Color, Complexity, Lexicographic | `sortSequences()` | `MFP_SEQ_Sort` | partial |
| Canvas view | Combined, Layer 0-3 | display mode | debug collection/view | missing |
| Generate grid | creates `gridData`, `sequences`, `sequenceMap` | layout + sequences | GN/Python generator | partial |
| Generate split grids | splits oversized grids | chunk sequences by max fit | Python/grid batch | missing |
| Export grid PNG | 300 DPI | mm/25.4*300 | Blender render or Python image | missing |
| Export grid STL | per-filament STL from grid layer maps | boxes/gap geometry | optional STL fallback | partial |
| Export grid CSV | sequence reference | CSV rows | Python export | missing |
| Complete package | ZIP with grid, images, STLs, scan, quant data | JSZip package | Python package export | missing |

## 6. SCAN Parity

| Feature | Current Behaviour | Maths / Data | Blender Equivalent | Status |
|---------|-------------------|--------------|--------------------|--------|
| Import project ZIP | grid-layout/layout plus scan artefacts | JSON/ZIP parse | Python importer | partial |
| Import grid CSV | reconstruct sequences/grid | Sequence column | Python importer | missing |
| Use last grid | loads in-memory `gridData` | shared state | Blender scene state | missing |
| View reference grid | popup rendered at 150 DPI | `drawCalibrationGrid()` | Blender preview/render | missing |
| Re-sort grid | applies `sortSequences()` | method map | Python/GN sort | partial |
| Scan image upload | image loaded 1:1, canvas resized | image dimensions | Blender image plane or external scan import | partial |
| Grid corners | four-corner pixel overlay | `gridCornersPixel` | Python/imported alignment | partial |
| Auto grid overlay | uses scan/image size and grid physical size | px/mm estimate | optional Blender scan mode | deferred |
| Manual alignment | offset X/Y, rotation, flip H/V, rotate 90 | transforms/corners | optional Blender scan mode | deferred |
| Show sample zones | overlay toggle | `gridOptions` | optional debug | deferred |
| Expected colour opacity | 0-100% | overlay alpha | optional debug | deferred |
| Deadzone | 0-40 UI; default 10, analysis fallback 20 | inner sample region | scan importer if Blender samples | partial |
| Analyse scan | perspective-correct tile sampling | quad interpolation, point-in-quad | optional Python scan mode | deferred |
| Analysis viewer | sortable grid by order, brightness, hue, deviation, RGB | analysis display | optional Blender/Python report | missing |
| Export GPL | calibrated palette file | unique palette | Python export/import | missing |
| Export quant config | JSON palette map | `quantizationConfig` | Python export/import | partial |
| Export comparison CSV | expected vs actual | CSV | Python export/import | missing |

## 7. QUANTIZE Parity

| Feature | Current Behaviour | Maths / Data | Blender Equivalent | Status |
|---------|-------------------|--------------|--------------------|--------|
| Upload source image | image element + image adjustment bundle | image data | Python image import | partial |
| Image adjustment | bundle control restored from project import | adjustment values | Python/image preprocess | missing |
| Print width | 50-300 default 170 | mm | `MFP_Params` | covered |
| Min detail | implementation uses mm tile size fallback; docs also describe noise threshold | mm and filtering semantics | split into `tile_size_mm` + `min_cluster/filter` | conflict |
| Dither algorithm | None, Floyd-Steinberg, Bayer 4x4, Blue Noise UI | implementation supports None/Floyd/Bayer; Blue Noise not implemented in seen branch | Python preprocess | partial |
| Colour space | CIELAB, RGB, HSL | weighted color-space distance | Python preprocess | partial |
| Colour weights | three weights 0-5 | w1/w2/w3 | Python preprocess | partial |
| Analysis mode | Fast/Deep | neighbour optimisation mode | Python preprocess | partial |
| Colour variance | ΔE threshold 0-30 | candidate set | Python preprocess | partial |
| Layer preference | None/More/Fewer layers | layer count score | Python preprocess | partial |
| Grouping weight | 0-1 | weighted neighbour score | Python preprocess | partial |
| Min cluster | remove small clusters | connected components | Python preprocess | partial |
| Palette merge | ΔE threshold | merge similar palette entries | Python preprocess | partial |
| Quantize image | 6-stage pipeline | scale, dither, optimise, simplify, filter, render | Python preprocess + Blender import | partial |
| Export quantized PNG | image output | PNG | Python export | missing |
| Export analysis image | composite report image | layer maps + quality | Python/report | missing |
| Upload palette JSON | import `quantizationConfig` | JSON schema | Python importer | partial |

## 8. OUTPUTS / EXPORT Parity

| Feature | Current Behaviour | Maths / Data | Blender Equivalent | Status |
|---------|-------------------|--------------|--------------------|--------|
| Grid PNG | download generated grid image | 300 DPI | Blender render/Python image | missing |
| Grid STL | grid layer maps to STL | box geometry | optional fallback | partial |
| Grid CSV | sequence reference | CSV | Python export | missing |
| Grid JSON | `grid-layout.json` v1.2 | JSON schema | Python export | partial |
| Palette GPL | scan palette | GPL text | Python export | missing |
| Quant config JSON | `quantizationConfig` | JSON | Python export | partial |
| Comparison CSV | scan analysis table | CSV | Python export | missing |
| Quant PNG | quantised image | PNG | Python export | missing |
| Artwork STL | contour-based STL per filament | layer maps -> contourSTL | optional fallback / nozzleboss path preferred | partial |
| Download STL ZIP | all generated artwork STLs | ZIP | Python package | missing |
| Individual STLs | per-file download | file loop | Python package/export | missing |
| Complete project ZIP | all grid/scan/quant/export artefacts | package schema | Python package | missing |

## 9. Implementation-Only Behaviours Not Fully In Docs

These must be covered because the implementation says the restored tool has all functionality.

| Behaviour | Source | Blender Requirement | Status |
|-----------|--------|---------------------|--------|
| Project import restores controls across SOURCE/SCAN/QUANTIZE/OUTPUTS | `MFP-SourceActions.js` | Blender project import must restore process settings | missing |
| Multiple project file fallbacks: `grid-layout.json`, `grid-config.json`, CSV | `MFP-SourceActions.js` | importer must recognise legacy formats | missing |
| Scan image and alignment restored from ZIP | `MFP-SourceActions.js`, `MFP-ScanActions.js` | optional if Blender consumes full packages | partial |
| Quantized source/quantized image/sequence map restored from ZIP | `MFP-SourceActions.js` | importer schema needed | missing |
| `exportSTLData` cached for preview/download | `MFP-ExportActions.js` | Blender export cache optional | deferred |
| Artwork STL contour smoothing: simplify, Chaikin, min area | `MFP-ExportActions.js`, `stl-generation.js` | optional STL fallback; not nozzleboss primary | partial |
| Quantization stores sequence map, not only RGB | `MFP-QuantizeActions.js` | essential: pixel -> sequence ID | covered |
| Duplicate RGB palette entries counted | `MFP-QuantizeActions.js` | Blender import/report should preserve sequence ID despite same RGB | partial |
| Analysis image reports layer quality | `MFP-QuantizeActions.js` | report/export equivalent | missing |
| Project status bar component | `ProjectStatusBar.js` | optional Blender UI/report | deferred |

## 10. Conflicts That Must Be Resolved

| Conflict | Docs | Implementation | Required Decision |
|----------|------|----------------|-------------------|
| Sequence model | `c^v` with base layers | `generateSequences(N,M)` valid stacks count `N*(N^M-1)/(N-1)` | Choose calibration sequence model and update docs/Blender |
| Colour simulation | multiplicative Beer-Lambert style | `simColour()` averages active RGB values | Choose physical or implemented model |
| Default colours count | docs mention 29 | implementation has 30 entries including Black | Treat implementation as current unless UI says otherwise |
| Defaults | docs often older defaults | `DEFAULTS` has 256 bed, A4 scan, 6 layers, 3 base, gap 1 | Use implementation defaults for parity |
| Min detail | docs describe noise threshold | implementation uses mm as tile size plus separate cluster controls | Split parameter names in remake |
| Blue Noise | UI option exists | implementation path not seen in current quantizer branch | Mark unimplemented or inspect complete variant |

## 11. Definition Of 100% Coverage

The Blender remake spec reaches 100% parity when:

- every row in this file is either `covered` or deliberately `deferred`;
- every conflict has a written decision;
- every current UI control has a Blender equivalent or explicit rejection;
- every current file format can be imported/exported or is explicitly obsolete;
- every algorithm dependency has a Blender/Python/GN owner;
- every current bugfix/changelog behaviour has a parity test.

