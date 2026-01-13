# Ribbon Breeze — Implementation Guide

## 1. File Structure

```
assets/js/tools/
├── ribbon-breeze/
│   └── ribbon-breeze-tool.js

blog/pages/tools/
└── ribbon-breeze.json
```

## 2. Tool Class Skeleton

```javascript
import ToolBase from '../tool-base.js';
import AnimationFoundation from '../../core/animation-foundation.js';
import { WaveSolver, CurveGeometry, Posterization, Animation } from '../../shared/algorithms/index.js';

export default class RibbonBreezeTool extends ToolBase {
    constructor(container, options = {}) {
        super(container, {
            name: 'ribbon-breeze',
            title: 'Ribbon Breeze',
            ...options
        });
        
        this.ribbons = [];
        this.animator = null;
    }
    
    getDefaultParams() {
        return {
            // Layout
            rows: 8,
            rowSpacing: 40,
            ribbonLength: 400,
            pointsPerRibbon: 100,
            thickness: 20,
            
            // Wind
            k: 0.03,
            omega: 0.05,
            baseAmplitude: 40,
            noiseAmount: 0.2,
            
            // Shading
            shadingMode: 'gradient',
            frontColor: '#FFFFFF',
            undersideColor: '#808080',
            riserColor: '#000000',
            
            // Loop
            loopFrames: 120,
            windCycles: 2
        };
    }
    
    onInit() {
        this.setupRibbons();
        this.startAnimation();
    }
    
    setupRibbons() {
        this.ribbons = [];
        const { rows, rowSpacing, ribbonLength, pointsPerRibbon } = this.params;
        
        for (let r = 0; r < rows; r++) {
            const ribbon = {
                y0: r * rowSpacing,
                points: [],
                segments: []
            };
            this.ribbons.push(ribbon);
        }
    }
    
    startAnimation() {
        this.animator = new AnimationFoundation.AnimationLoop({
            fps: 60,
            onFrame: (frame) => this.onAnimationFrame(frame)
        });
        this.animator.start();
    }
    
    onAnimationFrame(frame) {
        const t = Animation.loopTime(frame, this.params.loopFrames);
        this.updateRibbons(t);
        this.requestRedraw();
    }
    
    updateRibbons(t) {
        const { k, omega, baseAmplitude, ribbonLength, pointsPerRibbon } = this.params;
        
        for (const ribbon of this.ribbons) {
            ribbon.points = [];
            
            for (let i = 0; i < pointsPerRibbon; i++) {
                const x = (i / (pointsPerRibbon - 1)) * ribbonLength;
                const y = ribbon.y0 + WaveSolver.travellingWave(
                    x, t, k, omega, baseAmplitude, 0
                );
                ribbon.points.push({ x, y });
            }
            
            // Compute normals
            const normals = CurveGeometry.computeNormals(ribbon.points);
            
            // Extrude
            const { front, back } = CurveGeometry.extrudeRibbon(
                ribbon.points, normals, this.params.thickness
            );
            
            // Compute curvature and split into segments
            const curvature = CurveGeometry.computeCurvature(ribbon.points);
            ribbon.segments = this.splitIntoSegments(front, back, curvature);
        }
    }
    
    splitIntoSegments(front, back, curvature) {
        // Split at curvature sign changes
        const segments = [];
        // ... implementation
        return segments;
    }
    
    onDraw(ctx) {
        ctx.fillStyle = 'var(--vga-black)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Collect all segments
        const allSegments = this.ribbons.flatMap(r => r.segments);
        
        // Depth sort
        const sorted = CurveGeometry.depthSortBackToFront(allSegments);
        
        // Render
        for (const segment of sorted) {
            this.renderSegment(ctx, segment);
        }
    }
    
    renderSegment(ctx, segment) {
        // Draw filled polygon
        // Apply shading based on mode
    }
    
    destroy() {
        if (this.animator) {
            this.animator.destroy();
            this.animator = null;
        }
        super.destroy();
    }
}
```

## 3. Requirements Mapping

| Requirement | Status |
|-------------|--------|
| ToolBase extension | Planned |
| AnimationFoundation | Planned |
| VGA colors | Planned |
| F-system | Planned |
| destroy() cleanup | Planned |

