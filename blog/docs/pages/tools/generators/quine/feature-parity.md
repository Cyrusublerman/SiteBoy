# Quine — Feature Parity

No legacy specification or audit exists. Assessment is internal consistency and standards compliance only.

## Implemented Features

| feature | status | notes |
|---|---|---|
| character-by-character typing | PASS | frame-gated by `_nextFrame` |
| variable per-character delay | PASS | pseudo-noise via `_noiseT` counter |
| punctuation pauses | PASS | `.`, `\n`, `{`, `,` get extra delay |
| comment/code colour distinction | PASS | `_isComment` per line |
| ink absorption into float buffer | PASS | `_absorbInk` |
| bidirectional ink diffusion | PASS | `_diffuse` forward+backward passes |
| gravity threshold for bleed spread | PASS | `gravity` param gates neighbour bleed |
| entropy decay | PASS | residue alpha decremented per step |
| composite: sharp ink + bleed halo | PASS | `isInk` branch in composite |
| cycle phases (type→clear→dormant→reset) | PASS | `_clearing`, `_dormant` flags |
| self-referential text content | PARTIAL | `_QUINE_TEXT` is an abridged/non-functional version of the config, not a full true quine |
| 3 presets | PASS | Classic, Fast, Slow Bleed |

## Standards Compliance

| check | status | notes |
|---|---|---|
| preset format `{ name, values }` | FAIL | flat object format used |
| `animatableParams` declared | FAIL | not declared |
| export options declared | FAIL | no export block |
| state via local vars not `SCRIPT_CONFIG` | FAIL | all state on SCRIPT_CONFIG (`_residue`, `_charIndex`, etc.) |
| CSS variable colours | FAIL | raw RGB object literals (`_BG`, `_INK_CODE`, `_INK_COMMENT`) |
| deterministic per-frame output | FAIL | `_noiseT` advances by character count, not frame count — non-deterministic |
| `p.noLoop()` in setup | WARN | `p.noLoop()` set in `p5Setup`, host calls `p5Draw` each frame externally — verify host calls `p.redraw()` or equivalent |

## Architecture Notes

- The `_lastRenderedLine` state property is set in `_reset` but never updated in `p5Draw` — appears to be dead code.
- `_noiseT` is described in the header comment as "Perlin noise-driven delay" but is a simple linear counter — the comment is inaccurate.
- `p5Setup` creates `_imagined` graphics buffer; `p5Draw` has a guard that re-creates it if `!_initialized`. This double-init guard suggests the host may not always call `p5Setup` before `p5Draw`.
- The `_QUINE_TEXT` constant is a partial quine: it lists parameter names (`entropy`, `urgency`, …) without their actual values. A true quine would render its own exact source text verbatim.
