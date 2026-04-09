# AFFINE — Build Guide

- module: affine
- node: AffineTransformNode.js
- category: TRANSFORM
- review verdict: KEEP
- rebuild severity: MINOR

## Current State Summary

`AffineTransformNode.js` is a `createEffectModule()` factory that delegates all pixel work to `affineTransform` in `spatial-filters.js`. The seven params (translateX, translateY, rotate, scaleX, scaleY, centreX, centreY) match reference values exactly for range, step, and default. The sole divergence from the reference source is that the current implementation adds `driveable: true` to `centreX`/`centreY` and `unit` annotations to all params — both additions are non-destructive but partially incorrect (see below). No architectural change is required; only targeted param corrections and global-issue compliance work apply.

---

## Reference Parity Gaps

1. **`centreX`/`centreY` — `driveable: true` absent in reference, present in current.** Reference source (`reference/distort/affine/source/AffineTransformNode.js` lines 12–13) omits `driveable` on these two params. `ui-layout.md` and `feature-parity.md` both classify centreX/centreY as non-driveable. Current implementation incorrectly adds `driveable: true`. This must be removed. G2 (all numeric params driveable) appears to conflict — however G2 applies to params where driving produces a meaningful per-pixel effect. Since `apply()` has no `modulate` parameter, driving is non-functional for all params. Removing `driveable` from centreX/centreY aligns with reference intent; the five motion params retain `driveable: true` pending G1/G12 resolution.

2. **`unit` annotations absent in reference, present in current.** Reference source has no `unit` field on any param. Current implementation adds `unit: '0–1'`, `unit: 'deg'`, `unit: 'n'` per-param. This is not a defect — G16 requires unit labels — but the current values need audit (see Extra/Incorrect Parameters).

3. **`apply()` lacks `modulate` parameter — `driveable: true` on five params is non-functional.** Declared in `issues-and-conflicts.md` [WARN] [COMPLIANCE]. The reference source also lacks `modulate`; this is a known shared deficiency, not introduced by current implementation. Tracked under G1/G2; resolution deferred to G-series work.

---

## Review Spec Gaps

1. **G5 (slider direct input + double-click-to-default) not implemented.** The review action item (affine_review2403.md §Action Items item 3) explicitly requires this. This is a NodePanel/slider-component change, not a per-module change. Tracked globally; affine itself has no module-level work required.

2. **G6 (canvas click-to-pick for centreX/centreY) not implemented.** Affine has centreX/centreY params. `_global_issues.md` G6 requires a PICK CENTRE button for any module with centre X/Y params. G11 requires this be built as a shared `CentrePointPicker` component before being added per-module. No module-level code change is possible until the shared component exists; this is a dependency blocker.

3. **G1 (+D button non-functional) not fixed.** Not fixable at module level; requires NodePanel investigation. Logged here as a dependency.

---

## Missing Parameters

None. All seven reference params are present with correct range, step, and default values.

---

## Extra/Incorrect Parameters

| Param name | Issue |
|---|---|
| `centreX` | `driveable: true` incorrectly added — reference and `ui-layout.md` both specify non-driveable for centreX/centreY. Remove `driveable: true`. |
| `centreY` | Same as centreX. Remove `driveable: true`. |
| `translateX` | `unit: '0–1'` is ambiguous — this param is a normalised fraction of image width, not a value bounded to [0,1]; it is bounded [−1, 1]. Change to `unit: 'norm'` or `unit: '−1–1'` for precision. G16 requires the unit be unambiguous. |
| `translateY` | Same as translateX. Change unit string to `unit: '−1–1'`. |
| `scaleX` | `unit: 'n'` is ambiguous (no standard meaning). Change to `unit: '×'` (scale factor). |
| `scaleY` | Same as scaleX. Change to `unit: '×'`. |

Note: `rotate` `unit: 'deg'` is correct and requires no change.

---

## UI Compliance Issues

1. **Registry description inaccurate.** `registry.js` line 137: description reads `'Applies rotation, scale, shear, and translation via an affine matrix'`. The module does not perform shear — `description.md` explicitly states the module applies rotation, anisotropic scale, and translation only. Shear is not a supported operation. Correct to: `'Applies rotation, scale, and translation via an inverse affine remap about a configurable pivot'`.

2. **`centreX`/`centreY` `driveable: true` causes spurious `+D` buttons in NodePanel.** Since `apply()` has no `modulate` parameter, connecting a driver has no per-pixel effect. The `+D` button will appear for centreX/centreY but produce silent failure. Removing `driveable: true` from these two params removes the misleading affordance. (The five motion params retain `driveable: true` as declared in reference, pending G1 fix.)

3. **No raw hex, rgb, or hsl colours present — pass.** Module file contains no colour values.

4. **No inline DOM construction — pass.** Factory pattern; no DOM outside EffectNode/factory internals.

5. **All param labels UPPERCASE — pass.** Labels: `TRANSLATE X`, `TRANSLATE Y`, `ROTATE`, `SCALE X`, `SCALE Y`, `CENTRE X`, `CENTRE Y`. All conform to text-treatment.md §2 (sidebar parameter label: UPPERCASE).

6. **No prohibited glyphs — pass.** Module file does not declare any UI glyphs directly.

7. **No border, gradient, shadow, or radius declarations — pass.**

8. **Module name `'AFFINE XFORM'` — pass.** Matches reference exactly.

9. **`type: 'affine'` — lowercase, unique — pass.**

10. **`category: 'TRANSFORM'` — matches registry — pass.**

---

## Global Issues

