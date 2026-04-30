# Harmonics — Feature Parity

## Core Features

| Feature | Spec (lissajous.md harmonics section) | Live | Status |
|---|---|---|---|
| 13 musical intervals (unison → octave) | ✓ | ✓ | PASS |
| 4 view modes | ✓ | ✓ (lateralClosed, counterCurrent, lateralOpen, concurrent) | PASS |
| Time warp at harmonic ratios | ✓ | ✓ (double-smoothstep) | PASS |
| 90 s pass × 8 passes = 720 s cycle | ✓ | ✓ (configurable) | PASS |
| Motion blur (partial clear) | ✓ | ✓ | PASS |
| Ratio display during animation | ✓ | ✗ | DROP — host status bar not available in gen.js format; on-canvas label outside scope |
| Pre-render support for export | ✓ (onRenderFrame) | ✓ (canPrerender: true) | PASS |

## Parameters

| Parameter | Spec | Live | Status |
|---|---|---|---|
| motionBlur | ✓ | ✓ | PASS |
| passDuration | not in original spec | ✓ | NEW |
| points | not in spec | ✓ | NEW |
| pointSize | not in spec | ✓ | NEW |
| Speed control | recommended (audit) | ✓ (host Speed slider) | PASS |
| Play/pause | recommended (audit) | ✓ (host transport controls) | PASS |

## Rendering

| Feature | Spec | Live | Status |
|---|---|---|---|
| Particle scatter rendering | ✓ | ✓ | PASS |
| View cross-fade interpolation | ✓ | ✓ | PASS |
| Interval ratio interpolation | ✓ | ✓ | PASS |

## Animation Format

| Feature | Spec | Live | Status |
|---|---|---|---|
| `type: 'loop'` | ✓ | ✓ | PASS |
| `canPrerender: true` | — | ✓ | PASS |
| `animatableParams: []` | — | ✓ | PASS |
| Frame-based timing | ✓ | PASS | resolved — `elapsed = frame / fps`; wall-clock timing removed |

---

## v4 Review (2026-04-23)

### Reference Capability Table

| cap_id | kind | name | evidence | notes |
|---|---|---|---|---|
| R-01 | param | motionBlur | reference/generators/harmonics/source/harmonics.gen.js:166-174 | display trail decay |
| R-02 | param | points | reference/generators/harmonics/source/harmonics.gen.js:176-183 | particle count |
| R-03 | param | pointSize | reference/generators/harmonics/source/harmonics.gen.js:185-193 | particle radius |
| R-04 | param | passDuration | reference/generators/harmonics/source/harmonics.gen.js:199-207 | pass duration seconds |
| R-05 | param | canvasWidth | reference/generators/harmonics/source/harmonics.gen.js:214-221 | canvas width slider |
| R-06 | param | canvasHeight | reference/generators/harmonics/source/harmonics.gen.js:223-230 | canvas height slider |
| R-07 | behaviour | harmonic time warp | reference/generators/harmonics/source/harmonics.gen.js:32-43 | double smoothstep |
| R-08 | behaviour | coordinate projection solver | reference/generators/harmonics/source/harmonics.gen.js:45-85 | 4-mode coordinate mapping |
| R-09 | render-mode | lateralClosed | reference/generators/harmonics/source/harmonics.gen.js:60-64 | view branch |
| R-10 | render-mode | counterCurrent | reference/generators/harmonics/source/harmonics.gen.js:74-80 | view branch |
| R-11 | render-mode | lateralOpen | reference/generators/harmonics/source/harmonics.gen.js:54-58 | view branch |
| R-12 | render-mode | concurrent | reference/generators/harmonics/source/harmonics.gen.js:66-72 | view branch |
| R-13 | behaviour | pass/cycle state computation | reference/generators/harmonics/source/harmonics.gen.js:251-277 | pass index, ascent/descent, interpolation |
| R-14 | behaviour | trail compositor | reference/generators/harmonics/source/harmonics.gen.js:286-290 | rgba motion blur clear |
| R-15 | behaviour | particle renderer | reference/generators/harmonics/source/harmonics.gen.js:304-316 | point scatter draw |
| R-16 | behaviour | lifecycle initialisation hook | reference/generators/harmonics/source/harmonics.gen.js:236-240 | onInit sets timing vars |
| R-17 | export | png/gif/webm/sequence export hooks | reference/generators/harmonics/source/harmonics.gen.js:112-118 | export capabilities declared |

### Function Coverage Map

| unit_id | unit_kind | name | lines | mapped_to |
|---|---|---|---|---|
| F-01 | function | timeWarp | 32-43 | R-07 |
| F-02 | function | getCoordinates | 45-85 | R-08, R-09, R-10, R-11, R-12 |
| F-03 | method | onInit | 236-240 | R-16 |
| F-04 | method | onParamChange | 242-247 | R-04 |
| F-05 | method | draw | 250-317 | R-13, R-14, R-15 |
| F-06 | top-level-stmt | intervals constant | 14-28 | R-13 |
| F-07 | top-level-stmt | views constant | 30 | R-09, R-10, R-11, R-12 |
| F-08 | top-level-stmt | export config declaration | 112-118 | R-17 |

### Live Capability Table

