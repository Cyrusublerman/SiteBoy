# WAVEDISTORTION — Build Guide

- module: wavedistortion
- node: WaveDistortionNode.js
- category: PHYSICS
- review verdict: KEEP — rebuild as stateful wave-field simulation system
- rebuild severity: CRITICAL

---

## Current State Summary

`WaveDistortionNode.js` is a thin `createEffectModule` factory (24 lines). It delegates entirely to `waveDistortionRGBA` from `wave-solver.js`, which runs an explicit finite-difference scalar wave equation for `steps` iterations seeded from image centre, then applies the resulting scalar displacement field equally to both x and y axes (diagonal warp). Params: `frame`, `speed`, `damping`, `steps`, `strength`, `initType`, `radius`. The review spec mandates a fundamental architectural change: the module must become a **stateful iterative wave simulation** with multi-point emitters, image coupling, multi-layer output fields, and full compositing control. The current implementation is categorically distinct from what the review requires. Three driveable params (`speed`, `strength`, `radius`) are non-functional because `modulate` is absent from `apply()`. A redundant inline preview cap duplicates `previewMax`. The `speed` max of 2.0 violates the CFL stability limit (≤0.707) with no guard. Three solver buffers (~100 MB at 4K) are allocated per call with no pooling.

---

## Reference Parity Gaps

The reference source (`reference/.../source/WaveDistortionNode.js`) is identical to the live node minus three additions introduced in the live node: (1) `frame` param, (2) `forceWorkerPreview: true`, (3) `capByFrame` call and import, (4) `driveable: true` on `damping` and `steps`. These additions represent divergence from the archived reference; they are **improvements**, not regressions. All other param definitions and `apply()` logic match the reference source exactly.

Parity gaps vs reference spec (feature-parity.md):

| Gap | Detail |
| --- | --- |
| `modulate` absent from `apply()` | `speed`, `strength`, `radius` are `driveable: true`; none are modulated per-pixel. Driver slots non-functional. |
| CFL stability not enforced | `speed` max = 2.0; CFL limit ≈ 0.707. No clamp, guard, or UI warning. |
| Redundant inline preview cap | `const steps = ctx?.quality === 'preview' ? Math.min(p.steps, 30) : p.steps` is dead code when `previewMax: 30` is declared. |
| No buffer pooling | Three `Float32Array` buffers (`prev`, `cur`, `next`) allocated per `apply()` call; no `ctx.pool` use. |

---

## Review Spec Gaps

The review spec (`wavedistortion_review2403.md`) defines a five-layer target architecture. The current implementation satisfies none of Layers 1–4 beyond the rudimentary seed modes (GAUSSIAN/RIPPLE). Layer 5 (displacement warp) is partially implemented (coordinate displacement only; no independent axis control; no RGB warp, hue/sat/lightness/blur/sharpen modulation, or mask output).

### Layer 1 — Wave Field Initialisation (MISSING)

| Missing | Notes |
| --- | --- |
| INIT MODE expanded set | Current: GAUSSIAN, RIPPLE only. Required: FLAT, IMAGE SEED, EDGE SEED, POINT EMITTERS, LINE EMITTERS, CUSTOM MASK |
| INITIAL AMPLITUDE | Not exposed |
| SEED SOURCE | LUMINANCE / HUE / SATURATION / EDGE MAP / DISTANCE TO EDGE / MASK — none implemented |
| SEED THRESHOLD | Not exposed |
| SEED SOFTNESS | Not exposed |
| Configurable seed position | Hard-coded to image centre |

### Layer 2 — Wave Simulation + Emitters (MISSING)

