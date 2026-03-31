# FILM GRAIN — Review 2403

- type: `filmgrain`
- category: TEXTURE
- isVector: false
- verdict: KEEP — rebuild as grain and noise-field system
- priority: HIGH
- date: 2026-03-24
- reviewer: user

---

## Section 1 — Triage

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 1.1 | What does this module do? | Adds a visible grain overlay to the image using a single noise source with shallow luminance response and a chromatic toggle | — |
| 1.2 | Visually distinct from all other modules? | YES — grain/noise texture is unique | — |
| 1.3 | Verdict | KEEP — rebuild as full grain and noise-field system | — |

## Current Implementation

Controls: OPACITY, BLEND MODE, AMOUNT, SIZE, LUMINANCE RESPONSE, CHROMATIC (toggle), MASK. Single-pass overlay. One noise source. One broad luminance weighting. One optional colour-separation switch. One composite stage.

## Issues

```
[ERROR] [PARITY] Module is a simple overlay — not a field-driven grain system
Location: nodes/filmgrain — full implementation
Evidence: No multi-layer grain, no field derivation, no image-aware driver mapping, no channel-aware processing, no image perturbation mode, no field output for downstream modules.
Impact: Module is architecturally an endpoint overlay; cannot function as a structural system component.
```

```
[ERROR] [PARITY] No multi-scale or multi-layer grain — single noise source only
Location: nodes/filmgrain — field generation
Evidence: No layer count, no per-layer algorithm, no coarse/fine mixing.
Impact: Cannot produce realistic multi-scale grain (coarse + fine structure).
```

```
[ERROR] [PARITY] Chromatic toggle is too blunt — no channel processing system
Location: nodes/filmgrain — channel controls
Evidence: Single CHROMATIC on/off. No RGB decorrelated mode, no luminance/chroma split, no hue-sector targeting, no per-channel amplitude.
Impact: Colour grain is binary — either linked or split, no nuance.
```

```
[WARN] [PARITY] No tonal zone controls — single LUMINANCE RESPONSE slider
Location: nodes/filmgrain — tonal mapping
Evidence: No shadow weight, midtone weight, highlight weight, tonal curve, black/white protection.
Impact: Cannot make grain behave differently in shadows vs highlights vs midtones.
```

```
[WARN] [PARITY] No image-reactive driver mapping — grain does not respond to edge, contrast, or structural fields
Location: nodes/filmgrain — driver mapping
Evidence: No edge influence, gradient magnitude influence, local contrast influence, distance-to-edge influence.
Impact: Grain is uniform across all image regions regardless of structure.
```

```
[ERROR] [PARITY] No field output — grain cannot be reused by downstream modules
Location: nodes/filmgrain — output
Evidence: No scalar grain field, threshold mask, or driver output exposed for downstream use by halftone, dither, stipple, mosaic, reaction diffusion, etc.
Impact: Module is trapped as an endpoint; cannot participate in the broader pipeline system.
```

```
[WARN] [PARITY] No temporal control — no deterministic per-frame grain, drift, or baked state
Location: nodes/filmgrain — temporal behaviour
Evidence: No TEMPORAL MODE, TEMPORAL SEED, FRAME param, or BAKE STATE.
Impact: Grain is either static or randomly resampled with no predictable temporal behaviour.
```

## Required Rebuild Specification

### Three Operating Modes

| Mode | Notes |
|---|---|
| FINISH | Visible grain as cosmetic texture overlay |
| PERTURBATION | Drive controlled disruption of image properties before composite |
| FIELD OUTPUT | Reusable field source for downstream modules (halftone, dither, stipple, mosaic, reaction diffusion, threshold modulation) |
| HYBRID | Alter image + produce visible grain simultaneously |

### Eight-Stage Target Architecture

```
Stage 1: Field Generation
Stage 2: Field Processing
Stage 3: Source Image Field Derivation
Stage 4: Driver Mapping
Stage 5: Rendering
Stage 6: Image Modification
Stage 7: Compositing
Stage 8: Field Output
```

---

### Stage 1 — Field Generation

Multi-layer grain. Each layer is independent.

**Supported algorithms:**
WHITE NOISE / GAUSSIAN NOISE / VALUE NOISE / PERLIN / SIMPLEX / WORLEY-CELLULAR / BLUE-NOISE-DERIVED / FBM / RIDGED / TURBULENCE / DIRECTIONAL STREAK

**Per-layer controls:**

