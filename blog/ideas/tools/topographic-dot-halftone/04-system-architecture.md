# Topographic Dot Halftone — System Architecture

## 1. Data Flow

```
Input (Vector/Field) ──▶ Build S(x,y)
                              │
                              ▼
                        Tangent Field T
                              │
                              ▼
                    Contour-Aligned Lattice
                              │
                              ▼
                     Dot Radius Mapping
                              │
                              ▼
                       Masked Rendering
                              │
                              ▼
                           Canvas
```

## 2. Data Types

```typescript
interface ScalarField {
    data: Float32Array;
    width: number;
    height: number;
}

interface TangentField {
    data: Array<{tx: number, ty: number}>;
    width: number;
    height: number;
}

interface LatticePoint {
    x: number;
    y: number;
    i: number;
    j: number;
    radius: number;
}

interface ToolParams {
    mode: 'vector' | 'field';
    contourSource: 'sdf' | 'geodesic' | 'laplace';
    weightDepth: number;
    weightNormal: number;
    weightLuma: number;
    dotDensity: number;
    minRadius: number;
    maxRadius: number;
    bandPitch: number;
    alongPitch: number;
}
```

## 3. Processing Pipeline

| Stage | Input | Output | GPU |
|-------|-------|--------|-----|
| Field build | images/SVG | S(x,y) | Partial |
| Gradient | S | ∇S | ✅ |
| Tangent | ∇S | T | ✅ |
| Lattice | S, T, params | points | CPU |
| Radius | luma, params | r | CPU |
| Render | points | canvas | ✅ |

## 4. Performance Strategy

- Full-screen fragment shader for field evaluation
- Precompute SDF/Laplace to texture
- Hash jitter in integer domain
- CPU lattice sampling for SVG export

