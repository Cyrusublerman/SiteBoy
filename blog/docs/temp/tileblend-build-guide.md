# TILEBLEND — Build Guide

- module: tileblend
- node: TileBlendNode.js
- category: COMPOSITE
- review verdict: KEEP — major architectural upgrade required
- rebuild severity: MAJOR

---

## Current State Summary

Live node (`nodes/composite/TileBlendNode.js`) implements a 24-line factory module. It delegates all pixel processing to `tileBlend()` in `shared/algorithms/image/compositing.js`. Parameters: `frame`, `internalBlend` (select), `mix`, `offsetX`, `offsetY`, `mirrorX`, `mirrorY`, `exposure`, `gamma`. The `apply()` signature is `apply(src, dst, w, h, p)` — no `ctx`, no `modulate`. Five params declare `driveable: true` but are non-functional as scalars. The live node diverges from the archived reference source in two ways: (1) param key renamed from `blendMode` to `internalBlend` (to avoid collision with the NodePanel-level `blendMode`); (2) `frame` param added, with its value injected as a phase offset into `offsetX` and `offsetY` (`ph = frame * 0.002`). A migration shim in `EffectNode.fromJSON()` bridges serialised `blendMode` → `internalBlend` on load. The module is architecturally minimal: no source-region control, single topology (grid + optional mirror), no per-tile transform variation, no combination layer beyond three blend modes and a mix scalar.

---

## Reference Parity Gaps

All gaps between live node and archived reference source (`reference/distort/tileblend/source/TileBlendNode.js`):

| # | Gap | Live | Reference | Severity |
|---|-----|------|-----------|----------|
| R1 | Param key `internalBlend` vs `blendMode` | `internalBlend` | `blendMode` | MINOR — shim in fromJSON covers deserialisation; intentional rename |
| R2 | `frame` param absent in reference | Present (tier 3, driveable) | Absent | ADDED — correct per G9 |
| R3 | Phase offset applied to `offsetX`/`offsetY` via `frame` | `offsetX + ph`, `offsetY + ph` | No offset applied | ADDED — correct per G9 |
| R4 | `unit` field absent on `mix`, `offsetX`, `offsetY`, `gamma` in reference | Live has `unit: '0–1'` on mix/offsetX/offsetY, `unit: 'n'` on gamma | Missing | ADDED — correct per G16 |

No functional regressions vs reference. All differences are intentional upgrades applied post-archive.

---

## Review Spec Gaps

All gaps identified in `review2403/tileblend_review2403.md` not yet resolved in the live node:

| # | Clause | Status | Notes |
|---|--------|--------|-------|
| S1 | [ERROR] No explicit source-region control (SOURCE MODE, SOURCE X/Y, SOURCE WIDTH/HEIGHT, CLAMP MODE) | OPEN | Full image only; no crop or region selection |
| S2 | [ERROR] Topology limited to grid + mirror — no KALEIDOSCOPE, STAGGERED GRID, MOSAIC, RECURSIVE, SPIRAL | OPEN | TOPOLOGY TYPE param absent |
| S3 | [WARN] No per-tile transform variation (FLIP MODE, TILE ROTATION, TILE SCALE, TRANSFORM JITTER, TRANSFORM DRIVER) | OPEN | All tiles identical |
| S4 | [WARN] Combination logic shallow — COMBINE MODE absent (only 3-option select + mix scalar) | OPEN | No SCREEN, OVERLAY, ADD, SUBTRACT, MIN, MAX |
| S5 | [WARN] TILE WEIGHTING and OVERLAP MODE absent | OPEN | |
| S6 | Output mapping modes absent (MASK, DIFFERENCE FIELD, DISPLACEMENT SOURCE, COLOUR PARTITION, FEEDBACK SOURCE) | OPEN | COMPOSITE output only |
| S7 | Dynamics layer incomplete — LOOP SPEED, INDEX DRIVER, LUMINANCE DRIVER, NOISE DRIVER absent | OPEN | Only FRAME present |
| S8 | Kaleidoscope params absent (CENTRE X/Y, SEGMENT COUNT, ANGULAR OFFSET, MIRROR ALTERNATE SEGMENTS, RADIAL SCALE) | OPEN | Requires TOPOLOGY = RADIAL KALEIDOSCOPE first |
| S9 | Mosaic params absent (CELL WIDTH/HEIGHT, CELL TOPOLOGY, CELL SAMPLING MODE, CELL CONTENT MODE) | OPEN | Requires TOPOLOGY = MOSAIC CELLS first |
| S10 | Canvas click-to-pick for KALEIDOSCOPE CENTRE (G6) | OPEN | Blocked by S8 |
| S11 | `mix` visible and apparently active when blendMode is MULTIPLY or DIFFERENCE — UX confusion | OPEN | No conditional visibility (G14) |
| S12 | `driveable: true` params non-functional (no modulate in apply()) | OPEN | G2 / G1 prerequisite |

