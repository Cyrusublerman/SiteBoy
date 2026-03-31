# PAINT STROKE — Review 2403

- type: `paintstroke`
- category: GENERATIVE
- isVector: false
- verdict: KEEP — complete rebuild required as painterly reconstruction engine
- priority: HIGH
- date: 2026-03-24
- reviewer: user
- reference: `reference/generators/paint-image (2)` (original source export)

---

## Section 1 — Triage

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 1.1 | What does this module do? | Currently: stochastic colour-dot depositor — picks random pixels, samples source colour, matches to nearest palette colour, stamps a soft radial gradient circle at random size and opacity until a layer limit is reached | — |
| 1.2 | Visually distinct from all other modules? | YES — painterly reconstruction is unique | — |
| 1.3 | Verdict | KEEP — complete rebuild required | ERROR |

## Current Implementation vs Source

**Current module:** random sample → nearest palette match → radial gradient dot → repeat until layer limit. Output: foggy particulate buildup, not painted reconstruction.

**Original source (reference/generators/paint-image (2)):** generative reconstruction process with explicit source image input, weight-map input, palette input, speed, layer limit, reset, pause, save. Progressive iterative build-up. Partial blend-distance palette matching. Probabilistic weight-map rejection gate.

**Collapse diagnosis:** The current module reduces the original tool to its weakest interpretation — random blurred circles. It loses stroke direction, pathfinding, edge following, orientation, multi-pass refinement, error tracking, and the full source GUI model.

## Issues

```
[ERROR] [PARITY] Module is not a painter — it is a stochastic dot depositor
Location: nodes/paintstroke — full implementation
Evidence: No stroke direction, no pathfinding, no edge following, no local orientation, no brush texture, no bristle logic, no progressive coarse-to-fine reconstruction. Only radial gradient circles placed randomly.
Impact: Output looks like foggy particulate buildup, not painted image structure.
```

```
[ERROR] [PARITY] No placement strategy — purely random dot placement
Location: nodes/paintstroke — placement logic
Evidence: Placement ignores error map, gradient magnitude, saliency, and contrast structure. Weight map only used as a probabilistic reject gate, not a priority field.
Impact: Cannot concentrate detail strokes where image structure requires them.
```

```
[ERROR] [PARITY] No directional strokes — no stroke angle, length, or edge/gradient alignment
Location: nodes/paintstroke — brush model
Evidence: Only soft radial gradient dot brush. No orientation, no length, no taper, no bristle structure.
Impact: Output cannot feel painted — marks have no structural relationship to image content.
```

```
[ERROR] [PARITY] No multi-pass coarse-to-fine reconstruction
Location: nodes/paintstroke — reconstruction logic
Evidence: All strokes are same-scale random placement. No large-to-small pass schedule.
Impact: Image structure does not emerge hierarchically — the most important feature of a painterly reconstruction.
```

```
[ERROR] [PARITY] No error-driven refinement — no reconstruction error tracking
Location: nodes/paintstroke — coverage/error tracking
Evidence: Only a crude layer tracker and average-layer stopping rule. Does not track per-pixel reconstruction error.
Impact: Module cannot direct strokes to where detail is most needed.
```

## Required Rebuild Specification

### Conceptual Model

```
FROM: random sample → palette match → dot → repeat
TO:   source analysis → stroke planning → stroke rendering → coverage/error tracking → multi-pass refinement
```

### Five-Stage Target Architecture

```
Stage 1: Source Analysis
Stage 2: Stroke Planning
Stage 3: Stroke Rendering
Stage 4: Coverage / Error Tracking
Stage 5: Refinement Passes
```

---

### Stage 1 — Source Analysis

Derived fields from the image:

| Field | Use |
|---|---|
| LUMINANCE | Broad tonal guidance |
| COLOUR | Palette matching and regional colour |
| GRADIENT MAGNITUDE | Detail density and stroke size |
| GRADIENT ANGLE | Stroke direction |
| EDGE MAP | Edge-driven placement and fine strokes |
| LOCAL CONTRAST | Pass assignment |
| SALIENCY / ERROR MAP | Reconstruction priority |
| WEIGHT MAP | Stroke probability gate (retain from source; expand to full priority field) |

---

### Stage 2 — Stroke Planning

| Decision | Notes |
|---|---|
| WHERE to paint | Error-driven, gradient-driven, edge-driven, saliency-driven, or random |
| WHAT COLOUR | Source sample / reduced palette / custom palette / nearest palette |
| WHAT BRUSH | Dot / ellipse / stroke / bristle / ribbon / dry brush / textured stamp |
| WHAT SIZE | Larger in flat regions, smaller in detailed regions |
| WHAT OPACITY | Lower in early passes, more selective in late passes |
| WHAT DIRECTION | None / gradient angle / edge tangent / flow field / manual angle |
| HOW LONG | Stroke length based on local structure |

---

### Stage 3 — Stroke Rendering

