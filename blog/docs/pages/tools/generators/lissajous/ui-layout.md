# Lissajous Curves — UI Layout

## Parameter Table

| Key | Label | Type | Min | Max | Step | Default | Group | Controls | Rebuild? |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `Ax1` | Amplitude | slider | -2 | 2 | 0.1 | 1 | X-Axis Term 1 | Scale factor for the first X cosine term. At 0, term 1 contributes nothing to X. Negative values invert the term. | No |
| `wx1` | Frequency | slider | -300 | 300 | 1 | 1 | X-Axis Term 1 | Angular frequency of the first X cosine: `cos(wx1·t + φx1)`. Sets the number of cosine oscillations per parameter cycle [0, 2π]. Negative values run the cycle in reverse. | No |
| `px1` | Power | slider | -7 | 7 | 0.1 | 1 | X-Axis Term 1 | Exponent applied via signedPow to the cosine value. At 1: standard cosine. At 3: sharper, more cubic profile. At <1: rounded peaks. At <0: inverts magnitudes. | No |
| `phi_x1` | Phase (φ) | slider | -6.28 | 6.28 | 0.01 | 0 | X-Axis Term 1 | Phase offset added to the argument of the first X cosine: `cos(wx1·t + phi_x1)`. Rotates the curve in parameter space. Animatable (see animation config). | No |
| `Ax2` | Amplitude | slider | -2 | 2 | 0.1 | 0 | X-Axis Term 2 | Scale factor for the second X cosine term. Default 0 means term 2 is inactive. Set to -1 with wx2>1 to produce rosette forms. | No |
| `wx2` | Frequency | slider | -300 | 300 | 1 | 1 | X-Axis Term 2 | Angular frequency of the second X cosine. Integer values with Ax2=-1 produce the classical rosette / Lissajous figure family. | No |
| `px2` | Power | slider | -7 | 7 | 0.1 | 1 | X-Axis Term 2 | Power exponent for the second X cosine. px2=3 produces cubic star forms at integer frequency ratios. | No |
| `phi_x2` | Phase (φ) | slider | -6.28 | 6.28 | 0.01 | 0 | X-Axis Term 2 | Phase offset for the second X cosine. | No |
| `Mx` | Modulation Amount | slider | -2 | 2 | 0.1 | 0 | X-Axis Modulation | Scale factor for the X modulation term (product of two harmonics). Default 0 disables modulation entirely. | No |
| `wxm1` | Freq cos (m1) | slider | 0 | 600 | 1 | 1 | X-Axis Modulation | Frequency of the cosine factor in the X modulation term. | No |
| `pxm1` | Power cos (m1) | slider | -7 | 7 | 0.1 | 1 | X-Axis Modulation | Power exponent for the cosine factor in X modulation. | No |
| `phi_xm1` | Phase cos (m1) | slider | -6.28 | 6.28 | 0.01 | 0 | X-Axis Modulation | Phase offset for the cosine factor in X modulation. | No |
| `wxm2` | Freq sin (m2) | slider | 0 | 600 | 1 | 1 | X-Axis Modulation | Frequency of the sine factor in the X modulation term. | No |
| `pxm2` | Power sin (m2) | slider | -7 | 7 | 0.1 | 1 | X-Axis Modulation | Power exponent for the sine factor in X modulation. | No |
| `phi_xm2` | Phase sin (m2) | slider | -6.28 | 6.28 | 0.01 | 0 | X-Axis Modulation | Phase offset for the sine factor in X modulation. | No |
| `Ay1` | Amplitude | slider | -2 | 2 | 0.1 | 1 | Y-Axis Term 1 | Scale factor for the first Y sine term. Independent of Ax1. | No |
| `wy1` | Frequency | slider | -300 | 300 | 1 | 1 | Y-Axis Term 1 | Angular frequency of the first Y sine. The ratio wy1:wx1 determines the fundamental Lissajous figure shape. | No |
| `py1` | Power | slider | -7 | 7 | 0.1 | 1 | Y-Axis Term 1 | Power exponent for the first Y sine. | No |
| `phi_y1` | Phase (φ) | slider | -6.28 | 6.28 | 0.01 | 0 | Y-Axis Term 1 | Phase offset for the first Y sine. Animatable. | No |
| `Ay2` | Amplitude | slider | -2 | 2 | 0.1 | 0 | Y-Axis Term 2 | Scale factor for the second Y sine term. Default 0 means term 2 is inactive. | No |
| `wy2` | Frequency | slider | -300 | 300 | 1 | 1 | Y-Axis Term 2 | Angular frequency of the second Y sine. | No |
| `py2` | Power | slider | -7 | 7 | 0.1 | 1 | Y-Axis Term 2 | Power exponent for the second Y sine. | No |
| `phi_y2` | Phase (φ) | slider | -6.28 | 6.28 | 0.01 | 0 | Y-Axis Term 2 | Phase offset for the second Y sine. Animatable. | No |
| `My` | Modulation Amount | slider | -2 | 2 | 0.1 | 0 | Y-Axis Modulation | Scale factor for the Y modulation term. Default 0 disables Y modulation. | No |
| `wym1` | Freq sin (m1) | slider | 0 | 600 | 1 | 1 | Y-Axis Modulation | Frequency of the sine factor in the Y modulation term. | No |
| `pym1` | Power sin (m1) | slider | -7 | 7 | 0.1 | 1 | Y-Axis Modulation | Power exponent for the sine factor in Y modulation. | No |
| `phi_ym1` | Phase sin (m1) | slider | -6.28 | 6.28 | 0.01 | 0 | Y-Axis Modulation | Phase offset for the sine factor in Y modulation. | No |
| `wym2` | Freq cos (m2) | slider | 0 | 600 | 1 | 1 | Y-Axis Modulation | Frequency of the cosine factor in Y modulation. | No |
| `pym2` | Power cos (m2) | slider | -7 | 7 | 0.1 | 1 | Y-Axis Modulation | Power exponent for the cosine factor in Y modulation. | No |
| `phi_ym2` | Phase cos (m2) | slider | -6.28 | 6.28 | 0.01 | 0 | Y-Axis Modulation | Phase offset for the cosine factor in Y modulation. | No |
| `scale` | Scale | slider | 20 | 300 | 5 | 120 | Global | Pixel scale factor applied to the normalised curve output: `canvas_pos = centre + normalised × scale`. At 120, a unit-amplitude curve spans ±120px from centre. | No |
| `rotation` | Rotation (°) | slider | 0 | 360 | 1 | 0 | Global | Clockwise rotation of the entire curve in degrees, applied as a 2D rotation matrix to the scaled coordinates. | No |
| `points` | Points | slider | 1000 | 80000 | 1000 | 20000 | Global | Number of parametric samples per frame. Controls curve fidelity. High-frequency presets (wxm2=200+) require 40,000+ points to avoid aliased gaps. Direct linear performance cost. | No |

