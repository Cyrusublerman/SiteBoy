# Defecated — UI Layout

## Parameters (Live)

| key | type | min | max | step | default | group | notes |
|---|---|---|---|---|---|---|---|
| `line1` | dropdown | — | — | — | HAVE YOU | Text | Word-list line 1 |
| `line2` | dropdown | — | — | — | DEFECATED | Text | Word-list line 2 |
| `line3` | dropdown | — | — | — | RECENTLY? | Text | Word-list line 3 |
| `targetWidth` | slider | 0.5 | 0.95 | 0.05 | 0.85 | Layout | Width fraction |
| `maxHeight` | slider | 0.5 | 0.9 | 0.05 | 0.75 | Layout | Height cap fraction |
| `lineGap` | slider | 0 | 0.02 | 0.001 | 0.005 | Layout | Inter-line gap fraction |
| `morphTime` | slider | 800 | 3000 | 100 | 1800 | Timing | Cycle duration (ms) |
| `power` | slider | 2 | 10 | 1 | 6 | Timing | Power-curve exponent |
| `blurMax` | slider | 5 | 40 | 1 | 24 | Effect | Peak shader blur radius |
| `displayOptions` | toggle | — | — | — | [] | Display | `Show Debug` overlay |

## Presets (Live)

- `Default`
- `Rapid Fire`
- `Slow Burn`
- `Tight Stack`

## Host Surfaces

- `PARAMS`: Text, Layout, Timing, Effect, Display groups
- `CANVAS`: host-managed size/background controls
- `ANIMATE`: present (`type: infinite`, `loopFrames: 0`, `animationExport: false`)
- `EXPORT`: PNG enabled; GIF/WebM disabled
- `INFO`: driven by `infoSections`

## Notes

- Free-text input is not available; lines are dropdown-only.
- Animation is non-deterministic (random font order + wall-clock timing).
- WebGL canvas is recreated in `p5Setup`, so viewport controls may not behave like strict 2D generators.
