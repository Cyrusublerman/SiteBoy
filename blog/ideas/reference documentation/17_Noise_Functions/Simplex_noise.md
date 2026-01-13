# Simplex Noise

Simplex noise is a method for constructing an n-dimensional noise function comparable to Perlin noise but with fewer directional artifacts and lower computational overhead in higher dimensions. It was invented by Ken Perlin in 2001.

## Mathematical Definition

### Simplex Grid

In n dimensions, the simplex noise algorithm uses a simplex grid rather than a hypercubic grid. A simplex is the simplest shape that can tile n-dimensional space:
- 1D: line segment
- 2D: equilateral triangle
- 3D: tetrahedron
- 4D: 5-cell (pentatope)

### Coordinate Skewing

To map from standard coordinates to the simplex grid:

$$F = \frac{\sqrt{n+1} - 1}{n}$$

$$G = \frac{1 - 1/\sqrt{n+1}}{n}$$

Skew transform: $(x', y') = (x + s, y + s)$ where $s = (x + y) \cdot F$

Unskew transform: $(x, y) = (x' - t, y' - t)$ where $t = (i + j) \cdot G$

### 2D Simplex Noise Algorithm

1. **Skew input point** to simplex space
2. **Determine simplex** containing the point (which triangle)
3. **Calculate contribution** from each corner:

$$n_i = \max(0, r^2 - d_i^2)^4 \cdot (\nabla_i \cdot \vec{d_i})$$

where:
- $r^2 = 0.5$ (2D) or $0.6$ (3D)
- $d_i$ = distance from corner $i$
- $\nabla_i$ = gradient vector at corner $i$

4. **Sum contributions**: $\text{noise}(x,y) = 70 \cdot \sum_i n_i$

### Gradient Selection

Gradients are selected from a permutation table using bit manipulation:

```
h = hash(i, j) & 7
grad = gradients[h]
```

Standard 2D gradients (8 directions):
```
(1,1), (-1,1), (1,-1), (-1,-1)
(1,0), (-1,0), (0,1), (0,-1)
```

## Properties

- **Range**: approximately [-1, 1]
- **Frequency**: controlled by scaling input coordinates
- **Octaves**: multiple frequencies summed for fractal noise
- **Persistence**: amplitude decay per octave (typically 0.5)

## Fractal Brownian Motion (fBm)

$$\text{fBm}(x) = \sum_{i=0}^{n-1} \text{persistence}^i \cdot \text{noise}(x \cdot \text{lacunarity}^i)$$

Typical values:
- Lacunarity: 2.0
- Persistence: 0.5
- Octaves: 4-8

## Comparison with Perlin Noise

| Property | Perlin | Simplex |
|----------|--------|---------|
| Grid type | Hypercubic | Simplicial |
| Corners evaluated (2D) | 4 | 3 |
| Corners evaluated (3D) | 8 | 4 |
| Directional artifacts | Visible | Minimal |
| Computation (nD) | O(2^n) | O(n^2) |

## Applications

- Terrain generation
- Texture synthesis
- Cloud rendering
- Procedural animation
- Domain warping

## See Also

- Perlin noise
- Value noise
- Worley noise (cellular)
- Fractal noise

