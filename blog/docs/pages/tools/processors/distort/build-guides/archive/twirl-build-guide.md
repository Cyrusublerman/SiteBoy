# TWIRL — Build Guide

- module: twirl
- node: TwirlNode.js
- category: DISTORTION
- review verdict: KEEP
- rebuild severity: MINOR

---

## Current State Summary

`TwirlNode.js` is a factory-pattern module (`createEffectModule`) that delegates all pixel work to `twirl()` in `shared/algorithms/geometry/distortion.js`. The algorithm is a quadratic-falloff inverse-mapping radial rotation: for each pixel inside the effect circle, twist angle `θ = t² × angle × π/180` where `t = 1 − dist/r`. Preview quality reduces to nearest-neighbour via `ctx.quality`. The implementation is structurally sound and algorithmically correct. No architectural violations are present. The only substantive defect is that `driveable: true` is declared on `centreX` and `centreY` in the live source but those params were not driveable in the reference source — this is an improvement over the reference. However, `apply()` accepts no `modulate` argument, so driveable state on all four params is non-functional for per-pixel modulation. No further functional, algorithmic, or structural changes are required; all outstanding issues are global.

---

## Reference Parity Gaps

| Item | Reference source | Live source | Status |
|------|-----------------|-------------|--------|
| `angle` driveable | `true` | `true` | Parity |
| `radius` driveable | `true` | `true` | Parity |
| `centreX` driveable | absent | `true` | Live source adds driver support — improvement, not a gap |
| `centreY` driveable | absent | `true` | Live source adds driver support — improvement, not a gap |
| `radius` unit string | absent | `'0–1'` | Live source adds unit — improvement |
| `centreX` unit string | absent | `'0–1'` | Live source adds unit — improvement |
| `centreY` unit string | absent | `'0–1'` | Live source adds unit — improvement |
| All param values, ranges, steps, labels, tiers | match | match | Parity |
| `apply()` body — interp switch, `dst.set(twirl(...))` | match | match | Parity |

Functional parity: **complete.** Live source is strictly a superset of the reference.

---

## Review Spec Gaps

| Action item from review | Status |
|-------------------------|--------|
| Canvas click-to-pick for centre point (G6) | Not implemented — global deferred item |
| Fix +D driver button (G1) | Not implemented — global host-system bug |
| `driveable: true` audit (G2) | Partially resolved: all four params have `driveable: true`; `modulate` wiring absent |
| Slider direct input + double-click-to-default (G5) | Not implemented — global host-system feature |

No review spec gaps are module-specific defects. All four action items are global issues tracked in `_global_issues.md`.

---

## Missing Parameters

None. All parameters defined in the reference and review spec are present.

---

## Extra/Incorrect Parameters

None. The four params (`angle`, `radius`, `centreX`, `centreY`) are correct in key, label, type, range, step, default, tier, and unit. No extraneous params exist.

The `radius` tier discrepancy (legacy doc: tier 4; live source: tier 3) is resolved — source is authoritative, tier 3 is correct.

---

## UI Compliance Issues

1. **G16 — Unit display.** `angle` declares `unit: 'deg'`; `radius`, `centreX`, `centreY` declare `unit: '0–1'`. Units are present in param defs. Whether the NodePanel slider component renders them is a host-system concern (G16), not a module defect. Module-side obligation is met.

2. **G5 — Slider direct input / double-click-to-default.** Not a module defect; NodePanel component fix required (G16/G5 host).

3. **G6 — PICK CENTRE button.** Not implemented. Requires a shared `CentrePointPicker` component (G11) before per-module adoption. Module cannot implement this unilaterally without the shared component existing first.

No module-level UI compliance violations are present. All outstanding UI issues are host-system or shared-component obligations.

---

## Global Issues

