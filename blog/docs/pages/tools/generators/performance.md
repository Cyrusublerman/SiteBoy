# Generator Performance

Performance law for the generator host.

## 1. Goal Order

Priority order:
1. Keep the page responsive.
2. Keep viewport controls independent of render cost.
3. Keep animation stable enough to use.
4. Spend quality only after 1-3 hold.

## 2. Separation Rule

Three concerns must remain separate:
- simulation/update
- render
- viewport display

Viewport display includes:
- `FIT`
- `FILL`
- `ACTUAL`
- zoom
- pan

Viewport display must be transform-only work. It must not require a new simulation step.

## 3. Engine Choice

Choose the cheapest engine that satisfies the generator.

| Need | Preferred engine |
| --- | --- |
| Simple vector/canvas drawing | `2d` |
| Heavy pixel synthesis | `2d` + `computePixels` + worker |
| Existing p5-specific sketch logic | `p5` |
| Actual shader/GPU pipeline | `webgl` |

Rule:
- `p5` is not a performance upgrade
- `webgl` is only valid when GPU rendering is truly implemented

## 4. Default Mitigations

Apply these before deeper rewrites:
- cap default FPS to the minimum acceptable value
- separate structural rebuild params from draw-only params
- cache geometry and reusable arrays
- precompute static lookup data
- lower simulation resolution, then upscale in display
- avoid per-frame allocation in hot loops
- avoid per-pixel JS when a worker path exists

## 5. Main-Thread Rule

Heavy generators must degrade themselves before they degrade the whole site.

Required behaviours:
- no catch-up spiral after frame overruns
- stale frames may be dropped
- control input must remain serviceable
- pause must remain reliable

## 6. Worker Rule

Use the worker path when all are true:
- output is deterministic from `(params, frame)`
- compute can run without DOM
- output can be expressed as pixels or transferable buffer data

Do not use worker offload for:
- DOM-driven sketches
- p5 sketches tightly coupled to immediate p5 drawing state
- pipelines that cannot serialise their compute state

## 7. p5 Rule

Use p5 only when the sketch genuinely needs p5 semantics.

If a p5 sketch is heavy:
- set `p.noLoop()`
- let the host drive `redraw()`
- keep `pixelDensity(1)` unless there is a proven need otherwise
- bound internal resolution
- avoid treating every logical pixel as a simulation cell unless that scale is essential

## 8. WebGL Rule

Ask two questions:
1. Is rendering GPU-backed?
2. Is the heavy part actually rendering rather than simulation?

If the heavy part is CPU simulation, WebGL alone will not solve the freeze.

Use WebGL when:
- shaders can replace CPU raster work
- large point/mesh draws dominate cost
- the data path can stay on the GPU

## 9. Documentation Requirement

A heavy generator doc pack should state:
- dominant cost source
- cacheable state
- rebuild-trigger params
- current engine choice
- reason for not using worker or WebGL when omitted
