# Generative Pattern — UI Layout

**Status: Unimplemented stub.**

## Live Parameters (Current)

| Group | Key | Type | Default | Range |
|---|---|---|---|---|
| Pattern | `complexity` | slider | 5 | 1 → 10, step 1 |

**Total: 1 parameter.** `complexity` is not connected to any drawing logic — the `draw` function ignores it.

## Intended Parameters (per spec)

### POINTS tab

| Block | Key | Type | Range |
|---|---|---|---|
| Distribution | `density` | slider | 0.1 → 10 |
| Distribution | `gridStrength` | slider | 0 → 1 |
| Distribution | `clusterScale` | slider | 0.1 → 5 |
| Distribution | `jitter` | slider | 0 → 1 |
| Connectivity | `connectionRadius` | slider | 0.5 → 5 |
| Connectivity | `maxDegree` | stepper | 2 → 8 |
| Connectivity | `axisBias` | slider | 0 → 1 |
| Connectivity | `arcQuantisation` | slider | 0 → 1 |

### EVOLUTION tab

| Block | Key | Type | Range |
|---|---|---|---|
| RD | `Du` | slider | 0.1 → 0.5 |
| RD | `Dv` | slider | 0.01 → 0.2 |
| RD | `feedRate` | slider | 0.01 → 0.1 |
| RD | `killRate` | slider | 0.04 → 0.08 |
| Steps | `iterations` | number | 0 → 5000 |

### RENDER tab

| Block | Key | Type | Options |
|---|---|---|---|
| Mode | `renderMode` | dropdown | Truchet / Blob / Nested Contours / Global Contours |
| Style | `weightScale` | slider | 0.5 → 5 |
| Style | `tileWindowSize` | slider | 0.5 → 2 |
| Style | `boundaryCost` | slider | 0 → 1 |

### ANIMATION tab

| Block | Key | Type | Range |
|---|---|---|---|
| Flow | `flowSpeed` | slider | 0 → 2 |
| Flow | `noiseFrequency` | slider | 0.1 → 5 |

**Total intended: 19 parameters.**

## Animation (intended)

- `type: 'infinite'` (implied by flowSpeed/animation tab in spec)
- No `animatableParams` defined in the spec

## Canvas

- 800×800, 2d context (both live and spec agree).

## Export (per spec)

- PNG, GIF. No SVG, WebM, or sequence mentioned in spec.
