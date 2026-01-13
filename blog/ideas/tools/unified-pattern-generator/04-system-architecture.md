# Unified Pattern Generator — System Architecture

## 1. Data Flow

```
Parameters ──▶ Grid Generator ──▶ Shape Instances
                                       │
                                       ▼
                               Domain Warp ──▶ Warped Shapes
                                       │
                                       ▼
                               Nesting Loop ──▶ Nested Shapes
                                       │
                                       ▼
                               Smooth Union ──▶ Combined SDF
                                       │
                                       ▼
                               Style Mapper ──▶ Canvas
```

## 2. Data Types

```typescript
interface ShapeInstance {
    cx: number;
    cy: number;
    a: number;
    b: number;
    p: number;
    depth: number;
    colorLabel: number;
}

interface ToolParams {
    gridSpacing: number;
    jitter: number;
    roundingP: number;
    aspectRange: number;
    nestingDepth: number;
    nestingRatio: number;
    warpAmplitude: number;
    warpFrequency: number;
    blendRadius: number;
}
```

## 3. Stage Processing

| Stage | Input | Output | Cache |
|-------|-------|--------|-------|
| Grid | params | centers[] | Yes |
| Shapes | centers | ShapeInstance[] | Yes |
| Warp | positions | warped positions | No |
| Nesting | shapes | nested shapes | Yes |
| SDF eval | pixel, shapes | distance | No |
| Render | distance | color | No |

## 4. Performance

| Operation | Target |
|-----------|--------|
| Grid generation | 1ms |
| SDF evaluation | 10ms (per frame) |
| Full render | 16ms |

