# Wave Equation Synth — Algorithm Library

## Module Routing Table

| Technique | Module | Function | Status |
|-----------|--------|----------|--------|
| Wave equation | `WaveSolver` | `stepWave1D(u, c, dx, dt)` | ✅ Exists |
| DSP evaluation | `DSPEvaluator` | `evaluateEquation(equation, vars)` | ✅ Exists |
| Waveform path | `CoordinateTransforms` | `waveformToPath(samples, width, height)` | ✅ Exists |
| Circular mapping | `CoordinateTransforms` | `waveformToCircular(samples, cx, cy, r, modDepth)` | ✅ Exists |
| WAV encoding | `WavEncoder` | `encodeWavMono(samples, sampleRate, bitDepth)` | ✅ Exists |

## Function Signatures

```typescript
function stepWave1D(
    u: Float32Array,
    c: number,
    dx: number,
    dt: number
): void

function evaluateEquation(
    equation: string,
    vars: {p: number, w: number, u: number, t: number, g: number}
): number

function waveformToPath(
    samples: Float32Array,
    width: number,
    height: number
): Array<{x: number, y: number}>

function waveformToCircular(
    samples: Float32Array,
    cx: number, cy: number,
    radius: number,
    modulationDepth: number
): Array<{x: number, y: number}>

function encodeWavMono(
    samples: Float32Array,
    sampleRate: number,
    bitDepth: number
): ArrayBuffer
```

## Import Statement

```javascript
import { WaveSolver, WavEncoder, DSPEvaluator, CoordinateTransforms } from '../shared/algorithms/index.js';
```

## Coverage Summary

| Category | Total | Implemented | Coverage |
|----------|-------|-------------|----------|
| Wave | 1 | 1 | 100% |
| DSP | 1 | 1 | 100% |
| Visualization | 2 | 2 | 100% |
| Audio Export | 1 | 1 | 100% |
| **Total** | **5** | **5** | **100%** |

