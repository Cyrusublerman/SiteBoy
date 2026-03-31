# STIPPLE — Review 2403

- type: `stipple`
- category: COMPOSITE
- isVector: false
- verdict: KEEP — complete rebuild required; current implementation is non-functional
- priority: HIGH
- date: 2026-03-24
- reviewer: user

---

## Section 1 — Triage

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 1.1 | What does this module do? | Currently: sparse random dot placement with minimum distance and fixed dot radius, plus background/dot level controls. Not a real stippling system. | — |
| 1.2 | Visually distinct from all other modules? | YES — tone-driven point field stippling is unique | — |
| 1.3 | Verdict | KEEP — complete rebuild required; current implementation is not a stippler | ERROR |

## Current Implementation

Controls: MIN DIST, DOT RAD, BG LEVEL, DOT LEVEL. Fixed-radius random dots with a minimum spacing gate. No luminance curve, no density field, no seeding algorithm, no optimisation, no size mapping, no colour sampling. Output: random dots, not stippling.

## Issues

```
[ERROR] [PARITY] Module is not a stippler — it is fixed-radius random dot placement
Location: nodes/stipple — full implementation
Evidence: No luminance-driven density, no Poisson or blue-noise distribution, no relaxation/optimisation, no variable radius, no colour sampling, no multiscale passes, no diagnostics.
Impact: Output is structurally incorrect — random dots with no tonal relationship to image content.
```

```
[ERROR] [PARITY] No density field — placement is uniform random, not luminance-driven
Location: nodes/stipple — seeding
Evidence: No MAX DENSITY / MIN DENSITY params, no density preview. Dot count does not respond to tonal structure.
Impact: Dark regions do not get more dots, light regions fewer. Core stippling behaviour absent.
```

```
[ERROR] [PARITY] No seeding algorithm choice — no Poisson, no weighted rejection, no jittered grid
Location: nodes/stipple — point generation
Evidence: No ALGORITHM param. Only flat random placement.
Impact: Cannot produce blue-noise or CVT-like distributions.
```

```
[ERROR] [PARITY] No relaxation/optimisation — points are never moved toward correct distribution
Location: nodes/stipple — optimisation stage
Evidence: No ITERATIONS or RELAXATION STRENGTH params.
Impact: Without optimisation, result is never proper stippling — always random noise.
```

```
[ERROR] [PARITY] No size mapping — all dots are fixed radius
Location: nodes/stipple — attribute assignment
Evidence: DOT RAD is a single fixed value. No size-from-luminance, no min/max radius.
Impact: Dark and light regions are visually identical in dot size.
```

```
[ERROR] [PARITY] No multiscale passes — no coarse-to-fine reconstruction
Location: nodes/stipple — reconstruction
Evidence: No MULTISCALE PASSES param. All dots placed in one undifferentiated pass.
Impact: No structural hierarchy in the output.
```

## Required Rebuild Specification

### Five-Stage Target Architecture

```
Stage 1: Tone Field
Stage 2: Density / Demand Field
Stage 3: Point Seeding
Stage 4: Relaxation / Optimisation
Stage 5: Attribute Assignment + Rendering
```

---

### Stage 1 — Tone Field

| Param | Notes |
|---|---|
| LUMINANCE CURVE | User-controlled curve mapping luminance to dot demand |
| INVERT TONE | Swap dark/light density mapping |
| OPERATE IN LINEAR LIGHT | Toggle linear vs gamma-corrected luminance |

---

### Stage 2 — Density / Demand Field

| Param | Notes |
|---|---|
| MAX DENSITY | Maximum dots per unit area (dark regions) |
| MIN DENSITY | Minimum dots per unit area (light regions) |
| DENSITY MODE | LUMINANCE / SATURATION / GRADIENT MAGNITUDE / CUSTOM |
| DENSITY PREVIEW | Toggle diagnostic density field display |

---

### Stage 3 — Point Seeding

| Param | Notes |
|---|---|
| ALGORITHM | GRID / JITTERED GRID / WEIGHTED REJECTION / POISSON-DISC (BRIDSON WEIGHTED) |
| RANDOMNESS | Jitter/stochasticity amount |
| SEED | Deterministic variation |
| MULTISCALE PASSES | Number of coarse-to-fine passes |

---

### Stage 4 — Relaxation / Optimisation

