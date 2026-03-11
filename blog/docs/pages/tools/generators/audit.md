# Generator Docs Audit

- registry generators: `25`
- complete packs (all 8 files, score ≥ 2): `25`
- completion: `100%`
- pass completed: 2026-03-10

## Pack Contents

Each pack: `source-reference.md`, `description.md`, `mechanisms.md`, `ui-layout.md`, `performance.md`, `feature-parity.md`, `issues-and-conflicts.md`, `migration-log.md`.

## Implementation Status by Generator

| generator | status | legacy inputs |
|---|---|---|
| circles | Implemented | mixed bundle (spec + audit) |
| clockwise | Implemented | source only |
| curtain-morph | Implemented | source only |
| defecated | Not implemented (stub) | functional source (`defecated-tool.js`) |
| interference-figure | Not implemented (stub) | mixed bundle (spec + audit) |
| quine | Implemented | source only |
| solar-system | Implemented | mixed bundle (spec + audit + README) |
| squares | Implemented | mixed bundle (spec + audit) |
| unified-pattern | Not implemented (stub) | mixed bundle (spec + audit) |
| wave-equation-synth | Not implemented (stub) | mixed bundle (spec + audit) |
| harmonics | Implemented | mixed bundle (shared spec + audit) |
| lissajous | Implemented | mixed bundle (spec + audit) |
| torus | Implemented | mixed bundle (spec + audit) |
| animated-lines | Implemented | source only |
| generative-pattern | Not implemented (stub) | mixed bundle (spec + audit) |
| golden-grid | Implemented | source only |
| order-disorder | Implemented | source only |
| shape-array | Implemented | source only |
| tile-mosaic | Not implemented (stub) | mixed bundle (spec + audit) |
| fibonacci-balls | Implemented | source only |
| cymatics | Implemented | mixed bundle (spec + audit) |
| moire | Implemented | mixed bundle (spec + audit) |
| p5-wave-colour | Implemented | source only |
| p5-wave-interference | Implemented | source only |
| wave-interference | Implemented | mixed bundle (spec + audit) |

## Summary

- Implemented generators: 19
- Unimplemented stubs: 6 (`defecated`, `interference-figure`, `unified-pattern`, `wave-equation-synth`, `generative-pattern`, `tile-mosaic`)
- Generators with legacy spec+audit: 14
- Generators with source only: 11

## Recurring Issues Across All Generators

1. **Non-standard preset format**: all generators use flat preset objects; standard requires `{ name, values: {...} }`.
2. **State on `SCRIPT_CONFIG`**: P5 generators commonly store mutable state as `SCRIPT_CONFIG` properties.
3. **`loopFrames` conflict**: `golden-grid`, `order-disorder`, `curtain-morph`, `p5-wave-colour`, `p5-wave-interference` all have static `animation.loopFrames` mismatched to a user-adjustable cycle param.
4. **No `animatableParams`**: no generator declares `animation.animatableParams`.
5. **No export options**: most generators lack an `export` block.
6. **Raw colours**: generators use raw hex, HSL, or RGB objects rather than CSS variables.
