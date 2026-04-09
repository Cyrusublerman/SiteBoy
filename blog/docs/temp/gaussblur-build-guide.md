# GAUSSBLUR — Build Guide

- module: gaussblur
- node: GaussianBlurNode.js
- category: BLUR
- review verdict: KEEP
- rebuild severity: MINOR

---

## Current State Summary

Factory module using `createEffectModule`. Implements separable Gaussian convolution via `gaussianBlurSeparable` from `blur-filters.js`. Two params: `sigma` (tier 3, driveable) and `passes` (tier 4, not driveable). Both `previewMax` caps are correct and functional. Registry entry present and correct. No forbidden DOM/RAF/setInterval usage. No inline algorithm — correctly delegates to library function.

**Divergence from reference source:** Live source adds `unit: 'σ'` on sigma and `unit: 'n'` on passes. Reference source lacks these fields. This is a forward improvement, not a regression.

**Critical structural defect:** `apply()` signature is `apply(src, dst, w, h, p)` — omits `ctx` and `modulate`. Factory provides them; module rejects them. `sigma` is declared `driveable: true` but the driver output is never consumed. The `modulate` argument is unavailable in the function body.

---

## Reference Parity Gaps

| # | Feature | Reference source | Live source | Status |
| --- | --- | --- | --- | --- |
| RP-1 | `apply` full signature `(src, dst, w, h, p, ctx, modulate)` | Present (implied by factory contract) | Absent — declared as `(src, dst, w, h, p)` | **FAIL** |
| RP-2 | `passes` param `driveable` field | Absent in reference source | Absent in live source | Pass (parity held; both omit it) |
| RP-3 | `unit` fields on params | Absent in reference source | Present (`'σ'`, `'n'`) | Forward delta — keep |
| RP-4 | Per-pixel sigma modulation blend (legacy doc pipeline step 3) | Absent in reference source | Absent in live source | Both deficient — design decision required; see RP-4 note |

**RP-4 note:** Legacy doc (`gaussblur.md`) pipeline step 3 describes blending the fully-blurred result with the original source per-pixel using driver luminance as blend weight. Neither reference source nor live source implements this. `issues-and-conflicts.md` identifies an architectural conflict: the legacy doc describes a fixed-sigma blur + post-blend approach; the factory driver law implies per-pixel varying sigma via `modulate(key, i)`. These are distinct and produce different visual output. A design decision is required before implementing either. Until resolved, RP-4 is a deferred parity gap — not a blocking defect.

---

## Review Spec Gaps

| # | Review item | Status |
| --- | --- | --- |
| RS-1 | Verify separable 1D Gaussian kernel (not 2D) | Confirmed via `blur-filters.js` — `_k(sigma, rad)` builds 1D kernel; horizontal then vertical pass. |
| RS-2 | Set `previewMax` on sigma | Done: `previewMax: 5`. |
| RS-3 | `driveable: true` on numeric params | `sigma` has it; `passes` lacks it — see MP-1. |
| RS-4 | Fix +D driver button | Global issue G1 — out of scope for this module. |
| RS-5 | G4 consolidation into unified BLUR module | Architectural proposal, deferred. Not a per-module fix. |

---

## Missing Parameters

| # | Param | Rationale |
| --- | --- | --- |
| MP-1 | `passes` must add `driveable: true` | G2 mandates `driveable: true` on all numeric (range) params. `passes` is range type; currently omitted. |

No other parameters are absent. The two-param set (sigma, passes) is complete per legacy doc, reference source, and ui-layout spec.

---

## Extra/Incorrect Parameters

None. Both declared params are specified in ui-layout.md and the legacy doc. No surplus params present.

---

## UI Compliance Issues

| # | Issue | Source |
| --- | --- | --- |
| UI-1 | `unit` field on `sigma` (`'σ'`) and `passes` (`'n'`) present in live source but absent from reference source — verify NodePanel renders these via G16 unit-display requirement | G16 |
| UI-2 | G5: slider params lack direct numeric input and double-click-to-default — NodePanel-level defect, applies to sigma and passes | G5 |
| UI-3 | G16: if NodePanel does not yet render `unit` from param definition, sigma and passes will show unitless values | G16 |

No module-level UI violations. Module does not implement any custom UI — all rendering is NodePanel's responsibility. The `unit` fields already present in live source are the correct preparation for G16 compliance.

---

## Global Issues

