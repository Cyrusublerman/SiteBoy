# Quine — Feature Parity

No legacy specification or audit exists. Assessment is internal consistency and standards compliance only.

## Implemented Features

| feature | status | notes |
|---|---|---|
| character-by-character typing | PASS | frame-gated by `nextFrame` |
| variable per-character delay | PASS | deterministic hash via `_pseudoNoise(charIndex)` |
| punctuation pauses | PASS | `.`, `\n`, `{`, `,` get extra delay via `pauseDelay` |
| comment/code colour distinction | PASS | `_isComment` per line |
| ink absorption into float buffer | PASS | `_absorbInk` |
| bidirectional ink diffusion | PASS | `_diffuse` forward+backward passes; alternates `passDir` |
| gravity threshold for bleed spread | PASS | `gravity` param gates neighbour bleed |
| entropy decay | PASS | residue alpha decremented per step |
| composite: sharp ink + bleed halo | PASS | `isInk` branch in composite |
| cycle phases (type→clear→dormant→reset) | PASS | `clearing`, `dormant` flags |
| self-referential text content | PARTIAL | `_QUINE_TEXT` is an abridged/non-functional version of the config, not a full true quine |
| 3 presets | PASS | Classic, Fast, Slow Bleed |

## Standards Compliance

| check | status | notes |
|---|---|---|
| preset format `{ name, values }` | PASS | resolved — all presets use `values` wrapper |
| `animatableParams` declared | PASS | resolved — `['entropy', 'urgency', 'gravity', 'delayScale']` |
| export options declared | PASS | resolved — `{ png: true, gif: false, webm: false }` |
| state via WeakMap, not `SCRIPT_CONFIG` | PASS | resolved — `_instances: WeakMap` + `_makeState()` |
| CSS variable colours | PARTIAL | canvas-only RGB objects carry design-law §6.2 exemption comment; no UI colour violations |
| deterministic per-frame output | PASS | resolved — `_pseudoNoise(charIndex)` replaces `_noiseT` accumulator |
| `p.noLoop()` in setup | WARN | still present; host must call `p.redraw()` per frame |

## Architecture Notes

- `_makeState()` creates fresh per-instance state; `_instances: WeakMap` isolates state across concurrent mounts.
- `_pseudoNoise` is a deterministic integer hash (32-bit multiply-xorshift); described accurately in source comments.
- `p5Draw` has a re-initialisation guard (`if (!state) { ... }`) for cases where the host calls `p5Draw` before `p5Setup`.
- `_QUINE_TEXT` is a partial quine: lists parameter names without numeric defaults.

---

## v4 Review (2026-04-23)

### Reference Capability Table

| cap_id | kind | name | evidence | notes |
|---|---|---|---|---|
| R-01 | behaviour | frame-gated typing and phase state machine | reference/generators/quine/source/quine.gen.js:122-132,247-280 | type/clear/dormant/reset cycle |
| R-02 | behaviour | ink absorb + diffusion + composite pipeline | reference/generators/quine/source/quine.gen.js:134-209,302-329 | full-canvas diffusion model |
| R-03 | behaviour | comment/code colour rendering onto paper buffer | reference/generators/quine/source/quine.gen.js:117-120,283-300 | comment detection + colour split |
| R-04 | param | ink/typing/text controls | reference/generators/quine/source/quine.gen.js:60-84 | 8 controls |
| R-05 | interaction | p5 infinite animation and preset surface | reference/generators/quine/source/quine.gen.js:86-93,230-239 | baseline runtime contract |

### Function Coverage Map

| unit_id | unit_kind | name | lines | mapped_to |
|---|---|---|---|---|
| F-01 | method | _charDelay | 122-132 | R-01 |
| F-02 | method | _absorbInk | 134-154 | R-02 |
| F-03 | method | _diffuse | 156-209 | R-02 |
| F-04 | method | _reset | 211-224 | R-01, R-05 |
| F-05 | method | p5Setup | 230-239 | R-05 |
| F-06 | method | p5Draw | 241-329 | R-01, R-02, R-03 |
| F-07 | top-level-stmt | SCRIPT_CONFIG object | 51-330 | R-04, R-05 |

### Live Capability Table

| cap_id | kind | name | evidence | notes |
|---|---|---|---|---|
| L-01 | behaviour | frame-gated typing and phase state machine | assets/js/tools/generators/scripts/other/quine.gen.js:102-112,346-387 | deterministic char-index delay |
| L-02 | behaviour | ink absorb + dirty-region diffusion + composite | assets/js/tools/generators/scripts/other/quine.gen.js:114-228,409-441 | active-bounds optimisation |
| L-03 | behaviour | comment/code colour rendering onto paper buffer | assets/js/tools/generators/scripts/other/quine.gen.js:97-100,389-407 | same semantic output |
| L-04 | param | ink/typing/text controls | assets/js/tools/generators/scripts/other/quine.gen.js:239-263 | same 8 controls |
| L-05 | interaction | infinite animation/presets/export/info/compute surface | assets/js/tools/generators/scripts/other/quine.gen.js:265-320 | host metadata expanded |

### Diff Table

| cap_id | ref_name | live_match | status | live_evidence | flow_divergence | decision | severity |
|---|---|---|---|---|---|---|---|
| R-01 | typing state machine | L-01 | present | quine.gen.js:346-387 | deterministic delay hash replaces `_noiseT` drift | none | — |
| R-02 | ink pipeline | L-02 | present | quine.gen.js:114-228,409-441 | diffusion bounded to active dirty region | none | — |
| R-03 | colour semantics | L-03 | present | quine.gen.js:389-407 | none | none | — |
| R-04 | param surface | L-04 | present | quine.gen.js:239-263 | none | none | — |
| R-05 | runtime surface | L-05 | partial | quine.gen.js:265-320 | presets/export/anim metadata expanded and normalised | none | P2 |

### Library Hygiene Report

**Check 1 — Shared algorithm imports**
- Imports found: none from `assets/js/shared/*`
- Typing/noise/diffusion helpers remain inlined in generator module

**Check 2 — Foundation usage**
- AnimationFoundation: host-driven p5 draw lifecycle
- GPUFoundation: not used

**Check 3 — BaseComponent / MathematicalFoundation**
- BaseComponent: procedural SCRIPT_CONFIG module
- MathematicalFoundation: pixel maths inlined

**Check 4 — State scope smells**
- runtime state isolated in `WeakMap` keyed by p5 instance (improves multi-instance isolation)

**Issues logged:** ARCH-031

### Performance Tier Audit

**Primary workload:** per-pixel ink pipeline with dirty-region diffusion optimisation  
**Tier status:** Tier 2 adaptive interaction scale enabled (`compute.interactionScale`)

**Issues logged:** none

### v4 issues logged

- ARCH-031, DOC-055, DOC-056

### v4 questions queued

- none (quine turn)
