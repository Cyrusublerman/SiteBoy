# Wave Interference (P5) — UI Layout

## Parameter Groups (Live)

### Wave
- `amplitude`: slider `1..12` step `0.5`, default `4`
- `frequency`: slider `0.05..0.5` step `0.01`, default `0.251`
- `speed`: slider `0.001..0.1` step `0.001`, default `0.02`

### Sources
- `s1Loops`: slider `1..30`, default `10`
- `s2Loops`: slider `1..30`, default `7`
- `s3Loops`: slider `1..30`, default `18`
- `s4Loops`: slider `1..30`, default `3`

### Render
- `resolution`: slider `1..6`, default `2`

`cycleFrames` is not a live parameter. Cycle period is fixed by `animation.loopFrames`.

## Presets (Live)

Presets use standard `{ name, values }` format:
- Classic
- High Freq
- Low Detail

## Animation and Export (Live)

- `animation.type`: `loop`
- `animation.loopFrames`: `3600`
- `animation.defaultFps`: `60`
- `animation.animatableParams`: `['amplitude', 'speed', 'frequency']`
- `export`: `{ png: true, gif: true, webm: false }`

## Canvas

`1080x1080`, p5 context, `pixelDensity(1)`.
