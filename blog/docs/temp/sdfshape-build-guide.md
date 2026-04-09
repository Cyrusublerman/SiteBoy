# SDFSHAPE — Build Guide

- module: sdfshape
- node: SDFShapeNode.js
- category: GEOMETRIC
- review verdict: KEEP
- rebuild severity: MAJOR

---

## Current State Summary

`SDFShapeNode.js` (23 lines) uses `createEffectModule` factory. Imports `sdfShapeRGBA` from `sdf-operations.js`. Defines 9 params across tiers 3–5. `apply(src, dst, w, h, p)` delegates entirely to `sdfShapeRGBA` and writes the result to `dst`. The module is functionally correct for its narrow current scope: analytically evaluates a SDF for CIRCLE, BOX, or RING, derives a coverage alpha, and over-composites a user-specified RGB fill over the source image. Performance is O(1) per pixel; no preview cap is needed.

The module's core architectural defect is that `apply()` omits the `modulate` and `ctx` arguments from the factory signature (`apply(src, dst, w, h, p, ctx, modulate)` is the required form per `EffectNode.js`). Seven params declare `driveable: true`; none are reachable by the driver system. This is the highest count of non-functional driver slots in the GEOMETRIC category. Secondary defect: the signed distance field value is computed and immediately discarded — no output mode, no field exposure, no mask output, no outline mode. The module exposes only one of the eight output modes mandated by the review spec. Tertiary: `fillB` is at tier 5 while `fillR` and `fillG` are at tier 4, and the three-slider colour model violates G11.

G18 note: a global issue (`_global_issues.md §G18`) flags all GEOMETRIC modules for potential removal. The per-module review verdict for sdfshape is KEEP — this build guide proceeds under KEEP. G18 does not override the per-module verdict.

---

## Reference Parity Gaps

The reference source (`reference/distort/sdfshape/source/SDFShapeNode.js`) is byte-identical to the live implementation — no reference parity gap exists at the source level. All 9 params match exactly (key, label, type, min, max, step, value, tier, driveable) and the `apply()` body is identical.

Feature-level parity holes (relative to what the reference docs define as the required upgrade state):

| Gap | Severity |
|---|---|
| `apply()` missing `ctx` and `modulate` arguments | ERROR |
| Seven driveable params produce zero per-pixel variation | ERROR |
| No OUTPUT MODE param — only fill composite available | ERROR |
| No OUTLINE mode (abs(dist) < width) | WARN |
| No MASK output mode | WARN |
| No DISTANCE FIELD output mode (raw signed/unsigned scalar) | WARN |
| No BANDED DISTANCE mode (repeated contour rings) | WARN |
| No IMAGE MODIFY mode (blur/luminance/saturation/grain by field) | WARN |
| RING annulus width hardcoded at `size × 0.15` — no THICKNESS param | WARN |
| No SCALE X, SCALE Y params (no non-uniform scale) | WARN |
| No ROTATION param | WARN |
| No ASPECT LOCK toggle | NOTE |
| Shape vocabulary limited to 3 primitives — no ELLIPSE, CAPSULE, ROUNDED BOX, POLYGON, STAR, ARC | NOTE |
| No image-modification-by-field mode | NOTE |
| No EXPORT DISTANCE FIELD, EXPORT MASK, EXPORT NORMAL, DOWNSTREAM DRIVER EXPORT | NOTE |

---

## Review Spec Gaps

From `sdfshape_review2403.md` — required changes not yet implemented:

