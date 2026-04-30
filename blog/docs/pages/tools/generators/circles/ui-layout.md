# Circles — UI Layout

## Current State

Circles is implemented as a lightweight 2D canvas loop.

## Controls

The live controls cover circle count, display mode, cycle timing, and visual behaviour. `displayMode` is guarded with a default so missing values do not throw.

## Animation

- Loop animation is frame-driven.
- `animatableParams: []` is declared.
- `loopFrames` remains static; if `cycleFrames` changes, export loop length may not match the visual cycle. This is a known limitation.

## Export

Static PNG is available through the host export path. Loop export follows the static `loopFrames` metadata.

## Performance Note

The workload is low risk. No worker/GPU path is implemented or required for normal settings.
