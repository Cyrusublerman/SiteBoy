# Moiré — UI Layout

## Parameter Groups

| Group | Key | Type | Default | Range / Options |
|---|---|---|---|---|
| Gratings | `gratingCount` | slider | 2 | 1 → 4, step 1 |
| Gratings | `wavelength` | slider | 0.02 | 0.005 → 0.1, step 0.001 |
| Gratings | `angularFreq` | slider | 0 | 0 → 24, step 1 |
| Gratings | `phaseOffset` | slider | 0 | 0 → 1, step 0.01 |
| Combination | `combineMode` | dropdown | sum | sum / product / min / max |
| Combination | `threshold` | slider | 0.5 | 0 → 1, step 0.01 |
| Multi-Centre | `centreOffset` | slider | 0 | 0 → 1, step 0.01 |
| Multi-Centre | `weightA` | slider | 1 | 0 → 1, step 0.01 |
| Multi-Centre | `weightB` | slider | 1 | 0 → 1, step 0.01 |
| Motion | `phaseSpeed` | slider | 0.1 | 0 → 1, step 0.01 |
| Motion | `centreOsc` | slider | 0 | 0 → 1, step 0.01 |
| Mask | `maskType` | dropdown | none | none / circle / triangle / square |
| Mask | `maskSize` | slider | 1 | 0 → 1, step 0.01 |
| Mask | `maskSoftness` | slider | 0 | 0 → 0.2, step 0.01 |
| Colors | `fgColor` | color | #ffffff | hex colour picker |
| Colors | `bgColor` | color | #000000 | hex colour picker |
| Colors | `invert` | toggle | false | boolean |
| Canvas | `canvasWidth` | slider | 420 | 256 → 1024, step 64 |
| Canvas | `canvasHeight` | slider | 420 | 256 → 1024, step 64 |

**Total parameters: 19** across 7 groups.

**Non-standard parameter types:** `color`, `toggle`, `dropdown` — these are used in the source but may not be supported by all host versions (see Issues).

## Presets

Presets use a nested `{ name, values: {...} }` format — full parameter maps, not partial objects.

| Name | Notable Values |
|---|---|
| Classic | gratingCount=2, centreOffset=0.3, combineMode=sum, threshold=0.5, no mask |
| Angular | angularFreq=12, combineMode=product, threshold=0.4, maskType=circle, maskSize=0.9 |
| Hypnotic | gratingCount=3, centreOsc=0.2, combineMode=min, threshold=0.3, phaseSpeed=0.2 |

## Animation

- `type: 'infinite'` — runs continuously via `frame`-driven phase.
- `defaultFps: 30`
- `canPrerender: true`
- **No `animatableParams` declared.** Animation is implicit — the `draw` function internally computes `animationTime` from `frame`. The host cannot identify which parameters drive animation for UI purposes.

## Canvas

- Fixed: 420×420, 2d context, black background.
- `canvasWidth`/`canvasHeight` parameters declared but `draw` uses `canvas.width`/`canvas.height` — sliders are inert.

## Export

`png: true, gif: true, webm: true, sequence: true` (no SVG export).
