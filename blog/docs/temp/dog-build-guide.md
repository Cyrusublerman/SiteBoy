# DOG — Build Guide

- module: dog
- node: DoGNode.js
- category: EDGE
- review verdict: KEEP
- rebuild severity: MAJOR

---

## Current State Summary

`DoGNode.js` is a 14-line factory module (`createEffectModule`) with three numeric params: `sigma1`, `sigma2`, `threshold`. It delegates pixel processing entirely to `differenceOfGaussiansRGBA` from the shared edge-operators algorithm library. The algorithm converts source to BT.601 luminance, computes two separable Gaussian blurs at the two sigmas, subtracts them absolutely, applies a threshold gate, and writes the result as greyscale to RGB channels with alpha pass-through.

The current source is structurally clean and algorithmically correct. All three params are declared `driveable: true`. The `previewMax` caps (`sigma1: 3`, `sigma2: 5`) are in place and functional. The module is registered correctly in `registry.js` under `'EDGE'`.

The implementation diverges from the reference source only in the addition of `unit` annotations on all three params — a forwards-compatible addition. Otherwise the two files are identical.

The primary deficiencies are: (A) fixed greyscale-only output — no colour ramp stage exists; (B) no detection-control expansions required by the review spec (OUTPUT MODE, NORMALIZE, GAIN, INVERT); (C) `driveable: true` declared on all params but `modulate()` never called in `apply()` — driver wiring is non-functional for all three params; (D) no Sigma 2 > Sigma 1 constraint enforcement; (E) several global issues apply.

---

## Reference Parity Gaps

Reference source: `reference/distort/dog/source/DoGNode.js`.

| Item | Reference | Live | Status |
|---|---|---|---|
| `sigma1` param definition (all fields) | `{ value:1, min:0.1, max:10, step:0.1, label:'SIGMA 1', tier:3, previewMax:3, driveable:true }` | Identical + `unit:'σ'` added | PASS (unit is additive) |
| `sigma2` param definition | `{ value:1.6, min:0.2, max:15, step:0.1, label:'SIGMA 2', tier:3, previewMax:5, driveable:true }` | Identical + `unit:'σ'` added | PASS |
| `threshold` param definition | `{ value:5, min:0, max:50, step:1, label:'THRESHOLD', tier:4, driveable:true }` | Identical + `unit:'lvl'` added | PASS |
| `apply()` body | `dst.set(differenceOfGaussiansRGBA(src, w, h, p.sigma1, p.sigma2, p.threshold))` | Identical | PASS |
| `modulate()` call in `apply()` | Not called in reference either | Not called | PASS (shared non-functional state) |
| Preview cap via `previewMax` | Present on sigma1 (3), sigma2 (5) | Present and matching | PASS |
| No preset definitions | Confirmed | Confirmed | PASS |

**Conclusion:** Live source is functionally identical to reference source. No reference parity gaps exist. The only delta is additive `unit` annotations. The reference source itself is deficient per the review spec — it predates the colour ramp requirement.

---

## Review Spec Gaps

Review spec: `dog_review2403.md`.

| Requirement | Status |
|---|---|
| Colour ramp stage: MIN COLOUR, MAX COLOUR interpolation | MISSING — not implemented |
| OUTPUT MODE dropdown (SIGNED / ABSOLUTE / POSITIVE ONLY / NEGATIVE ONLY) | MISSING |
| NORMALIZE toggle | MISSING |
| GAIN slider | MISSING |
| INVERT toggle | MISSING |
| RAMP SOURCE dropdown (SIGNED / ABSOLUTE / THRESHOLDED / NORMALISED RESPONSE) | MISSING |
| RAMP SPACE dropdown (RGB / HSV) | MISSING |
| CLAMP BELOW THRESHOLD toggle | MISSING |
| Sigma 2 > Sigma 1 enforcement (clamp or swap with UI feedback) | MISSING |
| Processing order steps 5–11 in review spec (OUTPUT MODE → GAIN → THRESHOLD → NORMALIZE → scalar map → ramp interpolation) | MISSING — current algo only does absolute difference + threshold; no signed mode, gain, normalize, or ramp |
| Shared `ColourRampControl` component usage (G11 dependency) | NOT YET BUILDABLE — component does not exist; must be built first |

**Revised module structure required (from review spec §Revised Module Structure):**

