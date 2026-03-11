# <Display Name> — Mechanisms

## Mathematical Model Class

<State the class of mathematics: signal processing, coupled PDEs, geometric transformation, statistical segmentation, etc.>

## apply() Execution Order

1. <Read ctx.quality; apply PREVIEW cap if applicable — state what cap>
2. <Read params via this.getModulated() or this.params — list which params>
3. <Algorithm step 1>
4. <Algorithm step 2 — continue for every step in source order>
5. <Release any ctx.pool buffers before return>

## Function Inventory

| Function | Role | Inputs | Output | Complexity |
| --- | --- | --- | --- | --- |
| `apply(src, dst, w, h, ctx)` | Pixel render function | buffers + context | void | O(<formula>) |
| `<helper>(...)` | <role> | <inputs> | <output> | O(<formula>) |

## Mathematical Model

**<Formula name>:**
`<formula>`

where:
- `<symbol>` — <what it represents>, <unit or domain>

<Repeat for every non-trivial formula in the source. If no formulas: state "No mathematical operations. This module is a lookup/remap.">

## Preview Strategy

<Describe the exact PREVIEW cap implemented. State which params are capped, to what value, and cite the ctx.quality check. If no cap: state why (O(1) per pixel or similar).>
