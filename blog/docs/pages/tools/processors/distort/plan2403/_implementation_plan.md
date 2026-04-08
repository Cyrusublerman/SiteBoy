# DISTORT TOOL — IMPLEMENTATION PROGRAMME — MASTER WORK ORDER

**Authority:** Review corpus `blog/docs/pages/tools/processors/distort/review2403/` (71 files: `_global_issues.md` + 70 `*_review2403.md`).  
**Output boundary:** This document is a work order only. Phase 10 does not author implementation code. Module rebuilds are a downstream programme consuming this file + decision trees + reference packs + `plan2403/components/*.md` + `plan2403/algorithms/*.md` + site checklists.

**Post-restructure module count:** 60 active modules (59 KEEP types from review + 1 new EQUALISATION).  
**Phase 0 REMOVE:** 4 registry entries only. **MERGE (7):** Absorbed during listed target module builds in Phase 10 — not Phase 0 removals.

---

## PHASE 0 — REMOVALS

Execute removals before other Distort work so CategoryPicker and node registry do not advertise deleted types.

| TYPE | CATEGORY | REASON (REVIEW) | ACTIONS |
| --- | --- | --- | --- |
| HIGHPASS | SHARPEN | Frequency separation; not sharpen; REMOVE verdict | Remove `highpass` from node registry; remove from CategoryPicker; remove reference pack `reference/distort/highpass/` or mark deprecated in migration-log only if history retained |
| MODULESERPENTINE | LINE RENDER | Superseded by SERPENTINE | Remove registry + CategoryPicker; delete or archive `reference/distort/moduleserpentine/` |
| MODULESTATICLINES | LINE RENDER | Superseded by STATICHALFTONE | Remove registry + CategoryPicker; delete or archive `reference/distort/modulestaticlines/` |
| VORONOI | GEOMETRIC | Tessellation absorbed into DELAUNAYMESH topology | Remove registry + CategoryPicker; delete or archive `reference/distort/voronoi/`; ensure DELAUNAYMESH spec includes VORONOI topology mode |

**Category cleanup:** After VORONOI removal, if GEOMETRIC category empty (CONTOUR, SDFSHAPE remain KEEP — category persists), no category removal. If inventory grouped VORONOI alone under a subheading, update inventory to remove orphan entry only.

---

## PHASE 1 — NEW UI COMPONENTS REQUIRED

Canonical names below do not appear in `blog/docs/guides/standards/component-patterns.md` §2; each has full spec in `plan2403/components/<kebab>.md`.

| NAME | PURPOSE | PARAM CONTRACT (SUMMARY) | DEPENDENT TYPES | BLOCKING |
| --- | --- | --- | --- | --- |
| ColourRampControl | Two-stop colour mapping after scalar field with source + colour space + clamp | `minColour`, `maxColour`, `rampSource`, `rampSpace`, `clamp` (+ onChange per field) | SOBEL, CANNY, LAPLACIAN, DOG, CELLULARAUTOMATA, REACTIONDIFFUSION, WAVEDISTORTION, PERLINOVERLAY, STIPPLE, etc. | Phases 5, 10 edge/sim modules until built |
| CentrePointPicker | One-shot canvas pick writes CENTRE X/Y | `active`, `onPick(x,y)`, `onCancel`, `label` | RADIALBLUR, TWIRL, SPHERIZE, CHROMATICAB, LENSBUBBLES, VIGNETTE, GRATING, WAVEDISTORTION, TILEBLEND | G6; Phases 5, 10 until G1+picker wired |
| FrameSlider | Standard FRAME param for time/iteration | `value`, `min`, `max`, `step`, `key`, `onChange`, `unit: 'frames'` | SERPENTINE, STATICHALFTONE, MODULEFLOWLINES, LUMFLOW, FLOWFIELD, ADVECTION, TILEBLEND, CELLULARAUTOMATA, REACTIONDIFFUSION, WAVEDISTORTION, INTERFERENCE, FILMGRAIN, SCANLINES | G9; Phase 10 time-based modules |
| SVGExportButton | In-NodePanel SVG download for vector frame | `onExport`, `disabled`, `label: 'EXPORT SVG'` | LUMFLOW, SERPENTINE, STATICHALFTONE, MODULEFLOWLINES | G10; Phase 10 line-render |
| NoiseSourceControl | Composite noise driver UI | `noiseType`, `seed`, `scale`, `octaves`, `onChange` | PERLINOVERLAY, DOMAINWARP, FILMGRAIN, FLOWFIELD, LENSBUBBLES | G11; pattern/noise modules |
| InputDomainSelector | INPUT DOMAIN enum for threshold/morph/analysis | `value`, `options`, `onChange` | DILATEERODE, OPENCLOSE, OTSUTHRESHOLD, CONTOUR, HALFTONEPATTERN | Morph/segment modules |
| OutputModeSelector | IMAGE / MASK / FIELD / HYBRID outputs | `value`, `options`, `onChange` | DILATEERODE, OPENCLOSE, OTSUTHRESHOLD, SCANLINES, VIGNETTE, FILMGRAIN, SDFSHAPE, CONTOUR, INTERFERENCE, DELAUNAYMESH, STIPPLE | Field-bus modules |
| MaskControls | Mask layer for warp drivers | `maskSource`, `maskMetric`, `min`, `max`, `softness`, `invert`, `onChange` | DOMAINWARP, MOIRE (partial), GRATING (partial) | Advanced warp/pattern |
| DriverMappingPanel | Fixed vs image vs field-driven param mapping | `paramKey`, `mode`, `source`, `metric`, `curve`, `onChange` | MOIRE, GRATING, TRUCHET, TILEBLEND, STIPPLE | Pattern phases 2+ |
| TemporalModeControl | STATIC / DRIFT / BAKED + speed | `mode`, `driftSpeed`, `onChange` | FILMGRAIN, SCANLINES, INTERFERENCE | Texture/temporal |
| DiagnosticPreviewToggle | Toggle residual/Voronoi/field previews | `diagnostics[]`, `active`, `onChange` | STIPPLE, DELAUNAYMESH, PAINTSTROKE, MOIRE | QA UX |
| LuminanceCurveEditor | Tone→density or tone→size curve | `points`, `onChange`, optional `preview` | STIPPLE, DELAUNAYMESH | Stipple/mosaic density |

