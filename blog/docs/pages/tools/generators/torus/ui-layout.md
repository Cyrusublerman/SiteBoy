# Torus — UI Layout

## Parameter Groups

| Group | Key | Type | Default | Range / Options |
|---|---|---|---|---|
| Torus | `numSpirals` | slider | 9 | 3 → 18, step 1 |
| Torus | `torusSize` | slider | 0.18 | 0.1 → 0.4, step 0.01 |
| Torus | `majorRadiusFactor` | slider | 1 | 0.5 → 2.0, step 0.05 |
| Torus | `minorRadiusFactor` | slider | 1 | 0.5 → 2.0, step 0.05 |
| Torus | `spiralWinds` | slider | 4 | 1 → 10, step 1 |
| Torus | `showTorusMesh` | radio | `on` | `on`, `off` |
| Rotation | `viewX` | slider | 30 | 0 → 360, step 1, degrees |
| Rotation | `viewY` | slider | 22.5 | 0 → 360, step 1, degrees |
| Rotation | `cycleFrames` | slider | 3600 | 600 → 7200, step 60 |

**Total parameters: 8** across 2 groups.

## Presets

Presets use full `{ name, values: {...} }` format.

| Name | Character |
|---|---|
| Default | 9 spirals, 4 winds, torusSize 0.18, mesh on |
| Dense Spirals | 18 spirals, 6 winds, torusSize 0.2, mesh off |
| Minimal | 3 spirals, 2 winds, torusSize 0.25, mesh on |
| Fast | 9 spirals, 4 winds, cycleFrames 1200 (30 s loop) |

## Animation

- `type: 'loop'`, `loopFrames: 3600`, `defaultFps: 60`, `canPrerender: true`.
- The loop period is `loopFrames / fps` seconds (3600 / 60 = 60 s at default).
- `animatableParams: ['viewX', 'viewY']`.

## Canvas

- Fixed: 800×800, 2d context, black background.
- No runtime canvas-size sliders in live config.

## Export

`png: true, gif: true, webm: true, sequence: true`
