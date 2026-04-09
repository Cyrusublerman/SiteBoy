# GRADIENTMAP — Build Guide

- module: gradientmap
- node: GradientMapNode.js
- category: COLOUR / TONE
- review verdict: KEEP
- rebuild severity: MINOR

---

## Current State Summary

`GradientMapNode.js` is a factory-pattern module (`createEffectModule`) that maps pixel luminance to a linear two-stop colour gradient. Algorithm is fully delegated to `applyGradientMap` in the shared algorithm layer. Six params cover the dark (shadow) and light (highlight) RGB stops. The module is registered correctly in `registry.js` under `COLOUR / TONE`. No presets reference it. The implementation is functionally correct and matches the reference source in all respects except `driveable: true` on every param.

The reference source (`reference/distort/gradientmap/source/GradientMapNode.js`) is identical to the live file *minus* `driveable: true` — the current implementation has already added `driveable: true` to all six params, making it *ahead* of the reference. The `apply()` signature in the current file (`src, dst, w, h, p`) omits `ctx` and `modulate`, which is consistent with the reference but inconsistent with the full factory standard.

---

## Reference Parity Gaps

| Gap | Detail | Severity |
|-----|--------|----------|
| `apply()` signature incomplete | Reference: `apply(src, dst, w, h, p)` — both reference and live implementation omit `ctx` and `modulate`. Factory standard is `apply(src, dst, w, h, p, ctx, modulate)`. Neither the reference nor the live file passes `modulate` into the body, so `driveable: true` flags on all params have no effect. | HIGH |
| `driveable: true` wired but not consumed | Current file has `driveable: true` on all six params but `apply()` does not call `getModulated()` — driver values are silently ignored at runtime. Reference source has no `driveable` at all; current implementation added the flag but not the consumption logic. | HIGH |

---

## Review Spec Gaps

| Spec item | Status |
|-----------|--------|
| G1 — +D button non-functional (global NodePanel bug) | Not addressable at module level; tracked globally. Module is conformant once G1 is fixed host-side. |
| G2 — all numeric params must have `driveable: true` | Params carry the flag; consumption is absent (see Reference Parity Gaps). Flag presence satisfies the declaration requirement; functional driver support requires `apply()` fix. |

---

## Missing Parameters

None. All six colour-stop components (`darkR`, `darkG`, `darkB`, `lightR`, `lightG`, `lightB`) are present with correct defaults, ranges, steps, and tiers.

Unit fields (`unit: 'lvl'`) are present on all params — satisfies G16 at the module definition level (rendering depends on NodePanel).

---

## Extra/Incorrect Parameters

None.

---

## UI Compliance Issues

| Issue | Reference | Status |
|-------|-----------|--------|
| Six discrete RGB sliders instead of a colour-picker control | `ui-layout.md` UX note; `component-patterns.md §2` lists `colour-input` as the canonical colour-input component | Acknowledged scope limitation — current implementation uses slider+number per channel, which is compliant with the numeric param contract. A `colour-input` integration is a future enhancement, not a defect. |
| No colour-picker composite control | `component-patterns.md §2`: `'color-input'` restricted to VGA palette — gradient map requires arbitrary RGB values (0–255), which exceeds VGA palette scope. Slider-per-channel is therefore the only compliant approach under current constraints. | Conformant by necessity. |
| Unit label rendering | `unit: 'lvl'` declared on all params; actual display depends on NodePanel slider component (global G16 issue) | Module-level conformant; rendering gap is global. |

No module-level UI violations. UI compliance of NodePanel rendering is a global concern (G5, G16).

---

## Global Issues