**EXISTING primitives (DO NOT re-specify as new components):** `numeric-input`, `dropdown`, `button`, `toggle-group`, `text-input`, `color-input`, `file-input`, `collapsible-section`, `progress-bar`, `text`, `canvas`, `equation-editor`, `palette-preview` per component-patterns §2.

---

## PHASE 2 — NEW ALGORITHMS REQUIRED

Each algorithm has spec in `plan2403/algorithms/<kebab>.md`. Do not duplicate entries already in `blog/docs/algorithms/image.md` (error diffusion, ordered dither, palette extraction, colour space, adjustments, resize).

| NAME | CATEGORY FILE | PURPOSE | I/O (SUMMARY) | COMPLEXITY | DEPENDENT TYPES |
| --- | --- | --- | --- | --- | --- |
| PerlinNoise2D | noise | Gradient noise | grid+seed→scalar field | O(n) | PERLINOVERLAY, FLOWFIELD, FILMGRAIN |
| SimplexNoise2D | noise | Simplex lattice noise | grid+seed→field | O(n) | PERLINOVERLAY, DOMAINWARP |
| FbmNoise2D | noise | Fractal sum of octaves | field params→field | O(n·oct) | PERLINOVERLAY, DOMAINWARP |
| ValueNoise2D | noise | Value-interpolated noise | grid+seed→field | O(n) | BANDSHIFT NOISE mode |
| WorleyNoise2D | noise | Cellular distance | seed+pts→field | O(n·k) k neighbours | FILMGRAIN, PERLINOVERLAY |
| WhiteGaussianNoise2D | noise | IID gaussian grid | dims+seed→field | O(n) | FILMGRAIN |
| BlueNoiseMask2D | noise | High-frequency sparse mask | size+seed→mask | O(n log n) typical | Dither/QUANTISE path |
| CurlNoise2D | noise | Divergence-free field | potential→vec field | O(n) | DOMAINWARP |
| RidgedFbm2D | noise | Ridged multifractal | params→field | O(n·oct) | FILMGRAIN |
| TurbulenceField2D | noise | Abs-sum octaves | params→field | O(n·oct) | FILMGRAIN |
| TruchetTileField2D | patterns | Arc/corner tiling + distance | tile params→masks | O(n) | TRUCHET |
| MoireWaveInterference2D | patterns | Dual-wave beat/fringe | freqs+phases→field | O(n) | MOIRE |
| GratingBandField2D | patterns | Linear/angular/radial bands | mode params→SDF | O(n) | GRATING |
| HalftoneResponseMap | patterns | Sample×primitive×response | lum+grid→dots | O(n) | HALFTONEPATTERN (G17) |
| DelaunayTriangulation2D | geometry | Delaunay from points | points→tri mesh | O(n log n) | DELAUNAYMESH |
| VoronoiDiagram2D | geometry | Dual of Delaunay | points→cells | O(n log n) | DELAUNAYMESH VORONOI mode |
| PoissonDiscSampling2D | geometry | Blue-ish point distribution | rmin+domain→points | O(n) avg | DELAUNAYMESH, STIPPLE |
| SdfPrimitive2D | geometry | Analytic SDF library | shape params→dist | O(1)/px | SDFSHAPE |
| MarchingSquaresContour | geometry | Iso-contours on grid | grid+level→polylines | O(n) | CONTOUR |
| StreamlineIntegrate2D | rendering | Flowline advection | vec field+seed→polyline | O(steps) | MODULEFLOWLINES, LUMFLOW |
| SerpentineOscillatorRaster | rendering | Oscillating line to segments | params+FRAME→SVG/pix | O(lines) | SERPENTINE |
| StippleLloydRelax2D | rendering | Lloyd / weighted relaxation | pts+field→pts | O(iters·n) | STIPPLE |
| PaintStrokeErrorGuided | rendering | Error-map stroke placement | maps→strokes | O(n) | PAINTSTROKE |
| EuclideanDistanceTransform | distance | EDT on binary/gray | mask→dist | O(n) | CONTOUR, OTSUTHRESHOLD cleanup |
| GradientMagnitude2D | distance | Sobel magnitude | img→mag | O(n) | Many INPUT DOMAIN |
| EdgeTangentDistance2D | distance | Edge band distance | img→dist | O(n) | SCANLINES, vignette drivers |
| SeparableBoxBlurPasses | math | H+V box blur | r,p→blur img | O(n·p) | BOXBLUR audit |
| SeparableGaussianKernel1D | math | 1D Gaussian coeff | sigma→kernel | O(σ) | GAUSSBLUR |
| MorphologySeparableApprox | math | Approx dilate/erode rects | mask+op→out | O(n·r) | DILATEERODE, OPENCLOSE |
| HistogramEqualiseGlobal | math | Global hist eq | img→img | O(n) | EQUALISATION mode |
| ClaheTiles | math | Contrast-limited AHE | img+tiles+clip→img | O(n) | EQUALISATION mode |
| OtsuGlobalThreshold | math | Optimal global t | hist→t | O(L) bins | OTSUTHRESHOLD |
| BilateralGridApprox | math | Edge-preserving fast path | img+r→img | O(n) approx | BILATERAL |
| MedianHistogramApprox | math | Large-radius median | img+r→img | O(n) | MEDIAN |
| ThinFilmPhaseThickness | physics | Thin-film phase | n,k,d→phase | O(n) | INTERFERENCE |
| GrayScottStep2D | physics | RD timestep | A,B+feed/kill→A,B | O(n) | REACTIONDIFFUSION |
| CellularAutomataTotalisticStep | physics | CA outer-totalistic step | grid+rule→grid | O(n) | CELLULARAUTOMATA |
| WaveEquationFD2D | physics | Stateful wave FD step | u,ut+params→u',ut' | O(n) | WAVEDISTORTION |

