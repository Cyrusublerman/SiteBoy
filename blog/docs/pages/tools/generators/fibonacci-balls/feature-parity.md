# Fibonacci Balls — Feature Parity

## Source Reference

- Live: `assets/js/tools/generators/scripts/physics/fibonacci-balls.gen.js` v1.1.0
- Legacy spec: none (Phase 3 — source-only analysis)
- Origin: "Based on Fib_balls sketch" (per file header JSDoc)

No legacy specification exists to compare against. Parity analysis is limited to internal self-consistency and standards compliance.

## Implemented Features

| Feature | Status | Notes |
|---|---|---|
| Fibonacci circle packing | PASS | Front-chain algorithm with fallback |
| Inner bouncing balls | PASS | One inner ball per outer where F[i-1] exists |
| HSL colour shift on collision | PASS | Hue, saturation, lightness all modified |
| Inner ball colour shift on wall bounce | PASS | Angle + speed + position factors |
| Trail rendering | PASS | Both outer and inner balls |
| Multi-pass collision separation | PASS | Configurable 1–16 passes |
| Impulse velocity resolution | PASS | Mass = r², restitution, damping |
| Wall bounce | PASS | Hard boundary with restitution |
| `velocityGrowth` chaos with speed cap | PASS | Cap at `canvasSize × 0.3` added v1.1.0; inner cap at `max(parent.r − inner.r, 1)` |
| P5.js HSL colour mode | PASS | Set in `p5Setup` |
| Rebuild on config change | PASS | `_cfgKey` guards `fibIndexForCanvas`/`maxFibIndex` |

## Standards Compliance Gaps (no parity reference)

| Aspect | Status | Notes |
|---|---|---|
| Export block | PASS | `png: true, gif: false, webm: false` added v1.1.0 |
| `canPrerender` | ABSENT | Infinite animation; appropriate |
| `animatableParams` | PASS | `animatableParams: []` declared inside `animation` block |
| Preset format | PASS | `{ name, values: {...} }` wrapper added v1.1.0 |
| State location | NON-STANDARD | `this.*` on SCRIPT_CONFIG; not inside class/component |
| CSS colour variables | ABSENT | P5 `background(0,0,8)` is raw HSL |

---

## v4 Review (2026-04-23)

### Reference Capability Table

| cap_id | kind | name | evidence | notes |
|---|---|---|---|---|
| R-01 | behaviour | Fibonacci-derived canvas and radius set | reference/generators/fibonacci-balls/source/fibonacci-balls.gen.js:268-283 | canvas and circle set rebuilt from sequence |
| R-02 | behaviour | front-chain packing with fallback placement | reference/generators/fibonacci-balls/source/fibonacci-balls.gen.js:53-113 | tangent pair placement + angular fallback |
| R-03 | behaviour | multi-pass rigid-body separation and impulse response | reference/generators/fibonacci-balls/source/fibonacci-balls.gen.js:228-259,399-415 | separation passes then velocity resolution |
| R-04 | behaviour | inner-ball bounded motion per parent circle | reference/generators/fibonacci-balls/source/fibonacci-balls.gen.js:308-334,417-420 | local coordinate bounce domain |
| R-05 | behaviour | collision and bounce HSL modulation | reference/generators/fibonacci-balls/source/fibonacci-balls.gen.js:208-226,326-333 | outer and inner colour transforms |
| R-06 | behaviour | outer and inner trail rendering | reference/generators/fibonacci-balls/source/fibonacci-balls.gen.js:336-362 | decay-weighted trail circles |
| R-07 | param | 14-parameter control surface | reference/generators/fibonacci-balls/source/fibonacci-balls.gen.js:128-163 | circles/physics/colour/trails groups |
| R-08 | interaction | preset and infinite animation surface | reference/generators/fibonacci-balls/source/fibonacci-balls.gen.js:165-193 | 3 presets + infinite animation metadata |

### Function Coverage Map

| unit_id | unit_kind | name | lines | mapped_to |
|---|---|---|---|---|
| F-01 | function | _fibSeq | 20-24 | R-01 |
| F-02 | function | _dist | 26-29 | R-02, R-03 |
| F-03 | function | _tangentToTwo | 31-40 | R-02 |
| F-04 | function | _overlapsAny | 42-47 | R-02 |
| F-05 | function | _inBounds | 49-51 | R-02 |
| F-06 | function | _packFrontChain | 53-113 | R-02 |
| F-07 | top-level-stmt | SCRIPT_CONFIG object | 119-425 | R-07, R-08 |
| F-08 | method | _cfgKey | 200-202 | R-01 |
| F-09 | method | _colorMod | 204-204 | R-05 |
| F-10 | method | _speed | 206-206 | R-03, R-05 |
| F-11 | method | _applyCollisionColor | 208-226 | R-05 |
| F-12 | method | _separate | 228-242 | R-03 |
| F-13 | method | _resolveVelocity | 244-259 | R-03 |
| F-14 | method | _bounceWalls | 261-266 | R-03 |
| F-15 | method | _buildCircles | 268-306 | R-01, R-04 |
| F-16 | method | _updateInner | 308-334 | R-04, R-05 |
| F-17 | method | _drawCircle | 336-362 | R-06 |
| F-18 | method | p5Setup | 364-373 | R-01, R-07 |
| F-19 | method | p5Draw | 375-424 | R-03, R-04, R-05, R-06 |

