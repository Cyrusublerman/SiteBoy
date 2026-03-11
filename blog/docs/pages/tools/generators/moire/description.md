# Moiré — Description

Moiré generates binary interference patterns on a 420×420 canvas by composing multiple radial gratings and optionally combining them with angular gratings. Each grating produces a sinusoidal field in normalised `[-1, 1]` canvas coordinates. The fields from multiple grating centres are combined using one of four modes (sum, product, min, max) and then threshold-clipped to binary output using configurable foreground and background colours.

The core grating function is:

```
radialGrating(x, y, cx, cy, λ, φ) = 0.5 + 0.5 · sin(2π · (r/λ + φ))
```

where `r = √((x−cx)² + (y−cy)²)` is the distance from centre `(cx, cy)`. This produces concentric sinusoidal rings centred at `(cx, cy)` with wavelength `λ` (in normalised units) and phase offset `φ`.

When `angularFreq > 0`, the radial grating is multiplied by an angular grating:

```
angularGrating(x, y, cx, cy, ω, δ) = 0.5 + 0.5 · sin(ω · atan2(y−cy, x−cx) + δ)
```

This superimposes a sectoral (spoke-like) modulation on the concentric rings, producing spiral or sector-divided patterns.

Up to 4 grating centres are supported (`gratingCount` 1–4). Centre A is always at the canvas origin. Centre B is at `(centreOffset, 0)` in normalised coordinates and activates when `gratingCount ≥ 2` and `centreOffset > 0`. Additional centres (indices 2–3) are placed by rotating the coordinate system at angle increments of `π/count`, so their gratings are effectively rotated copies of the origin grating.

Animation is driven by `frame`: `animationTime = (frame/60) · phaseSpeed`. The phase argument to each radial grating is `phaseOffset + animationTime`, advancing the rings outward each frame. The centre B position also oscillates if `centreOsc > 0`: `centreOffset_eff = centreOffset + sin(animationTime·2) · centreOsc`.

An optional mask restricts the pattern to a geometric region: circle (distance from origin), square (Chebyshev distance), or triangle (approximate half-plane SDF). The mask value is blended into the field by multiplication, then the combined field is threshold-compared and mapped to `fg`/`bg` colour via a hex-parsed RGB colour system.

Output is always a binary two-colour image — the `threshold` parameter controls the grating-field value above which a pixel is assigned `fgColor`. The `invert` toggle swaps the fg/bg assignment.

Algorithm origin: standard moiré/interference pattern technique using superposition of circular/sinusoidal gratings. No named published algorithm beyond textbook wave interference.
