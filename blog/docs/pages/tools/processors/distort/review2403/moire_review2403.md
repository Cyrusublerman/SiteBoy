# MOIRÉ — Review 2403

- type: `moire`
- category: PATTERN
- isVector: false
- verdict: KEEP — major architectural upgrade required
- priority: HIGH
- date: 2026-03-24
- reviewer: user

---

## Section 1 — Triage

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 1.1 | What does this module do? | Generates moiré interference patterns from two overlapping periodic wave systems with independent wave, angle, and combine mode controls | — |
| 1.2 | Visually distinct from all other PATTERN modules? | YES — interference-based pattern is distinct from Truchet, Grating, and Halftone | — |
| 1.3 | Verdict | KEEP — full architectural upgrade required | — |

## Current Implementation

Dual-wave generation with WAVE 1/2, ANGLE 1/2, and COMBINE mode (product / sum / xor / min / max). Valid foundation — upgrade expands into a field-driven reciprocal system.

## Issues

```
[ERROR] [PARITY] Module is a static overlay — not a field-driven interference system
Location: nodes/moire — full implementation
Evidence: No driver architecture, no image-responsive behaviour, no field derivation, no image modification stage.
Impact: Module is far below its potential.
```

## Required Upgrade Specification

### Core Architectural Principle

Reciprocal system:
- **image → moiré**: image fields drive wave params (phase, spacing, angle, contrast)
- **moiré → image**: interference-derived fields modify the image

Every major parameter: **fixed** or **driven**.

### Five-Layer Target Architecture

```
Layer 1: Pattern Generation
Layer 2: Driver System
Layer 3: Field Derivation
Layer 4: Rendering
Layer 5: Image Modification
```

---

### Layer 1 — Pattern Generation

Two independent wave systems → one interference field.

| Param | Notes |
|---|---|
| TYPE 1 / TYPE 2 | linear grating / square grating / dot lattice / radial wave / angular wave |
| WAVE 1 / WAVE 2 | Spatial frequency / wavelength |
| ANGLE 1 / ANGLE 2 | Orientation |
| PHASE 1 / PHASE 2 | Phase offset |
| CONTRAST 1 / CONTRAST 2 | Band contrast |
| DUTY CYCLE 1 / DUTY CYCLE 2 | Band proportion |
| SOFTNESS 1 / SOFTNESS 2 | Band transition hardness |
| COMBINE | product / sum / xor / min / max |

---

### Layer 2 — Driver System

Generic, reusable — identical architecture to Truchet/Grating (G11):

| Field | Options |
|---|---|
| DRIVER ENABLED | on/off |
| DRIVER SOURCE | image / position / radial distance / angle / noise / flow field / gradient field / edge map / distance map / pattern field |
| DRIVER METRIC | luminance / hue / saturation / R/G/B / alpha / gradient magnitude / gradient angle / local contrast / distance to edge / x/y position / radial distance / wave value / interference value / fringe index / distance to fringe / fringe tangent / fringe normal |
| INPUT MIN / MAX | Source remap bounds |
| OUTPUT MIN / MAX | Target param range |
| CURVE | linear / smoothstep / ease in / ease out / exponential / threshold / stepped / sinusoidal remap |
| BLEND AMOUNT | Influence strength |
| INVERT | Invert mapping |

**Driver-capable params:** WAVE 1/2, ANGLE 1/2, PHASE 1/2, CONTRAST 1/2, DUTY CYCLE 1/2, SOFTNESS 1/2, PATTERN COLOUR, PATTERN OPACITY, DISPLACEMENT STRENGTH

---

### Layer 3 — Field Derivation

**Image-derived fields:** LUMINANCE, HUE, SATURATION, RGB CHANNELS, GRADIENT MAGNITUDE, GRADIENT ANGLE, LOCAL CONTRAST, EDGE MAP, **DISTANCE TO EDGE** (first-class), POSITION X/Y, RADIAL DISTANCE FROM CENTRE

**Pattern-derived fields:**

| Field | Notes |
|---|---|
| WAVE FIELD 1 | Continuous scalar of first periodic structure |
| WAVE FIELD 2 | Continuous scalar of second periodic structure |
| INTERFERENCE FIELD | Combined field after COMBINE mode |
| FRINGE MASK | Binary/soft bright vs dark interference bands |
| DISTANCE TO FRINGE CENTRE | Distance to nearest fringe max/min |
| **DISTANCE TO FRINGE EDGE** | Distance to nearest fringe boundary — first-class field |
| FRINGE INDEX | Integer/quantised band identifier |
| FRINGE TANGENT | Local direction along fringe |
| FRINGE NORMAL | Local direction perpendicular to fringe |
| WAVE DIFFERENCE FIELD | Local phase/frequency difference between the two systems |

