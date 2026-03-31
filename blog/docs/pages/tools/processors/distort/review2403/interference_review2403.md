# INTERFERENCE — Review 2403

- type: `interference`
- category: OPTICS
- isVector: false
- verdict: KEEP — rebuild as thin-film optics and iridescence field system
- priority: HIGH
- date: 2026-03-31
- reviewer: user

---

## Section 1 — Triage

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 1.1 | What does this module do? | Simulates thin-film optical interference by deriving per-pixel effective film thickness from source luminance, computing optical path difference (OPD = 2 × n × d × cos θ) at red, green, and blue wavelengths, and blending the resulting iridescent reflectance onto the source image | — |
| 1.2 | Equivalent output from another module? | No equivalent — CHROMATIC ABERRATION shifts channels spatially; INTERFERENCE shifts channel intensity spectrally via a physical optics model. Distinct category anchor | — |
| 1.3 | Verdict | KEEP — unique physical optics model; correct behaviour; fast O(w×h) cost; strong potential as optical field generator | — |
| 1.4 | Name contains "MODULE" in picker? | NO | — |
| 1.5 | Hover tooltip present in picker? | YES | — |

## Section 2 — Functional Completeness

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 2.1 | Correct output with defaults? | YES — strong hue cycling, iridescent colour shifts driven by source tone, phase-offset RGB behaviour consistent with thin-film model. Module works | — |
| 2.2 | Achieves stated purpose? Missing features? | Core iridescent overlay functions. Missing: all four params are marked driveable but none are modulated (apply() omits modulate); refractive index hardcoded at n = 1.33, not user-accessible; thickness modulated only by luminance (no other field sources); no separation between base thickness and thickness-field coupling; no phase/OPD/fringe-band field output; no non-RGB render modes (hue-only, chroma-only, luminance-preserving); no temporal logic; no image-modification-by-phase mode | ERROR |
| 2.3 | Based on source reference? | Classical thin-film OPD formulation (standard optics); no single external project reference | — |

## Section 4 — Parameter and UI Audit

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 4.1 | Module-specific params (label, type)? | THICKNESS (100–800 nm, driveable), VIEW ANGLE (0–60°, driveable), IRIDESCENCE (0–2, driveable), BLEND (0–1, driveable) | — |
| 4.2 | All labels SCREAMING CASE, untruncated? | THICKNESS ✓, VIEW ANGLE ✓ (truncation risk if panel narrow), IRIDESCENCE ✓, BLEND ✓ | WARN |
| 4.3 | Primary param visible by default? | THICKNESS, IRIDESCENCE, BLEND at tier 3 — visible; VIEW ANGLE at tier 4 | — |
| 4.4 | All controls respond correctly across range? | Params function correctly as scalars. THICKNESS sweeps produce expected hue cycling. VIEW ANGLE shifts phase angle. IRIDESCENCE scales coupling strength. No breakage at extremes | — |
| 4.5 | Driver slots (+D) functional? | All four params marked `driveable: true`; apply() omits modulate — driver modulation impossible for all four. +D button also broken globally (G1) | ERROR |

## Section 5 — Performance

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 5.1 | Cost-scaling params? | None — O(w×h) with three cosine evaluations per pixel; performance class A–B. Refractive index and angle cosine could be hoisted to reduce cost further | — |
| 5.2 | Interactive in PREVIEW at max params? | YES — cheap at all scales | — |
| 5.3 | Acceptable FULL-mode render time at max params? | YES — fast at any resolution | — |

## Section 6 — Load and Stability

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 6.1 | Loads without errors on first add? | YES | — |
| 6.2 | Broken output at extreme param values? | No crash or NaN. THICKNESS at 100 nm and 800 nm produce expected hue shifts at opposite ends of the interference spectrum. BLEND at 0 passes source through; at 1 full interference composite — both valid | — |

## Section 7 — Final Critique

| # | Question | Answer | Severity |
|---|----------|--------|----------|
| 7.1 | Confusing, misleading, or inconsistent behaviour? | All four params show +D slots implying driver reactivity — none are functional. IRIDESCENCE param label is ambiguous as to whether it scales the coupling (which it does) or changes the mode — a label like COUPLING STRENGTH or THICKNESS RESPONSE would be clearer. Refractive index being hardcoded at n = 1.33 is not surfaced anywhere in the UI — users have no way to know this constraint exists | WARN |
| 7.2 | Additional critique or observations? | This module has a genuinely distinct physical identity — it is the only module in the set with a proper optics model. Its performance profile (class A–B, O(w×h)) gives it substantial expansion headroom. The core failure is treating the OPD computation as a collapsed styliser rather than a field system. Priority redesign sequence: (1) fix four fake driver slots; (2) expose refractive index; (3) separate base thickness from luminance-coupling; (4) add non-luminance thickness field sources; (5) expose phase/OPD/fringe-band as output; (6) add luminance-preserving render mode; (7) add temporal drift. Strategic role: primary optics field module — phase and fringe outputs can drive hue assignment in painterly, tessellation colouring, and band-structured compositing | — |

