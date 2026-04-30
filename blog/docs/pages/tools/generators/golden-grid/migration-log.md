# Golden Grid — Migration Log

## Pack Updated

Date: 2026-04-25  
Source analysed: `assets/js/tools/generators/scripts/pattern/golden-grid.gen.js`

## Current State

Implemented and live.

Resolved since the original migration:
- `loopFrames` export conflict resolved with live getter
- preset format converted to `{ name, values }`
- export metadata added
- per-frame ratio recomputation removed
- bounds cached by `maxDepth`
- dead `_normBounds` state removed

## 2026-04-28 additions (GOL-01, GOL-02, GOL-04)

- **GOL-01 Loop cap removed:** `loopFrames` cap lifted via X-015; animation runs continuously without hard cut-off.
- **GOL-02 HSL range input:** `HSLRangeInput` (X-009) added — `hueMin`/`hueMax`, `satMin`/`satMax`, `litMin`/`litMax` sliders. Per-cell colour mapping function restricts final HSL output to the user-defined sub-range.
- **GOL-04 Positional + depth modulation:** `positionModulation` and `depthModulation` channels added; HSL values shifted by normalised cell XY position and recursion depth respectively, creating spatial colour variation independent of time.

## 2026-04-29 additions (GOL-03)

- **GOL-03 Easing control:** `_EASING` map (17 presets) + `_applyEasing(t, id)` helper. `easingCurve` param (`type: 'easing-curve'`, routed to `EasingCurveInput`). Primary animation time variable `t` passed through `_applyEasing` before driving the phi-power sinusoidal ratio. `easing-curve` param type registered in `generative-tool-host.js` `COMPONENT_TYPES` and `parameter-builder.js`.

## Residuals

- High-depth recursion remains CPU-bound with no worker/GPU path.
- User-facing `loopFrames` remains unusual but technically synchronised.
