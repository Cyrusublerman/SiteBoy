# POLARCOORDS — Build Guide

- module: polarcoords
- node: PolarCoordsNode.js
- category: DISTORTION
- review verdict: KEEP
- rebuild severity: MINOR

---

## Current State Summary

`PolarCoordsNode.js` (14 lines) is a factory-pattern module created via `createEffectModule()`. It exposes 3 params: `mode` (select, tier 3), `centreX` (range, tier 4), `centreY` (range, tier 4). Algorithm delegates entirely to `polarCoords()` in `shared/algorithms/geometry/distortion.js`. The node is correctly registered in `registry.js` under `'DISTORTION'`. No class body; no manual DOM; no RAF/setInterval; no network calls.

Functional parity with the reference source is complete — the live file is structurally identical to the archived reference source except for two additions (`driveable: true` and `unit: '0–1'`) present in the live file but absent from the reference. These additions are correct per G2 and G16; the reference predates those global requirements.

The module is architecturally sound. No structural rebuild is required. All outstanding issues are additive or systemic (global), not regressions.

---

## Reference Parity Gaps

| # | Gap | Live file | Reference | Resolution |
|---|-----|-----------|-----------|------------|
| R1 | `driveable: true` on `centreX` and `centreY` | Present | Absent | Live is correct per G2 — no action |
| R2 | `unit: '0–1'` on `centreX` and `centreY` | Present | Absent | Live is correct per G16 — no action |
| R3 | No preview quality reduction (`ctx` param absent) | Absent in both | Absent in both | Known gap — flagged in `issues-and-conflicts.md` as [WARN]; see Required Changes |

**Conclusion:** Live source is a strict superset of the reference. No regressions. The only live–reference delta is two additive improvements. The only parity gap (R3) is pre-existing and identical in both.

---

## Review Spec Gaps

Review `polarcoords_review2403.md` fast-tracked the module as functional with no module-specific issues. All action items in the review are global:

| Action item | Global issue | Status in this build guide |
|-------------|--------------|---------------------------|
| Fix +D driver button | G1 | Tracked — systemic, not a module change |
| Audit params for `driveable: true` | G2 | Already applied (`centreX`, `centreY` have `driveable: true`); `mode` is a select — exempt |
| Slider direct input + double-click-to-default | G5 | Tracked — systemic NodePanel/slider change |

No module-specific review spec gaps exist.

---

## Missing Parameters

| # | Parameter | Justification |
|---|-----------|---------------|
| M1 | No `unit` on `mode` | `mode` is `select` type — units inapplicable. None required. |
| M2 | No preview quality ctx path | `apply()` lacks `ctx` parameter; no nearest-neighbour fallback for preview. Performance only. See RC2. |

All other parameters in the reference spec (`mode`, `centreX`, `centreY`) are present and correct.

---

## Extra/Incorrect Parameters

None. The three declared params (`mode`, `centreX`, `centreY`) match the reference spec exactly on: key name, label, type, options, default value, min, max, step, tier. No surplus or misnamed params exist.

---

## UI Compliance Issues

| # | Issue | Source | Severity |
|---|-------|--------|----------|
| U1 | `centreX` and `centreY` lack PICK CENTRE affordance | G6 | Moderate — shared component required before implementation |
| U2 | Numeric value display alignment (`text-align: center` on NumericInput) | `component-patterns.md §7`, `text-treatment.md §2` | Systemic — NodePanel/NumericInput violation, not module-level |
| U3 | Slider direct numeric input absent | G5 / `text-treatment.md §2` | Systemic — NodePanel violation |
| U4 | Double-click-to-default absent on sliders | G5 | Systemic — NodePanel violation |
| U5 | Unit display `'0–1'` is declared on `centreX`/`centreY` but must be rendered by NodePanel | G16 | Systemic — NodePanel must surface the `unit` field |

No module-level UI violations are present in `PolarCoordsNode.js` itself. All UI issues are systemic (NodePanel, NumericInput) or dependent on a shared component (CentrePointPicker) that does not yet exist.

---

## Global Issues

| Issue | Applicability to polarcoords | Required module change? |
|-------|------------------------------|------------------------|
| G1 — +D button non-functional | `centreX` and `centreY` are `driveable: true`; button is currently broken | No — fix is in NodePanel |
| G2 — All numeric params must have `driveable: true` | Already satisfied: both range params declare it; `mode` is select (exempt) | No — already compliant |
| G5 — Slider direct input + double-click-to-default | Affects both `centreX`/`centreY` slider rows | No — fix is in NodePanel/NumericInput |
| G6 — Click-to-pick for centre point params | `centreX` and `centreY` qualify | Yes — add PICK CENTRE button once shared CentrePointPicker component exists (G11 dependency) |
| G7 — Vector module identifiers | Module is pixel output, not vector | Not applicable |
| G9 — FRAME param for time-based modules | Module is static; no time/iteration state | Not applicable |
| G10 — SVG export for vector modules | Module is pixel output | Not applicable |
| G11 — Shared components before per-module feature adds | PICK CENTRE must use shared CentrePointPicker, not inline DOM | Blocks G6 implementation — build shared component first |
| G12 — Web worker for expensive modules | Module is O(w×h) with per-pixel trig; cost class B. Not among the most expensive modules. No worker escalation required currently. | No |
| G14 — Mode-conditional param visibility | `centreX` and `centreY` apply in both `rectToPolar` and `polarToRect` modes equally. No params are mode-exclusive. | Not applicable |
| G16 — Slider/number inputs must display units | `centreX`/`centreY` declare `unit: '0–1'` already; NodePanel must render it | No — module already declares units |