**Minimum acceptable upgrade per review spec:** explicit source-region selection + real tile size controls + TOPOLOGY modes beyond plain mirrored grid + RADIAL KALEIDOSCOPE + better overlap/combination logic.

---

## Missing Parameters

Parameters required by review spec not present in live node:

### Layer 1 — Source Region
| Key | Label | Type | Notes |
|-----|-------|------|-------|
| `sourceMode` | SOURCE MODE | select | FULL IMAGE / CROP REGION / VIEWPORT REGION / MASK-DEFINED / CELL-DEFINED |
| `sourceX` | SOURCE X | range | 0–1, normalised centre x of sampled region |
| `sourceY` | SOURCE Y | range | 0–1, normalised centre y |
| `sourceWidth` | SOURCE WIDTH | range | 0–1 |
| `sourceHeight` | SOURCE HEIGHT | range | 0–1 |
| `sourceRotation` | SOURCE ROTATION | range | 0–360°; driveable |
| `sourceScale` | SOURCE SCALE | range | 0.1–4; driveable |
| `clampMode` | CLAMP MODE | select | CLAMP / MIRROR / WRAP / TRANSPARENT |

### Layer 2 — Tiling Topology
| Key | Label | Type | Notes |
|-----|-------|------|-------|
| `topology` | TOPOLOGY | select | GRID / STAGGERED GRID / MIRROR GRID / CHECKER TRANSFORM / RADIAL KALEIDOSCOPE / CONCENTRIC RING / STRIP REPEAT / RECURSIVE INSET / SPIRAL REPEAT / MOSAIC CELLS |
| `kalCentreX` | CENTRE X | range | Kaleidoscope only; 0–1; G6 click-to-pick |
| `kalCentreY` | CENTRE Y | range | Kaleidoscope only; 0–1; G6 click-to-pick |
| `segmentCount` | SEGMENTS | range | Kaleidoscope only; 2–32, integer |
| `angularOffset` | ANGULAR OFFSET | range | Kaleidoscope only; 0–360°; driveable |
| `mirrorAltSegments` | MIRROR ALT | toggle | Kaleidoscope only |
| `radialScale` | RADIAL SCALE | range | Kaleidoscope only; driveable |
| `cellWidth` | CELL WIDTH | range | Mosaic only |
| `cellHeight` | CELL HEIGHT | range | Mosaic only |
| `cellTopology` | CELL TOPOLOGY | select | Mosaic only: GRID / HEX / VORONOI / STAGGERED |
| `cellSamplingMode` | CELL SAMPLING | select | Mosaic only |
| `cellContentMode` | CELL CONTENT | select | Mosaic only |

### Layer 3 — Per-Tile Transform
| Key | Label | Type | Notes |
|-----|-------|------|-------|
| `tileScale` | TILE SCALE | range | driveable |
| `tileRotation` | TILE ROTATION | range | 0–360°; driveable |
| `tileOffsetX` | TILE OFFSET X | range | Replaces/supplements current offsetX |
| `tileOffsetY` | TILE OFFSET Y | range | Replaces/supplements current offsetY |
| `flipMode` | FLIP MODE | select | NONE / ALTERNATE X / ALTERNATE Y / CHECKER / RADIAL PARITY |
| `transformJitter` | TRANSFORM JITTER | range | 0–1; driveable |
| `transformDriver` | TRANSFORM DRIVER | select | POSITION / TILE INDEX / ANGLE / DISTANCE / LUMINANCE / NOISE |

