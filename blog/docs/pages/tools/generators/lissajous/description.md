# Lissajous Curves — Description

Lissajous Curves models a generalised family of parametric plane curves whose X and Y coordinates are each defined as a sum of up to two trigonometric terms plus a multiplicative modulation term. The mathematical basis is the generalised Lissajous figure: a curve traced by two independent periodic signals driving orthogonal axes, extended with amplitude, frequency, phase, signed power exponent, and cross-term modulation.

The core parametric equation, evaluated at t ∈ [0, 2π] with `points` samples:

X(t) = Ax1 · signedPow(cos(wx1·t + φx1), px1) + Ax2 · signedPow(cos(wx2·t + φx2), px2) + Mx · signedPow(cos(wxm1·t + φxm1), pxm1) · signedPow(sin(wxm2·t + φxm2), pxm2)

Y(t) uses identical structure with sine as the base function and independent amplitude (Ay), frequency (wy), phase (φy), and power (py) controls.

The `signedPow(v, p)` function computes `sign(v) × |v|^p`, enabling continuous distortion of the waveform through non-integer exponents: p < 1 rounds peaks toward a square wave profile, p > 1 sharpens peaks toward a spike. Negative powers invert the profile. This extends standard Lissajous curves (which use p=1) into a much larger family.

The modulation term for each axis is a product of two independently parameterised harmonic functions, introducing amplitude-modulated interference patterns that are not achievable with simple sums.

Visually, the output is a white stroke path on a black 800×800 canvas. Classic Lissajous figures appear at integer frequency ratios with both terms active; the rosette forms (e.g. cos(t) − cos(3t), sin(t) − sin(3t)) arise from subtraction; high-frequency presets (100–550hz) produce dense, filament-like or mesh-like structures. Power exponents produce cusp distortions and cubic/quintic star-shaped variants. Modulated presets ("Woven Web", "Interference Pattern") generate interference mesh patterns that are closed forms.

What makes it distinct: the combination of signed power exponents with two independent terms plus modulation per axis produces a parameter space far larger than standard Lissajous figures. Most generators in the parametric category use a single sin/cos pair; this generator uses six frequency parameters, six power parameters, and two modulation amplitudes per axis.

Algorithm origin: classical Lissajous figures (Jules Antoine Lissajous, 1857). The `signedPow` extension and multi-term sum are bespoke generalisations, not a named algorithm. The parametric evaluation structure is specific to this tool.

Scope boundary: Lissajous Curves does not animate the curve over time by sweeping the parameter t — it renders the complete static curve for one full period [0, 2π] per frame. Animation (via the host's `animatableParams` system) works by modifying the parameters between frames, not by advancing t. The generator does not draw orbit traces, trail effects, or motion blur. It renders a single-colour white stroke with no fill, shading, or colour variation along the curve path.