| Missing | Notes |
| --- | --- |
| INITIAL WARMUP STEPS | Not exposed |
| STEPS PER FRAME | Not exposed (conflated with `steps`) |
| DISPERSION | Not implemented |
| VISCOSITY | Not implemented |
| BOUNDARY MODE | Hard-clamped only; REFLECT / WRAP / ABSORB not available |
| RESOLUTION | Fixed to pixel grid; no configurable internal resolution |
| RETAIN STATE | Not implemented — solver always starts fresh |
| RESET ON CHANGE | Not implemented |
| MODE (STATIC MATURE / CONTINUOUS EVOLUTION / FRAME-DRIVEN) | Not implemented |
| EMITTER COUNT | Not implemented |
| EMITTER MODE | Not implemented |
| EMITTER POSITIONS (canvas click-to-pick) | Not implemented |
| EMITTER FREQUENCY / PHASE / AMPLITUDE / RADIUS | Not implemented |
| PULSE MODE | Not implemented |
| PHASE LOCK | Not implemented |
| SUPERPOSITION | Not implemented |
| REFLECTION STRENGTH | Not implemented |
| Ocean mode (DIRECTIONAL WAVES, SECONDARY CHOP, CURRENT DRIFT, TURBULENCE STRENGTH, WAVE SPECTRUM, WIND DIRECTION) | Not implemented |
| Cymatics mode (CYMATIC MODE, DRIVE FREQUENCY, DRIVE AMPLITUDE, RESONANCE, NODE SHARPNESS, NODE OUTPUT) | Not implemented |

### Layer 3 — Image Coupling (MISSING)

| Missing | Notes |
| --- | --- |
| Image-driven seeding | Source image has no influence on wave state |
| Local parameter fields (image-driven DAMPING, WAVE SPEED, TURBULENCE) | Not implemented |
| Ongoing forcing (FORCING STRENGTH, FORCING INTERVAL) | Not implemented |
| Image-derived field drivers (LUMINANCE, HUE, SATURATION, GRADIENT MAGNITUDE, GRADIENT ANGLE, LOCAL CONTRAST, EDGE MAP, DISTANCE TO EDGE, POSITION X/Y, RADIAL DISTANCE) | Not implemented |
| Turbulence layer (TURBULENCE TYPE, STRENGTH, SCALE, DRIFT, COUPLING SOURCE) | Not implemented |

### Layer 4 — Output Fields (MISSING)

| Missing | Notes |
| --- | --- |
| WAVE HEIGHT output field | Not exposed; used internally only |
| WAVE VELOCITY output field | Not implemented |
| WAVE SLOPE output field | Not implemented |
| WAVE NORMAL output field | Not implemented |
| INTERFERENCE STRENGTH | Not implemented |
| NODE MASK | Not implemented |
| CURVATURE | Not implemented |
| OUTPUT MODE param | Not implemented |
| NORMALISE OUTPUT | Not implemented |
| CONTRAST / GAIN | Not implemented |
| MIN COLOUR / MAX COLOUR (colour ramp) | Not implemented |

### Layer 5 — Image Modification + Compositing (PARTIAL)

| Status | Item |
| --- | --- |
| Implemented | COORDINATE DISPLACEMENT (equal-axis scalar warp) |
| Missing | RGB INDEPENDENT WARP |
| Missing | HUE MODULATION |
| Missing | SATURATION MODULATION |
| Missing | LIGHTNESS MODULATION |
| Missing | BLUR MODULATION |
| Missing | SHARPEN MODULATION |
| Missing | MASK OUTPUT |
| Missing | CLAMP MODE (CLAMP / MIRROR / WRAP / TRANSPARENT) — currently hard-clamped |
| Missing | SAMPLING MODE (NEAREST / BILINEAR / BICUBIC) — currently bilinear fixed |
| Implemented (pipeline) | OPACITY, BLEND MODE (standard compositing) |

---

## Missing Parameters

All params below are absent from the current node definition.

**Layer 1:**
`initAmplitude`, `seedSource`, `seedThreshold`, `seedSoftness`

**Layer 2 — Simulation:**
`warmupSteps`, `stepsPerFrame`, `dispersion`, `viscosity`, `boundaryMode`, `resolution`, `retainState`, `resetOnChange`, `mode`

**Layer 2 — Emitters:**
`emitterCount`, `emitterMode`, `emitterPositions`, `emitterFrequency`, `emitterPhase`, `emitterAmplitude`, `emitterRadius`, `pulseMode`, `phaseLock`, `superposition`, `reflectionStrength`

