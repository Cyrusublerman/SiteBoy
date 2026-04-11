# STIPPLE — Build Guide

- module: stipple
- node: StippleNode.js
- category: COMPOSITE
- review verdict: KEEP
- rebuild severity: CRITICAL

---

## Current State Summary

`StippleNode.js` is a 19-line factory module wrapping `stipple()` from `shared/algorithms/image/compositing.js`. It exposes four params: `minDist`, `dotRadius`, `bgLevel`, `dotLevel`. The algorithm performs luminance-weighted Poisson-disk rejection sampling via a spatial hash grid, rasterising accepted points as fixed-radius filled circles on a flat background.

The review verdict is that the current implementation is **not a stippler**. While it does use luminance-weighted rejection and minimum-distance enforcement (making it closer to correct than the review implies for the basic mechanism), it lacks the entire five-stage architecture required: no density field, no seeding algorithm choice, no relaxation/optimisation, no variable dot size, no multiscale passes, no diagnostics, no colour sampling, no vector output. The `driveable: true` declarations on `minDist`, `dotRadius`, and `dotLevel` are non-functional because `apply()` accepts no `modulate` argument.

Additionally, the luminance rejection formula polarity requires verification: `P(reject) = (1−lum)×0.8+0.1` gives P=0.9 at lum=0 (dark), which is high rejection for dark areas — contradicting the "dense in dark" specification. This may be a functional inversion bug in `compositing.js` (unfixed as of migration log 2026-03-11).

---

## Reference Parity Gaps

| Gap | Reference spec | Current state |
|---|---|---|
| `attempts` param (tier 4, 5–100, default 30) | legacy-docs/stipple.md | Absent; replaced by hardcoded `maxPoints` 3000/15000 |
| `bgLevel` tier | legacy: tier 2 | Source: tier 4 — source is authoritative; not a defect |
| `dotLevel` tier | legacy: tier 2 | Source: tier 4 — source is authoritative; not a defect |
| Luminance rejection formula polarity | "dense in dark" | Formula gives high P(reject) for dark pixels — possible functional inversion; must verify against `compositing.js` |
| Modulate wiring | `driveable: true` on 3 params | `apply()` has no `modulate` argument; driving is silently non-functional |

---

## Review Spec Gaps

All items below are absent from the current implementation and required per `stipple_review2403.md`.

### Stage 1 — Tone Field (fully absent)
- LUMINANCE CURVE param — user-controlled curve mapping luminance to dot demand
- INVERT TONE param — swap dark/light density mapping
- OPERATE IN LINEAR LIGHT param — toggle linear vs gamma-corrected luminance

### Stage 2 — Density / Demand Field (fully absent)
- MAX DENSITY param — maximum dots per unit area (dark regions)
- MIN DENSITY param — minimum dots per unit area (light regions)
- DENSITY MODE param — LUMINANCE / SATURATION / GRADIENT MAGNITUDE / CUSTOM
- DENSITY PREVIEW param — toggle diagnostic density field display

### Stage 3 — Point Seeding (partially present; critically incomplete)
- ALGORITHM param — GRID / JITTERED GRID / WEIGHTED REJECTION / POISSON-DISC (BRIDSON WEIGHTED); only flat random seeding currently exists
- RANDOMNESS param — jitter/stochasticity amount
- SEED param — deterministic variation (currently `ctx.nodeSeed ?? 42`, non-user-exposed)
- MULTISCALE PASSES param — coarse-to-fine pass count

### Stage 4 — Relaxation / Optimisation (fully absent)
- ITERATIONS param — number of relaxation steps
- RELAXATION STRENGTH param — how strongly points move toward optimum
- MIN SPACING param — minimum allowed inter-point distance (supersedes current `minDist`)
- COLLISION RADIUS MODE param — FIXED / SIZE-DEPENDENT / DENSITY-DEPENDENT

### Stage 5 — Attribute Assignment + Rendering (partially present; critically incomplete)
- DOT SHAPE param — CIRCLE / JITTERED CIRCLE / ELLIPSE / SQUARE / CUSTOM (only CIRCLE exists)
- SIZE MAPPING param — FIXED / FROM LUMINANCE / FROM DENSITY / DISCRETE SIZES (only FIXED exists)
- MIN RADIUS / MAX RADIUS params — size range (only single `dotRadius` exists)
- DISCRETE SIZES param — N size buckets from tone
- DOT COLOUR param — FIXED / SAMPLED FROM SOURCE / PALETTE (only greyscale level exists)
- OPACITY MAPPING param — FIXED / FROM LUMINANCE / FROM DENSITY
- BACKGROUND COLOUR param — replaces current greyscale `bgLevel`
- ANTIALIAS param — toggle
- OUTPUT MODE param — RASTER / VECTOR / BOTH (only RASTER exists)

