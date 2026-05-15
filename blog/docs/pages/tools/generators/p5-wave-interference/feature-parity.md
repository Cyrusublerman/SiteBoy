# Wave Interference (P5) — Feature Parity

No legacy specification or audit exists. Assessment is internal consistency and standards compliance only.

## Implemented Features

| feature | status | notes |
|---|---|---|
| 4-source perimeter orbit | PASS | deterministic, frame-based |
| scalar wave superposition | PASS | `_sumHeight` across pair |
| surface normal via finite difference | PASS | `_calcNormal`, delta=1 |
| angular-difference colour mapping | PASS | 6 angles → R, G, B |
| hue shift by total wave height | PASS | `_hueShift` applied |
| reference vector triangle traversal | PASS | 10 loops/cycle |
| pixel-buffer rendering | PASS | `loadPixels`/`updatePixels` |
| resolution block scaling | PASS | block-fill pixel replication |
| 3 presets | PASS | Classic, High Freq, Low Detail |

## Standards Compliance

| check | status | notes |
|---|---|---|
| preset format `{ name, values }` | PASS | standard format adopted |
| `animatableParams` declared | PASS | `['amplitude', 'speed', 'frequency']` |
| export options declared | PASS | `png: true, gif: true, webm: false` |
| `animation.loopFrames` fixed; no conflicting param | PASS | `cycleFrames` param removed |
| state via local vars not `SCRIPT_CONFIG` | PASS | only methods on SCRIPT_CONFIG |
| canvas size dynamic (not hardcoded) | PASS | `_perimeter` removed; `2*(W+H)` computed in p5Draw |
| CSS variable colours | N/A | pixel buffer (not CSS colours) |

## Architecture Notes

- Generator is deterministic — no `Math.random()`. Pre-render compatible.
- No accumulated state; each frame computed fresh from `frame` and `params`.
- Ref-atan2 values cached per-frame, not per-pixel.

---

## v4 Review (2026-04-23)

### Reference Capability Table

| cap_id | kind | name | evidence | notes |
|---|---|---|---|---|
| R-01 | behaviour | four-source perimeter orbit | reference/generators/p5-wave-interference/source/p5-wave-interference.gen.js:88-93 | source orbit model |
| R-02 | behaviour | wave superposition and normal estimation | reference/generators/p5-wave-interference/source/p5-wave-interference.gen.js:115-134 | `_waveHeight`, `_sumHeight`, `_calcNormal` |
| R-03 | behaviour | angular-difference RGB mapping | reference/generators/p5-wave-interference/source/p5-wave-interference.gen.js:146-159 | `_deltaToRGB` |
| R-04 | behaviour | hue shift by wave height | reference/generators/p5-wave-interference/source/p5-wave-interference.gen.js:161-192 | `_hueShift` |
| R-05 | render-mode | p5 pixel buffer block renderer | reference/generators/p5-wave-interference/source/p5-wave-interference.gen.js:199-241 | `loadPixels/updatePixels` |
| R-06 | param | wave/source/render controls | reference/generators/p5-wave-interference/source/p5-wave-interference.gen.js:23-47 | includes cycleFrames slider |
| R-07 | interaction | presets | reference/generators/p5-wave-interference/source/p5-wave-interference.gen.js:50-69 | flat preset format |
| R-08 | interaction | loop animation metadata | reference/generators/p5-wave-interference/source/p5-wave-interference.gen.js:71 | loopFrames/cycleFrames coupling |

### Function Coverage Map

| unit_id | unit_kind | name | lines | mapped_to |
|---|---|---|---|---|
| F-01 | method | _perimeterToXY | 80-86 | R-01 |
| F-02 | method | _getSourcePos | 88-93 | R-01 |
| F-03 | method | _waveHeight | 115-119 | R-02 |
| F-04 | method | _sumHeight | 121-123 | R-02 |
| F-05 | method | _calcNormal | 125-134 | R-02 |
| F-06 | method | _deltaToRGB | 146-159 | R-03 |
| F-07 | method | _hueShift | 161-192 | R-04 |
| F-08 | method | p5Draw | 199-241 | R-05 |
| F-09 | top-level-stmt | parameters/presets/animation | 23-71 | R-06, R-07, R-08 |

