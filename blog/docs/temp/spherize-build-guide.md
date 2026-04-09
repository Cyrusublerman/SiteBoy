# SPHERIZE — Build Guide

- module: spherize
- node: SpherizeNode.js
- category: DISTORTION
- review verdict: KEEP
- rebuild severity: MINOR

---

## Current State Summary

Factory-pattern module via `createEffectModule()`. Imports and delegates to `spherize()` from `shared/algorithms/geometry/distortion.js`. Four params: `amount`, `radius`, `centreX`, `centreY`. Preview quality switch via `ctx.quality === 'preview'` → nearest-neighbour. No presets. Registered in `registry.js` under `// ── Distortion ──`. Architecturally sound.

Divergences from reference source are small but non-trivial: `centreX` and `centreY` have gained `driveable: true` (not in reference, not wired); all four params have gained `unit` fields (not in reference); `AMOUNT` max is flagged in the review spec as too low but the actual range (−1 to 1) is identical between live and reference — the review complaint targets the absolute ceiling of the distortion effect, not a discrete param difference. No functional algorithm change. No architectural violation.

---

## Reference Parity Gaps

| # | Item | Live | Reference | Resolution |
|---|------|------|-----------|------------|
| R1 | `centreX` `driveable` | `true` | absent | Live has **extra** flag; reference omits it. Apply() does not accept `modulate` — flag is non-functional in both. Live addition is premature but harmless. Remove or wire. |
| R2 | `centreY` `driveable` | `true` | absent | Same as R1. |
| R3 | `unit` field on all params | present (`'n'`, `'0–1'`) | absent | Live addition; satisfies G16. Keep. Unit value `'n'` on `amount` is ambiguous — see UI Compliance §U1. |
| R4 | `driveable: true` on `amount`, `radius` non-functional | Both sources identical | Both sources identical | Not a live-vs-reference gap; a known architectural issue in both. Tracked as parity hole in `feature-parity.md`. |

---

## Review Spec Gaps

| # | Issue from `spherize_review2403.md` | Status |
|---|-------------------------------------|--------|
| S1 | `[WARN]` AMOUNT param maximum too low — increase range | `amount` max is `1` in both live and reference. The review calls for *higher* values (>1). The current max of 1 clips the creative range. **Not yet fixed.** Requires increasing `amount` max (e.g. to `2` or `3`) and verifying the power-curve formula remains stable. |
| S2 | `[ERROR]` +D button non-functional (G1) | Global issue; not fixed at module level. |
| S3 | Audit all params for `driveable: true` (G2) | `centreX` and `centreY` now have `driveable: true` in live source (absent in reference). `amount` and `radius` already had it. All four params carry the flag — satisfies the audit directive. However, none are wired (see R4). |
| S4 | Slider direct input and double-click-to-default (G5) | Global issue; not fixed at module level. |

---

## Missing Parameters

None at the functional level. All params from the reference source are present.

G6 (canvas click-to-pick for centre X/Y) is an **enhancement** not yet present: a PICK CENTRE action/button is required but is not a param definition — it is a UI control. Not missing from the param table, but missing from the UI feature set.

---

## Extra/Incorrect Parameters

| # | Param / Field | Issue |
|---|---------------|-------|
| E1 | `centreX: { driveable: true }` | Not in reference. `apply()` reads `p.centreX` as a scalar with no `modulate()` call — driving is non-functional. Either wire the driver (requires `modulate(key, i)` inside `apply()`) or remove the flag to avoid misleading UI (+D button will appear). |
| E2 | `centreY: { driveable: true }` | Same as E1. |
| E3 | `amount: { unit: 'n' }` | Unit token `'n'` is not a defined unit string. Ambiguous — could mean normalised, none, or negative. Must use a defined unit token or `'−1–1'` (matching the param range convention). See G16. |

---

## UI Compliance Issues

| # | Issue | Location | Rule |
|---|-------|----------|------|
| U1 | `unit: 'n'` on `amount` is not a recognised or unambiguous unit string | `amount` param def | G16 — unit must be meaningful and non-truncatable. Correct to `'−1–1'` or `'norm'` per site unit conventions. |
| U2 | PICK CENTRE canvas interaction absent | `centreX`, `centreY` | G6 — modules with centre X/Y params must expose a PICK CENTRE button. Affects: radialblur, twirl, spherize, chromaticab, lensbubbles (shared component required per G11). |
| U3 | +D button appears for `centreX`, `centreY` but driving is non-functional | `centreX`, `centreY` driveable flags | G1 / G2 — driver wiring absent. Non-functional flag produces misleading UI. |
| U4 | +D button appears for `amount`, `radius` but driving is non-functional | `amount`, `radius` driveable flags | G1 — no `modulate` parameter in `apply()`. Flagged in feature-parity.md and issues-and-conflicts.md since migration. |

---

## Global Issues

