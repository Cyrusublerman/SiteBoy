# Complex Line Shading — Implementation Guide

## 1. File Structure

```
assets/js/tools/
└── complex-line-shading.js    ← Main tool file

blog/ideas/reference documentation/processing/
├── edge-detection/edge-operators.js
├── segmentation/thresholding.js
├── sampling/point-distribution.js
├── space-filling/space-filling-curves.js
├── tsp/path-optimization.js
├── geometry/polygon-operations.js
└── index.js
```

---

## 2. Tool Class Structure

```javascript
import { ToolBase } from '../core/tool-base.js';
import * as Processing from '../../blog/ideas/reference documentation/processing/index.js';

export class ComplexLineShadingTool extends ToolBase {
    constructor(container, options) {
        super(container, options);
        
        // State
        this.sourceImage = null;
        this.grayscale = null;
        this.regions = null;
        this.paths = [];
        
        // Bind methods
        this.processImage = this.processImage.bind(this);
        this.generateFill = this.generateFill.bind(this);
    }
    
    static get toolId() { return 'complex-line-shading'; }
    static get toolName() { return 'Complex Line Shading'; }
    
    getDefaultValues() {
        return {
            edgeSigma: 1.4,
            edgeLow: 0.1,
            edgeHigh: 0.3,
            fillMethod: 'hilbert',
            minSquareSize: 16,
            curveOrder: 4,
            pointSpacingMin: 8,
            pointSpacingMax: 32,
            optimization: '2opt',
            lineWidthMin: 0.5,
            lineWidthMax: 3.0,
            smoothing: 5,
            invert: false,
            strokeColor: '#000000',
            backgroundColor: '#ffffff'
        };
    }
}
```

---

## 3. Sidebar Configuration

```javascript
getSidebarConfig() {
    return {
        tabs: [
            ['CONTROLS', [
                ['block', 'Source', [
                    ['file', 'Upload Image', 'image/*', { key: 'sourceFile' }],
                    ['button', 'Clear', null, { key: 'clear' }]
                ]],
                ['block', 'Edge Detection', [
                    ['slider', 'Sigma', 0.5, 5.0, 0.1, { value: 1.4, key: 'edgeSigma' }],
                    ['slider', 'Low Threshold', 0, 1, 0.01, { value: 0.1, key: 'edgeLow' }],
                    ['slider', 'High Threshold', 0, 1, 0.01, { value: 0.3, key: 'edgeHigh' }]
                ]],
                ['block', 'Fill Method', [
                    ['dropdown', 'Method', ['Hilbert', 'TSP'], { value: 'Hilbert', key: 'fillMethod' }]
                ]],
                ['block', 'Hilbert Settings', [
                    ['slider', 'Min Square', 4, 64, 4, { value: 16, key: 'minSquareSize' }],
                    ['slider', 'Curve Order', 2, 6, 1, { value: 4, key: 'curveOrder' }]
                ]],
                ['block', 'TSP Settings', [
                    ['slider', 'Min Spacing', 2, 32, 1, { value: 8, key: 'pointSpacingMin' }],
                    ['slider', 'Max Spacing', 8, 128, 1, { value: 32, key: 'pointSpacingMax' }],
                    ['dropdown', 'Optimization', ['None', '2-opt', '3-opt'], { value: '2-opt', key: 'optimization' }]
                ]]
            ]],
            ['STYLE', [
                ['block', 'Line Modulation', [
                    ['slider', 'Min Width', 0.1, 5, 0.1, { value: 0.5, key: 'lineWidthMin' }],
                    ['slider', 'Max Width', 0.5, 10, 0.1, { value: 3.0, key: 'lineWidthMax' }],
                    ['slider', 'Smoothing', 0, 20, 1, { value: 5, key: 'smoothing' }],
                    ['toggle', 'Options', ['Invert'], { selectedValues: [], key: 'invert' }]
                ]],
                ['block', 'Colors', [
                    ['color', 'Stroke', '#000000', { key: 'strokeColor' }],
                    ['color', 'Background', '#ffffff', { key: 'backgroundColor' }]
                ]]
            ]],
            ['CANVAS', [
                ['block', 'Export', [
                    ['button', 'Download SVG', null, { key: 'exportSvg' }],
                    ['button', 'Download PNG', null, { key: 'exportPng' }]
                ]]
            ]]
        ]
    };
}
```

