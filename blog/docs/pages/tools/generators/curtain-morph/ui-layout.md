# Curtain Morph — UI Layout

## Parameters

### Group: Shape (7 params)

| key | type | min | max | step | default | notes |
|---|---|---|---|---|---|---|
| `ringCount` | slider | 1 | 10 | 1 | 5 | Number of concentric polygon rings |
| `outerRadius` | slider | 100 | 520 | 10 | 420 | Outer bounding radius |
| `polySpacing` | slider | 20 | 300 | 10 | 150 | Gap between rings |
| `resolution` | slider | 100 | 3000 | 100 | 2000 | Points per ring (resolution+1 total) |
| `minSides` | slider | 3 | 10 | 1 | 4 | Starting polygon. Triggers timeline rebuild. |
| `maxSides` | slider | 4 | 20 | 1 | 10 | Ending polygon. Triggers timeline rebuild. |
| `loopFrames` | slider | 360 | 7200 | 360 | 3600 | Loop period. Triggers timeline rebuild. **Conflicts with `animation.loopFrames`.** |

### Group: Waves (4 params)

| key | type | min | max | step | default | notes |
|---|---|---|---|---|---|---|
| `waveAmplitude` | slider | 0 | 50 | 1 | 10 | Max wave displacement (px) |
| `ampVariation` | slider | 0 | 2 | 0.1 | 0.5 | Per-ring amplitude modulation depth |
| `weightVariation` | slider | 0 | 2 | 0.1 | 1 | Per-ring wave weight modulation |
| `phaseVariation` | slider | 0 | 1 | 0.05 | 0 | Per-ring phase shift increment |

### Group: Extrusion (7 params)

| key | type | options | default | notes |
|---|---|---|---|---|
| `extrusionMode` | dropdown | ['vanishing','parallel'] | 'vanishing' | |
| `extrusionFactor` | slider 0–1 | — | 0.4 | VP depth factor (vanishing mode) |
| `extrusionDist` | slider 10–300 | — | 100 | Parallel extrusion distance |
| `vpX` | slider −540–540 | — | 0 | Vanishing point X offset from centre |
| `vpY` | slider −540–540 | — | 0 | Vanishing point Y offset from centre |
| `lightX` | slider −540–540 | — | 0 | Light source X offset |
| `lightY` | slider −540–540 | — | −300 | Light source Y offset |

### Group: Shading (4 params)

| key | type | options | default | notes |
|---|---|---|---|---|
| `shadingMode` | dropdown | ['gradient','solid','solid-grey'] | 'gradient' | |
| `gradientSteps` | slider 5–60 | — | 30 | Strips per segment in gradient mode |
| `invertSides` | dropdown | ['off','on'] | 'off' | Flip front/back classification |
| `normalSide` | dropdown | ['left','right'] | 'left' | Which side of curve is "front" |

**Total: 22 parameters.** All are functional.

## Animation Config

```js
animation: { type: 'loop', loopFrames: 3600, defaultFps: 60 }
```

Same `loopFrames` conflict as `golden-grid`/`order-disorder`. At `loopFrames = 7200`, loop is 2 minutes; pre-render would produce 7200 frames.

## Presets

| Name | ringCount | resolution | shadingMode | extrusionMode |
|---|---|---|---|---|
| Classic | 5 | 2000 | gradient | vanishing |
| Solid | 5 | 1000 | solid-grey | vanishing |
| Parallel | 4 | 1500 | gradient | parallel |

**Preset format: flat object (non-standard).** Missing `values: { ... }` wrapper.

## Missing / Unexposed

| Feature | Status |
|---|---|
| Wave shapes (hardcoded) | Not user-configurable |
| Parallel extrusion direction | Hardcoded `(0,1)` (always down) |
| Rotation from timeline | Computed but not applied |
| Export | No `export` block |
| `animatableParams` | Not declared |