| Brush Shape | Notes |
|---|---|
| SOFT DAB | Current implementation — retain as Dot Paint mode |
| HARD DAB | Flat-colour circle |
| ELLIPSE | Oriented by stroke direction |
| BRISTLE STROKE | Multi-filament directional |
| RIBBON STROKE | Smooth tapered path |
| DRY BRUSH | Sparse filament scatter |
| TEXTURED STAMP | Image-mapped brush texture |

---

### Stage 4 — Coverage / Error Tracking

| Tracker | Notes |
|---|---|
| LAYER ACCUMULATION | Retain from source |
| PER-PIXEL RECONSTRUCTION ERROR | Distance between canvas and source at each pixel |
| COVERAGE MAP | How much paint has accumulated per region |
| ERROR THRESHOLD | Stop when error falls below target |
| COVERAGE TARGET | Stop when coverage fraction is met |

---

### Stage 5 — Refinement Passes (most important structural addition)

| Pass | Stroke Size | Detail Level |
|---|---|---|
| Pass 1 | LARGE | Broad tonal blocks |
| Pass 2 | MEDIUM | Structure and edges |
| Pass 3 | SMALL | Local detail |
| Pass 4 (optional) | FINE | Accent/highlight strokes |

---

### Full Param Set

**PAINTER MODE:** DOT / STROKE / FLOW STROKE / PATCH / PALETTE RECONSTRUCTION

**Brush:**

| Param | Notes |
|---|---|
| MIN SIZE / MAX SIZE | |
| MIN OPACITY / MAX OPACITY | |
| BRUSH SHAPE | |
| BRUSH HARDNESS | |
| BRUSH TEXTURE | |
| BRUSH LENGTH | |
| BRUSH JITTER | |
| EDGE SOFTNESS | |

**Placement:**

| Param | Notes |
|---|---|
| PLACEMENT MODE | RANDOM / WEIGHTED RANDOM / ERROR DRIVEN / EDGE DRIVEN / GRADIENT DRIVEN / SALIENCY DRIVEN |

**Direction:**

| Param | Notes |
|---|---|
| DIRECTION SOURCE | NONE / GRADIENT ANGLE / EDGE TANGENT / FLOW FIELD / MANUAL ANGLE |

**Colour:**

| Param | Notes |
|---|---|
| PALETTE MODE | SOURCE SAMPLE / REDUCED PALETTE / CUSTOM PALETTE / NEAREST PALETTE |
| PALETTE BLEND STRENGTH | Partial blend-distance matching (retain from source) |
| COLOUR JITTER | |

**Reconstruction:**

| Param | Notes |
|---|---|
| PASS COUNT | Number of coarse-to-fine passes |
| LARGE-TO-SMALL SCHEDULE | Size decay across passes |
| ITERATIONS PER FRAME | (retain from source) |
| COVERAGE TARGET | |
| ERROR THRESHOLD | |
| LAYER LIMIT | (retain from source) |

**Source Guidance:**

| Param | Notes |
|---|---|
| WEIGHT MAP | Retain from source; expand to full priority field (probability, size, opacity, direction, pass order) |
| EDGE INFLUENCE | |
| CONTRAST INFLUENCE | |
| LUMINANCE INFLUENCE | |
| HUE / SATURATION INFLUENCE | |

**Compositing:** OPACITY, BLEND MODE

---

### Implementation Phases

| Phase | Scope |
|---|---|
| 1 | Preserve dot painter as DOT PAINT mode with existing palette logic |
| 2 | Add image-derived placement fields: error map, gradient magnitude, gradient angle, edge map |
| 3 | Add directional stroke brush: length, angle, hardness, taper |
| 4 | Add DIRECTION MODES: random / gradient / edge tangent |
| 5 | Add multi-pass coarse-to-fine reconstruction |
| 6 | Add palette modes and full weight-map-driven planning |

**Minimum acceptable upgrade:** multi-pass reconstruction + error-driven placement + at least one directional stroke mode + source-derived orientation + retained palette and weight-map support.

```
[ERROR] [BUG] Driver slot button non-functional — see _global_issues.md G1
```

## Action Items

1. **[CRITICAL]** Rebuild as painterly reconstruction engine per five-stage architecture above.
2. **[HIGH — Phase 1]** Retain dot painter as DOT PAINT submode with existing palette matching logic.
3. **[HIGH — Phase 2]** Add error map, gradient magnitude/angle, and edge map as placement and direction fields.
4. **[HIGH — Phase 3]** Implement directional stroke brush with LENGTH, ANGLE, HARDNESS, TAPER.
5. **[HIGH — Phase 4]** Add DIRECTION SOURCE dropdown: GRADIENT ANGLE, EDGE TANGENT, FLOW FIELD.
6. **[HIGH — Phase 5]** Add multi-pass coarse-to-fine reconstruction with PASS COUNT and LARGE-TO-SMALL SCHEDULE.
7. **[Phase 6]** Expand weight map from reject gate to full priority field controlling size, opacity, direction, pass order.
8. Ensure all heavy computation runs in web worker (global — G12).
9. Fix +D driver button (global — G1).
10. Audit all params for `driveable: true` (global — G2).
11. Slider direct input and double-click-to-default (global — G5).
12. Add unit labels to all numeric params (global — G16).
13. Hide mode-conditional params (global — G14).
