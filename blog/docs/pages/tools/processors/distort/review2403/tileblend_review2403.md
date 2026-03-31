# TILE BLEND — Review 2403

- type: `tileblend`
- category: COMPOSITE
- isVector: false
- verdict: KEEP — major architectural upgrade required
- priority: HIGH
- date: 2026-03-24
- reviewer: user

---

## Section 1 — Triage

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 1.1 | What does this module do? | Tiles, offsets, mirrors, and blends repeated copies of the image with simple tonal controls (mix, offset X/Y, mirror X/Y, exposure, gamma) | — |
| 1.2 | Visually distinct from all other modules? | YES — image repetition/symmetry is distinct | — |
| 1.3 | Verdict | KEEP — rebuild as repetition and symmetry compositor | — |

## Current Implementation

Controls: MIX, OFFSET X, OFFSET Y, MIRROR X, MIRROR Y, EXPOSURE, GAMMA. Simple repeated-image compositor. No source-region control, no topology selection, no kaleidoscope, no mosaic, no per-tile transforms.

## Issues

```
[ERROR] [PARITY] Source region is not explicitly controllable — tiling is blunt full-image repetition
Location: nodes/tileblend — source region logic
Evidence: No crop, centre, or region selection. Cannot tile just a selected area or zone.
Impact: Effect is generic and compositionally inflexible. Most important missing feature.
```

```
[ERROR] [PARITY] Topology limited to simple grid repeat and mirror — no kaleidoscope, mosaic, or recursive modes
Location: nodes/tileblend — tiling topology
Evidence: Only offset + mirror available. No radial kaleidoscope, no staggered grid, no mosaic cells, no recursive inset.
Impact: Module cannot produce the most useful repetition/symmetry effects.
```

```
[WARN] [PARITY] No per-tile transform variation — all tiles are identical
Location: nodes/tileblend — per-tile transforms
Evidence: No checker flip, rotation, scale jitter, or index-driven transform per tile.
Impact: All repetitions are identical — no structural variation between tiles.
```

```
[WARN] [PARITY] Combination logic is shallow — only mix + exposure + gamma
Location: nodes/tileblend — combination layer
Evidence: No combine mode (multiply/screen/difference etc.), no weighting, no overlap priority logic.
Impact: Cannot produce compositionally rich multi-tile blending.
```

## Required Upgrade Specification

### Core Conceptual Shift

```
FROM: tile image → offset → mirror → blend
TO:   define source region → define topology → per-tile transform → combination logic → output mapping
```

### Five-Layer Target Architecture

```
Layer 1: Source Region Selection
Layer 2: Tiling Topology
Layer 3: Per-Tile Transform
Layer 4: Combination Logic
Layer 5: Output Mapping
```

---

### Layer 1 — Source Region Selection

| Param | Notes |
|---|---|
| SOURCE MODE | FULL IMAGE / CROP REGION / VIEWPORT REGION / MASK-DEFINED / CELL-DEFINED |
| SOURCE X / Y | Centre or origin of sampled region |
| SOURCE WIDTH / HEIGHT | Sampled tile dimensions |
| SOURCE ROTATION | Rotate source sample before tiling |
| SOURCE SCALE | Scale source sample before tiling |
| CLAMP MODE | CLAMP / MIRROR / WRAP / TRANSPARENT |

---

### Layer 2 — Tiling Topology

| Topology | Notes |
|---|---|
| GRID | Basic rectangular tiling (current) |
| STAGGERED GRID | Offset rows/columns |
| MIRROR GRID | Alternating mirrored cells |
| CHECKER TRANSFORM | Alternating transform states across cells |
| **RADIAL KALEIDOSCOPE** | Angular segmentation around centre — most important addition |
| CONCENTRIC RING TILING | Radial band repetition |
| STRIP REPEAT | Repeat in one axis only |
| RECURSIVE INSET | Image reappears within itself at repeated scales |
| SPIRAL REPEAT | Repetition along spiral lattice |
| MOSAIC CELLS | Discrete cells that sample source differently |

**Kaleidoscope params:**

| Param | Notes |
|---|---|
| KALEIDOSCOPE CENTRE X / Y | (canvas click-to-pick — G6) |
| SEGMENT COUNT | Number of angular wedges |
| ANGULAR OFFSET | Rotation of wedge start |
| MIRROR ALTERNATE SEGMENTS | Flip odd segments |
| RADIAL SCALE | |

**Mosaic params:**

| Param | Notes |
|---|---|
| CELL WIDTH / HEIGHT | |
| CELL TOPOLOGY | GRID / HEX / VORONOI / STAGGERED |
| CELL SAMPLING MODE | CENTRE SAMPLE / AVERAGE COLOUR / BEST MATCH / RANDOM WITHIN REGION |
| CELL CONTENT MODE | DIRECT CROP / SCALED CROP / TRANSFORMED CROP / PALETTE-REDUCED CROP |

