# Wave Colour — Feature Parity

## Source Reference

- Live: `assets/js/tools/generators/scripts/wave/p5-wave-colour.gen.js` v1.1.0
- Legacy spec: none (Phase 3 — source-only analysis)
- Origin: port of `Wave_interference_colour` sketch

No legacy specification. Parity analysis is internal self-consistency and standards compliance.

## Implemented Features

| Feature | Status | Notes |
|---|---|---|
| Complex-number wave field | PASS | `_Complex` class with polar form |
| 4 perimeter-orbiting sources | PASS | CW/CCW with configurable loop counts |
| 8 complex operators | PASS | add, multiply, power, rotate, mobius, fold, spiral, beat |
| Operator family classification | PASS | smooth/harsh/warp families |
| Deterministic operator evolution | PASS | Wang-hash PRNG `_seededRand`; seed = index×100000 + transitionCount |
| Polar lerp between operators | PASS | `_lerpPolar` with log magnitude |
| `smootherstep` easing | PASS | 5th-order |
| Surface normal estimation | PASS | 3-point forward-difference; centreHeight reused from colour pass |
| Phase-based hue mapping | PASS | Relative to reference vector |
| Magnitude-driven lightness | PASS | Exponential mapping |
| Normal-dotted saturation | PASS | |
| Rotating reference vector | PASS | Triangle traversal, 10 cycles/loop |
| Pixel buffer rendering | PASS | `loadPixels/updatePixels` |
| Block resolution scaling | PASS | 1–6 pixel block size |
| 14 parameters | PASS | All active |

## Standards Compliance

| Aspect | Status | Notes |
|---|---|---|
| Export block | PASS | `png: true, gif: true, webm: false` |
| `animatableParams` | PASS | Declared in `animation` block |
| Preset format `{ name, values }` | PASS | Standard format |
| State on SCRIPT_CONFIG | NON-STANDARD | `_opStates`, `_lastOpSpeeds` on config |
| Determinism | PASS | Operator evolution uses seeded Wang-hash PRNG |
| `animation.loopFrames` sync | PASS | p5Setup sets `this.animation.loopFrames = params.cycleFrames` |

---

## v4 Review (2026-04-23)

### Reference Capability Table

| cap_id | kind | name | evidence | notes |
|---|---|---|---|---|
| R-01 | behaviour | complex wave state model | reference/generators/p5-wave-colour/source/p5-wave-colour.gen.js:18-67 | `_Complex`, `_Vector3`, `_WaveOps` |
| R-02 | behaviour | orbiting four-source wave field | reference/generators/p5-wave-colour/source/p5-wave-colour.gen.js:193-213 | `_srcPos`, `_wave` |
| R-03 | behaviour | operator-evolving process pipeline | reference/generators/p5-wave-colour/source/p5-wave-colour.gen.js:215-227 | `_process` |
| R-04 | behaviour | normal-based colour mapping | reference/generators/p5-wave-colour/source/p5-wave-colour.gen.js:233-247 | `_normalAt`, `_toColor` |
| R-05 | render-mode | p5 pixel-buffer render loop | reference/generators/p5-wave-colour/source/p5-wave-colour.gen.js:269-313 | block renderer |
| R-06 | param | wave/source/operator/render controls | reference/generators/p5-wave-colour/source/p5-wave-colour.gen.js:115-150 | includes cycleFrames |
| R-07 | interaction | preset set | reference/generators/p5-wave-colour/source/p5-wave-colour.gen.js:152-174 | flat preset format |
| R-08 | interaction | loop animation contract | reference/generators/p5-wave-colour/source/p5-wave-colour.gen.js:176 | loopFrames fixed in config |

### Function Coverage Map

| unit_id | unit_kind | name | lines | mapped_to |
|---|---|---|---|---|
| F-01 | class-method | _WaveOps.get | 63-67 | R-01 |
| F-02 | function | _pickNextOp | 74-80 | R-03 |
| F-03 | method | _srcPos | 193-198 | R-02 |
| F-04 | method | _wave | 209-213 | R-02 |
| F-05 | method | _process | 215-227 | R-03 |
| F-06 | method | _normalAt | 233-240 | R-04 |
| F-07 | method | _toColor | 242-247 | R-04 |
| F-08 | method | p5Draw | 269-313 | R-05 |
| F-09 | top-level-stmt | parameters/presets/animation | 115-176 | R-06, R-07, R-08 |

