# Wave Interference — Feature Parity


## Core Computation

| Feature | Spec | Live | Status |
|---|---|---|---|
| R(r) component with 2 terms | ✓ | ✓ | PASS |
| X(x) component with 2 terms | ✓ | ✓ | PASS |
| Y(y) component with 2 terms | ✓ | ✓ | PASS |
| R/X/Y modulation term | ✓ | ✓ (implementation differs — see Issues) | PARTIAL |
| safePow function | ✓ | ✓ | PASS |
| Sum blend mode | ✓ | ✓ | PASS |
| Multiply blend mode | ✓ | ✓ | PASS |
| Rotation of coordinate space | ✓ | ✓ | PASS |
| Scale (zoom) | ✓ | ✓ | PASS |
| Per-pixel ImageData rendering | ✓ (CPU fallback) | ✓ | PASS |

## Output Mode

| Feature | Spec | Live | Status |
|---|---|---|---|
| Binary black/white thresholding | ✓ (sign-based: value > 0 → white) | ✗ (intentional divergence — continuous greyscale) | FAIL |
| Greyscale normalised output | Not spec'd | ✓ | DIVERGE |
| WebGL GPU rendering | ✓ (primary path) | ✗ (not implemented; worker path provided instead) | FAIL |
| CPU ImageData fallback | ✓ (secondary) | ✓ (only path) | PASS |

## UI Controls — Parameters

| Parameter | Spec | Live | Status |
|---|---|---|---|
| Ar1, fr1, pr1, phiR1, Or1, waveR1 | ✓ | ✓ | PASS |
| Ar2, fr2, pr2, phiR2 | ✓ | ✓ | PASS |
| Or2, waveR2 | ✓ | ✓ | PASS — resolved; UI slots added |
| Mr, frm1, frm2 | ✓ | ✓ | PASS |
| prm1, prm2, phiRm1, phiRm2 | ✓ | ✓ | PASS — resolved; UI slots added |
| Ax1, fx1, px1, phiX1 | ✓ | ✓ | PASS |
| Ox1, waveX1 | ✓ | ✓ | PASS — resolved; UI slots added |
| Ax2, fx2, px2, phiX2 | ✓ | ✓ | PASS |
| Ox2, waveX2 | ✓ | ✓ | PASS — resolved; UI slots added |
| Mx, fxm1, fxm2 | ✓ | ✓ | PASS |
| pxm1, pxm2, phiXm1, phiXm2 | ✓ | ✓ | PASS — resolved; UI slots added |
| Ay1, fy1, py1, phiY1 | ✓ | ✓ | PASS |
| Oy1, waveY1 | ✓ | ✓ | PASS — resolved; UI slots added |
| Ay2, fy2, py2, phiY2 | ✓ | ✓ | PASS |
| Oy2, waveY2 | ✓ | ✓ | PASS — resolved; UI slots added |
| My, fym1, fym2 | ✓ | ✓ | PASS |
| pym1, pym2, phiYm1, phiYm2 | ✓ | ✓ | PASS — resolved; UI slots added |
| scale | ✓ | ✓ | PASS |
| rotation | ✓ | ✓ | PASS |
| blendMode | ✓ | ✓ | PASS |
| canvasWidth / canvasHeight | Not in spec | removed | N/A — parameters removed |

## Modulation Formula

The live implementation's modulation formula differs from the legacy spec:

| Aspect | Spec | Live |
|---|---|---|
| Formula | `M · safePow(sin(frm1·r), prm1) · safePow(cos(frm2·r), prm2)` (product; sin × cos) | `M · (safePow(sin(frm1·r), prm1) + safePow(sin(frm2·r), prm2))` (sum; sin + sin) |
| Interaction | Multiplicative cross-modulation | Additive two-term modulation |

## Animation

