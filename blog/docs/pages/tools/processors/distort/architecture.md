# DISTORT Docs Architecture

## Layers

1. Root authorities in this folder (`blog/docs/pages/tools/processors/distort/`)
2. Process guides in `guides/`
3. Reusable templates in `template/`
4. One documentation pack per effect module (in this folder, one subfolder per `<type>`)
5. Component-level docs in `blog/docs/components/distort/` (living authority — module identity, algorithm, paramDefs, pipeline behaviour)
6. Reference archive inputs in `reference/distort/`

## Required Pack Files

Each module documentation pack contains exactly 8 files:

- `source-reference.md`
- `description.md`
- `mechanisms.md`
- `ui-layout.md`
- `performance.md`
- `feature-parity.md`
- `issues-and-conflicts.md`
- `migration-log.md`

## Relationship Between Layers 4 and 5

Layer 5 (component-level docs) is the living reference for what a module *is* and how it works. It is updated when the module changes.

Layer 4 (documentation packs) captures source lineage, parity tracking, issue history, and migration log. It records what was available at documentation time. It does not replace Layer 5 — it complements it.

When a module is updated, Layer 5 is updated. Layer 4's `migration-log.md` gains a new entry recording the change.

## Authority Precedence

1. `blog/docs/guides/standards/design-law.md` (absolute)
2. `blog/docs/guides/standards/coding-standards.md`, `tool-standards.md`
3. `blog/docs/guides/effect-module-standards.md`, `effect-module-style-guide.md`
4. `blog/docs/components/distort/ui-ux.md`
5. Per-module pack files (local)
