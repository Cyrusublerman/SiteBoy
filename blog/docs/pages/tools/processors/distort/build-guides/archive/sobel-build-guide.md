# SOBEL — Build Guide

- module: sobel
- node: SobelNode.js
- category: EDGE
- review verdict: KEEP
- rebuild severity: MINOR

---

## Current State Summary

`SobelNode.js` uses the `createEffectModule` factory pattern. It imports `sobelEdge` from the shared edge-operators library and delegates all computation correctly. The module already includes the two-point colour ramp stage (the primary review requirement): `minColour`, `maxColour`, `rampSource`, `rampSpace`, and `rampClamp` params are declared as `type: 'internal'` with an `extendedControls` block wiring a `colour-ramp-control`. The `apply()` function performs ramp interpolation inline using `_hexToRgb`. The colour ramp is therefore **already implemented** and ahead of sibling EDGE modules (Canny, Laplacian, DoG have no ramp stage).

Remaining gaps are: missing `unit` on `threshold`, `rampSource` and `rampSpace` are declared as dropdowns in the review spec but implemented as bare `internal` strings (no `options` array), `normalize` lacks `driveable: true`, the local `_hexToRgb` utility is a duplicate of a shared concern, and `modulate()` is never called in `apply()` despite `driveable: true` on `threshold`.

---

## Reference Parity Gaps

| Gap | Source | Severity |
|-----|--------|----------|
| Reference source has no colour ramp — current implementation has it | `reference/source/SobelNode.js` | N/A (current is ahead) |
| `threshold` unit `'lvl'` declared in current; reference has no `unit` field | `feature-parity.md` | Minor |
| `normalize` tier in reference: 4 (live match); legacy doc assigns tier 5 | `feature-parity.md` | Low / cosmetic |
| `driveable: true` on `threshold` declared but `modulate()` never called — non-functional | `feature-parity.md`, `issues-and-conflicts.md` | Functional gap (but G2 global) |
| `rampSource` and `rampSpace` have no `options` array — cannot render as dropdown | current `SobelNode.js` vs review spec table | Functional |

---

## Review Spec Gaps

| Spec requirement | Status | Notes |
|-----------------|--------|-------|
| Two-point colour ramp stage after detection | **DONE** | `minColour`, `maxColour`, `rampSource`, `rampSpace`, `rampClamp` present; `extendedControls` wired |
| MIN COLOUR — colour picker | Done | `type: 'internal'`, `value: '#000000'` |
| MAX COLOUR — colour picker | Done | `type: 'internal'`, `value: '#ffffff'` |
| RAMP SOURCE dropdown: RAW MAGNITUDE / NORMALISED MAGNITUDE / POST-THRESHOLD VALUE | Partial | Declared as `type: 'internal'` with no `options` array; cannot render as dropdown |
| RAMP SPACE dropdown: RGB / HSV | Partial | Declared as `type: 'internal'` with no `options` array; HSV interpolation path absent in `apply()` |
| CLAMP BELOW THRESHOLD toggle | Partial | `rampClamp` declared but label is `'RAMP CLAMP'` not `'CLAMP BELOW THRESHOLD'`; semantics are correct |
| Processing order: detect → normalise → threshold → ramp → output | Done | `apply()` calls `sobelEdge` then runs ramp loop |
| Separate detection scalar field from colour output | Done | `sobelEdge` returns greyscale buffer; ramp loop maps it to colour |

---

## Missing Parameters

| Param | Type | Required by | Action |
|-------|------|------------|--------|
| `rampSource` `options` array | `['RAW_MAGNITUDE','NORMALISED_MAGNITUDE','POST_THRESHOLD_VALUE']` | review spec | Add `options`; change `type` to `'select'` or confirm `colour-ramp-control` reads options from here |
| `rampSpace` `options` array | `['RGB','HSV']` | review spec | Add `options`; implement HSV interpolation branch in `apply()` or shared ramp utility |
| `unit: 'lvl'` already present on `threshold` | — | G16 | Confirmed present — no action |

---

## Extra/Incorrect Parameters

| Param / Issue | Detail | Action |
|--------------|--------|--------|
| `_hexToRgb` local utility | Duplicated concern; should live in a shared colour utility module | Move to shared util; import — low priority, no functional defect |
| `rampClamp` label `'RAMP CLAMP'` | Review spec calls it `'CLAMP BELOW THRESHOLD'` | Update label to match spec |
| `rampSource` default `'NORMALISED_MAGNITUDE'` | Matches spec default — no change needed | None |

---

## UI Compliance Issues

| Issue | Standard | Detail |
|-------|---------|--------|
| `rampSource` and `rampSpace` lack `options` — cannot render as dropdown controls | `component-patterns.md` select pattern | Must add `options` arrays; `colour-ramp-control` extendedControl may handle these internally — confirm before change |
| `normalize` `driveable` absent | G2 — all numeric params driveable | `normalize` is a toggle (binary), not a continuous range; G2 targets numeric/range params. Toggle exclusion is defensible — confirm whether toggle params are in scope for G2 |
| No `unit` gap — `threshold` has `unit: 'lvl'` | G16 | Compliant |

