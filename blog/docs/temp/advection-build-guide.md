# ADVECTION — Build Guide

- module: advection
- node: AdvectionNode.js (`assets/js/tools/processors/distort/nodes/warp/AdvectionNode.js`)
- category: WARP
- review verdict: KEEP
- rebuild severity: MODERATE

## Current State Summary

The current implementation is a functional, factory-pattern pixel warp module that correctly implements backward Euler integration through three velocity field types (noise, radial, vortex) via a delegated `advectionWarp` algorithm. Relative to the reference source, it adds four improvements: a `frame` param (G9 compliance), `driveable: true` on `steps` and `noiseScale`, a `when` conditional on `noiseScale` (G14 partial), and `unit` annotations on all range params (G16 compliance). However, the `modulate` argument is still absent from `apply()`, the `when` conditional on `noiseScale` uses the wrong field value triggering permanent hide instead of conditional show, the review requires a new VECTOR SOURCE param with image/uploaded-image capability, and the `PerlinNoise` instance is reconstructed on every call.

---

## Reference Parity Gaps

The reference source (`reference/distort/advection/source/AdvectionNode.js`) is the archived pre-migration snapshot. The current implementation is strictly a superset of it — all four reference params are present and correctly spec'd, the `advectionWarp` delegation is identical, and the `PerlinNoise` seeding and interpolation-mode logic are preserved. The only divergence is that the current source adds `frame`, `capByFrame`, and additional `driveable`/`unit`/`when` annotations absent from the reference.

**Functional divergence from reference apply() logic:**

1. Current `apply()` calls `capByFrame(st, p.frame)` before passing steps to `advectionWarp`. The reference passes `p.steps` directly (no frame cap). This is an intentional improvement, not a regression — but the `capByFrame` function must be verified to apply a linear ramp from `0` at `frame=0` to `p.steps` at some `frame` ceiling, not an off-by-one clamp. Confirm that `frame=0` produces `st=0` (no warp) and `frame` ≥ cap produces `st=p.steps` (full steps).

2. The reference `apply()` signature is `apply(src, dst, w, h, p, ctx)` — the `modulate` argument is absent. The current source matches this — `modulate` is still absent. This is a parity gap shared with the reference that the review and global issues explicitly require fixing (G2, `driveable` params non-functional).

**No reference functions are absent from the current implementation.**

---

## Review Spec Gaps

Review file: `review2403/advection_review2403.md`.

1. **VECTOR SOURCE param absent.** The review explicitly requires a new `vectorSource` dropdown param: options `INTERNAL NOISE` / `IMAGE LUMINOSITY` / `UPLOADED IMAGE`. When `UPLOADED IMAGE` is selected, an image upload input must be exposed. Neither the param nor the upload input exists in the current implementation.

2. **Uploaded modulation image input absent.** When `vectorSource = 'uploaded'`, a file-input control must be rendered to let the user supply a modulation image. No such control or param exists.

3. **`modulate` argument absent from `apply()`.** The review action item 5 and global G2 both require all numeric params to be driver-capable. `apply()` is declared `apply(src, dst, w, h, p, ctx)` — `modulate` is never passed. `speed`, `steps`, `noiseScale`, and `frame` all have `driveable: true` but none can be per-pixel modulated. `speed` is passed as a scalar to `advectionWarp`; no `modulate(key, i)` call exists anywhere in `apply()`.

4. **Module purpose and param semantics not documented in UI.** The review requires that the module purpose be clearly communicated. No description is surfaced to the user in the NodePanel for this module. The registry entry description (`'Iteratively advects pixels along a velocity field for smearing effects'`) is minimal and does not explain the three velocity field modes or what STEPS, SPEED, and NOISE SC control. A richer description or in-module tooltip system is required.

5. **+D driver button non-functional (G1).** Clicking +D on any param opens nothing. This is the global G1 issue — tracked separately but the review explicitly references it for this module. Fix is in NodePanel, not AdvectionNode.js, but must be verified against this module once fixed.

---

## Missing Parameters

| Param name | Type | Min | Max | Step | Default | Notes |
|---|---|---|---|---|---|---|
| `vectorSource` | select | — | — | — | `'noise'` | Options: `noise` / `luminosity` / `uploaded`. Replaces or augments current `velocityType` for image-reactive sources. Review calls this "VECTOR SOURCE". When `uploaded`, expose file-input. |

