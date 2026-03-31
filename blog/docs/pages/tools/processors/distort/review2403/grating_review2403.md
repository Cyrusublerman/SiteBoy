# GRATING — Review 2403

- type: `grating`
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
| 1.1 | What does this module do? | Generates grating patterns across four modes: linear (stripes), angular (spokes), radial (rings), spiral — currently a static overlay | — |
| 1.2 | Visually distinct from all other PATTERN modules? | YES | — |
| 1.3 | Verdict | KEEP — full architectural upgrade required | — |

## Issues

```
[ERROR] [PARITY] Module is a static overlay — not a field-driven pattern system
Location: nodes/grating — full implementation
Evidence: Current implementation exposes only base pattern modes with fixed params and simple compositing. No driver architecture, no image-responsive behaviour, no field derivation, no image modification stage.
Impact: Module is far below its potential and the user's specified architecture.
```

```
[WARN] [STANDARDS] Mode-conditional params must be hidden when mode is not active (global — see _global_issues.md G14)
Location: nodes/grating — mode-specific params (e.g. SPIRAL RATE, CENTRE X/Y, ANGLE)
```

## Required Upgrade Specification

### Core Architectural Principle

Reciprocal system — two distinct directions:
- **image → grating**: image fields drive pattern parameters
- **grating → image**: pattern-derived fields modify the image

Every major parameter: **fixed** (direct value) or **driven** (mapped from source field).

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

| Param | Notes |
|---|---|
| TYPE | LINEAR / ANGULAR / RADIAL / SPIRAL |
| WAVELENGTH | Spacing period |
| PHASE | Phase offset |
| ANGLE | Orientation (linear) / reference rotation (other modes) |
| CENTRE X | Pattern centre for angular, radial, spiral modes |
| CENTRE Y | Pattern centre for angular, radial, spiral modes |
| SPIRAL RATE | Radial progression per turn (spiral mode only) |
| CONTRAST | Light/dark band difference |
| DUTY CYCLE | Proportion of light to dark band widths |
| SOFTNESS | Hard/soft band transitions |

All mode-specific params (CENTRE X/Y, SPIRAL RATE, ANGLE) hidden unless relevant mode active (G14).

---

### Layer 2 — Driver System

Generic, reusable — identical architecture to Truchet driver system (see G11):

| Field | Options |
|---|---|
| DRIVER ENABLED | on/off |
| DRIVER SOURCE | image / position / radial distance / angle / noise / flow field / gradient field / edge map / distance map / pattern field |
| DRIVER METRIC | luminance / hue / saturation / R/G/B / alpha / gradient magnitude / gradient angle / local contrast / distance to edge / x/y position / radial distance / pattern value / distance to band / band index / band tangent / band normal |
| INPUT MIN / MAX | Source remap bounds |
| OUTPUT MIN / MAX | Target param range |
| CURVE | linear / smoothstep / ease in / ease out / exponential / threshold / stepped / sinusoidal remap |
| BLEND AMOUNT | Driver influence strength |
| INVERT | Invert mapping |

**Driver-capable params:** WAVELENGTH, PHASE, ANGLE, CENTRE X, CENTRE Y, SPIRAL RATE, CONTRAST, DUTY CYCLE, SOFTNESS, PATTERN COLOUR, PATTERN OPACITY, DISPLACEMENT STRENGTH

---

### Layer 3 — Field Derivation

**Image-derived fields:** LUMINANCE, HUE, SATURATION, RGB CHANNELS, GRADIENT MAGNITUDE, GRADIENT ANGLE, LOCAL CONTRAST, EDGE MAP, **DISTANCE TO EDGE** (first-class), POSITION X, POSITION Y, RADIAL DISTANCE FROM CENTRE

**Pattern-derived fields:**

| Field | Notes |
|---|---|
| PATTERN VALUE | Continuous scalar before thresholding |
| BAND MASK | Binary/soft light vs dark bands |
| DISTANCE TO BAND CENTRE | Distance to nearest band centre |
| **DISTANCE TO BAND EDGE** | Distance to nearest band boundary — first-class field |
| BAND INDEX | Integer/quantised band identifier |
| BAND TANGENT | Local direction along band |
| BAND NORMAL | Local direction perpendicular to band |

**Per-mode field construction:**
- LINEAR: parallel stripes; normal ⊥ stripe direction; tangent along stripe
- ANGULAR: sector spokes; normal changes with angle; tangent locally circular
- RADIAL: concentric rings; normal points outward; tangent circular
- SPIRAL: spiral paths; normal and tangent vary with both radius and angle — most complex

