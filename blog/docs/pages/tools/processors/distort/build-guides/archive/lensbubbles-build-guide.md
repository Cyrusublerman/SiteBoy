# LENSBUBBLES — Build Guide

- module: lensbubbles
- node: LensBubblesNode.js
- category: REFRACTION
- review verdict: KEEP
- rebuild severity: MODERATE

---

## Current State Summary

Factory-pattern module via `createEffectModule`. 20 lines. Correct type string, category, and `apply()` signature. Algorithm (`lensBubbles`) is fully delegated to `shared/algorithms/geometry/warp.js`. Preview quality reduction via `ctx.quality` interp switch is implemented. Module is registered correctly in `registry.js` under `REFRACTION` and participates in the DROWNED preset (count:8, magnification:2, edgeSoft:0.3 — verified in PRESETS).

Core algorithm is correct and functionally complete relative to legacy spec. The module is structurally clean: no forbidden DOM calls, no raw RAF/setInterval, no network access.

Primary defects: (1) driver wiring declared but non-functional; (2) no `previewMax` on `count`; (3) four review-required params absent (SEED, OFFSET X, OFFSET Y, NOISE SCALE); (4) `driveable: true` absent on `count`, `minRadius`, `maxRadius`, `edgeSoft`; (5) no cross-param guard for `minRadius < maxRadius`; (6) `unit` field absent from reference source — live source adds it, which is correct but must be complete across all params.

---

## Reference Parity Gaps

Comparing live source (`LensBubblesNode.js`) against reference archive (`reference/distort/lensbubbles/source/LensBubblesNode.js`):

| Gap | Detail |
|-----|--------|
| `driveable: true` on `count`, `minRadius`, `maxRadius`, `edgeSoft` | Reference has only `magnification` as driveable. Live source adds `driveable: true` to all five params. This is correct per G2 — but `apply()` has no `modulate` call for any of them, so all five are declared-but-non-functional. |
| `unit` field on all params | Live source adds `unit` fields ('n', '0–1'). Reference archive has none. Live change is forward-correct per G16. |
| No other functional divergence | Algorithm call, RNG seeding, interp switch, and param schema are identical between live and reference. |

The live source is strictly a superset of the reference. No regression from reference to live.

---

## Review Spec Gaps

From `lensbubbles_review2403.md`, Action Items 1–3 are unimplemented in the live source:

| Action | Status | Detail |
|--------|--------|--------|
| 1. Add SEED param (integer) | Missing | No `seed` param exists. RNG seeded only from `ctx.nodeSeed`. No user-facing seed control. |
| 2. Add OFFSET X and OFFSET Y params (sliders, px) | Missing | No `offsetX` / `offsetY` params. Bubble field translation is not exposed. |
| 3. Add NOISE SCALE param (slider) | Missing | No `noiseScale` param. Bubble position distribution density is not controllable. |
| 4. Fix +D driver button (G1) | Out of scope for this module — tracked globally. |
| 5. Audit all params for `driveable: true` | Partially done — all five params have `driveable: true` in live source, but `modulate` is absent from `apply()`. Flag is present; wiring is absent. |
| 6. Slider direct input + double-click-to-default (G5) | Out of scope for this module — tracked globally. |

---

## Missing Parameters

| Key | Label | Type | Min | Max | Step | Default | Tier | Driveable | Rationale |
|-----|-------|------|-----|-----|------|---------|------|-----------|-----------|
| `seed` | `SEED` | integer | 0 | 9999 | 1 | 0 | 3 | false | User-facing seed for bubble position RNG. Currently only `ctx.nodeSeed` seeds the RNG — no explicit per-param seed. Exposes reproducible variation without relying on node identity. |
| `offsetX` | `OFFSET X` | range | -1 | 1 | 0.01 | 0 | 4 | true | Translates bubble field horizontally (as fraction of width). Required per review Action Item 2. |
| `offsetY` | `OFFSET Y` | range | -1 | 1 | 0.01 | 0 | 4 | true | Translates bubble field vertically (as fraction of height). Required per review Action Item 2. |
| `noiseScale` | `NOISE SCALE` | range | 0.1 | 10 | 0.1 | 1 | 4 | true | Controls bubble position distribution density. Required per review Action Item 3. |

