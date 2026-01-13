# Generative Pattern Algorithm — System Architecture

## 1. High-Level Data Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Parameters │────▶│ Point Layer │────▶│ Connectivity│
└─────────────┘     └─────────────┘     └─────────────┘
                           │                    │
                           ▼                    ▼
                    ┌─────────────┐     ┌─────────────┐
                    │  Evolution  │◀───▶│   Edges     │
                    │  (RD/CA)    │     │   Graph     │
                    └─────────────┘     └─────────────┘
                           │                    │
                           ▼                    ▼
                    ┌─────────────────────────────────┐
                    │        Distance Field           │
                    │         (JFA/SDF)               │
                    └─────────────────────────────────┘
                                   │
            ┌──────────────────────┼──────────────────────┐
            ▼                      ▼                      ▼
     ┌──────────┐          ┌──────────┐          ┌──────────┐
     │ Truchet  │          │   Blob   │          │ Contours │
     │ Renderer │          │ Renderer │          │ Renderer │
     └──────────┘          └──────────┘          └──────────┘
            │                      │                      │
            └──────────────────────┼──────────────────────┘
                                   ▼
                            ┌──────────┐
                            │  Canvas  │
                            └──────────┘
```

## 2. Data Type Definitions

```typescript
interface Point {
    x: number;
    y: number;
    state?: number;      // RD/CA state value
    weight?: number;     // Inflation weight
}

interface Edge {
    i: number;           // Source point index
    j: number;           // Target point index
    weight?: number;     // Edge weight
}

interface DistanceField {
    data: Float32Array;
    width: number;
    height: number;
}

interface RenderState {
    points: Point[];
    edges: Edge[];
    kdTree: KDTree;
    distanceField: DistanceField;
    contours: Array<Array<{x: number, y: number}>>;
}

interface ToolParams {
    // Distribution
    density: number;
    gridStrength: number;
    clusterScale: number;
    jitter: number;
    
    // Connectivity
    neighborRadius: number;
    maxDegree: number;
    arcQuantisation: number;
    axisBias: number;
    
    // Evolution
    evolutionMode: 'none' | 'rd' | 'ca';
    Du: number;
    Dv: number;
    feedRate: number;
    killRate: number;
    
    // Rendering
    renderMode: 'truchet' | 'blob' | 'nested' | 'global';
    weightScale: number;
    tileWindow: number;
    contourCount: number;
    
    // Animation
    animate: boolean;
    flowSpeed: number;
    noiseFrequency: number;
}
```

## 3. Module Dependency Graph

```
┌─────────────────────────────────────────────────────────────┐
│                    GenerativePatternTool                     │
│                    (extends ToolBase)                        │
└─────────────────────────────────────────────────────────────┘
         │
         ├── PointDistributor
         │      ├── Sampling.poissonDisk
         │      ├── Sampling.lloydRelaxation
         │      └── Noise.simplex2D (for density field)
         │
         ├── ConnectivityBuilder
         │      ├── SpatialIndex.buildKDTree
         │      └── SpatialIndex.kdRadiusSearch
         │
         ├── StateEvolver (optional)
         │      ├── ReactionDiffusion.stepGrayScott
         │      └── ReactionDiffusion.stepCellularAutomaton
         │
         ├── DistanceFieldBuilder
         │      ├── JFA.jumpFloodAlgorithm
         │      └── SDF.sdfSmoothUnion
         │
         └── Renderers
                ├── TruchetRenderer → Patterns.generateTruchetGrid
                ├── BlobRenderer → SDF operations
                └── ContourRenderer → MarchingSquares.extractContours
```

## 4. Stage-by-Stage Processing

### Stage 1: Point Distribution
```
Input: density, gridStrength, clusterScale, jitter
Output: points[]
Trigger: On parameter change (density, gridStrength, etc.)
Cache: Yes — points array
```

### Stage 2: Connectivity
```
Input: points[], neighborRadius, maxDegree
Output: edges[], kdTree
Trigger: On points change OR connectivity params change
Cache: Yes — kdTree, edges array
```

### Stage 3: Evolution (Optional)
```
Input: points[], edges[], evolution params
Output: Updated point states
Trigger: Per animation frame OR on evolution param change
Cache: No — computed per step
```

### Stage 4: Distance Field
```
Input: points[], edges[], weightScale
Output: distanceField
Trigger: On geometry change OR weightScale change
Cache: Yes — distanceField texture
```

### Stage 5: Rendering
```
Input: distanceField, renderMode, contourCount
Output: Canvas pixels
Trigger: Every frame
Cache: Partial — contour paths cached
```

## 5. Caching Strategy

| Data | Cache Key | Invalidation |
|------|-----------|--------------|
| Points array | `${density}_${gridStrength}_${seed}` | Distribution params |
| K-d tree | Points hash | Points change |
| Edge graph | `${points}_${radius}_${maxDeg}` | Connectivity params |
| Distance field | `${edges}_${weightScale}` | Geometry/weight change |
| Contour paths | `${distanceField}_${contourCount}` | Field or count change |
| Truchet templates | `tileSize` | Never (static) |

## 6. Event Flow

```
User Input ──▶ Parameter Change ──▶ Invalidate Cache ──▶ Recompute
                     │
                     ▼
              ┌──────────────┐
              │ Determine    │
              │ Dirty Stages │
              └──────────────┘
                     │
         ┌──────────┬┴──────────┬───────────┐
         ▼          ▼           ▼           ▼
      Points    Connectivity  Evolution   Render
      (if dirty) (if dirty)  (if dirty)  (always)
```

## 7. Error Handling

| Error | Handling |
|-------|----------|
| Empty point set | Show placeholder, disable connectivity |
| No edges found | Warn user, show isolated points |
| RD divergence | Clamp values, reset if NaN |
| Memory exceeded | Reduce resolution, warn user |

## 8. Performance Budgets

| Operation | Target | Max |
|-----------|--------|-----|
| Point generation | 10ms | 50ms |
| K-d tree build | 5ms | 20ms |
| Neighbor queries | 2ms | 10ms |
| RD step | 5ms | 20ms |
| JFA distance | 10ms | 50ms |
| Render frame | 8ms | 16ms |

## 9. State Management

```typescript
class GenerativePatternTool extends ToolBase {
    // Persistent state
    private points: Point[] = [];
    private edges: Edge[] = [];
    private kdTree: KDTree | null = null;
    private distanceField: DistanceField | null = null;
    
    // Dirty flags
    private dirtyPoints = true;
    private dirtyConnectivity = true;
    private dirtyField = true;
    
    // Animation state
    private animationTime = 0;
    private animator: AnimationLoop | null = null;
    
    onParameterChange(param: string, value: any) {
        if (['density', 'gridStrength', 'jitter'].includes(param)) {
            this.dirtyPoints = true;
        }
        if (['neighborRadius', 'maxDegree'].includes(param)) {
            this.dirtyConnectivity = true;
        }
        if (['weightScale'].includes(param)) {
            this.dirtyField = true;
        }
        this.requestUpdate();
    }
    
    update() {
        if (this.dirtyPoints) this.rebuildPoints();
        if (this.dirtyConnectivity) this.rebuildConnectivity();
        if (this.dirtyField) this.rebuildDistanceField();
        this.render();
    }
}
```

