# Polarization (Waves)

## 1. Overview
Polarization describes the orientation of oscillations in a transverse wave, particularly electromagnetic waves like light. For light, polarization refers to the direction of the electric field vector. Understanding polarization is essential for simulating optical effects like birefringence, interference figures, and polarized filters.

## 2. Types of Polarization

### 2.1 Linear Polarization
Electric field oscillates in a single plane:
$$\mathbf{E}(z, t) = E_0 \cos(kz - \omega t + \phi) \hat{\mathbf{e}}$$

Where \(\hat{\mathbf{e}}\) is the polarization direction (e.g., \(\hat{\mathbf{x}}\) or \(\hat{\mathbf{y}}\)).

### 2.2 Circular Polarization
Electric field rotates with constant magnitude:
$$\mathbf{E}(z, t) = E_0 \left[\cos(kz - \omega t)\hat{\mathbf{x}} \pm \sin(kz - \omega t)\hat{\mathbf{y}}\right]$$

- **Right-handed** (RCP): \(+\) sign
- **Left-handed** (LCP): \(-\) sign

### 2.3 Elliptical Polarization
General case—electric field traces ellipse:
$$E_x = E_{0x}\cos(kz - \omega t)$$
$$E_y = E_{0y}\cos(kz - \omega t + \delta)$$

Where \(\delta\) is the phase difference between components.

## 3. Jones Vector Representation
Compact complex representation of polarization state:

$$\mathbf{J} = \begin{pmatrix} E_x \\ E_y \end{pmatrix} = \begin{pmatrix} E_{0x} e^{i\phi_x} \\ E_{0y} e^{i\phi_y} \end{pmatrix}$$

### 3.1 Common Jones Vectors

| Polarization | Jones Vector |
|--------------|--------------|
| Horizontal | \(\begin{pmatrix} 1 \\ 0 \end{pmatrix}\) |
| Vertical | \(\begin{pmatrix} 0 \\ 1 \end{pmatrix}\) |
| +45° | \(\frac{1}{\sqrt{2}}\begin{pmatrix} 1 \\ 1 \end{pmatrix}\) |
| -45° | \(\frac{1}{\sqrt{2}}\begin{pmatrix} 1 \\ -1 \end{pmatrix}\) |
| RCP | \(\frac{1}{\sqrt{2}}\begin{pmatrix} 1 \\ i \end{pmatrix}\) |
| LCP | \(\frac{1}{\sqrt{2}}\begin{pmatrix} 1 \\ -i \end{pmatrix}\) |

## 4. Jones Matrices (Optical Elements)

### 4.1 Linear Polarizer (Horizontal)
$$\mathbf{P}_H = \begin{pmatrix} 1 & 0 \\ 0 & 0 \end{pmatrix}$$

### 4.2 Linear Polarizer (Angle θ)
$$\mathbf{P}_\theta = \begin{pmatrix} \cos^2\theta & \sin\theta\cos\theta \\ \sin\theta\cos\theta & \sin^2\theta \end{pmatrix}$$

### 4.3 Quarter-Wave Plate (Fast Axis Horizontal)
$$\mathbf{Q} = e^{i\pi/4}\begin{pmatrix} 1 & 0 \\ 0 & i \end{pmatrix}$$

### 4.4 Half-Wave Plate (Fast Axis Horizontal)
$$\mathbf{H} = \begin{pmatrix} 1 & 0 \\ 0 & -1 \end{pmatrix}$$

### 4.5 Rotation Matrix
$$\mathbf{R}(\theta) = \begin{pmatrix} \cos\theta & -\sin\theta \\ \sin\theta & \cos\theta \end{pmatrix}$$

### 4.6 General Retarder (Phase Shift δ)
$$\mathbf{W}(\delta) = \begin{pmatrix} 1 & 0 \\ 0 & e^{i\delta} \end{pmatrix}$$

## 5. Cascading Optical Elements
Output = product of Jones matrices × input:
$$\mathbf{J}_{out} = \mathbf{M}_n \cdot \mathbf{M}_{n-1} \cdots \mathbf{M}_1 \cdot \mathbf{J}_{in}$$

## 6. Intensity Calculation
Intensity from Jones vector:
$$I = \mathbf{J}^\dagger \mathbf{J} = |E_x|^2 + |E_y|^2$$

### 6.1 Between Crossed Polarizers with Retarder
For polarizer at 0°, retarder at 45°, analyzer at 90°:
$$I = I_0 \sin^2(2\alpha) \sin^2\left(\frac{\delta}{2}\right)$$

Where \(\alpha\) is angle of retarder axis from polarizer, \(\delta\) is retardation.

## 7. Birefringence
Materials where refractive index depends on polarization:
- **Ordinary ray**: \(n_o\)
- **Extraordinary ray**: \(n_e\)

Retardation through thickness \(d\):
$$\delta = \frac{2\pi d}{\lambda}(n_e - n_o)$$

## 8. Implementation for Graphics

### 8.1 Interference Figure Simulation
```javascript
function interferenceIntensity(x, y, thickness, options = {}) {
    const { wavelength = 550e-9, ne = 1.544, no = 1.553 } = options;
    
    // Angle from center
    const angle = Math.atan2(y, x);
    
    // Retardation (simplified)
    const delta = (2 * Math.PI * thickness * (ne - no)) / wavelength;
    
    // Intensity between crossed polars
    const alpha = angle;  // Crystal axis orientation
    const intensity = Math.pow(Math.sin(2 * alpha), 2) * 
                      Math.pow(Math.sin(delta / 2), 2);
    
    return intensity;
}
```

### 8.2 Spectral Color from Retardation
```javascript
function retardationToColor(delta) {
    // Michel-Levy color chart approximation
    let r = 0, g = 0, b = 0;
    
    for (let wavelength = 380; wavelength <= 780; wavelength += 5) {
        const phase = (2 * Math.PI * delta) / (wavelength * 1e-9);
        const intensity = Math.pow(Math.sin(phase / 2), 2);
        const rgb = wavelengthToRGB(wavelength);
        r += rgb.r * intensity;
        g += rgb.g * intensity;
        b += rgb.b * intensity;
    }
    
    // Normalize
    const max = Math.max(r, g, b, 1);
    return { r: r/max, g: g/max, b: b/max };
}
```

## 9. Applications
- Conoscopic interference figures
- Stress analysis in transparent materials
- LCD display simulation
- Polarimetric imaging
- Thin-film color prediction
- Crystal identification

## 10. References
- Hecht, Eugene. "Optics." 4th ed. Addison Wesley, 2002.
- Saleh, B. E. A., and Teich, M. C. "Fundamentals of Photonics." Wiley, 2007.
- "Polarization (waves)." Wikipedia. https://en.wikipedia.org/wiki/Polarization_(waves)