---

## Preset Table

All 28 presets are defined via the `preset()` helper. Unstated keys default to: Ax1=1, wx1=1, px1=1, phi_x1=0, Ax2=0, wx2=1, px2=1, phi_x2=0, Mx=0, wxm1=1, pxm1=1, phi_xm1=0, wxm2=1, pxm2=1, phi_xm2=0, Ay1=1, wy1=1, py1=1, phi_y1=0, Ay2=0, wy2=1, py2=1, phi_y2=0, My=0, wym1=1, pym1=1, phi_ym1=0, wym2=1, pym2=1, phi_ym2=0, scale=120, rotation=0, points=20000.

| Name | Key overrides (from defaults) | Visual character |
| --- | --- | --- |
| Circle | (none) | Unit circle traced by cos/sin at 1:1 ratio |
| Rosette (1:3) | Ax2=-1, wx2=3, Ay2=-1, wy2=3 | Three-petalled rosette via cos(t)−cos(3t) / sin(t)−sin(3t) |
| Rosette (1:5) | Ax2=-1, wx2=5, Ay2=-1, wy2=5 | Five-petalled rosette |
| Dense Rosette (1:10) | Ax2=-1, wx2=10, Ay2=-1, wy2=10 | Ten-petalled, finely detailed rosette |
| Offset Loop (1:2:3) | Ax2=-1, wx2=2, Ay2=-1, wy2=3 | Asymmetric two-frequency loop |
| Involute Rosette (1:3) | Ax2=1, wx2=3, Ay2=-1, wy2=3 | cos(t)+cos(3t) / sin(t)−sin(3t): asymmetric mixed rosette |
| Involute Rosette (1:5) | Ax2=1, wx2=5, Ay2=-1, wy2=5 | Mixed-sign five-frequency involute form |
| Asymmetric Flow (3:5) | wx1=3, Ax2=-1, wx2=5, Ay2=-1, wy2=5 | Non-integer ratio producing complex orbital flow |
| Asymmetric Flow (3:5:6) | wx1=3, Ax2=-1, wx2=5, Ay2=-1, wy2=6 | Three-frequency asymmetric interference |
| Asymmetric Flow (1:5:7) | Ax2=-1, wx2=5, Ay2=-1, wy2=7 | Incommensurate-ratio open flow |
| Asymmetric Weave (200hz) | Ax2=-1, wx2=100, Ay2=-1, wy2=200, points=40000 | Dense high-frequency mesh requiring 40K points |
| Spiroform (3:5) | wx1=3, Ax2=-1, wx2=5, wy1=3, Ay2=-1, wy2=5 | Spirographic compound form |
| Cubic Star (1:2) | Ax2=-1, wx2=2, px2=3, Ay2=-1, wy2=2, py2=3 | Cubic power at 1:2 ratio produces star-like cusps |
| Cubic Spiro (1:7) | Ax2=-1, wx2=7, px2=3, Ay2=-1, wy2=7, py2=3 | Seven-pointed cubic spiro form |
| Cubic Weave (100hz) | px1=3, Ax2=-1, wx2=100, px2=3, py1=3, Ay2=-1, wy2=100, py2=3, points=40000 | Dense cubic-distorted mesh |
| Cubic Filament (180hz) | Ax2=-1, wx2=180, px2=3, Ay2=-1, wy2=180, py2=3, points=40000 | Fine filament network at cubic 180hz |
| Cubic Static (550hz) | Ax2=-1, wx2=550, px2=3, Ay2=-1, wy2=550, py2=3, points=40000 | Near-static dense cubic interference at 550hz |
| Quintic Filament (250hz) | Ax2=-1, wx2=250, px2=5, Ay2=-1, wy2=250, py2=3, points=40000 | Mixed quintic/cubic high-frequency filament |
| Quintic Static (500hz) | Ax2=-1, wx2=500, px2=5, Ay2=-1, wy2=500, py2=3, points=40000 | Dense quintic/cubic mesh at 500hz |
| Woven Web (80hz) | Mx=-1, wxm1=1, wxm2=80, Ay2=-1, wy2=80 | Modulation-driven web; X via cross-term, Y via term 2 |
| Woven Bloom (120hz) | Ax1=2, Mx=-1, wxm1=1, wxm2=120, My=-1, wym1=2, wym2=120 | Dual-axis modulation bloom form |
| Woven Bloom (120hz) alt | Ax1=2, Mx=-1, wxm1=1, wxm2=120, My=-1, wym1=2, wym2=120, Ay1=1.2 | Slight amplitude asymmetry variant of Woven Bloom |
| Modulated Ring (60hz) | wx1=60, wy1=60, Mx=-1, wxm1=60, wxm2=1, Ay2=-1, wy2=1 | High-frequency carrier with low-frequency modulation |
| Fine Web (80hz) | Ax1=0.1, Mx=-1, wxm1=1, wxm2=80, Ay2=-1, wy2=80 | Low-amplitude carrier, modulation-dominant web |
| Warped Field (100hz) | Mx=-1, wxm1=100, wxm2=2, Ay2=-1, wy2=100 | Warped grid from high-frequency cos modulation |
| Interference Pattern (200hz) | Ax1=1.7, Mx=-1, wxm1=2, wxm2=200, Ay1=1.2, My=-1, wym1=2, wym2=200 | Dual-axis 200hz interference |
| Interference Pattern (260hz) | Ax1=1.7, Mx=-1, wxm1=260, wxm2=1, Ay1=1.2, My=-1, wym1=260, wym2=2 | Reversed modulation factor order at 260hz |
| Complex Interference (300hz) | Ax1=1.7, wx1=2, Mx=-1, wxm1=75, wxm2=75, Ay1=1.2, wy1=2, My=-1, wym1=2, wym2=300 | Three-frequency interference in all axes |

