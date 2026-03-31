# VIGNETTE — Review 2403

- type: `vignette`
- category: TEXTURE
- isVector: false
- verdict: KEEP — rebuild as spatial emphasis / attenuation field system
- priority: HIGH
- date: 2026-03-24
- reviewer: user

---

## Section 1 — Triage

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 1.1 | What does this module do? | Applies a centred radial darkening overlay to the image with amount, softness, and roundness controls | — |
| 1.2 | Visually distinct from all other modules? | YES — spatial centre-periphery attenuation is unique | — |
| 1.3 | Verdict | KEEP — rebuild as spatial emphasis / attenuation field system | — |

## Current Implementation

Controls: OPACITY, BLEND MODE, AMOUNT, SOFTNESS, ROUNDNESS, MASK. Single centred radial darkening overlay. One shape (oval), one effect (darken), no field output.

## Issues

```
[ERROR] [PARITY] Spatial definition is too shallow — locked to centred oval with one roundness control
Location: nodes/vignette — shape generation
Evidence: No CENTRE X/Y, no independent SIZE X/Y, no rotation, no shape family selection, no asymmetry.
Impact: Cannot produce off-centre, rectangular, directional, or custom-form vignettes.
```

```
[ERROR] [PARITY] Module only darkens — no other render modes
Location: nodes/vignette — rendering
Evidence: No brightening, colour cast, saturation shift, contrast shaping, blur-to-edge, or sharpen-to-centre modes.
Impact: Severely limits creative and practical uses.
```

```
[ERROR] [PARITY] No field output — vignette cannot drive downstream modules
Location: nodes/vignette — output
Evidence: No scalar field, edge-distance field, threshold mask, or driver output exposed.
Impact: Module cannot drive grain distribution, painterly density, mosaic scale, halftone weighting, or blur amount in downstream modules.
```

```
[WARN] [PARITY] No image-aware modulation — purely geometric
Location: nodes/vignette — image response
Evidence: No luminance influence, contrast protection, edge response, subject mask, or saliency weighting.
Impact: Vignette blindly crushes corners regardless of image content — may destroy already-dark corners or brighten important edge content.
```

```
[WARN] [PARITY] No image modification mode — only composites over image
Location: nodes/vignette — image modification
Evidence: Cannot modify blur radius, grain intensity, saturation, halftone density, or other properties before final composite.
Impact: Module is a terminal overlay, not a structural system component.
```

## Required Rebuild Specification

### Correct Framing

A vignette is a **spatial field** — a controllable periphery-versus-centre function. It should be understood through standard system separation:

```
generation → field derivation → driver mapping → rendering → image modification → compositing → field output
```

### Four Operating Modes

| Mode | Notes |
|---|---|
| VISIBLE VIGNETTE | Lens-style optical finishing overlay |
| IMAGE MODIFIER | Modify image properties before composite (blur, grain, contrast, saturation) |
| FIELD OUTPUT | Reusable attenuation field for downstream modules |
| HYBRID | Visible overlay + image modification + field output simultaneously |

### Eight-Stage Target Architecture

```
Stage 1: Field Generation
Stage 2: Field Derivation
Stage 3: Image-Derived Field Derivation
Stage 4: Driver Mapping
Stage 5: Rendering
Stage 6: Image Modification
Stage 7: Compositing
Stage 8: Field Output
```

---

### Stage 1 — Field Generation

**Shape families:**
ELLIPSE / CIRCLE / RECTANGLE / ROUNDED RECTANGLE / LINEAR GRADIENT / FOUR-CORNER FALLOFF / TOP-BOTTOM / LEFT-RIGHT / DIAMOND (Manhattan distance) / NOISE-WARPED / CUSTOM MASK / SUBJECT SPOTLIGHT

**Per-shape controls:**

| Param | Notes |
|---|---|
| CENTRE X / Y | Position (canvas click-to-pick — G6) |
| SIZE X / Y | Independent axis extents |
| ROTATION | |
| ROUNDNESS | Where applicable |
| ASYMMETRY X / Y | Non-uniform falloff per axis |
| INVERT | Swap centre/edge roles |

**Falloff group:**

| Param | Notes |
|---|---|
| FALLOFF TYPE | LINEAR / SMOOTH / EXPONENTIAL / LOGISTIC / STEPPED |
| SOFTNESS | (retain from current) |
| EDGE HARDNESS | |
| INNER RADIUS | Where attenuation begins |
| OUTER RADIUS | Where attenuation reaches full strength |
| BIAS / GAMMA | Shape value curve |
| BAND COUNT | For stepped mode |

---

### Stage 2 — Field Derivation

| Output | Notes |
|---|---|
| SCALAR VIGNETTE FIELD | Raw 0–1 attenuation field |
| INVERSE FIELD | 1 - vignette |
| EDGE DISTANCE FIELD | Distance from edge |
| CENTRE DISTANCE FIELD | Distance from centre |
| BANDED ZONE FIELD | Discrete bands |
| THRESHOLD MASK | Binary gate |
| NORMALISED FALLOFF | |
| TANGENT / GRADIENT DIRECTION | |
| GRADIENT MAGNITUDE | |
| DIRECTIONAL PARTITION | |
| DRIVER OUTPUT | Send to downstream driver bus |

---

### Stage 3 — Image-Derived Field Derivation

