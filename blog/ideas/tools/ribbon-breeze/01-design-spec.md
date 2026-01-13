# Ribbon Breeze — Design Specification

## 1. Overview

**Purpose:** Generate animated ribbon fields with 2.5D depth illusion.

**Output Type:** Animation

## 2. Parameters

### Layout Parameters

| Parameter | Type | Range | Default | Purpose |
|-----------|------|-------|---------|---------|
| Rows | stepper | 1–20 | 8 | Number of ribbons |
| Row Spacing | slider | 20–100 | 40 | Vertical spacing |
| Ribbon Length | slider | 100–800 | 400 | Horizontal extent |
| Points Per Ribbon | stepper | 20–200 | 100 | Resolution |
| Thickness | slider | 5–50 | 20 | Ribbon height |

### Wind Parameters

| Parameter | Type | Range | Default | Purpose |
|-----------|------|-------|---------|---------|
| Wave Number k | slider | 0.01–0.1 | 0.03 | Wavelength |
| Omega | slider | 0.01–0.2 | 0.05 | Frequency |
| Base Amplitude | slider | 10–100 | 40 | Wave height |
| Noise Amount | slider | 0–1 | 0.2 | Turbulence |

### Shading Parameters

| Parameter | Type | Range | Default | Purpose |
|-----------|------|-------|---------|---------|
| Shading Mode | dropdown | [Gradient, Inverted, Flat, Pattern, Dither] | Gradient | Style |
| Front Color | color | — | #FFFFFF | Top surface |
| Underside Color | color | — | #808080 | Bottom surface |
| Riser Color | color | — | #000000 | Fold edges |

### Loop Parameters

| Parameter | Type | Range | Default | Purpose |
|-----------|------|-------|---------|---------|
| Loop Frames | stepper | 30–300 | 120 | Frames per cycle |
| Wind Cycles | stepper | 1–8 | 2 | Wave repetitions |

## 3. Controls Layout

### Tab: CONTROLS
**Block: Layout** — Rows, Row Spacing, Ribbon Length, Thickness

**Block: Wind** — k, Omega, Amplitude, Noise

### Tab: STYLE
**Block: Shading** — Shading Mode, Colors

**Block: Variation** — Per-ribbon variation, Time variation

### Tab: CANVAS
**Block: Size** — Width, Height

**Block: Export** — PNG, GIF

### Tab: INFO
**Block: About** — Description

## 4. Canvas Specification

**Default Size:** 420×420 (30F×30F)

