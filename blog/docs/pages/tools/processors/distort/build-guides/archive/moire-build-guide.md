# MOIRE — Build Guide

- module: moire
- node: MoireNode.js
- category: PATTERN
- review verdict: KEEP
- rebuild severity: CRITICAL

---

## Current State Summary

`MoireNode.js` is a 20-line factory module using `createEffectModule`. It generates a dual-grating moiré interference pattern via `moireRGBA` from `pattern-generators.js`. Two wave systems are configured independently (wavelength, angle), combined via a binary operator (PRODUCT/SUM/XOR/MIN/MAX), then blended onto source (MULTIPLY/SCREEN/REPLACE).

**Functional scope:** Purely static overlay. No driver invocation, no image-responsive behaviour, no field derivation, no image modification. The review specifies a five-layer reciprocal architecture: image→moiré and moiré→image. The current implementation delivers layer 1 only (partial), with none of layers 2–5. This is a structural rebuild, not an incremental fix.

**Critical naming defect:** Current node uses key `internalBlend`; reference source uses `blendMode`. `EffectNode.fromJSON()` at line 245 contains a migration shim for exactly this conflict, mapping `data.params.blendMode → internalBlend` — confirming the live node diverged from reference. The current node's param key must be reconciled.

---

## Reference Parity Gaps

Comparison: live `MoireNode.js` vs reference `source/MoireNode.js`.

| Gap | Detail |
|---|---|
| Param key: `internalBlend` vs `blendMode` | Live uses `internalBlend`; reference uses `blendMode`. Live `apply()` reads `p.internalBlend.toLowerCase()`; reference reads `p.blendMode.toLowerCase()`. A `fromJSON` shim exists in `EffectNode` but the live module key is wrong and must be corrected. |
| No `modulate()` calls in `apply()` | Both live and reference share this defect — `driveable:true` declared on four params but `apply()` passes raw `p.*` directly to `moireRGBA`. Per-pixel driving is fully inert. |
| Preview strategy discrepancy | Legacy doc (`moire.md`) states "No reduction". Both live and reference declare `previewMax:50` on `wavelength1` and `wavelength2`. Source is authoritative; legacy doc is wrong. Not a code gap. |

---

## Review Spec Gaps

The review requires a five-layer architecture. Current implementation provides none of layers 2–5 and only a minimal layer 1 (two-oscillator linear grating — no TYPE, PHASE, CONTRAST, DUTY CYCLE, or SOFTNESS params).

### Layer 1 — Pattern Generation (partial)

| Required param | Present | Notes |
|---|---|---|
| TYPE 1 / TYPE 2 | No | linear/square/dot-lattice/radial/angular wave |
| WAVE 1 / WAVE 2 | Yes | `wavelength1`, `wavelength2` |
| ANGLE 1 / ANGLE 2 | Yes | `angle1`, `angle2` |
| PHASE 1 / PHASE 2 | No | Phase offset per wave system |
| CONTRAST 1 / CONTRAST 2 | No | Band contrast per wave system |
| DUTY CYCLE 1 / DUTY CYCLE 2 | No | Band proportion per wave system |
| SOFTNESS 1 / SOFTNESS 2 | No | Band transition hardness per wave system |
| COMBINE | Yes | `combineMode` — all five operators present |

### Layer 2 — Driver System

Entirely absent. Required:

- DRIVER ENABLED toggle
- DRIVER SOURCE (10 options: image/position/radial distance/angle/noise/flow field/gradient field/edge map/distance map/pattern field)
- DRIVER METRIC (16+ options per review spec)
- INPUT MIN / MAX
- OUTPUT MIN / MAX
- CURVE (8 curve types)
- BLEND AMOUNT
- INVERT

Driver-capable params per spec: WAVE 1/2, ANGLE 1/2, PHASE 1/2, CONTRAST 1/2, DUTY CYCLE 1/2, SOFTNESS 1/2, PATTERN COLOUR, PATTERN OPACITY, DISPLACEMENT STRENGTH.

Current `driveable:true` on `wavelength1`, `angle1`, `wavelength2`, `angle2` is inert (`modulate()` never called). The `getModulated()` method exists in `EffectNode` and supports `image`, `source`, and `expr` modes — the mechanism is available but not wired in `apply()`.

