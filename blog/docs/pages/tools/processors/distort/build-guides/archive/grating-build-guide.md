# GRATING — Build Guide

- module: grating
- node: GratingNode.js
- category: PATTERN
- review verdict: KEEP
- rebuild severity: CRITICAL

---

## Current State Summary

Live node is a 19-line factory call via `createEffectModule`. It generates a static sinusoidal grating overlay in four coordinate modes (LINEAR / RADIAL / ANGULAR / SPIRAL) by delegating entirely to `gratingRGBA(...)` from `pattern-generators.js`. The result is written to `dst` and composited by the pipeline.

**What exists:**
- 6 params: `gratingType` (select), `wavelength` (range, driveable), `phase` (range, driveable), `angle` (range, driveable), `spiralRate` (range, driveable), `internalBlend` (select)
- Single-pass O(w × h) rendering — Class A performance budget met
- `previewMax: 80` on `wavelength`
- Factory-level mask support (none/upload/luminance/gradient)
- HOLOGRAM preset references this node in the registry

**What is missing (vs review spec):**
- All four driveable params invoke no `modulate()` — per-pixel driving is silently inert
- No mode-conditional param visibility (`angle` and `spiralRate` always shown regardless of type)
- No CENTRE X / CENTRE Y params (required for ANGULAR, RADIAL, SPIRAL modes)
- No CONTRAST, DUTY CYCLE, SOFTNESS params (Layer 1)
- No driver architecture (Layer 2) — none of 10+ driver params exist
- No field derivation (Layer 3) — no image-derived or pattern-derived fields
- No rendering layer params (Layer 4): no PATTERN COLOUR, PATTERN OPACITY, PATTERN BLEND MODE, INVERT PATTERN, BACKGROUND FILL, ANTI-ALIAS
- No image modification layer (Layer 5): no MODIFICATION MODE and all downstream params
- No PICK CENTRE canvas interaction (G6)
- `phase` param missing `unit` annotation (reference source had no `unit: '0–1'` — live source added it, consistent)
- `angle` param has no `when` conditional in reference source but live source added `when: { param: 'gratingType', equals: 'LINEAR' }` — **inconsistency vs review spec** which calls for hiding on non-relevant modes, not restricting to LINEAR only (SPIRAL also uses ANGLE)
- `spiralRate` lacks `when` conditional — shown for all modes, not just SPIRAL

**Param key conflict:** Live node uses `internalBlend` as the param key. Reference source uses `blendMode`. The HOLOGRAM preset in `registry.js` references `internalBlend: 'screen'`. The `fromJSON` in `EffectNode.js` has a legacy shim that maps `blendMode` → `internalBlend` for backwards compatibility. The key mismatch is live, intentional (migration artefact), but undocumented.

---

## Reference Parity Gaps

| Gap | Reference source | Live source | Impact |
|---|---|---|---|
| Param key `blendMode` vs `internalBlend` | `blendMode` | `internalBlend` | Serialisation mismatch for any JSON saved with `blendMode` key; legacy shim in `EffectNode.fromJSON` partially covers it |
| `phase` unit annotation | No `unit` field | `unit: '0–1'` | Non-breaking addition; consistent with G16 requirement |
| `angle` conditional (`when`) | No `when` field | `when: { param: 'gratingType', equals: 'LINEAR' }` | Live restricts angle to LINEAR only; SPIRAL mode also uses angle — `when` condition is too narrow |
| `spiralRate` tier | Tier 5 (both sources agree now) | Tier 5 | No gap |
| Modulation via `modulate()` | Not invoked (both sources identical) | Not invoked | Both are non-functional; `driveable: true` is declared but inert |
| `previewMax` vs legacy "no reduction" | Source authoritative | Consistent | Documentation conflict only |
| HOLOGRAM preset param key | `internalBlend` in registry | `internalBlend` | Consistent — preset references live param key correctly |

---

## Review Spec Gaps

The review calls for a 7-phase, 5-layer architectural rebuild. Every layer beyond basic pattern generation (Layer 1) is entirely absent.

**Layer 1 — Pattern Generation (partial):**
| Required param | Present | Notes |
|---|---|---|
| TYPE | ✓ | `gratingType` — correct |
| WAVELENGTH | ✓ | Correct |
| PHASE | ✓ | Correct |
| ANGLE | ✓ | Present but `when` condition excludes SPIRAL (must also show for SPIRAL) |
| CENTRE X | ✗ | Missing entirely |
| CENTRE Y | ✗ | Missing entirely |
| SPIRAL RATE | ✓ | Present but no `when` conditional (shown for all modes) |
| CONTRAST | ✗ | Missing entirely |
| DUTY CYCLE | ✗ | Missing entirely |
| SOFTNESS | ✗ | Missing entirely |