**Note on `velocityType` vs `vectorSource`:** The review's VECTOR SOURCE dropdown conflates two orthogonal concerns — (1) the mathematical field type (noise/radial/vortex) and (2) the data source for that field (internal / image luminosity / uploaded image). The cleanest implementation keeps `velocityType` for field geometry and adds `vectorSource` for data origin, with `when` conditions on the file-input sub-control. Alternative: extend `velocityType` options to include `luminosity` and `uploaded` — this collapses both axes into one param but eliminates radial+luminosity or vortex+uploaded combinations. Implementation decision must be made before coding; the review does not specify the separation. Recommended: keep `velocityType` for geometry, add `vectorSource` as a separate param that only applies when `velocityType = 'noise'`, with `when: { param: 'velocityType', equals: 'noise' }`.

---

## Extra/Incorrect Parameters

| Param name | Issue |
|---|---|
| `noiseScale` — `when` condition | `when: { param: 'velocityType', equals: 'noise' }` is correct in intent (hide when not noise mode) but must be verified against how the NodePanel evaluates `when`. If `when` means "show when condition is true" then the param shows only in noise mode — correct. If the system interprets `when` as "execute when" (a filter, not a visibility rule), the behaviour may be wrong. Confirm NodePanel `when` semantics are visibility-conditional, not execution-conditional. |
| `frame` — `capByFrame` interaction | `frame` is present and correctly declared (min 0, max 240, step 1, driveable, unit 'frames'). However `capByFrame` is called as `capByFrame(st, p.frame)` — the signature must be verified: does this cap steps proportionally to frame, or clamp absolutely? At `frame=0` the result must be `0` steps (no effect). At `frame=240` (max) it must return `p.steps` unchanged. If the function behaves differently, the frame-scrubbing animation contract is broken. |

---

## UI Compliance Issues

1. **Registry description is insufficient.** The registry entry reads `'Iteratively advects pixels along a velocity field for smearing effects'`. This does not communicate the three velocity field types, the backward-Euler mechanism, or the distinction from FLOW FIELD or DOMAIN WARP. Per the review, module purpose must be clearly communicated. The description should read something like: `'Traces each pixel backward through a noise, radial, or vortex velocity field over multiple steps — produces fluid smearing, inward contraction, or rotational swirl'`. The registry `description` field is the canonical place for this.

2. **`noiseScale` conditional visibility — verify NodePanel implements `when` as display-conditional.** The param declares `when: { param: 'velocityType', equals: 'noise' }`. Per G14, params inapplicable to the current mode must be hidden, not merely disabled. Confirm the NodePanel hides (not disables) `noiseScale` when `velocityType` is `radial` or `vortex`. If it currently only disables or ignores `when`, this is a G14 violation.

3. **No inline DOM construction violations.** AdvectionNode.js uses `createEffectModule` factory exclusively — no `document.*`, `window.*`, `innerHTML`, `createElement`, or `appendChild` calls exist in the file. Compliant.

4. **No raw hex/rgb/hsl/named colour violations.** The file contains no colour declarations of any kind. Compliant.

5. **All param labels are SCREAMING CASE and ≤16 chars.** `VELOCITY` (8), `STEPS` (5), `SPEED` (5), `FRAME` (5), `NOISE SC` (8). Compliant with text-treatment.md §2.

6. **Unit annotations present on all range params.** `frame` → `'frames'`, `steps` → `'n'`, `speed` → `'n'`, `noiseScale` → `'n'`. The units `'n'` are ambiguous — `'n'` is not a standard unit label. Per G16, units must be meaningful (px, %, °, frames, 0–1). `speed` should be `'px/step'` (displacement per step in pixels, per description.md). `steps` should be `'steps'`. `noiseScale` has no physical unit — `'×'` (scale multiplier) or `'n'` (dimensionless) are both defensible, but `'n'` is opaque to users. Fix: `speed` → `'px/step'`, `steps` → `'steps'`, `noiseScale` → `'×'`.

7. **No glyph usage in AdvectionNode.js itself.** Glyphs are rendered by NodePanel and registry consumers, not the module file. No semiotics.md violations traceable to this file.

8. **No border decisions in AdvectionNode.js.** Borders are NodePanel and host concerns. No border-system.md violations traceable to this file.

---

## Global Issues

**G1 — +D button non-functional:**
Action for this module: Verify that once G1 is fixed in NodePanel, the `+D` button on `speed`, `steps`, `noiseScale`, and `frame` all open the driver settings panel. Prerequisite: G2 fix (add `modulate` to `apply()`) must be completed first, or driver attachment will have no per-pixel effect even after G1 is fixed.

