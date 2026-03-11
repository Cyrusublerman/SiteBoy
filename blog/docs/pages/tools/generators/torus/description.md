# Torus — Description

Torus renders an animated wireframe 3D torus (a surface of revolution) on an 800×800 canvas. The animation is a seamless loop of `cycleFrames` frames (default 3600 at 60 FPS = 60 seconds per loop) in which the torus rotates fully around the X axis.

The torus surface is parameterised by two angles:
- θ (toroidal angle): position around the major circle.
- φ (poloidal angle): position around the minor circle.

The 3D point on the surface at `(θ, φ)` is:
```
x = (R + r·cos(φ))·cos(θ)
y = (R + r·cos(φ))·sin(θ)
z = r·sin(φ)
```
where `R = r = minDim × torusSize` (major and minor radii are locked equal, producing a horn torus when torusSize ≥ 0.25).

The generator renders two types of curves on the torus:

**Cross-section ellipses (torus mesh):** 36 evenly-spaced poloidal circles (fixed φ = constant, θ varies) are drawn as filled grey ellipses with 25% alpha. These form the "rings" of the torus. Displayed only when `showTorusMesh` is true.

**Toroidal surface spirals:** `numSpirals` spirals wind around the torus in both clockwise and counter-clockwise directions simultaneously (`2 × numSpirals` total). Each spiral is parameterised by t ∈ [0, 1]:
```
φ(t) = t × 2π
θ(t) = t × spiralWinds × 2π × (±1) + spiralRotation + offset_i
```
where `offset_i = (i / numSpirals) × 2π` spaces the spirals evenly. Each spiral is drawn as a polyline of 1001 points.

Animation: at each frame, three rotation angles advance together — `torusRotation`, `spiralRotation` (counter-direction), and `xRotation` — all driven by `frame / cycleFrames`. This produces a compound rotation where the torus and spirals move in opposite directions simultaneously.

Projection: a custom `project3D` function applies two sequential X-axis rotations (frame-driven `xRotation` plus static `viewAngleX`) and a partial Y-axis rotation (`viewAngleY`) to project from 3D to 2D canvas coordinates. No perspective divide — the projection is orthographic.

Visual: monochrome. Mesh fills are `rgba(192, 192, 192, 0.25)`. Spiral strokes are `#c0c0c0`. Background is black.