| cap_id | kind | name | evidence | notes |
|---|---|---|---|---|
| L-01 | param | motionBlur | assets/js/tools/generators/scripts/parametric/harmonics.gen.js:159-167 | matches R-01 |
| L-02 | param | points | assets/js/tools/generators/scripts/parametric/harmonics.gen.js:169-176 | matches R-02 |
| L-03 | param | pointSize | assets/js/tools/generators/scripts/parametric/harmonics.gen.js:178-186 | matches R-03 |
| L-04 | param | passDuration | assets/js/tools/generators/scripts/parametric/harmonics.gen.js:193-200 | matches R-04 |
| L-05 | behaviour | harmonic time warp | assets/js/tools/generators/scripts/parametric/harmonics.gen.js:13-21 | frame-derived easing |
| L-06 | behaviour | coordinate projection solver | assets/js/tools/generators/scripts/parametric/harmonics.gen.js:23-45 | 4-mode coordinate mapping |
| L-07 | render-mode | lateralClosed | assets/js/tools/generators/scripts/parametric/harmonics.gen.js:30-31 | view branch |
| L-08 | render-mode | counterCurrent | assets/js/tools/generators/scripts/parametric/harmonics.gen.js:37-41 | view branch |
| L-09 | render-mode | lateralOpen | assets/js/tools/generators/scripts/parametric/harmonics.gen.js:28-29 | view branch |
| L-10 | render-mode | concurrent | assets/js/tools/generators/scripts/parametric/harmonics.gen.js:32-36 | view branch |
| L-11 | behaviour | pass/cycle state computation | assets/js/tools/generators/scripts/parametric/harmonics.gen.js:213-240 | frame-based cycle math |
| L-12 | behaviour | trail + particle renderer | assets/js/tools/generators/scripts/parametric/harmonics.gen.js:242-290 | batched rendering |
| L-13 | export | png/gif/webm/sequence export hooks | assets/js/tools/generators/scripts/parametric/harmonics.gen.js:72-78 | matches R-17 |

### Diff Table

| cap_id | ref_name | live_match | status | live_evidence | flow_divergence | decision | severity |
|---|---|---|---|---|---|---|---|
| R-01 | motionBlur | L-01 | present | harmonics.gen.js:159-167 | — | none | — |
| R-02 | points | L-02 | present | harmonics.gen.js:169-176 | — | none | — |
| R-03 | pointSize | L-03 | present | harmonics.gen.js:178-186 | — | none | — |
| R-04 | passDuration | L-04 | present | harmonics.gen.js:193-200 | — | none | — |
| R-05 | canvasWidth | — | absent | — | reference has param, live removed Canvas group | log GEN | P1 |
| R-06 | canvasHeight | — | absent | — | reference has param, live removed Canvas group | log GEN | P1 |
| R-07 | harmonic time warp | L-05 | present | harmonics.gen.js:13-21 | — | none | — |
| R-08 | coordinate projection solver | L-06 | present | harmonics.gen.js:23-45 | — | none | — |
| R-09 | lateralClosed | L-07 | present | harmonics.gen.js:30-31 | — | none | — |
| R-10 | counterCurrent | L-08 | present | harmonics.gen.js:37-41 | — | none | — |
| R-11 | lateralOpen | L-09 | present | harmonics.gen.js:28-29 | — | none | — |
| R-12 | concurrent | L-10 | present | harmonics.gen.js:32-36 | — | none | — |
| R-13 | pass/cycle state computation | L-11 | present | harmonics.gen.js:213-240 | frame-based timing replaces wall clock | none | — |
| R-14 | trail compositor | L-12 | present | harmonics.gen.js:242-247 | alpha compositing implementation changed | none | — |
| R-15 | particle renderer | L-12 | present | harmonics.gen.js:263-289 | fillRect+batched-arc optimisation | none | — |
| R-16 | lifecycle initialisation hook | L-11 | diverged | harmonics.gen.js:205-214 | onInit removed; draw derives timing from frame | log GEN | P2 |
| R-17 | export hooks | L-13 | present | harmonics.gen.js:72-78 | — | none | — |

### Library Hygiene Report

**Check 1 — Shared algorithm imports**
- Imports found: none
- Algorithms inlined that have shared modules: harmonic interpolation and coordinate transforms inlined (candidate shared/core + shared/physics usage)
- Algorithms inlined where no shared module exists: none confirmed in this turn

**Check 2 — Foundation usage**
- AnimationFoundation: no direct RAF or interval usage in file (host-driven loop)
- GPUFoundation: N/A — no GPU path

**Check 3 — BaseComponent / MathematicalFoundation**
- BaseComponent: does not extend BaseComponent (procedural SCRIPT_CONFIG module)
- MathematicalFoundation: layout math inlined (`w/2`, `h/2`, `min(w,h)` scaling)

**Check 4 — State scope smells**
- Module-scope mutable state: none in live source

**Issues logged:** ARCH-003, ARCH-004

### Performance Tier Audit

**Primary workload:** per-particle  
**Workload size estimate:** up to ~3000 points/frame, trigonometric per-point evaluation

**Tier 1 (RAF coalesce):** implicit via host  
**Tier 2 (Adaptive resolution):** n/a (not a per-pixel workload)  
**Tier 3 (Worker offload):** n/a (not using computePixels path)  
**Tier 4 (GPU):** n/a (parallel width below per-pixel candidate pattern)

**Documented mitigations:**
- `performance.md` still claims wall-clock timing risk; live source is frame-derived (`draw(..., frame)`), so mitigation note is stale (logged as DOC issue).

**Shader hygiene:** not applicable — no shaders

**Issues logged:** none

### v4 issues logged

- GEN-002, GEN-003, GEN-004, ARCH-003, ARCH-004, DOC-001, DOC-002, DOC-003

### v4 questions queued

- none (harmonics turn)
