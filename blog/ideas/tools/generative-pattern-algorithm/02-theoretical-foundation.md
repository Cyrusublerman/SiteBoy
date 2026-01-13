# Generative Pattern Algorithm — Theoretical Foundation

## 1. Problem Formulation

**Input Domain:** Parameters \( P = \{density, gridStrength, ...\} \)

**Output Domain:** 2D scalar/vector field rendered to canvas

**Objective:** Generate diverse pattern families (Truchet, blobs, contours) from unified point-based representation.

## 2. Mathematical Framework

### 2.1 Point Distribution

**Grid-Noise Hybrid:**
$$
\mathbf{x}_i = (1 - g) \cdot \mathbf{n}_i + g \cdot \mathbf{g}_i + j \cdot \boldsymbol{\epsilon}_i
$$

Where:
- \( g \in [0,1] \): grid strength parameter
- \( \mathbf{g}_i \): regular grid position
- \( \mathbf{n}_i \): noise-sampled position via Poisson disk
- \( j \): jitter amplitude
- \( \boldsymbol{\epsilon}_i \sim U(-1,1)^2 \): uniform random offset

**Reference:** `blog/ideas/reference documentation/04_Sampling_Low_Discrepancy/Poisson_disk_sampling.md`

### 2.2 Connectivity Graph

**Neighbor Search:**
$$
N(i) = \{j : \|\mathbf{x}_j - \mathbf{x}_i\| < R \land j \neq i\}
$$

**Degree Limiting:**
$$
E = \{(i,j) : j \in N(i) \land |N(i)| \leq d_{max}\}
$$

**Reference:** `blog/ideas/reference documentation/06_Polygon_Grid_Domain_Subdivision/K-d_tree.md`

### 2.3 State Evolution (Optional)

**Gray-Scott Reaction-Diffusion:**
$$
\frac{\partial u}{\partial t} = D_u \nabla^2 u - uv^2 + f(1-u)
$$
$$
\frac{\partial v}{\partial t} = D_v \nabla^2 v + uv^2 - (f+k)v
$$

**Cellular Automaton:**
$$
s_i^{t+1} = R(s_i^t, \sum_{j \in N(i)} s_j^t)
$$

**Reference:** `blog/ideas/reference documentation/08_Reaction_Diffusion_PDE/Gray-Scott_model.md`

### 2.4 Distance Field

**Signed Distance Function:**
$$
d(\mathbf{x}) = \min_{e \in E} d_e(\mathbf{x})
$$

Where \( d_e \) is the distance to edge segment \( e \).

**Jump Flood Algorithm:** Computes approximate EDT in \( O(n \log n) \) passes.

**Reference:** `blog/ideas/reference documentation/13_Distance_Morphology_Topology/Jump_flooding_algorithm.md`

### 2.5 Rendering Modes

**Truchet Tiles:**
$$
T(\mathbf{x}) = \text{template}(|N(\text{cell}(\mathbf{x}))|)
$$

**Blob Fill:**
$$
B(\mathbf{x}) = \mathbf{1}[d(\mathbf{x}) < w \cdot s_i]
$$

Where \( s_i \) is the state weight at nearest point.

**Nested Contours:**
$$
C_k(\mathbf{x}) = \mathbf{1}[|d(\mathbf{x}) - k\Delta| < \epsilon]
$$

**Reference:** `blog/ideas/reference documentation/03_Raster_Vector_Contour/Marching_squares.md`

### 2.6 Flow Field Animation

**Advection:**
$$
\mathbf{x}_i(t + \Delta t) = \mathbf{x}_i(t) + \alpha \cdot \mathbf{V}(\mathbf{x}_i(t), t)
$$

Where \( \mathbf{V} \) is a curl noise velocity field.

**Reference:** `blog/ideas/reference documentation/08_Reaction_Diffusion_PDE/Advection.md`

## 3. Algorithm Complexity

| Operation | Complexity |
|-----------|------------|
| Point generation | \( O(n) \) |
| K-d tree construction | \( O(n \log n) \) |
| Neighbor search | \( O(k \log n) \) per point |
| RD step | \( O(W \times H) \) |
| JFA distance field | \( O(W \times H \log \max(W,H)) \) |
| Marching squares | \( O(W \times H) \) |

## 4. Transitions

All transitions occur via parameter interpolation:

| Transition | Parameter Path |
|------------|----------------|
| Grid → Organic | `gridStrength: 1 → 0` |
| Tile → Global contours | `tileWindow: 1 → ∞` |
| Stroke → Blob | `weightScale: 0.1 → 2.0` |
| Static → Animated | `flowSpeed: 0 → 0.5` |

## 5. References

- Poisson Disk Sampling: Bridson (2007)
- Gray-Scott Model: Pearson (1993)
- Jump Flood Algorithm: Rong & Tan (2006)
- Marching Squares: Lorensen & Cline (1987)