### Layer 3 — Field Derivation

Entirely absent. Required image-derived fields: LUMINANCE, HUE, SATURATION, RGB, GRADIENT MAGNITUDE, GRADIENT ANGLE, LOCAL CONTRAST, EDGE MAP, DISTANCE TO EDGE, POSITION X/Y, RADIAL DISTANCE.

Required pattern-derived fields: WAVE FIELD 1, WAVE FIELD 2, INTERFERENCE FIELD, FRINGE MASK, DISTANCE TO FRINGE CENTRE, DISTANCE TO FRINGE EDGE, FRINGE INDEX, FRINGE TANGENT, FRINGE NORMAL, WAVE DIFFERENCE FIELD.

### Layer 4 — Rendering

Partially present (BLEND is current `internalBlend`/`combineMode`). Missing:

| Required param | Present | Notes |
|---|---|---|
| PATTERN COLOUR | No | |
| PATTERN OPACITY | No | |
| PATTERN BLEND MODE | Partial | `internalBlend` covers MULTIPLY/SCREEN/REPLACE only |
| INVERT PATTERN | No | |
| BACKGROUND FILL | No | |
| THRESHOLD | No | Hard-band thresholding of interference field |
| ANTI-ALIAS | No | |
| Diagnostic preview modes | No | Wave field 1/2, interference field, fringe mask, distance-to-fringe, tangent/normal |

### Layer 5 — Image Modification

Entirely absent. Required:

- MODIFICATION MODE (NONE/FRINGE MASK/DISTANCE FIELD/NORMAL DISPLACEMENT/TANGENT DISPLACEMENT/FRINGE PARTITION)
- INSIDE EFFECT STRENGTH
- OUTSIDE EFFECT STRENGTH
- MASK FEATHER
- DISPLACEMENT STRENGTH
- DISPLACEMENT RADIUS
- COLOUR SHIFT STRENGTH
- BLUR STRENGTH
- SHARPEN STRENGTH
- FRINGE A TREATMENT
- FRINGE B TREATMENT

---

## Missing Parameters

All parameters not currently present but required by the review spec:

| Key (proposed) | Label | Layer | Type | driveable |
|---|---|---|---|---|
| `type1` | TYPE 1 | 1 | select | no |
| `type2` | TYPE 2 | 1 | select | no |
| `phase1` | PHASE 1 | 1 | range | yes |
| `phase2` | PHASE 2 | 1 | range | yes |
| `contrast1` | CONTRAST 1 | 1 | range | yes |
| `contrast2` | CONTRAST 2 | 1 | range | yes |
| `dutyCycle1` | DUTY CYCLE 1 | 1 | range | yes |
| `dutyCycle2` | DUTY CYCLE 2 | 1 | range | yes |
| `softness1` | SOFTNESS 1 | 1 | range | yes |
| `softness2` | SOFTNESS 2 | 1 | range | yes |
| `driverEnabled` | DRIVER ENABLED | 2 | toggle | no |
| `driverSource` | DRIVER SOURCE | 2 | select | no |
| `driverMetric` | DRIVER METRIC | 2 | select | no |
| `driverInputMin` | INPUT MIN | 2 | range | no |
| `driverInputMax` | INPUT MAX | 2 | range | no |
| `driverOutputMin` | OUTPUT MIN | 2 | range | no |
| `driverOutputMax` | OUTPUT MAX | 2 | range | no |
| `driverCurve` | CURVE | 2 | select | no |
| `driverBlendAmount` | BLEND AMOUNT | 2 | range | no |
| `driverInvert` | INVERT | 2 | toggle | no |
| `patternColour` | PATTERN COLOUR | 4 | colour | yes |
| `patternOpacity` | PATTERN OPACITY | 4 | range | yes |
| `patternBlendMode` | PATTERN BLEND | 4 | select | no |
| `invertPattern` | INVERT PATTERN | 4 | toggle | no |
| `backgroundFill` | BG FILL | 4 | toggle | no |
| `threshold` | THRESHOLD | 4 | range | no |
| `antiAlias` | ANTI-ALIAS | 4 | toggle | no |
| `previewMode` | PREVIEW MODE | 4 | select | no |
| `modMode` | MOD MODE | 5 | select | no |
| `insideStrength` | INSIDE STRENGTH | 5 | range | no |
| `outsideStrength` | OUTSIDE STRENGTH | 5 | range | no |
| `maskFeather` | MASK FEATHER | 5 | range | no |
| `displacementStrength` | DISPLACE STR | 5 | range | yes |
| `displacementRadius` | DISPLACE RAD | 5 | range | no |
| `colourShift` | COLOUR SHIFT | 5 | range | no |
| `blurStrength` | BLUR STR | 5 | range | no |
| `sharpenStrength` | SHARPEN STR | 5 | range | no |
| `fringeATreatment` | FRINGE A | 5 | select | no |
| `fringeBTreatment` | FRINGE B | 5 | select | no |

