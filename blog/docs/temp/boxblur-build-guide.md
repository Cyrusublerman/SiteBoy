# BOXBLUR — Build Guide

- module: boxblur
- node: BoxBlurNode.js
- category: BLUR
- review verdict: KEEP
- rebuild severity: MINOR

---

## Current State Summary

`BoxBlurNode.js` (13 lines) is a factory-pattern module using `createEffectModule`. It delegates pixel work entirely to `boxBlurSeparable` from `blur-filters.js`. Both `radius` and `passes` params are declared with correct ranges, tiers, labels, and `previewMax` caps. The module is registered in `registry.js` under `BLUR` with the correct label `BOX BLUR`.

Two defects are present: (1) `passes` lacks `driveable: true`, violating G2; (2) `radius` is declared `driveable: true` but the `apply()` signature omits `modulate`, so the driver cannot deliver per-pixel variation — the driver slot is non-functional. Both params are missing `unit` field (G16). No structural, architectural, or functional divergence from the reference source exists beyond these.

---

## Reference Parity Gaps

Comparison: live `BoxBlurNode.js` vs reference `source/BoxBlurNode.js`.

| Item | Reference | Live | Gap |
|---|---|---|---|
| `radius.driveable` | `true` | `true` | None |
| `radius.unit` | absent | `'px'` | Live adds `unit: 'px'` — additive, not a regression |
| `passes.driveable` | absent | `true` | Live adds `driveable: true` — additive improvement |
| `passes.unit` | absent | `'n'` | Live adds `unit: 'n'` — additive improvement |
| `apply()` body | identical | identical | None |
| `boxBlurSeparable` import | identical | identical | None |

**Net gap:** Live source is strictly a superset of the reference source. No missing or regressed feature. The reference source itself predates the G2 and G16 requirements and should not be treated as the compliance target for those issues.

---

## Review Spec Gaps

Comparison: live source vs `boxblur_review2403.md` action items.

| Action | Status | Notes |
|---|---|---|
| Confirm separable H+V passes (O(n)) | Confirmed | `boxBlurSeparable` uses running-sum `_bH`+`_bV` internals; complexity is O(w×h×passes) regardless of radius |
| Set `previewMax` on RADIUS | Done | `previewMax: 10` |
| Set `previewMax` on PASSES | Done | `previewMax: 2` |
| Fix +D driver button (G1) | Not done | Global issue; not a module-level fix |
| Audit all params for `driveable: true` (G2) | Partial | `radius: driveable: true` present; `passes` lacks `driveable: true` |

---

## Missing Parameters

None. All parameters defined in legacy doc (`radius`, `passes`) are present in the live source with correct ranges, defaults, tiers, labels, and `previewMax` caps.

---

## Extra/Incorrect Parameters

None. No parameters present in live source that are absent from spec.

---

## UI Compliance Issues

| Issue | Location | Detail |
|---|---|---|
| `passes` lacks `driveable: true` | `params.passes` | G2 requires all numeric (range) params to have `driveable: true`. `passes` is range type; flag is absent. |
| `radius` driver non-functional | `apply()` | `radius` is `driveable: true` but `apply(src, dst, w, h, p)` omits `modulate`. Driver UI slot is present and labelled but cannot produce per-pixel variation. Misleading to user. |
| `passes` unit symbol | `params.passes` | Unit is `'n'` — ambiguous. Standard for count/iteration params is not established; but `unit` field is present, satisfying G16 mechanically. Consider `'×'` or `'pass'` for clarity. |

Registry entry (`registry.js` line 126):
- `type: 'boxblur'` — correct (lowercase, no separator)
- `label: 'BOX BLUR'` — correct (SCREAMING CASE, matches `name` in module)
- `description`: present — no compliance issue
- `factory: () => new BoxBlurNode()` — correct pattern

No colour, glyph, border, or text-treatment violations are introduced by the module definition itself (these are NodePanel rendering concerns, not module-level).

---

## Global Issues

| ID | Title | Applies? | Specific action for BOXBLUR |
|---|---|---|---|
| G1 | Driver (+D) button non-functional | YES | No module-level fix possible. Tracks as global. Ensure `radius` and (after G2 fix) `passes` have `driveable: true` so they are ready when G1 is resolved. |
| G2 | All numeric params must have `driveable: true` | YES | Add `driveable: true` to `params.passes`. `radius` already has it. |
| G5 | Slider: direct input + double-click-to-default | YES | No module-level change. NodePanel slider component fix. Both `radius` and `passes` are slider params and will benefit automatically. |
| G6 | Canvas click-to-pick for centre point params | NO | BOXBLUR has no centre X/Y params. Not applicable. |
| G7 | Vector module indicator | NO | BOXBLUR is a pixel module. Not applicable. |
| G9 | Time/iteration modules must expose FRAME param | NO | BOXBLUR has no time or animation state. `passes` is a spatial iteration count, not a frame index. Not applicable. |
| G10 | Vector modules must include SVG export | NO | Pixel module. Not applicable. |
| G11 | Overlapping features must use shared components | YES | No immediate action: BOXBLUR has no colour ramp, centre-point picker, or FRAME param. If a unit display component is built (G16), BOXBLUR consumes it automatically via NodePanel. |
| G12 | Web worker usage for expensive modules | YES | Review notes BOXBLUR is named as a slow module. Confirm `apply()` is invoked in the render worker, not the main thread. If main-thread: move to worker. No module-level code change; pipeline/worker configuration. |
| G14 | Mode-conditional params must hide when inactive | NO | BOXBLUR has no mode or type dropdown. Not applicable. |
| G16 | Slider inputs must display units | YES | `radius` has `unit: 'px'` — satisfies G16 mechanically. `passes` has `unit: 'n'` — present but the symbol `'n'` is ambiguous; replace with `'×'` (multiply sign, meaning "times/passes") for unambiguous display. Requires NodePanel to render unit field; module-level field is already present. |

