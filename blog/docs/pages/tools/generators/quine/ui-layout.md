# Quine — UI Layout

## Parameter Groups

### Ink (3 params)

| key | type | range | step | default | description |
|---|---|---|---|---|---|
| entropy | slider | 0.01–0.5 | 0.01 | 0.15 | decay rate of ink wetness per diffusion step |
| urgency | slider | 1–20 | 1 | 8 | ink mass added per frame per dark pixel |
| gravity | slider | 0.5–10 | 0.5 | 2 | minimum wetness threshold for a pixel to bleed to neighbours |

### Typing (2 params)

| key | type | range | step | default | description |
|---|---|---|---|---|---|
| delayScale | slider | 0.5–4 | 0.1 | 1 | global multiplier for per-character delay |
| pauseDelay | slider | 5–60 | 5 | 20 | base delay (frames) for punctuation pauses |

### Text (3 params)

| key | type | range | step | default | description |
|---|---|---|---|---|---|
| fontSize | slider | 10–28 | 1 | 16 | font size in px |
| lineHeight | slider | 14–40 | 1 | 24 | vertical line spacing in px |
| margin | slider | 20–80 | 5 | 50 | canvas margin in px |

Total: **8 parameters** across 3 groups. `animatableParams` not declared.

## Presets (3, flat format)

| name | entropy | urgency | gravity | delayScale | pauseDelay | fontSize | lineHeight | margin |
|---|---|---|---|---|---|---|---|---|
| Classic | 0.15 | 8 | 2 | 1 | 20 | 16 | 24 | 50 |
| Fast | 0.2 | 6 | 3 | 0.5 | 10 | 16 | 24 | 50 |
| Slow Bleed | 0.05 | 12 | 1 | 2 | 30 | 14 | 22 | 40 |

**Non-standard**: presets use flat object format. Standard requires `{ name, values: { ... } }`.

## Animation Config

```js
animation: { type: 'infinite', defaultFps: 60 }
```

`type: 'infinite'` — no loop frame count. No export options declared.

## Canvas

1080×1080 px, P5.js context. `p.pixelDensity(1)` enforced in setup. Offscreen graphics buffer (`_imagined`) also 1080×1080.

## Colour Parameters

No colour parameters exposed to UI. Paper and ink colours are hardcoded constants on `SCRIPT_CONFIG` (`_BG`, `_INK_CODE`, `_INK_COMMENT`). These use raw RGB objects rather than CSS variables.
