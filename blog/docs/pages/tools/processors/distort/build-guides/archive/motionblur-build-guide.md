# MOTIONBLUR — Build Guide

- module: motionblur
- node: MotionBlurNode.js
- category: BLUR
- review verdict: KEEP
- rebuild severity: MINOR

---

## Current State Summary

`MotionBlurNode.js` is a factory-pattern module (13 lines) created via `createEffectModule`. It delegates entirely to `motionBlur()` from `blur-filters.js`. Both params (`angle`, `distance`) are present, correctly ranged, tiered, labelled, and declared `driveable: true`. The `distance` param carries `previewMax: 20`. Registration in `registry.js` is correct. The module is functional and visually distinct.

Two implementation defects exist: (1) `apply()` omits `modulate` from its signature, so `driveable: true` on both params is inert — no per-pixel variation is delivered despite the UI advertising it; (2) the review spec requires a new `ANISOTROPY` param that is absent. No architectural violations are present. No raw DOM, no RAF/setInterval, no layout math. The module is the simplest correct instance of the factory pattern in the BLUR category.

---

## Reference Parity Gaps

| # | Gap | Reference file | Severity |
|---|-----|---------------|----------|
| RP-1 | `distance` `unit: 'px'` present in live source but absent in reference source archive | `source/MotionBlurNode.js` line 8 | cosmetic — live source is correct; archive is stale |
| RP-2 | Preview strategy conflict: legacy doc states "distance halved"; live source uses `previewMax: 20`. At distance > 40 the cap (20) is more restrictive than halving (50); at distance ≤ 20 the cap has no effect. Strategies diverge. | `legacy-docs/motionblur.md`, `feature-parity.md` | low — `previewMax: 20` treated as authoritative |
| RP-3 | `apply()` declared `apply(src, dst, w, h, p)` — omits `ctx` and `modulate` args; full factory signature is `apply(src, dst, w, h, p, ctx, modulate)` | `issues-and-conflicts.md`, `mechanisms.md` | moderate — blocks driver functionality |

---

## Review Spec Gaps

| # | Gap | Source | Required action |
|---|-----|--------|-----------------|
| RS-1 | `ANISOTROPY` param absent — review requires a slider (0 = fully isotropic, 1 = fully directional). No algorithm support exists in `blur-filters.js` for anisotropic blending. | `motionblur_review2403.md` §Issues, Action Item 1 | Add `anisotropy` param; extend `motionBlur()` or add wrapper in `blur-filters.js` |
| RS-2 | Driver (+D) button non-functional (global G1) | `motionblur_review2403.md` Action Item 2 | Fix at NodePanel level — tracked G1 |
| RS-3 | All numeric params must have `driveable: true` (global G2) | `motionblur_review2403.md` Action Item 3 | Both params already have `driveable: true`; G2 satisfied for this module once apply() signature is fixed |

---

## Missing Parameters

| Key | Label | Type | Range | Default | Unit | Tier | Driveable | Reason required |
|-----|-------|------|-------|---------|------|------|-----------|-----------------|
| `anisotropy` | `ANISOTROPY` | range | 0–1 | 1 | — | 3 | true | Review spec: controls ratio between directional and isotropic spread; 0 = fully isotropic, 1 = fully directional |

Note: algorithm extension is required. `motionBlur()` currently applies 100% directional averaging with no isotropic mixing. To support anisotropy, `blur-filters.js` must be extended with a blended mode: at `anisotropy < 1`, output is a lerp between a standard box-blur average and the directional average. This is an algorithmic addition, not just a param stub.

---

## Extra/Incorrect Parameters

None. Both existing params (`angle`, `distance`) match the reference spec in key, label, range, default, tier, and driveability. The `unit: 'px'` on `distance` in the live source (absent in the reference archive) is correct and should be retained.

---

## UI Compliance Issues

