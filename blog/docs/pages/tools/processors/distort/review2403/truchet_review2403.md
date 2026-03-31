# TRUCHET — Review 2403

- type: `truchet`
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
| 1.1 | What does this module do? | Generates Truchet tile patterns — currently a static overlay with fixed tile size and stroke width | — |
| 1.2 | Visually distinct from all other PATTERN modules? | YES | — |
| 1.3 | Verdict | KEEP — full architectural upgrade required | — |

## Issues

```
[ERROR] [PARITY] Module is a static overlay — not a field-driven pattern system
Location: nodes/truchet — full implementation
Evidence: Current implementation limited to fixed tile size, fixed stroke width, and simple compositing. No driver architecture, no image-responsive behaviour, no field derivation, no image modification stage.
Impact: Module is far below its potential and the user's specified architecture.
```

## Required Upgrade Specification

### Core Architectural Principle

The module must be rebuilt as a **reciprocal system** with two distinct directions of influence:
- **image → tiling**: image fields drive pattern parameters
- **tiling → image**: tile-derived fields modify the image

Every major parameter must support two states: **fixed** (direct user value) or **driven** (mapped from a source field).

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

Defines the Truchet system independently of the source image.

| Param | Notes |
|---|---|
| TILE SIZE | Size of each tile cell |
| STROKE WIDTH | Thickness of tile motif lines |
| TILE MOTIF | Motif family: quarter arc / double arc / cross / blob connection / multi-line / filled tile |
| ORIENTATION MODE | fixed / random / checker / driven |
| SEED | Deterministic randomisation |
| GRID OFFSET X | Horizontal lattice offset |
| GRID OFFSET Y | Vertical lattice offset |
| ROTATION | Global pattern rotation |

---

### Layer 2 — Driver System

Generic, reusable driver architecture attachable to all major parameters. Each driver has the same structure:

| Field | Options |
|---|---|
| DRIVER ENABLED | on/off |
| DRIVER SOURCE | image / position / radial distance / angle / noise / flow field / gradient field / edge map / distance map / tile field |
| DRIVER METRIC | luminance / hue / saturation / R / G / B / alpha / gradient magnitude / gradient angle / local contrast / distance to edge / x position / y position / radial distance / tile orientation / tile ID / distance to stroke / distance to tile boundary / curve tangent / curve normal |
| INPUT MIN / MAX | Source remap bounds |
| OUTPUT MIN / MAX | Target parameter range |
| CURVE | linear / smoothstep / ease in / ease out / exponential / threshold / stepped |
| BLEND AMOUNT | Driver influence strength |
| INVERT | Invert mapping |

**Driver-capable parameters:** TILE SIZE, STROKE WIDTH, ORIENTATION, MOTIF SELECTION, PATTERN COLOUR, PATTERN OPACITY, DISPLACEMENT STRENGTH, DISPLACEMENT RADIUS, COLOUR SHIFT STRENGTH, BLUR STRENGTH

---

### Layer 3 — Field Derivation

**Image-derived fields:**
LUMINANCE, HUE, SATURATION, RGB CHANNELS, GRADIENT MAGNITUDE, GRADIENT ANGLE, LOCAL CONTRAST / LOCAL VARIANCE, EDGE MAP, **DISTANCE TO EDGE** (first-class field), POSITION X, POSITION Y, RADIAL DISTANCE FROM CENTRE

**Pattern-derived fields:**
TILE ID, ORIENTATION STATE, MOTIF STATE, **STROKE MASK**, REGION MASK, **DISTANCE TO STROKE** (first-class field), DISTANCE TO TILE BOUNDARY, NEAREST CURVE TANGENT, NEAREST CURVE NORMAL

---

### Layer 4 — Rendering

| Param | Notes |
|---|---|
| PATTERN COLOUR | Rendered colour of Truchet motif |
| PATTERN OPACITY | Rendered pattern opacity |
| PATTERN BLEND MODE | Compositing mode over image |
| BACKGROUND FILL | Optional background for standalone rendering |
| ANTI-ALIAS | Toggle |

---

### Layer 5 — Image Modification

