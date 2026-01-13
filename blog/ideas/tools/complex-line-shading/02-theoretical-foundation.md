# Complex Line Shading — Theoretical Foundation

## Abstract

This document establishes the mathematical framework for generating line-shaded artwork from raster images. We formalize the problem as a pipeline of image processing, computational geometry, and path optimization operations. Each stage is grounded in established algorithms with known complexity bounds and error characteristics.

---

## 1. Problem Formulation

### 1.1 Input Domain

Let $I: \mathbb{Z}^2 \to [0,255]^3$ be a discrete RGB image of dimensions $W \times H$.

### 1.2 Output Domain

The output is a set of paths $\mathcal{P} = \{P_1, P_2, \ldots, P_k\}$ where each path $P_i$ is:

$$P_i = \{(x_j, y_j, w_j) : j = 1, \ldots, n_i\}$$

with $(x_j, y_j) \in \mathbb{R}^2$ being 2D coordinates and $w_j \in \mathbb{R}^+$ being stroke width.

### 1.3 Objective

Produce paths such that:
1. Each path is continuous (suitable for single-stroke rendering)
2. Paths collectively cover regions of $I$
3. Stroke width $w$ correlates with local image intensity
4. Total path length is minimized (for plotter efficiency)

---

## 2. Luminance Extraction

### 2.1 Grayscale Conversion

Convert RGB to luminance using ITU-R BT.601 weighting:

$$L(x,y) = 0.299 \cdot R(x,y) + 0.587 \cdot G(x,y) + 0.114 \cdot B(x,y)$$

This weighting reflects human perceptual sensitivity to green > red > blue.

### 2.2 Alternative: HSL Lightness

For images where hue carries structural information:

$$L(x,y) = \frac{\max(R,G,B) + \min(R,G,B)}{2}$$

---

## 3. Edge Detection

### 3.1 Gaussian Smoothing

Pre-filter with Gaussian kernel to reduce noise:

$$G(x,y) = \frac{1}{2\pi\sigma^2} \exp\left(-\frac{x^2 + y^2}{2\sigma^2}\right)$$

Applied via convolution: $L' = G * L$

### 3.2 Gradient Computation

Sobel operators estimate partial derivatives:

$$\mathbf{S}_x = \begin{bmatrix}-1 & 0 & +1 \\ -2 & 0 & +2 \\ -1 & 0 & +1\end{bmatrix}, \quad \mathbf{S}_y = \begin{bmatrix}-1 & -2 & -1 \\ 0 & 0 & 0 \\ +1 & +2 & +1\end{bmatrix}$$

Gradient magnitude and direction:

$$G = \sqrt{(\mathbf{S}_x * L')^2 + (\mathbf{S}_y * L')^2}$$

$$\Theta = \arctan\left(\frac{\mathbf{S}_y * L'}{\mathbf{S}_x * L'}\right)$$

### 3.3 Canny Edge Detection

The Canny algorithm [Canny, 1986] applies:

1. **Non-maximum suppression:** Thin edges to 1-pixel width by suppressing non-maxima along gradient direction.

2. **Hysteresis thresholding:** Classify pixels as:
   - Strong edge: $G > T_{high}$
   - Weak edge: $T_{low} < G \leq T_{high}$
   - Non-edge: $G \leq T_{low}$

3. **Edge tracking:** Include weak edges connected to strong edges.

**Complexity:** $O(WH)$

---

## 4. Region Segmentation

### 4.1 Otsu's Method

Find threshold $t^*$ maximizing inter-class variance [Otsu, 1979]:

$$t^* = \arg\max_t \sigma_b^2(t)$$

where:

$$\sigma_b^2(t) = \omega_0(t) \omega_1(t) [\mu_0(t) - \mu_1(t)]^2$$

- $\omega_0(t) = \sum_{i=0}^{t-1} p(i)$ — background probability
- $\omega_1(t) = \sum_{i=t}^{255} p(i)$ — foreground probability
- $\mu_0(t), \mu_1(t)$ — class means
- $p(i)$ — normalized histogram

