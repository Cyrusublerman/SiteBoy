# LUMFLOW — Build Guide

- module: lumflow
- node: LuminanceFlowNode.js
- category: LINE
- review verdict: KEEP
- rebuild severity: MODERATE

---

## Current State Summary

Current implementation (`nodes/line/LuminanceFlowNode.js`) is a factory module using `createEffectModule`. It implements the full base-pattern layer: all 9 params declared in the reference source are present, along with an additional `frame` param not in the reference. Both `applyVector` and `apply` paths are functional. A `buildGeometry` method is present (absent in reference source — added in current). The module is architecturally sound: correct factory pattern, correct `isVector: true`, correct delegation to `buildGradientDisplacedLines` and `vectorToRaster`, no forbidden DOM/RAF usage.

Divergences from the reference source are additive (extra `frame` param, extra `buildGeometry`) and corrective (`driveable: true` added to `strokeWeight`, `resolution`, `damping`, `iterations`, `bgBrightness` — absent in reference). The review spec identifies major feature gaps in the broader reference system (a full luminance-flow compositor with 7 additional sub-systems), but these represent future feature work, not regressions. The severity is MODERATE: param-level issues, one naming inconsistency, one missing `previewMax`, several unit fields missing from the reference source params, and multiple global issues applicable here.

---

## Reference Parity Gaps

All gaps are relative to `reference/distort/lumflow/source/LuminanceFlowNode.js` (the archived reference node), not the full external reference system.

| Gap | Description | Direction |
|---|---|---|
| `frame` param | Current adds `frame` (min:0, max:240, step:1, value:0, tier:3, driveable:true, unit:'frames'); absent in reference | Current > Reference |
| `buildGeometry` method | Current adds `buildGeometry(w, h, p, ctx, src)` returning `set.lines`; absent in reference | Current > Reference |
| `driveable` on `strokeWeight` | Current: `driveable: true`; reference: absent | Current > Reference |
| `driveable` on `resolution` | Current: `driveable: true`; reference: absent | Current > Reference |
| `driveable` on `damping` | Current: `driveable: true`; reference: absent | Current > Reference |
| `driveable` on `iterations` | Current: `driveable: true`; reference: absent | Current > Reference |
| `driveable` on `bgBrightness` | Current: `driveable: true`; reference: absent | Current > Reference |
| `unit` fields | Current adds `unit` on all numeric params; reference has none | Current > Reference |
| `capByFrame` call | Current wraps `iters` through `capByFrame(iters, p.frame)` in all three methods; reference has no `frame` param or frame-cap | Current > Reference |
| `iters` capping in `buildGeometry` | Reference has no `buildGeometry`; current caps iters identically to the two apply paths | Current > Reference |

**Assessment:** All reference parity gaps are additive improvements (G2, G9, G16 compliance). None are regressions. The reference node is the prior state; current is correctly extended.

---

## Review Spec Gaps

Gaps relative to `review2403/lumflow_review2403.md` action items. Items that are global issues are cross-referenced.

| # | Action Item | Status | Notes |
|---|---|---|---|
| 1 | Canonicalise display name — align CategoryPicker label with type identifier | OPEN | `name: 'LUMINANCE FLOW'` in node; CategoryPicker display name must match. Whether canonical form is `LUMFLOW` or `LUMINANCE FLOW` must be decided and applied consistently. |
| 2 | Implement Directional Modifiers (Magnetism, Gradient Push, Tangent Push, Origin Radial) | ABSENT | Full sub-system not present. Future feature. |
| 3 | Implement Structured Modulation (Fixed Angle, Sine Waves) | ABSENT | Full sub-system not present. Future feature. |
| 4 | Implement Flow Field (Mix, Strength, Noise Scale, Curl) | ABSENT | Full sub-system not present. Future feature. |
| 5 | Implement Steering (gradient/tangent steering, dead zone, scale) | ABSENT | Full sub-system not present. Future feature. |
| 6 | Implement Animation section (Orbit Radius, Speed, Mode) | ABSENT | `frame` param present; orbit/speed/mode params absent. Future feature. |
| 7 | Implement expanded Global/Output (colour-by-luminance, palette, visibility toggles) | ABSENT | Future feature. |
| 8 | Add source-management controls (image scale, source visibility) | NOT APPLICABLE | Module architecture does not expose source management at the node level. Defer. |
| 9 | Fix +D driver button | GLOBAL G1 | See Global Issues. |
| 10 | Audit all params for `driveable: true` | PARTIAL | Current adds `driveable: true` to all numeric params including `strokeWeight`, `resolution`, `damping`, `iterations`, `bgBrightness` — addresses G2. However, driver is non-functional (G1). |
| 11 | Slider direct input and double-click-to-default | GLOBAL G5 | See Global Issues. |
| 12 | Add vector module indicator in CategoryPicker | GLOBAL G7 | See Global Issues. |
| 13 | Merge LINE RENDER categories | GLOBAL G8 | Not in scope for this node. |