| # | Issue | Standard | Required fix |
|---|-------|----------|-------------|
| UI-1 | `angle` and `distance` both declare `driveable: true` but `modulate` is not in the `apply()` signature. The +D driver slot appears in the UI but produces no per-pixel effect. | G2, `issues-and-conflicts.md` | Extend `apply()` to `apply(src, dst, w, h, p, ctx, modulate)` and call `modulate('angle', i)` / `modulate('distance', i)` per pixel. However: `motionBlur()` operates on the entire buffer — per-pixel modulation requires architectural change (either loop in apply() using a per-pixel callback, or a new per-pixel entry point in blur-filters.js). This is non-trivial. |
| UI-2 | `distance` exposes unit `'px'`; `angle` exposes unit `'deg'`. G16 requires units to be rendered by the NodePanel slider. Units are defined correctly in the param defs — this is a NodePanel rendering concern, not a module concern. | G16 | Confirm NodePanel renders `unit` field for all slider rows. No change needed in MotionBlurNode.js. |
| UI-3 | No `ANISOTROPY` slider in UI (missing param — see Missing Parameters above). | `motionblur_review2403.md` | Add param and wire algorithm. |

---

## Global Issues

| Issue | Applicability to motionblur | Status |
|-------|---------------------------|--------|
| **G1** Driver (+D) button non-functional | Both `angle` and `distance` are driveable — both affected. UI shows +D but clicking produces no response. | Not fixed in this module. Fix at NodePanel level. |
| **G2** All numeric params must have `driveable: true` | Both params already have `driveable: true`. Structurally satisfied. Functionally blocked by G1 and by missing `modulate` call in `apply()`. | Partial — param defs correct; apply() needs signature fix. |
| **G5** Slider: direct numeric input + double-click-to-default | Applies to both `angle` (slider+number) and `distance` (slider+number). | NodePanel-level fix; no change to MotionBlurNode.js. |
| **G6** Canvas click-to-pick for centre-point params | Not applicable — motionblur has no centre X/Y params. | N/A |
| **G7** Vector modules must be identifiable | Not applicable — motionblur is a pixel module. | N/A |
| **G9** Time/iteration-based modules must expose FRAME param | Not applicable — motionblur is stateless; no time/iteration state. | N/A |
| **G10** Vector modules must have SVG export | Not applicable — pixel module. | N/A |
| **G11** Overlapping feature additions must use shared components | `ANISOTROPY` param is motionblur-specific. No shared component required. If future blur consolidation (G4) occurs, the anisotropy concept may be generalised. | Monitor during G4 consolidation work. |
| **G12** Web worker usage for expensive modules | `motionBlur()` is O(w × h × distance). At distance=100 on 4K, estimated 300–800 ms. Should run in render worker. Confirm `apply()` is called from the render worker context, not the main thread. | Verify worker context; no code change to MotionBlurNode.js unless apply() is currently main-thread. |
| **G14** Mode-conditional params must be hidden when not applicable | Not applicable — motionblur has no mode dropdown. | N/A |
| **G16** Slider/number inputs must display units | Both params define `unit`. Rendering is NodePanel responsibility. `angle`: `'deg'`, `distance`: `'px'`. | NodePanel-level fix. Units are correctly declared in param defs. |

---

## Merge Absorption

None. The live source and the reference archive are functionally identical (the only difference is `unit: 'px'` on `distance` in the live source, which is correct). No migration or merge is required.

---

## Required Changes (priority ordered)

### P1 — Fix apply() signature to accept and call modulate [MODERATE]

**File:** `assets/js/tools/processors/distort/nodes/blur/MotionBlurNode.js`

**Problem:** `apply(src, dst, w, h, p)` omits `ctx` and `modulate`. Both `angle` and `distance` are `driveable: true` but read only as scalars. Per-pixel direction and distance variation are advertised but not delivered.

**Constraint:** `motionBlur(src, w, h, angle, distance)` takes scalar angle and distance and operates on the full buffer. To support per-pixel modulation, the apply() loop must be inlined or `blur-filters.js` must expose a per-pixel callback variant. The simplest correct fix: if `modulate` is provided and modulation is active for either param, fall back to a per-pixel implementation; otherwise call `motionBlur()` as before.

