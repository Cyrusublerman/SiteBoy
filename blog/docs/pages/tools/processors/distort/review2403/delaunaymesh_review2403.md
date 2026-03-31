# DELAUNAY MESH — Review 2403

- type: `delaunaymesh`
- category: COMPOSITE
- isVector: false
- verdict: KEEP — rename and major architectural upgrade required
- priority: HIGH
- date: 2026-03-24
- reviewer: user

---

## Section 1 — Triage

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 1.1 | What does this module do? | Generates Delaunay triangulation from a point field and fills each triangle with sampled image colour to produce a low-poly mosaic | — |
| 1.2 | Visually distinct from all other modules? | YES — tessellated image reconstruction is unique | — |
| 1.3 | Verdict | KEEP — rename to MOSAIC / TESSELLATION; full architectural upgrade required | — |

## Rename

`delaunaymesh` → `mosaic` (or `tessellation`). Delaunay remains one topology mode within a broader tessellation system.

## Current Implementation

Delaunay triangulation over an arbitrary (spatially uniform) point field with sampled image colour fill. Seeds are not density-driven by image structure. Triangulation merely samples the image after the fact rather than representing it.

## Issues

```
[ERROR] [PARITY] Seed placement is not image-aware — density is spatially uniform
Location: nodes/delaunaymesh — seed generation
Evidence: Point count is global; placement does not respond to gradient magnitude, edge density, or local contrast. Tessellation is no denser near contours than in flat areas.
Impact: Output does not represent image structure — large triangles appear equally in detail-rich and flat regions.
```

```
[ERROR] [PARITY] No density field — no gradient/edge/contrast-weighted seeding
Location: nodes/delaunaymesh — density field
Evidence: No BASE DENSITY, GRADIENT BOOST, EDGE BOOST, EDGE FALLOFF, or DENSITY PREVIEW params.
Impact: Cannot concentrate cells where image structure requires detail.
```

```
[ERROR] [PARITY] No seed optimisation — no relaxation or Lloyd iteration
Location: nodes/delaunaymesh — optimisation
Evidence: No RELAX ITERATIONS or RELAX STRENGTH params.
Impact: Point distribution is raw/unbalanced; tessellation quality is poor.
```

```
[WARN] [PARITY] Topology limited to Delaunay only — no Voronoi, hex, quad, or adaptive subdivision
Location: nodes/delaunaymesh — topology
Evidence: No TOPOLOGY METHOD param.
Impact: Cannot produce polygon mosaic (Voronoi), regular hex mosaic, or structure-adaptive subdivision.
```

```
[WARN] [PARITY] No wire/border render modes — fill only
Location: nodes/delaunaymesh — render
Evidence: No wireframe, wire-only, border/grout, or overlay render modes.
Impact: Cannot produce line-based or crackle-style mosaic outputs.
```

## Required Upgrade Specification

### Core Conceptual Shift

```
FROM: triangulate random points → sample image colour
TO:   analyse image → build density field → generate image-aware seeds → optimise → tessellate → assign attributes → render
```

Module goal: **partition the image into cells that represent image structure, not merely cover it**.

### Eight-Stage Target Architecture

```
Stage 1: Image Analysis Fields
Stage 2: Density Field Construction
Stage 3: Seed Generation
Stage 4: Seed Optimisation
Stage 5: Topology Generation
Stage 6: Cell Attribute Assignment
Stage 7: Render Mode
Stage 8: Image Interaction / Output Fields
```

---

### Stage 1 — Image Analysis Fields

| Field | Notes |
|---|---|
| GRADIENT MAGNITUDE | Primary structural driver — default density source |
| EDGE MAP | Hard/semi-hard contour emphasis |
| **DISTANCE TO EDGE** | First-class field — converts sparse edges to smooth density gradient |
| LOCAL CONTRAST | Broad structural richness beyond sharp edges |
| LUMINANCE | Optional secondary stylistic driver |
| COLOUR GRADIENT | Useful where hue transitions matter |
| MASK | User-defined spatial emphasis |

---

### Stage 2 — Density Field Construction

Formula: `D(x,y) = Base + Wg*G(x,y) + Wc*C(x,y) + We*E(x,y)`

| Param | Notes |
|---|---|
| DENSITY MODE | UNIFORM / GRADIENT WEIGHTED / EDGE WEIGHTED / EDGE DISTANCE / CONTRAST WEIGHTED / HYBRID (default) |
| BASE DENSITY | Minimum coverage everywhere |
| GRADIENT BOOST | How strongly gradient magnitude increases density |
| EDGE BOOST | How strongly edges increase density |
| EDGE FALLOFF | How far edge influence extends |
| CONTRAST BOOST | Texture/detail contribution |
| LUMINANCE BIAS | Optional bright/dark density weighting |
| DENSITY CURVE | LINEAR / SMOOTHSTEP / EXPONENTIAL / THRESHOLDED |
| DENSITY PREVIEW | Display density field for tuning |

**Best default:** HYBRID — base + gradient + edge distance falloff.

---

### Stage 3 — Seed Generation

| Param | Notes |
|---|---|
| POINT COUNT | Global budget or target count |
| SEED MODE | UNIFORM RANDOM / JITTERED GRID / POISSON-DISC / GRADIENT WEIGHTED / EDGE WEIGHTED / MASK WEIGHTED / HYBRID WEIGHTED POISSON |
| SEED RANDOMNESS | Regularity vs irregularity |
| SEED | Deterministic random seed |
| MIN SPACING | Global floor on centre-to-centre distance |
| SPACING MODE | FIXED / DENSITY DERIVED (high density → small spacing) |

