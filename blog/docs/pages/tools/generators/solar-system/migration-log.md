# Solar System — Migration Log

## Pack Updated

Date: 2026-04-25  
Source analysed: `assets/js/tools/generators/scripts/other/solar-system.gen.js` v5.0.0

## Current State

Implemented and live.

Resolved since the original migration:
- module-level mutable state moved to `SCRIPT_CONFIG` properties
- render hook and helpers converted to inline methods
- inert canvas size parameters removed
- font updated
- asteroid belt rendering cached and batched through ImageData
- non-prerenderable animation/export semantics documented

## 2026-04-28 additions (SOL-01 – SOL-03, SOL-06)

- **SOL-01 Size mode:** `sizeMode` param (proportional / logarithmic / exaggerated) — controls how planet radius maps to canvas pixels. Proportional uses true relative radii; logarithmic compresses the range; exaggerated applies a floor to ensure all planets are visible.
- **SOL-02 Terminator shading:** Per-planet terminator shading via sun-vector — each planet disc has a dark hemisphere facing away from the Sun, computed from the Sun's canvas-space bearing.
- **SOL-03 Time controls:** `timeRate` param (realtime / day / week / month / year / decade / century) and `animRange` param (none / day / week / year / decade / century) added; time-lapse and bounded animation window configurable.
- **SOL-06 Canvas hit-test:** Canvas hit-test restored; hovering over a planet displays a tooltip with name, distance (AU), angle (°), and velocity (km/s).

## 2026-04-29 additions (SOL-04, SOL-05, SOL-07)

- **SOL-04 Moons:** `MOON_DATA` table (8 bodies: Moon, Phobos, Deimos, Io, Europa, Ganymede, Callisto, Titan) with simplified Keplerian circular orbits. Rendered in `_drawMoons()` after planets; `showMoons` toggle; labels respect `showLabels`.
- **SOL-05 Viewer reticle:** `_drawViewerReticle()` draws outer ring + crosshairs + local solar-time label (HH:MM) at viewer position. Replaces bare dot when `showReticle: true`. FOV cone retained.
- **SOL-07 Time panel:** `assets/js/shared/algorithms/astronomy/time-anchors.js` built — 55 anchor events across 11 scale tiers (seconds → gigayears), all verifiable to that precision. `_drawTimePanel()` renders top-right overlay with elapsed-label column and event-name column. `showTimePanel` + `timePanelScale` params.

## Residuals

- Custom date navigation (future/past seek by exact date) not implemented.
- Moon orbital inclinations treated as zero (ecliptic-plane approximation).
- Phobos/Deimos orbital radii are below the rendering threshold at default `distanceScale`; visible only at high `planetScale + distanceScale` combinations.
- External geolocation fetch remains a separate user-decision issue.
