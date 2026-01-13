# Thin-Film Interference

Thin-film interference occurs when light waves reflected from the top and bottom surfaces of a thin film interfere with each other, producing characteristic color patterns.

## Mathematical Definition

### Optical Path Difference (OPD)

For a thin film of thickness $d$ and refractive index $n$, illuminated at angle $\theta$:

$$\text{OPD} = 2nd\cos\theta_t$$

where $\theta_t$ is the angle of refraction inside the film (from Snell's law: $n_1\sin\theta = n\sin\theta_t$).

For normal incidence ($\theta = 0$):

$$\text{OPD} = 2nd$$

### Phase Difference

$$\Delta\phi = \frac{2\pi}{\lambda} \cdot \text{OPD} + \phi_{\text{reflection}}$$

where $\phi_{\text{reflection}}$ accounts for phase shifts at interfaces.

### Phase Shift at Reflection

- **Hard reflection** (low-n to high-n interface): $\phi = \pi$
- **Soft reflection** (high-n to low-n interface): $\phi = 0$

### Interference Conditions

**Constructive interference** (bright fringe):
$$\text{OPD} = m\lambda \quad \text{(integer wavelengths)}$$

**Destructive interference** (dark fringe):
$$\text{OPD} = (m + \tfrac{1}{2})\lambda \quad \text{(half-integer wavelengths)}$$

## Intensity Formula

For amplitude reflection coefficients $r_1$ and $r_2$:

$$I = I_0 \frac{r_1^2 + r_2^2 + 2r_1 r_2 \cos\Delta\phi}{1 + r_1^2 r_2^2 + 2r_1 r_2 \cos\Delta\phi}$$

Simplified thin-film formula:

$$I(\lambda) = I_0 \sin^2\left(\frac{\pi \cdot \text{OPD}}{\lambda}\right)$$

## Spectral Color Generation

### Michel-Lévy Color Chart

For a given OPD (retardation), the interference colors can be computed by:

1. For each wavelength $\lambda_k$ in the visible spectrum (380-780 nm):
   $$I_k = \sin^2\left(\frac{\pi \cdot \text{OPD}}{\lambda_k}\right)$$

2. Multiply by the eye's color matching functions:
   $$X = \sum_k I_k \cdot \bar{x}(\lambda_k)$$
   $$Y = \sum_k I_k \cdot \bar{y}(\lambda_k)$$
   $$Z = \sum_k I_k \cdot \bar{z}(\lambda_k)$$

3. Convert XYZ to RGB for display.

### Orders of Interference

| Order | OPD Range (nm) | Characteristic Colors |
|-------|----------------|----------------------|
| 0 | 0-200 | Black to gray |
| 1 | 200-550 | Yellow, orange, red, purple |
| 2 | 550-1100 | Blue, green, yellow, red |
| 3 | 1100-1650 | Faint colors, washed out |
| 4+ | >1650 | Nearly white |

## Conoscopic Interference Figures

In crystallography, birefringent crystals produce characteristic patterns:

### Uniaxial Crystal (Isogyre + Rings)

$$\text{OPD}(r,\theta) = B \cdot r^2$$

where $B$ is the birefringence coefficient and $r$ is radial distance from optic axis.

### Biaxial Crystal (Crossed Hyperbolae)

$$\text{OPD}(x,y) = B \cdot (x^2 - y^2)$$

### Polarisation Factor

$$I = I_0 \sin^2\left(\frac{\pi \cdot \text{OPD}}{\lambda}\right) \sin^2(2\alpha)$$

where $\alpha$ is the angle between the crystal's fast axis and the polarizer.

## Applications

- Oil slick colors
- Soap bubble iridescence
- Anti-reflection coatings
- Interference filters
- Crystallographic analysis
- Thickness measurement
- Artistic effects

## Implementation

```javascript
/**
 * Compute thin-film interference intensity for a single wavelength
 * @param {number} opd - Optical path difference in nm
 * @param {number} wavelength - Wavelength in nm
 * @returns {number} Intensity [0, 1]
 */
function thinFilmIntensity(opd, wavelength) {
    const phase = Math.PI * opd / wavelength;
    return Math.sin(phase) ** 2;
}

/**
 * Compute interference color (spectral to RGB)
 * @param {number} opd - Optical path difference in nm
 * @returns {{r: number, g: number, b: number}} RGB values [0, 1]
 */
function interferenceColor(opd) {
    // Sample visible spectrum
    const lambdaMin = 380;
    const lambdaMax = 780;
    const samples = 32;
    
    let X = 0, Y = 0, Z = 0;
    
    for (let i = 0; i < samples; i++) {
        const lambda = lambdaMin + (lambdaMax - lambdaMin) * i / (samples - 1);
        const intensity = thinFilmIntensity(opd, lambda);
        
        // Approximate color matching functions
        const [xbar, ybar, zbar] = colorMatchingFunction(lambda);
        X += intensity * xbar;
        Y += intensity * ybar;
        Z += intensity * zbar;
    }
    
    // Normalize and convert XYZ to sRGB
    const scale = samples / 32;
    X /= scale; Y /= scale; Z /= scale;
    
    return xyzToRgb(X, Y, Z);
}

/**
 * Approximate CIE 1931 color matching functions
 * @param {number} lambda - Wavelength in nm
 * @returns {number[]} [x, y, z] values
 */
function colorMatchingFunction(lambda) {
    // Simplified Gaussian approximation
    const x = 1.056 * gaussian(lambda, 599.8, 37.9) 
            + 0.362 * gaussian(lambda, 442.0, 16.0) 
            - 0.065 * gaussian(lambda, 501.1, 20.4);
    const y = 0.821 * gaussian(lambda, 568.8, 46.9) 
            + 0.286 * gaussian(lambda, 530.9, 16.3);
    const z = 1.217 * gaussian(lambda, 437.0, 11.8) 
            + 0.681 * gaussian(lambda, 459.0, 26.0);
    return [Math.max(0, x), Math.max(0, y), Math.max(0, z)];
}

function gaussian(x, mean, std) {
    return Math.exp(-0.5 * ((x - mean) / std) ** 2);
}

/**
 * Convert XYZ to sRGB
 */
function xyzToRgb(X, Y, Z) {
    // XYZ to linear RGB matrix
    let r =  3.2406 * X - 1.5372 * Y - 0.4986 * Z;
    let g = -0.9689 * X + 1.8758 * Y + 0.0415 * Z;
    let b =  0.0557 * X - 0.2040 * Y + 1.0570 * Z;
    
    // Gamma correction
    const gamma = v => v <= 0.0031308 
        ? 12.92 * v 
        : 1.055 * Math.pow(v, 1/2.4) - 0.055;
    
    return {
        r: Math.max(0, Math.min(1, gamma(r))),
        g: Math.max(0, Math.min(1, gamma(g))),
        b: Math.max(0, Math.min(1, gamma(b)))
    };
}
```

## See Also

- Optical path length
- Birefringence
- Conoscopy
- Polarization
- Newton's rings