| Param | Notes |
|---|---|
| ITERATIONS | Number of relaxation steps (weighted Lloyd / repulsion-attraction) |
| RELAXATION STRENGTH | How strongly points move toward optimum |
| MIN SPACING | Minimum allowed inter-point distance (replaces current MIN DIST) |
| COLLISION RADIUS MODE | FIXED / SIZE-DEPENDENT / DENSITY-DEPENDENT |

---

### Stage 5 — Attribute Assignment + Rendering

**Dot Attributes:**

| Param | Notes |
|---|---|
| DOT SHAPE | CIRCLE / JITTERED CIRCLE / ELLIPSE / SQUARE / CUSTOM |
| SIZE MAPPING | FIXED / FROM LUMINANCE / FROM DENSITY / DISCRETE SIZES |
| MIN RADIUS / MAX RADIUS | Size range |
| DISCRETE SIZES | N size buckets mapped from tone |
| DOT COLOUR | FIXED / SAMPLED FROM SOURCE / PALETTE |
| OPACITY MAPPING | FIXED / FROM LUMINANCE / FROM DENSITY |

**Rendering:**

| Param | Notes |
|---|---|
| BACKGROUND COLOUR | (replaces BG LEVEL) |
| ANTIALIAS | Toggle |
| OUTPUT MODE | RASTER / VECTOR / BOTH |

**Diagnostics:**

| Param | Notes |
|---|---|
| RESIDUAL MAP | Preview showing reconstruction error per region |
| VORONOI OVERLAY | Show Voronoi cells around each dot |
| NN DISTANCE HISTOGRAM | Nearest-neighbour distance distribution |
| POINT COUNT | Current total dots |
| ITERATION LOG | Optimisation convergence trace |

---

### Minimum Viable Rebuild

1. Luminance-driven density
2. Poisson or weighted-jitter seeding
3. ≥10 relaxation iterations
4. Variable dot radius from luminance (power-based size mapping)
5. Fixed black or sampled colour
6. Circle and jittered-circle dot shapes
7. Minimum spacing enforcement
8. Point count / density control
9. Raster output
10. Residual map preview

### Strongest First Version

Luminance curve + MAX DENSITY + weighted Poisson seeding + 10–20 relaxation iterations + power-based size mapping + fixed/sampled colour + circle/jittered-circle shapes + raster output + residual map preview.

### Non-Negotiable from Earlier Plan

- Density-driven point generation
- Algorithm choice (grid / jittered / Poisson / weighted)
- Optimisation / relaxation
- Size mapping from luminance
- Collision resolution
- Diagnostics
- Multiscale passes
- Vector output support

```
[ERROR] [BUG] Driver slot button non-functional — see _global_issues.md G1
```

## Action Items

1. **[CRITICAL]** Rebuild around five-stage pipeline: Tone Field → Density Field → Point Seeding → Relaxation → Attribute Assignment + Rendering.
2. **[HIGH PRIORITY]** Implement luminance curve and density field: LUMINANCE CURVE, MAX DENSITY, MIN DENSITY, DENSITY PREVIEW.
3. **[HIGH PRIORITY]** Implement ALGORITHM dropdown: GRID, JITTERED GRID, WEIGHTED REJECTION, POISSON-DISC.
4. **[HIGH PRIORITY]** Implement relaxation: ITERATIONS, RELAXATION STRENGTH, weighted Lloyd / repulsion-attraction.
5. **[HIGH PRIORITY]** Implement SIZE MAPPING: MIN RADIUS, MAX RADIUS, FROM LUMINANCE mode.
6. **[HIGH PRIORITY]** Implement DOT COLOUR: FIXED, SAMPLED FROM SOURCE, PALETTE.
7. Add MULTISCALE PASSES for coarse-to-fine reconstruction.
8. Add diagnostics: RESIDUAL MAP, VORONOI OVERLAY, NN DISTANCE HISTOGRAM, POINT COUNT.
9. Add VECTOR OUTPUT path.
10. Ensure all computation runs in web worker (global — G12).
11. Fix +D driver button (global — G1).
12. Audit all params for `driveable: true` (global — G2).
13. Slider direct input and double-click-to-default (global — G5).
14. Add unit labels to all numeric params (global — G16).
15. Hide mode-conditional params (global — G14).
