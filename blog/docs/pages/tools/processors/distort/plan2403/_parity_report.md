# DOC PARITY — REVIEW2403 ↔ PLAN2403 SPECS

**Authority:** `_implementation_plan.md` Phase 1–2 tables + `review2403/` (71 files).  
**Method:** Three layers per plan (action-item map; field diff; semantic depth).  
**Date:** 2026-03-31.

---

## 0 — GLOBAL COMPLIANCE

### Algorithm specs (38) — checklist

| Rule | Result |
| --- | --- |
| `## unified-algorithm` present | **38/38 PASS** |
| `TERM→CODE` table (plan: core terms) | **5/38 PASS** (perlin, simplex, fbm, truchet, worley only) — **33 NOTE** |
| Named `@source` / author+year | **~9/38** with formal tag; **~29 NOTE** (wikipedia / @formula / none) |
| **Reference Doc** field in header table | **INCONSISTENT** (some `plan2403`, some absent) |

### Component specs (12) — COMPONENT-REFERENCE shape

| Rule | Result |
| --- | --- |
| Purpose + Options + Modules | **12/12** |
| **Direct usage** (JS example) | **~3/12** (colour-ramp, others often absent) — **9 ISSUE** |
| **ToolBase** row | **~4/12** explicit; **8 NOTE/ISSUE** |
| **Visual** (F-units) | **~6/12**; **6 NOTE** |

---

## 1 — COMPONENTS (12)

### ColourRampControl

**Spec:** `plan2403/components/colour-ramp-control.md`  
**Reviews:** sobel, canny, laplacian, dog, cellularautomata, reactiondiffusion, perlinoverlay, stipple, wavedistortion (+ `_global_issues.md` G1,G5,G11).

| Layer | Finding |
| --- | --- |
| **L1** | Ramp params **MAPPED** to Options. Detection/render split is **OUT OF SCOPE** (module, not component). G1: Dependencies mention driver impact on future numerics — **PARTIAL** (G1 not named explicitly). |
| **L2** | Plan Phase 1 lists **WAVEDISTORTION**; spec **Modules** omits **WAVEDISTORTION** — **MISSING_IN_SPEC** vs plan + review (wavedistortion § output fields + colour ramp). RAMP SOURCE enum from reviews (RAW / NORMALISED / POST-THRESHOLD) not enumerated in spec — **NOTE**. **CLAMP BELOW THRESHOLD** vs `clamp: boolean` — **MISSING_IN_SPEC** semantic (threshold coupling). |
| **L3** | Clamp intent **SHALLOW** (no threshold behaviour). |

**Overall:** **ISSUES (4)**

### CentrePointPicker

**Spec:** `plan2403/components/centre-point-picker.md`  
**Reviews:** radialblur, twirl, spherize, chromaticab, lensbubbles, vignette, grating, wavedistortion, tileblend (+ G6).

| Layer | Finding |
| --- | --- |
| **L1** | G6 / PICK CENTRE **MAPPED**. |
| **L2** | `coordSpace`, `onArm` — **UNSOURCED** extras (reasonable inference). |
| **L3** | **FULL** for picker scope. |

**Overall:** **ISSUES (2)** — missing **ToolBase**, **Direct usage**; guide shape incomplete.

### FrameSlider

**Spec:** `plan2403/components/frame-slider.md`  
**Reviews:** serpentine, statichalftone, moduleflowlines, lumflow, flowfield, advection, tileblend, cellularautomata, reactiondiffusion, wavedistortion, interference, filmgrain, scanlines (+ G9, G5).

| Layer | Finding |
| --- | --- |
| **L1** | FRAME contract **MAPPED**; G5 via NumericInput **MAPPED**. |
| **L2** | `onInput` — minor **UNSOURCED** convenience. |
| **L3** | **FULL**. |

**Overall:** **ISSUES (2)** — no **Visual** block; no **Direct usage**.

### SVGExportButton

**Spec:** `plan2403/components/svg-export-button.md`  
**Reviews:** lumflow, serpentine, statichalftone, moduleflowlines (+ G10).

| Layer | Finding |
| --- | --- |
| **L1** | Export intent **MAPPED**. Plan contract says `onExport`; spec uses `onClick` returning Promise — **RENAMED** / contract **DELTA**. |
| **L2** | `title`, `fill` — **EXTRA_IN_SPEC** (minor). |
| **L3** | **FULL**. |

**Overall:** **ISSUES (2)** — API naming vs plan; no **Direct usage**.

### NoiseSourceControl

