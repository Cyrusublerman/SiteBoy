# Wave Colour — UI Layout

## Parameters

### Group: Wave (4 params)

| key | type | min | max | step | default | notes |
|---|---|---|---|---|---|---|
| `amplitude` | slider | 0.1 | 10 | 0.1 | 1.0 | Wave amplitude scalar |
| `frequency` | slider | 0.05 | 0.5 | 0.01 | 0.251 | Spatial frequency (cycles/px) |
| `speed` | slider | 0.005 | 0.1 | 0.005 | 0.02 | Temporal phase advance per frame |
| `decay` | slider | 0.0005 | 0.01 | 0.0005 | 0.002 | Distance amplitude falloff |

### Group: Sources (4 params)

| key | type | min | max | step | default | notes |
|---|---|---|---|---|---|---|
| `s1Loops` | slider | 1 | 30 | 1 | 10 | Orbits per cycle, source 1 (CW, offset 0) |
| `s2Loops` | slider | 1 | 30 | 1 | 7 | Orbits per cycle, source 2 (CW, offset ½ perim) |
| `s3Loops` | slider | 1 | 30 | 1 | 18 | Orbits per cycle, source 3 (CCW, offset ¼ perim) |
| `s4Loops` | slider | 1 | 30 | 1 | 3 | Orbits per cycle, source 4 (CCW, offset ¾ perim) |

### Group: Operators (4 params)

| key | type | min | max | step | default | notes |
|---|---|---|---|---|---|---|
| `opSpeed1` | slider | 0.0005 | 0.005 | 0.0005 | 0.002 | Operator blend rate, source 1. Speed change resets all operators. |
| `opSpeed2` | slider | 0.0005 | 0.005 | 0.0005 | 0.0015 | Operator blend rate, source 2 |
| `opSpeed3` | slider | 0.0005 | 0.005 | 0.0005 | 0.0025 | Operator blend rate, source 3 |
| `opSpeed4` | slider | 0.0005 | 0.005 | 0.0005 | 0.001 | Operator blend rate, source 4 |

**Note**: `opSpeed` changes call `_initOpStates` which randomises operator selections, causing a visual discontinuity.

### Group: Render (2 params)

| key | type | min | max | step | default | notes |
|---|---|---|---|---|---|---|
| `resolution` | slider | 1 | 6 | 1 | 2 | Pixel block size; 1 = full quality, 6 = ~6× faster |
| `cycleFrames` | slider | 360 | 7200 | 360 | 3600 | Cycle period in frames. **Conflicts with `animation.loopFrames`.** |

**Total: 14 parameters.** All are functional.

## Animation Config

```js
animation: { type: 'loop', loopFrames: 3600, defaultFps: 60 }
```

`animation.loopFrames = 3600` is static; `cycleFrames` is user-adjustable. Same conflict as `golden-grid`.

## Presets

| Name | resolution | cycleFrames | s1Loops |
|---|---|---|---|
| Classic | 2 | 3600 | 10 |
| Fast Morph | 2 | 2400 | 8 |
| Low Res | 4 | 3600 | 10 |

**Preset format: flat object (non-standard).**

## Missing Controls

| Feature | Status |
|---|---|
| Export | No `export` block |
| `animatableParams` | Not declared |
| Operator family bias | Not user-controllable |
| Normal map delta | Hardcoded `delta=1` |
