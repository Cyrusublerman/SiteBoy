# Topographic Dot Halftone — Theoretical Foundation

## 1. Scalar Field Construction

### Vector Mode

**SDF:**
$$
d = \min_{\text{curves}} \text{dist}(\mathbf{x}, \text{curve})
$$

**Geodesic:**
Distance inside region from seed curves.

**Laplace:**
$$
\nabla^2 S = 0
$$

with contour boundaries.

**Reference:** `blog/ideas/reference documentation/13_Distance_Morphology_Topology/Geodesic.md`

### Field Mode

$$
S = w_D \cdot s_D + w_N \cdot s_N + w_L \cdot s_L
$$

Where:
- \( s_D \): depth value
- \( s_N = \text{clamp}(\mathbf{N} \cdot \mathbf{v}, 0, 1) \)
- \( s_L \): luminance

## 2. Tangent Field

$$
\nabla S = \left( \frac{\partial S}{\partial x}, \frac{\partial S}{\partial y} \right)
$$

$$
\mathbf{T} = \frac{(-S_y, S_x)}{|\nabla S|}
$$

## 3. Contour-Aligned Lattice

$$
\sigma = \frac{S}{p_\sigma}
$$

$$
b = \lfloor \sigma \rfloor
$$

$$
\tau = \frac{\mathbf{x} \cdot \mathbf{T}}{p_\tau}
$$

$$
i = \lfloor \tau \rfloor, \quad j = b
$$

## 4. Dot Radius

$$
R = \text{clamp}(\alpha \cdot s_N + \beta (1-S), 0, 1)^\gamma
$$

$$
r = r_{min} + (r_{max} - r_{min}) \cdot R
$$

## 5. Dot Test

$$
d = \sqrt{u^2 + v^2}
$$

Inside if \( d < r \) and mask > 0.5.

