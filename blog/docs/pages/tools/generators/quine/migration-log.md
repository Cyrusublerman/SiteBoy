# Quine — Migration Log

## Status

**Implemented.** Version 1.0.0. Port of `Quine` sketch. P5.js infinite animation.

## Architectural Changes from Original Sketch

- Wrapped into `SCRIPT_CONFIG` module format with `p5Setup`/`p5Draw` hooks.
- Parameters exposed via slider UI across 3 groups (Ink, Typing, Text).
- 3 presets added (Classic, Fast, Slow Bleed).
- `_QUINE_TEXT` constant embeds a partial rendition of the generator's own config as the typed content.

## Open Items

| priority | id | description | severity |
|---|---|---|---|
| 1 | non-determinism | Fix `_noiseT` to be derivable from `frame`+`params`; make timing deterministic | WARN [BUG] |
| 2 | script-config-state | Move all mutable state (`_residue`, `_charIndex`, etc.) out of `SCRIPT_CONFIG` | WARN [STANDARDS] |
| 3 | diffuse-dirty-region | Skip diffusion pass for pixels with `residue.A = 0`; maintain active bounding box | WARN [PERFORMANCE] |
| 4 | float-buffer-memory | Reduce to 2 buffers (ping-pong) and evaluate `Uint16Array` fixed-point | WARN [PERFORMANCE] |
| 5 | preset-format | Convert presets to `{ name, values: {...} }` format | WARN [STANDARDS] |
| 6 | animatable-params | Declare `animatableParams` | WARN [STANDARDS] |
| 7 | export-options | Add export options block (PNG only until determinism fixed) | WARN [STANDARDS] |
| 8 | noloop-host-compat | Confirm host calls `p.redraw()` per frame; remove `p.noLoop()` if not needed | WARN [ARCHITECTURE] |
| 9 | remove-dead-state | Remove `_lastRenderedLine` unused property | NOTE [DEAD CODE] |
| 10 | comment-accuracy | Correct "Perlin noise-driven" comment; `_noiseT` is a linear counter | NOTE [ACCURACY] |
| 11 | raw-colours | Replace `_BG`/`_INK_CODE`/`_INK_COMMENT` with CSS design tokens or justify exception | WARN [STANDARDS] |