---

## 4. Core Pipeline Methods

### 4.1 Image Loading

```javascript
async onFileChange(file) {
    if (!file) return;
    
    this.sourceImage = await this.loadImage(file);
    this.grayscale = this.rgbToGrayscale(this.sourceImage);
    
    await this.processImage();
}

async loadImage(file) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            resolve(ctx.getImageData(0, 0, img.width, img.height));
        };
        img.src = URL.createObjectURL(file);
    });
}

rgbToGrayscale(imageData) {
    const { data, width, height } = imageData;
    const gray = new Float32Array(width * height);
    for (let i = 0, j = 0; i < data.length; i += 4, j++) {
        gray[j] = 0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2];
    }
    return gray;
}
```

### 4.2 Region Extraction

```javascript
extractRegions() {
    const { width, height } = this.sourceImage;
    const { threshold } = Processing.otsuThreshold(this.grayscale);
    const binary = Processing.applyThreshold(this.grayscale, threshold);
    const { labels, numComponents } = Processing.connectedComponents(binary, width, height);
    
    this.regions = [];
    for (let i = 1; i <= numComponents; i++) {
        const contour = this.marchingSquares(labels, width, height, i);
        if (contour.length > 10) {
            this.regions.push({
                id: i,
                contour: contour,
                bounds: this.getBounds(contour)
            });
        }
    }
}
```

### 4.3 Space Filling

```javascript
generateFill(region) {
    const v = this.values;
    
    if (v.fillMethod === 'Hilbert') {
        return this.hilbertFill(region);
    } else {
        return this.tspFill(region);
    }
}

hilbertFill(region) {
    const squares = Processing.packSquaresInPolygon(region.contour, this.values.minSquareSize);
    const curves = squares.map(sq => {
        const points = Processing.HilbertCurve.generate(this.values.curveOrder);
        return points.map(p => ({
            x: sq.x + (p.x / (1 << this.values.curveOrder)) * sq.width,
            y: sq.y + (p.y / (1 << this.values.curveOrder)) * sq.height
        }));
    });
    return this.connectCurves(curves);
}

tspFill(region) {
    const { width, height } = this.sourceImage;
    const densityFn = (x, y) => {
        const I = this.grayscale[Math.floor(y) * width + Math.floor(x)] || 0;
        return 1 - I / 255;
    };
    
    const points = Processing.variablePoissonDisk(
        region.bounds.width, region.bounds.height,
        densityFn,
        this.values.pointSpacingMin,
        this.values.pointSpacingMax,
        30
    ).filter(p => Processing.pointInPolygon(
        { x: region.bounds.x + p.x, y: region.bounds.y + p.y },
        region.contour
    )).map(p => ({ x: region.bounds.x + p.x, y: region.bounds.y + p.y }));
    
    const { path } = Processing.solveTSP(points, { method: this.values.optimization.toLowerCase() });
    return path;
}
```

### 4.4 Width Modulation