```
Detection
  Sigma 1
  Sigma 2         ← enforce Sigma 2 > Sigma 1
  Threshold
  Normalize
  Output Mode
  Gain
  Invert

Colour Mapping
  Min Colour
  Max Colour
  Ramp Source
  Ramp Space
  Clamp Below Threshold

Compositing
  Opacity
  Blend Mode
```

---

## Missing Parameters

All of the following are required per `dog_review2403.md` and are entirely absent from the current implementation:

| Key | Label | Type | Section | Notes |
|---|---|---|---|---|
| `outputMode` | `OUTPUT MODE` | dropdown | Detection | Values: `SIGNED`, `ABSOLUTE`, `POSITIVE ONLY`, `NEGATIVE ONLY`. Controls interpretation of DoG response before threshold/gain. `driveable: false` (categorical). |
| `normalize` | `NORMALIZE` | toggle | Detection | Scales response to predictable display range before mapping. `driveable: false`. |
| `gain` | `GAIN` | slider | Detection | Scales response after OUTPUT MODE interpretation and before threshold application. Separates intensity from threshold placement. `driveable: true` (G2). |
| `invert` | `INVERT` | toggle | Detection | Polarity reversal. Applied after threshold. `driveable: false`. |
| `minColour` | `MIN COLOUR` | colour picker | Colour Mapping | Colour for minimum mapped ramp value. Must use `'color-input'` component (component-patterns.md §2). |
| `maxColour` | `MAX COLOUR` | colour picker | Colour Mapping | Colour for maximum mapped ramp value. Must use `'color-input'` component. |
| `rampSource` | `RAMP SOURCE` | dropdown | Colour Mapping | Values: `SIGNED RESPONSE`, `ABSOLUTE RESPONSE`, `THRESHOLDED RESPONSE`, `NORMALISED RESPONSE`. Determines what scalar is fed into the colour ramp. `driveable: false`. |
| `rampSpace` | `RAMP SPACE` | dropdown | Colour Mapping | Values: `RGB`, `HSV`. Interpolation space. `driveable: false`. |
| `clampBelowThreshold` | `CLAMP BELOW THRESHOLD` | toggle | Colour Mapping | Forces sub-threshold values to MIN COLOUR rather than retaining residual structure. `driveable: false`. |

---

## Extra/Incorrect Parameters

None. All three current params (`sigma1`, `sigma2`, `threshold`) are explicitly retained per the review spec. The `unit` annotations added to the live source over the reference are correctly forward-compatible with G16.

---

## UI Compliance Issues

### UC-1. No Colour Mapping section (MISSING — structural)

The review spec mandates a new `Colour Mapping` collapsible section. The current module has only three params under a single `Detection` grouping (implicit) plus the standard NodePanel compositing controls. The section structure does not match the required three-section layout.

**Fix:** Add a `Colour Mapping` collapsible section containing the five new colour ramp params. The section must use the `'collapsible-section'` component (component-patterns.md §2), with `+`/`−` glyphs at right of label (structural block pattern), Title Case header text at `F` bold (text-treatment.md §2, semiotics.md §1).

### UC-2. Driver wiring gap — `modulate()` never called (G2 / G1 affected)

`driveable: true` is declared on `sigma1`, `sigma2`, `threshold`. The `+D` button renders for all three but produces no effect — `modulate()` is never called in `apply()`. Per `feature-parity.md` and `issues-and-conflicts.md`, this is a confirmed compliance failure.

Note per `ui-layout.md`: driving `sigma1` or `sigma2` per-pixel is architecturally infeasible in the current separable-blur design (kernel radius is computed once pre-sweep; per-pixel radius switching is not possible without full-image per-pixel kernel instantiation). Only `threshold` is architecturally feasible to drive per-pixel. However, the fix to `modulate()` call presence is a global system concern (G1) and should be addressed globally, not per-module.

**Fix (threshold only, feasible):** Call `getModulated('threshold', i, ctx)` per pixel in the difference loop inside `differenceOfGaussiansRGBA` — requires signature extension or a post-process per-pixel threshold pass. For `sigma1`/`sigma2`: retain `driveable: true` but add a note in the architecture that per-pixel driving requires a full design change to the separable blur; do not call `modulate` for these two.

### UC-3. Sigma 2 > Sigma 1 constraint not enforced

When `sigma1 >= sigma2`, `|G1 − G2|` collapses to near-zero across the full image. No warning, clamp, or swap is present. The review spec explicitly requires enforcement.

