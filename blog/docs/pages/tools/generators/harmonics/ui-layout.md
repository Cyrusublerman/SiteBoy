# Harmonics — UI Layout

## Parameter Groups

| Group | Key | Type | Default | Range |
|---|---|---|---|---|
| Display | `motionBlur` | slider | 0.05 | 0.01 → 0.2, step 0.01 |
| Display | `points` | slider | 800 | 100 → 3000, step 100 |
| Display | `pointSize` | slider | 1 | 0.5 → 4, step 0.5 |
| Timing | `passDuration` | slider | 90 | 30 → 180, step 10 (seconds) |
| Canvas | `canvasWidth` | slider | 800 | 400 → 2000, step 100 |
| Canvas | `canvasHeight` | slider | 800 | 400 → 2000, step 100 |

**Total parameters: 6** across 3 groups.

## Presets

Presets use full `{ name, values: {...} }` format.

| Name | Character |
|---|---|
| Default | 800 points, pointSize 1, motionBlur 0.05, 90 s pass |
| Fast Cycle | 600 points, motionBlur 0.08, 30 s pass (total 4 min) |
| Dense | 2000 points, pointSize 0.5, motionBlur 0.03 |
| Minimal | 400 points, pointSize 2, motionBlur 0.02, 120 s pass |

## Animation

- `type: 'loop'`
- `loopDuration: 720` (seconds — 12 minutes)
- `loopFrames: 43200` (720 × 60)
- `defaultFps: 60`
- `defaultSpeed: 1`
- `canPrerender: true`
- `animatableParams: []` (explicitly empty)

**Note:** The declared `loopFrames: 43200` is fixed in SCRIPT_CONFIG, but the actual cycle duration is `passDuration × 8` seconds (reconfigurable). Changing `passDuration` to 30 s produces a 240 s cycle, not 720 s — `loopFrames` is therefore inaccurate when `passDuration ≠ 90`. The animation runs on wall-clock time (not frame count), so `loopFrames` is used only by the host for export planning.

## Canvas

- Fixed: 800×800, 2d context. No background key (default transparent or unset).
- `canvasWidth`/`canvasHeight` declared but `draw` reads `canvas.width`/`canvas.height` — sliders are inert.

## Export

`png: true, svg: false, gif: true, webm: true, sequence: true`