---

## Extra/Incorrect Parameters

| Key | Issue |
|---|---|
| `internalBlend` | Key is wrong — reference uses `blendMode`. A `fromJSON` migration shim exists in `EffectNode` (line 245) confirming the key diverged. Must be renamed to match reference or a decision made and documented. Note: `EffectNode` also declares a top-level `this.blendMode = 'normal'` (the compositing blend mode), so a module-level `blendMode` param key will collide with the node-level property in serialisation — if renaming, verify `toJSON`/`fromJSON` pathways. If collision is a risk, keep `internalBlend` and update reference; either way, one must be canonical. |

---

## UI Compliance Issues

### G14 — Mode-conditional param visibility

`TYPE 1` / `TYPE 2` select params (once added) control which per-wave params are applicable. TYPE-specific params (e.g., radial-specific centre X/Y, spiral rate) must be hidden when their TYPE is not active. Current implementation has no TYPE and therefore no hidden params, but this must be designed in from the start of the rebuild.

### G16 — Unit labels

`wavelength1`, `wavelength2` — `unit: 'px'` declared ✓. `angle1`, `angle2` — `unit: 'deg'` declared ✓. All new range params must declare `unit`. NodePanel must render units — this is a NodePanel-level fix (tracked under G16), not a per-module fix, but the module must provide the `unit` field.

### Parameter label length

All current labels pass the ≤16 char SCREAMING CASE rule. New params must comply: `DUTY CYCLE 1` (12), `DISPLACE STR` (12), `BLEND AMOUNT` (12) — all within limit.

### internalBlend / BLEND label

Current `internalBlend` has label `BLEND` (5 chars) — compliant. If retained or renamed, label must remain SCREAMING CASE ≤16 chars.

### Shared component requirement (G11)

The driver system (Layer 2) is architecturally identical to that of TRUCHET and GRATING. It must not be reimplemented per-module. A shared driver component must be built first and consumed here. Do not inline driver logic in `MoireNode.js`.

---

## Global Issues

| ID | Issue | Applicability to MOIRE |
|---|---|---|
| G1 | +D driver button non-functional — event handler broken in NodePanel | Affects all four currently-declared driveable params (`wavelength1`, `angle1`, `wavelength2`, `angle2`). Fix NodePanel before driver wiring can be verified. |
| G2 | All numeric params must have `driveable: true` | `wavelength1`, `angle1`, `wavelength2`, `angle2` already declared. All new range params (PHASE, CONTRAST, DUTY CYCLE, SOFTNESS, PATTERN OPACITY, DISPLACEMENT STRENGTH, etc.) must also declare `driveable: true`. |
| G5 | Slider direct numeric input and double-click-to-default | NodePanel-level fix; applies to all four current sliders and all future sliders in this module. |
| G6 | Canvas click-to-pick for centre X/Y | Not directly applicable to MOIRE unless a centre-point param is added (e.g., for radial wave type). If TYPE 1/2 includes RADIAL WAVE, a centre X/Y pair will be needed — G6 then applies. |
| G7 | Vector modules must be identifiable | Not applicable — MOIRE is pixel output. |
| G9 | Time/iteration modules must expose FRAME param | Not applicable — MOIRE has no temporal/iteration state in current or planned architecture. |
| G10 | Vector modules must include SVG export | Not applicable — MOIRE is pixel output. |
| G11 | Overlapping features must use shared components | CRITICAL for MOIRE — the driver system (Layer 2) is identical to TRUCHET/GRATING. Build shared `DriverControl` component; do not reimplement. Colour picker for PATTERN COLOUR must use `ComponentLibrary.create('color-input', ...)`. |
| G12 | Web workers for expensive modules | MOIRE is O(w×h) single-pass, Class A (<16ms). No worker urgency. When the five-layer rebuild adds distance-field computation and image modification, re-evaluate — fringe distance fields may be Class B. |
| G14 | Mode-conditional param visibility | Applies when TYPE 1/TYPE 2 are added. TYPE-specific params must be hidden when their TYPE is inactive. Must be built into the param visibility logic from the start. |
| G16 | Unit labels on all numeric params | Current params: `wavelength1`/`wavelength2` have `unit: 'px'` ✓; `angle1`/`angle2` have `unit: 'deg'` ✓. All new params must declare `unit`. |