**Layer 2 — Ocean Mode:**
`directionalWaves`, `secondaryChop`, `currentDrift`, `turbulenceStrength`, `waveSpectrum`, `windDirection`

**Layer 2 — Cymatics Mode:**
`cymaticMode`, `driveFrequency`, `driveAmplitude`, `resonance`, `nodeSharpness`, `nodeOutput`

**Layer 3:**
`forcingStrength`, `forcingInterval`, `turbulenceType`, `turbulenceScale`, `turbulenceDrift`, `turbulenceCouplingSource`, `imageDampingField`, `imageSpeedField`

**Layer 4:**
`outputMode`, `normaliseOutput`, `contrast`, `gain`, `minColour`, `maxColour`

**Layer 5:**
`clampMode`, `samplingMode`, `rgbWarpMode`, `hueModulation`, `saturationModulation`, `lightnessModulation`, `blurModulation`, `sharpenModulation`

---

## Extra/Incorrect Parameters

| Param | Issue |
| --- | --- |
| `speed` max = 2.0 | Exceeds CFL stability limit (≈0.707). Values above 0.707 produce numerical instability. Max must be clamped to 0.707 or a runtime guard added, with UI warning. |
| `damping` marked `driveable: true` in live node | Reference source has `damping` without `driveable`. Addition is intentional (G2 compliance); retain. |
| `steps` marked `driveable: true` in live node | Reference source has `steps` without `driveable`. Addition is intentional (G2 compliance); retain. However, driving `steps` per-pixel is architecturally meaningless for a field-wide solver — document as frame-level only. |
| Redundant inline preview cap in `apply()` | `ctx?.quality === 'preview' ? Math.min(p.steps, 30) : p.steps` is dead code — `previewMax: 30` already handled by factory. Remove. |

---

## UI Compliance Issues

### G14 — Mode-conditional params not hidden

The rebuilt module will expose many mode-gated param sets (INIT MODE, emitter subparams, Ocean Mode subparams, Cymatics Mode subparams, OUTPUT MODE subparams). All mode-conditional params must use `when` visibility gating in the factory config — params for inactive modes must not appear in the NodePanel. This is zero-implementation today because the full param set does not yet exist; it must be built correctly from the outset.

### G6 — Canvas click-to-pick for emitter positions

`EMITTER POSITIONS` requires canvas click-to-pick (one-shot canvas interaction triggered by a PICK button). The PICK CENTRE global component (G6) must be consumed for each emitter position — not reimplemented inline.

### G11 — Shared components for overlapping patterns

The following required additions must use shared components, not module-level one-offs:
- `FrameSlider` — for the `frame` param (already partially addressed by existing `frame` param; confirm shared component is used)
- `ColourRampControl` — for MIN COLOUR / MAX COLOUR / OUTPUT MODE ramp
- `CentrePointPicker` — for emitter positions where applicable
- `NoiseSourceControl` — for turbulence type/scale/drift

### Text treatment compliance

All param labels must be UPPERCASE, `F × 0.75`, left-aligned (text-treatment.md §2). All current labels are UPPERCASE; compliant. Value readouts must be right-aligned (text-treatment.md §2 note). Verify NodePanel renders `right` alignment on numeric readouts.

### Unit labels (G16)

Current units:
- `speed`: missing unit (should be `n` or dimensionless marker)
- `damping`: `unit: '0–1'` — present
- `steps`: missing `unit: 'frames'` (live node has it on `frame` only)
- `strength`: `unit: 'px'` — present
- `initType`: select; no unit required
- `radius`: `unit: '0–1'` — present

All new numeric params must declare `unit` strings. Review spec items with implicit units: `emitterFrequency` (Hz or cycles/step), `dispersion` (0–1), `resolution` (px or factor), `driveFrequency` (Hz or normalised), `driveAmplitude` (0–1), etc.

### Semiotics