```javascript
modulateWidth(path) {
    const { width } = this.sourceImage;
    const { lineWidthMin, lineWidthMax, smoothing, invert } = this.values;
    
    let widths = path.map(p => {
        const px = Math.floor(p.x);
        const py = Math.floor(p.y);
        const I = this.grayscale[py * width + px] || 128;
        const t = invert ? I / 255 : 1 - I / 255;
        return lineWidthMin + (lineWidthMax - lineWidthMin) * t;
    });
    
    if (smoothing > 0) {
        widths = this.gaussianSmooth1D(widths, smoothing);
    }
    
    return widths;
}

gaussianSmooth1D(values, sigma) {
    const radius = Math.ceil(sigma * 2);
    const kernel = [];
    let sum = 0;
    for (let i = -radius; i <= radius; i++) {
        const g = Math.exp(-(i * i) / (2 * sigma * sigma));
        kernel.push(g);
        sum += g;
    }
    return values.map((_, i) => {
        let acc = 0;
        for (let j = -radius; j <= radius; j++) {
            const idx = Math.max(0, Math.min(values.length - 1, i + j));
            acc += values[idx] * kernel[j + radius] / sum;
        }
        return acc;
    });
}
```

---

## 5. Rendering

```javascript
draw() {
    const ctx = this.ctx;
    const { width, height } = this.canvas;
    
    // Background
    ctx.fillStyle = this.values.backgroundColor;
    ctx.fillRect(0, 0, width, height);
    
    // Draw paths
    ctx.strokeStyle = this.values.strokeColor;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    for (const { points, widths } of this.paths) {
        for (let i = 0; i < points.length - 1; i++) {
            ctx.beginPath();
            ctx.lineWidth = (widths[i] + widths[i + 1]) / 2;
            ctx.moveTo(points[i].x, points[i].y);
            ctx.lineTo(points[i + 1].x, points[i + 1].y);
            ctx.stroke();
        }
    }
}
```

---

## 6. SVG Export

```javascript
generateSVG() {
    const { width, height } = this.sourceImage;
    const stroke = this.values.strokeColor;
    
    let svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">
<rect width="100%" height="100%" fill="${this.values.backgroundColor}"/>`;
    
    for (const { points, widths } of this.paths) {
        for (let i = 0; i < points.length - 1; i++) {
            const p1 = points[i], p2 = points[i + 1];
            const w = ((widths[i] + widths[i + 1]) / 2).toFixed(2);
            svg += `<line x1="${p1.x.toFixed(1)}" y1="${p1.y.toFixed(1)}" `;
            svg += `x2="${p2.x.toFixed(1)}" y2="${p2.y.toFixed(1)}" `;
            svg += `stroke="${stroke}" stroke-width="${w}" stroke-linecap="round"/>`;
        }
    }
    
    svg += '</svg>';
    return svg;
}

exportSVG() {
    const svg = this.generateSVG();
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'line-shading.svg';
    a.click();
    URL.revokeObjectURL(url);
}
```

---

## 7. Registration

### index.html
```html
<script type="module" src="assets/js/tools/complex-line-shading.js"></script>
```

### tools_section.js
```javascript
// 1. Import
import { ComplexLineShadingTool } from '../tools/complex-line-shading.js';

// 2. Add to pages array
const pages = [
    // ... existing pages
    { url: '/complex-line-shading', json: 'complex-line-shading.json' }
];

// 3. Add to toolsSections
const toolsSections = {
    // ... existing sections
    'Image Processing': ['complex-line-shading', ...]
};

// 4. Add to renderTool
case 'complex-line-shading':
    return new ComplexLineShadingTool(container, options);
```

---

## 8. Gaps to Implement

| Function | Location | Priority |
|----------|----------|----------|
| `marchingSquares()` | tool file or geometry/ | High |
| `connectCurves()` | tool file or space-filling/ | High |
| Conditional block visibility | sidebar | Medium |
| Progress indicator | UI | Low |

---

## 9. Testing Checklist

- [ ] Image upload works (JPEG, PNG)
- [ ] Clear button resets state
- [ ] Edge params update preview
- [ ] Fill method switch works
- [ ] Hilbert params work when active
- [ ] TSP params work when active
- [ ] Width modulation visible
- [ ] SVG export produces valid file
- [ ] PNG export works
- [ ] Large images don't crash (2048×2048)