**Best default seeding:** HYBRID WEIGHTED POISSON.

---

### Stage 4 — Seed Optimisation

| Param | Notes |
|---|---|
| RELAX MODE | NONE / WEIGHTED REPULSION / WEIGHTED LLOYD / HYBRID |
| RELAX ITERATIONS | Number of optimisation passes |
| RELAX STRENGTH | Point movement strength |
| PRESERVE FEATURES | Pin strong contour anchors more firmly |

---

### Stage 5 — Topology Generation

| Method | Notes |
|---|---|
| DELAUNAY | Primary low-poly triangular (current) |
| VORONOI | Irregular polygon mosaic |
| CENTROIDAL VORONOI | More balanced mosaic cells |
| HEX | Regular hex mosaic |
| QUAD | Rectangular partition |
| ADAPTIVE SUBDIVISION | Recursive split at high-detail regions |
| CELLULAR / CRACKLE | Irregular cracked-stone effect |

**First additions beyond Delaunay:** VORONOI, HEX, ADAPTIVE SUBDIVISION.

---

### Stage 6 — Cell Attribute Assignment

**Fill modes:**

| Mode | Notes |
|---|---|
| AVERAGE COLOUR | Mean source colour in cell |
| CENTROID SAMPLE | Sample at seed or centroid |
| MEDIAN COLOUR | More robust than mean |
| PALETTE REDUCED | Map to nearest palette colour |
| GRADIENT FILL | Stylised fill |
| TEXTURE PATCH | Cropped source sample (advanced) |

**Border/grout:**

| Param | Notes |
|---|---|
| SHOW BORDERS | Toggle |
| BORDER WIDTH | |
| BORDER COLOUR | |
| BORDER OPACITY | |
| GROUT MODE | SOLID / CRACKLE / GRADIENT |

---

### Stage 7 — Render Mode

| Mode | Notes |
|---|---|
| FLAT FILL | Cell fills only |
| WIREFRAME | Lines only |
| FILL + WIRE | Standard low-poly |
| BORDER ONLY | Mosaic boundary/grout |
| OVERLAY | Mesh over original image |
| MASK | Cells or borders define visibility |
| DIFFERENCE | Source vs cell reconstruction delta |

---

### Stage 8 — Image Interaction / Output Fields

| Output | Notes |
|---|---|
| CELL MASK | Cells as regions for downstream processing |
| BORDER MASK | Edges as crack/grout/line fields |
| CELL ID | For partitioned effects |
| CELL AREA | For size-aware grading |
| DISTANCE TO BORDER | For soft edge treatments |

**Downstream uses:** different grading per cell, blur/sharpen by cell size, displacement anchored to cell centres, border-driven line effects, cell-based masking.

---

### Implementation Phases

| Phase | Scope |
|---|---|
| 1 | Density field from gradient magnitude + edge distance; gradient-weighted Poisson seeding |
| 2 | Relaxation pass (weighted repulsion) |
| 3 | Density field controls: BASE DENSITY, GRADIENT BOOST, EDGE BOOST, EDGE FALLOFF, DENSITY PREVIEW |
| 4 | Voronoi topology mode |
| 5 | Wire-only and fill+wire render modes; border/grout controls |
| 6 | Hex and adaptive subdivision topologies |
| 7 | Cell output fields: CELL MASK, BORDER MASK, DISTANCE TO BORDER |

**Minimum acceptable upgrade:** image-aware seed density + gradient/edge-weighted placement + density modulation controls + Voronoi mode + wire/border controls.

**Strong first advanced version:** Hybrid density (base + gradient + edge distance) + weighted Poisson + relaxation + Delaunay + Voronoi + average/palette fill + wire + fill+wire render.

```
[ERROR] [BUG] Driver slot button non-functional — see _global_issues.md G1
```

## Action Items

1. **[HIGH PRIORITY — Phase 1]** Implement density field: DENSITY MODE, BASE DENSITY, GRADIENT BOOST, EDGE BOOST, EDGE FALLOFF, DENSITY CURVE, DENSITY PREVIEW.
2. **[HIGH PRIORITY — Phase 1]** Implement gradient-weighted Poisson seeding: SEED MODE, MIN SPACING, SPACING MODE.
3. **[HIGH PRIORITY — Phase 2]** Implement relaxation: RELAX MODE, RELAX ITERATIONS, RELAX STRENGTH.
4. **[HIGH PRIORITY — Phase 4]** Add VORONOI topology mode.
5. **[HIGH PRIORITY — Phase 5]** Add WIREFRAME, FILL+WIRE, BORDER ONLY render modes; BORDER WIDTH, BORDER COLOUR, GROUT MODE params.
6. **[Phase 6]** Add HEX and ADAPTIVE SUBDIVISION topology modes.
7. **[Phase 7]** Add CELL MASK, BORDER MASK, DISTANCE TO BORDER output fields.
8. Rename module display name to MOSAIC (or TESSELLATION).
9. Ensure all triangulation/Poisson computation runs in web worker (global — G12).
10. Fix +D driver button (global — G1).
11. Audit all params for `driveable: true` (global — G2).
12. Slider direct input and double-click-to-default (global — G5).
13. Add unit labels to all numeric params (global — G16).
14. Hide mode-conditional params (global — G14).