| Feature | Spec | Live | Status |
|---|---|---|---|
| Phase animation (advance phi params) | ✓ | ✓ (animatableParams declared) | PASS |
| Per-parameter animation speed/direction | ✓ | ✗ | DROP — host speed slider covers global rate; per-param speed not in gen.js contract |
| Checkpoint save/load | ✓ | ✓ (sequencer: true; host-managed) | PASS |
| Sequence animation (interpolate checkpoints) | ✓ | ✓ (host SequencerV2; sequencer: true) | PASS |
| Loop toggle | ✓ | ✗ | DROP — not in gen.js lifecycle; host play/pause covers intent |
| canPrerender | Not spec'd | ✓ | NEW |

## Export

| Feature | Spec | Live | Status |
|---|---|---|---|
| PNG export | ✓ | ✓ | PASS |
| SVG export | ✓ | ✓ | PASS |
| GIF / WebM / sequence | Not spec'd | ✓ | NEW |

## Other

| Feature | Spec | Live | Status |
|---|---|---|---|
| 13 preset landmarks | ✓ | ✓ (13 LANDMARKS with full parameter maps) | PASS |
| Preset format (full parameter maps) | ✓ | PASS | resolved — `_DEFAULTS` spread ensures all presets are complete |
| Worker-based computation | Not spec'd | ✓ (computePixels, compute.worker) | NEW |
| 50% resolution during interaction | Not spec'd | ✓ (compute.interactionScale) | NEW |

---

## v4 Review (2026-04-23)

### Reference Capability Table

| cap_id | kind | name | evidence | notes |
|---|---|---|---|---|
| R-01 | behaviour | R/X/Y core wave components | reference/generators/wave-interference/source/wave-interference.gen.js:51-112 | computeR/computeX/computeY |
| R-02 | behaviour | signed-power transform | reference/generators/wave-interference/source/wave-interference.gen.js:42-45 | safePow |
| R-03 | behaviour | two-pass per-pixel normalised render | reference/generators/wave-interference/source/wave-interference.gen.js:136-187 | intensity + write pass |
| R-04 | behaviour | blend modes sum/multiply | reference/generators/wave-interference/source/wave-interference.gen.js:159-164 | blend selection |
| R-05 | param | full parameter block | reference/generators/wave-interference/source/wave-interference.gen.js:234-324 | includes legacy snake_case keys |
| R-06 | interaction | landmark presets | reference/generators/wave-interference/source/wave-interference.gen.js:22-36 | 13 presets |
| R-07 | interaction | animation metadata | reference/generators/wave-interference/source/wave-interference.gen.js:217-222 | parametric + animatable |
| R-08 | export | png/svg/gif/webm/sequence export | reference/generators/wave-interference/source/wave-interference.gen.js:224-230 | full export set |
| R-09 | behaviour | worker computePixels path | reference/generators/wave-interference/source/wave-interference.gen.js:340-436 | tier-3 worker |

### Function Coverage Map

| unit_id | unit_kind | name | lines | mapped_to |
|---|---|---|---|---|
| F-01 | function | safePow | 42-45 | R-02 |
| F-02 | function | waveFunc | 47-49 | R-01 |
| F-03 | function | computeR | 51-70 | R-01 |
| F-04 | function | computeX | 72-91 | R-01 |
| F-05 | function | computeY | 93-112 | R-01 |
| F-06 | function | draw | 118-187 | R-03, R-04 |
| F-07 | top-level-stmt | LANDMARKS definition | 22-36 | R-06 |
| F-08 | top-level-stmt | animation/export blocks | 217-230 | R-07, R-08 |
| F-09 | method | computePixels | 340-436 | R-09 |

### Live Capability Table

