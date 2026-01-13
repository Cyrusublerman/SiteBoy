# Complex Line Shading — Design Specification

## 1. Overview

**Purpose:** Generate line-shaded vector artwork from raster images using space-filling curves and TSP-based paths.

**Output Type:** Static Image (SVG export, canvas preview)

**Target User:** Digital artists, illustrators, generative art practitioners seeking pen-plotter or print-ready line art.

---

## 2. Parameters

### Core Parameters

| Parameter | Type | Range | Default | Step | Purpose |
|-----------|------|-------|---------|------|---------|
| Fill Method | dropdown | [Hilbert, TSP, L-System] | Hilbert | — | Space-filling algorithm |
| Edge Sigma | slider | 0.5–5.0 | 1.4 | 0.1 | Gaussian blur before edge detection |
| Edge Low | slider | 0.0–1.0 | 0.1 | 0.01 | Canny low threshold |
| Edge High | slider | 0.0–1.0 | 0.3 | 0.01 | Canny high threshold |

### Hilbert Parameters

| Parameter | Type | Range | Default | Step | Purpose |
|-----------|------|-------|---------|------|---------|
| Min Square Size | slider | 4–64 | 16 | 4 | Smallest square for packing |
| Curve Order | slider | 2–6 | 4 | 1 | Hilbert curve recursion depth |
| Adaptive Density | toggle | — | Off | — | Vary curve density by intensity |

### TSP Parameters

| Parameter | Type | Range | Default | Step | Purpose |
|-----------|------|-------|---------|------|---------|
| Point Spacing Min | slider | 2–32 | 8 | 1 | Minimum distance between points |
| Point Spacing Max | slider | 8–128 | 32 | 1 | Maximum distance (low intensity) |
| Optimization | dropdown | [None, 2-opt, 3-opt] | 2-opt | — | Path optimization level |

### Modulation

| Parameter | Type | Range | Default | Step | Purpose |
|-----------|------|-------|---------|------|---------|
| Line Width Min | slider | 0.1–5.0 | 0.5 | 0.1 | Thinnest stroke (light areas) |
| Line Width Max | slider | 0.5–10.0 | 3.0 | 0.1 | Thickest stroke (dark areas) |
| Smoothing | slider | 0–20 | 5 | 1 | Width transition smoothing |
| Invert | toggle | — | Off | — | Invert intensity mapping |

### Canvas

| Parameter | Type | Range | Default | Step | Purpose |
|-----------|------|-------|---------|------|---------|
| Preview Mode | dropdown | [Fit, Actual, 50%] | Fit | — | Canvas display scaling |
| Show Edges | toggle | — | Off | — | Overlay edge detection |
| Show Regions | toggle | — | Off | — | Overlay region boundaries |
| Stroke Color | color | — | #000000 | — | Output line color |
| Background | color | — | #FFFFFF | — | Preview background |

---

## 3. Controls Layout

### Tab: CONTROLS