---

## Sidebar Structure

```
PARAMS
  X-Axis Term 1
    Amplitude (slider) [Ax1]
    Frequency (slider) [wx1]
    Power (slider) [px1]
    Phase (φ) (slider) [phi_x1]
  X-Axis Term 2  [defaultCollapsed: true]
    Amplitude (slider) [Ax2]
    Frequency (slider) [wx2]
    Power (slider) [px2]
    Phase (φ) (slider) [phi_x2]
  X-Axis Modulation  [defaultCollapsed: true]
    Modulation Amount (slider) [Mx]
    Freq cos (m1) (slider) [wxm1]
    Power cos (m1) (slider) [pxm1]
    Phase cos (m1) (slider) [phi_xm1]
    Freq sin (m2) (slider) [wxm2]
    Power sin (m2) (slider) [pxm2]
    Phase sin (m2) (slider) [phi_xm2]
  Y-Axis Term 1
    Amplitude (slider) [Ay1]
    Frequency (slider) [wy1]
    Power (slider) [py1]
    Phase (φ) (slider) [phi_y1]
  Y-Axis Term 2  [defaultCollapsed: true]
    Amplitude (slider) [Ay2]
    Frequency (slider) [wy2]
    Power (slider) [py2]
    Phase (φ) (slider) [phi_y2]
  Y-Axis Modulation  [defaultCollapsed: true]
    Modulation Amount (slider) [My]
    Freq sin (m1) (slider) [wym1]
    Power sin (m1) (slider) [pym1]
    Phase sin (m1) (slider) [phi_ym1]
    Freq cos (m2) (slider) [wym2]
    Power cos (m2) (slider) [pym2]
    Phase cos (m2) (slider) [phi_ym2]
  Global
    Scale (slider) [scale]
    Rotation (°) (slider) [rotation]
    Points (slider) [points]
ANIMATE  (present — type: parametric, defaultFps: 60, 11 animatable params)
EXPORT   (present — png: true, svg: false, gif: true, webm: true, sequence: true)
INFO     (present — description field exists)
```