| Item | Spec reference | Status |
|---|---|---|
| Remove `driveable: true` from all 7 range params OR implement real modulate | Action 1 [CRITICAL] | Not done |
| Expose signed distance field as OUTPUT MODE param (FILL / OUTLINE / MASK / DISTANCE / BANDED / IMAGE MODIFY) | Action 2 [CRITICAL] | Not done |
| Add OUTLINE mode with OUTLINE WIDTH param | Action 3 [HIGH] | Not done |
| Add SCALE X, SCALE Y, ROTATION, ASPECT LOCK params | Action 4 [HIGH] | Not done |
| Add RING THICKNESS param (replace hardcoded `size × 0.15`) | Action 5 [HIGH] | Not done |
| Replace FILL R / FILL G / FILL B sliders with single colour picker component (G11) | Action 6 [HIGH] | Not done |
| Add BANDED DISTANCE mode with BAND FREQUENCY and BAND OFFSET params | Action 7 [HIGH] | Not done |
| Add IMAGE MODIFY mode (BLUR BY FIELD, LUMINANCE BY FIELD, SATURATION BY FIELD, GRAIN BY FIELD) | Action 8 [HIGH] | Not done |
| Expand shape vocabulary (ELLIPSE, ROUNDED BOX, CAPSULE minimum) | Action 9 | Not done |
| Fix FILL B tier from 5 to 4 | Action 10 | Not done |
| Ensure computation remains in web worker as field complexity grows (G12) | Action 11 | Verify |
| Slider direct input + double-click-to-default (G5) | Action 13 | System-level — not done |
| Add unit labels (G16): CENTRE X/Y → none (0–1); SIZE → none; SOFTNESS → none; OUTLINE WIDTH → px | Action 14 | Not done |
| Hide primitive-specific params per active SHAPE (G14) | Action 15 | Not done |
| Canvas click-to-pick for CENTRE X/Y params (G6) | Spec §G6 | Not done |

---

## Missing Parameters

All params below are absent from the current implementation and required by the review spec.

| Key | Label | Type | Required for | Priority |
|---|---|---|---|---|
| `outputMode` | OUTPUT MODE | select: FILL / OUTLINE / MASK / DISTANCE / BANDED / IMAGE MODIFY | Core architecture | CRITICAL |
| `outlineWidth` | OUTLINE WIDTH | range, unit: px | OUTLINE mode | HIGH |
| `scaleX` | SCALE X | range 0–4, default 1, driveable | Non-uniform scale | HIGH |
| `scaleY` | SCALE Y | range 0–4, default 1, driveable | Non-uniform scale | HIGH |
| `rotation` | ROTATION | range 0–360, step 1, unit °, driveable | Shape orientation | HIGH |
| `aspectLock` | ASPECT LOCK | toggle, default true | Constrain scaleX=scaleY | HIGH |
| `ringThickness` | RING THICKNESS | range 0.01–0.5, step 0.005, driveable | RING primitive (replaces hardcoded 0.15) | HIGH |
| `bandFreq` | BAND FREQUENCY | range, driveable | BANDED DISTANCE mode | HIGH |
| `bandOffset` | BAND OFFSET | range, driveable | BANDED DISTANCE mode | HIGH |
| `fillColour` | FILL COLOUR | colour-input (G11 shared component) | Replaces fillR/fillG/fillB | HIGH |
| `outlineColour` | OUTLINE COLOUR | colour-input | OUTLINE mode | HIGH |
| `fillOpacity` | FILL OPACITY | range 0–1, driveable | Render group | MEDIUM |
| `haloAmount` | HALO AMOUNT | range, driveable | SOFT HALO mode | MEDIUM |
| `softInner` | SOFTNESS INNER | range | Distance field group | MEDIUM |
| `softOuter` | SOFTNESS OUTER | range | Distance field group | MEDIUM |
| `edgeWidth` | EDGE WIDTH | range | Distance field group | MEDIUM |
| `fieldNorm` | FIELD NORMALISE | toggle | Distance field group | MEDIUM |
| `blurByField` | BLUR BY FIELD | range, driveable | IMAGE MODIFY mode | HIGH |
| `luminanceByField` | LUMINANCE BY FIELD | range, driveable | IMAGE MODIFY mode | HIGH |
| `satByField` | SATURATION BY FIELD | range, driveable | IMAGE MODIFY mode | HIGH |
| `grainByField` | GRAIN BY FIELD | range, driveable | IMAGE MODIFY mode | HIGH |

Note: `fillColour` (colour-input) must use the shared `ColourPicker` component per G11 — it must not be built as a module-local one-off.

---

## Extra/Incorrect Parameters

| Key | Issue | Action |
|---|---|---|
| `fillR` | Replaces with `fillColour` colour-input (G11); three-slider model is a violation | Remove |
| `fillG` | Same | Remove |
| `fillB` | Same; additionally at tier 5 while R/G are tier 4 — tier inconsistency | Remove |

No other params are extra or incorrect in type. `shape`, `centreX`, `centreY`, `size`, `softness`, `invert` all have correct keys, labels, types, ranges, defaults, and steps per the reference spec.

---

## UI Compliance Issues

