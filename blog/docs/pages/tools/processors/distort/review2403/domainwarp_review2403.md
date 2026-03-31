# DOMAIN WARP — Review 2403

- type: `domainwarp`
- category: NOISE
- isVector: false
- verdict: KEEP — major architectural upgrade required
- priority: HIGH
- date: 2026-03-24
- reviewer: user

---

## Section 1 — Triage

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 1.1 | What does this module do? | Uses a noise field to displace image sampling coordinates — warps the image by shifting where each pixel samples from | — |
| 1.2 | Visually distinct from all other NOISE modules? | YES — coordinate displacement is distinct from noise overlay | — |
| 1.3 | Verdict | KEEP — upgrade from whole-image coordinate warp to selective field-based transformation system | — |

## Issues

```
[ERROR] [PARITY] Module only performs whole-image coordinate warp — target selection and selective warp absent
Location: nodes/domainwarp — full implementation
Evidence: No warp target selection. Cannot warp individual channels, HSL components, or restrict warp by image-derived masks.
Impact: Module is a blunt instrument — full-frame warping destroys image uniformly with no selectivity.
```

```
[WARN] [PARITY] Warp field type is limited — no field type selection
Location: nodes/domainwarp — field generation
Evidence: No FIELD TYPE param. Only one noise type used internally.
Impact: Cannot access richer noise types (fBm, cellular, curl) for structurally different distortions.
```

```
[WARN] [PARITY] Directional mode is implicit — no control over how noise becomes displacement
Location: nodes/domainwarp — field → displacement mapping
Evidence: No DIRECTIONAL MODE param. Cannot choose scalar-to-x, scalar-to-y, gradient-normal, curl, or two-noise-vector displacement.
Impact: Distortion is always isotropic and uninflected.
```

## Required Upgrade Specification

### Core Conceptual Shift

From:
```
generate noise field → shift image coordinates
```

To:
```
generate warp field(s) → shape field → choose warp target → apply mode → composite
```

"Domain" must expand to mean: spatial domain, colour domain, channel domain, parameter domain.

### Five-Layer Target Architecture

```
Layer 1: Warp Field Generation
Layer 2: Field Shaping
Layer 3: Target Selection
Layer 4: Application Mode
Layer 5: Masking + Rendering/Compositing
```

---

### Layer 1 — Warp Field Generation

| Param | Notes |
|---|---|
| FIELD TYPE | PERLIN / SIMPLEX / FBM / RIDGED / TURBULENCE / CELLULAR / CURL |
| SCALE | Spatial frequency |
| OCTAVES | Layering depth (hide when not applicable — G14) |
| LACUNARITY | Frequency multiplier per octave |
| GAIN | Amplitude falloff per octave |
| SEED | Deterministic variation |
| OFFSET X / Y | Shift in noise space |
| ROTATION | Field rotation |
| ANISOTROPY | Axis-differential stretch |
| LAYERS | Iterative repeated warp (clearly defined — not hidden complexity) |

---

### Layer 2 — Field Shaping

| Param | Notes |
|---|---|
| STRENGTH | Master warp amplitude |
| X STRENGTH | Independent X-axis displacement |
| Y STRENGTH | Independent Y-axis displacement |
| BIAS | Shift field value range |
| CONTRAST | Expand/compress variation |
| THRESHOLD | Optional hard clipping |
| THRESHOLD SOFTNESS | Hard vs soft |
| INVERT | Invert field |
| ABSOLUTE | Turbulence-style |
| NORMALISE | Map to predictable range |
| DIRECTIONAL MODE | SCALAR→X / SCALAR→Y / SCALAR→XY / GRADIENT NORMAL / CURL FIELD / TWO-NOISE VECTOR |

---

### Layer 3 — Target Selection

