# Squares — Feature Parity

## Source Reference

- Live: `assets/js/tools/generators/scripts/other/squares.gen.js` v2.1.0
- Legacy spec: `reference/generators/squares/legacy-docs/squares.md`
- Audit: `reference/generators/squares/legacy-docs/squares-audit.md`

Audit verdict: "Complete — all patterns, transitions, effects, and timeline from reference implemented."

## Feature Comparison

| Feature | Status | Notes |
|---|---|---|
| 50×50 grid (2500 tiles) | PASS | Default; configurable 20–80 |
| 7 base patterns | PASS | All implemented as pure functions |
| 5 transition types | PASS | All implemented |
| 6 effect types | PASS | All 7 (including `none`) implemented |
| 240-second timeline (15 phases) | PASS | Timeline array complete and accurate |
| `gridSize` slider | PASS | 20–80, step 5 |
| `speed` slider | PASS | 0.5–3 |
| `seek` scrubber | PASS | Wired in v2.1.0: `t = (frame/60)*speed + seek` |
| Play/Pause control | PASS | Host transport |
| Keyboard controls (Space, R, H) | DROP | Not implemented; host transport covers play/pause intent |
| Info/phase display overlay | PARTIAL | Host may surface phase name via status |
| Info hide toggle | DROP | Not implemented; showInfo parameter covers the intent |
| Export (PNG, GIF, WebM, sequence) | PASS | All four enabled in `export` block |
| Pre-render support (`canPrerender`) | PASS | Flag set; `frame` parameter correct |

## Parameters

| key | Spec | Live | Status |
|---|---|---|---|
| `gridSize` | slider 10–100 | slider 20–80 | PARTIAL (narrower range) |
| `speed` | slider 0.5–2 | slider 0.5–3 | PARTIAL (wider range) |
| `seek` | slider 0–240 | slider 0–240, wired | PASS |
| `canvasWidth` | not in spec | removed in v2.1.0 | REMOVED |
| `canvasHeight` | not in spec | removed in v2.1.0 | REMOVED |

## Summary

Core animation content achieves full parity. `seek` scrubber wired in v2.1.0. Keyboard controls and info toggle remain the two outstanding gaps. The `gridSize` range was narrowed (min 20 vs spec 10) and speed range widened (max 3 vs spec 2), both minor divergences. `canvasWidth`/`canvasHeight` inert parameters removed in v2.1.0.

---

## v4 Review (2026-04-23)

### Reference Capability Table

| cap_id | kind | name | evidence | notes |
|---|---|---|---|---|
| R-01 | behaviour | spiral-path and timeline-driven illusion engine | reference/generators/squares/source/squares.gen.js:36-55,272-347 | 15-phase choreography |
| R-02 | behaviour | pattern and transition libraries | reference/generators/squares/source/squares.gen.js:68-175 | 7 patterns + 5 transitions |
| R-03 | behaviour | effect library and tile transform pipeline | reference/generators/squares/source/squares.gen.js:181-266,349-373 | 6 effects + draw card |
| R-04 | behaviour | grid renderer and frame-time progression | reference/generators/squares/source/squares.gen.js:379-421 | per-frame grid draw |
| R-05 | param | grid/timeline/canvas controls | reference/generators/squares/source/squares.gen.js:480-542 | gridSize, speed, seek, canvas dims |
| R-06 | interaction | loop/export/preset metadata | reference/generators/squares/source/squares.gen.js:441-478 | loop + prerender + exports |

### Function Coverage Map

| unit_id | unit_kind | name | lines | mapped_to |
|---|---|---|---|---|
| F-01 | function | easeIn | 24-24 | R-03 |
| F-02 | function | easeOut | 25-25 | R-03 |
| F-03 | function | easeInOut | 26-28 | R-03 |
| F-04 | function | hash | 30-34 | R-02 |
| F-05 | function | generateSpiral | 36-55 | R-01 |
| F-06 | function | envelope | 57-62 | R-03 |
| F-07 | function | getFlipState | 85-112 | R-02 |
| F-08 | function | getCurrentState | 296-323 | R-01 |
| F-09 | function | getTileState | 325-347 | R-01, R-02, R-03 |
| F-10 | function | drawCard | 349-373 | R-03 |
| F-11 | function | draw | 379-421 | R-04 |
| F-12 | top-level-stmt | SCRIPT_CONFIG object | 427-545 | R-05, R-06 |

### Live Capability Table

| cap_id | kind | name | evidence | notes |
|---|---|---|---|---|
| L-01 | behaviour | spiral-path and timeline-driven illusion engine | assets/js/tools/generators/scripts/other/squares.gen.js:36-55,272-347 | same choreography |
| L-02 | behaviour | pattern and transition libraries | assets/js/tools/generators/scripts/other/squares.gen.js:68-175 | same set |
| L-03 | behaviour | effect library and tile transform pipeline | assets/js/tools/generators/scripts/other/squares.gen.js:181-266,349-373 | same set |
| L-04 | behaviour | grid renderer and frame-time progression | assets/js/tools/generators/scripts/other/squares.gen.js:379-421 | same renderer |
| L-05 | param | grid/timeline/canvas controls | assets/js/tools/generators/scripts/other/squares.gen.js:480-542 | includes inert seek/canvas controls |
| L-06 | interaction | loop/export/preset metadata | assets/js/tools/generators/scripts/other/squares.gen.js:441-478 | same metadata |

### Diff Table

| cap_id | ref_name | live_match | status | live_evidence | flow_divergence | decision | severity |
|---|---|---|---|---|---|---|---|
| R-01 | timeline engine | L-01 | present | squares.gen.js:36-55,272-347 | none | none | — |
| R-02 | pattern/transition libs | L-02 | present | squares.gen.js:68-175 | none | none | — |
| R-03 | effects/tile transforms | L-03 | present | squares.gen.js:181-266,349-373 | none | none | — |
| R-04 | renderer/time path | L-04 | present | squares.gen.js:379-421 | none | none | — |
| R-05 | parameter surface | L-05 | present | squares.gen.js:480-542 | seek/canvas params remain inert in host context | fix code | P2 |
| R-06 | loop/export/presets | L-06 | present | squares.gen.js:441-478 | none | none | — |

### Library Hygiene Report

**Check 1 — Shared algorithm imports**
- Imports found: none from `assets/js/shared/*`
- Logic remains fully inlined in generator module

**Check 2 — Foundation usage**
- AnimationFoundation: no raw RAF/interval APIs
- GPUFoundation: no raw GPU APIs

**Check 3 — BaseComponent / MathematicalFoundation**
- BaseComponent: procedural SCRIPT_CONFIG module
- MathematicalFoundation: grid/layout maths inlined

**Check 4 — State scope smells**
- module-level mutable state (`time`, `GRID`, `spiralPath`)

**Issues logged:** ARCH-025

### Performance Tier Audit

**Primary workload:** per-tile 2D draw with timeline transforms  
**Hotspot:** `spiralUnwind` transition does linear lookup of tile index through full spiral path

**Tier 1 (RAF coalesce):** implicit via host  
**Tier 2 (Adaptive resolution):** absent  
**Tier 3 (Worker offload):** n/a for canvas 2D vector path  
**Tier 4 (GPU):** n/a

**Issues logged:** PERF-014

### v4 issues logged

- ARCH-025, PERF-014, DOC-039, DOC-040

### v4 questions queued

- none (squares turn)
