# COLOURBALANCE — Build Guide

- module: colourbalance
- node: ColourBalanceNode.js
- category: COLOUR / TONE
- review verdict: KEEP
- rebuild severity: MINOR

---

## Current State Summary

`ColourBalanceNode.js` (live) is a `createEffectModule` factory producing a 9-param pixel effect node. It delegates pixel processing to `colourBalance()` from `shared/algorithms/image/colour-adjustments.js`. The `apply()` signature is `(src, dst, w, h, p)` and delegates directly via `dst.set(colourBalance(src, w, h, p))`.

The module is functionally correct and visually verified. The review verdict is KEEP with no functional faults. The single discrete divergence from the reference source is the addition of `driveable: true` and `unit: '%'` to all nine params in the live file — both of which are **required** by global standards G2 and G16 respectively, making this an improvement over the reference, not a regression.

All other fields (type, name, category, param keys, labels, ranges, steps, defaults, tiers) match reference exactly.

---

## Reference Parity Gaps

Comparison: live `ColourBalanceNode.js` vs reference `source/ColourBalanceNode.js`.

| Field | Reference | Live | Status |
| --- | --- | --- | --- |
| `type` | `'colourbalance'` | `'colourbalance'` | MATCH |
| `name` | `'COLOUR BALANCE'` | `'COLOUR BALANCE'` | MATCH |
| `category` | `'COLOUR / TONE'` | `'COLOUR / TONE'` | MATCH |
| `shadowR/G/B` spec | no `driveable`, no `unit` | `driveable: true`, `unit: '%'` | LIVE AHEAD — required by G2, G16 |
| `midR/G/B` spec | no `driveable`, no `unit` | `driveable: true`, `unit: '%'` | LIVE AHEAD — required by G2, G16 |
| `highR/G/B` spec | no `driveable`, no `unit` | `driveable: true`, `unit: '%'` | LIVE AHEAD — required by G2, G16 |
| `apply()` body | `dst.set(colourBalance(src, w, h, p))` | `dst.set(colourBalance(src, w, h, p))` | MATCH |
| algorithm import | `colourBalance` from colour-adjustments | `colourBalance` from colour-adjustments | MATCH |

**No regressions vs reference.** All divergences are forward additions mandated by global issues.

---

## Review Spec Gaps

Comparison: live implementation vs `colourbalance_review2403.md` requirements.

| Spec clause | Requirement | Live status |
| --- | --- | --- |
| 4.1 — params present | SHADOW R/G/B, MID R/G/B, HIGH R/G/B (all sliders) | PASS — all 9 present |
| 4.2 — SCREAMING CASE labels | All must pass | PASS — all labels conformant |
| 4.3 — primary param visible | At least one tier-3 by default | PASS — shadowR/G/B are tier 3 |
| 4.4 — controls respond across range | No broken output | PASS — verified in review |
| Action 1 — G1 fix (+D button) | Global fix; tracked in global issues | NOT IN MODULE SCOPE — NodePanel fix |
| Action 2 — driveable: true | Add where absent | PASS — already applied in live file |

Review spec has no unresolved per-module changes required beyond what is already applied.

---

## Missing Parameters

None. All nine specified params (`shadowR`, `shadowG`, `shadowB`, `midR`, `midG`, `midB`, `highR`, `highG`, `highB`) are present with correct keys, labels, ranges, steps, defaults, and tiers.

---

## Extra/Incorrect Parameters

None. No extraneous params present. No param key, label, range, step, default, or tier is incorrect relative to spec.

---

## UI Compliance Issues

### Registry

| Check | Value | Status |
| --- | --- | --- |
| `type` key | `'colourbalance'` | PASS — lowercase, no separator, unique |
| `label` | `'COLOUR BALANCE'` | PASS — SCREAMING CASE, ≤20 chars (14) |
| `description` | `'Shifts colour balance in shadows, midtones, and highlights'` | PASS — sentence case, accurate |
| `category` | `'COLOUR / TONE'` | PASS — matches registry group |
| Factory | `() => new ColourBalanceNode()` | PASS — standard factory pattern |

### Param Labels

All nine labels (`SHADOW R`, `SHADOW G`, `SHADOW B`, `MID R`, `MID G`, `MID B`, `HIGH R`, `HIGH G`, `HIGH B`) are SCREAMING CASE and ≤16 chars. PASS.

### Param Units

Live file has `unit: '%'` on all nine params. This satisfies G16. PASS.

### Param Driveability

Live file has `driveable: true` on all nine params. This satisfies G2. The `+D` button will display on all rows once G1 (NodePanel wiring) is resolved globally.

### Tier Assignment

