# Generative Pattern Algorithm — Implementation Guide

## 1. File Structure

```
assets/js/tools/
├── generative-pattern/
│   └── generative-pattern-tool.js    # Main tool class

assets/js/sections/
└── tools/
    └── generative-pattern-section.js # Section wiring

blog/pages/tools/
└── generative-pattern.json           # Page configuration
```

## 2. Tool Class Skeleton

```javascript
import ToolBase from '../tool-base.js';
import { 
    Noise, SDF, Sampling, SpatialIndex, 
    ReactionDiffusion, MarchingSquares, 
    Patterns, JFA, Advection 
} from '../../shared/algorithms/index.js';

export default class GenerativePatternTool extends ToolBase {
    constructor(container, options = {}) {
        super(container, {
            name: 'generative-pattern',
            title: 'Generative Pattern',
            ...options
        });
        
        // State
        this.points = [];
        this.edges = [];
        this.kdTree = null;
        this.distanceField = null;
        
        // Dirty flags
        this.dirtyPoints = true;
        this.dirtyConnectivity = true;
        this.dirtyField = true;
    }
    
    getDefaultParams() {
        return {
            // Distribution
            density: 1.0,
            gridStrength: 0.5,
            clusterScale: 1.0,
            jitter: 0.2,
            
            // Connectivity
            neighborRadius: 2.0,
            maxDegree: 4,
            arcQuantisation: 0,
            axisBias: 0,
            
            // Evolution
            evolutionMode: 'none',
            Du: 0.2,
            Dv: 0.1,
            feedRate: 0.055,
            killRate: 0.062,
            
            // Rendering
            renderMode: 'truchet',
            weightScale: 1.0,
            tileWindow: 1.0,
            contourCount: 8,
            
            // Animation
            animate: false,
            flowSpeed: 0.3,
            noiseFrequency: 0.5
        };
    }
    
    // Lifecycle methods
    onInit() {
        this.rebuildAll();
    }
    
    onUpdate(changedParams) {
        if (this.affectsPoints(changedParams)) this.dirtyPoints = true;
        if (this.affectsConnectivity(changedParams)) this.dirtyConnectivity = true;
        if (this.affectsField(changedParams)) this.dirtyField = true;
        
        this.processUpdates();
    }
    
    onDraw(ctx) {
        const { renderMode } = this.params;
        
        ctx.fillStyle = 'var(--vga-black)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        switch (renderMode) {
            case 'truchet':
                this.renderTruchet(ctx);
                break;
            case 'blob':
                this.renderBlobs(ctx);
                break;
            case 'nested':
            case 'global':
                this.renderContours(ctx);
                break;
        }
    }
    
    // Processing methods
    rebuildPoints() {
        const { density, gridStrength, jitter } = this.params;
        const w = this.canvas.width;
        const h = this.canvas.height;
        
        // Generate base points
        const poisson = Sampling.poissonDisk(w, h, 20 / density);
        
        // Apply grid strength interpolation
        // ... implementation
        
        this.points = poisson;
        this.dirtyPoints = false;
        this.dirtyConnectivity = true;
    }
    
    rebuildConnectivity() {
        if (!this.points.length) return;
        
        const { neighborRadius, maxDegree } = this.params;
        
        this.kdTree = SpatialIndex.buildKDTree(this.points);
        this.edges = [];
        
        for (let i = 0; i < this.points.length; i++) {
            const neighbors = SpatialIndex.kdRadiusSearch(
                this.kdTree, 
                this.points[i], 
                neighborRadius * 20
            );
            
            // Limit degree
            const limited = neighbors.slice(0, maxDegree);
            for (const j of limited) {
                if (j > i) {
                    this.edges.push({ i, j });
                }
            }
        }
        
        this.dirtyConnectivity = false;
        this.dirtyField = true;
    }
    
    rebuildDistanceField() {
        // ... JFA implementation
        this.dirtyField = false;
    }
    
    // Render methods
    renderTruchet(ctx) {
        // Use Patterns.generateTruchetGrid
    }
    
    renderBlobs(ctx) {
        // Use SDF operations
    }
    
    renderContours(ctx) {
        // Use MarchingSquares.extractContours
    }
    
    // Helper methods
    affectsPoints(params) {
        return ['density', 'gridStrength', 'clusterScale', 'jitter'].some(
            p => params.includes(p)
        );
    }
    
    affectsConnectivity(params) {
        return ['neighborRadius', 'maxDegree', 'arcQuantisation', 'axisBias'].some(
            p => params.includes(p)
        );
    }
    
    affectsField(params) {
        return ['weightScale'].some(p => params.includes(p));
    }
    
    destroy() {
        super.destroy();
        this.points = [];
        this.edges = [];
        this.kdTree = null;
        this.distanceField = null;
    }
}
```

## 3. Sidebar Configuration

