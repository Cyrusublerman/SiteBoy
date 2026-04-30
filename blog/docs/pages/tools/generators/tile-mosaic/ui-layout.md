# Tile Mosaic — UI Layout

Canvas: 800×800, `canvas2d`. Export: PNG.

## Parameters

### Grid
| Key | Type | Range | Default |
|---|---|---|---|
| `gridColumns` | slider | 4–40 | 10 |
| `gridRows` | slider | 4–40 | 10 |
| `tileSize` | slider | 10–80 | 40 |

### Layout
| Key | Type | Options | Default |
|---|---|---|---|
| `layoutMode` | dropdown | Uniform Grid / Packed Rects A / Packed Rects B | Uniform Grid |
| `tileTypes` | toggle (multi) | Concentric / Wedge / Stripe / Solid / Texture / Micro / Truchet / Hex / Triangle | Concentric, Wedge, Stripe, Solid |
| `randomSeed` | slider | 0–999999 | 42 |

### Behaviour
| Key | Type | Options | Default |
|---|---|---|---|
| `animationMode` | dropdown | Static / Morph Layouts / Breathing / Texture Drift / All | Static |
| `animationSpeed` | slider | 0.1–5 | 1.0 |

### Palette
| Key | Type | Options | Default |
|---|---|---|---|
| `paletteMode` | select | Preset / Custom (Canvas colours) | Preset |
| `paletteSelection` | dropdown | Warm / Cool / Mixed / Earth / Pastel / High-Contrast | Warm |
| `paletteVariance` | slider | 0–1 | 0.3 |

### Depth
| Key | Type | Range | Default |
|---|---|---|---|
| `depthStrength` | slider | 0–1 | 0.5 |
| `highlightIntensity` | slider | 0–1 | 0.4 |
| `globalLightAngle` | slider | 0–360° | 45 |
| `zStackEnabled` | toggle | — | off |
| `zShadowBlur` | slider | 0–24 | 6 |
| `zShadowSpread` | slider | 0–1 | 0.4 |

### Texture
| Key | Type | Options | Default |
|---|---|---|---|
| `textureStrength` | slider | 0–1 | 0.3 |
| `overlayMode` | dropdown | None / Noise / Noise+Light | None |
| `tileTextureOverlay` | select | none / grain / crosshatch / dots | none |
| `tileTextureOpacity` | slider | 0–1 | 0.25 |

## Presets

Geometric · Organic · Neon Grid · Mosaic Flow · Pastel Dream
