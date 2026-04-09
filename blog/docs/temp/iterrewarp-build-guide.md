# ITERREWARP — Build Guide

- module: iterrewarp
- node: IterativeRewarpNode.js
- category: ACCUMULATION
- review verdict: KEEP
- rebuild severity: MINOR

---

## Current State Summary

Factory-pattern module (`createEffectModule`) with 7 params across tiers 3–5. Functional pixel accumulation via `iterativeRewarpRGBA` from `accumulation.js`. `SeededRNG`/`hashSeed` imported and wired. DROWNED preset exists in registry and correctly targets this module. Module is registered in `registry.js` under ACCUMULATION.

Two structural defects: (1) `apply()` omits the `modulate` argument — all five `driveable: true` params are non-functional as per-pixel drivers; (2) an inline `ctx.quality === 'preview'` preview cap in `apply()` is dead code given `previewMax: 8` on `samples` is resolved by the factory before `apply()` is called.

One param-level divergence from reference source: the live implementation adds `frame` (tier 3, driveable) and `unit: 'n'` on `samples` and `unit: '0–1'` on `decay` that are absent from the reference source. Reference `opacityMode` is tier 3; live source has it at tier 4. `when` conditional on `decay` (hide when `opacityMode ≠ DECAY`) is present in live source; absent from reference.

No architectural violations. No prohibited DOM, RAF, or window access.

---

## Reference Parity Gaps

| # | Gap | Reference (source/IterativeRewarpNode.js) | Live |
|---|-----|------------------------------------------|------|
| R1 | `opacityMode` tier | tier 3 (ref) | tier 4 (live) — minor; tier 4 is defensible but diverges |
| R2 | `samples` missing `driveable: true` | no `driveable` on `samples` in ref | live adds `driveable: true` — additive, not a deficit |
| R3 | `decay` missing `unit` | no `unit` on `decay` in ref | live adds `unit: '0–1'` — additive; correct per G16 |
| R4 | `scaleJitter` missing `unit` | no `unit` on `scaleJitter` in ref | live also missing `unit` — both missing, see Missing Parameters |
| R5 | `frame` param absent in reference | not present | live adds `frame` (tier 3, driveable: true) — additive; required by G9 |
| R6 | `decay` `when` conditional | absent in ref | live adds `when: { param: 'opacityMode', equals: 'DECAY' }` — correct per G14 |
| R7 | `modulate` argument | not in ref `apply()` either | both omit — shared defect; must be fixed in live |
| R8 | Inline preview cap | present in ref (same redundant check) | also present in live — dead code in both; remove |

---

## Review Spec Gaps

Review `iterrewarp_review2403.md` is fast-tracked. Action items stated:

| # | Action item | Status |
|---|-------------|--------|
| S1 | Fix +D driver button (G1) | Global fix; not in this module |
| S2 | All numeric params must have `driveable: true` (G2) | `samples` in live has `driveable: true` — satisfied. `opacityMode` is select-type, exempt. All range params are driveable. ✓ |
| S3 | Slider direct input + double-click-to-default (G5) | Global component fix; not in this module |

No review-spec-specific gaps unique to this module beyond G1/G2/G5 which are global.

---

## Missing Parameters

| # | Param | Issue |
|---|-------|-------|
| M1 | `scaleJitter` unit | `unit` field absent. Should be `'n'` (normalised fractional, 0–0.5). Required by G16. |

---

## Extra / Incorrect Parameters

| # | Param | Issue |
|---|-------|-------|
| E1 | `frame` | Present in live (`tier: 3, driveable: true`). Not in reference source. Required by G9 (iteration-based module must expose FRAME param). Correct to keep. Not a defect — note that `capByFrame(n, p.frame)` is called: `frame` gates `samples`, capping effective sample count to the frame index during animation. Logic is sound. |
| E2 | `opacityMode` tier | Set to tier 4 in live; reference has tier 3. `opacityMode` is a primary behavioural switch — tier 3 is more appropriate. Should be corrected to tier 3. |

---

## UI Compliance Issues

| # | Issue | Standard |
|---|-------|----------|
| U1 | `scaleJitter` has no `unit` | G16 requires unit on all numeric params. Add `unit: 'n'`. |
| U2 | `opacityMode` tier should be 3, not 4 | Primary mode switch; ref confirms tier 3. Not a rendering violation but a disclosure-order regression. |
| U3 | Inline dead-code preview cap in `apply()` | Not a UI issue per se but creates maintenance confusion about which mechanism is authoritative. Remove the inline `ctx.quality === 'preview'` branch. |
| U4 | `decay` `when` conditional is present — correct. Verify NodePanel honours `when` syntax to hide `DECAY` slider when `opacityMode = EQUAL`. If NodePanel does not implement `when`, the conditional is inert and decay is always shown — G14 violation. |

---

## Global Issues

