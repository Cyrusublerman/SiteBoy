# Wave Equation Synth — UI Layout

## Parameters

| Group | Key | Type | Default | Range / Options |
|---|---|---|---|---|
| Core | `baseFrequency` | slider | 220 | 1 → 2000 Hz |
| Core | `sampleRate` | radio | `44100` | `22050`, `44100` |
| Core | `duration` | slider | 2 | 0.1 → 30 s, step 0.1 |
| Equations | `eq1` | dropdown | Sine | Off, Sine, Triangle, Square, Sawtooth, harmonics, FM/Pulse/AM |
| Equations | `eq2` | dropdown | Off | same as `eq1` |
| Equations | `eq3` | dropdown | Off | same as `eq1` |
| Equations | `eq4` | dropdown | Off | same as `eq1` |
| Visualisation | `mode` | radio | Oscilloscope | Oscilloscope, Segmented, Circular |
| Visualisation | `cyclesShown` | slider | 4 | 1 → 32 |
| Visualisation | `strokeWidth` | slider | 2 | 1 → 8 |
| Visualisation | `lineColor` | color | `#00ff00` | colour control |
| Visualisation | `bgColor` | color | `#000000` | colour control |
| Visualisation | `modulationDepth` | slider | 0.3 | 0 → 1 |
| Audio | `playback` | toggle | `[]` | `Play` |
| Audio | `volume` | slider | 0.8 | 0 → 1 |

**Total: 15 parameters** across 4 groups.

## Canvas

- 420×420, 2d context.

## Animation

- `type: 'infinite'`
- `sequencer: false`
- `animationExport: false`

## Export

- PNG enabled.
- GIF/WebM disabled.
- WAV encoder exists in source but has no host UI action.
