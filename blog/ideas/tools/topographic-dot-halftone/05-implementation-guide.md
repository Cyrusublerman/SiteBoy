# Topographic Dot Halftone — Implementation Guide

## 1. File Structure

```
assets/js/tools/
├── topographic-dot-halftone/
│   └── topographic-dot-halftone-tool.js

blog/pages/tools/
└── topographic-dot-halftone.json
```

## 2. Tool Class Skeleton

```javascript
import ToolBase from '../tool-base.js';
import { SDF, Geodesic, EdgeDetection, HalftonePatterns } from '../../shared/algorithms/index.js';

export default class TopographicDotHalftoneTool extends ToolBase {
    constructor(container, options = {}) {
        super(container, {
            name: 'topographic-dot-halftone',
            title: 'Topographic Dot Halftone',
            ...options
        });
        
        this.scalarField = null;
        this.tangentField = null;
        this.latticePoints = null;
    }
    
    getDefaultParams() {
        return {
            mode: 'field',
            contourSource: 'sdf',
            weightDepth: 0.5,
            weightNormal: 0.3,
            weightLuma: 0.2,
            normalInfluence: 0.5,
            depthInfluence: 0.5,
            shadingGamma: 1.0,
            dotDensity: 1.0,
            minRadius: 1,
            maxRadius: 8,
            bandPitch: 15,
            alongPitch: 15,
            bandJitter: 0.1,
            foregroundColor: '#000000',
            backgroundColor: '#FFFFFF'
        };
    }
    
    buildScalarField() {
        const { width, height } = this.canvas;
        const { mode, contourSource } = this.params;
        
        if (mode === 'vector') {
            switch (contourSource) {
                case 'sdf':
                    // Build from SDF
                    break;
                case 'geodesic':
                    this.scalarField = Geodesic.fastMarchingGeodesic(
                        this.seeds, this.boundary, width, height
                    );
                    break;
                case 'laplace':
                    this.scalarField = Geodesic.solveLaplace(
                        this.boundary, width, height, 1000
                    );
                    break;
            }
        } else {
            // Combine depth/normal/luma
            this.scalarField = this.combineFields();
        }
    }
    
    buildTangentField() {
        const { width, height } = this.canvas;
        const gradient = EdgeDetection.sobel({
            data: this.scalarField,
            width, height
        });
        
        this.tangentField = [];
        for (let i = 0; i < width * height; i++) {
            const gx = gradient.direction[i * 2];
            const gy = gradient.direction[i * 2 + 1];
            const len = Math.sqrt(gx * gx + gy * gy) || 1;
            this.tangentField.push({
                tx: -gy / len,
                ty: gx / len
            });
        }
    }
    
    generateLattice() {
        const { bandPitch, alongPitch } = this.params;
        
        this.latticePoints = HalftonePatterns.contourAlignedLattice(
            this.scalarField,
            this.tangentField,
            bandPitch,
            alongPitch,
            this.canvas.width,
            this.canvas.height
        );
        
        // Compute radii
        for (const point of this.latticePoints) {
            const luma = this.sampleLuma(point.x, point.y);
            point.radius = HalftonePatterns.sizeDotsFromLuminance(
                luma,
                this.params.minRadius,
                this.params.maxRadius,
                this.params.shadingGamma
            );
        }
    }
    
    onDraw(ctx) {
        ctx.fillStyle = this.params.backgroundColor;
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (!this.latticePoints) {
            this.buildScalarField();
            this.buildTangentField();
            this.generateLattice();
        }
        
        ctx.fillStyle = this.params.foregroundColor;
        for (const point of this.latticePoints) {
            ctx.beginPath();
            ctx.arc(point.x, point.y, point.radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}
```

## 3. Requirements Mapping

| Requirement | Status |
|-------------|--------|
| ToolBase extension | Planned |
| VGA colors | Planned |
| F-system | Planned |

