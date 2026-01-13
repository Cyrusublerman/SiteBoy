# Moiré Generator — Implementation Guide

## 1. File Structure

```
assets/js/tools/
├── moire-generator/
│   └── moire-generator-tool.js

blog/pages/tools/
└── moire-generator.json
```

## 2. Tool Class Skeleton

```javascript
import ToolBase from '../tool-base.js';
import { Patterns, Noise } from '../../shared/algorithms/index.js';

export default class MoireGeneratorTool extends ToolBase {
    constructor(container, options = {}) {
        super(container, {
            name: 'moire-generator',
            title: 'Moiré Generator',
            ...options
        });
    }
    
    getDefaultParams() {
        return {
            gratingCount: 2,
            wavelength: 0.02,
            angularFrequency: 0,
            phaseOffset: 0,
            combination: 'sum',
            centreOffset: 0,
            centreWeightA: 1,
            centreWeightB: 1,
            maskType: 'none',
            maskSize: 1,
            maskSoftness: 0,
            threshold: 0.5,
            animate: false,
            phaseSpeed: 0.1
        };
    }
    
    onDraw(ctx) {
        const { width, height } = this.canvas;
        const imageData = ctx.createImageData(width, height);
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                // Normalize coordinates to [-1, 1]
                const nx = (x / width) * 2 - 1;
                const ny = (y / height) * 2 - 1;
                
                // Evaluate gratings
                const g1 = Patterns.radialGrating(
                    nx, ny, 
                    this.params.wavelength, 
                    this.params.phaseOffset
                );
                const g2 = Patterns.radialGrating(
                    nx - this.params.centreOffset, ny, 
                    this.params.wavelength, 
                    this.params.phaseOffset
                );
                
                // Combine
                const combined = Patterns.combineMoire(
                    [g1, g2], 
                    this.params.combination
                );
                
                // Threshold
                const value = combined > this.params.threshold ? 255 : 0;
                
                const i = (y * width + x) * 4;
                imageData.data[i] = value;
                imageData.data[i+1] = value;
                imageData.data[i+2] = value;
                imageData.data[i+3] = 255;
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
    }
    
    onAnimationFrame(time) {
        if (this.params.animate) {
            this.params.phaseOffset = (time * this.params.phaseSpeed) % 1;
            this.requestRedraw();
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
| AnimationFoundation | Planned |

