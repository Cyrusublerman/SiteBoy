# PAINTSTROKE — Build Guide

- module: paintstroke
- node: PaintStrokeNode.js
- category: GENERATIVE
- review verdict: KEEP
- rebuild severity: CRITICAL

---

## Current State Summary

Current implementation is a stochastic soft-circle depositor. It places randomly-positioned radial-gradient dots whose colour is chosen by minimum squared-RGB distance from a palette. It uses `LayerTracker` to snapshot every 250 strokes and `flatten()` to composite the final output. The seven params (`brushMin`, `brushMax`, `minOpacity`, `maxOpacity`, `iterations`, `maxLayers`, `paletteMode`) and all algorithm imports (`paintStamp`, `LayerTracker`, `SeededRNG`) are identical between the live source and the archived reference — the two files are byte-for-byte identical.

The module is functionally operational as a dot depositor. It is not a painterly reconstruction engine. The review verdict is KEEP but requires a complete architectural rebuild to become the stated target.

Critical bug: `LayerTracker.push()` copies the full canvas buffer every 250 iterations. At `iterations=50000` and 4K resolution this accumulates up to ~6.6 GB of memory — an out-of-memory crash risk at maximum settings.

Factory signature violation: `apply()` is declared as `apply(src, dst, w, h, p, ctx)` — the `modulate` argument is omitted. This is a standards violation even though no params are currently driveable.

---

## Reference Parity Gaps

The reference source (`reference/distort/paintstroke/source/PaintStrokeNode.js`) is byte-for-byte identical to the live source. No regression has occurred from the archived baseline.

Parity gaps are therefore architectural, not implementation-level. The archived source itself is the object of the rebuild. All of the following are absent from both the live and reference source:

| Missing feature | Required by review |
|---|---|
| Source image analysis (gradient magnitude, gradient angle, edge map, luminance, local contrast, saliency) | Stage 1 |
| Error map / per-pixel reconstruction error tracking | Stage 4 |
| Error-driven stroke placement | Stage 2 |
| Directional strokes (angle, length, taper, hardness, bristle) | Stage 3 |
| Multi-pass coarse-to-fine reconstruction schedule | Stage 5 |
| PASS COUNT param | Stage 5 |
| LARGE-TO-SMALL schedule | Stage 5 |
| PAINTER MODE dropdown (DOT / STROKE / FLOW STROKE / PATCH / PALETTE RECONSTRUCTION) | Param set |
| BRUSH SHAPE param | Param set |
| BRUSH HARDNESS param | Param set |
| BRUSH LENGTH param | Param set |
| BRUSH JITTER param | Param set |
| EDGE SOFTNESS param | Param set |
| PLACEMENT MODE dropdown | Param set |
| DIRECTION SOURCE dropdown | Param set |
| PALETTE BLEND STRENGTH param | Param set |
| COLOUR JITTER param | Param set |
| COVERAGE TARGET param | Param set |
| ERROR THRESHOLD param | Param set |
| WEIGHT MAP input (expanded to full priority field) | Param set |
| EDGE INFLUENCE param | Param set |
| CONTRAST INFLUENCE param | Param set |
| LUMINANCE INFLUENCE param | Param set |
| HUE / SATURATION INFLUENCE param | Param set |
| ITERATIONS PER FRAME param | Param set |
| FRAME param (G9) | Global |

---

## Review Spec Gaps

All five issues from `paintstroke_review2403.md` remain unaddressed in the live source:

1. **[ERROR][PARITY]** Module is a stochastic dot depositor, not a painter. No stroke direction, pathfinding, edge following, local orientation, brush texture, or bristle logic.
2. **[ERROR][PARITY]** Placement is purely random. No error map, gradient magnitude, saliency, or contrast structure drives placement.
3. **[ERROR][PARITY]** No directional strokes. No angle, length, taper, or bristle structure.
4. **[ERROR][PARITY]** No multi-pass coarse-to-fine reconstruction. All strokes are same-scale random placement.
5. **[ERROR][PARITY]** No error-driven refinement. Only crude layer tracker and average-layer stopping rule.

The review's minimum acceptable upgrade (multi-pass reconstruction + error-driven placement + at least one directional stroke mode + source-derived orientation + retained palette and weight-map support) is not met.

---

## Missing Parameters

All params below are absent from the current implementation and required by the review spec:

**Painter mode:**
- `painterMode` — `PAINTER MODE` — select — DOT / STROKE / FLOW STROKE / PATCH / PALETTE RECONSTRUCTION — tier 3

**Brush (add to existing set):**
- `brushShape` — `BRUSH SHAPE` — select — SOFT DAB / HARD DAB / ELLIPSE / BRISTLE / RIBBON / DRY BRUSH — tier 3
- `brushHardness` — `HARDNESS` — range — 0–1 — tier 3 — driveable: true — unit: normalised
- `brushLength` — `LENGTH` — range — 1–200 — tier 3 — driveable: true — unit: px
- `brushJitter` — `JITTER` — range — 0–100 — tier 3 — driveable: true — unit: px
- `edgeSoftness` — `EDGE SOFTNESS` — range — 0–1 — tier 3 — driveable: true — unit: normalised

**Placement:**
- `placementMode` — `PLACEMENT` — select — RANDOM / WEIGHTED RANDOM / ERROR DRIVEN / EDGE DRIVEN / GRADIENT DRIVEN / SALIENCY DRIVEN — tier 3

**Direction:**
- `directionSource` — `DIRECTION` — select — NONE / GRADIENT ANGLE / EDGE TANGENT / FLOW FIELD / MANUAL ANGLE — tier 3
- `manualAngle` — `ANGLE` — range — 0–360 — tier 3 — driveable: true — unit: ° — conditional on directionSource=MANUAL ANGLE

**Colour (add to existing set):**
- `paletteBlend` — `PAL BLEND` — range — 0–1 — tier 4 — driveable: true — unit: normalised
- `colourJitter` — `COL JITTER` — range — 0–255 — tier 4 — driveable: true — unit: lvl

**Reconstruction:**
- `passCount` — `PASSES` — range — 1–6 — tier 4 — driveable: true — unit: n
- `coverageTarget` — `COVERAGE` — range — 0–1 — tier 4 — driveable: true — unit: normalised
- `errorThreshold` — `ERR THRESH` — range — 0–255 — tier 4 — driveable: true — unit: lvl
- `frame` — `FRAME` — range — 0–50000 — tier 3 — driveable: true — unit: n (G9)

**Source guidance:**
- `edgeInfluence` — `EDGE INF` — range — 0–1 — tier 4 — driveable: true — unit: normalised
- `contrastInfluence` — `CONTRAST INF` — range — 0–1 — tier 4 — driveable: true — unit: normalised
- `luminanceInfluence` — `LUM INF` — range — 0–1 — tier 4 — driveable: true — unit: normalised
- `hueInfluence` — `HUE INF` — range — 0–1 — tier 4 — driveable: true — unit: normalised

---

## Extra/Incorrect Parameters

None. All seven existing params (`brushMin`, `brushMax`, `minOpacity`, `maxOpacity`, `iterations`, `maxLayers`, `paletteMode`) are correct, correctly labelled, correctly ranged, and must be retained in the rebuild. `brushMin` and `brushMax` are missing `unit: 'px'` enforcement (both already declare `unit: 'px'`). `minOpacity` and `maxOpacity` declare `driveable: true` and `unit: 'lvl'` in the live source but are absent in the reference — this is a live-source improvement over the reference, not a regression. Retain.

One structural error: `brushMin` can exceed `brushMax` with no validation. No UI enforcement or clamping exists.

---

## UI Compliance Issues

### driveable: true — G2

| Param | Live source | Required |
|---|---|---|
| `brushMin` | driveable: true | pass |
| `brushMax` | driveable: true | pass |
| `minOpacity` | driveable: true | pass |
| `maxOpacity` | driveable: true | pass |
| `iterations` | driveable: true | pass |
| `maxLayers` | driveable: true | pass |
| `paletteMode` | — (select, not applicable) | n/a |

All numeric params have `driveable: true` in the live source. Pass.

### unit labels — G16

| Param | Live source | Reference source | Required |
|---|---|---|---|
| `brushMin` | unit: 'px' | unit: 'px' | pass |
| `brushMax` | unit: 'px' | unit: 'px' | pass |
| `minOpacity` | unit: 'lvl' | absent | pass (live) |
| `maxOpacity` | unit: 'lvl' | absent | pass (live) |
| `iterations` | unit: 'n' | absent | pass (live) |
| `maxLayers` | unit: 'n' | absent | pass (live) |

All numeric params have `unit` in the live source. Pass.

### apply() signature — factory standards

