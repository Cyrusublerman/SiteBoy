# Posterization (Tone Quantization)

## 1. Overview
Posterization reduces the number of distinct color or tone levels in an image, creating flat regions with sharp boundaries. This technique creates a "poster" effect by mapping continuous gradients to discrete bands. It is used for artistic effects, image compression, and as a preprocessing step for vectorization.

## 2. Mathematical Basis

### 2.1 Uniform Quantization
For \(n\) output levels, quantize input value \(v \in [0, 1]\):

$$v_q = \frac{\lfloor v \cdot n \rfloor}{n - 1}$$

Or with rounding:
$$v_q = \frac{\text{round}(v \cdot (n-1))}{n-1}$$

### 2.2 Level Boundaries
For \(n\) levels, boundaries at:
$$b_i = \frac{i}{n}, \quad i = 0, 1, ..., n$$

### 2.3 Output Values
Representative value for level \(i\):
$$c_i = \frac{2i + 1}{2n} = \frac{i + 0.5}{n}$$

Or using level boundaries:
$$c_i = \frac{b_i + b_{i+1}}{2}$$

## 3. Implementation Methods

### 3.1 Simple Floor Division
```javascript
function posterize(value, levels) {
    // value in [0, 1], levels >= 2
    const step = 1 / levels;
    const level = Math.floor(value / step);
    return Math.min(level, levels - 1) / (levels - 1);
}
```

### 3.2 With Gamma Correction
For perceptually uniform bands:
```javascript
function posterizeGamma(value, levels, gamma = 2.2) {
    // Apply gamma to linearize
    const linear = Math.pow(value, gamma);
    // Quantize
    const quantized = posterize(linear, levels);
    // Apply inverse gamma
    return Math.pow(quantized, 1 / gamma);
}
```

### 3.3 Per-Channel Color
```javascript
function posterizeRGB(r, g, b, levels) {
    return {
        r: posterize(r, levels),
        g: posterize(g, levels),
        b: posterize(b, levels)
    };
}
```

### 3.4 Luminance-Based
Posterize by brightness, preserve hue/saturation:
```javascript
function posterizeLuminance(r, g, b, levels) {
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    const lumQ = posterize(lum, levels);
    const ratio = lum > 0.001 ? lumQ / lum : 1;
    return {
        r: clamp(r * ratio, 0, 1),
        g: clamp(g * ratio, 0, 1),
        b: clamp(b * ratio, 0, 1)
    };
}
```

## 4. Non-Uniform Quantization

### 4.1 Custom Level Boundaries
Define arbitrary boundaries for artistic control:
```javascript
const bounds = [0, 0.2, 0.4, 0.7, 1.0];  // 4 levels
const colors = [0, 0.3, 0.55, 0.85];    // Output values

function posterizeCustom(value, bounds, colors) {
    for (let i = 0; i < bounds.length - 1; i++) {
        if (value < bounds[i + 1]) {
            return colors[i];
        }
    }
    return colors[colors.length - 1];
}
```

### 4.2 Histogram-Based (Optimal Quantization)
Use image histogram to place boundaries:
1. Compute cumulative histogram
2. Place boundaries at equal cumulative percentiles
3. This minimizes mean squared error

### 4.3 K-Means Clustering
For color posterization:
1. Sample image colors
2. Run k-means with k = desired levels
3. Map each pixel to nearest cluster center

## 5. Edge-Aware Posterization

### 5.1 Bilateral Posterization
Preserve edges while smoothing within regions:
```
1. Apply bilateral filter
2. Posterize filtered result
3. Use original edge map to sharpen boundaries
```

### 5.2 Domain Transform
Use edge-aware filtering to create smooth regions before quantization.

## 6. Dithering Combination
Posterization + dithering creates halftone-like effects:

```javascript
function posterizeDither(value, levels, ditherMatrix, x, y) {
    const threshold = ditherMatrix[y % ditherH][x % ditherW];
    const adjusted = value + (threshold - 0.5) / levels;
    return posterize(adjusted, levels);
}
```

## 7. Smooth Posterization
Soften band boundaries with smoothstep:

```javascript
function smoothPosterize(value, levels, smoothness = 0.1) {
    const step = 1 / levels;
    const level = value / step;
    const levelFloor = Math.floor(level);
    const levelCeil = Math.ceil(level);
    const t = level - levelFloor;
    
    // Smoothstep transition at boundaries
    const edge = smoothness;
    let blend;
    if (t < edge) {
        blend = 0;
    } else if (t > 1 - edge) {
        blend = 1;
    } else {
        blend = smoothstep(edge, 1 - edge, t);
    }
    
    const outFloor = levelFloor / (levels - 1);
    const outCeil = Math.min(levelCeil, levels - 1) / (levels - 1);
    return lerp(outFloor, outCeil, blend);
}
```

## 8. Shaders (GLSL)

### 8.1 Basic
```glsl
vec3 posterize(vec3 color, float levels) {
    return floor(color * levels) / (levels - 1.0);
}
```

### 8.2 With Gamma
```glsl
vec3 posterizeGamma(vec3 color, float levels, float gamma) {
    vec3 linear = pow(color, vec3(gamma));
    vec3 quantized = floor(linear * levels) / (levels - 1.0);
    return pow(quantized, vec3(1.0 / gamma));
}
```

## 9. Applications
- Artistic/poster effects
- Image simplification for vectorization
- Contour map visualization
- Compression preprocessing
- Style transfer
- Halftone preparation

## 10. Related Techniques
- **Palette reduction**: Limit to specific color palette
- **Color quantization**: Reduce total color count (e.g., median cut)
- **Tone mapping**: HDR to LDR conversion
- **Histogram equalization**: Redistribute tones

## 11. References
- Gonzalez, R. C., and Woods, R. E. "Digital Image Processing." 4th ed. Pearson, 2017.
- "Posterization." Wikipedia. https://en.wikipedia.org/wiki/Posterization

