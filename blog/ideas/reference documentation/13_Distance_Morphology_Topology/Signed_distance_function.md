# Signed Distance Function (SDF)

## 1. Overview
A signed distance function (SDF) is a function that returns the shortest distance from any point in space to the boundary of a shape, with the sign indicating whether the point is inside (negative) or outside (positive) the shape. SDFs are fundamental in computer graphics for ray marching, collision detection, and procedural shape generation.

## 2. Mathematical Definition
For a shape \(\Omega\) with boundary \(\partial\Omega\):

$$\text{SDF}(\mathbf{p}) = \begin{cases} 
-d(\mathbf{p}, \partial\Omega) & \text{if } \mathbf{p} \in \Omega \\
d(\mathbf{p}, \partial\Omega) & \text{if } \mathbf{p} \notin \Omega
\end{cases}$$

Where \(d(\mathbf{p}, \partial\Omega) = \min_{\mathbf{q} \in \partial\Omega} \|\mathbf{p} - \mathbf{q}\|\)

## 3. Primitive SDFs

### 3.1 Circle/Sphere
$$\text{SDF}_{\text{circle}}(\mathbf{p}, c, r) = \|\mathbf{p} - c\| - r$$

### 3.2 Box (Axis-Aligned)
$$\text{SDF}_{\text{box}}(\mathbf{p}, b) = \|\max(|\mathbf{p}| - b, 0)\| + \min(\max(|p_x| - b_x, |p_y| - b_y), 0)$$

### 3.3 Line Segment
$$\text{SDF}_{\text{line}}(\mathbf{p}, a, b) = \|\mathbf{p} - \text{closest}(\mathbf{p}, a, b)\|$$

Where closest point projection:
$$t = \text{clamp}\left(\frac{(\mathbf{p} - a) \cdot (b - a)}{\|b - a\|^2}, 0, 1\right)$$
$$\text{closest} = a + t(b - a)$$

### 3.4 Rounded Rectangle
$$\text{SDF}_{\text{roundRect}}(\mathbf{p}, b, r) = \text{SDF}_{\text{box}}(\mathbf{p}, b - r) - r$$

## 4. Boolean Operations

### 4.1 Union (OR)
$$\text{union}(d_1, d_2) = \min(d_1, d_2)$$

### 4.2 Intersection (AND)
$$\text{intersection}(d_1, d_2) = \max(d_1, d_2)$$

### 4.3 Subtraction (NOT)
$$\text{subtraction}(d_1, d_2) = \max(d_1, -d_2)$$

### 4.4 Smooth Union
Blends two shapes with smooth transition:
$$\text{smoothUnion}(d_1, d_2, k) = -\frac{1}{k}\ln(e^{-k \cdot d_1} + e^{-k \cdot d_2})$$

Polynomial smooth min (cheaper):
$$h = \text{clamp}(0.5 + 0.5(d_2 - d_1)/k, 0, 1)$$
$$\text{smoothUnion}(d_1, d_2, k) = \text{lerp}(d_2, d_1, h) - k \cdot h(1-h)$$

### 4.5 Smooth Subtraction
$$\text{smoothSubtraction}(d_1, d_2, k) = -\text{smoothUnion}(-d_1, d_2, k)$$

### 4.6 Smooth Intersection
$$\text{smoothIntersection}(d_1, d_2, k) = -\text{smoothUnion}(-d_1, -d_2, k)$$

## 5. Domain Operations

### 5.1 Translation
$$\text{SDF}_{\text{translated}}(\mathbf{p}) = \text{SDF}(\mathbf{p} - \mathbf{offset})$$

### 5.2 Rotation (2D)
$$\mathbf{p}' = \begin{pmatrix} \cos\theta & -\sin\theta \\ \sin\theta & \cos\theta \end{pmatrix} \mathbf{p}$$
$$\text{SDF}_{\text{rotated}}(\mathbf{p}) = \text{SDF}(\mathbf{p}')$$

### 5.3 Scaling
$$\text{SDF}_{\text{scaled}}(\mathbf{p}, s) = s \cdot \text{SDF}(\mathbf{p}/s)$$

### 5.4 Domain Repetition (Infinite Tiling)
$$\text{SDF}_{\text{repeat}}(\mathbf{p}, c) = \text{SDF}(\text{mod}(\mathbf{p} + 0.5c, c) - 0.5c)$$

### 5.5 Domain Warping
$$\text{SDF}_{\text{warped}}(\mathbf{p}) = \text{SDF}(\mathbf{p} + \text{noise}(\mathbf{p}))$$

## 6. Computing SDFs

### 6.1 Analytic
Directly from mathematical formula (fastest, exact).

### 6.2 Distance Transform
From binary image using algorithms like:
- **Brute force**: O(n²m²)
- **Chamfer distance**: O(nm), approximate
- **Jump Flood Algorithm**: O(nm log n), GPU-friendly
- **Felzenszwalb-Huttenlocher**: O(nm), exact

### 6.3 Contour Tracing
Extract boundary, compute distance to nearest boundary point.

## 7. Applications
- **Ray Marching**: Efficient rendering by stepping by SDF distance
- **Collision Detection**: Negative values indicate penetration
- **Font Rendering**: High-quality anti-aliased text
- **Procedural Modeling**: Complex shapes from simple primitives
- **Fluid Simulation**: Interface tracking

## 8. References
- Hart, John C. "Sphere tracing: A geometric method for the antialiased ray tracing of implicit surfaces." The Visual Computer 12.10 (1996): 527-545.
- Quilez, Inigo. "Distance Functions." https://iquilezles.org/articles/distfunctions/
- "Signed distance function." Wikipedia. https://en.wikipedia.org/wiki/Signed_distance_function