`apply(src, dst, w, h, p, ctx)` — missing `modulate` argument. Violation of factory signature standard. No `modulate()` calls in body. Must be corrected when adding driveable params to new param set.

### Conditional param visibility — G14

Once `painterMode`, `placementMode`, `directionSource`, and `brushShape` are added, mode-conditional params must be hidden when their mode is not active. Specifically:
- `manualAngle` — only visible when `directionSource = MANUAL ANGLE`
- `brushLength`, `brushHardness` — only visible when `brushShape ∈ {ELLIPSE, BRISTLE, RIBBON}`
- All placement influence params (`edgeInfluence`, etc.) — conditional on `placementMode`

### brushMin > brushMax — no validation

No enforcement. `rng.nextRange(brushMin, brushMax)` with `brushMin > brushMax` is undefined behaviour. Must add UI clamping or param interdependency guard.

---

## Global Issues

| Issue | Status in live source | Action |
|---|---|---|
| G1 — +D button non-functional | Affects all modules including this one. Module-level fix not possible; systemic NodePanel fix required. | No change in module |
| G2 — All numerics driveable: true | Existing params all have driveable: true. New params added in rebuild must also have driveable: true. | Add driveable: true to all new range params |
| G5 — Slider direct input + double-click-to-default | Systemic NodePanel fix, not module-level. | No change in module |
| G6 — Canvas click-to-pick for centre params | Not applicable — no centre X/Y params. | None |
| G7 — Vector modules identifiable | Not applicable — pixel output module. | None |
| G9 — Time/iteration-based modules need FRAME param | Paint Stroke is iteration-based. A `FRAME` param must be added. | Add `frame` param — range 0–50000, tier 3, driveable: true |
| G10 — Vector SVG export | Not applicable — pixel output module. | None |
| G11 — Overlapping features use shared components | Image analysis fields (gradient, edge map, error map) required by rebuild. Must consume shared analysis utilities if available; do not re-implement per-module. | Verify analysis utilities before implementing Stage 1 |
| G12 — Web worker for expensive modules | Paint Stroke at iterations=50000 is the highest-cost module in the pipeline (D-class). Must run fully in render worker. | Confirm apply() runs in worker; add appropriate previewMax caps to new expensive params |
| G14 — Mode-conditional params hidden | All new mode-conditional params must be hidden when their mode is inactive. | Implement `when` conditions on all conditional params |
| G16 — Unit labels on all numeric params | All existing params have units. New params must also declare unit. | Add unit to all new range params |

---

## Merge Absorption

No merge conflicts. The live source and reference source are identical. There are no divergent branches to reconcile. The rebuild starts from the live source.

---

## Required Changes (priority ordered)

### P0 — Critical bug fix (pre-rebuild, can ship independently)

1. **LayerTracker memory explosion.** Cap snapshot count. Either increase snapshot interval (e.g. every 2500 iterations instead of 250) or enforce a maximum snapshot count (e.g. 20) with last-write semantics. At `iterations=50000` the current 200-snapshot accumulation is an OOM crash at 4K. Action: add `const MAX_SNAPSHOTS = 20; const snapInterval = Math.max(250, Math.ceil(iters / MAX_SNAPSHOTS));` and replace the hardcoded `% 250` check.

2. **apply() signature.** Add `modulate` to signature: `apply(src, dst, w, h, p, ctx, modulate)`. Required for any driveable param to function. No params currently use it but it must be present.

### P1 — Phase 1: Retain dot painter as DOT PAINT submode

3. Add `painterMode` select param. Wrap existing logic in `if (p.painterMode === 'DOT') { ... }`. This preserves the existing implementation as a named mode while the rebuild adds new modes alongside it.

4. Add `brushMin > brushMax` guard: clamp `brushMax` to `Math.max(p.brushMax, p.brushMin + 1)` in apply() before use.

5. Remove redundant inline preview cap (`ctx?.quality === 'preview' ? Math.min(p.iterations, 1000) : p.iterations`). `previewMax: 1000` on the `iterations` param already handles this via the factory.

### P2 — Phase 2: Source image analysis

6. Implement source analysis: compute gradient magnitude map, gradient angle map, and edge map from `src` at the start of `apply()`. Store as typed arrays local to `apply()`. Required for all non-DOT modes. These must be derived from the source once, not per-stroke.

