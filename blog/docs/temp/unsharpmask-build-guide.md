# UNSHARPMASK — Build Guide

- module: unsharpmask
- node: UnsharpMaskNode.js
- category: SHARPEN
- review verdict: KEEP
- rebuild severity: MINOR

---

## Current State Summary

Implementation is a `createEffectModule()` factory at `assets/js/tools/processors/distort/nodes/sharpen/UnsharpMaskNode.js`. Three params (`amount`, `radius`, `threshold`) delegate to `unsharpMask()` in `shared/algorithms/image/spatial-filters.js`. Algorithm is fully correct: separable Gaussian blur → detail subtraction → threshold-gated additive amplification → alpha pass-through. Registry entry is present and correct under SHARPEN category. No structural, architectural, or functional defects. Sole substantive gap is param-level: `threshold` lacks `driveable: true` (G2 compliance); `amount` lacks `unit: 'n'` in reference source but has it in live source (net improvement over reference). All global issues apply at the infrastructure level, not per-module logic.

---

## Reference Parity Gaps

| # | Gap | Reference | Live | Severity |
|---|-----|-----------|------|----------|
| R1 | `amount` unit declaration | absent (`driveable: true` only) | `unit: 'n'` present | Live is ahead of reference — no action |
| R2 | `threshold` driveable flag | absent | absent | Both lack it; G2 compliance requires adding it |
| R3 | Preview cap strategy | Legacy doc: "radius halved"; reference source uses `previewMax: 5` | `previewMax: 5` | Live matches reference source, not legacy doc. At `radius: 20`, cap is 4× more aggressive than halving (5 vs 10). Acceptable — no change required unless specified |

No gaps where live source regresses behind reference source. R1 is a live improvement. R2 is a shared omission. R3 is a documented divergence from the legacy doc, not from the reference source.

---

## Review Spec Gaps

The review (unsharpmask_review2403.md) was fast-tracked with verdict KEEP and no module-specific functional issues. Action items recorded:

1. Fix +D driver button — global G1, not module-level.
2. Audit params for `driveable: true` — global G2; per-module action is adding `driveable: true` to `threshold`.

No review-spec gaps beyond those addressed under Global Issues below.

---

## Missing Parameters

None. The three params (`amount`, `radius`, `threshold`) constitute full feature parity with the reference source and legacy docs. No params are absent that should be present.

---

## Extra/Incorrect Parameters

None. No spurious, misnamed, or wrongly-ranged params.

---

## UI Compliance Issues

| # | Issue | Location | Requirement |
|---|-------|----------|-------------|
| U1 | `threshold` has no `unit` declaration | param definition | G16 requires all numeric params to declare a unit; `threshold` unit is `lvl` (0–255 level scale) — add `unit: 'lvl'` |
| U2 | `amount` unit declared as `'n'` | param definition | `'n'` is non-standard; reference unit for a dimensionless multiplier is `×` or omitted. Confirm with semiotics guide before changing. Low priority |
| U3 | `threshold` at tier 4 is undiscoverable for noise-sensitive workflows | param definition | UX concern only — no functional defect. Raising to tier 3 is optional but not required by any standard |

---

## Global Issues

Issues that apply at the infrastructure level and require no per-module code change unless noted. Where a per-module action is required, it is stated explicitly.

| ID | Title | Per-module action required? | Status |
|----|-------|----------------------------|--------|
| G1 | +D driver button non-functional | No — infrastructure fix | Open |
| G2 | All numeric params must have `driveable: true` | **YES** — `threshold` lacks `driveable: true`; `amount` and `radius` already have it | Open |
| G5 | Slider: direct numeric input + double-click-to-default | No — component fix | Open |
| G6 | Canvas click-to-pick for centre-point params | No — this module has no centre params | N/A |
| G7 | Vector modules must be identifiable | No — this module is pixel output | N/A |
| G9 | Time/iteration-based modules must expose FRAME param | No — this module is stateless | N/A |
| G10 | Vector modules must include in-module SVG export | No — pixel output | N/A |
| G11 | Shared components for overlapping feature additions | No direct action — monitor component library | Open |
| G12 | Web worker usage for expensive modules | No immediate action — `radius: 20` is Class C (~150–400 ms at full res); candidate for worker offload but not blocking | Open |
| G14 | Mode-conditional params must be hidden when not applicable | No — this module has no mode param | N/A |
| G16 | Slider/number inputs must display units | **YES** — `threshold` lacks `unit` declaration; add `unit: 'lvl'` | Open |

---

## Merge Absorption

No merge candidates. This module has no per-module structural issues that would be resolved by absorbing another module's logic or being absorbed into another.

Architectural note (recorded, not actioned here): `gaussianBlurRGBA` in `spatial-filters.js` is a private function duplicated independently from `gaussianBlurSeparable` in `blur-filters.js`. Two Gaussian implementations exist in parallel. Not a blocker for this module; a shared-library rationalisation task for a later phase.

`driveable: true` on `radius` is architecturally misleading: `gaussianBlurRGBA` is called once with a scalar sigma before the per-pixel loop. Per-pixel radius modulation is not structurally possible without algorithm redesign (multi-scale pyramid or per-pixel blur). This is a documented known issue (issues-and-conflicts.md). No action taken here — the declaration remains as a forward-compatibility marker; the G1 fix will surface this as non-functional driving, not incorrect output.

---

## Required Changes (priority ordered)

| Priority | Change | File | Detail |
|----------|--------|------|--------|
| 1 | Add `driveable: true` to `threshold` param | `UnsharpMaskNode.js` | G2 compliance. `threshold` is a range param. Change: `threshold: { value: 0, min: 0, max: 255, step: 1, label: 'THRESHOLD', tier: 4, driveable: true, unit: 'lvl' }` |
| 2 | Add `unit: 'lvl'` to `threshold` param | `UnsharpMaskNode.js` | G16 compliance. Combine with change 1. |
| 3 | Verify `unit: 'n'` on `amount` against semiotics guide | `UnsharpMaskNode.js` | If `'n'` is non-standard, replace with correct unit token. Low priority — does not affect rendering. |

All three changes are confined to a single param definition line in `UnsharpMaskNode.js`. No algorithm, architecture, or registry changes required.

---

## Verification Criteria

After applying required changes:

1. `threshold` param definition contains `driveable: true` — confirm in source.
2. `threshold` param definition contains `unit: 'lvl'` — confirm in source.
3. `amount` and `radius` retain existing `driveable: true` — confirm unchanged.
4. `previewMax: 5` on `radius` is unchanged — confirm.
5. `apply()` body is unchanged — no regression to algorithm.
6. Registry entry `{ type: 'unsharpmask', label: 'UNSHARP MASK', ... }` under SHARPEN is unchanged.
7. Module renders identically to pre-change at all param combinations — no visual regression.
8. When G1 is fixed globally: +D button on `threshold`, `amount`, and `radius` opens driver settings panel.
9. When G16 component fix is applied: NodePanel renders `lvl`, `px`, and `n` unit suffixes correctly for all three params.