**Dependencies:** Noise primitives before FBM/Curl; Delaunay before Voronoi mode; Gradient magnitude before many DOMAIN selectors; G13 blend fix before any blend-sensitive QA.

---

## PHASE 3 — GLOBAL ISSUES (G1–G19)

**Order:** [ERROR] first by scope desc; [WARN] by scope desc; [NOTE] by scope desc.

### [ERROR]

| CODE | Title | Scope | ACTION | DEPENDS | BLOCKING |
| --- | --- | --- | --- | --- | --- |
| G1 | +D driver button non-functional | all | Fix NodePanel +D handler / driver panel mount | — | G2 verification; any driver UI spec |
| G13 | Blend modes wrong (LIGHTEN/DARKEN etc.) | all | Audit compositing; fix per-channel formulas; add regression | — | Honest blend QA for all modules |

### [WARN]

| CODE | Title | Scope | ACTION | DEPENDS | BLOCKING |
| --- | --- | --- | --- | --- | --- |
| G2 | Numeric params need drivers | all | `driveable: true` audit 70 types | G1 | Spatial modulation UX |
| G16 | Unit labels on numerics | all | Per-param `unit`; render in rows | — | OTSU, morph, physics readability |
| G5 | Slider direct edit + dblclick default | all | NumericInput behaviour | — | All sliders |
| G12 | Worker offload expensive ops | many | Worker audit; previewMax; pool optional | G1 for timeout UX | BLUR, BILATERAL, CA, RD, STIPPLE |
| G14 | Hide inactive MODE params | many | Conditional visibility not disable | — | BANDSHIFT, LAPLICIAN, DOG, CANNY, TRUCHET, GRATING, MOIRE, EQUALISATION, QUANTISE, DOMAINWARP, OTSU |
| G11 | Shared components first | all | Build Phase 1 list before duplicating | G1 optional | SOBEL→LAB consistency |
| G7 | Vector badge in picker | 4 (post-Phase0) | Badge LUMFLOW, SERPENTINE, STATICHALFTONE, MODULEFLOWLINES | G8 | Line-render discoverability |
| G9 | FRAME param | ~11 | Add FRAME to time/iter modules | — | Animation contract |
| G10 | SVG export per vector module | 4 | SVGExportButton | — | Vector deliverable |
| G19 | Timeline toggle from canvas tab | 1 tool | Canvas-tab control toggles timeline shell | — | G9 consumer UX |
| G8 | Merge LINE RENDER picker sections | 1 category | Single LINE RENDER inventory | — | G7 clarity |
| G18 | GEOMETRIC triplet removal | **SUPERSEDED** | User decision: KEEP CONTOUR, SDFSHAPE; REMOVE VORONOI only; G18 note ignored for CONTOUR/SDFSHAPE | — | — |

