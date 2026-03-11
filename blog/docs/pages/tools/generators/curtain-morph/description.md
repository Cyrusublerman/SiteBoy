# Curtain Morph — Description

Curtain Morph is a P5.js animation that renders `ringCount` concentric polygon rings that morph through every n-gon from `minSides` to `maxSides` (and back). Wave oscillators displace each ring's points perpendicular to the curve, creating a flowing "curtain" surface. The surface is extruded (vanishing-point or parallel) and shaded by face orientation relative to a light source.

## Three-Stage Pipeline

**F1 — Shape Generator**: Builds `ringCount` concentric polygon rings at the current morph state, using the same timeline and polygon construction as `animated-lines`. Rings are area-normalised and centred. Frame-based timing from `loopFrames`.

**F2 — Curtain Builder**: For each ring:
1. Computes tangents and normals at each `resolution` point.
2. Applies a three-wave oscillator to displace points outward along their normals (creating undulation).
3. Re-computes normals from the displaced curve.
4. Classifies each point as `front` or `back` based on angle to the light source.
5. Splits the ring into same-side "runs" (segments), each of which forms a contiguous curtain face.

**F3 — Renderer**: Sorts segments by depth and draws each as a quadrilateral (front face + extruded back face) with chosen shading:
- `gradient`: `gradientSteps` filled strips from bright to dark across the extrusion depth.
- `solid`: fully white (front) or black (back).
- `solid-grey`: white (front) or mid-grey 128 (back).

## Extrusion Modes

- `vanishing`: each point moves toward the vanishing point `(540 + vpX, 540 + vpY)` by `factor × distance_to_vp`.
- `parallel`: each point moves in a fixed direction `(0, 1)` (downward) by `extrusionDist` pixels.

## Wave Oscillator

Three hardcoded sine waves `(cycles, weight, loops, phase)`:
```
wave 1: cycles=50, w=0.70, loops=200, phase=0.0
wave 2: cycles=23, w=0.50, loops=−40, phase=1.2
wave 3: cycles=10, w=0.40, loops=7,   phase=2.4
```

Combined with `_softLimit(x) = tanh(1.35x) / tanh(1.35)` to prevent saturation. `ampVariation`, `weightVariation`, and `phaseVariation` modulate per-ring.