### Live Capability Table

| cap_id | kind | name | evidence | notes |
|---|---|---|---|---|
| L-01 | behaviour | Fibonacci-derived canvas and radius set | assets/js/tools/generators/scripts/physics/fibonacci-balls.gen.js:318-356 | same model |
| L-02 | behaviour | front-chain packing with fallback placement | assets/js/tools/generators/scripts/physics/fibonacci-balls.gen.js:53-113 | unchanged packing path |
| L-03 | behaviour | multi-pass rigid-body separation and impulse response | assets/js/tools/generators/scripts/physics/fibonacci-balls.gen.js:278-309,468-483 | same core model with caps |
| L-04 | behaviour | inner-ball bounded motion per parent circle | assets/js/tools/generators/scripts/physics/fibonacci-balls.gen.js:358-395,486-489 | same with inner speed cap |
| L-05 | behaviour | collision and bounce HSL modulation | assets/js/tools/generators/scripts/physics/fibonacci-balls.gen.js:258-276,387-394 | same transforms |
| L-06 | behaviour | outer and inner trail rendering | assets/js/tools/generators/scripts/physics/fibonacci-balls.gen.js:397-423 | same draw model |
| L-07 | param | 14-parameter control surface | assets/js/tools/generators/scripts/physics/fibonacci-balls.gen.js:165-200 | unchanged control surface |
| L-08 | interaction | preset and infinite animation surface | assets/js/tools/generators/scripts/physics/fibonacci-balls.gen.js:202-243 | wrapper presets + export metadata |

### Diff Table

| cap_id | ref_name | live_match | status | live_evidence | flow_divergence | decision | severity |
|---|---|---|---|---|---|---|---|
| R-01 | fib-derived domain | L-01 | present | fibonacci-balls.gen.js:318-356 | unchanged | none | — |
| R-02 | front-chain packing | L-02 | present | fibonacci-balls.gen.js:53-113 | unchanged | none | — |
| R-03 | collision pipeline | L-03 | present | fibonacci-balls.gen.js:278-309,468-483 | per-frame velocity cap added | none | — |
| R-04 | inner-ball dynamics | L-04 | present | fibonacci-balls.gen.js:358-395 | inner speed cap added | none | — |
| R-05 | HSL colour modulation | L-05 | present | fibonacci-balls.gen.js:258-276,387-394 | unchanged | none | — |
| R-06 | trail rendering | L-06 | present | fibonacci-balls.gen.js:397-423 | unchanged | none | — |
| R-07 | parameter surface | L-07 | present | fibonacci-balls.gen.js:165-200 | unchanged | none | — |
| R-08 | preset/animation metadata | L-08 | present | fibonacci-balls.gen.js:202-243 | standards metadata expanded | none | — |

### Library Hygiene Report

**Check 1 — Shared algorithm imports**
- Imports found: none from `assets/js/shared/*`
- Inlined reusable candidates: tangent placement, collision impulses, and colour transform helpers

**Check 2 — Foundation usage**
- AnimationFoundation: no raw RAF/interval APIs
- GPUFoundation: no raw GPU APIs

**Check 3 — BaseComponent / MathematicalFoundation**
- BaseComponent: procedural SCRIPT_CONFIG module
- MathematicalFoundation: geometry and layout maths inlined

**Check 4 — State scope smells**
- mutable SCRIPT_CONFIG-held state (`_circles`, `_canvasSize`, `_lastCfgKey`)

**Issues logged:** ARCH-022

### Performance Tier Audit

**Primary workload:** particle/p5  
**Workload size estimate:** O(collisionPasses * N^2) with small N; scales with selected Fibonacci set

**Tier 1 (RAF coalesce):** implicit via host  
**Tier 2 (Adaptive resolution):** absent  
**Tier 3 (Worker offload):** absent  
**Tier 4 (GPU):** absent

**Issues logged:** PERF-012

### v4 issues logged

- ARCH-022, PERF-012, DOC-033, DOC-034

### v4 questions queued

- none (fibonacci-balls turn)
