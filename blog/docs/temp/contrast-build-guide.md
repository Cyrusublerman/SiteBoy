# CONTRAST — Build Guide

- module: contrast
- node: ContrastNode.js (`assets/js/tools/processors/distort/nodes/colour/ContrastNode.js`)
- category: COLOUR / TONE
- review verdict: KEEP
- rebuild severity: MODERATE

---

## Current State Summary

Current implementation uses `createEffectModule` factory (correct). Imports `liftGammaGain` from `colour-adjustments.js`. Defines 5 params: `lift`, `gamma`, `gain`, `contrast`, `pivot`. All 5 params have `driveable: true` and correct ranges — this is an **improvement over the reference source** (reference has no `driveable` keys). The `apply()` call is correct. Module is registered in `registry.js` with label `'LIFT/GAM/GAIN'`, which the review flags as wrong (must be `'CONTRAST'`). VibranceNode is still registered separately in the registry and must be removed once its functionality is absorbed.

**Critical gap:** The `vibrance` param from VibranceNode has not been absorbed. The `DARKROOM` preset references `type:'vibrance'` as a separate node — this preset must be updated once vibrance is merged.

---

## Reference Parity Gaps

Comparison: current `ContrastNode.js` vs `reference/distort/contrast/source/ContrastNode.js`.

| Function / Feature | Reference | Current | Status |
|---|---|---|---|
| `createEffectModule` factory | ✓ | ✓ | MATCH |
| `liftGammaGain` import | ✓ | ✓ | MATCH |
| `type: 'contrast'` | ✓ | ✓ | MATCH |
| `name: 'LIFT/GAM/GAIN'` | ✓ | ✓ | MATCH (flagged for rename — see review) |
| `category: 'COLOUR / TONE'` | ✓ | ✓ | MATCH |
| `lift` param (value:0, min:-0.5, max:0.5, step:0.01, tier:3) | ✓ | ✓ | MATCH |
| `gamma` param (value:1, min:0.2, max:3, step:0.01, tier:3) | ✓ | ✓ | MATCH |
| `gain` param (value:1, min:0, max:3, step:0.01, tier:3) | ✓ | ✓ | MATCH |
| `contrast` param (value:0, min:-1, max:1, step:0.01, tier:4) | ✓ | ✓ | MATCH |
| `pivot` param (value:0.5, min:0, max:1, step:0.01, tier:4) | ✓ | ✓ | MATCH |
| `driveable: true` on all range params | ✗ (absent in ref) | ✓ | CURRENT AHEAD OF REF — correct per G2 |
| `unit` field on params | ✗ (absent in ref) | ✓ (partial: `'n'` and `'0–1'`) | CURRENT AHEAD OF REF — required per G16 |
| `apply(src, dst, w, h, p)` signature | ✓ | ✓ | MATCH |
| `dst.set(liftGammaGain(...))` | ✓ | ✓ | MATCH |
| `vibrance` param (merge target) | ✗ (absent in ref — pre-merge) | ✗ | MISSING — required by vibrance_review2403 |
| `isLUT: true` declaration | ✗ (absent) | ✗ | DEFERRED — see issues-and-conflicts.md; requires `buildLUT` method verification |

**Net parity gap:** The only material gap vs the reference source is the absence of the `vibrance` param (which the reference predates the merge decision). The `driveable` and `unit` additions in the current file are correct improvements.

---

## Review Spec Gaps

From `contrast_review2403.md` action items:

| Action | Status |
|---|---|
| 1. Correct CategoryPicker display name from `'LIFT/GAM/GAIN'` to `'CONTRAST'` | **NOT DONE** — registry.js line 110 still reads `label: 'LIFT/GAM/GAIN'` |
| 2. Fix +D driver button (global G1) | **NOT DONE** — global issue; tracked separately |
| 3. Audit all params for `driveable: true` (global G2) | **DONE** — all 5 current params have `driveable: true` |

From `vibrance_review2403.md` action items (merge target):

