# Wave Equation Synth — Description

**Status: Unimplemented stub.** The live script produces only a black canvas. This description documents the intended design per the legacy specification.

## Intended Design (per spec)

Wave Equation Synth is an audio synthesis and visualisation tool. Users write mathematical equations that describe audio waveforms; the tool evaluates them to produce audio buffers, plays them via Web Audio API, and visualises them on canvas in one of three modes.

## Core Concept

An equation is a mathematical expression in terms of variables `p`, `w`, `u`, `t`, `g`:
- `p` — phase within a single wave cycle: [0, 1].
- `w` — integer wave index (0-based).
- `u` — normalised wave index: [0, 1] over the full duration.
- `t` — time in seconds: `w / baseFrequency`.
- `g` — global progress: [0, 1] over the full buffer.

Example: `sin(2*pi*p)` produces a pure sine wave. `sin(2*pi*p) + 0.5*sin(4*pi*p)` adds a second harmonic. Up to 16 equations can be summed (one per stepper position).

## Audio Pipeline

1. **Equation compilation (AUDIO-004):** Each equation string is safely compiled to a JavaScript function via a sandboxed `new Function(...)` construct. Safety constraints prevent DOM access.
2. **Wave indexing (AUDIO-005):** For each sample `i` in the buffer (`sampleRate × duration` total samples), compute `p`, `w`, `u`, `t`, `g`.
3. **Evaluation (AUDIO-006):** Evaluate all equations at each index; sum results.
4. **AudioBuffer (AUDIO-007):** Write samples to a Web Audio API `AudioBuffer`; attach to an `AudioBufferSourceNode` for playback.

## Visualisation Modes

- **Oscilloscope:** Plot the waveform as a polyline (amplitude vs phase) for `cyclesShown` complete cycles.
- **Segmented:** Plot a segment of the buffer starting at `segmentStartWave`, showing `segmentWaveCount` waves.
- **Circular Loop:** Map a waveform segment to polar coordinates: `r = R₀ × (1 + modulationDepth × y_i)`, producing a circular/Lissajous-type loop.

## Export

- WAV audio file (AUDIO-008): binary-encoded PCM.
- PNG and GIF visual exports.
- Segment WAV: export a sub-range of the buffer.

Algorithm origin: additive sound synthesis (Fourier/Helmholtz); Web Audio API; oscilloscope visualisation; WAV PCM encoding (RIFF format).
