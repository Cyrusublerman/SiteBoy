# Order and Disorder — Feature Parity

## Source Reference

- Live: `assets/js/tools/generators/scripts/pattern/order-disorder.gen.js` v1.1.0
- Legacy spec: none (Phase 3 — source-only analysis)
- Origin: port of `order_and_disorder` sketch (noted in file header)

No legacy specification. Parity analysis is internal self-consistency and standards compliance.

## Implemented Features

| Feature | Status | Notes |
|---|---|---|
| Grid of points | PASS | Configurable spacing and margin |
| Rotating influence source | PASS | `sourceTheta` from `frame % loopFrames` |
| Bean-shaped influence zone | PASS | Asymmetric CW/CCW angular constraints |
| `alpha` field (0=disorder, 1=order) | PASS | Radial + angular combined distance |
| Perlin noise displacement | PASS | 2D per point with time component |
| Lerp toward grid home by alpha | PASS | Correct linear interpolation |
| Boundary jiggle | PASS | `transitionAmt` peaks at alpha=0.5 |
| `blendFactor` for arc measurement | PASS | Blends source vs actual radius |
| `innerRatio` core full-order zone | PASS | Hard inner boundary |
| CW vs CCW curve asymmetry | PASS | `curve=1` vs `curve=0.7` |
| All 16 parameters active | PASS | No inert params |

## Standards Compliance Gaps

| Aspect | Status | Notes |
|---|---|---|
| Export block | PASS | `png: true, gif: false, webm: false` added v1.1.0 |
| `canPrerender` | ABSENT | Not eligible — noise not loopable |
| `animatableParams` | PASS | `animatableParams: []` moved inside `animation` block |
| Preset format | PASS | `{ name, values: {...} }` wrapper added v1.1.0 |
| State on SCRIPT_CONFIG | NON-STANDARD | `_points`, `_lastParams` on config |
| Raw P5 colour values | NON-STANDARD | `background(255)`, `stroke(0)` |
| `animation.loopFrames` conflict | PASS | `loopFrames` removed from animation block; type set to `infinite` |
| Noise time not looping | PASS | Accepted as by design; type changed to `infinite`; GIF disabled |
| Canvas size hardcoded | PASS | `_buildPoints` now receives `p.width`/`p.height` |

---

## v4 Review (2026-04-23)

### Reference Capability Table

| cap_id | kind | name | evidence | notes |
|---|---|---|---|---|
| R-01 | behaviour | grid point field construction | reference/generators/order-disorder/source/order-disorder.gen.js:105-121 | seeded point metadata |
| R-02 | behaviour | rotating influence alpha field | reference/generators/order-disorder/source/order-disorder.gen.js:129-160 | bean-shaped zone |
| R-03 | behaviour | noise displacement + ordered lerp | reference/generators/order-disorder/source/order-disorder.gen.js:185-208 | disorder/order blend |
| R-04 | behaviour | boundary jiggle | reference/generators/order-disorder/source/order-disorder.gen.js:200-205 | transition-only jiggle |
| R-05 | param | full control surface | reference/generators/order-disorder/source/order-disorder.gen.js:22-63 | grid/noise/influence/animation |
| R-06 | interaction | presets + animation metadata | reference/generators/order-disorder/source/order-disorder.gen.js:61-92 | 3 presets + loop animation |

### Function Coverage Map

| unit_id | unit_kind | name | lines | mapped_to |
|---|---|---|---|---|
| F-01 | method | _buildPoints | 105-121 | R-01 |
| F-02 | method | _normalizeAngle | 123-127 | R-02 |
| F-03 | method | _getAlpha | 129-160 | R-02 |
| F-04 | method | p5Draw | 169-208 | R-03, R-04 |
| F-05 | top-level-stmt | parameters block | 22-63 | R-05 |
| F-06 | top-level-stmt | presets/animation block | 61-92 | R-06 |

### Live Capability Table

| cap_id | kind | name | evidence | notes |
|---|---|---|---|---|
| L-01 | behaviour | grid point field construction | assets/js/tools/generators/scripts/pattern/order-disorder.gen.js:156-171 | dynamic canvas-size aware |
| L-02 | behaviour | rotating influence alpha field | assets/js/tools/generators/scripts/pattern/order-disorder.gen.js:179-210 | bean-shaped zone |
| L-03 | behaviour | noise displacement + ordered lerp | assets/js/tools/generators/scripts/pattern/order-disorder.gen.js:239-252 | disorder/order blend |
| L-04 | behaviour | boundary jiggle | assets/js/tools/generators/scripts/pattern/order-disorder.gen.js:253-258 | transition-only jiggle |
| L-05 | param | full control surface | assets/js/tools/generators/scripts/pattern/order-disorder.gen.js:27-64 | same 16 controls |
| L-06 | interaction | presets + animation metadata | assets/js/tools/generators/scripts/pattern/order-disorder.gen.js:66-108 | preset wrapper + infinite animation |

### Diff Table

| cap_id | ref_name | live_match | status | live_evidence | flow_divergence | decision | severity |
|---|---|---|---|---|---|---|---|
| R-01 | grid construction | L-01 | present | order-disorder.gen.js:156-171 | dynamic W/H support added | none | — |
| R-02 | alpha field | L-02 | present | order-disorder.gen.js:179-210 | same model, center now runtime | none | — |
| R-03 | displacement + lerp | L-03 | present | order-disorder.gen.js:239-252 | point batching via POINTS shape | none | — |
| R-04 | boundary jiggle | L-04 | present | order-disorder.gen.js:253-258 | same transition model | none | — |
| R-05 | parameter surface | L-05 | present | order-disorder.gen.js:27-64 | unchanged controls | none | — |
| R-06 | presets + animation | L-06 | present | order-disorder.gen.js:66-108 | animation switched to infinite for correctness | none | — |

### Library Hygiene Report

**Check 1 — Shared algorithm imports**
- Imports found: none from `assets/js/shared/*`
- Inlined reusable candidates: alpha-field computation and noise-driven displacement helpers

**Check 2 — Foundation usage**
- AnimationFoundation: no raw RAF/interval APIs
- GPUFoundation: no raw GPU APIs

**Check 3 — BaseComponent / MathematicalFoundation**
- BaseComponent: procedural SCRIPT_CONFIG module
- MathematicalFoundation: geometry/layout maths inlined

**Check 4 — State scope smells**
- mutable SCRIPT_CONFIG-held state (`_points`, `_lastParams`)

**Issues logged:** ARCH-019

### Performance Tier Audit

**Primary workload:** particle/p5  
**Workload size estimate:** O(N points) with multiple p.noise() evaluations per point

**Tier 1 (RAF coalesce):** implicit via host  
**Tier 2 (Adaptive resolution):** absent (grid-count bound workload)  
**Tier 3 (Worker offload):** absent (p5 constraints)  
**Tier 4 (GPU):** absent

**Issues logged:** PERF-009

### v4 issues logged

- ARCH-019, PERF-009, DOC-027, DOC-028

### v4 questions queued

- none (order-disorder turn)
