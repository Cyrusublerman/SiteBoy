# Interference Figure Generator — System Architecture

## 1. Data Flow

```
Parameters ──▶ Basis Fields ──▶ OPD Field D(x,y)
                                      │
                                      ▼
                              Noise Perturbation
                                      │
                                      ▼
                              Phase Retardation Δ(x,y,λ)
                                      │
                                      ▼
                              Spectral Intensity I(λ)
                                      │
                                      ▼
                              XYZ → RGB Conversion
                                      │
                                      ▼
                              Tone Mapping
                                      │
                                      ▼
                                   Canvas
```

## 2. Data Types

```typescript
interface BasisWeights {
    radial: number;
    spiral: number;
    spiralRate: number;
    wedgeX: number;
    wedgeY: number;
    angularN2: number;
    angularN4: number;
    angularN6: number;
    angularN8: number;
    saddle: number;
    square: number;
}

interface SpectralParams {
    lambdaMin: number;    // ~380nm
    lambdaMax: number;    // ~700nm
    samples: number;      // K wavelengths
}

interface ToneParams {
    exposure: number;
    gamma: number;
    saturation: number;
}
```

## 3. Processing Pipeline

| Stage | Input | Output | Parallelizable |
|-------|-------|--------|----------------|
| Coord gen | canvas | (x,y) grid | ✅ |
| Basis eval | (x,y), weights | basis values | ✅ |
| OPD combine | basis values | D(x,y) | ✅ |
| Noise add | D, noise params | D' | ✅ |
| Spectral | D', λ | I(λ) | ✅ |
| XYZ→RGB | I(λ) | RGB | ✅ |
| Tone map | RGB | final RGB | ✅ |

## 4. Performance

- Full GPU implementation possible
- CPU fallback with ImageData
- Cache wavelength matrices

