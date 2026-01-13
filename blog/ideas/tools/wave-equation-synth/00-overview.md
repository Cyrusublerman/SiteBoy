# Wave Equation Synth — Overview

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