---

## Merge Absorption

The review was generated during session 2026-03-24. The migration pack (2026-03-11) predates it. No merge conflicts between reference docs and review. 

The `EffectNode.fromJSON()` shim at line 245 (`internalBlend` ← `blendMode`) is a live artefact of the naming divergence between current and reference. When the param key is reconciled, this shim must be removed or updated to avoid double-migration.

No presets in `PRESETS` (registry.js) reference `moire` — no preset migration burden.

---

## Required Changes (priority ordered)

### P0 — Naming / key defect (prerequisite)

1. **Reconcile `internalBlend` vs `blendMode` key.** Decision: if `blendMode` is used, verify no collision with `EffectNode.blendMode` property in `toJSON`/`fromJSON`. If collision risk, retain `internalBlend` and update reference. Remove `fromJSON` shim once resolved. Document the canonical key.

### P1 — Wire existing driveable params (fixes declared-but-inert driver support)

2. **Invoke `this.getModulated(key, pixelIdx, ctx)` in `apply()` for `wavelength1`, `angle1`, `wavelength2`, `angle2`.** `apply()` currently passes `p.wavelength1` etc. directly; these must be resolved per-pixel via `getModulated`. This requires restructuring `apply()` from a single `moireRGBA(src, ...)` call into a per-pixel loop that resolves driven values.

### P2 — Phase 1 rebuild: full Layer 1 param set

3. **Add TYPE 1 / TYPE 2 selects** (linear/square/dot-lattice/radial/angular wave). This requires the algorithm in `pattern-generators.js` to support multiple wave topologies.
4. **Add PHASE 1 / PHASE 2** (`driveable: true`, `unit: 'deg'` or normalised, default 0).
5. **Add CONTRAST 1 / CONTRAST 2** (`driveable: true`, `unit: ''` or `%`, range 0–1, default 1).
6. **Add DUTY CYCLE 1 / DUTY CYCLE 2** (`driveable: true`, `unit: '%'`, range 0–1, default 0.5).
7. **Add SOFTNESS 1 / SOFTNESS 2** (`driveable: true`, `unit: ''`, range 0–1, default 0).
8. **Implement mode-conditional visibility** for TYPE-specific params (G14 compliance).

### P3 — Phase 2: shared driver architecture (Layer 2)

9. **Build shared `DriverControl` component** (G11 — shared with TRUCHET, GRATING). Do not inline in MoireNode.
10. **Wire driver system to Layer 2 driver params** (DRIVER ENABLED, SOURCE, METRIC, INPUT/OUTPUT MIN/MAX, CURVE, BLEND AMOUNT, INVERT).
11. **Extend driver-capable param list** to all range params listed in Layer 2 driver spec.

### P4 — Phase 3 / 4: field derivation (Layer 3)

12. **Implement image-derived fields**: luminance, gradient magnitude/angle, edge distance, position X/Y, radial distance. These are computed from `src` before pattern generation.
13. **Implement pattern-derived fields**: interference field, fringe mask, distance to fringe centre/edge, fringe index, fringe tangent/normal, wave difference field. These are computed from wave fields after generation.
14. **Maintain architectural separation**: wave field 1, wave field 2, and interference field must remain distinct buffers — different behaviours may be driven by different layers.

### P5 — Phase 4 / 5: rendering and image modification (Layers 4 and 5)

