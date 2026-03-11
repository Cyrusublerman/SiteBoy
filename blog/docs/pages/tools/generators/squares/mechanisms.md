# Squares — Mechanisms

## Coordinate System

- `col`, `row` ∈ [0, `GRID`). Integer grid coordinates.
- `nx = col / GRID`, `ny = row / GRID` ∈ [0, 1). Normalised spatial coords.
- Tile centre in canvas space: `x = offsetX + col × cellSize + cellSize/2`, `y = offsetY + row × cellSize + cellSize/2`.
- `cellSize = min(W, H) / GRID`; grid is letterboxed inside the canvas.

## Time Model

```
t = (frame / 60) × speed
cycleTime = t % 240
```

All animation state derives from `cycleTime`. The model is frame-based and deterministic. Speed scales the wall-clock rate.

## Phase Dispatch

`getCurrentState(t)` performs a linear scan of `timeline` (15 entries) to find the active phase. Returns a `state` record: `{ type, pattern/transition, effect, from/to, progress, localT, duration }`.

## Pattern Functions

Pure functions, no state. Signature: `(col, row, nx, ny) → boolean`.

## Transition Mechanics (`getFlipState`)

Each transition assigns per-tile `flipStart` ∈ [0, 1]. The tile flips when `flipStart ∈ [-duration, 0)` relative to the swept front:

```
flipProgress = clamp(-flipStart / duration, 0, 1)
if flipProgress < 0.5: scale_axis = 1 − easeIn(flipProgress × 2)   // fold in
else:                  scale_axis = easeOut((flipProgress − 0.5) × 2) // unfold; colour changes
```

`axis` is `'x'` or `'y'` depending on the transition type.

Spatial assignments:
- `radialWave`: `flipStart = dist(tile, centre) / 0.707 − progress × (1 + 0.25)`
- `linearSweep`: `flipStart = nx − progress × 1.2`
- `verticalSweep`: `flipStart = ny − progress × 1.2`
- `randomFlicker`: `flipStart = hash(col, row) − progress × 1.25`
- `spiralUnwind`: `flipStart = tileIndex / totalTiles − progress × (1 + 1.5/totalTiles)`; `flipAxis` inferred from direction of next spiral step.

## Spiral Path Generation (`generateSpiral`)

Iterative inward-peeling rectangle traversal. Produces `GRID²` entries `[col, row]` in clockwise-inward order. Rebuilt whenever `grid !== GRID`.

## Effect Functions

Signature: `(col, row, nx, ny, localT, duration, state) → state`. Mutate the `result` object `{ rotation, scaleX, scaleY, roundness, offsetX, offsetY }`.

All effects use `envelope(localT, duration)` for fade-in/out:
```
fadeTime = min(1, duration × 0.1)
env = easeInOut(localT / fadeTime)                   if localT < fadeTime
    = easeInOut((duration − localT) / fadeTime)      if localT > duration − fadeTime
    = 1                                              otherwise
```

Effect summaries:
- `rotationWave`: `rotation = sin(dist × 12 − phase) × 20 × env`
- `compressionWave`: `scaleY = 1 + sin(nx×12 − phase)×0.6×env`, `scaleX = 1 − …×0.3`, `rotation = …×35`
- `cafeWallShift`: `offsetX = sin(phase)×0.15 × rowParity × env` (odd rows negate); edge-pinch scaleX
- `radialPulse`: `scale = 1 + pulse×0.3×env`; outer tiles gain radial offset push
- `spiralRotation`: `rotation = (angle×3 + dist×15 − phase) × (180/π) × env`
- `shapeMorph`: `roundness = smoothstep(morph) × env`; sinusoidal scale pulse

## Tile Draw (`drawCard`)

```
ctx.save()
ctx.translate(x + offsetX×size, y + offsetY×size)
ctx.rotate(rotation × π/180)
ctx.fillStyle = isWhite ? '#ffffff' : '#000000'
ctx.strokeStyle = opposite
ctx.lineWidth = 0.5
if roundness > 0.01: ctx.roundRect(−w/2, −h/2, w, h, radius); fill + stroke
else:               ctx.fillRect + strokeRect
ctx.restore()
```

## State (Module-Level, Standards Violation)

```js
let time = 0;   // declared but never written in draw()
let GRID = 50;  // mutable, updated on gridSize param change
let spiralPath = []; // mutable, rebuilt when GRID changes
```

`time` is unused dead code. `GRID` and `spiralPath` are effectively rebuild-cache variables. Standards require `this.*` state management inside the component.

## Rebuild Detection

```js
if (grid !== GRID) { GRID = grid; spiralPath = generateSpiral(GRID); }
if (spiralPath.length === 0) { spiralPath = generateSpiral(GRID); }
```

Correctly detects `gridSize` changes. Does not detect canvas dimension changes (no impact since `cellSize` is recalculated each frame from live `canvas.width/height`).

## Hash Function

Integer hash for `randomFlicker`:
```
h = x×374761393 + y×668265263
h = (h ^ (h >>> 13)) × 1274126177
return ((h ^ (h >>> 16)) >>> 0) / 4294967296
```
Deterministic, spatially uniform.