Three distinct layers must remain architecturally separate: wave field 1, wave field 2, interference field — different behaviours may be driven by different layers.

---

### Layer 4 — Rendering

| Param | Notes |
|---|---|
| PATTERN COLOUR | |
| PATTERN OPACITY | |
| PATTERN BLEND MODE | |
| INVERT PATTERN | |
| BACKGROUND FILL | Optional standalone background |
| THRESHOLD | Optional hard-band thresholding of interference field |
| ANTI-ALIAS | |

Diagnostic preview modes for: wave field 1, wave field 2, interference field, fringe mask, distance to fringe, fringe tangent/normal.

---

### Layer 5 — Image Modification

| Param | Notes |
|---|---|
| MODIFICATION MODE | NONE / FRINGE MASK / DISTANCE FIELD / NORMAL DISPLACEMENT / TANGENT DISPLACEMENT / FRINGE PARTITION |
| INSIDE EFFECT STRENGTH | |
| OUTSIDE EFFECT STRENGTH | |
| MASK FEATHER | |
| DISPLACEMENT STRENGTH | |
| DISPLACEMENT RADIUS | |
| COLOUR SHIFT STRENGTH | |
| BLUR STRENGTH | |
| SHARPEN STRENGTH | |
| FRINGE A TREATMENT | |
| FRINGE B TREATMENT | |

---

### Image → Moiré Priority Behaviours

1. **Luminance-driven phase modulation** — bright regions advance, dark regions retard phase of one or both wave systems
2. **Luminance-driven wave spacing** — modulate local wavelength/frequency
3. **Gradient-angle-driven wave angle** — small angle changes produce large interference changes
4. **Edge-distance-driven contrast/opacity** — strong moiré near edges, weaker in flat interiors
5. **Colour-driven combine/duty** — hue/saturation modulates band balance or thresholded rendering

### Moiré → Image Priority Behaviours

1. **Fringe-mask treatment** — bright/dark fringes as partition for brightness, sharpen/blur, tint
2. **Distance-to-fringe-edge treatment** — colour tint, contrast, opacity gradients around fringe edges
3. **Normal-based displacement** — displace image along fringe normal (preferred first distortion mode)
4. **Tangent-based displacement** — image flows along fringe direction
5. **Fringe-index partitioning** — alternate fringes warm/cool, blur/sharpen, shift saturation

---

### Recommended Processing Order

1. Generate base wave field 1 from fixed params
2. Generate base wave field 2 from fixed params
3. Resolve driven param values
4. Generate interference field via COMBINE mode
5. Derive fringe masks, distance fields, tangent/normal fields
6. Derive image-side fields
7. Render pattern / apply image modification
8. Composite with opacity and blend mode

---

### Implementation Phases

| Phase | Scope |
|---|---|
| 1 | Clean fixed dual-wave generation with all COMBINE modes |
| 2 | Reusable driver architecture — first attach to PHASE and ANGLE |
| 3 | Image-derived fields — luminance and distance to edge |
| 4 | Pattern-derived fields — interference field, fringe mask, distance to fringe edge, tangent/normal |
| 5 | Overlay rendering and fringe-mask-based image treatment |
| 6 | Normal-based displacement driven by distance to fringe edge |
| 7 | Expand driver support to wave spacing, contrast, duty cycle, softness, rendering params |

**Minimum first advanced version:** dual-wave fixed generation + luminance-driven phase modulation + distance-to-edge-driven opacity/contrast + interference field + distance-to-fringe-edge field + normal-based image displacement.

```
[ERROR] [BUG] Driver slot button non-functional — see _global_issues.md G1
```

## Action Items

1. **[HIGH PRIORITY — Phase 1]** Rebuild pattern generation for both wave systems with full param set.
2. **[HIGH PRIORITY — Phase 2]** Implement generic driver architecture (shared — G11).
3. **[Phase 3]** Implement image-derived fields.
4. **[Phase 4]** Implement pattern-derived fields — interference field, fringe mask, distance to fringe edge, tangent/normal.
5. **[Phase 5]** Implement image modification layer.
6. **[Phase 6]** Implement normal-based displacement.
7. **[Phase 7]** Expand driver support.
8. Implement mode-conditional param visibility for TYPE-specific params (global — G14).
9. Fix +D driver button (global — tracked in `_global_issues.md` G1).
10. Audit all params for `driveable: true` — add where absent (global — tracked in `_global_issues.md` G2).
11. Slider direct input and double-click-to-default (global — tracked in `_global_issues.md` G5).
12. Add unit labels to all numeric params (global — tracked in `_global_issues.md` G16).
13. Use shared components for overlapping features (global — tracked in `_global_issues.md` G11).
