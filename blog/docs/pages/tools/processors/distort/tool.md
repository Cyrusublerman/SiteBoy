# DISTORT Tool

Host tool for all effect modules registered in `assets/js/tools/processors/distort/nodes/registry.js`.

## Route

Primary route:
- `#tools/distort`

## Owners

| Concern | Owner |
| --- | --- |
| Tool lifecycle / bootstrap | `assets/js/tools/processors/distort/distort-main.js` |
| Application state | `assets/js/tools/processors/distort/core/AppState.js` |
| Pipeline execution | `assets/js/tools/processors/distort/core/Pipeline.js` |
| Worker bridge | `assets/js/tools/processors/distort/core/WorkerBridge.js` |
| Off-thread render | `assets/js/tools/processors/distort/core/RenderWorker.js` |
| Module base class | `assets/js/tools/processors/distort/nodes/EffectNode.js` |
| Module registry | `assets/js/tools/processors/distort/nodes/registry.js` |
| Expression driver eval | `assets/js/tools/processors/distort/core/ExpressionEval.js` |
| Buffer recycling | `assets/js/tools/processors/distort/core/BufferPool.js` |
| Top bar UI | `assets/js/tools/processors/distort/ui/DistortToolbar.js` |
| Effect stack UI | `assets/js/tools/processors/distort/ui/EffectStack.js` |
| Node panel UI | `assets/js/tools/processors/distort/ui/NodePanel.js` |
| Transport strip UI | `assets/js/tools/processors/distort/ui/TransportStrip.js` |
| Canvas viewport UI | `assets/js/tools/processors/distort/ui/ViewportCanvas.js` |
| Category picker UI | `assets/js/tools/processors/distort/ui/CategoryPicker.js` |
| Driver picker UI | `assets/js/tools/processors/distort/ui/DriverPicker.js` |
| Variation grid UI | `assets/js/tools/processors/distort/ui/VariationGrid.js` |
| Animation loop | `assets/js/core/animation-foundation.js` |

## Fixed Layout

Four persistent regions:

1. Top bar (2F / 28px) — spans full width above sidebar and canvas
2. Sidebar (30F / 420px) — scrolls independently; 2 tabs
3. Canvas area (flex:1) — no controls or overlays inside
4. Transport strip (2F / 28px) — below canvas column only; conditional

### Top bar cells (left to right)

- Source cell (`filename ▾` — file picker trigger, ~37.5%)
- UNDO cell (~6.25%)
- REDO cell (~6.25%)
- FIT cell (~8.3%)
- FILL cell (~8.3%)
- ACTUAL cell (~8.3%)
- PREVIEW/FULL quality cell (~8.3%)
- EXPORT dropdown cell (~12.5%)

### Sidebar tabs

- `PIPELINE` — always present; source readout + effect stack
- `CANVAS` — always present; output size + seed + animation settings

Maximum 2 tabs. Tab rail height: 2F (28px).

### Canvas area

`flex:1`. Centred image within. Zero controls, overlays, or panels.

### Transport strip

Below canvas column only (does not extend under sidebar). Conditionally visible when `frameCount > 1`. Height: 2F (28px).

## Sidebar Contract

`PIPELINE` tab contains:
- Source block — read-only display of current source filename and dimensions
- Stack block — `[+ ADD EFFECT]` button + `EffectStack` component

`CANVAS` tab contains:
- Output block — WIDTH slider+number, HEIGHT slider+number
- Seed block — GLOBAL SEED slider+number, `[RANDOMISE SEED]` button
- Animation block — FRAME COUNT slider+number, FPS slider+number

Rules:
- No module script may define its own sidebar DOM
- No module script may define its own tab
- Stack block contains only the add button and the stack; UNDO/REDO are top bar only

## Animation Contract

Animation is declared via `FRAME COUNT` and `FPS` in the CANVAS tab.

If `frameCount > 1`, the host must provide:
- Transport strip (play/pause/prev/next/scrubber)
- `AnimationFoundation.AnimationLoop` driving playback
- Frame-indexed pipeline renders via `WorkerBridge.queueRender(frame)`

If `frameCount === 1`:
- No transport strip
- No animation export

Animation always plays at PREVIEW quality. Switching to FULL during playback pauses automatically.

## Display Contract

Viewport display state is separate from render state.

Required meanings:
- `FIT` — full image visible, aspect preserved
- `FILL` — viewport filled, cropping allowed
- `ACTUAL` — 1 canvas pixel = 1 screen pixel

Zoom and pan operate on viewport transforms only. They must not trigger a pipeline re-render.

## Export Contract

All export actions are in the top bar EXPORT dropdown.

Available actions:
- `EXPORT PNG` — always present; exports current frame at FULL quality
- `EXPORT SVG` — conditional; only when all nodes in the stack have `buildGeometry()`
- `SAVE RECIPE` — serialises current stack to JSON
- `LOAD RECIPE` — deserialises a saved recipe JSON
- `VARIATIONS` submenu — renders N×N grid into the canvas surface (not a popup)
- `RENDER SEQUENCE` submenu — batch exports all frames

## Per-Module Minimum

A valid effect module must supply:
- Unique `type` string (lowercase, no spaces, no hyphens)
- `category` string matching a registered category
- `paramDefs` object — at least one tier-3 param
- `apply(src, dst, w, h, ctx)` method

Optional but expected when applicable:
- `buildGeometry(w, h, ctx)` — vector modules only; returns a `LineSet`
- `destroy()` — when resources are acquired in constructor or apply
- Preview strategy via `ctx.quality` reads inside `apply()`

## Documentation Requirement

A documented module must have a pack at `blog/docs/pages/tools/processors/distort/<type>/` containing:
- Purpose and image effect
- Source and reference files
- Algorithm with formulas
- UI layout (all paramDef tiers, mask controls, modulation targets)

The tool-level docs in this folder define the invariant parts. Per-module docs define only the parts that vary by module.
