# TILE MOSAIC SYSTEM — PAGE DESIGN DOCUMENT

## 1. Overview

**Purpose:**  
Generate dynamic, tile-based mosaics inspired by modular concentric discs, wedges, stripes, and radial textures, with full layout morphing, palette control, shading illusions, and real-time animation.

**Output Type:**  
Static Image + Animation

**Target User:**  
Designers, computational artists, generative researchers.

**Core Behaviour:**  
- Render a grid of macro-tiles (1×1, 1×2, 2×1, 2×2, etc.) using precomputed tile sprites.  
- Animate layouts morphing between strict grid and rectilinear cluster arrangements.  
- Apply pseudo-depth, global lighting, and procedural texture overlays.  
- Maintain real-time performance via cached graphics and low-cost transforms.

---

## 2. Parameters

### Core Parameters

| Parameter | Type | Range / Options | Default | Step | Purpose |
|----------|------|------------------|---------|------|---------|
| Grid Columns | slider | 4–80 | 30 | 1 | Number of base lattice columns |
| Grid Rows | slider | 4–80 | 30 | 1 | Number of base lattice rows |
| Tile Size | slider | 10–80 px | 24 | 1 | Base cell pixel size |
| Layout Mode | dropdown | [Uniform Grid, Packed Rects A, Packed Rects B] | Uniform Grid | — | Determines macro-tile partition of the lattice |
| Tile Type Distribution | toggle | [Concentric, Wedge, Stripe, Solid, Texture, Micro] | all selected | — | Determines which tile grammars can appear |
| Random Seed | number | 0–999999 | 1234 | 1 | Controls palette choice, tile assignment, spatial randomness |
| Rebuild Layout | button | — | — | Fully rebuilds macro-tile arrangement |
| Rebuild Tiles | button | — | — | Regenerates all tile sprites |

### Appearance

| Parameter | Type | Range / Options | Default | Purpose |
|----------|------|------------------|---------|---------|
| Palette Selection | dropdown | [Warm, Cool, Mixed, Earth, Pastel, High-Contrast] | Mixed | Controls global colour theme |
| Palette Variance | slider | 0–1 | 0.45 | Amount of random shift applied per tile |
| Depth Strength | slider | 0–1 | 0.4 | Intensity of pseudo-lighting applied to tile sprites |
| Highlight Intensity | slider | 0–1 | 0.25 | Strength of rim-highlight ring on lit side |
| Global Light Angle | slider | 0–360° | 315° | Orientation of directional light |
| Texture Strength | slider | 0–1 | 0.35 | Strength of procedural noise overlay |
| Overlay Mode | dropdown | [None, Noise, Noise+Light] | Noise+Light | Chooses which overlays are drawn on canvas |

### Behavior

| Parameter | Type | Range / Options | Default | Purpose |
|----------|------|------------------|---------|---------|
| Animation Mode | dropdown | [Static, Morph Layouts, Breathing Tiles, Texture Drift, All Combined] | Static | Determines animation type |
| Animation Speed | slider | 0.1–5 | 1.0 | Controls rate of all animations |
| Morph Target | dropdown | [Uniform → A, A → B, B → C, C → Uniform] | A → B | Selects layout transition |
| Texture Scroll X | slider | −2 to 2 | 0.2 | Horizontal drift of animated texture |
| Texture Scroll Y | slider | −2 to 2 | 0.1 | Vertical drift of animated texture |
| Tile Pulse Amplitude | slider | 0–0.5 | 0.1 | Amount of per-tile scale oscillation |
| Tile Pulse Frequency | slider | 0–10 | 2.0 | Wave frequency for tile breathing |

### Canvas

| Parameter | Type | Range / Options | Default | Purpose |
|----------|------|------------------|---------|---------|
| Canvas Width | slider | 200–2400 | 900 | 10 | Pixel width |
| Canvas Height | slider | 200–2400 | 900 | 10 | Pixel height |
| Pixel Density | dropdown | [1, 2] | 1 | Controls HiDPI scaling |
| Resolution Scale | slider | 0.25–1 | 1 | Renders scene in internal buffer then upscales |
| Background Color | color | — | #ffffff | Canvas background |

### Export

| Parameter | Type | Options | Default | Purpose |
|----------|------|---------|---------|---------|
| Download PNG | button | — | — | Save current canvas as PNG |
| Download SVG | button | — | — | Save vector version (layout only) |
| Export Frame | button | — | — | Export current animation frame |
| Export GIF | button | — | — | Export animated loop |

---

## 3. Controls Layout

### Tab: CONTROLS

**Block: Parameters**
- slider: Grid Columns  
- slider: Grid Rows  
- slider: Tile Size  
- dropdown: Layout Mode  
- toggle: Tile Type Distribution  
- number: Random Seed  
- button: Rebuild Layout  
- button: Rebuild Tiles  

**Block: Behavior**
- dropdown: Animation Mode  
- slider: Animation Speed  
- dropdown: Morph Target  
- slider: Tile Pulse Amplitude  
- slider: Tile Pulse Frequency  

### Tab: STYLE

**Block: Colors**
- dropdown: Palette Selection  
- slider: Palette Variance  

**Block: Depth & Light**
- slider: Depth Strength  
- slider: Highlight Intensity  
- slider: Global Light Angle  