**Fix:** In `apply()`, before delegating to `differenceOfGaussiansRGBA`, clamp or swap: if `p.sigma1 >= p.sigma2`, either: (a) set effective `s2 = p.sigma1 + 0.1` (clamp to minimum valid separation), or (b) swap the values. Option (a) is safer — it preserves the user's `sigma1` intent and silently corrects the invalid relationship. A UI warning (e.g. param label colour change) is desirable but depends on NodePanel API availability.

### UC-4. `unit` field — G16 partial compliance only

`unit: 'σ'` on `sigma1`/`sigma2` and `unit: 'lvl'` on `threshold` are present in the live source (not in the reference). This is a correct forward step toward G16. However, `unit` display depends on NodePanel rendering the field. The unit is declared but may not be visible in the UI until NodePanel is updated (G16 global fix). No module-level action beyond declaration is required.

### UC-5. Mode-conditional params (G14)

When OUTPUT MODE is added, `rampSource: 'SIGNED RESPONSE'` and `rampSource: 'NORMALISED RESPONSE'` should only show params relevant to the active mode. Additionally, `CLAMP BELOW THRESHOLD` is only relevant when `rampSource` is `THRESHOLDED RESPONSE`. These conditional relationships must be implemented via the NodePanel `when` mechanism (if available) or via param visibility callbacks — not via always-visible param rows.

---

## Global Issues

| Issue | Applicability to DOG | Required Action |
|---|---|---|
| **G1** — +D button non-functional | Applies: `sigma1`, `sigma2`, `threshold` all have `+D` buttons that produce no effect. | Global fix in NodePanel required first. No per-module fix in DoGNode.js. |
| **G2** — all numeric params must be `driveable: true` | Partially satisfied: sigma1, sigma2, threshold are `driveable: true`. New `gain` param must also carry `driveable: true`. `outputMode`, `normalize`, `invert`, `rampSource`, `rampSpace`, `clampBelowThreshold` are not numeric — no driveable requirement. | Add `driveable: true` to `gain` param definition. |
| **G5** — slider direct input and double-click-to-default | Applies to `sigma1`, `sigma2`, `threshold`, and new `gain`. Global NodePanel/slider component fix required. No per-module fix. | None in DoGNode.js until slider component is updated globally. |
| **G6** — canvas click-to-pick for centre X/Y | Does not apply. DoG has no spatial origin param. | None. |
| **G7** — vector modules must be identifiable | Does not apply. DoG is a pixel-output module. | None. |
| **G9** — time/iteration modules must expose FRAME param | Does not apply. DoG has no internal time or iteration state. | None. |
| **G10** — vector modules must have SVG export | Does not apply. | None. |
| **G11** — overlapping feature additions must use shared components | Applies critically: the colour ramp (MIN COLOUR, MAX COLOUR, RAMP SOURCE, RAMP SPACE) is an identical pattern to Sobel, Canny, and Laplacian. Must NOT be reimplemented inline. A shared `ColourRampControl` component must be built first. | Block colour ramp implementation until `ColourRampControl` exists. Then consume the shared component in DoGNode.js. |
| **G12** — web worker usage for expensive modules | Applies at high sigma values: at `sigma1:10, sigma2:15` the module reaches class-C/D render cost (~200–600ms). `differenceOfGaussiansRGBA` is a pure function with no shared state — a valid worker candidate. | Add to the worker offload audit. Not a DoGNode.js change — affects the pipeline worker architecture. Performance doc recommends reducing `sigma2` max from 15 to 8 as a mitigation. |
| **G14** — mode-conditional params must be hidden when not applicable | Applies when OUTPUT MODE and RAMP SOURCE dropdowns are added. Sub-threshold-specific params must hide when OUTPUT MODE is not `THRESHOLDED`-based. `CLAMP BELOW THRESHOLD` must hide when RAMP SOURCE ≠ `THRESHOLDED RESPONSE`. | Implement `when` visibility conditions on each conditional param at the time of addition. |
| **G16** — slider/number inputs must display units | Applies: `sigma1` (`unit:'σ'`), `sigma2` (`unit:'σ'`), `threshold` (`unit:'lvl'`) are declared. New `gain` must also carry a `unit` (dimensionless scalar — `unit:''` or `unit:'×'`). | Add `unit` to `gain`. Rendering is a global NodePanel fix (G16). |

---

## Merge Absorption

