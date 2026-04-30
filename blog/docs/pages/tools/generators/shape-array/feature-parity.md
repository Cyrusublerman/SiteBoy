# Shape Array — Feature Parity

## Source Reference

- Live: `assets/js/tools/generators/scripts/pattern/shape-array.gen.js` v1.1.0
- Legacy spec: none (Phase 3 — source-only analysis)
- Origin: port of `shape_array_accident` sketch

No legacy specification. Parity analysis is internal self-consistency and standards compliance.

## Implemented Features

| Feature | Status | Notes |
|---|---|---|
| Grid of morphing shapes | PASS | cols × rows cells |
| Line → triangle → square → circle morph | PASS | 4-stage via stages=[2,3,4,circleRes] |
| Perimeter-sampled equal-arc-length interpolation | PASS | `_samplePerimeter` with cumulative edge lengths + binary search (O(n + circleRes log n)) |
| Diagonal phase offset ripple | PASS | `(col+row) × phaseOffset` |
| `bgColor` dark/light toggle | PASS | `dropdown` type |
| `strokeWeight` control | PASS | |
| `shapeSize` radius control | PASS | |
| `circleRes` fidelity control | PASS | Also sets stages[3] side count |
| `morphSpeed` and `phaseOffset` controls | PASS | |
| Canvas centring | PASS | `offsetX/Y` computed from `p.width/height` |

## Standards Compliance Gaps

| Aspect | Status | Notes |
|---|---|---|
| Export block | PASS | `png: true, gif: false, webm: false` added v1.1.0 |
| `animatableParams` | PASS | `animatableParams: []` added inside `animation` block |
| Preset format | PASS | `{ name, values: {...} }` wrapper added v1.1.0 |
| State on SCRIPT_CONFIG | PASS | `_globalT` removed; no persistent state on config object |
| `_globalT` frame-rate-dependent | PASS | Fixed to `(frame × morphSpeed) % 1` v1.1.0 |
| Raw P5 colour values | NON-STANDARD | Conditional literals 20/245 |

---

## v4 Review (2026-04-23)

### Reference Capability Table

| cap_id | kind | name | evidence | notes |
|---|---|---|---|---|
| R-01 | behaviour | staged shape morph engine | reference/generators/shape-array/source/shape-array.gen.js:119-129 | 2->3->4->circle stages |
| R-02 | behaviour | grid ripple phase propagation | reference/generators/shape-array/source/shape-array.gen.js:149-153 | `(col+row)*phaseOffset` |
| R-03 | behaviour | perimeter sampling interpolation | reference/generators/shape-array/source/shape-array.gen.js:84-117 | equal-perimeter sampling |
| R-04 | behaviour | centered grid render with stroke style | reference/generators/shape-array/source/shape-array.gen.js:142-164 | grid offsets + draw |
| R-05 | param | grid/shape/animation/style controls | reference/generators/shape-array/source/shape-array.gen.js:21-50 | 9 controls |
| R-06 | interaction | presets + infinite animation | reference/generators/shape-array/source/shape-array.gen.js:53-72 | 3 presets |

### Function Coverage Map

| unit_id | unit_kind | name | lines | mapped_to |
|---|---|---|---|---|
| F-01 | method | _polygon/_samplePerimeter/_lerpShape | 75-117 | R-03 |
| F-02 | method | _getShape | 119-129 | R-01 |
| F-03 | method | p5Draw (phase logic) | 149-153 | R-02 |
| F-04 | method | p5Draw (draw path) | 142-164 | R-04 |
| F-05 | top-level-stmt | parameters block | 21-50 | R-05 |
| F-06 | top-level-stmt | presets/animation block | 53-72 | R-06 |

### Live Capability Table

| cap_id | kind | name | evidence | notes |
|---|---|---|---|---|
| L-01 | behaviour | staged shape morph engine | assets/js/tools/generators/scripts/pattern/shape-array.gen.js:186-214 | equivalent stage mapping |
| L-02 | behaviour | grid ripple phase propagation | assets/js/tools/generators/scripts/pattern/shape-array.gen.js:205-211 | same diagonal phase model |
| L-03 | behaviour | perimeter sampling interpolation | assets/js/tools/generators/scripts/pattern/shape-array.gen.js:133-170 | cumulative-length + binary search |
| L-04 | behaviour | centered grid render with stroke style | assets/js/tools/generators/scripts/pattern/shape-array.gen.js:182-226 | same draw path |
| L-05 | param | grid/shape/animation/style controls | assets/js/tools/generators/scripts/pattern/shape-array.gen.js:58-88 | unchanged control surface |
| L-06 | interaction | presets + infinite animation | assets/js/tools/generators/scripts/pattern/shape-array.gen.js:90-123 | wrapper presets + export flags |

### Diff Table

| cap_id | ref_name | live_match | status | live_evidence | flow_divergence | decision | severity |
|---|---|---|---|---|---|---|---|
| R-01 | staged morph | L-01 | present | shape-array.gen.js:186-214 | deterministic frame-based timing | none | — |
| R-02 | phase ripple | L-02 | present | shape-array.gen.js:205-211 | unchanged | none | — |
| R-03 | perimeter sampling | L-03 | present | shape-array.gen.js:133-170 | accelerated sampling path | none | — |
| R-04 | centered render | L-04 | present | shape-array.gen.js:182-226 | unchanged | none | — |
| R-05 | parameter surface | L-05 | present | shape-array.gen.js:58-88 | unchanged | none | — |
| R-06 | preset/animation surface | L-06 | present | shape-array.gen.js:90-123 | standards metadata added | none | — |

### Library Hygiene Report

**Check 1 — Shared algorithm imports**
- Imports found: none from `assets/js/shared/*`
- Inlined reusable candidates: polygon sampling and shape interpolation helpers

**Check 2 — Foundation usage**
- AnimationFoundation: no raw RAF/interval APIs
- GPUFoundation: no raw GPU APIs

**Check 3 — BaseComponent / MathematicalFoundation**
- BaseComponent: procedural SCRIPT_CONFIG module
- MathematicalFoundation: grid-offset maths inlined

**Check 4 — State scope smells**
- no persistent cross-frame SCRIPT_CONFIG state (improved vs reference)

**Issues logged:** ARCH-021

### Performance Tier Audit

**Primary workload:** geometric/p5  
**Workload size estimate:** O(cols * rows * circleRes) with optimised shared stage sampling

**Tier 1 (RAF coalesce):** implicit via host  
**Tier 2 (Adaptive resolution):** absent  
**Tier 3 (Worker offload):** absent  
**Tier 4 (GPU):** absent

**Issues logged:** PERF-011

### v4 issues logged

- ARCH-021, PERF-011, DOC-031, DOC-032

### v4 questions queued

- none (shape-array turn)
