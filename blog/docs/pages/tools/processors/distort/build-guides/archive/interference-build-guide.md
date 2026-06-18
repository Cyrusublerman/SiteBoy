# INTERFERENCE — Build Guide

- module: interference
- node: InterferenceNode.js
- category: OPTICS
- review verdict: KEEP
- rebuild severity: MODERATE

---

## Current State Summary

Live node (`nodes/optics/InterferenceNode.js`) is a `createEffectModule` factory with five params:
`frame`, `filmThickness`, `viewAngle`, `iridescence`, `blendAmt`. It delegates all pixel work to
`thinFilmInterferenceRGBA` (shared algorithm). Algorithm: luminance → effective thickness
`d = filmThickness + frame×2 + lum×200×iridescence`; OPD = 2 × 1.33 × d × cos(θ); per-channel
reflectance at λ ∈ {650, 550, 450} nm; linear blend with source.

Reference source (`reference/…/source/InterferenceNode.js`) has four params (no `frame`);
`apply()` passes `p.filmThickness` directly (no frame modulation). Live node diverges by adding
`frame` and baking thickness modulation `(thick = p.filmThickness + p.frame × 2)` directly into
`apply()` — not via the algorithm signature.

Core is functional and fast (class A–B, O(w×h)). Primary failures: all driveable params lack
`modulate()` invocation; `n = 1.33` hardcoded; no render modes; no refractive index param; no
COUPLING STRENGTH / THICKNESS SOURCE separation; no field output; IRIDESCENCE label semantically
wrong.

---

## Reference Parity Gaps

| # | Gap | Live status | Severity |
|---|-----|-------------|----------|
| RP-1 | `frame` param absent in reference; live adds `frame` (tier 3, driveable) and applies it as `filmThickness + frame×2` directly in `apply()` | Added in live — not in reference; diverges from reference architecture (thickness logic belongs in algorithm, not node) | WARN |
| RP-2 | Reference `apply()` passes `p.filmThickness` to algorithm; live passes `thick = p.filmThickness + p.frame × 2` — algorithm signature changed implicitly | Divergent | WARN |
| RP-3 | Reference has no modulation path and no `modulate()` invocation; live is identical — both declare `driveable: true` on all params without invoking `modulate()` | Both broken; parity confirmed on the broken state | ERROR |
| RP-4 | `blendAmt` was tier 3 in legacy doc; moved to tier 3 in live — consistent | OK | — |
| RP-5 | `viewAngle` tier 4 in both | OK | — |

---

## Review Spec Gaps

All items from `interference_review2403.md §Action Items` mapped here.

| # | Review item | Priority | Status |
|---|-------------|----------|--------|
| RS-1 | Remove `driveable: true` from all four params OR implement `modulate()` properly | CRITICAL | Not done |
| RS-2 | Expose REFRACTIVE INDEX as user param (1.0–2.0, step 0.01, default 1.33, unit n) | CRITICAL | Not done |
| RS-3 | Separate BASE THICKNESS from luminance coupling; add COUPLING STRENGTH param (rename IRIDESCENCE); add THICKNESS OFFSET | HIGH | Not done |
| RS-4 | Add THICKNESS SOURCE param (LUMINANCE / RADIAL DISTANCE / NOISE FIELD / POSITION X / POSITION Y / EXTERNAL FIELD) | HIGH | Not done |
| RS-5 | Add HUE ONLY and CHROMA ONLY render modes | HIGH | Not done |
| RS-6 | Add FIELD output mode (export phase and fringe-band scalar) | HIGH | Not done |
| RS-7 | Add PHASE BANDS render mode with FRINGE CONTRAST and BAND FREQUENCY params | HIGH | Not done |
| RS-8 | Add TEMPORAL MODE (STATIC / DRIFT / SWEEP) with PHASE DRIFT SPEED and FRAME param | MEDIUM | Partially: FRAME param exists in live but no TEMPORAL MODE enum, no DRIFT/SWEEP |
| RS-9 | Add IMAGE MODIFY mode (HUE BY PHASE, SATURATION BY INTERFERENCE, BLUR BY FRINGE, GRAIN BY INTERFERENCE) | MEDIUM | Not done |
| RS-10 | Fix +D driver button (G1); implement real per-pixel modulation once architecture ready (G2) | (global) | Not done |
| RS-11 | Slider direct input + double-click-to-default (G5) | (global) | Not done |
| RS-12 | Unit labels on all params (G16) | (global) | Partial: `filmThickness` has `unit: 'nm'`, `viewAngle` has `unit: 'deg'`, `iridescence` lacks unit (should be none/unitless label), `blendAmt` has `unit: '0–1'`; `frame` has `unit: 'frames'` — all present |
| RS-13 | Hide mode-conditional params per active OUTPUT MODE and THICKNESS SOURCE (G14) | (global) | N/A until modes added |
| RS-14 | Verify VIEW ANGLE label untruncated at standard NodePanel width | WARN | Not verified |
| RS-15 | Rename IRIDESCENCE to COUPLING STRENGTH or THICKNESS RESPONSE | HIGH | Not done |