15. **Add Layer 4 params**: PATTERN COLOUR (via `color-input`), PATTERN OPACITY (`driveable: true`), PATTERN BLEND MODE (expanded options), INVERT PATTERN, BACKGROUND FILL, THRESHOLD, ANTI-ALIAS, diagnostic PREVIEW MODE.
16. **Add Layer 5 params**: MOD MODE, INSIDE/OUTSIDE STRENGTH, MASK FEATHER, DISPLACEMENT STRENGTH (`driveable: true`), DISPLACEMENT RADIUS, COLOUR SHIFT, BLUR STRENGTH, SHARPEN STRENGTH, FRINGE A/B TREATMENT.
17. **Implement normal-based image displacement** (priority first distortion mode per spec: NORMAL DISPLACEMENT).
18. **Implement fringe-mask-based image treatment** (FRINGE PARTITION: bright/dark fringes → brightness/sharpen/blur/tint).

### P6 — Infrastructure

19. **Fix +D driver button in NodePanel** (G1 — prerequisite for all driver verification).
20. **Fix slider direct input and double-click-to-default** (G5 — NodePanel-level).
21. **Update `pattern-generators.js`** to support multi-type wave generation, returning separable field buffers (wave 1, wave 2, interference) rather than a composited RGBA output, so Layers 3–5 can consume the intermediate fields.

---

## Verification Criteria

Each criterion must be confirmed against live rendered output after implementation.

| # | Criterion |
|---|---|
| V1 | `type: 'moire'`, `category: 'PATTERN'` — registry entry intact |
| V2 | `wavelength1=15`, `wavelength2=16`, `angle1=0`, `angle2=5` produces visible broad interference bands in PRODUCT mode |
| V3 | All five COMBINE modes (PRODUCT/SUM/XOR/MIN/MAX) produce visually distinct outputs |
| V4 | Identical wavelength and angle values produce a uniform output (beat collapses) |
| V5 | `driveable: true` on all range params; `getModulated()` is invoked in `apply()` for each; connecting an image driver changes per-pixel output |
| V6 | +D button opens driver settings panel for each driveable param (requires G1 fix) |
| V7 | PHASE 1/2 offset shifts fringe position without altering fringe frequency |
| V8 | CONTRAST 1/2 controls band amplitude independently per wave |
| V9 | DUTY CYCLE 1/2 controls band proportion per wave |
| V10 | SOFTNESS 1/2 controls band-edge hardness per wave |
| V11 | TYPE 1/2 selection changes wave topology (linear → dot lattice → radial etc.); TYPE-specific params appear/disappear correctly (G14) |
| V12 | Driver system (Layer 2) correctly remaps a selected metric to a target param with correct curve and blend amount |
| V13 | Wave Field 1, Wave Field 2, and Interference Field are available as distinct buffers for field derivation |
| V14 | DISTANCE TO FRINGE EDGE field is computed and available as a driver metric |
| V15 | FRINGE NORMAL and FRINGE TANGENT fields are computed correctly (perpendicular and parallel to fringe direction) |
| V16 | NORMAL DISPLACEMENT mode displaces source image pixels along fringe normal |
| V17 | FRINGE PARTITION mode applies distinct treatments to fringe A and fringe B regions |
| V18 | PATTERN COLOUR and PATTERN OPACITY params drive the rendered interference overlay |
| V19 | Diagnostic PREVIEW MODE renders each intermediate field (wave 1, wave 2, interference, fringe mask, distance-to-fringe, tangent, normal) without crashing |
| V20 | `unit` field present on all range params; NodePanel renders units alongside values (requires G16 fix) |
| V21 | No preset references `moire` — no preset breakage on param schema change |
| V22 | `fromJSON` shim in `EffectNode` removed or updated after param key reconciliation; old serialised nodes with `blendMode` key load correctly |
| V23 | Driver component is shared with TRUCHET and GRATING — no per-module reimplementation (G11) |
| V24 | No `requestAnimationFrame`, `setInterval`, `document.*`, `window.*`, or `innerHTML` in new code |
| V25 | Performance class remains A (<16ms) for preview resolution; re-evaluate at full resolution after Layer 3/4 field computation is added |
