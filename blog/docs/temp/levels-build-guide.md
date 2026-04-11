# LEVELS — Build Guide

- module: levels
- node: LevelsNode.js
- category: COLOUR / TONE
- review verdict: KEEP
- rebuild severity: MINOR

---

## Current State Summary

Current implementation is a `createEffectModule` factory call (16 lines). It is functionally correct and architecturally clean: correct factory pattern, correct `apply()` signature, correct algorithm delegation to `applyLevels()`, correct param keys/labels/ranges/tiers, correct `isLUT` flag not declared (see gap below). All five params carry `driveable: true` and `unit` fields that are absent from the reference source — these are additions beyond the reference, not gaps.

The module loads without errors, produces correct output across the full param range, and is used correctly in six presets (SCAN, LIQUID, DROWNED, SIGNAL, CORRODED, ETCH).

One degenerate-input risk exists in `applyLevels()` in `colour-adjustments.js` (divide-by-zero when `blackPoint === whitePoint`). The node provides no upstream guard.

---

## Reference Parity Gaps

| Feature | Reference source | Current implementation | Status |
|---|---|---|---|
| `isLUT: true` declaration | Absent from reference `LevelsNode.js` — documented in feature-parity.md and description.md as expected | Absent from current `LevelsNode.js` | **GAP** — `isLUT: true` must be declared on the config object for LUT-chain optimisation to engage. Neither source nor current declares it at the node level. Must be added. |
| `driveable: true` on all params | Not present in reference source | Present in current (all five params) | Current is AHEAD of reference — correct, retain. |
| `unit` field on all params | Not present in reference source | Present in current (`unit: 'lvl'` / `unit: 'n'`) | Current is AHEAD of reference — aligns with G16. Retain. |
| `midGamma` at tier 4 | Tier 4 in reference | Tier 4 in current | Match. Migration log notes this was intentional. |
| Algorithm call signature | `applyLevels(src, w, h, bP, wP, γ, oB, oW)` | Identical | Match. |

**Net parity:** One gap — `isLUT: true` absent at node level. All other reference features present.

---

## Review Spec Gaps

From `levels_review2403.md`:

| Item | Spec finding | Current state | Action |
|---|---|---|---|
| G1 — +D button non-functional | Bug logged, global | Not fixable at module level — host NodePanel bug | Track in G1; no module change |
| G2 — driveable on all numeric params | All five must have `driveable: true` | All five already have `driveable: true` | **RESOLVED** in current implementation |

Review spec raises no module-specific structural issues beyond G1 and G2. Both are accounted for.

---

## Missing Parameters

None. All five documented params are present with correct keys, labels, ranges, steps, defaults, and tiers.

`isLUT: true` is a module-level metadata flag, not a user-facing param — it is a missing config field, not a missing param.

---

## Extra/Incorrect Parameters

None. Current params exactly match the documented set. The additions (`driveable: true`, `unit`) are correct extensions beyond the reference.

---

## UI Compliance Issues

LEVELS is a pure data module — it declares params; the NodePanel renders them. No UI code exists in `LevelsNode.js` itself. UI compliance issues are therefore systemic (NodePanel/host) rather than module-specific. Issues listed below are inherited from global defects.

| Issue | Source | Applicable to LEVELS |
|---|---|---|
| `+D` button non-functional (G1) | `NodePanel.js` | Yes — all five params expose `+D` |
| Slider lacks direct numeric input (G5) | `NodePanel.js` | Yes — all five params are sliders |
| Slider lacks double-click-to-default (G5) | `NodePanel.js` | Yes |
| Unit display not rendered (G16) | `NodePanel.js` | Yes — `unit: 'lvl'` and `unit: 'n'` declared but rendering unverified |
| `NodePanel.js` L427 glyph concatenated into text (semiotics §5 violation) | `NodePanel.js` | Inherited — not a LEVELS defect |
| `NodePanel.js` double border (border-system §13) | `NodePanel.js` | Inherited — not a LEVELS defect |

No UI violations are present in `LevelsNode.js` itself. All listed issues require fixes in `NodePanel.js` or the slider component.

---

## Global Issues

| Issue | Applicability to LEVELS |
|---|---|
| **G1** — +D button non-functional | YES. All five params declare `driveable: true`; the +D button renders but does not open driver settings. Blocked by NodePanel bug. |
| **G2** — all numeric params must have `driveable: true` | **RESOLVED** in current. All five params already carry `driveable: true`. No action required at module level. |
| **G5** — slider direct input + double-click-to-default | YES. All five params are range sliders. Fix is in the slider component, not in this node. |
| **G6** — canvas click-to-pick for centre params | NOT APPLICABLE. LEVELS has no centre X/Y params. |
| **G7** — vector module identification | NOT APPLICABLE. LEVELS is a pixel module. |
| **G9** — time/iteration modules must expose FRAME | NOT APPLICABLE. LEVELS is stateless; no animation state. |
| **G10** — vector modules must have SVG export | NOT APPLICABLE. |
| **G11** — shared components for overlapping feature additions | APPLICABLE only when implementing the slider direct-input and unit-display features (G5, G16) — those must use shared components, not per-module implementations. |
| **G12** — web worker usage | NOT APPLICABLE. LEVELS is O(n) LUT lookup — confirmed render cost class A. No worker required. |
| **G14** — mode-conditional params must hide when inactive | NOT APPLICABLE. LEVELS has no mode param; all five params are always active. |
| **G16** — unit labels on numeric params | YES. `unit: 'lvl'` (blackPoint, whitePoint, outBlack, outWhite) and `unit: 'n'` (midGamma) are declared. Fix is in NodePanel to render `unit` field. Module-level declarations are already correct. |

