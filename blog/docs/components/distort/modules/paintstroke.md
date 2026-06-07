# PAINT STROKE

Reconstructs an image by iteratively depositing brush marks from a constrained palette. Each step picks a location, selects a colour that moves the canvas toward the source at that pixel, then stamps a brush shape. Colour selection is canvas-aware (uses current canvas + target, not just the source): `DOT` uses reference blend-match (simulate blend at expected opacity, pick nearest palette result); all other modes use analytic overcorrection — solve `P = C + (T − C)·gain` where `gain = min(overshoot, 1/α)` (overshoots past target so the translucent layer lands on it, but capped by `overshoot` so a single dab never demands a wildly out-of-gamut palette extreme), snap to nearest palette member, then `paletteBlend` relaxes toward the clamped ideal. Combined with directional strokes and the persistent error map, this drives an impressionist build-up. Total stroke budget is `passCount × iterations` (PASSES × STROKES/PASS); each pass rebuilds the placement CDF from the evolving error map, so adaptive placement re-targets fresh high-error regions between sweeps. Stops when average layer coverage reaches `maxAverageLayers`, or when the budget is exhausted. Default `brushAreaApprox` matches the reference (`strokes × π·avgR² / pixels`, opacity-independent); `trueAccumulation` is an opt-in opacity-weighted alternative. Per-pixel caps prevent overpaint. Each `apply()` runs the full stroke budget in one shot (no per-tick throttle).

## Identity

| Field | Value |
|-------|-------|
| Type string | `paintstroke` |
| Category | `GENERATIVE` |
| Module type | pixel |
| Source file | `assets/js/tools/processors/distort/nodes/generative/PaintStrokeNode.js` |
| Engine | `assets/js/shared/algorithms/painter/generative-painter.js` |

## Algorithm

| Algorithm | Source | Role |
|-----------|--------|------|
| `runGenerativePainter` | `generative-painter.js` | Main loop |
| `paintRadialGradient`, `paintBrushShape`, `paintPolyline` | `brush-engine.js` | Stamps |
| `paintStrokeErrorGuided` | `paintstroke-error.js` | FLOW STROKE polylines |
| `SeededRNG` | `SeededRNG.js` | Deterministic placement |

Coverage uses a per-pixel counter grid with a circular footprint at the true brush radius (`size/2`), so `maxPixelLayers` reflects real brush-size overlap. It is not snapshot compositing. `LayerTracker` in `layer-tracker.js` is a separate snapshot compositor and is not used here.

## Weight map (Distort integration)

| Param | Purpose |
|-------|---------|
| `weightSource` | `NONE` / `DRIVER` (+D image on `weight`) / `MASK` (node mask.data at stroke time) / `SOURCE LUM` |
| `weightMode` | `REJECT` / `PROBABILITY` (skip if random > w) / `SCALE OPACITY` / `SCALE SIZE` |
| `weight` | Driveable 0–255; image/expr/source drivers via +D |

Node mask (upload/luminance/gradient/draw) still post-composites effect strength after `apply()`. `MASK` weight source reuses the same mask buffer for stroke gating only.

## Parameters (tier 3 primary)

| Key | Label | Range / options | Default |
|-----|-------|-----------------|---------|
| `passCount` | PASSES | 1–10000 (non-DOT) | 1 |
| `iterations` | STROKES/PASS | 0–200000 | 5000 |
| `brushMin` / `brushMax` | BRUSH MIN/MAX | px | 10 / 50 |
| `minOpacity` / `maxOpacity` | MIN/MAX OPAC | 1–255 | 10 / 50 |
| `painterMode` | PAINTER MODE | DOT / STROKE / FLOW STROKE / PATCH / PALETTE RECONSTRUCTION | DOT |
| `brushShape` | BRUSH SHAPE | RADIAL GRADIENT / SOFT DAB / … | RADIAL GRADIENT (non-DOT) |

## Parameters (tier 4+)

| Key | Notes |
|-----|-------|
| `maxAverageLayers` | Global stop; `brushAreaApprox` (default) = reference geometric formula |
| `maxPixelLayers` | Per-pixel skip threshold (default 20) |
| `paletteMode` | CUSTOM / SOURCE / EXTRACT / GREYSCALE / WARM / COOL |
| `paletteColours` | JSON hex list; UI via `paint-palette-control` when CUSTOM |
| `backgroundColour` | Canvas fill; UI via `color-input` extended control |
| `coverageModel` | `brushAreaApprox` (default, reference π·r² formula) or `trueAccumulation` (opacity-weighted) |
| `overshoot` | Caps overcorrection gain (1–16×, default 2); higher = more aggressive/impressionist, lower = colours closer to source. Non-DOT only |
| `brushHardness` | HARDNESS; applies to SOFT DAB / ELLIPSE / BRISTLE / RIBBON only (HARD DAB, DRY BRUSH, RADIAL GRADIENT ignore it) |
| `placementMode` | RANDOM, ERROR/EDGE/GRADIENT/SALIENCY, WEIGHTED RANDOM, STRATIFIED |
| `coverageTarget`, `errorThreshold` | Per-pass coverage break + error skip threshold |
| `colourDistance`, `alphaAssumption`, `coverageModel` | Match + stop semantics |

## Pipeline behaviour

1. `Pipeline` calls `buildMask` then `apply` with `ctx.maskData` and `ctx.modMaps`.
2. Engine fills background, runs strokes, writes `dst`.
3. Pipeline post-composites with mask if enabled.

Preview: `iterations` (per-pass) capped at 50000. Worker: `forceWorkerPreview`; modulation maps and mask pixels transferred via `WorkerBridge`.

## Modulation

Per-pixel driveable (+D) params resolve inside the stroke loop via `modulate(key, pixelIdx)`:

`brushMin`, `brushMax`, `minOpacity`, `maxOpacity`, `brushJitter`, `manualAngle`, `overshoot`, `weight`, `brushHardness`, `brushLength`, `strokeAngleJitter`, `paletteBlend`, `colourJitter`, `edgeInfluence`, `contrastInfluence`, `luminanceInfluence`.

Not driveable (loop-structural): `passCount`, `iterations`, `maxAverageLayers`, `maxPixelLayers`, `coverageTarget`, `errorThreshold`.
