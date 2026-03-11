# Torus — UI Layout

## Parameter Groups

| Group | Key | Type | Default | Range / Options |
|---|---|---|---|---|
| Torus | `numSpirals` | slider | 9 | 3 → 18, step 1 |
| Torus | `torusSize` | slider | 0.18 | 0.1 → 0.4, step 0.01 |
| Torus | `spiralWinds` | slider | 4 | 1 → 10, step 1 |
| Torus | `showTorusMesh` | toggle | true | boolean |
| Rotation | `viewX` | slider | 30 | 0 → 360, step 1, degrees |
| Rotation | `viewY` | slider | 22.5 | 0 → 360, step 1, degrees |
| Rotation | `cycleFrames` | slider | 3600 | 600 → 7200, step 60 |
| Canvas | `canvasWidth` | slider | 800 | 400 → 1600, step 100 |
| Canvas | `canvasHeight` | slider | 800 | 400 → 1600, step 100 |

**Total parameters: 9** across 3 groups.

**Non-standard parameter type:** `toggle` for `showTorusMesh` — should be `radio` per code-standards.

**Missing from spec (legacy doc recommendations):**
- Separate `majorRadius` and `minorRadius` sliders (locked equal in live).
- Play/pause button.
- Speed multiplier.

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
- No `animatableParams` declared — animation is implicit via `frame`.

## Canvas

- Fixed: 800×800, 2d context, black background.
- `canvasWidth`/`canvasHeight` parameters declared but `draw` reads `canvas.width`/`canvas.height` — sliders are inert.

## Export

`png: true, gif: true, webm: true, sequence: true`
