# Smart Halftone System — Design Specification

## 1. Overview

**Purpose:** Modular halftoning engine with field-based linework.

**Output Type:** Static Image

## 2. Parameters

### Core Parameters

| Parameter | Type | Range | Default | Purpose |
|-----------|------|-------|---------|---------|
| Input Source | dropdown | [Image, Height, RD, AO] | Image | Scalar field source |
| Tone Levels | stepper | 2–8 | 5 | Quantization steps |
| Halftone Style | dropdown | [Base Lines, Smart Lines, Topographic, RD-Driven] | Smart Lines | Pattern recipe |
| Line Direction | dropdown | [Global, Image-Gradient, Surface-Slope] | Image-Gradient | Direction source |
| Base Frequency | slider | 0.1–20 | 4 | Line spacing |
| Family Count | stepper | 1–6 | 4 | Dyadic families |

### Structure Parameters

| Parameter | Type | Range | Default | Purpose |
|-----------|------|-------|---------|---------|
| Contour Count | stepper | 1–64 | 16 | Iso-contours |
| Contour Width | slider | 0.001–0.25 | 0.03 | Band width |
| RD Preset | dropdown | [Off, Spots, Stripes, Maze] | Off | RD pattern |
| RD Steps | stepper | 0–5000 | 1000 | RD iterations |
| Domain Warp | slider | 0–1 | 0.2 | Warp strength |

## 3. Controls Layout

### Tab: CONTROLS
**Block: Input** — Source, Resolution, Seed

**Block: Tone** — Levels, Style, Families, Frequency

### Tab: STYLE
**Block: Structure** — Direction, RD, Contours, Warp

**Block: Appearance** — Colors, Stroke Width

### Tab: CANVAS
**Block: Size** — Width, Height

**Block: Export** — PNG, SVG

### Tab: INFO
**Block: About** — Description

## 4. Canvas Specification

**Default Size:** 420×420 (30F×30F)

