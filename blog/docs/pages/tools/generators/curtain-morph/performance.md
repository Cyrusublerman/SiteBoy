# Curtain Morph — Performance

## Per-Frame Complexity

### F1 — Shape Building

`_buildPolygonRings` called once or twice (morph frames). Each call: `ringCount × (resolution + 1)` points. At max: `10 × 3001 = 30,010` points × 2 builds = 60,020 point computations (trig per point).

### F2 — Curtain Builder

Per ring per point:
- Tangent calculation: O(1)
- `_oscillate`: 3 waves × (1 sin + 1 cos per wave) = ~6 trig calls. Plus tanh for `_softLimit`.
- Normal re-computation, dot product: O(1)
- Segment splitting: amortised O(resolution)

Total F2: O(ringCount × resolution) trig calls. At `ringCount=10`, `resolution=3000`: 30,000 × (6 trig + 1 tanh) ≈ 210,000 transcendental function calls/frame.

### F3 — Gradient Drawing

Number of segments per ring ≈ 2 (front/back split on a closed curve). Total segments ≈ `ringCount × 2 = 20`. Per segment with `gradientSteps = 60`:
- 60 filled polygons, each with `resolution/2 × 2 = resolution` vertex calls.
- At `resolution = 3000`, `gradientSteps = 60`: 20 × 60 × 3000 × 2 = 7,200,000 vertex calls/frame.

This is the dominant cost. Even at default (`resolution = 2000`, `gradientSteps = 30`): 20 × 30 × 2000 × 2 = 2,400,000 vertex calls/frame — likely to cause significant frame drops.

## Frame Budget Analysis

| resolution | gradientSteps | ringCount | Est. vertex calls/frame | Risk |
|---|---|---|---|---|
| 2000 (default) | 30 (default) | 5 | ~600,000 | Moderate |
| 2000 | 60 | 10 | ~2,400,000 | High |
| 3000 | 60 | 10 | ~7,200,000 | Severe |

## Optimisation Candidates

1. **Reduce gradient resolution**: Use fewer gradient steps (5–10 for interactive, 30+ for export).
2. **Reduce ring resolution**: At `resolution = 200`, visual quality drops slightly but performance is 10× better.
3. **Solid/solid-grey mode**: 20 draw calls per frame vs 600+. Dramatically faster.
4. **Cache polygon rings**: During hold segments, ring geometry is constant. Only re-displace with oscillator (which changes every frame). Cache `_buildPolygonRings` output separately.
5. **Batch `beginShape/endShape`**: Each gradient strip is a separate `beginShape`; this creates many separate GPU draw calls.

## Worker Feasibility

**Not feasible.** Uses P5 API for rendering. The F1 and F2 math phases could theoretically run in a Worker, but the data transfer overhead for `ringCount × resolution` points each frame would offset the gain.