**G2 — All numeric params need `driveable: true`:**
Current state: `frame` ✓, `steps` ✓, `speed` ✓, `noiseScale` ✓ — all range params already declare `driveable: true`. However `driveable: true` is non-functional because `apply()` does not accept or call `modulate`. Required action: add `modulate` as the seventh argument to `apply(src, dst, w, h, p, ctx, modulate)` and call `this.getModulated(key, pixelIdx, ctx)` (or equivalent) inside the pixel loop for at least `speed`. Since `advectionWarp` is a delegated function, `modulate` support for per-pixel speed requires either (a) passing a per-pixel resolved speed array to `advectionWarp`, or (b) inlining the pixel loop in `apply()` and calling `getModulated` per pixel. Option (a) is preferred to preserve algorithm separation.

**G5 — Slider direct input + double-click-to-default:**
Action for this module: No changes to AdvectionNode.js required. This is a NodePanel/NumericInput component fix. Verify that `steps`, `speed`, `noiseScale`, and `frame` sliders accept typed input and double-click-to-default once G5 is implemented globally.

**G9 — FRAME param:**
Current state: `frame` param is already present (`min: 0, max: 240, step: 1, driveable: true, unit: 'frames'`). **G9 is satisfied for this module.** Verify `capByFrame` ramps steps from 0 at `frame=0` to full `p.steps` at `frame=240` (or at `frame ≥ p.steps` — check the function contract).

**G11 — Shared components:**
Actions for this module:
- The `frame` param and `capByFrame` integration should use a shared `FrameSlider` component once built (G11 specifies `FrameSlider` as a required shared component). Do not duplicate frame logic per-module.
- The uploaded-image input for `vectorSource = 'uploaded'` (new param) must use `ComponentLibrary.create('file-input', ...)` — not an inline `<input type="file">`. This is both a G11 requirement and a component-patterns.md §1 requirement.
- The `NoiseSourceControl` shared component (referenced in G11) is the canonical home for noise seed, noise type, and noise scale controls once built. When that component exists, `velocityType` and `noiseScale` should be absorbed into it.

**G12 — Web worker for expensive computation:**
Advection at `steps=30`, noise mode, 4K is classified as C–D cost class (300–600 ms) per the performance reference. This will block the main thread if not offloaded. Required action: Confirm `apply()` is executed inside the render worker (not the main thread). If the Pipeline runs on the main thread, this module's `apply()` must be moved to the worker. Additionally, the `PerlinNoise` instance is reconstructed on every `apply()` call — cache the instance keyed by `ctx.nodeSeed` to eliminate permutation table rebuild overhead.

**G14 — Mode-conditional param visibility:**
`noiseScale` declares `when: { param: 'velocityType', equals: 'noise' }`. This addresses G14 for `noiseScale`. Verify NodePanel implements `when` as a hide-when-false rule (not disable-when-false). When `vectorSource = 'uploaded'` is added, the file-input control for the uploaded image must also use `when: { param: 'vectorSource', equals: 'uploaded' }`.

**G16 — Unit labels on numeric params:**
Current units: `frame` → `'frames'` (correct), `steps` → `'n'` (incorrect — use `'steps'`), `speed` → `'n'` (incorrect — use `'px/step'`), `noiseScale` → `'n'` (incorrect — use `'×'`). Three of four range params have opaque unit strings. Fix all three.

---

## Merge Absorption

None.

---

## Required Changes (priority ordered)

1. **Add `modulate` to `apply()` and wire per-pixel speed modulation.** Change signature to `apply(src, dst, w, h, p, ctx, modulate)`. For `speed`, resolve a per-pixel value via `modulate?.('speed', pixelIdx) ?? p.speed` inside the pixel loop. Since `advectionWarp` is a black-box algorithm call, this requires either passing a resolved-speed callback into `advectionWarp`, or restructuring so the pixel loop is partially inlined in `apply()` and `advectionWarp` becomes a per-pixel step function. Decide architecture before coding. This unblocks G2 and G1 verification.

2. **Add `vectorSource` param and uploaded-image input.** Add param: `vectorSource: { value: 'noise', type: 'select', options: ['noise', 'luminosity', 'uploaded'], label: 'VECTOR SRC', tier: 3 }`. Add a file-input sub-control visible only when `vectorSource = 'uploaded'`, using `ComponentLibrary.create('file-input', ...)`. Wire `vectorSource = 'luminosity'` to compute a velocity field from source image luminance gradients (dx/dy of luminance). Wire `vectorSource = 'uploaded'` to read from the supplied modulation image's luminance gradient. The `velocityType` param (noise/radial/vortex) should remain as the field geometry selector; `vectorSource` determines data origin for the noise field type only (i.e. `vectorSource` is only relevant when `velocityType = 'noise'`). Apply `when: { param: 'velocityType', equals: 'noise' }` to `vectorSource`.

