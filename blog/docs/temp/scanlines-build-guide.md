# SCANLINES — Build Guide

- module: scanlines
- node: ScanlinesNode.js
- category: TEXTURE
- review verdict: KEEP — rebuild as periodic raster / line field system
- rebuild severity: MAJOR

---

## Current State Summary

Factory-pattern node (`createEffectModule`) with 4 params: `frame`, `spacing`, `thickness`, `scOpacity`. Delegates to `scanlines()` in `texture-overlays.js`. Implements a single-pass, row-uniform, horizontal dark-band attenuation. Algorithm: for each row y, `((y mod spacing) / spacing) < thickness` → multiply R,G,B by `(1 − scOpacity)`. O(w×h), no previewMax, trivially fast (Class A).

The live implementation diverges from the reference source in one meaningful way: a `frame` param has been added (reference has no `frame`). The reference `spacing` also lacks `driveable: true`; the live node adds it.

The module is architecturally sound at the factory level but is functionally primitive relative to the review specification. It operates as a single VISIBLE RASTER overlay only. No field output, no image modification, no channel system, no orientation, no phase, no profile type, no temporal mode beyond the bare `frame` param.

---

## Reference Parity Gaps

Gaps between live node and reference source (`reference/distort/scanlines/source/ScanlinesNode.js`):

| # | Gap | Direction | Severity |
|---|-----|-----------|----------|
| R1 | `frame` param present in live, absent in reference | Live ahead | LOW — intentional per G9 |
| R2 | `spacing` has `driveable: true` in live, absent in reference | Live ahead | LOW — correct per G2 |
| R3 | `driveable` params (`thickness`, `scOpacity`) not consumed via `modulate()` in `apply()` — inert in both | Both defective | HIGH |
| R4 | HOLOGRAM preset uses param key `opacity` (legacy key); live node uses key `scOpacity` | Preset key mismatch | MEDIUM — preset will silently fail to set line opacity |

Ref docs note `opacity` (legacy key) vs `scOpacity` (live key). The HOLOGRAM preset in `registry.js` line 261 reads `opacity:0.2` — this will not map to `scOpacity`; the preset is broken for this param.

---

## Review Spec Gaps

Gaps between live node and `scanlines_review2403.md` required rebuild specification:

| # | Required | Present | Severity |
|---|----------|---------|----------|
| S1 | ORIENTATION param | Absent | HIGH |
| S2 | PHASE OFFSET param | Absent | HIGH |
| S3 | LINE PROFILE TYPE (hard square / sine / triangle / Gaussian) | Absent — hard square only | HIGH |
| S4 | FIELD OUTPUT mode (scalar line field, binary mask, band index, distance-to-line) | Absent | HIGH |
| S5 | IMAGE MODIFICATION stage (luminance attenuation, chroma offset, blur on alternates) | Absent | HIGH |
| S6 | CHANNEL MODE system (MONO / RGB OFFSET / RGB SEPARATE THICKNESS / PHOSPHOR / TRIAD) | Absent | HIGH |
| S7 | Naming fix: `scOpacity` label renamed from OPACITY → LINE OPACITY | Not done — still OPACITY | HIGH |
| S8 | COMPOSITE OPACITY label on NodePanel-level opacity | Not controlled in node — global issue | MEDIUM |
| S9 | RENDER MODE beyond DARK SCANLINES (BRIGHT, CONTRAST, PHOSPHOR BANDS, RGB TRIAD, etc.) | Absent | MEDIUM |
| S10 | Image-reactive driver mapping (LUMINANCE INFLUENCE, EDGE INFLUENCE, DISTANCE-TO-EDGE) | Absent | MEDIUM |
| S11 | TEMPORAL MODE (DRIFT / PHASE SCROLL / INTERLACE ALTERNATE / JITTER / BAKED) | Absent — bare `frame` only | MEDIUM |
| S12 | DRIVER OUTPUT to downstream bus | Absent | LOW |
| S13 | DUTY CYCLE param | Absent | LOW |
| S14 | SHARPNESS / SOFTNESS param | Absent | LOW |
| S15 | CURVATURE param | Absent | LOW |
| S16 | WARP AMOUNT param | Absent | LOW |
| S17 | GROUPING COUNT param | Absent | LOW |
| S18 | BAND BRIGHTNESS, DARKENING AMOUNT, BRIGHTENING AMOUNT, CONTRAST SHAPING, GLOW/BLOOM AMOUNT, LINE EDGE HARDNESS rendering params | Absent | LOW |
| S19 | COMPOSITE DOMAIN (PRE / POST / DUAL-STAGE), LUMA-ONLY COMPOSITE, CHROMA-ONLY COMPOSITE, GAMMA-AWARE COMPOSITE | Absent | LOW |
| S20 | WARP SOURCE, WARP STRENGTH, JITTER AMOUNT, DRIFT SPEED, SYNC INSTABILITY, ANALOGUE WOBBLE, LINE DRIFT, FIELD OFFSET | Absent | LOW |