### Layer 4 — Combination Logic
| Key | Label | Type | Notes |
|-----|-------|------|-------|
| `combineMode` | COMBINE MODE | select | NORMAL / MULTIPLY / SCREEN / OVERLAY / DIFFERENCE / ADD / SUBTRACT / MIN / MAX; replaces `internalBlend` |
| `tileWeighting` | TILE WEIGHTING | select | UNIFORM / CENTRE-WEIGHTED / EDGE-WEIGHTED / DISTANCE-WEIGHTED / MASK-WEIGHTED |
| `overlapMode` | OVERLAP MODE | select | AVERAGE / ACCUMULATE / PRIORITY BY ORDER / PRIORITY BY BRIGHTNESS / PRIORITY BY DISTANCE TO CENTRE |

### Layer 5 — Output Mapping / Dynamics
| Key | Label | Type | Notes |
|-----|-------|------|-------|
| `outputMode` | OUTPUT MODE | select | COMPOSITE / MASK / DIFFERENCE FIELD / DISPLACEMENT SOURCE / COLOUR PARTITION / FEEDBACK SOURCE |
| `loopSpeed` | LOOP SPEED | range | driveable |
| `indexDriver` | INDEX DRIVER | select | tile index as driver source |
| `luminanceDriver` | LUMINANCE DRIVER | select | image luminance as driver source |
| `noiseDriver` | NOISE DRIVER | select | noise as driver source |

---

## Extra/Incorrect Parameters

| # | Param | Issue | Action |
|---|-------|-------|--------|
| E1 | `internalBlend` | Key is a deliberate deviation from reference `blendMode` to avoid NodePanel param collision — intentional, shim exists | Rename to `combineMode` when COMBINE MODE replaces it as part of Layer 4 upgrade; remove shim |
| E2 | `mix` is always visible regardless of `internalBlend` value | When MULTIPLY or DIFFERENCE selected, `mix` has no effect but remains visible | Apply G14 conditional visibility: hide `mix` when `combineMode ≠ CROSSFADE` (or `≠ NORMAL` in expanded mode) |
| E3 | `offsetX`/`offsetY` semantics conflated with TILE SIZE | Currently encoded as fractional global offset; review spec distinguishes TILE OFFSET (per-tile) from SOURCE REGION | After Layer 1/3 upgrade, rename and clarify: `offsetX`/`offsetY` → tile offset; source region uses `sourceX`/`sourceY` |

---

## UI Compliance Issues

| # | Issue | Relevant Guide | Action |
|---|-------|---------------|--------|
| U1 | `mix` visible when blendMode ≠ CROSSFADE — inapplicable control shown | G14; component-patterns.md | Implement conditional visibility: hide `mix` unless `combineMode = CROSSFADE` |
| U2 | Topology-conditional params (kaleidoscope, mosaic, per-tile transforms) must be hidden when topology not active | G14 | All Layer 2/3 topology-specific params must carry `when` conditions tied to `topology` value |
| U3 | `unit: 'n'` on `gamma` is ambiguous | text-treatment.md; G16 | Use `unit: 'γ'` or `unit: 'exp'`; confirm against text-treatment.md labelling standards |
| U4 | `unit: '0–1'` on `mix`, `offsetX`, `offsetY` is a range descriptor, not a unit | G16; text-treatment.md | Use `unit: 'norm'` or remove; confirm unit vocabulary against G16 standard |
| U5 | Canvas click-to-pick for KALEIDOSCOPE CENTRE X/Y absent | G6; semiotics.md | Add PICK CENTRE action; requires G6 shared CentrePointPicker component (G11) |
| U6 | New topology-specific params require tier assignment consistent with component-patterns.md §3 | component-patterns.md | Assign tiers: topology select = tier 3; kaleidoscope/mosaic params = tier 4; transform variation = tier 4; combination logic = tier 4; output mapping = tier 5 |

---

## Global Issues