**Spec:** `plan2403/components/noise-source-control.md`  
**Reviews:** perlinoverlay, domainwarp, filmgrain, flowfield, lensbubbles (+ G11).

| Layer | Finding |
| --- | --- |
| **L1** | SEED, SCALE, OCTAVES, TYPE pattern **MAPPED**. |
| **L2** | Reviews often name more noise **families** than single dropdown default — depth left to `noiseTypeOptions []` — **NOTE**. |
| **L3** | **SHALLOW** vs filmgrain/perlinoverlay multi-noise variants (acceptable if options injected per module). |

**Overall:** **ISSUES (1)** — no **Direct usage**.

### InputDomainSelector

**Spec:** `plan2403/components/input-domain-selector.md`  
**Reviews:** dilateerode, openclose, otsuthreshold, contour, halftonepattern.

| Layer | Finding |
| --- | --- |
| **L1** | INPUT DOMAIN role **MAPPED**. |
| **L2** | HALFTONEPATTERN **RESPONSE SOURCE** overlap warning in spec — **MATCH** review caution. |
| **L3** | **FULL** for selector scope; per-module enum remains module-owned — **NOTE**. |

**Overall:** **ISSUES (2)** — no **Direct usage**, no **Visual**.

### OutputModeSelector

**Spec:** `plan2403/components/output-mode-selector.md`  
**Reviews:** dilateerode, openclose, otsuthreshold, scanlines, vignette, filmgrain, sdfshape, contour, interference, delaunaymesh, stipple (+ G14).

| Layer | Finding |
| --- | --- |
| **L1** | IMAGE/MASK/FIELD/HYBRID + G14 hide row **MAPPED**. |
| **L2** | — |
| **L3** | **FULL**. |

**Overall:** **ISSUES (1)** — no **Direct usage**.

### MaskControls

**Spec:** `plan2403/components/mask-controls.md`  
**Reviews:** domainwarp, moire, grating (phase notes).

| Layer | Finding |
| --- | --- |
| **L1** | MASK SOURCE/METRIC/RANGE **MAPPED**. |
| **L2** | Field-bus norm dependency **MATCH** reviews. |
| **L3** | **FULL**. |

**Overall:** **ISSUES (1)** — no **Direct usage**.

### DriverMappingPanel

**Spec:** `plan2403/components/driver-mapping-panel.md`  
**Reviews:** moire, grating, truchet, tileblend, stipple (+ G1).

| Layer | Finding |
| --- | --- |
| **L1** | Mapping modes **MAPPED**; **G1** explicitly in Dependencies — **PASS**. |
| **L2** | `curve: 'LINEAR'` vs review “curve” shapes — **SHALLOW** until curve grammar defined. |
| **L3** | **SHALLOW** for STIPPLE/TRUCHET complex driver graphs (spec is single-param row). |

**Overall:** **ISSUES (3)** — no ToolBase/Direct/Visual; curve depth.

### TemporalModeControl

**Spec:** `plan2403/components/temporal-mode-control.md`  
**Reviews:** filmgrain, scanlines, interference.

| Layer | Finding |
| --- | --- |
| **L1** | STATIC/DRIFT/BAKED + G14 **MAPPED**. |
| **L2** | `frameBindingKey` — **UNSOURCED** wiring hook (reasonable). |
| **L3** | **FULL** at component scope. |

**Overall:** **ISSUES (1)** — no **Direct usage**.

### DiagnosticPreviewToggle

**Spec:** `plan2403/components/diagnostic-preview-toggle.md`  
**Reviews:** stipple, delaunaymesh, paintstroke, moire.

| Layer | Finding |
| --- | --- |
| **L1** | Toggle concept **MAPPED**; STIPPLE action items list **5+** diagnostics — spec default **2** items — **PARTIAL**. |
| **L2** | Purpose lists “histogram overlay, NN distance” — default `items` lack them — **MISSING_IN_SPEC** vs Purpose/review. |
| **L3** | **SHALLOW** vs stipple Stage 5 diagnostics. |

**Overall:** **ISSUES (3)**

### LuminanceCurveEditor

**Spec:** `plan2403/components/luminance-curve-editor.md`  
**Reviews:** stipple, delaunaymesh.

| Layer | Finding |
| --- | --- |
| **L1** | LUMINANCE CURVE **MAPPED**. **INVERT TONE**, **OPERATE IN LINEAR LIGHT** (stipple Stage 1) **UNMAPPED** in this component — belong same panel or separate controls — **PARTIAL**. |
| **L2** | `preview` toggle **EXTRA_IN_SPEC** (optional). |
| **L3** | **SHALLOW** if Stage 1 is one “Tone Field” block in UI. |

