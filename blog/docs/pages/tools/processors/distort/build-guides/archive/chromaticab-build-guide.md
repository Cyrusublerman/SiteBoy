# CHROMATICAB — Build Guide
- module: chromaticab
- node: ChromaticAbNode.js
- category: DISTORTION
- review verdict: KEEP
- rebuild severity: MAJOR

## Current State Summary

`ChromaticAbNode.js` is a 15-line factory module using `createEffectModule`. It delegates to `chromaticAberration()` in `shared/algorithms/geometry/distortion.js`. The reference source is byte-identical to the live source except: (a) `unit: 'px'` is present on `redShift`/`blueShift` in the live source but absent in the reference archive; (b) `driveable: true` is absent from `centreX`/`centreY` in both versions.

The existing algorithm is a radial-from-centre model — it computes `t = dist/maxDist`, samples R and B channels at radially-offset coordinates, and copies G unchanged. This is structurally correct as a first-order lateral chromatic aberration simulation. However, the review rejects it as "naive" because: strength is not independently configurable per-channel (only two scalar shift params exist), there is no falloff curve control, no edge/sampling mode, and no radius normalisation choice. The review requires a substantially expanded param set and algorithm.

`driveable: true` on `redShift` and `blueShift` is a false claim: `apply(src, dst, w, h, p)` has no `ctx` parameter, so modulation is architecturally impossible — not merely unwired.

Registry: `ChromaticAbNode` is imported and registered correctly. No registry compliance issues.

## Reference Parity Gaps

Comparing live source against `reference/distort/chromaticab/source/ChromaticAbNode.js`:

| Item | Reference | Live | Status |
|---|---|---|---|
| `redShift` param definition | no `unit` field | `unit: 'px'` present | Live has extra field — consistent with G16 compliance; no gap |
| `blueShift` param definition | no `unit` field | `unit: 'px'` present | Same as above |
| `centreX` driveable | absent | absent | Match |
| `centreY` driveable | absent | absent | Match |
| `apply()` signature | `apply(src, dst, w, h, p)` | `apply(src, dst, w, h, p)` | Match |
| Algorithm delegation | `chromaticAberration(src, w, h, p.redShift, p.blueShift, p.centreX, p.centreY)` | identical | Match |

**Conclusion:** The live source is functionally identical to the reference archive. The reference archive itself is the pre-review state, not a target. There are no reference parity gaps — the gaps are between both sources and the review spec.

## Review Spec Gaps

The review (`chromaticab_review2403.md`) mandates a radial, per-channel, falloff-driven algorithm with an expanded param set. Every item below is absent from the current implementation.

**Algorithm gaps:**

| Required behaviour | Current state | Gap |
|---|---|---|
| Per-channel strength multiplier (RED SCALE, GREEN SCALE, BLUE SCALE) | Only redShift/blueShift as combined magnitude+direction | Missing — current params conflate scale and direction; no green channel displacement |
| Master STRENGTH param (controls total displacement magnitude) | Absent — redShift/blueShift each act as both strength and scale | Missing |
| FALLOFF curve (linear / quadratic / cubic / smoothstep) | Fixed linear falloff (`t = dist/maxDist`, no curve) | Missing |
| EDGE MODE (clamp / mirror / wrap / transparent) | Implicit clamp only (algorithm behaviour undocumented; likely clamp) | Missing |
| SAMPLING MODE (nearest / bilinear / bicubic) | Fixed by shared algorithm — not exposed | Missing |
| RADIUS NORMALISATION dropdown (min dim / max dim / corner distance) | Hardcoded as `sqrt(w²+h²)/2` (corner distance) | Exposed choice missing |
| Green channel displacement | None — green always copied from source | Missing as a controllable param |
| OPACITY param | Pipeline-level only, not explicit in node | Standard — no gap |
| BLEND MODE param | Pipeline-level only | Standard — no gap |

**Param gaps** (params required by review that do not exist in current node):