| Param | Notes |
|---|---|
| MODIFICATION MODE | NONE / STROKE MASK / REGION MASK / ORIENTATION PARTITION / DISTANCE FIELD / DISPLACEMENT |
| INSIDE EFFECT STRENGTH | Effect strength inside stroke/region |
| OUTSIDE EFFECT STRENGTH | Effect strength outside stroke/region |
| MASK FEATHER | Boundary softness |
| DISPLACEMENT STRENGTH | Image displacement amount |
| DISPLACEMENT RADIUS | Distance over which displacement acts |
| COLOUR SHIFT STRENGTH | Colour modification strength |
| BLUR STRENGTH | Local blur amount |
| SHARPEN STRENGTH | Local sharpening amount |
| ORIENTATION A TREATMENT | Treatment for tile state A |
| ORIENTATION B TREATMENT | Treatment for tile state B |

---

### Image → Tiling Priority Behaviours

1. **Luminance-driven orientation** — sample image luminance per tile to choose orientation state. Params: ORIENTATION DRIVER SOURCE, ORIENTATION METRIC, ORIENTATION THRESHOLD, ORIENTATION SOFTNESS, ORIENTATION INVERT.
2. **Image-biased local randomness** — global seed fixed; image data perturbs local orientation/motif decision.
3. **Distance-to-edge-driven attributes** — stroke width, motif complexity, opacity, displacement strength.
4. **Gradient-angle-driven directionality** — motif rotation, local variant, directional distortion.

### Tiling → Image Priority Behaviours

1. **Stroke-mask-based treatment** — tile strokes as mask for darken/sharpen/desaturate/tint.
2. **Distance-to-stroke field treatment** — continuous scalar field from each pixel to nearest stroke drives colour ramp, opacity, blur radius, brightness/contrast.
3. **Normal-based displacement** — `x' = x + normal.x * f(distToStroke)`, `y' = y + normal.y * f(distToStroke)`.
4. **Tangent-based displacement** — displace image along tile curves.
5. **Orientation-partitioned treatment** — A tiles and B tiles apply separate image effects.

---

### Recommended Processing Order

1. Generate tile lattice
2. Resolve fixed and driven pattern parameters
3. Generate tile orientations and motifs
4. Derive pattern-side fields
5. Derive image-side fields
6. Render tile field / rasterise to masks and distance maps
7. Apply image modification stage
8. Composite with opacity and blend mode

---

### Implementation Phases

| Phase | Scope |
|---|---|
| 1 | Clean Truchet field generation with fixed parameters |
| 2 | Generic driver architecture — attach first to orientation |
| 3 | Image-derived fields — luminance and distance to edge |
| 4 | Pattern-derived fields — stroke mask and distance to stroke |
| 5 | Overlay rendering and stroke-mask-based image treatment |
| 6 | Normal-based displacement driven by distance to stroke |
| 7 | Driver support for tile size, stroke width, colour, displacement |

**Minimum first advanced version:** fixed lattice + luminance-driven orientation + global seed with image-biased local randomness + stroke-mask overlay + distance-to-stroke field + distance-to-stroke image tint or displacement.

```
[ERROR] [BUG] Driver slot button non-functional — see _global_issues.md G1
```

## Action Items

1. **[HIGH PRIORITY — Phase 1]** Rebuild pattern generation layer with full param set: TILE SIZE, STROKE WIDTH, TILE MOTIF, ORIENTATION MODE, SEED, GRID OFFSET X/Y, ROTATION.
2. **[HIGH PRIORITY — Phase 2]** Implement generic driver architecture per spec above.
3. **[Phase 3]** Implement image-derived fields (luminance, gradient, distance to edge).
4. **[Phase 4]** Implement pattern-derived fields (stroke mask, distance to stroke, curve normals/tangents).
5. **[Phase 5]** Implement image modification layer with MODIFICATION MODE and associated params.
6. **[Phase 6]** Implement normal-based displacement.
7. **[Phase 7]** Expand driver support across all driver-capable params.
8. Fix +D driver button (global — tracked in `_global_issues.md` G1).
9. Audit all params for `driveable: true` — add where absent (global — tracked in `_global_issues.md` G2).
10. Slider direct input and double-click-to-default (global — tracked in `_global_issues.md` G5).
11. Use shared components for overlapping features (global — tracked in `_global_issues.md` G11).
