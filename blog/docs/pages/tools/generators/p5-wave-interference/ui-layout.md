# Wave Interference (P5) — UI Layout

## Parameter Groups

### Wave (3 params)

| key | type | range | step | default | animatable |
|---|---|---|---|---|---|
| amplitude | slider | 1–12 | 0.5 | 4 | — |
| frequency | slider | 0.05–0.5 | 0.01 | 0.251 | — |
| speed | slider | 0.001–0.1 | 0.001 | 0.02 | — |

### Sources (4 params)

| key | type | range | step | default | animatable |
|---|---|---|---|---|---|
| s1Loops | slider | 1–30 | 1 | 10 | — |
| s2Loops | slider | 1–30 | 1 | 7 | — |
| s3Loops | slider | 1–30 | 1 | 18 | — |
| s4Loops | slider | 1–30 | 1 | 3 | — |

Sources 1 & 2 form `pairA`; sources 3 & 4 form `pairB`. All orbit the perimeter; 1 & 3 clockwise, 2 & 4 counter-clockwise.

### Render (2 params)

| key | type | range | step | default | animatable |
|---|---|---|---|---|---|
| resolution | slider | 1–6 | 1 | 2 | — |
| cycleFrames | slider | 360–7200 | 360 | 3600 | — |

`resolution`: block-size for pixel replication (1=full, 6=6×6 blocks). Higher values are faster.

**`loopFrames` conflict**: `cycleFrames` adjusts the animation cycle length in the draw code, but `animation.loopFrames` is hardcoded to `3600`. The host uses `animation.loopFrames` for pre-render scheduling; these diverge when `cycleFrames ≠ 3600`.

`animatableParams` is not declared — no animations are pre-configured.

## Presets (3, flat format)

| name | amplitude | frequency | speed | s1Loops | s2Loops | s3Loops | s4Loops | resolution | cycleFrames |
|---|---|---|---|---|---|---|---|---|---|
| Classic | 4 | 0.251 | 0.02 | 10 | 7 | 18 | 3 | 2 | 3600 |
| High Freq | 3 | 0.4 | 0.03 | 8 | 5 | 13 | 2 | 2 | 2400 |
| Low Detail | 6 | 0.15 | 0.015 | 10 | 7 | 18 | 3 | 4 | 3600 |

**Non-standard**: presets use flat object format. Standard requires `{ name, values: { ... } }`.

## Animation Config

```js
animation: { type: 'loop', loopFrames: 3600, defaultFps: 60 }
```

No export options declared. No `animatableParams` declared.

## Canvas

1080×1080 px, P5.js context. `p.pixelDensity(1)` enforced in setup.
