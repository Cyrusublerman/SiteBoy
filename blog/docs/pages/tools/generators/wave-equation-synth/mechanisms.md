# Wave Equation Synth — Mechanisms

**Status: Unimplemented stub.** The live `draw` function fills the canvas black. This file documents intended mechanisms from the legacy spec and audit.

## Live Script State

| Item | Value |
|---|---|
| `draw` function | Fills canvas black, returns |
| Parameters | 1 slider: `harmonics` (1–16) — unused |
| Animation | Not declared |
| State | None |

## Intended Algorithm

### Equation Compilation (AUDIO-004)

Sandboxed safe compilation:
```javascript
function compileEquation(exprStr) {
    const fn = new Function('p', 'w', 'u', 't', 'g', 'Math', `return ${exprStr};`);
    return fn;
}
```

Safety: restrict access to global scope by only injecting the `Math` object and index variables. No `document`, `window`, or `eval` access.

### Wave Indexing (AUDIO-005)

For sample `i` of `N_total = floor(sampleRate × duration)` total samples:

```
framesPerCycle = sampleRate / baseFrequency
w = floor(i / framesPerCycle)          // integer wave index
p = (i % framesPerCycle) / framesPerCycle   // phase in [0, 1]
u = w / totalCycles                     // normalised wave index
t = w / baseFrequency                   // time in seconds
g = i / N_total                         // global progress
```

### Buffer Generation (AUDIO-006)

```javascript
for (let i = 0; i < N_total; i++) {
    const { p, w, u, t, g } = indexVars(i);
    let y = 0;
    for (const fn of equations) {
        y += fn(p, w, u, t, g, Math);
    }
    buffer[i] = clamp(y, -1, 1);
}
```

### AudioBuffer Playback (AUDIO-007)

```javascript
const audioBuffer = audioContext.createBuffer(1, N_total, sampleRate);
audioBuffer.copyToChannel(buffer, 0);
const source = audioContext.createBufferSource();
source.buffer = audioBuffer;
source.connect(audioContext.destination);
source.start();
```

### Oscilloscope Renderer (CANVAS-014)

```
For each pixel px in [0, W]:
    p = px / W × cyclesShown
    sample_index = floor(p × framesPerCycle)
    y_pixel = H/2 - buffer[sample_index] × H/2 × amplitude
    draw polyline point (px, y_pixel)
```

### Circular Loop Renderer (CANVAS-015)

Polar mapping for a segment starting at `segmentStartWave`:
```
θ_i = 2π × i / segmentLength
r_i = R₀ × (1 + modulationDepth × y_i)
x = cx + r_i × cos(θ_i)
y = cy + r_i × sin(θ_i)
```

### WAV Export (AUDIO-008)

PCM WAV encoding: RIFF header + 16-bit signed integer samples.

## Function Inventory (intended)

| Function | Module | Status |
|---|---|---|
| `safeEquationCompiler` | AUDIO-004 | Not implemented |
| `waveIndexing` | AUDIO-005 | Not implemented |
| `equationEvaluator` | AUDIO-006 | Not implemented |
| `audioBufferSource` | AUDIO-007 | Not implemented |
| `wavExporter` | AUDIO-008 | Not implemented |
| `oscilloscopeRenderer` | CANVAS-014 | Not implemented |
| `circularLoopRenderer` | CANVAS-015 | Not implemented |
| `gifExporter` | CANVAS-016 | Not implemented |
| `clamp` | MATH-002 | Inline (not extracted) |
| `wrap` | MATH-004 | Inline (not extracted) |
