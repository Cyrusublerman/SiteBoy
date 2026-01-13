# Complex Line Shading — Algorithm Library

## Purpose

This document maps mathematical formulas to JavaScript implementations. Each entry provides:
- **Formula** — mathematical definition
- **I/O** — typed inputs and outputs
- **Code** — JavaScript implementation
- **Source** — reference documentation file

---

## 1. Image Processing

### 1.1 RGB to Grayscale

**Formula:**
$$L = 0.299R + 0.587G + 0.114B$$

**I/O:**
```
Input:  ImageData { data: Uint8ClampedArray, width: number, height: number }
Output: Float32Array (length = width × height)
```

**Code:**
```javascript
function rgbToGrayscale(imageData) {
    const { data, width, height } = imageData;
    const gray = new Float32Array(width * height);
    
    for (let i = 0, j = 0; i < data.length; i += 4, j++) {
        gray[j] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    }
    
    return gray;
}
```

**Source:** ITU-R BT.601

---

### 1.2 Gaussian Kernel

**Formula:**
$$G(x,y) = \frac{1}{2\pi\sigma^2} \exp\left(-\frac{x^2 + y^2}{2\sigma^2}\right)$$

**I/O:**
```
Input:  sigma: number (standard deviation)
Output: { kernel: Float32Array, size: number }
```

**Code:**
```javascript
import { Matrix } from '../processing/core/matrix.js';

// Already implemented in matrix.js
const { kernel, size } = Matrix.gaussianKernel(sigma);
```

**Source:** `processing/core/matrix.js`

---

### 1.3 Sobel Gradient

**Formula:**
$$G_x = S_x * I, \quad G_y = S_y * I$$
$$G = \sqrt{G_x^2 + G_y^2}, \quad \Theta = \arctan(G_y / G_x)$$

**I/O:**
```
Input:  image: Float32Array, width: number, height: number
Output: { magnitude: Float32Array, direction: Float32Array }
```

**Code:**
```javascript
import { sobel } from '../processing/edge-detection/edge-operators.js';

const { magnitude, direction } = sobel(grayscale, width, height);
```

**Source:** `processing/edge-detection/edge-operators.js`, `Sobel_operator.md`

---

### 1.4 Canny Edge Detection

**Formula:** Multi-stage algorithm:
1. Gaussian smoothing
2. Gradient magnitude/direction (Sobel)
3. Non-maximum suppression
4. Hysteresis thresholding

**I/O:**
```
Input:  image: Float32Array, width: number, height: number,
        options: { sigma, lowThreshold, highThreshold }
Output: { edges: Uint8Array, magnitude: Float32Array, direction: Float32Array }
```

**Code:**
```javascript
import { canny } from '../processing/edge-detection/edge-operators.js';

const { edges, magnitude, direction } = canny(grayscale, width, height, {
    sigma: 1.4,
    lowThreshold: 0.1,
    highThreshold: 0.3
});
```

**Source:** `processing/edge-detection/edge-operators.js`, `Canny_edge_detector.md`

---

## 2. Segmentation

### 2.1 Otsu Threshold

**Formula:**
$$t^* = \arg\max_t \omega_0(t) \omega_1(t) [\mu_0(t) - \mu_1(t)]^2$$

**I/O:**
```
Input:  image: Float32Array (values 0-255)
Output: { threshold: number, variance: number }
```

**Code:**
```javascript
import { otsuThreshold } from '../processing/segmentation/thresholding.js';

const { threshold, variance } = otsuThreshold(grayscale);
```

**Source:** `processing/segmentation/thresholding.js`, `Otsu's_method.md`

---

### 2.2 Apply Threshold

**Formula:**
$$B(x,y) = \begin{cases} 1 & \text{if } I(x,y) \geq t \\ 0 & \text{otherwise} \end{cases}$$

**I/O:**
```
Input:  image: Float32Array, threshold: number
Output: Uint8Array (binary: 0 or 1)
```

**Code:**
```javascript
import { applyThreshold } from '../processing/segmentation/thresholding.js';

const binary = applyThreshold(grayscale, threshold);
```

**Source:** `processing/segmentation/thresholding.js`

---

### 2.3 Connected Components

**Formula:** 8-connectivity labeling with union-find

**I/O:**
```
Input:  binary: Uint8Array, width: number, height: number
Output: { labels: Int32Array, numComponents: number }
```