| Action | Status |
|---|---|
| 1. Add VIBRANCE slider param to CONTRAST module | **NOT DONE** |
| 2. Remove vibrance module and its CategoryPicker entry | **NOT DONE** — VibranceNode still imported and registered in registry.js |

---

## Missing Parameters

| Key | Label | Type | Min | Max | Step | Default | Tier | Driveable | Unit | Source |
|---|---|---|---|---|---|---|---|---|---|---|
| `vibrance` | VIBRANCE | range | -1 | 1 | 0.01 | 0 | 4 | true | `'n'` | absorbed from VibranceNode |

**Absorption rationale:** `vibrance_review2403.md` verdict is `MERGE(contrast)`. The vibrance algorithm (`applyVibrance`) is a saturation booster that applies more boost to less-saturated pixels: `amt = vibrance × (1 − sat)²`, then per-channel `x + (x − avg) × amt`. At `vibrance = 0`, output equals input — safe identity default. The parameter is tier 4 (secondary), grouped with `contrast` and `pivot`.

---

## Extra/Incorrect Parameters

None. All 5 existing params (`lift`, `gamma`, `gain`, `contrast`, `pivot`) are correct, within-spec, and match the reference source exactly.

The `unit` values `'n'` (normalised) and `'0–1'` are currently inconsistent: `lift`, `gamma`, `gain`, `contrast` use `'n'`; `pivot` uses `'0–1'`. These are equivalent semantically but inconsistent in form. Standardise all 5 params (plus incoming `vibrance`) to `'n'` for consistency, or retain `'0–1'` for `pivot` only if the UI renders it differently. This is a minor style issue, not a blocking defect.

---

## UI Compliance Issues

### Registry Label (BLOCKING)
- **File:** `assets/js/tools/processors/distort/nodes/registry.js`, line 110
- **Current:** `label: 'LIFT/GAM/GAIN'`
- **Required:** `label: 'CONTRAST'`
- **Source:** `contrast_review2403.md` §Issues [WARN] [STANDARDS]
- **Impact:** Module is misidentified in the CategoryPicker; users cannot locate it by canonical name.

### VibranceNode Still Registered (BLOCKING for merge)
- **File:** `registry.js`, line 13 (import) and line 116 (registry entry)
- **Current:** VibranceNode imported and registered as `type: 'vibrance'`, `label: 'VIBRANCE'`
- **Required:** Remove both after absorbing `vibrance` param into ContrastNode
- **Impact:** Duplicate module; vibrance functionality will exist in two places until removal.

### DARKROOM Preset (BLOCKING for merge)
- **File:** `registry.js`, line 271
- **Current:** `{type:'vibrance', enabled:true, opacity:1, params:{vibrance:0.3}}`
- **Required:** After merge, this node type will not exist. Preset must be updated to use `type:'contrast'` with all 5 original params at identity defaults plus `vibrance:0.3`.
- **Impact:** DARKROOM preset will fail to resolve the `vibrance` type after VibranceNode is removed.

### Node Name vs Type Inconsistency (DOCUMENTED — DO NOT CHANGE)
- **Current:** `type: 'contrast'`, `name: 'LIFT/GAM/GAIN'`
- **Status:** Intentionally frozen. Renaming `type` breaks preset serialisation. The registry label rename to `'CONTRAST'` (see above) is the correct fix for UI visibility. The module's `name` field in the factory definition (`LIFT/GAM/GAIN`) is algorithm-specific and can remain as-is — it is not the CategoryPicker label.

### CategoryPicker Glyph DOM Structure
- **File:** `assets/js/tools/processors/distort/ui/CategoryPicker.js`, line 108
- **Violation:** Glyph is concatenated into text string (semiotics.md §5 violation — existing codebase violation, not introduced by this module)
- **Status:** Pre-existing global violation; not attributable to ContrastNode. Do not fix as part of this module's build unless explicitly requested.

---

## Global Issues

Issues from `_global_issues.md` that apply to ContrastNode:

| Issue | Applicability | Status |
|---|---|---|
| **G1** — Driver (+D) button non-functional | All params have `driveable: true` but the button event handler is broken globally | Pre-existing; not a ContrastNode defect; requires NodePanel fix |
| **G2** — All numeric params must support drivers | All 5 current params have `driveable: true` ✓; incoming `vibrance` param must also have `driveable: true` | Compliant once `vibrance` is added with `driveable: true` |
| **G5** — Slider: direct number input and double-click-to-default | All 5 params are range sliders; this UX is missing globally from the slider component | Pre-existing global component defect; not a ContrastNode defect |
| **G6** — Canvas click-to-pick for centre point params | N/A — no centre X/Y params in this module | Not applicable |
| **G7** — Vector module identifier | N/A — ContrastNode is a pixel module (`isVector: false`) | Not applicable |
| **G9** — Time/iteration modules must expose FRAME param | N/A — ContrastNode has no temporal state | Not applicable |
| **G10** — Vector modules must include SVG export action | N/A — pixel module | Not applicable |
| **G11** — Shared components for overlapping features | No new shared components introduced by this module | Not applicable |
| **G12** — Web worker usage | ContrastNode is cost class A (O(n) LUT lookup); main-thread execution is acceptable | No action required for this module |
| **G14** — Mode-conditional params must be hidden | ContrastNode has no mode dropdown; all params are always applicable | Not applicable |
| **G16** — Slider/number inputs must display units | Current params use `unit: 'n'` and `unit: '0–1'`; incoming `vibrance` must include `unit: 'n'` | Partially compliant; `vibrance` must be added with a `unit` field |

---

## Merge Absorption

**Source module:** VibranceNode (`assets/js/tools/processors/distort/nodes/colour/VibranceNode.js`)
**Verdict authority:** `vibrance_review2403.md` — verdict `MERGE(contrast)`

### What the Vibrance Algorithm Does

`applyVibrance(src, w, h, vibrance)` iterates every pixel in RGBA space:
1. Normalise R, G, B to [0,1].
2. Compute per-pixel saturation: `sat = max(R,G,B) − min(R,G,B)`.
3. Compute boost amount: `amt = vibrance × (1 − sat)²` — this is the intelligent saturation scaling: less-saturated pixels receive more boost; already-saturated pixels receive less (quadratic rolloff).
4. Compute per-pixel average: `avg = (R + G + B) / 3`.
5. Per-channel output: `out = (channel + (channel − avg) × amt) × 255`, clamped to [0,255].
6. Alpha is passed through unchanged.

At `vibrance = 0`, `amt = 0` for all pixels — output equals input (identity).

### What Must Be Added to ContrastNode

**1. Import `applyVibrance`:**
```js
import { liftGammaGain, applyVibrance } from '../../../../../shared/algorithms/image/colour-adjustments.js';
```

**2. Add `vibrance` param definition:**
```js
vibrance: { value: 0, min: -1, max: 1, step: 0.01, label: 'VIBRANCE', tier: 4, driveable: true, unit: 'n' }
```
Tier 4 — secondary, grouped with `contrast` and `pivot`. Default 0 = identity.

**3. Update `apply()` to chain vibrance after lift/gamma/gain:**
```js
apply(src, dst, w, h, p) {
  const toned = liftGammaGain(src, w, h, p.lift, p.gamma, p.gain, p.contrast, p.pivot);
  dst.set(p.vibrance !== 0 ? applyVibrance(toned, w, h, p.vibrance) : toned);
}
```
The conditional (`p.vibrance !== 0`) avoids the `applyVibrance` allocation cost when vibrance is at its identity default. The same pattern is used by `liftGammaGain` internally for the contrast pivot step.

**Note on execution order:** Vibrance is applied after the full LGG tonal chain, not before. This mirrors the conventional colour grading pipeline: tone (exposure/contrast) first, then saturation adjustment. Reversing the order would cause vibrance to operate on the ungraded source, which is not the intended behaviour.

### What Must Be Removed

