# CURVES — Build Guide

- module: curves
- node: CurvesNode.js
- category: COLOUR / TONE
- review verdict: KEEP
- rebuild severity: MINOR

---

## Current State Summary

`CurvesNode.js` is a 19-line factory module (`createEffectModule`) that delegates all computation to `buildCurvesLUT` and `applyCurvesLUT` from `colour-adjustments.js`. It declares `isLUT: true` (correct), six tonal control-point params across tiers 3–4, and a correct `apply()` signature. The module compiles, renders, and produces the expected tonal remapping output. The review verdict is KEEP with no functional bugs reported.

The sole structural delta between the current implementation and the reference source is the addition of `driveable: true` and `unit: 'lvl'` on all six params. These were added in the current implementation to satisfy G2 — they are the correct direction. No other code divergence exists.

---

## Reference Parity Gaps

Comparison: `assets/js/tools/processors/distort/nodes/colour/CurvesNode.js` vs `reference/distort/curves/source/CurvesNode.js`.

| Gap | Reference | Current | Status |
| --- | --- | --- | --- |
| `driveable` field on all params | absent | `driveable: true` on all 6 | CURRENT AHEAD — correct, keep |
| `unit` field on all params | absent | `unit: 'lvl'` on all 6 | CURRENT AHEAD — correct per G16 |
| All param keys, labels, types, ranges, defaults, tiers | identical | identical | PARITY FULL |
| `isLUT: true` | present | present | PARITY FULL |
| `apply()` body | identical | identical | PARITY FULL |
| Imports | identical | identical | PARITY FULL |

**Verdict:** Current implementation is a strict superset of the reference. No regressions. Both additions (`driveable`, `unit`) are mandated by global issues G2 and G16 respectively.

---

## Review Spec Gaps

From `curves_review2403.md`:

| Item | Spec Requirement | Current State |
| --- | --- | --- |
| G1 — +D button non-functional | Global fix required; not module-level | Out of scope for this node |
| G2 — All numeric params must have `driveable: true` | All 6 range params must declare `driveable: true` | SATISFIED — all 6 params carry `driveable: true` |

No module-specific action items beyond G1 and G2 are listed in the review. Both are addressed (G2 in the node; G1 is a NodePanel/system fix).

---

## Missing Parameters

None.

All six control-point params are present and correct: `shadowIn`, `shadowOut`, `midIn`, `midOut`, `highIn`, `highOut`.

No `unit` values other than `'lvl'` are needed — all six params share the same [0, 255] integer level scale.

No `previewMax`/`previewMin` is required: cost is O(256) LUT build + O(1) per-pixel lookup, invariant across all param values.

No FRAME param required — module is stateless; no iteration or time dependency.

No MODE param required — single algorithm, no conditional branches.

No per-channel curves params are required at this severity level. The feature-parity gap (no per-channel curves) is documented in `feature-parity.md` as a parity hole, not a correctness defect, and the review fast-tracked without raising it as an action item.

---

## Extra/Incorrect Parameters

None.

No spurious params. No duplicate keys. No params that reference absent fields in the algorithm. No tier assignments contradict the reference (`shadowIn`/`shadowOut`/`midIn`/`midOut` at tier 3; `highIn`/`highOut` at tier 4).

Note: The tier 4 assignment on `highIn`/`highOut` means highlight params are hidden in collapsed NodePanel state. This is a documented UX gap ([LOW] in `issues-and-conflicts.md`), not an error. It is not reclassified here.

---

## UI Compliance Issues

The module file itself (`CurvesNode.js`) contains no UI code. All rendering is delegated to NodePanel via the factory pattern. UI compliance issues for this module are inherited from global NodePanel violations already tracked in `border-system.md §13`, `text-treatment.md §7`, `semiotics.md §9`, and `component-patterns.md §7`. They are not module-specific and are not new findings.

Module-specific UI concerns:

1. **No control-point ordering validation** (`issues-and-conflicts.md` [HIGH]). If `midIn < shadowIn` or `highIn < midIn`, `buildCurvesLUT` receives out-of-order control points, producing a non-monotonic LUT with tonal inversions. No guard exists in params or in the LUT builder. This is a correctness defect silently accepted at runtime. Resolution: either enforce param ordering via relational constraints at the NodePanel layer (link `midIn.min` to `shadowIn` value, etc.), or add a sort-and-clamp step inside `buildCurvesLUT` before segment computation.

2. **No visual curve display** (`feature-parity.md` parity hole 4). Six numeric sliders without a curve preview is a significant UX gap but is out of scope for a MINOR rebuild.

---

## Global Issues

