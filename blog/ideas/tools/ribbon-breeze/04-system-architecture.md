# Ribbon Breeze — System Architecture

## 1. OOP Class Structure

```
┌─────────────────────────────────────────────────────────────┐
│                    RibbonBreezeTool                         │
│                    (extends ToolBase)                       │
└─────────────────────────────────────────────────────────────┘
         │
         ├── RibbonField
         │      ├── Ribbon[] (multiple ribbons)
         │      └── WindField
         │
         ├── TimeLoop
         │      └── LFO generators
         │
         └── Renderer
                ├── ShadingModel
                └── DepthSorter
```

## 2. Data Flow

```
TimeLoop ──▶ WindField ──▶ Ribbon Front Points
                                  │
                                  ▼
                           NormalField
                                  │
                                  ▼
                            Extruder ──▶ Back Points
                                  │
                                  ▼
                           FoldDetector ──▶ Segments
                                  │
                                  ▼
                           DepthSorter ──▶ Sorted Segments
                                  │
                                  ▼
                           ShadingModel ──▶ Colors
                                  │
                                  ▼
                             Renderer ──▶ Canvas
```

## 3. Data Types

```typescript
interface RibbonPoint {
    x: number;
    y: number;
    nx: number;  // Normal x
    ny: number;  // Normal y
}

interface RibbonSegment {
    frontPoints: RibbonPoint[];
    backPoints: RibbonPoint[];
    depth: number;
    curvatureSign: number;
}

interface WindFieldConfig {
    k: number;
    omega: number;
    amplitude: number;
    phaseShear: number;
    noiseAmount: number;
}
```

## 4. Processing Pipeline (Per Frame)

| Stage | Input | Output | Time Budget |
|-------|-------|--------|-------------|
| Time calc | frame# | phase | <1ms |
| Wind sample | phase, x | y values | 1ms |
| Normals | points | normal vectors | 1ms |
| Extrusion | points, normals | back points | 1ms |
| Fold detect | curvature | segments | 1ms |
| Depth sort | segments | sorted list | 1ms |
| Render | segments | canvas | 8ms |
| **Total** | | | **<16ms** |

## 5. Animation Loop

Uses `AnimationFoundation.AnimationLoop`:

```javascript
this.animator = new AnimationFoundation.AnimationLoop({
    fps: 60,
    onFrame: (frame) => {
        const t = Animation.loopTime(frame, this.params.loopFrames);
        this.update(t);
        this.render();
    }
});
```