**Layer 2 — Driver System:** 0 / ~10 params. None implemented. Full generic driver system required (identical architecture to Truchet per G11).

**Layer 3 — Field Derivation:** 0 / ~12 fields. None implemented. Image-derived fields (luminance, gradient, edge, position, radial distance) and all pattern-derived fields (band mask, distance to band centre/edge, band index, band tangent, band normal) are absent.

**Layer 4 — Rendering:** 0 / 6 params. PATTERN COLOUR, PATTERN OPACITY, PATTERN BLEND MODE, INVERT PATTERN, BACKGROUND FILL, ANTI-ALIAS all absent.

**Layer 5 — Image Modification:** 0 / ~12 params. MODIFICATION MODE, INSIDE/OUTSIDE EFFECT STRENGTH, MASK FEATHER, DISPLACEMENT STRENGTH, DISPLACEMENT RADIUS, COLOUR SHIFT STRENGTH, BLUR STRENGTH, SHARPEN STRENGTH, BAND A/B TREATMENT all absent.

**Processing order:** Current single-pass `gratingRGBA` call implements none of the 7-step processing order specified by the review.

---

## Missing Parameters

**Layer 1 additions:**
- `centreX` — range 0–1, step 0.01, default 0.5, tier 4, driveable: true, unit: '0–1'; hidden unless gratingType ∈ {ANGULAR, RADIAL, SPIRAL}
- `centreY` — range 0–1, step 0.01, default 0.5, tier 4, driveable: true, unit: '0–1'; hidden unless gratingType ∈ {ANGULAR, RADIAL, SPIRAL}
- `contrast` — range 0–1, step 0.01, default 1.0, tier 3, driveable: true, unit: '0–1'
- `dutyCycle` — range 0–1, step 0.01, default 0.5, tier 4, driveable: true, unit: '0–1'
- `softness` — range 0–1, step 0.01, default 0.0, tier 4, driveable: true, unit: '0–1'

**Layer 2 — Driver System (shared component per G11):**
- `driverEnabled` — boolean/toggle, default false
- `driverSource` — select (image / position / radial distance / angle / noise / flow field / gradient field / edge map / distance map / pattern field)
- `driverMetric` — select (luminance / hue / saturation / R/G/B / alpha / gradient magnitude / gradient angle / local contrast / distance to edge / x/y position / radial distance / pattern value / distance to band / band index / band tangent / band normal)
- `driverInputMin` — range, driveable: true
- `driverInputMax` — range, driveable: true
- `driverOutputMin` — range, driveable: true
- `driverOutputMax` — range, driveable: true
- `driverCurve` — select (linear / smoothstep / ease in / ease out / exponential / threshold / stepped / sinusoidal remap)
- `driverBlendAmount` — range 0–1, driveable: true
- `driverInvert` — boolean

**Layer 4 — Rendering:**
- `patternColour` — colour input, VGA palette
- `patternOpacity` — range 0–1, step 0.01, default 1.0, tier 4, driveable: true
- `patternBlendMode` — select (same set as `internalBlend`; consider consolidating or renaming)
- `invertPattern` — boolean, default false
- `backgroundFill` — optional; tier 5
- `antiAlias` — boolean, default true, tier 5

**Layer 5 — Image Modification:**
- `modificationMode` — select (NONE / BAND MASK / DISTANCE FIELD / NORMAL DISPLACEMENT / TANGENT DISPLACEMENT / BAND PARTITION), default NONE
- `insideEffectStrength` — range 0–1, driveable: true; hidden when modificationMode = NONE
- `outsideEffectStrength` — range 0–1, driveable: true; hidden when modificationMode = NONE
- `maskFeather` — range 0–50, unit: px, driveable: true; hidden when modificationMode = NONE
- `displacementStrength` — range 0–100, unit: px, driveable: true; hidden when modificationMode ∉ {NORMAL DISPLACEMENT, TANGENT DISPLACEMENT}
- `displacementRadius` — range 0–200, unit: px, driveable: true; hidden when modificationMode ∉ {NORMAL DISPLACEMENT, TANGENT DISPLACEMENT}
- `colourShiftStrength` — range 0–1, driveable: true; hidden when modificationMode = NONE
- `blurStrength` — range 0–20, unit: px, driveable: true; hidden when modificationMode = NONE
- `sharpenStrength` — range 0–1, driveable: true; hidden when modificationMode = NONE
- `bandATreatment` — select; hidden when modificationMode ≠ BAND PARTITION
- `bandBTreatment` — select; hidden when modificationMode ≠ BAND PARTITION

