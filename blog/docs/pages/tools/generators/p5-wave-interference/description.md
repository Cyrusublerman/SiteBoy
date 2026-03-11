# Wave Interference (P5) — Description

Wave Interference is a P5.js pixel-buffer animation that renders interference patterns from four orbiting wave sources on a 1080×1080 canvas. Each pixel's colour is derived from the angular differences between the surface normals of two source pairs, relative to a rotating reference vector. The normals are computed by finite difference of the summed scalar wave heights.

## Wave Model

Each source emits a scalar wave:
```
h(px, py, src, t) = amplitude × (sin(freq × d − speed × t) + 1) / 2
```

where `d` is the Euclidean distance from pixel to source. The sum of a pair's wave heights at a pixel gives the local "surface height" used for normal estimation.

## Source Orbits

Identical orbit model to `p5-wave-colour`: four sources orbit the canvas perimeter, two clockwise (offsets 0, ½ perimeter), two counter-clockwise (offsets ¼, ¾ perimeter). Each source completes `sNLoops` orbits per `cycleFrames`. Source positions are frame-based and deterministic.

## Colour Mapping

Sources are split into two pairs: `pairA = (s1, s2)` and `pairB = (s3, s4)`. For each pixel:
1. Normal `nA` from `pairA`'s surface (4-point finite difference of summed heights).
2. Normal `nB` from `pairB`'s surface.
3. Six angular differences between `nA`/`nB` and the reference vector `ref`:
   - `aXY = angle(nA.y, nA.x) − angle(ref.y, ref.x)` → R channel
   - `aXZ = angle(nA.z, nA.x) − angle(ref.z, ref.x)` → G channel
   - `aZY = angle(nA.y, nA.z) − angle(ref.y, ref.z)` → B channel
   - Corresponding `bXY`, `bXZ`, `bZY` from `nB`, summed with `a*`.
4. Hue-shift by `(totalHeight / 16) × 360°` where `totalHeight` = sum of all 4 sources at the pixel.

## Reference Vector

Same triangle traversal as `p5-wave-colour`: triangle `{(540,54), (1026,1026), (54,1026)}`, completing 10 circuits per `cycleFrames`. Maps canvas coordinates to a unit sphere via `(theta, phi)` spherical coords.

## Output

Fully deterministic — no random elements. Pre-render compatible in principle. Background is always black initially but the pixel buffer is written completely each frame (no background call).
