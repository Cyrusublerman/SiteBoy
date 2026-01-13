# Moiré Pattern

A moiré pattern is a large-scale interference pattern produced when two repetitive structures (gratings, meshes, or screens) are overlaid at an angle or with slightly different frequencies.

## Mathematical Definition

### Superposition of Gratings

For two sinusoidal gratings with wavevectors $\vec{k}_1$ and $\vec{k}_2$:

$$I_1(\vec{r}) = \frac{1}{2}\left(1 + \cos(\vec{k}_1 \cdot \vec{r} + \phi_1)\right)$$
$$I_2(\vec{r}) = \frac{1}{2}\left(1 + \cos(\vec{k}_2 \cdot \vec{r} + \phi_2)\right)$$

Product (multiplicative overlay):

$$I(\vec{r}) = I_1 \cdot I_2 = \frac{1}{4}\left(1 + \cos(\vec{k}_1 \cdot \vec{r}) + \cos(\vec{k}_2 \cdot \vec{r}) + \frac{1}{2}\cos((\vec{k}_1 - \vec{k}_2) \cdot \vec{r}) + \frac{1}{2}\cos((\vec{k}_1 + \vec{k}_2) \cdot \vec{r})\right)$$

### Beat Frequency (Moiré Wavevector)

The moiré pattern wavevector:

$$\vec{k}_m = \vec{k}_1 - \vec{k}_2$$

Moiré wavelength:

$$\lambda_m = \frac{1}{|\vec{k}_m|} = \frac{\lambda_1 \lambda_2}{\sqrt{\lambda_1^2 + \lambda_2^2 - 2\lambda_1 \lambda_2 \cos\theta}}$$

where $\theta$ is the angle between gratings.

### Small Angle Approximation

For nearly parallel gratings ($\theta \ll 1$):

$$\lambda_m \approx \frac{\lambda}{\theta}$$

where $\lambda = \lambda_1 \approx \lambda_2$.

## Grating Types

### Linear Grating

$$I(x, y) = \frac{1}{2}\left(1 + \cos\left(\frac{2\pi x}{\lambda}\right)\right)$$

### Radial Grating (Fresnel Zones)

$$I(r) = \frac{1}{2}\left(1 + \cos\left(\frac{2\pi r}{\lambda}\right)\right)$$

where $r = \sqrt{x^2 + y^2}$.

### Angular Grating

$$I(\theta) = \frac{1}{2}\left(1 + \cos(n\theta)\right)$$

where $\theta = \text{atan2}(y, x)$ and $n$ is the number of lobes.

### Combined Radial-Angular

$$I(r, \theta) = \frac{1}{2}\left(1 + \cos\left(\frac{2\pi r}{\lambda} + n\theta\right)\right)$$

Creates spiral patterns.

## Multi-Centre Interference

For two radial gratings centered at $\vec{c}_1$ and $\vec{c}_2$:

$$I(\vec{r}) = I(|\vec{r} - \vec{c}_1|) \cdot I(|\vec{r} - \vec{c}_2|)$$

Produces hyperbolic moiré fringes along curves of constant path difference.

## Combination Methods

| Method | Formula | Visual Effect |
|--------|---------|---------------|
| Product | $I_1 \cdot I_2$ | High contrast bands |
| Sum | $I_1 + I_2$ | Interference fringes |
| Minimum | $\min(I_1, I_2)$ | AND-like masking |
| Maximum | $\max(I_1, I_2)$ | OR-like overlay |
| XOR | $|I_1 - I_2|$ | Difference pattern |

## Phase Modulation

Phase-shifted gratings:

$$I(x, y, t) = \frac{1}{2}\left(1 + \cos\left(\frac{2\pi x}{\lambda} + \omega t\right)\right)$$

Creates animated moiré with speed:

$$v_m = \frac{\omega \lambda_m}{2\pi}$$

## Applications

- Strain measurement (moiré interferometry)
- Anti-counterfeiting (security printing)
- Display technology (screen-door effect)
- Artistic patterns
- Topology visualization

## Implementation

```javascript
/**
 * Linear grating intensity
 * @param {number} x - Position
 * @param {number} wavelength - Grating period
 * @param {number} phase - Phase offset (0 to 1)
 * @returns {number} Intensity [0, 1]
 */
function linearGrating(x, wavelength, phase = 0) {
    return 0.5 * (1 + Math.cos(2 * Math.PI * (x / wavelength + phase)));
}

/**
 * Radial grating intensity
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} cx - Center X
 * @param {number} cy - Center Y
 * @param {number} wavelength - Ring spacing
 * @param {number} phase - Phase offset
 * @returns {number} Intensity [0, 1]
 */
function radialGrating(x, y, cx, cy, wavelength, phase = 0) {
    const r = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
    return 0.5 * (1 + Math.cos(2 * Math.PI * (r / wavelength + phase)));
}

/**
 * Angular grating intensity
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} cx - Center X
 * @param {number} cy - Center Y
 * @param {number} n - Number of lobes
 * @param {number} phase - Angular phase offset (radians)
 * @returns {number} Intensity [0, 1]
 */
function angularGrating(x, y, cx, cy, n, phase = 0) {
    const theta = Math.atan2(y - cy, x - cx);
    return 0.5 * (1 + Math.cos(n * theta + phase));
}

/**
 * Combined moiré from two gratings
 * @param {Function} grating1 - First grating function
 * @param {Function} grating2 - Second grating function
 * @param {string} mode - Combination: 'product', 'sum', 'min', 'max', 'xor'
 * @returns {Function} Combined grating function
 */
function combineMoire(grating1, grating2, mode = 'product') {
    return (x, y) => {
        const i1 = grating1(x, y);
        const i2 = grating2(x, y);
        switch (mode) {
            case 'product': return i1 * i2;
            case 'sum': return (i1 + i2) / 2;
            case 'min': return Math.min(i1, i2);
            case 'max': return Math.max(i1, i2);
            case 'xor': return Math.abs(i1 - i2);
            default: return i1 * i2;
        }
    };
}
```

## See Also

- Interference (wave)
- Diffraction grating
- Fresnel zone plate
- Beat frequency