---

## Extra/Incorrect Parameters

| Param | Issue |
|---|---|
| `internalBlend` key | Key diverges from reference source `blendMode`; covered by `EffectNode.fromJSON` shim but creates ambiguity. After rebuild, decide: keep `internalBlend` (module-internal blend) or absorb into Layer 4 `patternBlendMode`. Not safe to rename without updating HOLOGRAM preset and the shim. |
| `angle` `when` condition | `when: { param: 'gratingType', equals: 'LINEAR' }` is too narrow. SPIRAL mode also uses ANGLE. Correct condition: show when gratingType ∈ {LINEAR, SPIRAL}. Current implementation hides ANGLE in SPIRAL mode — incorrect. |
| `spiralRate` no `when` condition | Shown for all modes. Must be hidden unless gratingType = SPIRAL. |
| `phase` `unit: '0–1'` | Addition not in reference source; correct per G16, not harmful. Retain. |

---

## UI Compliance Issues

**G14 — Mode-conditional params:**
- `angle` hidden in SPIRAL (incorrect; should show for LINEAR and SPIRAL)
- `spiralRate` always shown (incorrect; must be hidden unless SPIRAL active)
- `centreX` / `centreY` (once added) must be hidden unless gratingType ∈ {ANGULAR, RADIAL, SPIRAL}
- CONTRAST, DUTY CYCLE, SOFTNESS — no mode-conditional logic needed (universal)
- Layer 5 params — must be hidden when `modificationMode = NONE`

**G16 — Unit display:**
- `wavelength` has `unit: 'px'` — correct except angular mode (unit is dimensionless frequency multiplier in ANGULAR, not px). Unit annotation is mode-conditional; the label `'px'` is misleading when `gratingType = ANGULAR`.
- `spiralRate` has `unit: 'n'` — present; adequate
- `phase` has `unit: '0–1'` — present; adequate
- `angle` has `unit: 'deg'` — present; adequate
- `centreX` / `centreY` (once added) must declare `unit: '0–1'`
- All new Layer 1 params require explicit `unit` fields

**G2 — driveable: true on all numeric params:**
- `contrast`, `dutyCycle`, `softness`, `centreX`, `centreY` (new Layer 1 params) must all declare `driveable: true`
- All Layer 4 and Layer 5 numeric params must declare `driveable: true`

**Modulate() not called (blocking G1 fix verification):**
- All four current driveable params (`wavelength`, `phase`, `angle`, `spiralRate`) pass values directly from `p` to `gratingRGBA` without `modulate()`. The driver system architecture is entirely inert at the `apply()` call site. This must be corrected as part of Layer 2 implementation.

**G15 — `internalBlend` audit:**
- Grating exposes a module-level internal blend mode distinct from the NodePanel compositing blend mode. The review (G15) requires an audit of whether this is intentional. For grating, the internal blend is structurally distinct (it blends the pattern into the source per-channel before pipeline compositing) — this is intentional and should be retained and clearly named as PATTERN BLEND MODE in Layer 4.

---

## Global Issues

| Issue | Applicability to Grating | Status |
|---|---|---|
| G1 — +D button non-functional | Directly blocks verification of all `driveable` params; four currently declared driveable | Open; fix before verifying driver plumbing |
| G2 — All numeric params must be driveable | `wavelength`, `phase`, `angle`, `spiralRate` declared; all new Layer 1/4/5 numeric params must also declare `driveable: true` | Partial; existing 4 declared but inert; new params not yet created |
| G5 — Slider direct input + double-click-to-default | Applies to all 4 current + all future numeric params | Open; host-level fix |
| G6 — PICK CENTRE canvas interaction | Required for `centreX` / `centreY` once added; grating is listed in the review action items | Open; grating must be included when CentrePointPicker shared component is built |
| G7 — Vector module identifiability | Not applicable; grating is a pixel module | N/A |
| G9 — FRAME param for time-based modules | Not applicable; grating is stateless and not time-iterative | N/A |
| G10 — SVG export action for vector modules | Not applicable; pixel output only | N/A |
| G11 — Overlapping features must use shared components | Driver system must be shared with Truchet (review explicit requirement); CentrePointPicker must be a shared component; do not implement driver or centre-pick as one-off | Open; shared components must be built or verified before grating Layer 2 implementation |
| G12 — Web worker usage | Grating is Class A performance (< 5ms preview, < 16ms full); no worker required at current scope. Layer 5 with displacement or blur may push into Class B; monitor after Layer 5 implementation | Monitor |
| G14 — Mode-conditional params | `angle` condition is wrong (excludes SPIRAL); `spiralRate` has no condition; all new mode-specific params must add `when` | Open; fix `angle` immediately; add `when` to `spiralRate` immediately |
| G16 — Slider/number units | `wavelength` unit label incorrect for ANGULAR mode; all new params need explicit `unit` fields | Open; immediate partial fix; new params at creation |

