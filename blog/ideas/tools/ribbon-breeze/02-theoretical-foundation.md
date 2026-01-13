# Ribbon Breeze — Theoretical Foundation

## 1. Problem Formulation

**Input:** Wind parameters, ribbon geometry

**Output:** Animated ribbon field

## 2. Mathematical Framework

### 2.1 Travelling Wave

$$
y(x, t) = A \sin(kx - \omega t + \phi)
$$

Where:
- \( k \): wave number
- \( \omega \): angular frequency
- \( \phi \): phase offset

**Reference:** `blog/ideas/reference documentation/08_Reaction_Diffusion_PDE/Wave_equation.md`

### 2.2 Perfect Loop

$$
\omega = \frac{2\pi M}{T}
$$

Where \( M \) is the number of complete wave cycles and \( T \) is the loop frame count.

### 2.3 Normal Field

For a curve point \( (x, y(x)) \):
$$
\mathbf{n} = \frac{(-y', 1)}{\sqrt{1 + y'^2}}
$$

**Reference:** `blog/ideas/reference documentation/09_Normal_Curvature_Tangent/Normal_geometry.md`

### 2.4 Extrusion

$$
\mathbf{p}_{back} = \mathbf{p}_{front} + h \cdot \mathbf{n}
$$

Where \( h \) is the ribbon thickness.

### 2.5 Curvature and Folds

$$
\kappa = \frac{y''}{(1 + y'^2)^{3/2}}
$$

Fold occurs at sign change of \( \kappa \).

**Reference:** `blog/ideas/reference documentation/10_Curve_Theory_Stroke_Geometry/Curvature.md`

### 2.6 Depth Sorting

Painter's algorithm: sort segments by \( z \) coordinate (here simulated via y position).

### 2.7 LFO (Low Frequency Oscillator)

$$
\text{LFO}(t) = A \sin(2\pi f t + \phi)
$$

Used for parameter modulation.

## 3. References

- Wave equation: Classical mechanics
- Painter's algorithm: Newell et al. (1972)

