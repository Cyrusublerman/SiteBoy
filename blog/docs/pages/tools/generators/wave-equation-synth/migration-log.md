# Wave Equation Synth — Migration Log

## Pack Generated

Date: 2026-03-10
Source analysed: `assets/js/tools/generators/scripts/other/wave-equation-synth.gen.js` v(none — stub)
Legacy docs: `wave-equation-synth-spec.md` (mixed bundle), `wave-equation-synth-audit.md` (audit only)

## Summary of Migration State

**Generator is not implemented.** Both live and archive sources are identical stubs. All 8 required subsystems are missing. Additionally, this generator requires architectural extensions to the generator host (audio lifecycle hooks) that are not present in the current host.

## Architecture Gap Summary

| Step | Subsystem | Module | Status |
|---|---|---|---|
| 1 | Safe equation compiler | AUDIO-004 | Missing |
| 2 | Wave indexing | AUDIO-005 | Missing |
| 3 | Equation evaluator | AUDIO-006 | Missing |
| 4 | AudioBuffer playback | AUDIO-007 | Missing |
| 5 | Oscilloscope renderer | CANVAS-014 | Missing |
| 6 | Circular loop renderer | CANVAS-015 | Missing |
| 7 | WAV exporter | AUDIO-008 | Missing |
| 8 | GIF exporter | CANVAS-016 | Missing |

## Host Extension Required

The generator host must be extended to support:
- Audio context lifecycle (`init`, `onDestroy`, `onPlay`, `onStop`).
- Free-text equation input fields (`type: 'textarea'`).
- Action buttons for audio export (WAV).

This is a prerequisite before implementing the generator itself.

## Implementation Roadmap

1. Define audio lifecycle interface in `generative-tool-host.js` — HIGH priority prerequisite.
2. Implement sandboxed equation compiler in a Worker context (AUDIO-004) — HIGH priority; security review required.
3. Implement wave indexing variables (AUDIO-005).
4. Implement equation evaluator with summation (AUDIO-006).
5. Implement Web Audio API buffer generation and playback (AUDIO-007).
6. Implement oscilloscope renderer (CANVAS-014).
7. Implement circular loop renderer (CANVAS-015).
8. Implement WAV file exporter (AUDIO-008).
9. Implement GIF exporter (CANVAS-016) — shared with other generators.
10. Build full SCRIPT_CONFIG with all parameters, animation block, export block.
11. Resolve canvas size: adopt 420×420 per spec.