- Tier 3: `shadowR`, `shadowG`, `shadowB` — primary, always visible. PASS.
- Tier 4: `midR`, `midG`, `midB` — secondary. PASS.
- Tier 5: `highR`, `highG`, `highB` — advanced, collapsed by default. This is correct per build-module.md §2.2 and noted in issues-and-conflicts.md. PASS.

### Colours, Glyphs, Borders

ColourBalanceNode is a data module (factory config only). It contains no UI rendering code, no DOM construction, no glyph usage, and no border declarations. UI rendering is fully owned by NodePanel. No UI compliance issues attributable to this module.

---

## Global Issues

| Issue | Applies? | Status in this module |
| --- | --- | --- |
| G1 — +D button non-functional | YES — all 9 params have `driveable: true` | Per-module data is correct; fix is a NodePanel/host issue. No action in this file. |
| G2 — all numeric params must have driveable: true | YES | RESOLVED — `driveable: true` already on all 9 range params. |
| G5 — slider: direct numeric input + double-click-to-default | YES — all 9 params are sliders | NodePanel/component fix; no action in this file. |
| G6 — canvas click-to-pick for centre params | NO | No centre X/Y params in this module. Not applicable. |
| G7 — vector modules must be identifiable | NO | This is a pixel module (isVector: false). Not applicable. |
| G9 — time-based modules must expose FRAME param | NO | This module has no time or iteration state. Not applicable. |
| G10 — vector modules: in-module SVG export | NO | Pixel module. Not applicable. |
| G11 — overlapping feature additions must use shared components | NO | No feature additions logged for this module. Not applicable. |
| G12 — web worker usage for expensive modules | NO | Module is O(n) class A/B; no worker deficiency noted. Not applicable. |
| G14 — mode-conditional params must hide when inactive | NO | No mode/type dropdown in this module; all params are always applicable. Not applicable. |
| G16 — slider/number inputs must display units | YES | RESOLVED — `unit: '%'` already present on all 9 params. |

---

## Merge Absorption

The live file has already absorbed all required changes from G2 and G16 ahead of any planned rebuild. The reference source (pre-G2/G16) is strictly older. No merge is required: the live file is the correct canonical state.

The `feature-parity.md` parity holes (no driveable params, full-p-object coupling) are both resolved or accepted:
- Parity hole 1 (no driveable) — resolved in live file.
- Parity hole 2 (full `p` object passed) — acknowledged design choice; no bug, no planned change.

---

## Required Changes (priority ordered)

### P1 — None required in ColourBalanceNode.js

The module is fully compliant as written. All nine params have correct keys, labels, ranges, steps, defaults, tiers, `driveable: true`, and `unit: '%'`. The algorithm delegation is correct. The registry entry is correct.

No changes to `ColourBalanceNode.js` are required.

### P2 — Global: G1 (NodePanel +D button wiring)

Not a change to this module. Tracked in `_global_issues.md` G1. When G1 is fixed globally, all nine `driveable: true` params in this module will become functional without any change to this file.

### P3 — Global: G5 (slider direct input + double-click-to-default)

Not a change to this module. Tracked in `_global_issues.md` G5. All nine slider params will benefit when the NodePanel/NumericInput component is updated.

---

## Verification Criteria

The following conditions must all hold for this module to be considered build-complete:

1. `type === 'colourbalance'` — lowercase, no separator.
2. `name === 'COLOUR BALANCE'` — SCREAMING CASE, ≤20 chars.
3. `category === 'COLOUR / TONE'` — matches registry group key exactly.
4. All 9 params present: `shadowR`, `shadowG`, `shadowB`, `midR`, `midG`, `midB`, `highR`, `highG`, `highB`.
5. All 9 params: `min: -100`, `max: 100`, `step: 1`, `value: 0`.
6. All 9 params: `driveable: true`.
7. All 9 params: `unit: '%'`.
8. Tier assignments: shadow* = 3, mid* = 4, high* = 5.
9. Labels: `SHADOW R`, `SHADOW G`, `SHADOW B`, `MID R`, `MID G`, `MID B`, `HIGH R`, `HIGH G`, `HIGH B` — all SCREAMING CASE, all ≤16 chars.
10. `apply(src, dst, w, h, p)` calls `dst.set(colourBalance(src, w, h, p))` with no additional logic.
11. `colourBalance` imported from `shared/algorithms/image/colour-adjustments.js`.
12. No `document.*`, `window.*`, `requestAnimationFrame`, `setInterval`, or `setTimeout` in module file.
13. No raw colours, `border-radius`, `box-shadow`, or layout math in module file.
14. Registry entry in `registry.js` has `factory: () => new ColourBalanceNode()` and correct label/description.
15. Module loads without errors on first add to the effect stack.
16. At ±100 on any param, output is non-broken (channels clamped to [0,255]); at 0 on all params, output equals source.
17. After G1 is resolved globally: clicking +D on any of the 9 params opens the driver settings panel.
