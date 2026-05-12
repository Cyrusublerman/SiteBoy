### Parametric Curves

**Lissajous** (`#tools/lissajous`) — The general Lissajous equation used is an extended form supporting two amplitude/frequency/phase/power terms per axis plus a cross-modulation term:

$$x(t) = A_1 \cos^{p_1}(\omega_1 t + \phi_1) + A_2 \cos^{p_2}(\omega_2 t + \phi_2) + M_x \cos^{p_{m1}}(\omega_{m1} t) \sin^{p_{m2}}(\omega_{m2} t)$$

with \(y(t)\) defined by delta offsets from the \(x\) parameters. When all frequencies are integers, the curve closes after \(2\pi\); non-integer ratios produce quasi-periodic open curves. Power exponents \(p \ne 1\) produce superellipse deformations of the sine/cosine terms, dramatically expanding the morphological range beyond classical Lissajous figures. 27 curated landmarks span the parameter space from simple two-lobe figures to dense interference weavings.

**Harmonics** (`#tools/harmonics`) — Sweeps automatically through musical interval ratios (unison 1:1 → octave 2:1) using the same parametric engine as Lissajous. A time-warp function slows the sweep at simple integer ratios where closed, stable curves emerge, and accelerates through the incommensurable regions between them. Four visualisation modes (path, filled, particle, accumulation) are available.

---

### Wave Patterns

**Cymatics** (`#tools/cymatics`) — Per-pixel wave superposition with audio playback. See [Music and Audio](/projects/music-audio) for the full derivation.

**Wave Interference** (`#tools/wave-interference`) — 2D configurable wave sources with per-pixel superposition and checkpoint interpolation for parameter evolution. See [Music and Audio](/projects/music-audio).

**Wave Equation Synth** (`#tools/wave-equation-synth`) — Physical wave equation on a 2D membrane, rendered as a surface displacement map and used as a synthesis source.

---

### Phyllotaxis and Spirals

**Phyllo Spiral** (`#tools/phyllo-spiral`) — The Vogel phyllotactic model places the \(n\)-th point at polar coordinates:

$$r_n = k\sqrt{n}, \quad \theta_n = n \cdot \phi_g, \quad \phi_g = \frac{2\pi}{\varphi^2} \approx 137.508°$$

where \(\varphi = (1 + \sqrt{5})/2\) is the golden ratio and \(\phi_g\) is the golden angle (Vogel, 1979). Divergence angle is a continuous parameter; sweeping it through 137.508° shows why that specific angle maximises packing efficiency and eliminates visible parastichy rows.

**Spinning Phyllo Ball** (`#tools/spinning-phyllo-ball`) — The phyllotactic lattice mapped onto a sphere surface using the Fibonacci point-sphere mapping. Points are drawn as oriented discs whose normal vectors align radially, producing a 3D gyrating structure.

**Phyllo Plane Animated** (`#tools/phyllo-plane-animated`) — Time-animated phyllotactic layout with parameterised dot size, opacity, and divergence-angle sweeping, designed for use as a looping background or poster animation.

**Spiral N-gon 3D** (`#tools/spiral-ngon-3d`) — A 3D spiral wound around an N-gon cross-section. The locus is parameterised in cylindrical coordinates with the azimuthal angle and height linked by a spiral constant, and the radial position following the N-gon boundary function:

$$r(\theta) = \frac{R_{\text{in}}}{\cos\!\left(\theta \bmod \frac{2\pi}{N} - \frac{\pi}{N}\right)}$$

---

### Geometric Patterns

**Torus** (`#tools/torus`) — Parametric 3D torus rendered with a configurable number of surface spirals. The torus surface is:

$$\mathbf{r}(u, v) = \left((R + r\cos v)\cos u,\ (R + r\cos v)\sin u,\ r\sin v\right)$$

Surface lines are drawn as 3D paths projected onto the canvas with perspective division, with hidden-surface removal implemented via painter's algorithm (back-to-front segment ordering).

**Nested Circles** (`#tools/nested-circles`) — Rolling circle (hypotrochoid/epitrochoid) animation. For a small circle of radius \(r\) rolling inside a large circle of radius \(R\), the trace point at distance \(d\) from the rolling circle centre traces:

$$x(t) = (R - r)\cos t + d\cos\!\left(\frac{R - r}{r} t\right), \quad y(t) = (R - r)\sin t - d\sin\!\left(\frac{R - r}{r} t\right)$$

**Squares** (`#tools/squares`) — A grid of cells traversed in spiral order, each cell independently executing a choreographed animation sequence (fill, wave, rotate, scale). The temporal offset between cells creates the effect of a propagating wave. A spatial hash function provides deterministic per-cell pseudo-randomness.

**Clock** (`#tools/clock`) — An abstract analogue clock face rendered as a minimalist parametric diagram. Hour, minute, and second hands are rendered as geometric primitives; tick marks are computed from angular positions.

**Colour Square** (`#tools/colour-square`) — An interactive colour-space explorer that maps hue, saturation, and lightness (or HSV) to a 2D grid and allows navigation of the colour space by clicking.

---

### Optical Effects

**Moiré Generator** (`#tools/moire-generator`) — Two overlapping ruled-line patterns (or dot grids) displaced by a configurable angle and scale. Moiré patterns arise from the beat frequency between the two grids:

$$\lambda_{\text{beat}} = \frac{\lambda_1 \lambda_2}{|\lambda_1 - \lambda_2|}$$

for equal-pitch grids rotated by angle \(\theta\), the visible fringe spacing is \(\lambda / (2\sin(\theta/2))\).

**Interference Figure** (`#tools/interference-figure`) — A simulated optical interference figure as seen in a conoscopic polarised-light microscope. The isochromatic and isogyric patterns are computed from the optical indicatrix equations for uniaxial and biaxial crystals.
