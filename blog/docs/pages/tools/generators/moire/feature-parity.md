# Moiré — Feature Parity


## Core Computation

| Feature | Spec | Live | Status |
|---|---|---|---|
| Radial grating (sin rings from centre) | ✓ | ✓ | PASS |
| Angular grating (sin sectors) | ✓ | ✓ | PASS |
| Multi-centre field | ✓ | ✓ | PASS |
| Grating combination: SUM, PRODUCT, MIN, MAX | ✓ | ✓ | PASS |
| Threshold to binary output | ✓ | ✓ | PASS |
| Foreground / background colour | ✓ | ✓ | PASS |
| Invert toggle | ✓ | ✓ | PASS |
| Phase animation (frame-driven) | ✓ | ✓ | PASS |
| Phase speed control | ✓ | ✓ | PASS |

## Parameters

| Parameter | Spec Key | Live Key | Status |
|---|---|---|---|
| Grating count | `gratingCount` | `gratingCount` | PASS |
| Base wavelength | `baseWavelength` | `wavelength` | PASS (renamed) |
| Angular frequency | `angularFrequency` | `angularFreq` | PASS (renamed) |
| Angular mod amplitude | `angularModAmplitude` | absent | DROP — angular grating amplitude fixed at 1; adding slider deferred |
| Phase offset | `phaseOffset` | `phaseOffset` | PASS |
| Grating combination | `gratingCombination` | `combineMode` | PASS (renamed) |
| Centre offset | `centreOffset` | `centreOffset` | PASS |
| Centre weight A | `centreWeightA` | `weightA` | PASS (renamed) |
| Centre weight B | `centreWeightB` | `weightB` | PASS (renamed) |
| Mask type | `maskType` | `maskType` | PASS |
| Mask size | `maskSize` | `maskSize` | PASS |
| Mask rotation | `maskRotation` | absent | DROP — mask rotation not implemented; axis-aligned masks by design |
| Animate toggle | `animate` | absent | DROP — animation driven implicitly by frame counter; explicit toggle redundant |
| Phase speed | `phaseSpeed` | `phaseSpeed` | PASS |
| Line threshold | `lineThreshold` | `threshold` | PASS (renamed) |
| Foreground color | `foreground` | `fgColor` | PASS (renamed) |
| Background color | `background` | `bgColor` | PASS (renamed) |
| Invert | `invert` | `invert` | PASS |
| Centre oscillation | not in spec | `centreOsc` | NEW |

## Mask Shapes

| Shape | Spec | Live | Status |
|---|---|---|---|
| None | ✓ | ✓ | PASS |
| Circle | ✓ | ✓ | PASS |
| Triangle | ✓ | ✓ | PASS — resolved; syntax error and formula corrected |
| Polygon | ✓ | ✗ (replaced by 'square') | DROP — configurable-side polygon SDF deferred; square is the implemented substitute |
| Square | not in spec | ✓ | NEW |

## WebGL Rendering

| Feature | Spec | Live | Status |
|---|---|---|---|
| WebGL fragment shader (primary) | ✓ | ✗ | DROP — CPU ImageData with worker offload meets interactive performance target; WebGL port deferred |
| CPU ImageData (fallback) | ✓ | ✓ (only path) | PASS |

## Export

| Feature | Spec | Live | Status |
|---|---|---|---|
| Export PNG | ✓ | ✓ | PASS |
| Export SVG | ✓ | ✗ | FAIL |
| Export GIF | ✓ | ✓ | PASS |
| WebM / sequence | not in spec | ✓ | NEW |

## Preset System

| Feature | Spec | Live | Status |
|---|---|---|---|
| Named presets | not explicitly specified | ✓ (3 presets: Classic, Angular, Hypnotic) | NEW |
| Preset format (full param maps) | — | ✓ (nested `{name, values}`) | PASS |

---

## v4 Review (2026-04-23)

### Reference Capability Table

| cap_id | kind | name | evidence | notes |
|---|---|---|---|---|
| R-01 | behaviour | radial grating field | reference/generators/moire/source/moire.gen.js:21-26 | concentric ring field |
| R-02 | behaviour | angular grating field | reference/generators/moire/source/moire.gen.js:28-33 | spoke modulation |
| R-03 | behaviour | grating combiner modes | reference/generators/moire/source/moire.gen.js:35-43 | sum/product/min/max |
| R-04 | behaviour | multi-centre grating composition | reference/generators/moire/source/moire.gen.js:54-90 | up to 4 centres |
| R-05 | behaviour | mask pipeline | reference/generators/moire/source/moire.gen.js:96-121 | none/circle/triangle/square |
| R-06 | behaviour | thresholded binary output | reference/generators/moire/source/moire.gen.js:188-201 | fg/bg selection |
| R-07 | behaviour | frame-driven phase animation | reference/generators/moire/source/moire.gen.js:150-157 | `(frame/60)*phaseSpeed` |
| R-08 | param | core parameter set | reference/generators/moire/source/moire.gen.js:305-508 | gratings/combination/mask/colors/canvas |
| R-09 | interaction | presets | reference/generators/moire/source/moire.gen.js:243-303 | Classic/Angular/Hypnotic |
| R-10 | export | png/gif/webm/sequence export | reference/generators/moire/source/moire.gen.js:236-241 | no svg |

