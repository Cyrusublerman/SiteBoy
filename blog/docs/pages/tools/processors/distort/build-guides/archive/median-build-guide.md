# MEDIAN — Build Guide

- module: median
- node: MedianFilterNode.js
- category: BLUR
- review verdict: KEEP
- rebuild severity: MINOR

---

## Current State Summary

Live implementation (`nodes/blur/MedianFilterNode.js`) uses the `createEffectModule()` factory. It exposes one param (`radius`, tier 3), delegates to `medianFilter()` in `shared/algorithms/image/blur-filters.js`, and sets a `previewMax: 2` cap. The module is functionally correct and architecturally compliant.

The live source diverges from the reference source in two fields:
- `forceWorkerPreview: true` — present in live, absent in reference.
- `driveable: true` — present in live, absent in reference.
- `unit: 'px'` — present in live, absent in reference.

The `forceWorkerPreview` flag is a post-reference addition consistent with G12 requirements and should be retained. `driveable: true` is required by G2 and is correctly applied. `unit: 'px'` is required by G16 and is correctly applied. All three additions are improvements over the reference.

---

## Reference Parity Gaps

| # | Gap | Severity | Direction |
|---|-----|----------|-----------|
| R1 | Reference lacks `driveable: true` on `radius`; live correctly adds it | resolved — live is ahead | INFO |
| R2 | Reference lacks `unit: 'px'` on `radius`; live correctly adds it | resolved — live is ahead | INFO |
| R3 | Reference lacks `forceWorkerPreview: true`; live correctly adds it | resolved — live is ahead | INFO |
| R4 | Legacy doc states preview strategy as "radius halved"; live uses `previewMax: 2` (fixed cap). Semantics differ at radius 3 (halving → 1; cap → 2). No functional defect; documentation inconsistency only. | NOTE |

No regressions from reference. All live deviations are forward improvements.

---

## Review Spec Gaps

| # | Item from `median_review2403.md` | Status |
|---|----------------------------------|--------|
| S1 | Set `previewMax` on radius param | DONE — `previewMax: 2` present |
| S2 | Fix `+D` driver button (G1 — global) | NOT DONE — global fix pending |
| S3 | Audit params for `driveable: true` (G2 — global) | DONE — `driveable: true` present |
| S4 | Consider histogram-based median approximation for large radii | NOT DONE — algorithm-level; deferred |
| S5 | Consider consolidation into unified BLUR module (G4 — global) | OUT OF SCOPE for this module |

---

## Missing Parameters

None. The single param `radius` matches the full spec. No additional params are required by reference docs, review spec, or global issues applicable to this module.

---

## Extra/Incorrect Parameters

None. No surplus params. No incorrect ranges, defaults, steps, or labels.

---

## UI Compliance Issues

| # | Issue | Severity |
|---|-------|----------|
| U1 | None found. `radius` label `'RADIUS'` is SCREAMING CASE, ≤16 chars. Type, category, param key all compliant. | — |

None.

---

## Global Issues

Issues applicable to this module with assessment of current status:

| Issue | Applicability | Status |
|-------|---------------|--------|
| G1 — +D button non-functional | YES — `radius` has `driveable: true`, so the +D button should appear; it is globally broken | Blocked on host fix |
| G2 — All numeric params must have `driveable: true` | YES — `radius` is the only numeric param | DONE — present in live |
| G5 — Slider direct input + double-click-to-default | YES — `radius` uses slider | Blocked on host fix |
| G6 — Canvas click-to-pick for centre params | NOT APPLICABLE — no centre X/Y param | — |
| G7 — Vector module identifiability | NOT APPLICABLE — pixel module | — |
| G9 — Time-based modules must expose FRAME param | NOT APPLICABLE — stateless pixel filter | — |
| G10 — Vector modules must include SVG export | NOT APPLICABLE — pixel module | — |
| G11 — Shared components for overlapping features | NOT APPLICABLE — no composite feature additions pending | — |
| G12 — Web Worker for expensive modules | YES — `forceWorkerPreview: true` is present; confirms worker path is used for preview. Full-resolution apply() offload is a pipeline concern, not module-level | PARTIALLY MET — module opts in; pipeline offload is host concern |
| G14 — Mode-conditional param hiding | NOT APPLICABLE — no mode/type dropdown | — |
| G16 — Sliders must display units | YES — `radius` has `unit: 'px'` | DONE — present in live |

---

## Merge Absorption

The following post-reference changes are already merged into the live implementation and must not be reverted:

| Field | Value | Rationale |
|-------|-------|-----------|
| `driveable: true` on `radius` | retained | G2 compliance |
| `unit: 'px'` on `radius` | retained | G16 compliance |
| `forceWorkerPreview: true` | retained | G12 compliance — routes preview to worker |

---

## Required Changes (priority ordered)

| Priority | Change | Location | Blocking? |
|----------|--------|----------|-----------|
| 1 | Fix +D driver button event handler (G1) | NodePanel host component | YES — blocks driver verification for `driveable: true` on `radius` |
| 2 | Implement slider direct numeric input + double-click-to-default (G5) | NodePanel slider component | NO — UX improvement |
| 3 | Display `unit` label alongside slider value (G16) | NodePanel slider component | NO — already defined in param; requires host rendering |
| 4 | Investigate histogram-based O(1)/pixel median (Huang 1979) for large-radius performance | `shared/algorithms/image/blur-filters.js` | NO — performance enhancement only; current implementation is correct |

Items 1–3 are host-level changes, not changes to `MedianFilterNode.js` itself. No changes are required to the module file.

---

## Verification Criteria

1. `radius` param appears in NodePanel with label `RADIUS`, slider range 1–5, step 1, default 1, unit display `px`.
2. +D button appears on `radius` row (requires G1 fix). Clicking it opens the driver settings panel.
3. Double-clicking the `radius` value resets it to 1 (requires G5 fix).
4. Preview renders with `radius` capped at 2 regardless of UI slider position above 2.
5. Full-resolution apply at `radius: 1` completes in class B time (~20–60 ms).
6. Full-resolution apply at `radius: 5` is functionally correct (output matches expected median filter output); performance warning is acceptable — class D is documented and expected.
7. Alpha channel is passed through unmodified at all radius values.
8. Module type is `median`, category `BLUR`. Registry entry present and correct.
9. `forceWorkerPreview: true` is retained in the module definition.
10. No `document.*`, `window.*`, `requestAnimationFrame`, or `setInterval` calls present in module file.