| Issue | Applicability | Notes |
| --- | --- | --- |
| G1 — +D button non-functional | Applies | `sigma` is `driveable: true`; +D button exists in NodePanel but produces no response. System-level fix required. |
| G2 — all numeric params must be driveable | Applies | `passes` missing `driveable: true` — see MP-1. |
| G5 — slider: direct input + double-click-to-default | Applies | Both sigma and passes are slider params. NodePanel fix. |
| G6 — canvas click-to-pick for centre params | Not applicable | Module has no centre X/Y params. |
| G7 — vector module indicator | Not applicable | Pixel module. |
| G9 — FRAME param for time-based modules | Not applicable | Module is stateless; no time or iteration state. |
| G10 — SVG export button for vector modules | Not applicable | Pixel module. |
| G11 — shared components for overlapping features | Not applicable | Module adds no new UI patterns. |
| G12 — web worker for expensive modules | Applies | gaussblur is explicitly named in G12 as slow. Separable O(n·r) but sigma=30 produces 181-tap kernel per axis; D-class render at 4K sigma=30 passes=3. `previewMax` mitigates preview only. Full-res renders remain on main thread unless pipeline offloads to worker. |
| G14 — mode-conditional param hiding | Not applicable | Module has no mode param. |
| G16 — unit labels on numeric params | Applies | `unit: 'σ'` and `unit: 'n'` are present in live source. Compliance depends on NodePanel rendering them. |

---

## Merge Absorption

The live source is **ahead of** the reference source in one respect: `unit` fields on both params. These are correct additions satisfying G16 and must be retained in any future rewrite.

No merge from reference source is required — the reference source is a snapshot of an earlier state. The live source is the canonical version.

---

## Required Changes (priority ordered)

| Priority | ID | File | Change | Rationale |
| --- | --- | --- | --- | --- |
| 1 | RC-1 | `GaussianBlurNode.js` | Extend `apply` signature to `apply(src, dst, w, h, p, ctx, modulate)` | Factory contract requires full signature. `ctx` and `modulate` are injected; omitting them silently discards driver output and prevents any future per-pixel modulation. |
| 2 | RC-2 | `GaussianBlurNode.js` | Add `driveable: true` to `passes` param | G2 compliance. All range params must support driver attachment. |
| 3 | RC-3 | `GaussianBlurNode.js` | Design decision: implement sigma driver modulation via `modulate(key, i)` per-pixel OR via post-blur blend using driver map as weight | Deferred until architectural choice is confirmed. Until then, `modulate` can be accepted in signature but unused — removing the silent discard is the priority (RC-1). |

**RC-3 detail — two valid approaches:**
- A) Per-pixel sigma via `modulate('sigma', i)` in a pixel loop — not possible without rewriting apply() to loop pixels manually and rebuild kernel per-pixel (impractical; O(w×h×r) kernel builds).
- B) Post-blur blend: run `gaussianBlurSeparable` at global sigma, then blend blurred vs src per-pixel using driver luminance as weight — tractable, described in legacy doc, does not require per-pixel kernel rebuild. Recommended.

---

## Verification Criteria

| # | Criterion | Pass condition |
| --- | --- | --- |
| V-1 | `apply` signature | `apply(src, dst, w, h, p, ctx, modulate)` — six arguments accepted without error |
| V-2 | `passes` driveable | `passes.driveable === true` in param definition |
| V-3 | `sigma` unit | `sigma.unit === 'σ'` in param definition |
| V-4 | `passes` unit | `passes.unit === 'n'` in param definition |
| V-5 | Separable kernel confirmed | `gaussianBlurSeparable` called with `p.sigma` and `p.passes`; no inline convolution in module file |
| V-6 | previewMax sigma | `sigma.previewMax === 5` |
| V-7 | previewMax passes | `passes.previewMax === 1` |
| V-8 | No forbidden APIs | No `document.*`, `window.*`, `requestAnimationFrame`, `setInterval`, `setTimeout` in module file |
| V-9 | Registry present | `GaussianBlurNode` imported and registered in `registry.js` under `gaussblur` type |
| V-10 | G16 unit display | NodePanel renders `σ` and `n` unit labels alongside sigma and passes values |
| V-11 | G2 passes driver | Attaching a driver to `passes` via +D (once G1 fixed) does not throw; param responds to modulation |
| V-12 | RC-3 resolution | If approach B implemented: blurred output blended against src per-pixel using driver map luminance as weight; source pixels unaffected where driver map is black; fully blurred where driver map is white |