### Diagnostics (fully absent)
- RESIDUAL MAP — preview of reconstruction error per region
- VORONOI OVERLAY — Voronoi cells around each dot
- NN DISTANCE HISTOGRAM — nearest-neighbour distance distribution
- POINT COUNT — current total dots (read-only)
- ITERATION LOG — optimisation convergence trace

---

## Missing Parameters

| Key | Label | Type | Required by |
|---|---|---|---|
| `luminanceCurve` | LUMINANCE CURVE | curve | review spec Stage 1 |
| `invertTone` | INVERT TONE | toggle | review spec Stage 1 |
| `linearLight` | LINEAR LIGHT | toggle | review spec Stage 1 |
| `maxDensity` | MAX DENSITY | range | review spec Stage 2 |
| `minDensity` | MIN DENSITY | range | review spec Stage 2 |
| `densityMode` | DENSITY MODE | select | review spec Stage 2 |
| `densityPreview` | DENSITY PREVIEW | toggle | review spec Stage 2 |
| `algorithm` | ALGORITHM | select | review spec Stage 3 |
| `randomness` | RANDOMNESS | range | review spec Stage 3 |
| `seed` | SEED | range/int | review spec Stage 3 |
| `multiscalePasses` | MULTISCALE PASSES | range/int | review spec Stage 3 |
| `iterations` | ITERATIONS | range/int | review spec Stage 4 |
| `relaxationStrength` | RELAXATION STRENGTH | range | review spec Stage 4 |
| `minSpacing` | MIN SPACING | range | review spec Stage 4 — supersedes `minDist` |
| `collisionRadiusMode` | COLLISION RADIUS MODE | select | review spec Stage 4 |
| `dotShape` | DOT SHAPE | select | review spec Stage 5 |
| `sizeMapping` | SIZE MAPPING | select | review spec Stage 5 |
| `minRadius` | MIN RADIUS | range | review spec Stage 5 — replaces single `dotRadius` |
| `maxRadius` | MAX RADIUS | range | review spec Stage 5 — replaces single `dotRadius` |
| `discreteSizes` | DISCRETE SIZES | range/int | review spec Stage 5 |
| `dotColour` | DOT COLOUR | select/colour | review spec Stage 5 |
| `opacityMapping` | OPACITY MAPPING | select | review spec Stage 5 |
| `bgColour` | BACKGROUND COLOUR | colour | review spec Stage 5 — replaces `bgLevel` |
| `antialias` | ANTIALIAS | toggle | review spec Stage 5 |
| `outputMode` | OUTPUT MODE | select | review spec Stage 5 |
| `residualMap` | RESIDUAL MAP | toggle | review spec diagnostics |
| `voronoiOverlay` | VORONOI OVERLAY | toggle | review spec diagnostics |
| `nnHistogram` | NN DISTANCE HISTOGRAM | toggle | review spec diagnostics |

---

## Extra/Incorrect Parameters

| Key | Issue |
|---|---|
| `dotRadius` | Superseded by `minRadius` + `maxRadius` + `sizeMapping`; retain only as compat fallback if needed |
| `bgLevel` | Superseded by `bgColour` (requires colour picker, not greyscale level int); remove after migration |
| `dotLevel` | Superseded by `dotColour` with FIXED mode; remove after migration |
| `minDist` | Semantically superseded by `minSpacing`; rename or replace |

Note: `bgLevel` and `dotLevel` being `driveable: true` / `driveable: true` is inconsistent with reference `ui-layout.md` which specifies `bgLevel` as non-driveable. `dotLevel` is correctly driveable per reference. Discrepancy exists only in live source vs reference for `bgLevel`.

---

## UI Compliance Issues

