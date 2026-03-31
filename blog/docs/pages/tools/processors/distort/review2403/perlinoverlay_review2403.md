# PERLIN OVERLAY — Review 2403

- type: `perlinoverlay`
- category: NOISE
- isVector: false
- verdict: KEEP — rename and major architectural upgrade required
- priority: HIGH
- date: 2026-03-24
- reviewer: user

---

## Section 1 — Triage

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 1.1 | What does this module do? | Generates Perlin noise and blends it over the image as a visible overlay | — |
| 1.2 | Visually distinct from all other NOISE modules? | YES — but current implementation is too weak to justify standalone existence | WARN |
| 1.3 | Verdict | KEEP — rename to NOISE FIELD; full architectural upgrade required | — |

## Issues

```
[WARN] [STANDARDS] Module name is inconsistent — dropdown shows "NOISE OVERLAY", module header shows "PERLINOVERLAY"
Location: CategoryPicker label vs NodePanel header
Evidence: User observed mismatch during review.
Impact: Naming inconsistency; canonicalise to single name. Recommended: rename to NOISE (or NOISE FIELD).
```

```
[ERROR] [PARITY] Module is a raw Perlin multiply layer — not a field-driven noise system
Location: nodes/perlinoverlay — full implementation
Evidence: Module generates Perlin noise and blends it over the image. No noise type selection, no field shaping, no image modification modes, no driver integration.
Impact: Module is too weak to be a meaningful pipeline component. A decorative Perlin overlay provides minimal creative value.
```

```
[WARN] [PARITY] Only Perlin noise supported — no noise family selection
Location: nodes/perlinoverlay — noise generation
Evidence: No NOISE TYPE param. Simplex, fBm, cellular, white noise, curl, blue noise, etc. are all absent.
Impact: Cannot access the most useful noise types for creative or structural work.
```

## Required Upgrade Specification

### Rename

Rename from `perlinoverlay` to `noise` (or `noisefield`). CategoryPicker label: NOISE.

### Core Conceptual Shift

From:
```
generate Perlin noise → blend over image
```

To:
```
generate noise field → shape field → render / modify image
```

Noise is a **field generator** — its value is in driving tone, colour, opacity, displacement, masking, and structural variation. Not a decorative overlay.

### Four-Layer Target Architecture

```
Layer 1: Noise Generation
Layer 2: Field Shaping
Layer 3: Rendering
Layer 4: Image Modification
```

---

### Layer 1 — Noise Generation

| Param | Notes |
|---|---|
| NOISE TYPE | VALUE / PERLIN / SIMPLEX / FBM / RIDGED / TURBULENCE / CELLULAR / VORONOI / BLUE NOISE / WHITE NOISE / CURL |
| SCALE | Spatial frequency |
| OCTAVES | Layering depth (fBm, ridged, turbulence) |
| LACUNARITY | Frequency multiplier between octaves |
| GAIN | Amplitude falloff between octaves |
| SEED | Deterministic variation |
| OFFSET X / Y | Horizontal/vertical shift in noise space |
| ROTATION | Field rotation |
| ASPECT RATIO | Anisotropy / axis scaling |

Mode-conditional params hidden when not applicable (G14): OCTAVES, LACUNARITY, GAIN hidden for single-octave types.

### Layer 2 — Field Shaping

| Param | Notes |
|---|---|
| BIAS | Shift value range |
| CONTRAST | Expand/compress value range |
| THRESHOLD | Convert to binary/semi-binary structure |
| THRESHOLD SOFTNESS | Hard vs soft transition |
| INVERT | Invert field |
| ABSOLUTE | Turbulence-style |
| POSTERISE | Quantise into bands |
| NORMALISE | Map to predictable range |
| DOMAIN WARP STRENGTH | Warp field by another noise layer |
| WARP SCALE | Scale of warping field |

### Layer 3 — Rendering