**Note on SEED param integration:** `apply()` must combine `p.seed` with `ctx.nodeSeed` (e.g. `new SeededRNG((ctx?.nodeSeed ?? 42) ^ p.seed)` or additive) to preserve per-node uniqueness while enabling user variation.

**Note on OFFSET/NOISE SCALE integration:** `lensBubbles` in `warp.js` must accept `offsetX`, `offsetY`, `noiseScale` arguments and apply them to bubble position generation. This requires a coordinated change to the shared algorithm.

---

## Extra/Incorrect Parameters

None. All five existing params (`count`, `magnification`, `minRadius`, `maxRadius`, `edgeSoft`) match the reference spec in label, range, step, default, tier, and unit. No spurious params present.

The `unit` field additions in the live source ('n' for count/magnification, '0–1' for minRadius/maxRadius/edgeSoft) are forward-correct per G16 and should be retained. However, `unit: 'n'` is ambiguous for `count` (dimensionless integer) and `magnification` (factor). Preferred units: `count` → `'n'`, `magnification` → `'×'`, `minRadius`/`maxRadius` → `'diag'` or `'0–1'`, `edgeSoft` → `'0–1'`.

---

## UI Compliance Issues

| Issue | Source |
|-------|--------|
| All five `driveable: true` params have no wired `modulate` in `apply()`. +D button appears but connecting a driver has no effect. Silent failure for all five params. | feature-parity.md; issues-and-conflicts.md |
| No `previewMax` on `count`. At `count: 30` + large resolution, preview enters class C/D (100–300 ms+). No mechanism to cap bubble count during preview. Recommended: `previewMax: 10`. | performance.md; feature-parity.md |
| No cross-param validation: `minRadius > maxRadius` is a legal but degenerate configuration. No guard in `apply()` or algorithm. Silent failure (undefined behaviour in radius range generation). | issues-and-conflicts.md |
| `unit: 'n'` on `magnification` is ambiguous. Should be `'×'` to indicate a multiplicative factor, consistent with text-treatment standards for ratio quantities. | G16 |

---

## Global Issues

| Issue | Applicability | Required Action |
|-------|--------------|-----------------|
| **G1** — +D button non-functional | Applies. `magnification` (and all other driveable params) show the +D button but do nothing. | Fix NodePanel driver event handler globally. |
| **G2** — All numeric params must have `driveable: true` | Partially resolved. Live source has `driveable: true` on all five params. `apply()` modulate wiring still absent. | Wire `modulate` in `apply()` for all driveable params after G1 is resolved. |
| **G5** — Slider direct input + double-click-to-default | Applies to all five params. | Implement in slider component globally. |
| **G6** — Canvas click-to-pick for centre point params | Does not apply directly — LENSBUBBLES has no single centre point. Bubble field has an offset (OFFSET X/Y from review spec), for which click-to-pick may be applicable once those params are added. | Defer until OFFSET X/Y params are added; then assess fit with G6 shared component (CentrePointPicker). |
| **G7** — Vector module identifier | Does not apply. LENSBUBBLES is a pixel module (isVector: false). | None. |
| **G9** — Time/iteration-based modules must expose FRAME | Does not apply. LENSBUBBLES has no time/iteration state. Bubble positions are deterministic from seed, not a frame counter. | None. |
| **G10** — Vector modules must expose SVG export | Does not apply. Pixel module. | None. |
| **G11** — Overlapping features must use shared components | Applies. OFFSET X/Y params share the CentrePointPicker pattern (G6, G11). SEED param shares the NoiseSourceControl pattern. These must be built as shared components before per-module implementation. | Build shared components first; consume in this module. |
| **G12** — Web worker usage for expensive modules | Partially applies. At `count: 30` and 4 MP the module enters class D (>400 ms). `lensBubbles()` is a pure function with no shared state — fully viable for worker offload. | Confirm `apply()` runs in render worker. If not, move pixel processing to worker. Add `previewMax: 10` on `count` as near-term mitigation. |
| **G14** — Mode-conditional param visibility | Does not apply. No mode/type dropdown in this module. | None. |
| **G16** — Numeric inputs must display units | Applies. `unit` field is present on all five params in the live source. NodePanel must render units. `magnification` unit should be corrected to `'×'`. | Confirm NodePanel renders `unit`; correct `magnification` unit string. |

---

## Merge Absorption

