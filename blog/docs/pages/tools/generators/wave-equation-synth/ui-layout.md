# Wave Equation Synth — UI Layout

**Status: Unimplemented stub.**

## Live Parameters (Current)

| Group | Key | Type | Default | Range |
|---|---|---|---|---|
| Synthesis | `harmonics` | slider | 8 | 1 → 16, step 1 |

**Total: 1 parameter.** `harmonics` is not read by the draw function.

## Intended Parameters (per spec)

### CONTROLS tab

| Block | Key | Type | Range / Options |
|---|---|---|---|
| Core | `baseFrequency` | slider | 1 → 2000 Hz |
| Core | `sampleRate` | slider | 8000 → 192000 Hz |
| Core | `duration` | slider | 0.1 → 300 s |
| Equations | `equationCount` | stepper | 1 → 16 |
| Equations | `equation1` | textarea | `sin(2*pi*p)` |
| Equations | `equation2..N` | textarea (dynamic) | — |
| Behavior | `mode` | dropdown | Oscilloscope / Segmented / Circular Loop |
| Behavior | `cyclesShown` | stepper | 1 → 64 |
| Behavior | `segmentStartWave` | stepper | 0 → 100000 |
| Behavior | `segmentWaveCount` | stepper | 1 → 256 |

### AUDIO tab

| Block | Key | Type |
|---|---|---|
| Playback | (play/stop) | button |
| Playback | `volume` | slider (0 → 1) |

### CANVAS tab

| Block | Key | Type | Range / Options |
|---|---|---|---|
| Style | `lineColor` | color | hex |
| Style | `backgroundColor` | color | hex |
| Style | `strokeWidth` | slider | 1 → 8 |
| Style | `modulationDepth` | slider | 0 → 1 |

**Total standard parameters: ~15.** Dynamic `equation2..N` inputs are UI-rendered based on `equationCount`.

## Canvas (per spec)

- 420×420 (spec), 800×800 (live stub). Conflict.

## Animation

- `type: 'infinite'` (oscilloscope is live visualization of audio playback).

## Export (per spec)

- WAV audio, segment WAV, PNG, GIF.
