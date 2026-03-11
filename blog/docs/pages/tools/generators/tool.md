# Generators Tool

Host tool for all scripts registered in `assets/js/tools/generators/core/script-registry.js`.

## Route

Primary route:
- `#tools/generators`

Script selection state:
- `#tools/generators?script=<id>`

## Owners

| Concern | Owner |
| --- | --- |
| Host lifecycle | `assets/js/tools/generators/core/generative-tool-host.js` |
| Script registry | `assets/js/tools/generators/core/script-registry.js` |
| Script contract | `assets/js/tools/generators/core/script-types.js` |
| Sidebar generation | `assets/js/tools/generators/core/parameter-builder.js` |
| Presets/defaults | `assets/js/tools/generators/shared/presets.js` |
| Animation loop | `assets/js/core/animation-foundation.js` |
| Canvas viewport | `assets/js/shared/components/output/Canvas.js` |
| Toolbar UI | `assets/js/shared/components/tool/GeneratorToolbar.js` |

## Fixed Layout

The host has three persistent regions:

1. Top toolbar.
2. Left sidebar.
3. Right canvas viewport.

Toolbar cells are:
- generator selector
- `FIT`
- `FILL`
- `ACTUAL`
- `EXPORT`

Sidebar tabs are host-generated, not script-defined:
- `PARAMS` always
- `ANIMATE` iff `scriptConfig.animation` exists
- `EXPORT` always
- `INFO` iff `scriptConfig.description` exists

Canvas area is mandatory. A generator without visible canvas output is invalid.

## Sidebar Contract

`PARAMS` is assembled from `scriptConfig.parameters`.

Rules:
- each parameter group becomes one block
- presets, randomise, and reset are inserted ahead of parameter groups when presets exist
- controls come only from the script config contract
- no generator script may define its own sidebar DOM

## Animation Contract

Animation is declared, not improvised.

If `scriptConfig.animation` exists, the host must provide:
- `ANIMATE` tab
- playback controls
- export surface for animation export UI
- sequencer strip/runtime support

If `scriptConfig.animation` does not exist:
- no animation tab
- no sequencer injection
- no animation export UI

## Display Contract

Viewport display state is separate from render state.

Required meanings:
- `FIT` = full image visible, aspect preserved
- `FILL` = viewport filled, cropping allowed
- `ACTUAL` = `1 canvas pixel = 1 screen pixel`

Zoom and pan must operate on viewport transforms only. They must not require the generator to recompute a frame.

## Engine Modes

The host currently accepts:
- `context: '2d'`
- `context: 'webgl'`
- `context: 'p5'`

Decision rule:
- use `2d` by default
- use `2d` + compute worker path for heavy pixel generation
- use `p5` only when the sketch materially depends on p5 APIs
- use `webgl` only when the script actually renders through a WebGL pipeline

Declaring `webgl` without shader or GPU rendering logic is invalid.

## Export Contract

Static export is host-level.

Rules:
- toolbar `EXPORT` is always present
- static image export must work from the current visible generator
- animation export belongs in the `EXPORT` tab injection path when animation exists

## Per-Generator Minimum

A valid generator must supply:
- unique `id`
- title
- category
- canvas config
- parameter groups
- draw path: `draw` for `2d/webgl`, `p5Draw` for `p5`

Optional but expected when applicable:
- description
- presets
- animation config
- export config

## Documentation Requirement

A documented generator should have a pack with:
- purpose and output
- source and reference files
- mechanisms
- UI layout and tab usage

The host-level docs in this folder define the invariant parts. Per-generator docs define only the parts that vary by script.
