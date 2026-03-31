# SCANLINES — Review 2403

- type: `scanlines`
- category: TEXTURE
- isVector: false
- verdict: KEEP — rebuild as periodic raster / line field system
- priority: HIGH
- date: 2026-03-24
- reviewer: user

---

## Section 1 — Triage

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 1.1 | What does this module do? | Overlays uniform horizontal stripes over the image with spacing, thickness, and opacity controls — basic CRT-style stripe mask | — |
| 1.2 | Visually distinct from all other modules? | YES — periodic raster line structure is distinct | — |
| 1.3 | Verdict | KEEP — rebuild as periodic raster / line field system | — |

## Naming Issue

```
[WARN] [STANDARDS] Two params both labelled OPACITY — naming collision
Location: NodePanel — top-level opacity vs line opacity
Evidence: Standard NodePanel OPACITY and a second line-specific OPACITY control share the same label.
Required: Rename top-level to COMPOSITE OPACITY; line-specific to LINE OPACITY.
```

## Current Implementation

Controls: OPACITY (composite), BLEND MODE, SPACING, THICKNESS, LINE OPACITY, MASK. Uniform horizontal stripes at fixed spacing/width. One direction, one profile (hard/square), no field output, no image-reactive behaviour.

## Issues

```
[ERROR] [PARITY] Line system is too primitive — fixed horizontal stripes only
Location: nodes/scanlines — pattern generation
Evidence: No orientation, phase, profile type, duty cycle, curvature, grouping, or interlace logic.
Impact: Cannot produce vertical, rotated, warped, grouped, or interlaced raster patterns.
```

```
[ERROR] [PARITY] Module is a visible overlay only — no field output, no image modification
Location: nodes/scanlines — output
Evidence: No scalar line field, band index, distance-to-line field, or tangent/normal output. Cannot drive dithering thresholds, halftone deformation, moiré, or painterly density.
Impact: Module cannot participate in the broader pipeline.
```

```
[WARN] [PARITY] No image-reactive behaviour — line pattern is globally uniform
Location: nodes/scanlines — image response
Evidence: No luminance influence, contrast response, edge influence, distance-to-edge response, or mask-based gating.
Impact: Lines do not thicken in shadows, fade in highlights, or respond to image structure.
```

```
[WARN] [PARITY] No channel processing system — single monochrome stripe
Location: nodes/scanlines — channel logic
Evidence: No RGB offset, phosphor triad mode, luma/chroma split, or channel-separated line families.
Impact: Cannot simulate CRT triad, subpixel raster, or chroma-separated degradation.
```

```
[WARN] [PARITY] No temporal behaviour — static only
Location: nodes/scanlines — temporal
Evidence: No drift, interlace alternation, phase scroll, or jitter.
Impact: Cannot produce animated scan drift or interlace for video.
```

## Required Rebuild Specification

### Three Operating Roles

| Role | Notes |
|---|---|
| VISIBLE RASTER | CRT/video/display-style scanline overlay |
| IMAGE MODIFIER | Modify image properties through periodic line structure before composite |
| FIELD OUTPUT | Reusable periodic field for downstream modules |
| HYBRID | All three simultaneously |

### Eight-Stage Target Architecture

```
Stage 1: Line Field Generation
Stage 2: Field Derivation
Stage 3: Image-Derived Field Derivation
Stage 4: Driver Mapping
Stage 5: Rendering
Stage 6: Image Modification
Stage 7: Compositing
Stage 8: Field Output
```

---

### Stage 1 — Line Field Generation

**Pattern families:**
HORIZONTAL / VERTICAL / ROTATED / SINUSOIDALLY WARPED / FIELD-WARPED / ALTERNATING THICK-THIN / GROUPED SCAN BANDS / INTERLACED EVEN-ODD / CURVED RASTER / RGB TRIAD / CUSTOM MASK

**Per-pattern controls:**

