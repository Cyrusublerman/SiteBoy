# Animated Lines — Feature Parity

## Source Reference

- Live: `assets/js/tools/generators/scripts/pattern/animated-lines.gen.js` v1.1.0
- Legacy spec: none (Phase 3 — source-only analysis)
- Origin: merged port of `lines.js` / `line_2_shape.js` (noted in file header)

No legacy specification. Parity analysis is internal self-consistency and standards compliance.

## Implemented Features

| Feature | Status | Notes |
|---|---|---|
| Lines → polygon morph animation | PASS | Full morphology via arc intermediate |
| All regular polygons triangle to maxSides | PASS | Steps n=3 to maxSides |
| Rotation accumulation totalling π | PASS | `scaleFactor` normalisation correct |
| Per-loop rotation increment of π | PASS | `baseRot = loopIndex × π` |
| Timeline rebuild on timing params | PASS | `_timelineKey` guard |
| Smoothstep easing on all transitions | PASS | `0.5 − 0.5 × cos(t × π)` |
| Area-preserving polygon radius | PASS | `adjR` calculation |
| Square vertex offset (45°) | PASS | `vOffset = −π/2 − π/4` for n=4 |
| Centroid correction each frame | PASS | `_centroid` applied |
| `strokeWeight` control | PASS | Applied via `p.strokeWeight` |
| `speed` control | PASS | Renamed from `fps`; range 0.5–2.0 multiplier |

## Standards Compliance Gaps

| Aspect | Status | Notes |
|---|---|---|
| Export block | PASS | `png: true, gif: false, webm: false` added v1.1.0 |
| `canPrerender` | ABSENT | Infinite animation; appropriate |
| `animatableParams` | PASS | `animatableParams: []` declared in animation block |
| Preset format | PASS | `{ name, values: {...} }` wrapper added v1.1.0 |
| State on SCRIPT_CONFIG | NON-STANDARD | `this._timeline` etc. on exported object |
| Raw P5 colour values | NON-STANDARD | `background(20)`, `stroke(255)` |
| `fps` label misleading | PASS | Renamed to `speed` (0.5–2.0 multiplier) v1.1.0 |

---

## v4 Review (2026-04-23)

### Reference Capability Table

| cap_id | kind | name | evidence | notes |
|---|---|---|---|---|
| R-01 | behaviour | timeline-driven morph lifecycle | reference/generators/animated-lines/source/animated-lines.gen.js:81-141 | hold/morph/hold sequencing |
| R-02 | behaviour | line/arc/polygon shape builders | reference/generators/animated-lines/source/animated-lines.gen.js:143-246 | three-stage geometry pipeline |
| R-03 | behaviour | polygon-step interpolation | reference/generators/animated-lines/source/animated-lines.gen.js:248-253 | lerp between side counts |
| R-04 | behaviour | centroid normalisation and rotated render | reference/generators/animated-lines/source/animated-lines.gen.js:255-299 | centred world-space render |
| R-05 | param | shape/timing/style controls | reference/generators/animated-lines/source/animated-lines.gen.js:25-50 | 10 total controls |
| R-06 | interaction | presets + infinite animation | reference/generators/animated-lines/source/animated-lines.gen.js:53-75 | 3 presets |

### Function Coverage Map

| unit_id | unit_kind | name | lines | mapped_to |
|---|---|---|---|---|
| F-01 | method | _buildTimeline/_getState | 81-141 | R-01 |
| F-02 | method | _buildLines/_buildArcs/_buildPolygons/_buildShapes | 143-246 | R-02 |
| F-03 | method | _lerpShapes | 248-253 | R-03 |
| F-04 | method | _centroid/p5Draw | 255-299 | R-04 |
| F-05 | top-level-stmt | parameters block | 25-50 | R-05 |
| F-06 | top-level-stmt | presets/animation block | 53-75 | R-06 |

### Live Capability Table

| cap_id | kind | name | evidence | notes |
|---|---|---|---|---|
| L-01 | behaviour | timeline-driven morph lifecycle | assets/js/tools/generators/scripts/pattern/animated-lines.gen.js:142-207 | equivalent sequencing |
| L-02 | behaviour | line/arc/polygon shape builders | assets/js/tools/generators/scripts/pattern/animated-lines.gen.js:209-317 | added arc short-circuit |
| L-03 | behaviour | polygon-step interpolation | assets/js/tools/generators/scripts/pattern/animated-lines.gen.js:319-324 | equivalent lerp |
| L-04 | behaviour | centroid normalisation and rotated render | assets/js/tools/generators/scripts/pattern/animated-lines.gen.js:326-398 | cached centroid on holds |
| L-05 | param | shape/timing/style controls | assets/js/tools/generators/scripts/pattern/animated-lines.gen.js:62-88 | `fps` -> `speed` |
| L-06 | interaction | presets + infinite animation | assets/js/tools/generators/scripts/pattern/animated-lines.gen.js:90-123 | preset wrapper/export block |

### Diff Table

| cap_id | ref_name | live_match | status | live_evidence | flow_divergence | decision | severity |
|---|---|---|---|---|---|---|---|
| R-01 | timeline lifecycle | L-01 | present | animated-lines.gen.js:142-207 | identical core timeline logic | none | — |
| R-02 | geometry builders | L-02 | present | animated-lines.gen.js:209-317 | arc build skipped near-zero blend | none | — |
| R-03 | side lerp | L-03 | present | animated-lines.gen.js:319-324 | unchanged | none | — |
| R-04 | centroid + render | L-04 | present | animated-lines.gen.js:326-398 | centroid cache during holds | none | — |
| R-05 | parameter surface | L-05 | present | animated-lines.gen.js:62-88 | clearer speed semantics | none | — |
| R-06 | presets + animation | L-06 | present | animated-lines.gen.js:90-123 | standards metadata added | none | — |

### Library Hygiene Report

**Check 1 — Shared algorithm imports**
- Imports found: none from `assets/js/shared/*`
- Inlined reusable candidates: timeline interpolation and centroid geometry helpers

**Check 2 — Foundation usage**
- AnimationFoundation: no raw RAF/interval APIs
- GPUFoundation: no raw GPU APIs

**Check 3 — BaseComponent / MathematicalFoundation**
- BaseComponent: procedural SCRIPT_CONFIG module
- MathematicalFoundation: geometric maths is inlined

**Check 4 — State scope smells**
- mutable SCRIPT_CONFIG-held caches (`_timeline*`, `_shapes*`, `_centroid*`)

**Issues logged:** ARCH-020

### Performance Tier Audit

**Primary workload:** geometric/p5  
**Workload size estimate:** O(lineCount * resolution), increased during polygon morph segments

**Tier 1 (RAF coalesce):** implicit via host  
**Tier 2 (Adaptive resolution):** absent  
**Tier 3 (Worker offload):** absent  
**Tier 4 (GPU):** absent

**Issues logged:** PERF-010

### v4 issues logged

- ARCH-020, PERF-010, DOC-029, DOC-030

### v4 questions queued

- none (animated-lines turn)
