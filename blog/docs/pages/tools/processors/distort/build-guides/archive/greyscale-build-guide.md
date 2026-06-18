# GREYSCALE — Build Guide

- module: greyscale
- node: GreyscaleNode.js
- category: COLOUR / TONE
- review verdict: KEEP
- rebuild severity: MINOR

---

## Current State Summary

`GreyscaleNode.js` is 14 lines. It uses `createEffectModule` factory, delegates entirely to `greyscale()` from `colour-adjustments.js`, and exposes three range params (`wr`, `wg`, `wb`) at correct defaults (BT.601). The module is registered, renders correctly, and produces expected output across the full parameter range. No architectural violations, no forbidden DOM/RAF/setInterval usage, no inline layout math. The only delta between current and reference source is the addition of `driveable: true` on all three params — which is the sole required fix beyond global issue applicability.

---

## Reference Parity Gaps

| Gap | Location | Severity |
|---|---|---|
| Reference source has no `driveable` on any param; current impl adds `driveable: true` on all three | `params.wr/wg/wb` | Resolved — current impl is *ahead* of reference, which is correct per G2 |
| Reference source has no `unit` field on any param; current impl adds `unit: '0–1'` on all three | `params.wr/wg/wb` | Resolved — current impl is ahead of reference, correct per G16 |

Reference parity: **current impl is a strict superset of the reference source**. No regressions. No missing features.

---

## Review Spec Gaps

| Review Clause | Status |
|---|---|
| A1.3 — Name displays "MODULE" in CategoryPicker → NO | Not addressed in current impl. CategoryPicker display logic is outside `GreyscaleNode.js` — must be fixed in the CategoryPicker component, not here. Tracked separately. |
| A7.8 — +D button non-functional | Global issue G1; not addressable in module source. |
| All other review clauses | Pass — no action required. |

---

## Missing Parameters

None. All three weight params present at correct defaults, range, step, and tier.

---

## Extra/Incorrect Parameters

None. No spurious params. Tier assignments match reference and ui-layout spec (`wr`=3, `wg`=3, `wb`=4).

---

## UI Compliance Issues

| Issue | Source | Severity |
|---|---|---|
| CategoryPicker shows full category string "COLOUR / TONE" rather than "MODULE" badge for module name | A1.3 in review; CategoryPicker component, not GreyscaleNode.js | MINOR — fix in CategoryPicker, not module source |

No NodePanel-level UI compliance issues attributable to the module source itself. Labels are SCREAMING CASE. No truncation. All tier assignments correct.

---

## Global Issues

| ID | Applicable? | Impact on GREYSCALE | Action in module source |
|---|---|---|---|
| G1 | YES | +D button on `wr`, `wg`, `wb` non-functional; driver settings panel does not open | None — fix in NodePanel host component |
| G2 | YES — **RESOLVED in current impl** | All three range params already have `driveable: true` | No further action needed |
| G5 | YES | Sliders on `wr`, `wg`, `wb` lack direct numeric input and double-click-to-default | None — fix in slider component |
| G6 | NO | No centre X/Y params | — |
| G7 | NO | Pixel module, not vector | — |
| G9 | NO | No time/iteration state | — |
| G10 | NO | Not a vector module | — |
| G11 | YES (passive) | No shared components required by this module specifically; monitor for future additions | None |
| G12 | NO | O(n) constant cost; no blocking path; no worker migration needed | — |
| G14 | NO | No mode/dropdown params; no conditional visibility required | — |
| G16 | YES — **RESOLVED in current impl** | All three params carry `unit: '0–1'` | No further action needed |

---

## Merge Absorption

The current `GreyscaleNode.js` already absorbs the two most relevant global issue requirements:

- **G2** (`driveable: true` on all numeric params) — present on `wr`, `wg`, `wb`.
- **G16** (`unit` field on all numeric params) — present as `unit: '0–1'` on all three.

No further merge absorption required in module source. G1 and G5 require fixes in NodePanel/slider components external to this file.

---

## Required Changes (priority ordered)

| Priority | Change | Location | Reason |
|---|---|---|---|
| 1 | Fix +D driver button event handler | NodePanel component | G1 — currently non-functional; `driveable: true` is wired in module but UI entry point is broken |
| 2 | Slider: add direct numeric input + double-click-to-default | Slider component | G5 — affects all three params |
| 3 | CategoryPicker: display "MODULE" badge / correct name display | CategoryPicker component | A1.3 review finding |

**No changes required to `GreyscaleNode.js` itself.** The module source is complete and compliant.

---

## Verification Criteria

1. Adding GREYSCALE node renders a neutral greyscale output with default BT.601 weights (R=0.299, G=0.587, B=0.114).
2. Adjusting `wr`, `wg`, `wb` independently produces visually distinct greyscale mappings across full [0,1] range.
3. Setting all weights to zero produces solid black output; alpha is preserved unchanged.
4. Setting `wr=1, wg=0, wb=0` isolates the red channel as luminance source.
5. All three params display `driveable: true` (slot exists in NodePanel param row).
6. All three params display unit label `0–1` in NodePanel.
7. No JS errors on load, apply, or destroy.
8. Module appears in COLOUR / TONE category in CategoryPicker.
9. After G1 fix: clicking +D on any weight param opens the driver settings panel.
10. After G5 fix: clicking the numeric value field enables direct text entry; double-click resets to default.