---

## UX Notes

- The modulation groups (X-Axis Modulation, Y-Axis Modulation) are collapsed by default (`defaultCollapsed: true`). At their defaults (Mx=0, My=0), they contribute nothing to the output. Opening them is only relevant when modulation is enabled.

- The high-frequency presets (Asymmetric Weave 200hz, all Cubic/Quintic/Woven presets) override `points` to 40,000. At `points=40000` and 60fps, each frame involves 40,000 calls to `evaluate()` and 40,000 canvas lineTo calls. Frame rate will drop on lower-end hardware.

- `points` is not marked as rebuild-triggering and takes effect live. Reducing `points` on a high-frequency preset will produce visible sampling gaps (the curve path will appear gapped or aliased) because the Nyquist rate for a 550hz component requires at least 1100 samples per period — at `points=20000` and [0, 2π], wx2=550 produces 550/2π ≈ 87 samples per period, which is dense enough, but at `points=1000` it would be only 7 — visibly gapped.

- Frequency parameters (`wx1, wx2, wy1, wy2`) allow negative values: negative frequency reverses the traversal direction of that term, mirroring the resulting pattern. This is non-obvious from the slider label.

- The `rotation` parameter rotates the entire rendered curve as a rigid body. It does not change the parametric equation — it post-rotates the output coordinates. This is distinct from changing phase (which rotates the curve within parameter space).

- The `animatableParams` declaration in the animation config includes 11 parameters with defined modes (phase drift or oscillate) and rates. These are used by the host's parametric animation system. Parameters not listed (e.g. frequencies, powers) are not animated by the host system.
