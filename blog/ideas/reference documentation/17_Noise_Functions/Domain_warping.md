# Domain Warping

## 1. Overview
Domain warping (also called domain distortion) is a technique that distorts the input coordinates to a noise function, creating more organic, flowing patterns. By feeding noise back into itself or combining multiple noise layers to offset coordinates, domain warping produces complex, natural-looking textures.

## 2. Basic Concept
Instead of sampling noise at coordinates \((x, y)\), sample at warped coordinates:

$$\text{warp}(x, y) = \text{noise}(x + \text{offset}_x(x,y), y + \text{offset}_y(x,y))$$

Where offset functions are typically other noise functions.

## 3. Mathematical Formulations

### 3.1 Simple Warp
$$f(\mathbf{p}) = \text{noise}(\mathbf{p} + \text{noise}(\mathbf{p}))$$

### 3.2 Scaled Warp
$$f(\mathbf{p}) = \text{noise}(\mathbf{p} + A \cdot \text{noise}(B \cdot \mathbf{p}))$$

Where:
- \(A\) = warp amplitude (how far to displace)
- \(B\) = warp frequency (detail level of displacement)

### 3.3 Layered Warp (Inigo Quilez)
$$q = \text{noise}(\mathbf{p})$$
$$r = \text{noise}(\mathbf{p} + q)$$
$$f(\mathbf{p}) = \text{noise}(\mathbf{p} + r)$$

Or with explicit offsets:
$$q(x,y) = (\text{fbm}(x, y), \text{fbm}(x + 5.2, y + 1.3))$$
$$r(x,y) = (\text{fbm}(x + 4q_x + 1.7, y + 4q_y + 9.2), \text{fbm}(x + 4q_x + 8.3, y + 4q_y + 2.8))$$
$$f(x,y) = \text{fbm}(x + 4r_x, y + 4r_y)$$

### 3.4 Vector Field Warp
Use gradient or curl noise as displacement:
$$\mathbf{p}' = \mathbf{p} + A \cdot \nabla\text{noise}(\mathbf{p})$$

## 4. Implementation

### 4.1 Basic JavaScript
```javascript
function domainWarp(x, y, amplitude = 1.0, frequency = 1.0) {
    // Compute warp offsets using noise at different positions
    const qx = fbm2D(x * frequency, y * frequency);
    const qy = fbm2D(x * frequency + 5.2, y * frequency + 1.3);
    
    // Sample noise at warped position
    return fbm2D(x + amplitude * qx, y + amplitude * qy);
}
```

### 4.2 Multi-Layer Warp
```javascript
function multiLayerWarp(x, y, options = {}) {
    const { amplitude = 4.0, iterations = 2 } = options;
    
    let px = x, py = y;
    
    for (let i = 0; i < iterations; i++) {
        const ox = fbm2D(px, py);
        const oy = fbm2D(px + 5.2, py + 1.3);
        px = x + amplitude * ox;
        py = y + amplitude * oy;
    }
    
    return fbm2D(px, py);
}
```

### 4.3 Curl Noise Warp (Incompressible)
```javascript
function curlWarp(x, y, amplitude = 1.0) {
    const eps = 0.001;
    // Compute curl of noise potential
    const n1 = noise2D(x, y + eps);
    const n2 = noise2D(x, y - eps);
    const n3 = noise2D(x + eps, y);
    const n4 = noise2D(x - eps, y);
    
    const curlX = (n1 - n2) / (2 * eps);
    const curlY = -(n3 - n4) / (2 * eps);
    
    return noise2D(x + amplitude * curlX, y + amplitude * curlY);
}
```

### 4.4 Animated Warp
```javascript
function animatedWarp(x, y, time, amplitude = 1.0) {
    const qx = fbm2D(x + 0.1 * time, y);
    const qy = fbm2D(x, y + 0.1 * time);
    
    return fbm2D(x + amplitude * qx, y + amplitude * qy);
}
```

## 5. GLSL Implementation
```glsl
float domainWarp(vec2 p, float amp, float freq) {
    vec2 q = vec2(
        fbm(p * freq),
        fbm(p * freq + vec2(5.2, 1.3))
    );
    
    vec2 r = vec2(
        fbm(p + amp * q + vec2(1.7, 9.2)),
        fbm(p + amp * q + vec2(8.3, 2.8))
    );
    
    return fbm(p + amp * r);
}
```

## 6. Parameters and Their Effects

| Parameter | Low Value | High Value |
|-----------|-----------|------------|
| Amplitude | Subtle distortion | Strong swirling |
| Frequency | Large-scale warps | Fine detail warps |
| Iterations | Simple pattern | Complex, turbulent |
| Offset constants | - | Different for variation |

## 7. Combining with FBM
Each layer of FBM can be independently warped:

```javascript
function warpedFBM(x, y, octaves = 4) {
    let value = 0;
    let amplitude = 1;
    let frequency = 1;
    let maxValue = 0;
    
    for (let i = 0; i < octaves; i++) {
        // Warp coordinates for this octave
        const wx = x * frequency + domainWarp(x, y, 0.5, frequency);
        const wy = y * frequency + domainWarp(x, y + 100, 0.5, frequency);
        
        value += amplitude * noise2D(wx, wy);
        maxValue += amplitude;
        amplitude *= 0.5;
        frequency *= 2;
    }
    
    return value / maxValue;
}
```

## 8. Applications
- Organic texture generation (marble, wood, clouds)
- Terrain heightmap generation
- Fluid/smoke appearance
- Abstract generative art
- Procedural material creation
- Flow field visualization

## 9. Visual Effects
- **Low amplitude, high frequency**: Subtle surface detail
- **High amplitude, low frequency**: Dramatic flowing patterns
- **Animated time offset**: Morphing, liquid motion
- **Curl noise warp**: Incompressible fluid look

## 10. References
- Quilez, Inigo. "Domain warping." https://iquilezles.org/articles/warp/
- Perlin, Ken. "Hypertexture." SIGGRAPH 1989.
- Bridson, R., Houriham, J., and Nordenstam, M. "Curl-noise for procedural fluid flow." SIGGRAPH 2007.

