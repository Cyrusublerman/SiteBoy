# Tile Mosaic — Feature Parity


## Core Algorithm

| Feature | Spec | Live | Status |
|---|---|---|---|
| Rectilinear layout / rect packing | ✓ | ✓ | PASS — GEO-016; Uniform Grid, Packed Rects A/B shelf-first |
| Offscreen sprite cache | ✓ | ✓ | PASS — OffscreenCanvas per (type, w, h, colorIdx); Map-based |
| Tile types: Concentric | ✓ | ✓ | PASS — concentric arc rings |
| Tile types: Wedge | ✓ | ✓ | PASS — 6 pie sectors |
| Tile types: Stripe | ✓ | ✓ | PASS — 5 bands, horizontal or vertical |
| Tile types: Solid | ✓ | ✓ | PASS |
| Tile types: Texture | ✓ | ✓ | PASS — fBm noise multiply blend |
| Tile types: Micro | ✓ | ✓ | PASS — 10 fine bands |
| Pseudo-3D lighting | ✓ | ✓ | PASS — PAT-008; shadow + highlight linear gradients |
| Noise texture overlay | ✓ | ✓ | PASS — PAT-009; fBm 4-octave noise; multiply composite |
| Morph Layouts animation | ✓ | ✓ | PASS — ANIM-008; lerp between two seeded layouts |
| Breathing animation | ✓ | ✓ | PASS — ANIM-009; sinusoidal tile scale |
| Texture Drift animation | ✓ | ✓ | PASS — ANIM-010; scrolling noise overlay |
| Palette system | ✓ | ✓ | PASS — 6 palettes × 8 HSL slots; per-tile variance |

## Parameters

| Parameter | Spec | Live | Status |
|---|---|---|---|
| gridColumns, gridRows | ✓ | ✓ | PASS |
| tileSize | ✓ | ✓ | PASS |
| layoutMode | ✓ | ✓ | PASS |
| tileTypes | ✓ | ✓ | PASS — multi-select toggle |
| randomSeed | ✓ | ✓ | PASS |
| animationMode, animationSpeed | ✓ | ✓ | PASS |
| paletteSelection, paletteVariance | ✓ | ✓ | PASS |
| depthStrength, highlightIntensity, globalLightAngle | ✓ | ✓ | PASS |
| textureStrength, overlayMode | ✓ | ✓ | PASS |

## Summary

14 of 14 specified features implemented. All 14 parameters present. 5 presets. Canvas 800×800 (spec 900×900 not adopted; design decision documented). Animation type: infinite. GIF/WebM disabled.

---

## v4 Review (2026-04-23)

### Reference Capability Table

| cap_id | kind | name | evidence | notes |
|---|---|---|---|---|
| R-01 | behaviour | placeholder black fill draw | reference/generators/tile-mosaic/source/tile-mosaic.gen.js:16-19 | stub implementation |
| R-02 | param | single tileSize slider | reference/generators/tile-mosaic/source/tile-mosaic.gen.js:11-14 | stub param contract |
| R-03 | metadata | minimal script config | reference/generators/tile-mosaic/source/tile-mosaic.gen.js:6-15 | no animation/export/presets |

### Function Coverage Map

| unit_id | unit_kind | name | lines | mapped_to |
|---|---|---|---|---|
| F-01 | method | draw (inline lambda) | 16-19 | R-01 |
| F-02 | top-level-stmt | parameters block | 11-14 | R-02 |
| F-03 | top-level-stmt | SCRIPT_CONFIG skeleton | 6-15 | R-03 |

### Live Capability Table

| cap_id | kind | name | evidence | notes |
|---|---|---|---|---|
| L-01 | behaviour | tile layout/packing pipeline | assets/js/tools/generators/scripts/pattern/tile-mosaic.gen.js:244-296 | uniform + packed variants |
| L-02 | behaviour | sprite cache + tile render grammar | assets/js/tools/generators/scripts/pattern/tile-mosaic.gen.js:298-404 | 6 tile types |
| L-03 | behaviour | lighting + noise overlay compositing | assets/js/tools/generators/scripts/pattern/tile-mosaic.gen.js:405-520 | pseudo-3D + overlays |
| L-04 | interaction | animation modes | assets/js/tools/generators/scripts/pattern/tile-mosaic.gen.js:170-181 | Static/Breathing/Morph/Drift/All |
| L-05 | interaction | full control surface + presets | assets/js/tools/generators/scripts/pattern/tile-mosaic.gen.js:40-146 | 14 params + 5 presets |

### Diff Table

| cap_id | ref_name | live_match | status | live_evidence | flow_divergence | decision | severity |
|---|---|---|---|---|---|---|---|
| R-01 | placeholder black fill draw | — | diverged | pattern/tile-mosaic.gen.js full pipeline | reference is stub, live is full implementation | log GEN | P1 |
| R-02 | single tileSize slider | L-05 | diverged | pattern/tile-mosaic.gen.js:40-93 | live expands to full param suite | log GEN | P1 |
| R-03 | minimal script config | L-05 | diverged | pattern/tile-mosaic.gen.js:95-146 | live adds animation/export/presets/info sections | log GEN | P1 |

### Library Hygiene Report

**Check 1 — Shared algorithm imports**
- Imports found: none from `assets/js/shared/*`
- Inlined reusable candidates: rect packing, value-noise, and sprite grammar helpers

**Check 2 — Foundation usage**
- AnimationFoundation: no raw RAF/interval APIs
- GPUFoundation: no raw GPU APIs

**Check 3 — BaseComponent / MathematicalFoundation**
- BaseComponent: procedural SCRIPT_CONFIG module
- MathematicalFoundation: layout maths inlined

**Check 4 — State scope smells**
- mutable script caches on config (`_spriteCache`, `_noiseCanvas`, `_layoutA/B`, `_driftOffset`, etc.)

**Issues logged:** ARCH-017

### Performance Tier Audit

**Primary workload:** sprite-cache + p5 draw  
**Workload size estimate:** rebuild-heavy style/layout caching + per-frame sprite blits

**Tier 1 (RAF coalesce):** implicit via host  
**Tier 2 (Adaptive resolution):** not adopted  
**Tier 3 (Worker offload):** absent  
**Tier 4 (GPU):** absent

**Issues logged:** PERF-007

### v4 issues logged

- GEN-016, GEN-017, GEN-018, ARCH-017, PERF-007, DOC-023, DOC-024

### v4 questions queued

- none (tile-mosaic turn)
