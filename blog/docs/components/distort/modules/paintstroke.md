# PAINT STROKE

Simulates oil painting by iteratively stamping brush strokes at positions where a palette colour best approximates the target source pixel.

## Identity

| Field | Value |
|-------|-------|
| Type string | `paintstroke` |
| Category | `GENERATIVE` |
| Module type | pixel |
| Source file | `assets/js/tools/processors/distort/nodes/generative/PaintStrokeNode.js` |

## Algorithm

| Algorithm | Source | Documentation |
|-----------|--------|---------------|
| `paintStamp` | `assets/js/shared/algorithms/painter/brush-engine.js` | — |
| `LayerTracker` | `assets/js/shared/algorithms/painter/layer-tracker.js` | — |
| `SeededRNG` | `assets/js/tools/processors/distort/core/SeededRNG.js` | — |

`paintStamp` places a circular brush stroke with anti-aliased soft falloff. `LayerTracker` accumulates intermediate snapshots every 250 strokes; `flatten()` composites all layers. Palette built from source colours (or synthetically for named modes).

## Parameters

### NodePanel (Universal)

All modules are managed by the NodePanel component. These controls are always present regardless of module type.

**Interactive controls (not stored as module params):**

| Control | Component | Description |
|---------|-----------|-------------|
| Drag handle | drag-handle | Reorder module in the effect stack |
| Enable | toggle | Off = bypass; unmodified source passes through to next module |
| Solo | button | Isolate module; all others suppressed until solo is cleared |

**Composition params (applied after module `apply()` writes its output):**

| Key | Label | Component | Range | Default | Purpose |
|-----|-------|-----------|-------|---------|---------|
| `opacity` | OPACITY | slider+number | 0–1 | 1 | Scales module output before compositing onto source |
| `blendMode` | BLEND MODE | dropdown | `normal` `multiply` `screen` `overlay` `add` `difference` `darken` `lighten` | `normal` | Compositing mode for blending module output onto source |

### Tier 3 (primary)

| Key | Label | Component | Range | Default | Purpose |
|-----|-------|-----------|-------|---------|---------|
| `iterations` | STROKES | slider+number | 100–50000 | 5000 | Maximum number of brush strokes |
| `brushMin` | BRUSH MIN | slider+number | 1–100 | 10 | Minimum brush radius in pixels |
| `brushMax` | BRUSH MAX | slider+number | 2–200 | 50 | Maximum brush radius in pixels |
| `minOpacity` | MIN OPAC | slider+number | 1–255 | 10 | Minimum stroke opacity |
| `maxOpacity` | MAX OPAC | slider+number | 1–255 | 50 | Maximum stroke opacity |

### Tier 4 (secondary)

| Key | Label | Component | Range | Default | Purpose |
|-----|-------|-----------|-------|---------|---------|
| `maxLayers` | MAX LAYERS | slider+number | 1–50 | 15 | Per-pixel layer count limit (stops overdraw) |
| `paletteMode` | PALETTE | dropdown | `source`, `greyscale`, `warm`, `cool` | `source` | Colour palette source for strokes |

**Synthetic palette values (`_buildPalette`):**

| Mode | Fixed 5-colour palette (RGB) |
|------|------------------------------|
| `greyscale` | `[0,0,0]` `[64,64,64]` `[128,128,128]` `[192,192,192]` `[255,255,255]` |
| `warm` | `[30,10,5]` `[120,40,20]` `[200,100,50]` `[240,180,100]` `[255,230,200]` — near-black, dark red, burnt orange, amber, cream |
| `cool` | `[5,10,30]` `[20,40,120]` `[50,100,200]` `[100,180,240]` `[200,230,255]` — near-black, dark blue, mid blue, sky, pale ice |

`source` mode samples `iterations`-worth of random pixels from the source to build a variable-size palette.

## Pipeline Behaviour

### Input
Full RGBA image.

### Process
1. Build a colour palette from source (or synthetic for named modes).
2. Initialise an empty canvas buffer.
3. For each iteration (up to `iterations`): stop early if average layer coverage exceeds `maxLayers`.
4. Pick a random `(x, y)` position. Skip if pixel's own layer count is already `maxLayers × 1.3`.
5. Find the palette colour that, when alpha-composited at average opacity, minimises RGB squared distance to the source pixel.
6. Stamp a brush circle via `paintStamp`; increment per-pixel layer counters.
7. Push snapshot to `LayerTracker` every 250 strokes.
8. Flatten all layers and write to destination.

### Output
Painterly RGBA image.

### Preview strategy
`iterations` capped at 1000.

> **Performance:** at `iterations = 50000`, each stroke requires a palette scan and `paintStamp` call. At high resolution this is the most CPU-intensive node in the pipeline. Preview cap at 1000 strokes is essential.

## Mask controls

Applied after compositing. Mask luminance drives blend weight per-pixel: white = full module effect, black = module has no effect (source passes through).

| Control | Component | Options / Range | Description |
|---------|-----------|-----------------|-------------|
| Mode | dropdown | `none` / `upload` / `luminance` / `gradient` | Source for the mask image |
| Image | file | — | Greyscale PNG upload (upload mode only) |
| Invert | toggle | — | Flip mask values before applying |
| Blur | slider+number | 0–20 px | Gaussian blur applied to mask edges before compositing |

**Modes:**
- `none` — no mask; module effect applies uniformly across all pixels
- `upload` — user-supplied greyscale image mapped to image dimensions
- `luminance` — source image luminance at point of masking drives the blend weight
- `gradient` — system-generated linear or radial gradient

## Modulation targets
All `range`-type params accept image and expression drivers via the `+D` button in the NodePanel. No parameters in this module have pre-wired `getModulated()` calls in the current implementation — all values read directly from `this.params`.

See [driver-system.md](../driver-system.md) for image driver and expression driver reference.

## Presets using this node
None in current PRESETS.
