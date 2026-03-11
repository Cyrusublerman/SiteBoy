# Wave Equation Synth — Feature Parity

Legacy source: `wave-equation-synth-spec.md` (mixed bundle), `wave-equation-synth-audit.md` (audit only).

**The live script is a stub. All spec features are absent.**

## Core Algorithm

| Feature | Spec | Live | Status |
|---|---|---|---|
| Sandboxed equation compiler | ✓ | ✗ | FAIL |
| Wave index variables (p, w, u, t, g) | ✓ | ✗ | FAIL |
| Multi-equation summation | ✓ | ✗ | FAIL |
| AudioBuffer generation via Web Audio API | ✓ | ✗ | FAIL |
| Audio playback (play/stop) | ✓ | ✗ | FAIL |
| Oscilloscope visualisation | ✓ | ✗ | FAIL |
| Circular loop visualisation | ✓ | ✗ | FAIL |
| WAV file export | ✓ | ✗ | FAIL |
| GIF export | ✓ | ✗ | FAIL |

## Parameters

All specified parameters (base frequency, sample rate, duration, equations, mode, cycle counts, colours, volume) are absent from the live script. The live stub has 1 unused parameter (`harmonics`, not in spec).

## Summary

0 of 9 specified features implemented. 0 of 15 spec parameters present in live.