## Issues

```
[ERROR] [BUG] All four driveable params have non-functional driver slots — apply() omits modulate
Location: nodes/optics/InterferenceNode.js — filmThickness, viewAngle, iridescence, blendAmt params + apply signature
Evidence: All four params have driveable: true. apply(src, dst, w, h, p) omits modulate. No driver influence path exists for any param.
Impact: Four fake +D slots presented to the user. Particularly wasteful: per-pixel thickness modulation would be a natural and cheap operation in this O(w×h) model.
```

```
[ERROR] [PARITY] Refractive index hardcoded at n = 1.33 — not user-accessible
Location: shared/algorithms/optics/interference.js — thinFilmInterferenceRGBA implementation
Evidence: n = 1.33 (water/soap) is a hardcoded constant. No param exposed. UI gives no indication this constraint exists.
Impact: Cannot model air-gap (n ≈ 1.0), oil film (n ≈ 1.47), mica (n ≈ 1.58), or other materials. Physical range is inaccessible.
```

```
[WARN] [STANDARDS] Thickness field locked to luminance — no alternative source domain
Location: nodes/optics/InterferenceNode.js — apply() / thinFilmInterferenceRGBA
Evidence: Effective thickness = filmThickness + lum × 200 × iridescence. Only luminance drives spatial thickness variation.
Impact: Cannot generate soap-film gradients, radial oil-slick structures, noise-driven thickness fields, or image-structure-independent interference patterns.
```

```
[WARN] [STANDARDS] No separation between base thickness and luminance coupling strength
Location: nodes/optics/InterferenceNode.js — filmThickness, iridescence params
Evidence: filmThickness sets a base; iridescence scales luminance coupling. These are conflated — there is no explicit THICKNESS SCALE or COUPLING STRENGTH separation. Adding a non-luminance thickness source will require architectural refactoring regardless.
Impact: Param semantics become ambiguous once multiple thickness sources exist.
```

```
[NOTE] [PARITY] No field output — OPD, phase, and fringe bands are computed and discarded
Location: nodes/optics/InterferenceNode.js — apply()
Evidence: OPD and per-channel reflectance are computed per pixel and used only for RGB output. No phase field, fringe-band index, constructive/destructive zone mask, or hue/intensity field exposed for downstream use.
Impact: Module cannot feed phase or fringe structure to painterly, tessellation, contour, or halftone modules.
```

```
[NOTE] [PARITY] No luminance-preserving render mode — interference always replaces or blends full RGB
Location: nodes/optics/InterferenceNode.js — apply()
Evidence: blendAmt mixes full interference RGB with source. No hue-only, chroma-only, or luminance-lock composite mode.
Impact: Users cannot apply iridescent hue shift while preserving source tonal values.
```

```
[NOTE] [PARITY] No temporal logic — phase is static per render invocation
Location: nodes/optics/InterferenceNode.js — apply()
Evidence: No PHASE DRIFT, THICKNESS EVOLUTION, ANGLE SWEEP, FRAME, or BAKE STATE param.
Impact: Module cannot produce animated thin-film behaviour — a primary visual use case for interference effects.
```

```
[WARN] [STANDARDS] IRIDESCENCE label is ambiguous — does not describe what the param actually controls
Location: nodes/optics/InterferenceNode.js — iridescence param
Evidence: iridescence scales luminance-to-thickness coupling strength, not iridescence in any strict sense. Label is misleading.
Impact: User cannot infer param function from label alone.
```

```
[ERROR] [BUG] Driver slot +D button non-functional — see G1
Location: NodePanel — all param +D buttons
```

## Required Rebuild Specification

### Operating Modes

| Mode | Notes |
|---|---|
| COLOUR | Full RGB interference composite (current behaviour) |
| HUE ONLY | Interference applied to hue channel only; luminance and saturation preserved |
| CHROMA ONLY | Interference modulates chroma; luminance preserved |
| PHASE BANDS | Fringe contours rendered as visible banding |
| MONO FRINGE | Monochrome constructive/destructive zone map |
| IMAGE MODIFY | Phase/fringe modulates image properties (saturation, hue, blur, grain) |
| FIELD | OPD, phase, or fringe-band exported as scalar field for downstream use |

### Core Architecture