```javascript
getSidebarConfig() {
    return {
        tabs: [
            {
                id: 'controls',
                label: 'CONTROLS',
                blocks: [
                    {
                        id: 'distribution',
                        label: 'Distribution',
                        components: [
                            { type: 'slider', param: 'density', label: 'Density', min: 0.1, max: 2, step: 0.01 },
                            { type: 'slider', param: 'gridStrength', label: 'Grid Strength', min: 0, max: 1, step: 0.01 },
                            { type: 'slider', param: 'clusterScale', label: 'Cluster Scale', min: 0.1, max: 5, step: 0.1 },
                            { type: 'slider', param: 'jitter', label: 'Jitter', min: 0, max: 1, step: 0.01 }
                        ]
                    },
                    {
                        id: 'connectivity',
                        label: 'Connectivity',
                        components: [
                            { type: 'slider', param: 'neighborRadius', label: 'Radius', min: 0.5, max: 5, step: 0.1 },
                            { type: 'stepper', param: 'maxDegree', label: 'Max Degree', min: 2, max: 8 },
                            { type: 'slider', param: 'arcQuantisation', label: 'Arc Quant', min: 0, max: 1, step: 0.1 },
                            { type: 'slider', param: 'axisBias', label: 'Axis Bias', min: 0, max: 1, step: 0.01 }
                        ]
                    }
                ]
            },
            {
                id: 'style',
                label: 'STYLE',
                blocks: [
                    {
                        id: 'evolution',
                        label: 'Evolution',
                        components: [
                            { type: 'dropdown', param: 'evolutionMode', label: 'Mode', options: ['none', 'rd', 'ca'] },
                            { type: 'slider', param: 'Du', label: 'Du', min: 0.1, max: 1, step: 0.01, visible: 'evolutionMode === "rd"' },
                            { type: 'slider', param: 'Dv', label: 'Dv', min: 0.01, max: 0.2, step: 0.01, visible: 'evolutionMode === "rd"' },
                            { type: 'slider', param: 'feedRate', label: 'Feed', min: 0, max: 0.1, step: 0.001, visible: 'evolutionMode === "rd"' }
                        ]
                    },
                    {
                        id: 'rendering',
                        label: 'Rendering',
                        components: [
                            { type: 'dropdown', param: 'renderMode', label: 'Mode', options: ['truchet', 'blob', 'nested', 'global'] },
                            { type: 'slider', param: 'weightScale', label: 'Weight', min: 0.1, max: 3, step: 0.1 },
                            { type: 'slider', param: 'tileWindow', label: 'Window', min: 0.5, max: 2, step: 0.1 },
                            { type: 'stepper', param: 'contourCount', label: 'Contours', min: 2, max: 32 }
                        ]
                    }
                ]
            },
            {
                id: 'canvas',
                label: 'CANVAS',
                blocks: [
                    {
                        id: 'size',
                        label: 'Size',
                        components: [
                            { type: 'slider', param: 'width', label: 'Width', min: 196, max: 840, step: 14 },
                            { type: 'slider', param: 'height', label: 'Height', min: 196, max: 840, step: 14 }
                        ]
                    },
                    {
                        id: 'export',
                        label: 'Export',
                        components: [
                            { type: 'button', action: 'exportPNG', label: 'Download PNG' },
                            { type: 'button', action: 'exportSVG', label: 'Download SVG' },
                            { type: 'button', action: 'exportGIF', label: 'Export GIF' }
                        ]
                    }
                ]
            },
            {
                id: 'info',
                label: 'INFO',
                blocks: [
                    {
                        id: 'about',
                        label: 'About',
                        components: [
                            { type: 'label', text: 'Unified generative pattern system' }
                        ]
                    }
                ]
            }
        ]
    };
}
```

## 4. Registration

```javascript
// In app.js or router.js
import GenerativePatternTool from './tools/generative-pattern/generative-pattern-tool.js';

ToolRegistry.register('generative-pattern', GenerativePatternTool);
```

## 5. Requirements Mapping

| Requirement Source | Section | How Satisfied | Status |
|--------------------|---------|---------------|--------|
| tool-build-guide | ToolBase extension | Class extends ToolBase | Planned |
| tool-build-guide | Sidebar config | getSidebarConfig() method | Planned |
| tool-build-guide | Lifecycle hooks | onInit, onUpdate, onDraw | Planned |
| tool-standards | Export controls | PNG, SVG, GIF buttons | Planned |
| tool-standards | Canvas sizing | F-multiple sliders | Planned |
| f-system | Dimensions | 14px base unit | Planned |
| lazy-loading | Deferred load | Via AssetLoader | Planned |
| .cursorrules | AnimationFoundation | No raw RAF | Planned |
| .cursorrules | VGA colors | CSS vars only | Planned |
| .cursorrules | BaseComponent | Via ToolBase | Planned |

## 6. Testing Checklist

### Functional
- [ ] Points generate with correct density
- [ ] Grid strength interpolates smoothly
- [ ] Connectivity respects maxDegree
- [ ] RD evolution produces expected patterns
- [ ] All render modes display correctly

### Visual
- [ ] VGA colors only
- [ ] F-system alignment
- [ ] Smooth transitions between modes

### Performance
- [ ] Frame rate > 30fps at default settings
- [ ] No memory leaks on parameter changes
- [ ] Caching reduces redundant computation

### Integration
- [ ] Sidebar controls update canvas
- [ ] Export functions work
- [ ] Animation loop starts/stops correctly
- [ ] Tool destroys cleanly