---

## Merge Absorption

**HOLOGRAM preset (`registry.js` line 257–262):** Uses `internalBlend: 'screen'` and `type: 'linear'` (note: param key is `gratingType` in the node, but the preset serialises as `type` in the JSON nodes array — this is the pipeline type string, not a param). The preset param object is `{ type: 'linear', wavelength: 8, phase: 0, angle: 30, spiralRate: 1, internalBlend: 'screen' }` — but the live node param key is `gratingType`, not `type`. This means the HOLOGRAM preset is currently broken: `type` is not a param key and `gratingType` is never set from the preset. The grating node will default to `gratingType = 'LINEAR'` regardless of preset intent. **This is a live preset bug that must be fixed separately.**

**`EffectNode.fromJSON` shim (line 245–248):** Maps `data.params.blendMode` → `this.params.internalBlend` for backwards compatibility. Once the rebuild aliases `internalBlend` to `patternBlendMode` or clarifies its role, this shim must be updated.

---

## Required Changes (priority ordered)

### Priority 1 — Immediate correctness fixes (no new architecture)

1. **Fix `angle` `when` condition.** Change `when: { param: 'gratingType', equals: 'LINEAR' }` to `when: { param: 'gratingType', oneOf: ['LINEAR', 'SPIRAL'] }` (or equivalent conditional logic). SPIRAL mode uses ANGLE — hiding it in SPIRAL is a functional defect.

2. **Add `when` to `spiralRate`.** Add `when: { param: 'gratingType', equals: 'SPIRAL' }`. Currently always visible regardless of mode — violates G14.

3. **Fix HOLOGRAM preset param key bug.** The preset serialises `type: 'linear'` as a param, but the node param key is `gratingType`. Update the HOLOGRAM preset node params from `{ type: 'linear', ... }` to `{ gratingType: 'LINEAR', ... }` (matching the live param key and case). Verify `internalBlend: 'screen'` is also correct.

4. **Wire `modulate()` for existing driveable params.** Inside `apply()`, replace direct reads from `p.wavelength`, `p.phase`, `p.angle`, `p.spiralRate` with per-pixel `getModulated()` calls. Requires refactoring `apply()` to loop per-pixel (or passing a callback) rather than delegating to `gratingRGBA` as a bulk call. Prerequisite: G1 fix for verification. This is blocked until the `gratingRGBA` function is restructured to accept per-pixel modulation or `apply()` inlines the pixel loop.

5. **Annotate `wavelength` unit mode-dependently.** In ANGULAR mode, `wavelength` is a dimensionless frequency multiplier, not px. Until a multi-unit annotation system exists, add a note or conditional label. Minimum: document the dual semantic in the param `description` field if supported by NodePanel.

### Priority 2 — Phase 1 of review (Layer 1 completion)

6. **Add CENTRE X / CENTRE Y params.** Add `centreX` and `centreY` (range 0–1, driveable, `when: { param: 'gratingType', oneOf: ['ANGULAR', 'RADIAL', 'SPIRAL'] }`). Update `gratingRGBA` call signature or inline the pixel loop to pass `cx = centreX * w`, `cy = centreY * h` instead of hardcoded `w/2, h/2`.

7. **Add CONTRAST, DUTY CYCLE, SOFTNESS params.** These modify the cosine oscillator output. `contrast` scales the [0,1] intensity range. `dutyCycle` adjusts the proportion of light-to-dark band. `softness` controls threshold sharpness. All `driveable: true`. Requires extending `gratingRGBA` or inlining.

### Priority 3 — Phase 2 of review (Driver System, Layer 2)

8. **Implement generic driver architecture.** Must be a shared component consumed by both Truchet and Grating (G11). Build `DriverSystem` shared component first; consume in grating. Driver-capable params (per review spec): `wavelength`, `phase`, `angle`, `centreX`, `centreY`, `spiralRate`, `contrast`, `dutyCycle`, `softness`, `patternOpacity`, `displacementStrength`. Add driver params as a sub-section of the node's param set.

### Priority 4 — Phase 3–4 of review (Field Derivation, Layers 3–4)