| Issue | Severity | Basis |
|---|---|---|
| `driveable: true` on `minDist`, `dotRadius`, `dotLevel` — `apply()` has no `modulate` arg; driver wiring is silently non-functional | ERROR | feature-parity.md; issues-and-conflicts.md |
| `bgLevel` declared `driveable: true` in live source; reference `ui-layout.md` specifies `driveable: no` for `bgLevel` | WARN | ui-layout.md |
| `dotRadius` has no `previewMax` — only `minDist` has it; high `dotRadius` at preview quality not capped | WARN | performance.md |
| Mode-conditional params for future `algorithm`, `sizeMapping`, `densityMode`, `outputMode`, `collisionRadiusMode` must be hidden when their parent mode is not active | WARN | G14 |
| All new range params must carry `unit` field | WARN | G16 |
| `seed` param must be user-exposed (currently `ctx.nodeSeed ?? 42`, not a user param) | WARN | review spec Stage 3 |

---

## Global Issues

| Issue | Status in StippleNode |
|---|---|
| **G1** — +D driver button non-functional (system-wide) | Affected; `driveable: true` on 3 params but button does nothing |
| **G2** — All numeric params must have `driveable: true` | Current: `bgLevel` missing `driveable`; all new range params must include it |
| **G5** — Slider direct input and double-click-to-default | Affected; system-wide NodePanel fix required |
| **G6** — Canvas click-to-pick for centre-point params | Not applicable; no centre X/Y params in this module |
| **G7** — Vector modules must be identifiable | Applicable post-rebuild if OUTPUT MODE includes VECTOR; add indicator at that point |
| **G9** — Time/iteration-based modules must expose FRAME param | Applicable if ITERATIONS param is added with iterative relaxation state; FRAME param may be needed for animation scrubbing |
| **G10** — Vector modules must include in-module SVG export | Applicable post-rebuild when VECTOR output mode is implemented |
| **G11** — Shared components for overlapping patterns | LUMINANCE CURVE, colour pickers, density preview, histogram overlay must use shared components, not per-module reimplementations |
| **G12** — Expensive modules must use web worker | `forceWorkerPreview: true` is set; full-path worker usage must be confirmed for the rebuild; relaxation iterations will be expensive |
| **G14** — Mode-conditional params must be hidden | All mode-gated params (`algorithm`, `sizeMapping`, `densityMode`, `collisionRadiusMode`, `outputMode`, diagnostics) must implement `when` visibility control |
| **G16** — Unit labels on all numeric params | `minDist` has `unit: 'px'`; `dotRadius` has `unit: 'px'`; `bgLevel`/`dotLevel` have `unit: 'lvl'`; all new params need `unit` field |

---

## Merge Absorption

None. StippleNode is not consumed by or merged into any other module. It is registered independently in `registry.js` at line 63. No alias, wrapper, or composite dependency exists.

---

## Required Changes (priority ordered)

### P0 — Blocking correctness issues (must fix before any other work)

1. **Verify luminance rejection formula polarity** in `compositing.js`. `P(reject) = (1−lum)×0.8+0.1` gives P=0.9 at lum=0 (dark), which means dark areas have high rejection — the opposite of "dense in dark." If confirmed inverted, the formula must be corrected. Correct intent: `P(reject) = lum×0.8 + 0.1` (high rejection for bright, low for dark). This is a functional defect in the underlying algorithm.

2. **Wire `modulate` in `apply()`** for all `driveable: true` params. Current signature `apply(src, dst, w, h, p, ctx)` does not accept a `modulate` argument. The rebuild must expose per-pixel driving via `getModulated()` calls inside the pixel loop (or equivalent in the new architecture).

### P1 — Architecture rebuild (five-stage pipeline)

3. **Implement Stage 2 — Density / Demand Field**: luminance-to-density mapping with `maxDensity`, `minDensity`, `densityMode` (LUMINANCE / SATURATION / GRADIENT MAGNITUDE / CUSTOM), and `densityPreview` diagnostic toggle.

4. **Implement Stage 3 — Point Seeding**: expose `algorithm` dropdown (GRID / JITTERED GRID / WEIGHTED REJECTION / POISSON-DISC BRIDSON WEIGHTED), `randomness`, user-exposed `seed`, and `multiscalePasses`.

5. **Implement Stage 4 — Relaxation / Optimisation**: `iterations`, `relaxationStrength`, `minSpacing` (replacing `minDist`), `collisionRadiusMode` (FIXED / SIZE-DEPENDENT / DENSITY-DEPENDENT). Minimum viable: ≥10 Lloyd or repulsion-attraction iterations.

