# Wave Colour — Mechanisms

## Time Model

```
time = frame                           // passed directly to all wave computations
srcProgress = (frame % cycleFrames) / cycleFrames ∈ [0,1)
```

Frame-based, deterministic for source positions and waves. **Non-deterministic for operator states** due to random `_pickNextOp`.

## Source Position (`_perimToXY`, `_srcPos`)

Perimeter = `2 × (W + H) = 4320` px (for 1080×1080).
```
pos = offset + progress × loops × perimeter × (±1)
pos = ((pos % perimeter) + perimeter) % perimeter  // wrap

// _perimToXY: maps pos to canvas coords:
pos ∈ [0, W):        (pos, 0)           // top edge →
pos ∈ [W, W+H):      (W, pos−W)         // right edge ↓
pos ∈ [W+H, 2W+H):   (2W+H−pos, H)     // bottom edge ←
pos ∈ [2W+H, 2W+2H): (0, 2W+2H−pos)   // left edge ↑
```

Sources 1,2,3,4 start at offsets 0, perim/2, perim/4, 3×perim/4.

## Wave Computation (`_wave`)

```
d = ‖(px,py) − (sx,sy)‖
phase = freq × d − speed × frame
a = amp / (1 + d × decay)
w = _Complex(a × cos(phase), a × sin(phase))   // = a × exp(i×phase)
```

## Operator Composition (`_process`)

```
state = _Complex(1, 0)                // identity start
for i in [0, 4):
  wave = _wave(px, py, sources[i], frame, ...)
  opS  = _opStates[i]
  t    = smootherstep(opS.t)                      // t in [0,1]
  rA   = _WaveOps[opS.current](state, wave)
  rB   = _WaveOps[opS.next](state, wave)
  state = _lerpPolar(rA, rB, t)
```

`_lerpPolar`: logarithmic magnitude lerp + shortest-path angle lerp.

## Operator Library

| op | formula |
|---|---|
| `add` | `s + w` |
| `multiply` | `s × w` (complex product) |
| `power` | `|s|^(1+0.5×w_re) × exp(i×phase(s))` |
| `rotate` | `s × exp(i × w_re × π)` |
| `mobius` | `(s + 0.3×w_re) / (0.1×w_im×s + 1)` (Möbius transform) |
| `fold` | 4-fold domain repeat with threshold `0.5 + 0.4×|w_re|` |
| `spiral` | `|s| × exp(i×(phase(s) + ln|s| × w_re × 2))` |
| `beat` | `s × exp(i×w_re² × 10)` |

Families: `smooth` = [add, rotate, spiral]; `harsh` = [multiply, power, fold]; `warp` = [mobius, beat].

## Operator Transition (`_pickNextOp`)

```
if rand < 0.7: pick from same family (exclude current)
else:          pick from other families
```

Random each time `os.t >= 1`. Non-deterministic.

## Surface Normal (`_normalAt`)

5-point finite difference (4 neighbours + centre):
```
hL = _heightAt(px−1, py, ...)
hR = _heightAt(px+1, py, ...)
hD = _heightAt(px,   py−1, ...)
hU = _heightAt(px,   py+1, ...)
n = normalize(−(hR−hL)/2, −(hU−hD)/2, 1)
// then convert to "Blinn-Phong-style":
output = (2×nz×nx, 2×nz×ny, 2×nz²−1)
```

This is the standard normal-map reflection computation. 4 extra `_process` calls per pixel.

## Colour Mapping (`_toColor`)

```
hue        = ((state.phase − atan2(ref.y, ref.x)) / 2π + 1) % 1
lightness  = 0.1 + 0.7 × (1 − exp(−|state| × 0.8))
saturation = min(1, 0.6 + 0.4 × |ref.z| × (0.5 + 0.5 × normal·ref))
color      = _hslToRgb(hue × 360, saturation, lightness)
```

## Pixel Buffer Write

```
p.loadPixels()
for y in [0, H) step resolution:
  for x in [0, W) step resolution:
    state  = _process(x, y, ...)
    normal = _normalAt(x, y, ...)   // 4×_process calls
    col    = _toColor(state, normal, ref)
    fill res×res block with col
p.updatePixels()
```

## State (on `SCRIPT_CONFIG` object)

```js
SCRIPT_CONFIG._opStates       // [{current, next, t, speed}, ×4]
SCRIPT_CONFIG._lastOpSpeeds   // [4 floats] for change detection
```

Same config-object mutation pattern. Reset on `opSpeed` param changes; operator `current`/`next` are randomised on reset.
