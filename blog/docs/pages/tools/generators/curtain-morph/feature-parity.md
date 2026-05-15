# Curtain Morph — Feature Parity

## Phase 3 Current State

v1.1.0 fixes are treated as live where present in source/docs: timeline rotation is applied, loop frame metadata follows the user-selected loop, presets use `{ name, values }`, export metadata is present, and dead subdivision/apex code is removed. Remaining notable gap: gradient shading has no worker/GPU/adaptive interaction path.

## Source Reference

- Live: `assets/js/tools/generators/scripts/other/curtain-morph.gen.js` v1.1.0
- Legacy spec: none (Phase 3 — source-only analysis)
- Origin: port of `ring_polygon` sketch

No legacy specification. Parity analysis is internal self-consistency and standards compliance.

## Implemented Features

| Feature | Status | Notes |
|---|---|---|
| Polygon ring morphology (minSides→maxSides) | PASS | Frame-based timeline |
| Area-normalised rings | PASS | `_radiusForEqualArea` |
| Centroid vertical correction | PASS | `_centroidOffsetY` |
| Three-wave oscillator displacement | PASS | `_softLimit` tanh saturation |
| Normal-direction displacement | PASS | Configurable left/right |
| Per-ring amplitude/weight/phase variation | PASS | Sinusoidal modulation by ring index |
| Front/back classification by light source | PASS | Dot product of normal to light |
| Vanishing-point extrusion | PASS | Per-point toward VP |
| Parallel extrusion | PASS | Fixed direction (0,1) |
| Gradient shading | PASS | `gradientSteps` strips |
| Solid shading modes | PASS | `solid`, `solid-grey` |
| Segment depth sorting | PASS | By ring index or VP distance |
| Invert sides toggle | PASS | `invertSides` param |
| All 22 parameters active | PASS | |

## Standards Compliance Gaps

| Aspect | Status | Notes |
|---|---|---|
| Export block | PASS | `{ png: true, gif: true, webm: false }` added in v1.1.0 |
| `animatableParams` | PASS | Declared in `animation` block: 10 params |
| Preset format | PASS | Now uses `values: {}` wrapper in v1.1.0 |
| State on SCRIPT_CONFIG | PARTIAL | Key state moved to module-level (`let _timingState` etc.); not `this.*` — still non-standard but no longer on config object |
| `animation.loopFrames` conflict | PASS | `this.animation.loopFrames = params.loopFrames` set in both `p5Setup` and `p5Draw` |
| `rot = 0` hardcoded | PASS | `rot = state.rotation` wired in v1.1.0; timeline rotation now applied |
| Wave shapes hardcoded | NON-CONFIGURABLE | 3 waves with fixed cycles/weights/phases; documented in KNOWN LIMITATIONS |
| Parallel direction hardcoded `(0,1)` | NON-CONFIGURABLE | Always downward; documented in KNOWN LIMITATIONS |
| Raw P5 colour value | NON-STANDARD | `p.background(255)`, shading uses raw integers; still open |
| `_subdivide`/`_findApex` | PASS | Dead code removed in v1.1.0 |

---

## v4 Review (2026-04-23)

### Reference Capability Table

| cap_id | kind | name | evidence | notes |
|---|---|---|---|---|
| R-01 | behaviour | polygon-ring morph timeline | reference/generators/curtain-morph/source/curtain-morph.gen.js:49-165,540-551 | min/max sides progression |
| R-02 | behaviour | wave-based curtain segment builder | reference/generators/curtain-morph/source/curtain-morph.gen.js:171-317 | normal displacement + side splitting |
| R-03 | behaviour | extrusion and shading renderer | reference/generators/curtain-morph/source/curtain-morph.gen.js:357-411 | vanishing/parallel + gradient/solid |
| R-04 | param | shape/wave/extrusion/shading controls | reference/generators/curtain-morph/source/curtain-morph.gen.js:426-469 | 22 controls |
| R-05 | interaction | p5 loop animation contract + presets | reference/generators/curtain-morph/source/curtain-morph.gen.js:471-582 | loop-based output |

### Function Coverage Map

| unit_id | unit_kind | name | lines | mapped_to |
|---|---|---|---|---|
| F-01 | function | _buildPolygonRings | 49-83 | R-01 |
| F-02 | function | _morphShapes | 85-89 | R-01 |
| F-03 | function | _buildTimeline | 110-141 | R-01 |
| F-04 | function | _getTimingState | 143-165 | R-01 |
| F-05 | function | _oscillate | 173-191 | R-02 |
| F-06 | function | _buildCurtainSegments | 197-317 | R-02 |
| F-07 | function | _drawCurtainSegments | 357-411 | R-03 |
| F-08 | method | p5Setup | 517-523 | R-05 |
| F-09 | method | p5Draw | 525-580 | R-01, R-02, R-03 |
| F-10 | top-level-stmt | SCRIPT_CONFIG object | 417-582 | R-04, R-05 |

### Live Capability Table

| cap_id | kind | name | evidence | notes |
|---|---|---|---|---|
| L-01 | behaviour | polygon-ring morph timeline | assets/js/tools/generators/scripts/other/curtain-morph.gen.js:49-165,540-551 | equivalent flow |
| L-02 | behaviour | wave-based curtain segment builder | assets/js/tools/generators/scripts/other/curtain-morph.gen.js:171-317 | equivalent flow |
| L-03 | behaviour | extrusion and shading renderer | assets/js/tools/generators/scripts/other/curtain-morph.gen.js:357-411 | equivalent flow |
| L-04 | param | shape/wave/extrusion/shading controls | assets/js/tools/generators/scripts/other/curtain-morph.gen.js:426-469 | equivalent surface |
| L-05 | interaction | p5 loop animation contract + presets | assets/js/tools/generators/scripts/other/curtain-morph.gen.js:471-582 | equivalent runtime |

### Diff Table

| cap_id | ref_name | live_match | status | live_evidence | flow_divergence | decision | severity |
|---|---|---|---|---|---|---|---|
| R-01 | morph timeline | L-01 | present | curtain-morph.gen.js:49-165 | none | none | — |
| R-02 | curtain builder | L-02 | present | curtain-morph.gen.js:171-317 | none | none | — |
| R-03 | renderer | L-03 | present | curtain-morph.gen.js:357-411 | none | none | — |
| R-04 | param surface | L-04 | present | curtain-morph.gen.js:426-469 | none | none | — |
| R-05 | runtime contract | L-05 | present | curtain-morph.gen.js:471-582 | none | none | — |

### Library Hygiene Report

**Check 1 — Shared algorithm imports**
- Imports found: none from `assets/js/shared/*`
- Geometry/timing/oscillation/extrusion logic remains inlined in generator module

**Check 2 — Foundation usage**
- AnimationFoundation: host-driven p5 lifecycle
- GPUFoundation: not used

**Check 3 — BaseComponent / MathematicalFoundation**
- BaseComponent: procedural SCRIPT_CONFIG module
- MathematicalFoundation: geometry maths inlined

**Check 4 — State scope smells**
- mutable state stored on SCRIPT_CONFIG (`_timingState`, `_lastTmKey`)

**Issues logged:** ARCH-030

### Performance Tier Audit

**Primary workload:** high-vertex p5 gradient shading with large resolution/steps combinations  
**Tier status:** no adaptive interaction scaling or worker path in current live script

**Issues logged:** PERF-015

### v4 issues logged

- ARCH-030, PERF-015, DOC-052, DOC-053, DOC-054

### v4 questions queued

- none (curtain-morph turn)
