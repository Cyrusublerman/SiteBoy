# Moiré — UI Layout

## Parameter Groups (Live)

| Group | Keys |
|---|---|
| Gratings | `gratingCount`, `wavelength`, `angularFreq`, `phaseOffset` |
| Combination | `combineMode` (radio), `threshold` |
| Multi-Centre | `centreOffset`, `weightA`, `weightB` |
| Motion | `phaseSpeed`, `centreOsc` |
| Mask | `maskType` (radio), `maskSize`, `maskSoftness` |
| Colors | `fgColor` (color), `bgColor` (color), `invert` (radio off/on) |

Canvas width/height sliders are not part of live parameter declarations.

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
- `animatableParams` declared: `phaseOffset`, `threshold`, `centreOffset`, `wavelength`.

## Canvas

- Fixed `420x420`, `2d`, black background.

## Export

`png: true, gif: true, webm: true, sequence: true` (SVG not implemented).
