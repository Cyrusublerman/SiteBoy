# Interference Figure Generator — Theoretical Foundation

## 1. Problem Formulation

**Input:** OPD field parameters, spectral settings

**Output:** RGB interference pattern

## 2. Mathematical Framework

### 2.1 Coordinate System

Normalized coordinates \( (u, v) \in [-1, 1]^2 \), polar conversion:
$$
r = \sqrt{x^2 + y^2}, \quad \theta = \arctan2(y, x)
$$

### 2.2 Basis Fields

| Field | Formula |
|-------|---------|
| Radial | \( F_r = r \) |
| Spiral | \( F_s = r + s \cdot \theta \) |
| Wedge X | \( F_{wx} = x \) |
| Wedge Y | \( F_{wy} = y \) |
| Angular n | \( F_n = r \cdot \cos(n\theta) \) |
| Saddle | \( F_{sd} = x^2 - y^2 \) |
| Square | \( F_{sq} = x^4 + y^4 \) |

### 2.3 OPD Field

$$
D(\mathbf{x}) = \sum_i w_i F_i(\mathbf{x}) + A_n \cdot n(\mathbf{x})
$$

**Reference:** `blog/ideas/reference documentation/19_Interference_Optics/Optical_path_length.md`

### 2.4 Phase Retardation

$$
\Delta(\mathbf{x}, \lambda) = \frac{2\pi D(\mathbf{x})}{\lambda}
$$

### 2.5 Intensity

$$
I(\mathbf{x}, \lambda) = \sin^2\left( \frac{\Delta}{2} \right)
$$

**Reference:** `blog/ideas/reference documentation/19_Interference_Optics/Thin-film_interference.md`

### 2.6 Spectral to RGB

Sample K wavelengths, convert via XYZ color matching functions:
$$
\mathbf{RGB} = M_{XYZ \to RGB} \cdot \sum_k I(\lambda_k) \cdot \bar{xyz}(\lambda_k)
$$

### 2.7 Polarisation Factor

$$
I_{pol} = \sin^2(2\theta_{pol})
$$

**Reference:** `blog/ideas/reference documentation/19_Interference_Optics/Conoscopy.md`

## 3. References

- Conoscopic figures: Hartshorne & Stuart
- Thin-film interference: Born & Wolf

