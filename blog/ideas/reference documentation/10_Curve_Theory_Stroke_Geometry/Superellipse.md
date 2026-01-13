# Superellipse

A superellipse (also known as a Lamé curve) is a closed curve that smoothly interpolates between an ellipse and a rectangle. It was named after Gabriel Lamé.

## Mathematical Definition

### Implicit Form

$$\left|\frac{x}{a}\right|^n + \left|\frac{y}{b}\right|^n = 1$$

where:
- $a, b$ are the semi-axes (half-widths)
- $n$ is the exponent controlling corner sharpness

### Parametric Form

$$x(\theta) = a \cdot \text{sgn}(\cos\theta) \cdot |\cos\theta|^{2/n}$$
$$y(\theta) = b \cdot \text{sgn}(\sin\theta) \cdot |\sin\theta|^{2/n}$$

for $\theta \in [0, 2\pi)$

### Signed Distance Function

Approximate SDF for superellipse:

$$d(x,y) = \left(\left|\frac{x}{a}\right|^n + \left|\frac{y}{b}\right|^n\right)^{1/n} - 1$$

Exact SDF requires numerical methods for $n \neq 2$.

## Special Cases

| n | Shape |
|---|-------|
| 0.5 | Astroid (4-pointed star) |
| 1 | Diamond (rhombus) |
| 2 | Ellipse |
| 2.5 | "Squircle" (rounded square) |
| 4 | Rounded rectangle |
| ∞ | Rectangle |

## Properties

### Area

$$A = \frac{4ab \cdot \Gamma(1 + 1/n)^2}{\Gamma(1 + 2/n)}$$

where $\Gamma$ is the gamma function.

For $n = 2$ (ellipse): $A = \pi ab$

### Perimeter

No closed-form expression exists for general $n$. Numerical integration required:

$$P = 4 \int_0^{\pi/2} \sqrt{\left(\frac{dx}{d\theta}\right)^2 + \left(\frac{dy}{d\theta}\right)^2} \, d\theta$$

## Generalizations

### Superellipsoid (3D)

$$\left|\frac{x}{a}\right|^{n_1} + \left|\frac{y}{b}\right|^{n_1} + \left|\frac{z}{c}\right|^{n_2} = 1$$

### Superformula (Gielis)

Generalization to arbitrary symmetries:

$$r(\theta) = \left( \left|\frac{\cos(m\theta/4)}{a}\right|^{n_2} + \left|\frac{\sin(m\theta/4)}{b}\right|^{n_3} \right)^{-1/n_1}$$

## Applications

- UI design (rounded rectangles)
- Typography (font design)
- Industrial design (Piet Hein's "superellipse" tables)
- Pattern generation
- Implicit surface modeling
- SDF-based rendering

## Implementation

```javascript
/**
 * Evaluate superellipse implicit function
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} a - Semi-axis X
 * @param {number} b - Semi-axis Y
 * @param {number} n - Exponent (n=2 is ellipse)
 * @returns {number} <0 inside, =0 on boundary, >0 outside
 */
function superellipse(x, y, a, b, n) {
    return Math.pow(Math.abs(x/a), n) + Math.pow(Math.abs(y/b), n) - 1;
}

/**
 * Parametric superellipse point
 * @param {number} theta - Angle in radians [0, 2π)
 * @param {number} a - Semi-axis X
 * @param {number} b - Semi-axis Y
 * @param {number} n - Exponent
 * @returns {{x: number, y: number}}
 */
function superellipsePoint(theta, a, b, n) {
    const c = Math.cos(theta);
    const s = Math.sin(theta);
    const exp = 2 / n;
    return {
        x: a * Math.sign(c) * Math.pow(Math.abs(c), exp),
        y: b * Math.sign(s) * Math.pow(Math.abs(s), exp)
    };
}
```

## See Also

- Ellipse
- Bézier curves
- Signed distance functions
- Implicit surfaces

