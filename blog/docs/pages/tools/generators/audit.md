# Generator Docs Audit

- registry generators: `25`
- complete packs (all 8 files, score ≥ 2): `25`
- completion: `100%`
- pass completed: 2026-03-10
- last updated: 2026-03-15 (full remediation pass complete: arch fixes, doc unification, browser verification)

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

## Resolved Issues (2026-03-15 full remediation pass)

### Architecture
- **Sidebar EXPORT tab**: removed from `parameter-builder.js`. Export (PNG + animation) now exclusively in toolbar EXPORT ▾ dropdown. `AnimationExport` injects into `toolbar.getAnimExportMount()`.
- **Sequencer opt-in**: `_injectSequencer` guard changed to `sequencer === true`. 14 generators opt in; 11 do not.
- **INFO tab**: present on all 25 generators. `infoSections` populated with markdown-formatted content for all 25. `parameter-builder.buildInfoTab` emits `['markdown', body]`.
- **Markdown rendering**: `Text.js` extended with `'markdown'` variant; `_parseMarkdown` converts headings, bold, italic, code, lists, paragraphs to HTML. `tool-base.js` maps `'markdown'` DSL type to Text component.
- **ANIMATE tab conditional**: only shown for generators with `animation.type !== 'none'` (correct — static generators interference-figure and unified-pattern show PARAMS + INFO only).
- **Toolbar UI**: `GeneratorToolbar.js` fixed: flex-based widths, `F*0.75` font sizes, `▾`/`▸` dropdown glyphs, `min-width:100%` export panel.

### Documentation
- `infoSections` for all 25 generators rewritten: self-contained markdown bodies, no internal path references, correct heading capitalisation.
- `Legacy source:` lines removed from all `feature-parity.md` files.
- `sequencer` flag set explicitly for all 25 generators.
- `animatableParams` populated inside `animation` block for all animated generators.
- `feature-parity.md` updated: host-provided features (play/pause, checkpointing) marked PASS; intentional gaps documented as DROP or DIVERGE.

### Browser Verification (2026-03-15)
All 25 generators load without console errors. Tab structure confirmed:
- Static generators (interference-figure, unified-pattern): PARAMS + INFO
- Animated generators without sequencer (circles, clockwise, defecated, fibonacci-balls, quine, shape-array, solar-system, wave-equation-synth): PARAMS + ANIMATE + INFO
- Animated generators with sequencer (animated-lines, curtain-morph, cymatics, generative-pattern, golden-grid, harmonics, lissajous, moire, order-disorder, p5-wave-colour, p5-wave-interference, squares, tile-mosaic, torus, wave-interference): PARAMS + ANIMATE + INFO with SequencerV2 controls

## Remaining Known Issues (not remediated — documented decisions)

1. **State on `SCRIPT_CONFIG`**: Several generators store mutable state on the config object (`this.*`). No host mechanism to isolate per-instance state; single-instance use is unaffected. Documented in issues-and-conflicts files.
2. **External network request** (`solar-system`): `fetch('https://ipapi.co/json/')` for IP geolocation. Documented; no offline fallback implemented.
3. **`loopFrames` static vs dynamic mismatch** (`curtain-morph`): export loop length does not track user-adjusted cycle param. Documented as DIVERGE in feature-parity.
