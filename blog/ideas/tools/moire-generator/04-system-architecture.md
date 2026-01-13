# Moiré Generator — System Architecture

## 1. Data Flow

```
Parameters ──▶ Grating Generators ──▶ Grating Values
                                           │
                                           ▼
                                    Combiner ──▶ Combined Field
                                           │
                                           ▼
                                    Mask Apply ──▶ Masked Field
                                           │
                                           ▼
                                    Threshold ──▶ Binary Image
                                           │
                                           ▼
                                      Canvas
```

## 2. Data Types

```typescript
interface GratingConfig {
    type: 'radial' | 'angular';
    wavelength: number;
    frequency: number;
    phase: number;
    cx: number;
    cy: number;
    weight: number;
}

interface MaskConfig {
    type: 'none' | 'circle' | 'triangle' | 'polygon';
    size: number;
    softness: number;
    rotation: number;
}

interface ToolParams {
    gratings: GratingConfig[];
    combination: 'sum' | 'product' | 'min' | 'max';
    mask: MaskConfig;
    threshold: number;
    animate: boolean;
    phaseSpeed: number;
}
```

## 3. Processing Pipeline

| Stage | Input | Output | GPU-Friendly |
|-------|-------|--------|--------------|
| Grating eval | pixel coords | grating values | ✅ |
| Combine | grating values | combined value | ✅ |
| Mask | combined, coords | masked value | ✅ |
| Threshold | masked value | binary | ✅ |

## 4. Performance

- Fragment shader implementation for real-time
- Resolution scaling for interaction
- High-res offscreen for export

