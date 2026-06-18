# RIPPLE — Build Guide

- module: ripple
- node: RadialRippleNode.js
- category: REFRACTION
- review verdict: KEEP
- rebuild severity: MINOR

---

## Current State Summary

`RadialRippleNode.js` is a factory-pattern module (`createEffectModule`) with 6 params. Algorithm is fully delegated to `radialRipple()` in `shared/algorithms/geometry/warp.js`. The apply() signature is correct. Preview quality is handled via interpolation switch (`ctx.quality === 'preview'` → nearest-neighbour). The module is registered correctly under REFRACTION in `registry.js`. The DROWNED preset exists in `registry.js` and exercises the module correctly (amplitude 20, frequency 15, falloff 1.5). Structural compliance is high; the sole substantive defect is that `driveable: true` is declared on 5 params but `apply()` reads all params as pre-resolved scalars from `p` with no `modulate` wiring — driver functionality is declared but inert.

---

## Reference Parity Gaps

| Gap | Detail |
| --- | --- |
| `falloff` driveable status | Reference source (`source/RadialRippleNode.js`) has `falloff` with no `driveable` key. Live implementation adds `driveable: true` to `falloff`. The reference pack (`ui-layout.md`, `feature-parity.md`) confirms `falloff` should be `driveable: no`. Live source is wrong on this one param. |
| No `previewMax` on any param | Reference doc (`performance.md`) notes no `previewMax`; live source matches. Not a gap — both agree. Documented for completeness. |
| `centreX`/`centreY` tier | Live source correctly has tier 3. Reference source also tier 3. Legacy doc (`ripple.md`) incorrectly listed them tier 4. No functional gap — live is correct. |

---

## Review Spec Gaps

Review spec (`ripple_review2403.md`) was fast-tracked as "no issues." It logged three action items (G1, G2, G5) as global. No module-specific spec gaps beyond those global items.

---

## Missing Parameters

None. All 6 params present with correct ranges, steps, defaults, labels, and tiers.

---

## Extra/Incorrect Parameters

| Param | Issue |
| --- | --- |
| `falloff` | Has `driveable: true` in live source. Reference source omits `driveable` on `falloff` (equivalent to `false`). `ui-layout.md` and `feature-parity.md` both state `falloff` driveable: no. Remove `driveable: true` from `falloff`, or accept the live value as an intentional extension — but it is inconsistent with reference. **Recommendation: remove**, as `falloff` is a global-envelope control not suited to per-pixel modulation, and the driver system is non-functional for all params regardless (G1). |

---

## UI Compliance Issues

| Issue | Source | Severity |
| --- | --- | --- |
| Unit strings present but driver non-functional | `unit: '0–1'`, `'px'`, `'Hz'`, `'rad'`, `'n'` are declared in param defs. Units are present in source, satisfying G16 at the definition level. Whether NodePanel renders them is a host concern, not this module's defect. | INFO |
| No `unit` on `falloff` in reference source | Reference source has no `unit` field on any param. Live source adds `unit` to all 6 params. This is a live improvement over the reference. No violation. | — |
| PICK CENTRE button (G6) | `centreX`/`centreY` present. G6 mandates a PICK CENTRE button for modules with spatial origin params. This is a host-level NodePanel feature; the module definition has no mechanism to declare it. Requires shared `CentrePointPicker` component (G11) to be built first, then wired per affected module. | PENDING (shared component dependency) |

---

## Global Issues

