# BILATERAL — Build Guide

- module: bilateral
- node: BilateralFilterNode.js
- category: BLUR
- review verdict: KEEP
- rebuild severity: MAJOR

## Current State Summary

The current implementation is structurally correct: two params (`spatialSigma`, `rangeSigma`), correct factory pattern, correct `previewMax: 5` on `spatialSigma`, and `forceWorkerPreview: true` added vs reference. However, the module is entirely non-functional — render hangs or times out at any non-trivial `spatialSigma` due to O(n·r²) cost with no lookup-table mitigation in `bilateralFilter()`. The reference source does not have `forceWorkerPreview: true`; the current implementation adds it, which is the correct fix direction but insufficient alone — no lookup-table optimisation is present, and `driveable: true` on both params is a non-functional declaration because `modulate()` is never called in `apply()`.

## Reference Parity Gaps

1. **`modulate()` never called in `apply()`** — reference source and reference docs both confirm `driveable: true` is declared on `spatialSigma` and `rangeSigma`, but `apply()` reads both as scalars from `p` without calling `modulate(key, i)`. The `+D` button appears in the UI but per-pixel driving has no effect. This is a silent failure: driver connection produces no visible result change.
2. **No spatial Gaussian lookup table** — performance docs specify precomputing spatial weights for all `(dx, dy)` in the fixed kernel before the pixel loop as a standard mitigation. `bilateralFilter()` in `blur-filters.js` computes `Math.exp()` per neighbour per pixel. Not present in reference source either, but flagged as required fix in review2403 due to confirmed hang.
3. **No range Gaussian lookup table** — performance docs specify precomputing `exp(−rd / rSq2)` for all integer `rd ∈ [0, 3×255²]` (~195k entries). Not implemented. This eliminates the dominant `Math.exp()` cost per inner loop iteration.
4. **Preview cap weaker than `forceWorkerPreview` alone** — `forceWorkerPreview: true` defers to worker but does not prevent timeout. `previewMax: 5` is present but the combination does not guarantee render completes — at 1 MP, `spatialSigma: 5` still yields ~441 `exp()` per pixel, ~441M total calls. Worker timeout remains a risk without lookup tables.

## Review Spec Gaps

1. **[CRITICAL] Render hang not fixed** — review Action Item 1 requires: add worker timeout, `previewMax` radius cap, and/or approximate/optimised bilateral implementation. `forceWorkerPreview: true` is present in current implementation (not in reference source — this is an addition), but the underlying `bilateralFilter()` algorithm has no lookup-table optimisation. Module remains unusable at any non-trivial resolution or `spatialSigma`.
2. **`previewMax` on all cost-scaling params** — review Action Item 2 requires `previewMax` on all cost-scaling params. `rangeSigma` correctly has no `previewMax` (correct omission — no iteration cost). `spatialSigma` has `previewMax: 5` — this is present. Gap: the `previewMax` cap alone is insufficient to prevent hang (see §Reference Parity Gaps 4).
3. **`+D` driver button non-functional** — review Action Item 3 (global G1). Not fixed; tracked as global issue.
4. **`driveable: true` audit** — review Action Item 4 (global G2). Both params have `driveable: true` but the driver path is not wired — `apply()` does not call `modulate()`. The declaration is present but non-functional.

## Missing Parameters

None. Both specified params (`spatialSigma`, `rangeSigma`) are present with correct min/max/step/default values. No additional params are required by the review spec or reference docs.

| param name | type | min | max | step | default | notes |
|---|---|---|---|---|---|---|
| — | — | — | — | — | — | No missing params |

## Extra/Incorrect Parameters

| param name | issue |
|---|---|
| `spatialSigma` — `unit: 'σ'` | Current implementation adds `unit: 'σ'` (G16 compliance). Reference source does not have `unit` field. This is a correct forward addition per G16; not a defect. |
| `rangeSigma` — `unit: 'σ'` | Same as above — correct G16 addition; not a defect. |
| `forceWorkerPreview: true` | Added in current impl; absent from reference source. Correct direction (G12), but insufficient without algorithm optimisation. Not a defect — retain. |

## UI Compliance Issues