---

## Missing Parameters

| Key | Label | Type | Range | Default | Unit | Tier | Driveable | Notes |
|-----|-------|------|-------|---------|------|------|-----------|-------|
| `refractiveIndex` | REFRACTIVE INDEX | range | 1.0–2.0 | 1.33 | n | 3 | true | Unlocks physical medium selection; currently hardcoded in algorithm |
| `thicknessSource` | THICKNESS SOURCE | select | LUMINANCE / RADIAL / NOISE / POS X / POS Y / EXTERNAL | LUMINANCE | — | 3 | false | Controls which field drives spatial thickness variation |
| `thicknessOffset` | THICKNESS OFFSET | range | −400–400 | 0 | nm | 3 | true | Separate offset from BASE THICKNESS; enables field-only thickness drives |
| `outputMode` | OUTPUT MODE | select | COLOUR / HUE ONLY / CHROMA ONLY / PHASE BANDS / MONO FRINGE / IMAGE MODIFY / FIELD | COLOUR | — | 3 | false | Render mode selector; gates mode-conditional params |
| `fringeContrast` | FRINGE CONTRAST | range | 0–2 | 1 | — | 4 | true | Active in PHASE BANDS mode only |
| `bandFrequency` | BAND FREQUENCY | range | 1–20 | 5 | — | 4 | true | Active in PHASE BANDS mode only |
| `temporalMode` | TEMPORAL MODE | select | STATIC / DRIFT / SWEEP | STATIC | — | 4 | false | Controls temporal behaviour |
| `phaseDriftSpeed` | DRIFT SPEED | range | 0–10 | 1 | nm/fr | 4 | true | Active when TEMPORAL MODE ≠ STATIC |
| `luminancePreserve` | PRESERVE LUMA | toggle | — | false | — | 4 | false | Lock luminance channel; apply interference to hue/chroma only |

---

## Extra/Incorrect Parameters

| Key | Issue | Action |
|-----|-------|--------|
| `frame` | Not in reference; added in live with thickness logic baked into `apply()` as `thick = p.filmThickness + p.frame × 2`. Multiplication factor (2) is arbitrary and undocumented. If retained, the frame-to-thickness delta should be a named param (DRIFT SPEED) or driven via TEMPORAL MODE, not a raw scalar baked into the node. | Supersede with TEMPORAL MODE + DRIFT SPEED architecture; remove raw `frame×2` arithmetic from `apply()` |
| `iridescence` | Label IRIDESCENCE is semantically incorrect — param controls luminance-to-thickness coupling strength, not iridescence. Misleads users about function. | Rename key to `couplingStrength`, label to `COUPLING STRENGTH`, keep range 0–2 |

---

## UI Compliance Issues