| Issue | Applicability to TILEBLEND | Status |
|-------|---------------------------|--------|
| G1 — +D button non-functional | Affects all 5 driveable params (`frame`, `mix`, `offsetX`, `offsetY`, `exposure`, `gamma`) | OPEN — host system fix |
| G2 — All numeric params must have `driveable: true` | `frame`: present. `mix`, `offsetX`, `offsetY`, `exposure`, `gamma`: present. `sourceX`, `sourceY`, `sourceWidth`, `sourceHeight`, `sourceRotation`, `sourceScale`, `kalCentreX`, `kalCentreY`, `angularOffset`, `radialScale`, `tileScale`, `tileRotation`, `tileOffsetX`, `tileOffsetY`, `transformJitter`, `loopSpeed` when added: all must have `driveable: true` | PARTIAL — existing params compliant; new params must comply on addition |
| G5 — Slider direct input and double-click-to-default | Applies to all range params in this module | OPEN — host system fix |
| G6 — Canvas click-to-pick for centre params | Applies to `kalCentreX`/`kalCentreY` (not yet added) | OPEN — blocked by topology upgrade; requires shared CentrePointPicker (G11) |
| G7 — Vector module identifiability | Not applicable — pixel module | N/A |
| G9 — FRAME param for time-based modules | `frame` param added in live node — COMPLIANT | RESOLVED in live node |
| G10 — SVG export for vector modules | Not applicable — pixel module | N/A |
| G11 — Shared components for overlapping features | CentrePointPicker required for kaleidoscope centre (G6); do not inline | OPEN — build shared component before adding kaleidoscope |
| G12 — Web worker for expensive modules | TileBlendNode is O(w×h) cost class B — not a current bottleneck; no worker needed unless upgrade adds O(n²) topology modes | LOW RISK — monitor post-upgrade |
| G14 — Mode-conditional param visibility | `mix` must hide when `combineMode ≠ CROSSFADE`; all topology-conditional params must hide when their topology not active | OPEN |
| G16 — Unit labels on numeric params | `exposure` has `unit: 'EV'` — compliant. `frame` has `unit: 'frames'` — compliant. `mix`, `offsetX`, `offsetY` have `unit: '0–1'` — ambiguous, needs standardisation. `gamma` has `unit: 'n'` — ambiguous | PARTIAL |

---

## Merge Absorption

| Item | Source | Absorbed? |
|------|--------|-----------|
| `internalBlend` key rename from `blendMode` | Post-archive live edit | Yes — shim in `EffectNode.fromJSON()` handles deserialisation |
| `frame` param addition + phase offset in `apply()` | Post-archive live edit | Yes — correct per G9 |
| `unit` fields on `mix`, `offsetX`, `offsetY`, `gamma` | Post-archive live edit | Yes — correct per G16 |
| `driveable: true` on `frame` | Post-archive live edit | Yes — correct per G2 |

No conflicting changes. All post-archive modifications are additive and compliant.

---

## Required Changes (priority ordered)

### P0 — Prerequisites (host system; unblock before module changes)
1. **Fix G1:** Repair +D button event handler in NodePanel so driver settings open on click. All driveable params in this module are currently non-functional from the UI.
2. **Fix G5:** Add direct numeric input and double-click-to-default to slider component.
3. **Fix G14 infrastructure:** Implement conditional param visibility (`when` field) in NodePanel param renderer.

### P1 — Immediate / High
4. **G14 / U1:** Hide `mix` when `combineMode ≠ CROSSFADE`. This is achievable now within the existing param set and requires only a `when` condition on `mix`.
5. **G16 / U3–U4:** Standardise `unit` values: audit vocabulary against G16 standard; replace `'0–1'` with `'norm'` (or equivalent agreed unit label); replace `'n'` on gamma with `'γ'` or `'exp'`.
6. **Layer 1 — Source Region (Phase 1 of review spec):** Add `sourceMode`, `sourceX`, `sourceY`, `sourceWidth`, `sourceHeight`, `clampMode`. Implement source-region sampling in `tileBlend()` algorithm. This is the most impactful missing functional capability.

