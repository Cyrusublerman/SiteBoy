# Shape Array — Description

Shape Array is a P5.js animation that renders a `cols × rows` grid of shapes on a 1080×1080 canvas. Each shape continuously morphs through four stages: line → triangle → square → circle. A diagonal phase offset `(col + row) × phaseOffset` staggers the morph cycle across the grid, producing a ripple wave effect.

## Morphology Sequence

Stages are indexed by `t ∈ [0, 1)`:
- t ∈ [0, 1/3): line → triangle
- t ∈ [1/3, 2/3): triangle → square
- t ∈ [2/3, 1): square → circle (`circleRes`-gon)

A "line" is a degenerate 2-gon: two vertices at the top and bottom of the shape radius, tracing a diameter. All shapes are built by uniformly sampling `circleRes` points on the perimeter of a regular n-gon and linearly interpolating between the two endpoint shapes.

## Shape Building

Each shape is constructed in three steps:
1. **Polygon vertices** (`_polygon`): `n` equally-spaced vertices on a circle of `shapeSize` radius, starting at −90°.
2. **Perimeter sampling** (`_samplePerimeter`): `circleRes` points sampled at equal arc-length intervals along the polygon perimeter.
3. **Interpolation** (`_lerpShape`): each of the `circleRes` points is linearly interpolated between the "from" and "to" sampled shapes by local stage progress.

## Phase Wave

`phase = (col + row) × phaseOffset`. Each cell's `t = (globalT + phase) % 1`. With `phaseOffset = 0.1` and `cols = rows = 10`, the diagonal phase range is 0 to 1.8, creating a full morph cycle offset across the diagonal.

## Animation Timing

`_globalT += morphSpeed` each frame. This is frame-rate-dependent — `_globalT` is not derived from the `frame` counter.

## Canvas

1080×1080. Grid is centred: `offsetX = (width − (cols−1) × spacing) / 2`. Background is `dark` (value 20) or `light` (value 245).
