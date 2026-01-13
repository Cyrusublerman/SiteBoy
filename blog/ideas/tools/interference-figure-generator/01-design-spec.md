# Interference Figure Generator — Design Specification

## 1. Overview

**Purpose:** Generate conoscopic interference patterns from optical path difference fields.

**Output Type:** Static Image

## 2. Parameters

### Core Parameters

| Parameter | Type | Range | Default | Purpose |
|-----------|------|-------|---------|---------|
| Pattern Family | dropdown | [Rings, Spiral, Biaxial, Grid, Petal, Organic] | Rings | Preset recipe |
| Radial Weight | slider | 0–1 | 1.0 | Circular ring strength |
| Spiral Weight | slider | 0–1 | 0 | Spiral component |
| Spiral Rate | slider | -4–4 | 2 | Twist per revolution |
| Wedge X Weight | slider | 0–1 | 0 | Vertical bands |
| Wedge Y Weight | slider | 0–1 | 0 | Horizontal bands |
| Angular N2 | slider | -1–1 | 0 | 2-fold harmonic |
| Angular N4 | slider | -1–1 | 0 | 4-fold harmonic |
| Saddle Weight | slider | -1–1 | 0 | Hyperbolic arms |
| Global Scale | slider | 0.2–3 | 1 | Fringe density |

### Multi-Axis Parameters

| Parameter | Type | Range | Default | Purpose |
|-----------|------|-------|---------|---------|
| Multi-Axis Count | stepper | 0–4 | 0 | Extra centers |
| Axis Radius | slider | 0–0.5 | 0.2 | Center distance |

### Appearance

| Parameter | Type | Range | Default | Purpose |
|-----------|------|-------|---------|---------|
| Spectral Mode | dropdown | [Physical, Stylised] | Physical | Color mapping |
| Exposure | slider | 0.5–2 | 1 | Brightness |
| Gamma | slider | 1.8–2.4 | 2.2 | Gamma correction |
| Saturation Boost | slider | 0.5–1.5 | 1 | Color intensity |

## 3. Controls Layout

### Tab: CONTROLS
**Block: Parameters** — Pattern Family, Radial Weight, Spiral Weight, Spiral Rate

**Block: Structure** — Angular harmonics, Saddle, Global Scale

**Block: Multi-Axis** — Count, Radius, Angle Spread

### Tab: STYLE
**Block: Color & Tone** — Spectral Mode, Exposure, Gamma, Saturation

**Block: Noise** — Noise Weight, Scale, Octaves

### Tab: CANVAS
**Block: Size** — Width, Height

**Block: Export** — PNG, SVG

### Tab: INFO
**Block: About** — Description

## 4. Canvas Specification

**Default Size:** 420×420 (30F×30F)