| Param | Notes |
|---|---|
| ENABLED | Toggle |
| ALGORITHM | From list above |
| SEED | Deterministic variation |
| SCALE | Spatial frequency |
| AMPLITUDE | Layer strength |
| OFFSET X / Y | Spatial offset |
| ROTATION | Field rotation |
| ANISOTROPY | Directional stretch |
| OCTAVE COUNT | For multi-octave types |
| LACUNARITY | Frequency multiplier per octave |
| PERSISTENCE / GAIN | Amplitude falloff |
| THRESHOLD | Optional binary gate |
| QUANTISATION | Discrete banding |
| TEMPORAL PHASE | Phase in time |
| TEMPORAL SPEED | Drift/evolution rate |

---

### Stage 2 — Field Processing

| Operation | Notes |
|---|---|
| REMAP LOW / HIGH | Adjust output range |
| CLAMP | Hard limits |
| INVERT | Flip field |
| BIAS / GAIN | Value shaping |
| SMOOTHSTEP | Soft ramp |
| THRESHOLD | Binary gate |
| QUANTISE | Discrete bands |
| BLUR / SHARPEN | Field smoothing |
| BAND-LIMIT | Frequency shaping |
| COMBINE LAYERS | Multiply / add / min / max / mix |
| DOMAIN WARP | One field distorts another |
| HISTOGRAM SHAPING | Equalise distribution |

**Derived field outputs from processed fields:**
SCALAR FIELD / MASK / THRESHOLDED GRAIN MAP / CLUSTERED GRAIN MAP / GRADIENT MAGNITUDE / GRADIENT ANGLE / TANGENT / NORMAL / PARTITION ID FIELD / DIFFERENCE FIELD

---

### Stage 3 — Source Image Field Derivation

| Field | Notes |
|---|---|
| LUMINANCE | Broad tonal control |
| RED / GREEN / BLUE | Channel-specific |
| HUE / SATURATION / CHROMA MAGNITUDE | Colour-space fields |
| LOCAL CONTRAST | Texture energy |
| GRADIENT MAGNITUDE | Edge strength |
| GRADIENT ANGLE | Directionality |
| EDGE MAP | Contour detection |
| **DISTANCE TO EDGE** | First-class smooth contour field |
| TONAL ZONES | SHADOWS / MIDTONES / HIGHLIGHTS |
| POSITION X / Y | Spatial gradient |
| RADIAL DISTANCE | Centre-outward |
| MASK | User-defined |

---

### Stage 4 — Driver Mapping

Every major grain parameter should be: FIXED / IMAGE-DRIVEN / FIELD-DRIVEN / HYBRID.

**Driver-mappable parameters:**
GRAIN DENSITY / GRAIN AMPLITUDE / GRAIN SIZE / GRAIN CLUSTERING / GRAIN SOFTNESS / CHANNEL DECORRELATION / CHROMATIC SPLIT STRENGTH / EDGE SUPPRESSION / EDGE EMPHASIS / SHADOW WEIGHT / HIGHLIGHT SUPPRESSION / PERTURBATION AMOUNT / COMPOSITE OPACITY / PARTICULATE THRESHOLD / DRIFT STRENGTH

---

### Stage 5 — Rendering

**Render modes:**
MONOCHROME / RGB LINKED / RGB DECORRELATED / LUMINANCE ONLY / CHROMA ONLY / PARTICULATE / SOFT CLOUDED / THRESHOLDED SPECK / DIRECTIONAL / CLUSTERED CONTAMINATION / PRINT-DUST / SENSOR NOISE

**Rendering params:**

| Param | Notes |
|---|---|
| RENDER MODE | From list above |
| COARSE/FINE LAYER MIX | |
| PARTICULATE SHARPNESS | |
| SOFTNESS | |
| THRESHOLD CUTOFF | |
| DIRECTIONAL STRETCH | |
| CHANNEL OFFSET | |
| CHANNEL SCALE OFFSET | |
| CHANNEL DECORRELATION | |
| HIGHLIGHT CONTAMINATION | |
| SHADOW DENSITY | |

---

### Stage 6 — Image Modification (pre-composite)

| Property | Notes |
|---|---|
| LUMINANCE PERTURBATION | |
| CHROMA PERTURBATION | |
| HUE JITTER | |
| SATURATION JITTER | |
| BLUR MODULATION | |
| SHARPEN MODULATION | |
| THRESHOLD BREAKUP | |
| POSTERISE BREAKUP | |
| HALFTONE IRREGULARITY | |
| DITHER THRESHOLD MODULATION | |

---

### Stage 7 — Compositing

| Param | Notes |
|---|---|
| OPACITY | Standard |
| BLEND MODE | Standard |
| LUMA-ONLY COMPOSITE | Apply grain to luminance channel only |
| CHROMA-ONLY COMPOSITE | Apply to chroma only |
| COMPOSITE MASK | |
| COMPOSITE DOMAIN | PRE-IMAGE-PROCESSING / POST / DUAL-STAGE |
| GAMMA-AWARE COMPOSITE | Toggle |

