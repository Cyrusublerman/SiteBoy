# MFP Blender Remake — UI Controls And Actions Parity

## 1. Purpose

This file lists every visible control/action found in the current MFP UI configuration that must be mapped for a 100% Blender remake.

Current source:

```text
assets/js/tools/fabrication/multifilament-print/MFP-Main.js
```

## 2. Global Canvas / Shell

| Control | Current Key | Behaviour | Blender Equivalent |
|---------|-------------|-----------|--------------------|
| Canvas fit mode | canvas config | fills container, fit display, zoom/pan enabled | viewport/debug collections |
| Info button | internal | toggles documentation overlay | optional Blender text/doc panel |
| Canvas toolbar view | internal | view selector: Auto/source/scan/grid/quant/output depending state | viewport scene collections |
| Save/load toolbar | internal | project save/load affordances | Python import/export operators |

## 3. SOURCE Controls

| Control | Key | Range / Options | Current Behaviour | Blender Equivalent |
|---------|-----|-----------------|-------------------|--------------------|
| Import Project ZIP | `importProject` | `.zip` | load grid, scan, quant, outputs settings | Python package import |
| Project status | `projectStatus` | label | import/export status | report panel |
| Filament picker | `filamentPicker` | 2-10 selected values | sets selected filaments | material/data list |
| Bed Width | `bedWidth` | 100-400 step 1 | print constraint | `MFP_Params` |
| Bed Height | `bedHeight` | 100-400 step 1 | print constraint | `MFP_Params` |
| Scan Width | `scanWidth` | 100-300 step 1 | scan constraint | `MFP_Params` |
| Scan Height | `scanHeight` | 100-400 step 1 | scan constraint | `MFP_Params` |
| Layers per Tile | `layerCount` | 1-10 step 1 | sequence length | `MFP_Params` |
| Layer Height | `layerHeight` | 0.04-0.4 step 0.01 | print Z height | shared print params |
| Tile Size | `tileSize` | 2-20 step 0.5 | tile XY size | grid/tile groups |
| Gap | `gap` | 0-5 step 0.5 | tile spacing | grid/gap groups |
| Perimeter Margin | `perimeterMargin` | 0-10 step 0.5 | border | grid layout |
| Base Layers | `baseLayers` | 0-10 step 1 | bottom fixed layers | sequence generator |
| Base Filament | `baseFilament` | selected filament names | bottom fixed filament override | sequence/layer rule |
| Top Layers | `topLayers` | 0-10 step 1 | top fixed layers | sequence/layer rule |
| Top Filament | `topFilament` | selected filament names | top fixed filament override | sequence/layer rule |
| Fill Gaps & Perimeter | `gapFillOptions` | `Fill Gaps` | include gap geometry | `MFP_GAP_*` |
| Fill Filament | `gapFilament` | selected filament names | gap material/tool | gap metadata |
| Sort Method | `sortMethod` | Layer Count, Base Color, Top Color, Complexity, Lexicographic | order sequences | `MFP_SEQ_Sort` |
| Canvas View | `canvasView` | Combined, Layer 0-3 | preview mode | debug display |
| Generate Grid | `generateGrid` | action | generate sequences/grid | Python/GN build |
| Generate Split Grids | `generateSplitGrids` | action | split oversized grid | Python batch |
| Sequence Count | `sequenceCount` | label | count display | report |
| Grid Status | `gridStatus` | label | fit/status | report |
| Export Options | `exportOptions` | STL Combined, STL Per Layer, Sorted Variants, Layer Visuals | package contents | Python package |
| Export Grid PNG | `exportGridPNG` | action | 300 DPI render | Python/render |
| Export Grid STLs | `exportGridSTL` | action | grid STL export | optional fallback |
| Export Grid CSV | `exportGridCSV` | action | sequence CSV | Python export |
| Export Complete Package | `exportCompletePackage` | action | ZIP project | Python package |
| Export status | `exportStatus` | label | status text | report |

## 4. SCAN Controls

| Control | Key | Range / Options | Current Behaviour | Blender Equivalent |
|---------|-----|-----------------|-------------------|--------------------|
| Import Project ZIP | `importProjectScan` | `.zip` | load reference grid + scan artefacts | Python import |
| Import Grid CSV | `importGridCSV` | `.csv` | reconstruct grid | Python import |
| Use Last Generated Grid | `useLastGrid` | action | copy source grid to scan reference | scene state |
| View Reference Grid | `viewReferenceGrid` | action | popup grid image | Blender preview/render |
| Re-sort Grid | `resortGrid` | sort options | choose sort | sequence sort |
| Apply Sort | `applySortToGrid` | action | reorders reference grid | Python/GN |
| Grid load status | `gridLoadStatus` | label | reference state | report |
| Scan Image | `scanImage` | image files | load scan | optional Blender image plane |
| Scan image status | `scanImageStatus` | label | status | report |
| Reset View | `resetView` | action | reset pan/zoom | viewport reset |
| Grid Info | `gridInfo` | label | overlay info | report |
| Fine Adjust X | `gridOffsetX` | -50 to 50 px | alignment | optional scan mode |
| Fine Adjust Y | `gridOffsetY` | -50 to 50 px | alignment | optional scan mode |
| Rotation | `gridRotation` | -5 to 5 deg | alignment | optional scan mode |
| Flip H | `flipH` | action | scan/corner flip | optional scan mode |
| Flip V | `flipV` | action | scan/corner flip | optional scan mode |
| Rotate 90 | `rotate90` | action | scan/corner rotate | optional scan mode |
| Grid options | `gridOptions` | show zones/expected/etc | overlay toggles | optional debug |
| Expected opacity | `expectedOpacity` | 0-100 step 5 | expected colour overlay alpha | optional debug |
| Reset Alignment | `resetGrid` | action | reset overlay | optional scan mode |
| Deadzone | `deadzonePercent` | 0-40 step 5 | inner sample area | scan sampling |
| Analyze Scan | `analyzeScan` | action | extract colours | optional Python scan mode |
| View Analysis Data | `viewAnalysis` | action | sortable analysis view | report |
| Export Palette GPL | `exportPalette` | action | GPL export | Python export |
| Export Quant Config | `exportQuantConfig` | action | JSON export | Python export |
| Export Comparison CSV | `exportComparisonCSV` | action | CSV export | Python export |
| Scan status | `scanStatus` | label | analysis status | report |
| Export Project ZIP | `exportCompleteProject` | action | full project package | Python package |

