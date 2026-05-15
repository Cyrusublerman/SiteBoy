# Lissajous Curves — UI Layout

## Live Parameter Surface

- Groups: X-Axis Term 1/2, X-Axis Modulation, Y-Axis Term 1/2, Y-Axis Modulation, Global
- Total parameter count: unchanged from v1.1.0 script
- Phase keys are camelCase in live code:
  - `phiX1`, `phiX2`, `phiXm1`, `phiXm2`
  - `phiY1`, `phiY2`, `phiYm1`, `phiYm2`

## Key Runtime Controls

- `points`: `1000..80000` (live sample density)
- `scale`: `20..300`
- `rotation`: `0..360`
- `Ax*` / `Ay*`: additive axis term amplitudes
- `Mx` / `My`: modulation amplitudes (0 disables modulation)

## Sidebar Contract

- `PARAMS`: all term/modulation/global groups
- `ANIMATE`: `type: parametric`, 11 animatable params
- `EXPORT`: `png/svg/gif/webm/sequence` all enabled in live config
- `INFO`: present via `infoSections`

## Presets

- 28 presets in `LANDMARKS`
- High-frequency presets set `points: 40000`
