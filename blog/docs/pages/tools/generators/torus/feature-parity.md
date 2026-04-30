# Torus — Feature Parity


The live script is a full port with enhancements. Audit classification: "Enhanced — implementation has more controls than original reference."

## Core Features

| Feature | Legacy spec | Live | Status |
|---|---|---|---|
| Torus 3D parametric surface | ✓ | ✓ | PASS |
| Cross-section ellipses (36) with 25% alpha | ✓ | ✓ (36 ellipses, 0.25 alpha) | PASS |
| Toroidal surface spirals (9 per direction) | ✓ | ✓ (configurable) | PASS |
| 4 spiral winds | ✓ | ✓ (configurable) | PASS |
| 3D → 2D projection | ✓ | ✓ | PASS |
| Frame-based rotation | ✓ | ✓ | PASS |
| 3600-frame loop | ✓ | ✓ (configurable) | PASS |
| Adjustable spiral count | ✓ (recommended) | ✓ | PASS |
| Adjustable torus size | ✓ (recommended) | ✓ | PASS |
| Adjustable view angles | ✓ (recommended) | ✓ | PASS |
| Adjustable cycle speed | ✓ (recommended) | ✓ | PASS |
| Play/pause | ✓ (recommended) | ✓ (host transport controls) | PASS |
| Separate major/minor radius sliders | ✓ (recommended) | ✗ (locked equal, R=r by design) | DROP — separate sliders not implemented; architectural constraint documented |
| Wind count slider | ✓ (recommended, hardcoded) | ✓ | PASS |
| PNG export | ✓ | ✓ | PASS |
| GIF/WebM export | not in spec | ✓ | NEW |

## Parameters vs Legacy Spec

| Parameter | Spec | Live | Status |
|---|---|---|---|
| majorRadius (50–300) | ✓ | ✗ (subsumed into torusSize) | PARTIAL |
| minorRadius (50–300) | ✓ | ✗ (same as majorRadius) | PARTIAL |
| viewAngleX (radians) | ✓ | ✓ (as degrees `viewX`) | PASS |
| viewAngleY (radians) | ✓ | ✓ (as degrees `viewY`) | PASS |
| numSpirals | ✓ | ✓ | PASS |
| spiralWinds | ✓ | ✓ | PASS |
| cycleFrames | ✓ | ✓ | PASS |
| showTorusMesh | not in spec | ✓ | NEW |

---

## v4 Review (2026-04-23)

### Reference Capability Table

| cap_id | kind | name | evidence | notes |
|---|---|---|---|---|
| R-01 | param | numSpirals | reference/generators/torus/source/torus.gen.js:173-180 | spiral count |
| R-02 | param | torusSize | reference/generators/torus/source/torus.gen.js:182-190 | shared radius factor |
| R-03 | param | spiralWinds | reference/generators/torus/source/torus.gen.js:192-200 | winding multiplier |
| R-04 | param | showTorusMesh | reference/generators/torus/source/torus.gen.js:202-210 | mesh visibility control |
| R-05 | param | viewX | reference/generators/torus/source/torus.gen.js:214-222 | X view angle |
| R-06 | param | viewY | reference/generators/torus/source/torus.gen.js:224-232 | Y view angle |
| R-07 | param | cycleFrames | reference/generators/torus/source/torus.gen.js:234-242 | loop period |
| R-08 | behaviour | 3D projection pipeline | reference/generators/torus/source/torus.gen.js:26-37 | project3D |
| R-09 | behaviour | torus mesh renderer | reference/generators/torus/source/torus.gen.js:39-68 | 36 filled rings |
| R-10 | behaviour | bidirectional surface spiral renderer | reference/generators/torus/source/torus.gen.js:70-96 | forward + reverse spirals |
| R-11 | behaviour | frame rotation state evolution | reference/generators/torus/source/torus.gen.js:123-137 | torus/spiral/x rotations |
| R-12 | export | png/gif/webm/sequence export support | reference/generators/torus/source/torus.gen.js:286-292 | export config |
| R-13 | param | separate major/minor radius controls | reference/generators/torus/source/torus.gen.js:13-24 | legacy separate radius state |

### Function Coverage Map

| unit_id | unit_kind | name | lines | mapped_to |
|---|---|---|---|---|
| F-01 | function | updateRadii | 20-24 | R-13 |
| F-02 | function | project3D | 26-37 | R-08 |
| F-03 | function | drawTorusSpiral | 39-68 | R-09 |
| F-04 | function | drawToroidalSurfaceSpiral | 70-96 | R-10 |
| F-05 | function | draw | 102-138 | R-11 |
| F-06 | top-level-stmt | mutable radius state | 13-14 | R-13 |
| F-07 | top-level-stmt | parameters declaration | 173-242 | R-01, R-02, R-03, R-04, R-05, R-06, R-07 |
| F-08 | top-level-stmt | export declaration | 286-292 | R-12 |

### Live Capability Table

