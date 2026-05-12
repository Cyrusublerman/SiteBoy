### Fixed layout

The host defines four persistent regions that are invariant across all effect configurations:

| Region | Height/Width | Contents |
|---|---|---|
| Top bar | 2F (28px), full width | Status cell, UNDO, REDO, FIT, FILL, ACTUAL, QUALITY, EXPORT dropdown |
| Sidebar | 30F (420px) fixed width | PIPELINE tab + CANVAS tab |
| Canvas area | `flex: 1` | Viewport only — zero controls, overlays, or labels |
| Transport strip | 2F (28px), canvas width only | Conditional: visible iff `frameCount > 1` |

No module may define additional sidebar tabs, toolbar buttons, or DOM elements inside the canvas area. All module-specific controls are injected into the NodePanel by the `params` declaration.

### Top bar cells

The top bar is divided into eight cells (left to right):

1. **Source cell** (~37.5%) — filename display and file picker trigger
2. **UNDO** (~6.25%)
3. **REDO** (~6.25%)
4. **FIT** (~8.3%) — scale image to fit viewport, preserve aspect ratio
5. **FILL** (~8.3%) — scale to fill viewport, crop allowed
6. **ACTUAL** (~8.3%) — 1 canvas pixel = 1 screen pixel
7. **PREVIEW/FULL quality toggle** (~8.3%)
8. **EXPORT dropdown** (~12.5%) — EXPORT PNG, EXPORT SVG (conditional), SAVE RECIPE, LOAD RECIPE, VARIATIONS, RENDER SEQUENCE

Zoom and pan (via scroll/drag on the canvas) are viewport transforms only and do not trigger a pipeline re-render.

### Sidebar tabs

**PIPELINE tab:**
- Source block: read-only display of the loaded filename and pixel dimensions
- Stack block: `[+ ADD EFFECT]` button + scrollable `EffectStack` component

**CANVAS tab:**
- Output block: WIDTH and HEIGHT sliders
- Seed block: GLOBAL SEED slider + `[RANDOMISE SEED]` button
- Animation block: FRAME COUNT slider + FPS slider

The CategoryPicker (shown when the user clicks `[+ ADD EFFECT]`) replaces the stack view in the sidebar inline — it is not a popup or modal.

### Transport strip

Conditionally rendered below the canvas area (not below the sidebar). Contains: play/pause, prev/next frame, scrubber, and frame counter. Visible only when `frameCount > 1`. Animation always plays at PREVIEW quality; switching to FULL quality during playback pauses automatically.

### Routing

The tool is accessible at the primary route `#tools/distort` (and the canonical path `#tools/processors/distort`). The route is registered in `assets/js/core/router.js`; the host script is `assets/js/tools/processors/distort/distort-main.js`.