The minimum acceptable upgrade per review spec (§Minimum Acceptable Upgrade):
1. ORIENTATION — absent
2. PHASE OFFSET — absent
3. LINE PROFILE TYPE — absent
4. FIELD OUTPUT mode — absent
5. IMAGE MODIFICATION mode — absent
6. LUMINANCE-RESPONSIVE thickness or opacity — absent
7. CHANNEL MODE beyond MONO — absent

All seven minimum items are missing.

---

## Missing Parameters

Parameters absent from live node that are required (minimum acceptable) or flagged HIGH in the review:

| Key (proposed) | Label | Type | Priority |
|---|---|---|---|
| `orientation` | ORIENTATION | range (0–360°) | HIGH |
| `phase` | PHASE OFFSET | range (0–1, normalised) | HIGH |
| `profileType` | LINE PROFILE | select (HARD SQ / SOFT SQ / SINE / TRIANGLE / GAUSSIAN) | HIGH |
| `outputMode` | OUTPUT MODE | select (OVERLAY / SCALAR FIELD / BINARY MASK / BAND INDEX / DIST TO LINE) | HIGH |
| `imageModMode` | IMAGE MOD | select (NONE / LUM ATTENUATION / CHROMA OFFSET / BLUR ALTERNATES) | HIGH |
| `channelMode` | CHANNEL MODE | select (MONO / RGB OFFSET / RGB SEP THICKNESS / PHOSPHOR / TRIAD) | HIGH |
| `renderMode` | RENDER MODE | select (DARK / BRIGHT / CONTRAST / PHOSPHOR BANDS / RGB TRIAD / LUMA / CHROMA) | MEDIUM |
| `lumInfluence` | LUM INFLUENCE | range (0–1) | MEDIUM |
| `temporalMode` | TEMPORAL MODE | select (LOCKED / DRIFT / PHASE SCROLL / INTERLACE / JITTER) | MEDIUM |
| `dutyCycle` | DUTY CYCLE | range (0–1) | LOW |
| `softness` | SOFTNESS | range (0–1) | LOW |
| `curvature` | CURVATURE | range (0–1) | LOW |

---

## Extra/Incorrect Parameters

| Key | Issue | Action |
|---|---|---|
| `frame` | Present in live, absent in reference. Correct per G9 — time-based module requires FRAME. Keep. | Keep |
| `scOpacity` label `OPACITY` | Naming collision with NodePanel composite OPACITY. Must be relabelled `LINE OPACITY`. | Relabel |
| `spacing` | `driveable: true` in live but absent in reference. Correct per G2. Keep. | Keep |

No params should be removed. One label must change.

---

## UI Compliance Issues