**Overall:** **ISSUES (2)**

---

## 2 — ALGORITHMS — BATCH A (NOISE / PATTERNS / GEOMETRY)

**Cross-cutting:** **TERM→CODE** absent in 14/19 below (batch A); add table or justify N/A in each file.

| Spec file | Plan `DEPENDENT TYPES` | Spec `Modules` | Delta | Other |
| --- | --- | --- | --- | --- |
| perlin-noise-2d.md | PERLINOVERLAY, FLOWFIELD, FILMGRAIN | same | — | TERM→CODE **PASS**; refs **PASS** |
| simplex-noise-2d.md | PERLINOVERLAY, DOMAINWARP | same | — | TERM→CODE **PASS**; @Gustavson **NOTE** (no year) |
| fbm-noise-2d.md | PERLINOVERLAY, DOMAINWARP | +FILMGRAIN | **EXTRA_IN_SPEC** | TERM→CODE **PASS** |
| value-noise-2d.md | BANDSHIFT NOISE | BANDSHIFT | **MATCH** | No TERM→CODE |
| worley-noise-2d.md | FILMGRAIN, PERLINOVERLAY | same | — | TERM→CODE **PASS** |
| white-gaussian-noise-2d.md | FILMGRAIN | same | — | No TERM→CODE |
| blue-noise-mask-2d.md | Dither/QUANTISE | QUANTISE | **MATCH** | Duplication note **PASS** |
| curl-noise-2d.md | DOMAINWARP | same | — | @source present |
| ridged-fbm-2d.md | FILMGRAIN | same | — | No TERM→CODE |
| turbulence-field-2d.md | FILMGRAIN | same | — | No TERM→CODE |
| truchet-tile-field-2d.md | TRUCHET | same | — | TERM→CODE **PASS** |
| moire-wave-interference-2d.md | MOIRE | same | — | No TERM→CODE |
| grating-band-field-2d.md | GRATING | same | — | No TERM→CODE |
| halftone-response-map.md | HALFTONEPATTERN | same | — | No TERM→CODE; G17 **PASS** |
| delaunay-triangulation-2d.md | DELAUNAYMESH | same | — | No TERM→CODE |
| voronoi-diagram-2d.md | DELAUNAYMESH VORONOI | same | — | No TERM→CODE |
| poisson-disc-sampling-2d.md | DELAUNAYMESH, STIPPLE | same | — | @source **PASS** |
| sdf-primitive-2d.md | SDFSHAPE | same | — | No TERM→CODE |
| marching-squares-contour.md | CONTOUR | same | — | No TERM→CODE |

**Semantic notes (batch A):**

- **halftone-response-map.md:** **FULL** vs G17 three-part; first-ship scope explicit.
- **voronoi-diagram-2d + voronoi_review2403.md (REMOVE):** Spec matches **Phase 0** absorption into DELAUNAYMESH — **PASS**. Review Action 3 (“remove GEOMETRIC category when all three removed”) **STALE** vs `_implementation_plan.md` G18 override (KEEP CONTOUR, SDFSHAPE) — see §5.

---

## 3 — ALGORITHMS — BATCH B (RENDERING / DISTANCE / MATH / PHYSICS)