---

## Merge Absorption

The current `LevelsNode.js` already absorbs the G2 resolution (all params have `driveable: true`) and G16 preparation (`unit` fields declared). No merge from reference source is required — the current file is strictly ahead.

The one missing item (`isLUT: true`) is not in either the reference source or the current file; it must be added to the current file directly.

---

## Required Changes (priority ordered)

### P1 — Add `isLUT: true` to module config [MODERATE impact, trivial code]

**File:** `assets/js/tools/processors/distort/nodes/colour/LevelsNode.js`

The `isLUT: true` flag enables the pipeline's LUT-chain optimisation (chaining with INVERT, CURVES, POSTERIZE, TEMP/TINT to reduce pixel passes). It is documented as expected in `description.md`, `mechanisms.md`, `performance.md`, `feature-parity.md`, and `legacy-docs/levels.md`, but is absent from both the reference source and the current implementation.

Add to the `createEffectModule` config object:

```js
export const LevelsNode = createEffectModule({
  type: 'levels', name: 'LEVELS', category: 'COLOUR / TONE',
  isLUT: true,
  params: { ... }
});
```

Verify that `createEffectModule` propagates `isLUT` to the constructed node instance (check `core/EffectModule.js` — `EffectNode` initialises `this.isLUT = false` by default; factory must override it).

### P2 — Guard degenerate input in `applyLevels()` [LOW severity, risk containment]

**File:** `assets/js/shared/algorithms/image/colour-adjustments.js`

When `blackPoint === whitePoint`, the LUT build divides by zero. The `issues-and-conflicts.md` identifies this as MEDIUM risk and recommends verifying the guard in the algorithm file. This node cannot fix the algorithm, but should add an upstream clamp:

In `LevelsNode.js` `apply()`, before delegating:

```js
apply(src, dst, w, h, p) {
  const bP = p.blackPoint;
  const wP = Math.max(p.whitePoint, bP + 1); // guard: prevent divide-by-zero in LUT build
  dst.set(applyLevels(src, w, h, bP, wP, p.midGamma, p.outBlack, p.outWhite));
}
```

Alternatively verify the guard exists in `applyLevels()` and document accordingly. If the guard exists in the algorithm, this change is optional. If it does not, it is required.

### P3 — Verify `unit` field is rendered by NodePanel [DEPENDENCY — not a module change]

**File:** `assets/js/tools/processors/distort/ui/NodePanel.js`

`unit` fields are declared on all five params. Confirm NodePanel reads and renders the `unit` field alongside the numeric value readout. If not, NodePanel must be updated to render it (G16). No change required in `LevelsNode.js`.

### P4 — Fix +D button in NodePanel [DEPENDENCY — global G1]

Not a LEVELS-specific change. Tracked in G1. No module change required.

### P5 — Add slider direct-input and double-click-to-default [DEPENDENCY — global G5]

Not a LEVELS-specific change. Must be implemented in shared slider component per G11 (shared components rule). No module change required.

---

## Verification Criteria

After P1 (isLUT):
- `LevelsNode` instance has `isLUT === true` after construction.
- Pipeline places LEVELS adjacent to INVERT or CURVES and confirms LUT-chain reduces pixel passes (or at minimum, the flag is readable by the pipeline stage).

After P2 (degenerate guard):
- Setting `blackPoint === whitePoint` (e.g. both 128) produces deterministic output (all pixels map to `outWhite`), not NaN or black artefacts.
- Verify across all extreme combinations: `blackPoint = 0, whitePoint = 0`; `blackPoint = 255, whitePoint = 255`; `blackPoint = 128, whitePoint = 128`.

After P3 (unit display):
- NodePanel slider rows for LEVELS display `lvl` after numeric values for BLACK IN, WHITE IN, BLACK OUT, WHITE OUT.
- NodePanel slider row for GAMMA displays `n` after the value.

Functional regression:
- All six presets (SCAN, LIQUID, DROWNED, SIGNAL, CORRODED, ETCH) render without error.
- Each param (blackPoint, whitePoint, midGamma, outBlack, outWhite) produces correct tonal output across its full range.
- Identity state (blackPoint 0, whitePoint 255, midGamma 1, outBlack 0, outWhite 255) produces unchanged output.