**Topology-specific params hidden when not active (G14).**

---

### Layer 3 — Per-Tile Transform

| Param | Notes |
|---|---|
| TILE SCALE | |
| TILE ROTATION | |
| TILE OFFSET X / Y | |
| MIRROR X / Y | (retain from current) |
| FLIP MODE | NONE / ALTERNATE X / ALTERNATE Y / CHECKER / RADIAL PARITY |
| TRANSFORM JITTER | Controlled variation per tile |
| TRANSFORM DRIVER | Position / tile index / angle / distance / luminance / noise drives transform |

---

### Layer 4 — Combination Logic

| Param | Notes |
|---|---|
| COMBINE MODE | NORMAL / MULTIPLY / SCREEN / OVERLAY / DIFFERENCE / ADD / SUBTRACT / MIN / MAX |
| MIX | (retain from current) |
| EXPOSURE | (retain from current) |
| GAMMA | (retain from current) |
| TILE WEIGHTING | UNIFORM / CENTRE-WEIGHTED / EDGE-WEIGHTED / DISTANCE-WEIGHTED / MASK-WEIGHTED |
| OVERLAP MODE | AVERAGE / ACCUMULATE / PRIORITY BY ORDER / PRIORITY BY BRIGHTNESS / PRIORITY BY DISTANCE TO CENTRE |

---

### Layer 5 — Output Mapping

| Mode | Notes |
|---|---|
| COMPOSITE | Standard tiled image output |
| MASK | Tiling defines visibility |
| DIFFERENCE FIELD | Source vs repeated field delta |
| DISPLACEMENT SOURCE | Tiled field distorts image |
| COLOUR PARTITION | Tile structure defines grading zones |
| FEEDBACK SOURCE | Repeated output becomes next iteration input |

**Dynamics / Drivers:**

| Param | Notes |
|---|---|
| TIME OFFSET | Frame-linked drift |
| LOOP SPEED | Continuous looping scroll |
| INDEX DRIVER | Tile index drives transforms |
| LUMINANCE DRIVER | Image drives tile behaviour |
| NOISE DRIVER | Noise drives tile variation |
| FRAME | (G9 — for animation) |

---

### Implementation Phases

| Phase | Scope |
|---|---|
| 1 | Explicit source-region controls: SOURCE MODE, SOURCE X/Y, SOURCE WIDTH/HEIGHT |
| 2 | Topology mode selection: GRID, MIRROR GRID, RADIAL KALEIDOSCOPE |
| 3 | Proper TILE WIDTH/HEIGHT controls separate from simple offsets |
| 4 | Per-tile transforms: ROTATION, SCALE, CHECKER MIRRORING, FLIP MODE |
| 5 | Mosaic cell partitioning |
| 6 | Recursive / feedback modes |

**Minimum acceptable upgrade:** explicit source-region selection + real tile size controls + topology modes beyond plain mirrored grid + radial kaleidoscope + better overlap/combination logic.

```
[ERROR] [BUG] Driver slot button non-functional — see _global_issues.md G1
```

## Action Items

1. **[HIGH PRIORITY — Phase 1]** Add explicit source-region controls: SOURCE MODE, SOURCE X/Y, SOURCE WIDTH/HEIGHT, CLAMP MODE.
2. **[HIGH PRIORITY — Phase 2]** Add TOPOLOGY TYPE dropdown; implement GRID, MIRROR GRID, RADIAL KALEIDOSCOPE as first set.
3. **[HIGH PRIORITY — Phase 3]** Add TILE WIDTH/HEIGHT params separate from OFFSET X/Y.
4. **[HIGH PRIORITY — Phase 4]** Add per-tile transform variation: FLIP MODE (CHECKER), TILE ROTATION, TILE SCALE, TRANSFORM JITTER.
5. **[Phase 5]** Add MOSAIC CELLS topology with CELL TOPOLOGY, SAMPLING MODE, CONTENT MODE.
6. **[Phase 6]** Add RECURSIVE INSET and FEEDBACK SOURCE output modes.
7. Add COMBINE MODE dropdown (replacing single MIX value).
8. Add TILE WEIGHTING and OVERLAP MODE.
9. Add canvas click-to-pick for KALEIDOSCOPE CENTRE (global — G6).
10. Add FRAME param (global — G9).
11. Hide mode-conditional topology params (global — G14).
12. Fix +D driver button (global — G1).
13. Audit all params for `driveable: true` (global — G2).
14. Slider direct input and double-click-to-default (global — G5).
15. Add unit labels to all numeric params (global — G16).
