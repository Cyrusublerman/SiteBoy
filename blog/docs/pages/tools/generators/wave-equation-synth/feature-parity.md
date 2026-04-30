# Wave Equation Synth — Feature Parity


## Core Algorithm

| Feature | Spec | Live | Status |
|---|---|---|---|
| Sandboxed equation compiler | ✓ | ✓ | PASS — `new Function` with restricted scope; CSP risk documented |
| Wave index variables (p, w, u, t, g) | ✓ | ✓ | PASS |
| Multi-equation summation | ✓ | ✓ | PASS — 4 equations, normalised by active count |
| AudioBuffer generation via Web Audio API | ✓ | ✓ | PASS |
| Audio playback (play/stop) | ✓ | ✓ | PASS — toggle parameter + GainNode volume |
| Oscilloscope visualisation | ✓ | ✓ | PASS |
| Circular loop visualisation | ✓ | ✓ | PASS — polar coordinate mapping |
| WAV file export | ✓ | ✓ | PASS — implemented; not UI-accessible (no action button type) |
| GIF export | ✓ | ✗ | FAIL — infinite animation, no loopFrames; suppressed by design |

## Parameters

All specified parameters implemented: `baseFrequency`, `sampleRate`, `duration`, `eq1`–`eq4`, `mode`, `cyclesShown`, `strokeWidth`, `lineColor`, `bgColor`, `modulationDepth`, `playback`, `volume`. Stub `harmonics` parameter removed.

## Summary

8 of 9 specified features implemented. GIF export explicitly suppressed (infinite animation type). Canvas 420×420 per spec. 5 presets. Audio lifecycle managed via closure state within `draw`.

---

## v4 Review (2026-04-23)

### Reference Capability Table

| cap_id | kind | name | evidence | notes |
|---|---|---|---|---|
| R-01 | param | harmonics slider | reference/generators/wave-equation-synth/source/wave-equation-synth.gen.js:11-14 | only exposed control |
| R-02 | behaviour | black-canvas placeholder draw | reference/generators/wave-equation-synth/source/wave-equation-synth.gen.js:16-19 | no synthesis path |
| R-03 | interaction | static draw hook only | reference/generators/wave-equation-synth/source/wave-equation-synth.gen.js:16-20 | no animation/export metadata |

### Function Coverage Map

| unit_id | unit_kind | name | lines | mapped_to |
|---|---|---|---|---|
| F-01 | top-level-stmt | SCRIPT_CONFIG object | 6-20 | R-01, R-02, R-03 |

### Live Capability Table

| cap_id | kind | name | evidence | notes |
|---|---|---|---|---|
| L-01 | behaviour | equation compile + sample evaluation pipeline | assets/js/tools/generators/scripts/other/wave-equation-synth.gen.js:62-142 | AUDIO-004/005/006 |
| L-02 | behaviour | audio lifecycle and buffer playback | assets/js/tools/generators/scripts/other/wave-equation-synth.gen.js:144-211,300-367 | AUDIO-007/008 + play/stop flow |
| L-03 | behaviour | oscilloscope/segmented/circular visual renderers | assets/js/tools/generators/scripts/other/wave-equation-synth.gen.js:213-289,378-382 | CANVAS-014/015 |
| L-04 | param | full synthesis/visual/audio parameter surface | assets/js/tools/generators/scripts/other/wave-equation-synth.gen.js:435-505 | 14+ controls |
| L-05 | interaction | presets + infinite animation + export metadata | assets/js/tools/generators/scripts/other/wave-equation-synth.gen.js:507-579 | GIF/WebM suppressed |

### Diff Table

| cap_id | ref_name | live_match | status | live_evidence | flow_divergence | decision | severity |
|---|---|---|---|---|---|---|---|
| R-01 | harmonics slider | L-04 | diverged | wave-equation-synth.gen.js:435-505 | stub control replaced by full param surface | user decision | P1 |
| R-02 | placeholder draw | L-01, L-03 | diverged | wave-equation-synth.gen.js:62-142,213-289 | stub render replaced by synthesis + visual engines | user decision | P1 |
| R-03 | minimal script skeleton | L-02, L-05 | diverged | wave-equation-synth.gen.js:300-367,507-579 | added audio lifecycle, presets, animation/export contracts | user decision | P1 |

### Library Hygiene Report

**Check 1 — Shared algorithm imports**
- Imports found: none from `assets/js/shared/*`
- Audio/math/renderer helpers remain inlined in generator module

**Check 2 — Foundation usage**
- AnimationFoundation: host loop used; no raw RAF/interval APIs
- GPUFoundation: not used

**Check 3 — BaseComponent / MathematicalFoundation**
- BaseComponent: procedural SCRIPT_CONFIG module
- MathematicalFoundation: synthesis/render maths inlined

**Check 4 — State scope smells**
- closure-scoped mutable audio lifecycle state (`_buffer`, `_audioCtx`, `_source`, etc.)

**Issues logged:** GEN-025, GEN-026, GEN-027, ARCH-028

### Performance Tier Audit

**Primary workload:** buffer generation on synthesis-param changes + lightweight per-frame visual redraw  
**Tier status:** no worker/GPU path; current exposed ranges keep workload moderate

**Issues logged:** none

### v4 issues logged

- GEN-025, GEN-026, GEN-027, ARCH-028, DOC-048, DOC-049

### v4 questions queued

- none (wave-equation-synth turn)