No prior merge items logged for this module. The reference pack (migration-log.md, 2026-03-11) captured no pending merges. No sibling node conflicts exist in the registry. The `unit` annotations in the live source over the reference source are additive and should be retained as-is.

---

## Required Changes (priority ordered)

### P0 — Prerequisite: Build `ColourRampControl` shared component (G11 blocker)

Before any colour ramp code is written in DoGNode.js, a shared `ColourRampControl` component must exist in the component library. This component encapsulates: MIN COLOUR picker, MAX COLOUR picker, RAMP SOURCE dropdown, RAMP SPACE dropdown, CLAMP BELOW THRESHOLD toggle, and the scalar-to-colour interpolation logic in both RGB and HSV spaces. Sobel, Canny, and Laplacian require the identical component. Implementing it inline in DoGNode.js is a G11 violation.

**Owner:** component library (not DoGNode.js).  
**Blocker for:** P2, P3.

### P1 — Add Sigma 2 > Sigma 1 enforcement

In `apply()`, before delegating to `differenceOfGaussiansRGBA`, add:

```javascript
const s1 = Math.min(p.sigma1, p.sigma2 - 0.1);
const s2 = p.sigma2;
dst.set(differenceOfGaussiansRGBA(src, w, h, s1, s2, p.threshold));
```

This clamps `sigma1` to at most `sigma2 - 0.1` so the minimum valid separation is always maintained, without mutating stored params. If the NodePanel exposes a warning API, surface a param-level warning when `p.sigma1 >= p.sigma2`.

**Scope:** DoGNode.js `apply()` only. No algorithm change.  
**Dependency:** None.

### P2 — Add Detection section expansion params

Add to `params`:

```javascript
outputMode: { value: 'absolute', type: 'select', options: ['signed','absolute','positive','negative'], label: 'OUTPUT MODE', tier: 3 },
normalize:  { value: false, type: 'toggle', label: 'NORMALIZE', tier: 4 },
gain:       { value: 1, min: 0.1, max: 10, step: 0.1, label: 'GAIN', tier: 4, driveable: true, unit: '×' },
invert:     { value: false, type: 'toggle', label: 'INVERT', tier: 4 },
```

Update `apply()` to implement the full processing order:

1. Compute raw signed DoG: `v = G1[i] − G2[i]` (remove the absolute value from the algorithm, or add a signed variant).
2. Interpret per OUTPUT MODE: signed → pass through; absolute → `|v|`; positive → `max(0, v)`; negative → `max(0, -v)`.
3. Apply GAIN: `v *= p.gain`.
4. Apply THRESHOLD gate: `v = v > p.threshold ? v : 0`.
5. If NORMALIZE: rescale all values to [0, 255] range over the image (requires a two-pass algorithm — first pass collects max, second pass normalises).
6. Map to [0, 1].
7. Pass scalar to ColourRampControl interpolation (step pending P0).
8. If INVERT: `scalar = 1 - scalar` after threshold/normalize and before ramp.

**Dependency:** P0 (for ramp step), P1 (enforced sigma ordering). Steps 1–6 and 8 can proceed without P0; step 7 requires P0.

### P3 — Add Colour Mapping section via `ColourRampControl`

After P0 is complete, add the `ColourRampControl` component to the module under a new `Colour Mapping` collapsible section. Params consumed from the shared component:

```
minColour            (colour picker — 'color-input')
maxColour            (colour picker — 'color-input')
rampSource           (dropdown — SIGNED / ABSOLUTE / THRESHOLDED / NORMALISED RESPONSE)
rampSpace            (dropdown — RGB / HSV)
clampBelowThreshold  (toggle)
```

Integrate the ramp interpolation into the updated `apply()` at step 7 above.

**Dependency:** P0.

### P4 — G14 mode-conditional param visibility

When P2 and P3 are in place, add `when` conditions:

- `clampBelowThreshold`: only visible when `rampSource === 'thresholded'`.
- `rampSource: 'signed'` option: only meaningful when `outputMode === 'signed'`; consider disabling or hiding `SIGNED RESPONSE` ramp source when output mode is not `SIGNED`.

Implement via the NodePanel `when` callback mechanism or equivalent conditional visibility API. Hidden params are not disabled — they are absent from the rendered control set.

**Dependency:** P2, P3.

### P5 — `threshold` driver wiring (feasible per-pixel target only)

