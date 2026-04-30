# Harmonics — Description

Harmonics visualises the 13 just-intonation musical intervals (unison through octave) as parametric curves — specifically as Lissajous and polar variants — cycling continuously through interval ratios and view modes over a configurable period.

The generator draws a scatter plot of `points` particles tracing the current interval's curve. Each frame, a translucent black fill creates a motion-blur accumulation effect (`motionBlur` controls the alpha of the overlay, effectively the decay rate of trails).

## Interval System

The 13 intervals and their frequency ratios (just intonation):

| Index | Interval | Ratio |
|---|---|---|
| 0 | Unison | 1:1 |
| 1 | Minor second | 16:15 |
| 2 | Major second | 9:8 |
| 3 | Minor third | 6:5 |
| 4 | Major third | 5:4 |
| 5 | Perfect fourth | 4:3 |
| 6 | Tritone | 45:32 |
| 7 | Perfect fifth | 3:2 |
| 8 | Minor sixth | 8:5 |
| 9 | Major sixth | 5:3 |
| 10 | Minor seventh | 9:5 |
| 11 | Major seventh | 15:8 |
| 12 | Octave | 2:1 |

## Animation Cycle

The full cycle is `passDuration × 8` seconds (default 720 s = 12 minutes). The cycle is divided into 8 passes. Alternating passes ascend (unison → octave) and descend (octave → unison) through the interval ratios. Each pair of consecutive passes covers one of the 4 views. The view cross-fades during descending passes.

## View Modes

Four parametric view functions produce different curve geometries from the same frequency ratio `(a:b)`:

| View | Curve Type | Equations |
|---|---|---|
| `lateralClosed` | Lissajous (cos/sin) | `x = s·cos(a·t)`, `y = s·sin(b·t)` |
| `lateralOpen` | Lissajous (sin/sin) | `x = s·sin(a·t)`, `y = s·sin(b·t)` |
| `concurrent` | Polar modulated | `r = R₀·(1 + 0.6·sin(b·t))`, `θ = a·t` |
| `counterCurrent` | Polar differential | `r = R₀·(1 + 0.6·sin(b·t))`, `θ = (a−b)·t` |

## Time Warp

The animation uses a double-smoothstep time warp to slow down near the pure intervals and accelerate through irrational ratios between them. The warp function `timeWarp(x)` applies `smoothstep(smoothstep(localProgress))` within each interval segment, producing natural-feeling pauses at harmonic ratios.

## Interpolation

Between consecutive intervals, the frequency ratios are linearly interpolated: `a_interp = lerp(a_k, a_{k+1}, t)`, `b_interp = lerp(b_k, b_{k+1}, t)`. Between views, the particle positions are linearly interpolated from the current view to the next.

The animation is driven by frame index (`elapsed = frame / fps`), so timing is deterministic for a given frame/parameter set.