**A. Thickness Field Generation**
SOURCE: LUMINANCE / RED / GREEN / BLUE / HUE / SATURATION / LOCAL CONTRAST / EDGE MAP / RADIAL DISTANCE / POSITION X / POSITION Y / NOISE FIELD / PATTERN FIELD / MASK / EXTERNAL FIELD
BASE THICKNESS (nm), THICKNESS SCALE, THICKNESS OFFSET, THICKNESS REMAP CURVE, THICKNESS CONTRAST

**B. Optical Model**
REFRACTIVE INDEX (1.0–2.0, step 0.01), VIEW ANGLE (0–90°), PHASE OFFSET, SPECTRAL SAMPLE MODE (RGB / MULTI-WAVELENGTH), INTERFERENCE STRENGTH, REFLECTION BASELINE

**C. Source Coupling**
LUMINANCE INFLUENCE, SATURATION INFLUENCE, EDGE INFLUENCE, POSITION INFLUENCE — weights on above field sources

**D. Render**
MODE (from above), FRINGE CONTRAST, COLOUR INTENSITY, LUMINANCE PRESERVATION TOGGLE

**E. Image Modification**
HUE BY PHASE, SATURATION BY INTERFERENCE, BLUR BY FRINGE, GRAIN BY INTERFERENCE, THRESHOLD BY PHASE

**F. Temporal**
TEMPORAL MODE (STATIC / DRIFT / SWEEP / SCROLL), PHASE DRIFT SPEED, ANGLE SWEEP RANGE, FRAME PARAM (G9), BAKE STATE

**G. Output**
OUTPUT TYPE, EXPORT PHASE FIELD, EXPORT OPD FIELD, EXPORT FRINGE BANDS, EXPORT INTERFERENCE MASK, DOWNSTREAM DRIVER EXPORT

### Driver Boundary
Remove `driveable: true` from all four params until apply() supports modulate. After correction, all four are legitimate driver targets: THICKNESS (per-pixel spatial thickness variation is natural in O(w×h) model), VIEW ANGLE, IRIDESCENCE / COUPLING STRENGTH, BLEND.

### Naming
Rename IRIDESCENCE param to COUPLING STRENGTH or THICKNESS RESPONSE to accurately describe function.

### Minimum Acceptable Upgrade
1. Remove `driveable: true` from all four params or implement modulate properly
2. Expose REFRACTIVE INDEX as a user param (range 1.0–2.0)
3. Separate BASE THICKNESS from COUPLING STRENGTH (luminance influence weight)
4. Add at least one non-luminance THICKNESS SOURCE option
5. Add luminance-preserving render mode (HUE ONLY or CHROMA ONLY)
6. Add FIELD output mode — export phase or fringe-band scalar for downstream use

## Action Items

1. **[CRITICAL]** Remove `driveable: true` from all four params until apply() supports modulate — or implement real modulate support (preferred; O(w×h) cost makes per-pixel thickness modulation cheap).
2. **[CRITICAL]** Expose REFRACTIVE INDEX as a user param (range 1.0–2.0, step 0.01, default 1.33, unit: n).
3. **[HIGH]** Separate BASE THICKNESS from luminance coupling — add COUPLING STRENGTH param (replaces IRIDESCENCE, label corrected); add THICKNESS OFFSET param.
4. **[HIGH]** Add THICKNESS SOURCE param — at minimum: LUMINANCE / RADIAL DISTANCE / NOISE FIELD / POSITION X / POSITION Y / EXTERNAL FIELD.
5. **[HIGH]** Add HUE ONLY and CHROMA ONLY render modes — preserve luminance while applying interference colour shift.
6. **[HIGH]** Add FIELD output mode — export phase field and fringe-band index as scalar outputs for downstream use.
7. **[HIGH]** Add PHASE BANDS render mode — render fringe contours as visible banding with FRINGE CONTRAST and BAND FREQUENCY params.
8. Add TEMPORAL MODE param: STATIC / DRIFT / SWEEP — with PHASE DRIFT SPEED and FRAME param (G9).
9. Add IMAGE MODIFY mode: HUE BY PHASE, SATURATION BY INTERFERENCE, BLUR BY FRINGE, GRAIN BY INTERFERENCE.
10. Fix +D driver button (G1); implement real per-pixel driver modulation once architecture supports it (G2).
11. Slider direct input and double-click-to-default (G5).
12. Add unit labels (G16): THICKNESS → nm (already present); VIEW ANGLE → ° (already present); REFRACTIVE INDEX → n; COUPLING STRENGTH → none.
13. Hide mode-conditional params per active OUTPUT MODE and THICKNESS SOURCE (G14).
14. Verify VIEW ANGLE label is untruncated in NodePanel at standard panel width.
