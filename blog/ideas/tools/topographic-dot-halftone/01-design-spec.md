# Topographic Dot Halftone — Design Specification

## 1. Overview

**Purpose:** Generate dot halftone patterns aligned to contours.

**Output Type:** Static Image

## 2. Parameters

### Field Construction

| Parameter | Type | Range | Default | Purpose |
|-----------|------|-------|---------|---------|
| Depth Map | file | — | — | Depth input |
| Normal Map | file | — | — | Normal input |
| Luma Image | file | — | — | Brightness input |
| Weight Depth | slider | 0–1 | 0.5 | Depth contribution |
| Weight Normal | slider | 0–1 | 0.3 | Normal contribution |
| Weight Luma | slider | 0–1 | 0.2 | Luma contribution |

### Vector Mode

| Parameter | Type | Range | Default | Purpose |
|-----------|------|-------|---------|---------|
| SVG Input | file | — | — | Vector source |
| Contour Source | dropdown | [SDF, Geodesic, Laplace] | SDF | Distance type |

### Dot Lattice

| Parameter | Type | Range | Default | Purpose |
|-----------|------|-------|---------|---------|
| Dot Density | slider | 0.1–2 | 1 | Overall density |
| Min Radius | slider | 0.5–5 | 1 | Minimum dot size |
| Max Radius | slider | 2–20 | 8 | Maximum dot size |
| Band Pitch | slider | 5–50 | 15 | Spacing along contours |
| Along Pitch | slider | 5–50 | 15 | Spacing perpendicular |

## 3. Controls Layout

### Tab: INPUT
**Block: Mode** — Mode Select, Vector Loader, Field Loader

### Tab: FIELD
**Block: Weights** — Depth, Normal, Luma weights, Gamma

### Tab: PATTERN
**Block: Dots** — Density, Radii, Pitches, Jitter

### Tab: CANVAS
**Block: Size** — Width, Height

**Block: Export** — PNG, SVG

## 4. Canvas Specification

**Default Size:** 420×420 (30F×30F)