---

## Merge Absorption

The live file already incorporates the following improvements beyond the archived reference:

- `driveable: true` on `centreX` and `centreY` — correct per G2.
- `unit: '0–1'` on `centreX` and `centreY` — correct per G16.

No additional merge absorption is required. The reference source contains nothing the live file lacks.

---

## Required Changes (priority ordered)

| Priority | ID | Change | Location | Dependency |
|----------|----|--------|----------|------------|
| 1 | RC1 | Confirm `driveable: true` present on `centreX` and `centreY` — already done; no action | `PolarCoordsNode.js` | None — satisfied |
| 2 | RC2 | Add preview quality reduction: add `ctx` parameter to `apply()`, pass `ctx.quality` to `polarCoords()`, implement nearest-neighbour fallback in `polarCoords()` when `ctx.quality === 'preview'` | `PolarCoordsNode.js` apply signature; `shared/algorithms/geometry/distortion.js` polarCoords() | Requires distortion.js to support interp flag |
| 3 | RC3 | Add PICK CENTRE button to NodePanel for modules with `centreX`/`centreY` params — use shared CentrePointPicker component | NodePanel + new CentrePointPicker shared component | G11: build CentrePointPicker before touching module |
| 4 | RC4 | Fix NodePanel +D button event handler so driver slots open | NodePanel (G1) | Global systemic — not a polarcoords-specific change |
| 5 | RC5 | Fix NumericInput `text-align` from `center` to `right` | NumericInput component (systemic G5/text-treatment) | Global systemic |
| 6 | RC6 | Add direct numeric input and double-click-to-default to slider component | NodePanel/NumericInput (G5) | Global systemic |
| 7 | RC7 | Ensure NodePanel renders `unit` field from param definitions on all numeric rows | NodePanel (G16) | Global systemic — module already declares `unit` |

RC2 is the only change intrinsic to this module. RC3 is module-applicable but blocked on a shared component (G11). RC4–RC7 are systemic and touch only NodePanel/shared components.

---

## Verification Criteria

| # | Criterion | Pass condition |
|---|-----------|----------------|
| V1 | `mode` param present and correct | type `select`, options `['rectToPolar', 'polarToRect']`, default `'rectToPolar'`, tier 3, label `'MODE'` |
| V2 | `centreX` param present and correct | type range, min 0, max 1, step 0.01, default 0.5, tier 4, label `'CENTRE X'`, `driveable: true`, `unit: '0–1'` |
| V3 | `centreY` param present and correct | type range, min 0, max 1, step 0.01, default 0.5, tier 4, label `'CENTRE Y'`, `driveable: true`, `unit: '0–1'` |
| V4 | `apply()` delegates to `polarCoords()` with correct argument order | `polarCoords(src, w, h, p.mode, p.centreX, p.centreY)` |
| V5 | `rectToPolar` mode produces circular ring from a horizontal image | Visual confirmation: horizontally tiled source wraps into ring |
| V6 | `polarToRect` mode unrolls radial pattern into horizontal band | Visual confirmation: radially symmetric input becomes horizontal band |
| V7 | Off-centre `centreX`/`centreY` produces asymmetric output in both modes | Confirm: setting centreX=0.2 shifts polar origin visibly |
| V8 | Preview quality reduction active (after RC2) | At `ctx.quality === 'preview'`, sampling uses nearest-neighbour; preview renders faster than full at equivalent resolution |
| V9 | PICK CENTRE button sets `centreX`/`centreY` via canvas click (after RC3) | One-shot click on canvas sets both params; sliders update |
| V10 | +D button opens driver settings for `centreX` and `centreY` (after RC4) | Clicking +D on either param opens driver panel |
| V11 | Numeric readouts are right-aligned (after RC5) | NodePanel displays values right-aligned for both params |
| V12 | Unit `0–1` is displayed beside numeric values (after RC7) | NodePanel renders `0–1` suffix on `centreX` and `centreY` value readouts |
| V13 | No `document.*`, `window.*`, RAF, setInterval in module file | Static analysis confirms |
| V14 | Module registered in `registry.js` under `'DISTORTION'` | `registry.js` contains `{ type: 'polarcoords', ... factory: () => new PolarCoordsNode() }` |
