# CELL AUTOMATA

Runs a configurable outer-totalistic cellular automaton from a luminance-thresholded binary grid seeded by the source image, and blends the output with the source.

## Identity

| Field | Value |
|-------|-------|
| Type string | `cellularautomata` |
| Category | `PHYSICS` |
| Module type | pixel |
| Source file | `assets/js/tools/processors/distort/nodes/physics/CellularAutomataNode.js` |

## Algorithm

| Algorithm | Source | Documentation |
|-----------|--------|---------------|
| Outer-totalistic CA (Moore neighbourhood, toroidal) | Inline | — |

Inline — 8-neighbour Moore neighbourhood with toroidal wrap. `birth` and `survival` sets define six named rules. `steps` generations computed; grid blended with source.

**Built-in rules:**

| Name | Birth | Survival |
|------|-------|----------|
| `life` | [3] | [2,3] |
| `highLife` | [3,6] | [2,3] |
| `seeds` | [2] | [] |
| `dayNight` | [3,6,7,8] | [3,4,6,7,8] |
| `maze` | [3] | [1,2,3,4,5] |
| `anneal` | [4,6,7,8] | [3,5,6,7,8] |

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
| `rule` | RULE | dropdown | `life`, `highLife`, `seeds`, `dayNight`, `maze`, `anneal` | `life` | CA rule definition |
| `steps` | STEPS | slider+number | 1–500 | 50 | Number of CA generations to simulate |

### Tier 4 (secondary)

| Key | Label | Component | Range | Default | Purpose |
|-----|-------|-----------|-------|---------|---------|
| `threshold` | INIT THRESH | slider+number | 0–255 | 128 | Luminance threshold for initial live/dead classification |
| `blendAmt` | BLEND | slider+number | 0–1 | 0.5 | Blend ratio between CA output and source |

## Pipeline Behaviour

### Input
Full RGBA image.

### Process
1. Threshold BT.601 luminance against `threshold` to produce an initial binary grid.
2. For each of `steps` generations: for each cell count 8 Moore neighbours (toroidal); apply birth/survival rules to advance the grid.
3. Final grid values (0 or 1, scaled to 0 or 255) blended with source channels at `blendAmt`.
4. Copy alpha.

### Output
CA-pattern RGBA image blended with source.

### Preview strategy
`steps` capped at 20.

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