| Issue | Source | Severity |
|---|---|---|
| `apply(src, dst, w, h, p)` — truncated signature omits `ctx` and `modulate` | issues-and-conflicts.md, review §4.5 | ERROR |
| All 7 driveable params non-functional — `modulate` never called | review §4.5, feature-parity.md | ERROR |
| `fillB` at tier 5, `fillR`/`fillG` at tier 4 — asymmetric access to homogeneous control group | ui-layout.md §UX Notes | WARN |
| `fillR`/`fillG`/`fillB` as 3 separate 0–255 sliders — violates G11 (must use shared colour-input component) | G11, component-patterns.md §2 | WARN |
| No mode-conditional param hiding (RING THICKNESS shown when SHAPE = CIRCLE, etc.) — violates G14 | G14 | WARN |
| CENTRE X/Y lack canvas click-to-pick (G6) | G6 | NOTE |
| No unit labels on slider params (G16): CENTRE X/Y → `0–1`; SIZE → `0–1`; SOFTNESS → `0–1` | G16 | WARN |
| FILL B label already compliant (SCREAMING CASE, ≤16 chars); no label compliance issues | — | pass |
| SHAPE, CENTRE X/Y, SIZE, SOFTNESS, INVERT labels all compliant | — | pass |
| `unit` field present on all current numeric params in live impl (e.g. `unit: '0–1'`, `unit: 'lvl'`) — reference source lacks unit fields | Live impl diverges from reference source positively | NOTE (keep) |

---

## Global Issues

Issues from `_global_issues.md` that apply to sdfshape:

| ID | Issue | Impact on sdfshape | Status |
|---|---|---|---|
| G1 | +D button non-functional (NodePanel system-level) | All 7 driver slots inaccessible from UI regardless of `modulate` fix | System-level, not module-level fix |
| G2 | All numeric params must support drivers | Current impl has 7 driveable params — compliant in declaration; non-functional in execution | Fix `apply()` signature; declaration already correct |
| G5 | Slider direct input + double-click-to-default | Affects all slider params in sdfshape | System-level fix to slider component |
| G6 | Canvas click-to-pick for CENTRE X/Y | sdfshape has CENTRE X and CENTRE Y — both should support PICK CENTRE button | Module-level param + system-level handler |
| G7 | Vector modules must be identifiable | sdfshape is a pixel module — not applicable | N/A |
| G9 | Time/iteration-based modules must expose FRAME | sdfshape has no time/iteration state — not applicable | N/A |
| G10 | Vector modules must include SVG export | sdfshape is a pixel module — not applicable | N/A |
| G11 | Overlapping feature additions must use shared components | FILL COLOUR and OUTLINE COLOUR must use shared `ColourPicker` component — not a per-module implementation | Shared component must be built first; then consumed here |
| G12 | Web worker usage for expensive modules | sdfshape is O(1)/pixel — cheapest module in GEOMETRIC; no worker concern currently. As IMAGE MODIFY mode adds per-pixel passes, verify worker path | Low risk now; verify after IMAGE MODIFY added |
| G14 | Mode-conditional params must be hidden when not applicable | RING THICKNESS only valid for RING; OUTLINE WIDTH only for OUTLINE mode; IMAGE MODIFY params only for IMAGE MODIFY mode | Implement `when` conditions on new params |
| G16 | Slider/number inputs must display units | CENTRE X/Y → `0–1`; SIZE → `0–1`; SOFTNESS → `0–1`; OUTLINE WIDTH → `px`; ROTATION → `°`; SCALE X/Y → none (factor) | Add `unit` field to all range params (live impl partially done: `unit: '0–1'` on current params — correct; extend to new params) |

G18 (all GEOMETRIC modules flagged for potential removal): the per-module review verdict is KEEP. G18 does not change this — the KEEP verdict, the strong analytical foundation, and the upgrade priority stated in the review override the tentative G18 categorisation.

---

## Merge Absorption

No merge absorption is applicable. The reference source is identical to the live implementation — no changes in the reference need to be back-ported. The live implementation diverges from the reference source in one positive respect (unit fields on current params), which should be retained.

---

## Required Changes (priority ordered)

### P1 — CRITICAL: Fix apply() signature and implement modulate

**File:** `assets/js/tools/processors/distort/nodes/geometric/SDFShapeNode.js`