| # | Issue | Source | Required Fix |
|---|-------|--------|--------------|
| U1 | Two params labelled `OPACITY` visible simultaneously — `scOpacity` (LINE OPACITY) and NodePanel `__opacity__` (COMPOSITE OPACITY) | review2403 §Naming Issue, issues-and-conflicts.md | Relabel `scOpacity` label to `LINE OPACITY` |
| U2 | `driveable: true` on `thickness` and `scOpacity` but `apply()` does not call `modulate()` — driver controls are silently inert | issues-and-conflicts.md, feature-parity.md | Invoke `this.getModulated(key, pixelIdx, ctx)` inside `apply()` for all driveable params |
| U3 | `driveable: true` on row-uniform params (`thickness`, `scOpacity`) is semantically undefined — the algorithm computes one factor per row, not per pixel; per-pixel modulation has no defined semantics | mechanisms.md, migration-log.md | After orientation/profile rebuild, reassess per-pixel vs per-row modulation boundary; document chosen semantics explicitly |
| U4 | `spacing` lacks `driveable: true` in reference; live adds it — correct per G2 but note semantic gap: per-pixel spacing variation is undefined for a row-uniform algorithm | G2, issues-and-conflicts.md | Add `driveable: true` to `spacing` (already present); reassess semantics post-rebuild |
| U5 | Unit label `unit: 'px'` on `spacing` is correct. Unit labels on all other params (`thickness`, `scOpacity`, `frame`) require verification against G16 standard | G16 | Confirm `unit` field present and accurate on all params |
| U6 | HOLOGRAM preset uses key `opacity` (legacy); live node uses `scOpacity` — preset silently fails to set line opacity | registry.js HOLOGRAM preset line 261 | Update HOLOGRAM preset key from `opacity` to `scOpacity` (or `scOpacity` to `lineOpacity` if key is renamed) |
| U7 | Mode-conditional params (OUTPUT MODE, IMAGE MOD, CHANNEL MODE, TEMPORAL MODE, RENDER MODE) will require G14 conditional visibility when added — plan `when` fields from the outset | G14 | All new mode params must include `when` conditions |

---

## Global Issues

| ID | Title | Impact on SCANLINES | Required Action |
|---|---|---|---|
| G1 | Driver (+D) button non-functional | All driveable params (`frame`, `spacing`, `thickness`, `scOpacity`) have inert drivers | Blocked on G1 fix; no per-module code change required beyond ensuring `modulate()` is called in `apply()` |
| G2 | All numeric params must have `driveable: true` | `spacing` now has `driveable: true` (live). `frame` has `driveable: true` (live). `thickness` and `scOpacity` have `driveable: true` (live). All numeric params compliant. However `modulate()` is not called — compliance is declaration-only | Invoke `getModulated()` for all driveable params in `apply()`; wait on G1 for UI verification |
| G5 | Slider direct input and double-click-to-default | Affects all 4 slider params | Shared component fix; no per-module code change |
| G6 | Canvas click-to-pick for centre point params | Not applicable — no centre X/Y params | None |
| G7 | Vector modules must be identifiable | Not applicable — pixel module | None |
| G9 | Time/iteration modules must expose FRAME param | `frame` param present in live node — compliant | Verify `frame` is correctly wired as the animation driver target |
| G10 | Vector modules must include SVG export | Not applicable | None |
| G11 | Shared components for overlapping features | CHANNEL MODE, TEMPORAL MODE, LINE PROFILE TYPE, OUTPUT MODE additions must use shared components if they exist; if not, build as shared first | Before adding any shared UI pattern, check component library for existing ColourRampControl, FrameSlider, NoiseSourceControl |
| G12 | Web worker usage | SCANLINES is Class A (< 6ms full res) — no worker migration required | None |
| G14 | Mode-conditional params must be hidden | Will apply when RENDER MODE, OUTPUT MODE, CHANNEL MODE, TEMPORAL MODE, IMAGE MOD MODE are added | All new mode-switched params must implement `when` conditional visibility |
| G16 | Slider inputs must display units | `spacing` has `unit: 'px'`. `thickness` has `unit: '0–1'`. `scOpacity` has `unit: '0–1'`. `frame` has `unit: 'frames'`. All present and correct. | Verify rendering of unit labels in NodePanel slider component; no param-level change needed |

---

## Merge Absorption

No previously identified merge candidates. No sister module shares the periodic row attenuation algorithm. SCANLINES is the sole module in TEXTURE category performing this function.

The review spec's eight-stage architecture and field output system conceptually overlaps with GRATING (pattern/line overlay with field output) and MOIRE (periodic interference). If field output is built as a shared pipeline bus mechanism (not per-module), SCANLINES field output should consume the same bus infrastructure. Coordinate with GRATING and MOIRE rebuild when implementing Stage 8 (field output) to avoid duplicating the output bus pattern.

---

## Required Changes (priority ordered)

