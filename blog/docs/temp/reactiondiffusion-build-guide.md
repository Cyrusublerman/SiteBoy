# REACTIONDIFFUSION — Build Guide

- module: reactiondiffusion
- node: ReactionDiffusionNode.js
- category: PHYSICS
- review verdict: KEEP
- rebuild severity: CRITICAL

---

## Current State Summary

`ReactionDiffusionNode.js` uses `createEffectModule` factory pattern. Params: `frame` (range, driveable), `preset` (select, 8 options), `steps` (range, driveable, previewMax:100), `seedSize` (range, driveable). Apply delegates to `reactionDiffusionRGBA`. `forceWorkerPreview: true` is set. Apply signature is `apply(src, dst, w, h, p, ctx)` — `modulate` omitted. Inline preview cap is redundant with `previewMax: 100`.

The module produces greyscale output only. Source image influences only the central seed square `v` initialisation. No image-driven parameter fields, no seeding from full image, no output mapping, no stepping separation (warmup vs per-frame), no render mapping, no compositing controls beyond the pipeline-layer standard.

---

## Reference Parity Gaps

The reference source (`reference/distort/reactiondiffusion/source/ReactionDiffusionNode.js`) is the archived pre-`frame` version — 3 params, no `driveable` flags, no `forceWorkerPreview`. The live implementation adds `frame` param, `driveable: true` on `steps` and `seedSize`, and `forceWorkerPreview: true`. These are forward improvements relative to the reference, not regressions.

No functional regression from reference source.

Parity holes documented in `feature-parity.md` remain open:

1. Greyscale-only output — no colour-preserving option; no UI warning to user.
2. Source image influence is confined to central seed square `v` init — no full-image seeding.
3. Redundant inline preview cap in `apply()` — dead code when `previewMax` is present.
4. PREVIEW at 100 steps may show blank/near-blank for slow-developing presets (maze, worms, solitons, pulsating).

---

## Review Spec Gaps

The review (`reactiondiffusion_review2403.md`) specifies a six-layer target architecture. None of layers 1 (extended), 2, 4 (extended), 5, or 6 are implemented. Details:

**Layer 1 — Initialisation (partial):**
- SEED MODE absent (RANDOM / LUMINANCE / THRESHOLDED LUMINANCE / EDGE / COLOUR-CLASS / REGION / RANDOM-BIASED)
- SEED SOURCE absent
- SEED THRESHOLD absent
- SEED DENSITY absent
- SEED RANDOMNESS absent
- IMAGE SEED STRENGTH absent
- SEED SIZE present ✓
- PRESET present ✓

**Layer 2 — Parameter Fields (entirely absent):**
- FEED (global) absent
- KILL (global) absent
- DIFFUSION A (global) absent
- DIFFUSION B (global) absent
- FEED DRIVER absent
- KILL DRIVER absent
- DIFFUSION A DRIVER absent
- DIFFUSION B DRIVER absent
- Image-derived driver sources (LUMINANCE, RED, GREEN, BLUE, HUE, SATURATION, GRADIENT MAGNITUDE, GRADIENT ANGLE, LOCAL CONTRAST, EDGE MAP, DISTANCE TO EDGE, POSITION X/Y, RADIAL DISTANCE) — none implemented

**Layer 3 — Simulation Engine (partial):**
- SIMULATION RESOLUTION absent
- BOUNDARY MODE absent (currently implicit wrap)
- ANISOTROPY absent (future)
- NOISE INJECTION absent (future)
- Ongoing Injection params (INJECTION STRENGTH, INJECTION MODE, INJECTION INTERVAL) absent

**Layer 4 — Stepping Control (partial):**
- INITIAL WARMUP STEPS absent (currently `steps` is a flat count)
- STEPS PER FRAME absent
- MAX STEPS absent
- AUTO-SETTLE absent
- CONVERGENCE THRESHOLD absent
- PAUSE WHEN SETTLED absent
- RETAIN STATE absent
- RESET ON PARAMETER CHANGE absent
- WARMUP PRESET (FAST/MEDIUM/MATURE/FULLY DEVELOPED) absent
- BAKE STATE absent
- FRAME present ✓ (drives time per G9)
- Animation MODE selector absent (STATIC MATURE / CONTINUOUS / FRAME-DRIVEN)