| Param | Notes |
|---|---|
| ORIENTATION | Angle of lines |
| SPACING | Distance between lines |
| THICKNESS | Line width |
| PHASE | Offset in line cycle |
| DUTY CYCLE | Proportion of line to gap |
| SHARPNESS / SOFTNESS | Edge profile transition |
| CURVATURE | Line curvature |
| WARP AMOUNT | Field-driven distortion |
| GROUPING COUNT | Lines per group for grouped-band modes |

**Line profile types:**
HARD SQUARE / SOFT SQUARE / SINE / TRIANGLE / GAUSSIAN BAND / STEPPED BAND / CUSTOM CURVE

---

### Stage 2 — Field Derivation

| Output | Notes |
|---|---|
| SCALAR LINE FIELD | Raw 0–1 periodic field |
| BINARY LINE MASK | On/off stripe mask |
| BAND INDEX | Integer identifier per band |
| EVEN / ODD PARTITION | Alternating band mask |
| DISTANCE-TO-LINE FIELD | Smooth proximity field |
| NORMAL FIELD | Direction perpendicular to lines |
| TANGENT FIELD | Direction along lines |
| LINE PHASE FIELD | Phase position within cycle |
| GROUPED-BAND FIELD | Band-group identifier |
| DRIVER OUTPUT | Send to downstream bus |

---

### Stage 3 — Image-Derived Field Derivation

| Field | Notes |
|---|---|
| LUMINANCE / TONAL ZONES | |
| RED / GREEN / BLUE | |
| HUE / SATURATION | |
| LOCAL CONTRAST | |
| GRADIENT MAGNITUDE / ANGLE | |
| EDGE MAP | |
| **DISTANCE TO EDGE** | First-class field |
| POSITION X / Y | |
| RADIAL DISTANCE | |
| MASK | |

---

### Stage 4 — Driver Mapping

Every major param: FIXED / IMAGE-DRIVEN / FIELD-DRIVEN / HYBRID.

**Driver-mappable params:** LINE OPACITY / LINE THICKNESS / SPACING / ORIENTATION / PHASE / SOFTNESS / WARP STRENGTH / CHANNEL SPLIT / BLOOM AMOUNT / LUMINANCE GATING / BLUR AMOUNT / CONTRAST SHAPING / LINE INSTABILITY / INTERLACE STRENGTH

---

### Stage 5 — Rendering Modes

| Mode | Notes |
|---|---|
| DARK SCANLINES | Current only mode — retain |
| BRIGHT SCANLINES | |
| CONTRAST SCANLINES | |
| ADDITIVE RASTER GLOW | |
| PHOSPHOR BANDS | CRT phosphor simulation |
| RGB TRIAD BANDS | Subpixel triad simulation |
| LUMA-ONLY BANDS | |
| CHROMA-ONLY BANDS | |
| SOFT VIDEO LINE HAZE | |
| HARD PIXEL-RASTER BANDS | |
| THRESHOLDED RETRO BANDS | |
| GROUPED BROADCAST BANDS | |

**Rendering params:**

| Param | Notes |
|---|---|
| RENDER MODE | From list above |
| LINE OPACITY | (rename from current OPACITY) |
| BAND BRIGHTNESS | |
| DARKENING AMOUNT | |
| BRIGHTENING AMOUNT | |
| CONTRAST SHAPING | |
| GLOW / BLOOM AMOUNT | |
| LINE EDGE HARDNESS | |

---

### Stage 6 — Image Modification

| Target | Notes |
|---|---|
| LUMINANCE ATTENUATION | Per-line luminance gating |
| CONTRAST MODULATION | |
| SATURATION MODULATION | |
| HUE JITTER | Per-line hue shift |
| BLUR ON ALTERNATE LINES | |
| SHARPEN ON SELECTED BANDS | |
| CHROMA OFFSET BY LINE | |
| THRESHOLD MODULATION | Carrier for dithering |
| DITHER THRESHOLD CARRIER | Drive dither module |
| DISPLACEMENT SCAFFOLD | Drive spatial displacement |
| GRAIN MODULATION BY BAND | Drive grain module |

---

