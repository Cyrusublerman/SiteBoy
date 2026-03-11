# Golden Grid — UI Layout

## Parameters

### Group: Subdivision (2 params)

| key | type | min | max | step | default | notes |
|---|---|---|---|---|---|---|
| `maxDepth` | slider | 4 | 16 | 1 | 13 | Recursion depth; cells = 2^maxDepth |
| `loopFrames` | slider | 60 | 720 | 60 | 360 | Loop period in frames (at 60fps). **Conflicts with `animation.loopFrames`.** |

### Group: Animation (3 params)

| key | type | min | max | step | default | notes |
|---|---|---|---|---|---|---|
| `hueSpeed` | slider | 0 | 10 | 0.5 | 3 | Sawtooth cycle speed for hue |
| `satSpeed` | slider | 0 | 10 | 0.5 | 2 | Triangle wave speed for saturation |
| `lumSpeed` | slider | 0 | 5 | 0.5 | 1 | Triangle wave speed for lightness |

**Total: 5 parameters.** All are functional.

## Animation Config

```js
animation: {
  type: 'loop',
  loopFrames: 360,   // hardcoded; does not reflect params.loopFrames
  defaultFps: 60
}
```

**Conflict**: `animation.loopFrames = 360` is static, but `params.loopFrames` is user-adjustable (60–720). The host and pre-render system use `animation.loopFrames` to determine loop length; actual rendered loop is `params.loopFrames`. These will diverge when the user changes the slider.

`canPrerender` is not set but `type: 'loop'` with frame-based timing is pre-render-compatible in principle, subject to the `loopFrames` conflict above.

## Presets

| Name | maxDepth | loopFrames | hueSpeed | satSpeed | lumSpeed |
|---|---|---|---|---|---|
| Classic | 13 | 360 | 3 | 2 | 1 |
| Deep | 16 | 720 | 2 | 1 | 0.5 |
| Shallow | 8 | 180 | 5 | 3 | 2 |
| Static | 13 | 360 | 0 | 0 | 0 |

**Preset format: flat object (non-standard).** Missing `values: { ... }` wrapper.

## Missing Controls

| Feature | Status |
|---|---|
| Export | No `export` block |
| `animatableParams` | Not declared |
| Canvas size controls | Not exposed (fixed 800×800) |