---

## Missing Parameters

Parameters absent from current implementation that are required or flagged:

| Param | Source of requirement | Notes |
|---|---|---|
| None missing from base-layer spec | — | All 9 base params present; `frame` is additionally present per G9. |

**For future feature phases only (not blockers for current KEEP verdict):**

| Param Group | Params | Source |
|---|---|---|
| Directional Modifiers | magnetismStrength, gradientPushStr, tangentPushStr, originRadialStr, per-group mix | review spec §2 |
| Structured Modulation | fixedAngle, sineAmpX, sineAmpY, sineFreqX, sineFreqY, sinePhaseSp, modMix | review spec §3 |
| Flow Field | flowMix, flowStrength, noiseScale, curl | review spec §4 |
| Steering | gradSteer, tanSteer, deadZone, steerScale | review spec §5 |
| Animation | orbitRadius, orbitSpeed, orbitMode (CIRCULAR/LISSAJOUS/PERLIN) | review spec §6 |
| Global/Output | colourByLum (bool), palette (select), showVectorField (bool), showFlow (bool) | review spec §7 |

---

## Extra/Incorrect Parameters

| Param | Issue | Action |
|---|---|---|
| `frame` | Present in current; absent in reference source. Added per G9 (time/iteration-based module must expose FRAME param). Value correct: min:0, max:240, step:1, default:0, tier:3, driveable:true, unit:'frames'. | KEEP — G9 compliant. |
| `strokeWeight` | `driveable: true` added in current vs reference. Correct per G2. | KEEP. |
| `resolution` | `driveable: true` added in current vs reference. Correct per G2. | KEEP. |
| `damping` | `driveable: true` added in current vs reference. Correct per G2. | KEEP. |
| `iterations` | `driveable: true` added in current vs reference. Correct per G2. | KEEP. |
| `bgBrightness` | `driveable: true` added in current vs reference. Correct per G2. | KEEP. |

**No incorrect parameters.** All extras are G2/G9 compliance additions.

---

## UI Compliance Issues

### Naming Inconsistency (review spec §1 — HIGH PRIORITY)

`name: 'LUMINANCE FLOW'` declared in the node. The CategoryPicker display label must match exactly. If the canonical display name is `LUMFLOW`, the node's `name` field must be `'LUMFLOW'`. If `LUMINANCE FLOW` is canonical, the CategoryPicker label must read `LUMINANCE FLOW`. One form must be chosen and applied consistently across: node `name` field, CategoryPicker entry, any preset or documentation reference.

**Decision required:** canonical display name = `LUMFLOW` (short) or `LUMINANCE FLOW` (full). The `type` identifier is `lumflow` (unchanged regardless).

### Missing `previewMax` on `spacing` (feature-parity.md §Parity Holes)

`spacing` has no `previewMax`. At `spacing=1` with GRID pattern, preview generates up to `w×h` seeds. Even with `iterations` capped at 2, the seed count is unguarded. Add `previewMax: 8` to `spacing` to guard preview performance at extreme values.

### Vector Module Indicator (G7)

No visual indicator in the CategoryPicker or NodePanel distinguishes this as a vector-output module. Required: badge, tag, or explicit marker. Affects all vector modules — see G7 for shared implementation.

