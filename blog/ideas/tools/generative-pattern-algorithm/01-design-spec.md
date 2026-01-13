# Generative Pattern Algorithm — Design Specification

## 1. Overview

**Purpose:** Generate Truchet tilings, nested-contour fields, circular-lattice patterns, and blobby RD/CA structures from a single algorithmic framework.

**Output Type:** Static Image + Animation

**Target User:** Generative artists, designers exploring procedural patterns

## 2. Parameters

### Core Parameters

| Parameter | Type | Range | Default | Step | Purpose |
|-----------|------|-------|---------|------|---------|
| Density | slider | 0.1–2.0 | 1.0 | 0.01 | Point distribution density |
| Grid Strength | slider | 0–1 | 0.5 | 0.01 | Regular grid vs organic |
| Cluster Scale | slider | 0.1–5.0 | 1.0 | 0.1 | Noise clustering scale |
| Jitter | slider | 0–1 | 0.2 | 0.01 | Point position randomness |
| Neighbor Radius | slider | 0.5–5.0 | 2.0 | 0.1 | Connectivity search radius |
| Max Degree | stepper | 2–8 | 4 | 1 | Maximum edge connections |
| Arc Quantisation | slider | 0–1 | 0 | 0.1 | Circular arc snapping |
| Axis Bias | slider | 0–1 | 0 | 0.01 | Grid axis preference |

### Evolution Parameters

| Parameter | Type | Range | Default | Step | Purpose |
|-----------|------|-------|---------|------|---------|
| Evolution Mode | dropdown | [None, RD, CA] | None | — | State evolution type |
| Du | slider | 0.1–1.0 | 0.2 | 0.01 | RD diffusion rate U |
| Dv | slider | 0.01–0.2 | 0.1 | 0.01 | RD diffusion rate V |
| Feed Rate | slider | 0–0.1 | 0.055 | 0.001 | RD feed parameter |
| Kill Rate | slider | 0–0.1 | 0.062 | 0.001 | RD kill parameter |
| CA Rule | dropdown | [Life, Seeds, B3678] | Life | — | Cellular automaton rule |

### Rendering Parameters

| Parameter | Type | Range | Default | Step | Purpose |
|-----------|------|-------|---------|------|---------|
| Render Mode | dropdown | [Truchet, Blob, Nested, Global] | Truchet | — | Visual output style |
| Weight Scale | slider | 0.1–3.0 | 1.0 | 0.1 | Edge/point inflation |
| Tile Window | slider | 0.5–2.0 | 1.0 | 0.1 | Contour clipping window |
| Boundary Cost | slider | 0–1 | 0.5 | 0.1 | Tile boundary penalty |
| Contour Count | stepper | 2–32 | 8 | 1 | Nested contour levels |

### Animation Parameters

| Parameter | Type | Range | Default | Step | Purpose |
|-----------|------|-------|---------|------|---------|
| Animate | toggle | — | Off | — | Enable animation |
| Flow Speed | slider | 0–1 | 0.3 | 0.01 | Point advection speed |
| Noise Frequency | slider | 0.1–2.0 | 0.5 | 0.1 | Flow field frequency |

## 3. Controls Layout

### Tab: CONTROLS (≤4 components per block)
**Block: Distribution**
- slider: Density
- slider: Grid Strength
- slider: Cluster Scale
- slider: Jitter

**Block: Connectivity**
- slider: Neighbor Radius
- stepper: Max Degree
- slider: Arc Quantisation
- slider: Axis Bias

### Tab: STYLE
**Block: Evolution**
- dropdown: Evolution Mode
- slider: Du
- slider: Dv
- slider: Feed Rate
- slider: Kill Rate

**Block: Rendering**
- dropdown: Render Mode
- slider: Weight Scale
- slider: Tile Window
- stepper: Contour Count

### Tab: CANVAS
**Block: Size**
- slider: Width (196–840, F-multiples)
- slider: Height (196–840, F-multiples)

**Block: Export**
- button: Download PNG
- button: Download SVG
- button: Export GIF

### Tab: INFO
**Block: About**
- label: Algorithm description
- label: Transition modes

## 4. Interactions

| When | Then |
|------|------|
| Density changes | Regenerate point set |
| Grid Strength changes | Interpolate grid/organic positions |
| Evolution Mode changes | Enable/disable RD/CA controls |
| Render Mode changes | Switch rendering pipeline |
| Animate enabled | Start flow field advection |
| Export clicked | Render at full resolution |

## 5. Canvas Specification

**Coordinate System:** Normalized [0,1]² with origin at top-left

**Content:**
- Point set visualization
- Edge connectivity graph
- Distance field rendering
- Selected rendering mode output

**Default Size:** 420×420 (30F×30F)

**Background:** User-selectable via VGA palette

## 6. Algorithm Notes

See `02-theoretical-foundation.md` for mathematical details.

## 7. Validation Checklist

| Guide | Section | Satisfied |
|-------|---------|-----------|
| page-design-guide | All sections present | ✅ |
| page-design-guide | Standard component types | ✅ |
| tool-standards | Export controls | ✅ |
| tool-standards | Canvas sizing | ✅ |
| f-system | F-multiple sizes | ✅ |
| f-system | Layout spacing | ✅ |

