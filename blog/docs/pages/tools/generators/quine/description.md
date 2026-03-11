# Quine — Description

Quine is a P5.js pixel-buffer animation that types its own source code character by character onto a simulated 1080×1080 paper canvas. Ink bleeds from the typed text into the surrounding paper fibres via a float-precision pixel diffusion buffer. The generator is self-referential: the text it types is the `_QUINE_TEXT` constant embedded in the source, which is an abridged version of the generator's own `SCRIPT_CONFIG` block.

## Visual Output

- **Paper**: warm off-white background (`rgb(242,238,226)`).
- **Code text**: dark charcoal (`rgb(45,42,48)`).
- **Comment text**: warm terracotta (`rgb(125,88,82)`).
- **Ink bleed**: a diffuse halo spreads from each character into surrounding pixels over time, controlled by `entropy`, `urgency`, and `gravity`.
- After all text is typed: blank lines are inserted, the generator pauses, the residue fades, and the cycle restarts.

## Typing Simulation

Characters are emitted one per `_charDelay` frames. The delay is seeded from a pseudo-Perlin noise value (`_noiseT`), incremented by 0.05 per character. Punctuation adds fixed pauses:
- `.` → `pauseDelay × 0.6`
- `\n` → `pauseDelay × 0.7`
- `{` → `pauseDelay × 0.2`
- `,` → `pauseDelay × 0.3`
- space → +1 base frame

`delayScale` multiplies the total delay uniformly.

## Ink Physics

Rendered text is first drawn onto an offscreen P5 `createGraphics` buffer (`_imagined`). `_absorbInk` reads pixel darkness from this buffer and transfers ink mass to a `Float32Array` residue buffer. `_diffuse` then spreads ink to adjacent pixels in a forward/backward bidirectional pass, attenuating by `entropy` per iteration. The composite step mixes sharp text pixels with bleed residue onto the main canvas.

## Cycle Phases

1. **Typing**: characters emitted one at a time, advancing `_charIndex`.
2. **Clearing**: blank lines pushed to `_past` until 40 blank lines.
3. **Dormant**: residue alpha multiplied by 0.2 (fade), then full reset.
4. Restart from phase 1.
