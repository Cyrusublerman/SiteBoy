# Unified Pattern — Performance

## Complexity

Primary cost:

`O(W × H × C_range × (nestingLevels + 1))`

Where `C_range` is average bbox-overlapping cells per pixel after culling.

## Live Mitigations

- Tier 3 worker offload (`compute.worker = true`)
- Tier 2 interaction scaling (`interactionScale = 0.5`, `idleDelay = 300`)
- Per-pixel bounding-box culling in cell iteration

## Practical Behaviour

- Default settings are interactive on worker path.
- Dense settings (`gridSpacing` low + `nestingLevels` high + large `sizeMax`) can still take multi-second renders.
- As designed, this is acceptable because output is static and recomputed only on param changes.
