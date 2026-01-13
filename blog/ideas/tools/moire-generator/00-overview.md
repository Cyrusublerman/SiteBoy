# Moiré Generator — Overview

## Quick Reference

| Attribute | Value |
|-----------|-------|
| **Purpose** | Generate static and animated moiré patterns from interacting gratings |
| **Output Type** | Animation + Static Image |
| **Core Pipeline** | Gratings → Combination → Mask → Threshold → Render |

## Document Map

| Doc | Purpose |
|-----|---------|
| [00-overview.md](./00-overview.md) | This file |
| [01-design-spec.md](./01-design-spec.md) | UI parameters |
| [02-theoretical-foundation.md](./02-theoretical-foundation.md) | Wave interference math |
| [03-algorithm-library.md](./03-algorithm-library.md) | Module routing |
| [04-system-architecture.md](./04-system-architecture.md) | Data flow |
| [05-implementation-guide.md](./05-implementation-guide.md) | Implementation |

## Status

| Component | Status |
|-----------|--------|
| Algorithm library | ✅ 100% coverage |
| Implementation | ⏳ Pending |

## Dependencies

### Existing Shared Modules
- `Patterns.radialGrating` — radial wave patterns
- `Patterns.angularGrating` — angular wave patterns
- `Patterns.combineMoire` — interference combination
- `Noise.smoothstep` — smooth transitions

