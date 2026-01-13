# Implicit Surface

## 1. Overview
An implicit surface is defined as the set of points satisfying an equation \(f(x, y, z) = 0\), rather than being explicitly parameterized. This representation enables elegant boolean operations, smooth blending, and efficient ray intersection testing. In 2D, the same concept applies to implicit curves.

## 2. Mathematical Definition

### 2.1 Implicit Form
A surface \(S\) is defined by:
$$S = \{(x, y, z) : f(x, y, z) = 0\}$$

The function \(f\) is called the implicit function or field function.

### 2.2 Inside/Outside Test
For a closed surface:
- \(f(\mathbf{p}) < 0\): inside
- \(f(\mathbf{p}) = 0\): on surface
- \(f(\mathbf{p}) > 0\): outside

(Convention varies; some use opposite signs)

### 2.3 Gradient and Normal
The surface normal at a point \(\mathbf{p}\) is:
$$\mathbf{n} = \frac{\nabla f}{\|\nabla f\|}$$

Where \(\nabla f = \left(\frac{\partial f}{\partial x}, \frac{\partial f}{\partial y}, \frac{\partial f}{\partial z}\right)\)

## 3. Primitive Implicit Functions

### 3.1 Sphere
$$f(x, y, z) = x^2 + y^2 + z^2 - r^2$$

### 3.2 Plane
$$f(x, y, z) = ax + by + cz + d$$

Where \((a, b, c)\) is normal, \(d\) is distance from origin.

### 3.3 Cylinder (Infinite, Z-axis)
$$f(x, y, z) = x^2 + y^2 - r^2$$

### 3.4 Torus
$$f(x, y, z) = \left(\sqrt{x^2 + y^2} - R\right)^2 + z^2 - r^2$$

Where \(R\) is major radius, \(r\) is minor radius.

### 3.5 Ellipsoid
$$f(x, y, z) = \frac{x^2}{a^2} + \frac{y^2}{b^2} + \frac{z^2}{c^2} - 1$$

### 3.6 Superquadric (Superellipsoid)
$$f(x, y, z) = \left(\left|\frac{x}{a}\right|^{2/e_2} + \left|\frac{y}{b}\right|^{2/e_2}\right)^{e_2/e_1} + \left|\frac{z}{c}\right|^{2/e_1} - 1$$

## 4. Boolean Operations (CSG)

### 4.1 Union
$$f_{\cup}(\mathbf{p}) = \min(f_A(\mathbf{p}), f_B(\mathbf{p}))$$

### 4.2 Intersection
$$f_{\cap}(\mathbf{p}) = \max(f_A(\mathbf{p}), f_B(\mathbf{p}))$$

### 4.3 Difference
$$f_{A-B}(\mathbf{p}) = \max(f_A(\mathbf{p}), -f_B(\mathbf{p}))$$

### 4.4 Smooth Union (Blending)
Polynomial smooth min:
$$h = \text{clamp}\left(\frac{f_B - f_A}{2k} + 0.5, 0, 1\right)$$
$$f_{\text{smooth}}(\mathbf{p}) = \text{lerp}(f_B, f_A, h) - k \cdot h(1-h)$$

Exponential smooth min:
$$f_{\text{smooth}}(\mathbf{p}) = -k \ln(e^{-f_A/k} + e^{-f_B/k})$$

## 5. Transformations

### 5.1 Translation
$$f_{\text{translated}}(\mathbf{p}) = f(\mathbf{p} - \mathbf{t})$$

### 5.2 Rotation
$$f_{\text{rotated}}(\mathbf{p}) = f(R^{-1}\mathbf{p})$$

### 5.3 Scaling (Non-Uniform)
$$f_{\text{scaled}}(\mathbf{p}) = s \cdot f(\mathbf{p}/s)$$ (uniform)

Non-uniform scaling distorts distance properties.

### 5.4 Repetition (Tiling)
$$f_{\text{repeat}}(\mathbf{p}) = f(\text{mod}(\mathbf{p} + \mathbf{c}/2, \mathbf{c}) - \mathbf{c}/2)$$

## 6. Rendering Implicit Surfaces

### 6.1 Ray Marching (Sphere Tracing)
If \(f\) is a signed distance function:
```
t = 0
for i in range(maxSteps):
    p = rayOrigin + t * rayDir
    d = f(p)
    if d < epsilon:
        return hit at p
    t += d
return no hit
```

### 6.2 Marching Cubes/Squares
Extract polygonal mesh by:
1. Evaluate \(f\) on regular grid
2. Identify cells crossing zero
3. Generate triangles/edges based on sign pattern

### 6.3 Point Sampling
For particle-based rendering:
1. Sample points where \(|f(\mathbf{p})| < \epsilon\)
2. Use gradient for normals

## 7. Metaballs (Blobby Surfaces)
Sum of radial basis functions:

$$f(\mathbf{p}) = \sum_i b_i(r_i) - T$$

Where \(r_i = \|\mathbf{p} - \mathbf{c}_i\|\) and \(b_i\) is falloff function:

**Wyvill**:
$$b(r) = \begin{cases}
1 - \frac{3r^2}{R^2} + \frac{3r^4}{R^4} - \frac{r^6}{R^6} & r < R \\
0 & r \geq R
\end{cases}$$

**Gaussian**:
$$b(r) = e^{-r^2/\sigma^2}$$

## 8. 2D Implicit Curves

### 8.1 Circle
$$f(x, y) = x^2 + y^2 - r^2$$

### 8.2 Superellipse
$$f(x, y) = |x/a|^n + |y/b|^n - 1$$

### 8.3 Heart Curve
$$f(x, y) = (x^2 + y^2 - 1)^3 - x^2 y^3$$

### 8.4 Rendering 2D Implicit
```javascript
function drawImplicitCurve(f, ctx, threshold = 0.01) {
    const imageData = ctx.createImageData(width, height);
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const px = (x - width/2) / scale;
            const py = (y - height/2) / scale;
            const val = f(px, py);
            
            // Anti-aliased boundary
            const alpha = 1 - smoothstep(-threshold, threshold, val);
            setPixel(imageData, x, y, alpha);
        }
    }
    ctx.putImageData(imageData, 0, 0);
}
```

## 9. Applications
- Ray marching / sphere tracing
- Constructive solid geometry (CSG)
- Metaball/blobby modeling
- Procedural shape generation
- Collision detection
- Level set methods (fluid simulation)

## 10. References
- Bloomenthal, Jules. "Introduction to implicit surfaces." Morgan Kaufmann, 1997.
- Hart, John C. "Ray tracing implicit surfaces." SIGGRAPH Course Notes, 1993.
- Quilez, Inigo. "Distance functions." https://iquilezles.org/articles/distfunctions/
- "Implicit surface." Wikipedia. https://en.wikipedia.org/wiki/Implicit_surface

