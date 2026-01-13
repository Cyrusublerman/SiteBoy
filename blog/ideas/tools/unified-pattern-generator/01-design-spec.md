# Unified Pattern Generator — Design Specification

## 1. Overview

**Purpose:** Generate mid-century geometric patterns using superellipse-based primitives.

**Output Type:** Static Image

**Target User:** Designers creating retro/vintage patterns

## 2. Parameters

### Grid Parameters

| Parameter | Type | Range | Default | Step | Purpose |
|-----------|------|-------|---------|------|---------|
| Grid Spacing | slider | 20–200 | 80 | 1 | Cell spacing |
| Jitter | slider | 0–1 | 0 | 0.01 | Position randomness |
| Density Field | toggle | — | Off | — | Use noise for occupancy |

### Shape Parameters

| Parameter | Type | Range | Default | Step | Purpose |
|-----------|------|-------|---------|------|---------|
| Rounding P | slider | 2–∞ | 4 | 0.1 | Corner exponent |
| Aspect Range | slider | 0.5–2 | 1 | 0.1 | Width/height ratio |
| Size Distribution | slider | 0.5–1.5 | 1 | 0.05 | Size variance |

### Nesting Parameters

| Parameter | Type | Range | Default | Step | Purpose |
|-----------|------|-------|---------|------|---------|
| Nesting Depth | stepper | 1–6 | 1 | 1 | Concentric levels |
| Nesting Ratio | slider | 0.5–0.9 | 0.7 | 0.01 | Scale between levels |

### Warp Parameters

| Parameter | Type | Range | Default | Step | Purpose |
|-----------|------|-------|---------|------|---------|
| Warp Amplitude | slider | 0–1 | 0 | 0.01 | Distortion strength |
| Warp Frequency | slider | 0.1–2 | 0.5 | 0.1 | Noise frequency |

### Blend Parameters

| Parameter | Type | Range | Default | Step | Purpose |
|-----------|------|-------|---------|------|---------|
| Blend Radius | slider | 0–50 | 0 | 1 | Smooth union radius |

## 3. Controls Layout

### Tab: CONTROLS
**Block: Grid**
- slider: Grid Spacing
- slider: Jitter
- toggle: Density Field

**Block: Shape**
- slider: Rounding P
- slider: Aspect Range
- slider: Size Distribution

### Tab: STYLE
**Block: Nesting**
- stepper: Nesting Depth
- slider: Nesting Ratio

**Block: Warp**
- slider: Warp Amplitude
- slider: Warp Frequency

**Block: Blend**
- slider: Blend Radius

### Tab: CANVAS
**Block: Size**
- slider: Width
- slider: Height

**Block: Export**
- button: Download PNG
- button: Download SVG

### Tab: INFO
**Block: About**
- label: Description

## 4. Canvas Specification

**Default Size:** 420×420 (30F×30F)

**Coordinate System:** Origin at center, normalized [-1,1]²

## 5. Validation Checklist

| Guide | Satisfied |
|-------|-----------|
| page-design-guide | ✅ |
| tool-standards | ✅ |
| f-system | ✅ |

