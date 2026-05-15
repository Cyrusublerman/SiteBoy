# Circles — Migration Log

## Pack Updated

Date: 2026-04-25  
Source analysed: `assets/js/tools/generators/scripts/other/circles.gen.js`

## Current State

Implemented and live.

Resolved since the original migration:
- mutable circle state moved into an IIFE closure
- canvas-size change detection added
- `displayMode` default guard added
- production `console.log` removed
- `animation.animatableParams: []` declared

## 2026-04-28 additions (CIR-01 – CIR-06, CIR-08)

- **CIR-01 Display-mode redraw:** `displayMode` change forces a full redraw; previously the display-mode select had no effect after first render.
- **CIR-02 Colourway:** `colourway` added to `canvas` config — `circleStrokes[]` and `circleFills[]` per-layer entries + `background`. Draw path resolves RGB from these entries; hardcoded colour values removed.
- **CIR-03 Stray segment removed:** End-to-centre line segment present in all orbit paths eliminated.
- **CIR-04 Transform stack:** Nested rotation re-architected with a per-layer `save()`/`translate()`/`rotate()`/`restore()` stack; previously a single cumulative matrix caused drift at deeper layers.
- **CIR-05 Rotations per cycle:** `rotationsPerCycle` per-layer param added so each layer's angular velocity is independently configurable.
- **CIR-06 Per-layer modulators:** `AnimateParamControl` modulator hooks added to each layer's rotation params via X-002.
- **CIR-08 Trail accumulation:** `trailLength` accumulation with time-based modulators via X-002; alpha blending provides persistence trails without per-frame clear.

## 2026-04-29 additions (CIR-07)

- **CIR-07 Depth/normal output modes:** `outputMode` toggle (`display | depth | normal`) in `Display` group. `depth` mode renders each circle in greyscale proportional to `1 − layerIndex/n` (outermost brightest). `normal` mode packs normalised layer index → Red, normalised radius → Green, constant 128 → Blue. `renderFrame` routes to correct path before the existing `displayMode` draw logic.

## Residuals

- Static `loopFrames` may diverge from user-selected cycle length.
- Orbit model is rigid-arm rotation rather than rolling epicycle motion.
- Gradient mode still uses translucent canvas colour strings.
