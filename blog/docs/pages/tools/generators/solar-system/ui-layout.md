# Solar System — UI Layout

## Current State

Solar System is implemented as a 2D canvas real-time astronomical display.

## Controls

**Display:** `distanceScale`, `planetScale`, `sizeMode` (proportional/logarithmic/exaggerated), `showTerminator`, `showLabels`, `showInfo`, `showMoons` (SOL-04).

**Time:** `timeRate` (realtime/day/week/month/year/decade/century), `animRange` (none/day/week/year/decade/century).

**Asteroid Belt:** `asteroidCount`, `showAsteroidBelt`.

**Viewer:** `showViewer`, `fovAngle`, `showReticle` — reticle draws crosshairs + outer ring + local solar-time label at viewer position (SOL-05).

**Time Panel:** `showTimePanel`, `timePanelScale` (11 scales: seconds → gigayears) — renders historical/scientific anchor events from `algorithms/astronomy/time-anchors.js` as an overlay panel (SOL-07).

Removed: `canvasWidth` and `canvasHeight` sliders.

## Animation

- `type: 'infinite'`
- `defaultFps: 1`
- `sequencer: false`
- `animatableParams: []`
- Frame index is deliberately unused because positions represent current real-world time.

## Export

PNG snapshot export is supported. GIF/WebM/sequence export are disabled because frame-indexed animation is not meaningful for a real-time astronomical display.

## Notes

State is stored on `SCRIPT_CONFIG` properties and helper methods are inline on `SCRIPT_CONFIG`.