**Block: Texture**
- slider: Texture Strength  
- dropdown: Overlay Mode  
- slider: Texture Scroll X  
- slider: Texture Scroll Y  

### Tab: CANVAS

**Block: Canvas**
- slider: Canvas Width  
- slider: Canvas Height  
- dropdown: Pixel Density  
- slider: Resolution Scale  
- color: Background Color  

**Block: Export**
- button: Download PNG  
- button: Download SVG  
- button: Export Frame  
- button: Export GIF  

### Tab: INFO

**Block: About**
- label: description of algorithm, tile grammars, shading illusions, layout morphing  
- label: performance notes  
- label: version number  

---

## 4. Interactions

### Parameter Effects

| When | Then |
|------|------|
| Grid columns/rows change | Recompute base lattice and macro-tile rects |
| Layout Mode changes | Repartition lattice using selected packing algorithm |
| Rebuild Tiles pressed | Rebuild all tile sprites using updated parameters |
| Palette selection changes | Recompute tile colour assignments |
| Depth/Highlight changes | Re-render tile sprite shading (cached) |
| Texture Strength changes | Update opacity of overlay layer |
| Animation Mode changes | Switch active animation function |
| Resolution Scale changes | Adjust size of internal render buffer |
| Background Color changes | Redraw canvas background |

### Button Actions

| Button | Action |
|--------|--------|
| Rebuild Layout | Generate new macro-tile grouping based on layout mode |
| Rebuild Tiles | Regenerate tile sprite graphics with current style settings |
| Download PNG | Export current rendered canvas to PNG file |
| Download SVG | Export vector representation of macro-tile geometry |
| Export Frame | Save the current animation frame |
| Export GIF | Render and save animation loop as GIF |

---

## 5. Canvas Specification

**Content:**  
- A grid of macro-tiles, each rendered from a cached sprite.  
- Optional overlay layers (noise, vignette, directional light).

**Coordinate System:**  
- Origin at top-left.  
- Each macro-tile occupies a rectangle in pixel coordinates derived from:  
  - `x = colIndex * tileSize`  
  - `y = rowIndex * tileSize`  
  - `w = tileWidthInCells  * tileSize`  
  - `h = tileHeightInCells * tileSize`

**Default Size:**  
900 × 900 px

**Background:**  
Solid colour from user selection.

### Visual Elements

- **Macro-Tiles:** drawn as scaled sprite images; shading and texture baked in.  
- **Overlay Noise:** global noise graphic repeated across canvas.  
- **Global Light Field:** blended gradient layer modulated by light angle and intensity.  
- **Morphing Layout:** rect interpolation between layouts.  
- **Animated Breathing:** local scale transformations applied per tile.  
- **Texture Drift:** moving UV coordinates for noise layer.

---

## 6. Algorithm Notes

### 6.1 Tile Grammar System

Tile types:

- **Concentric**: multiple rings, radial shading, highlight arcs.  
- **Wedge**: semicircles, quarter-circles, angular masks.  
- **Stripe**: vertical/horizontal bands.  
- **Solid**: single filled disc.  
- **Texture**: radial ripple patterns (sinusoidal bump illusion).  
- **Micro**: dot clusters with random jitter.  

Tile content is rendered once per sprite using offscreen buffers.

### 6.2 Layout Engine

Layout modes:

1. **Uniform Grid** – each base cell = 1×1 tile.  
2. **Packed Rects A** – rectilinear grouping with sizes {1×1, 1×2, 2×1, 2×2}.  
3. **Packed Rects B** – more irregular packing but still multiples of base cell size.

Morphing between layouts uses rect interpolation:  
`R(t) = (1-t) * R_A + t * R_B`

Borders fade using opacity interpolation.

### 6.3 Shading Illusion (2D Only)

- Fake directional highlight based on light angle.  
- Rim highlight drawn as thin arc on lit side.  
- Opposite side receives a darkened arc.  
- Optional global gradient overlay as additional light field.

### 6.4 Texture

- Precomputed noise textures.  
- Tile-level baked noise (blend modes).  
- Full-canvas noise drift via scrolling offsets.

### 6.5 Animation

Modes:

- **Static** – no time-based change.  
- **Morph Layouts** – interpolate positions/sizes of macro-tiles.  
- **Breathing Tiles** – scale oscillation per tile based on phase.  
- **Texture Drift** – scrolling texture coordinates.  
- **All Combined** – all active at once.

Animations rely on transforms and interpolation only—no per-pixel recomputation inside the draw loop.

### 6.6 Performance Constraints

- All sprites cached in reusable buffers.  
- No allocations in draw loop; arrays and objects reused.  
- Only lightweight transforms and image draws per frame.  
- Resolution scaling available via internal buffer.  
- GUI change events trigger rebuild, not continuous heavy recomputation.  
- Optional pixelDensity(1) to avoid HiDPI overhead.

---

## 7. Similar Tools

- **Pixel Tiler** – texture layering and noise systems.  
- **Wave Interference / Lissajous** – oscillation and parametric modulation concepts.  
- **Color Quantizer** – palette manipulation and contrast logic.

---

## 8. Future Extensions

- Shader-based normal mapping for stronger depth illusion.  
- Additional tile grammars (spirals, Voronoi cells, extrusion illusions).  
- Palette sampling from uploaded images.  
- Keyframed animation system with timeline.  
- Export of tile sprites individually for recombination.