| Field | Notes |
|---|---|
| LUMINANCE | Protect bright centres from crushing |
| LOCAL CONTRAST | |
| EDGE MAP / EDGE DENSITY | |
| SATURATION / HUE | |
| MASK | User-defined subject region |
| POSITION X / Y | |
| RADIAL DISTANCE | |
| SALIENCY APPROXIMATION | Future |

---

### Stage 4 — Driver Mapping

Every major parameter: FIXED / IMAGE-DRIVEN / FIELD-DRIVEN / HYBRID.

**Driver-mappable params:** INTENSITY / SOFTNESS / CENTRE POSITION / SIZE X/Y / ROTATION / ASYMMETRY / COLOUR CAST STRENGTH / BLUR AMOUNT / GRAIN AMOUNT / CONTRAST SHAPING / THRESHOLD BANDS

**Driver sources:** luminance / local contrast / saturation / hue / edge map / distance to edge / mask / position X/Y / radial distance / external noise field / external driver bus

---

### Stage 5 — Rendering Modes

| Mode | Notes |
|---|---|
| DARKEN | Current only mode — retain |
| BRIGHTEN | |
| MULTIPLY BURN | |
| SOFT LIGHT FOCUS | |
| COLOUR TINT | Colour cast toward edges |
| DESATURATE EDGES | |
| SATURATE CENTRE | |
| CONTRAST TOWARD CENTRE | |
| BLUR TOWARD EDGE | |
| SHARPEN TOWARD CENTRE | |
| EDGE HAZE | |
| CENTRE SPOTLIGHT | |
| BANDED POSTERISED FALLOFF | |

**Rendering params:**

| Param | Notes |
|---|---|
| RENDER MODE | From list above |
| INTENSITY | (replaces AMOUNT) |
| COLOUR TINT | Colour/hue for tint modes |
| SATURATION SHIFT | |
| CONTRAST SHAPING | |
| BAND VISIBILITY | For stepped/banded modes |

---

### Stage 6 — Image Modification

| Target | Notes |
|---|---|
| LUMINANCE | |
| COLOUR BALANCE | |
| HUE / SATURATION | |
| BLUR RADIUS | Edge blur |
| SHARPEN STRENGTH | Centre sharpen |
| LOCAL CONTRAST | |
| GRAIN INTENSITY | Drive grain module (G11) |
| HALFTONE SCALE | |
| DITHERING THRESHOLD | |
| MOSAIC DENSITY | |
| PAINTERLY STROKE DENSITY | |

---

### Stage 7 — Compositing

| Param | Notes |
|---|---|
| OPACITY | Standard |
| BLEND MODE | Standard |
| LUMA-ONLY COMPOSITE | |
| CHROMA-ONLY COMPOSITE | |
| COMPOSITE DOMAIN | PRE-PROCESS / POST / DUAL-STAGE |
| GAMMA-AWARE COMPOSITE | |
| MASKED COMPOSITE | |

---

### Stage 8 — Field Output

| Output | Notes |
|---|---|
| VIGNETTE SCALAR FIELD | |
| THRESHOLD MASK | |
| BAND ZONES | |
| GRADIENT DIRECTION / MAGNITUDE | |
| INVERSE VIGNETTE FIELD | |
| DRIVER OUTPUT | Send to downstream bus |

---

### Downstream Uses (once field output is implemented)

Optical focus shaping / edge blur / centre emphasis / grain distribution control / painterly density bias / mosaic scale bias / halftone/dither centre weighting / video focus animation

---

### Minimum Acceptable Upgrade

1. CENTRE X / Y params
2. Independent SIZE X / Y
3. SHAPE FAMILY beyond one radial form (at minimum: ELLIPSE, RECTANGLE, LINEAR)
4. FALLOFF TYPE (linear / smooth / exponential) instead of only SOFTNESS
5. FIELD OUTPUT mode
6. IMAGE MODIFICATION targets beyond darkening (blur-to-edge, saturation shift)
7. Usable as driver field for downstream modules

---

## Action Items

1. **[HIGH PRIORITY]** Add CENTRE X / Y and SIZE X / Y params. Add canvas click-to-pick for centre (G6).
2. **[HIGH PRIORITY]** Add SHAPE FAMILY dropdown: ELLIPSE, CIRCLE, RECTANGLE, ROUNDED RECTANGLE, LINEAR, FOUR-CORNER, DIAMOND.
3. **[HIGH PRIORITY]** Add FALLOFF TYPE: LINEAR / SMOOTH / EXPONENTIAL / LOGISTIC / STEPPED.
4. **[HIGH PRIORITY]** Add FIELD OUTPUT mode — expose scalar vignette field and threshold mask for downstream modules.
5. **[HIGH PRIORITY]** Add RENDER MODE beyond DARKEN: BRIGHTEN, COLOUR TINT, DESATURATE EDGES, BLUR TOWARD EDGE, SHARPEN TOWARD CENTRE.
6. Add IMAGE MODIFICATION stage: BLUR RADIUS, GRAIN INTENSITY, SATURATION SHIFT.
7. Add image-reactive protection: PROTECT HIGHLIGHTS, PROTECT SHADOWS, LUMINANCE INFLUENCE.
8. Add DRIVER OUTPUT to downstream bus.
9. Add ASYMMETRY X / Y, ROTATION, INNER / OUTER RADIUS params.
10. Hide mode-conditional params (G14).
11. Add canvas click-to-pick for centre position (G6).
12. Fix +D driver button (G1).
13. Audit all params for `driveable: true` (G2).
14. Slider direct input and double-click-to-default (G5).
15. Add unit labels to all numeric params (G16).