**Layer 5 — Output Mapping (entirely absent):**
- OUTPUT MODE absent (A / B / A-B / ABSOLUTE DIFFERENCE / THRESHOLDED STATE / GRADIENT OF STATE)
- NORMALISE OUTPUT absent
- CONTRAST/GAIN absent
- THRESHOLD absent
- MIN COLOUR absent
- MAX COLOUR absent
- COLOUR RAMP SOURCE absent
- Render-time image modification modes (overlay, displacement mask, colour partition, blur guide, pattern driver) absent

**Layer 6 — Compositing:**
- OPACITY and BLEND MODE present at pipeline layer ✓

---

## Missing Parameters

All parameters below are absent from the current implementation. Priority per review spec:

**HIGH:**
- `seedMode` — select: RANDOM / LUMINANCE / THRESHOLDED LUMINANCE / EDGE / COLOUR-CLASS / REGION / RANDOM-BIASED
- `seedSource` — select: image property driving seeding
- `seedThreshold` — range: luminance cutoff for thresholded seeding
- `seedDensity` — range: density of seeded points
- `seedRandomness` — range: stochastic variation in seed placement
- `imageSeedStrength` — range: bias strength of image vs pure random
- `feed` — range: global feed rate (Du parameter; currently locked inside preset)
- `kill` — range: global kill rate (Dv parameter; currently locked inside preset)
- `diffusionA` — range: global diffusion of chemical A
- `diffusionB` — range: global diffusion of chemical B
- `feedDriver` — select: image field driving local feed override
- `killDriver` — select: image field driving local kill override
- `diffusionADriver` — select: image field driving local diffusion A
- `diffusionBDriver` — select: image field driving local diffusion B
- `warmupSteps` — range: steps run before first visible frame
- `stepsPerFrame` — range: simulation iterations per display frame
- `warmupPreset` — select: FAST / MEDIUM / MATURE / FULLY DEVELOPED
- `animationMode` — select: STATIC MATURE / CONTINUOUS / FRAME-DRIVEN
- `outputMode` — select: A / B / A-B / ABSOLUTE DIFFERENCE / THRESHOLDED STATE / GRADIENT OF STATE
- `normalise` — toggle: map v field to predictable display range
- `contrast` — range: expand output range
- `minColour` — colour: colour for minimum mapped value
- `maxColour` — colour: colour for maximum mapped value
- `colourRampSource` — select: which output signal drives ramp

**MEDIUM:**
- `simulationResolution` — select/range: internal grid resolution (lower = faster, larger patterns)
- `boundaryMode` — select: WRAP / CLAMP / MIRROR
- `injectionStrength` — range: continuous image push per step
- `injectionMode` — select: ADDITIVE / REPLACE / BIAS / THRESHOLDED PULSE
- `injectionInterval` — select: EVERY STEP / EVERY N STEPS / FRAME BOUNDARIES ONLY
- `maxSteps` — range: hard cap for auto-settle
- `autoSettle` — toggle: run until convergence threshold
- `convergenceThreshold` — range: average per-step change below which evolution pauses
- `pauseWhenSettled` — toggle
- `retainState` — toggle
- `resetOnParamChange` — toggle
- `bakeState` — action/toggle: cache mature simulation state

**FUTURE:**
- `presetBlendDriver` — image-driven spatial preset interpolation

---

## Extra/Incorrect Parameters

None. All current params (`frame`, `preset`, `steps`, `seedSize`) are correct and retained.

One implementation defect: inline preview cap in `apply()` is dead code — `previewMax: 100` on `steps` makes the `ctx?.quality === 'preview' ? Math.min(p.steps, 100) : p.steps` check unreachable. Remove the redundant inline cap.

---

## UI Compliance Issues

**G14 — Mode-conditional param visibility:** When `animationMode` is added, params for inactive modes (e.g. `stepsPerFrame` when STATIC MATURE is active) must be hidden, not merely disabled.

**G16 — Unit labels:**
- `steps` param: missing `unit` field. Add `unit: 'n'` ✓ (live already has this).
- `seedSize`: `unit: 'px'` ✓ (live already has this).
- `frame`: `unit: 'frames'` ✓ (live already has this).
- All future range params (`feed`, `kill`, `diffusionA`, `diffusionB`, `warmupSteps`, `stepsPerFrame`, etc.) must include appropriate `unit` fields.

**Performance warning absent:** No UI warning or soft maximum when `steps` approaches 5000 at full resolution (D-class render, >5 s at 4K). A tooltip or threshold indicator is required per `issues-and-conflicts.md`.