6. **Implement Stage 5 — Attribute Assignment**: `dotShape` (CIRCLE / JITTERED CIRCLE minimum viable), `sizeMapping` (FIXED / FROM LUMINANCE minimum viable), `minRadius` / `maxRadius` replacing `dotRadius`, `dotColour` (FIXED / SAMPLED FROM SOURCE minimum viable), `bgColour` replacing `bgLevel`.

7. **Implement Stage 1 — Tone Field**: `luminanceCurve`, `invertTone`, `linearLight`. Requires shared curve control component (G11).

### P2 — Completeness and compliance

8. **Add `RESIDUAL MAP` diagnostic** — reconstruction error preview overlay. Required by review spec as part of minimum viable rebuild.

9. **Add `ANTIALIAS` toggle** for circle rasterisation at sub-pixel radii.

10. **Add `OUTPUT MODE`** — RASTER / VECTOR / BOTH. Vector path requires `buildGeometry()` implementation. Add SVG export button per G10 at this point.

11. **Add remaining diagnostics**: `voronoiOverlay`, `nnHistogram`, `pointCount` (read-only display), `iterationLog`.

12. **Add `DISCRETE SIZES` and `OPACITY MAPPING`** for complete Stage 5 attribute set.

13. **Add `MULTISCALE PASSES`** for coarse-to-fine reconstruction hierarchy.

### P3 — Parameter hygiene and standards

14. **Add `driveable: true` to `bgLevel`** (or its successor `bgColour`) if retained as a range param, per G2. Remove if replaced by colour picker (colour params are not range-type).

15. **Add `unit` fields to all new range params** per G16. Define appropriate units: `minSpacing` → `'px'`, `maxDensity`/`minDensity` → `'pts/px²'` or `'%'`, `iterations` → `''` (count), `relaxationStrength` → `''` (normalised), `minRadius`/`maxRadius` → `'px'`, `randomness` → `''` (normalised), `seed` → `''`.

16. **Implement `when` visibility conditions** on all mode-gated params per G14: params for `algorithm` modes, `sizeMapping` modes, `densityMode` modes, `collisionRadiusMode` modes, `outputMode`, and diagnostic toggles.

17. **Confirm `forceWorkerPreview: true` is sufficient** for the rebuilt algorithm's relaxation loop cost. Add `previewMax` caps or preview-mode iteration limits as needed per G12.

18. **Add `FRAME` param** if the relaxation stage introduces stateful iteration that should be scrubable per G9. Assess during Stage 4 implementation.

19. **Add vector-output identifier** (badge or indicator in CategoryPicker / NodePanel) per G7 once OUTPUT MODE includes VECTOR.

---

## Verification Criteria

1. Dark image regions produce visibly denser dot clusters; bright regions are sparse or empty — confirmed by eye and by residual map overlay.
2. Luminance rejection formula polarity confirmed correct in `compositing.js`: P(reject) is low for dark pixels.
3. POISSON-DISC (BRIDSON WEIGHTED) algorithm produces blue-noise distribution; GRID and JITTERED GRID produce grid-based distributions — visually distinguishable.
4. RELAXATION with ITERATIONS ≥ 10 moves points measurably toward more uniform distribution vs zero iterations — verified by NN distance histogram.
5. SIZE MAPPING FROM LUMINANCE: dots in dark regions are larger than dots in bright regions when `minRadius < maxRadius`.
6. `minSpacing` enforcement: no two dots are closer than `minSpacing` pixels in the output point set.
7. `driveable: true` params respond per-pixel when a driver is connected (once G1 is fixed): `minRadius`/`maxRadius`, `randomness`, `relaxationStrength` visibly vary across the image.
8. All mode-conditional params are hidden when their governing mode is not selected.
9. All range params display `unit` labels in NodePanel.
10. PREVIEW quality cap: computation completes in < 10 ms at preview settings; full-resolution relaxation does not block the main thread (worker offload confirmed).
11. RESIDUAL MAP overlay correctly highlights regions with low dot coverage relative to the demand field.
12. DENSITY PREVIEW diagnostic shows the computed density field prior to point seeding.
13. OUTPUT MODE VECTOR: `buildGeometry()` returns a valid polylines array; SVG export produces a downloadable `.svg` file.
14. `seed` param: two renders with identical seed produce identical dot positions; changing seed produces a different but deterministic layout.
15. Registry: `StippleNode` correctly registered and importable from `registry.js` with type `'stipple'`.