| Required param | Key | Type | Missing from current |
|---|---|---|---|
| STRENGTH | `strength` | slider | Yes |
| FALLOFF | `falloff` | dropdown | Yes |
| RED SCALE | `redScale` | slider | Yes |
| GREEN SCALE | `greenScale` | slider | Yes |
| BLUE SCALE | `blueScale` | slider | Yes |
| EDGE MODE | `edgeMode` | dropdown | Yes |
| SAMPLING MODE | `samplingMode` | dropdown | Yes |
| RADIUS NORMALISATION | `radiusNorm` | dropdown | Yes |

## Missing Parameters

All params listed below are required by the review spec and absent from the current implementation.

| Key | Label | Type | Range | Default | `driveable` | Notes |
|---|---|---|---|---|---|---|
| `strength` | STRENGTH | slider | 0–50 (px) | low (~4) | true | Master displacement scalar — multiplied by per-channel scale and falloff |
| `falloff` | FALLOFF | dropdown | linear / quadratic / cubic / smoothstep | quadratic | false | Curve applied to normalised distance `t` before scaling strength |
| `redScale` | RED SCALE | slider | -2 to 2 | +1 | true | Per-channel multiplier for red; combined with strength to get final red displacement |
| `greenScale` | GREEN SCALE | slider | -1 to 1 | 0 | true | Default 0 — green is stable reference channel |
| `blueScale` | BLUE SCALE | slider | -2 to 2 | -1 | true | Per-channel multiplier for blue; opposite sign to red at default |
| `edgeMode` | EDGE MODE | dropdown | clamp / mirror / wrap / transparent | clamp | false | Out-of-bounds sample behaviour |
| `samplingMode` | SAMPLING MODE | dropdown | nearest / bilinear | bilinear | false | Sample interpolation quality |
| `radiusNorm` | RADIUS NORM | dropdown | min dimension / max dimension / corner distance | corner distance | false | Determines maxRadius for `t` normalisation |

## Extra/Incorrect Parameters

| Key | Label | Issue |
|---|---|---|
| `redShift` | RED SHIFT | Conflates strength and scale — must be replaced by `strength` + `redScale`. Not present in review spec by this name. Remove. |
| `blueShift` | BLUE SHIFT | Same issue as `redShift`. Not present in review spec. Remove. |

**Note on `centreX` / `centreY`:** These are retained in the review spec. Their definitions are correct. `driveable` should be set to `true` on both per G2 (all numeric params must support drivers).

## UI Compliance Issues

**G2 — driveable on numeric params:**
- `centreX` and `centreY` lack `driveable: true`. Both are numeric sliders and must have it per G2.
- `redShift` and `blueShift` declare `driveable: true` but the `apply()` signature has no `ctx` — this is a false claim. After rebuild with expanded `apply(src, dst, w, h, p, ctx)`, driveable must be wired through `ctx.modulate` / `getModulated()`.

**G6 — Click-to-pick centre point:**
- `centreX` / `centreY` require a PICK CENTRE canvas interaction (global issue, tracked; not implemented in-module yet).

**G16 — Unit display:**
- `centreX`, `centreY` lack `unit` field. Both are normalised 0–1; add `unit: '0–1'`.
- After rebuild: `strength` needs `unit: 'px'`; `redScale`, `greenScale`, `blueScale` are dimensionless multipliers — use `unit: '×'` or `unit: 'scale'`.

**Label compliance (text-treatment.md):**
- All current labels are SCREAMING CASE — compliant.
- New labels must be SCREAMING CASE ≤16 chars: STRENGTH (8), FALLOFF (7), RED SCALE (9), GREEN SCALE (11), BLUE SCALE (10), EDGE MODE (9), SAMPLING MODE (13), RADIUS NORM (11) — all within limit.

**G14 — Mode-conditional param visibility:**
- This module has no mode params that gate other params. Not applicable to chromaticab directly. However, SAMPLING MODE and EDGE MODE are dropdowns, not conditional — no action needed here.

## Global Issues

