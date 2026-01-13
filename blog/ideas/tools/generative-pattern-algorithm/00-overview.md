# Generative Pattern Algorithm — Overview

## Quick Reference

| Attribute | Value |
|-----------|-------|
| **Purpose** | Unified generative system for Truchet tiles, nested contours, circular lattices, and RD/CA structures |
| **Output Type** | Static Image + Animation |
| **Core Pipeline** | Points → Connectivity → Evolution → Distance Field → Rendering |

## Document Map

| Doc | Purpose |
|-----|---------|
| [00-overview.md](./00-overview.md) | This file — quick reference and status |
| [01-design-spec.md](./01-design-spec.md) | UI parameters, controls layout, interactions |
| [02-theoretical-foundation.md](./02-theoretical-foundation.md) | Mathematical definitions, algorithm formalization |
| [03-algorithm-library.md](./03-algorithm-library.md) | Module routing, function signatures |
| [04-system-architecture.md](./04-system-architecture.md) | Data flow, state management, performance |
| [05-implementation-guide.md](./05-implementation-guide.md) | ToolBase integration, file structure |

## Status

| Component | Status |
|-----------|--------|
| Design spec | ✅ Complete |
| Algorithm library | ✅ 100% coverage |
| Implementation | ⏳ Pending |

## Key Decisions

| Decision | Rationale |
|----------|-----------|
| Single distance field | Unifies all rendering modes (tiles, blobs, contours) |
| Persistent point set | Avoids per-frame regeneration |
| Parameter interpolation | Enables smooth transitions without blending |

## Dependencies

### Existing Shared Modules
- `Noise.simplex2D`, `Noise.fbm2D` — point displacement, flow
- `SDF.*` — distance field operations
- `ReactionDiffusion.stepGrayScott` — state evolution
- `MarchingSquares.extractContours` — iso-contour extraction
- `SpatialIndex.kdRadiusSearch` — neighbor queries
- `Sampling.poissonDisk`, `Sampling.lloydRelaxation` — point distribution
- `Patterns.generateTruchetGrid` — tile templates
- `Advection.advectParticleRK4` — flow field integration
- `JFA.jumpFloodAlgorithm` — distance transform

### Tool-Local Modules
- None — all algorithms use shared library

## Gaps
- None identified — 100% algorithm coverage

## Constraints Check (Phase 0)

| Constraint | Satisfied |
|------------|-----------|
| BaseComponent OOP | ✅ Will extend ToolBase |
| VGA palette only | ✅ Colors via CSS vars |
| F-system sizing | ✅ Canvas and UI |
| AnimationFoundation | ✅ No raw RAF |
| Max 4 sidebar tabs | ✅ Design uses 4 tabs |

