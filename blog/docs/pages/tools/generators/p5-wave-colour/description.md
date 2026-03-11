# Wave Colour — Description

Wave Colour is a P5.js pixel-buffer animation that computes complex-number wave interference at each canvas pixel and maps the result to colour via phase, magnitude, and surface normals. Four wave sources orbit the 1080×1080 canvas perimeter. Their interactions are composed via sequentially-applied operators that evolve through a library of 8 complex transformations, producing continuously morphing interference patterns.

## Wave Sources

Four sources orbit the rectangular perimeter. Each completes `sNLoops` orbits per cycle. Sources 1 and 2 travel clockwise; sources 3 and 4 counter-clockwise. Starting positions are spaced at offsets 0, ½, ¼, and ¾ of the perimeter. Source positions are derived purely from `frame % cycleFrames` — frame-based, deterministic.

## Complex Wave Formulation

Each source at `(sx, sy)` contributes a complex wave to a pixel at `(px, py)`:
```
d     = distance(p, source)
phase = freq × d − speed × frame
a     = amplitude / (1 + d × decay)     // distance decay
w     = a × exp(i × phase)              // complex wave = re + i×im
```

## Operator Composition

The four waves are composed sequentially. For source i:
```
state = lerp_polar(op_current(state, wave_i), op_next(state, wave_i), smootherstep(t_i))
```

Operators: `add`, `multiply`, `power`, `rotate`, `mobius`, `fold`, `spiral`, `beat`. Each operator's blend `t` advances by `opSpeed` per frame. At `t ≥ 1`, `current` becomes `next` and a new `next` is randomly selected (biased toward the same family: smooth/harsh/warp).

**This random selection makes the animation non-deterministic across runs.**

## Colour Mapping

The final complex state `(re + i×im)` maps to HSL colour:
- **Hue**: relative phase `(state.phase − atan2(ref.y, ref.x)) / 2π` — rotating with the reference vector.
- **Lightness**: `0.1 + 0.7 × (1 − exp(−|state| × 0.8))` — magnitude-driven brightness.
- **Saturation**: `min(1, 0.6 + 0.4 × |ref.z| × (0.5 + 0.5 × normal·ref))` — blends with surface normal.

A surface normal is estimated by finite-difference gradient of the state magnitude field (4 additional `_process` calls per pixel).

## Reference Vector

A reference vector `ref` traces a triangle (with vertices at the canvas triangle `{(540,54), (1026,1026), (54,1026)}`), completing 10 traversals per cycle. It is mapped from canvas coordinates to a unit sphere via spherical coordinates, producing a slowly-rotating phase reference that shifts the hue pattern over time.

## Rendering

Uses `p.loadPixels()` / `p.updatePixels()` for direct pixel buffer access. At `resolution = r`, one sample covers `r × r` pixels (block replication). `p.pixelDensity(1)` is set in setup.