| cap_id | kind | name | evidence | notes |
|---|---|---|---|---|
| L-01 | behaviour | R/X/Y core wave components | assets/js/tools/generators/scripts/wave/wave-interference.gen.js:72-124 | camelCase param keys |
| L-02 | behaviour | signed-power transform | assets/js/tools/generators/scripts/wave/wave-interference.gen.js:63-66 | safePow |
| L-03 | behaviour | two-pass per-pixel normalised render | assets/js/tools/generators/scripts/wave/wave-interference.gen.js:155-196 | pooled buffers |
| L-04 | behaviour | blend modes sum/multiply | assets/js/tools/generators/scripts/wave/wave-interference.gen.js:173-178 | blend selection |
| L-05 | param | full parameter block | assets/js/tools/generators/scripts/wave/wave-interference.gen.js:278-401 | full UI coverage |
| L-06 | interaction | landmark presets | assets/js/tools/generators/scripts/wave/wave-interference.gen.js:43-57 | 13 full-map presets |
| L-07 | interaction | animation metadata | assets/js/tools/generators/scripts/wave/wave-interference.gen.js:226-232 | parametric + sequencer |
| L-08 | export | png/gif/webm/sequence export | assets/js/tools/generators/scripts/wave/wave-interference.gen.js:234-239 | svg absent in live |
| L-09 | behaviour | worker computePixels path | assets/js/tools/generators/scripts/wave/wave-interference.gen.js:411-507 | tier-3 worker |

### Diff Table

| cap_id | ref_name | live_match | status | live_evidence | flow_divergence | decision | severity |
|---|---|---|---|---|---|---|---|
| R-01 | R/X/Y core wave components | L-01 | present | wave-interference.gen.js:72-124 | param keys renamed snake_case->camelCase | none | — |
| R-02 | signed-power transform | L-02 | present | wave-interference.gen.js:63-66 | — | none | — |
| R-03 | two-pass normalised render | L-03 | present | wave-interference.gen.js:155-196 | pooled buffers added | none | — |
| R-04 | blend modes | L-04 | present | wave-interference.gen.js:173-178 | — | none | — |
| R-05 | full parameter block | L-05 | present | wave-interference.gen.js:278-401 | snake_case keys migrated to camelCase | none | — |
| R-06 | landmark presets | L-06 | present | wave-interference.gen.js:43-57 | full-map preset structure | none | — |
| R-07 | animation metadata | L-07 | present | wave-interference.gen.js:226-232 | sequencer metadata added | none | — |
| R-08 | export set | L-08 | partial | wave-interference.gen.js:234-239 | svg missing in live export block | log EXP | P1 |
| R-09 | worker computePixels | L-09 | present | wave-interference.gen.js:411-507 | worker helper updated to camelCase keys | none | — |

### Library Hygiene Report

**Check 1 — Shared algorithm imports**
- Imports found: none from `assets/js/shared/*`
- Inlined reusable candidate: signed-wave component evaluation and normalisation pipeline

**Check 2 — Foundation usage**
- AnimationFoundation: no raw RAF/interval APIs
- GPUFoundation: no raw GPU APIs

**Check 3 — BaseComponent / MathematicalFoundation**
- BaseComponent: procedural SCRIPT_CONFIG module (`draw` external function reference)
- MathematicalFoundation: layout maths (`W/2`, `H/2`, normalisation) inlined

**Check 4 — State scope smells**
- Mutable module-scope cache object `_bufferPool` retains per-canvas buffers across frames

**Issues logged:** ARCH-012, ARCH-013

### Performance Tier Audit

**Primary workload:** per-pixel  
**Workload size estimate:** O(W×H) with two full passes over the pixel buffer

**Tier 1 (RAF coalesce):** implicit via host  
**Tier 2 (Adaptive resolution):** adopted (`interactionScale: 0.5`)  
**Tier 3 (Worker offload):** adopted (`compute.worker: true`, `computePixels`)  
**Tier 4 (GPU):** not adopted

**Documented mitigations:**
- buffer pooling removes repeated large allocations
- worker offload path is implemented

**Issues logged:** none

### v4 issues logged

- GEN-010, GEN-011, EXP-003, ARCH-012, ARCH-013, DOC-015, DOC-016

### v4 questions queued

- none (wave-interference turn)