| Spec file | Plan | Spec `Modules` | Delta | Other |
| --- | --- | --- | --- | --- |
| streamline-integrate-2d.md | MODULEFLOWLINES, LUMFLOW | MODULEFLOWLINES, LUMFLOW | — | |
| serpentine-oscillator-raster.md | SERPENTINE | SERPENTINE | — | |
| stipple-lloyd-relax-2d.md | STIPPLE | STIPPLE | — | I/O omits MIN SPACING, COLLISION MODE vs review Stage 4 — **SHALLOW** |
| paint-stroke-error-guided.md | PAINTSTROKE | PAINTSTROKE | — | |
| euclidean-distance-transform.md | CONTOUR, OTSUTHRESHOLD | CONTOUR, OTSUTHRESHOLD | — | |
| gradient-magnitude-2d.md | Many INPUT DOMAIN | OTSU, CONTOUR, PAINTSTROKE + “many paths” | **MATCH** | |
| edge-tangent-distance-2d.md | SCANLINES, vignette drivers | SCANLINES, VIGNETTE | — | |
| separable-box-blur-passes.md | BOXBLUR audit | BOXBLUR; LAPLACIAN PRE BLUR | **EXTRA_IN_SPEC** | |
| separable-gaussian-kernel-1d.md | GAUSSBLUR | GAUSSBLUR | — | |
| morphology-separable-approx.md | DILATEERODE, OPENCLOSE | DILATEERODE, OPENCLOSE | — | |
| histogram-equalise-global.md | EQUALISATION | EQUALISATION | — | |
| clahe-tiles.md | EQUALISATION | EQUALISATION | — | |
| otsu-global-threshold.md | OTSUTHRESHOLD | OTSUTHRESHOLD | — | |
| bilateral-grid-approx.md | BILATERAL | BILATERAL | — | |
| median-histogram-approx.md | MEDIAN | MEDIAN | — | |
| thin-film-phase-thickness.md | INTERFERENCE | INTERFERENCE | — | |
| grayscott-step-2d.md | REACTIONDIFFUSION | REACTIONDIFFUSION | — | @source **PASS** |
| cellular-automata-totalistic-step.md | CELLULARAUTOMATA | CELLULARAUTOMATA | — | No TERM→CODE |
| wave-equation-fd-2d.md | WAVEDISTORTION | WAVEDISTORTION | — | Function id `waveEquationFD2d` vs title **NOTE** |

---

## 4 — REVERSE GAPS (ACTION ITEMS → NO DEDICATED PHASE-1 SPEC)

**Rule:** New **shared UI** beyond `component-patterns.md` §2 must appear in `plan2403/components/`. New **catalogued algorithms** not already in `blog/docs/algorithms/*.md` must appear in `plan2403/algorithms/`.

| Item | Disposition |
| --- | --- |
| G19 timeline toggle (canvas tab) | **OUT_OF_SCOPE** Phase 1 component list — tool chrome; no `plan2403/components/*` entry. Track under Phase 3 G19 / tool spec only. |
| QUANTISE palette upload, manual builder, sampling | **Primitives** (`file-input`, `color-input`, `palette-preview`) per existing patterns — **not** missing algorithm spec. Dithers: **image.md** + `blue-noise-mask-2d.md`. |
| WAVEDISTORTION five-layer param set | **Module rebuild** / decision tree — not a single algorithm file; **WaveEquationFD2D** covers solver slice only — **SHALLOW** coverage of full review **NOTE** |
| EDGE modules beyond ramp (threshold, normalise) | **Module** concerns; **ColourRampControl** covers ramp slice — **PASS** |
| Worker offload G12 | **Infrastructure** — no dedicated spec row — **NOTE** |
| ANALYSIS category G3 | **Future taxonomy** — no spec — **NOTE** |

**Remediated 2026-03-31:** ColourRampControl **Modules** now includes **WAVEDISTORTION** (see `components/colour-ramp-control.md`).

---

## 5 — STALE / CONTRADICTORY REVIEW ROWS

| File | Row | Conflict |
| --- | --- | --- |
| voronoi_review2403.md | Action 3 remove GEOMETRIC category when all removed | **Superseded** by `_implementation_plan.md` Phase 3 G18 (KEEP CONTOUR, SDFSHAPE); Phase 0 removes **VORONOI** only. |

**Acknowledgement (2026-03-31):** No edit to `voronoi_review2403.md` (historical record). Implementation and reference work follow master plan + `_ambiguity_resolutions.md`; Action 3 **not** executed.

---

## 6 — SUMMARY COUNTS

| Metric | Value |
| --- | --- |
| Component specs | **12** |
| Algorithm specs | **38** |
| Component specs with **≥1** ISSUE (guide or parity) | **12** (post-remediation: many guide gaps closed — re-audit recommended) |
| Algorithm specs lacking **TERM→CODE** | **0** (remediation complete 2026-03-31) |
| Algorithm specs with **Modules** delta vs plan | **2** confirmed (fbm + separable-box); **1** wording-only |
| Reverse gaps requiring **new** spec file | **0** (G19 tracked elsewhere) |
| Stale review actions | **1** (voronoi #3 — acknowledged §5) |

**Post-remediation stack:** Residual items — re-run parity scan on §1 component rows if needed; guide refs for algorithms may still use `@wikipedia` stubs vs formal papers.

---

## 7 — AMBIGUITY RESOLUTIONS

Authoritative decisions for former Phase 7 open items: [`_ambiguity_resolutions.md`](_ambiguity_resolutions.md). **Nine** rows locked; cascade to registry/Phase 10 noted in that file.

---

**End.**