### Stage 7 — Compositing

| Param | Notes |
|---|---|
| COMPOSITE OPACITY | (rename from OPACITY) |
| BLEND MODE | |
| LUMA-ONLY COMPOSITE | |
| CHROMA-ONLY COMPOSITE | |
| COMPOSITE DOMAIN | PRE / POST / DUAL-STAGE |
| GAMMA-AWARE COMPOSITE | |
| MASKED COMPOSITE | |

---

### Stage 8 — Field Output

SCALAR LINE FIELD / BINARY LINE MASK / BAND INDEX / EVEN-ODD MASK / DISTANCE-TO-LINE / TANGENT / NORMAL / PERIODIC DRIVER OUTPUT

---

### Channel Mode System

| Mode | Notes |
|---|---|
| MONO | Single shared line field |
| RGB LINKED | Same field for all channels |
| RGB OFFSET | Per-channel phase offset |
| RGB SEPARATE THICKNESS | Per-channel width |
| LUMA / CHROMA SPLIT | |
| PHOSPHOR MODE | R/G/B band families |
| SUBPIXEL TRIAD | |

### Warp / Instability Group

| Param | Notes |
|---|---|
| WARP SOURCE | Field or noise driving line curvature |
| WARP STRENGTH | |
| CURVATURE | |
| JITTER AMOUNT / FREQUENCY | |
| DRIFT SPEED | |
| SYNC INSTABILITY | |
| ANALOGUE WOBBLE | |
| LINE DRIFT | |
| FIELD OFFSET | |

### Temporal Group

| Param | Notes |
|---|---|
| TEMPORAL MODE | LOCKED / DRIFT / PHASE SCROLL / INTERLACE ALTERNATE / JITTER / BAKED |
| TEMPORAL SPEED | |
| TEMPORAL PHASE OFFSET | |
| COHERENCE | |
| FRAME | Animation driver (G9) |
| DETERMINISTIC EXPORT | |

---

### Minimum Acceptable Upgrade

1. ORIENTATION param
2. PHASE OFFSET param
3. LINE PROFILE TYPE (hard square / sine / Gaussian)
4. FIELD OUTPUT mode
5. IMAGE MODIFICATION mode
6. LUMINANCE-RESPONSIVE line thickness or opacity
7. CHANNEL MODE beyond mono overlay (at minimum: RGB OFFSET)

---

## Action Items

1. **[HIGH PRIORITY]** Add ORIENTATION and PHASE OFFSET params.
2. **[HIGH PRIORITY]** Add LINE PROFILE TYPE: HARD SQUARE / SOFT SQUARE / SINE / TRIANGLE / GAUSSIAN.
3. **[HIGH PRIORITY]** Add FIELD OUTPUT mode — expose scalar line field, binary mask, band index, distance-to-line.
4. **[HIGH PRIORITY]** Add IMAGE MODIFICATION stage — LUMINANCE ATTENUATION, CHROMA OFFSET BY LINE, BLUR ON ALTERNATE LINES.
5. **[HIGH PRIORITY]** Add CHANNEL MODE system: MONO / RGB OFFSET / RGB SEPARATE THICKNESS / PHOSPHOR / TRIAD.
6. **[HIGH PRIORITY]** Fix naming collision — rename to COMPOSITE OPACITY and LINE OPACITY.
7. Add RENDER MODE beyond DARK SCANLINES: BRIGHT, CONTRAST, PHOSPHOR BANDS, RGB TRIAD.
8. Add image-reactive driver mapping: LUMINANCE INFLUENCE, EDGE INFLUENCE, DISTANCE-TO-EDGE.
9. Add TEMPORAL MODE with DRIFT / PHASE SCROLL / INTERLACE ALTERNATE.
10. Add DRIVER OUTPUT to downstream bus.
11. Hide mode-conditional params (G14).
12. Fix +D driver button (G1).
13. Audit all params for `driveable: true` (G2).
14. Slider direct input and double-click-to-default (G5).
15. Add unit labels to all numeric params (G16).