**Change:**
```js
apply(src, dst, w, h, p, ctx, modulate) {
  dst.set(motionBlur(src, w, h, p.angle, p.distance));
}
```
→ Extend signature; add branch for modulated path once `blur-filters.js` supports it. Until then, signature must at minimum accept the args to prevent engine mismatch, even if modulated path is deferred to a follow-up task.

**Minimum viable fix (unblocks G2 structural compliance):**
```js
apply(src, dst, w, h, p, _ctx, _modulate) {
  dst.set(motionBlur(src, w, h, p.angle, p.distance));
}
```

### P2 — Add ANISOTROPY param and extend blur-filters.js [MINOR→MODERATE]

**File:** `assets/js/tools/processors/distort/nodes/blur/MotionBlurNode.js` + `assets/js/shared/algorithms/image/blur-filters.js`

**Problem:** Review spec requires anisotropy control (0 = isotropic, 1 = fully directional). Neither the param nor the algorithm exists.

**Param definition to add:**
```js
anisotropy: { value: 1, min: 0, max: 1, step: 0.01, label: 'ANISOTROPY', tier: 3, driveable: true }
```

**Algorithm:** `blur-filters.js` must expose a variant that, at `anisotropy < 1`, blends the directional average with an isotropic (box) average: `output = lerp(boxAvg, directionalAvg, anisotropy)`. The box average can be computed over the same `distance` extent (square kernel of side `distance`) or reuse an existing box blur. The sample count for the isotropic component must be capped at `previewMax: 20` equivalently.

**Call site change:**
```js
apply(src, dst, w, h, p, _ctx, _modulate) {
  dst.set(motionBlurAnisotropic(src, w, h, p.angle, p.distance, p.anisotropy));
}
```

### P3 — Confirm render worker context [LOW]

**File:** Pipeline / worker architecture (not MotionBlurNode.js)

**Problem:** G12 flags expensive modules. At distance=100, `motionBlur()` issues ~100 sample reads per pixel. Verify `apply()` is called from the render worker, not the main thread. If it runs on the main thread at FULL resolution, it will block UI for 300–800 ms.

**Action:** Audit `Pipeline.js` and the worker harness. No change to MotionBlurNode.js unless the call site is confirmed main-thread.

### P4 — Confirm NodePanel renders `unit` field [LOW]

**File:** NodePanel component

**Problem:** G16 requires units to be displayed. Both params correctly declare `unit: 'deg'` and `unit: 'px'`. This is a NodePanel rendering concern only.

**Action:** Confirm NodePanel renders the `unit` field from paramDefs for all slider rows. No change to MotionBlurNode.js.

---

## Verification Criteria

1. `apply()` signature matches `apply(src, dst, w, h, p, ctx, modulate)` — no truncation.
2. `ANISOTROPY` param present: key `anisotropy`, range 0–1, default 1, step 0.01, label `'ANISOTROPY'`, tier 3, `driveable: true`.
3. At `anisotropy = 1`: output is identical to current directional-only output (regression-free).
4. At `anisotropy = 0`: output is visually isotropic regardless of `angle` value.
5. At `anisotropy = 0.5`: output is a perceptible blend — directional streak is present but attenuated relative to `anisotropy = 1`.
6. `previewMax: 20` on `distance` is retained.
7. `unit: 'px'` on `distance` and `unit: 'deg'` on `angle` are retained.
8. No `document.*`, `window.*`, `requestAnimationFrame`, `setInterval`, or raw hex/hsl colours introduced.
9. No layout math or routing logic introduced.
10. Module renders correctly in BLUR category in CategoryPicker — label `'MOTION BLUR'`, type `'motionblur'`.
11. No presets reference `motionblur` (confirmed: registry PRESETS has no motionblur entry) — no preset migration required.
12. G2 structural compliance: all numeric params have `driveable: true` — confirmed for `angle`, `distance`, and new `anisotropy`.
