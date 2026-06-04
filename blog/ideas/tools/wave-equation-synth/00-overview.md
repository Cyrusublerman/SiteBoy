# Wave Equation Synth — Overview
**Status:** SPEC | **Cluster:** audio-waves


## Quick Reference

| Attribute | Value |
|-----------|-------|
| **Purpose** | Generate audio from mathematical equations with oscilloscope visualization |
| **Output Type** | Audio + Animation |
| **Core Pipeline** | Equation → Buffer → Visualization → Export |

## Dependencies

### Existing Shared Modules
- `WaveSolver.stepWave1D` — wave equation solver
- `WavEncoder.encodeWavMono` — WAV file export
- `DSPEvaluator.evaluateEquation` — equation parsing
- `CoordinateTransforms.waveformToPath` — oscilloscope rendering
- `CoordinateTransforms.waveformToCircular` — polar mapping



---

## Feeder files

The following earlier drafts were superseded by this 6-pack:

- [Wave Equation Synth (legacy)](../wave-synth-legacy.md) — ARCHIVED


---

## Related ideas

- [Sonification of Climate Change](../../art/generative/sonification-climate-change.md)