| # | Issue | Source | Severity |
|---|-------|--------|----------|
| UI-1 | IRIDESCENCE label does not describe what the param controls (luminance coupling weight). User cannot infer function from label alone. | review §7.1 | WARN |
| UI-2 | VIEW ANGLE label (10 chars including space) — truncation risk at narrow NodePanel widths. Verify renders without clipping. | review §4.2 | WARN |
| UI-3 | All four driveable params show +D slots implying driver reactivity; none are functional — `apply()` has no `modulate()` calls. UI contract is misrepresented to user. | review §4.5, issues-and-conflicts.md | ERROR |
| UI-4 | No mode-conditional param hiding — when OUTPUT MODE and THICKNESS SOURCE params are added, inapplicable params must be hidden (G14). Currently N/A; enforce when modes are implemented. | G14 | PENDING |
| UI-5 | `blendAmt` unit `'0–1'` is a range description not a unit symbol. Should be empty string or `'%'` at display level. Minor. | G16 | WARN |

---

## Global Issues

| Issue | Applicability to INTERFERENCE | Action |
|-------|------------------------------|--------|
| **G1** — +D button non-functional | Affects all four driveable params: `filmThickness`, `viewAngle`, `iridescence`/`couplingStrength`, `blendAmt`. None can be configured from UI. | Fix NodePanel +D event handler (systemic). |
| **G2** — All numeric params must support `driveable: true` | All four existing numeric params already declared `driveable: true`. New params (`refractiveIndex`, `thicknessOffset`, `fringeContrast`, `bandFrequency`, `phaseDriftSpeed`) must also be `driveable: true`. | Add `driveable: true` to all new numeric params on creation. |
| **G5** — Slider direct input + double-click-to-default | Affects all slider params in this module (5 existing + new numeric params). | Implement in slider component (systemic). |
| **G6** — Canvas click-to-pick for centre point params | Not applicable — INTERFERENCE has no centre X/Y params. | None. |
| **G7** — Vector module identifier | Not applicable — INTERFERENCE is a pixel module. | None. |
| **G9** — FRAME param required for time-based modules | `frame` param is present in live. If TEMPORAL MODE is added, FRAME must remain the animation driver target. Confirm `driveable: true` and correct tier (tier 3 in live). | Verify FRAME param survives architecture revision; confirm it is the timeline driver target. |
| **G10** — SVG export for vector modules | Not applicable — pixel module. | None. |
| **G11** — Shared components for overlapping feature patterns | THICKNESS SOURCE control, TEMPORAL MODE selector, and FIELD output share patterns with other modules. Do not reimplement per-module. Check component library before coding. | Use/extend shared NoiseSourceControl, FrameSlider, FieldOutputControl if available. |
| **G12** — Web worker usage | INTERFERENCE is class A–B (< 20 ms full res). No blocking risk. No worker required unless architecture expansion (multiple render modes, multi-wavelength spectral sampling) raises cost class. | Confirm `apply()` runs in render worker. No further action unless cost rises. |
| **G14** — Mode-conditional param hiding | When OUTPUT MODE and THICKNESS SOURCE params are added, mode-inactive params must be hidden — not just disabled. Affects: FRINGE CONTRAST + BAND FREQUENCY (PHASE BANDS only), DRIFT SPEED (DRIFT/SWEEP only), THICKNESS SOURCE sub-params. | Implement `when` predicate on all new mode-conditional params when modes are added. |
| **G16** — Unit labels on slider params | `filmThickness` → `nm` ✓. `viewAngle` → `deg` ✓. `frame` → `frames` ✓. `blendAmt` → `'0–1'` (acceptable; minor). `iridescence`/`couplingStrength` — no unit (unitless; correct to omit or label `×`). New params: `refractiveIndex` → `n`; `thicknessOffset` → `nm`; `fringeContrast` → none; `bandFrequency` → none; `phaseDriftSpeed` → `nm/fr`. | Add units to new params on creation. |

---

## Merge Absorption

