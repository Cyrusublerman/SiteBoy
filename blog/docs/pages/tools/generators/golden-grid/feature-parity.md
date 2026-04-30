# Golden Grid — Feature Parity

## Source Reference

- Live: `assets/js/tools/generators/scripts/pattern/golden-grid.gen.js` v2.0.0
- Legacy spec: none (Phase 3 — source-only analysis)
- Origin: port of `pulsing_recursive_grid` sketch (noted in file header)

No legacy specification. Parity analysis is internal self-consistency and standards compliance.

## Implemented Features

| Feature | Status | Notes |
|---|---|---|
| Golden ratio recursive subdivision | PASS | Alternating vertical/horizontal at each depth |
| Animated ratio oscillation between P_SMALL and P_BIG | PASS | `PHI^sin(2πt)` formula |
| Flip alternation to prevent corner collapse | PASS | `flipped` flag propagated |
| Log-normalised colour from proportions | PASS | `_logNorm` applied per channel |
| Hue sawtooth animation | PASS | `(wNorm + t×hueSpeed) % 1` |
| Saturation triangle-wave animation | PASS | Correct triangle formula |
| Lightness triangle-wave animation | PASS | Area proportion as input |
| `maxDepth` control | PASS | 4–16, step 1 |
| `loopFrames` control | PASS | Affects time `t` and loop period |
| `hueSpeed`, `satSpeed`, `lumSpeed` controls | PASS | All three animate independently |
| P5 HSL [0,1] colour mode | PASS | `colorMode(HSL, 1, 1, 1)` |
| `noSmooth()` crisp aliasing | PASS | Set in `p5Setup` |

## Standards Compliance Gaps

| Aspect | Status | Notes |
|---|---|---|
| Export block | PASS | `png: true, gif: true, webm: false` added v2.0.0 |
| `canPrerender` | PASS | `canPrerender: true` declared in animation block |
| `animatableParams` | PASS | `animatableParams: ['hueSpeed', 'satSpeed', 'lumSpeed']` declared |
| Preset format | PASS | `{ name, values: {...} }` wrapper added v2.0.0 |
| State on SCRIPT_CONFIG (dead `_normBounds`) | PASS | `_normBounds` removed; live state (`_cachedBounds`, `_lastMaxDepth`) used correctly |
| `animation.loopFrames` conflict | PASS | Getter syncs from `params.loopFrames` every frame |
| `_getRatio` redundant per-node calls | PASS | Ratio computed once in `p5Draw`, passed to `_subdivide` |

---

## v4 Review (2026-04-23)

### Reference Capability Table

| cap_id | kind | name | evidence | notes |
|---|---|---|---|---|
| R-01 | behaviour | golden-ratio recursive subdivision | reference/generators/golden-grid/source/golden-grid.gen.js:127-170 | `_subdivide` recursion |
| R-02 | behaviour | frame-driven oscillating split ratio | reference/generators/golden-grid/source/golden-grid.gen.js:118-122 | `_getRatio` |
| R-03 | behaviour | proportion-based HSL colour mapping | reference/generators/golden-grid/source/golden-grid.gen.js:131-149 | log-normalised channels |
| R-04 | param | subdivision + animation parameters | reference/generators/golden-grid/source/golden-grid.gen.js:31-87 | 5 controls |
| R-05 | interaction | presets + loop animation block | reference/generators/golden-grid/source/golden-grid.gen.js:89-100 | classic/deep/shallow/static |

### Function Coverage Map

| unit_id | unit_kind | name | lines | mapped_to |
|---|---|---|---|---|
| F-01 | method | _logNorm | 108-113 | R-03 |
| F-02 | method | _getRatio | 118-122 | R-02 |
| F-03 | method | _subdivide | 127-170 | R-01, R-03 |
| F-04 | method | p5Setup | 175-195 | R-04 |
| F-05 | method | p5Draw | 200-216 | R-02, R-03 |
| F-06 | top-level-stmt | parameters/presets/animation | 31-100 | R-04, R-05 |

### Live Capability Table

| cap_id | kind | name | evidence | notes |
|---|---|---|---|---|
| L-01 | behaviour | golden-ratio recursive subdivision | assets/js/tools/generators/scripts/pattern/golden-grid.gen.js:112-146 | `_subdivide` recursion |
| L-02 | behaviour | frame-driven oscillating split ratio | assets/js/tools/generators/scripts/pattern/golden-grid.gen.js:171-174 | ratio computed once/frame |
| L-03 | behaviour | proportion-based HSL colour mapping | assets/js/tools/generators/scripts/pattern/golden-grid.gen.js:114-126 | log-normalised channels |
| L-04 | param | subdivision + animation parameters | assets/js/tools/generators/scripts/pattern/golden-grid.gen.js:28-44 | same 5 controls |
| L-05 | interaction | presets + loop animation block | assets/js/tools/generators/scripts/pattern/golden-grid.gen.js:46-64 | standard preset wrapper + loop getter |

### Diff Table

| cap_id | ref_name | live_match | status | live_evidence | flow_divergence | decision | severity |
|---|---|---|---|---|---|---|---|
| R-01 | recursive subdivision | L-01 | present | golden-grid.gen.js:112-146 | — | none | — |
| R-02 | oscillating split ratio | L-02 | present | golden-grid.gen.js:171-174 | moved to per-frame cache | none | — |
| R-03 | HSL mapping | L-03 | present | golden-grid.gen.js:114-126 | unchanged model | none | — |
| R-04 | parameter set | L-04 | present | golden-grid.gen.js:28-44 | — | none | — |
| R-05 | presets + animation | L-05 | present | golden-grid.gen.js:46-64 | standard preset shape + live loopFrames getter | none | — |

### Library Hygiene Report

**Check 1 — Shared algorithm imports**
- Imports found: none from `assets/js/shared/*`
- Inlined reusable candidate: recursive subdivision and log-normalisation helpers

**Check 2 — Foundation usage**
- AnimationFoundation: no raw RAF/interval APIs
- GPUFoundation: no raw GPU APIs

**Check 3 — BaseComponent / MathematicalFoundation**
- BaseComponent: procedural SCRIPT_CONFIG module
- MathematicalFoundation: geometry/layout maths inlined

**Check 4 — State scope smells**
- small config-held cache state (`_cachedBounds`, `_lastMaxDepth`, `_liveLoopFrames`)

**Issues logged:** ARCH-018

### Performance Tier Audit

**Primary workload:** p5 recursive draw  
**Workload size estimate:** O(2^maxDepth) rect calls per frame

**Tier 1 (RAF coalesce):** implicit via host  
**Tier 2 (Adaptive resolution):** absent  
**Tier 3 (Worker offload):** absent  
**Tier 4 (GPU):** absent

**Issues logged:** PERF-008

### v4 issues logged

- ARCH-018, PERF-008, DOC-025, DOC-026

### v4 questions queued

- none (golden-grid turn)