### [NOTE]

| CODE | Title | Scope | ACTION | BLOCKING |
| --- | --- | --- | --- | --- |
| G4 | Blur consolidation | 6 blur types | Proposal only — defer unless product decides | Phase 10 blur order |
| G3 | ANALYSIS category | future | New taxonomy for diagnostics | Optional phase |
| G6 | Canvas pick centres | multi | CentrePointPicker + PICK CENTRE | Radial/twirl/etc. |
| G15 | Extra internal blend audit | all | Find duplicate blend params; standardise | MOIRE parity |
| G17 | Halftone = pattern library seed | 1 | Three-part architecture HALFTONEPATTERN | G17 modules |

---

## PHASE 4 — ALGORITHM BUILDS (ORDER)

Build bottom-up inside `assets/js/shared/algorithms/` unless Distort-only (then `assets/js/tools/processors/distort/algorithms/` only if repo pattern forbids shared).

1. SeparableGaussianKernel1D, SeparableBoxBlurPasses  
2. GradientMagnitude2D  
3. EuclideanDistanceTransform, EdgeTangentDistance2D  
4. HistogramEqualiseGlobal, ClaheTiles, OtsuGlobalThreshold  
5. MorphologySeparableApprox, MedianHistogramApprox, BilateralGridApprox  
6. WhiteGaussianNoise2D, ValueNoise2D, PerlinNoise2D, SimplexNoise2D, FbmNoise2D, WorleyNoise2D, CurlNoise2D, RidgedFbm2D, TurbulenceField2D, BlueNoiseMask2D  
7. DelaunayTriangulation2D, VoronoiDiagram2D, PoissonDiscSampling2D  
8. SdfPrimitive2D, MarchingSquaresContour  
9. HalftoneResponseMap, GratingBandField2D, MoireWaveInterference2D, TruchetTileField2D  
10. StreamlineIntegrate2D, SerpentineOscillatorRaster  
11. StippleLloydRelax2D, PaintStrokeErrorGuided  
12. CellularAutomataTotalisticStep, GrayScottStep2D, WaveEquationFD2D, ThinFilmPhaseThickness  

Each row: implement signature as in matching `plan2403/algorithms/*.md`.

---

## PHASE 5 — COMPONENT BUILDS (ORDER)

Target: `assets/js/shared/component-library.js` exports + new classes in owned input/container files per `component-development.md`.

1. ColourRampControl (needs `color-input`, `dropdown`, `toggle-group`)  
2. InputDomainSelector, OutputModeSelector (thin `dropdown` wrappers OK if single class owns layout)  
3. FrameSlider (`numeric-input` wrapper + contract)  
4. CentrePointPicker (`button` + ToolBase canvas hook contract)  
5. SVGExportButton (`button` + download controller)  
6. NoiseSourceControl  
7. MaskControls  
8. TemporalModeControl  
9. DriverMappingPanel (depends G1 for real +D)  
10. DiagnosticPreviewToggle  
11. LuminanceCurveEditor (depends numerical stability review)  

