# Wave Equation Synth — Feature Parity


## Core Algorithm

| Feature | Spec | Live | Status |
|---|---|---|---|
| Sandboxed equation compiler | ✓ | ✓ | PASS — `new Function` with restricted scope; CSP risk documented |
| Wave index variables (p, w, u, t, g) | ✓ | ✓ | PASS |
| Multi-equation summation | ✓ | ✓ | PASS — 4 equations, normalised by active count |
| AudioBuffer generation via Web Audio API | ✓ | ✓ | PASS |
| Audio playback (play/stop) | ✓ | ✓ | PASS — toggle parameter + GainNode volume |
| Oscilloscope visualisation | ✓ | ✓ | PASS |
| Circular loop visualisation | ✓ | ✓ | PASS — polar coordinate mapping |
| WAV file export | ✓ | ✓ | PASS — implemented; not UI-accessible (no action button type) |
| GIF export | ✓ | ✗ | FAIL — infinite animation, no loopFrames; suppressed by design |

## Parameters

All specified parameters implemented: `baseFrequency`, `sampleRate`, `duration`, `eq1`–`eq4`, `mode`, `cyclesShown`, `strokeWidth`, `lineColor`, `bgColor`, `modulationDepth`, `playback`, `volume`. Stub `harmonics` parameter removed.

## Summary

8 of 9 specified features implemented. GIF export explicitly suppressed (infinite animation type). Canvas 420×420 per spec. 5 presets. Audio lifecycle managed via closure state within `draw`.