---

### Stage 8 — Field Output

| Output | Notes |
|---|---|
| GRAIN SCALAR FIELD | Raw field for downstream use |
| THRESHOLD MASK | Binary grain mask |
| CHANNEL-SEPARATED GRAIN FIELDS | Per-channel R/G/B fields |
| GRAIN NORMAL | |
| GRAIN TANGENT | |
| PARTITION / ID FIELD | |
| CLUSTERED GRAIN MASK | |
| PERTURBATION MASK | |
| DRIVER OUTPUT | Send to downstream driver bus |

---

### Tonal Zone Controls (replace LUMINANCE RESPONSE)

| Param | Notes |
|---|---|
| LUMINANCE INFLUENCE | Overall luminance weighting |
| SHADOW WEIGHT | Grain in dark regions |
| MIDTONE WEIGHT | Grain in midrange |
| HIGHLIGHT WEIGHT | Grain in bright regions |
| TONAL CURVE | Shape luminance-to-grain mapping |
| BLACK PROTECTION | Suppress grain in deepest shadows |
| WHITE PROTECTION | Suppress grain in brightest highlights |
| FLAT-AREA BOOST | Increase grain in low-contrast zones |
| LOCAL CONTRAST INFLUENCE | More grain in textured areas |

### Channel Mode System (replace CHROMATIC toggle)

| Mode | Notes |
|---|---|
| MONO | Single shared field |
| RGB LINKED | One field, same for all channels |
| RGB DECORRELATED | Separate independent fields per channel |
| LUMINANCE / CHROMA SPLIT | Separate luma vs chroma grain |
| HUE-ONLY | Grain shifts hue only |
| SATURATION-ONLY | Grain modulates saturation only |

### Temporal System

| Param | Notes |
|---|---|
| TEMPORAL MODE | LOCKED / RE-SAMPLED / DRIFT / SCROLL / FLICKER / BAKED |
| TEMPORAL SPEED | Evolution rate |
| TEMPORAL COHERENCE | Smoothness over time |
| TEMPORAL SEED | Deterministic variation |
| FRAME | Animation driver (G9) |
| DETERMINISTIC EXPORT | Stable output per-frame |

### Recommended Starting Presets

Scanned film / Pushed film stock / Low-light digital sensor / Dusty print / Photocopy contamination / Soft chroma grain / Harsh monochrome grain / Coarse clustered contamination

---

### Minimum Acceptable Upgrade

1. Multi-layer grain generation (≥3 layers)
2. ≥3 field algorithms (white, Perlin/simplex, blue-noise-derived)
3. Proper tonal zone controls (shadow/mid/highlight weights)
4. Edge and contrast response
5. Channel modes beyond CHROMATIC toggle (at minimum: MONO / RGB LINKED / RGB DECORRELATED / LUMA-CHROMA SPLIT)
6. FIELD OUTPUT mode
7. Resolution-stable preview/export
8. IMAGE PERTURBATION mode

---

## Action Items

1. **[HIGH PRIORITY]** Separate field generation from rendering — implement multi-layer grain with ALGORITHM, SEED, SCALE, AMPLITUDE per layer.
2. **[HIGH PRIORITY]** Add tonal zone controls: SHADOW WEIGHT, MIDTONE WEIGHT, HIGHLIGHT WEIGHT, TONAL CURVE.
3. **[HIGH PRIORITY]** Replace CHROMATIC toggle with CHANNEL MODE system.
4. **[HIGH PRIORITY]** Add FIELD OUTPUT mode — expose grain scalar field and threshold mask for downstream modules.
5. **[HIGH PRIORITY]** Add image perturbation stage — LUMINANCE PERTURBATION, CHROMA PERTURBATION, BLUR MODULATION.
6. **[HIGH PRIORITY]** Add edge/contrast driver mapping: EDGE INFLUENCE, DISTANCE-TO-EDGE INFLUENCE, LOCAL CONTRAST INFLUENCE.
7. Add TEMPORAL MODE system: LOCKED / DRIFT / BAKED / FRAME param (G9).
8. Add PERTURBATION and HYBRID modes.
9. Add starting presets per grain character (scanned film, pushed film, low-light sensor, etc.).
10. Integrate with shared noise infrastructure where available (G11).
11. Ensure all computation runs in web worker (G12).
12. Fix +D driver button (G1).
13. Audit all params for `driveable: true` (G2).
14. Slider direct input and double-click-to-default (G5).
15. Add unit labels to all numeric params (G16).
16. Hide mode-conditional params (G14).
