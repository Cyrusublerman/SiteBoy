# Conoscopy (Conoscopic Interference)

## 1. Overview
Conoscopy is an optical technique that produces interference figures from anisotropic (birefringent) crystals when viewed with convergent polarized light. The resulting patterns—called conoscopic figures or interference figures—reveal information about the crystal's optical properties and orientation.

## 2. Physical Principle

### 2.1 Setup
1. Polarized light enters crystal from multiple angles (convergent beam)
2. Each ray experiences birefringence based on its direction
3. Light exits through analyzer (crossed polarizer)
4. Interference produces characteristic patterns

### 2.2 Birefringence
In anisotropic materials, light splits into two rays with different velocities:
- **Ordinary ray**: Refractive index \(n_o\) (constant)
- **Extraordinary ray**: Refractive index \(n_e(\theta)\) (angle-dependent)

$$n_e(\theta) = \frac{n_o n_e}{\sqrt{n_o^2 \sin^2\theta + n_e^2 \cos^2\theta}}$$

### 2.3 Retardation
The phase difference between ordinary and extraordinary rays:

$$\delta = \frac{2\pi d}{\lambda}(n_e(\theta) - n_o)$$

Where \(d\) is the crystal thickness.

## 3. Interference Figure Components

### 3.1 Isochromes (Colored Rings)
Loci of equal retardation. For uniaxial crystal centered on optic axis:

$$\delta(\theta) = \frac{2\pi d}{\lambda}(n_e - n_o)\sin^2\theta$$

Colors follow Newton's scale where retardation equals integer wavelengths.

### 3.2 Isogyres (Dark Crosses)
Where light vibration directions align with polarizer/analyzer axes. For crossed polars:
- Extinction occurs when crystal axes align with polarizer/analyzer
- Creates characteristic dark cross pattern

### 3.3 Melatopes
Points where optic axis intersects viewing sphere. Light traveling along optic axis shows no birefringence.

## 4. Uniaxial Crystal Figures

### 4.1 Optic Axis View (Centered)
- Concentric colored rings (isochromes)
- Black cross (isogyres)
- Cross remains stationary during rotation

### 4.2 Formula for Ring Radii
At angle \(\theta\) from optic axis:
$$r_m = f \cdot \theta_m$$

Where \(\theta_m\) satisfies: \(\delta(\theta_m) = m\lambda\)

### 4.3 Off-Axis View
- Hyperbolic isogyres
- Asymmetric ring pattern
- Pattern shifts with stage rotation

## 5. Biaxial Crystal Figures
Two optic axes create more complex patterns:
- Two melatopes
- Figure-8 or curved isogyres
- Pattern depends on optic angle (2V)

## 6. Mathematical Model for Graphics

### 6.1 Coordinate System
For pixel at position \((x, y)\), convert to angular coordinates:
$$\theta = \arctan\left(\frac{\sqrt{x^2 + y^2}}{f}\right)$$
$$\phi = \arctan2(y, x)$$

### 6.2 Retardation Field
$$\delta(x, y) = \frac{2\pi d}{\lambda} \cdot |n_e(\theta, \phi) - n_o|$$

### 6.3 Intensity (Between Crossed Polars)
$$I = I_0 \sin^2(2\alpha) \sin^2\left(\frac{\delta}{2}\right)$$

Where \(\alpha\) is the angle between crystal axis and polarizer.

### 6.4 Isogyre Condition
Extinction when vibration direction parallel to polarizer:
$$\sin(2\alpha) = 0 \implies \alpha = 0, \frac{\pi}{2}, \pi, ...$$

### 6.5 Color Calculation
For spectral interference:
```
for wavelength in visible_spectrum:
    delta = retardation(x, y, wavelength)
    intensity = sin²(2*alpha) * sin²(delta/2)
    color += intensity * wavelength_to_rgb(wavelength)
```

## 7. Applications
- Crystal identification and orientation
- Mineralogy and petrology
- Liquid crystal display inspection
- Stress analysis in transparent materials
- Generative art (interference patterns)

## 8. References
- Wahlstrom, E. E. "Optical crystallography." 4th ed. Wiley, 1969.
- Bloss, F. D. "An introduction to the methods of optical crystallography." Holt, Rinehart and Winston, 1961.
- "Conoscopy." Wikipedia. https://en.wikipedia.org/wiki/Conoscopy