`threshold` is the only param where per-pixel driving is architecturally feasible (it is applied per-pixel in the difference step, not pre-convolution). After G1 is fixed globally, wire `getModulated('threshold', i, ctx)` in the per-pixel loop. Requires either: (a) exposing a per-pixel threshold callback from `differenceOfGaussiansRGBA`, or (b) moving the threshold application into `apply()` as a post-process pass over the algorithm output.

`sigma1` and `sigma2` remain `driveable: true` in their param definitions (for UI consistency) but must NOT call `getModulated` — per-pixel Gaussian kernel switching is architecturally infeasible without rewriting the separable blur as a per-pixel operation.

**Dependency:** G1 global fix.

### P6 — Performance: Gaussian kernel precomputation

In `edge-operators.js` `blur()` internal function, precompute the 1D kernel weight array once per sigma value before the H/V sweep loops, rather than recomputing `exp()` at every pixel position. This reduces `exp()` calls from O(w×h×k) to O(k) per blur pass. At `sigma2:15` (k=91), this is ~91M → 91 `exp()` calls per pass at 1 MP.

**Scope:** `shared/algorithms/edge-detection/edge-operators.js` — not DoGNode.js.  
**Dependency:** None. Independent optimisation.

---

## Verification Criteria

After all required changes are implemented, the following must hold:

| # | Criterion | Test |
|---|---|---|
| V1 | `sigma1 < sigma2` is always maintained on the computed values passed to the algorithm | Set `sigma1 = 5`, `sigma2 = 3` — verify output is non-black (enforcement active) |
| V2 | OUTPUT MODE `SIGNED` shows both bright (positive) and dark (negative) structure | Apply to a high-contrast image; verify visible dark halo on one side of each edge |
| V3 | OUTPUT MODE `ABSOLUTE` matches current module behaviour | Output is visually identical to pre-change module at matching sigma/threshold values |
| V4 | OUTPUT MODE `POSITIVE ONLY` shows only positive lobes | Verify negative response is suppressed to MIN COLOUR |
| V5 | OUTPUT MODE `NEGATIVE ONLY` shows only negative lobes | Verify positive response is suppressed to MIN COLOUR |
| V6 | GAIN slider amplifies response multiplicatively before threshold | At GAIN 2.0, edges visible at THRESHOLD 20 should also be visible at THRESHOLD ~40 relative to GAIN 1.0 |
| V7 | NORMALIZE scales output to full display range | At very high sigma values where raw DoG values are small, NORMALIZE produces a visible full-range output |
| V8 | INVERT reverses scalar polarity | Black edges on white background become white edges on black background |
| V9 | MIN COLOUR / MAX COLOUR map scalar extremes correctly | Set MIN=red, MAX=blue: zero-response pixels are red; maximum-response pixels are blue |
| V10 | RAMP SPACE HSV produces smooth hue interpolation between MIN and MAX colours | Visible smooth hue gradient between two complementary colours |
| V11 | CLAMP BELOW THRESHOLD forces sub-threshold pixels to MIN COLOUR | At THRESHOLD 30, sub-threshold regions match MIN COLOUR exactly |
| V12 | `gain` param has `driveable: true` | +D button appears for GAIN in NodePanel |
| V13 | `gain` param has `unit: '×'` declared | Unit visible in NodePanel (post G16 global fix) |
| V14 | No colour ramp logic is duplicated inline — `ColourRampControl` is consumed from library | Code review: no inline MIN/MAX interpolation outside shared component |
| V15 | Colour Mapping section renders as a collapsible structural block with `+`/`−` glyphs | Visual inspection: glyph is `+` when collapsed, `−` when expanded, at right of header label |
| V16 | `clampBelowThreshold` is hidden when RAMP SOURCE ≠ `THRESHOLDED RESPONSE` | Switch RAMP SOURCE to ABSOLUTE RESPONSE — verify CLAMP BELOW THRESHOLD disappears from UI |
| V17 | Module still registered correctly in `registry.js` under `'EDGE'` with `type: 'dog'` | No registry change required; verify no regression |
| V18 | All three original params (`sigma1`, `sigma2`, `threshold`) retain their exact existing definitions | Param audit: value, min, max, step, tier, previewMax, unit fields unchanged |
| V19 | Preview caps still active | At full-res `sigma1:10`, preview uses `sigma1:3`; at `sigma2:15`, preview uses `sigma2:5` |
| V20 | No `document.*`, `window.*`, `requestAnimationFrame`, `setInterval` introduced | Code audit |