### P0 — Blocking Fixes (must resolve before any feature work)

1. **Fix HOLOGRAM preset key mismatch.** `registry.js` HOLOGRAM preset line 261: change `opacity:0.2` → `scOpacity:0.2`. The current preset silently fails to set line opacity. (File: `assets/js/tools/processors/distort/nodes/registry.js`)

2. **Wire `modulate()` in `apply()`.** `apply()` currently passes `p.spacing`, `p.thickness`, `p.scOpacity` directly to `scanlines()`. All three driveable params must be resolved via `this.getModulated(key, pixelIdx, ctx)` before the algorithm call. Note: the row-uniform nature of the algorithm means per-pixel variation of `spacing` and `thickness` requires algorithm-level restructuring; at minimum, `scOpacity` can be modulated per-row if `ctx` and pixel index are available per row. Document chosen modulation boundary. (File: `assets/js/tools/processors/distort/nodes/texture/ScanlinesNode.js`)

3. **Relabel `scOpacity` label from `OPACITY` to `LINE OPACITY`.** Removes the naming collision with the NodePanel composite OPACITY control. (File: `ScanlinesNode.js`)

### P1 — Minimum Acceptable Upgrade (per review spec §Minimum Acceptable Upgrade)

4. **Add ORIENTATION param.** Range 0–360°, step 1, default 0, `driveable: true`, `unit: '°'`. Requires algorithm to support non-horizontal scanlines. Triggers algorithm restructuring from row-index modulo to angle-projected distance field. (File: `ScanlinesNode.js` + `texture-overlays.js` algorithm)

5. **Add PHASE OFFSET param.** Range 0–1, step 0.01, default 0, `driveable: true`, `unit: '0–1'`. Shifts the scanline band cycle. (File: `ScanlinesNode.js` + algorithm)

6. **Add LINE PROFILE TYPE param.** Select type: values `HARD SQ` / `SOFT SQ` / `SINE` / `TRIANGLE` / `GAUSSIAN`. Default `HARD SQ`. Mode-conditional: SOFT SQ / SINE / TRIANGLE / GAUSSIAN reveal a SOFTNESS param. (File: `ScanlinesNode.js` + algorithm)

7. **Add FIELD OUTPUT MODE param.** Select type: values `OVERLAY` / `SCALAR FIELD` / `BINARY MASK` / `BAND INDEX` / `DIST TO LINE`. Default `OVERLAY`. In non-OVERLAY modes, module writes a derived field into the output buffer rather than the composited image. Implement `when` conditions to hide inapplicable params. (File: `ScanlinesNode.js` + algorithm)

8. **Add IMAGE MOD MODE param.** Select type: values `NONE` / `LUM ATTENUATION` / `CHROMA OFFSET` / `BLUR ALTERNATES`. Default `NONE`. Implement `when` conditions. (File: `ScanlinesNode.js` + algorithm)

9. **Add CHANNEL MODE param.** Select type: values `MONO` / `RGB OFFSET` / `RGB SEP THICKNESS` / `PHOSPHOR` / `TRIAD`. Default `MONO`. In RGB OFFSET mode: expose per-channel phase offset params. In RGB SEP THICKNESS: expose per-channel thickness params. Implement `when` conditions. (File: `ScanlinesNode.js` + algorithm)

10. **Add LUMINANCE INFLUENCE param.** Range 0–1, step 0.01, default 0, `driveable: true`, `unit: '0–1'`. When > 0, source image luminance modulates line thickness or opacity. (File: `ScanlinesNode.js` + algorithm)

### P2 — High-value additions

11. **Add RENDER MODE param.** Select: `DARK` / `BRIGHT` / `CONTRAST` / `PHOSPHOR BANDS` / `RGB TRIAD` / `LUMA ONLY` / `CHROMA ONLY`. Default `DARK`. Mode-conditional sub-params: BAND BRIGHTNESS, DARKENING AMOUNT, BRIGHTENING AMOUNT, CONTRAST SHAPING. (File: `ScanlinesNode.js` + algorithm)

12. **Add TEMPORAL MODE param.** Select: `LOCKED` / `DRIFT` / `PHASE SCROLL` / `INTERLACE` / `JITTER`. Default `LOCKED`. Verify that `frame` param is the driver target for all temporal modes. (File: `ScanlinesNode.js`)

