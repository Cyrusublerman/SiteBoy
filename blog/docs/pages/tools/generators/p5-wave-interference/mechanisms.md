# Wave Interference (P5) — Mechanisms

## Time Model

```
time = frame
progress = (frame % cycleFrames) / cycleFrames ∈ [0, 1)
```

Fully frame-based and deterministic. No random elements.

## Source Position

Same as `p5-wave-colour`:
```
pos = startOffset + progress × loops × this._perimeter × (±1)
// _perimeter is hardcoded: 4320 (= 2 × 2160 = 2 × (1080+1080))
xy = _perimeterToXY(pos, W, H)   // maps wrapped pos to canvas edge coords
```

**Note**: `this._perimeter = 4320` is a config property — hardcoded for 1080×1080. `startOffset` values in `p5Draw` use `perimeter = 2*(W+H)` (dynamic), creating a mismatch if canvas dimensions differ from 1080.

## Wave Height (`_waveHeight`)

```
d = ‖(px,py) − (sx,sy)‖
h = amplitude × (sin(freq × d − speed × time) + 1) / 2
```

Note: unlike `p5-wave-colour`, no decay term — amplitude is uniform across all distances.

## Surface Normal (`_calcNormal(px, py, sources, time, amp, freq, spd)`)

4-point finite difference with `delta = 1`:
```
hL = _sumHeight(px−1, py, sources, ...)
hR = _sumHeight(px+1, py, sources, ...)
hD = _sumHeight(px, py−1, sources, ...)
hU = _sumHeight(px, py+1, sources, ...)
n = normalise(−(hR−hL)/2, −(hU−hD)/2, 1)
```

`sources` is a 2-element array (one pair). Called twice per pixel (nA, nB).

## Delta-to-RGB (`_deltaToRGB(nA, nB, ref)`)

Computes 6 wrapped angular differences (each `_wrapAngle(atan2(nA.component, nA.component) − atan2(ref.component, ref.component))`):

```
aXY = atan2(nA.y, nA.x) − atan2(ref.y, ref.x)   (wrapped to −π,π)
aXZ = atan2(nA.z, nA.x) − atan2(ref.z, ref.x)
aZY = atan2(nA.y, nA.z) − atan2(ref.y, ref.z)
bXY = atan2(nB.y, nB.x) − atan2(ref.y, ref.x)
bXZ, bZY  (same for nB)
R = mapToColor(aXY + bXY, −2π, 2π)   // linear map → [0,255]
G = mapToColor(aXZ + bXZ, −2π, 2π)
B = mapToColor(aZY + bZY, −2π, 2π)
```

## Hue Shift (`_hueShift(rgb, deg)`)

Standard RGB→HSL→RGB hue rotation. Applied with:
```
deg = (totalHeight / 16) × 360
totalHeight = _sumHeight(x, y, allSources, ...)   // sum of all 4 waves
```

`totalHeight / 16`: at `amplitude=4`, 4 sources, max height = 4×4×(1+1)/2 = 16. So `totalHeight/16 ∈ [0, 1]` normalises to full hue range.

## Per-Pixel Call Count

- `_calcNormal(pairA)`: 4 `_sumHeight` × 2 sources = 8 `_waveHeight` + 1 normalize
- `_calcNormal(pairB)`: same = 8 + 1
- `_sumHeight(allSources)`: 4 `_waveHeight`
- `_deltaToRGB`: 12 `atan2` calls
- `_hueShift`: ~10 arithmetic ops

Total: **20 `_waveHeight` (20 sqrt + 20 sin) + 12 atan2 + 2 sqrt per pixel.**

## State

No mutable state on SCRIPT_CONFIG beyond `_triangle` and `_perimeter` (both constants). The generator is stateless per-frame — no rebuild cache, no accumulated state.

## Pixel Buffer

Same as `p5-wave-colour`: `p.loadPixels()`, fill pixel array with block-replicated colours, `p.updatePixels()`. `p.pixelDensity(1)` set in `p5Setup`.
