# PIXELATE — Build Guide

- module: pixelate
- node: PixelateNode.js
- category: DISTORTION
- review verdict: KEEP
- rebuild severity: MINOR

---

## Current State Summary

Implementation is a factory-pattern node (`createEffectModule`) with one param (`blockSize`). Algorithm is correctly delegated to `pixelate()` in `shared/algorithms/geometry/distortion.js`. Module is functionally complete and cost class A at all resolutions. The live source is byte-for-byte identical to the reference archive source — no drift. Only defects are: (1) `driveable: true` declared on `blockSize` but `apply()` has no `modulate` parameter, making per-pixel driving non-functional; (2) the `+D` driver button is globally broken (G1); (3) unit display absent from the NodePanel slider (G16); (4) direct numeric input and double-click-to-default absent from slider (G5). No architectural violations. No extra or missing params relative to reference.

---

## Reference Parity Gaps

| # | Feature | Reference | Live | Status |
|---|---------|-----------|------|--------|
| 1 | Block-average tile algorithm | `pixelate()` in `distortion.js` | same | PASS |
| 2 | `blockSize` range 2–100, step 1, default 8, label `BLOCK SIZE`, tier 3, unit px | declared | identical | PASS |
| 3 | `previewMax: 20` on `blockSize` | declared | present | PASS |
| 4 | Alpha pass-through (not averaged) | `distortion.js` | confirmed | PASS |
| 5 | No `modulate` parameter in `apply()` | not wired | not wired | PASS (matches reference) |
| 6 | `driveable: true` on `blockSize` | declared | declared | PARTIAL — declared, non-functional in both reference and live; driver infrastructure absent |
| 7 | No presets | absent | absent | PASS |

**Conclusion:** Zero functional divergence from reference. Reference itself flags the `driveable`/`modulate` mismatch as a known defect.

---

## Review Spec Gaps

From `pixelate_review2403.md`:

| Item | Verdict | Gap |
|------|---------|-----|
| Module functional | KEEP | No gap |
| G1 — +D button non-functional | Global | Not fixed; tracked globally |
| G2 — all numeric params must have `driveable: true` | Global | `blockSize` already has `driveable: true`; satisfied for this module |
| G5 — slider direct input + double-click-to-default | Global | Not implemented; tracked globally |

Review is fast-tracked. No module-specific issues beyond the three global action items above.

---

## Missing Parameters

None. The reference specifies exactly one param (`blockSize`). Live implementation matches.

---

## Extra/Incorrect Parameters

None. No params present in the live node that are absent from the reference spec.

---

## UI Compliance Issues

### G1 — Driver (+D) Button Non-Functional
`blockSize` carries `driveable: true`. The NodePanel renders a `+D` button. Clicking it produces no response — driver settings panel does not open. Tracked in `_global_issues.md` G1. Not specific to this module.

### G2 — Driveable Declaration vs. Wiring
`driveable: true` is declared on `blockSize` but `apply(src, dst, w, h, p)` accepts no `modulate` argument. Per-pixel driving is additionally architecturally unsafe for this param: `blockSize` is the tile-stride loop variable; it cannot vary per pixel within a single tile iteration without restructuring the algorithm. The `+D` button therefore appears but has no per-pixel effect regardless of G1 fix. Resolution options:
- **Option A (minimal):** Remove `driveable: true` from `blockSize` — honest representation of capability.
- **Option B (wired but constrained):** Accept `modulate` in `apply()`; resolve `blockSize` once per frame as `getModulated('blockSize', 0, ctx)` (pixel 0 = frame-level scalar, not per-pixel). Preserves driver slot for expression/frame-based driving without per-pixel modulation. Architecturally safe.
- **Option C (deferred):** Leave as-is; document the limitation. Address when driver infrastructure is fixed (G1).

Recommendation: Option B — enables frame-level expression driving without algorithm restructuring; consistent with how other single-scalar params handle modulation.

### G5 — Slider Direct Input + Double-Click-to-Default
Slider for `blockSize` lacks direct typed numeric entry and double-click-to-default. Global issue; fix is in the NodePanel slider component, not in this module.

