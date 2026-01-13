# Perlin Noise

## 1. Overview
Perlin noise is a gradient noise function developed by Ken Perlin in 1983. It generates visually smooth, coherent randomness widely used in computer graphics for procedural texture generation, terrain heightmaps, and animation. Unlike pure random noise, Perlin noise has a continuous, "flowing" quality that resembles natural phenomena.

## 2. Mathematical Basis

### 2.1 Grid and Gradient Vectors
Perlin noise works by:
1. Defining a grid of integer coordinates
2. Assigning a pseudorandom gradient vector to each grid point
3. Interpolating between these gradients

For a 2D point \((x, y)\):
1. Identify the four corners of the unit square containing the point
2. Generate a pseudorandom gradient vector \(\mathbf{g}\) at each corner
3. Compute the dot product of each gradient with the distance vector from corner to point

### 2.2 Dot Product Calculation
For corner at \((x_0, y_0)\) with gradient \(\mathbf{g} = (g_x, g_y)\):

$$d = (x - x_0, y - y_0)$$
$$\text{influence} = \mathbf{g} \cdot \mathbf{d} = g_x(x - x_0) + g_y(y - y_0)$$

### 2.3 Fade Function (Smoothstep)
To ensure smooth interpolation without visible grid artifacts, a fade function is applied:

$$\text{fade}(t) = 6t^5 - 15t^4 + 10t^3$$

This is the "smootherstep" function with zero first and second derivatives at 0 and 1.

### 2.4 Interpolation
The final value is computed by bilinearly interpolating the four corner influences using the fade function:

$$u = \text{fade}(x - \lfloor x \rfloor)$$
$$v = \text{fade}(y - \lfloor y \rfloor)$$
$$\text{result} = \text{lerp}(v, \text{lerp}(u, n_{00}, n_{10}), \text{lerp}(u, n_{01}, n_{11}))$$

Where \(n_{ij}\) is the dot product influence from corner \((i, j)\).

## 3. Gradient Selection
Classic Perlin noise uses a permutation table (256 entries, typically) to pseudorandomly select gradients:

```
perm[i] = hash(i) mod 256
gradient = gradients[perm[(perm[x] + y) mod 256] mod numGradients]
```

Common 2D gradients: \((1,1), (-1,1), (1,-1), (-1,-1), (1,0), (-1,0), (0,1), (0,-1)\)

## 4. Properties
- **Smoothness**: Continuously differentiable (C² continuous with fade function)
- **Bounded Output**: Typically \([-1, 1]\) or \([0, 1]\) after normalization
- **Repeatability**: Same seed produces identical results
- **Isotropy**: No directional bias (improved in later versions)

## 5. Octave Noise (Fractal Brownian Motion)
Multiple octaves create detail at multiple scales:

$$\text{fbm}(x, y) = \sum_{i=0}^{n-1} \text{persistence}^i \cdot \text{noise}(\text{lacunarity}^i \cdot x, \text{lacunarity}^i \cdot y)$$

Common parameters:
- **Lacunarity**: 2.0 (frequency doubling)
- **Persistence**: 0.5 (amplitude halving)
- **Octaves**: 4-8

## 6. Differences from Simplex Noise

| Property | Perlin Noise | Simplex Noise |
|----------|-------------|---------------|
| Grid | Square | Triangular (simplex) |
| Corners per cell | 4 (2D) / 8 (3D) | 3 (2D) / 4 (3D) |
| Computational cost | O(2^n) | O(n²) |
| Directional artifacts | More visible | Minimal |

## 7. Applications
- Procedural terrain generation
- Cloud and smoke textures
- Water surface animation
- Organic shape generation
- Displacement maps
- Particle system perturbation

## 8. References
- Perlin, Ken. "An image synthesizer." ACM SIGGRAPH Computer Graphics 19.3 (1985): 287-296.
- Perlin, Ken. "Improving noise." ACM SIGGRAPH 2002 Course Notes.
- "Perlin noise." Wikipedia. https://en.wikipedia.org/wiki/Perlin_noise