### Live Capability Table

| cap_id | kind | name | evidence | notes |
|---|---|---|---|---|
| L-01 | behaviour | four-source perimeter orbit | assets/js/tools/generators/scripts/wave/p5-wave-interference.gen.js:135-141 | dynamic perimeter |
| L-02 | behaviour | wave superposition and normal estimation | assets/js/tools/generators/scripts/wave/p5-wave-interference.gen.js:163-182 | unchanged core model |
| L-03 | behaviour | angular-difference RGB mapping | assets/js/tools/generators/scripts/wave/p5-wave-interference.gen.js:196-209 | ref atan cache input |
| L-04 | behaviour | hue shift by wave height | assets/js/tools/generators/scripts/wave/p5-wave-interference.gen.js:211-241 | unchanged core model |
| L-05 | render-mode | p5 pixel buffer block renderer | assets/js/tools/generators/scripts/wave/p5-wave-interference.gen.js:248-294 | `loadPixels/updatePixels` |
| L-06 | param | wave/source/render controls | assets/js/tools/generators/scripts/wave/p5-wave-interference.gen.js:29-53 | cycleFrames removed |
| L-07 | interaction | presets | assets/js/tools/generators/scripts/wave/p5-wave-interference.gen.js:55-80 | `{name, values}` format |
| L-08 | interaction | loop animation metadata | assets/js/tools/generators/scripts/wave/p5-wave-interference.gen.js:82-85 | animatableParams + sequencer |

### Diff Table

| cap_id | ref_name | live_match | status | live_evidence | flow_divergence | decision | severity |
|---|---|---|---|---|---|---|---|
| R-01 | four-source perimeter orbit | L-01 | present | p5-wave-interference.gen.js:135-141 | perimeter now derived from W/H each frame | none | — |
| R-02 | wave superposition/normal estimation | L-02 | present | p5-wave-interference.gen.js:163-182 | — | none | — |
| R-03 | angular-difference RGB mapping | L-03 | present | p5-wave-interference.gen.js:196-209 | ref atan values cached per-frame | none | — |
| R-04 | hue shift | L-04 | present | p5-wave-interference.gen.js:211-241 | — | none | — |
| R-05 | p5 pixel renderer | L-05 | present | p5-wave-interference.gen.js:248-294 | — | none | — |
| R-06 | parameter controls | L-06 | partial | p5-wave-interference.gen.js:29-53 | `cycleFrames` removed to resolve loop conflict | log GEN | P2 |
| R-07 | presets | L-07 | present | p5-wave-interference.gen.js:55-80 | standardised `{name, values}` | none | — |
| R-08 | loop animation metadata | L-08 | present | p5-wave-interference.gen.js:82-85 | animatableParams + sequencer added | none | — |

### Library Hygiene Report

**Check 1 — Shared algorithm imports**
- Imports found: none from `assets/js/shared/*`
- Inlined reusable candidates: vector-angle colour mapping and finite-difference normal pipeline

**Check 2 — Foundation usage**
- AnimationFoundation: no raw RAF/interval APIs
- GPUFoundation: no raw GPU APIs

**Check 3 — BaseComponent / MathematicalFoundation**
- BaseComponent: procedural SCRIPT_CONFIG module
- MathematicalFoundation: geometry/layout maths inlined in p5 methods

**Check 4 — State scope smells**
- no mutable module-level runtime state; SCRIPT_CONFIG method-only model

**Issues logged:** ARCH-014

### Performance Tier Audit

**Primary workload:** per-pixel  
**Workload size estimate:** O((W/resolution)×(H/resolution)) with heavy trig/sqrt per effective pixel

**Tier 1 (RAF coalesce):** implicit via host  
**Tier 2 (Adaptive resolution):** adopted via compute hints  
**Tier 3 (Worker offload):** not adopted  
**Tier 4 (GPU):** not adopted

**Issues logged:** PERF-004

### v4 issues logged

- GEN-012, ARCH-014, PERF-004, DOC-017, DOC-018

### v4 questions queued

- none (p5-wave-interference turn)