1. **Label glyph rendering** — `SPATIAL σ` and `RANGE σ` use a Unicode sigma character (σ). The site uses `'Atkinson Hyperlegible', 'Atkinson Hyperlegible Mono', monospace`. `ui-layout.md` explicitly flags: confirm UI font renders the σ glyph correctly. No action in the node file itself — verify via browser test that σ renders in the NodePanel param label.
2. **No raw hex/rgb/hsl colours** — pass. No colour declarations in node file.
3. **No inline DOM construction** — pass. Factory pattern; no DOM ops in node file.
4. **Registry entry correct** — `type: 'bilateral'`, `label: 'BILATERAL'`, `description: 'Edge-preserving blur that smooths flat regions while keeping boundaries'`, `category: 'BLUR'`. All correct per registry.js.
5. **Param labels UPPERCASE** — `'SPATIAL σ'` and `'RANGE σ'` — these are UPPERCASE per text-treatment.md §2 (sidebar parameter label: UPPERCASE). The σ character is a symbol, not a letter, so mixed-case rule does not apply. Compliant.
6. **No semiotics violations in node file** — pass. No glyph declarations in node file.
7. **No border-system violations in node file** — pass. No border declarations in node file.
8. **driveable UI mismatch** — `+D` button will render for both params (from `driveable: true`) but connecting a driver silently produces no effect. This is a UI compliance failure: the UI presents a functional affordance that is non-functional. Fix: either wire `modulate()` in `apply()` or remove `driveable: true` until the driver path is implemented.

## Global Issues

- **G1 — Driver (+D) button non-functional (ALL modules):** Action for bilateral: no module-specific fix required beyond the global NodePanel fix. However, once G1 is fixed, the bilateral `+D` button will still silently fail because `modulate()` is not called in `apply()`. Module-level action: wire `modulate()` calls in `apply()` for both `spatialSigma` and `rangeSigma` — or explicitly mark them `driveable: false` until wired.
- **G2 — All numeric params need `driveable: true`:** Both params have `driveable: true`. Declaration compliant. Functional wiring is absent (see G1 note above). No additional params to audit.
- **G5 — Slider direct input + double-click-to-default:** Both params are range-type sliders. This is a NodePanel/slider component fix, not a node file fix. No action in `BilateralFilterNode.js`. Applicable: both params need this behaviour once the component supports it.
- **G6 — Canvas pick for centre X/Y params:** Not applicable. Bilateral has no centre X/Y params.
- **G7 — Vector badge:** Not applicable. Bilateral is a pixel module (`isVector: false`).
- **G9 — FRAME param:** Not applicable. Bilateral has no time/iteration-based state.
- **G10 — SVG export:** Not applicable. Bilateral is a pixel module.
- **G11 — Shared components:** Applicable if the ColourRampControl or other shared components are eventually added. No shared components currently required by this module's param set.
- **G12 — Web Worker for expensive computation — CRITICAL for bilateral:** `forceWorkerPreview: true` is present; this defers preview rendering to the worker. Action required: (a) implement spatial and range Gaussian lookup tables in `bilateralFilter()` in `blur-filters.js` to reduce per-iteration cost from `Math.exp()` to array lookup; (b) confirm worker has a timeout guard that returns partial output rather than hanging; (c) consider reducing `spatialSigma` max from 20 to 10 to prevent class-D renders at full resolution. This is the primary reason rebuild severity is MAJOR.
- **G14 — Mode-conditional param visibility:** Not applicable. Bilateral has no MODE param; all params are always relevant.
- **G16 — Unit labels on numeric params:** Current implementation adds `unit: 'σ'` to both params. This satisfies G16 for both. Compliant.

## Merge Absorption

None.

## Required Changes (priority ordered)

1. **[CRITICAL] Implement lookup-table optimisation in `bilateralFilter()` (`blur-filters.js`):** Precompute the spatial Gaussian weights for all `(dx, dy)` in the kernel before the outer pixel loop. Precompute the range Gaussian lookup table as a `Float32Array` of length `Math.ceil(3 * 255 * 255) + 1`, indexed by integer `rd = (nr−cr)²+(ng−cg)²+(nb−cb)²`, precomputed as `exp(−rd / rSq2)`. Replace `Math.exp(-sd / sSq2 - rd / rSq2)` in the inner loop with `spatialLUT[dx+rad][dy+rad] * rangeLUT[rd]`. This eliminates all `Math.exp()` calls from the inner loop and is the minimum required fix to make the module functional.

2. **[CRITICAL] Confirm worker timeout guard exists in the render pipeline for `forceWorkerPreview: true` modules:** Verify that the render worker has a timeout mechanism that returns partial or aborted output rather than hanging the UI indefinitely. This is a pipeline-level fix (`Pipeline.js` or the worker controller), not in `BilateralFilterNode.js`. If no timeout exists, add one.

