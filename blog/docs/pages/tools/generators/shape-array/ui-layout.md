# Shape Array — UI Layout

## Parameters

### Group: Grid (3 params)

| key | type | min | max | step | default | notes |
|---|---|---|---|---|---|---|
| `cols` | slider | 3 | 20 | 1 | 10 | Number of columns |
| `rows` | slider | 3 | 20 | 1 | 10 | Number of rows |
| `spacing` | slider | 20 | 150 | 5 | 60 | Pixel gap between cell centres |

### Group: Shapes (2 params)

| key | type | min | max | step | default | notes |
|---|---|---|---|---|---|---|
| `shapeSize` | slider | 5 | 80 | 1 | 20 | Radius of each shape |
| `circleRes` | slider | 8 | 64 | 4 | 32 | Points per shape; also controls circle fidelity |

### Group: Animation (2 params)

| key | type | min | max | step | default | notes |
|---|---|---|---|---|---|---|
| `morphSpeed` | slider | 0.001 | 0.02 | 0.001 | 0.005 | `_globalT` increment per frame (frame-rate-dependent) |
| `phaseOffset` | slider | 0 | 0.5 | 0.01 | 0.1 | Phase difference per cell diagonal step |

### Group: Style (2 params)

| key | type | min | max | options | default | notes |
|---|---|---|---|---|---|---|
| `bgColor` | dropdown | — | — | ['dark','light'] | 'dark' | Background; dark=20, light=245 |
| `strokeWeight` | slider | 0.5 | 4 | 0.5 | 1.5 | Stroke width |

**Total: 9 parameters.** All are functional. `bgColor` uses `dropdown` type.

## Animation Config

```js
animation: { type: 'infinite', defaultFps: 60 }
```

No `loopFrames`. Animation is non-looping (`_globalT` based, not `frame` based).

## Presets

| Name | cols | rows | circleRes | morphSpeed | phaseOffset | bgColor |
|---|---|---|---|---|---|---|
| Classic | 10 | 10 | 32 | 0.005 | 0.1 | dark |
| Dense | 15 | 15 | 16 | 0.008 | 0.08 | dark |
| Slow Drift | 8 | 8 | 32 | 0.002 | 0.05 | light |

**Preset format: flat object (non-standard).** Missing `values: { ... }` wrapper.

## Missing Controls

| Feature | Status |
|---|---|
| Export | No `export` block |
| `animatableParams` | Not declared |
| Canvas size | Hardcoded 1080×1080 |
