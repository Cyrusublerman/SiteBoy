# RADIALBLUR — Build Guide

- module: radialblur
- node: RadialBlurNode.js
- category: BLUR
- review verdict: KEEP
- rebuild severity: MINOR

---

## Current State Summary

`RadialBlurNode.js` is a `createEffectModule` factory node. It delegates entirely to `radialBlur()` from `blur-filters.js`. All five params are structurally correct in type, range, defaults, tier, label, and previewMax. The module is fully functional at the pixel-output level. Two defects exist: (1) `apply()` omits `modulate` from its signature and never calls it, so three `driveable: true` params are non-functional at the per-pixel level; (2) `samples` lacks `driveable: true`, which conflicts with G2. No architectural violations, no DOM usage, no rogue RAF/setInterval, no raw colours. Registry entry is correct. No mode-conditional params requiring G14 treatment (type select has no conditional sub-params). Not a vector module (G7, G10 not applicable). Not a time/iteration-based module (G9 not applicable).

---

## Reference Parity Gaps

| # | Gap | Source | Severity |
|---|-----|--------|----------|
| RP-1 | `apply()` declared as `apply(src, dst, w, h, p)` — omits `ctx` and `modulate` from signature; factory provides both but node ignores them | issues-and-conflicts.md, mechanisms.md | MODERATE |
| RP-2 | `driveable: true` params (`centreX`, `centreY`, `amount`) never call `this.getModulated(key, i, ctx)` in `apply()`; all values passed as scalars to `radialBlur()` | issues-and-conflicts.md, feature-parity.md | MODERATE |
| RP-3 | Preview samples strategy conflict: legacy doc states "samples halved" (dynamic); source uses fixed `previewMax: 6`. At user-set `samples=32`, legacy = 16; source = 6 (2.7× more restrictive). At user-set `samples=8`, legacy = 4; source = 6 (less restrictive). Intended strategy is ambiguous — fixed cap is simpler and sufficient | issues-and-conflicts.md, feature-parity.md | LOW |
| RP-4 | Scaling coefficient: legacy doc states `amount × 0.002` (zoom ±10% at max, spin ±0.1 rad at max); mechanisms.md states `0.001` from different analysis. Actual coefficient is in `blur-filters.js` — unverifiable from node source alone. No action on node required; document as known | issues-and-conflicts.md, mechanisms.md | INFO |

---

## Review Spec Gaps

| # | Gap | Source | Severity |
|---|-----|--------|----------|
| RS-1 | No PICK CENTRE canvas interaction. Review requires a button that activates one-shot canvas click-to-set for `centreX`/`centreY`. This is also tracked as global G6 | review2403, G6 | MODERATE |
| RS-2 | `+D` driver button non-functional (G1). Global infrastructure fix; no per-module code change required here beyond fixing RP-1/RP-2 to ensure the module's `apply()` is ready to receive and use modulated values when G1 is resolved | review2403, G1 | MODERATE |

---

## Missing Parameters

| # | Param | Reason | Action |
|---|-------|--------|--------|
| MP-1 | `driveable: true` on `samples` | G2 mandates all numeric params carry `driveable: true`. `samples` is a range param and currently lacks this flag | Add `driveable: true` to `samples` param definition |

---

## Extra/Incorrect Parameters

None.

---

## UI Compliance Issues

| # | Issue | Standard | Action |
|---|-------|----------|--------|
| UI-1 | `centreX` and `centreY` declare `unit: '0–1'`; `amount` declares `unit: 'n'`; `samples` declares `unit: 'n'`. Unit strings must be unambiguous per G16. `'0–1'` is a range descriptor, not a unit. `'n'` is unlabelled. Correct units: `centreX`/`centreY` → no unit (normalised, range self-describes), or `nrm`; `amount` → none applicable or `au` (arbitrary units); `samples` → `samples` or simply omit if unitless | G16 | Audit unit strings against G16 convention; correct or remove if guide permits omission for unitless counts |
| UI-2 | No PICK CENTRE button/action in NodePanel for `centreX`/`centreY`. Required by review spec and G6 | G6, review2403 | Implement shared `CentrePointPicker` component per G11 and consume it here |

---

## Global Issues