| Issue | Applicability | Status in live source |
| --- | --- | --- |
| **G1** — +D button non-functional | Affects all 5 driveable params. Module cannot fix; NodePanel wiring defect. | OPEN (host) |
| **G2** — All numeric params must be driveable | 5 of 6 params have `driveable: true`. `falloff` has it in live source (inconsistent with reference). All numeric params have `driveable: true` if the `falloff` inclusion is accepted. | Effectively satisfied per live source; see Extra/Incorrect Parameters note. |
| **G5** — Slider direct input + double-click-to-default | All 6 params use slider+number component. Fix is host-level (NodePanel/slider component). | OPEN (host) |
| **G6** — Click-to-pick for centreX/centreY | Module has centreX and centreY. PICK CENTRE button requires shared `CentrePointPicker` (G11). | OPEN (shared component not built) |
| **G7** — Vector module identification | Not applicable. Ripple is a pixel module, not vector. | N/A |
| **G9** — FRAME param for time-based modules | `phase` is the animation control. Ripple is not an iteration/time-state module — phase is a continuous input param, not internal frame state. G9 does not apply. | N/A |
| **G10** — SVG export for vector modules | Not applicable. Ripple is pixel output. | N/A |
| **G11** — Shared components before per-module features | PICK CENTRE (G6) must use a shared `CentrePointPicker` component. Do not implement inline. Block implementation until component exists. | OPEN (dependency) |
| **G12** — Web worker usage | Ripple performs 5 transcendental calls per pixel (sqrt, atan2, sin, exp, cos) — cost class B–C at 1 MP. Confirm apply() runs in the render worker, not the main thread. If not offloaded, move it. No `previewMax` alternative available (trig cost is parameter-independent). | VERIFY |
| **G14** — Mode-conditional params | No mode/type dropdown in this module. G14 not applicable. | N/A |
| **G16** — Units on numeric params | `unit` field present on all 6 params in live source. NodePanel rendering of units is a host concern. Module definition is compliant. | SATISFIED (definition level) |

---

## Merge Absorption

The live source already incorporates the reference source completely, with one intentional addition (`unit` field on all params, `driveable: true` on `falloff`). No merge action required. The reference archive (`source/RadialRippleNode.js`) is superseded by the live file.

---

## Required Changes (priority ordered)

| Priority | Change | Location | Reason |
| --- | --- | --- | --- |
| 1 | Wire `modulate` into `apply()` — for each driveable param, replace `p.key` with `this.getModulated('key', pixelIdx, ctx)` inside the per-pixel loop in `radialRipple()`, or restructure apply() to pass a modulate callback | `RadialRippleNode.js` apply() + `warp.js` radialRipple() | G2/G1 prerequisite: driver declarations are inert without this wiring. Highest-value target is `phase` (animation), then `amplitude`, `centreX`, `centreY`, `frequency`. **Block until G1 (+D button) is fixed in host.** |
| 2 | Decide and fix `falloff` driveable status | `RadialRippleNode.js` | Reference says no; live says yes. Either remove `driveable: true` from `falloff` to match reference, or document the intentional deviation. Recommend remove — falloff is a global envelope, not suited to per-pixel variation. |
| 3 | Verify apply() executes in render worker (G12) | Pipeline / build configuration | Ripple is cost class B–C; must not block main thread. No code change in module itself if already offloaded — just confirm. |
| 4 | Add PICK CENTRE button when `CentrePointPicker` shared component is available (G6/G11) | NodePanel wiring layer | Do not implement inline. Build shared component first, then add to all centreX/centreY modules (radialblur, twirl, spherize, chromaticab, lensbubbles, ripple). |

---

## Verification Criteria

- [ ] All 5 driveable params (centreX, centreY, amplitude, frequency, phase) produce per-pixel variation when a driver is connected and G1 is resolved.
- [ ] `falloff` driveable status is resolved to a single consistent value across live source and reference docs.
- [ ] `apply()` (and `radialRipple()`) run inside the render worker, confirmed by thread profiling.
- [ ] DROWNED preset loads correctly: ripple node params match {amplitude:20, frequency:15, phase:0, falloff:1.5, centreX:0.5, centreY:0.5}.
- [ ] Preview mode (ctx.quality === 'preview') switches to nearest-neighbour sampling; full quality uses bilinear.
- [ ] Origin guard (dist < 0.001) prevents atan2 divide-by-zero at centreX/centreY pixel.
- [ ] Unit strings (px, Hz, rad, 0–1, n) are rendered by NodePanel alongside slider values (G16 — host verification).
- [ ] Slider direct input and double-click-to-default work for all 6 params (G5 — host verification).
- [ ] +D button opens driver settings for all driveable params (G1 — host verification).
- [ ] PICK CENTRE button is present and functional when CentrePointPicker component is available (G6/G11 — deferred).