| Issue | Applicability to CURVES | Status |
| --- | --- | --- |
| G1 — +D button non-functional | Applies. All 6 `driveable: true` params expose +D slots that are broken at NodePanel level. | NodePanel fix required; not this module. |
| G2 — All numeric params need `driveable: true` | Applies. All 6 params are range type. | SATISFIED in current implementation. |
| G5 — Slider direct input + double-click-to-default | Applies to all 6 slider params. | NodePanel/slider-component fix; not this module. |
| G6 — Canvas click-to-pick for centre params | Does not apply. No centre X/Y params. | N/A. |
| G7 — Vector module identifiability | Does not apply. Pixel output module. | N/A. |
| G9 — Time-based modules need FRAME param | Does not apply. Stateless LUT module. | N/A. |
| G10 — Vector modules need SVG export | Does not apply. | N/A. |
| G11 — Shared components for overlapping additions | Applies only if per-channel curves are added later. Shared ColourRampControl would then be required. Not relevant for current MINOR scope. | N/A at MINOR severity. |
| G12 — Web worker for expensive modules | Does not apply. Cost class A (negligible). LUT build is O(256); per-pixel is O(1) table lookup. No worker needed. | N/A. |
| G14 — Mode-conditional params hidden when inactive | Does not apply. No MODE param, no conditional param sets. | N/A. |
| G16 — Numeric params must display units | Applies. All 6 params declare `unit: 'lvl'`. | SATISFIED in current implementation — requires NodePanel to render the `unit` field. |

---

## Merge Absorption

No open merge items. The current implementation already absorbs G2 (`driveable: true`) and G16 (`unit: 'lvl'`). No other global issues produce merge items for this module at MINOR severity.

---

## Required Changes (priority ordered)

### P1 — [HIGH] [CORRECTNESS] Add control-point ordering guard in `buildCurvesLUT`

**File:** `assets/js/shared/algorithms/image/colour-adjustments.js`  
**Issue:** `issues-and-conflicts.md` [HIGH]. If `shadowIn > midIn` or `midIn > highIn`, `buildCurvesLUT` computes negative or >1 normalised `t` values, producing a non-monotonic LUT. Tonal inversions occur silently.  
**Fix:** Inside `buildCurvesLUT`, sort the three control points by in-value before constructing segments:

```js
// Sort control points ascending by input value before segment construction
const pts = [
  [shadowIn, shadowOut],
  [midIn,    midOut   ],
  [highIn,   highOut  ]
].sort((a, b) => a[0] - b[0]);
```

This makes the LUT robust to any param ordering without altering the module's param definitions or the UI.  
**Scope:** `colour-adjustments.js` only. `CurvesNode.js` is unchanged.

---

### P2 — [MEDIUM] [STANDARDS] Confirm NodePanel renders `unit` field from param defs

**File:** NodePanel (distort UI layer) — not `CurvesNode.js`  
**Issue:** G16 requires unit labels to be displayed alongside numeric values. `CurvesNode.js` already declares `unit: 'lvl'` on all params. If NodePanel does not read and render the `unit` field, the G16 fix is incomplete at the display layer.  
**Fix:** Audit NodePanel slider rendering path to confirm it reads `paramDef.unit` and appends it to the value readout. If absent, add it.  
**Scope:** NodePanel UI component. `CurvesNode.js` is correct and unchanged.

---

### P3 — [LOW] [UX] Evaluate tier reassignment for `highIn` / `highOut`

**File:** `assets/js/tools/processors/distort/nodes/colour/CurvesNode.js`  
**Issue:** `issues-and-conflicts.md` [LOW]. `highIn` and `highOut` are at tier 4 (hidden by default). Highlight adjustment is a primary use case and should be accessible without panel expansion.  
**Options:**
- Promote both to tier 3 (all six params primary) — simplest.
- Retain tier 4 (accept the UX gap, document it).  
**Recommendation:** Promote to tier 3. Six params at tier 3 is within NodePanel capacity and eliminates a discoverability failure for highlight-curve workflows.  
**Scope:** Change `tier: 4` → `tier: 3` on `highIn` and `highOut` in `CurvesNode.js`.

---

## Verification Criteria

After implementing the required changes, all of the following must hold:

1. **LUT monotonicity under any param ordering.** Given `shadowIn = 200, midIn = 50, highIn = 100` (out-of-order), `buildCurvesLUT` must produce a monotonically non-decreasing LUT with no wrapped or inverted values. Verified by logging `lut[0..255]` and confirming `lut[i+1] >= lut[i]` for all i.

2. **Identity LUT at defaults.** `shadowIn=0, shadowOut=0, midIn=128, midOut=128, highIn=255, highOut=255` must produce `lut[i] === i` for all i in [0, 255].

3. **`driveable: true` on all six params.** Confirm via module param defs inspection that `shadowIn`, `shadowOut`, `midIn`, `midOut`, `highIn`, `highOut` all carry `driveable: true`. NodePanel must render +D buttons for each (verifiable once G1 is fixed globally).

4. **`unit: 'lvl'` on all six params.** Confirm param defs carry `unit: 'lvl'`. If NodePanel renders units, each slider readout must append `lvl`.

5. **All six params at tier 3 (if P3 accepted).** NodePanel collapsed view must display all six params without requiring panel expansion.

6. **DARKROOM preset unaffected.** Registry preset `DARKROOM` uses `{shadowIn:0, shadowOut:10, midIn:128, midOut:140, highIn:255, highOut:245}`. This is a valid ordered configuration — verify apply() produces the expected S-curve lift without regression after the ordering guard is added.

7. **No regressions against reference source.** `apply(src, dst, w, h, p)` body must remain identical to the reference. `isLUT: true` must remain declared. Imports from `colour-adjustments.js` must remain unchanged.