| Issue | Applicability to this module | Action |
|-------|------------------------------|--------|
| G1 — +D button non-functional | Affects all six driveable params | Fix in NodePanel host; no change to this module |
| G2 — driveable on all numeric params | All six params already have `driveable: true` — satisfied at definition level | Fix `apply()` signature and add `getModulated()` calls (see Required Changes) |
| G5 — slider direct input + double-click-to-default | Affects all six slider params | NodePanel global fix; no change to this module |
| G6 — canvas click-to-pick for centre params | Not applicable — module has no centre X/Y params | None |
| G7 — vector module identifiability | Not applicable — pixel module | None |
| G9 — FRAME param for time-based modules | Not applicable — stateless per-pixel transform | None |
| G10 — in-module SVG export | Not applicable — pixel output only | None |
| G11 — shared components for overlapping features | If colour-ramp control is later added globally, this module should consume it | Defer until shared component exists |
| G12 — web worker usage | Module is O(n) trivial cost; fully within acceptable main-thread budget. No worker required. | None |
| G14 — mode-conditional params hidden when inactive | Not applicable — no mode or type dropdown | None |
| G16 — unit labels on numeric params | `unit: 'lvl'` present on all params | NodePanel rendering fix; module is conformant |

---

## Merge Absorption

The current live file has already absorbed the only material improvement over the reference source: `driveable: true` on all six params. No merge from reference is required. The live file is the canonical source.

---

## Required Changes (priority ordered)

### 1. Fix `apply()` signature — add `ctx` and `modulate` args [HIGH]

**File:** `assets/js/tools/processors/distort/nodes/colour/GradientMapNode.js`

Current:
```js
apply(src, dst, w, h, p) {
  const gradient = [[p.darkR, p.darkG, p.darkB], [p.lightR, p.lightG, p.lightB]];
  dst.set(applyGradientMap(src, w, h, gradient));
}
```

Required:
```js
apply(src, dst, w, h, p, ctx, modulate) {
  const darkR  = modulate ? this.getModulated('darkR',  0, ctx) : p.darkR;
  const darkG  = modulate ? this.getModulated('darkG',  0, ctx) : p.darkG;
  const darkB  = modulate ? this.getModulated('darkB',  0, ctx) : p.darkB;
  const lightR = modulate ? this.getModulated('lightR', 0, ctx) : p.lightR;
  const lightG = modulate ? this.getModulated('lightG', 0, ctx) : p.lightG;
  const lightB = modulate ? this.getModulated('lightB', 0, ctx) : p.lightB;
  const gradient = [[darkR, darkG, darkB], [lightR, lightG, lightB]];
  dst.set(applyGradientMap(src, w, h, gradient));
}
```

**Note:** If `applyGradientMap` cannot accept per-pixel modulation (it constructs the gradient once), per-pixel driving of individual colour channels requires either (a) passing per-pixel modulation into the algorithm layer, or (b) performing the gradient interpolation inline with per-pixel `getModulated()` calls. The simplest compliant implementation above uses frame-level modulation (single resolved value per call), which is consistent with how all other non-spatial-modulation params work. Full per-pixel spatial modulation of individual colour-stop components would require a different algorithm signature — defer to G1/G2 global resolution for final architecture.

For the immediate fix: extend the signature to accept `ctx` and `modulate`; resolve param values frame-level via `getModulated` when `modulate` is truthy. This unblocks the driver system once G1 is fixed.

### 2. No further module-level changes required [NONE]

All params are correctly defined. Registry entry is correct. Algorithm delegation is correct. `unit` fields are present. No mode logic. No mode-conditional params. Not a vector module. Not time-based. O(n) cost — no previewMax required.

---

## Verification Criteria

1. `apply()` signature is `(src, dst, w, h, p, ctx, modulate)`.
2. All six colour-stop params resolve via `getModulated()` when `modulate` is truthy.
3. Output is visually identical to current output when no drivers are active (regression: dark `rgb(0,0,30)`, light `rgb(255,200,150)` default duotone is preserved).
4. When a driver is bound to any colour-stop param and G1 is resolved, adjusting the driver modulates the gradient output visually.
5. All six params still carry `driveable: true` and `unit: 'lvl'`.
6. Registry entry unchanged — `type: 'gradientmap'`, `label: 'GRADIENT MAP'`, `category: 'COLOUR / TONE'`.
7. No new files created; no ownership boundary crossed; change is isolated to `GradientMapNode.js`.