No custom glyphs are introduced by this module in its current form. The rebuilt module adding PICK buttons for emitter positions must use `+` (add/pick intent) per semiotics.md §3. Dropdown triggers for MODE, BOUNDARY MODE, OUTPUT MODE, etc. must use `▾` right of label per semiotics.md §2.

### Border system

No module-level borders; all structural borders are handled by NodePanel. Compliant in current implementation. Rebuilt module must not introduce private borders around emitter subpanels or mode sections.

---

## Global Issues

| Issue | Status in this module |
| --- | --- |
| **G1** — +D button non-functional | Affects this module (3 driveable params: `speed`, `strength`, `radius`). System-level fix required first. |
| **G2** — All numeric params need `driveable: true` | `damping` and `steps` now have `driveable: true` in live node (improvement over reference). All new numeric params added in rebuild must also declare `driveable: true`. |
| **G5** — Slider direct input and double-click-to-default | System-level NodePanel fix. All slider params in this module affected. No module-level action. |
| **G6** — Canvas click-to-pick | Required for `EMITTER POSITIONS`. Must use shared CentrePointPicker / PointPicker component when implemented. |
| **G7** — Vector module identifiability | Not applicable. This is a pixel module. |
| **G9** — FRAME param required | `frame` param present in live node (`tier: 3`, `driveable: true`, `unit: 'frames'`, range 0–240). Satisfies G9. Confirm `capByFrame` is correctly integrated into rebuilt architecture. |
| **G10** — SVG export | Not applicable. Pixel module. |
| **G11** — Shared components | Required for: ColourRampControl (output fields), PointPicker (emitter positions), NoiseSourceControl (turbulence), FrameSlider (frame param). Do not reimplement per-module. |
| **G12** — Web worker for expensive computation | `forceWorkerPreview: true` present in live node. Full worker offload must be confirmed in rebuilt architecture. Wave simulation at full resolution (steps=500, 4K) is C–D class (400–800 ms). Buffer allocation (~100 MB at 4K) must be addressed; consider pooling via `ctx.pool` if available, or explicit pre-allocation in stateful worker. |
| **G14** — Mode-conditional params hidden | All mode-gated param sets in rebuilt module must use `when` visibility. Affects: INIT MODE alternatives, emitter subparams, Ocean/Cymatics modes, output field colour ramp. |
| **G16** — Unit labels on all numeric params | `speed` is missing `unit`. All new params must declare `unit`. |

---

## Merge Absorption

The live node contains the following additions over the archived reference source that must be preserved in the rebuild:

| Addition | Disposition |
| --- | --- |
| `frame` param (`tier: 3`, `min: 0`, `max: 240`, `step: 1`, `value: 0`, `unit: 'frames'`, `driveable: true`) | **Retain.** Satisfies G9. Must be integrated into rebuilt stateful simulation as the time/iteration control param. |
| `forceWorkerPreview: true` | **Retain.** Required for G12 worker compliance. |
| `capByFrame` import and call | **Retain.** Provides frame-based step capping. Confirm integration with new `stepsPerFrame` / `warmupSteps` architecture. |
| `driveable: true` on `damping` | **Retain.** G2 compliance. |
| `driveable: true` on `steps` | **Retain.** G2 compliance. Document as frame-level param (per-pixel driving of step count is undefined). |
| `unit: 'n'` on `speed` | **Retain but revise.** Unit label should reflect physical meaning — consider `c` or leave as `n` if normalised. |
| `unit: '0–1'` on `damping` | **Retain.** |

---

## Required Changes (priority ordered)

### P0 — CRITICAL: Rebuild as stateful wave simulation

Replace the current stateless `createEffectModule` factory with a stateful architecture:
- Internal wave field state (`prev`, `cur`, `next` buffers) must persist across `apply()` calls when `retainState` is true.
- Implement `RETAIN STATE` and `RESET ON CHANGE` logic.
- Implement `warmupSteps` (pre-display iterations) and `stepsPerFrame` (iterations per visible output frame).
- Existing `steps` param is repurposed as total step count or deprecated in favour of `stepsPerFrame` — decide and document.
- Stateful worker required: worker must maintain field state between calls, not reset on every invocation.
- CFL guard: clamp `speed` max to 0.707, or add runtime clamp in solver with UI warning label.

