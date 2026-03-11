# Circles — UI Layout

## Parameter Groups

| Group | Key | Type | Default | Range / Options |
|---|---|---|---|---|
| Display | `displayMode` | radio | Lines | Lines / B/W / Gradient |
| Animation | `circleCount` | slider | 100 | 10 → 200, step 1 |
| Animation | `cycleFrames` | slider | 3600 | 600 → 7200, step 60 |

**Total parameters: 3** across 2 groups.

**Missing from legacy spec recommendations:**
- `largestRadius` (outer radius) slider — outer radius is derived from canvas size only.
- Line width slider — hardcoded to 1.
- Colour customisation — hardcoded white.
- Play/pause button.
- Speed multiplier.

## Presets

No presets in SCRIPT_CONFIG.

## Animation

- `type: 'loop'`
- `loopFrames: 3600` (hardcoded)
- `defaultFps: 60`
- No `animatableParams`.
- No `canPrerender`.

**Note:** `loopFrames: 3600` is hardcoded, but `cycleFrames` is configurable (600–7200). If `cycleFrames` ≠ 3600, the declared loop period doesn't match the animation period.

## Canvas

- Fixed: 800×800, 2d context, black background.
- No `canvasWidth`/`canvasHeight` parameters (not present — unlike most other generators).

## Export

`png: true, gif: true, webm: true, sequence: true`

## Shared Import

`TWO_PI` is imported from `assets/js/tools/generators/scripts/shared/evaluation.js`. This is the only generator in the documented set that imports from a shared internal module.
