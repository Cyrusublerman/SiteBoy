# CONTOUR — Review 2403

- type: `contour`
- category: GEOMETRIC
- isVector: false
- verdict: KEEP — rebuild as contour and band-field extraction system
- priority: HIGH
- date: 2026-03-31
- reviewer: user

---

## Section 1 — Triage

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 1.1 | What does this module do? | Quantises luminance into N uniform bands, marks pixels whose right or lower neighbour lies in a different band, dilates those marks with a circular stroke kernel, and blends the result toward a single greyscale stroke level | — |
| 1.2 | Equivalent output from another module? | POSTERIZE quantises luminance without stroke rendering; EDGE modules detect gradient maxima rather than iso-value boundaries — CONTOUR occupies a distinct space as a luminance level-set renderer | — |
| 1.3 | Verdict | KEEP — distinct algorithmic identity; visually useful; occupies a space not covered by EDGE or POSTERIZE | — |
| 1.4 | Name contains "MODULE" in picker? | YES | WARN |
| 1.5 | Hover tooltip present in picker? | YES | — |

## Section 2 — Functional Completeness

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 2.1 | Correct output with defaults? | YES — output is legible: band-boundary extraction, region subdivision by luminance zones, pseudo-topographic contour accumulation in areas of tonal complexity | — |
| 2.2 | Achieves stated purpose? Missing features? | Core contour rendering functions. Missing: all four params are marked driveable but none are actually modulated (apply() omits modulate); domain locked to luminance only; band spacing is uniform only (no shadow/highlight bias, no histogram-adaptive placement); stroke colour is a single greyscale level (no RGB, no source-derived colour); no region/fill output; no field export; no contour-plus-fill mode | ERROR |
| 2.3 | Based on source reference? | No external source reference; standard iso-luminance contouring | — |

## Section 4 — Parameter and UI Audit

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 4.1 | Module-specific params (label, type)? | LEVELS (range 2–32, driveable), STROKE W (range 0.5–4 px, driveable), STROKE LVL (range 0–255, driveable), BLEND (range 0–1, driveable) | — |
| 4.2 | All labels SCREAMING CASE, untruncated? | LEVELS ✓, STROKE W ✓, STROKE LVL ✓, BLEND ✓ — compliant | — |
| 4.3 | Primary param visible by default? | LEVELS, STROKE W, BLEND at tier 3; STROKE LVL at tier 4. Tier 3 params visible by default | — |
| 4.4 | All controls respond correctly across range? | Scalar params function correctly. LEVELS at 32 + STROKE W at 4 on a high-texture source can be slow (class C cost); no previewMax cap on either. STROKE LVL 0–255 controls greyscale stroke target — narrow expressive range | WARN |
| 4.5 | Driver slots (+D) functional? | All four params marked `driveable: true`; apply() omits modulate — driver modulation impossible for all four. This is the highest concentration of non-functional driver slots in the GEOMETRIC category. +D button also broken globally (G1) | ERROR |

## Section 5 — Performance

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 5.1 | Cost-scaling params? | LEVELS (boundary count scales with band density) and STROKE W (dilation kernel size) — worst case at LEVELS 32 + STROKE W 4 on high-texture 4K: class C, ~100–400 ms | — |
| 5.2 | Interactive in PREVIEW at max params? | No previewMax cap on LEVELS or STROKE W — dense-texture sources at max params may be sluggish in preview | WARN |
| 5.3 | Acceptable FULL-mode render time at max params? | Class C at worst case — borderline acceptable; no worker offload confirmed | WARN |

## Section 6 — Load and Stability

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 6.1 | Loads without errors on first add? | YES | — |
| 6.2 | Broken output at extreme param values? | No crash or NaN. LEVELS at 2 produces a single midpoint contour. STROKE W at 4 on a flat image produces minimal visible output — valid behaviour | — |

