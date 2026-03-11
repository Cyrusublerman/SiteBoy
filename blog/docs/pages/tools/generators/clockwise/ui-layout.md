# Clockwise — UI Layout

## Parameter Table

| Key | Label | Type | Min | Max | Step | Default | Group | Controls | Rebuild? |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `numSquares` | Squares | slider | 2 | 12 | 1 | 8 | System | Number of orbiting squares. Also determines chord geometry (angleStep, chordLen, sideLength, resolution) — changing this triggers a full rebuild and resets orbital angles to 0. Higher values produce smaller, denser squares with lower resolution. | Yes |
| `orbitRadius` | Orbit Radius | slider | 100 | 540 | 20 | 540 | System | Radius of the circular orbit path in pixels. Changing this alters chord length and therefore sideLength and resolution per square. Triggers full rebuild and angle reset. At maximum (540), the orbit edge reaches the canvas boundary. | Yes |
| `orbitSpeed` | Orbit Speed (°/frame) | slider | 0.1 | 5 | 0.1 | 1 | Motion | Angular advance of the orbit each frame in degrees. Applied as `_globalOrbitAngle += radians(orbitSpeed) × orbitDirMul`. At 1°/frame and 30fps: one revolution every 12 seconds. | No |
| `spinSpeed` | Spin Speed (°/frame) | slider | 0.1 | 5 | 0.1 | 1 | Motion | Angular advance of each square's self-rotation each frame in degrees. Applied as `_globalSpinAngle += radians(spinSpeed)`. Independent of orbit speed and direction. | No |
| `orbitDir` | Orbit Direction | dropdown | — | — | — | CCW | Motion | Sets the sign of orbit angular velocity. `'CCW'` multiplies orbitSpeed by -1 (counter-clockwise in standard screen coordinates); `'CW'` multiplies by +1. Does not affect spin direction. | No |
| `growthFactor` | Growth Factor | slider | 0.5 | 5 | 0.1 | 2.0 | Physics | Amplifies the diffusion contribution in both pulse and hue physics: `diff × growthFactor × damping`. Higher values cause faster field spreading and stronger mixing on contact. Interacts multiplicatively with `damping`. | No |
| `damping` | Damping | slider | 0.01 | 0.5 | 0.01 | 0.15 | Physics | Secondary scale on the diffusion term alongside `growthFactor`. Effective diffusion rate is `growthFactor × damping`. Lower damping slows spatial spread independently of growthFactor. | No |
| `waveDecay` | Wave Decay | slider | 0.8 | 0.99 | 0.01 | 0.96 | Physics | Per-frame multiplicative decay applied to the pulse field (grid1) only. Values near 1 preserve pulse energy for many frames; values near 0.8 cause rapid fade. Does not directly affect the hue field. | No |
| `identityForce` | Identity Force | slider | 0 | 0.1 | 0.005 | 0.01 | Physics | Pull rate at which each square's hue field returns to its own identity hue (`bias = squareIndex / numSquares`). At 0, hue drifts freely after contact; at 0.1, hue returns to identity within a few frames of separation. | No |
| `swapCooldown` | Swap Cooldown | slider | 5 | 60 | 5 | 20 | Physics | Minimum frames between successive field swaps for the same cell. Prevents cells from swapping on every frame of sustained overlap. At 30fps: minimum 5 frames ≈ 0.17s gap; maximum 60 frames = 2s gap. | No |
| `wrapAround` | Wrap Around | dropdown | — | — | — | on | Physics | Controls neighbourhood topology in physics update. `'on'` wraps the 3×3 neighbourhood toroidally at grid edges; `'off'` uses clamp-to-boundary (fewer neighbours at edges, reducing diffusion there). | No |

---

## Preset Table

| Name | Key values | Visual character |
| --- | --- | --- |
| Classic | numSquares: 8, orbitRadius: 540, orbitSpeed: 1, spinSpeed: 1, orbitDir: CCW, growthFactor: 2.0, damping: 0.15, waveDecay: 0.96, identityForce: 0.01, swapCooldown: 20, wrapAround: on | Baseline: 8 large squares at full orbit radius, moderate speed and diffusion, mild identity anchor. Each square maintains a characteristic hue with gentle diffusion. Default entry state. |
| Turbulent | numSquares: 6, orbitRadius: 400, orbitSpeed: 2, spinSpeed: 2, orbitDir: CCW, growthFactor: 3.5, damping: 0.2, waveDecay: 0.94, identityForce: 0.005, swapCooldown: 10, wrapAround: on | High energy: faster orbit and spin, stronger diffusion, rapid pulse decay, very weak identity restoration. Colour mixes aggressively during contact and fades quickly in isolation. |
| Calm | numSquares: 4, orbitRadius: 300, orbitSpeed: 0.5, spinSpeed: 0.5, orbitDir: CW, growthFactor: 1.0, damping: 0.08, waveDecay: 0.98, identityForce: 0.02, swapCooldown: 30, wrapAround: on | Low energy: fewer, slower squares at a smaller orbit; very slow diffusion; pulse persists for many frames; stronger identity anchor. CW direction reverses the visual rotation sense relative to Classic and Turbulent. |

---

## Sidebar Structure

```
PARAMS
  System
    Squares (slider)
    Orbit Radius (slider)
  Motion
    Orbit Speed (°/frame) (slider)
    Spin Speed (°/frame) (slider)
    Orbit Direction (dropdown)
  Physics
    Growth Factor (slider)
    Damping (slider)
    Wave Decay (slider)
    Identity Force (slider)
    Swap Cooldown (slider)
    Wrap Around (dropdown)
ANIMATE  (present — animation config: type: infinite, defaultFps: 30)
EXPORT   (always present)
INFO     (present — description field exists)
```

---

## UX Notes

- `growthFactor` and `damping` interact multiplicatively. The effective diffusion coefficient is `growthFactor × damping`. At growthFactor=5, damping=0.5 the effective coefficient is 2.5; at growthFactor=0.5, damping=0.5 it is 0.25. Neither label communicates this interaction. The combined product, not either value alone, controls mixing intensity.

- At `growthFactor × damping > 1`, the pulse field (grid1) can amplify rather than merely diffuse. Grid1 values are not clamped in the physics step, so sustained high-energy input (e.g. repeated swaps) can cause values to exceed [0,1] internally. The render clamp protects display but the unclamped values feed back into next-frame physics.

- `numSquares` and `orbitRadius` are the two rebuild parameters. Adjusting either live resets the orbital and spin angles to zero — producing a visible snap back to the starting position. Users editing these parameters during playback should expect an animation continuity break.

- `resolution` is not user-facing. It is derived automatically from `numSquares` and `orbitRadius` via the chord geometry formula and is clamped to [48, 180]. This means the cell density of each square changes as `numSquares` or `orbitRadius` change, and the visual granularity of the pixel grid shifts as a side-effect of adjusting those parameters.

- At `numSquares=2, orbitRadius=540`: resolution reaches 180 (32,400 cells per square), representing the maximum per-frame cell processing load. This combination also produces the largest individual squares, occupying most of the canvas and producing maximal overlap area.

- `swapCooldown` at its minimum (5) means cells that remain overlapping swap fields every 5 frames. At 30fps this is approximately 6 swap events per second per overlapping cell. In dense overlap zones this can produce flickering colour patterns rather than smooth mixing.
