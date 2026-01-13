# Interference Figure Generator — Implementation Guide

## 1. File Structure

```
assets/js/tools/
├── interference-figure/
│   └── interference-figure-tool.js

blog/pages/tools/
└── interference-figure.json
```

## 2. Tool Class Skeleton

```javascript
import ToolBase from '../tool-base.js';
import { Optics, Noise } from '../../shared/algorithms/index.js';

export default class InterferenceFigureTool extends ToolBase {
    constructor(container, options = {}) {
        super(container, {
            name: 'interference-figure',
            title: 'Interference Figure Generator',
            ...options
        });
        
        // Precompute spectral matrices
        this.setupSpectralConversion();
    }
    
    getDefaultParams() {
        return {
            patternFamily: 'rings',
            radialWeight: 1.0,
            spiralWeight: 0,
            spiralRate: 2,
            wedgeXWeight: 0,
            wedgeYWeight: 0,
            angularN2: 0,
            angularN4: 0,
            angularN6: 0,
            angularN8: 0,
            saddleWeight: 0,
            squareWeight: 0,
            globalScale: 1.0,
            multiAxisCount: 0,
            axisRadius: 0.2,
            spectralMode: 'physical',
            exposure: 1.0,
            gamma: 2.2,
            saturationBoost: 1.0,
            noiseWeight: 0.1,
            noiseScale: 1.0,
            noiseOctaves: 3
        };
    }
    
    setupSpectralConversion() {
        // Precompute wavelength → XYZ matrices
        this.wavelengths = [];
        this.xyzCoeffs = [];
        
        const K = 16; // Number of samples
        for (let i = 0; i < K; i++) {
            const lambda = 380 + (i / (K - 1)) * (700 - 380);
            this.wavelengths.push(lambda);
            // XYZ color matching would be precomputed here
        }
    }
    
    evaluateOPD(x, y) {
        const p = this.params;
        const r = Math.sqrt(x * x + y * y);
        const theta = Math.atan2(y, x);
        
        let D = 0;
        D += p.radialWeight * r;
        D += p.spiralWeight * (r + p.spiralRate * theta);
        D += p.wedgeXWeight * x;
        D += p.wedgeYWeight * y;
        D += p.angularN2 * r * Math.cos(2 * theta);
        D += p.angularN4 * r * Math.cos(4 * theta);
        D += p.angularN6 * r * Math.cos(6 * theta);
        D += p.angularN8 * r * Math.cos(8 * theta);
        D += p.saddleWeight * (x * x - y * y);
        D += p.squareWeight * (x * x * x * x + y * y * y * y);
        
        // Add noise
        if (p.noiseWeight > 0) {
            const n = Noise.fbm2D(
                x * p.noiseScale, 
                y * p.noiseScale, 
                p.noiseOctaves
            );
            D += p.noiseWeight * n;
        }
        
        return D * p.globalScale;
    }
    
    onDraw(ctx) {
        const { width, height } = this.canvas;
        const imageData = ctx.createImageData(width, height);
        
        for (let py = 0; py < height; py++) {
            for (let px = 0; px < width; px++) {
                const x = (px / width) * 2 - 1;
                const y = (py / height) * 2 - 1;
                
                const D = this.evaluateOPD(x, y);
                const rgb = this.spectralToRGB(D);
                
                const i = (py * width + px) * 4;
                imageData.data[i] = rgb.r;
                imageData.data[i+1] = rgb.g;
                imageData.data[i+2] = rgb.b;
                imageData.data[i+3] = 255;
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
    }
    
    spectralToRGB(D) {
        // Sum over wavelengths
        let X = 0, Y = 0, Z = 0;
        
        for (let k = 0; k < this.wavelengths.length; k++) {
            const lambda = this.wavelengths[k];
            const I = Optics.thinFilmReflectance(D, lambda / 1000);
            // Accumulate XYZ (simplified)
            X += I;
            Y += I;
            Z += I;
        }
        
        // XYZ to RGB (simplified)
        const p = this.params;
        let r = X * p.exposure;
        let g = Y * p.exposure;
        let b = Z * p.exposure;
        
        // Gamma
        r = Math.pow(Math.max(0, r), 1 / p.gamma) * 255;
        g = Math.pow(Math.max(0, g), 1 / p.gamma) * 255;
        b = Math.pow(Math.max(0, b), 1 / p.gamma) * 255;
        
        return { r: Math.min(255, r), g: Math.min(255, g), b: Math.min(255, b) };
    }
}
```

## 3. Requirements Mapping

| Requirement | Status |
|-------------|--------|
| ToolBase extension | Planned |
| VGA colors | Planned |
| F-system | Planned |

