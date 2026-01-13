# Moiré Generator — Design Specification

## 1. Overview

**Purpose:** Generate moiré patterns using radial, angular, and multi-centre gratings.

**Output Type:** Animation + Static Image

## 2. Parameters

### Core Parameters

| Parameter | Type | Range | Default | Purpose |
|-----------|------|-------|---------|---------|
| Grating Count | stepper | 1–4 | 2 | Number of gratings |
| Base Wavelength | slider | 0.001–0.1 | 0.02 | Ring spacing |
| Angular Frequency | slider | 0–24 | 0 | Number of lobes |
| Phase Offset | slider | 0–1 | 0 | Phase shift |
| Combination | dropdown | [SUM, PRODUCT, MIN, MAX] | SUM | How to combine |

### Mask Parameters

| Parameter | Type | Range | Default | Purpose |
|-----------|------|-------|---------|---------|
| Mask Type | dropdown | [None, Circle, Triangle, Polygon] | None | Shape mask |
| Mask Size | slider | 0–1 | 1 | Mask scale |
| Mask Softness | slider | 0–0.2 | 0 | Edge blur |

### Multi-Centre Parameters

| Parameter | Type | Range | Default | Purpose |
|-----------|------|-------|---------|---------|
| Centre Offset | slider | 0–1 | 0 | Separation distance |
| Centre Weight A | slider | 0–1 | 1 | First centre strength |
| Centre Weight B | slider | 0–1 | 1 | Second centre strength |

### Animation Parameters

| Parameter | Type | Range | Default | Purpose |
|-----------|------|-------|---------|---------|
| Animate | toggle | — | Off | Enable animation |
| Phase Speed | slider | 0–1 | 0.1 | Animation rate |

## 3. Controls Layout

### Tab: CONTROLS
**Block: Parameters** — Grating Count, Wavelength, Angular Freq, Phase, Combination

**Block: Multi-Centre** — Centre Offset, Weights

**Block: Mask** — Type, Size, Softness

**Block: Animation** — Animate, Phase Speed

### Tab: STYLE
**Block: Appearance** — Threshold, Colors, Invert

### Tab: CANVAS
**Block: Size** — Width, Height

**Block: Export** — PNG, SVG, GIF

### Tab: INFO
**Block: About** — Description

## 4. Canvas Specification

**Default Size:** 420×420 (30F×30F)

**Coordinate System:** Normalized with origin at center

## 5. Validation Checklist

| Guide | Satisfied |
|-------|-----------|
| page-design-guide | ✅ |
| tool-standards | ✅ |
| f-system | ✅ |

