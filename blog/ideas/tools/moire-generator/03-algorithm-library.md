# Moiré Generator — Algorithm Library

## Module Routing Table

| Technique | Module | Function | Status |
|-----------|--------|----------|--------|
| Radial grating | `Patterns` | `radialGrating(x, y, wavelength, phase, cx, cy)` | ✅ Exists |
| Angular grating | `Patterns` | `angularGrating(x, y, frequency, phase, cx, cy)` | ✅ Exists |
| Moiré combination | `Patterns` | `combineMoire(gratings, mode)` | ✅ Exists |
| Smoothstep | `Noise` | `smoothstep(edge0, edge1, x)` | ✅ Exists |

## Function Signatures

```typescript
function radialGrating(
    x: number, y: number,
    wavelength: number, phase: number,
    cx?: number, cy?: number
): number

function angularGrating(
    x: number, y: number,
    frequency: number, phase: number,
    cx?: number, cy?: number
): number

function combineMoire(
    gratings: number[],
    mode: 'sum' | 'product' | 'min' | 'max'
): number
```

## Import Statement

```javascript
import { Patterns, Noise } from '../shared/algorithms/index.js';
```

## Coverage Summary

| Category | Total | Implemented | Coverage |
|----------|-------|-------------|----------|
| Gratings | 2 | 2 | 100% |
| Combination | 1 | 1 | 100% |
| Smoothing | 1 | 1 | 100% |
| **Total** | **4** | **4** | **100%** |

