# INVERT — Build Guide

- module: invert
- node: InvertNode.js
- category: COLOUR / TONE
- review verdict: KEEP
- rebuild severity: MINOR

---

## Current State Summary

Current implementation (`assets/js/tools/processors/distort/nodes/colour/InvertNode.js`) is a 11-line factory call via `createEffectModule`. It delegates entirely to `invertColours(src, w, h)` from `shared/algorithms/image/colour-adjustments.js`, copies the result into `dst`, declares `isLUT: true`, and defines `params: {}`. Registry import is correct. Architecture is fully compliant. No bugs detected in source.

The module is parameterless by design. The review verdict is KEEP with one parity gap: the absence of selective inversion modes (luminosity-only, hue-only, all). No structural rebuild is required; all work is additive.

---

## Reference Parity Gaps

| Gap | Source | Severity |
|---|---|---|
| No MODE param for selective inversion (luminosity-only / hue-only / all) | `review2403/invert_review2403.md` action item 1; `description.md §Scope Boundary` confirms current module is full-only | MODERATE |

Reference source (`reference/distort/invert/source/InvertNode.js`) is byte-identical to current implementation — no divergence. `feature-parity.md` explicitly confirms no parity holes exist for the current scope. The parity gap is a **new feature request** (selective mode) that postdates the reference snapshot, not a regression.

---

## Review Spec Gaps

| Clause | File | Status |
|---|---|---|
| Add MODE param: invert LUMINOSITY / COLOUR (hue) / ALL | `invert_review2403.md` action item 1 | Not implemented |
| Fix +D driver button (G1) | `invert_review2403.md` action item 2 | Global — tracked separately |
| Audit all params for `driveable: true` (G2) | `invert_review2403.md` action item 3 | N/A — no numeric params exist; moot until MODE param is added |

---

## Missing Parameters

| Key | Label | Type | Range | Default | Notes |
|---|---|---|---|---|---|
| `mode` | MODE | select | `all` \| `luminosity` \| `hue` | `all` | Determines which channel space to invert. Required by review action item 1. |

When `mode = luminosity`: convert RGB→HSL, invert L, convert back. When `mode = hue`: convert RGB→HSL, rotate H by 180°, convert back. When `mode = all`: current behaviour (`255 − v` per RGB channel). The algorithm for non-`all` modes requires a new function in `shared/algorithms/image/colour-adjustments.js`.

`mode` is a select (not range) param — `driveable: true` does not apply per G2 (G2 targets numeric/range params only).

---

## Extra/Incorrect Parameters

None.

---

## UI Compliance Issues

None. The module currently exposes no params, so no NodePanel rows exist to audit. Universal controls (drag handle, enable toggle, solo) and composition params (OPACITY, BLEND MODE) are owned by EffectNode/NodePanel and are not in scope here.

When `mode` param is added: it is a select-type param and therefore exempt from G5 (slider direct input), G16 (unit display), and G2 (`driveable: true`). The MODE dropdown must follow `component-patterns.md` dropdown conventions.

---

## Global Issues

| Issue | Applicability to INVERT | Action |
|---|---|---|
| **G1** Driver +D button non-functional | Applies to all modules. INVERT currently has no params, so no +D rows exist. If MODE param is added (select type), it does not expose +D. No direct impact. | None module-specific; track globally. |
| **G2** All numeric params must have `driveable: true` | INVERT has zero numeric (range) params. Moot in current state. If MODE param (select) is added, it is exempt. | None. |
| **G5** Slider direct numeric input + double-click-to-default | No slider params. Not applicable. | None. |
| **G6** Canvas click-to-pick for centre point params | No centre X/Y params. Not applicable. | None. |
| **G7** Vector module identifier | INVERT is a pixel module (`isVector: false`). Not applicable. | None. |
| **G9** Time/iteration modules must expose FRAME param | INVERT has no animation/iteration state. Not applicable. | None. |
| **G10** Vector modules must include in-module SVG export | Pixel module. Not applicable. | None. |
| **G11** Overlapping feature additions must use shared components | If MODE param is added: the select/dropdown component must come from the shared component library — do not implement a bespoke dropdown. | Verify MODE dropdown uses shared `SectionDropdown` or NodePanel-standard select. |
| **G12** Web worker usage for expensive modules | INVERT is O(n) cost class A (trivially cheap). No worker change required. | None. |
| **G14** Mode-conditional params must hide when not applicable | If MODE param is added, no other params depend on mode — there are no conditional params to show/hide. Not applicable to this module in its current additive scope. | None, unless future selective-mode params introduce mode-specific controls. |
| **G16** Slider/number inputs must display units | No numeric params. Not applicable. | None. |

