# Smoothstep

Smoothstep is a family of sigmoid-like interpolation and clamping functions commonly used in computer graphics for smooth transitions.

## Mathematical Definition

### Basic Smoothstep (Cubic)

The standard smoothstep function for $t \in [0, 1]$:

$$S_1(t) = 3t^2 - 2t^3 = t^2(3 - 2t)$$

With clamping for arbitrary ranges:

$$\text{smoothstep}(e_0, e_1, x) = S_1\left(\text{clamp}\left(\frac{x - e_0}{e_1 - e_0}, 0, 1\right)\right)$$

### Smootherstep (Quintic)

Ken Perlin's improved version with zero first and second derivatives at endpoints:

$$S_2(t) = 6t^5 - 15t^4 + 10t^3 = t^3(t(6t - 15) + 10)$$

### General Polynomial Smoothstep

For smoothstep of order $n$ (derivatives 0 through $n$ are zero at endpoints):

$$S_n(t) = \sum_{k=0}^{n} \binom{n+k}{k} \binom{2n+1}{n-k} (-t)^k \cdot t^{n+1}$$

| Order | Name | Formula |
|-------|------|---------|
| 1 | smoothstep | $3t^2 - 2t^3$ |
| 2 | smootherstep | $6t^5 - 15t^4 + 10t^3$ |
| 3 | — | $-20t^7 + 70t^6 - 84t^5 + 35t^4$ |

## Properties

- **Range**: $[0, 1]$ for input in $[0, 1]$
- **Boundary values**: $S_n(0) = 0$, $S_n(1) = 1$
- **Derivatives at boundaries**: Zero for derivatives 1 through $n$
- **Midpoint**: $S_n(0.5) = 0.5$

## Derivative

For basic smoothstep:

$$\frac{dS_1}{dt} = 6t - 6t^2 = 6t(1-t)$$

Maximum slope at $t = 0.5$: $\frac{dS_1}{dt}\big|_{t=0.5} = 1.5$

## Inverse Smoothstep

The inverse of basic smoothstep (solving $y = 3t^2 - 2t^3$ for $t$):

$$S_1^{-1}(y) = 0.5 - \sin\left(\frac{\arcsin(1 - 2y)}{3}\right)$$

## Variations

### Smoothstep Bias

Modified curve with controllable center:

$$S_{\text{bias}}(t, b) = \frac{t^b}{t^b + (1-t)^b}$$

### Gain Function

Controlled steepness around midpoint:

$$\text{gain}(t, g) = \begin{cases}
\frac{S_{\text{bias}}(2t, g)}{2} & t < 0.5 \\
1 - \frac{S_{\text{bias}}(2 - 2t, g)}{2} & t \geq 0.5
\end{cases}$$

## Applications

- Texture blending
- Animation easing
- Threshold softening
- Anti-aliasing
- Procedural generation
- Shader transitions

## Implementation

```javascript
/**
 * Standard cubic smoothstep
 * @param {number} edge0 - Lower edge
 * @param {number} edge1 - Upper edge
 * @param {number} x - Input value
 * @returns {number} Smoothly interpolated value in [0,1]
 */
function smoothstep(edge0, edge1, x) {
    const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
    return t * t * (3 - 2 * t);
}

/**
 * Quintic smootherstep (Perlin)
 */
function smootherstep(edge0, edge1, x) {
    const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
    return t * t * t * (t * (t * 6 - 15) + 10);
}
```

## See Also

- Hermite interpolation
- Sigmoid function
- Easing functions
- Cubic interpolation

