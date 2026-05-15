# Generative Pattern — Mechanisms

**[DOC-022 DEFERRED — 2026-04-30]** Live script is v1.0.0 (fully implemented). This file was written against the stub-era spec and does NOT reflect the live implementation. Do not use as implementation reference. Full rewrite deferred; see `issues.md` DOC-022.

## Live Script State

| Item | Value |
|---|---|
| `draw` function | Fills canvas black, returns |
| Parameters | 1 slider: `complexity` (1–10) — unused |
| Animation | Not declared |
| State | None |

## Intended Algorithm (per spec)

### Phase 1: Hybrid Point Distribution (GEO-023)

```
points = blend(
    gridPoints(density),
    poissonDisk(density, jitter),
    noiseCluster(clusterScale)
) weighted by gridStrength
```

### Phase 2: Proximity Graph (GEO-024)

For each point `p`:
1. Find all points within `connectionRadius`.
2. Limit connections to `maxDegree` nearest.
3. Apply `axisBias`: weight candidates by alignment to cardinal axes.
4. Apply `arcQuantisation`: round connection angles to `2π/n` steps.

### Phase 3: Gray-Scott Solver (PHYS-005)

Standard Gray-Scott PDE on the graph topology:
```
∂u/∂t = Du·∇²u − u·v² + F·(1−u)
∂v/∂t = Dv·∇²v + u·v² − (F+k)·v
```
Parameters: `Du` (u diffusion), `Dv` (v diffusion), `feedRate` F, `killRate` k.
`iterations` steps per frame.

### Phase 4: Distance Transform (IMG-018)

Jump Flood Algorithm (JFA) on the graph edge set produces a 2D SDF field.

### Rendering Modes

| Mode | Key Function | Mechanism |
|---|---|---|
| Truchet | `truchetTemplates` | Threshold SDF into tile types; apply arc templates |
| Blob | `blobUnion` | Smooth union of RBF-weighted point spheres |
| Nested Contours | `nestedContours` | Iso-line extraction at `tileWindowSize` intervals |
| Global Contours | `nestedContours` (global) | Iso-lines across full SDF |

### Animation (ANIM-012)

Flow advection field driven by `flowSpeed` and a noise function at `noiseFrequency`. Advects the point set or SDF over time.

## Function Inventory (intended)

| Function | Module | Status |
|---|---|---|
| `hybridPointDistribution` | GEO-023 | Not implemented |
| `proximityGraph` | GEO-024 | Not implemented |
| `grayScottSolver` | PHYS-005 | Not implemented |
| `distanceTransform` | IMG-018 | Not implemented |
| `truchetTemplates` | PAT-010 | Not implemented |
| `blobUnion` | PAT-011 | Not implemented |
| `nestedContours` | PAT-012 | Not implemented |
| `flowAdvection` | ANIM-012 | Not implemented |
| `lerp` | MATH-003 | Not implemented (inline in spec) |
