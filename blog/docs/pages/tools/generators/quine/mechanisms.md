# Quine — Mechanisms

## State (on SCRIPT_CONFIG)

| property | type | description |
|---|---|---|
| `_ego` | string | the quine text to type (`_QUINE_TEXT` constant) |
| `_past` | string[] | completed lines pushed from `_present` |
| `_present` | string | current in-progress line |
| `_charIndex` | int | current position in `_ego` |
| `_lineIndex` | int | current line index (incremented on `\n`) |
| `_dormant` | bool | true during fade-out/reset phase |
| `_clearing` | bool | true while pushing blank lines after text complete |
| `_blankLines` | int | count of blank lines pushed during clearing |
| `_lastRenderedLine` | int | last rendered line index (unused in current code) |
| `_noiseT` | float | Perlin noise phase for typing delay |
| `_residue` | Float32Array | pixel ink accumulation buffer (RGBA floats, W×H×4) |
| `_echo` | Float32Array | forward-pass diffusion scratch buffer |
| `_reflection` | Float32Array | backward-pass diffusion scratch buffer |
| `_imagined` | P5.Graphics | offscreen buffer for rendering text before absorption |
| `_nextFrame` | int | frame number at which next character is emitted |
| `_initialized` | bool | guards against p5Setup not being called |

**State is on SCRIPT_CONFIG properties** — a standards violation (non-per-invocation scoping).

## Colour Constants (on SCRIPT_CONFIG)

```
_BG:         { r:242, g:238, b:226 }  // paper
_INK_CODE:   { r:45,  g:42,  b:48  }  // dark charcoal
_INK_COMMENT:{ r:125, g:88,  b:82  }  // terracotta
```

Raw RGB object literals — not CSS variables.

## `_charDelay(ch, params)`

```
base = 2 + round((noiseT % 1.0) × 3)    // 2–5 frames
noiseT += 0.05
if ch==' ':  base += 1
if ch=='.':  base += round(pauseDelay × 0.6)
if ch=='\n': base += round(pauseDelay × 0.7)
if ch=='{':  base += round(pauseDelay × 0.2)
if ch==',':  base += round(pauseDelay × 0.3)
return round(base × delayScale)
```

Note: `_noiseT` is a simple linear counter, not actual Perlin noise — the comment in the header is inaccurate. The output is a pseudo-random-looking integer delay.

## `_absorbInk(imagined, residue, urgency, bg)`

For each pixel in `imagined`:
```
darkness = 255 − max(R,G,B)
if darkness > 20:
    newWet = min(existing + (darkness/255) × urgency, 50)
    if existing > 0:
        ratio = urgency / (existing + urgency)
        residue.RGB = lerp(residue.RGB, pixel.RGB, ratio)
    else:
        residue.RGB = pixel.RGB
    residue.A = newWet
```

Ink mass capped at 50. Colour blended toward new ink proportionally to wetness ratio.

## `_diffuse(residue, echo, reflection, W, H, entropy, gravity)`

Bidirectional diffusion in 4-connected neighbourhood:
```
// Copy residue → echo, reflection
// Forward pass (y=1..H-2, x=1..W-2):
  if residue[here].A > gravity:
    echo[here].A -= gravity × 0.5
    for n in [right, left, down, up]:
      if residue[n].A < residue[here].A:
        echo[n].RGB = lerp(echo[n].RGB, residue[here].RGB, 0.3 × 0.5)
        echo[n].A = min(residue[n].A + 0.3, residue[here].A × 0.8)
    echo[here].A -= entropy
// Backward pass (y=H-2..1, x=W-2..1): same logic into reflection
// Average: residue = (echo + reflection) / 2
```

`gravity` is the threshold for a pixel to bleed; `entropy` is the per-step decay.

## `p5Draw` — Per-Frame Pipeline

1. **Advance text state** (if `frame >= _nextFrame`): emit next char, push lines, or advance clearing/dormant phase.
2. **Render text to `_imagined`**: clear, fill white, draw all `_past` lines (last `maxLines` visible) + current `_present` with cursor `_`.
3. **`_absorbInk`**: transfer darkness from `_imagined` to `_residue`.
4. **`_diffuse`**: spread and decay `_residue`.
5. **Composite**: for each pixel:
   - If `_imagined` pixel is ink (darkness > 20): copy sharp ink pixel.
   - Else if `_residue.A > 0.5`: blend toward bleed colour by `min(wet/30, 0.6)`.
   - Else: paper background.
6. **`p.updatePixels()`**.

## Non-Determinism

The `_noiseT` phase advances by character count (not frame count). Because character emit rate depends on `delayScale` and `pauseDelay`, different parameter settings produce different noise sequences at different frame counts. The animation is not frame-deterministic — the same frame number can yield different visual output depending on parameter history. Pre-render is not reliable.

## `_reset(params)`

Clears all state arrays and text position. Allocates new `Float32Array` buffers if needed. Called at `p5Setup` and during the dormant phase.
