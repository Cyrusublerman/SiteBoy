# Wave Equation Synth — Description

Wave Equation Synth compiles predefined waveform equations into an audio buffer, plays the buffer through Web Audio, and visualises the waveform on a 420×420 canvas.

## Core Concept

Each equation receives five index variables plus `Math`:
- `p` — phase within one cycle, `[0,1)`.
- `w` — integer wave index.
- `u` — normalised wave index.
- `t` — time in seconds.
- `g` — global buffer progress.

The live UI exposes four dropdown equation slots (`eq1`–`eq4`) rather than free-text entry.

## Audio Pipeline

1. Compile selected predefined expressions with restricted `new Function` scope.
2. Generate a `Float32Array` buffer from `sampleRate × duration`.
3. Sum active equations per sample, normalise by active count, and clamp to `[-1,1]`.
4. Wrap the buffer in a mono Web Audio `AudioBuffer`.
5. Start/stop looping playback through a `GainNode` when `playback` changes.

## Visualisation Modes

- **Oscilloscope:** Plot the waveform as a polyline for `cyclesShown` complete cycles.
- **Segmented:** Currently equivalent to Oscilloscope; segment-start controls are not exposed.
- **Circular:** Map samples to polar coordinates: `r = R0 × (1 + modulationDepth × y_i)`.

## Export

- PNG visual export is enabled.
- GIF/WebM export is disabled because animation is infinite with no loop point.
- WAV encoding exists programmatically but is not host-exposed.

Known constraints: no free-text equations, no WAV UI action, CSPs that block `new Function` will block equation compilation.
