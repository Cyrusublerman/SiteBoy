# Unified Pattern Generator — Theoretical Foundation

## 1. Problem Formulation

**Input:** Parameter vector \( P = \{spacing, jitter, p, ...\} \)

**Output:** 2D pattern image

## 2. Mathematical Framework

### 2.1 Superellipse Implicit Function

$$
f_k(\mathbf{x}) = \left( \left| \frac{u_x}{a_k} \right|^p + \left| \frac{u_y}{b_k} \right|^p \right)^{1/p} - 1
$$

Where \( \mathbf{u} = W(\mathbf{x}) - \mathbf{c}_k \).

**Reference:** `blog/ideas/reference documentation/10_Curve_Theory_Stroke_Geometry/Superellipse.md`

### 2.2 Grid Module

$$
\mathbf{c}_{ij} = (i \cdot s_x, j \cdot s_y) + J \cdot \boldsymbol{\epsilon}_{ij}
$$

Where \( J \in [0,1] \) is jitter and \( \boldsymbol{\epsilon} \sim U(-s/2, s/2)^2 \).

### 2.3 Domain Warp

$$
W(\mathbf{x}) = \mathbf{x} + A \cdot \mathbf{n}(\mathbf{x}, \omega)
$$

Where \( \mathbf{n} \) is a 2D noise field.

**Reference:** `blog/ideas/reference documentation/17_Noise_Functions/Simplex_noise.md`

### 2.4 Nesting

For depth \( L \):
$$
f^{(l)}_k(\mathbf{x}) = f_k(\mathbf{x}, a_k \cdot r^l, b_k \cdot r^l)
$$

### 2.5 Smooth Union

$$
F_c(\mathbf{x}) = \text{smin}\left( \{f_k : g(k) = c\}, \sigma \right)
$$

**Reference:** `blog/ideas/reference documentation/13_Distance_Morphology_Topology/Signed_distance_function.md`

## 3. Style Families

| Style | Parameters |
|-------|------------|
| Structured retro | J≈0, A≈0, p→∞, L≥2 |
| Soft blobs | p≈2–4, smooth palettes |
| Chaotic overlaps | high J, high A |
| Quilt-like | J=0, A=0, p large |

## 4. References

- Superellipse: Lamé (1818)
- Smooth minimum: Quilez (2013)