### G16 — Unit Display
`blockSize` declares `unit: 'px'`. Unit must be rendered adjacent to the value readout in the NodePanel slider. Currently absent. Global fix required in NodePanel/NumericInput component.

---

## Global Issues

Applicability matrix for this module:

| Issue | Applies | Reason |
|-------|---------|--------|
| G1 — +D button non-functional | YES | `blockSize` has `driveable: true`; button appears but does nothing |
| G2 — all numeric params must have `driveable: true` | YES (satisfied) | `blockSize` already carries `driveable: true`; no addition needed |
| G5 — slider direct input + double-click-to-default | YES | `blockSize` is a range param |
| G6 — canvas click-to-pick for centre params | NO | No centre X/Y params |
| G7 — vector module identifiability | NO | Not a vector module |
| G9 — time-based modules must expose FRAME param | NO | Not time-based; no iteration state |
| G10 — vector modules must include SVG export | NO | Not a vector module |
| G11 — shared components for overlapping features | NO | No added features sharing a pattern; no action required |
| G12 — web worker usage | NO | Cost class A; already fast; no worker required |
| G14 — mode-conditional param visibility | NO | No mode/type dropdown |
| G16 — unit display on slider inputs | YES | `blockSize` declares `unit: 'px'`; must be rendered |

---

## Merge Absorption

No merge targets. Module is a minimal single-param factory node. No candidates for consolidation exist in DISTORTION category at this scope. Ref note from `migration-log.md`: PLAN2403 Phase 6 full pack rewrite cross-check is satisfied — live source matches reference archive.

---

## Required Changes (priority ordered)

### P1 — Resolve `driveable`/`modulate` mismatch (MODERATE severity, module-level)
**File:** `assets/js/tools/processors/distort/nodes/distortion/PixelateNode.js`
**Action:** If Option B is adopted — update `apply()` to `apply(src, dst, w, h, p, modulate, ctx)` and resolve `blockSize` as `Math.round(modulate ? this.getModulated('blockSize', 0, ctx) : p.blockSize)`. This is a frame-level scalar resolution, not per-pixel. No algorithm restructuring required.
**Condition:** Implement only after G1 is fixed so per-frame driver behaviour can be verified.

### P2 — Fix +D driver button (GLOBAL — G1)
**File:** NodePanel.js — `+D` button event handler
**Action:** Investigate and repair the driver settings panel open event. Not scoped to this module.

### P3 — Slider unit display (GLOBAL — G16)
**File:** NodePanel.js / NumericInput component
**Action:** Render `unit` field from param definition adjacent to value readout. `blockSize` already declares `unit: 'px'` — no change to this module's source required.

### P4 — Slider direct input + double-click-to-default (GLOBAL — G5)
**File:** NodePanel.js / NumericInput component
**Action:** Implement typed value entry and double-click reset on all slider rows. Not scoped to this module.

---

## Verification Criteria

1. `pixelate()` algorithm produces correct block-average output: a 4×4 image with `blockSize: 2` produces four 2×2 uniform-colour tiles each equal to the mean of the four source pixels in that tile.
2. Alpha channel is copied from source unmodified (not averaged).
3. `blockSize: 100` on a 200×200 image produces exactly 4 uniform tiles (ceil(200/100) × ceil(200/100)).
4. Preview mode caps `blockSize` at 20 regardless of param value (verify via `previewMax` factory resolution).
5. If P1 (Option B) is implemented: connecting a frame-expression driver to `blockSize` produces visually distinct block sizes per expression output value; per-pixel variation of `blockSize` is not claimed.
6. After G1 fix: clicking `+D` on `blockSize` opens the driver settings panel without error.
7. After G16 fix: the value readout in the NodePanel for `blockSize` displays `px` unit suffix.
8. After G5 fix: clicking the `blockSize` value field allows typed entry; double-click resets to `8`.
9. No `document.*`, `window.*`, `requestAnimationFrame`, `setInterval`, or raw colour values introduced in any change to this module.
10. Module remains registered in `registry.js` under `DISTORTION` with type `'pixelate'`, label `'PIXELATE'`.
