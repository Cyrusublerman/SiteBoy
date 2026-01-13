# Spherical Harmonics

## 1. Overview
Spherical harmonics are special functions defined on the surface of a sphere. They form an orthonormal basis for square-integrable functions on the sphere, analogous to Fourier series on a circle. In computer graphics, spherical harmonics are used for efficient representation of lighting environments, ambient occlusion, and angular distributions.

## 2. Mathematical Definition
Spherical harmonics \(Y_l^m(\theta, \phi)\) are eigenfunctions of the angular part of the Laplacian on the sphere:

$$Y_l^m(\theta, \phi) = K_l^m P_l^m(\cos\theta) e^{im\phi}$$

Where:
- \(l \geq 0\): degree (band)
- \(-l \leq m \leq l\): order
- \(P_l^m\): associated Legendre polynomial
- \(K_l^m\): normalization constant

### 2.1 Normalization Constant
$$K_l^m = \sqrt{\frac{(2l+1)}{4\pi} \frac{(l-|m|)!}{(l+|m|)!}}$$

### 2.2 Real Spherical Harmonics
For graphics, real-valued form is preferred:

$$Y_l^m = \begin{cases}
\sqrt{2} K_l^m P_l^m(\cos\theta) \cos(m\phi) & m > 0 \\
K_l^0 P_l^0(\cos\theta) & m = 0 \\
\sqrt{2} K_l^{|m|} P_l^{|m|}(\cos\theta) \sin(|m|\phi) & m < 0
\end{cases}$$

## 3. First Few Spherical Harmonics

### 3.1 Band 0 (l=0): Constant
$$Y_0^0 = \frac{1}{2}\sqrt{\frac{1}{\pi}}$$

### 3.2 Band 1 (l=1): Linear (Directional)
$$Y_1^{-1} = \frac{1}{2}\sqrt{\frac{3}{\pi}} \cdot \frac{y}{r}$$
$$Y_1^{0} = \frac{1}{2}\sqrt{\frac{3}{\pi}} \cdot \frac{z}{r}$$
$$Y_1^{1} = \frac{1}{2}\sqrt{\frac{3}{\pi}} \cdot \frac{x}{r}$$

### 3.3 Band 2 (l=2): Quadratic
$$Y_2^{-2} = \frac{1}{2}\sqrt{\frac{15}{\pi}} \cdot \frac{xy}{r^2}$$
$$Y_2^{-1} = \frac{1}{2}\sqrt{\frac{15}{\pi}} \cdot \frac{yz}{r^2}$$
$$Y_2^{0} = \frac{1}{4}\sqrt{\frac{5}{\pi}} \cdot \frac{3z^2 - r^2}{r^2}$$
$$Y_2^{1} = \frac{1}{2}\sqrt{\frac{15}{\pi}} \cdot \frac{xz}{r^2}$$
$$Y_2^{2} = \frac{1}{4}\sqrt{\frac{15}{\pi}} \cdot \frac{x^2 - y^2}{r^2}$$

## 4. Properties

### 4.1 Orthonormality
$$\int_0^{2\pi}\int_0^{\pi} Y_l^m Y_{l'}^{m'} \sin\theta \, d\theta \, d\phi = \delta_{ll'}\delta_{mm'}$$

### 4.2 Number of Coefficients
Up to band \(l\): \((l+1)^2\) coefficients

| Bands | Coefficients |
|-------|-------------|
| 0 | 1 |
| 0-1 | 4 |
| 0-2 | 9 |
| 0-3 | 16 |

### 4.3 Rotation
SH coefficients transform via Wigner D-matrices under rotation.

## 5. Projection and Reconstruction

### 5.1 Projection (Analysis)
Project function \(f(\theta, \phi)\) onto SH basis:

$$c_l^m = \int_0^{2\pi}\int_0^{\pi} f(\theta, \phi) Y_l^m(\theta, \phi) \sin\theta \, d\theta \, d\phi$$

### 5.2 Reconstruction (Synthesis)
Reconstruct function from coefficients:

$$f(\theta, \phi) \approx \sum_{l=0}^{L}\sum_{m=-l}^{l} c_l^m Y_l^m(\theta, \phi)$$

## 6. Implementation

### 6.1 SH Basis Functions (First 9)
```javascript
// Direction as unit vector (x, y, z)
function evaluateSH(dir, band, order) {
    const x = dir[0], y = dir[1], z = dir[2];
    
    // Precomputed constants
    const C0 = 0.2820947918;  // sqrt(1/(4*PI))
    const C1 = 0.4886025119;  // sqrt(3/(4*PI))
    const C2 = [1.0925484306, 0.3153915653, 0.5462742153]; // Band 2 constants
    
    if (band === 0) return C0;
    if (band === 1) {
        if (order === -1) return C1 * y;
        if (order === 0) return C1 * z;
        if (order === 1) return C1 * x;
    }
    if (band === 2) {
        if (order === -2) return C2[0] * x * y;
        if (order === -1) return C2[0] * y * z;
        if (order === 0) return C2[1] * (3*z*z - 1);
        if (order === 1) return C2[0] * x * z;
        if (order === 2) return C2[2] * (x*x - y*y);
    }
    // Higher bands...
}
```

### 6.2 Full Evaluation (9 coefficients)
```javascript
function evaluateSH9(coeffs, dir) {
    const x = dir[0], y = dir[1], z = dir[2];
    
    return coeffs[0] * 0.282095 +
           coeffs[1] * 0.488603 * y +
           coeffs[2] * 0.488603 * z +
           coeffs[3] * 0.488603 * x +
           coeffs[4] * 1.092548 * x * y +
           coeffs[5] * 1.092548 * y * z +
           coeffs[6] * 0.315392 * (3*z*z - 1) +
           coeffs[7] * 1.092548 * x * z +
           coeffs[8] * 0.546274 * (x*x - y*y);
}
```

### 6.3 Project Environment Map
```javascript
function projectEnvMap(envMap, numBands) {
    const numCoeffs = numBands * numBands;
    const coeffs = new Array(numCoeffs).fill(0);
    
    // Monte Carlo integration over sphere
    for (let i = 0; i < numSamples; i++) {
        const dir = randomDirectionOnSphere();
        const color = sampleEnvMap(envMap, dir);
        
        for (let l = 0; l < numBands; l++) {
            for (let m = -l; m <= l; m++) {
                const idx = l * l + l + m;
                coeffs[idx] += color * evaluateSH(dir, l, m);
            }
        }
    }
    
    // Normalize by solid angle
    const weight = 4 * Math.PI / numSamples;
    return coeffs.map(c => c * weight);
}
```

## 7. Applications in Graphics

### 7.1 Irradiance Environment Maps
Store diffuse lighting as SH (9 coefficients for RGB = 27 floats).

### 7.2 Precomputed Radiance Transfer (PRT)
Store how surfaces interact with SH lighting.

### 7.3 Ambient Occlusion
Represent directional occlusion in SH.

### 7.4 Angular Distribution
Encode any spherical function (BRDFs, visibility).

## 8. References
- Ramamoorthi, R., and Hanrahan, P. "An efficient representation for irradiance environment maps." SIGGRAPH 2001.
- Green, Robin. "Spherical Harmonic Lighting: The Gritty Details." GDC 2003.
- Sloan, P., Kautz, J., and Snyder, J. "Precomputed radiance transfer for real-time rendering." SIGGRAPH 2002.
- "Spherical harmonics." Wikipedia. https://en.wikipedia.org/wiki/Spherical_harmonics