| Issue | Applicability to chromaticab | Action required in this module |
|---|---|---|
| G1 — +D button non-functional | Affects all driveable params (redShift, blueShift after rebuild: strength, redScale, greenScale, blueScale, centreX, centreY) | Tracked globally. No module-level fix possible until G1 is resolved system-wide. After rebuild, ensure all driveable params are wired to `getModulated()` so they become functional when G1 is fixed. |
| G2 — All numeric params need `driveable: true` | centreX, centreY missing it; all new numeric params must have it | Add `driveable: true` to centreX, centreY. Add to strength, redScale, greenScale, blueScale in rebuild. |
| G5 — Slider direct input and double-click-to-default | Affects all slider params | Tracked globally. No module change required — fix is in NodePanel slider component. |
| G6 — Click-to-pick centre point | chromaticab has centreX/centreY — confirmed in review (action item 7) | Add PICK CENTRE button. Blocked on shared CentrePointPicker component (G11). |
| G7 — Vector module identification | Not applicable — chromaticab is a pixel module | None. |
| G9 — FRAME param for time-based modules | Not applicable — chromaticab has no frame/iteration state | None. |
| G10 — SVG export for vector modules | Not applicable | None. |
| G11 — Shared components for overlapping features | PICK CENTRE is a shared feature (radialblur, twirl, spherize, chromaticab, lensbubbles) | Do not implement a one-off CentrePointPicker. Wait for shared component; consume it. |
| G12 — Web worker for expensive modules | chromaticab is O(w×h) with trig — class B cost. Should run in render worker | Confirm `apply()` runs in worker context. No blocking main-thread issue reported specifically for this module, but the trig cost warrants verification. |
| G14 — Mode-conditional param visibility | Not applicable — no mode-gated params | None. |
| G16 — Units on numeric params | centreX/centreY lack `unit`; new params need `unit` | Add `unit: '0–1'` to centreX, centreY. Set units on all new params in rebuild. |

## Merge Absorption

The following changes from other nodes reviewed prior to chromaticab apply here:

| Source | Absorption |
|---|---|
| G2 (LEVELS review) | `driveable: true` on centreX, centreY in existing node; on all new numeric params in rebuild. |
| G5 (AFFINE review) | Tracked globally; no node-level change. |
| G6 (RADIAL BLUR / TWIRL reviews) | PICK CENTRE support. Depends on G11 shared component. |
| G11 (LAPLACIAN review) | CentrePointPicker must be a shared component. Do not build one-off. |
| G16 (MOIRÉ review) | Add `unit` fields to all params. |
| feature-parity.md — HOLOGRAM preset | Preset exists in legacy docs (redShift +4, blueShift −4). After rebuild, HOLOGRAM preset must be re-expressed using new param schema: e.g. strength ~8, redScale +1, blueScale −1. Preserve the preset under the new param names. |

## Required Changes (priority ordered)

**P1 — Rebuild `apply()` and algorithm (CRITICAL — review mandates this):**
- Replace `apply(src, dst, w, h, p)` with `apply(src, dst, w, h, p, ctx)`.
- Remove delegation to `chromaticAberration(src, w, h, redShift, blueShift, centreX, centreY)`.
- Implement radial-from-centre algorithm inline or in a new shared algorithm function `chromaticAberrationV2`:
  1. Compute `(cx, cy) = (p.centreX × w, p.centreY × h)`.
  2. Compute `maxRadius` based on `p.radiusNorm`: min dim = `min(w,h)/2`; max dim = `max(w,h)/2`; corner distance = `sqrt(w²+h²)/2`.
  3. Apply falloff curve to `t = clamp(r/maxRadius, 0, 1)` per mode: linear=`t`; quadratic=`t²`; cubic=`t³`; smoothstep=`3t²−2t³`.
  4. Per-pixel: `S = p.strength × falloff(t)`.
  5. Channel offsets: `offsetR = dir × S × redScale`; `offsetG = dir × S × greenScale`; `offsetB = dir × S × blueScale`.
  6. Sample each channel at shifted coordinates per `p.edgeMode` (clamp / mirror / wrap / transparent) and `p.samplingMode` (nearest / bilinear).
  7. Recombine channels into output; compositing (opacity, blendMode) handled by pipeline.
- Wire all numeric params through `getModulated(key, pixelIdx, ctx)` for driveable params (strength, redScale, greenScale, blueScale, centreX, centreY).