**Complexity:** $O(WH + 256)$

### 4.2 Connected Component Labeling

Given binary image $B$, assign unique labels to 8-connected regions.

**Algorithm:** Two-pass with union-find [He et al., 2009]

1. First pass: Assign provisional labels, record equivalences
2. Union-find: Resolve equivalence classes
3. Second pass: Replace provisional labels with final labels

**Complexity:** $O(WH \cdot \alpha(WH))$ where $\alpha$ is inverse Ackermann

---

## 5. Contour Extraction

### 5.1 Marching Squares

Extract isolines from scalar field at threshold $t$ [Lorensen & Cline, 1987].

For each 2×2 cell, compute case index:

$$\text{case} = c_{00} + 2c_{10} + 4c_{11} + 8c_{01}$$

where $c_{ij} = 1$ if $L(x+i, y+j) \geq t$, else $0$.

16 cases map to edge configurations. Linear interpolation locates edge crossings:

$$p = \frac{t - v_0}{v_1 - v_0}$$

**Complexity:** $O(WH)$

### 5.2 Contour Simplification

Douglas-Peucker algorithm [Douglas & Peucker, 1973] reduces point count while preserving shape.

Given polyline $P$ and tolerance $\epsilon$:

1. Find point $p_k$ with maximum perpendicular distance to line $\overline{p_1 p_n}$
2. If $d_{max} > \epsilon$: recursively simplify $[p_1, p_k]$ and $[p_k, p_n]$
3. Else: replace segment with $[p_1, p_n]$

Distance from point $P$ to line $\overline{AB}$:

$$d = \frac{|(B-A) \times (A-P)|}{|B-A|}$$

**Complexity:** $O(n^2)$ worst case, $O(n \log n)$ expected

---

## 6. Space-Filling Curves

### 6.1 Hilbert Curve

A continuous fractal curve that visits every point in a square exactly once [Hilbert, 1891].

**L-system definition:**
- Axiom: $A$
- Rules: $A \to +BF-AFA-FB+$, $B \to -AF+BFB+FA-$
- $F$ = forward, $+$ = left 90°, $-$ = right 90°

**Index-to-coordinate mapping:**

For order $n$, the curve has $4^n$ points. Convert index $d$ to coordinates $(x, y)$:

```
function d2xy(n, d):
    x = y = 0
    for s = 1 to 2^n by doubling:
        rx = (d >> 1) & 1
        ry = (d & 1) ^ rx
        rotate(s, x, y, rx, ry)
        x += s * rx
        y += s * ry
        d >>= 2
    return (x, y)
```

**Properties:**
- Locality-preserving: nearby indices → nearby coordinates
- Self-similar: each quadrant contains scaled copy
- Space-filling: covers unit square as $n \to \infty$

### 6.2 Peano Curve

Alternative space-filling curve visiting 9 sub-squares [Peano, 1890].

**L-system:**
- Axiom: $L$
- Rules: $L \to LFRFL-F-RFLFR+F+LFRFL$, $R \to RFLFR+F+LFRFL-F-RFLFR$

Higher connectivity than Hilbert but more complex turns.

### 6.3 Square Packing

To apply space-filling curves to arbitrary polygons, pack squares inside the region.

**Quadtree subdivision:**

1. Initialize queue with bounding box
2. For each candidate square:
   - If fully inside polygon: add to output
   - If partially inside: subdivide into 4 quadrants, add to queue
   - If fully outside: discard
3. Continue until squares reach minimum size

**Connectivity optimization:**

Order squares to minimize total travel distance between curve endpoints. This is itself a TSP on square centroids.

---

## 7. Travelling Salesman Problem (TSP)

### 7.1 Problem Statement

Given points $\{p_1, \ldots, p_n\}$ and distance function $d(p_i, p_j)$, find permutation $\pi$ minimizing:

$$\sum_{i=1}^{n-1} d(p_{\pi(i)}, p_{\pi(i+1)})$$

TSP is NP-hard; we use heuristics.

### 7.2 Nearest Neighbor

Greedy construction:

1. Start at arbitrary point
2. Repeatedly visit nearest unvisited point
3. Return to start (if closed tour)

**Complexity:** $O(n^2)$

**Quality:** Within factor of $\frac{1}{2}(\lceil \log_2 n \rceil + 1)$ of optimal

### 7.3 2-opt Improvement

Local search by edge swapping [Croes, 1958]:

For edges $(i, i+1)$ and $(j, j+1)$:
- If $d(i, j) + d(i+1, j+1) < d(i, i+1) + d(j, j+1)$:
- Reverse segment $[i+1, j]$

Repeat until no improvement found.

**Complexity:** $O(n^2)$ per pass, typically $O(1)$ passes

### 7.4 3-opt

Extends 2-opt by considering 3 edges simultaneously. Better quality, higher cost.

**Complexity:** $O(n^3)$ per pass

---

## 8. Point Distribution

### 8.1 Poisson Disk Sampling

Generate points with minimum separation $r$ [Bridson, 2007]:

1. Initialize with random seed point
2. For each active point, attempt $k$ candidates at distance $[r, 2r]$
3. Accept candidates not within $r$ of existing points
4. Use spatial hash for $O(1)$ neighbor lookup

**Properties:**
- Blue noise spectrum (no low-frequency clumping)
- Minimum distance guarantee

**Complexity:** $O(n)$ expected

### 8.2 Variable Density Sampling

Modify Poisson disk with spatially-varying radius:

$$r(x,y) = r_{min} + (r_{max} - r_{min}) \cdot f(x,y)$$

where $f(x,y) \in [0,1]$ is density function (e.g., inverted luminance).

---

## 9. Width Modulation

### 9.1 Intensity Mapping

For path point $(x, y)$, sample intensity $I(x,y)$ and map to width:

$$w(x,y) = w_{min} + (w_{max} - w_{min}) \cdot \frac{255 - I(x,y)}{255}$$

(Dark = thick, light = thin)

### 9.2 Smoothing

Apply 1D Gaussian smoothing along path to prevent abrupt transitions:

$$w'_i = \frac{\sum_{j=-k}^{k} G(j) \cdot w_{i+j}}{\sum_{j=-k}^{k} G(j)}$$

where $G(j) = \exp(-j^2 / 2\sigma^2)$

---

## 10. Computational Geometry Primitives

### 10.1 Point-in-Polygon

Ray casting algorithm [Shimrat, 1962]:

Cast horizontal ray from point, count intersections with polygon edges. Point is inside iff count is odd.

**Complexity:** $O(n)$ where $n$ is vertex count

### 10.2 Polygon Area

Shoelace formula:

$$A = \frac{1}{2} \left| \sum_{i=0}^{n-1} (x_i y_{i+1} - x_{i+1} y_i) \right|$$

### 10.3 Polygon Centroid

$$C_x = \frac{1}{6A} \sum_{i=0}^{n-1} (x_i + x_{i+1})(x_i y_{i+1} - x_{i+1} y_i)$$

$$C_y = \frac{1}{6A} \sum_{i=0}^{n-1} (y_i + y_{i+1})(x_i y_{i+1} - x_{i+1} y_i)$$

---

## References

- Bridson, R. (2007). Fast Poisson Disk Sampling in Arbitrary Dimensions.
- Canny, J. (1986). A Computational Approach to Edge Detection.
- Croes, G.A. (1958). A Method for Solving Traveling-Salesman Problems.
- Douglas, D. & Peucker, T. (1973). Algorithms for the Reduction of the Number of Points.
- He, L. et al. (2009). A Run-Based Two-Scan Labeling Algorithm.
- Hilbert, D. (1891). Über die stetige Abbildung einer Linie auf ein Flächenstück.
- Lorensen, W. & Cline, H. (1987). Marching Cubes: A High Resolution 3D Surface Construction Algorithm.
- Otsu, N. (1979). A Threshold Selection Method from Gray-Level Histograms.
- Peano, G. (1890). Sur une courbe, qui remplit toute une aire plane.
- Shimrat, M. (1962). Algorithm 112: Position of Point Relative to Polygon.

