# Wave Equation Synth — Source Reference

## Current Owners

- live script: `assets/js/tools/generators/scripts/other/wave-equation-synth.gen.js`
- registry: `assets/js/tools/generators/core/script-registry.js`
- host: `assets/js/tools/generators/core/generative-tool-host.js`

## Archive

- `reference/generators/wave-equation-synth/source/wave-equation-synth.gen.js` — identical to live (both stubs)

## Legacy Docs Archived

- `reference/generators/wave-equation-synth/legacy-docs/wave-equation-synth-spec.md` — classification: `mixed bundle` (overview, module dependencies, sidebar structure with 4 tabs, implementation skeleton)
- `reference/generators/wave-equation-synth/legacy-docs/wave-equation-synth-audit.md` — classification: `audit only` (8-step process table, 10-module dependency status, gap list, research sources)

## Implementation Status

**Not implemented.** The comment `// TODO: Extract from wave-equation-synth.js` references a missing source file.

## Domain Note

This generator requires Web Audio API (`AudioContext`, `AudioBuffer`) in addition to canvas rendering. It is an audio-visual tool, unlike all other generators in the system which are visual only.