## Section 7 — Final Critique

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 7.1 | Confusing, misleading, or inconsistent behaviour? | All four params show +D slots implying driver reactivity — none are functional. This is the most egregious driver misrepresentation across the reviewed modules: four fake driver affordances on a single four-param module. STROKE LVL as a 0–255 greyscale scalar is a poor expressive model for stroke colour — users expect RGB control. No previewMax cap on the cost-scaling params means preview performance is unprotected at max settings | ERROR |
| 7.2 | Additional critique or observations? | Module occupies a genuinely distinct and valuable space — topographic contour rendering, iso-luminance level-set extraction, region banding. Its core is real and useful. The redesign priority is: (1) fix all four fake driver slots; (2) reframe as contour-and-band-field extraction system; (3) add domain selection; (4) replace STROKE LVL greyscale with RGB stroke colour; (5) add contour mask and band index as field outputs; (6) add contour-plus-fill output mode. Strong utility as a structural pre-processing stage for tessellation, painterly, stipple, halftone, and region-assignment workflows | — |

## Issues

```
[ERROR] [BUG] All four driveable params have non-functional driver slots — apply() omits modulate
Location: nodes/geometric/ContourNode.js — levels, strokeW, strokeLevel, blendAmt params + apply signature
Evidence: All four params have driveable: true. apply(src, dst, w, h, p) omits modulate entirely. p.levels, p.strokeW, p.strokeLevel, p.blendAmt are all passed as scalars with no driver influence path.
Impact: Highest concentration of non-functional driver affordances in the GEOMETRIC category. Four fake +D slots presented to the user.
```

```
[WARN] [STANDARDS] Domain locked to BT.601 luminance — no alternative input field
Location: nodes/geometric/ContourNode.js — apply()
Evidence: contourRGBA computes iso-value boundaries on luminance only. No domain selection param.
Impact: Cannot produce contours on R/G/B channels, saturation, gradient magnitude, external fields, or noise — major limitation for a field-processing pipeline.
```

```
[WARN] [STANDARDS] Band spacing is uniform only — no perceptual or histogram-adaptive banding
Location: nodes/geometric/ContourNode.js — levels param
Evidence: Bands divide luminance range [0–255] into equal-width intervals. No shadow/highlight bias, no histogram-adaptive placement, no custom band stops.
Impact: Uniform bands oversample some tonal regions and undersample others depending on image histogram.
```

```
[WARN] [STANDARDS] Stroke colour is a single greyscale scalar (STROKE LVL 0–255) — no RGB, no source-derived colour
Location: nodes/geometric/ContourNode.js — strokeLevel param
Evidence: strokeLevel is a greyscale target; contour pixels are blended toward a single luminance value. No RGB colour, no band-derived colour, no source-colour sampling.
Impact: Stroke colour range is narrow; module cannot produce coloured contour overlays.
```

```
[NOTE] [PARITY] No region/fill output mode — module cannot produce filled contour bands
Location: nodes/geometric/ContourNode.js — apply()
Evidence: Output is contour strokes only; no contour-plus-fill, no band index, no alternating-band render, no flat fill per band.
Impact: Topographic filled-band rendering — a standard output for contour systems — is unavailable.
```

```
[NOTE] [PARITY] No field export — module cannot feed structural results downstream
Location: nodes/geometric/ContourNode.js — apply()
Evidence: Output is always a modified image. No contour mask, band field, band index, contour distance field, or driver output.
Impact: Module cannot participate as a structural conditioning stage in the pipeline.
```

```
[WARN] [PERFORMANCE] No previewMax cap on LEVELS or STROKE W — preview unprotected at max params
Location: nodes/geometric/ContourNode.js — levels, strokeW params
Evidence: No previewMax defined. LEVELS 32 + STROKE W 4 on high-texture 4K source reaches class C cost (~100–400 ms).
Impact: Preview may be sluggish at max param combinations on complex sources.
```