| Issue | Applicability | Status | Required Action |
|-------|--------------|--------|----------------|
| G1 — +D button non-functional | Applies | Global infrastructure; not module code | Ensure `apply()` signature accepts `modulate` (fix RP-1) so module is ready when G1 is resolved globally |
| G2 — all numeric params must be driveable | Applies | `samples` lacks `driveable: true` | Add `driveable: true` to `samples` (MP-1) |
| G5 — slider direct input + double-click-to-default | Applies | Global component fix; no module code change | None in module |
| G6 — canvas click-to-pick for centre params | Applies | Absent | Implement `CentrePointPicker` shared component; add PICK CENTRE button to NodePanel for this module (RS-1) |
| G7 — vector module identification | Does not apply | Pixel module | None |
| G9 — FRAME param for time-based modules | Does not apply | Not time/iteration-based | None |
| G10 — SVG export for vector modules | Does not apply | Pixel module | None |
| G11 — overlapping features must use shared components | Applies | PICK CENTRE must not be reimplemented per-module | Build `CentrePointPicker` as a shared component first; consume here and in twirl, spherize, lensbubbles, chromaticab |
| G12 — web worker usage | Does not apply critically | Performance class A–B at standard settings; B–C only at max samples (32) and 4K. Existing `previewMax` caps are sufficient. No offload required beyond existing pipeline worker | None required unless profiling reveals main-thread blocking |
| G14 — mode-conditional params | Partially applies | `type` select switches zoom vs spin mode but both modes share the same `amount`/`samples`/`centreX`/`centreY` params — no params are mode-exclusive. No conditional visibility needed | None |
| G16 — slider inputs must display units | Applies | Unit strings present but questionable (`'0–1'`, `'n'`) | Audit and correct unit strings per G16 convention |

---

## Merge Absorption

| Merge candidate | Instruction |
|----------------|-------------|
| G4 — consolidation of BLUR modules into one multi-mode module | Tracked as a future architectural proposal only. Do not implement in this pass. Keep radialblur as a standalone module. If G4 consolidation is ever actioned, radialblur becomes the RADIAL mode of the unified BLUR node. |

---

## Required Changes (priority ordered)

| Priority | ID | File | Change |
|----------|----|------|--------|
| 1 | FIX-1 | `RadialBlurNode.js` | Extend `apply()` signature to `apply(src, dst, w, h, p, ctx, modulate)`. This is a prerequisite for FIX-2 and for G1 resolution to take effect. |
| 2 | FIX-2 | `RadialBlurNode.js` | Implement per-pixel modulation for `centreX`, `centreY`, and `amount`. Because `radialBlur()` accepts scalar centre and amount, per-pixel variation requires either: (a) calling `radialBlur` once with mean/resolved scalar values (current behaviour, sufficient until driver system is functional), or (b) a per-pixel loop that calls `this.getModulated('centreX', i, ctx)` etc. and applies per-pixel. Option (b) is the correct G2 implementation; option (a) is the minimum signature fix. Implement (b). |
| 3 | FIX-3 | `RadialBlurNode.js` | Add `driveable: true` to `samples` param definition (MP-1 / G2). |
| 4 | FIX-4 | `RadialBlurNode.js` | Audit and correct unit strings for all params per G16. Proposed: `centreX`/`centreY` → `unit: 'nrm'` (or remove if guide permits); `amount` → remove `unit` if unitless or assign a documented abbreviation; `samples` → remove `unit` (count has no physical unit). Confirm against G16 before implementing. |
| 5 | FIX-5 | shared component (new) + NodePanel wiring | Build `CentrePointPicker` shared component (G11). Add PICK CENTRE button to NodePanel for this module. On activation: enable one-shot canvas click mode; on click, set `centreX = clickX / canvasWidth`, `centreY = clickY / canvasHeight`, deactivate pick mode. Must also apply to twirl, spherize, lensbubbles, chromaticab (G6). Do not implement per-module; build once. |

---

## Verification Criteria

| # | Criterion | Pass condition |
|---|-----------|---------------|
| V-1 | `apply()` signature | Signature is `apply(src, dst, w, h, p, ctx, modulate)` |
| V-2 | Driver modulation — centreX, centreY, amount | When a driver is attached and G1 is resolved, per-pixel values for centreX, centreY, and amount vary spatially. Without G1 fix: `getModulated` is called in apply() and returns base value correctly |
| V-3 | `samples` driveable | `paramDefs.samples.driveable === true` |
| V-4 | Unit strings | All param unit strings conform to G16 convention; no `'n'` or `'0–1'` unless G16 explicitly permits them |
| V-5 | PICK CENTRE | Button present in NodePanel for radialblur. Click activates canvas pick mode. Subsequent canvas click sets centreX/centreY. Mode deactivates after pick. |
| V-6 | PICK CENTRE shared | `CentrePointPicker` is a shared component consumed by radialblur, twirl, spherize, lensbubbles, chromaticab — not reimplemented inline in each |
| V-7 | Functional output | Radial blur (zoom and spin) produces correct visual output at all param values; no regression from FIX-1/FIX-2 changes |
| V-8 | previewMax retained | `amount` previewMax remains 15; `samples` previewMax remains 6 after changes |
| V-9 | No architectural violations | No `document.*`, `window.*`, raw RAF, raw colours, or layout math introduced |