**Block: Source**
- file: Upload Image — accepts image/*, loads source
- button: Clear — removes source, resets preview

**Block: Edge Detection**
- slider: Sigma — Gaussian blur amount (0.5–5.0)
- slider: Low Threshold — weak edge threshold (0.0–1.0)
- slider: High Threshold — strong edge threshold (0.0–1.0)

**Block: Fill Method**
- dropdown: Method — [Hilbert, TSP, L-System]

**Block: Hilbert Settings** *(visible when Method = Hilbert)*
- slider: Min Square — smallest packing square (4–64 px)
- slider: Curve Order — recursion depth (2–6)
- toggle: Options — [Adaptive Density]

**Block: TSP Settings** *(visible when Method = TSP)*
- slider: Min Spacing — closest point distance (2–32)
- slider: Max Spacing — furthest point distance (8–128)
- dropdown: Optimization — [None, 2-opt, 3-opt]

### Tab: STYLE

**Block: Line Modulation**
- slider: Min Width — thinnest line (0.1–5.0)
- slider: Max Width — thickest line (0.5–10.0)
- slider: Smoothing — width transition kernel (0–20)
- toggle: Options — [Invert]

**Block: Colors**
- color: Stroke — line color
- color: Background — preview background

### Tab: CANVAS

**Block: Display**
- dropdown: Preview Mode — [Fit, Actual, 50%]
- toggle: Overlays — [Show Edges, Show Regions]

**Block: Export**
- button: Download SVG — export vector output
- button: Download PNG — export raster preview
- button: Copy SVG — copy SVG to clipboard

---

## 4. Interactions

### Parameter Effects

| When | Then |
|------|------|
| Image uploaded | Run full pipeline, display preview |
| Sigma changes | Re-run edge detection, update preview |
| Threshold changes | Re-run edge detection, update regions |
| Fill Method changes | Re-generate fill curves |
| Square Size / Order changes | Re-pack squares, regenerate Hilbert curves |
| Point Spacing changes | Re-sample points, re-solve TSP |
| Width Min/Max changes | Re-modulate widths, update preview |
| Smoothing changes | Re-smooth width array |

### Button Actions

| Button | Action |
|--------|--------|
| Clear | Remove source image, clear canvas, reset to defaults |
| Download SVG | Generate SVG document, trigger download |
| Download PNG | Export canvas as PNG at current resolution |
| Copy SVG | Generate SVG, copy to clipboard |

### Conditional Visibility

| Condition | Show | Hide |
|-----------|------|------|
| Method = Hilbert | Hilbert Settings block | TSP Settings block |
| Method = TSP | TSP Settings block | Hilbert Settings block |
| No image loaded | "Upload an image" status | All parameter blocks |

---

## 5. Canvas Specification

**Content:** Line-shaded representation of source image

**Coordinate System:** Origin top-left, Y down (SVG convention)

**Default Size:** Match source image dimensions

**Background:** Background color parameter

### Visual Elements

| Element | Description | Controls |
|---------|-------------|----------|
| Fill curves | Continuous paths per region | Method, Hilbert/TSP params |
| Stroke width | Varies along path by intensity | Width Min/Max, Smoothing |
| Edge overlay | Red lines showing detected edges | Show Edges toggle |
| Region overlay | Colored fills showing segmented regions | Show Regions toggle |

### Preview Pipeline

```
Source Image
    ↓
┌───────────────────────────────────────┐
│ Edge Detection (if Show Edges)         │
│ → Red overlay on canvas               │
└───────────────────────────────────────┘
    ↓
┌───────────────────────────────────────┐
│ Region Segmentation (if Show Regions)  │
│ → Colored region overlay              │
└───────────────────────────────────────┘
    ↓
┌───────────────────────────────────────┐
│ Fill Curves + Modulation              │
│ → Black strokes with variable width   │
└───────────────────────────────────────┘
```

---

## 6. Algorithm Notes

### Pipeline Stages

1. **Load & Preprocess**
   - Decode image to RGBA
   - Convert to grayscale (luminance weighting)

2. **Edge Detection**
   - Gaussian blur (σ from Sigma param)
   - Sobel gradients
   - Non-maximum suppression
   - Hysteresis thresholding

3. **Region Extraction**
   - Otsu thresholding
   - Connected component labeling
   - Contour extraction (marching squares)

4. **Space Filling**
   - Per-region polygon
   - Hilbert: pack squares → generate curves → connect
   - TSP: sample points → optimize path

5. **Modulation**
   - Sample intensity at each path point
   - Map to stroke width
   - Smooth width array

6. **Output**
   - Generate SVG path elements
   - Apply stroke-width per segment

### Performance Considerations

| Stage | Complexity | Mitigation |
|-------|------------|------------|
| Edge detection | O(n) | Web Worker |
| Connected components | O(n) | Web Worker |
| Hilbert generation | O(4^order) | Limit order to 6 |
| TSP 2-opt | O(n²) | Cap point count, progress callback |
| SVG generation | O(n) | Streaming build |

---

## 7. Similar Tools

| Tool | Similarity | Difference |
|------|------------|------------|
| StippleGen | Point-based image rendering | Uses stipples, not continuous lines |
| SquiggleDraw | Line-based shading | Uses horizontal lines only |
| TSP Art | TSP-based single path | No region separation, no width modulation |

---

## 8. Future Extensions

- **SVG Input:** Accept vector paths as region definitions
- **Manual Regions:** Draw/edit region boundaries
- **L-System Fills:** Custom L-system grammars
- **Reaction-Diffusion:** Flow-field based line direction
- **Animation:** Morphing between parameter states
- **Batch Processing:** Multiple images with same settings