| Issue | Applicability to TWIRL | Notes |
|-------|------------------------|-------|
| G1 — +D button non-functional | Applies — all four params show +D | Host fix required |
| G2 — driveable on all numeric params | Met at declaration level — all four params have `driveable: true` | `modulate` wiring blocked by G1 fix |
| G5 — Slider direct input + double-click-to-default | Applies — all four slider params affected | NodePanel component fix |
| G6 — Canvas click-to-pick for centre point | Applies — `centreX`, `centreY` | Requires shared `CentrePointPicker` (G11) |
| G7 — Vector module badge | Does not apply — TWIRL is pixel output | N/A |
| G9 — FRAME param for time-based modules | Does not apply — TWIRL has no iteration/time state | N/A |
| G10 — In-module SVG export | Does not apply — TWIRL is pixel output | N/A |
| G11 — Shared components before per-module adoption | Applies to G6 (CentrePointPicker) | Do not add per-module picker; build shared component first |
| G12 — Worker offload for expensive modules | Low priority — TWIRL is cost class B at typical radius; nearest-neighbour preview exists | No blocking issue |
| G14 — Mode-conditional param visibility | Does not apply — TWIRL has no mode switching | N/A |
| G16 — Units on numeric params | Met at module level — `unit` declared on all params | NodePanel rendering is host concern |

---

## Merge Absorption

The live source already incorporates all reference source logic. No merge is required. The live source is the canonical version.

---

## Required Changes (priority ordered)

All changes below are **global-system changes**, not TWIRL-specific changes. TWIRL's module file (`TwirlNode.js`) requires no edits.

1. **[GLOBAL / G1] Fix +D driver button in NodePanel.** Until resolved, `driveable: true` on all params is invisible to users. No TWIRL file edit required.

2. **[GLOBAL / G11 + G6] Build shared `CentrePointPicker` component.** Once built, wire to TWIRL's `centreX`/`centreY` params alongside `radialblur`, `spherize`, `lensbubbles`, `chromaticab`. No TWIRL file edit until shared component exists.

3. **[GLOBAL / G5] Add direct numeric input and double-click-to-default to NodePanel slider.** No TWIRL file edit required.

4. **[GLOBAL / G16] Verify NodePanel renders `unit` strings from param defs.** TWIRL has declared units; rendering is the NodePanel's responsibility. No TWIRL file edit required.

5. **[OPTIONAL / PERFORMANCE] Short-circuit `angle === 0` in `twirl()` in `distortion.js`.** When `angle` is 0, `θ = 0` for every pixel and the rotation matrix is identity — source pixels can be copied directly. Guard: `if (angle === 0) { dst.set(src); return dst; }`. Minor throughput improvement; not blocking.

---

## Verification Criteria

After global fixes are applied, verify TWIRL as follows:

- [ ] `angle` slider ranges −720–720, step 1, default 180, unit `deg` displayed.
- [ ] `radius` slider ranges 0.01–1, step 0.01, default 0.5, unit `0–1` displayed.
- [ ] `centreX` slider ranges 0–1, step 0.01, default 0.5, unit `0–1` displayed.
- [ ] `centreY` slider ranges 0–1, step 0.01, default 0.5, unit `0–1` displayed.
- [ ] Swirl visible and correct at `angle: 180`, `radius: 0.5`, centre at 0.5/0.5.
- [ ] `angle: 0` produces identity output (no distortion).
- [ ] `angle: -180` produces anticlockwise swirl mirroring positive 180 direction.
- [ ] Pixels outside `radius` circle are copied verbatim (no distortion at edges).
- [ ] Preview quality (`ctx.quality === 'preview'`) uses nearest-neighbour; full quality uses bilinear.
- [ ] +D button appears on all four params after G1 fix; connecting a driver modulates per-pixel (after `modulate` is wired by G1 resolution).
- [ ] PICK CENTRE interaction sets `centreX`/`centreY` after G6/G11 shared component is built and wired.
- [ ] Double-clicking a param value resets to default after G5 fix.
- [ ] Typed input accepted on all sliders after G5 fix.
