# Defecated — UI Layout

## Live Stub Parameters (1 param — all inert)

| key | type | min | max | step | default | notes |
|---|---|---|---|---|---|---|
| `param` | slider | 1 | 100 | 1 | 50 | **INERT** — not read in `draw` |

## Intended Parameters (from `defecated-tool.js` TOOL_CONFIG)

### Tab: TEXT

**Content:**
| key | type | default | notes |
|---|---|---|---|
| `line1` | text | 'HAVE YOU' | First text line |
| `line2` | text | 'DEFECATED' | Second text line |
| `line3` | text | 'RECENTLY?' | Third text line |

**Layout:**
| key | type | range | default |
|---|---|---|---|
| `targetWidth` | slider | 0.5–0.95 | 0.85 |
| `maxHeight` | slider | 0.5–0.9 | 0.75 |
| `lineGap` | slider | 0–0.02 | 0.005 |

### Tab: ANIMATION

**Timing:**
| key | type | range | default |
|---|---|---|---|
| `morphTime` | slider (ms) | 800–3000 | 1800 |
| `power` | slider | 2–10 | 6 |

**Effects:**
| key | type | range | default |
|---|---|---|---|
| `blurMax` | slider | 5–40 | 24 |

**Display:**
| key | type | options | default |
|---|---|---|---|
| `displayOptions` | toggle | ['Show Debug'] | [] |

### Tab: CANVAS

`canvas.modes: ['fit', 'fill', 'actual']` (800×600 default)

## Animation Config (Legacy)

```js
animation: {
  type: 'infinite',
  loopFrames: 0,
  defaultFps: 60,
  canPrerender: false
}
```

Cannot be pre-rendered due to iframe P5 hosting model.

## Notes

- The intended `text` type for line inputs is non-standard for the SCRIPT_CONFIG system.
- Google Fonts require network access; offline use is not supported.
- Font shuffling is random — animation is non-deterministic.
