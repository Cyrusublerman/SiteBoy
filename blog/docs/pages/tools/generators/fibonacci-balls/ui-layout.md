# Fibonacci Balls — UI Layout

## Parameters

### Group: Circles (2 params)

| key | type | min | max | step | default | notes |
|---|---|---|---|---|---|---|
| `fibIndexForCanvas` | slider | 10 | 15 | 1 | 14 | Canvas size = F[index]; 14→610px, 15→987px. Triggers rebuild. |
| `maxFibIndex` | slider | 4 | 12 | 1 | 12 | Upper bound (exclusive) of Fibonacci radii set. Triggers rebuild. |

### Group: Physics (7 params)

| key | type | min | max | step | default | notes |
|---|---|---|---|---|---|---|
| `outerSpeed` | slider | 0.1 | 3 | 0.1 | 0.5 | Initial outer circle speed magnitude |
| `innerSpeed` | slider | 0.1 | 3 | 0.1 | 0.3 | Initial inner ball speed magnitude |
| `restitution` | slider | 0.5 | 1 | 0.05 | 0.95 | Velocity retained post-collision/wall-bounce |
| `collisionPasses` | slider | 1 | 16 | 1 | 8 | Position-correction iterations per frame |
| `separationStrength` | slider | 0.1 | 1 | 0.1 | 0.5 | Position push per separation pass |
| `collisionDamping` | slider | 0.1 | 1 | 0.05 | 0.5 | Speed scale after velocity resolution |
| `velocityGrowth` | slider | 1 | 1.05 | 0.001 | 1.01 | Per-frame velocity multiplier (unbounded growth) |

### Group: Colour (3 params)

| key | type | min | max | step | default | notes |
|---|---|---|---|---|---|---|
| `hueShiftScale` | slider | 0 | 100 | 5 | 50 | Max hue shift per collision (degrees) |
| `satShiftScale` | slider | 0 | 30 | 1 | 15 | Max saturation shift per collision |
| `lightShiftScale` | slider | 0 | 40 | 2 | 20 | Max lightness shift per collision |

### Group: Trails (2 params)

| key | type | min | max | step | default | notes |
|---|---|---|---|---|---|---|
| `trailLength` | slider | 0 | 15 | 1 | 5 | Number of ghost positions stored per ball |
| `trailAlphaDecay` | slider | 0.3 | 0.95 | 0.05 | 0.6 | Per-step opacity retention for trail ghosts |

**Total: 14 parameters.** All are functional. No inert parameters.

## Animation Config

```js
animation: { type: 'infinite', defaultFps: 60 }
```

No `loopDuration`, `loopFrames`, or `canPrerender`. Animation is non-looping and cannot be pre-rendered.

## Presets

| Name | fibIndexForCanvas | maxFibIndex | outerSpeed | innerSpeed | restitution | collisionPasses | description |
|---|---|---|---|---|---|---|---|
| Classic | 14 | 12 | 0.5 | 0.3 | 0.95 | 8 | Balanced default |
| Bouncy | 14 | 10 | 1.5 | 1.0 | 0.98 | 12 | Fewer, faster circles |
| Dense | 14 | 12 | 0.3 | 0.2 | 0.90 | 6 | Slow, full set |

**Preset format: flat object (non-standard).** All other generators use `{ name, values: {...} }`. Fibonacci Balls presets lack the `values` wrapper.

## Missing Controls

| Feature | Status |
|---|---|
| Play/Pause | Host transport |
| Export | No `export` block; no PNG/GIF/WebM |
| Canvas Width/Height | Not exposed; canvas size is Fibonacci-derived |
| `animatableParams` | Not declared |