1. **`registry.js`** — remove the `VibranceNode` import (line 13).
2. **`registry.js`** — remove the `vibrance` entry from the `'COLOUR / TONE'` array (line 116).
3. **`registry.js`** — update the `DARKROOM` preset (line 270–272): replace `{type:'vibrance', ...params:{vibrance:0.3}}` with a `{type:'contrast', ...}` node that includes all LGG params at identity defaults (`lift:0, gamma:1, gain:1, contrast:0, pivot:0.5`) and `vibrance:0.3`.
4. **`VibranceNode.js`** — delete file (`assets/js/tools/processors/distort/nodes/colour/VibranceNode.js`) after registry cleanup is confirmed.

---

## Required Changes (priority ordered)

**P1 — Registry label rename (review blocker)**
- File: `registry.js`, line 110
- Change: `label: 'LIFT/GAM/GAIN'` → `label: 'CONTRAST'`
- Prerequisite: none

**P2 — Add `vibrance` param to ContrastNode (merge requirement)**
- File: `ContrastNode.js`
- Add import of `applyVibrance` from `colour-adjustments.js`
- Add `vibrance` param: `{ value: 0, min: -1, max: 1, step: 0.01, label: 'VIBRANCE', tier: 4, driveable: true, unit: 'n' }`
- Update `apply()` to call `applyVibrance` after `liftGammaGain` when `p.vibrance !== 0`
- Prerequisite: none

**P3 — Remove VibranceNode from registry (merge requirement)**
- File: `registry.js`
- Remove import of `VibranceNode` (line 13)
- Remove `vibrance` registry entry from `'COLOUR / TONE'` array (line 116)
- Prerequisite: P2 must be complete and tested first

**P4 — Update DARKROOM preset (merge requirement)**
- File: `registry.js`, `PRESETS.DARKROOM`
- Replace `{type:'vibrance', opacity:1, params:{vibrance:0.3}}` with `{type:'contrast', enabled:true, opacity:1, params:{lift:0, gamma:1, gain:1, contrast:0, pivot:0.5, vibrance:0.3}}`
- Prerequisite: P2 must be complete; P3 should be complete before testing

**P5 — Delete VibranceNode.js file**
- File: `assets/js/tools/processors/distort/nodes/colour/VibranceNode.js`
- Delete after P3 and P4 are confirmed stable
- Prerequisite: P3, P4

**P6 — Standardise `unit` field (minor consistency)**
- File: `ContrastNode.js`
- All 6 params (existing 5 + vibrance) should use a consistent unit token. Decide between `'n'` (normalised) for all, or retain `'0–1'` for `pivot` only. Either is acceptable; pick one.
- Prerequisite: P2 (so all params exist before standardising)

---

## Verification Criteria

After all changes, each criterion must pass:

1. **CategoryPicker** — the CONTRAST module appears under `COLOUR / TONE` with label `CONTRAST`, not `LIFT/GAM/GAIN`.
2. **VIBRANCE param present** — ContrastNode NodePanel shows a VIBRANCE slider (tier 4, range −1 to 1, default 0).
3. **Vibrance identity** — with `vibrance = 0` and all other params at defaults, input image passes through unchanged (pixel-perfect).
4. **Vibrance positive** — with `vibrance = 0.5`, muted/desaturated areas of a test image show increased saturation; highly saturated areas show minimal change (quadratic rolloff verified).
5. **Vibrance negative** — with `vibrance = -0.5`, muted areas show reduced saturation (desaturation targeting).
6. **LGG + vibrance chain** — applying non-identity LGG params alongside `vibrance ≠ 0` produces the expected tonal + saturation result; no bleed between the two transforms.
7. **VibranceNode absent from registry** — CategoryPicker no longer shows a separate VIBRANCE module.
8. **DARKROOM preset** — loading the DARKROOM preset produces correct output; no errors from an unresolved `vibrance` type.
9. **VibranceNode.js deleted** — no import of VibranceNode anywhere in the codebase resolves (no dangling references).
10. **All 6 params driveable** — all params in ContrastNode have `driveable: true`; the +D button is visible on all param rows (button functionality depends on G1 global fix).
11. **All 6 params have `unit` field** — no param definition is missing a `unit` key.
12. **LIQUID preset unaffected** — loading the LIQUID preset still produces correct output; its `type:'contrast'` node serialisation is unchanged.