### SVG Export Action (G10)

No in-module SVG export action in the NodePanel. `applyVector` returns a valid LineSet; the export mechanism exists at the pipeline level but is not surfaced per-module. Required: EXPORT SVG button/action in the NodePanel for this module. Must use the shared `SVGExportButton` component per G11 (build shared component first; consume here).

### Unit Display (G16)

All numeric params in current implementation include `unit` fields (`'px'`, `'frames'`, `'n'`, `'0–1'`, `'lvl'`). This is correct per G16. NodePanel must render these units alongside values. The node definition is compliant; rendering compliance depends on the NodePanel component.

---

## Global Issues

Issues from `_global_issues.md` applicable to this module:

| Issue | Description | Impact on lumflow | Action |
|---|---|---|---|
| G1 | +D driver button non-functional | `driveable: true` declared on all 7 numeric params; none are driveable in practice. Silent failure for spacing, strokeWeight, amplitude, resolution, lumExp, damping, iterations, bgBrightness, frame. | Fix NodePanel +D event handler (host-level fix; not a node change). |
| G2 | All numeric params must have `driveable: true` | Current implementation already has `driveable: true` on all numeric params. **Fully compliant.** | None — already resolved. |
| G5 | Slider direct input and double-click-to-default | All slider params lack these behaviours. | NodePanel slider component fix (host-level). |
| G6 | Canvas click-to-pick for centre params | Not applicable — lumflow has no centre X/Y params. | None. |
| G7 | Vector modules must be identifiable | No visual vector indicator in CategoryPicker or NodePanel for lumflow. | Add shared vector badge (G11: build shared component first). |
| G9 | Time/iteration-based modules must expose FRAME param | `frame` param is present: min:0, max:240, step:1, value:0, tier:3, driveable:true, unit:'frames'. **Fully compliant.** | None — already resolved. |
| G10 | Vector modules must include in-module SVG export | No EXPORT SVG action in NodePanel for lumflow. | Add per G11 shared component requirement. |
| G11 | Overlapping features must use shared components | SVG export action, FRAME param, vector indicator are all shared patterns. Do not implement per-module. Build shared components (SVGExportButton, FrameSlider, VectorBadge), then consume here. | Shared component build precedes node changes. |
| G12 | Web worker for expensive modules | `VectorFieldMap` Sobel is O(w×h) unconditionally; at `spacing=1, iter=20` cost is O(20×w×h). Currently runs on main thread. | Audit whether `buildGradientDisplacedLines` runs in render worker. If not, offload. |
| G14 | Mode-conditional params must hide when inactive | Not applicable to current param set — no mode-conditional params in base layer. Will apply when Directional Modifiers and Structured Modulation are added (future feature phases). | Flag for future phase implementation. |
| G16 | Slider/number inputs must display units | All params in current node have `unit` fields. NodePanel rendering compliance required. | NodePanel component fix (host-level). |

---

## Merge Absorption

Changes already absorbed into current implementation relative to reference source (`reference/distort/lumflow/source/LuminanceFlowNode.js`):

| Change | Absorbed? | Notes |
|---|---|---|
| G2: `driveable: true` on all numeric params | YES | `strokeWeight`, `resolution`, `damping`, `iterations`, `bgBrightness` added |
| G9: FRAME param | YES | `frame` param added with correct definition |
| G16: `unit` fields on all numeric params | YES | All params have unit strings |
| `buildGeometry` method | YES | Added; consistent with `applyVector` and `apply` logic |
| `capByFrame` integration | YES | Applied in all three methods |

---

## Required Changes (Priority Ordered)

### P1 — Naming Canonicalisation [HIGH]

**Decide** the canonical display name: `LUMFLOW` or `LUMINANCE FLOW`. Apply consistently.

- If `LUMFLOW`: change `name: 'LUMINANCE FLOW'` → `name: 'LUMFLOW'` in `LuminanceFlowNode.js`. Update CategoryPicker entry.
- If `LUMINANCE FLOW`: confirm CategoryPicker already reads `LUMINANCE FLOW`. No node change needed.

