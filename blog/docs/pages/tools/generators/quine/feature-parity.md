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
