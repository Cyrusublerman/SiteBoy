# Animated Lines — UI Layout

## Parameters

### Group: Shape (5 params)

| key | type | min | max | step | default | notes |
|---|---|---|---|---|---|---|
| `lineCount` | slider | 3 | 20 | 1 | 9 | Number of lines/polygon rings |
| `outerRadius` | slider | 50 | 250 | 5 | 140 | Half-width of lines; controls polygon area |
| `polySpacing` | slider | 5 | 40 | 1 | 18 | Gap between concentric polygon rings (px) |
| `resolution` | slider | 50 | 400 | 50 | 200 | Points per shape (drawing fidelity) |
| `maxSides` | slider | 10 | 60 | 5 | 50 | Highest polygon before morphing back to lines. Triggers timeline rebuild. |

### Group: Timing (ms) (4 params)

| key | type | min | max | step | default | notes |
|---|---|---|---|---|---|---|
| `holdLines` | slider | 200 | 5000 | 100 | 2000 | Hold duration on lines state (ms). Triggers rebuild. |
| `morphTime` | slider | 100 | 2000 | 100 | 2000 | Duration of lines↔polygon morph (ms). Triggers rebuild. |
| `holdPoly` | slider | 50 | 1000 | 50 | 300 | Hold duration per polygon step (ms). Triggers rebuild. |
| `fps` | slider | 30 | 120 | 30 | 60 | Simulated FPS — time-speed multiplier (see note). |

**Note on `fps`**: This is not the render frame rate. It scales `timeMs = frame × (1000 / fps)`. Setting `fps = 120` doubles animation speed; `fps = 30` halves it. The label "Simulated FPS" is unintuitive — effectively a speed control.

### Group: Style (1 param)

| key | type | min | max | step | default | notes |
|---|---|---|---|---|---|---|
| `strokeWeight` | slider | 0.5 | 5 | 0.5 | 1.5 | Line stroke width (px) |

**Total: 10 parameters.** All are functional. No inert parameters.

## Animation Config

```js
animation: { type: 'infinite', defaultFps: 60 }
```

No `loopFrames` or `canPrerender`. Animation is infinite; total cycle duration depends on `maxSides`, `holdLines`, `morphTime`, `holdPoly`. At defaults: approximately 2000 + 2000 + (49×2 + 49) × 300 + 900 + 2000 ≈ 51 s per loop.

## Presets

| Name | lineCount | maxSides | holdLines | morphTime | holdPoly |
|---|---|---|---|---|---|
| Classic | 9 | 50 | 2000 | 2000 | 300 |
| Fast | 9 | 20 | 500 | 500 | 100 |
| Sparse | 5 | 30 | 3000 | 3000 | 500 |

**Preset format: flat object (non-standard).** Missing `values: { ... }` wrapper.

## Missing Controls

| Feature | Status |
|---|---|
| Export | No `export` block |
| `animatableParams` | Not declared |
| Canvas size controls | Not exposed |
