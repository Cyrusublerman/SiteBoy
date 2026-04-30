# Generative Pattern — Feature Parity


## Core Algorithm

| Feature | Spec | Live | Status |
|---|---|---|---|
| Hybrid point distribution | ✓ | ✓ | PASS — GEO-023; jittered grid with noise weight field |
| Proximity graph construction | ✓ | ✓ | PASS — GEO-024; axisBias, arcQuantisation, maxDegree |
| Gray-Scott reaction-diffusion solver | ✓ | ✓ | PASS — PHYS-005; graph Laplacian; v-field modulates SDF weights |
| Distance transform (JFA) | ✓ | ✗ | PARTIAL — brute-force 80×80 rasterised SDF with bbox culling; JFA not implemented |
| Truchet tile rendering | ✓ | ✓ | PASS — PAT-010; marching-squares corner classification; 400 tiles |
| Blob/inflated-union rendering | ✓ | ✓ | PASS — PAT-011; threshold-based inflated union on warped SDF |
| Nested contours rendering | ✓ | ✓ | PASS — PAT-012; marching squares at multiple iso-levels |
| Global contours rendering | ✓ | ✓ | PASS — PAT-012 global variant; iso-levels spaced across full SDF range |
| Flow field animation | ✓ | ✓ | PASS — ANIM-012; hash-noise UV warp, warped SDF cache per frame |

## Parameters

| Parameter | Spec | Live | Status |
|---|---|---|---|
| density | ✓ | ✓ | PASS |
| gridStrength | ✓ | ✓ | PASS |
| clusterScale | ✓ | ✓ | PASS |
| jitter | ✓ | ✓ | PASS |
| connectionRadius | ✓ | ✓ | PASS |
| maxDegree | ✓ | ✓ | PASS |
| axisBias | ✓ | ✓ | PASS |
| arcQuantisation | ✓ | ✓ | PASS |
| Du, Dv, feedRate, killRate | ✓ | ✓ | PASS |
| iterations | ✓ | ✓ | PASS |
| renderMode | ✓ | ✓ | PASS |
| weightScale, tileWindowSize, boundaryCost | ✓ | ✓ | PASS |
| flowSpeed, noiseFrequency | ✓ | ✓ | PASS |
| complexity | not in spec | ✗ | N/A — removed (was stub, unused) |

## Summary

8 of 9 specified features implemented. Distance transform is brute-force SDF (not JFA). All 17 spec parameters present. 4 presets. Animation type: infinite (non-loopable warp). GIF/WebM disabled.

---

## v4 Review (2026-04-23)

### Reference Capability Table

| cap_id | kind | name | evidence | notes |
|---|---|---|---|---|
| R-01 | behaviour | placeholder black fill draw | reference/generators/generative-pattern/source/generative-pattern.gen.js:16-19 | stub implementation |
| R-02 | param | single complexity slider | reference/generators/generative-pattern/source/generative-pattern.gen.js:11-14 | stub param contract |
| R-03 | metadata | minimal script config | reference/generators/generative-pattern/source/generative-pattern.gen.js:6-15 | no animation/export/presets |

### Function Coverage Map

| unit_id | unit_kind | name | lines | mapped_to |
|---|---|---|---|---|
| F-01 | method | draw (inline lambda) | 16-19 | R-01 |
| F-02 | top-level-stmt | parameters block | 11-14 | R-02 |
| F-03 | top-level-stmt | SCRIPT_CONFIG skeleton | 6-15 | R-03 |

### Live Capability Table

| cap_id | kind | name | evidence | notes |
|---|---|---|---|---|
| L-01 | behaviour | hybrid point distribution + graph + SDF pipeline | assets/js/tools/generators/scripts/pattern/generative-pattern.gen.js:301-396 | full geometry pipeline |
| L-02 | behaviour | optional Gray-Scott evolution | assets/js/tools/generators/scripts/pattern/generative-pattern.gen.js:62-69 | evolution controls present |
| L-03 | render-mode | Blob/Truchet/Nested/Global contour modes | assets/js/tools/generators/scripts/pattern/generative-pattern.gen.js:72-79 | 4 render modes |
| L-04 | interaction | rich parameter groups | assets/js/tools/generators/scripts/pattern/generative-pattern.gen.js:42-87 | 18 active params |
| L-05 | interaction | presets + animation/export metadata | assets/js/tools/generators/scripts/pattern/generative-pattern.gen.js:89-138 | 4 presets + infinite anim |

### Diff Table

| cap_id | ref_name | live_match | status | live_evidence | flow_divergence | decision | severity |
|---|---|---|---|---|---|---|---|
| R-01 | placeholder black fill draw | — | diverged | pattern/generative-pattern.gen.js full pipeline | reference is stub, live is full implementation | log GEN | P1 |
| R-02 | single complexity slider | L-04 | diverged | pattern/generative-pattern.gen.js:42-87 | live replaced stub control with full param model | log GEN | P1 |
| R-03 | minimal script config | L-05 | diverged | pattern/generative-pattern.gen.js:89-138 | live adds presets/animation/export/info sections | log GEN | P1 |

### Library Hygiene Report

**Check 1 — Shared algorithm imports**
- Imports found: none from `assets/js/shared/*`
- Inlined reusable candidates: graph/SDF/noise helper routines

**Check 2 — Foundation usage**
- AnimationFoundation: no raw RAF/interval APIs
- GPUFoundation: no raw GPU APIs

**Check 3 — BaseComponent / MathematicalFoundation**
- BaseComponent: procedural SCRIPT_CONFIG module
- MathematicalFoundation: geometry/layout maths inlined

**Check 4 — State scope smells**
- mutable script state caches on config (`_points`, `_edges`, `_sdf`, `_offImg`, `_rngState`)

**Issues logged:** ARCH-016

### Performance Tier Audit

**Primary workload:** sdf + p5 draw  
**Workload size estimate:** rebuild-heavy setup + per-frame warped SDF lookup/render

**Tier 1 (RAF coalesce):** implicit via host  
**Tier 2 (Adaptive resolution):** not adopted (fixed SDF grid path)  
**Tier 3 (Worker offload):** absent  
**Tier 4 (GPU):** absent

**Issues logged:** PERF-006

### v4 issues logged

- GEN-013, GEN-014, GEN-015, ARCH-016, PERF-006, DOC-021, DOC-022

### v4 questions queued

- none (generative-pattern turn)