**P2 — Replace param set:**
- Remove: `redShift`, `blueShift`.
- Add: `strength`, `falloff`, `redScale`, `greenScale`, `blueScale`, `edgeMode`, `samplingMode`, `radiusNorm`.
- Retain: `centreX`, `centreY` (update to add `driveable: true`, `unit: '0–1'`).
- Assign tiers: strength → tier 3; redScale/greenScale/blueScale → tier 3; falloff/edgeMode/samplingMode/radiusNorm → tier 4; centreX/centreY → tier 4.

**P3 — Fix false driveable claim:**
- `driveable: true` on redShift/blueShift is structurally impossible under the current `apply()` signature. Resolved automatically by P1 (adding ctx) and P2 (replacing params with properly-wired ones). After rebuild, verify each driveable param calls `getModulated()` inside the pixel loop.

**P4 — Add `unit` fields to all params (G16):**
- `centreX`: `unit: '0–1'`
- `centreY`: `unit: '0–1'`
- `strength`: `unit: 'px'`
- `redScale`: `unit: '×'`
- `greenScale`: `unit: '×'`
- `blueScale`: `unit: '×'`
- Dropdown params (falloff, edgeMode, samplingMode, radiusNorm): no unit field needed.

**P5 — Update HOLOGRAM preset (if presets are stored separately):**
- Old: `redShift: 4, blueShift: -4`.
- New: `strength: 8, redScale: 1, blueScale: -1, greenScale: 0, falloff: 'quadratic', edgeMode: 'clamp', samplingMode: 'bilinear', radiusNorm: 'corner distance', centreX: 0.5, centreY: 0.5`.
- Locate preset definitions and update. If no separate preset store exists, this is a no-op until presets are implemented.

**P6 — PICK CENTRE (G6 / G11) — deferred:**
- Do not implement until shared `CentrePointPicker` component exists (G11).
- Add implementation once component is available.

**P7 — Preview quality path:**
- After P1, `ctx` is available. Add a nearest-neighbour fast path when `ctx.quality === 'preview'` or equivalent quality flag. Reduces per-pixel cost from bilinear to nearest-neighbour in preview.

## Verification Criteria

After all changes, each of the following must hold:

1. `apply(src, dst, w, h, p, ctx)` signature present.
2. No reference to `chromaticAberration` from the old shared algorithm (old 4-param version). If a new shared function is written, it must accept the full param set.
3. Params present: `centreX`, `centreY`, `strength`, `falloff`, `redScale`, `greenScale`, `blueScale`, `edgeMode`, `samplingMode`, `radiusNorm`. No `redShift` or `blueShift`.
4. All slider params have `driveable: true`: `centreX`, `centreY`, `strength`, `redScale`, `greenScale`, `blueScale`.
5. All slider params have `unit` field: `centreX`=`'0–1'`, `centreY`=`'0–1'`, `strength`=`'px'`, `redScale`=`'×'`, `greenScale`=`'×'`, `blueScale`=`'×'`.
6. `falloff` dropdown options: `linear`, `quadratic`, `cubic`, `smoothstep`. Default: `quadratic`.
7. `edgeMode` dropdown options: `clamp`, `mirror`, `wrap`, `transparent`. Default: `clamp`.
8. `samplingMode` dropdown options: `nearest`, `bilinear`. Default: `bilinear`.
9. `radiusNorm` dropdown options: `min dimension`, `max dimension`, `corner distance`. Default: `corner distance`.
10. At `greenScale: 0`, green channel is copied directly from source (zero displacement).
11. At `strength: 0`, output is identical to input (identity).
12. At centre `(centreX: 0.5, centreY: 0.5)`, displacement at the exact centre pixel is zero.
13. Driveable params (`strength`, `redScale`, `greenScale`, `blueScale`, `centreX`, `centreY`) call `this.getModulated(key, pixelIdx, ctx)` (or equivalent) inside the pixel loop.
14. Registry entry unchanged: `type: 'chromaticab'`, `category: 'DISTORTION'` — verified by no registry change required.
15. `name: 'CHROMATIC AB'` unchanged.
16. HOLOGRAM preset (if stored) updated to new param schema.
17. No `requestAnimationFrame`, `setInterval`, `setTimeout`, `document.*`, `window.*` introduced.
18. `ctx.quality` check present for preview fast-path (nearest-neighbour sampling when in preview mode).
