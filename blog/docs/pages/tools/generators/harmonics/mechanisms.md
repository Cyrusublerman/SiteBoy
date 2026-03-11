# Harmonics — Mechanisms

## Algorithm Class

Parametric scatter plot of musical frequency ratio pairs, animated by wall-clock time through interval and view transitions. Motion-blur trail via partial canvas clear per frame.

## Mathematical Model

### Coordinate Functions (getCoordinates)

**lateralClosed (Lissajous, cos/sin):**
```
x = scale · cos(a · t)
y = scale · sin(b · t)
```

**lateralOpen (Lissajous, sin/sin):**
```
x = scale · sin(a · t)
y = scale · sin(b · t)
```

**concurrent (polar, same direction):**
```
r = baseRadius · (1 + 0.6 · sin(b · t))
θ = a · t
x = r · cos(θ),  y = r · sin(θ)
```

**counterCurrent (polar, differential):**
```
r = baseRadius · (1 + 0.6 · sin(b · t))
θ = (a − b) · t
x = r · cos(θ),  y = r · sin(θ)
```

`scale = min(W, H) × 0.35`. `baseRadius = scale × 0.7`.

### Time Warp

```
timeWarp(x):
  numIntervals = 12
  scaledProgress = x × numIntervals
  currentInterval = floor(scaledProgress)
  localProgress = scaledProgress − currentInterval
  eased = smoothstep(smoothstep(localProgress))
  return (currentInterval + eased) / numIntervals
```

`smoothstep(t) = t²(3 − 2t)`. Double application increases the slowdown effect near interval endpoints.

### Animation State (wall clock)

```
elapsed = (Date.now() − startTime) / 1000          // seconds
cycleTime = elapsed mod totalCycleDuration
passIndex = floor(cycleTime / passDuration)
timeInPass = cycleTime mod passDuration
linearProgress = timeInPass / passDuration
warpedProgress = timeWarp(linearProgress)
```

`totalCycleDuration = passDuration × 8`.

### Interval Interpolation

```
ratioProgress = warpedProgress × (intervals.length − 1)   // ascending pass
              | (intervals.length − 1) × (1 − warpedProgress)  // descending pass
ratioIndex = floor(ratioProgress)
ratioT = ratioProgress − ratioIndex
a = intervals[ratioIndex][0] + (intervals[ratioIndex+1][0] − intervals[ratioIndex][0]) × ratioT
b = intervals[ratioIndex][1] + (intervals[ratioIndex+1][1] − intervals[ratioIndex][1]) × ratioT
```

### View Interpolation

During descending passes only (`!isAscending`), `viewProgress = warpedProgress`. During ascending passes, `viewProgress = 0` (no cross-fade).

```
x_final = cx + current.x × (1 − viewProgress) + next.x × viewProgress
y_final = cy + current.y × (1 − viewProgress) + next.y × viewProgress
```

### Number of Cycles per Pass

```
cycles = max(2, ceil(max(a, b)) × 2)
```

This ensures the full curve traces all its petals/loops within the `[0, 2π × cycles]` parameter range.

## Function Inventory

| Function | Signature | Purpose |
|---|---|---|
| `timeWarp` | `(x) → float` | Double-smoothstep time warping per interval segment |
| `getCoordinates` | `(t, ratio, view, scale, baseRadius) → {x, y}` | Parametric curve coordinates for one view mode |
| `SCRIPT_CONFIG.onInit` | `(params, ctx, canvas)` | Initialise `startTime = Date.now()`, set `passDuration` and `totalCycleDuration` |
| `SCRIPT_CONFIG.onParamChange` | `(key, value, params)` | Update `passDuration` and `totalCycleDuration` when `passDuration` changes |
| `SCRIPT_CONFIG.draw` | `(ctx, canvas, params, frame)` | Per-frame: compute animation state, partial clear, draw point cloud |

## State Model

| Variable | Scope | Mutated? | Notes |
|---|---|---|---|
| `startTime` | module-level | Yes (onInit) | `Date.now()` at initialisation |
| `passDuration` | module-level | Yes (onInit, onParamChange) | Seconds per pass |
| `totalCycleDuration` | module-level | Yes (onInit, onParamChange) | `passDuration × 8` |
| `intervals` | module constant | No | 13 just-intonation ratios |
| `views` | module constant | No | 4 view mode names |

**Standards violation:** All three mutable variables are module-level.

## Render Pipeline

```
draw(ctx, canvas, params, frame)
  │
  ├─ 1. Compute elapsed, cycleTime, passIndex, timeInPass from Date.now()
  ├─ 2. Determine isAscending, viewSegment, currentViewIndex, nextViewIndex
  ├─ 3. Compute warpedProgress via timeWarp
  ├─ 4. Compute ratioProgress → interpolated currentRatio [a, b]
  ├─ 5. Compute viewProgress (non-zero only on descending passes)
  ├─ 6. Partial canvas clear: fillRect with rgba(0,0,0, motionBlur)
  ├─ 7. Set fillStyle = '#c0c0c0'
  └─ 8. For i = 0..points−1:
       ├─ angle = (i/points) × 2π × cycles
       ├─ current = getCoordinates(angle, currentRatio, currentView, scale, baseRadius)
       ├─ next = getCoordinates(angle, currentRatio, nextView, scale, baseRadius)
       ├─ x,y = lerp(current, next, viewProgress) + center
       └─ ctx.arc(x, y, pointSize, 0, 2π); ctx.fill()
```

## Non-Standard Lifecycle Hooks

`SCRIPT_CONFIG.onInit` and `SCRIPT_CONFIG.onParamChange` are non-standard fields for the `.gen.js` format. Their support depends on the host (`generative-tool-host.js`) implementing these hooks. If `onInit` is not called by the host, `startTime = null` and the animation will malfunction (`Date.now() - null` returns a large number that wraps erratically).
