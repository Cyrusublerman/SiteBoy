# Order and Disorder — UI Layout

## Parameters

### Group: Grid (3 params)

| key | type | min | max | step | default | notes |
|---|---|---|---|---|---|---|
| `gridSpacing` | slider | 2 | 30 | 1 | 6 | Pixel gap between points. Triggers rebuild. |
| `gridMargin` | slider | 0 | 80 | 2 | 10 | Inset from canvas edge. Triggers rebuild. |
| `pointSize` | slider | 1 | 8 | 0.5 | 2 | P5 `strokeWeight` for point rendering |

### Group: Noise (5 params)

| key | type | min | max | step | default | notes |
|---|---|---|---|---|---|---|
| `noiseMaxOffset` | slider | 0 | 60 | 1 | 20 | Maximum pixel displacement in disorder zone |
| `noiseSpatialScale` | slider | 0.005 | 0.15 | 0.005 | 0.03 | Spatial frequency of noise field |
| `noiseTimeScale` | slider | 0.001 | 0.05 | 0.001 | 0.016 | Rate of noise time advance per frame |
| `jiggleAmount` | slider | 0 | 10 | 0.5 | 2 | Max jiggle displacement at zone boundary |
| `jiggleSpeed` | slider | 0.01 | 0.5 | 0.01 | 0.15 | Rate of jiggle noise time advance per frame |

### Group: Influence (7 params)

| key | type | min | max | step | default | notes |
|---|---|---|---|---|---|---|
| `sourceRadius` | slider | 50 | 500 | 10 | 270 | Orbital radius of influence source |
| `innerConstraint` | slider | 50 | 400 | 10 | 195 | Radial falloff distance (inside) |
| `outerConstraint` | slider | 50 | 400 | 10 | 165 | Radial falloff distance (outside) |
| `cwConstraint` | slider | 10 | 120 | 5 | 40 | Angular arc limit, clockwise direction (degrees) |
| `ccwConstraint` | slider | 10 | 120 | 5 | 70 | Angular arc limit, counter-clockwise (degrees) |
| `blendFactor` | slider | 0 | 1 | 0.05 | 0.8 | Weight of actual radius vs source radius for arc measurement |
| `innerRatio` | slider | 0 | 1 | 0.05 | 0.4 | Core radius fraction fully inside order zone |

### Group: Animation (1 param)

| key | type | min | max | step | default | notes |
|---|---|---|---|---|---|---|
| `loopFrames` | slider | 60 | 720 | 60 | 360 | Loop period in frames. **Conflicts with `animation.loopFrames`.** |

**Total: 16 parameters.** All are functional.

## Animation Config

```js
animation: { type: 'loop', loopFrames: 360, defaultFps: 60 }
```

Same `loopFrames` conflict as `golden-grid`. Noise time is non-looping regardless (see issues).

## Presets

| Name | gridSpacing | pointSize | loopFrames | notes |
|---|---|---|---|---|
| Classic | 6 | 2 | 360 | Balanced default |
| Dense | 3 | 1 | 360 | Fine-grain grid |
| Wide Chaos | 8 | 3 | 720 | Larger disorder zone, longer loop |

**Preset format: flat object (non-standard).** Missing `values: { ... }` wrapper.

## Missing Controls

| Feature | Status |
|---|---|
| Export | No `export` block |
| `animatableParams` | Not declared |
| Canvas size | Hardcoded 1080×1080 |