7. Implement per-pixel reconstruction error map: `errorMap[i] = (src[i*4] - buf[i*4])² + (src[i*4+1] - buf[i*4+1])² + (src[i*4+2] - buf[i*4+2])²`. Update each stroke footprint after stamping.

### P3 — Phase 3: Directional stroke brush

8. Add `brushShape`, `brushHardness`, `brushLength`, `brushJitter`, `edgeSoftness` params.

9. Implement ellipse brush stamp: oriented by stroke direction angle, sized by `brushLength` along the direction axis and `size` perpendicular.

10. Add `directionSource` select param and implement: NONE (random direction), GRADIENT ANGLE (from gradient angle map), EDGE TANGENT (perpendicular to gradient), MANUAL ANGLE (from `manualAngle` param).

### P4 — Phase 4: Placement modes

11. Add `placementMode` select param. Implement:
    - RANDOM — existing behaviour
    - ERROR DRIVEN — sample position proportional to `errorMap[y*w+x]`
    - EDGE DRIVEN — sample position proportional to edge magnitude
    - GRADIENT DRIVEN — sample position proportional to gradient magnitude
    - WEIGHTED RANDOM — existing weight gate expanded to full priority field

12. Add `edgeInfluence`, `contrastInfluence`, `luminanceInfluence`, `hueInfluence` params for blending placement weights.

### P5 — Phase 5: Multi-pass coarse-to-fine reconstruction

13. Add `passCount` param (1–6).

14. Implement pass loop: for each pass, derive `sizeMax = brushMax × (1 - passIdx/passCount)`, `sizeMin = brushMin × (1 - passIdx/passCount)`. Passes run in sequence; each pass draws `iterations/passCount` strokes. Error map is updated between passes.

15. Add `coverageTarget` and `errorThreshold` stopping conditions as early-exit checks within the pass loop.

### P6 — Phase 6: Full palette and colour expansion

16. Add `paletteBlend` param. Apply partial blend-distance matching: blend palette colour toward source colour by `paletteBlend` before stamping.

17. Add `colourJitter` param. Add random per-channel noise in `[0, colourJitter]` to selected colour before stamp.

18. Add `FRAME` param (G9): integer range `0–50000`, tier 3, driveable: true, unit: n. Controls which iteration state is shown as static output. When animation system is implemented this will be driven externally.

### P7 — Shared component coordination (G11)

19. Before implementing Stage 1 analysis functions, check whether shared analysis utilities (gradient, edge map, error map) already exist in `assets/js/shared/algorithms/`. If present, import and use them. Do not duplicate.

### P8 — G14 conditional visibility

20. Implement `when` conditions on all mode-conditional params:
    - `manualAngle`: `when: { directionSource: 'MANUAL ANGLE' }`
    - `brushLength`, `brushHardness`: `when: { brushShape: ['ELLIPSE', 'BRISTLE', 'RIBBON'] }`
    - `edgeInfluence`, `contrastInfluence`, `luminanceInfluence`, `hueInfluence`: `when: { placementMode: ['WEIGHTED RANDOM', 'ERROR DRIVEN', 'EDGE DRIVEN', 'GRADIENT DRIVEN'] }`
    - `coverageTarget`, `errorThreshold`: visible only in non-DOT modes

---

## Verification Criteria

1. At `painterMode = DOT`, output is visually identical to the current implementation for the same seed and params.
2. `LayerTracker.push()` is called at most 20 times per `apply()` call regardless of `iterations` value.
3. `apply()` signature is `apply(src, dst, w, h, p, ctx, modulate)`.
4. At `painterMode = STROKE` with `directionSource = GRADIENT ANGLE`, strokes are visibly oriented along image gradient structure.
5. At `placementMode = ERROR DRIVEN`, strokes concentrate on high-error regions across passes.
6. At `passCount = 3`, output shows hierarchical large-to-small stroke structure: broad underpainting visible at pass 1, edge structure emerging at pass 2, fine detail at pass 3.
7. `brushMin > brushMax` does not produce degenerate output — clamping prevents invalid range.
8. `FRAME` param exists, is type range, is driveable, and controls iteration depth.
9. All new numeric params have `driveable: true` and `unit` set.
10. Mode-conditional params are hidden (not visible, not just disabled) when their governing mode is not active.
11. Full `apply()` at `iterations = 50000` does not crash or exceed available heap at 1080p.
12. G12: confirm apply() runs in the render worker, not on the main thread.
13. Registry entry unchanged — `type: 'paintstroke'`, category `GENERATIVE`.