## 5. QUANTIZE Controls

| Control | Key | Range / Options | Current Behaviour | Blender Equivalent |
|---------|-----|-----------------|-------------------|--------------------|
| Palette status | `paletteStatus` | label | palette availability | report |
| Upload Palette JSON | `uploadPalette` | `.json` | load quantization config | Python import |
| Import Project ZIP | `importProjectQuantize` | action | load package | Python import |
| Source Image | `sourceImage` | image files | load source image | Python import |
| Image Adjust | `imageAdjust` | bundle | image adjustments | Python preprocess |
| Print Width | `printWidth` | 50-300 step 1 | physical output width | params |
| Dither Algorithm | `ditherAlgorithm` | None, Floyd-Steinberg, Bayer 4x4, Blue Noise | quantisation algorithm | Python preprocess |
| Min Detail | `minDetail` | 0-2 mm step 0.1 | tile size fallback in implementation | rename/split |
| Colour Space | `colourSpace` | CIELAB, RGB, HSL | distance space | Python preprocess |
| Weight 1 | `csWeight1` | 0-5 | space channel weight | Python preprocess |
| Weight 2 | `csWeight2` | 0-5 | space channel weight | Python preprocess |
| Weight 3 | `csWeight3` | 0-5 | space channel weight | Python preprocess |
| Analysis Mode | `analysisMode` | Fast, Deep | optimisation depth | Python preprocess |
| Colour Variance | `colourVariance` | 0-30 ΔE | candidate threshold | Python preprocess |
| Layer Preference | `layerPreference` | None, More Layers, Fewer Layers | layer-count score | Python preprocess |
| Grouping Weight | `groupingWeight` | 0-1 step 0.05 | neighbour grouping score | Python preprocess |
| Min Cluster | `minimumClusterPx` | 0-200 px | component simplification | Python preprocess |
| Palette Merge | `paletteMergeThreshold` | 0-15 ΔE | merge similar palette entries | Python preprocess |
| Quantize Image | `quantize` | action | full quantisation pipeline | Python preprocess |
| Quantize Status | `quantizeStatus` | label | status | report |
| Smooth Iterations | `stlSmoothIterations` | 0-6 | Chaikin for STL contours | optional STL fallback |
| Simplify Tolerance | `stlSimplifyTolerance` | 0-2 px | Douglas-Peucker | optional STL fallback |
| Min Contour Area | `stlMinContourArea` | 0-20 px² | drop small contours | optional STL fallback |
| Generate Artwork STLs | `generateArtworkSTL` | action | contour STL | optional fallback/nozzleboss alternative |
| Export Analysis Image | `exportAnalysisImage` | action | composite analysis render | Python report |
| Export Project ZIP | `exportCompleteProject` | action | package | Python package |

## 6. OUTPUTS Controls

| Control | Key | Current Behaviour | Blender Equivalent |
|---------|-----|-------------------|--------------------|
| Download Grid PNG | `outputGridPNG` | grid PNG | Python/render |
| Download Grid STLs | `outputGridSTL` | grid STLs | optional fallback |
| Download Grid CSV | `outputGridCSV` | sequence CSV | Python export |
| Download Grid JSON | `outputGridJSON` | layout JSON | Python export |
| Download Palette GPL | `outputPaletteGPL` | GPL | Python export |
| Download Quant Config | `outputQuantConfig` | JSON | Python export |
| Download Comparison CSV | `outputComparisonCSV` | CSV | Python export |
| Download Quantised PNG | `outputQuantPNG` | PNG | Python export |
| STL Print Width | `stlPrintWidth` | 50-300 | export params |
| STL Layer Height | `stlLayerHeight` | 0.04-0.4 | export params |
| Generate Artwork STLs | `generateArtworkSTL` | contour STL | optional fallback |
| Download All STLs | `downloadSTLZip` | ZIP | Python package |
| Download Individual STLs | `downloadSTLIndividual` | multiple files | Python package |
| Export Complete Project ZIP | `exportCompleteProject` | full package | Python package |

## 7. Parity Rule

For 100% coverage, every row above must have either:

```text
Blender implementation
```

or:

```text
explicit non-remake decision with reason
```