**Code:**
```javascript
import { connectedComponents } from '../processing/segmentation/thresholding.js';

const { labels, numComponents } = connectedComponents(binary, width, height);
```

**Source:** `processing/segmentation/thresholding.js`

---

## 3. Contour Extraction

### 3.1 Marching Squares

**Formula:**
$$\text{case} = c_{00} + 2c_{10} + 4c_{11} + 8c_{01}$$

**I/O:**
```
Input:  binary: Uint8Array, width: number, height: number
Output: Contour[] where Contour = { vertices: Vec2[], closed: boolean }
```

**Code:** *(TO IMPLEMENT)*
```javascript
function marchingSquares(binary, width, height) {
    // 16-case lookup table
    const EDGE_TABLE = [
        [],                           // 0: no edges
        [[3, 0]],                     // 1: bottom-left corner
        [[0, 1]],                     // 2: bottom-right corner
        [[3, 1]],                     // 3: bottom edge
        [[1, 2]],                     // 4: top-right corner
        [[3, 0], [1, 2]],             // 5: saddle (ambiguous)
        [[0, 2]],                     // 6: right edge
        [[3, 2]],                     // 7: all but top-left
        [[2, 3]],                     // 8: top-left corner
        [[2, 0]],                     // 9: left edge
        [[0, 1], [2, 3]],             // 10: saddle (ambiguous)
        [[2, 1]],                     // 11: all but top-right
        [[1, 3]],                     // 12: top edge
        [[1, 0]],                     // 13: all but bottom-right
        [[0, 3]],                     // 14: all but bottom-left
        []                            // 15: all inside
    ];
    
    // Edge midpoints: 0=bottom, 1=right, 2=top, 3=left
    const EDGE_OFFSETS = [
        [0.5, 0], [1, 0.5], [0.5, 1], [0, 0.5]
    ];
    
    const segments = [];
    
    for (let y = 0; y < height - 1; y++) {
        for (let x = 0; x < width - 1; x++) {
            const idx = y * width + x;
            const c00 = binary[idx] ? 1 : 0;
            const c10 = binary[idx + 1] ? 1 : 0;
            const c01 = binary[idx + width] ? 1 : 0;
            const c11 = binary[idx + width + 1] ? 1 : 0;
            
            const caseIndex = c00 | (c10 << 1) | (c11 << 2) | (c01 << 3);
            const edges = EDGE_TABLE[caseIndex];
            
            for (const [e1, e2] of edges) {
                const p1 = {
                    x: x + EDGE_OFFSETS[e1][0],
                    y: y + EDGE_OFFSETS[e1][1]
                };
                const p2 = {
                    x: x + EDGE_OFFSETS[e2][0],
                    y: y + EDGE_OFFSETS[e2][1]
                };
                segments.push([p1, p2]);
            }
        }
    }
    
    // Chain segments into contours
    return chainSegments(segments);
}

function chainSegments(segments) {
    // Build adjacency from segment endpoints
    // Connect into closed contours
    // ... implementation
}
```

**Source:** `Marching_squares.md`

---

## 4. Space-Filling Curves

### 4.1 Hilbert Curve

**Formula:** L-system or index-to-coordinate mapping

**I/O:**
```
Input:  order: number (recursion depth, 1-6)
Output: Vec2[] (2^(2*order) points in [0, 2^order-1])
```

**Code:**
```javascript
import { HilbertCurve } from '../processing/space-filling/space-filling-curves.js';

const points = HilbertCurve.generate(order);

// Transform to bounds
const scaled = points.map(p => ({
    x: bounds.x + (p.x / (1 << order)) * bounds.width,
    y: bounds.y + (p.y / (1 << order)) * bounds.height
}));
```

**Source:** `processing/space-filling/space-filling-curves.js`, `Hilbert_curve.md`

---

### 4.2 Curve Connectivity

**Formula:** Minimize total gap when joining curves

**I/O:**
```
Input:  curves: { points: Vec2[], entry: Corner, exit: Corner }[]
Output: Vec2[] (single connected path)
```

