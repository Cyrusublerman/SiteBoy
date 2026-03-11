# Squares — UI Layout

## Parameters

### Group: Grid (1 param)

| key | type | min | max | step | default | notes |
|---|---|---|---|---|---|---|
| `gridSize` | slider | 20 | 80 | 5 | 50 | Active — drives GRID and spiralPath rebuild |

### Group: Timeline (2 params)

| key | type | min | max | step | default | notes |
|---|---|---|---|---|---|---|
| `speed` | slider | 0.5 | 3 | 0.1 | 1 | Active — scales time from frame |
| `seek` | slider | 0 | 240 | 1 | 0 | **INERT** — declared but not read in `draw` |

### Group: Canvas (2 params)

| key | type | min | max | step | default | notes |
|---|---|---|---|---|---|---|
| `canvasWidth` | slider | 400 | 1600 | 100 | 800 | **INERT** — host does not forward to canvas |
| `canvasHeight` | slider | 400 | 1600 | 100 | 800 | **INERT** — host does not forward to canvas |

**Total: 5 parameters.** 3 are functional, 2 are inert.

## Animation Config

```js
animation: {
  type: 'loop',
  loopDuration: 240,       // seconds
  loopFrames: 240 * 60,    // 14400 (valid only at speed=1)
  defaultFps: 60,
  defaultSpeed: 1,
  canPrerender: true
}
```

`loopFrames` is accurate only when `speed = 1`. At other speeds, the effective loop is `14400 / speed` frames.

## Presets

| Name | gridSize | speed |
|---|---|---|
| Default | 50 | 1 |
| Fine Grid | 80 | 1 |
| Coarse Grid | 25 | 1 |
| Fast | 50 | 2 |
| Slow | 50 | 0.5 |

Presets use the partial-object `{ values: {...} }` format. No `animatableParams` declared (animation is fully timeline-driven with no per-param interpolation).

## Missing from Legacy Recommendations

| Feature | Status |
|---|---|
| Play/Pause | Provided by host transport |
| Restart | Provided by host transport |
| Keyboard controls (Space, R, H) | Not implemented |
| Info hide toggle | Not implemented |
| Seek sync during playback | Seek inert |
