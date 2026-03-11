# Circles — Description

Circles renders an animation of `circleCount` nested circles where each circle orbits within its parent at a uniform angular rate. The generator creates a chain of orbital motion where the outermost circle is stationary and each inner circle orbits around the centre of its parent.

## Geometry

`circleCount` circles are generated with linearly decreasing radii:
```
largestRadius = min(W, H) / 2 × 0.9
radiusDecrement = largestRadius / count
radius_i = largestRadius − i × radiusDecrement
```

Each circle `i > 0` orbits inside circle `i−1`. The orbit radius is:
```
orbitRadius_i = radius_{i-1} − radius_i
```

All circles share the same angular rate: `orbitAngle = (frame / cycleFrames) × 2π`. Because all orbits use the same angle, the chain of circles forms a single revolving arm — a telescoping chain that rotates as one unit, not an epicycloid with different periods.

The position of circle `i` is:
```
x_i = x_{i-1} + orbitRadius_i × cos(orbitAngle)
y_i = y_{i-1} + orbitRadius_i × sin(orbitAngle)
```

This telescopes to:
```
x_i = cx + (radius_0 − radius_i) × cos(orbitAngle)
y_i = cy + (radius_0 − radius_i) × sin(orbitAngle)
```

The chain always lies along a single radial direction from the canvas centre.

## Rendering Modes

- **Lines:** Each circle is drawn as a white arc outline (`ctx.stroke()`) with a radius line from centre to edge, all rotated by `orbitAngle`.
- **B/W:** Circles drawn from outermost to innermost, alternating `#ffffff` and `#000000` fill. Produces concentric alternating rings.
- **Gradient:** Circles drawn outermost to innermost with decreasing alpha: `alpha = 1 − (i / count) × 0.7`. Produces a translucent depth effect.

## Rebuild

The `circles` array is rebuilt when `circles.length !== params.circleCount`. Canvas size changes do not trigger rebuild — `largestRadius` is only updated on rebuild (see Issues).

## Animation Loop

`type: 'loop'`, `loopFrames: 3600`. At 60 FPS, one full revolution per minute.