```
[WARN] [STANDARDS] Name shows "CONTOUR" with "MODULE" prefix visible in picker
Location: CategoryPicker — CONTOUR entry
Evidence: User confirmed name displays with MODULE prefix.
Impact: Violates naming standard — module name must not include the word "MODULE".
```

```
[ERROR] [BUG] Driver slot +D button non-functional — see G1
Location: NodePanel — all param +D buttons
```

## Required Rebuild Specification

### Operating Modes

| Mode | Notes |
|---|---|
| CONTOUR | Stroke-only overlay on source image |
| FILL | Filled bands only, no stroke |
| CONTOUR + FILL | Both stroke and filled bands |
| MASK | Contour boundary as binary/soft mask |
| FIELD | Band index or contour distance field for downstream use |

### Core Architecture

**A. Input Domain**
LUMINANCE / RED / GREEN / BLUE / HUE / SATURATION / CHROMA / GRADIENT MAGNITUDE / LOCAL CONTRAST / EXTERNAL FIELD / NOISE FIELD / MASK

**B. Band Structure**
LEVELS, BAND SPACING MODE (UNIFORM / SHADOW-BIASED / HIGHLIGHT-BIASED / HISTOGRAM-ADAPTIVE / CUSTOM STOPS), INVERT BANDS, PRE-REMAP, PRE-BLUR

**C. Stroke**
STROKE WIDTH, STROKE PROFILE, STROKE COLOUR MODE (GREYSCALE / RGB / SOURCE-DERIVED / BAND-DERIVED), STROKE LEVEL, OPACITY, INNER/OUTER BIAS, FEATHER

**D. Fill**
FILL MODE (NONE / FLAT / ALTERNATING / SOURCE-PRESERVING), BAND COLOUR MAPPING, FILL OPACITY

**E. Output**
OUTPUT TYPE, INVERT, NORMALISE, FIELD EXPORT (band index / contour mask / contour distance), DOWNSTREAM DRIVER EXPORT

### Driver Boundary
Remove `driveable: true` from all four params until apply() supports modulate. After architecture correction, permissible driver targets: BLEND, STROKE LEVEL, BAND BIAS. LEVELS and STROKE W are only driveable if quantised field remapping and spatially varying dilation are implemented.

### Performance
Add `previewMax` to LEVELS (cap: 16) and STROKE W (cap: 2) to protect preview performance.

### Naming
Remove "MODULE" prefix from CategoryPicker display name.

## Action Items

1. **[CRITICAL]** Remove `driveable: true` from all four params until apply() architecture supports modulate.
2. **[CRITICAL]** Fix picker name — remove "MODULE" prefix from CategoryPicker display entry.
3. **[HIGH]** Add INPUT DOMAIN param (LUMINANCE / RED / GREEN / BLUE / HUE / SATURATION / CHROMA / GRADIENT MAGNITUDE / EXTERNAL FIELD).
4. **[HIGH]** Replace STROKE LVL (0–255 greyscale) with STROKE COLOUR MODE and RGB stroke colour control.
5. **[HIGH]** Add BAND SPACING MODE param (UNIFORM / SHADOW-BIASED / HIGHLIGHT-BIASED / HISTOGRAM-ADAPTIVE).
6. **[HIGH]** Add FIELD output mode — export band index, contour mask, and contour distance field for downstream use.
7. **[HIGH]** Add CONTOUR + FILL and FILL-only output modes.
8. Add `previewMax` caps: LEVELS → 16, STROKE W → 2.
9. Ensure computation runs in web worker (G12).
10. Fix +D driver button (G1).
11. Rebuild driver affordances honestly once apply() architecture supports modulate (G2).
12. Slider direct input and double-click-to-default (G5).
13. Add unit labels to all numeric params (G16) — STROKE W already has `unit: 'px'`; LEVELS: none; BLEND: none.
14. Hide mode-conditional params per active output mode and colour mode (G14).