9. **Implement image-derived fields.** Luminance and distance-to-edge fields first (review minimum). Add to `apply()` computation before grating generation.

10. **Implement pattern-derived fields.** Band mask, distance to band edge, tangent, normal. Required for Layer 5 and for driving params from pattern geometry.

11. **Add Layer 4 rendering params.** PATTERN COLOUR, PATTERN OPACITY, PATTERN BLEND MODE (rename/clarify relationship to `internalBlend`), INVERT PATTERN, BACKGROUND FILL, ANTI-ALIAS.

### Priority 5 — Phase 5–7 of review (Image Modification, Layer 5)

12. **Add MODIFICATION MODE and Layer 5 params.** BAND MASK and DISTANCE FIELD treatment first; normal-based displacement later. All mode-conditional via `when`.

13. **Implement normal-based image displacement.** Requires band normal field from Priority 4. DISPLACEMENT STRENGTH and DISPLACEMENT RADIUS drive pixel offset along band normal.

14. **Expand driver support.** After driver architecture is stable, attach driver slots to all remaining driver-capable params listed in the review spec.

### Priority 6 — Shared/Global dependencies

15. **Build CentrePointPicker shared component (G6).** Required before PICK CENTRE is exposed for CENTRE X/Y. Add PICK CENTRE button to NodePanel for grating once the shared component exists.

16. **Fix G1 (+D button).** Required before any driver functionality can be verified.

17. **Implement G5 (slider direct input + double-click-to-default).** Host-level; applies automatically once fixed globally.

---

## Verification Criteria

Each criterion maps to a specific complaint or requirement. All must pass before marking this module complete.

1. **`angle` visible in LINEAR and SPIRAL, hidden in RADIAL and ANGULAR.** Confirm with `gratingType = RADIAL` (ANGLE must not appear) and `gratingType = SPIRAL` (ANGLE must appear).

2. **`spiralRate` visible only in SPIRAL.** Confirm with `gratingType = LINEAR` (SPIRAL RATE must not appear).

3. **HOLOGRAM preset applies correctly.** Load HOLOGRAM preset; confirm grating node renders with angle 30, wavelength 8, SCREEN blend at opacity 0.4. Confirm `gratingType = LINEAR` (not undefined).

4. **CENTRE X / CENTRE Y apply to pattern origin.** In RADIAL mode, set CENTRE X = 0.1, CENTRE Y = 0.1; confirm rings are centred at top-left, not image centre.

5. **Per-pixel driving functional (post-G1 fix).** Attach a luminance image driver to PHASE; confirm grating phase varies spatially across the output according to source luminance.

6. **WAVELENGTH driver functional.** Attach driver to WAVELENGTH; confirm band spacing varies spatially.

7. **ANGLE driver functional.** Attach driver to ANGLE in LINEAR mode; confirm local grating orientation varies per-pixel.

8. **CONTRAST param.** Set CONTRAST = 0; confirm output is a flat mid-grey grating (zero amplitude). Set CONTRAST = 1; confirm full [0,1] amplitude.

9. **DUTY CYCLE param.** Set DUTY CYCLE = 0.1; confirm narrow bright bands. Set DUTY CYCLE = 0.9; confirm narrow dark bands.

10. **SOFTNESS param.** Set SOFTNESS = 0; confirm hard-edged bands. Set SOFTNESS = 1.0; confirm smooth sinusoidal fading.

11. **MODIFICATION MODE = BAND MASK.** Confirm image is partitioned into light/dark bands with INSIDE/OUTSIDE EFFECT STRENGTH controlling brightness differential.

12. **MODIFICATION MODE = NORMAL DISPLACEMENT.** Confirm image pixels are displaced perpendicular to band direction with DISPLACEMENT STRENGTH controlling magnitude.

13. **All new numeric params display unit labels.** Verify CENTRE X shows '0–1', WAVELENGTH shows 'px' (or mode-appropriate label), CONTRAST shows '0–1', DUTY CYCLE shows '0–1', SOFTNESS shows '0–1'.

14. **PICK CENTRE button sets CENTRE X/Y from canvas click.** Activate PICK CENTRE; click canvas at a position; confirm `centreX` and `centreY` update to the clicked normalised coordinates.

15. **No mode-inapplicable params visible at any time.** For every combination of `gratingType` and `modificationMode`, verify that only applicable params are rendered in NodePanel.

16. **`internalBlend` / `patternBlendMode` does not duplicate pipeline compositing blend mode.** Verify the two blend controls are visually distinct and labelled unambiguously — one is module-internal (pattern→source blend), one is pipeline (module output→previous stage blend).