### Function Coverage Map

| unit_id | unit_kind | name | lines | mapped_to |
|---|---|---|---|---|
| F-01 | function | radialGrating | 21-26 | R-01 |
| F-02 | function | angularGrating | 28-33 | R-02 |
| F-03 | function | combineMoire | 35-43 | R-03 |
| F-04 | function | computeGratings | 54-90 | R-04 |
| F-05 | function | computeMask | 96-121 | R-05 |
| F-06 | function | parseColor | 127-132 | R-06 |
| F-07 | function | draw | 138-202 | R-06, R-07 |
| F-08 | top-level-stmt | parameters block | 305-508 | R-08 |
| F-09 | top-level-stmt | presets block | 243-303 | R-09 |
| F-10 | top-level-stmt | export block | 236-241 | R-10 |

### Live Capability Table

| cap_id | kind | name | evidence | notes |
|---|---|---|---|---|
| L-01 | behaviour | radial grating field | assets/js/tools/generators/scripts/wave/moire.gen.js:21-26 | matches R-01 |
| L-02 | behaviour | angular grating field | assets/js/tools/generators/scripts/wave/moire.gen.js:28-33 | matches R-02 |
| L-03 | behaviour | grating combiner modes | assets/js/tools/generators/scripts/wave/moire.gen.js:35-43 | matches R-03 |
| L-04 | behaviour | multi-centre grating composition | assets/js/tools/generators/scripts/wave/moire.gen.js:54-90 | matches R-04 |
| L-05 | behaviour | mask pipeline | assets/js/tools/generators/scripts/wave/moire.gen.js:96-120 | triangle branch fixed |
| L-06 | behaviour | thresholded binary output | assets/js/tools/generators/scripts/wave/moire.gen.js:188-201 | matches R-06 |
| L-07 | behaviour | frame-driven phase animation | assets/js/tools/generators/scripts/wave/moire.gen.js:150-157 | matches R-07 |
| L-08 | param | core parameter set (no canvas group) | assets/js/tools/generators/scripts/wave/moire.gen.js:341-523 | updated control types |
| L-09 | interaction | presets | assets/js/tools/generators/scripts/wave/moire.gen.js:279-339 | invert uses on/off strings |
| L-10 | export | png/gif/webm/sequence export | assets/js/tools/generators/scripts/wave/moire.gen.js:272-277 | matches R-10 |

### Diff Table

| cap_id | ref_name | live_match | status | live_evidence | flow_divergence | decision | severity |
|---|---|---|---|---|---|---|---|
| R-01 | radial grating field | L-01 | present | moire.gen.js:21-26 | — | none | — |
| R-02 | angular grating field | L-02 | present | moire.gen.js:28-33 | — | none | — |
| R-03 | grating combiner modes | L-03 | present | moire.gen.js:35-43 | — | none | — |
| R-04 | multi-centre composition | L-04 | present | moire.gen.js:54-90 | — | none | — |
| R-05 | mask pipeline | L-05 | present | moire.gen.js:96-120 | triangle branch maths corrected | none | — |
| R-06 | thresholded output | L-06 | present | moire.gen.js:188-201 | invert now string radio (`on/off`) | none | — |
| R-07 | phase animation | L-07 | present | moire.gen.js:150-157 | animatable params added in live | none | — |
| R-08 | core parameter set | L-08 | partial | moire.gen.js:341-523 | canvas params removed; control types normalised | log GEN | P2 |
| R-09 | presets | L-09 | present | moire.gen.js:279-339 | invert preset value changed boolean->string | none | — |
| R-10 | export set | L-10 | present | moire.gen.js:272-277 | — | none | — |

### Library Hygiene Report

**Check 1 — Shared algorithm imports**
- Imports found: none from `assets/js/shared/*`
- Inlined reusable algorithm candidate: radial/angular field composition and shape-mask utilities

**Check 2 — Foundation usage**
- AnimationFoundation: no raw RAF/interval APIs
- GPUFoundation: no raw GPU APIs

**Check 3 — BaseComponent / MathematicalFoundation**
- BaseComponent: procedural SCRIPT_CONFIG module (`draw: draw`)
- MathematicalFoundation: layout maths and coordinate normalisation inlined in draw path

**Check 4 — State scope smells**
- Module-scope mutable state: none (stateless)

**Issues logged:** ARCH-011

### Performance Tier Audit

**Primary workload:** per-pixel  
**Workload size estimate:** O(W×H×gratingCount), 420×420 canvas

**Tier 1 (RAF coalesce):** implicit via host  
**Tier 2 (Adaptive resolution):** declared via `compute.interactionScale`  
**Tier 3 (Worker offload):** absent  
**Tier 4 (GPU):** absent

**Documented mitigations:**
- interaction-scale hint present; no worker/gpu path for heavy per-pixel loops.

**Issues logged:** PERF-003

### v4 issues logged

- GEN-009, EXP-002, ARCH-011, PERF-003, DOC-013, DOC-014

### v4 questions queued

- none (moire turn)
