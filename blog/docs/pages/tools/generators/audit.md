# Generator Docs Audit

- registry generators: `25`
- complete packs (all 8 files, score ≥ 2): `25`
- completion: `100%`
- pass completed: 2026-03-10
- last updated: 2026-03-13 (implementation status updated for 8 generators; animatableParams placement fixed for 4 generators)

## Pack Contents

Each pack: `source-reference.md`, `description.md`, `mechanisms.md`, `ui-layout.md`, `performance.md`, `feature-parity.md`, `issues-and-conflicts.md`, `migration-log.md`.

## Implementation Status by Generator

| generator | status | legacy inputs |
|---|---|---|
| circles | Implemented | mixed bundle (spec + audit) |
| clockwise | Implemented | source only |
| curtain-morph | Implemented | source only |
| defecated | Implemented | functional source (`defecated-tool.js`) |
| interference-figure | Implemented | mixed bundle (spec + audit) |
| quine | Implemented | source only |
| solar-system | Implemented | mixed bundle (spec + audit + README) |
| squares | Implemented | mixed bundle (spec + audit) |
| unified-pattern | Implemented | mixed bundle (spec + audit) |
| wave-equation-synth | Implemented | mixed bundle (spec + audit) |
| harmonics | Implemented | mixed bundle (shared spec + audit) |
| lissajous | Implemented | mixed bundle (spec + audit) |
| torus | Implemented | mixed bundle (spec + audit) |
| animated-lines | Implemented | source only |
| generative-pattern | Implemented | mixed bundle (spec + audit) |
| golden-grid | Implemented | source only |
| order-disorder | Implemented | source only |
| shape-array | Implemented | source only |
| tile-mosaic | Implemented | mixed bundle (spec + audit) |
| fibonacci-balls | Implemented | source only |
| cymatics | Implemented | mixed bundle (spec + audit) |
| moire | Implemented | mixed bundle (spec + audit) |
| p5-wave-colour | Implemented | source only |
| p5-wave-interference | Implemented | source only |
| wave-interference | Implemented | mixed bundle (spec + audit) |

## Summary

- Implemented generators: 25
- Unimplemented stubs: 0
- Generators with legacy spec+audit: 14
- Generators with source only: 11

## Resolved Issues (2026-03-13 update)

Six previously unimplemented stubs are now fully implemented: `defecated`, `interference-figure`, `unified-pattern`, `wave-equation-synth`, `generative-pattern`, `tile-mosaic`.

Two previously implemented generators (`p5-wave-colour`, `p5-wave-interference`) have had their recurring issues resolved:
- Non-standard preset format: **RESOLVED** for both; all generators now use `{ name, values: {...} }`.
- `loopFrames` conflict: **RESOLVED** for both — `p5-wave-colour` synchronises via `p5Setup`; `p5-wave-interference` removed the conflicting `cycleFrames` param.
- No export block: **RESOLVED** for both.
- No `animatableParams`: **RESOLVED** for both.
- Redundant `atan2` calls (p5-wave-interference): **RESOLVED** — cached per-frame.
- Non-deterministic operator evolution (p5-wave-colour): **RESOLVED** — Wang-hash PRNG.
- `_perimeter` hardcoding (p5-wave-interference): **RESOLVED** — computed dynamically.

## Resolved Issues (2026-03-13 second pass)

Four generators had `animatableParams` declared at SCRIPT_CONFIG root rather than inside the `animation` block. The `parameter-builder` reads `scriptConfig.animation.animatableParams`; root-level declarations were never consumed. Fixed across all four:

- `order-disorder`: `animatableParams: []` moved into `animation` block.
- `cymatics`: `animatableParams: []` moved into `animation` block.
- `solar-system`: `animatableParams: []` moved into `animation` block.
- `shape-array`: `animatableParams: []` added to `animation` block (was entirely absent).

## Recurring Issues Across Remaining Generators

1. **`loopFrames` conflict**: `curtain-morph` (`golden-grid` and `order-disorder` resolved in prior passes). Static `animation.loopFrames` mismatched to user-adjustable cycle param.
2. **State on `SCRIPT_CONFIG`**: `p5-wave-colour`, `animated-lines`, `fibonacci-balls`, `cymatics`, `order-disorder` still store mutable state on the config object via `this.*`. No host mechanism to isolate per-instance state; single-instance use is unaffected.
3. **Raw colours in canvas output**: exempt per design-law §6.2 (canvas pixel output); applicable only to CSS/UI styling, which all generators correctly avoid.