The live node adds `frame` param beyond the reference. This is a legitimate seed of G9 compliance
but the implementation (raw `frame × 2` arithmetic in `apply()`) is incorrect architecture. The
intent is absorbed into the RS-8 TEMPORAL MODE requirement. The `frame` param itself is retained
as the animation driver target; the `× 2` scaling factor is superseded by a DRIFT SPEED param or
folded into TEMPORAL MODE logic.

No other live divergences represent features to absorb — all other live params match reference.

---

## Required Changes (priority ordered)

### P0 — Correctness blockers (must fix before any expansion)

1. **Remove `driveable: true` from all params OR implement `modulate()` in `apply()`.**
   All four params (`filmThickness`, `viewAngle`, `iridescence`, `blendAmt`) declare `driveable: true`
   but `apply(src, dst, w, h, p)` reads directly from `p` with no `modulate()` calls. The factory
   pattern exposes `getModulated(key, pixelIdx, ctx)` on the EffectNode base. Either:
   — (preferred) rewrite `apply()` to iterate pixels and call `this.getModulated(key, i, ctx)` for
     each driveable param per pixel, OR
   — temporarily remove `driveable: true` from all four until modulate is implemented.
   Per-pixel thickness modulation is cheap (O(w×h) already) and a primary use case.

2. **Expose REFRACTIVE INDEX as a user param.**
   Add `refractiveIndex: { label: 'REFRACTIVE INDEX', min: 1.0, max: 2.0, step: 0.01, value: 1.33, tier: 3, unit: 'n', driveable: true }`.
   Pass to `thinFilmInterferenceRGBA` — update algorithm signature to accept `n` as argument
   rather than using the hardcoded constant.

### P1 — Param correctness

3. **Rename `iridescence` → `couplingStrength`; label `COUPLING STRENGTH`.**
   Range, step, default unchanged (0–2, step 0.05, default 1). No unit (dimensionless multiplier).
   Resolves IRIDESCENCE label ambiguity flagged in review §7.1.

4. **Fix `frame` param architecture.**
   Remove `thick = p.filmThickness + p.frame * 2` from `apply()`. Replace with DRIFT SPEED param
   or wire into TEMPORAL MODE. `frame` param should remain as the animation driver target at tier 3,
   `driveable: true`; the per-frame thickness delta is controlled by a separate DRIFT SPEED param.

5. **Add THICKNESS OFFSET param.**
   `thicknessOffset: { label: 'THICKNESS OFFSET', min: -400, max: 400, step: 5, value: 0, tier: 3, unit: 'nm', driveable: true }`.
   Separates DC offset from luminance coupling. Required before THICKNESS SOURCE is added.

### P2 — Architecture expansion (minimum acceptable upgrade)

6. **Add THICKNESS SOURCE param** (select type).
   Options: LUMINANCE (default, current behaviour) / RADIAL DISTANCE / NOISE FIELD / POSITION X / POSITION Y / EXTERNAL FIELD.
   Drive spatial thickness variation from non-luminance sources. Update `apply()` to compute
   effective thickness from selected source field.

7. **Add OUTPUT MODE param** (select type).
   Options: COLOUR (default) / HUE ONLY / CHROMA ONLY / PHASE BANDS / MONO FRINGE / FIELD.
   Gate mode-conditional params via `when` predicate per G14.

8. **Add luminance-preserving render modes** (HUE ONLY, CHROMA ONLY).
   Convert output to HSL, replace H (or C) with interference-derived value, convert back to RGB.
   Preserves source tonal values while applying interference colour shift.

9. **Add PHASE BANDS mode** with `fringeContrast` and `bandFrequency` params.
   Render OPD fringe contours as visible banding. Params hidden when OUTPUT MODE ≠ PHASE BANDS (G14).

10. **Add FIELD output mode.**
    Export phase scalar or fringe-band index as output buffer for downstream use. Required for
    painterly/tessellation coupling identified in review §7.2.