| cap_id | kind | name | evidence | notes |
|---|---|---|---|---|
| L-01 | param | numSpirals | assets/js/tools/generators/scripts/parametric/torus.gen.js:214-222 | matches R-01 |
| L-02 | param | torusSize | assets/js/tools/generators/scripts/parametric/torus.gen.js:224-232 | matches R-02 |
| L-03 | param | spiralWinds | assets/js/tools/generators/scripts/parametric/torus.gen.js:234-242 | matches R-03 |
| L-04 | param | showTorusMesh (radio on/off) | assets/js/tools/generators/scripts/parametric/torus.gen.js:244-252 | matches R-04 with type refinement |
| L-05 | param | viewX | assets/js/tools/generators/scripts/parametric/torus.gen.js:256-264 | matches R-05 |
| L-06 | param | viewY | assets/js/tools/generators/scripts/parametric/torus.gen.js:266-274 | matches R-06 |
| L-07 | param | cycleFrames | assets/js/tools/generators/scripts/parametric/torus.gen.js:276-284 | matches R-07 |
| L-08 | behaviour | standardised 3D projection pipeline | assets/js/tools/generators/scripts/parametric/torus.gen.js:22-31 | Ry×Rx projection |
| L-09 | behaviour | torus mesh renderer | assets/js/tools/generators/scripts/parametric/torus.gen.js:36-63 | 36 filled rings |
| L-10 | behaviour | bidirectional surface spiral renderer | assets/js/tools/generators/scripts/parametric/torus.gen.js:68-92 | forward + reverse spirals |
| L-11 | behaviour | frame rotation state evolution | assets/js/tools/generators/scripts/parametric/torus.gen.js:117-137 | per-frame phase model |
| L-12 | export | png/gif/webm/sequence export support | assets/js/tools/generators/scripts/parametric/torus.gen.js:304-310 | matches R-12 |

### Diff Table

| cap_id | ref_name | live_match | status | live_evidence | flow_divergence | decision | severity |
|---|---|---|---|---|---|---|---|
| R-01 | numSpirals | L-01 | present | torus.gen.js:214-222 | — | none | — |
| R-02 | torusSize | L-02 | present | torus.gen.js:224-232 | — | none | — |
| R-03 | spiralWinds | L-03 | present | torus.gen.js:234-242 | — | none | — |
| R-04 | showTorusMesh | L-04 | present | torus.gen.js:244-252 | toggle->radio normalisation | none | — |
| R-05 | viewX | L-05 | present | torus.gen.js:256-264 | — | none | — |
| R-06 | viewY | L-06 | present | torus.gen.js:266-274 | — | none | — |
| R-07 | cycleFrames | L-07 | present | torus.gen.js:276-284 | — | none | — |
| R-08 | 3D projection pipeline | L-08 | diverged | torus.gen.js:22-31 | projection math corrected to standard Ry×Rx | log GEN | P2 |
| R-09 | torus mesh renderer | L-09 | present | torus.gen.js:36-63 | — | none | — |
| R-10 | bidirectional spiral renderer | L-10 | present | torus.gen.js:68-92 | — | none | — |
| R-11 | frame rotation state evolution | L-11 | present | torus.gen.js:117-137 | trig precompute optimisation | none | — |
| R-12 | export support | L-12 | present | torus.gen.js:304-310 | — | none | — |
| R-13 | separate major/minor radius controls | — | absent | — | live keeps R=r locked by design | log GEN | P2 |

### Library Hygiene Report

**Check 1 — Shared algorithm imports**
- Imports found: none
- Algorithms inlined that have shared modules: 3D transform/projection maths inlined
- Algorithms inlined where no shared module exists: torus-specific path generator logic

**Check 2 — Foundation usage**
- AnimationFoundation: no raw RAF/interval APIs in script
- GPUFoundation: no raw GPU APIs

**Check 3 — BaseComponent / MathematicalFoundation**
- BaseComponent: does not extend BaseComponent (procedural SCRIPT_CONFIG module)
- MathematicalFoundation: layout maths inlined (`W/2`, `H/2`, `min(W,H)`) in draw

**Check 4 — State scope smells**
- Module-scope mutable state: none in live v2.0.0 source

**Issues logged:** ARCH-007, ARCH-008

### Performance Tier Audit

**Primary workload:** geometric  
**Workload size estimate:** ~20k–360k projected points/frame depending on params

**Tier 1 (RAF coalesce):** implicit via host  
**Tier 2 (Adaptive resolution):** n/a (geometric path renderer)  
**Tier 3 (Worker offload):** n/a  
**Tier 4 (GPU):** n/a

**Documented mitigations:**
- live source applies trig precompute and removes module mutable radii; torus docs partially stale and need refresh.

**Shader hygiene:** not applicable — no shaders

**Issues logged:** none

### v4 issues logged

- GEN-006, GEN-007, ARCH-007, ARCH-008, DOC-007, DOC-008, DOC-009

### v4 questions queued

- none (torus turn)
