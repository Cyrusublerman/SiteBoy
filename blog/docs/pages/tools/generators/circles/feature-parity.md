# Circles — Feature Parity

## Core Features

| Feature | Legacy spec | Live | Status |
|---|---|---|---|
| N nested circles with decreasing radii | ✓ | ✓ | PASS |
| Chain of orbits (parent-child hierarchy) | ✓ | ✓ | PASS |
| Lines mode (outline + radius line) | ✓ | ✓ | PASS |
| B/W mode (alternating fill) | ✓ | ✓ | PASS |
| Gradient mode (alpha depth) | ✓ | ✓ | PASS |
| 3600-frame loop | ✓ | ✓ (configurable) | PASS |
| Circle count slider | ✓ (recommended) | ✓ | PASS |
| Cycle frames slider | ✓ (recommended) | ✓ | PASS |
| Play/pause | ✓ (recommended) | ✓ (host transport controls) | PASS |
| Outer radius slider | ✓ (recommended) | ✗ | DROP — canvas-relative sizing is the design; absolute slider out of scope |
| Line width slider | ✓ (recommended) | ✗ | DROP — cosmetic; not in core feature set |
| Colour customisation | ✓ (recommended) | ✗ | DROP — canvas output colours; can be revisited as enhancement |
| Frame export / pre-render | ✓ | ✓ (sequence export) | PASS |

## Parameters

| Parameter | Spec | Live | Status |
|---|---|---|---|
| displayMode (radio: Lines/B/W/Gradient) | ✓ | ✓ | PASS |
| circleCount (10–200) | ✓ | ✓ | PASS |
| cycleFrames (600–7200) | ✓ | ✓ | PASS |
| largestRadius (100–400) | ✓ | ✗ | FAIL |
| lineWidth | recommended | ✗ | FAIL |
| strokeColor | recommended | ✗ | FAIL |

## Standards Compliance

| Check | Status | Notes |
|---|---|---|
| Module-level mutable state | PASS | resolved — closure via IIFE |
| animatableParams declared | PASS | resolved — `animatableParams: []` |
| console.log removed | PASS | resolved |
| Canvas resize rebuild | PASS | resolved — `_prevW`/`_prevH` tracking |
| displayMode undefined guard | PASS | resolved — `(params.displayMode \|\| 'lines').toLowerCase()` |
| rgba() in gradient mode | PASS | Canvas output is exempt from CSS variable constraint per design-law §6.2 |
| loopFrames static vs cycleFrames dynamic | OPEN | documented; loopFrames not updated when cycleFrames changes |

---

## v4 Review (2026-04-23)

### Reference Capability Table

| cap_id | kind | name | evidence | notes |
|---|---|---|---|---|
| R-01 | behaviour | nested circle chain construction | reference/generators/circles/source/circles.gen.js:22-34 | radii derived from canvas size and count |
| R-02 | behaviour | parent-child orbit transform pipeline | reference/generators/circles/source/circles.gen.js:54-78 | rigid-arm orbital chain |
| R-03 | render-mode | lines mode (radius spoke + outline) | reference/generators/circles/source/circles.gen.js:83-109 | per-circle stroke + spoke |
| R-04 | render-mode | B/W alternating fill mode | reference/generators/circles/source/circles.gen.js:109-120 | reverse-order alternating fill |
| R-05 | render-mode | gradient alpha-depth fill mode | reference/generators/circles/source/circles.gen.js:120-132 | depth alpha decay |
| R-06 | param | display and animation controls | reference/generators/circles/source/circles.gen.js:152-187 | displayMode, circleCount, cycleFrames |
| R-07 | interaction | loop animation and export surface | reference/generators/circles/source/circles.gen.js:190-204 | loop + png/gif/webm/sequence |

### Function Coverage Map

| unit_id | unit_kind | name | lines | mapped_to |
|---|---|---|---|---|
| F-01 | function | initCircles | 22-34 | R-01 |
| F-02 | function | draw | 39-133 | R-02, R-03, R-04, R-05 |
| F-03 | top-level-stmt | SCRIPT_CONFIG object | 138-204 | R-06, R-07 |

### Live Capability Table

| cap_id | kind | name | evidence | notes |
|---|---|---|---|---|
| L-01 | behaviour | nested circle chain construction | assets/js/tools/generators/scripts/other/circles.gen.js:23-36 | closure-scoped state |
| L-02 | behaviour | parent-child orbit transform pipeline | assets/js/tools/generators/scripts/other/circles.gen.js:51-67 | cached trig values |
| L-03 | render-mode | lines mode (radius spoke + outline) | assets/js/tools/generators/scripts/other/circles.gen.js:70-83 | batched path stroke |
| L-04 | render-mode | B/W alternating fill mode | assets/js/tools/generators/scripts/other/circles.gen.js:83-90 | reverse-order alternating fill |
| L-05 | render-mode | gradient alpha-depth fill mode | assets/js/tools/generators/scripts/other/circles.gen.js:90-98 | depth alpha decay |
| L-06 | param | display and animation controls | assets/js/tools/generators/scripts/other/circles.gen.js:152-188 | same 3 controls |
| L-07 | interaction | loop animation and export surface | assets/js/tools/generators/scripts/other/circles.gen.js:190-207 | added anim/export metadata |

### Diff Table

| cap_id | ref_name | live_match | status | live_evidence | flow_divergence | decision | severity |
|---|---|---|---|---|---|---|---|
| R-01 | chain construction | L-01 | present | circles.gen.js:23-36 | closure state replaces module globals | none | — |
| R-02 | orbit transforms | L-02 | present | circles.gen.js:51-67 | per-frame trig cached once | none | — |
| R-03 | lines mode | L-03 | present | circles.gen.js:70-83 | draw calls batched into one path | none | — |
| R-04 | B/W mode | L-04 | present | circles.gen.js:83-90 | unchanged | none | — |
| R-05 | gradient mode | L-05 | present | circles.gen.js:90-98 | unchanged | none | — |
| R-06 | parameter surface | L-06 | present | circles.gen.js:152-188 | unchanged | none | — |
| R-07 | animation/export surface | L-07 | present | circles.gen.js:190-207 | standards metadata expanded | none | — |

### Library Hygiene Report

**Check 1 — Shared algorithm imports**
- Imports found: `../../shared/evaluation.js` (`TWO_PI`) only
- No imports from `assets/js/shared/*`

**Check 2 — Foundation usage**
- AnimationFoundation: no raw RAF/interval APIs
- GPUFoundation: no raw GPU APIs

**Check 3 — BaseComponent / MathematicalFoundation**
- BaseComponent: procedural SCRIPT_CONFIG module
- MathematicalFoundation: inlined radius/layout calculations

**Check 4 — State scope smells**
- module state moved into closure (improved), still non-BaseComponent architecture

**Issues logged:** ARCH-023

### Performance Tier Audit

**Primary workload:** lightweight 2D canvas  
**Workload size estimate:** O(circleCount), bounded and low

**Tier 1 (RAF coalesce):** implicit via host  
**Tier 2 (Adaptive resolution):** n/a  
**Tier 3 (Worker offload):** n/a  
**Tier 4 (GPU):** n/a

**Issues logged:** PERF-013

### v4 issues logged

- ARCH-023, PERF-013, DOC-035, DOC-036

### v4 questions queued

- none (circles turn)
