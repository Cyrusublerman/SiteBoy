# Wave Equation Synth — System Architecture

## 1. Data Flow

```
Equations ──▶ Compiler ──▶ Compiled Functions
                               │
Parameters ──▶ Buffer Generator ──▶ Audio Buffer
                               │
                               ▼
                         Visualization
                         ├── Oscilloscope
                         ├── Segmented
                         └── Circular
                               │
                               ▼
                            Canvas
```

## 2. Data Types

```typescript
interface CompiledEquation {
    fn: (vars: WaveVars) => number;
    source: string;
}

interface WaveVars {
    p: number;  // Phase [0,1]
    w: number;  // Wave index
    u: number;  // Normalized wave position
    t: number;  // Time in seconds
    g: number;  // Global normalized position
}

interface AudioState {
    buffer: Float32Array;
    sampleRate: number;
    duration: number;
    isPlaying: boolean;
}
```

## 3. Processing Pipeline

| Stage | Trigger | Output |
|-------|---------|--------|
| Compile | Equation change | Function |
| Generate | Any param change | Audio buffer |
| Visualize | Frame request | Canvas |
| Play | User action | Audio output |
| Export | User action | WAV file |

## 4. Web Audio Integration

```javascript
// Platform API usage (not in algorithms library)
const audioCtx = new AudioContext();
const source = audioCtx.createBufferSource();
source.buffer = audioBuffer;
source.connect(audioCtx.destination);
source.start();
```

