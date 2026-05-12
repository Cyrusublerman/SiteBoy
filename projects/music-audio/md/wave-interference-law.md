### The wave equation at a point

Each source emits a circular wave. At a canvas pixel \((x, y)\) and animation time \(t\), the displacement contributed by source \(k\) at position \((x_k, y_k)\) with frequency \(f_k\) and amplitude \(A_k\) is:

$$\psi_k(x, y, t) = A_k \cdot \sin\!\left(\frac{2\pi \, d_k}{\lambda_k} - t\right)$$

where the distance is \(d_k = \sqrt{(x - x_k)^2 + (y - y_k)^2}\) and the spatial wavelength \(\lambda_k\) is the wave frequency parameter (a visual scale factor, not a physical wavelength in metres). The total superposition at the pixel is:

$$\Psi(x, y, t) = \sum_{k} \psi_k(x, y, t)$$

This is the standard linear superposition of monochromatic circular waves, equivalent to the 2D Huygens–Fresnel principle for coherent sources (Huygens, 1690; Fresnel, 1818).

```javascript
function waveAt(x, y, t, sources) {
    let total = 0;
    for (const { px, py, freq, amp } of sources) {
        const dist = Math.hypot(x - px, y - py);
        total += amp * Math.sin(2 * Math.PI * dist / freq - t);
    }
    return total;
}
```

The result \(\Psi\) is typically in the range \([-\sum A_k, +\sum A_k]\). It is normalised to \([-1, 1]\) before mapping to a visualisation value.

### Visualisation modes

**Particle mode** — The signed value \(\Psi\) is used as a radial displacement. Each pixel is drawn displaced from its resting position along the outward direction from the canvas centre by an amount proportional to \(\Psi\). The result shows the wave field as a surface relief.

**Density mode** — The intensity \(\Psi^2\) (or the boosted value \(|\Psi|^\gamma\) for \(\gamma \in [0.5, 5]\)) is mapped to a pixel brightness via:

$$\text{brightness} = \text{clamp}\!\left(|\Psi|^\gamma \cdot \text{boost},\ 0,\ 1\right)$$

This is the most computationally demanding mode: \(W \times H\) wave evaluations per frame. At 420×420 with five sources this is approximately 880 000 `Math.sin` calls per frame. At 60 fps this is 52.9 million evaluations per second — feasible in JavaScript on modern hardware for canvas sizes up to approximately 600×600 at 30 fps.

**Radial mode** — A coarser sampling grid (step size configurable from 1 to 20 px) computes \(\Psi\) at each grid point and renders a dot whose radius is proportional to \(|\Psi|\), producing a halftone-like representation of the interference field. This mode is an order of magnitude cheaper than density mode and is preferred for high-source-count configurations.

### Constructive and destructive interference

Where two waves arrive in phase (their path-length difference is a multiple of \(\lambda\)):

$$d_1 - d_2 = n\lambda \implies \Psi_{\text{sum}} = A_1 + A_2$$

Where they arrive antiphase (path-length difference is a half-integer multiple of \(\lambda\)):

$$d_1 - d_2 = \left(n + \tfrac{1}{2}\right)\lambda \implies \Psi_{\text{sum}} = A_1 - A_2$$

For equal amplitudes, constructive interference doubles the amplitude and destructive interference produces zero. The visual output — the Chladni-like pattern of bright (constructive) and dark (destructive) regions — is the spatial representation of the harmonic relationship between the sources.
