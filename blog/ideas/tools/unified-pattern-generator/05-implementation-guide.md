# Unified Pattern Generator — Implementation Guide

## 1. File Structure

```
assets/js/tools/
├── unified-pattern/
│   └── unified-pattern-tool.js

assets/js/sections/tools/
└── unified-pattern-section.js

blog/pages/tools/
└── unified-pattern.json
```

## 2. Tool Class Skeleton

```javascript
import ToolBase from '../tool-base.js';
import { Noise, SDF, Patterns, Rendering } from '../../shared/algorithms/index.js';

export default class UnifiedPatternTool extends ToolBase {
    constructor(container, options = {}) {
        super(container, {
            name: 'unified-pattern',
            title: 'Unified Pattern Generator',
            ...options
        });
    }
    
    getDefaultParams() {
        return {
            gridSpacing: 80,
            jitter: 0,
            roundingP: 4,
            aspectRange: 1,
            sizeDistribution: 1,
            nestingDepth: 1,
            nestingRatio: 0.7,
            warpAmplitude: 0,
            warpFrequency: 0.5,
            blendRadius: 0
        };
    }
    
    onDraw(ctx) {
        const { width, height } = this.canvas;
        const imageData = ctx.createImageData(width, height);
        
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const nx = (x / width) * 2 - 1;
                const ny = (y / height) * 2 - 1;
                
                // Apply warp
                const warped = this.applyWarp(nx, ny);
                
                // Evaluate SDF
                const d = this.evaluateSDF(warped.x, warped.y);
                
                // Map to color
                const color = this.mapColor(d);
                
                const i = (y * width + x) * 4;
                imageData.data[i] = color.r;
                imageData.data[i+1] = color.g;
                imageData.data[i+2] = color.b;
                imageData.data[i+3] = 255;
            }
        }
        
        ctx.putImageData(imageData, 0, 0);
    }
    
    applyWarp(x, y) {
        const { warpAmplitude, warpFrequency } = this.params;
        if (warpAmplitude === 0) return { x, y };
        return Noise.domainWarp2D(x, y, warpAmplitude, this.seed);
    }
    
    evaluateSDF(x, y) {
        // Evaluate superellipse for each shape
        // Apply smooth union
        return 0;
    }
    
    mapColor(distance) {
        // Map distance to VGA color
        return { r: 0, g: 0, b: 0 };
    }
}
```

## 3. Sidebar Configuration

```javascript
getSidebarConfig() {
    return {
        tabs: [
            { id: 'controls', label: 'CONTROLS', blocks: [...] },
            { id: 'style', label: 'STYLE', blocks: [...] },
            { id: 'canvas', label: 'CANVAS', blocks: [...] },
            { id: 'info', label: 'INFO', blocks: [...] }
        ]
    };
}
```

## 4. Requirements Mapping

| Requirement | Status |
|-------------|--------|
| ToolBase extension | Planned |
| VGA colors | Planned |
| F-system sizing | Planned |
| AnimationFoundation | N/A (static) |