**Code:** *(TO IMPLEMENT)*
```javascript
function connectCurves(curves) {
    if (curves.length === 0) return [];
    
    let path = [...curves[0].points];
    
    for (let i = 1; i < curves.length; i++) {
        const prevEnd = path[path.length - 1];
        const nextPoints = curves[i].points;
        const nextStart = nextPoints[0];
        const nextEnd = nextPoints[nextPoints.length - 1];
        
        // Check if reversing reduces gap
        const distForward = distance(prevEnd, nextStart);
        const distReverse = distance(prevEnd, nextEnd);
        
        if (distReverse < distForward) {
            nextPoints.reverse();
        }
        
        path.push(...nextPoints);
    }
    
    return path;
}

function distance(a, b) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return Math.sqrt(dx * dx + dy * dy);
}
```

---

## 5. Point Distribution

### 5.1 Poisson Disk Sampling

**Formula:** Bridson's algorithm with spatial hashing

**I/O:**
```
Input:  width: number, height: number, minDist: number, k?: number
Output: Vec2[]
```

**Code:**
```javascript
import { poissonDisk } from '../processing/sampling/point-distribution.js';

const points = poissonDisk(width, height, minDist, 30);
```

**Source:** `processing/sampling/point-distribution.js`, `Poisson_disk_sampling.md`

---

### 5.2 Variable Density Poisson

**Formula:** Spatially-varying radius: $r(x,y) = r_{min} + (r_{max} - r_{min}) \cdot f(x,y)$

**I/O:**
```
Input:  width, height, densityFn: (x,y) => [0,1], minDist, maxDist, k
Output: Vec2[]
```

**Code:**
```javascript
import { variablePoissonDisk } from '../processing/sampling/point-distribution.js';

const densityFn = (x, y) => {
    const intensity = grayscale[Math.floor(y) * width + Math.floor(x)];
    return 1 - intensity / 255; // Dark = dense
};

const points = variablePoissonDisk(width, height, densityFn, minDist, maxDist, 30);
```

**Source:** `processing/sampling/point-distribution.js`

---

## 6. Path Optimization

### 6.1 Nearest Neighbor

**Formula:** Greedy construction

**I/O:**
```
Input:  points: Vec2[]
Output: number[] (indices forming path)
```

**Code:**
```javascript
import { nearestNeighbor } from '../processing/tsp/path-optimization.js';

const path = nearestNeighbor(points);
```

**Source:** `processing/tsp/path-optimization.js`

---

### 6.2 2-opt Improvement

**Formula:** Swap if $d(i,j) + d(i+1,j+1) < d(i,i+1) + d(j,j+1)$

**I/O:**
```
Input:  points: Vec2[], initialPath: number[]
Output: number[] (improved path)
```

**Code:**
```javascript
import { twoOpt } from '../processing/tsp/path-optimization.js';

const optimizedPath = twoOpt(points, initialPath);
```

**Source:** `processing/tsp/path-optimization.js`, `2-opt.md`

---

### 6.3 Full TSP Solver

**I/O:**
```
Input:  points: Vec2[], options?: { method: 'nearest' | '2opt' | '3opt' }
Output: { path: Vec2[], length: number }
```

**Code:**
```javascript
import { solveTSP } from '../processing/tsp/path-optimization.js';

const { path, length } = solveTSP(points, { method: '2opt' });
```

**Source:** `processing/tsp/path-optimization.js`

---

## 7. Geometry

### 7.1 Point in Polygon

**Formula:** Ray casting — count edge intersections

**I/O:**
```
Input:  point: Vec2, polygon: Vec2[]
Output: boolean
```

**Code:**
```javascript
import { pointInPolygon } from '../processing/geometry/polygon-operations.js';

const inside = pointInPolygon(point, polygon);
```

**Source:** `processing/geometry/polygon-operations.js`, `Point_in_polygon.md`

---

### 7.2 Square Packing

**Formula:** Quadtree subdivision with containment test

**I/O:**
```
Input:  polygon: Vec2[], minSize: number
Output: Rect[] where Rect = { x, y, width, height }
```

**Code:**
```javascript
import { packSquaresInPolygon } from '../processing/geometry/polygon-operations.js';

const squares = packSquaresInPolygon(polygon, minSize);
```

**Source:** `processing/geometry/polygon-operations.js`

---

## 8. Modulation

### 8.1 Width from Intensity

**Formula:**
$$w = w_{min} + (w_{max} - w_{min}) \cdot \frac{255 - I}{255}$$

