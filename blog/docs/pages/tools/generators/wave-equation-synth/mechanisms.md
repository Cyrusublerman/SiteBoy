# Wave Equation Synth — Mechanisms

## Algorithm Class

Additive audio synthesis with canvas waveform visualisation.

## Audio Model

For each sample `i`:

```
framesPerCycle = sampleRate / baseFrequency
w = floor(i / framesPerCycle)
p = (i - w * framesPerCycle) / framesPerCycle
u = w / totalCycles
t = w / baseFrequency
g = i / totalSamples
```

Active equations evaluate `(p,w,u,t,g,Math)` and are averaged:

```
y = sum(fn_k(...)) / activeCount
sample = clamp(y, -1, 1)
```

## Renderers

- Oscilloscope: maps buffer amplitude to vertical canvas position across width.
- Segmented: currently calls the oscilloscope renderer.
- Circular: maps samples to polar points and closes the path.

## Lifecycle

- Buffer regenerated only when synthesis params change.
- Audio context and gain node are created lazily on Play.
- Source nodes are replaced when playback or synthesis changes.
- Volume updates live without buffer regeneration.

## Export

- PNG through host export path.
- WAV encoder writes 16-bit PCM RIFF/WAVE but has no UI trigger.
- GIF/WebM suppressed because there is no finite loop contract.