**Hard dependency:** G1 before DriverMappingPanel QA; G5 before FrameSlider if shared NumericInput patch.

---

## PHASE 6 — REFERENCE DOC REBUILD

**Path pattern:** `blog/docs/pages/tools/processors/distort/reference/distort/<type>/`

For each post-Phase-0 **active** module (60 rows): files `description.md`, `feature-parity.md`, `ui-layout.md`, `mechanisms.md`, `performance.md`, `source-reference.md`, `issues-and-conflicts.md`, `migration-log.md`.

| TYPE | PACK STATUS | FULL REWRITE | PARTIAL ONLY | NEW FILES |
| --- | --- | --- | --- | --- |
| EQUALISATION | NEW | all | — | entire pack |
| HSL | MISSING | all | — | entire pack (absorb HSLADJUST, TEMPTINT) |
| QUANTISE | exists | all | — | `palette-bridge.md` optional if palette subsystem large |
| CONTRAST | exists | all | — | — |
| DELAUNAYMESH | exists | all | — | `topology-voronoi.md` (absorb VORONOI) |
| (all other KEEP 57) | exists | **all eight** typical | `migration-log.md` may retain dated entries if append-only policy | `field-output.md` if module exports FIELD (OTSUTHRESHOLD, DILATEERODE, OPENCLOSE, SCANLINES, VIGNETTE, FILMGRAIN, SDFSHAPE, CONTOUR, INTERFERENCE, DELAUNAYMESH, STIPPLE) |

**REMOVE types (Phase 0):** Do not rewrite except archive note in parent category doc if required.

**MERGE sources (7):** Fold into target migration-log + issues; retire standalone packs after target published.

---

## PHASE 7 — REVIEW / REFERENCE CROSS-CHECK

For each active TYPE, verify review `review2403/<type>_review2403.md` except: **EQUALISATION** check both `histogrameq_review2403.md` + `clahe_review2403.md`; **QUANTISE** add `posterize_review2403.md` + `dither_review2403.md`; **HSL** add `hsladjust_review2403.md` + `temptint_review2403.md`; **CONTRAST** add `vibrance_review2403.md`; **DELAUNAYMESH** add `voronoi_review2403.md` (topology parity).

**Per module checks:** Every numbered Action Item in review has matching sentence in `mechanisms.md` or `issues-and-conflicts.md` (closed) or `feature-parity.md` (open gap).

### PHASE 7 AMBIGUITIES — RESOLVED

**SSoT:** `_ambiguity_resolutions.md` (nine rows; 2026-03-31). Former table rows moved there; do not duplicate here.

---

## PHASE 8 — DECISION TREES (REQUIREMENT ONLY)

Per KEEP module (60), downstream agent must produce one decision tree document covering:

- Operating mode logic (MODE param changes DAG/stages).  
- Param visibility (G14).  
- Driver boundary (which params `driveable` after real modulation support; CRITICAL dishonest flags from DILATEERODE/OPENCLOSE/CONTOUR/SDFSHAPE/INTERFERENCE reviews).  
- Field output contract (scalar/vector fields, normalisation, coords).  
- Worker boundary (main vs worker; previewMax).  
- Compositing contract (internal vs pipeline blend per G15).

---

## PHASE 9 — CONSISTENCY ANALYSIS (CHECKS)

Before code, run:

1. **Naming:** FIELD vs MASK vs SCALAR consistent labels across OTSU, MORPH, SDF, CONTOUR.  
2. **Shared components:** Same ColourRampControl prop names in SOBEL/CANNY/LAPLACIAN/DOG.  
3. **FIELD format:** Downstream modules agree on normalised [0,1] vs raw — document in bus spec.  
4. **Driveability:** Params flagged `driveable` only if `apply()` reads modulation channel per review CRITICAL items.  
5. **Worker:** CA, RD, WAVE, STIPPLE, DELAUNAY, BILATERAL agree worker + timeout policy.  
6. **FRAME:** Single semantic (discrete frame index vs normalised time) across modules — pick one in bus spec.

**Pass:** Zero unresolved cross-module contradiction in above six dimensions or explicit exception rows in programme log.

---

## PHASE 10 — MODULE BUILDS (ORDER + SCOPE)

**Legend:** P = CRITICAL/HIGH/MEDIUM/LOW from reviews condensed; S = SMALL / MEDIUM / LARGE / XLARGE estimated; DEPS = algorithms (A:), components (C:), G-codes.