| Issue | Applicability to ITERREWARP | Required action |
|-------|----------------------------|-----------------|
| G1 — +D button non-functional | Affects all 5 driveable params: `frame`, `samples`, `jitterX`, `jitterY`, `decay`, `rotJitter`, `scaleJitter` | Global NodePanel fix — not in this module |
| G2 — All numeric params driveable | All range params now have `driveable: true`. ✓ SATISFIED | None |
| G5 — Slider direct input + double-click-to-default | Affects all slider params in this module | Global slider component fix |
| G6 — Canvas click-to-pick centre point | Not applicable — no centre X/Y params | None |
| G7 — Vector module indicator | Not applicable — pixel module | None |
| G9 — FRAME param on iteration-based modules | `frame` param is present. `capByFrame(n, p.frame)` is called. ✓ SATISFIED | None |
| G10 — SVG export for vector modules | Not applicable — pixel module | None |
| G11 — Shared components for overlapping features | `frame` param uses `capByFrame` from shared utility — correct | None |
| G12 — Web worker usage | `apply()` delegates entirely to `iterativeRewarpRGBA` — no main-thread blocking; worker placement is pipeline-level concern. At samples=20, 4K: ~166M bilinear lookups (C class). Ensure pipeline routes ACCUMULATION category nodes to worker. | Pipeline audit |
| G14 — Mode-conditional param visibility | `decay` has `when: { param: 'opacityMode', equals: 'DECAY' }`. Must verify NodePanel `when` implementation is functional. If inert, `decay` is shown unconditionally — violation. | Verify NodePanel `when` support |
| G16 — Units on numeric params | `scaleJitter` missing `unit`. All others: `frame` unit='frames' ✓, `samples` unit='n' ✓, `jitterX` unit='px' ✓, `jitterY` unit='px' ✓, `decay` unit='0–1' ✓, `rotJitter` unit='deg' ✓ | Add `unit: 'n'` to `scaleJitter` |

---

## Merge Absorption

The live `IterativeRewarpNode.js` is a superset of the reference source in all correct directions:
- `frame` param added — required by G9, correctly implemented with `capByFrame`.
- `driveable: true` on `samples` — required by G2.
- `unit` on most params — required by G16.
- `when` conditional on `decay` — required by G14.

No rollback of live additions is warranted. Merge direction: live → forward, with fixes below.

---

## Required Changes (priority ordered)

| Priority | ID | File | Change |
|----------|----|------|--------|
| 1 — CRITICAL (blocks per-pixel driver use) | C1 | `IterativeRewarpNode.js` | Add `modulate` to `apply()` signature: `apply(src, dst, w, h, p, ctx, modulate)`. For per-pixel params (`jitterX`, `jitterY`, `decay`, `rotJitter`, `scaleJitter`), call `modulate(key, i)` at each pixel index `i` instead of passing the scalar directly. This requires `iterativeRewarpRGBA` to accept per-pixel callbacks or a pre-computed modulation array, OR the modulation is sampled once per apply (uniform override). Determine the boundary with `iterativeRewarpRGBA`'s interface — if per-pixel modulation is intended, the algorithm must accept a modulation array; if only frame-level override is intended, resolve once and pass scalar. |
| 2 — MODERATE | C2 | `IterativeRewarpNode.js` | Remove inline `ctx?.quality === 'preview'` check from `apply()`. `previewMax: 8` on `samples` is resolved by the factory. Inline check is dead code. Replace `let n = ctx?.quality === 'preview' ? Math.min(p.samples, 8) : p.samples;` with `let n = p.samples;` then `n = capByFrame(n, p.frame);`. |
| 3 — MINOR | C3 | `IterativeRewarpNode.js` | Correct `opacityMode` tier from 4 to 3. It is the primary mode switch and is at tier 3 in the reference source. |
| 4 — MINOR (G16) | C4 | `IterativeRewarpNode.js` | Add `unit: 'n'` to `scaleJitter` param definition. |
| 5 — VERIFY (G14) | C5 | NodePanel (global) | Confirm `when` conditional processing is implemented. If absent, `decay` is always shown regardless of `opacityMode` — G14 violation. Fixing is a NodePanel concern, not this module. |
| 6 — VERIFY (G12) | C6 | Pipeline | Confirm ACCUMULATION category nodes are dispatched to the render worker. At samples=20/4K, ~166M bilinear lookups is C-class cost — must not block main thread. |

---

## Verification Criteria

1. After C1: Attaching an image driver to `jitterX`, `jitterY`, `decay`, `rotJitter`, or `scaleJitter` produces visible per-pixel variation in the output. Dark regions of driver map produce measurably different ghost offset from bright regions.
2. After C2: `apply()` produces identical output to pre-change. `n = p.samples` followed by `capByFrame` is equivalent to the removed branch when factory pre-resolves `previewMax`. Confirm with samples=20, preview quality: output sample count must still be capped at 8.
3. After C3: `opacityMode` (BLEND) appears in tier 3 group in NodePanel — above `decay`, `rotJitter`, `scaleJitter`.
4. After C4: `scaleJitter` slider displays `n` unit label in NodePanel.
5. C5 (NodePanel `when`): `decay` slider is hidden when `opacityMode = EQUAL`; visible when `opacityMode = DECAY`. Toggling `opacityMode` causes immediate show/hide without page reload.
6. DROWNED preset: loads without error; `iterrewarp` node with `samples:8, jitterX:8, jitterY:4, opacityMode:'decay', decay:0.75, rotJitter:1.5, scaleJitter:0.02` produces ghost-echo accumulation output visually distinct from any blur module.
7. G9 FRAME param: setting `frame=0` with `samples=10` produces no output (capByFrame returns 0 or 1 samples); `frame=10` produces full 10-sample accumulation.