### P1 — CRITICAL: Implement multi-point emitter system

Add: `emitterCount`, `emitterMode` (MANUAL / GRID / RADIAL / RANDOM / IMAGE-DRIVEN), `emitterPositions` (array, canvas click-to-pick via G6 shared component), `emitterFrequency`, `emitterPhase`, `emitterAmplitude`, `emitterRadius`, `pulseMode`, `phaseLock`, `superposition`, `reflectionStrength`. All numeric params: `driveable: true`. Emitter mode params hidden when `emitterMode` is not MANUAL (G14).

### P2 — CRITICAL: Implement image coupling (Layer 3)

Add: image-driven seeding via `seedSource` (LUMINANCE / HUE / SATURATION / EDGE MAP / DISTANCE TO EDGE / MASK), `seedThreshold`, `seedSoftness`. Add `forcingStrength`, `forcingInterval` for ongoing image injection. Add `imageDampingField`, `imageSpeedField` for spatially-varying simulation parameters. Add turbulence layer: `turbulenceType`, `turbulenceStrength`, `turbulenceScale`, `turbulenceDrift`, `turbulenceCouplingSource`.

### P3 — CRITICAL: Implement output field system (Layer 4)

Add: `outputMode` (HEIGHT / VELOCITY / INTERFERENCE / NODE MASK / GRADIENT), `normaliseOutput`, `contrast`, `gain`, `minColour`, `maxColour`. Output rendering uses wave field derived at end of simulation, not raw scalar displacement. Use `ColourRampControl` shared component (G11) for colour ramp params.

### P4 — HIGH: Expand Layer 1 init modes

Add INIT MODE options: FLAT, IMAGE SEED, EDGE SEED, POINT EMITTERS, LINE EMITTERS, CUSTOM MASK. Add `initAmplitude`. IMAGE SEED / EDGE SEED modes expose `seedSource`, `seedThreshold`, `seedSoftness`. FLAT mode hides seed params (G14). POINT EMITTERS / LINE EMITTERS modes share emitter subsystem from P1.

### P5 — HIGH: Implement boundary conditions

Add `boundaryMode` (CLAMP / REFLECT / WRAP / ABSORB). Implement REFLECT, WRAP, and ABSORB in solver. Current hard-clamp is CLAMP mode.

### P6 — HIGH: Add Layer 5 compositing controls

Add: `clampMode` (CLAMP / MIRROR / WRAP / TRANSPARENT), `samplingMode` (NEAREST / BILINEAR / BICUBIC). Add independent axis warp (`rgbWarpMode`), `hueModulation`, `saturationModulation`, `lightnessModulation`, `blurModulation`, `sharpenModulation`. Add `maskOutput` mode. All applicable params: `driveable: true`.

### P7 — HIGH: Fix driveable param modulation

Add `modulate` argument to `apply()` signature. Implement per-pixel modulation for all `driveable: true` scalar params using `getModulated(key, pixelIdx, ctx)`. For field-wide params (speed, damping), define modulation semantics (e.g. spatial field drives local damping; document behaviour).

### P8 — HIGH: Add MODE param with simulation modes

Add `mode` param (STATIC MATURE / CONTINUOUS EVOLUTION / FRAME-DRIVEN EMITTERS). STATIC MATURE: advance field for `warmupSteps` then freeze. CONTINUOUS EVOLUTION: advance per-frame driven by `frame`. FRAME-DRIVEN EMITTERS: emitters fire at intervals tied to `frame`. Mode-conditional params hidden per G14.

### P9 — MODERATE: Add Ocean Mode params

Add `directionalWaves`, `secondaryChop`, `currentDrift`, `turbulenceStrength`, `waveSpectrum`, `windDirection`. These appear only when `mode` or a sub-mode selects Ocean specialisation (G14 conditional visibility).

### P10 — MODERATE: Add Cymatics Mode params