**G1 — +D button non-functional (all params).**
Action for affine: none at module level. NodePanel event handler fix required. After G1 is fixed, verify that `driveable: true` params on affine (translateX, translateY, rotate, scaleX, scaleY) open the driver settings panel correctly.

**G2 — all numeric params must have `driveable: true`.**
Current state: translateX, translateY, rotate, scaleX, scaleY already have `driveable: true`. centreX, centreY should NOT have `driveable: true` per reference and `ui-layout.md` (pivot params are not modulation targets). No additional params need adding. Remove `driveable: true` from centreX/centreY.

**G5 — slider direct input + double-click-to-default.**
Action for affine: none at module level. Change required in the shared slider component (NodePanel/NumericInput). Affine has no per-module work; verify after shared component is updated.

**G6 — canvas click-to-pick for centreX/centreY.**
Affine has `centreX` and `centreY` — this module is in-scope for G6. Action: once the shared `CentrePointPicker` component is built (G11), add a PICK CENTRE button to the affine NodePanel row for centreX/centreY. Do not implement a one-off picker; G11 mandates shared component first.

**G11 — shared components.**
Affine's G6 requirement (CentrePointPicker) is a G11 dependency. Build `CentrePointPicker` as a shared component before implementing the affine-specific centre-pick affordance.

**G16 — unit labels on numeric params.**
Current implementation has `unit` fields on all params. Two are incorrect (see Extra/Incorrect Parameters): translateX/translateY `unit: '0–1'` should be `unit: '−1–1'`; scaleX/scaleY `unit: 'n'` should be `unit: '×'`. rotate `unit: 'deg'` is correct.

**G7, G9, G10, G12, G14 — not applicable.**
- G7 (vector badge): affine is not a vector module (`isVector: false`).
- G9 (FRAME param): affine has no time/iteration state.
- G10 (SVG export): affine is not a vector module.
- G12 (worker): affine is O(w×h) with precomputed trig, cost class A–B; no performance risk; no worker migration required.
- G14 (mode-conditional param visibility): affine has no MODE param; all params are always applicable.

---

## Merge Absorption

None.

---

## Required Changes (priority ordered)

1. **Remove `driveable: true` from `centreX` and `centreY`.** These are pivot params; driving them produces no per-pixel effect and creates misleading `+D` affordance. Reference source omits `driveable` on these two params. File: `AffineTransformNode.js` lines 12–13.

2. **Fix registry description.** Remove the word "shear" — the module does not perform shear. Change description at `registry.js` line 137 to: `'Applies rotation, scale, and translation via an inverse affine remap about a configurable pivot'`.

3. **Correct `unit` strings for translateX and translateY.** Change `unit: '0–1'` to `unit: '−1–1'` on both translateX (line 7) and translateY (line 8) in `AffineTransformNode.js`. The range is [−1, 1], not [0, 1].

4. **Correct `unit` strings for scaleX and scaleY.** Change `unit: 'n'` to `unit: '×'` on both scaleX (line 10) and scaleY (line 11) in `AffineTransformNode.js`. `'n'` is meaningless; `'×'` correctly communicates scale factor.

5. **Implement CentrePointPicker shared component (G11/G6 prerequisite).** This is not a change inside AffineTransformNode.js. Build `CentrePointPicker` in the shared component library. Once built, integrate into the NodePanel for any module with centreX/centreY params including affine.

6. **Fix +D button in NodePanel (G1 — dependency).** After G1 is resolved, verify affine's five driveable params (translateX, translateY, rotate, scaleX, scaleY) correctly open driver settings.

7. **Implement slider direct input + double-click-to-default in shared slider component (G5 — dependency).** No per-module work in affine; verify after shared component update.

---

## Verification Criteria

1. **centreX/centreY `driveable` removed:** Inspect `AffineTransformNode.js` lines 12–13; confirm neither param has `driveable` field. Load affine in the distort tool; confirm no `+D` button appears on CENTRE X or CENTRE Y rows in NodePanel.

2. **Registry description corrected:** Read `registry.js` TRANSFORM section; confirm description contains no reference to "shear". Confirm description matches: `'Applies rotation, scale, and translation via an inverse affine remap about a configurable pivot'`.

3. **translateX/translateY unit corrected:** Inspect `AffineTransformNode.js` lines 7–8; confirm `unit: '−1–1'`. Load affine; confirm NodePanel displays `−1–1` unit label adjacent to TRANSLATE X and TRANSLATE Y sliders.

4. **scaleX/scaleY unit corrected:** Inspect `AffineTransformNode.js` lines 10–11; confirm `unit: '×'`. Load affine; confirm NodePanel displays `×` unit label adjacent to SCALE X and SCALE Y sliders.

5. **Functional identity preserved:** Apply affine at identity params (translateX=0, translateY=0, rotate=0, scaleX=1, scaleY=1, centreX=0.5, centreY=0.5). Output must be pixel-identical to input. Apply rotation of 45°, confirm angular rotation about centre. Apply scaleX=2, confirm horizontal zoom-in. Confirm no regressions introduced.

6. **G6/CentrePointPicker (post-shared-component):** After `CentrePointPicker` is built, activate PICK CENTRE for affine, click the canvas, confirm centreX/centreY values update to the normalised click coordinate.

7. **G1 (+D) verification (post-NodePanel fix):** After G1 fix, click `+D` on TRANSLATE X in affine NodePanel; confirm driver settings panel opens. Repeat for TRANSLATE Y, ROTATE, SCALE X, SCALE Y.

8. **G5 slider verification (post-shared-component):** Click the numeric value next to any affine slider; confirm direct text input is accepted and updates the param. Double-click the value; confirm it resets to the param's defined default.
