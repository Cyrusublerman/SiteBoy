# <Display Name> — Source Reference

## Current Owners

- source node: `assets/js/tools/processors/distort/nodes/<category>/<ClassName>Node.js`
- registry: `assets/js/tools/processors/distort/nodes/registry.js`
- pipeline: `assets/js/tools/processors/distort/core/Pipeline.js`

## Archive

- `reference/distort/<type>/source/<ClassName>Node.js`

## Legacy Docs Archived

- `reference/distort/<type>/legacy-docs/<type>.md` — classification: component-level doc
- (additional files, or "none beyond component-level doc")

## Algorithm Imports

- (list every import from assets/js/shared/algorithms/, or "none — all computation is inline")

## Module Pattern

- Factory: `export const <Name>Node = createEffectModule({...})` from `core/EffectModule.js`
- Pattern: factory (not class extension); no class body in module file

## Classifications

- source node: functional source node
- `<type>.md`: component-level doc
- (other files with their classification from classify-reference-material.md)