**Preview representativeness:** At `steps = 100`, slow-developing presets (maze, worms, solitons, pulsating) show near-blank output. Consider per-preset `previewMax` values or a preview-specific minimum step count.

**No greyscale output warning:** Source colour is entirely discarded. Users are not warned. A note in the NodePanel description or a tooltip is needed.

**G11 — Shared components:** `minColour` / `maxColour` use the same ColourRampControl pattern as Sobel, Canny, Laplacian, DoG. Build as shared component before implementing here; do not reimplement inline.

**G11 — FrameSlider:** `frame` param uses the same FrameSlider pattern as all time-based modules. Must use shared component.

---

## Global Issues

**G1 — +D button non-functional:** Affects all driveable params (`frame`, `steps`, `seedSize`). All driver slots are currently inaccessible from UI. Fix G1 in NodePanel before verifying driver functionality here.

**G2 — Driveable params:** `steps` (driveable: true ✓), `seedSize` (driveable: true ✓), `frame` (driveable: true ✓). Future numeric params (`feed`, `kill`, `diffusionA`, `diffusionB`, `warmupSteps`, `stepsPerFrame`, `seedThreshold`, `seedDensity`, `seedRandomness`, `imageSeedStrength`, `contrast`, `injectionStrength`, `convergenceThreshold`) must all have `driveable: true`.

**G5 — Slider direct input + double-click-to-default:** Applies to all slider params. System-wide fix required; not module-specific.

**G6 — Canvas click-to-pick:** Not applicable — no centre X/Y params.

**G7 — Vector module identification:** Not applicable — pixel output module.

**G9 — FRAME param:** `frame` param present ✓. Tier 3, driveable, unit: 'frames', min: 0, max: 240. Compliant.

**G10 — SVG export:** Not applicable — pixel output module.

**G11 — Shared components:** ColourRampControl (for minColour/maxColour/colourRampSource), FrameSlider (for frame param), and NoiseSourceControl (for seedMode/seedSource pattern) must be built as shared components before implementing in this module.

**G12 — Web worker:** `forceWorkerPreview: true` is set ✓. Full-quality render path must also run in worker. Verify pipeline offloads `apply()` fully at non-preview quality for this module (O(w×h×steps) is a D-class operation at steps=5000 and 4K).

**G14 — Mode-conditional params:** When `animationMode`, `seedMode`, `injectionMode`, and `outputMode` are added, params for inactive modes must be hidden. No module-specific violation yet; required when building.

**G16 — Unit labels:** `steps` has `unit: 'n'` ✓; `seedSize` has `unit: 'px'` ✓; `frame` has `unit: 'frames'` ✓. All future params must include units.

---

## Merge Absorption

The live node already incorporates forward improvements relative to reference source:
- `frame` param added (satisfies G9)
- `driveable: true` on `steps` and `seedSize` (satisfies G2 for current params)
- `forceWorkerPreview: true` added (addresses G12 preview path)

These absorptions are correct. No rollback required.

---

## Required Changes (priority ordered)

**P0 — Architectural prerequisites (before any param work):**
1. Remove redundant inline preview cap from `apply()` — dead code, misleading.
2. Confirm pipeline fully offloads `apply()` to worker at non-preview quality (G12). If not, fix pipeline offload path for this module.
3. Build or confirm shared components before using: ColourRampControl, FrameSlider, NoiseSourceControl (G11).

**P1 — Layer 5: Output Mapping (HIGH — most impactful for usability):**
4. Add `outputMode` (select: A / B / A-B / ABSOLUTE DIFFERENCE / THRESHOLDED STATE / GRADIENT OF STATE). Default: B (current behaviour).
5. Add `normalise` (toggle, default true). Map v field to [0,255] predictably.
6. Add `contrast` (range, driveable: true, unit normalised or %).
7. Add `minColour` / `maxColour` / `colourRampSource` via shared ColourRampControl.
8. Implement G14: hide contrast/threshold/colour params when outputMode is raw field modes.

**P2 — Layer 1: Extended Seeding (HIGH — image-responsiveness):**
9. Add `seedMode` (select: RANDOM / LUMINANCE / THRESHOLDED LUMINANCE / EDGE / COLOUR-CLASS / REGION / RANDOM-BIASED). Default: LUMINANCE (closest to current behaviour).
10. Add `seedThreshold` (range, driveable: true) — visible only when seedMode is THRESHOLDED LUMINANCE.
11. Add `seedDensity` (range, driveable: true, unit: %).
12. Add `seedRandomness` (range, driveable: true).
13. Add `imageSeedStrength` (range, driveable: true).
14. Implement G14: hide seedThreshold when seedMode ≠ THRESHOLDED LUMINANCE.