### P3 — Lower priority / deferred

13. **Add DUTY CYCLE param.** Range 0–1, step 0.01, default 0.5, `driveable: true`, `unit: '0–1'`. Explicit duty cycle when PROFILE TYPE permits it. (Currently absorbed into THICKNESS — make distinct if architecture requires it.)

14. **Add SOFTNESS param.** Range 0–1, step 0.01, default 0, `driveable: true`, `unit: '0–1'`. Edge profile transition. Conditional on LINE PROFILE TYPE ≠ HARD SQ. (File: `ScanlinesNode.js`)

15. **Add FIELD OUTPUT Stage 8 bus integration.** Coordinate with GRATING and MOIRE — share the downstream field output bus rather than each module implementing its own. Defer until bus architecture is designed.

16. **Verify `frame` wiring.** Confirm `frame` param is correctly connected to the animation driver system as the canonical time input. (File: `ScanlinesNode.js`, verify against animation system docs)

---

## Verification Criteria

After all changes, the following must be true:

| # | Criterion | Verification Method |
|---|-----------|---------------------|
| V1 | HOLOGRAM preset applies `scOpacity: 0.2` correctly — no silent key miss | Load HOLOGRAM preset; confirm line opacity visible at 0.2; check param value in NodePanel |
| V2 | `LINE OPACITY` label is shown in NodePanel tier 3 — no second bare `OPACITY` label at module param level | Inspect NodePanel UI for SCANLINES module |
| V3 | All 4 numeric params display unit labels in NodePanel | Inspect each slider row: FRAME (frames), SPACING (px), THICKNESS (0–1), LINE OPACITY (0–1) |
| V4 | Driving `scOpacity` / `thickness` via +D button (after G1 fix) produces visible per-pixel or per-row variation | Assign image driver to LINE OPACITY; confirm image-driven modulation affects output |
| V5 | ORIENTATION = 0 produces identical output to pre-rebuild at same `spacing`, `thickness`, `scOpacity` values | Pixel-compare output at ORIENTATION = 0 against reference output |
| V6 | ORIENTATION = 90 produces vertical scanlines | Visual check: vertical bands at `spacing = 4`, `thickness = 0.5` |
| V7 | PHASE OFFSET shifts band position within period without changing spacing | Increment phase from 0 to 1 continuously; bands should scroll one full period |
| V8 | LINE PROFILE TYPE = HARD SQ matches legacy output | Pixel-compare against pre-rebuild output |
| V9 | LINE PROFILE TYPE = SINE produces sinusoidal band falloff (no hard edges) | Visual inspection at `thickness = 0.5`, `spacing = 6` |
| V10 | OUTPUT MODE = SCALAR FIELD produces a greyscale periodic field in output buffer, not a composited image | Switch to SCALAR FIELD; inspect output buffer visually and numerically |
| V11 | IMAGE MOD MODE = LUM ATTENUATION modifies image luminance through the line structure | Compare LUM ATTENUATION output to OVERLAY output at same params |
| V12 | CHANNEL MODE = RGB OFFSET produces colour-fringed scanline bands | Visual check: RGB channels visibly offset at non-zero phase offsets |
| V13 | LUMINANCE INFLUENCE = 1 causes visible difference between lines over highlights vs shadows | Compare thick/dark lines in shadow areas vs thin/light lines in highlights |
| V14 | TEMPORAL MODE = PHASE SCROLL with `frame` incrementing produces animated band drift | Scrub `frame` param; bands should move continuously |
| V15 | Mode-conditional params are hidden when their parent mode is not active (G14) | Switch RENDER MODE, OUTPUT MODE, CHANNEL MODE, TEMPORAL MODE to non-default; confirm sub-params not visible |
| V16 | `frame` param `driveable: true` and wired to animation system | Confirm in animation driver documentation; test frame scrubbing |
| V17 | No linter errors introduced in `ScanlinesNode.js` or `texture-overlays.js` | ReadLints after each edit |
| V18 | HOLOGRAM preset visual output preserved after key rename | Load HOLOGRAM preset before and after; compare visual output |