---

## Global Issues

| Issue | Applicability | Status |
|-------|--------------|--------|
| **G1** — +D button non-functional | Applies; `threshold` has `driveable: true` | System-level bug; no per-module fix possible until G1 resolved |
| **G2** — all numeric params must have `driveable: true` | `threshold` — already has it. `normalize` is toggle, not range — likely out of scope | Verify toggle exclusion; if toggles are in scope, add `driveable: true` to `normalize` |
| **G5** — slider direct input + double-click-to-default | Applies to `threshold` slider | System-level slider component fix; no per-module action |
| **G6** — canvas click-to-pick centre point | Not applicable | No spatial origin params in this module |
| **G7** — vector module identifier | Not applicable | Pixel module, not vector |
| **G9** — time/iteration-based FRAME param | Not applicable | No animation/iteration state |
| **G10** — SVG export action for vector modules | Not applicable | Pixel output only |
| **G11** — shared component for colour ramp | Applies | `colour-ramp-control` is already wired as an `extendedControls` entry — shared pattern in use. Ensure `_hexToRgb` and ramp interpolation logic are also in a shared utility, not inlined per-module |
| **G12** — web worker offload | Low priority for this module | Class A performance (< 5 ms preview, < 20 ms full); worker offload not urgent |
| **G14** — mode-conditional param visibility | Not applicable | No MODE/TYPE dropdown; no conditional param sets |
| **G16** — unit labels on numeric params | `threshold` has `unit: 'lvl'` — compliant | None |

---

## Merge Absorption

The current `SobelNode.js` is already **ahead of the review spec** — the colour ramp stage is implemented. No merge from a separate branch is required. The implementation predates the review spec gap being raised.

Verify against sibling EDGE nodes (Canny, Laplacian, DoG): those modules still lack the colour ramp stage and must adopt the same pattern. The `colour-ramp-control` extendedControls pattern established in SobelNode should become the reference implementation for those modules.

---

## Required Changes (priority ordered)

| Priority | Change | File | Detail |
|---------|--------|------|--------|
| 1 | Add `options` array to `rampSource` and `rampSpace`; change `type` from `'internal'` to render as selectable | `SobelNode.js` | `rampSource options: ['RAW_MAGNITUDE','NORMALISED_MAGNITUDE','POST_THRESHOLD_VALUE']`; `rampSpace options: ['RGB','HSV']` — required for dropdown rendering in `colour-ramp-control` |
| 2 | Implement HSV interpolation path in `apply()` (or shared ramp utility) | `SobelNode.js` or shared util | When `p.rampSpace === 'HSV'`: convert `lo`/`hi` hex to HSV, interpolate in HSV, convert back to RGB. Currently only RGB path exists |
| 3 | Update `rampClamp` label from `'RAMP CLAMP'` to `'CLAMP BELOW THRESHOLD'` | `SobelNode.js` | Align with review spec label |
| 4 | Extract `_hexToRgb` to shared colour utility; import | `SobelNode.js` + shared util | Eliminate per-module duplication (G11 shared-component principle) |
| 5 | Wire `modulate()` for `threshold` in `apply()` | `SobelNode.js` | Replace `p.threshold` with a per-pixel call to resolve modulated value; blocked until G1 fixed but code path should be correct |
| 6 | Confirm toggle exclusion for G2 | `SobelNode.js` | If `normalize` (toggle) is in G2 scope, add `driveable: true`; if excluded, document explicitly |

---

## Verification Criteria

1. `rampSource` renders as a dropdown in the NodePanel with exactly three options: RAW MAGNITUDE, NORMALISED MAGNITUDE, POST-THRESHOLD VALUE.
2. `rampSpace` renders as a dropdown with two options: RGB, HSV.
3. Selecting HSV ramp space produces a visually distinct interpolation path (hue-traversing) vs RGB for the same min/max colours.
4. `CLAMP BELOW THRESHOLD` label is displayed correctly in the UI.
5. Changing `minColour` to non-black and `maxColour` to non-white produces correctly tinted edge output.
6. `threshold: 255` with `normalize: 1` produces a blank (fully suppressed) output.
7. `threshold: 0` with `normalize: 1` produces maximum-density edge output using minColour→maxColour ramp.
8. Alpha channel is passed through unchanged across all ramp configurations.
9. Border pixels remain zero regardless of ramp params.
10. No `_hexToRgb` defined locally — import resolves from shared utility.
11. All G16 unit labels present: `threshold` shows `lvl` suffix.
12. G1 fix (when applied system-wide): +D button on `threshold` opens driver settings.