3. **[HIGH] Wire `modulate()` in `apply()` for `rangeSigma`:** `rangeSigma` can be modulated per-pixel safely because it only affects per-neighbour weight computation, not kernel radius. In `apply()`, replace `p.rangeSigma` with `this.getModulated('rangeSigma', i, ctx)` inside the pixel loop (where `i` is the pixel index). This activates the declared `driveable: true` for `rangeSigma`.

4. **[HIGH] Resolve `spatialSigma` driver wiring or remove `driveable: true`:** Per `ui-layout.md`, driving `spatialSigma` per-pixel is architecturally unsafe — kernel radius is computed once before the loop, so per-pixel variation is not achievable without restructuring. Two options: (a) remove `driveable: true` from `spatialSigma` to prevent the `+D` button appearing for a non-driveable param; (b) accept that spatial driving is not implemented and document it. Recommended: remove `driveable: true` from `spatialSigma` until a per-pixel-radius architecture is implemented. Keep `driveable: true` on `rangeSigma` once step 3 is done.

5. **[MEDIUM] Reduce `spatialSigma` max from 20 to 10:** At `spatialSigma: 20`, neighbourhood is 6,561 pixels — class D at any resolution even with lookup tables. Reducing max to 10 (neighbourhood 441) keeps the module in class B–C territory and prevents user-initiated hangs. Update `max: 20` to `max: 10` in the param definition. If the original 0–20 range is intentionally retained, add a visible warning in the UI via a `title` attribute on the slider for values > 10.

6. **[MEDIUM] Verify σ glyph renders correctly in NodePanel param labels:** Browser-test that `'SPATIAL σ'` and `'RANGE σ'` render correctly in the Atkinson Hyperlegible / Atkinson Hyperlegible Mono font stack. If σ does not render, replace with the ASCII string `SPATIAL SIG` / `RANGE SIG` or use `\u03C3` explicitly and confirm the font includes the glyph.

7. **[LOW] Confirm `unit: 'σ'` is consumed by NodePanel slider component:** The `unit` field on param defs must be read and rendered by the NodePanel. Verify the NodePanel slider row reads `paramDef.unit` and appends it to the value display (e.g. `5 σ`). If the NodePanel does not consume `unit`, the G16 compliance is in the param definition only — the UI will not display units. This is a NodePanel component fix if not already implemented.

## Verification Criteria

1. **Lookup-table fix verified:** At `spatialSigma: 10`, `rangeSigma: 30`, a 1 MP image renders in the worker in < 500ms without timeout. No `Math.exp()` calls occur in the inner loop (verify via profiler or code inspection of `blur-filters.js`).
2. **Worker timeout verified:** Artificially set `spatialSigma: 20` (if max is retained) and trigger a preview render. The worker returns (with partial output or error state) within the configured timeout rather than hanging the main thread indefinitely.
3. **`rangeSigma` driver wiring verified:** Connect an image driver to `rangeSigma` via `+D` (after G1 NodePanel fix). Apply a gradient driver image. Confirm that output pixels vary spatially in their colour-gate permissiveness — flat regions near bright driver areas blur more aggressively than regions near dark driver areas.
4. **`spatialSigma` driveable status verified:** After removing `driveable: true` from `spatialSigma`, confirm that no `+D` button appears on the `SPATIAL σ` param row in the NodePanel.
5. **`spatialSigma` max verified:** If reduced to 10, confirm the slider clamps at 10. If retained at 20, confirm a warning or `title` attribute is present on values > 10.
6. **σ glyph rendering verified:** In-browser visual check: NodePanel param labels display `SPATIAL σ` and `RANGE σ` with the σ character rendered (not as a missing glyph box or substituted character).
7. **`unit` field verified:** NodePanel slider rows for both params display the unit suffix `σ` adjacent to the numeric value (e.g. `5 σ`, `30 σ`).
8. **Registry entry verified:** `type: 'bilateral'`, `label: 'BILATERAL'`, `category: 'BLUR'` — confirm against `registry.js` (currently correct; re-verify after any registry changes).
9. **No raw colours verified:** `BilateralFilterNode.js` contains no hex/rgb/hsl literals — confirmed by reading file. Re-verify after any edits.
10. **Alpha pass-through verified:** Apply bilateral filter to an image with partial transparency. Confirm alpha channel is unchanged in output (`dst[ci+3] === src[ci+3]` for all pixels) — this is in `bilateralFilter()` in `blur-filters.js`, not in the node file itself, but must hold after any algorithm changes.