Add `cymaticMode` (PLATE / CIRCULAR MEMBRANE / RECTANGULAR MEMBRANE / FREE FIELD), `driveFrequency`, `driveAmplitude`, `resonance`, `nodeSharpness`, `nodeOutput` (HEIGHT / VELOCITY / ABSOLUTE AMPLITUDE / NODAL MASK). Visible only in Cymatics mode (G14).

### P11 — MODERATE: Add `resolution` param

Add `resolution` param (internal simulation downscale factor). Allows simulation to run at lower resolution than image, then upscale displacement field. Primary performance mitigation for high-resolution images with high step counts.

### P12 — MINOR: Remove redundant inline preview cap

Remove `const steps = ctx?.quality === 'preview' ? Math.min(p.steps, 30) : p.steps` from `apply()`. `previewMax: 30` on the `steps` param definition handles this via factory.

### P13 — MINOR: Add missing unit labels

Add `unit: 'n'` (or `unit: 'c'`) to `speed`. All new params must declare `unit` strings before merge.

### P14 — MINOR: CFL guard

Clamp `speed` max to `0.707` in param definition, or add runtime clamp in `waveDistortionRGBA` with a UI warning label indicating instability above 0.707. If extended range is desired for artistic purposes, document the instability explicitly.

---

## Verification Criteria

| # | Criterion | Method |
| --- | --- | --- |
| V1 | Stateful field persists across apply() calls when `retainState = true` | Set retainState, advance frame, confirm field state is not reset |
| V2 | `retainState = false` produces identical output to current implementation for same params | Compare pixel output before/after rebuild at retainState=false |
| V3 | EMITTER COUNT ≥ 2 with IMPULSE mode produces interference patterns | Visual inspection — crossing wave fronts should be visible |
| V4 | IMAGE SEED mode: output wave pattern reflects source image structure | Inject high-contrast source; confirm seed field matches luminance/edge map |
| V5 | OUTPUT MODE = VELOCITY produces velocity field, not height field | Visual difference from HEIGHT mode must be evident |
| V6 | BOUNDARY MODE = REFLECT produces standing wave patterns at high steps | Compare to CLAMP mode — reflection boundary should show symmetric patterns |
| V7 | `speed`, `strength`, `radius` modulation via driver produces per-pixel variation | Attach image driver; confirm spatial variation in warp output |
| V8 | `damping` and `steps` driver attachment produces no crash (field-level semantics documented) | Attach driver; confirm stable output |
| V9 | All mode-conditional params hidden when mode is inactive (G14) | Switch modes; verify NodePanel shows only relevant params |
| V10 | EMITTER POSITIONS canvas click-to-pick functional (G6) | Click PICK button; click canvas; verify emitter position updates |
| V11 | `frame` param drives simulation state — advancing frame advances wave field | Scrub frame param; confirm temporal progression |
| V12 | `warmupSteps` pre-advances field before first display | Set warmupSteps = 200; confirm output at frame=0 shows evolved field |
| V13 | CFL guard: `speed > 0.707` does not produce explosive/infinite values in output | Set speed = 2.0; confirm output is bounded |
| V14 | Preview quality: steps capped via `previewMax` (no redundant inline cap present) | Inspect apply() source — confirm redundant cap removed |
| V15 | Ocean mode: `directionalWaves` produces asymmetric travelling wave output | Compare to symmetric GAUSSIAN init — directional bias visible |
| V16 | Cymatics mode: DRIVE FREQUENCY produces nodal patterns at resonant frequencies | Known resonant freq inputs should produce Chladni-like patterns |
| V17 | All numeric params render unit labels in NodePanel (G16) | Inspect every slider row |
| V18 | No raw colours, border-radius, or box-shadow introduced in any new UI elements | Code audit of any new NodePanel additions |
| V19 | All new param labels UPPERCASE ≤16 chars | Audit param definitions |
| V20 | `forceWorkerPreview: true` retained; heavy computation fully in worker | Profile main thread during apply() — confirm no blocking |
