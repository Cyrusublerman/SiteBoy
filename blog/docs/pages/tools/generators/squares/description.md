# Squares — Description

Squares is a choreographed optical illusion animation. An N×N grid of black/white square tiles cycles through a 240-second (4-minute) timeline of 15 phases, alternating between static pattern phases and animated transition phases.

## Grid and Tile Rendering

The canvas is divided into a `gridSize × gridSize` grid (default 50×50). Each tile is rendered via `drawCard()` which applies a local transformation: position offset, non-uniform scaling, rotation (in degrees), and optional corner roundness (`ctx.roundRect`). Tiles are drawn filled black or white based on their current state.

## Pattern Library (7 patterns)

All patterns are pure functions `(col, row, nx, ny) → boolean` where `true` = white:
- `allBlack`, `allWhite` — trivial solid fills.
- `checkerboard` — `(⌊col⌋ + ⌊row⌋) % 2 === 0`.
- `horizontalStripes` — `⌊row⌋ % 2 === 0`.
- `verticalStripes` — `⌊col⌋ % 2 === 0`.
- `cafeWall` — `⌊col + offset⌋ % 2 === 0` where offset = 0.5 on odd rows.
- `diagonalStripes` — `(⌊col⌋ + ⌊row⌋) % 4 < 2`.

## Transition Library (5 transitions)

Transitions interpolate from one pattern to another by flipping tiles in sequence. Each tile has a `flipStart` time based on its position (distance, column, row, spiral index, or random hash). `getFlipState` applies a two-stage scale animation: shrink on the flip axis (easeIn) then expand (easeOut) revealing the new colour. Types: `radialWave`, `linearSweep`, `verticalSweep`, `spiralUnwind`, `randomFlicker`.

## Effect Library (6 effects)

Effects apply per-tile geometric transforms (rotation, scale, roundness, offset) using wave functions of distance and time. They fade in/out via the `envelope(localT, duration)` function. Types: `none`, `rotationWave`, `compressionWave`, `cafeWallShift`, `radialPulse`, `spiralRotation`, `shapeMorph`.

## Timeline (15 phases, 240 s)

| Time (s) | Type | Content |
|---|---|---|
| 0–2 | pattern | allBlack + none |
| 2–8 | transition | allBlack → checkerboard (radialWave) |
| 8–28 | pattern | checkerboard + rotationWave |
| 28–33 | transition | checkerboard → horizontalStripes (linearSweep) |
| 33–63 | pattern | horizontalStripes + compressionWave |
| 63–68 | transition | horizontalStripes → verticalStripes (verticalSweep) |
| 68–88 | pattern | verticalStripes + radialPulse |
| 88–93 | transition | verticalStripes → cafeWall (randomFlicker) |
| 93–128 | pattern | cafeWall + cafeWallShift |
| 128–133 | transition | cafeWall → diagonalStripes (linearSweep) |
| 133–158 | pattern | diagonalStripes + compressionWave |
| 158–163 | transition | diagonalStripes → checkerboard (randomFlicker) |
| 163–198 | pattern | checkerboard + spiralRotation |
| 198–210 | transition | checkerboard → allBlack (spiralUnwind) |
| 210–240 | pattern | allBlack + shapeMorph |

## Animation Timing

`t = (frame / 60) × speed`. Cycle period = `240 / speed` seconds at `fps = 60`. The `seek` parameter is declared but not wired into `draw` — animation position is purely `frame`-driven.
