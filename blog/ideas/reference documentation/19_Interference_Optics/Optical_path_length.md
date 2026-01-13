# Optical Path Length (OPL)

## 1. Overview
Optical path length (OPL) is the product of the geometric length of a light ray's path and the refractive index of the medium through which it travels. It represents the effective distance light travels in terms of phase accumulation, determining interference patterns when multiple rays recombine.

## 2. Mathematical Definition

### 2.1 Basic Formula
For a ray traveling distance \(d\) through a medium with refractive index \(n\):

$$\text{OPL} = n \cdot d$$

### 2.2 Variable Index
For a path through varying refractive index:

$$\text{OPL} = \int_{\text{path}} n(s) \, ds$$

### 2.3 Phase Relationship
The phase accumulated by light:

$$\phi = \frac{2\pi}{\lambda_0} \cdot \text{OPL} = \frac{2\pi \cdot n \cdot d}{\lambda_0}$$

Where \(\lambda_0\) is the vacuum wavelength.

## 3. Optical Path Difference (OPD)

### 3.1 Definition
The difference in OPL between two interfering rays:

$$\text{OPD} = \text{OPL}_1 - \text{OPL}_2 = n_1 d_1 - n_2 d_2$$

### 3.2 Interference Conditions
- **Constructive**: OPD = \(m\lambda\) (integer wavelengths, bright fringe)
- **Destructive**: OPD = \((m + 0.5)\lambda\) (half-integer wavelengths, dark fringe)

### 3.3 Phase Difference
$$\Delta\phi = \frac{2\pi}{\lambda} \cdot \text{OPD}$$

Intensity for two-beam interference:
$$I = I_1 + I_2 + 2\sqrt{I_1 I_2}\cos(\Delta\phi)$$

## 4. Common Configurations

### 4.1 Thin Film
Two reflections with different path lengths:
$$\text{OPD} = 2nd\cos\theta_t$$

Where:
- \(n\) = film refractive index
- \(d\) = film thickness
- \(\theta_t\) = angle of refraction in film

### 4.2 Wedge (Variable Thickness)
$$\text{OPD}(x) = 2n \cdot d(x) = 2n \cdot x \tan\alpha$$

Creates linear fringe spacing.

### 4.3 Newton's Rings
Air gap between lens and flat:
$$\text{OPD}(r) = 2d(r) = \frac{r^2}{R}$$

Ring radii: \(r_m = \sqrt{m\lambda R}\)

### 4.4 Birefringent Crystal
Two polarization modes with different indices:
$$\text{OPD} = (n_e - n_o) \cdot d$$

## 5. Computation for Graphics

### 5.1 Per-Pixel OPD
For interference figure generation:

```
opd(x, y) = 2 * n * thickness(x, y) * cos(angle)
phase(x, y) = (2 * PI / wavelength) * opd(x, y)
intensity(x, y) = 0.5 * (1 + cos(phase(x, y)))
```

### 5.2 Spectral Integration
For realistic colors, integrate over visible spectrum:

```
for wavelength in [380nm, 780nm]:
    phase = (2 * PI / wavelength) * opd
    weight = spectral_sensitivity(wavelength)
    color += weight * intensity(phase) * wavelength_to_rgb(wavelength)
```

### 5.3 Angular Dependence
For conoscopic figures:
$$\text{OPD}(\theta, \phi) = d \cdot (n_e(\theta, \phi) - n_o)$$

Where \(n_e\) depends on ray direction relative to optic axis.

## 6. Applications
- Thin-film interference (soap bubbles, oil slicks)
- Antireflection coatings
- Interference filters
- Holography
- Conoscopic microscopy
- Structural color in nature

## 7. References
- Hecht, Eugene. "Optics." 4th ed. Addison Wesley, 2002.
- Born, Max, and Emil Wolf. "Principles of optics." Cambridge University Press, 1999.
- "Optical path length." Wikipedia. https://en.wikipedia.org/wiki/Optical_path_length