3. **Fix unit strings on `steps`, `speed`, `noiseScale`.** Change: `steps` unit `'n'` → `'steps'`; `speed` unit `'n'` → `'px/step'`; `noiseScale` unit `'n'` → `'×'`. These are single-property changes in the param definitions.

4. **Cache `PerlinNoise` instance across `apply()` calls.** Move noise instantiation out of `apply()`. Cache as a module-level variable keyed by `nodeSeed`, or use a WeakMap/Map cache. Invalidate on `nodeSeed` change. This eliminates permutation table reconstruction on every render call — significant at high step counts. Example pattern: `if (!this._noise || this._noiseSeed !== seed) { this._noise = new PerlinNoise(seed); this._noiseSeed = seed; }`.

5. **Update registry description.** In `registry.js`, change the ADVECTION entry description from `'Iteratively advects pixels along a velocity field for smearing effects'` to `'Traces each pixel backward through a noise, radial, or vortex velocity field — produces fluid smearing, inward zoom, or rotational swirl'`. This is a single string change.

6. **Verify `when` conditional on `noiseScale` hides (not disables) the control.** Inspect NodePanel's handling of `when` in param definitions. Confirm it removes the control from the DOM (or sets `display: none`) when the condition is false. If it only disables the control, update NodePanel to hide it. This is a NodePanel fix, not an AdvectionNode.js change, but must be verified with this module.

7. **Verify `capByFrame` contract.** Read `assets/js/tools/processors/distort/core/frameCap.js`. Confirm `capByFrame(steps, frame)` returns `0` when `frame = 0` and returns `steps` when `frame ≥ max`. If the function clamps to `[1, steps]` rather than `[0, steps]`, it breaks the "no effect at frame 0" expectation. Fix `capByFrame` or adjust the call site to handle frame=0 as a special case (`if (p.frame === 0) { dst.set(src); return; }`).

8. **Confirm `apply()` runs in the render worker (G12).** Audit `Pipeline.js` to verify `apply()` is dispatched to a worker thread. If the Pipeline is synchronous on the main thread, flag for worker migration. Add `previewMax` or `maxSteps` caps if worker timeout is a risk at `steps=30`.

---

## Verification Criteria

1. **`modulate` wiring:** Attach a driver (image or expression) to SPEED. With a gradient image as driver, the warp displacement should vary spatially across the image — dark regions receive one speed, bright regions receive another. With no driver attached, behaviour must be identical to current (scalar speed). Verify no regression on radial and vortex modes.

2. **`vectorSource = 'luminosity'`:** Set velocity type to NOISE, vector source to IMAGE LUMINOSITY. Apply to a test image. The warp should follow luminance gradients of the source — edges and bright-to-dark transitions should produce directional warping. Confirm the effect changes when the source image changes.

3. **`vectorSource = 'uploaded'`:** Set vector source to UPLOADED IMAGE. Upload a test greyscale image. Confirm the file-input control appears only when UPLOADED IMAGE is selected. Confirm the warp is driven by the uploaded image's luminance gradient, not the source image.

4. **Unit labels:** Open NodePanel for ADVECTION. Confirm STEPS reads `N steps`, SPEED reads `N px/step`, NOISE SC reads `N ×`, FRAME reads `N frames` (where N is the current value). No `n` unit strings visible.

5. **`noiseScale` visibility:** Set VELOCITY to RADIAL. Confirm NOISE SC control is not visible (hidden, not greyed out). Set VELOCITY back to NOISE. Confirm NOISE SC reappears. Repeat for VORTEX.

6. **`frame = 0` produces no warp:** Set FRAME to 0. Confirm output is identical to source (pass-through). Advance FRAME to max. Confirm full warp at configured STEPS and SPEED values.

7. **Registry description:** Open CategoryPicker, hover or inspect ADVECTION entry. Confirm description text matches the updated string and accurately describes all three field types.

8. **PerlinNoise caching:** Render the module twice with the same params. Confirm (via profiling or logging) that `new PerlinNoise()` is called once, not twice. Change the global seed. Confirm a new instance is constructed.

9. **Worker execution (G12):** Profile a render at `steps=30`, noise mode, full resolution. Confirm main thread is not blocked during computation. The render worker should show the CPU time, not the main thread.

10. **`when` hide behaviour:** In NodePanel source, locate the `when` evaluation logic. Confirm the condition produces `display: none` (or DOM removal) on the `noiseScale` row when `velocityType !== 'noise'`. A disabled-but-visible control is a G14 violation.