Change `apply(src, dst, w, h, p)` to `apply(src, dst, w, h, p, ctx, modulate)`. For each driveable param, resolve via `modulate(key, pixelIdx)` inside the per-pixel loop in `sdfShapeRGBA` (or in a new per-pixel wrapper if the algorithm function is restructured). Affected params: `centreX`, `centreY`, `size`, `softness`, `fillColour` (post-P3), `outlineWidth` (post-P2), `bandFreq` (post-P2), `bandOffset` (post-P2), `scaleX`, `scaleY`, `rotation`.

Until the algorithm is restructured (P2), the minimum fix is: declare the full signature, and pass modulated scalar values into `sdfShapeRGBA` for the existing params (`centreX`, `centreY`, `size`, `softness`). The `fillR`/`fillG`/`fillB` driver slots become moot once replaced by `fillColour` (P3), but the signature fix is still required before that.

### P2 — CRITICAL: Add OUTPUT MODE and core output modes

**Files:** `SDFShapeNode.js`, `sdf-operations.js`

Add `outputMode` param (select: FILL / OUTLINE / MASK / DISTANCE / BANDED / IMAGE MODIFY, default FILL, tier 3). Restructure `sdf-operations.js` to return the raw SDF value and expose it for branching per output mode.

Implement per mode:
- **FILL** — current behaviour (preserve exact math)
- **OUTLINE** — `abs(dist) < outlineWidth`; add `outlineWidth` range param
- **MASK** — binary or soft inside/outside mask (dist < 0 = white, dist ≥ 0 = black with softness ramp)
- **DISTANCE** — raw signed distance mapped to 0–255 output (normalise by `min(w,h)`)
- **BANDED** — `sin(dist × bandFreq + bandOffset)` mapped to 0–255; add `bandFreq`, `bandOffset` params
- **IMAGE MODIFY** — distance drives per-pixel modification of source (BLUR BY FIELD, LUMINANCE BY FIELD, SATURATION BY FIELD, GRAIN BY FIELD); add corresponding range params with G14 `when` conditions

### P3 — HIGH: Replace FILL R/G/B with shared colour-input component

**Files:** `SDFShapeNode.js`; shared component must be built first (G11)

Remove `fillR`, `fillG`, `fillB` params. Add `fillColour` param using the shared `ColourPicker` component (G11). Apply same to `outlineColour` when OUTLINE mode is added (P2). The `ColourPicker` component must be built as a shared component in the component library before being consumed here — do not build it inline in this module.

### P4 — HIGH: Add SCALE X, SCALE Y, ROTATION, ASPECT LOCK

**File:** `SDFShapeNode.js`, `sdf-operations.js`

Add params: `scaleX` (range 0.1–4, step 0.01, default 1, driveable), `scaleY` (range 0.1–4, step 0.01, default 1, driveable), `rotation` (range 0–360, step 1, unit °, driveable), `aspectLock` (toggle, default true). Apply as a 2×2 rotation+scale transform on pixel offset before SDF evaluation. Transforms existing CIRCLE into ELLIPSE, BOX into oriented rectangle. Keeps the three existing shape names valid; ellipse is achieved via CIRCLE + non-uniform scale.

### P5 — HIGH: Add RING THICKNESS param

**File:** `SDFShapeNode.js`, `sdf-operations.js`

Add `ringThickness` (range 0.005–0.5, step 0.005, default 0.15, driveable). Replace hardcoded `size × 0.15` in the RING SDF with `size × ringThickness`. Apply G14 `when: { shape: 'RING' }` condition to hide when SHAPE ≠ RING.

### P6 — HIGH: Implement G14 mode-conditional param visibility

**File:** `SDFShapeNode.js`

Add `when` conditions to all mode-conditional params:
- `ringThickness` → `when: { shape: 'RING' }`
- `outlineWidth`, `outlineColour` → `when: { outputMode: 'OUTLINE' }`
- `bandFreq`, `bandOffset` → `when: { outputMode: 'BANDED' }`
- `blurByField`, `luminanceByField`, `satByField`, `grainByField` → `when: { outputMode: 'IMAGE MODIFY' }`
- `fieldNorm`, `edgeWidth`, `softInner`, `softOuter` → `when: { outputMode: ['DISTANCE','BANDED','MASK'] }`

### P7 — HIGH: Add unit labels to all new range params (G16)

**File:** `SDFShapeNode.js`

