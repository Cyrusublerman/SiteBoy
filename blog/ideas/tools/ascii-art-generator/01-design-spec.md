# ASCII Art Generator — Design Specification

## 1. Overview

**Purpose:** Render images as ASCII with structural and directional feature matching.

**Output Type:** Text

## 2. Parameters

### Core Parameters

| Parameter | Type | Range | Default | Purpose |
|-----------|------|-------|---------|---------|
| Tile Width | slider | 4–32 | 8 | Horizontal tile size |
| Tile Height | slider | 8–48 | 16 | Vertical tile size |
| Character Set | dropdown | [Basic, Extended, Blocks, Custom] | Basic | Glyph palette |
| Font | dropdown | [Courier, Monaco, Consolas] | Courier | Rendering font |

### Matching Parameters

| Parameter | Type | Range | Default | Purpose |
|-----------|------|-------|---------|---------|
| Tone Weight α | slider | 0–1 | 0.4 | Brightness match |
| Quadrant Weight β | slider | 0–1 | 0.2 | Regional match |
| Orientation Weight γ | slider | 0–1 | 0.3 | Direction match |
| Signature Weight δ | slider | 0–1 | 0.1 | Pattern match |
| Density Threshold | slider | 0–0.5 | 0.2 | Candidate filtering |

### Coherence Parameters

| Parameter | Type | Range | Default | Purpose |
|-----------|------|-------|---------|---------|
| Coherence Enabled | toggle | — | On | Spatial smoothing |
| Coherence Strength | slider | 0–1 | 0.5 | Neighbor influence |
| Passes | stepper | 1–5 | 2 | Refinement iterations |

## 3. Controls Layout

### Tab: CONTROLS
**Block: Tiles** — Width, Height, Character Set, Font

**Block: Matching** — Weights α, β, γ, δ

### Tab: STYLE
**Block: Coherence** — Enable, Strength, Passes

**Block: Output** — Mode (Plain, HTML, ANSI)

### Tab: CANVAS
**Block: Preview** — Preview canvas

**Block: Export** — Copy Text, Download TXT, Download HTML

### Tab: INFO
**Block: Algorithm** — Description, Cost function

## 4. Output Specification

**Formats:**
- Plain text (ASCII)
- HTML `<pre>` block
- ANSI colored (terminal)

