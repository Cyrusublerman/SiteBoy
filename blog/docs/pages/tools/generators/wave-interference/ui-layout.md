# Wave Interference — UI Layout

## Parameter Groups

Live source exposes 59 parameters across 10 groups:
- `R(r) Term 1`, `R(r) Term 2`, `R(r) Modulation`
- `X(x) Term 1`, `X(x) Term 2`, `X(x) Modulation`
- `Y(y) Term 1`, `Y(y) Term 2`, `Y(y) Modulation`
- `View`

All phase keys are camelCase: `phiR1`, `phiR2`, `phiX1`, `phiX2`, `phiY1`, `phiY2`, plus modulation phase keys `phiRm1`, `phiRm2`, `phiXm1`, `phiXm2`, `phiYm1`, `phiYm2`.

## Controls

- Each term exposes amplitude, frequency, power, phase, offset, and wave type where applicable.
- Each modulation group exposes mix, two modulation frequencies, two powers, and two phases.
- `View` exposes `scale`, `rotation`, and `blendMode`.
- Removed: runtime `canvasWidth` / `canvasHeight` sliders.

## Presets

13 LANDMARKS are full parameter maps via `_DEFAULTS` spread. No host-side default merge is required.

## Animation

- `type: 'parametric'`
- `animatableParams`: `phiR1`, `phiR2`, `phiX1`, `phiX2`, `phiY1`, `phiY2`
- `defaultFps: 60`
- `canPrerender: true`
- `sequencer: true`

## Canvas

- Fixed: 512×512, 2d context, black background.

## Export

`png: true, svg: true, gif: true, webm: true, sequence: true`