| Param | Notes |
|---|---|
| RENDER MODE | OVERLAY / MASK PREVIEW / COLOUR RAMP / CONTOUR BANDS / GRAIN / REGION FILL |
| MIN COLOUR | Colour for minimum value |
| MAX COLOUR | Colour for maximum value |
| RAMP MODE | Value → colour mapping |
| BAND COUNT | For contour/posterised display |
| ALPHA FROM NOISE | Noise drives opacity |
| OPACITY | Standard |
| BLEND MODE | Standard |

### Layer 4 — Image Modification

| Modification Mode | Notes |
|---|---|
| NONE | Visible overlay only |
| OPACITY MODULATION | Noise modulates image opacity |
| BRIGHTNESS MODULATION | Noise modulates brightness/value |
| CONTRAST MODULATION | Noise modulates local contrast |
| SATURATION MODULATION | Noise modulates saturation |
| HUE SHIFT | Noise drives colour shift |
| MASK | Noise as compositing mask |
| DISPLACEMENT | Noise offsets image sampling |
| NORMAL DISPLACEMENT | Noise gradient as displacement normal |
| DOMAIN WARP | Noise distorts image coordinates through another noise field |
| BLUR MODULATION | Noise controls local blur |
| DITHER / GRAIN | Stochastic tonal breakup |

### Priority Creative Uses

1. **Grain** — high-frequency white/blue noise, low amplitude, optionally luminance-linked
2. **Cloud/fog masking** — low-frequency thresholded noise as soft tonal mask
3. **Displacement field** — sample image at `x' = x + s*noiseX`, `y' = y + s*noiseY`
4. **Domain warping** — one noise field offsets sampling coordinates for another
5. **Thresholded organic masks** — cellular/voronoi blobs as region partitions
6. **Contour banding** — posterised noise as contour-like level sets
7. **Directional texture** — anisotropic noise for hair, grain, striation, cloth
8. **Driver source for other modules** — noise drives halftone spacing, grating phase, Truchet stroke width, chromatic aberration strength, blur radius

### Driver Integration

Noise field should be exposable as a **driver source** for other modules (halftone spacing, grating phase, Truchet stroke width, displacement strength, blur radius, etc.). Module must integrate with the driver architecture defined in G11.

### Recommended First Version

- Noise types: Perlin, Simplex, fBm, Cellular, White Noise
- Field shaping: threshold, softness, contrast, posterise, invert
- Rendering: colour ramp, mask preview, grain, contour bands
- Image modification: brightness modulation, masking, displacement, domain warp

```
[ERROR] [BUG] Driver slot button non-functional — see _global_issues.md G1
```

## Action Items

1. **[HIGH PRIORITY]** Rename module to `noise` (or `noisefield`). Align CategoryPicker label and NodePanel header.
2. **[HIGH PRIORITY]** Add NOISE TYPE dropdown — implement Perlin, Simplex, fBm, Cellular, White Noise as first set.
3. **[HIGH PRIORITY]** Implement Field Shaping layer: THRESHOLD, SOFTNESS, CONTRAST, POSTERISE, INVERT, DOMAIN WARP.
4. **[HIGH PRIORITY]** Implement Rendering layer: COLOUR RAMP, MASK PREVIEW, GRAIN, CONTOUR BANDS modes.
5. **[HIGH PRIORITY]** Implement Image Modification layer: BRIGHTNESS MODULATION, MASKING, DISPLACEMENT, DOMAIN WARP.
6. Hide mode-conditional params when not applicable (global — G14).
7. Expose noise field as driver source for other modules (global — G11).
8. Fix +D driver button (global — tracked in `_global_issues.md` G1).
9. Audit all params for `driveable: true` — add where absent (global — tracked in `_global_issues.md` G2).
10. Slider direct input and double-click-to-default (global — tracked in `_global_issues.md` G5).
11. Add unit labels to all numeric params (global — tracked in `_global_issues.md` G16).