---

## Merge Absorption

The review notes `passes` lacks `driveable: true` in the reference source but the live source does not add it either. Merge target is: live source adds `driveable: true` to `passes`. No merge conflict with reference source (reference is older, live is the working baseline).

The preview radius strategy conflict (legacy doc "halved" vs `previewMax: 10`) is resolved: treat `previewMax: 10` as authoritative per migration-log note. No code change required.

---

## Required Changes (priority ordered)

### P1 — Add `driveable: true` to `passes` param [G2]

**File:** `assets/js/tools/processors/distort/nodes/blur/BoxBlurNode.js`

```js
passes: { value: 1, min: 1, max: 5, step: 1, label: 'PASSES', tier: 4, previewMax: 2, driveable: true, unit: 'n' }
```

Currently `driveable` is absent on `passes`. This is the only module-level G2 defect. One character change.

---

### P2 — Clarify `passes` unit symbol [G16]

**File:** `assets/js/tools/processors/distort/nodes/blur/BoxBlurNode.js`

Change `unit: 'n'` to `unit: '×'` on `passes`. The symbol `'n'` does not communicate "number of passes" to a user reading a rendered slider. `'×'` (multiply/times) is unambiguous in context ("3 ×" = 3 passes).

---

### P3 — Resolve non-functional driver slot on `radius` [G1 dependency]

**File:** `assets/js/tools/processors/distort/nodes/blur/BoxBlurNode.js`

**Blocked by G1** (driver +D button non-functional globally). Do not implement until G1 is resolved.

When G1 is resolved: the `apply()` signature must be extended to `apply(src, dst, w, h, p, ctx, modulate)` and `p.radius` must be replaced with `modulate('radius', i)` calls inside a per-pixel loop, OR the algorithm must be restructured to apply a spatially varying radius per-row/column. Note: per-pixel radius variation is architecturally non-trivial for a separable box blur (the running-sum approach assumes a fixed radius per pass). Options at that time:

a. **Accept scalar-only driver**: remove `driveable: true` from `radius` until a per-pixel-radius algorithm is implemented. Honest; prevents misleading UI.
b. **Frame-level driver**: resolve `modulate('radius', 0)` once per frame (pixel index 0) to get a scalar; pass to `boxBlurSeparable`. Allows expression and non-spatial image drivers to function; per-pixel image drivers still have no spatial effect.
c. **Full per-pixel**: requires a non-separable or row-by-row variable-radius implementation in `blur-filters.js`. High cost; deferred.

**Recommended immediate action (pre-G1 fix):** Document the limitation. Do not change `driveable: true` on `radius` — it is correct intent and will be needed when G1 is resolved.

---

### P4 — Confirm worker offload [G12]

**File:** Pipeline / worker configuration (not `BoxBlurNode.js`)

Confirm `apply()` is called from the render worker thread, not the main thread. The review observed slowness; performance docs confirm worst-case is class B (30–100 ms at 4K, 5 passes). This is acceptable if off-thread. If currently on the main thread, move to worker. No change to `BoxBlurNode.js` itself.

---

## Verification Criteria

1. `params.passes.driveable === true` in live source after P1 change.
2. `params.passes.unit === '×'` after P2 change (or alternative agreed symbol).
3. `params.radius.driveable === true` and `params.radius.unit === 'px'` — unchanged, already correct.
4. `params.radius.previewMax === 10` and `params.passes.previewMax === 2` — unchanged, already correct.
5. `apply()` produces visually correct box blur output at radius 1, 10, 50 and passes 1, 3, 5.
6. PREVIEW mode does not render radius > 10 or passes > 2 (factory-enforced via `previewMax`).
7. Registry entry: `type: 'boxblur'`, `label: 'BOX BLUR'`, correct factory, under `'BLUR'` category.
8. No `document.*`, `window.*`, `requestAnimationFrame`, or `setInterval` introduced.
9. After G1 is resolved: `+D` button on `radius` opens driver settings; after G1+P3, attaching a driver produces the expected modulation behaviour per chosen resolution (P3a/b/c).
10. After G12 investigation: render worker hosts `apply()` call; main thread is not blocked during blur computation.
