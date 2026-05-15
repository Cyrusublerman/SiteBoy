# Wave Equation Synth — Performance

## Buffer Generation

Cost is init-phase, not per frame:

`O(sampleRate × duration × activeEquationCount)`

Live limits reduce worst cases:
- `sampleRate`: `22050` or `44100`
- `duration`: 0.1 → 30 s
- active equations: max 4

At maximum live settings: `44100 × 30 × 4 = 5.292M` equation evaluations. This is acceptable as a one-off buffer rebuild.

## Frame Cost

- Oscilloscope: `O(canvasWidth)` lookups per frame.
- Circular: `O(cyclesShown × framesPerCycle)` points.
- Visual param changes do not regenerate the audio buffer.

## Cache Boundary

`_bufferCacheKey` includes only synthesis params:

`baseFrequency | sampleRate | duration | eq1 | eq2 | eq3 | eq4`

This prevents visual/audio-control changes from re-running synthesis.

## Residual Risks

- `new Function` is blocked by strict CSP.
- AudioContext startup depends on browser user-gesture policy.
- No worker sandboxing for equation compilation in this version.
