# Unified Pattern — Description

Unified Pattern is a static SDF-based generator that renders mid-century geometric fields on an 800×800 canvas.

## Render Model

The render pipeline:

1. Build jittered grid cells from `gridSpacing`, `jitter`, and `occupancyThreshold`.
2. For each pixel, warp sample coordinates by `warpAmplitude` and `warpFrequency`.
3. Evaluate nested superellipse SDFs per in-range cell.
4. Fold SDFs with numerically stable smooth-min (`blendRadius`).
5. Map negative field bands to palette colours (`palettePreset`, `paletteVariance`), positive field to palette background.
6. Write RGBA values through `ImageData` and `putImageData`.

## Runtime

- Static output (`animation.type = 'none'`).
- Worker compute path enabled (`compute.worker = true`).
- Adaptive interaction scaling enabled (`interactionScale = 0.5`).

## Controls

15 parameters across Layout, Shape, and Style groups. Presets: Atomic, Op-Art, Organic, Minimal, Dense.
