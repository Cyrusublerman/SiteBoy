# Interference Figure Generator — Algorithm Library

## Module Routing Table

| Technique | Module | Function | Status |
|-----------|--------|----------|--------|
| OPD calculation | `Optics` | `opticalPathLength(d, n)` | ✅ Exists |
| Thin-film intensity | `Optics` | `thinFilmReflectance(opd, wavelength)` | ✅ Exists |
| Wavelength to RGB | `Optics` | `wavelengthToRGB(wavelength)` | ✅ Exists |
| Uniaxial conoscopy | `Optics` | `uniaxialConoscopy(x, y, params)` | ✅ Exists |
| Crossed polar | `Optics` | `crossedPolarIntensity(angle)` | ✅ Exists |
| Fractal noise | `Noise` | `fbm2D(x, y, octaves, lacunarity, gain, seed)` | ✅ Exists |

## Function Signatures

```typescript
function opticalPathLength(thickness: number, refractiveIndex: number): number

function thinFilmReflectance(opd: number, wavelength: number): number

function wavelengthToRGB(wavelength: number): {r: number, g: number, b: number}

function uniaxialConoscopy(
    x: number, y: number,
    params: {birefringence: number, thickness: number}
): number

function crossedPolarIntensity(angle: number): number
```

## Import Statement

```javascript
import { Optics, Noise } from '../shared/algorithms/index.js';
```

## Coverage Summary

| Category | Total | Implemented | Coverage |
|----------|-------|-------------|----------|
| Optics | 5 | 5 | 100% |
| Noise | 1 | 1 | 100% |
| **Total** | **6** | **6** | **100%** |

## Tool-Local Modules

### angularHarmonicsRenderer

**Reason:** Domain-specific visualization pattern that doesn't generalize.

```javascript
// Tool-local implementation
function renderAngularHarmonics(ctx, cx, cy, radius, l, m) {
    // Visualization-specific code
}
```