### P3 — Temporal and advanced

11. **Add TEMPORAL MODE param** (STATIC / DRIFT / SWEEP) with `phaseDriftSpeed` param.
    DRIFT advances effective thickness by `phaseDriftSpeed × frame` per frame.
    SWEEP oscillates `viewAngle` over a range.
    `phaseDriftSpeed` hidden when TEMPORAL MODE = STATIC (G14).

12. **Add IMAGE MODIFY mode.**
    HUE BY PHASE, SATURATION BY INTERFERENCE, BLUR BY FRINGE, GRAIN BY INTERFERENCE sub-params.
    Lower priority; only after core modes stable.

### P4 — Global compliance (systemic; listed for completeness)

13. Fix NodePanel +D event handler — G1 (systemic).
14. Slider direct input + double-click-to-default — G5 (systemic).
15. Verify VIEW ANGLE label not truncated at standard panel width — UI-2.

---

## Verification Criteria

| # | Criterion | Pass condition |
|---|-----------|----------------|
| V-1 | `modulate()` path active | Connecting an image driver to THICKNESS param spatially varies per-pixel thickness; output fringe pattern changes spatially with driver map |
| V-2 | REFRACTIVE INDEX param functional | Sweeping 1.0→2.0 produces measurable OPD and hue-sequence shift; n=1.0 (air gap) and n=1.58 (mica) produce distinct colour sequences at same THICKNESS |
| V-3 | COUPLING STRENGTH replaces IRIDESCENCE | Key renamed in serialisation; old `iridescence` key absent from node definition; label reads `COUPLING STRENGTH` in NodePanel |
| V-4 | `frame×2` arithmetic absent from `apply()` | `apply()` does not contain `filmThickness + p.frame * 2`; frame-to-thickness derivation handled by TEMPORAL MODE / DRIFT SPEED |
| V-5 | THICKNESS OFFSET param functional | THICKNESS OFFSET = 0 at COUPLING STRENGTH = 0 produces spatially uniform colour; THICKNESS OFFSET shifts the base OPD without affecting luminance coupling |
| V-6 | HUE ONLY mode | Output shows iridescent hue variation while source luminance values are preserved (luma channel unchanged) |
| V-7 | CHROMA ONLY mode | Source luminance and hue-structure preserved; only chroma modulated by interference |
| V-8 | PHASE BANDS mode | Distinct fringe band contours visible; FRINGE CONTRAST and BAND FREQUENCY params both produce measurable output changes |
| V-9 | FIELD output mode | Output buffer contains scalar phase/fringe values interpretable as a downstream field; connecting FIELD output to a downstream module (e.g. COLOUR MAP) produces coherent fringe-structured result |
| V-10 | THICKNESS SOURCE variation | Switching from LUMINANCE to RADIAL DISTANCE produces a radially symmetric fringe pattern regardless of source image content |
| V-11 | TEMPORAL MODE DRIFT | At DRIFT mode, incrementing FRAME param advances fringe phase at rate controlled by DRIFT SPEED; STATIC mode: FRAME has no effect |
| V-12 | Mode-conditional params hidden | Params for inactive modes absent from NodePanel render (not just disabled — not rendered) per G14 |
| V-13 | Unit labels present | All numeric params display correct unit alongside value in NodePanel |
| V-14 | VIEW ANGLE label untruncated | Label `VIEW ANGLE` fully visible at standard NodePanel width; no ellipsis or clipping |
| V-15 | No regression at defaults | With all params at default (THICKNESS 300, COUPLING STRENGTH 1, VIEW ANGLE 0, BLEND 0.5, REFRACTIVE INDEX 1.33, OUTPUT MODE COLOUR), output matches pre-change iridescent behaviour |
| V-16 | `driveable: true` on all new numeric params | `refractiveIndex`, `thicknessOffset`, `fringeContrast`, `bandFrequency`, `phaseDriftSpeed` all have `driveable: true` in param definitions |
