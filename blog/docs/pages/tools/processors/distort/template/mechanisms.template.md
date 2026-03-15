# <Display Name> — Mechanisms

## Mathematical Model Class

<State the class of mathematics: signal processing, coupled PDEs, geometric transformation, statistical segmentation, etc.>

## apply() Execution Order

`apply(src, dst, w, h, p, ctx, modulate)` — `p` contains pre-resolved params (preview caps applied by factory via `previewMax`/`previewMin`).

1. <Derive computed values from p — note any previewMax caps in effect>
2. <If inline ctx.quality check present, note why it cannot use previewMax>
3. <Algorithm step 1 — state which algorithm function is called>
4. <Algorithm step 2 — continue for every step in source order>
5. <Write to dst>

## Function Inventory

| Function | Role | Inputs | Output | Complexity |
| --- | --- | --- | --- | --- |
| `apply(src, dst, w, h, p, ctx, modulate)` | Pixel render function | buffers + resolved params + context | void | O(<formula>) |
| `<helper>(...)` | <role> | <inputs> | <output> | O(<formula>) |

## Mathematical Model

**<Formula name>:**
`<formula>`

where:
- `<symbol>` — <what it represents>, <unit or domain>

<Repeat for every non-trivial formula in the source. If no formulas: state "No mathematical operations. This module is a lookup/remap.">

## Preview Strategy

<State which params declare previewMax/previewMin (primary mechanism — factory resolves before apply() is called). If the module also has an inline ctx.quality check, state what it caps and why previewMax alone is insufficient. If no cap: state why (O(1) per pixel, no expensive scaling params).>