### P2 — High
7. **Layer 2 — Topology (Phase 2 of review spec):** Add `topology` select param. Implement GRID (current behaviour, default), MIRROR GRID, RADIAL KALEIDOSCOPE as first set. Add kaleidoscope params (`kalCentreX`, `kalCentreY`, `segmentCount`, `angularOffset`, `mirrorAltSegments`, `radialScale`) with `when: topology === 'RADIAL KALEIDOSCOPE'` visibility.
8. **Layer 3 — Tile size controls (Phase 3):** Add explicit `tileOffsetX`/`tileOffsetY` as tile-dimension controls distinct from source-region offset. Retain existing `offsetX`/`offsetY` or rename clearly.
9. **Layer 4 — Combination Logic:** Replace `internalBlend` + `mix` with `combineMode` (NORMAL / MULTIPLY / SCREEN / OVERLAY / DIFFERENCE / ADD / SUBTRACT / MIN / MAX). Add `tileWeighting` and `overlapMode`. Remove `fromJSON` migration shim once `internalBlend` is fully replaced.

### P3 — Moderate
10. **Layer 3 — Per-tile transforms (Phase 4):** Add `flipMode`, `tileScale`, `tileRotation`, `transformJitter`, `transformDriver`. Apply G14 `when` conditions for topology-specific params.
11. **G6 / U5:** Build shared CentrePointPicker component (G11 prerequisite), then wire to `kalCentreX`/`kalCentreY`. Do not inline.
12. **G2 / modulate wiring:** Once G1 is fixed, add `ctx` and `modulate` parameters to `apply()` and wire `getModulated()` calls for all driveable params. Update `tileBlend()` signature to accept per-pixel modulation or use pre-resolved arrays.

### P4 — Low / Deferred
13. **Layer 2 — Additional topologies (Phase 5–6):** STAGGERED GRID, MOSAIC CELLS (with full cell param set), RECURSIVE INSET, FEEDBACK SOURCE output mode.
14. **Layer 5 — Output Mapping:** Add `outputMode` select with MASK, DIFFERENCE FIELD, DISPLACEMENT SOURCE, COLOUR PARTITION, FEEDBACK SOURCE modes.
15. **Dynamics layer:** Add `loopSpeed`, `indexDriver`, `luminanceDriver`, `noiseDriver` params once topology infrastructure is in place.
16. **G12 — Worker audit:** After topology upgrade, assess whether any added mode (e.g. RECURSIVE INSET, MOSAIC CELLS with VORONOI topology) pushes cost class above B. Move to worker if so.

---

## Verification Criteria

| # | Criterion | Pass condition |
|---|-----------|----------------|
| V1 | `mix` hidden when `combineMode ≠ CROSSFADE` | Param row absent from NodePanel when MULTIPLY/DIFFERENCE/etc. selected |
| V2 | Source-region controls functional | Setting SOURCE MODE = CROP REGION and adjusting SOURCE X/Y/WIDTH/HEIGHT changes which portion of the image is tiled |
| V3 | TOPOLOGY = RADIAL KALEIDOSCOPE produces kaleidoscope output | Angular wedge repetition visible; SEGMENT COUNT changes wedge count; ANGULAR OFFSET rotates pattern |
| V4 | Kaleidoscope topology-conditional params hidden when TOPOLOGY ≠ RADIAL KALEIDOSCOPE | `kalCentreX`, `kalCentreY`, `segmentCount`, `angularOffset`, `mirrorAltSegments`, `radialScale` absent from panel |
| V5 | All new range params have `driveable: true` | NodePanel shows +D button on all numeric controls |
| V6 | All range params have valid, non-ambiguous `unit` field | Unit label displayed in NodePanel; no `'0–1'` or `'n'` values remain |
| V7 | `frame` param drives tile animation | Incrementing `frame` produces smooth positional drift in tiled output |
| V8 | `fromJSON` shim removed after `internalBlend` → `combineMode` migration | No reference to `internalBlend` in `EffectNode.fromJSON()` or `TileBlendNode.js` |
| V9 | `apply()` accepts `ctx` and resolves modulated params per-pixel when G1 resolved | With a driver connected, param value varies spatially across output |
| V10 | No inline `requestAnimationFrame`, `setInterval`, or DOM ops introduced | Code audit; linter passes |
| V11 | COMBINE MODE options (SCREEN, OVERLAY, ADD, SUBTRACT, MIN, MAX) produce correct composite output | Manual visual verification against standard compositing definitions |
| V12 | CentrePointPicker for kaleidoscope centre is a shared component, not inlined | Component exists in component library; consumed by reference, not copied |
