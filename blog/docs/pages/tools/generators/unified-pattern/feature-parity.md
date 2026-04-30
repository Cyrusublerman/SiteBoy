# Unified Pattern — Feature Parity


## Core Algorithm

| Feature | Spec | Live | Status |
|---|---|---|---|
| Jittered grid cell distribution | ✓ | ✓ | PASS |
| Domain warp (noise deformation) | ✓ | ✓ | PASS |
| Superellipse SDF evaluation | ✓ | ✓ | PASS |
| Nested shapes (scaled repetition) | ✓ | ✓ | PASS |
| Smooth union (smooth-min) | ✓ | ✓ | PASS — numerically stable log-sum-exp form |
| Palette colour mapping | ✓ | ✓ | PASS |
| SDF pixel renderer | ✓ | ✓ | PASS — bounding-box spatial culling active |

## Parameters

| Parameter | Spec | Live | Status |
|---|---|---|---|
| gridSpacing, jitter | ✓ | ✓ | PASS |
| warpAmplitude, warpFrequency | ✓ | ✓ | PASS |
| occupancyThreshold | ✓ | ✓ | PASS |
| cornerExponent | ✓ | ✓ | PASS |
| aspectRatioMin, aspectRatioMax | ✓ | ✓ | PASS |
| nestingLevels, nestingRatio | ✓ | ✓ | PASS |
| blendRadius | ✓ | ✓ | PASS |
| palettePreset, paletteVariance | ✓ | ✓ | PASS |
| sizeMin, sizeMax | ✓ | ✓ | PASS |
| scale | not in spec | ✗ | N/A — removed (was stub, unused) |

## Summary

7 of 7 specified features implemented. 15 of 15 spec parameters present. 5 presets (Atomic, Op-Art, Organic, Minimal, Dense). Worker offload active. Canvas 800×800.

---

## v4 Review (2026-04-23)

### Reference Capability Table

| cap_id | kind | name | evidence | notes |
|---|---|---|---|---|
| R-01 | param | scale slider | reference/generators/unified-pattern/source/unified-pattern.gen.js:11-14 | only exposed control |
| R-02 | behaviour | black-canvas fill draw | reference/generators/unified-pattern/source/unified-pattern.gen.js:16-19 | no pattern synthesis |
| R-03 | interaction | static draw hook only | reference/generators/unified-pattern/source/unified-pattern.gen.js:16-20 | no animation/export/preset metadata |

### Function Coverage Map

| unit_id | unit_kind | name | lines | mapped_to |
|---|---|---|---|---|
| F-01 | top-level-stmt | SCRIPT_CONFIG object | 6-20 | R-01, R-02, R-03 |

### Live Capability Table

| cap_id | kind | name | evidence | notes |
|---|---|---|---|---|
| L-01 | behaviour | jittered-grid superellipse SDF pipeline | assets/js/tools/generators/scripts/other/unified-pattern.gen.js:85-191 | GEO-018..022 + renderer |
| L-02 | behaviour | worker compute path with adaptive interaction scale | assets/js/tools/generators/scripts/other/unified-pattern.gen.js:207-215,338-498 | Tier2 + Tier3 |
| L-03 | param | 15-parameter layout/shape/style surface | assets/js/tools/generators/scripts/other/unified-pattern.gen.js:259-290 | full control suite |
| L-04 | interaction | static generator preset/export surface | assets/js/tools/generators/scripts/other/unified-pattern.gen.js:292-328 | animation none + png export + 5 presets |

### Diff Table

| cap_id | ref_name | live_match | status | live_evidence | flow_divergence | decision | severity |
|---|---|---|---|---|---|---|---|
| R-01 | scale slider | L-03 | diverged | unified-pattern.gen.js:259-290 | stub param replaced by full control surface | user decision | P1 |
| R-02 | black-canvas draw | L-01 | diverged | unified-pattern.gen.js:85-191 | stub draw replaced by full SDF renderer | user decision | P1 |
| R-03 | static minimal hook | L-02, L-04 | diverged | unified-pattern.gen.js:207-215,292-328,338-498 | added worker compute, presets, export semantics | user decision | P1 |

### Library Hygiene Report

**Check 1 — Shared algorithm imports**
- Imports found: none from `assets/js/shared/*`
- Core geometry/noise/SDF algorithms are implemented inline in generator module

**Check 2 — Foundation usage**
- AnimationFoundation: static generator (`animation.type = none`)
- GPUFoundation: not used; CPU + worker path used

**Check 3 — BaseComponent / MathematicalFoundation**
- BaseComponent: procedural SCRIPT_CONFIG module
- MathematicalFoundation: geometry/layout maths inlined

**Check 4 — State scope smells**
- module-scope constant state (palettes, helpers); no mutable runtime state shared across frames

**Issues logged:** GEN-022, GEN-023, GEN-024, ARCH-026

### Performance Tier Audit

**Primary workload:** per-pixel SDF field evaluation  
**Tier status:** Tier 2 + Tier 3 adopted in live (`interactionScale`, worker `computePixels`)

**Issues logged:** none

### v4 issues logged

- GEN-022, GEN-023, GEN-024, ARCH-026, DOC-043, DOC-044

### v4 questions queued

- none (unified-pattern turn)