| Issue | Applicability | Notes |
|-------|--------------|-------|
| G1 — +D button non-functional | **Applies** | +D appears for all four params; none are wired. |
| G2 — All numeric params must support drivers | **Applies** | All four params now carry `driveable: true`; however, none are wired in `apply()`. Flag presence satisfies the declaration requirement; functional wiring is a separate step gated on G1 fix. |
| G5 — Slider direct input and double-click-to-default | **Applies** | All four params are slider+number. Global fix required. |
| G6 — Canvas click-to-pick for centre point params | **Applies directly** | `centreX` and `centreY` present. CentrePointPicker shared component required (G11). Listed explicitly in G6 action as one of the affected modules. |
| G7 — Vector module indicator | **Does not apply** | Pixel-output module. |
| G9 — FRAME param for time-based modules | **Does not apply** | Stateless per-call algorithm. |
| G10 — SVG export action | **Does not apply** | Pixel-output module. |
| G11 — Shared components for overlapping features | **Applies** | CentrePointPicker must be a shared component before being added here. Do not implement per-module. |
| G12 — Web worker for expensive modules | **Applies (low priority)** | Cost class B at typical params; C at radius=1 on 4MP. Currently acceptable. If worker offload is applied globally, spherize is included. |
| G14 — Mode-conditional param visibility | **Does not apply** | No mode/type dropdown; all params are always applicable. |
| G16 — Slider/number inputs must display units | **Applies** | `unit` fields present on all four params but `amount` unit `'n'` is non-standard. Fix unit token. |

---

## Merge Absorption

The following items from adjacent reviews or global issues are absorbed into this module's required changes:

- G6 (CentrePointPicker) — shared component; implement once, consume here. Do not implement independently.
- G11 — confirms CentrePointPicker must be shared before spherize consumes it.
- Review S1 (AMOUNT max increase) — standalone change, no dependency on other modules.
- G16 unit fix on `amount` — standalone param field correction.

---

## Required Changes (priority ordered)

| Priority | ID | Change | File | Dependency |
|----------|----|--------|------|------------|
| 1 | C1 | Increase `amount` max from `1` to a higher value (e.g. `2`) to satisfy review S1. Verify power-curve remains stable at boundary: `t^(1+2) = t^3` (pinch) and `t^(1/(1−(−2))) = t^(1/3)` (bulge). No formula change required — formula is already parameterised. | `SpherizeNode.js` | None |
| 2 | C2 | Fix `unit` on `amount` from `'n'` to a valid unambiguous string such as `'−1–1'`. | `SpherizeNode.js` | None |
| 3 | C3 | Remove `driveable: true` from `centreX` and `centreY` **until** driver wiring is implemented, OR wire them via `modulate(key, i)` calls inside `apply()`. Leaving the flag without wiring produces misleading +D UI. Decision: if G1 is fixed before this module is touched, wire all four; otherwise remove flags from centreX/centreY (amount and radius retain flag per reference). | `SpherizeNode.js` | G1 fix (for wiring path) |
| 4 | C4 | Wire `amount` and `radius` drivers inside `apply()` via `getModulated(key, pixelIdx, ctx)` per `EffectNode` contract. Requires iterating with pixel index and calling modulate per pixel. Gated on G1 being fixed first so wiring can be verified. | `SpherizeNode.js` | G1 fix |
| 5 | C5 | Add PICK CENTRE button/action for `centreX`/`centreY` using the shared `CentrePointPicker` component once it exists (G6/G11). Do not implement inline. | `SpherizeNode.js` + shared component | G11 CentrePointPicker built |
| 6 | C6 | G5: slider direct input and double-click-to-default — global fix; no per-module change required beyond confirmation. | NodePanel (global) | Global |
| 7 | C7 | G1: +D button event handler fix — global; no per-module change. | NodePanel (global) | Global |
| 8 | C8 | G16: verify all unit strings are rendered correctly by NodePanel once G16 global fix is applied. Confirm `amount`, `radius`, `centreX`, `centreY` units display. | NodePanel (global) | Global G16 fix |

---

## Verification Criteria

1. **C1 — AMOUNT range:** Set `amount` to max; verify distortion is visibly stronger than at the previous max of 1. Set `amount` to −max; verify bulge is visibly stronger. No NaN or black-frame output at boundary values.
2. **C2 — Unit display:** `amount` param displays a legible, unambiguous unit string in the NodePanel.
3. **C3/C4 — Driver wiring:** After G1 fix, connecting an image driver to `amount` or `radius` must produce per-pixel variation in distortion strength or radius. Connecting a uniform driver at max value must produce the same result as setting the slider to max.
4. **C5 — PICK CENTRE:** Activating PICK CENTRE button then clicking the viewport sets `centreX`/`centreY` to the clicked position (normalised). Effect redraws with new centre.
5. **Regression — algorithm unchanged:** At identical param values, output pixel data must be byte-identical before and after all changes. Run on a known test image and diff outputs.
6. **Regression — preview mode:** `ctx.quality === 'preview'` must still switch to nearest-neighbour sampling after all changes.
7. **Regression — registry:** `SpherizeNode` remains importable and registered under type `'spherize'` in `registry.js`. No duplicate registrations.