**TIER A — Globals + bus**  
- **G1,G13,G5,G16,G14** fixes — P CRITICAL — S XLARGE — DEPS none  
- Driver/modulation bus spec — P HIGH — S LARGE — DEPS G1  

**TIER B — New MERGE targets + rename**  
- **EQUALISATION** — P HIGH — S LARGE — DEPS HistogramEqualiseGlobal, ClaheTiles; histogrameq+clahe reviews  
- **HSL** — P MEDIUM — S MEDIUM — DEPS merge hsladjust+temptint reviews  
- **CONTRAST** — P MEDIUM — S MEDIUM — DEPS vibrance merge  
- **QUANTISE** — P HIGH — S XLARGE — DEPS palette + dithers from `image.md` + new blue-noise if needed; posterize+dither reviews  

**TIER C — Shared component-dependent SIMPLE**  
- **INVERT**, **GREYSCALE**, **LEVELS**, **CURVES**, **CHANNELMIXER**, **COLOURBALANCE**, **GRADIENTMAP** — P LOW–MED — S SMALL — DEPS G1,G2,G5,G16 (GREYSCALE review: retain weighted RGB; G1/G2 globals)  

**TIER D — BLUR family**  
- **BOXBLUR**, **GAUSSBLUR**, **MOTIONBLUR** (ANISOTROPY), **RADIALBLUR** (C: CentrePointPicker), **MEDIAN**, **BILATERAL** — P MED–CRIT — S XLARGE **BILATERAL** — DEPS Tier A algorithms  

**TIER E — SHARPEN / EDGE**  
- **UNSHARPMASK** — S SMALL  
- **SOBEL, CANNY, LAPLACIAN, DOG** — P MED — S LARGE — DEPS C: ColourRampControl  

**TIER F — MORPH**  
- **DILATEERODE, OPENCLOSE** — P HIGH — S XLARGE — DEPS morphology + field out + G14  

**TIER G — TEXTURE**  
- **FILMGRAIN, SCANLINES, VIGNETTE** — P HIGH — S XLARGE — DEPS noise + field + C: Temporal/diagnostic  

**TIER H — GEOMETRIC / SEGMENT**  
- **OTSUThreshold** — P MED–HIGH — S XLARGE  
- **CONTOUR** — P HIGH — S XLARGE  
- **SDFSHAPE** — P HIGH — S XLARGE  

**TIER I — TRANSFORM / WARP**  
- **AFFINE, POLARCOORDS, PIXELATE, TWIRL, SPHERIZE, RIPPLE, ITERREWARP** — S SMALL–MED — DEPS C: CentrePointPicker where listed  
- **CHROMATICAB** — P HIGH — S XLARGE  
- **BANDSHIFT** — P HIGH — S LARGE  
- **DOMAINWARP, ADVECTION, FLOWFIELD** — P MED–HIGH — S LARGE  

**TIER J — PATTERN / NOISE**  
- **HALFTONEPATTERN, MOIRE, GRATING, TRUCHET, PERLINOVERLAY** — P HIGH — S XLARGE — DEPS pattern algorithms + C: DriverMappingPanel  

**TIER K — PHYSICS**  
- **WAVEDISTORTION, CELLULARAUTOMATA, REACTIONDIFFUSION, INTERFERENCE** — P HIGH — S XLARGE — DEPS physics alg + worker  

**TIER L — COMPOSITE / LINE**  
- **TILEBLEND, DELAUNAYMESH** (VORONOI mode), **STIPPLE, PAINTSTROKE** — P HIGH — S XLARGE  
- **LUMFLOW, SERPENTINE, STATICHALFTONE, MODULEFLOWLINES** — P HIGH — S XLARGE — DEPS G7,G8,G9,G10; C: SVGExportButton, FrameSlider  

**END STATE:** 60 active modules; 4 types removed from Phase 0; 7 merge sources retired; VORONOI capability inside DELAUNAYMESH; G18 overridden as recorded Phase 3.

---

## DOCUMENT INDEX

- Component specs: `plan2403/components/` (12 files)  
- Algorithm specs: `plan2403/algorithms/` (38 files; catalogue `blog/docs/algorithms/image.md` remains SSoT for dither/colour ops already listed)  
- Ambiguity resolutions (Phase 7 locked): `plan2403/_ambiguity_resolutions.md`  
- Parity report: `plan2403/_parity_report.md`  
- Review corpus: `../review2403/`  
- Reference packs: `../reference/distort/`  