The DROWNED preset in `registry.js` (line 229–236) references `lensbubbles` with params `{count:8, minRadius:0.04, maxRadius:0.15, magnification:2, edgeSoft:0.3}`. This is consistent with the legacy doc (`DROWNED — 8 bubbles, magnification 2, edgeSoft 0.3`). No merge conflict.

When new params (SEED, OFFSET X, OFFSET Y, NOISE SCALE) are added, the DROWNED preset must be updated with sensible defaults for those keys (e.g. `seed:0, offsetX:0, offsetY:0, noiseScale:1`) to prevent undefined param reads.

---

## Required Changes (priority ordered)

### P1 — Critical correctness

1. **Wire `modulate` for all driveable params in `apply()`.**
   All five params declare `driveable: true` but `apply()` reads only scalar values from `p`. After G1 is fixed, `apply()` must call `this.getModulated(key, pixelIdx, ctx)` per pixel for each driveable param. For per-pixel magnification, this requires restructuring the `lensBubbles` call to accept a per-pixel modulation function or pre-resolved per-pixel array. Coordinate with the shared algorithm.

2. **Add `previewMax: 10` to `count` param.**
   Caps bubble count in preview at 10, reducing worst-case preview cost from class D to class B. One-line change in the param definition.

3. **Add `minRadius < maxRadius` guard in `apply()`.**
   Before calling `lensBubbles`, assert `p.maxRadius >= p.minRadius`; if not, clamp `maxRadius = Math.max(p.minRadius, p.maxRadius)`. Prevents silent degenerate behaviour.

### P2 — Review spec compliance

4. **Add SEED param (integer, tier 3).**
   Expose user-facing seed. Combine with `ctx.nodeSeed` in `apply()` when constructing `SeededRNG`. Update DROWNED preset with `seed: 0`.

5. **Add OFFSET X and OFFSET Y params (range, tier 4, driveable: true).**
   Pass as arguments to `lensBubbles` (requires algorithm update in `warp.js`). Update DROWNED preset.

6. **Add NOISE SCALE param (range, tier 4, driveable: true).**
   Pass as argument to `lensBubbles` (requires algorithm update in `warp.js`). Update DROWNED preset.

### P3 — Standards compliance

7. **Correct `unit` on `magnification` from `'n'` to `'×'`.**
   Multiplicative factor quantities must use `'×'`, not the dimensionless `'n'`.

8. **Confirm `apply()` executes in render worker.**
   Per G12, verify the pipeline runs `apply()` off the main thread. If not, coordinate the move. No change to node file required if pipeline already handles this.

9. **Update DROWNED preset with new param defaults.**
   Once P2 params are added, add `seed:0, offsetX:0, offsetY:0, noiseScale:1` to the DROWNED preset node entry in `registry.js`.

### P4 — Shared component dependency (deferred pending G11 work)

10. **Use CentrePointPicker for OFFSET X/Y once built (G11).**
    OFFSET X/Y params will benefit from a canvas click-to-pick interaction (G6). Do not implement a custom picker — wait for the shared `CentrePointPicker` component (G11), then wire it to `offsetX`/`offsetY`.

11. **Use NoiseSourceControl for SEED/NOISE SCALE once built (G11).**
    If a shared `NoiseSourceControl` component is defined (G11), consume it here rather than bare slider params.

---

## Verification Criteria

1. `count: 30` preview renders at class A–B (< 50 ms at 1 MP). Confirmed by adding `previewMax: 10`.
2. `minRadius: 0.15, maxRadius: 0.05` (inverted) produces no crash or silent degenerate output — guard clamps to `maxRadius = 0.15`.
3. SEED param: changing `seed` value changes bubble positions; `seed: 0` reproduces the same layout as the previous default (ctx.nodeSeed-only) arrangement at the same node seed.
4. OFFSET X/Y: setting `offsetX: 0.5` shifts the entire bubble field 50% of image width to the right.
5. NOISE SCALE: increasing `noiseScale` spreads bubble positions more uniformly; decreasing clusters them.
6. `magnification` unit renders as `×` in the NodePanel slider, not `n`.
7. DROWNED preset loads without error with all new params present and defaults applied.
8. All five driveable params respond to a connected image driver after G1 is resolved (per-pixel magnification, count, minRadius, maxRadius, edgeSoft vary per pixel).
9. Module passes all existing structural checks: no `document.*`, no RAF, no setInterval, algorithm fully delegated to `warp.js`.