---

## Merge Absorption

No open merge items. Reference source is identical to current implementation. `migration-log.md` notes no deferred items beyond the PLAN2403 Phase 6 full-pack rewrite directive (already executed — this guide is the output of that phase for INVERT).

---

## Required Changes (priority ordered)

### P1 — Feature Addition: MODE param for selective inversion [MODERATE]

**Rationale:** Sole action item from `invert_review2403.md`. Extends scope without breaking existing behaviour (`mode = 'all'` is default and maps exactly to current algorithm).

**Steps:**

1. Add `invertColoursSelective(src, w, h, mode)` to `shared/algorithms/image/colour-adjustments.js`:
   - `mode = 'all'`: existing `255 − v` per RGB channel (can delegate to existing `invertColours`).
   - `mode = 'luminosity'`: RGB → HSL, `L = 1 − L`, HSL → RGB.
   - `mode = 'hue'`: RGB → HSL, `H = (H + 0.5) % 1.0`, HSL → RGB.

2. Update `InvertNode.js`:
   ```js
   import { createEffectModule } from '../../core/EffectModule.js';
   import { invertColoursSelective } from '../../../../../shared/algorithms/image/colour-adjustments.js';

   export const InvertNode = createEffectModule({
     type: 'invert', name: 'INVERT', category: 'COLOUR / TONE',
     isLUT: false,  // LUT chaining only valid for 'all' mode; disable to avoid incorrect LUT composition for selective modes
     params: {
       mode: { type: 'select', label: 'MODE', options: ['all', 'luminosity', 'hue'], value: 'all' },
     },
     apply(src, dst, w, h, p) {
       dst.set(invertColoursSelective(src, w, h, p.mode));
     }
   });
   ```

   **Note on `isLUT`:** The current `isLUT: true` is only correct when `mode = 'all'`. HSL-space operations cannot be represented as independent per-channel LUTs. Set `isLUT: false` when MODE param is added, or implement dynamic `isLUT` toggling based on current mode (if the pipeline supports it). Simplest correct fix: unconditionally set `isLUT: false`.

3. Confirm MODE dropdown uses shared NodePanel select component (G11 compliance).

### P2 — isLUT correctness [MINOR — prerequisite to P1]

If MODE param is NOT added (deferred), `isLUT: true` remains correct for the all-channel case. If MODE is added, `isLUT` must be set `false` unconditionally or made conditional. This is a correctness issue: LUT chaining with selective inversion would produce wrong pixel output.

### P3 — G1: Driver +D button [GLOBAL — deferred]

No module-specific work. Fix in NodePanel when G1 is resolved globally.

---

## Verification Criteria

| Criterion | Pass condition |
|---|---|
| MODE = all | Output matches current `invertColours` output exactly (255 − v per RGB channel, alpha unchanged) |
| MODE = luminosity | RGB channels pass-through for equal-luminance pixels; only brightness polarity reverses; hue and saturation unchanged |
| MODE = hue | Luminance unchanged; hue shifted by 180°; saturation unchanged; warm colours become cool |
| Self-inverse property (all mode) | Applying INVERT(all) twice returns the original image identically |
| Self-inverse property (luminosity mode) | Applying INVERT(luminosity) twice returns the original image |
| Self-inverse property (hue mode) | Applying INVERT(hue) twice returns the original image |
| isLUT set correctly | `isLUT: false` when MODE param is present; no incorrect LUT composition occurs |
| Default mode | `mode = 'all'` produces output identical to pre-change behaviour |
| Existing ETCH preset | ETCH preset continues to function correctly after change |
| No numeric params without unit | No range-type params added without `unit` field (G16) |
| Algorithm isolated | HSL conversion logic placed in `colour-adjustments.js`, not in `InvertNode.js` |
| No DOM / RAF / setInterval | None introduced |