File: `assets/js/tools/processors/distort/nodes/line/LuminanceFlowNode.js` line 8.

### P2 — `spacing` previewMax [MODERATE]

Add `previewMax: 8` to the `spacing` param definition to guard seed count at preview quality.

```js
spacing: { label: 'SPACING', min: 1, max: 40, step: 1, value: 8, tier: 3, unit: 'px', driveable: true, previewMax: 8 },
```

File: `assets/js/tools/processors/distort/nodes/line/LuminanceFlowNode.js` line 14.

### P3 — SVG Export Action [MODERATE] (blocked on G11 shared component)

Add EXPORT SVG button to NodePanel for lumflow. Requires `SVGExportButton` shared component (G11) to be built first. Button triggers `applyVector` → LineSet → SVG file download.

Prerequisite: G11 shared component `SVGExportButton`.

### P4 — Vector Module Indicator [MODERATE] (blocked on G11 shared component)

Add vector indicator badge (`V` or equivalent) to CategoryPicker entry for lumflow. Requires shared `VectorBadge` component (G11) to be built first.

Prerequisite: G11 shared component `VectorBadge`.

### P5 — +D Button Fix [CRITICAL] (host-level, G1)

NodePanel +D button event handler is non-functional. All 8 driveable params on lumflow are silently broken. Fix NodePanel wiring (not a node-level change).

### P6 — Slider UX: Direct Input + Double-Click Reset [MODERATE] (host-level, G5)

NodePanel slider component fix. All slider params on lumflow affected. Not a node-level change.

### P7 — Unit Display in NodePanel [MODERATE] (host-level, G16)

NodePanel must render `unit` fields alongside values. Node definition is already compliant.

### P8 — Worker Offload Audit [MODERATE] (G12)

Confirm `buildGradientDisplacedLines` runs inside the render worker. If any Sobel or advection computation runs on the main thread, offload to worker.

### P9 — Future: Feature Expansion [FUTURE — not current phase]

Directional Modifiers, Structured Modulation, Flow Field, Steering, Animation, expanded Global/Output params. Requires algorithm implementation in `flow-line-engine.js` and corresponding param additions. Defer until base-layer is verified stable.

---

## Verification Criteria

1. **Naming:** Node `name` field and CategoryPicker entry read the same string. No mismatch between type identifier (`lumflow`) and display label.
2. **All 9 base params present** with correct ranges, defaults, tiers, and `driveable: true` on all numeric params.
3. **`frame` param** present: min:0, max:240, step:1, value:0, tier:3, driveable:true, unit:'frames'.
4. **`spacing` previewMax:8** present after P2 change.
5. **`iterations` previewMax:2** present (already present — confirm not regressed).
6. **`applyVector`** returns `{ lines, strokeRGBA, strokeWidth, clearRGBA }` with hardcoded `[255,255,255,204]` stroke.
7. **`apply`** writes to `dst` via `vectorToRaster`.
8. **`buildGeometry`** returns `set.lines` or `[]`; does not throw on empty/null `src`.
9. **`capByFrame`** called in all three methods with `(iters, p.frame)`.
10. **Preview cap:** `ctx.quality === 'preview'` path in all three methods caps iterations at `Math.min(p.iterations, 2)`.
11. **G1 fix verification:** After NodePanel +D fix, clicking +D on `spacing`, `amplitude`, `lumExp`, `strokeWeight`, `resolution`, `damping`, `iterations`, `bgBrightness`, `frame` opens driver settings panel.
12. **G10 fix verification:** EXPORT SVG button present in NodePanel for lumflow; clicking it downloads a valid SVG of the current frame's line geometry.
13. **G7 fix verification:** Vector indicator visible in CategoryPicker for lumflow entry.
14. **Worker audit:** `buildGradientDisplacedLines` executes entirely within the render worker; no Sobel/advection on the main thread.
15. **No raw hex/rgb/hsl colours** introduced in any change.
16. **No `requestAnimationFrame`, `setInterval`, `document.*`, `window.*`** introduced.