New params requiring unit fields: `scaleX` → no unit (factor); `scaleY` → no unit; `rotation` → `°`; `ringThickness` → `0–1`; `outlineWidth` → `px`; `bandFreq` → no unit; `bandOffset` → no unit. Current params already have unit fields — retain them.

### P8 — MEDIUM: Fix FILL B tier inconsistency (immediate patch, pre-P3)

**File:** `SDFShapeNode.js`

Change `fillB` tier from 5 to 4. One-line fix. Apply before P3 removes the param entirely — serves as immediate parity fix if P3 is deferred.

### P9 — NOTE: Add PICK CENTRE button for CENTRE X/Y (G6)

**Files:** `SDFShapeNode.js`, NodePanel (system-level interaction handler)

Add a PICK CENTRE action param or button that activates a one-shot canvas click interaction to set `centreX` and `centreY`. Requires system-level support in NodePanel for canvas event routing. Module-level: add a `pickCentre` action param of type `action` with label `PICK CENTRE`.

### P10 — NOTE: Expand shape vocabulary

**File:** `SDFShapeNode.js`, `sdf-operations.js`

Add ELLIPSE (circle + non-uniform scale — may be covered by P4), ROUNDED BOX (box SDF with `cornerRadius` param), CAPSULE (line segment + radius). Extend `shape` select options. Apply G14 `when` to shape-specific params (e.g. `cornerRadius` when shape = ROUNDED BOX).

---

## Verification Criteria

After all required changes, each of the following must be independently confirmed:

1. `apply(src, dst, w, h, p, ctx, modulate)` — full signature present; `modulate` called for every driveable param at each pixel index.
2. With an image driver attached to `centreX`: shape centre moves per-pixel according to driver map luminance. Confirmed with CIRCLE shape at default size.
3. With an image driver attached to `size`: shape radius varies per-pixel. Confirmed with CIRCLE shape.
4. OUTPUT MODE = FILL produces output identical to pre-upgrade behaviour (regression check against reference `sdfShapeRGBA` output).
5. OUTPUT MODE = OUTLINE renders a visible stroke at the shape boundary; OUTLINE WIDTH param modulates stroke width.
6. OUTPUT MODE = MASK produces a binary (or soft-edged) inside/outside greyscale image; INVERT flips mask polarity.
7. OUTPUT MODE = DISTANCE produces a greyscale image where pixel values represent signed distance to the shape boundary.
8. OUTPUT MODE = BANDED produces visible concentric contour rings; BAND FREQUENCY changes ring density; BAND OFFSET shifts ring phase.
9. OUTPUT MODE = IMAGE MODIFY: BLUR BY FIELD blurs source pixels in proportion to distance from shape boundary.
10. SHAPE = RING with RING THICKNESS = 0.05 produces a visibly thin ring; RING THICKNESS = 0.4 produces a visibly thick ring.
11. SCALE X ≠ SCALE Y with SHAPE = CIRCLE produces an ellipse. ROTATION = 45 with SHAPE = BOX produces a diamond-oriented box.
12. FILL COLOUR picker sets fill colour correctly; three-slider params (`fillR`, `fillG`, `fillB`) no longer present in NodePanel.
13. FILL B no longer at tier 5 (confirm param tier = 4 before fillColour migration, tier absent afterward).
14. RING THICKNESS param is hidden when SHAPE = CIRCLE or SHAPE = BOX (G14 compliance).
15. OUTLINE WIDTH and OUTLINE COLOUR params are hidden when OUTPUT MODE ≠ OUTLINE.
16. BANDED params are hidden when OUTPUT MODE ≠ BANDED.
17. IMAGE MODIFY params are hidden when OUTPUT MODE ≠ IMAGE MODIFY.
18. Unit labels display correctly for all numeric params (G16): ROTATION shows `°`; OUTLINE WIDTH shows `px`; CENTRE X/Y show `0–1`.
19. FILL COLOUR uses the shared `ColourPicker` component — not a one-off implementation.
20. Module loads without errors, produces no NaN/crash at all param combinations including extremes (SIZE = 0.01, SOFTNESS = 0.2, ROTATION = 360, SCALE X = 4).
21. sdfshape is registered in `registry.js` under GEOMETRIC category — confirmed present (no change needed).
22. No `requestAnimationFrame`, `setInterval`, `document.*`, or `window.*` introduced by any change.