| Target | Notes |
|---|---|
| SPATIAL POSITION | Standard coordinate warp (current behaviour) |
| RED CHANNEL | Warp only red sampling coordinates |
| GREEN CHANNEL | Warp only green |
| BLUE CHANNEL | Warp only blue |
| RGB INDEPENDENT | Each channel warped separately with optional offset seed and per-channel strength |
| HUE | Field-driven hue shift / remap |
| SATURATION | Field-driven saturation modulation |
| LIGHTNESS / VALUE | Field-driven tonal modulation without spatial displacement |
| ALPHA | Warp transparency/mask data |
| LUMINANCE | Warp derived luminance reconstruction |
| MASK | Warp only the compositing mask |

---

### Layer 4 — Application Mode

| Mode | Notes |
|---|---|
| COORDINATE WARP | Sample target from shifted coordinates (default) |
| ADDITIVE SHIFT | Field adds to target value directly |
| PHASE SHIFT | For periodic domains (hue, angle) |
| RANGE REMAP | Field remaps value range |
| SEPARATE X/Y WARP | Independent displacement per axis |
| NORMAL WARP | Warp follows derived normal field |
| CURL WARP | Divergence-free vector field warp |

---

### Layer 5 — Masking + Rendering/Compositing

**Masking (controls where warp applies):**

| Param | Notes |
|---|---|
| MASK SOURCE | LUMINANCE / SATURATION / HUE / EDGE MASK / DISTANCE TO EDGE / NOISE MASK / PATTERN MASK / NONE |
| MASK METRIC | Scalar to extract from source |
| MASK MIN / MAX | Remap bounds |
| MASK SOFTNESS | Transition softness |
| MASK INVERT | Invert mask |

**Compositing:**

| Param | Notes |
|---|---|
| OPACITY | Standard |
| BLEND MODE | Standard |
| CLAMP MODE | CLAMP / MIRROR / WRAP / TRANSPARENT |
| SAMPLING MODE | NEAREST / BILINEAR / BICUBIC |
| WARP PREVIEW | Toggle to display warp field |
| DIFFERENCE PREVIEW | Display warped vs unwarped delta |

---

### Most Valuable First Extensions

1. **RGB-independent coordinate warp** — warp R, G, B from different noise samples → rich chromatic distortion without separate aberration module
2. **Hue-only field modulation** — organic colour drift without damaging image form
3. **Luminance-mask-restricted spatial warp** — warp only highlights, shadows, or mid-range
4. **Distance-to-edge-controlled strength** — strong warp in flat areas, weak near edges — prevents uniform image destruction

### Future: Domain Warp of Other Modules

Warp halftone sampling grid, grating phase, Truchet orientation field, moiré interference field, threshold map. This makes domain warp a general modulation tool rather than a terminal image effect. Requires integration with the driver architecture (G11).

```
[ERROR] [BUG] Driver slot button non-functional — see _global_issues.md G1
```

## Action Items

1. **[HIGH PRIORITY]** Add FIELD TYPE dropdown — implement Perlin, Simplex, fBm, Cellular, Curl as first set.
2. **[HIGH PRIORITY]** Add TARGET SELECTION — implement SPATIAL POSITION, RGB INDEPENDENT, HUE, SATURATION, LIGHTNESS as first set.
3. **[HIGH PRIORITY]** Add DIRECTIONAL MODE dropdown.
4. **[HIGH PRIORITY]** Add masking layer: MASK SOURCE, MASK METRIC, MASK MIN/MAX, MASK SOFTNESS, MASK INVERT.
5. Add CLAMP MODE and SAMPLING MODE to compositing.
6. Add WARP PREVIEW and DIFFERENCE PREVIEW diagnostic modes.
7. Hide mode-conditional params when not applicable (global — G14).
8. Fix +D driver button (global — tracked in `_global_issues.md` G1).
9. Audit all params for `driveable: true` — add where absent (global — tracked in `_global_issues.md` G2).
10. Slider direct input and double-click-to-default (global — tracked in `_global_issues.md` G5).
11. Add unit labels to all numeric params (global — tracked in `_global_issues.md` G16).
12. Use shared components for overlapping features (global — tracked in `_global_issues.md` G11).