---

### Layer 4 — Rendering

| Param | Notes |
|---|---|
| PATTERN COLOUR | Rendered grating colour |
| PATTERN OPACITY | |
| PATTERN BLEND MODE | |
| INVERT PATTERN | Swap light/dark band roles |
| BACKGROUND FILL | Optional standalone background |
| ANTI-ALIAS | Toggle |

Supports diagnostic preview modes for derived pattern fields.

---

### Layer 5 — Image Modification

| Param | Notes |
|---|---|
| MODIFICATION MODE | NONE / BAND MASK / DISTANCE FIELD / NORMAL DISPLACEMENT / TANGENT DISPLACEMENT / BAND PARTITION |
| INSIDE EFFECT STRENGTH | Strength inside one band class |
| OUTSIDE EFFECT STRENGTH | Strength outside that class |
| MASK FEATHER | Boundary softness |
| DISPLACEMENT STRENGTH | Image displacement amount |
| DISPLACEMENT RADIUS | Effective distance of displacement |
| COLOUR SHIFT STRENGTH | Colour modification strength |
| BLUR STRENGTH | Local blur amount |
| SHARPEN STRENGTH | Local sharpening amount |
| BAND A TREATMENT | Treatment for one band class |
| BAND B TREATMENT | Treatment for other band class |

---

### Image → Grating Priority Behaviours

1. **Luminance-driven phase** — bright regions advance, dark regions retard local grating phase
2. **Luminance-driven wavelength** — modulate local band spacing from image values
3. **Gradient-angle-driven orientation** — modulate angle (linear) or rotational bias (other modes)
4. **Edge-distance-driven contrast/opacity** — strong grating near edges, weaker in flat interiors
5. **Colour-driven duty cycle** — hue/saturation modulates light/dark proportions

### Grating → Image Priority Behaviours

1. **Band-mask treatment** — light/dark bands as partition for brightness, sharpen/blur, tint
2. **Distance-to-band-edge treatment** — colour tint, contrast, opacity gradients around band edges
3. **Normal-based displacement** — displace image along band normal (stripes ⊥, rings radially, spokes tangentially)
4. **Tangent-based displacement** — image flows along band direction
5. **Band-index partitioning** — alternate bands warm/cool, blur/sharpen, shift saturation

---

### Recommended Processing Order

1. Generate base grating field from fixed params
2. Resolve driven param values
3. Generate final grating scalar field
4. Derive band masks, distance fields, tangent/normal fields
5. Derive image-side fields
6. Render pattern and/or use derived fields for image modification
7. Composite with opacity and blend mode

---

### Implementation Phases

| Phase | Scope |
|---|---|
| 1 | Clean fixed grating for all four modes with mode-conditional param visibility |
| 2 | Reusable driver architecture — attach first to PHASE and OPACITY |
| 3 | Image-derived fields — luminance and distance to edge |
| 4 | Pattern-derived fields — band mask, distance to band edge, tangent, normal |
| 5 | Overlay rendering and band-mask-based image treatment |
| 6 | Normal-based displacement driven by distance to band edge |
| 7 | Expand driver support to WAVELENGTH, ANGLE, CENTRE, CONTRAST, SPIRAL RATE |

**Minimum first advanced version:** all four fixed modes + luminance-driven phase + distance-to-edge-driven opacity/contrast + band mask + distance-to-band-edge field + normal-based image displacement.

```
[ERROR] [BUG] Driver slot button non-functional — see _global_issues.md G1
```

## Action Items

1. **[HIGH PRIORITY — Phase 1]** Rebuild pattern generation for all four modes with full param set and mode-conditional visibility (G14).
2. **[HIGH PRIORITY — Phase 2]** Implement generic driver architecture (shared with Truchet — G11).
3. **[Phase 3]** Implement image-derived fields.
4. **[Phase 4]** Implement pattern-derived fields.
5. **[Phase 5]** Implement image modification layer.
6. **[Phase 6]** Implement normal-based displacement.
7. **[Phase 7]** Expand driver support.
8. Add PICK CENTRE canvas interaction for CENTRE X/Y (global — tracked in `_global_issues.md` G6).
9. Fix +D driver button (global — tracked in `_global_issues.md` G1).
10. Audit all params for `driveable: true` — add where absent (global — tracked in `_global_issues.md` G2).
11. Slider direct input and double-click-to-default (global — tracked in `_global_issues.md` G5).
12. Use shared components for overlapping features (global — tracked in `_global_issues.md` G11).