**I/O:**
```
Input:  path: Vec2[], intensity: Float32Array, width: number, wMin: number, wMax: number
Output: number[]
```

**Code:**
```javascript
function modulateWidth(path, intensity, imgWidth, wMin, wMax) {
    return path.map(p => {
        const px = Math.floor(p.x);
        const py = Math.floor(p.y);
        const idx = py * imgWidth + px;
        const I = intensity[idx] || 0;
        return wMin + (wMax - wMin) * (1 - I / 255);
    });
}
```

---

### 8.2 Gaussian Smoothing (1D)

**Formula:**
$$w'_i = \frac{\sum_j G(j) \cdot w_{i+j}}{\sum_j G(j)}$$

**I/O:**
```
Input:  values: number[], sigma: number
Output: number[]
```

**Code:**
```javascript
function gaussianSmooth1D(values, sigma) {
    const radius = Math.ceil(sigma * 3);
    const kernel = [];
    let sum = 0;
    
    for (let i = -radius; i <= radius; i++) {
        const g = Math.exp(-(i * i) / (2 * sigma * sigma));
        kernel.push(g);
        sum += g;
    }
    kernel.forEach((_, i) => kernel[i] /= sum);
    
    return values.map((_, i) => {
        let acc = 0;
        for (let j = -radius; j <= radius; j++) {
            const idx = Math.max(0, Math.min(values.length - 1, i + j));
            acc += values[idx] * kernel[j + radius];
        }
        return acc;
    });
}
```

---

## 9. Output

### 9.1 Path to SVG

**I/O:**
```
Input:  paths: { points: Vec2[], widths: number[] }[], options: { stroke, viewBox }
Output: string (SVG document)
```

**Code:** *(TO IMPLEMENT)*
```javascript
function pathsToSVG(paths, options = {}) {
    const { stroke = '#000000', viewBox = [0, 0, 100, 100] } = options;
    const [vx, vy, vw, vh] = viewBox;
    
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vx} ${vy} ${vw} ${vh}">`;
    
    for (const { points, widths } of paths) {
        // Option A: Single path with average width
        const avgWidth = widths.reduce((a, b) => a + b, 0) / widths.length;
        const d = points.map((p, i) => 
            (i === 0 ? 'M' : 'L') + `${p.x.toFixed(2)} ${p.y.toFixed(2)}`
        ).join(' ');
        svg += `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${avgWidth.toFixed(2)}"/>`;
        
        // Option B: Segments with variable width (more accurate)
        // for (let i = 0; i < points.length - 1; i++) {
        //     const p1 = points[i], p2 = points[i + 1];
        //     const w = (widths[i] + widths[i + 1]) / 2;
        //     svg += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" `;
        //     svg += `stroke="${stroke}" stroke-width="${w.toFixed(2)}" stroke-linecap="round"/>`;
        // }
    }
    
    svg += '</svg>';
    return svg;
}
```

---

## Summary Table

| Function | Module | Status |
|----------|--------|--------|
| `rgbToGrayscale` | local | ✓ Implement |
| `gaussianKernel` | matrix.js | ✓ Exists |
| `sobel` | edge-operators.js | ✓ Exists |
| `canny` | edge-operators.js | ✓ Exists |
| `otsuThreshold` | thresholding.js | ✓ Exists |
| `applyThreshold` | thresholding.js | ✓ Exists |
| `connectedComponents` | thresholding.js | ✓ Exists |
| `marchingSquares` | geometry/ | ⚠ To implement |
| `HilbertCurve.generate` | space-filling-curves.js | ✓ Exists |
| `connectCurves` | space-filling/ | ⚠ To implement |
| `poissonDisk` | point-distribution.js | ✓ Exists |
| `variablePoissonDisk` | point-distribution.js | ✓ Exists |
| `nearestNeighbor` | path-optimization.js | ✓ Exists |
| `twoOpt` | path-optimization.js | ✓ Exists |
| `solveTSP` | path-optimization.js | ✓ Exists |
| `pointInPolygon` | polygon-operations.js | ✓ Exists |
| `packSquaresInPolygon` | polygon-operations.js | ✓ Exists |
| `modulateWidth` | local | ✓ Implement |
| `gaussianSmooth1D` | local | ✓ Implement |
| `pathsToSVG` | output/ | ⚠ To implement |