### Live Capability Table

| cap_id | kind | name | evidence | notes |
|---|---|---|---|---|
| L-01 | behaviour | complex wave state model | assets/js/tools/generators/scripts/wave/p5-wave-colour.gen.js:14-109 | deterministic operator picker |
| L-02 | behaviour | orbiting four-source wave field | assets/js/tools/generators/scripts/wave/p5-wave-colour.gen.js:246-266 | same source model |
| L-03 | behaviour | operator-evolving process pipeline | assets/js/tools/generators/scripts/wave/p5-wave-colour.gen.js:268-280 | deterministic transitions |
| L-04 | behaviour | normal-based colour mapping | assets/js/tools/generators/scripts/wave/p5-wave-colour.gen.js:286-301 | cached centreHeight path |
| L-05 | render-mode | p5 pixel-buffer render loop | assets/js/tools/generators/scripts/wave/p5-wave-colour.gen.js:331-394 | block renderer |
| L-06 | param | wave/source/operator/render controls | assets/js/tools/generators/scripts/wave/p5-wave-colour.gen.js:155-190 | cycleFrames retained |
| L-07 | interaction | preset set | assets/js/tools/generators/scripts/wave/p5-wave-colour.gen.js:192-220 | `{name, values}` format |
| L-08 | interaction | loop animation contract | assets/js/tools/generators/scripts/wave/p5-wave-colour.gen.js:222-229 | loopFrames synced to cycleFrames in setup |

### Diff Table

| cap_id | ref_name | live_match | status | live_evidence | flow_divergence | decision | severity |
|---|---|---|---|---|---|---|---|
| R-01 | complex wave model | L-01 | present | p5-wave-colour.gen.js:14-109 | deterministic seeded op picker added | none | — |
| R-02 | four-source wave field | L-02 | present | p5-wave-colour.gen.js:246-266 | — | none | — |
| R-03 | operator process pipeline | L-03 | present | p5-wave-colour.gen.js:268-280 | transition seeds tracked per operator | none | — |
| R-04 | normal colour mapping | L-04 | present | p5-wave-colour.gen.js:286-301 | forward-difference optimisation with centreHeight reuse | none | — |
| R-05 | p5 render loop | L-05 | present | p5-wave-colour.gen.js:331-394 | — | none | — |
| R-06 | parameter controls | L-06 | present | p5-wave-colour.gen.js:155-190 | cycleFrames marked recomputeOnChange | none | — |
| R-07 | presets | L-07 | present | p5-wave-colour.gen.js:192-220 | standardised preset wrapper | none | — |
| R-08 | loop animation contract | L-08 | present | p5-wave-colour.gen.js:324-328 | setup synchronises loopFrames to cycleFrames | none | — |

### Library Hygiene Report

**Check 1 — Shared algorithm imports**
- Imports found: none from `assets/js/shared/*`
- Inlined reusable candidates: complex operator family pipeline and deterministic transition helpers

**Check 2 — Foundation usage**
- AnimationFoundation: no raw RAF/interval APIs
- GPUFoundation: no raw GPU APIs

**Check 3 — BaseComponent / MathematicalFoundation**
- BaseComponent: procedural SCRIPT_CONFIG module
- MathematicalFoundation: geometry and coordinate maths inlined in p5 methods

**Check 4 — State scope smells**
- Mutable state on SCRIPT_CONFIG (`_opStates`, `_lastOpSpeeds`) retained

**Issues logged:** ARCH-015

### Performance Tier Audit

**Primary workload:** per-pixel  
**Workload size estimate:** heavy p5 pixel loop with multi-op complex pipeline per effective pixel

**Tier 1 (RAF coalesce):** implicit via host  
**Tier 2 (Adaptive resolution):** adopted (`compute.interactionScale`)  
**Tier 3 (Worker offload):** absent  
**Tier 4 (GPU):** absent

**Issues logged:** PERF-005

### v4 issues logged

- ARCH-015, PERF-005, DOC-019, DOC-020

### v4 questions queued

- none (p5-wave-colour turn)