**P3 — Layer 2: Parameter Fields (HIGH — spatial variation):**
15. Add global `feed`, `kill`, `diffusionA`, `diffusionB` ranges (all driveable: true). These expose the preset's underlying values and allow manual override.
16. Add `feedDriver`, `killDriver`, `diffusionADriver`, `diffusionBDriver` (select: image-derived field sources). Implement spatial parameter field computation in `reactionDiffusionRGBA` or a new shared function.
17. Document recommended first mappings: LUMINANCE→FEED, LUMINANCE→KILL, DISTANCE TO EDGE→gradient, SATURATION→DIFFUSION B.

**P4 — Layer 4: Stepping Control (HIGH — animation and control):**
18. Separate `steps` into `warmupSteps` (range, driveable: true, unit: 'n') and `stepsPerFrame` (range, driveable: true, unit: 'n'). Deprecate flat `steps`.
19. Add `animationMode` (select: STATIC MATURE / CONTINUOUS / FRAME-DRIVEN). Default: STATIC MATURE.
20. Add `warmupPreset` (select: FAST / MEDIUM / MATURE / FULLY DEVELOPED).
21. Add `maxSteps` (range, hard cap).
22. Add `autoSettle` (toggle) + `convergenceThreshold` (range, driveable: true).
23. Add `pauseWhenSettled` (toggle), `retainState` (toggle), `resetOnParamChange` (toggle).
24. Add `bakeState` action.
25. Implement G14: hide `stepsPerFrame` when animationMode is STATIC MATURE; hide `convergenceThreshold` when autoSettle is off.

**P5 — Layer 3: Engine Controls (MEDIUM):**
26. Add `simulationResolution` (select or range).
27. Add `boundaryMode` (select: WRAP / CLAMP / MIRROR). Default: WRAP.
28. Add injection controls: `injectionStrength`, `injectionMode`, `injectionInterval` (guarded by animationMode ≠ STATIC MATURE via G14).

**P6 — UX and compliance:**
29. Add UI warning or tooltip for `steps ≥ 2500` indicating D-class render time.
30. Add greyscale-output notice in NodePanel or param description.
31. Verify per-preset `previewMax` values — slow-developing presets may need higher per-preset floors or a note in the PREVIEW state.
32. Add `driveable: true` to all new range params (G2).
33. Add `unit` fields to all new range params (G16).

---

## Verification Criteria

- [ ] `apply()` has no redundant inline preview cap.
- [ ] `apply(src, dst, w, h, p, ctx, modulate)` signature includes `modulate`.
- [ ] `outputMode` param present; default behaviour (B-field greyscale) unchanged when outputMode = B.
- [ ] `seedMode = LUMINANCE` produces output identical to current implementation for regression check.
- [ ] `feed`, `kill`, `diffusionA`, `diffusionB` match preset table values when preset is selected and no manual override is active.
- [ ] Image-derived driver fields (LUMINANCE→FEED etc.) produce spatially varying parameter maps.
- [ ] `warmupSteps` + `stepsPerFrame` replace flat `steps` without breaking existing serialised params.
- [ ] `animationMode = STATIC MATURE` with `frame = 0` produces deterministic output identical to current implementation.
- [ ] `animationMode = CONTINUOUS` evolves simulation each frame via `stepsPerFrame`.
- [ ] `animationMode = FRAME-DRIVEN` seeds/drifts parameters from `frame` value.
- [ ] G14: params for inactive modes are hidden (not merely disabled) in NodePanel.
- [ ] G2: all numeric params have `driveable: true`.
- [ ] G9: `frame` param present, integer, min 0, driveable.
- [ ] G12: full-quality `apply()` runs in worker; no main-thread block at steps≥500.
- [ ] G16: all params have `unit` fields; units render in NodePanel slider.
- [ ] Performance warning visible when steps-equivalent ≥ 2500 at non-preview quality.
- [ ] No raw hex/rgb/hsl colour values in param definitions — use VGA palette tokens.
- [ ] ColourRampControl, FrameSlider, NoiseSourceControl are shared components (G11), not inline reimplementations.
- [ ] `forceWorkerPreview: true` retained.
